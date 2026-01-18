from typing import Dict, Any
import yaml
from rules.schema import RulesConfig, CheckType, NotNullRule, RegexMatchRule, RangeRule

def to_sodacl(rules_config: RulesConfig) -> str:
    """
    Converts RulesConfig to SodaCL YAML format.
    """
    soda_checks = []
    
    for rule in rules_config.rules:
        if rule.type == CheckType.NOT_NULL:
            soda_checks.append(f"  - missing_count({rule.column}) = 0")
        elif rule.type == CheckType.REGEX_MATCH:
            if isinstance(rule, RegexMatchRule):
                # SodaCL roughly: invalid_count(column) = 0 valid regex 'pattern'
                soda_checks.append(f"  - invalid_count({rule.column}) = 0: valid regex '{rule.pattern}'")
        elif rule.type == CheckType.RANGE:
            if isinstance(rule, RangeRule):
                if rule.min_value is not None:
                    soda_checks.append(f"  - min({rule.column}) >= {rule.min_value}")
                if rule.max_value is not None:
                    soda_checks.append(f"  - max({rule.column}) <= {rule.max_value}")

    soda_yaml = {
        f"checks for {rules_config.dataset_id}": soda_checks
    }
    
    return yaml.dump(soda_yaml, sort_keys=False)

def to_great_expectations(rules_config: RulesConfig) -> Dict[str, Any]:
    """
    Converts RulesConfig to Great Expectations JSON suite.
    """
    expectations = []
    
    for rule in rules_config.rules:
        if rule.type == CheckType.NOT_NULL:
            expectations.append({
                "expectation_type": "expect_column_values_to_not_be_null",
                "kwargs": {"column": rule.column}
            })
        elif rule.type == CheckType.REGEX_MATCH:
            if isinstance(rule, RegexMatchRule):
                expectations.append({
                    "expectation_type": "expect_column_values_to_match_regex",
                    "kwargs": {"column": rule.column, "regex": rule.pattern}
                })
        elif rule.type == CheckType.RANGE:
            if isinstance(rule, RangeRule):
                if rule.min_value is not None and rule.max_value is not None:
                    expectations.append({
                        "expectation_type": "expect_column_values_to_be_between",
                        "kwargs": {
                            "column": rule.column, 
                            "min_value": rule.min_value, 
                            "max_value": rule.max_value
                        }
                    })

    return {
        "data_asset_type": "Dataset",
        "expectations": expectations,
        "meta": {"source": "Sentinel-DQ"}
    }
