# Sentinel-DQ: Autonomous Data Quality Platform

**Sentinel-DQ** is an open-source, agentic Data Quality (DQ) platform designed to bridge the gap between technical data checks and business decision impact. It features a semantic understanding of data dependencies, a decision-impact analyzer, and an immutable inference ledger.

## 🚀 Key Features

*   **Core Metadata Models**: Built on w3C standards (**DCAT** for datasets, **DQV** for quality measurements).
*   **Vectorized Validation Engine**: High-performance pandas-based rule execution.
*   **Human-in-the-Loop (HITL)**: Automated quarantine for datasets failing critical "Review Required" checks.
*   **Semantic Trust Graph**: Directed graph (NetworkX) modeling dependencies (Dataset <-> Column <-> Glossary) to trace impact.
*   **Decision-Impact Module**:
    *   **PSI Calculation**: Detects data drift (Population Stability Index).
    *   **Weighted Scoring**: Prioritizes issues based on Critical Data Element (CDE) weights from the Trust Graph.
    *   **DoD Validator**: Issues "Trust Certificates" based on AI Goal thresholds.
*   **Persistent Inference Ledger**: Immutable JSONL log of every trust decision for auditing.
*   **Interaction Layer**:
    *   **CLI**: For batch scanning and management.
    *   **API**: FastAPI endpoints for dashboards and "Quality Gates".
    *   **Adapters**: Integration with SodaCL, Great Expectations, and Collibra.
    *   **UI**: React component for Trust Heatmap visualization.

## 📂 Project Structure

```
sentinel_dq/
├── adapters/           # External tool adapters (Soda, GE, Collibra)
├── api/                # FastAPI backend endpoints
├── backend/            # Core backend logic (Ledger)
├── cli/                # Command Line Interface
├── core/               # Core models (Dataset, QualityMeasurement) and Engines
├── intelligence/       # Decision-Impact Analyzer (PSI, Scoring)
├── metadata/           # Storage for JSON/YAML metadata and Graphs
├── rules/              # Rule definitions and schema
├── storage/            # Persistence layer (Quarantine, Ledger)
├── ui/                 # Frontend components
├── rules.yaml          # Example rules configuration
└── requirements.txt    # Project dependencies
```

## 🛠️ Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-repo/sentinel_dq.git
    cd sentinel_dq
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## 💻 Usage

### 1. Command Line Interface (CLI)

Run ad-hoc scans or check status using the CLI.

*   **Scan a Dataset**:
    ```bash
    python -m cli.main scan <path_to_dataset.csv> rules.yaml
    ```
*   **Check System Status**:
    ```bash
    python -m cli.main status
    ```
*   **Approve Quarantined Data**:
    ```bash
    python -m cli.main approve storage/quarantine/<dataset_id>/<file>.parquet
    ```

### 2. API & Dashboard

Start the FastAPI server to access the dashboard API and run the React UI for visualization.

**Step 1: Start the Backend API**
```bash
uvicorn api.main:app --reload --port 8000
```
*   API Docs: `http://localhost:8000/docs`

**Step 2: Start the Web UI**
Open a new terminal window:
```bash
cd ui
npm install
npm run dev
```
*   Access the Sentinel-DQ Dashboard at: `http://localhost:5173`

The Web UI proxies requests to the backend automatically.

### 3. Verification & Demos

The project includes several demo scripts to verify specific modules:

*   `python integration_demo.py`: Verifies interaction layer (CLI, API, Adapters).
*   `python impact_demo.py`: Demonstrates PSI calculation and DoD validation logic.
*   `python ledger_demo.py`: Verifies the immutable inference logging.
*   `python api_ui_demo.py`: Tests the full API flow from Goal creation to Verification.

## 🧩 External Integrations

*   **SodaCL**: Convert Sentinel rules to SodaCL YAML.
*   **Great Expectations**: Export rules to GE JSON Suites.
*   **Collibra**: Format quality measurements for Collibra's Data Quality API.

## 📜 License

Sentinel-DQ is open-source software.
