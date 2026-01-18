import json
import os
from pathlib import Path
from backend.ledger import InferenceLedger

def main():
    print("Starting Ledger Verification...")
    
    # 1. Setup
    ledger_path = Path("storage/test_ledger.jsonl")
    if ledger_path.exists():
        os.remove(ledger_path)
        
    ledger = InferenceLedger(ledger_path=ledger_path)
    
    # 2. Log an Inference
    sample_dqv = {"dqv:value": 0.95}
    ledger.log_inference(
        dataset_id="urn:dataset:test_ledger",
        goal_id="urn:goal:test_goal",
        dqv_record=sample_dqv,
        trusted=True
    )
    
    # 3. Verify Log format
    print(f"Reading {ledger_path}...")
    with open(ledger_path, "r") as f:
        lines = f.readlines()
        
    assert len(lines) == 1
    last_record = json.loads(lines[0])
    
    print("Log Record:")
    print(json.dumps(last_record, indent=2))
    
    assert last_record["dcat:dataset"] == "urn:dataset:test_ledger"
    assert last_record["meta:trustStatus"] == True
    assert "prov:startedAtTime" in last_record
    
    # Cleanup
    if ledger_path.exists():
        os.remove(ledger_path)

    print("\nVERIFICATION PASSED")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        import traceback
        traceback.print_exc()
