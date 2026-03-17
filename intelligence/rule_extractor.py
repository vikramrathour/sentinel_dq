"""
RuleExtractor — Phase 2 OrianDQ Intelligence Module.

Converts the raw constraints produced by DocumentParser into typed
DQRule dicts that the rest of the pipeline can evaluate against actual
data.

DQRule structure
----------------
{
    "rule_id":     str,          # e.g. "jso_email_not_null_001"
    "column":      str | None,   # field name; None = dataset-level rule
    "rule_type":   str,          # see RULE_TYPES below
    "parameters":  dict,         # rule-specific parameters
    "severity":    str,          # "error" | "warning"
    "source":      str,          # "json_schema" | "xsd" | "yaml_dbt" | "yaml_contract"
    "source_path": str,          # dotted/xpath path inside the source doc
    "description": str,          # human-readable explanation
}
"""

from __future__ import annotations

import logging
from collections import defaultdict
from typing import Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Valid rule_type values (informational — not enforced at runtime).
RULE_TYPES = frozenset(
    {
        "not_null",
        "type",
        "range",
        "pattern",
        "enum",
        "unique",
        "min_length",
        "max_length",
        "format",
        "custom",
    }
)

# Severity defaults per rule_type.
_DEFAULT_SEVERITY: dict[str, str] = {
    "not_null": "error",
    "type": "error",
    "unique": "error",
    "enum": "error",
    "range": "warning",
    "pattern": "warning",
    "format": "warning",
    "min_length": "warning",
    "max_length": "warning",
    "custom": "warning",
}

# Normalised type string → standard label used in parameters.
_TYPE_NORMALISE: dict[str, str] = {
    # numeric
    "integer": "numeric",
    "int": "numeric",
    "long": "numeric",
    "short": "numeric",
    "decimal": "numeric",
    "float": "numeric",
    "double": "numeric",
    "number": "numeric",
    # string
    "string": "string",
    "text": "string",
    "varchar": "string",
    "char": "string",
    # datetime
    "date": "datetime",
    "date-time": "datetime",
    "datetime": "datetime",
    "timestamp": "datetime",
    "time": "datetime",
    # boolean
    "boolean": "boolean",
    "bool": "boolean",
}


# ---------------------------------------------------------------------------
# Main class
# ---------------------------------------------------------------------------


class RuleExtractor:
    """
    Converts raw constraints from :class:`DocumentParser` into DQRules.

    Usage::

        parser  = DocumentParser()
        parsed  = parser.parse(file_bytes, filename)

        extractor = RuleExtractor()
        rules     = extractor.extract_rules(parsed, source=parsed["document_type"])
        summary   = extractor.summarize(rules)
    """

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def extract_rules(self, parsed_document: dict, source: str) -> list[dict]:
        """
        Convert raw constraints from DocumentParser into DQRules.

        Parameters
        ----------
        parsed_document:
            The dict returned by ``DocumentParser.parse()``.
        source:
            One of ``"json_schema" | "xsd" | "yaml_dbt" | "yaml_contract"``.
            Used to populate the ``source`` field and derive the rule-ID
            prefix.

        Returns
        -------
        List of DQRule dicts.  Never raises — malformed input returns an
        empty list with a logged warning.
        """
        if not isinstance(parsed_document, dict):
            logger.warning("rule_extractor: parsed_document is not a dict")
            return []

        raw_constraints: list[dict] = parsed_document.get("raw_constraints") or []
        if not raw_constraints:
            logger.debug("rule_extractor: no raw_constraints found for source '%s'", source)
            return []

        prefix = (source or "unk")[:3].lower()
        rules: list[dict] = []
        counter: int = 1

        # First pass: convert each constraint (except range — handled via
        # merge post-process).
        pending_range: dict[str, dict] = {}  # col → {"min": v, "max": v, "paths": []}

        for raw in raw_constraints:
            if not isinstance(raw, dict):
                continue

            constraint = raw.get("constraint", "")
            field = raw.get("field") or None
            value = raw.get("value")
            src_path = raw.get("source_path", "")

            # Accumulate range bounds for post-process merging.
            if constraint == "minimum":
                col_key = field or "__dataset__"
                pending_range.setdefault(col_key, {"min": None, "max": None, "paths": []})
                pending_range[col_key]["min"] = value
                pending_range[col_key]["paths"].append(src_path)
                continue

            if constraint == "maximum":
                col_key = field or "__dataset__"
                pending_range.setdefault(col_key, {"min": None, "max": None, "paths": []})
                pending_range[col_key]["max"] = value
                pending_range[col_key]["paths"].append(src_path)
                continue

            rule = self._convert_constraint(
                constraint=constraint,
                field=field,
                value=value,
                source=source,
                src_path=src_path,
                prefix=prefix,
                counter=counter,
            )
            if rule:
                rules.append(rule)
                counter += 1

        # Second pass: emit merged range rules.
        for col_key, bounds in pending_range.items():
            field = None if col_key == "__dataset__" else col_key
            merged_path = " | ".join(bounds["paths"])
            rule = self._build_range_rule(
                field=field,
                min_val=bounds["min"],
                max_val=bounds["max"],
                source=source,
                src_path=merged_path,
                prefix=prefix,
                counter=counter,
            )
            if rule:
                rules.append(rule)
                counter += 1

        return rules

    # ------------------------------------------------------------------
    # Summarise
    # ------------------------------------------------------------------

    def summarize(self, rules: list[dict]) -> dict:
        """
        Return a concise summary of a rule list suitable for an API response.

        Parameters
        ----------
        rules:
            List of DQRule dicts as returned by :meth:`extract_rules`.

        Returns
        -------
        dict with keys: ``total_rules``, ``by_type``, ``by_severity``,
        ``columns_covered``, ``error_count``, ``warning_count``.
        """
        by_type: dict[str, int] = defaultdict(int)
        by_severity: dict[str, int] = defaultdict(int)
        columns: set[str] = set()

        for rule in rules:
            if not isinstance(rule, dict):
                continue
            by_type[rule.get("rule_type", "unknown")] += 1
            by_severity[rule.get("severity", "unknown")] += 1
            col = rule.get("column")
            if col:
                columns.add(col)

        error_count = by_severity.get("error", 0)
        warning_count = by_severity.get("warning", 0)

        return {
            "total_rules": len(rules),
            "by_type": dict(by_type),
            "by_severity": dict(by_severity),
            "columns_covered": sorted(columns),
            "error_count": error_count,
            "warning_count": warning_count,
        }

    # ------------------------------------------------------------------
    # Internal conversion logic
    # ------------------------------------------------------------------

    def _convert_constraint(
        self,
        constraint: str,
        field: str | None,
        value: Any,
        source: str,
        src_path: str,
        prefix: str,
        counter: int,
    ) -> dict | None:
        """
        Map a single raw constraint to a DQRule dict.

        Returns ``None`` if the constraint cannot be mapped (e.g. unknown
        constraint type that is already handled elsewhere).
        """
        col_label = field or "dataset"

        # ---- not_null / required ---------------------------------------
        if constraint in ("required", "not_null"):
            return self._make_rule(
                rule_id=f"{prefix}_{col_label}_not_null_{counter:03d}",
                column=field,
                rule_type="not_null",
                parameters={},
                severity="error",
                source=source,
                source_path=src_path,
                description=f"Field '{col_label}' must not be null (required field)",
            )

        # ---- type ------------------------------------------------------
        if constraint == "type":
            return self._build_type_rule(
                field=field,
                type_value=str(value).lower() if value is not None else "",
                source=source,
                src_path=src_path,
                prefix=prefix,
                counter=counter,
            )

        # ---- pattern ---------------------------------------------------
        if constraint == "pattern":
            return self._make_rule(
                rule_id=f"{prefix}_{col_label}_pattern_{counter:03d}",
                column=field,
                rule_type="pattern",
                parameters={"regex": str(value)},
                severity="warning",
                source=source,
                source_path=src_path,
                description=f"Field '{col_label}' must match pattern: {value}",
            )

        # ---- enum / accepted_values ------------------------------------
        if constraint in ("enum", "accepted_values"):
            allowed = list(value) if isinstance(value, (list, tuple)) else [value]
            return self._make_rule(
                rule_id=f"{prefix}_{col_label}_enum_{counter:03d}",
                column=field,
                rule_type="enum",
                parameters={"allowed": allowed},
                severity="error",
                source=source,
                source_path=src_path,
                description=f"Field '{col_label}' must be one of: {allowed}",
            )

        # ---- unique ----------------------------------------------------
        if constraint == "unique":
            return self._make_rule(
                rule_id=f"{prefix}_{col_label}_unique_{counter:03d}",
                column=field,
                rule_type="unique",
                parameters={},
                severity="error",
                source=source,
                source_path=src_path,
                description=f"Field '{col_label}' must contain unique values",
            )

        # ---- maxLength -------------------------------------------------
        if constraint == "maxLength":
            return self._make_rule(
                rule_id=f"{prefix}_{col_label}_max_length_{counter:03d}",
                column=field,
                rule_type="max_length",
                parameters={"max": value},
                severity="warning",
                source=source,
                source_path=src_path,
                description=f"Field '{col_label}' must not exceed {value} characters",
            )

        # ---- minLength -------------------------------------------------
        if constraint == "minLength":
            return self._make_rule(
                rule_id=f"{prefix}_{col_label}_min_length_{counter:03d}",
                column=field,
                rule_type="min_length",
                parameters={"min": value},
                severity="warning",
                source=source,
                source_path=src_path,
                description=f"Field '{col_label}' must be at least {value} characters",
            )

        # ---- format ----------------------------------------------------
        if constraint == "format":
            return self._build_format_rule(
                field=field,
                fmt=str(value).lower() if value else "",
                source=source,
                src_path=src_path,
                prefix=prefix,
                counter=counter,
            )

        # ---- nullable (XSD nillable="true") ----------------------------
        if constraint == "nullable":
            # Informational only — not an enforceable DQ rule.
            # We still record it as a custom rule so nothing is silently
            # dropped.
            return self._make_rule(
                rule_id=f"{prefix}_{col_label}_custom_{counter:03d}",
                column=field,
                rule_type="custom",
                parameters={"nullable": True},
                severity="warning",
                source=source,
                source_path=src_path,
                description=f"Field '{col_label}' is declared nullable (nillable)",
            )

        # ---- custom / unknown ------------------------------------------
        if constraint == "custom":
            return self._make_rule(
                rule_id=f"{prefix}_{col_label}_custom_{counter:03d}",
                column=field,
                rule_type="custom",
                parameters={"raw": value} if value is not None else {},
                severity="warning",
                source=source,
                source_path=src_path,
                description=f"Custom constraint on field '{col_label}': {value}",
            )

        # Unrecognised — log and skip.
        logger.debug(
            "rule_extractor: unrecognised constraint '%s' for field '%s' — skipping",
            constraint,
            field,
        )
        return None

    # ------------------------------------------------------------------
    # Specialised rule builders
    # ------------------------------------------------------------------

    def _build_type_rule(
        self,
        field: str | None,
        type_value: str,
        source: str,
        src_path: str,
        prefix: str,
        counter: int,
    ) -> dict | None:
        """Map a raw type constraint to a DQRule."""
        col_label = field or "dataset"
        normalised = _TYPE_NORMALISE.get(type_value, type_value)

        type_descriptions: dict[str, str] = {
            "numeric": f"Field '{col_label}' must be numeric ({type_value})",
            "string": f"Field '{col_label}' must be a string",
            "datetime": f"Field '{col_label}' must be a valid date/datetime",
            "boolean": f"Field '{col_label}' must be boolean",
        }

        description = type_descriptions.get(
            normalised,
            f"Field '{col_label}' must be of type '{type_value}'",
        )

        return self._make_rule(
            rule_id=f"{prefix}_{col_label}_type_{counter:03d}",
            column=field,
            rule_type="type",
            parameters={"data_type": normalised},
            severity="error",
            source=source,
            source_path=src_path,
            description=description,
        )

    def _build_range_rule(
        self,
        field: str | None,
        min_val: Any,
        max_val: Any,
        source: str,
        src_path: str,
        prefix: str,
        counter: int,
    ) -> dict | None:
        """
        Build a range rule from accumulated min/max bounds.

        Handles three cases:
        - both min and max present → combined range rule
        - only min → "must be >= min" rule
        - only max → "must be <= max" rule
        """
        if min_val is None and max_val is None:
            return None

        col_label = field or "dataset"
        parameters: dict = {}

        if min_val is not None:
            parameters["min"] = min_val
        if max_val is not None:
            parameters["max"] = max_val

        if min_val is not None and max_val is not None:
            description = (
                f"Field '{col_label}' must be between {min_val} and {max_val}"
            )
        elif min_val is not None:
            description = f"Field '{col_label}' must be \u2265 {min_val}"
        else:
            description = f"Field '{col_label}' must be \u2264 {max_val}"

        return self._make_rule(
            rule_id=f"{prefix}_{col_label}_range_{counter:03d}",
            column=field,
            rule_type="range",
            parameters=parameters,
            severity="warning",
            source=source,
            source_path=src_path,
            description=description,
        )

    def _build_format_rule(
        self,
        field: str | None,
        fmt: str,
        source: str,
        src_path: str,
        prefix: str,
        counter: int,
    ) -> dict | None:
        """Map a format constraint to a DQRule with a tailored description."""
        col_label = field or "dataset"

        format_descriptions: dict[str, str] = {
            "email": f"Field '{col_label}' must be a valid email address",
            "uri": f"Field '{col_label}' must be a valid URI",
            "date": f"Field '{col_label}' must be a valid date (YYYY-MM-DD)",
            "date-time": f"Field '{col_label}' must be a valid ISO 8601 datetime",
            "uuid": f"Field '{col_label}' must be a valid UUID",
            "hostname": f"Field '{col_label}' must be a valid hostname",
            "ipv4": f"Field '{col_label}' must be a valid IPv4 address",
            "ipv6": f"Field '{col_label}' must be a valid IPv6 address",
        }

        description = format_descriptions.get(
            fmt,
            f"Field '{col_label}' must conform to format '{fmt}'",
        )

        return self._make_rule(
            rule_id=f"{prefix}_{col_label}_format_{counter:03d}",
            column=field,
            rule_type="format",
            parameters={"format": fmt},
            severity="warning",
            source=source,
            source_path=src_path,
            description=description,
        )

    # ------------------------------------------------------------------
    # Factory helper
    # ------------------------------------------------------------------

    @staticmethod
    def _make_rule(
        rule_id: str,
        column: str | None,
        rule_type: str,
        parameters: dict,
        severity: str,
        source: str,
        source_path: str,
        description: str,
    ) -> dict:
        """
        Construct a canonical DQRule dict.

        All keys are always present (never missing / KeyError-safe for
        downstream consumers).
        """
        return {
            "rule_id": rule_id,
            "column": column,
            "rule_type": rule_type,
            "parameters": parameters,
            "severity": severity,
            "source": source,
            "source_path": source_path,
            "description": description,
        }
