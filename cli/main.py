import typer
import json
from pathlib import Path
import pandas as pd
from typing import Optional

from core.engine import DataValidator
from rules.schema import load_rules
from core.models import MeasurementStatus
from storage.persistence import load_metadata, METADATA_DIR

app = typer.Typer()

@app.command()
def scan(dataset_path: str, rules_path: str):
    """
    Run data quality scan on a dataset using provided rules.
    """
    typer.echo(f"Scanning {dataset_path} with rules from {rules_path}...")
    
    # 1. Load Rules
    try:
        rules_config = load_rules(rules_path)
    except Exception as e:
        typer.echo(f"Error loading rules: {e}")
        raise typer.Exit(code=1)

    # 2. Load Data (Simplified: assumes CSV or Parquet)
    try:
        if dataset_path.endswith(".csv"):
            df = pd.read_csv(dataset_path)
        elif dataset_path.endswith(".parquet"):
            df = pd.read_parquet(dataset_path)
        else:
            typer.echo("Unsupported file format. Use .csv or .parquet")
            raise typer.Exit(code=1)
    except Exception as e:
        typer.echo(f"Error loading data: {e}")
        raise typer.Exit(code=1)

    # 3. Run Validation
    validator = DataValidator(df, rules_config)
    results = validator.validate()

    # 4. Report
    typer.echo("\n--- Scan Results ---")
    for res in results:
        status_icon = "[PASS]" if res.status == MeasurementStatus.ACTIVE else "[REVIEW]" if res.status == MeasurementStatus.REVIEW_REQUIRED else "[?]"
        typer.echo(f"{status_icon} {res.metric}: {res.value:.1f}% ({res.status.value})")

@app.command()
def status():
    """
    Show current system status from Trust Graph.
    """
    graph_path = METADATA_DIR / "trust_graph.json"
    if not graph_path.exists():
        typer.echo("No trust graph found.")
        return

    with open(graph_path, "r") as f:
        data = json.load(f)
    
    nodes = data.get("nodes", [])
    links = data.get("links", [])
    
    typer.echo(f"\nTrust Graph Status:")
    typer.echo(f"Entities Monitored: {len(nodes)}")
    typer.echo(f"Dependencies Tracked: {len(links)}")
    
    typer.echo("\nEntities:")
    for node in nodes:
        typer.echo(f"- {node.get('id')} ({node.get('type', 'Unknown')})")

@app.command()
def approve(quarantine_file: str):
    """
    Approve/Resolve a quarantined file.
    """
    path = Path(quarantine_file)
    if not path.exists():
        typer.echo(f"File not found: {quarantine_file}")
        raise typer.Exit(code=1)
    
    # Logic: For now, just move it to an 'approved' folder
    approved_dir = Path("storage/approved")
    approved_dir.mkdir(parents=True, exist_ok=True)
    
    target_path = approved_dir / path.name
    path.rename(target_path)
    
    typer.echo(f"Resolved: {quarantine_file} -> {target_path}")

if __name__ == "__main__":
    app()
