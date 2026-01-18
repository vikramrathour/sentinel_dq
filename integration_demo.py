import json
from rules.schema import load_rules
from core.models import QualityMeasurement, MeasurementStatus
from adapters.market import to_sodacl, to_great_expectations
from adapters.collibra import to_collibra_payload
from fastapi.testclient import TestClient
from api.main import app
import subprocess

def main():
    print("Starting Integration Verification...")
    
    # 1. Verify Market Adapters
    print("\n[1] Testing Market Adapters...")
    rules_config = load_rules("rules.yaml")
    
    soda_out = to_sodacl(rules_config)
    print(f"SodaCL Output:\n{soda_out}")
    assert "missing_count(order_id) = 0" in soda_out
    
    ge_out = to_great_expectations(rules_config)
    print(f"Great Expectations Output:\n{json.dumps(ge_out, indent=2)}")
    assert "expect_column_values_to_not_be_null" in str(ge_out)

    # 2. Verify Collibra Adapter
    print("\n[2] Testing Collibra Adapter...")
    measure = QualityMeasurement(
        metric="test_metric",
        value=99.9,
        status=MeasurementStatus.ACTIVE,
        dimension="Accuracy"
    )
    collibra_payload = to_collibra_payload(measure, "urn:test:dataset")
    print(f"Collibra Payload: {collibra_payload}")
    assert collibra_payload["value"] == 99.9
    assert collibra_payload["targetResourceId"] == "urn:test:dataset"

    # 3. Verify API
    print("\n[3] Testing API...")
    client = TestClient(app)
    response = client.get("/v1/dashboard")
    print(f"API Response Status: {response.status_code}")
    print(f"API Response Body: {response.json()}")
    assert response.status_code == 200
    assert "summary" in response.json()

    # 4. Verify CLI (Scan)
    print("\n[4] Testing CLI Scan...")
    # Using existing demo.py artifacts
    # We need a dummy CSV for the CLI scan argument
    with open("test.csv", "w") as f:
        f.write("order_id,email,price\n1,a@b.com,100")
        
    result = subprocess.run(
        ["python", "-m", "cli.main", "scan", "test.csv", "rules.yaml"],
        capture_output=True, text=True
    )
    print("CLI Output:")
    print(result.stdout)
    if result.returncode != 0:
        print("CLI Error:")
        print(result.stderr)
        
    # Check for successful output signature
    assert "Scan Results" in result.stdout

    print("\nVERIFICATION PASSED")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        import traceback
        traceback.print_exc()
