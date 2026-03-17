"""
Data Profiler for OrianDQ.
Computes comprehensive statistical profiles for datasets.
Profiles are cached by MD5 hash of file content to avoid redundant computation.
"""
import hashlib
import io
import json
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime

PROFILES_DIR = Path("metadata/profiles")


class DataProfiler:
    """
    Computes and caches statistical profiles for datasets.
    Cache key = MD5 hash of raw file bytes.
    Same file re-uploaded → instant cached result.
    """

    def __init__(self):
        PROFILES_DIR.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------ cache

    def compute_hash(self, file_bytes: bytes) -> str:
        return hashlib.md5(file_bytes).hexdigest()

    def _cache_path(self, file_hash: str) -> Path:
        return PROFILES_DIR / f"{file_hash}.json"

    def get_cached_profile(self, file_hash: str) -> Optional[Dict[str, Any]]:
        path = self._cache_path(file_hash)
        if path.exists():
            with open(path, "r") as f:
                return json.load(f)
        return None

    def _save_profile(self, profile: Dict[str, Any]):
        path = self._cache_path(profile["file_hash"])
        with open(path, "w") as f:
            json.dump(profile, f, indent=2, default=str)

    # ------------------------------------------------------------ profiling

    def _profile_column(self, col_data: pd.Series) -> Dict[str, Any]:
        """Compute per-column statistics."""
        total = len(col_data)
        null_count = int(col_data.isnull().sum())
        unique_count = int(col_data.nunique())

        result = {
            "name": col_data.name,
            "null_count": null_count,
            "null_rate": round(null_count / total, 4) if total else 0,
            "unique_count": unique_count,
            "cardinality_rate": round(unique_count / total, 4) if total else 0,
        }

        non_null = col_data.dropna()

        def _safe(v):
            """Return None instead of NaN/Inf so JSON serialization never fails."""
            try:
                f = float(v)
                return None if (f != f or f == float('inf') or f == float('-inf')) else round(f, 4)
            except Exception:
                return None

        if pd.api.types.is_numeric_dtype(col_data):
            result["data_type"] = "numeric"
            if len(non_null) > 0:
                result["stats"] = {
                    "min": _safe(non_null.min()),
                    "max": _safe(non_null.max()),
                    "mean": _safe(non_null.mean()),
                    "median": _safe(non_null.median()),
                    "std": _safe(non_null.std()),
                    "p25": _safe(non_null.quantile(0.25)),
                    "p75": _safe(non_null.quantile(0.75)),
                }
        elif pd.api.types.is_datetime64_any_dtype(col_data):
            result["data_type"] = "datetime"
            if len(non_null) > 0:
                result["stats"] = {
                    "min_date": str(non_null.min()),
                    "max_date": str(non_null.max()),
                }
        else:
            # Try to parse as datetime from string
            try:
                parsed = pd.to_datetime(non_null.head(200), infer_datetime_format=True)
                result["data_type"] = "datetime"
                result["stats"] = {
                    "min_date": str(parsed.min()),
                    "max_date": str(parsed.max()),
                }
            except Exception:
                result["data_type"] = "categorical"
                top = col_data.value_counts().head(5)
                result["stats"] = {
                    "top_values": {str(k): int(v) for k, v in top.items()}
                }

        return result

    def profile_dataframe(
        self,
        df: pd.DataFrame,
        filename: str,
        file_hash: str,
        file_format: str = "csv",
        **extra_meta: Any,
    ) -> Dict[str, Any]:
        """Compute full dataset profile from a DataFrame."""
        column_profiles = [self._profile_column(df[col]) for col in df.columns]

        type_counts: Dict[str, int] = {"numeric": 0, "categorical": 0, "datetime": 0}
        for cp in column_profiles:
            t = cp.get("data_type", "categorical")
            type_counts[t] = type_counts.get(t, 0) + 1

        duplicate_count = int(df.duplicated().sum())

        profile: Dict[str, Any] = {
            "dataset_id": file_hash,
            "filename": filename,
            "file_hash": file_hash,
            "file_format": file_format,
            "profiled_at": datetime.now().isoformat(),
            "cached": False,
            "row_count": len(df),
            "column_count": len(df.columns),
            "duplicate_count": duplicate_count,
            "duplicate_rate": round(duplicate_count / len(df), 4) if len(df) else 0,
            "total_null_count": int(df.isnull().sum().sum()),
            "data_types": type_counts,
            "columns": column_profiles,
        }

        # Merge any format-specific metadata (e.g. sheet_name, available_sheets)
        profile.update(extra_meta)

        return profile

    # ----------------------------------------------------------------- public

    @staticmethod
    def is_data_file(filename: str) -> bool:
        """Return True if the file extension is a supported data format."""
        return Path(filename).suffix.lower() in {'.csv', '.parquet', '.xlsx', '.xls', '.json', '.xml'}

    def ingest(self, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Main entry point.
        Checks cache first; computes and saves profile only on cache miss.
        Returns profile dict with 'cached' flag set appropriately.

        Supported data formats: .csv, .parquet, .xlsx, .xls, .json, .xml
        Reference documents (.json schema, .xsd, .yaml, .yml) must be sent
        to the /ingest-document endpoint instead.
        """
        file_hash = self.compute_hash(file_bytes)

        cached = self.get_cached_profile(file_hash)
        if cached:
            cached["cached"] = True
            return cached

        fname_lower = filename.lower()
        extra_meta: Dict[str, Any] = {}

        if fname_lower.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_bytes))
            file_format = "csv"

        elif fname_lower.endswith(".parquet"):
            df = pd.read_parquet(io.BytesIO(file_bytes))
            file_format = "parquet"

        elif fname_lower.endswith(('.xlsx', '.xls')):
            xf = pd.ExcelFile(io.BytesIO(file_bytes), engine='openpyxl')
            sheet_names: List[str] = xf.sheet_names
            first_sheet = sheet_names[0]
            df = xf.parse(first_sheet)
            extra_meta["sheet_name"] = first_sheet
            if len(sheet_names) > 1:
                extra_meta["available_sheets"] = sheet_names
            file_format = "xlsx"

        elif fname_lower.endswith(".json"):
            # Detect JSON Schema documents before attempting tabular parse
            try:
                root = json.loads(file_bytes)
            except Exception:
                raise ValueError(
                    "JSON file could not be decoded. Ensure the file is valid JSON."
                )
            if isinstance(root, dict) and (
                "$schema" in root or "properties" in root
            ):
                raise ValueError(
                    "This looks like a JSON Schema — upload it as a Reference Document, "
                    "not a Data File."
                )
            try:
                df = pd.read_json(io.BytesIO(file_bytes))
                if not isinstance(df, pd.DataFrame) or df.empty:
                    raise ValueError("empty")
            except ValueError:
                raise ValueError(
                    "JSON file must be an array of objects (tabular format). "
                    "Nested JSON is not supported for data profiling — use as a "
                    "reference document instead."
                )
            file_format = "json"

        elif fname_lower.endswith(".xml"):
            # Detect XSD schema files before attempting tabular parse
            if b'xs:schema' in file_bytes or b'xsd:schema' in file_bytes:
                raise ValueError(
                    "This looks like an XML Schema (XSD) — upload it as a Reference "
                    "Document, not a Data File."
                )
            try:
                df = pd.read_xml(io.BytesIO(file_bytes))
            except Exception:
                raise ValueError(
                    "XML file could not be parsed as tabular data. Deeply nested XML "
                    "may need to be uploaded as a Reference Document."
                )
            file_format = "xml"

        else:
            raise ValueError(
                f"Unsupported file format: '{filename}'. "
                f"Data files: .csv, .parquet, .xlsx, .xls, .json, .xml | "
                f"Reference documents: .json (schema), .xsd, .yaml, .yml "
                f"→ use /ingest-document endpoint"
            )

        profile = self.profile_dataframe(df, filename, file_hash, file_format=file_format, **extra_meta)
        self._save_profile(profile)
        return profile

    def list_profiles(self) -> List[Dict[str, Any]]:
        """Return summary of all cached profiles."""
        summaries = []
        for path in PROFILES_DIR.glob("*.json"):
            try:
                with open(path, "r") as f:
                    p = json.load(f)
                summaries.append({
                    "dataset_id": p.get("dataset_id"),
                    "filename": p.get("filename"),
                    "file_format": p.get("file_format"),
                    "profiled_at": p.get("profiled_at"),
                    "row_count": p.get("row_count"),
                    "column_count": p.get("column_count"),
                    "duplicate_count": p.get("duplicate_count"),
                    "total_null_count": p.get("total_null_count"),
                    "data_types": p.get("data_types"),
                })
            except Exception:
                continue
        summaries.sort(key=lambda x: x.get("profiled_at", ""), reverse=True)
        return summaries

    def get_profile(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        """Fetch full profile by dataset_id (= file hash)."""
        return self.get_cached_profile(dataset_id)
