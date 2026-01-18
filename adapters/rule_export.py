"""
Rule Export Adapters for multiple DQ engines.
Rules are written once, exported many times.

Supports:
- SodaCL (YAML)
- Great Expectations (JSON)
- Pandas (Python code)
- Collibra DQ API
"""
from typing import List, Dict, Any
import yaml
import json
from core.models_enhanced import RuleDefinition, QualityGoal, Severity

class RuleExporter:
    """
    Exports Sentinel-DQ rules to various execution engines.
    Key IP: Write once, export to multiple tools.
    """
    
    def __init__(self, rules: List[RuleDefinition]):
        self.rules = rules
    
    def export_to_soda(self, dataset_name: str) -> str:
        """
        Export rules to SodaCL YAML format.
        
        Example output:
        ```yaml
        checks for customer_data:
          - missing_count(customer_id) = 0
          - invalid_count(email) = 0:
              valid format: email
        ```
        """
        checks = []
        
        for rule in self.rules:
            if rule.rule_type == "not_null":
                checks.append(f"  - missing_count({rule.column}) = 0")
            
            elif rule.rule_type == "regex_match":
                pattern = rule.parameters.get("pattern", ".*") if rule.parameters else ".*"
                checks.append(f"  - invalid_count({rule.column}) = 0:")
                checks.append(f"      valid regex: '{pattern}'")
            
            elif rule.rule_type == "range":
                min_val = rule.parameters.get("min_value") if rule.parameters else None
                max_val = rule.parameters.get("max_value") if rule.parameters else None
                
                if min_val is not None:
                    checks.append(f"  - min({rule.column}) >= {min_val}")
                if max_val is not None:
                    checks.append(f"  - max({rule.column}) <= {max_val}")
            
            elif rule.rule_type == "unique":
                checks.append(f"  - duplicate_count({rule.column}) = 0")
        
        soda_yaml = f"checks for {dataset_name}:\n" + "\n".join(checks)
        return soda_yaml
    
    def export_to_great_expectations(self, dataset_name: str) -> Dict[str, Any]:
        """
        Export rules to Great Expectations Expectation Suite (JSON).
        
        Example output:
        ```json
        {
          "expectation_suite_name": "customer_data_suite",
          "expectations": [
            {
              "expectation_type": "expect_column_values_to_not_be_null",
              "kwargs": {"column": "customer_id"}
            }
          ]
        }
        ```
        """
        expectations = []
        
        for rule in self.rules:
            expectation = {
                "meta": {
                    "rule_id": rule.rule_id,
                    "dimension": rule.dimension,
                    "severity": rule.severity.value,
                    "goal": rule.goal.value
                }
            }
            
            if rule.rule_type == "not_null":
                expectation.update({
                    "expectation_type": "expect_column_values_to_not_be_null",
                    "kwargs": {"column": rule.column}
                })
            
            elif rule.rule_type == "regex_match":
                pattern = rule.parameters.get("pattern", ".*") if rule.parameters else ".*"
                expectation.update({
                    "expectation_type": "expect_column_values_to_match_regex",
                    "kwargs": {
                        "column": rule.column,
                        "regex": pattern
                    }
                })
            
            elif rule.rule_type == "range":
                min_val = rule.parameters.get("min_value") if rule.parameters else None
                max_val = rule.parameters.get("max_value") if rule.parameters else None
                
                expectation.update({
                    "expectation_type": "expect_column_values_to_be_between",
                    "kwargs": {
                        "column": rule.column,
                        "min_value": min_val,
                        "max_value": max_val
                    }
                })
            
            elif rule.rule_type == "unique":
                expectation.update({
                    "expectation_type": "expect_column_values_to_be_unique",
                    "kwargs": {"column": rule.column}
                })
            
            expectations.append(expectation)
        
        suite = {
            "expectation_suite_name": f"{dataset_name}_suite",
            "data_asset_type": "Dataset",
            "meta": {
                "generated_by": "Sentinel-DQ",
                "quality_goals": list(set(r.goal.value for r in self.rules))
            },
            "expectations": expectations
        }
        
        return suite
    
    def export_to_pandas(self, dataset_var: str = "df") -> str:
        """
        Export rules to executable Pandas Python code.
        
        Example output:
        ```python
        # Check: customer_id not null
        assert df['customer_id'].isna().sum() == 0, "customer_id has null values"
        
        # Check: email regex match
        assert df['email'].str.match(r'^[a-z]+@[a-z]+\.[a-z]+$').all(), "email format invalid"
        ```
        """
        code_lines = [
            "# Sentinel-DQ Rules - Pandas Implementation",
            "# Generated automatically - do not edit manually",
            "import pandas as pd",
            "import numpy as np",
            ""
        ]
        
        for rule in self.rules:
            code_lines.append(f"# Rule: {rule.name} ({rule.dimension})")
            code_lines.append(f"# Severity: {rule.severity.value} | Goal: {rule.goal.value}")
            
            if rule.rule_type == "not_null":
                code_lines.append(
                    f"assert {dataset_var}['{rule.column}'].isna().sum() == 0, "
                    f"'{rule.column} has null values'"
                )
            
            elif rule.rule_type == "regex_match":
                pattern = rule.parameters.get("pattern", ".*") if rule.parameters else ".*"
                code_lines.append(
                    f"assert {dataset_var}['{rule.column}'].astype(str).str.match(r'{pattern}').all(), "
                    f"'{rule.column} format invalid'"
                )
            
            elif rule.rule_type == "range":
                min_val = rule.parameters.get("min_value") if rule.parameters else None
                max_val = rule.parameters.get("max_value") if rule.parameters else None
                
                if min_val is not None:
                    code_lines.append(
                        f"assert ({dataset_var}['{rule.column}'] >= {min_val}).all(), "
                        f"'{rule.column} below minimum'"
                    )
                if max_val is not None:
                    code_lines.append(
                        f"assert ({dataset_var}['{rule.column}'] <= {max_val}).all(), "
                        f"'{rule.column} above maximum'"
                    )
            
            elif rule.rule_type == "unique":
                code_lines.append(
                    f"assert {dataset_var}['{rule.column}'].duplicated().sum() == 0, "
                    f"'{rule.column} has duplicates'"
                )
            
            code_lines.append("")
        
        code_lines.append("print('All quality checks passed!')")
        
        return "\n".join(code_lines)
    
    def export_to_collibra(self) -> List[Dict[str, Any]]:
        """
        Export rules to Collibra Data Quality API format.
        
        Example output:
        ```json
        [
          {
            "ruleName": "customer_id_not_null",
            "ruleType": "COMPLETENESS",
            "severity": "HIGH",
            "targetColumn": "customer_id",
            "expression": "COUNT(*) WHERE customer_id IS NULL = 0"
          }
        ]
        ```
        """
        collibra_rules = []
        
        for rule in self.rules:
            collibra_rule = {
                "ruleName": rule.rule_id,
                "description": rule.description,
                "ruleType": self._map_dimension_to_collibra(rule.dimension),
                "severity": rule.severity.value,
                "targetColumn": rule.column,
                "qualityGoal": rule.goal.value,
                "createdBy": rule.created_by or "Sentinel-DQ",
                "state": rule.state.value
            }
            
            # Add rule-specific expression
            if rule.rule_type == "not_null":
                collibra_rule["expression"] = f"COUNT(*) WHERE {rule.column} IS NULL = 0"
            
            elif rule.rule_type == "regex_match":
                pattern = rule.parameters.get("pattern", ".*") if rule.parameters else ".*"
                collibra_rule["expression"] = f"REGEXP_MATCH({rule.column}, '{pattern}')"
            
            elif rule.rule_type == "range":
                min_val = rule.parameters.get("min_value") if rule.parameters else None
                max_val = rule.parameters.get("max_value") if rule.parameters else None
                conditions = []
                if min_val is not None:
                    conditions.append(f"{rule.column} >= {min_val}")
                if max_val is not None:
                    conditions.append(f"{rule.column} <= {max_val}")
                collibra_rule["expression"] = " AND ".join(conditions)
            
            elif rule.rule_type == "unique":
                collibra_rule["expression"] = f"COUNT(DISTINCT {rule.column}) = COUNT({rule.column})"
            
            collibra_rules.append(collibra_rule)
        
        return collibra_rules
    
    def export_to_dbt(self, model_name: str) -> str:
        """
        Export rules to dbt tests (YAML).
        
        Example output:
        ```yaml
        version: 2
        models:
          - name: customer_data
            columns:
              - name: customer_id
                tests:
                  - not_null
              - name: email
                tests:
                  - not_null
                  - relationships:
                      to: ref('valid_emails')
                      field: email
        ```
        """
        columns = {}
        
        for rule in self.rules:
            if rule.column not in columns:
                columns[rule.column] = []
            
            if rule.rule_type == "not_null":
                columns[rule.column].append("not_null")
            elif rule.rule_type == "unique":
                columns[rule.column].append("unique")
            elif rule.rule_type == "range":
                # dbt doesn't have built-in range test, would need custom test
                columns[rule.column].append({
                    "dbt_utils.expression_is_true": {
                        "expression": f"{rule.column} >= {rule.parameters.get('min_value', 0)}"
                    }
                })
        
        dbt_yaml = {
            "version": 2,
            "models": [{
                "name": model_name,
                "columns": [
                    {"name": col, "tests": tests}
                    for col, tests in columns.items()
                ]
            }]
        }
        
        return yaml.dump(dbt_yaml, default_flow_style=False)
    
    def _map_dimension_to_collibra(self, dimension: str) -> str:
        """Map Sentinel-DQ dimensions to Collibra rule types."""
        mapping = {
            "Completeness": "COMPLETENESS",
            "Validity": "VALIDITY",
            "Accuracy": "ACCURACY",
            "Consistency": "CONSISTENCY",
            "Uniqueness": "UNIQUENESS",
            "Timeliness": "TIMELINESS",
            "Integrity": "REFERENTIAL_INTEGRITY",
            "Auditability": "AUDITABILITY"
        }
        return mapping.get(dimension, "CUSTOM")

# ==================== CLI Export Functions ====================

def export_rules_cli(rules: List[RuleDefinition], engine: str, dataset_name: str, output_file: str):
    """
    CLI function to export rules to specified engine.
    
    Usage:
        dq rules export --engine soda --dataset customer_data --output rules.yaml
    """
    exporter = RuleExporter(rules)
    
    if engine == "soda":
        content = exporter.export_to_soda(dataset_name)
        with open(output_file, "w") as f:
            f.write(content)
    
    elif engine == "great_expectations" or engine == "ge":
        content = exporter.export_to_great_expectations(dataset_name)
        with open(output_file, "w") as f:
            json.dump(content, f, indent=2)
    
    elif engine == "pandas":
        content = exporter.export_to_pandas()
        with open(output_file, "w") as f:
            f.write(content)
    
    elif engine == "collibra":
        content = exporter.export_to_collibra()
        with open(output_file, "w") as f:
            json.dump(content, f, indent=2)
    
    elif engine == "dbt":
        content = exporter.export_to_dbt(dataset_name)
        with open(output_file, "w") as f:
            f.write(content)
    
    else:
        raise ValueError(f"Unsupported engine: {engine}")
    
    print(f"✅ Rules exported to {output_file} ({engine} format)")
