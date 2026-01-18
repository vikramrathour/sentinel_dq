"""
Explanations API endpoints.
Provides AI-powered explanations for DQ decisions.
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from intelligence.explainability import ExplainabilityEngine
from core.models_enhanced import QualityGoal, RuleDefinition, Severity, RuleState

router = APIRouter(prefix="/explain", tags=["explanations"])

# Initialize explainability engine
explainer = ExplainabilityEngine()

# ==================== Request Models ====================

class CDEExplanationRequest(BaseModel):
    column: str
    importance_score: float
    data_type: str
    goal: QualityGoal
    statistics: Optional[Dict] = None

class RuleExplanationRequest(BaseModel):
    selected_rules: List[Dict]  # List of rule dicts
    all_possible_rules: List[str]
    goal: QualityGoal
    cdes: List[str]

# ==================== Endpoints ====================

@router.get("/goal/{goal}")
def explain_goal(goal: QualityGoal):
    """
    Get detailed explanation of a quality goal.
    
    Explains:
    - What the goal means
    - Why it matters
    - What to expect
    - Success criteria
    """
    try:
        explanation = explainer.explain_goal(goal)
        return explanation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cde")
def explain_cde(request: CDEExplanationRequest):
    """
    Explain why a column was selected (or not selected) as a CDE.
    
    Provides:
    - Importance reasoning
    - Goal alignment
    - Recommendations
    - Risk assessment
    """
    try:
        explanation = explainer.explain_cde_selection(
            column=request.column,
            importance_score=request.importance_score,
            data_type=request.data_type,
            goal=request.goal,
            statistics=request.statistics
        )
        return explanation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rules")
def explain_rules(request: RuleExplanationRequest):
    """
    Explain which rules were selected and why others were not applicable.
    
    Provides:
    - Selection criteria
    - Why each rule was chosen
    - Why other rules don't apply
    - Coverage analysis
    - Recommendations
    """
    try:
        # Convert rule dicts to RuleDefinition objects
        selected_rules = []
        for rule_dict in request.selected_rules:
            rule = RuleDefinition(
                rule_id=rule_dict.get("rule_id", ""),
                name=rule_dict.get("name", ""),
                description=rule_dict.get("description", ""),
                column=rule_dict.get("column", ""),
                rule_type=rule_dict.get("rule_type", ""),
                dimension=rule_dict.get("dimension", ""),
                severity=Severity(rule_dict.get("severity", "MEDIUM")),
                goal=QualityGoal(rule_dict.get("goal", "STANDARD_DQ"))
            )
            selected_rules.append(rule)
        
        explanation = explainer.explain_rule_selection(
            selected_rules=selected_rules,
            all_possible_rules=request.all_possible_rules,
            goal=request.goal,
            cdes=request.cdes
        )
        return explanation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dimension/{dimension}")
def explain_dimension(dimension: str):
    """
    Explain what a data quality dimension means.
    """
    descriptions = {
        "Completeness": {
            "definition": "Measures whether all required data is present",
            "importance": "Missing data leads to incomplete analysis and incorrect conclusions",
            "examples": [
                "Checking for null values in required fields",
                "Ensuring all mandatory columns are populated",
                "Validating record counts match expectations"
            ],
            "metrics": [
                "Null count / Total count",
                "Missing value percentage",
                "Record completeness score"
            ]
        },
        "Validity": {
            "definition": "Ensures data conforms to defined formats and business rules",
            "importance": "Invalid data causes processing errors and system failures",
            "examples": [
                "Email addresses match email format",
                "Dates are in correct format",
                "Values are within allowed ranges"
            ],
            "metrics": [
                "Format validation pass rate",
                "Business rule compliance",
                "Invalid value count"
            ]
        },
        "Accuracy": {
            "definition": "Verifies data correctly represents real-world values",
            "importance": "Inaccurate data leads to wrong business decisions",
            "examples": [
                "Addresses match postal records",
                "Calculations are mathematically correct",
                "Reference data is up-to-date"
            ],
            "metrics": [
                "Accuracy score vs. source of truth",
                "Error rate in calculations",
                "Reference data freshness"
            ]
        },
        "Consistency": {
            "definition": "Checks data uniformity across systems and time",
            "importance": "Inconsistent data creates confusion and reduces trust",
            "examples": [
                "Same customer has consistent name across systems",
                "Date formats are uniform",
                "Units of measurement are consistent"
            ],
            "metrics": [
                "Cross-system match rate",
                "Format consistency score",
                "Temporal consistency"
            ]
        },
        "Uniqueness": {
            "definition": "Ensures no duplicate records exist",
            "importance": "Duplicates cause double-counting and inflated metrics",
            "examples": [
                "Customer IDs are unique",
                "Transaction IDs have no duplicates",
                "Email addresses appear only once"
            ],
            "metrics": [
                "Duplicate count",
                "Uniqueness percentage",
                "Primary key violations"
            ]
        },
        "Timeliness": {
            "definition": "Validates data is current and available when needed",
            "importance": "Stale data leads to decisions based on outdated information",
            "examples": [
                "Data is updated within SLA",
                "Timestamps are recent",
                "Data freshness meets requirements"
            ],
            "metrics": [
                "Data age",
                "Update frequency",
                "SLA compliance rate"
            ]
        },
        "Integrity": {
            "definition": "Maintains referential relationships between data elements",
            "importance": "Broken relationships lead to orphaned records",
            "examples": [
                "Foreign keys reference existing records",
                "Parent-child relationships are valid",
                "Cross-table references are intact"
            ],
            "metrics": [
                "Referential integrity violations",
                "Orphaned record count",
                "Relationship validity rate"
            ]
        },
        "Auditability": {
            "definition": "Ensures data changes are tracked and traceable",
            "importance": "Required for compliance and root cause analysis",
            "examples": [
                "All changes have timestamps",
                "User actions are logged",
                "Data lineage is documented"
            ],
            "metrics": [
                "Audit trail completeness",
                "Change tracking coverage",
                "Lineage documentation score"
            ]
        }
    }
    
    if dimension not in descriptions:
        raise HTTPException(status_code=404, detail=f"Dimension '{dimension}' not found")
    
    return {
        "dimension": dimension,
        **descriptions[dimension]
    }

@router.get("/workflow/{goal}")
def explain_workflow(goal: QualityGoal):
    """
    Explain the workflow for a specific quality goal.
    """
    workflows = {
        QualityGoal.STANDARD: {
            "name": "Standard DQ Workflow",
            "steps": [
                {
                    "step": 1,
                    "name": "Register Dataset",
                    "description": "Dataset is registered with metadata",
                    "duration": "< 1 minute",
                    "automated": True
                },
                {
                    "step": 2,
                    "name": "Metadata Validation",
                    "description": "Basic metadata checks (schema, types)",
                    "duration": "< 1 minute",
                    "automated": True
                },
                {
                    "step": 3,
                    "name": "Foundational DQ Checks",
                    "description": "Run completeness, validity, consistency checks",
                    "duration": "2-5 minutes",
                    "automated": True
                },
                {
                    "step": 4,
                    "name": "Score & Trend",
                    "description": "Calculate fitness score and update trends",
                    "duration": "< 1 minute",
                    "automated": True
                },
                {
                    "step": 5,
                    "name": "Engineer Remediation",
                    "description": "Engineering team fixes issues",
                    "duration": "Variable",
                    "automated": False
                }
            ],
            "total_time": "5-10 minutes (automated steps)",
            "approval_required": False,
            "characteristics": [
                "Fast iteration",
                "Continuous monitoring",
                "Self-service",
                "No formal approvals"
            ]
        },
        QualityGoal.REGULATORY: {
            "name": "Regulatory DQ Workflow",
            "steps": [
                {
                    "step": 1,
                    "name": "Register Dataset",
                    "description": "Dataset registered with full metadata and lineage",
                    "duration": "2-5 minutes",
                    "automated": True
                },
                {
                    "step": 2,
                    "name": "Metadata + Lineage Check",
                    "description": "Mandatory validation of metadata and lineage",
                    "duration": "2-3 minutes",
                    "automated": True
                },
                {
                    "step": 3,
                    "name": "Foundational + Regulatory DQ",
                    "description": "Run all checks including regulatory-specific rules",
                    "duration": "5-10 minutes",
                    "automated": True
                },
                {
                    "step": 4,
                    "name": "Control Threshold Enforcement",
                    "description": "Verify 95%+ threshold is met",
                    "duration": "< 1 minute",
                    "automated": True
                },
                {
                    "step": 5,
                    "name": "Steward Review",
                    "description": "Data steward reviews results and exceptions",
                    "duration": "1-2 hours",
                    "automated": False
                },
                {
                    "step": 6,
                    "name": "Compliance Sign-off",
                    "description": "Compliance officer provides formal approval",
                    "duration": "1-24 hours",
                    "automated": False
                },
                {
                    "step": 7,
                    "name": "Immutable Audit Record",
                    "description": "Record permanently logged for audit",
                    "duration": "< 1 minute",
                    "automated": True
                }
            ],
            "total_time": "2-48 hours (includes human reviews)",
            "approval_required": True,
            "characteristics": [
                "Human-in-the-loop mandatory",
                "Formal approvals required",
                "Immutable audit trail",
                "Higher thresholds (95%+)",
                "Exception management"
            ]
        },
        QualityGoal.AI: {
            "name": "AI/ML DQ Workflow",
            "steps": [
                {
                    "step": 1,
                    "name": "Register Dataset",
                    "description": "Dataset registered with ML metadata",
                    "duration": "< 1 minute",
                    "automated": True
                },
                {
                    "step": 2,
                    "name": "Semantic & Label Validation",
                    "description": "Validate feature semantics and label quality",
                    "duration": "3-5 minutes",
                    "automated": True
                },
                {
                    "step": 3,
                    "name": "Foundational + AI DQ",
                    "description": "Run standard checks plus AI-specific validations",
                    "duration": "5-10 minutes",
                    "automated": True
                },
                {
                    "step": 4,
                    "name": "Distribution & Drift Baseline",
                    "description": "Establish statistical baseline for drift detection",
                    "duration": "2-5 minutes",
                    "automated": True
                },
                {
                    "step": 5,
                    "name": "Fitness Certification",
                    "description": "Issue ML fitness certificate",
                    "duration": "< 1 minute",
                    "automated": True
                },
                {
                    "step": 6,
                    "name": "Continuous Drift Monitoring",
                    "description": "Ongoing monitoring post-deployment",
                    "duration": "Continuous",
                    "automated": True
                }
            ],
            "total_time": "10-20 minutes (initial), continuous monitoring",
            "approval_required": False,
            "characteristics": [
                "Statistical validation",
                "Distribution monitoring",
                "Drift detection",
                "Bias checks",
                "Model fitness focus"
            ]
        }
    }
    
    if goal not in workflows:
        raise HTTPException(status_code=404, detail=f"Workflow for goal '{goal}' not found")
    
    return workflows[goal]

@router.get("/help/cde-selection")
def help_cde_selection():
    """
    Provide help on how CDE selection works.
    """
    return {
        "title": "Critical Data Element (CDE) Selection",
        "overview": "CDEs are columns that significantly impact your data quality goals",
        "how_it_works": [
            "AI analyzes each column's characteristics (type, cardinality, null rate)",
            "Importance score is calculated based on business impact",
            "Columns are ranked by importance (0-100%)",
            "Threshold of 75% is used for automatic selection",
            "You can override AI recommendations"
        ],
        "importance_factors": [
            "Column name (e.g., 'id', 'email' are typically important)",
            "Data type (identifiers, amounts, dates are critical)",
            "Null rate (columns with data are more important)",
            "Cardinality (unique values indicate identifiers)",
            "Quality goal alignment (regulatory needs different CDEs than AI)"
        ],
        "best_practices": [
            "Include all identifier columns (customer_id, order_id, etc.)",
            "Include columns used in business calculations",
            "For regulatory: include audit fields (created_date, modified_by)",
            "For AI/ML: include all features used in models",
            "Review AI recommendations but trust your domain knowledge"
        ],
        "tips": [
            "More CDEs = more comprehensive quality checks",
            "Fewer CDEs = faster execution and simpler maintenance",
            "Start with AI recommendations, refine based on results",
            "Critical columns should always be included"
        ]
    }

@router.get("/help/rule-types")
def help_rule_types():
    """
    Explain available rule types and when to use them.
    """
    return {
        "rule_types": [
            {
                "type": "not_null",
                "name": "Completeness Check",
                "description": "Ensures column has no null/missing values",
                "when_to_use": "For required fields that must always have data",
                "example": "customer_id, order_date, status",
                "dimension": "Completeness"
            },
            {
                "type": "regex_match",
                "name": "Format Validation",
                "description": "Validates data matches expected format pattern",
                "when_to_use": "For structured text fields with specific formats",
                "example": "email, phone, postal_code, SSN",
                "dimension": "Validity"
            },
            {
                "type": "range",
                "name": "Range Check",
                "description": "Ensures numeric values are within acceptable bounds",
                "when_to_use": "For numeric fields with known min/max values",
                "example": "age (0-120), price (>0), percentage (0-100)",
                "dimension": "Validity"
            },
            {
                "type": "unique",
                "name": "Uniqueness Check",
                "description": "Verifies no duplicate values exist",
                "when_to_use": "For identifier columns and unique constraints",
                "example": "customer_id, email, transaction_id",
                "dimension": "Uniqueness"
            },
            {
                "type": "referential_integrity",
                "name": "Foreign Key Check",
                "description": "Validates relationships between tables",
                "when_to_use": "When foreign key relationships exist",
                "example": "order.customer_id references customer.id",
                "dimension": "Integrity"
            },
            {
                "type": "statistical_outlier",
                "name": "Outlier Detection",
                "description": "Identifies statistically unusual values",
                "when_to_use": "For anomaly detection in numeric fields",
                "example": "transaction_amount, sensor_reading",
                "dimension": "Accuracy"
            }
        ],
        "selection_guidance": "Rules are automatically selected based on column type and quality goal"
    }
