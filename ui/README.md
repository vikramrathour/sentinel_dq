# OrianDQ — Frontend

React + Vite + Tailwind CSS single-page application for the OrianDQ Data Quality Platform.

## Stack

- **React 18** — UI framework
- **Vite 5** — build tool and dev server
- **Tailwind CSS** — utility-first styling
- **React Router** — client-side routing
- **Lucide React** — icon library

## Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:8000`

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build        # production build → dist/
npm run preview      # preview production build locally
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Trust heatmap, KPI tiles, recent activity |
| `/workflow` | Workflow | 7-step guided DQ workflow |
| `/goals` | Goals | Manage data quality goals |
| `/ledger` | Ledger | Immutable inference audit log |
| `/verify` | Verify | Quality gate verification |

## Key Components

- `Layout.jsx` — top navigation and sidebar
- `TrustHeatmap.jsx` — D3-based trust graph visualisation
- `components/ErrorBoundary.jsx` — React error boundary
- `components/SkeletonLoader.jsx` — loading state skeletons
- `context/ToastContext.jsx` — global toast notification context

## API Proxy

In development, Vite proxies all API calls to `http://localhost:8000`.
Configured in `vite.config.js`.

Proxied routes: `/v1`, `/verify`, `/goals`, `/goal`, `/ledger`, `/explain`,
`/governance`, `/kpis`, `/metrics`, `/ingest`, `/datasets`.

For a different backend URL, set `VITE_API_URL` before running:

```bash
VITE_API_URL=http://my-backend:8000 npm run dev
```

## Workflow Steps

1. Define Goal — select goal type, name, threshold
2. Upload Dataset — drag-drop data files + reference documents
3. Generate Analysis — statistical profiling and rule generation
4. Trust Graph — semantic relationship visualisation
5. Identify CDEs — critical data element selection
6. Review Results — quality scores and findings
7. Export Rules — download rules in SodaCL, GE, dbt, Collibra, or Pandas format
