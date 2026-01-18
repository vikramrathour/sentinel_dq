import pandas as pd
import numpy as np
import json
import shutil
from pathlib import Path
from intelligence.impact_analyzer import DecisionImpactAnalyzer
from storage.persistence import METADATA_DIR

def main():
    print("Starting Decision-Impact Module Verification...")
    
    # 1. Setup Data
    # Reference: 1000 rows, normal dist mean=0
    ref_df = pd.DataFrame({"score": np.random.normal(0, 1, 1000)})
    
    # Current: 1000 rows, normal dist mean=0.5 (Drifted)
    curr_df = pd.DataFrame({"score": np.random.normal(0.5, 1, 1000)})
    
    # 2. Setup Meta (Simulate Trust Graph with weights)
    # Ensure metadata dir exists
    METADATA_DIR.mkdir(parents=True, exist_ok=True)
    
    trust_graph_mock = {
        "nodes": [
            {"id": "score", "type": "Column", "metadata": {"weight": 0.8}} # High importance
        ]
    }
    with open(METADATA_DIR / "trust_graph.json", "w") as f:
        json.dump(trust_graph_mock, f)
        
    # 3. Initialize Analyzer
    analyzer = DecisionImpactAnalyzer()
    
    # 4. Calculate PSI
    psi = analyzer.calculate_psi(ref_df, curr_df, "score")
    print(f"PSI (score): {psi:.4f}")
    assert psi > 0.05, "Drift should be detected (PSI > 0.05 likely for mean shift 0->0.5)"

    # 5. Validate DoD
    # Formula: Score = 1 - (PSI * Weight)
    # If PSI is 0.1, weight 0.8 -> Score = 1 - 0.08 = 0.92
    # If target is 0.95, this should FAIL.
    
    results = analyzer.validate_dod(
        column_psis={"score": psi}, 
        target_score=0.95
    )
    
    print("\nDoD Validation Results:")
    print(json.dumps(results, indent=2, default=str))
    
    # We expect FAILURE if PSI is high enough
    # If PSI ~0.2 (common for 0.5 mean shift), score ~ 0.84.
    
    # Let's test a PASSING scenario
    # Current = Reference
    psi_pass = analyzer.calculate_psi(ref_df, ref_df, "score")
    results_pass = analyzer.validate_dod({"score": psi_pass})
    print(f"\nDoD Pass Scenario (PSI={psi_pass}): {results_pass['passed']}")
    assert results_pass["passed"] == True
    
    # 6. DQV Export
    dqv = analyzer.export_to_dqv(results, "urn:goal:predict_revenue")
    print("\nDQV Export:")
    print(json.dumps(dqv, indent=2, default=str))
    assert dqv["dqv:hasQualityAnnotation"]["meta:aiGoal"] == "urn:goal:predict_revenue"

    print("\nVERIFICATION PASSED")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        import traceback
        traceback.print_exc()
