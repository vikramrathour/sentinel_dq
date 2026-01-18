from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from pathlib import Path
from storage.persistence import METADATA_DIR
from intelligence.impact_analyzer import DecisionImpactAnalyzer
from backend.ledger import InferenceLedger
from intelligence.kpi_monitor import KPIMonitor
from api.governance import router as governance_router

app = FastAPI(
    title="Sentinel-DQ Platform API",
    version="2.0",
    description="Enterprise Data Quality Management Platform - Aligned with W3C DQV, DAMA-DMBOK"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include governance router
app.include_router(governance_router)

# Initialize KPI monitor
kpi_monitor = KPIMonitor()

# --- Models ---
class GoalInput(BaseModel):
    goal_id: str
    target_kpis: Dict[str, float]
    dod_threshold: float = 0.95

class VerifyInput(BaseModel):
    dataset_id: str
    goal_id: str

# --- Endpoints ---

@app.post("/goal")
def save_goal(goal: GoalInput):
    """
    Save an AI Goal and its Definition of Done parameters.
    """
    goals_path = METADATA_DIR / "goals.json"
    goals = {}
    if goals_path.exists():
        with open(goals_path, "r") as f:
            goals = json.load(f)
            
    goals[goal.goal_id] = goal.dict()
    
    with open(goals_path, "w") as f:
        json.dump(goals, f, indent=2)
        
    return {"message": "Goal saved successfully", "goal_id": goal.goal_id}

@app.get("/goals")
def list_goals():
    """
    List all registered AI Goals.
    """
    goals_path = METADATA_DIR / "goals.json"
    if not goals_path.exists():
        return []
    with open(goals_path, "r") as f:
        goals = json.load(f)
    return list(goals.values())

@app.get("/v1/dashboard")
def get_dashboard():
    """
    Returns the Trust Heatmap data derived from the TrustGraph.
    Now includes basic simulation of node health for visualization.
    """
    graph_path = METADATA_DIR / "trust_graph.json"
    
    if not graph_path.exists():
        return {"error": "Trust Graph not found. Run Sentinel analysis first."}

    with open(graph_path, "r") as f:
        graph_data = json.load(f)
        
    nodes = graph_data.get("nodes", [])
    
    # Enrich nodes with dummy health status if real data missing
    # In a real system, we'd query the latest QualityMeasurement for each node
    for node in nodes:
        if "health" not in node:
            node["health"] = float(np.random.uniform(0.7, 1.0)) # Simulating score

    return {
        "summary": {
            "total_datasets": len([n for n in nodes if n.get("type") == "Dataset"]),
            "total_nodes": len(nodes),
            "total_dependencies": len(graph_data.get("links", []))
        },
        "heatmap": {
            "nodes": nodes,
            "links": graph_data.get("links", [])
        }
    }

@app.post("/verify")
def verify_quality_gate(input_data: VerifyInput):
    """
    Quality Gate endpoint.
    Runs DecisionImpactAnalyzer to check if the dataset meets the Goal's DoD.
    """
    # 1. Load Goal
    goals_path = METADATA_DIR / "goals.json"
    if not goals_path.exists():
        raise HTTPException(status_code=404, detail="Goals metadata not found")
        
    with open(goals_path, "r") as f:
        goals = json.load(f)
        
    goal = goals.get(input_data.goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail=f"Goal {input_data.goal_id} not found")

    # 2. Simulate Data (In real app, load actual dataset by ID)
    # We will trigger the analyzer using dummy data for the demo
    # mirroring impact_demo.py logic
    ref_df = pd.DataFrame({"score": np.random.normal(0, 1, 1000)})
    curr_df = pd.DataFrame({"score": np.random.normal(0.2, 1, 1000)}) # Slight drift
    
    # 3. Analyze
    analyzer = DecisionImpactAnalyzer()
    
    try:
        # Assuming we check a column named 'score' as a proxy for the dataset
        psi = analyzer.calculate_psi(ref_df, curr_df, "score")
        
        # Validate
        certificate = analyzer.validate_dod(
            column_psis={"score": psi},
            target_score=goal["dod_threshold"]
        )
        
        dqv_export = analyzer.export_to_dqv(certificate, input_data.goal_id)
        
        # 4. Log to Ledger
        ledger = InferenceLedger()
        ledger.log_inference(
            dataset_id=input_data.dataset_id, 
            goal_id=input_data.goal_id, 
            dqv_record=dqv_export, 
            trusted=certificate["passed"]
        )
        
        return {
            "trusted": certificate["passed"],
            "trust_score": certificate["overall_score"],
            "certificate": certificate,
            "dqv_record": dqv_export
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ledger")
def get_ledger_history(limit: int = 50):
    """
    Retrieve the recent trust inference history from the ledger.
    """
    ledger_path = Path("storage/inference_ledger.jsonl")
    if not ledger_path.exists():
        return []
    
    logs = []
    # Read entire file (for demo simplicity; in prod use tail/seek)
    with open(ledger_path, "r") as f:
        for line in f:
            try:
                logs.append(json.loads(line))
            except:
                continue
                
    # Return last N logs reversed (newest first)
    return logs[-limit:][::-1]

# ==================== KPI & Monitoring Endpoints ====================

@app.get("/kpis/current")
def get_current_kpis():
    """
    Get current platform KPIs.
    Aligned with W3C DQV, DAMA-DMBOK, and regulatory standards.
    """
    kpis = kpi_monitor.calculate_current_kpis()
    return kpis.model_dump()

@app.get("/kpis/trend")
def get_kpi_trend(days: int = 30):
    """
    Get KPI trend over the last N days.
    """
    trend = kpi_monitor.get_kpi_trend(days=days)
    return [kpi.model_dump() for kpi in trend]

@app.get("/maturity")
def get_maturity_level():
    """
    Get current DQ maturity level.
    Levels: Reactive → Managed → Governed → Trusted → Intelligent
    """
    return kpi_monitor.get_maturity_level()

@app.get("/metrics/domain")
def get_domain_health():
    """
    Get average DQ score by business domain.
    """
    return kpi_monitor.get_domain_health()

@app.get("/metrics/goals")
def get_goal_metrics():
    """
    Get metrics broken down by quality goal (STANDARD, REGULATORY, AI).
    """
    return kpi_monitor.get_goal_metrics()

@app.get("/metrics/prometheus")
def get_prometheus_metrics():
    """
    Export metrics in Prometheus format for monitoring integration.
    """
    return kpi_monitor.export_prometheus_metrics()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
