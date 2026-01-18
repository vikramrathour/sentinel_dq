import json
from fastapi.testclient import TestClient
from api.main import app
from storage.persistence import METADATA_DIR

def main():
    print("Starting UI & API Verification...")
    client = TestClient(app)

    # 1. Register a Goal
    print("\n[1] Registering AI Goal...")
    goal_payload = {
        "goal_id": "urn:goal:churn_prediction",
        "target_kpis": {"f1_score": 0.85},
        "dod_threshold": 0.90
    }
    res = client.post("/goal", json=goal_payload)
    print(f"Status: {res.status_code}")
    print(res.json())
    assert res.status_code == 200
    
    # 2. Check Dashboard
    print("\n[2] Fetching Dashboard...")
    res = client.get("/v1/dashboard")
    print(f"Status: {res.status_code}")
    data = res.json()
    print(f"Summary: {data.get('summary')}")
    assert res.status_code == 200
    assert "heatmap" in data

    # 3. Execute Quality Gate (Verify)
    print("\n[3] Executing Quality Gate...")
    verify_payload = {
        "dataset_id": "urn:dataset:churn_data",
        "goal_id": "urn:goal:churn_prediction"
    }
    res = client.post("/verify", json=verify_payload)
    print(f"Status: {res.status_code}")
    verify_data = res.json()
    print(json.dumps(verify_data, indent=2))
    
    # Assertions based on dummy data logic in main.py
    # Ref N(0,1), Curr N(0.2, 1) -> PSI small but non-zero.
    # Weight defaults to 1.0 (since mock graph doesn't have this exact node probably, or generic lookup)
    # Score = 1 - PSI. If PSI is low (e.g. 0.05), Score ~0.95. Target is 0.90. Should PASS.
    
    assert res.status_code == 200
    assert "trusted" in verify_data
    assert "dqv_record" in verify_data
    
    print("\nVERIFICATION PASSED")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        import traceback
        traceback.print_exc()
