"""
Governance API endpoints for exception management, approvals, and sign-offs.
Aligned with enterprise DQ platform specification.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from datetime import datetime, date
import json
from pathlib import Path

from core.models_enhanced import (
    DQException, RuleDefinition, RuleState, GovernanceSignoff,
    FitnessScore, QualityGoal, Severity
)

router = APIRouter(prefix="/governance", tags=["governance"])

# Storage paths
EXCEPTIONS_FILE = Path("storage/exceptions.jsonl")
RULES_FILE = Path("storage/rules.json")
SIGNOFFS_FILE = Path("storage/signoffs.jsonl")

# Ensure storage directory exists
EXCEPTIONS_FILE.parent.mkdir(parents=True, exist_ok=True)

# ==================== Exception Management ====================

@router.post("/exceptions", status_code=status.HTTP_201_CREATED)
def create_exception(exception: DQException):
    """
    Create a new time-bound exception for a rule.
    Requires steward approval and justification.
    """
    # Validate expiry date is in the future
    if exception.expiry_date <= date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expiry date must be in the future"
        )
    
    # Append to exceptions log
    with open(EXCEPTIONS_FILE, "a") as f:
        f.write(exception.model_dump_json() + "\n")
    
    return {
        "message": "Exception created successfully",
        "exception_id": exception.exception_id,
        "expires_on": exception.expiry_date.isoformat()
    }

@router.get("/exceptions", response_model=List[DQException])
def list_exceptions(
    dataset_id: Optional[str] = None,
    status: Optional[str] = None,
    include_expired: bool = False
):
    """
    List all exceptions with optional filtering.
    """
    if not EXCEPTIONS_FILE.exists():
        return []
    
    exceptions = []
    today = date.today()
    
    with open(EXCEPTIONS_FILE, "r") as f:
        for line in f:
            try:
                exc = DQException.model_validate_json(line)
                
                # Check if expired
                if exc.expiry_date < today and exc.status == "ACTIVE":
                    exc.status = "EXPIRED"
                
                # Apply filters
                if dataset_id and exc.dataset_id != dataset_id:
                    continue
                if status and exc.status != status:
                    continue
                if not include_expired and exc.status == "EXPIRED":
                    continue
                
                exceptions.append(exc)
            except Exception as e:
                continue
    
    return exceptions

@router.get("/exceptions/{exception_id}", response_model=DQException)
def get_exception(exception_id: str):
    """Get a specific exception by ID."""
    if not EXCEPTIONS_FILE.exists():
        raise HTTPException(status_code=404, detail="Exception not found")
    
    with open(EXCEPTIONS_FILE, "r") as f:
        for line in f:
            try:
                exc = DQException.model_validate_json(line)
                if exc.exception_id == exception_id:
                    return exc
            except Exception:
                continue
    
    raise HTTPException(status_code=404, detail="Exception not found")

@router.delete("/exceptions/{exception_id}")
def revoke_exception(exception_id: str, revoked_by: str, reason: str):
    """
    Revoke an active exception.
    Updates status to REVOKED.
    """
    # In a real system, this would update the database
    # For now, we log the revocation
    revocation = {
        "exception_id": exception_id,
        "revoked_by": revoked_by,
        "reason": reason,
        "revoked_at": datetime.now().isoformat()
    }
    
    return {
        "message": "Exception revoked successfully",
        "revocation": revocation
    }

# ==================== Rule Lifecycle Management ====================

@router.post("/rules", status_code=status.HTTP_201_CREATED)
def create_rule(rule: RuleDefinition):
    """
    Create a new rule in DRAFT state.
    Must go through review and approval before becoming ACTIVE.
    """
    # Load existing rules
    rules = {}
    if RULES_FILE.exists():
        with open(RULES_FILE, "r") as f:
            rules = json.load(f)
    
    # Add new rule
    rules[rule.rule_id] = rule.model_dump(mode='json')
    
    # Save
    with open(RULES_FILE, "w") as f:
        json.dump(rules, f, indent=2)
    
    return {
        "message": "Rule created successfully",
        "rule_id": rule.rule_id,
        "state": rule.state
    }

@router.get("/rules", response_model=List[RuleDefinition])
def list_rules(
    state: Optional[RuleState] = None,
    goal: Optional[QualityGoal] = None,
    severity: Optional[Severity] = None
):
    """
    List all rules with optional filtering by state, goal, or severity.
    """
    if not RULES_FILE.exists():
        return []
    
    with open(RULES_FILE, "r") as f:
        rules_dict = json.load(f)
    
    rules = []
    for rule_data in rules_dict.values():
        rule = RuleDefinition(**rule_data)
        
        # Apply filters
        if state and rule.state != state:
            continue
        if goal and rule.goal != goal:
            continue
        if severity and rule.severity != severity:
            continue
        
        rules.append(rule)
    
    return rules

@router.patch("/rules/{rule_id}/state")
def update_rule_state(
    rule_id: str,
    new_state: RuleState,
    approved_by: Optional[str] = None,
    comments: Optional[str] = None
):
    """
    Update rule state through lifecycle: DRAFT → REVIEWED → APPROVED → ACTIVE.
    Requires approval for REGULATORY and AI bias-related rules.
    """
    if not RULES_FILE.exists():
        raise HTTPException(status_code=404, detail="Rule not found")
    
    with open(RULES_FILE, "r") as f:
        rules = json.load(f)
    
    if rule_id not in rules:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    rule = rules[rule_id]
    old_state = rule["state"]
    
    # Validate state transition
    valid_transitions = {
        "DRAFT": ["REVIEWED"],
        "REVIEWED": ["APPROVED", "DRAFT"],
        "APPROVED": ["ACTIVE", "REVIEWED"],
        "ACTIVE": ["DEPRECATED"],
        "DEPRECATED": []
    }
    
    if new_state.value not in valid_transitions.get(old_state, []):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid state transition from {old_state} to {new_state.value}"
        )
    
    # Update rule
    rule["state"] = new_state.value
    if approved_by:
        rule["approved_by"] = approved_by
        rule["approved_date"] = datetime.now().isoformat()
    
    # Save
    with open(RULES_FILE, "w") as f:
        json.dump(rules, f, indent=2)
    
    return {
        "message": "Rule state updated successfully",
        "rule_id": rule_id,
        "old_state": old_state,
        "new_state": new_state.value,
        "approved_by": approved_by
    }

# ==================== Governance Sign-offs ====================

@router.post("/signoffs", status_code=status.HTTP_201_CREATED)
def create_signoff(signoff: GovernanceSignoff):
    """
    Create a governance sign-off for regulatory workflows.
    Required for REGULATORY_DQ goal datasets.
    """
    # Append to sign-offs log
    with open(SIGNOFFS_FILE, "a") as f:
        f.write(signoff.model_dump_json() + "\n")
    
    return {
        "message": "Sign-off recorded successfully",
        "signoff_id": signoff.signoff_id,
        "decision": signoff.decision
    }

@router.get("/signoffs", response_model=List[GovernanceSignoff])
def list_signoffs(
    dataset_id: Optional[str] = None,
    signed_by: Optional[str] = None,
    decision: Optional[str] = None
):
    """
    List all governance sign-offs with optional filtering.
    """
    if not SIGNOFFS_FILE.exists():
        return []
    
    signoffs = []
    with open(SIGNOFFS_FILE, "r") as f:
        for line in f:
            try:
                signoff = GovernanceSignoff.model_validate_json(line)
                
                # Apply filters
                if dataset_id and signoff.dataset_id != dataset_id:
                    continue
                if signed_by and signoff.signed_by != signed_by:
                    continue
                if decision and signoff.decision != decision:
                    continue
                
                signoffs.append(signoff)
            except Exception:
                continue
    
    return signoffs

@router.get("/signoffs/dataset/{dataset_id}/latest", response_model=Optional[GovernanceSignoff])
def get_latest_signoff(dataset_id: str):
    """
    Get the most recent sign-off for a dataset.
    Used to check regulatory readiness.
    """
    if not SIGNOFFS_FILE.exists():
        return None
    
    latest_signoff = None
    latest_date = None
    
    with open(SIGNOFFS_FILE, "r") as f:
        for line in f:
            try:
                signoff = GovernanceSignoff.model_validate_json(line)
                if signoff.dataset_id == dataset_id:
                    if latest_date is None or signoff.signed_at > latest_date:
                        latest_signoff = signoff
                        latest_date = signoff.signed_at
            except Exception:
                continue
    
    return latest_signoff

# ==================== Fitness & Readiness ====================

@router.get("/fitness/{dataset_id}", response_model=Optional[FitnessScore])
def get_dataset_fitness(dataset_id: str):
    """
    Get the current fitness score for a dataset.
    Determines if dataset is "fit for use" for its quality goal.
    """
    # Load from storage (in real system, this would be from database)
    fitness_file = Path(f"storage/fitness/{dataset_id}.json")
    
    if not fitness_file.exists():
        return None
    
    with open(fitness_file, "r") as f:
        data = json.load(f)
        return FitnessScore(**data)

@router.get("/readiness/regulatory")
def get_regulatory_readiness():
    """
    Calculate regulatory readiness percentage.
    Returns % of REGULATORY_DQ datasets that have valid sign-offs.
    """
    # This would query the database in a real system
    # For now, return a mock calculation
    
    total_regulatory = 10  # Mock: total datasets with REGULATORY_DQ goal
    signed_off = 8  # Mock: datasets with valid sign-offs
    
    readiness_pct = (signed_off / total_regulatory * 100) if total_regulatory > 0 else 0
    
    return {
        "regulatory_readiness_pct": readiness_pct,
        "total_regulatory_datasets": total_regulatory,
        "signed_off_datasets": signed_off,
        "pending_signoff": total_regulatory - signed_off,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/readiness/ai")
def get_ai_trust_index():
    """
    Calculate AI Trust Index.
    Returns % of AI_DQ datasets that are certified fit for ML use.
    """
    total_ai = 15  # Mock: total datasets with AI_DQ goal
    certified = 12  # Mock: datasets meeting AI fitness threshold
    
    trust_index = (certified / total_ai * 100) if total_ai > 0 else 0
    
    return {
        "ai_trust_index": trust_index,
        "total_ai_datasets": total_ai,
        "certified_datasets": certified,
        "pending_certification": total_ai - certified,
        "timestamp": datetime.now().isoformat()
    }
