from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import json
import hashlib
from datetime import datetime
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from pathlib import Path
from storage.persistence import METADATA_DIR
from intelligence.document_parser import DocumentParser
from intelligence.rule_extractor import RuleExtractor
from intelligence.impact_analyzer import DecisionImpactAnalyzer
from intelligence.profiler import DataProfiler
from backend.ledger import InferenceLedger
from intelligence.kpi_monitor import KPIMonitor
from api.governance import router as governance_router
from api.explanations import router as explanations_router

app = FastAPI(
    title="OrianDQ Platform API",
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

# Include routers
app.include_router(governance_router)
app.include_router(explanations_router)

# Initialize KPI monitor and profiler
kpi_monitor = KPIMonitor()
profiler = DataProfiler()

# ==================== Phase 2: Reference Document Ingestion ====================
DOCUMENTS_DIR = METADATA_DIR / "documents"
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
doc_parser = DocumentParser()
rule_extractor = RuleExtractor()

# ==================== Step 1 & 2: Ingestion & Profiling ====================

@app.post("/ingest")
async def ingest_dataset(file: UploadFile = File(...)):
    """
    Upload a dataset file (CSV or Parquet) and compute its statistical profile.
    If the same file was previously ingested (detected by MD5 hash), returns the
    cached profile immediately without re-computing.
    """
    try:
        file_bytes = await file.read()
        profile = profiler.ingest(file_bytes, file.filename)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/datasets")
def list_datasets():
    """
    List all previously ingested datasets with their profile summaries.
    """
    return profiler.list_profiles()


@app.get("/datasets/{dataset_id}/profile")
def get_dataset_profile(dataset_id: str):
    """
    Retrieve the full statistical profile for a specific dataset (by hash ID).
    """
    profile = profiler.get_profile(dataset_id)
    if not profile:
        raise HTTPException(
            status_code=404, detail=f"No profile found for dataset '{dataset_id}'"
        )
    return profile


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

# ==================== Phase 2: Reference Document Endpoints ====================

@app.post("/ingest-document")
async def ingest_reference_document(file: UploadFile = File(...)):
    """
    Upload a reference document (JSON Schema, XSD, YAML data contract).
    Extracts deterministic DQ rules from the document structure.
    Supports: .json (schema), .xsd, .yaml, .yml, .docx (data dictionary), .xlsx/.xls (data catalog)
    Caches by MD5 hash — same document re-uploaded returns instantly.
    """
    file_bytes = await file.read()

    # Compute MD5 hash for cache key
    file_hash = hashlib.md5(file_bytes).hexdigest()

    # Return cached result if available
    cached_path = DOCUMENTS_DIR / f"{file_hash}.json"
    if cached_path.exists():
        with open(cached_path, "r") as f:
            cached = json.load(f)
        cached["cached"] = True
        return cached

    # Validate extension
    filename = file.filename or ""
    ext = Path(filename).suffix.lower()
    if ext not in {".json", ".xsd", ".yaml", ".yml", ".docx", ".xlsx", ".xls"}:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported document type. Supported reference documents: "
                ".json (schema), .xsd, .yaml, .yml, .docx (data dictionary), "
                ".xlsx/.xls (data catalog)"
            )
        )

    # Parse document
    result = doc_parser.parse(file_bytes, filename)

    if result.get("document_type") == "unknown":
        raise HTTPException(
            status_code=400,
            detail=(
                "Could not detect document type. Supported: JSON Schema (.json), "
                "XSD (.xsd), YAML contract (.yaml/.yml), DOCX data dictionary (.docx), "
                "Excel data catalog (.xlsx/.xls)."
            )
        )

    # Extract rules and summarize
    rules = rule_extractor.extract_rules(result, result["document_type"])
    summary = rule_extractor.summarize(rules)

    # Build and persist response
    response = {
        "document_id": file_hash,
        "filename": filename,
        "document_type": result["document_type"],
        "cached": False,
        "ingested_at": datetime.utcnow().isoformat(),
        "rule_count": len(rules),
        "column_count": len(result.get("detected_columns", [])),
        "columns_covered": result.get("detected_columns", []),
        "rules": rules,
        "summary": summary,
    }

    with open(cached_path, "w") as f:
        json.dump(response, f, indent=2)

    return response


@app.get("/documents")
def list_documents():
    """List all ingested reference documents with their rule summaries."""
    documents = []
    for doc_path in DOCUMENTS_DIR.glob("*.json"):
        try:
            with open(doc_path, "r") as f:
                doc = json.load(f)
            # Return summary fields only — omit full rules array to keep response light
            documents.append({
                "document_id": doc.get("document_id"),
                "filename": doc.get("filename"),
                "document_type": doc.get("document_type"),
                "ingested_at": doc.get("ingested_at"),
                "rule_count": doc.get("rule_count"),
                "column_count": doc.get("column_count"),
                "columns_covered": doc.get("columns_covered"),
                "summary": doc.get("summary"),
            })
        except Exception:
            continue
    return documents


@app.get("/documents/{document_id}/rules")
def get_document_rules(document_id: str):
    """Get the full extracted DQ rules for a specific reference document."""
    doc_path = DOCUMENTS_DIR / f"{document_id}.json"
    if not doc_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"No document found with id '{document_id}'"
        )
    with open(doc_path, "r") as f:
        return json.load(f)


@app.get("/documents/{document_id}/rules/export")
def export_rules_as_dq_checks(document_id: str, format: str = "json"):
    """
    Export extracted rules in a format compatible with the DQ workflow.
    format: "json" (default) | "sodacl" | "great_expectations"
    """
    doc_path = DOCUMENTS_DIR / f"{document_id}.json"
    if not doc_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"No document found with id '{document_id}'"
        )
    with open(doc_path, "r") as f:
        doc = json.load(f)

    rules = doc.get("rules", [])

    if format == "json":
        return rules

    # TODO: implement sodacl export format
    # TODO: implement great_expectations export format

    raise HTTPException(
        status_code=400,
        detail=f"Unsupported export format '{format}'. Currently only 'json' is supported."
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
