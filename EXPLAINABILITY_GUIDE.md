# Sentinel-DQ Explainability Guide

## 🎯 Overview

Sentinel-DQ now includes comprehensive AI-powered explanations that help users understand:
- **Why** specific columns were selected as Critical Data Elements (CDEs)
- **What** each quality goal means and why it matters
- **Which** DQ rules were selected and why others don't apply
- **How** the workflow operates for each goal

---

## 🚀 New Explainability Features

### 1. Goal Explanations

**Endpoint:** `GET /explain/goal/{goal}`

Get detailed information about what a quality goal means, why it matters, and what to expect.

**Example:**
```bash
curl http://localhost:8000/explain/goal/REGULATORY_DQ
```

**Response:**
```json
{
  "goal": "REGULATORY_DQ",
  "title": "Regulatory Data Quality",
  "purpose": "Ensure data defensibility and audit readiness for compliance requirements",
  "explanation": "This goal is designed for data that must meet strict regulatory...",
  "threshold": "95%",
  "workflow_type": "Human-in-the-loop with mandatory sign-offs",
  "use_cases": [
    "Financial reporting (SOX, IFRS)",
    "Regulatory submissions (BCBS, Basel III)",
    "GDPR compliance",
    "Healthcare compliance (HIPAA)"
  ],
  "key_dimensions": ["Accuracy", "Integrity", "Auditability", "Completeness"],
  "approval_required": true,
  "characteristics": [
    "Immutable audit trail required",
    "Steward approval mandatory",
    "Higher quality thresholds (95%+)",
    "Formal exception management"
  ],
  "what_to_expect": [
    "Steward review required for all changes",
    "Formal sign-off workflows",
    "Immutable audit trail maintained"
  ],
  "success_criteria": [
    "95%+ of datasets pass quality checks",
    "100% of datasets have valid sign-offs",
    "Zero unresolved compliance issues"
  ]
}
```

---

### 2. CDE Selection Explanations

**Endpoint:** `POST /explain/cde`

Understand why a column was selected (or not selected) as a Critical Data Element.

**Example Request:**
```json
{
  "column": "customer_id",
  "importance_score": 0.95,
  "data_type": "string",
  "goal": "STANDARD_DQ",
  "statistics": {
    "null_count": 0,
    "total_rows": 10000,
    "unique_count": 10000
  }
}
```

**Response:**
```json
{
  "column": "customer_id",
  "importance_score": 0.95,
  "importance_level": "Critical",
  "selected": true,
  "primary_reason": "This column is essential for your quality goal",
  "detailed_reasons": [
    "Critical importance score (95%) indicates this column is essential for data quality",
    "Identifier columns are critical for data integrity and uniqueness",
    "Essential for operational reporting and business intelligence"
  ],
  "data_type": "string",
  "goal_alignment": "Text fields are validated for completeness and format",
  "recommendations": [
    "✅ Strongly recommend including this column in quality checks",
    "⚠️ Monitor this column closely - failures will significantly impact quality score"
  ],
  "risk_if_ignored": "⚠️ HIGH RISK: Ignoring customer_id could lead to significant data quality issues",
  "data_insights": {
    "completeness": "0.0% of values are missing - completeness check recommended",
    "uniqueness": "High uniqueness - may be an identifier column"
  }
}
```

---

### 3. Rule Selection Explanations

**Endpoint:** `POST /explain/rules`

Understand which DQ rules were selected and why others don't apply.

**Example Request:**
```json
{
  "selected_rules": [
    {
      "rule_id": "rule_001",
      "name": "customer_id_not_null",
      "description": "Customer ID must not be null",
      "column": "customer_id",
      "rule_type": "not_null",
      "dimension": "Completeness",
      "severity": "HIGH",
      "goal": "STANDARD_DQ"
    }
  ],
  "all_possible_rules": ["not_null", "unique", "regex_match", "range", "drift_detection"],
  "goal": "STANDARD_DQ",
  "cdes": ["customer_id", "email", "purchase_amount"]
}
```

**Response:**
```json
{
  "total_rules_selected": 1,
  "goal": "STANDARD_DQ",
  "selection_criteria": {
    "primary_criteria": "Rules selected based on operational data quality needs",
    "cde_alignment": "Rules applied only to Critical Data Elements",
    "severity_based": "Rule severity matches column importance",
    "goal_specific": "Rules tailored to quality goal requirements"
  },
  "selected_rules": [
    {
      "rule_id": "rule_001",
      "rule_type": "not_null",
      "column": "customer_id",
      "dimension": "Completeness",
      "severity": "HIGH",
      "reason": "Ensures customer_id is always populated - critical for Completeness",
      "what_it_checks": "Verifies that every row has a value in customer_id",
      "why_it_matters": "Important for operations - Completeness maintains data reliability"
    }
  ],
  "not_applicable_rules": [
    {
      "rule_type": "drift_detection",
      "reason": "Not applicable - only required for AI/ML quality goals",
      "when_applicable": "Applicable when goal is AI/ML and continuous monitoring is enabled"
    }
  ],
  "coverage_analysis": {
    "dimensions_covered": ["Completeness"],
    "required_dimensions": ["Completeness", "Validity"],
    "coverage_percentage": "50%",
    "is_sufficient": false,
    "missing_dimensions": ["Validity"]
  },
  "recommendations": [
    "💡 Consider adding completeness checks - they're fundamental for data quality"
  ]
}
```

---

### 4. Dimension Explanations

**Endpoint:** `GET /explain/dimension/{dimension}`

Learn what each data quality dimension means and why it matters.

**Example:**
```bash
curl http://localhost:8000/explain/dimension/Completeness
```

**Response:**
```json
{
  "dimension": "Completeness",
  "definition": "Measures whether all required data is present",
  "importance": "Missing data leads to incomplete analysis and incorrect conclusions",
  "examples": [
    "Checking for null values in required fields",
    "Ensuring all mandatory columns are populated",
    "Validating record counts match expectations"
  ],
  "metrics": [
    "Null count / Total count",
    "Missing value percentage",
    "Record completeness score"
  ]
}
```

---

### 5. Workflow Explanations

**Endpoint:** `GET /explain/workflow/{goal}`

Understand the workflow steps for each quality goal.

**Example:**
```bash
curl http://localhost:8000/explain/workflow/AI_DQ
```

**Response:**
```json
{
  "name": "AI/ML DQ Workflow",
  "steps": [
    {
      "step": 1,
      "name": "Register Dataset",
      "description": "Dataset registered with ML metadata",
      "duration": "< 1 minute",
      "automated": true
    },
    {
      "step": 2,
      "name": "Semantic & Label Validation",
      "description": "Validate feature semantics and label quality",
      "duration": "3-5 minutes",
      "automated": true
    }
  ],
  "total_time": "10-20 minutes (initial), continuous monitoring",
  "approval_required": false,
  "characteristics": [
    "Statistical validation",
    "Distribution monitoring",
    "Drift detection"
  ]
}
```

---

### 6. Help Endpoints

#### CDE Selection Help
**Endpoint:** `GET /explain/help/cde-selection`

Get guidance on how CDE selection works.

#### Rule Types Help
**Endpoint:** `GET /explain/help/rule-types`

Learn about available rule types and when to use them.

---

## 🎨 UI Integration Examples

### Display Goal Explanation in Workflow Step 1

```javascript
// Fetch goal explanation
const response = await fetch(`/explain/goal/${selectedGoal}`);
const explanation = await response.json();

// Display in UI
<div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
  <h3 className="font-bold text-blue-900">{explanation.title}</h3>
  <p className="text-blue-800 mt-2">{explanation.explanation}</p>
  
  <div className="mt-4">
    <h4 className="font-semibold text-blue-900">What to Expect:</h4>
    <ul className="list-disc list-inside text-blue-800">
      {explanation.what_to_expect.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
  
  <div className="mt-4">
    <h4 className="font-semibold text-blue-900">Success Criteria:</h4>
    <ul className="list-disc list-inside text-blue-800">
      {explanation.success_criteria.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
</div>
```

### Display CDE Explanation in Workflow Step 4

```javascript
// For each column, fetch explanation
const response = await fetch('/explain/cde', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    column: 'customer_id',
    importance_score: 0.95,
    data_type: 'string',
    goal: 'STANDARD_DQ'
  })
});
const explanation = await response.json();

// Display with column
<div className="border-l-4 border-violet-500 bg-violet-50 p-4 rounded">
  <div className="flex items-center gap-2 mb-2">
    <span className="font-bold">{explanation.column}</span>
    <span className="px-2 py-1 bg-violet-600 text-white rounded text-xs">
      {explanation.importance_level}
    </span>
  </div>
  
  <p className="text-sm text-violet-900 mb-2">{explanation.primary_reason}</p>
  
  <div className="text-xs text-violet-800">
    <strong>Why this matters:</strong>
    <ul className="list-disc list-inside mt-1">
      {explanation.detailed_reasons.map(reason => (
        <li key={reason}>{reason}</li>
      ))}
    </ul>
  </div>
  
  <div className="mt-2 text-xs">
    {explanation.recommendations.map(rec => (
      <div key={rec} className="text-violet-700">{rec}</div>
    ))}
  </div>
</div>
```

### Display Rule Explanation in Workflow Step 5

```javascript
// Fetch rule explanations
const response = await fetch('/explain/rules', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    selected_rules: rules,
    all_possible_rules: ['not_null', 'unique', 'regex_match', 'range'],
    goal: 'STANDARD_DQ',
    cdes: ['customer_id', 'email']
  })
});
const explanation = await response.json();

// Display selected rules with explanations
<div>
  <h3 className="font-bold mb-4">Selected Rules ({explanation.total_rules_selected})</h3>
  
  {explanation.selected_rules.map(rule => (
    <div key={rule.rule_id} className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <span className="font-bold">{rule.column}</span>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
          {rule.dimension}
        </span>
      </div>
      
      <p className="text-sm text-gray-700 mb-2">{rule.reason}</p>
      
      <div className="text-xs text-gray-600">
        <div><strong>What it checks:</strong> {rule.what_it_checks}</div>
        <div><strong>Why it matters:</strong> {rule.why_it_matters}</div>
      </div>
    </div>
  ))}
  
  <div className="mt-6">
    <h4 className="font-semibold mb-2">Rules Not Applicable:</h4>
    {explanation.not_applicable_rules.map(rule => (
      <div key={rule.rule_type} className="text-sm text-gray-600 mb-1">
        <strong>{rule.rule_type}:</strong> {rule.reason}
      </div>
    ))}
  </div>
  
  <div className="mt-4 bg-blue-50 p-3 rounded">
    <strong>Coverage Analysis:</strong>
    <div className="text-sm">
      {explanation.coverage_analysis.coverage_percentage} coverage
      {!explanation.coverage_analysis.is_sufficient && (
        <span className="text-orange-600 ml-2">
          ⚠️ Consider adding rules for: {explanation.coverage_analysis.missing_dimensions.join(', ')}
        </span>
      )}
    </div>
  </div>
</div>
```

---

## 📊 Benefits

### For Users
- ✅ **Transparency** - Understand why decisions were made
- ✅ **Education** - Learn about data quality concepts
- ✅ **Confidence** - Trust the AI recommendations
- ✅ **Control** - Make informed decisions about overrides

### For Data Stewards
- ✅ **Justification** - Explain quality decisions to stakeholders
- ✅ **Documentation** - Built-in explanations for audit purposes
- ✅ **Training** - Help team members understand DQ concepts

### For Compliance
- ✅ **Auditability** - Clear reasoning for all quality decisions
- ✅ **Defensibility** - Justify rule selections to auditors
- ✅ **Transparency** - Show how quality thresholds are determined

---

## 🎓 Usage Examples

### Example 1: Explain Goal Before Starting Workflow

```bash
# Get explanation for regulatory goal
curl http://localhost:8000/explain/goal/REGULATORY_DQ | jq .

# User sees:
# - What regulatory quality means
# - Why 95% threshold
# - What approvals are needed
# - Expected timeline
```

### Example 2: Understand CDE Selection

```bash
# Explain why email column is important
curl -X POST http://localhost:8000/explain/cde \
  -H "Content-Type: application/json" \
  -d '{
    "column": "email",
    "importance_score": 0.88,
    "data_type": "string",
    "goal": "STANDARD_DQ"
  }' | jq .

# User sees:
# - Importance level: High
# - Reasons: Contact info validation needed
# - Recommendations: Include for comprehensive coverage
# - Risk: Medium if ignored
```

### Example 3: Understand Rule Selection

```bash
# Get explanation for selected rules
curl -X POST http://localhost:8000/explain/rules \
  -H "Content-Type: application/json" \
  -d @rules_request.json | jq .

# User sees:
# - Why each rule was selected
# - What each rule checks
# - Why other rules don't apply
# - Coverage analysis
# - Recommendations for improvement
```

---

## 🔧 Technical Implementation

### Explainability Engine
- **Location:** `intelligence/explainability.py`
- **Purpose:** Generate human-readable explanations
- **Features:**
  - Goal descriptions
  - CDE reasoning
  - Rule selection logic
  - Dimension definitions
  - Workflow explanations

### API Endpoints
- **Location:** `api/explanations.py`
- **Routes:** `/explain/*`
- **Integration:** Included in main API

---

## 📚 Next Steps

### Immediate
- [x] Explainability engine created
- [x] API endpoints implemented
- [x] Documentation complete

### Short-term (Recommended)
- [ ] Integrate explanations into UI workflow
- [ ] Add explanation tooltips throughout UI
- [ ] Create interactive help system
- [ ] Add "Why?" buttons next to AI recommendations

### Long-term
- [ ] Machine learning for better explanations
- [ ] User feedback on explanation quality
- [ ] Personalized explanations based on user role
- [ ] Multi-language support

---

## 🎉 Summary

Sentinel-DQ now provides comprehensive explanations for:

✅ **Quality Goals** - What they mean and why they matter  
✅ **CDE Selection** - Why columns are important  
✅ **Rule Selection** - Which rules apply and why  
✅ **Dimensions** - What each quality aspect measures  
✅ **Workflows** - How each goal's process works  
✅ **Help** - Guidance on concepts and best practices  

**Result:** Users can now understand and trust the AI-powered recommendations, leading to better data quality outcomes.

---

**Version:** 2.0  
**Last Updated:** January 2026  
**Powered by:** Xoriant ORIAN AI Platform
