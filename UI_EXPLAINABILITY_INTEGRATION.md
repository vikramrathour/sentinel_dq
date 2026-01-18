# UI Explainability Integration Guide

## Overview
The Sentinel-DQ platform now includes **AI-powered explainability** directly in the user interface. Users can understand **why** decisions were made at every step of the workflow.

---

## Where to Find Explainability Features

### 1. **Step 1: Define Goal** - Goal Explanations

**Location**: Workflow page, Step 1

**How to Access**:
- Click the **"Show Help"** button in the top-right corner of the step
- Select a goal type (Standard Quality, Regulatory, or AI/ML)

**What You'll See**:
- **Title & Explanation**: What this goal type means
- **Threshold**: Recommended quality threshold
- **Approval Required**: Whether human approval is needed
- **Use Cases**: Real-world scenarios where this goal applies
- **What to Expect**: What happens when you select this goal

**Visual Design**:
- Blue/purple gradient panel with lightbulb icon
- Grid layout showing threshold and approval requirements
- Bulleted lists for use cases and expectations

---

### 2. **Step 4: Identify CDEs** - CDE Selection Explanations

**Location**: Workflow page, Step 4

**How to Access**:
- Click the **help icon (?)** next to any column/CDE in the list

**What You'll See**:
- **Why This Column is Critical**: Detailed explanation of why this CDE was selected
- **Business Impact**: Impact level (High, Medium, Low)
- **Risk Level**: Risk if quality issues occur
- **Quality Concerns**: Specific data quality issues to watch for
- **Recommended Checks**: Suggested DQ rules for this column

**Visual Design**:
- Violet/purple gradient panel with lightbulb icon
- Grid showing business impact and risk level
- Warning icons (⚠) for quality concerns
- Pill-style tags for recommended checks

---

### 3. **Step 5: Review Results** - Rule Selection Explanations

**Location**: Workflow page, Step 5

**How to Access**:
- Click the **"Show Explanations"** button in the top-right corner

**What You'll See**:
- **Why These Rules Were Selected**: Overall explanation of rule selection strategy
- **Selected Rules**: List of rules that WERE applied, with reasons
  - Rule type (e.g., NOT_NULL, REGEX_MATCH)
  - Dimension covered (e.g., Completeness, Validity)
  - Reason for selection
- **Not Applicable**: List of rules that were NOT applied, with reasons why
- **Coverage Summary**: Summary of quality dimension coverage

**Visual Design**:
- Blue/indigo gradient panel with lightbulb icon
- Two-column layout: Selected (✓) vs Not Applicable (✗)
- Color-coded: Green checkmarks for selected, gray X for not applicable
- Coverage summary in a white rounded box

---

## User Experience Flow

### Typical User Journey:

1. **Start Workflow** → Navigate to the main workflow page (default landing page)

2. **Step 1: Define Goal**
   - User clicks "Show Help"
   - Sees detailed explanation of each goal type
   - Makes informed decision about which goal to select

3. **Step 2-3: Upload & Analyze**
   - Standard upload and analysis (no explainability here yet)

4. **Step 4: Identify CDEs**
   - System pre-selects high-importance columns
   - User clicks help icon (?) on any column
   - Sees why that column is critical for their goal
   - Can make informed decisions about which CDEs to include

5. **Step 5: Review Rules**
   - User clicks "Show Explanations"
   - Sees comprehensive breakdown of rule selection
   - Understands which rules were applied and why
   - Understands which rules were NOT applicable and why
   - Can proceed with confidence

6. **Step 6: Export**
   - Standard export functionality

---

## Technical Details

### API Endpoints Used:

1. **Goal Explanation**: `GET /explain/goal/{goal_type}`
   - Returns explanation for STANDARD_DQ, REGULATORY_DQ, or AI_DQ

2. **CDE Explanation**: `POST /explain/cde`
   - Body: `{ column_name, goal, dataset_context }`
   - Returns explanation for why a specific column is critical

3. **Rule Selection Explanation**: `POST /explain/rules`
   - Body: `{ selected_cdes, goal, dataset_context }`
   - Returns explanation for rule selection strategy

### Frontend Components:

- **File**: `ui/src/pages/Workflow.jsx`
- **Components Modified**:
  - `DefineGoalStep` - Added goal explanation panel
  - `IdentifyCDEsStep` - Added CDE explanation panel
  - `ReviewResultsStep` - Added rule explanation panel

### State Management:

Each step maintains its own state for explanations:
- `goalExplanation` - Stores goal explanation data
- `cdeExplanation` - Stores CDE explanation data
- `ruleExplanation` - Stores rule selection explanation data

### Design System:

- **Colors**: Xoriant ORIAN palette (blue, purple, indigo)
- **Icons**: Lucide React (Lightbulb, HelpCircle, Info)
- **Animations**: Fade-in transitions for explanation panels
- **Layout**: Gradient backgrounds with white content boxes

---

## Testing the Features

### To Test Locally:

1. **Start Backend**:
   ```bash
   uvicorn api.main:app --reload --port 8000
   ```

2. **Start Frontend**:
   ```bash
   cd ui
   npm run dev
   ```

3. **Navigate to Workflow**:
   - Open browser to `http://localhost:5173`
   - You'll land on the Workflow page by default

4. **Test Each Feature**:
   - **Step 1**: Click "Show Help" button
   - **Step 4**: Click help icon (?) next to any column
   - **Step 5**: Click "Show Explanations" button

---

## Future Enhancements

### Recommended Next Steps:

1. **Add Dimension Explanations**:
   - Explain what each DQ dimension means (Completeness, Validity, etc.)
   - Use the existing `/explain/dimension/{dimension_name}` endpoint

2. **Add Inline Tooltips**:
   - Hover tooltips for quick explanations
   - Full panels for detailed explanations

3. **Add Explanation History**:
   - Track which explanations users viewed
   - Provide "Learn More" links to documentation

4. **Add Export Explanations**:
   - Allow users to export explanations as PDF/Markdown
   - Include in audit reports

5. **Add Interactive Examples**:
   - Show sample data that would pass/fail rules
   - Visual examples of quality issues

---

## Troubleshooting

### Explanations Not Loading?

1. **Check Backend**: Ensure API server is running on port 8000
2. **Check Console**: Open browser DevTools and check for errors
3. **Check CORS**: Verify CORS is enabled in `api/main.py`
4. **Check Network**: Verify API calls are reaching the backend

### Styling Issues?

1. **Check Tailwind**: Ensure Tailwind CSS is properly configured
2. **Check Colors**: Verify Xoriant ORIAN colors are in `tailwind.config.js`
3. **Check Icons**: Ensure Lucide React icons are imported

---

## Summary

The explainability features are now **fully integrated** into the UI workflow:

✅ **Goal explanations** in Step 1 (Show Help button)
✅ **CDE explanations** in Step 4 (Help icon on each column)
✅ **Rule explanations** in Step 5 (Show Explanations button)

Users can now understand **why** the AI made specific recommendations at every critical decision point in the workflow.
