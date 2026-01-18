# 🎯 Explainability Features - Quick Visual Guide

## Where to Find Explainability in the UI

### 🌐 **Access the Application**
1. Open your browser to: `http://localhost:5173`
2. You'll land on the **Workflow** page (6-step process)

---

## 📍 Feature Locations

### **1. STEP 1: Define Goal** → Goal Explanations

```
┌─────────────────────────────────────────────────────────┐
│  🎯 Define Your Data Quality Goal       [Show Help] ← CLICK HERE  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Select Quality Goal Type:                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ 📊       │  │ 📋       │  │ 🤖       │             │
│  │ Standard │  │Regulatory│  │  AI/ML   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 💡 GOAL EXPLANATION PANEL (appears when you     │   │
│  │    click "Show Help")                            │   │
│  │                                                  │   │
│  │  • What this goal means                          │   │
│  │  • Recommended threshold                         │   │
│  │  • Use cases                                     │   │
│  │  • What to expect                                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**What to Do**: Click the **"Show Help"** button in the top-right corner

---

### **2. STEP 4: Identify CDEs** → CDE Explanations

```
┌─────────────────────────────────────────────────────────┐
│  ☑️  Identify Critical Data Elements                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☑ customer_id (string)    95%  [?] ← CLICK HERE │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☑ email (string)          88%  [?] ← CLICK HERE │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☑ purchase_amount (num)   92%  [?] ← CLICK HERE │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 💡 CDE EXPLANATION PANEL (appears when you       │   │
│  │    click the ? icon)                             │   │
│  │                                                  │   │
│  │  • Why this column is critical                   │   │
│  │  • Business impact level                         │   │
│  │  • Risk level                                    │   │
│  │  • Quality concerns                              │   │
│  │  • Recommended checks                            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**What to Do**: Click the **help icon (?)** next to any column name

---

### **3. STEP 5: Review Results** → Rule Explanations

```
┌─────────────────────────────────────────────────────────┐
│  👁️  Review Generated DQ Rules   [Show Explanations] ← CLICK HERE │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 💡 RULE EXPLANATION PANEL (appears when you      │   │
│  │    click "Show Explanations")                    │   │
│  │                                                  │   │
│  │  Why These Rules Were Selected:                  │   │
│  │  "Based on your goal and CDEs, we selected..."   │   │
│  │                                                  │   │
│  │  ✓ Selected Rules:        ✗ Not Applicable:     │   │
│  │  • NOT_NULL              • UNIQUE                │   │
│  │    (Completeness)          (Not needed)          │   │
│  │    Reason: Critical ID    Reason: Duplicates OK  │   │
│  │                                                  │   │
│  │  • REGEX_MATCH           • RANGE                 │   │
│  │    (Validity)              (Not numeric)         │   │
│  │    Reason: Email format   Reason: Text field     │   │
│  │                                                  │   │
│  │  Coverage Summary: 4 rules covering 3 dimensions │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Generated Rules:                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ customer_id | not_null | Completeness | Critical│   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ email | regex_match | Validity | High            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**What to Do**: Click the **"Show Explanations"** button in the top-right corner

---

## 🎨 Visual Indicators

### Color Coding:
- **Blue panels** = Goal explanations
- **Violet/Purple panels** = CDE explanations  
- **Blue/Indigo panels** = Rule explanations

### Icons:
- 💡 **Lightbulb** = Explanation panel
- ❓ **Help Circle** = Click for CDE explanation
- ℹ️ **Info** = Toggle help/explanations
- ✓ **Green checkmark** = Selected/Applied
- ✗ **Gray X** = Not applicable

---

## 🚀 Quick Test

### Test All Features in 2 Minutes:

1. **Navigate to Workflow**
   - Open `http://localhost:5173`
   - You're already on the Workflow page

2. **Test Goal Explanation** (Step 1)
   - Click **"Show Help"** button
   - Select different goal types (Standard, Regulatory, AI/ML)
   - See how explanations change

3. **Navigate to Step 4**
   - Click "Next" through steps 2 and 3
   - Or click "Identify CDEs" in the progress stepper

4. **Test CDE Explanation** (Step 4)
   - Click the **? icon** next to "customer_id"
   - Read the explanation
   - Click **? icon** next to "email"
   - See different explanation

5. **Navigate to Step 5**
   - Click "Next" or click "Review Results" in stepper

6. **Test Rule Explanation** (Step 5)
   - Click **"Show Explanations"** button
   - See selected vs not applicable rules
   - Read coverage summary

---

## 📱 Screenshots Reference

### What You'll See:

#### Goal Explanation Panel:
```
┌────────────────────────────────────────────┐
│ 💡 Standard Data Quality                   │
│                                            │
│ Focuses on operational data correctness... │
│                                            │
│ Threshold: 0.85    Approval: No            │
│                                            │
│ Use Cases:                                 │
│ • Daily reporting dashboards               │
│ • Operational analytics                    │
│                                            │
│ What to Expect:                            │
│ ✓ Automated quality checks                 │
│ ✓ Continuous monitoring                    │
└────────────────────────────────────────────┘
```

#### CDE Explanation Panel:
```
┌────────────────────────────────────────────┐
│ 💡 Why "customer_id" is Critical           │
│                                            │
│ This column uniquely identifies customers  │
│ and is essential for data integrity...     │
│                                            │
│ Business Impact: High    Risk: High        │
│                                            │
│ Quality Concerns:                          │
│ ⚠ Missing values break relationships       │
│ ⚠ Duplicates cause double-counting         │
│                                            │
│ Recommended: NOT_NULL | UNIQUE | FORMAT    │
└────────────────────────────────────────────┘
```

#### Rule Explanation Panel:
```
┌────────────────────────────────────────────┐
│ 💡 Why These Rules Were Selected           │
│                                            │
│ Based on your STANDARD_DQ goal and 4 CDEs  │
│                                            │
│ ✓ Selected:           ✗ Not Applicable:    │
│ NOT_NULL (Complete)   UNIQUE (Not needed)  │
│ REGEX (Validity)      RANGE (Wrong type)   │
│                                            │
│ Coverage: 4 rules, 3 dimensions            │
└────────────────────────────────────────────┘
```

---

## ✅ Success Checklist

After testing, you should have seen:

- [ ] Goal explanation panel with threshold and use cases
- [ ] CDE explanation for at least one column
- [ ] Rule explanation showing selected vs not applicable rules
- [ ] Color-coded panels (blue, violet, indigo)
- [ ] Icons (lightbulb, help circle, checkmarks)
- [ ] Smooth fade-in animations

---

## 🐛 Troubleshooting

### "Nothing happens when I click buttons"

**Check**:
1. Backend running? → `http://localhost:8000/docs`
2. Frontend running? → `http://localhost:5173`
3. Browser console errors? → Press F12, check Console tab

### "Explanations show 'undefined' or errors"

**Check**:
1. API endpoints working? → Visit `http://localhost:8000/explain/goal/STANDARD_DQ`
2. CORS enabled? → Check `api/main.py` has CORS middleware
3. Network tab? → Press F12, check Network tab for failed requests

### "Styling looks broken"

**Check**:
1. Tailwind CSS loaded? → Check browser DevTools Elements tab
2. Custom colors defined? → Check `ui/tailwind.config.js`
3. Icons imported? → Check `ui/src/pages/Workflow.jsx` imports

---

## 🎉 You're Done!

The explainability features are now visible and interactive in your UI. Users can understand **why** the AI made each recommendation throughout the entire workflow.

**Next Steps**:
- Share this with your team
- Gather feedback on explanations
- Customize explanations for your domain
- Add more explanation points as needed
