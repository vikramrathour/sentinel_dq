"""
Enhanced data models aligned with enterprise DQ platform specification.
Supports Quality Goals, Exception Management, Rule Lifecycle, and KPI Framework.
"""
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

class RuleState(str, Enum):
    """Rule lifecycle states: Draft → Reviewed → Approved → Active → Deprecated"""
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

class MeasurementStatus(str, Enum):
    """Measurement status"""
    PROPOSED = "PROPOSED"
    ACTIVE = "ACTIVE"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    APPROVED = "APPROVED"
    FAILED = "FAILED"

class DatasetEnhanced(BaseModel):
    """
    Enhanced DCAT Dataset model with governance metadata.
    """
    identifier: str = Field(..., description="Unique identifier for the dataset")
    title: str = Field(..., description="Human-readable title of the dataset")
    path: str = Field(..., description="Physical path or connection string to the dataset")
    domain: Optional[str] = Field(None, description="Business domain (e.g., Finance, Customer)")
    risk_level: RiskLevel = Field(default=RiskLevel.MEDIUM, description="Risk classification")
    quality_goal: QualityGoal = Field(default=QualityGoal.STANDARD, description="Primary quality goal")
    owner: Optional[str] = Field(None, description="Dataset owner/steward")
    steward: Optional[str] = Field(None, description="Data steward responsible for quality")
    lineage: Optional[Dict] = Field(None, description="Data lineage information")
    tags: List[str] = Field(default_factory=list, description="Classification tags")
    created_date: datetime = Field(default_factory=datetime.now, description="When dataset was registered")

class QualityMeasurementEnhanced(BaseModel):
    """
    Enhanced DQV Quality Measurement with goal and severity.
    """
    metric: str = Field(..., description="Name of the metric being measured")
    value: float = Field(..., description="The computed value of the metric")
    timestamp: datetime = Field(default_factory=datetime.now, description="When the measurement was taken")
    status: MeasurementStatus = Field(default=MeasurementStatus.PROPOSED, description="Status of the measurement")
    dimension: Optional[str] = Field(None, description="DQ Dimension (e.g. Accuracy, Completeness)")
    severity: Severity = Field(default=Severity.MEDIUM, description="Severity level")
    goal: Optional[QualityGoal] = Field(None, description="Associated quality goal")
    dataset_id: Optional[str] = Field(None, description="Dataset this measurement applies to")

class DQException(BaseModel):
    """
    Exception management model for time-bound rule exceptions.
    Exceptions are time-bound, count against KPIs, and require re-approval.
    """
    exception_id: str = Field(..., description="Unique exception identifier")
    rule_id: str = Field(..., description="Rule being excepted")
    dataset_id: str = Field(..., description="Dataset this exception applies to")
    justification: str = Field(..., description="Business justification for exception")
    approved_by: str = Field(..., description="Steward who approved the exception")
    created_date: datetime = Field(default_factory=datetime.now, description="When exception was created")
    expiry_date: date = Field(..., description="When exception expires")
    status: str = Field(default="ACTIVE", description="Exception status (ACTIVE, EXPIRED, REVOKED)")
    review_notes: Optional[str] = Field(None, description="Review notes from steward")

class RuleDefinition(BaseModel):
    """
    Enhanced rule definition with lifecycle and governance.
    """
    rule_id: str = Field(..., description="Unique rule identifier")
    name: str = Field(..., description="Human-readable rule name")
    description: str = Field(..., description="Rule description")
    column: str = Field(..., description="Target column")
    rule_type: str = Field(..., description="Type of check (not_null, regex_match, range, etc.)")
    dimension: str = Field(..., description="DQ dimension")
    severity: Severity = Field(..., description="Severity level")
    state: RuleState = Field(default=RuleState.DRAFT, description="Lifecycle state")
    goal: QualityGoal = Field(..., description="Applicable quality goal")
    created_by: Optional[str] = Field(None, description="Rule author")
    approved_by: Optional[str] = Field(None, description="Steward who approved")
    created_date: datetime = Field(default_factory=datetime.now, description="Creation timestamp")
    approved_date: Optional[datetime] = Field(None, description="Approval timestamp")
    parameters: Optional[Dict] = Field(None, description="Rule-specific parameters")

class FitnessScore(BaseModel):
    """
    Overall fitness score for a dataset based on quality goal.
    Determines if dataset is "fit for use" for its intended purpose.
    """
    dataset_id: str = Field(..., description="Dataset identifier")
    goal: QualityGoal = Field(..., description="Quality goal being measured")
    overall_score: float = Field(..., ge=0.0, le=1.0, description="Overall fitness score (0-1)")
    dimension_scores: Dict[str, float] = Field(default_factory=dict, description="Scores by dimension")
    threshold: float = Field(..., description="Required threshold for this goal")
    passed: bool = Field(..., description="Whether dataset meets threshold")
    failed_rules: List[str] = Field(default_factory=list, description="Rules that failed")
    exception_count: int = Field(default=0, description="Number of active exceptions")
    timestamp: datetime = Field(default_factory=datetime.now, description="When score was calculated")
    
class DQPolicy(BaseModel):
    """
    Organization-level DQ policy configuration.
    Defines minimum fitness thresholds and mandatory dimensions by goal.
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
    allowed_exceptions_by_risk: Dict[str, int] = Field(
        default_factory=lambda: {"LOW": 10, "MEDIUM": 5, "HIGH": 3, "CRITICAL": 0},
        description="Maximum allowed exceptions by risk level"
    )

class KPIMetrics(BaseModel):
    """
    Platform-level KPI metrics aligned to W3C DQV, DAMA-DMBOK, and regulatory standards.
    """
    timestamp: datetime = Field(default_factory=datetime.now, description="Measurement timestamp")
    
    # Core KPIs
    datasets_fit_for_use_pct: float = Field(..., description="% of datasets meeting fitness threshold")
    mean_time_to_quality_hours: float = Field(..., description="Average time from issue detection to resolution")
    exception_leakage_pct: float = Field(..., description="% of exceptions that recur")
    regulatory_readiness_pct: float = Field(..., description="% of regulatory datasets signed off")
    ai_trust_index: float = Field(..., description="% of AI datasets certified fit")
    
    # Supporting metrics
    total_datasets: int = Field(..., description="Total datasets monitored")
    active_exceptions: int = Field(..., description="Current active exceptions")
    rules_executed_24h: int = Field(..., description="Rules executed in last 24 hours")
    failed_rules_24h: int = Field(..., description="Rules failed in last 24 hours")
    avg_fitness_score: float = Field(..., description="Average fitness across all datasets")

class WorkflowExecution(BaseModel):
    """
    Workflow execution record for audit trail.
    Tracks the complete DQ workflow execution.
    """
    execution_id: str = Field(..., description="Unique execution identifier")
    dataset_id: str = Field(..., description="Dataset being processed")
    goal: QualityGoal = Field(..., description="Quality goal for this execution")
    workflow_type: str = Field(..., description="STANDARD, REGULATORY, or AI workflow")
    started_at: datetime = Field(default_factory=datetime.now, description="Workflow start time")
    completed_at: Optional[datetime] = Field(None, description="Workflow completion time")
    status: str = Field(..., description="RUNNING, COMPLETED, FAILED, PENDING_APPROVAL")
    steps_completed: List[str] = Field(default_factory=list, description="Completed workflow steps")
    approvals: List[Dict] = Field(default_factory=list, description="Approval records")
    fitness_score: Optional[FitnessScore] = Field(None, description="Final fitness score")
    audit_record: Optional[Dict] = Field(None, description="Immutable audit record")

class GovernanceSignoff(BaseModel):
    """
    Steward/compliance sign-off record for regulatory workflows.
    """
    signoff_id: str = Field(..., description="Unique sign-off identifier")
    dataset_id: str = Field(..., description="Dataset being signed off")
    workflow_execution_id: str = Field(..., description="Associated workflow execution")
    signed_by: str = Field(..., description="Steward/compliance officer")
    role: str = Field(..., description="Role of signer (STEWARD, COMPLIANCE, RISK)")
    decision: str = Field(..., description="APPROVED, REJECTED, CONDITIONAL")
    comments: Optional[str] = Field(None, description="Sign-off comments")
    signed_at: datetime = Field(default_factory=datetime.now, description="Sign-off timestamp")
    valid_until: Optional[date] = Field(None, description="Validity period for sign-off")
