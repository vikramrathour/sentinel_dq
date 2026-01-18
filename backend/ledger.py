import json
import datetime
from pathlib import Path
from typing import Dict, Any
from storage.persistence import METADATA_DIR

class InferenceLedger:
    """
    Logs every inference decision to a persistent immutable ledger (JSONL).
    """
    def __init__(self, ledger_path: Path = Path("storage/inference_ledger.jsonl")):
        self.ledger_path = ledger_path
        self.ledger_path.parent.mkdir(parents=True, exist_ok=True)

    def log_inference(self, dataset_id: str, goal_id: str, dqv_record: Dict[str, Any], trusted: bool):
        """
        Appends an inference record to the ledger.
        """
        record = {
            "dcat:dataset": dataset_id,
            "meta:aiGoal": goal_id,
            "prov:startedAtTime": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "dqv:hasQualityMeasurement": dqv_record,
            "meta:trustStatus": trusted
        }
        
        with open(self.ledger_path, "a") as f:
            f.write(json.dumps(record) + "\n")
