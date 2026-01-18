import pandas as pd
import shutil
from pathlib import Path
from rules.schema import RulesConfig, CheckType, NotNullRule, RangeRule, Dimension
from core.engine import DataValidator
from core.models import MeasurementStatus

def main():
    print("Starting Validation Engine verification...")

    # 1. Setup Test Data
    data = {
        "id": [1, 2, 3, 4, 5],
        "score": [95, 80, 150, 40, 2000],  # 150, 2000 are potentially out of range
        "category": ["A", "B", None, "A", "C"] # Null in category
    }
    df = pd.DataFrame(data)
    
    # 2. Define Rules
    rules = [
        # Normal check (Not Null) - Expect 1 failure (id=3)
        NotNullRule(
            column="category", 
            dimension=Dimension.COMPLETENESS,
            hitl_required=False
        ),
        # HITL check (Range) - Expect 2 failures (150, 2000 > 100), trigger quarantine
        RangeRule(
            column="score",
            dimension=Dimension.VALIDITY,
            min_value=0,
            max_value=100,
            hitl_required=True
        )
    ]
    
    config = RulesConfig(dataset_id="urn:dataset:test_metrics", rules=rules)

    # Clean previous quarantine
    quarantine_path = Path("storage/quarantine/urn_dataset_test_metrics")
    if quarantine_path.exists():
        shutil.rmtree(quarantine_path, ignore_errors=True)

    # 3. Run Validation
    validator = DataValidator(df, config)
    results = validator.validate()

    # 4. Assertions
    print("\n--- Validation Results ---")
    
    # Check 1: Category Not Null
    cat_result = next(r for r in results if r.metric == "not_null_category")
    print(f"Category Score: {cat_result.value}% (Expected 80.0%)")
    print(f"Category Status: {cat_result.status} (Expected ACTIVE)")
    
    assert cat_result.value == 80.0
    assert cat_result.status == MeasurementStatus.ACTIVE

    # Check 2: Score Range
    score_result = next(r for r in results if r.metric == "range_score")
    print(f"Score Score: {score_result.value}% (Expected 60.0%)")
    print(f"Score Status: {score_result.status} (Expected REVIEW_REQUIRED)")
    
    assert score_result.value == 60.0
    assert score_result.status == MeasurementStatus.REVIEW_REQUIRED

    # Check 3: Quarantine File
    # Filename format: range_score.parquet
    expected_file = quarantine_path / "range_score.parquet"
    if expected_file.exists():
        print(f"Quarantine File Exists: {expected_file}")
        q_df = pd.read_parquet(expected_file)
        print(f"Quarantined Rows: {len(q_df)} (Expected 2)")
        assert len(q_df) == 2
        # Verify specific failing rows
        assert 150 in q_df['score'].values
        assert 2000 in q_df['score'].values
    else:
        print(f"Quarantine File MISSING: {expected_file}")
        if quarantine_path.exists():
            print(f"Contents of {quarantine_path}: {[f.name for f in quarantine_path.iterdir()]}")
        raise FileNotFoundError("Quarantine file not created")

    print("\nVERIFICATION PASSED")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        import traceback
        traceback.print_exc()
