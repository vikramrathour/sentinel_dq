# Sentinel-DQ UI - Xoriant ORIAN Edition

## Overview

The Sentinel-DQ UI is a modern, workflow-driven interface for the autonomous data quality platform, branded with Xoriant ORIAN design system.

## Features

### 🔄 End-to-End Workflow
A guided 6-step process for complete data quality management:

1. **Define Goal** - Set business objectives and quality thresholds
2. **Upload Dataset** - Drag-and-drop CSV/Parquet files
3. **Generate Analysis** - AI-powered data profiling
4. **Identify CDEs** - Select Critical Data Elements with importance scoring
5. **Review Results** - Examine generated DQ rules and verify against goals
6. **Export Rules** - Download rules in YAML, JSON, or Collibra format

### 📊 Dashboard
- Real-time trust heatmap visualization
- Key metrics and health scores
- Recent activity monitoring
- Node-level quality tracking

### 🎯 AI Goals Management
- Create and manage Definition of Done (DoD) thresholds
- Track KPIs and target metrics
- Visual goal cards with status indicators

### ✅ Quality Gate Verification
- Run decision-impact analysis
- Issue trust certificates
- PSI-based drift detection
- Weighted scoring based on CDEs

### 📜 Audit Ledger
- Immutable inference history
- Complete audit trail
- Timestamp and status tracking
- W3C DQV-compliant records

## Design System

### Color Palette (Xoriant ORIAN)
- **Navy**: `#1a1f3a` - Primary brand color
- **Blue**: `#2563eb` - Interactive elements
- **Purple**: `#7c3aed` - Accent color
- **Indigo**: `#4f46e5` - Secondary accent

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300-900

### Components
- Gradient backgrounds
- Smooth animations
- Responsive design
- Modern card-based layouts

## Installation

```bash
cd ui
npm install
npm run dev
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Router** - Navigation

## API Integration

The UI connects to the FastAPI backend on `http://localhost:8000`:

- `GET /v1/dashboard` - Dashboard data
- `GET /goals` - List AI goals
- `POST /goal` - Create new goal
- `POST /verify` - Run quality gate
- `GET /ledger` - Audit history

## Development

### Project Structure
```
ui/
├── src/
│   ├── components/
│   │   └── Layout.jsx         # Main layout with sidebar
│   ├── pages/
│   │   ├── Workflow.jsx       # 6-step workflow
│   │   ├── Dashboard.jsx      # Trust heatmap
│   │   ├── Goals.jsx          # AI goals management
│   │   ├── Verify.jsx         # Quality gate
│   │   └── Ledger.jsx         # Audit ledger
│   ├── App.jsx                # Router configuration
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── tailwind.config.js         # Tailwind configuration
├── vite.config.js             # Vite configuration
└── package.json               # Dependencies
```

### Key Features

#### Workflow Page
- Full-screen experience without sidebar
- Progress stepper with visual feedback
- Step-by-step guidance
- Form validation
- File upload with drag-and-drop
- Real-time progress indicators

#### Responsive Design
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interactions

#### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management

## Customization

### Branding
Update `tailwind.config.js` to customize colors:

```javascript
colors: {
  'xoriant-navy': '#1a1f3a',
  'xoriant-blue': '#2563eb',
  // Add your colors
}
```

### Logo
Replace the Sparkles icon in `Layout.jsx` with your logo component.

## Production Build

```bash
npm run build
```

Output will be in the `dist/` directory.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Enterprise Edition - Xoriant Corporation © 2026
