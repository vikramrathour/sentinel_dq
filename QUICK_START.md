# Sentinel-DQ Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Python 3.13+
- Node.js 24+
- Git

---

## 📥 Installation

### 1. Install Backend Dependencies
```bash
# Navigate to project root
cd sentinel_dq

# Install Python packages
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies
```bash
# Navigate to UI folder
cd ui

# Install Node packages
npm install
```

---

## ▶️ Running the Application

### Option A: Two Terminal Windows

**Terminal 1 - Backend API:**
```bash
# From project root
uvicorn api.main:app --reload --port 8000
```

**Terminal 2 - Frontend UI:**
```bash
# From ui folder
cd ui
npm run dev
```

### Option B: PowerShell (Windows)

**Terminal 1:**
```powershell
uvicorn api.main:app --reload --port 8000
```

**Terminal 2:**
```powershell
cd ui; npm run dev
```

---

## 🌐 Access the Application

Once both servers are running:

1. **Open your browser**
2. **Navigate to:** `http://localhost:5173`
3. **You'll see the Workflow page** - Start here!

### URLs
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 🎯 Your First Workflow

### Step-by-Step Tutorial

#### 1️⃣ Define Goal (30 seconds)
```
Goal ID: urn:goal:my_first_quality_check
Description: Testing Sentinel-DQ workflow
Threshold: 90%
```
Click **"Next Step"**

#### 2️⃣ Upload Dataset (15 seconds)
- Use the sample file: `test.csv` (in project root)
- Drag it to the upload zone OR click "Browse Files"
- Confirm file details
Click **"Next Step"**

#### 3️⃣ Generate Analysis (5 seconds)
- Click **"Start Analysis"**
- Wait for progress bar to complete
- Review statistics
Click **"Next Step"**

#### 4️⃣ Identify CDEs (20 seconds)
- Review AI-recommended columns (pre-selected)
- Toggle any columns you want to include/exclude
- Check importance scores
Click **"Next Step"**

#### 5️⃣ Review Results (30 seconds)
- Review generated DQ rules
- Click **"Verify Rules"**
- Wait for verification
- See "Verification Passed!" message
Click **"Next Step"**

#### 6️⃣ Export Rules (10 seconds)
- Select format: **YAML** (recommended)
- Review summary
- Click **"Export as YAML"**
- File downloads automatically

**🎉 Congratulations!** You've completed your first workflow in ~2 minutes!

---

## 📊 Exploring Other Features

### Dashboard
**URL:** http://localhost:5173/dashboard

**What you'll see:**
- 4 metric cards (Datasets, Nodes, Dependencies, Health)
- Trust heatmap with color-coded nodes
- Recent activity log

**Try this:**
- Hover over nodes to see details
- Check health percentages
- View recent quality checks

---

### AI Goals
**URL:** http://localhost:5173/goals

**What you'll see:**
- Existing goals (if any)
- "New Goal" button

**Try this:**
1. Click **"New Goal"**
2. Fill in:
   - Goal ID: `urn:goal:test_goal`
   - DoD Threshold: `0.95`
   - KPI: `f1_score:0.85`
3. Click **"Save Goal"**
4. See your new goal card appear

---

### Quality Gate
**URL:** http://localhost:5173/verify

**What you'll see:**
- Configuration panel (left)
- Results panel (right)

**Try this:**
1. Enter Dataset: `urn:dataset:demo`
2. Select Goal from dropdown
3. Click **"Verify Quality Gate"**
4. See trust certificate result

---

### Audit Ledger
**URL:** http://localhost:5173/ledger

**What you'll see:**
- Table of all inference records
- Timestamps, goals, datasets, scores, status

**Try this:**
- Run a few verifications first
- Come back to see the history
- Check trust status badges

---

## 🎨 UI Tour

### Workflow Page (Home)
```
┌────────────────────────────────────────────┐
│  Sentinel-DQ Workflow                      │
│  Powered by Xoriant ORIAN AI Platform      │
│                                   Step 1/6  │
└────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  [●]──[○]──[○]──[○]──[○]──[○]               │
│  Goal Upload Analyze CDE Review Export      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│                                              │
│         [Step Content Goes Here]            │
│                                              │
└─────────────────────────────────────────────┘

[Previous]                          [Next Step]
```

### Dashboard Page
```
┌──────────────────────────────────────────────┐
│ 🌟 Sentinel-DQ  │  Data Quality Dashboard    │
│ Powered by      │                            │
│ ORIAN          │  ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│                │  │ 12 │ │ 45 │ │ 23 │ │94% ││
│ 🔄 Workflow    │  └────┘ └────┘ └────┘ └────┘│
│ 📊 Dashboard   │                            │
│ 🎯 AI Goals    │  Trust Heatmap             │
│ ✅ Quality Gate│  ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│ 📜 Audit Ledger│  │ 🟢 │ │ 🟡 │ │ 🟢 │ │ 🟢 ││
│                │  └────┘ └────┘ └────┘ └────┘│
└──────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Issue: Backend won't start
**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
pip install -r requirements.txt
```

---

### Issue: Frontend won't start
**Error:** `Cannot find module 'vite'`

**Solution:**
```bash
cd ui
npm install
```

---

### Issue: Port already in use
**Error:** `Address already in use: 8000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

---

### Issue: Blank page
**Problem:** Page loads but shows nothing

**Solution:**
1. Check browser console (F12)
2. Verify backend is running (`http://localhost:8000/docs`)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh (Ctrl+Shift+R)

---

### Issue: CORS errors
**Error:** `Access-Control-Allow-Origin`

**Solution:**
- Backend already has CORS enabled
- Make sure backend is running on port 8000
- Check `api/main.py` for CORS middleware

---

## 📝 Sample Data

### Create a Test CSV
```bash
# Create test.csv in project root
echo "id,name,email,age,status
1,John Doe,john@example.com,30,active
2,Jane Smith,jane@example.com,25,active
3,Bob Johnson,bob@example.com,35,inactive" > test.csv
```

### Use Existing Demo Scripts
```bash
# Run engine demo
python engine_demo.py

# Run impact demo
python impact_demo.py

# Run ledger demo
python ledger_demo.py

# Run full API demo
python api_ui_demo.py
```

---

## 🎓 Learning Path

### For First-Time Users
1. ✅ Complete "Your First Workflow" (above)
2. ✅ Explore Dashboard
3. ✅ Create a custom goal
4. ✅ Run quality gate verification
5. ✅ Check audit ledger

### For Power Users
1. ✅ Read `UI_UPGRADE_GUIDE.md`
2. ✅ Read `UI_FEATURES_SUMMARY.md`
3. ✅ Explore API docs (`/docs`)
4. ✅ Customize rules in `rules.yaml`
5. ✅ Integrate with CI/CD

### For Developers
1. ✅ Read `README.md`
2. ✅ Read `ui/README.md`
3. ✅ Explore codebase structure
4. ✅ Run demo scripts
5. ✅ Customize UI components

---

## 🎯 Common Use Cases

### Use Case 1: Daily Data Quality Check
```bash
# 1. Start servers
uvicorn api.main:app --reload --port 8000 &
cd ui && npm run dev &

# 2. Open workflow
# 3. Upload today's data
# 4. Follow 6 steps
# 5. Export rules
# 6. Apply to production
```

### Use Case 2: CI/CD Integration
```bash
# In your CI/CD pipeline
curl -X POST http://localhost:8000/verify \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_id": "urn:dataset:production",
    "goal_id": "urn:goal:deployment_gate"
  }'
```

### Use Case 3: Compliance Audit
```bash
# 1. Go to Audit Ledger
# 2. Filter by date range
# 3. Export to CSV
# 4. Share with auditors
```

---

## 📚 Additional Resources

### Documentation
- `README.md` - Main project documentation
- `UI_UPGRADE_GUIDE.md` - Detailed UI changes
- `UI_FEATURES_SUMMARY.md` - Feature breakdown
- `ui/README.md` - Frontend-specific docs

### API Documentation
- Interactive API docs: `http://localhost:8000/docs`
- OpenAPI schema: `http://localhost:8000/openapi.json`

### Code Examples
- `engine_demo.py` - Validation engine
- `impact_demo.py` - PSI calculation
- `ledger_demo.py` - Inference logging
- `api_ui_demo.py` - Full workflow

---

## 🎨 Customization Quick Tips

### Change Colors
Edit `ui/tailwind.config.js`:
```javascript
'xoriant-navy': '#YOUR_COLOR'
```

### Change Logo
Edit `ui/src/components/Layout.jsx`:
```jsx
<YourLogo />
```

### Add New Step
Edit `ui/src/pages/Workflow.jsx`:
```javascript
const steps = [
  // ... existing steps
  { id: 7, name: 'Your Step', icon: YourIcon, color: 'from-blue-600' }
];
```

---

## 🚀 Next Steps

### Immediate (Today)
- [ ] Complete first workflow
- [ ] Explore all pages
- [ ] Create a custom goal
- [ ] Export rules

### Short-term (This Week)
- [ ] Integrate with your data pipeline
- [ ] Customize branding
- [ ] Train team members
- [ ] Set up monitoring

### Long-term (This Month)
- [ ] Deploy to production
- [ ] Set up CI/CD integration
- [ ] Create rule templates
- [ ] Establish governance process

---

## 💬 Getting Help

### In-App Help
- Look for 💡 tip boxes in the workflow
- Hover over elements for tooltips
- Check inline documentation

### Documentation
- Read the guides in this repo
- Check API docs at `/docs`
- Review code comments

### Community
- Open GitHub issues
- Contact Xoriant support
- Join user forums (coming soon)

---

## ✅ Checklist

Before you start, make sure you have:
- [ ] Python 3.13+ installed
- [ ] Node.js 24+ installed
- [ ] Dependencies installed (pip + npm)
- [ ] Both servers running
- [ ] Browser open to `localhost:5173`

Ready? **Let's go!** 🚀

---

**Welcome to Sentinel-DQ!**  
**Powered by Xoriant ORIAN AI Platform**  
**Version 2.0.0 - January 2026**

---

## 🎉 Success Indicators

You'll know everything is working when you see:

✅ Workflow page loads with 6-step progress bar  
✅ Xoriant branding (navy blue colors)  
✅ Smooth animations and transitions  
✅ File upload works (drag-and-drop)  
✅ Analysis generates statistics  
✅ Rules are created automatically  
✅ Export downloads a file  
✅ Dashboard shows heatmap  
✅ Sidebar navigation works  
✅ API responds at `/docs`  

**If all ✅ are checked, you're ready to go!** 🎊
