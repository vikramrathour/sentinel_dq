import numpy as np
import pandas as pd
from typing import Dict, Any, List
import json
from pathlib import Path
from storage.persistence import METADATA_DIR

class DecisionImpactAnalyzer:
    """
    Analyzes the impact of data drift and quality issues on downstream decisions.
    """
    def __init__(self, trust_graph_path: Path = METADATA_DIR / "trust_graph.json"):
        self.trust_graph_path = trust_graph_path
        self.trust_graph_data = self._load_trust_graph()

    def _load_trust_graph(self) -> Dict[str, Any]:
        if not self.trust_graph_path.exists():
            return {"nodes": []}
        with open(self.trust_graph_path, "r") as f:
            return json.load(f)

    def get_node_weight(self, node_id: str) -> float:
        """
        Retrieves the 'weight' of a node from the Trust Graph metadata.
        Defaults to 1.0 if not found.
        """
        for node in self.trust_graph_data.get("nodes", []):
            if node.get("id") == node_id:
                return node.get("metadata", {}).get("weight", 1.0)
        return 1.0

    def calculate_psi(self, expected_df: pd.DataFrame, actual_df: pd.DataFrame, column: str, buckets: int = 10) -> float:
        """
        Calculates Population Stability Index (PSI) for a given column.
        PSI = sum((Actual% - Expected%) * ln(Actual% / Expected%))
        """
        if column not in expected_df.columns or column not in actual_df.columns:
            raise ValueError(f"Column {column} not found in one of the dataframes")

        # Handle Categorical vs Continuous
        if pd.api.types.is_numeric_dtype(expected_df[column]) and pd.api.types.is_numeric_dtype(actual_df[column]):
            # create bins based on expected distribution
            expected_vals = expected_df[column].dropna()
            actual_vals = actual_df[column].dropna()
            
            # Define bins
            breakpoints = np.linspace(min(expected_vals.min(), actual_vals.min()), 
                                      max(expected_vals.max(), actual_vals.max()), 
                                      buckets + 1)
            
            expected_counts = pd.cut(expected_vals, bins=breakpoints, include_lowest=True).value_counts(sort=False)
            actual_counts = pd.cut(actual_vals, bins=breakpoints, include_lowest=True).value_counts(sort=False)
        else:
            # Categorical
            expected_counts = expected_df[column].value_counts()
            actual_counts = actual_df[column].value_counts()
            
            # Align indexes
            all_categories = set(expected_counts.index) | set(actual_counts.index)
            expected_counts = expected_counts.reindex(list(all_categories), fill_value=0)
            actual_counts = actual_counts.reindex(list(all_categories), fill_value=0)

        # Calculate Proportions
        expected_percents = expected_counts / len(expected_df)
        actual_percents = actual_counts / len(actual_df)

        # Avoid division by zero
        expected_percents = expected_percents.replace(0, 0.0001)
        actual_percents = actual_percents.replace(0, 0.0001)

        # PSI Calculation
        psi_values = (actual_percents - expected_percents) * np.log(actual_percents / expected_percents)
        return float(psi_values.sum())

    def validate_dod(self, 
                     column_psis: Dict[str, float], 
                     target_score: float = 0.95) -> Dict[str, Any]:
        """
        Validates Definition of Done.
        1. Calculates Weighted Stability Score for each column: 1 / (1 + PSI * weight)
           (Note: Normalized so higher is better, max 1.0)
        2. Checks if the average weighted score meets target.
        """
        weighted_scores = {}
        total_score = 0.0
        
        for col, psi in column_psis.items():
            # Construct node ID (assuming simplified ID schema for demo)
            # In real usage, we'd pass dataset_id to construct full URN
            # Here we try to find a node ending in that column name or just use raw weight lookup if possible
            # For simplicity, we assume the caller provides column names that might map to IDs or we just use col name
            weight = self.get_node_weight(col) 
            
            # Normalization logic:
            # PSI 0 -> Score 1.0
            # PSI 0.1 -> Score ~0.9
            # PSI 0.25 -> Score ~0.8
            # Formula: Score = 1 - (PSI * weight)
            # Clipped at 0.
            score = float(max(0.0, 1.0 - (psi * weight)))
            weighted_scores[col] = score
            total_score += score

        avg_score = total_score / len(column_psis) if column_psis else 0.0
        passed = avg_score >= target_score

        return {
            "passed": passed,
            "overall_score": avg_score,
            "details": weighted_scores,
            "target": target_score
        }

    def export_to_dqv(self, certificate: Dict[str, Any], ai_goal: str) -> Dict[str, Any]:
        """
        Exports decision impact results to W3C DQV format.
        """
        return {
            "@context": {"dqv": "http://www.w3.org/ns/dqv#", "skos": "http://www.w3.org/2004/02/skos/core#"},
            "@type": "dqv:QualityMeasurement",
            "dqv:value": certificate["overall_score"],
            "dqv:isMeasurementOf": "urn:metric:decision_stability_score",
            "dqv:hasQualityAnnotation": {
                "@type": "dqv:QualityAnnotation",
                "skos:note": "Weighted stability score based on PSI and CDE importance.",
                "dqv:inDimension": "Consistency",
                "meta:aiGoal": ai_goal,
                "meta:passedDoD": certificate["passed"]
            }
        }
