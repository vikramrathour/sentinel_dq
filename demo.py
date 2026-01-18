import sys
from datetime import datetime
from core.models import Dataset, QualityMeasurement, MeasurementStatus
from rules.schema import load_rules, CheckType
from storage.persistence import save_metadata, load_metadata

def main():
    print("Starting Sentinel-DQ verification...")

    # 1. Create a Dataset
    dataset = Dataset(
        identifier="urn:dcat:dataset:sales_data",
        title="Sales Data 2024",
        path="/data/sales_2024.parquet"
    )
    print(f"Created Dataset: {dataset.title}")

    # 2. Save Dataset
    save_metadata(dataset, "dataset.json", format="json")
    print("Saved Dataset to metadata/dataset.json")

    # 3. Load Rules
    try:
        rules_config = load_rules("rules.yaml")
        print(f"Loaded {len(rules_config.rules)} rules for dataset {rules_config.dataset_id}")
    except Exception as e:
        print(f"Error loading rules: {e}")
        return

    # 4. Create a QualityMeasurement
    measurement = QualityMeasurement(
        metric="null_check_order_id",
        value=100.0, # 100% pass rate
        status=MeasurementStatus.ACTIVE,
        dimension="Completeness"
    )
    print(f"Created Measurement: {measurement.metric} = {measurement.value}")

    # 5. Save Measurement
    save_metadata(measurement, "measurement.yaml", format="yaml")
    print("Saved Measurement to metadata/measurement.yaml")

    # 6. Read back and verify
    loaded_dataset = load_metadata(Dataset, "dataset.json", format="json")
    loaded_measurement = load_metadata(QualityMeasurement, "measurement.yaml", format="yaml")

    print("\n--- Verification Results ---")
    print(f"Dataset Title Match: {dataset.title == loaded_dataset.title}")
    print(f"Measurement metric Match: {measurement.metric == loaded_measurement.metric}")
    print(f"Measurement timestamp preserved: {measurement.timestamp == loaded_measurement.timestamp}")
    
    if dataset.title == loaded_dataset.title and measurement.metric == loaded_measurement.metric:
        print("VERIFICATION SUCCESSFUL")
    else:
        print("VERIFICATION FAILED")

if __name__ == "__main__":
    main()
