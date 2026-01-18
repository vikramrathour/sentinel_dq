from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

class Dataset(BaseModel):
    """
    DCAT Dataset model.
    Represents a dataset under quality monitoring.
    """
    identifier: str = Field(..., description="Unique identifier for the dataset")
    title: str = Field(..., description="Human-readable title of the dataset")
    path: str = Field(..., description="Physical path or connection string to the dataset")

class MeasurementStatus(str, Enum):
    PROPOSED = "PROPOSED"
    ACTIVE = "ACTIVE"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"

class QualityMeasurement(BaseModel):
    """
    QDV Quality Measurement model.
    Represents the result of a quality check.
    """
    metric: str = Field(..., description="Name of the metric being measured")
    value: float = Field(..., description="The computed value of the metric")
    timestamp: datetime = Field(default_factory=datetime.now, description="When the measurement was taken")
    status: MeasurementStatus = Field(default=MeasurementStatus.PROPOSED, description="Status of the measurement")
    dimension: Optional[str] = Field(None, description="DQ Dimension (e.g. Accuracy, Completeness)")
