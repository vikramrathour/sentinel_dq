# 🛡️ Sentinel-DQ: Autonomous Data Quality Platform

<div align="center">

**Enterprise-Grade Data Quality Management with AI-Powered Explainability**

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![W3C](https://img.shields.io/badge/W3C-DCAT%20%7C%20DQV-005A9C.svg)](https://www.w3.org/)
[![License](https://img.shields.io/badge/License-Open%20Source-green.svg)](LICENSE)

*Powered by Xoriant ORIAN AI Platform*

</div>

---

## 🎯 Overview

**Sentinel-DQ** is an enterprise-grade, AI-powered Data Quality Management Platform that operationalizes W3C-aligned data quality across operational, regulatory, and AI/ML contexts. It bridges the gap between technical data checks and business decision impact through semantic understanding, explainable AI, and immutable audit trails.

### Why Sentinel-DQ?

> **"Jira + Git + Prometheus for Data Quality"**

- 🎯 **Goal-Driven**: Define quality objectives (Standard, Regulatory, AI/ML) with context-specific workflows
- 🤖 **AI-Powered**: Explainable recommendations for CDEs, rules, and quality dimensions
- 📊 **Standards-Based**: Built on W3C DCAT/DQV, aligned with DAMA-DMBOK
- 🔍 **Audit-Ready**: Immutable ledger, regulatory sign-offs, complete traceability
- 🔌 **Integration-First**: Coordinates with existing tools (Collibra, Soda, GE) rather than replacing them
- 📈 **KPI-Driven**: Track maturity from Reactive → Intelligent with enterprise metrics

## 📸 Screenshots

### 6-Step Workflow with AI Explanations
The intuitive workflow guides users from goal definition to rule export, with contextual AI explanations at every step.

### Interactive Dashboard
Real-time KPIs, trust heatmaps, and domain health views provide comprehensive visibility into data quality.

### Explainability in Action
- 💡 **Goal Explanations**: Understand thresholds and use cases
- 💡 **CDE Explanations**: Learn why columns are critical
- 💡 **Rule Explanations**: See which rules apply and why

---

## ✨ Feature Highlights

| Feature | Description | Benefit |
|---------|-------------|---------|
| 🎯 **Goal-Based Workflows** | Three quality contexts with distinct thresholds | Align DQ to business objectives |
| 🤖 **AI Explainability** | Contextual explanations for every decision | Build trust and transparency |
| 📊 **KPI Monitoring** | Platform, domain, and goal-level metrics | Measure and improve outcomes |
| 🔒 **Governance** | Rule lifecycle, exceptions, sign-offs | Meet regulatory requirements |
| 🔌 **Multi-Engine Export** | Convert to Soda, GE, Pandas, dbt, Collibra | Leverage existing investments |
| 📈 **Maturity Assessment** | 5-level progression tracking | Guide DQ transformation |

---

## 🚀 Key Features

### Core Platform Capabilities

*   **W3C Standards Compliance**: Built on **DCAT** (datasets) and **DQV** (quality measurements)
*   **Goal-Based Workflows**: Three quality goal types (Standard, Regulatory, AI/ML) with distinct workflows and thresholds
*   **Vectorized Validation Engine**: High-performance pandas-based rule execution with 6 quality dimensions
*   **Semantic Trust Graph**: NetworkX-based dependency modeling (Dataset ↔ Column ↔ Glossary) for impact tracing
*   **Human-in-the-Loop (HITL)**: Automated quarantine with steward approval workflows
*   **Immutable Audit Ledger**: JSONL-based inference logging for complete traceability

### Intelligence & Analytics

*   **AI-Powered Explainability**: Contextual explanations for:
    *   Why quality goals have specific thresholds
    *   Why CDEs (Critical Data Elements) were selected
    *   Why DQ rules were applied (and which weren't)
    *   What each quality dimension means
*   **Decision-Impact Analysis**:
    *   Population Stability Index (PSI) for drift detection
    *   Weighted scoring based on CDE importance
    *   Definition of Done (DoD) validation with trust certificates
*   **KPI Monitoring Framework**:
    *   Platform-level KPIs (Datasets Fit for Use, Mean Time to Quality)
    *   Domain and goal-level metrics
    *   Maturity assessment (5 levels: Reactive → Intelligent)
    *   Prometheus metrics export

### Governance & Compliance

*   **Rule Lifecycle Management**: Draft → Reviewed → Approved → Active → Deprecated
*   **Exception Management**: Time-bound, steward-approved exceptions with expiry tracking
*   **Regulatory Workflows**: Mandatory sign-offs, control thresholds, immutable audit records
*   **Fitness Scoring**: Multi-dimensional quality scoring for operational, regulatory, and AI readiness

### Integration & Extensibility

*   **Rule Export Adapters**: Convert rules to SodaCL, Great Expectations, Pandas, Collibra, dbt
*   **Governance Tool Integration**: Read-only ingestion from Collibra, OpenMetadata
*   **Multi-Channel Interaction**:
    *   **CLI**: Typer-based for CI/CD and power users
    *   **API**: FastAPI with comprehensive REST endpoints
    *   **UI**: Modern React/Vite/Tailwind interface with 6-step workflow

### User Experience

*   **End-to-End Workflow**: Define Goals → Upload Dataset → Generate Analysis → Identify CDEs → Review Results → Export Rules
*   **Xoriant ORIAN Branding**: Custom color themes and visual elements
*   **Interactive Dashboards**: Real-time KPIs, trust heatmaps, domain health views
*   **Contextual Help**: In-app explanations at every decision point

## 📂 Project Structure

```
sentinel_dq/
├── adapters/                    # External tool integrations
│   ├── collibra.py             # Collibra DQ API adapter
│   ├── market.py               # Great Expectations & SodaCL adapters
│   └── rule_export.py          # Multi-engine rule export (NEW)
├── api/                         # FastAPI backend
│   ├── main.py                 # Main API with KPI endpoints
│   ├── governance.py           # Governance & exception management (NEW)
│   └── explanations.py         # AI explainability endpoints (NEW)
├── backend/                     # Core backend logic
│   └── ledger.py               # Immutable inference ledger
├── cli/                         # Command Line Interface
│   └── main.py                 # Typer-based CLI
├── core/                        # Core data models & engines
│   ├── models.py               # W3C DCAT/DQV models
│   ├── models_enhanced.py      # Enhanced governance models (NEW)
│   ├── engine.py               # Vectorized validation engine
│   └── semantics.py            # Trust graph & semantic reasoning
├── intelligence/                # AI & analytics modules
│   ├── explainability.py       # AI-powered explanations (NEW)
│   ├── impact_analyzer.py      # PSI, drift detection, DoD validation
│   └── kpi_monitor.py          # KPI calculation & maturity assessment (NEW)
├── metadata/                    # Configuration & metadata
│   ├── dataset.json            # Dataset metadata
│   ├── goals.json              # Quality goals
│   ├── measurement.yaml        # Quality measurements
│   └── trust_graph.json        # Semantic trust graph
├── rules/                       # Rule definitions
│   └── schema.py               # Rule schema models
├── storage/                     # Persistence layer
│   ├── persistence.py          # Storage utilities
│   ├── inference_ledger.jsonl  # Immutable audit log
│   ├── kpi_metrics.jsonl       # KPI time series
│   └── quarantine/             # Quarantined data
├── ui/                          # Modern React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Workflow.jsx    # 6-step DQ workflow (NEW)
│   │   │   ├── Dashboard.jsx   # Enhanced KPI dashboard (NEW)
│   │   │   ├── Goals.jsx       # Goal management
│   │   │   ├── Verify.jsx      # Quality gate verification
│   │   │   └── Ledger.jsx      # Audit ledger viewer
│   │   ├── components/
│   │   │   └── Layout.jsx      # Xoriant ORIAN branded layout (NEW)
│   │   └── App.jsx             # Main app with routing
│   ├── tailwind.config.js      # Xoriant color theme (NEW)
│   └── package.json            # Frontend dependencies
├── rules.yaml                   # Example rules configuration
├── requirements.txt             # Python dependencies
└── *.md                         # Comprehensive documentation
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

## 💻 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### 1. Start the Backend API

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn api.main:app --reload --port 8000
```

**API Documentation**: `http://localhost:8000/docs`

### 2. Start the Web UI

```bash
# Navigate to UI directory
cd ui

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Dashboard URL**: `http://localhost:5173`

### 3. Explore the 6-Step Workflow

The UI provides an intuitive workflow for data quality management:

1. **Define Goal** - Select quality objective (Standard, Regulatory, or AI/ML)
   - 💡 Click "Show Help" to see detailed goal explanations
2. **Upload Dataset** - Drag & drop CSV or Parquet files
3. **Generate Analysis** - AI-powered dataset profiling
4. **Identify CDEs** - Select Critical Data Elements
   - 💡 Click ? icon to see why each column is critical
5. **Review Results** - See generated DQ rules
   - 💡 Click "Show Explanations" to understand rule selection
6. **Export Rules** - Download rules for your execution engine

### 4. Command Line Interface (CLI)

For CI/CD integration and power users:

```bash
# Scan a dataset
python -m cli.main scan test.csv rules.yaml

# Check system status
python -m cli.main status

# Approve quarantined data
python -m cli.main approve storage/quarantine/<dataset_id>/<file>.parquet
```

### 5. API Integration

Use the REST API for programmatic access:

```python
import requests

# Create a quality goal
response = requests.post('http://localhost:8000/goal', json={
    'goal_id': 'urn:goal:customer_analytics',
    'target_kpis': {'completeness': 0.95},
    'dod_threshold': 0.90
})

# Get current KPIs
kpis = requests.get('http://localhost:8000/kpis/current').json()

# Get AI explanation for a CDE
explanation = requests.post('http://localhost:8000/explain/cde', json={
    'column_name': 'customer_id',
    'goal': 'STANDARD_DQ',
    'dataset_context': 'customer_transactions'
}).json()
```

## 🎯 Use Cases

### Standard Data Quality
- Daily operational reporting
- Business intelligence dashboards
- Data pipeline monitoring
- **Threshold**: 85% | **Approval**: Not required

### Regulatory Compliance
- GDPR data accuracy requirements
- SOX financial reporting
- BCBS 239 risk data aggregation
- **Threshold**: 95% | **Approval**: Mandatory steward sign-off

### AI/ML Readiness
- Training data certification
- Model input validation
- Drift detection and monitoring
- **Threshold**: 90% | **Approval**: Data scientist review

## 🧪 Demo Scripts

The project includes several demo scripts to verify specific modules:

*   `python integration_demo.py`: Verifies interaction layer (CLI, API, Adapters)
*   `python impact_demo.py`: Demonstrates PSI calculation and DoD validation
*   `python ledger_demo.py`: Verifies immutable inference logging
*   `python api_ui_demo.py`: Tests full API flow from Goal → Verification
*   `python semantics_demo.py`: Demonstrates trust graph and semantic reasoning
*   `python engine_demo.py`: Shows vectorized rule execution

## 🧩 Integrations & Adapters

### Rule Execution Engines
Export rules to your preferred execution engine:

```bash
# Export to SodaCL
python -m cli.main export --engine soda --output checks.yml

# Export to Great Expectations
python -m cli.main export --engine great_expectations --output suite.json

# Export to Pandas (Python code)
python -m cli.main export --engine pandas --output checks.py

# Export to dbt (YAML tests)
python -m cli.main export --engine dbt --output schema.yml

# Export to Collibra
python -m cli.main export --engine collibra --output collibra.json
```

### Governance Platforms
- **Collibra**: Read-only metadata ingestion, DQ measurement publishing
- **OpenMetadata**: Dataset and lineage integration
- **Alation**: Data catalog synchronization

### Observability
- **Prometheus**: Native metrics export for monitoring
- **Grafana**: Pre-built dashboards for DQ KPIs
- **Datadog**: Custom metric integration

## 📊 Platform KPIs

Sentinel-DQ tracks enterprise-level data quality metrics:

| KPI | Definition | Target |
|-----|------------|--------|
| **Datasets Fit for Use** | % of datasets meeting fitness threshold | > 85% |
| **Mean Time to Quality** | Average time from issue detection to resolution | < 48 hours |
| **Exception Leakage** | % of accepted exceptions that recur | < 5% |
| **Regulatory Readiness** | % of datasets with compliance sign-offs | 100% |
| **AI Trust Index** | % of AI datasets certified for production | > 90% |

## 🎓 Data Quality Maturity Model

Sentinel-DQ helps organizations progress through 5 maturity levels:

| Level | Stage | Characteristics | Platform Support |
|-------|-------|-----------------|------------------|
| **1** | Reactive | Fix broken data after incidents | Basic rule execution |
| **2** | Managed | Track failures systematically | KPI monitoring, dashboards |
| **3** | Governed | Enforce controls and policies | Rule lifecycle, exceptions |
| **4** | Trusted | Certified datasets with sign-offs | Regulatory workflows, audit |
| **5** | Intelligent | AI-ready data with drift detection | Explainability, PSI, fitness |

## 🤖 AI-Powered Explainability

Sentinel-DQ provides contextual explanations at every decision point:

### Goal Explanations
Understand what each quality goal means, recommended thresholds, and expected outcomes.

### CDE Selection Explanations
Learn why specific columns are critical, their business impact, and quality concerns.

### Rule Selection Explanations
See which rules were applied (and why), which weren't applicable (and why), and dimension coverage.

### Dimension Explanations
Understand the 6 quality dimensions: Completeness, Validity, Consistency, Accuracy, Timeliness, Uniqueness.

**Access**: Click help icons (💡 ❓ ℹ️) throughout the UI workflow.

## 📚 Documentation

Comprehensive guides are available:

- **`QUICK_START.md`** - Get started in 5 minutes
- **`EXPLAINABILITY_UI_QUICKSTART.md`** - Visual guide to AI explanations
- **`UI_EXPLAINABILITY_INTEGRATION.md`** - Technical integration details
- **`EXPLAINABILITY_GUIDE.md`** - Backend API documentation
- **`PLATFORM_REFINEMENT.md`** - Platform architecture and design
- **`UI_UPGRADE_GUIDE.md`** - UI features and customization
- **`dq_gptspec.txt`** - Complete platform specification

## 🏗️ Architecture Principles

### Standards-Based
- W3C DCAT for dataset metadata
- W3C DQV for quality measurements
- DAMA-DMBOK alignment
- Regulatory compliance (GDPR, SOX, BCBS 239)

### Integration-First
- Doesn't replace existing tools (Collibra, Soda, GE)
- Coordinates and augments them
- Write rules once, export to any engine
- Read-only metadata ingestion

### Audit-Ready
- Immutable JSONL ledger
- Complete decision traceability
- Time-bound exceptions with approvals
- Regulatory sign-off workflows

### AI-Augmented
- Explainable recommendations
- Automated CDE identification
- Drift detection (PSI)
- Fitness scoring for multiple contexts

## 🚀 Roadmap

### Current Version (v2.0)
✅ Goal-based workflows
✅ AI explainability
✅ Enhanced governance
✅ KPI monitoring
✅ Modern UI with Xoriant branding

### Upcoming Features
- [ ] Real-time data quality monitoring
- [ ] Advanced ML-based anomaly detection
- [ ] Multi-tenant support
- [ ] Cloud deployment templates (AWS, Azure, GCP)
- [ ] Advanced lineage visualization
- [ ] Custom rule authoring UI
- [ ] Integration marketplace

## 🤝 Contributing

We welcome contributions! Areas of interest:
- New rule execution engine adapters
- Additional governance platform integrations
- Enhanced visualizations
- Performance optimizations
- Documentation improvements

## 💬 Support

- **Documentation**: See `*.md` files in the repository
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for questions and ideas

## 🏢 Enterprise Support

Sentinel-DQ is powered by **Xoriant ORIAN AI Platform**. For enterprise support, custom development, or consulting services, contact Xoriant.

## 📜 License

Sentinel-DQ is open-source software.

---

**Built with ❤️ by the Xoriant ORIAN AI Team**

*Operationalizing W3C-aligned data quality across operational, regulatory, and AI contexts.*
