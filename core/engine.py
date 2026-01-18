import pandas as pd
from typing import List, Any
from pathlib import Path
from core.models import QualityMeasurement, MeasurementStatus
from rules.schema import RulesConfig, CheckType, NotNullRule, RegexMatchRule, RangeRule

class DataValidator:
    """
    Executes rules from RulesConfig against a Pandas DataFrame.
    """
    def __init__(self, df: pd.DataFrame, rules_config: RulesConfig):
        self.df = df
        self.rules_config = rules_config
        self.dataset_id = rules_config.dataset_id
        self.quarantine_dir = Path("storage/quarantine") / self.dataset_id.replace(":", "_")

    def validate(self) -> List[QualityMeasurement]:
        measurements = []
        
        for rule in self.rules_config.rules:
            column = rule.column
            
            # Skip if column not in DF
            if column not in self.df.columns:
                print(f"Warning: Column {column} not found in dataset")
                continue

            failed_mask = None
            
            # 1. Execute Check
            if rule.type == CheckType.NOT_NULL:
                failed_mask = self.df[column].isna()
            elif rule.type == CheckType.REGEX_MATCH:
                if isinstance(rule, RegexMatchRule):
                    # Ensure string type before regex
                    failed_mask = ~self.df[column].astype(str).str.match(rule.pattern)
            elif rule.type == CheckType.RANGE:
                if isinstance(rule, RangeRule):
                    failed_mask = pd.Series(False, index=self.df.index)
                    if rule.min_value is not None:
                        failed_mask |= (self.df[column] < rule.min_value)
                    if rule.max_value is not None:
                        failed_mask |= (self.df[column] > rule.max_value)

            if failed_mask is None:
                continue

            # 2. Calculate Metrics
            total_rows = len(self.df)
            failed_rows_count = failed_mask.sum()
            pass_rate = 1.0 - (failed_rows_count / total_rows) if total_rows > 0 else 0.0
            
            # 3. Determine Status & handle HITL
            status = MeasurementStatus.ACTIVE
            if failed_rows_count > 0:
                if rule.hitl_required:
                    status = MeasurementStatus.REVIEW_REQUIRED
                    self._quarantine_rows(failed_mask, rule.type.value, column)
                else:
                    # Logic for non-HITL failures could be defined here (e.g. still ACTIVE but low score)
                    pass

            # 4. Create Measurement
            measurements.append(QualityMeasurement(
                metric=f"{rule.type.value}_{column}",
                value=float(pass_rate * 100), # 0-100 scale
                status=status,
                dimension=rule.dimension
            ))

        return measurements

    def _quarantine_rows(self, mask: pd.Series, rule_type: str, column: str):
        """
        Saves rows where mask is True to a parquet file.
        """
        self.quarantine_dir.mkdir(parents=True, exist_ok=True)
        failing_rows = self.df[mask]
        
        # Filename: rule_column_timestamp.parquet (simplified for now)
        filename = f"{rule_type}_{column}.parquet"
        file_path = self.quarantine_dir / filename
        
        failing_rows.to_parquet(file_path)
        print(f"Quarantined {len(failing_rows)} rows to {file_path}")
