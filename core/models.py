from datetime import datetime, date
from enum import Enum
from typing import Optional, Dict, List
from pydantic import BaseModel, Field

# Quality Goals (First-Class Concept)
class QualityGoal(str, Enum):
    """
    Quality goals that activate different dimensions, workflows, and KPIs.
    Aligned to enterprise DQ platform specification.
    """
    STANDARD = "STANDARD_DQ"  # Operational data correctness
    REGULATORY = "REGULATORY_DQ"  # Defensibility & audit readiness
    AI = "AI_DQ"  # Model fitness & trust

class RiskLevel(str, Enum):
    """Risk level classification for datasets"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Dataset(BaseModel):
    """
    DCAT Dataset model.
    Represents a dataset under quality monitoring.
    """
    identifier: str = Field(..., description="Unique identifier for the dataset")
    title: str = Field(..., description="Human-readable title of the dataset")
    path: str = Field(..., description="Physical path or connection string to the dataset")
    domain: Optional[str] = Field(None, description="Business domain (e.g., Finance, Customer)")
    risk_level: RiskLevel = Field(default=RiskLevel.MEDIUM, description="Risk classification")
    quality_goal: QualityGoal = Field(default=QualityGoal.STANDARD, description="Primary quality goal")
    owner: Optional[str] = Field(None, description="Dataset owner/steward")
    lineage: Optional[Dict] = Field(None, description="Data lineage information")

class MeasurementStatus(str, Enum):
    PROPOSED = "PROPOSED"
    ACTIVE = "ACTIVE"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    APPROVED = "APPROVED"
    FAILED = "FAILED"

class RuleState(str, Enum):
    """Rule lifecycle states"""
    DRAFT = "DRAFT"
    REVIEWED = "REVIEWED"
    APPROVED = "APPROVED"
    ACTIVE = "ACTIVE"
    DEPRECATED = "DEPRECATED"

class Severity(str, Enum):
    """Rule severity levels"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class QualityMeasurement(BaseModel):
    """
    DQV Quality Measurement model.
    Represents the result of a quality check.
    """
    metric: str = Field(..., description="Name of the metric being measured")
    value: float = Field(..., description="The computed value of the metric")
    timestamp: datetime = Field(default_factory=datetime.now, description="When the measurement was taken")
    status: MeasurementStatus = Field(default=MeasurementStatus.PROPOSED, description="Status of the measurement")
    dimension: Optional[str] = Field(None, description="DQ Dimension (e.g. Accuracy, Completeness)")
    severity: Severity = Field(default=Severity.MEDIUM, description="Severity level")
    goal: Optional[QualityGoal] = Field(None, description="Associated quality goal")

class DQException(BaseModel):
    """
    Exception management model for time-bound rule exceptions.
    """
    exception_id: str = Field(..., description="Unique exception identifier")
    rule_id: str = Field(..., description="Rule being excepted")
    dataset_id: str = Field(..., description="Dataset this exception applies to")
    justification: str = Field(..., description="Business justification for exception")
    approved_by: str = Field(..., description="Steward who approved the exception")
    created_date: datetime = Field(default_factory=datetime.now, description="When exception was created")
    expiry_date: date = Field(..., description="When exception expires")
    status: str = Field(default="ACTIVE", description="Exception status")

class FitnessScore(BaseModel):
    """
    Overall fitness score for a dataset based on quality goal.
    """
    dataset_id: str = Field(..., description="Dataset identifier")
    goal: QualityGoal = Field(..., description="Quality goal being measured")
    overall_score: float = Field(..., ge=0.0, le=1.0, description="Overall fitness score (0-1)")
    dimension_scores: Dict[str, float] = Field(default_factory=dict, description="Scores by dimension")
    threshold: float = Field(..., description="Required threshold for this goal")
    passed: bool = Field(..., description="Whether dataset meets threshold")
    timestamp: datetime = Field(default_factory=datetime.now, description="When score was calculated")
    
class DQPolicy(BaseModel):
    """
    Organization-level DQ policy configuration.
    """
    minimum_fitness: Dict[str, float] = Field(
        default_factory=lambda: {
            "STANDARD_DQ": 0.85,
            "REGULATORY_DQ": 0.95,
            "AI_DQ": 0.90
        },
        description="Minimum fitness thresholds by goal"
    )
    mandatory_dimensions: Dict[str, List[str]] = Field(
        default_factory=lambda: {
            "REGULATORY_DQ": ["Accuracy", "Integrity", "Auditability"],
            "AI_DQ": ["Completeness", "Consistency", "Validity"],
            "STANDARD_DQ": ["Completeness", "Validity"]
        },
        description="Required dimensions by goal"
    )
    severity_weights: Dict[str, int] = Field(
        default_factory=lambda: {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1},
        description="Weights for severity levels"
    )