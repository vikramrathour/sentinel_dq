from typing import Dict, Any
from core.models import QualityMeasurement

def to_collibra_payload(measurement: QualityMeasurement, dataset_id: str) -> Dict[str, Any]:
    """
    Formats a QualityMeasurement into a Collibra Data Quality API payload.
    (Hypothetical structure based on common DQ integrations)
    """
    return {
        "metricName": measurement.metric,
        "value": measurement.value,
        "unit": "Percentage",
        "timestamp": measurement.timestamp.isoformat(),
        "dimension": measurement.dimension,
        "targetResourceId": dataset_id,
        "sourceSystem": "Sentinel-DQ",
        "status": measurement.status.value
    }
