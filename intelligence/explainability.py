"""
Explainability Engine for OrianDQ.
Provides AI-powered explanations for CDE selection, rule recommendations, and quality goals.
"""
from typing import Dict, List, Optional, Any
from core.models_enhanced import QualityGoal, Severity, RuleDefinition
from datetime import datetime

class ExplainabilityEngine:
    """
    Generates human-readable explanations for DQ decisions.
    Helps users understand why CDEs were selected and which rules apply.
    """
    
    def __init__(self):
        # Knowledge base for explanations
        self.dimension_descriptions = {
            "Completeness": "Measures whether all required data is present",
            "Validity": "Ensures data conforms to defined formats and business rules",
            "Accuracy": "Verifies data correctly represents real-world values",
            "Consistency": "Checks data uniformity across systems and time",
            "Uniqueness": "Ensures no duplicate records exist",
            "Timeliness": "Validates data is current and available when needed",
            "Integrity": "Maintains referential relationships between data elements",
            "Auditability": "Ensures data changes are tracked and traceable"
        }
        
        self.goal_descriptions = {
            QualityGoal.STANDARD: {
                "title": "Standard Data Quality",
                "purpose": "Ensure operational data correctness for day-to-day business operations",
                "threshold": "85%",
                "workflow": "Continuous monitoring with automated remediation",
                "use_cases": [
                    "Daily reporting and analytics",
                    "Operational dashboards",
                    "Business intelligence",
                    "Standard ETL pipelines"
                ],
                "key_dimensions": ["Completeness", "Validity", "Consistency"],
                "approval_required": False,
                "characteristics": [
                    "Fast iteration cycles",
                    "Automated quality checks",
                    "Self-service remediation",
                    "Continuous improvement focus"
                ]
            },
            QualityGoal.REGULATORY: {
                "title": "Regulatory Data Quality",
                "purpose": "Ensure data defensibility and audit readiness for compliance requirements",
                "threshold": "95%",
                "workflow": "Human-in-the-loop with mandatory sign-offs",
                "use_cases": [
                    "Financial reporting (SOX, IFRS)",
                    "Regulatory submissions (BCBS, Basel III)",
                    "GDPR compliance",
                    "Healthcare compliance (HIPAA)"
                ],
                "key_dimensions": ["Accuracy", "Integrity", "Auditability", "Completeness"],
                "approval_required": True,
                "characteristics": [
                    "Immutable audit trail required",
                    "Steward approval mandatory",
                    "Higher quality thresholds (95%+)",
                    "Formal exception management",
                    "Compliance sign-off workflows"
                ]
            },
            QualityGoal.AI: {
                "title": "AI/ML Data Quality",
                "purpose": "Ensure model fitness, trust, and stability for machine learning applications",
                "threshold": "90%",
                "workflow": "Distribution validation with continuous drift monitoring",
                "use_cases": [
                    "Training ML models",
                    "Model inference pipelines",
                    "Feature engineering",
                    "AI/ML experimentation"
                ],
                "key_dimensions": ["Completeness", "Consistency", "Validity", "Timeliness"],
                "approval_required": False,
                "characteristics": [
                    "Distribution drift detection",
                    "Statistical validation",
                    "Label quality checks",
                    "Bias detection",
                    "Feature stability monitoring"
                ]
            }
        }
    
    def explain_goal(self, goal: QualityGoal) -> Dict[str, Any]:
        """
        Provide detailed explanation of a quality goal.
        
        Returns comprehensive information about what the goal means,
        why it matters, and what to expect.
        """
        goal_info = self.goal_descriptions.get(goal, {})
        
        return {
            "goal": goal.value,
            "title": goal_info.get("title", "Unknown Goal"),
            "purpose": goal_info.get("purpose", ""),
            "explanation": self._generate_goal_explanation(goal),
            "threshold": goal_info.get("threshold", "N/A"),
            "workflow_type": goal_info.get("workflow", ""),
            "use_cases": goal_info.get("use_cases", []),
            "key_dimensions": goal_info.get("key_dimensions", []),
            "approval_required": goal_info.get("approval_required", False),
            "characteristics": goal_info.get("characteristics", []),
            "what_to_expect": self._generate_expectations(goal),
            "success_criteria": self._generate_success_criteria(goal)
        }
    
    def explain_cde_selection(
        self, 
        column: str, 
        importance_score: float,
        data_type: str,
        goal: QualityGoal,
        statistics: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Explain why a column was selected as a Critical Data Element (CDE).
        
        Provides reasoning based on:
        - Importance score
        - Data type
        - Quality goal
        - Statistical analysis
        """
        # Determine importance level
        if importance_score >= 0.9:
            importance_level = "Critical"
            importance_reason = "This column is essential for your quality goal"
        elif importance_score >= 0.8:
            importance_level = "High"
            importance_reason = "This column significantly impacts data quality"
        elif importance_score >= 0.7:
            importance_level = "Medium"
            importance_reason = "This column contributes to overall quality"
        else:
            importance_level = "Low"
            importance_reason = "This column has minimal impact on quality"
        
        # Generate specific reasons based on data type and goal
        reasons = self._generate_cde_reasons(column, data_type, goal, importance_score)
        
        # Generate recommendations
        recommendations = self._generate_cde_recommendations(column, importance_score, goal)
        
        explanation = {
            "column": column,
            "importance_score": importance_score,
            "importance_level": importance_level,
            "selected": importance_score >= 0.75,  # Threshold for selection
            "primary_reason": importance_reason,
            "detailed_reasons": reasons,
            "data_type": data_type,
            "goal_alignment": self._explain_goal_alignment(data_type, goal),
            "recommendations": recommendations,
            "risk_if_ignored": self._explain_risk(column, importance_score, goal)
        }
        
        # Add statistics if available
        if statistics:
            explanation["data_insights"] = self._analyze_statistics(statistics)
        
        return explanation
    
    def explain_rule_selection(
        self,
        selected_rules: List[RuleDefinition],
        all_possible_rules: List[str],
        goal: QualityGoal,
        cdes: List[str]
    ) -> Dict[str, Any]:
        """
        Explain which DQ rules were selected and why others were not applicable.
        
        Provides transparency into the rule selection logic.
        """
        # Categorize rules
        selected_rule_types = [r.rule_type for r in selected_rules]
        not_selected = [r for r in all_possible_rules if r not in selected_rule_types]
        
        explanation = {
            "total_rules_selected": len(selected_rules),
            "goal": goal.value,
            "selection_criteria": self._get_selection_criteria(goal),
            "selected_rules": [
                self._explain_single_rule(rule, cdes, goal) 
                for rule in selected_rules
            ],
            "not_applicable_rules": [
                self._explain_why_not_selected(rule_type, goal, cdes)
                for rule_type in not_selected
            ],
            "coverage_analysis": self._analyze_coverage(selected_rules, goal),
            "recommendations": self._generate_rule_recommendations(selected_rules, goal)
        }
        
        return explanation
    
    def explain_rule_failure(
        self,
        rule: RuleDefinition,
        failure_count: int,
        total_rows: int,
        sample_failures: Optional[List] = None
    ) -> Dict[str, Any]:
        """
        Explain why a rule failed and what it means.
        """
        failure_rate = (failure_count / total_rows * 100) if total_rows > 0 else 0
        
        return {
            "rule_name": rule.name,
            "rule_type": rule.rule_type,
            "column": rule.column,
            "failure_count": failure_count,
            "total_rows": total_rows,
            "failure_rate": f"{failure_rate:.2f}%",
            "severity": rule.severity.value,
            "explanation": self._explain_failure_impact(rule, failure_rate),
            "business_impact": self._explain_business_impact(rule, failure_rate),
            "recommended_actions": self._recommend_remediation(rule, failure_rate),
            "sample_failures": sample_failures[:5] if sample_failures else []
        }
    
    # ==================== Private Helper Methods ====================
    
    def _generate_goal_explanation(self, goal: QualityGoal) -> str:
        """Generate natural language explanation of the goal."""
        explanations = {
            QualityGoal.STANDARD: (
                "This goal focuses on maintaining operational data quality for day-to-day business needs. "
                "It emphasizes continuous monitoring and rapid issue resolution to keep your data pipelines "
                "running smoothly. The threshold is set at 85% to balance quality with operational efficiency."
            ),
            QualityGoal.REGULATORY: (
                "This goal is designed for data that must meet strict regulatory and compliance requirements. "
                "It enforces higher quality standards (95%+) and requires human oversight through steward "
                "approvals and formal sign-offs. Every quality check is audited and traceable for compliance purposes."
            ),
            QualityGoal.AI: (
                "This goal ensures your data is fit for machine learning and AI applications. "
                "It goes beyond basic quality checks to include distribution validation, drift detection, "
                "and statistical stability. The focus is on maintaining model performance and trustworthiness."
            )
        }
        return explanations.get(goal, "Quality goal explanation not available.")
    
    def _generate_expectations(self, goal: QualityGoal) -> List[str]:
        """Generate what users should expect with this goal."""
        expectations = {
            QualityGoal.STANDARD: [
                "Automated quality checks run continuously",
                "Issues are flagged for engineering teams",
                "Self-service remediation workflows",
                "Real-time quality dashboards",
                "No formal approvals required"
            ],
            QualityGoal.REGULATORY: [
                "Steward review required for all changes",
                "Formal sign-off workflows",
                "Immutable audit trail maintained",
                "Higher quality thresholds enforced",
                "Exception management with justifications",
                "Compliance reporting available"
            ],
            QualityGoal.AI: [
                "Distribution drift monitoring",
                "Statistical validation of features",
                "Label quality checks",
                "Bias detection alerts",
                "Model fitness certification",
                "Continuous monitoring post-deployment"
            ]
        }
        return expectations.get(goal, [])
    
    def _generate_success_criteria(self, goal: QualityGoal) -> List[str]:
        """Define what success looks like for this goal."""
        criteria = {
            QualityGoal.STANDARD: [
                "85%+ of datasets pass quality checks",
                "Issues resolved within 48 hours",
                "Less than 10% exception rate",
                "Continuous improvement trend"
            ],
            QualityGoal.REGULATORY: [
                "95%+ of datasets pass quality checks",
                "100% of datasets have valid sign-offs",
                "Zero unresolved compliance issues",
                "Complete audit trail for all changes",
                "All exceptions properly justified and approved"
            ],
            QualityGoal.AI: [
                "90%+ of datasets certified fit for ML",
                "Drift detected within 24 hours",
                "Zero bias in protected attributes",
                "Model performance stable over time",
                "Feature distributions within expected ranges"
            ]
        }
        return criteria.get(goal, [])
    
    def _generate_cde_reasons(
        self, 
        column: str, 
        data_type: str, 
        goal: QualityGoal,
        importance_score: float
    ) -> List[str]:
        """Generate specific reasons why this column is important."""
        reasons = []
        
        # Reason based on importance score
        if importance_score >= 0.9:
            reasons.append(f"Critical importance score ({importance_score:.0%}) indicates this column is essential for data quality")
        elif importance_score >= 0.8:
            reasons.append(f"High importance score ({importance_score:.0%}) shows significant impact on quality metrics")
        
        # Reason based on data type
        if data_type == "string" and "id" in column.lower():
            reasons.append("Identifier columns are critical for data integrity and uniqueness")
        elif data_type == "string" and "email" in column.lower():
            reasons.append("Contact information requires validation to ensure communication effectiveness")
        elif data_type == "numeric" and any(term in column.lower() for term in ["amount", "price", "value"]):
            reasons.append("Financial/numeric columns directly impact business calculations and decisions")
        elif data_type == "date":
            reasons.append("Temporal columns are essential for time-based analysis and compliance")
        
        # Reason based on goal
        if goal == QualityGoal.REGULATORY:
            reasons.append("Required for regulatory compliance and audit trail")
        elif goal == QualityGoal.AI:
            reasons.append("Critical feature for ML model performance and predictions")
        elif goal == QualityGoal.STANDARD:
            reasons.append("Essential for operational reporting and business intelligence")
        
        # Column name-based reasoning
        if "status" in column.lower():
            reasons.append("Status fields are key for workflow management and business logic")
        elif "created" in column.lower() or "modified" in column.lower():
            reasons.append("Audit timestamps are important for data lineage and compliance")
        
        return reasons if reasons else ["Selected based on statistical analysis and business rules"]
    
    def _generate_cde_recommendations(
        self, 
        column: str, 
        importance_score: float,
        goal: QualityGoal
    ) -> List[str]:
        """Generate recommendations for this CDE."""
        recommendations = []
        
        if importance_score >= 0.9:
            recommendations.append("✅ Strongly recommend including this column in quality checks")
            recommendations.append("⚠️ Monitor this column closely - failures will significantly impact quality score")
        elif importance_score >= 0.8:
            recommendations.append("✅ Recommend including this column for comprehensive quality coverage")
        elif importance_score >= 0.7:
            recommendations.append("💡 Consider including if you want thorough quality validation")
        else:
            recommendations.append("ℹ️ Optional - low impact on overall quality score")
        
        if goal == QualityGoal.REGULATORY:
            recommendations.append("📋 Ensure proper documentation for audit purposes")
        elif goal == QualityGoal.AI:
            recommendations.append("🤖 Monitor for distribution drift after model deployment")
        
        return recommendations
    
    def _explain_goal_alignment(self, data_type: str, goal: QualityGoal) -> str:
        """Explain how this column aligns with the quality goal."""
        alignments = {
            (QualityGoal.STANDARD, "string"): "Text fields are validated for completeness and format",
            (QualityGoal.STANDARD, "numeric"): "Numeric values are checked for range and validity",
            (QualityGoal.REGULATORY, "string"): "Text fields require strict validation for compliance",
            (QualityGoal.REGULATORY, "numeric"): "Financial values must be accurate and auditable",
            (QualityGoal.AI, "string"): "Categorical features are validated for consistency",
            (QualityGoal.AI, "numeric"): "Numeric features are checked for distribution stability"
        }
        return alignments.get((goal, data_type), "Standard quality validation applies")
    
    def _explain_risk(self, column: str, importance_score: float, goal: QualityGoal) -> str:
        """Explain the risk of ignoring this column."""
        if importance_score >= 0.9:
            return f"⚠️ HIGH RISK: Ignoring {column} could lead to significant data quality issues and impact business decisions"
        elif importance_score >= 0.8:
            return f"⚠️ MEDIUM RISK: Quality issues in {column} may affect downstream processes"
        elif importance_score >= 0.7:
            return f"ℹ️ LOW RISK: Minor impact if {column} is not monitored"
        else:
            return f"✓ MINIMAL RISK: {column} has limited impact on overall quality"
    
    def _analyze_statistics(self, statistics: Dict) -> Dict[str, str]:
        """Analyze column statistics and provide insights."""
        insights = {}
        
        if "null_count" in statistics and statistics["null_count"] > 0:
            null_pct = (statistics["null_count"] / statistics.get("total_rows", 1)) * 100
            insights["completeness"] = f"{null_pct:.1f}% of values are missing - completeness check recommended"
        
        if "unique_count" in statistics:
            unique_pct = (statistics["unique_count"] / statistics.get("total_rows", 1)) * 100
            if unique_pct > 95:
                insights["uniqueness"] = "High uniqueness - may be an identifier column"
            elif unique_pct < 10:
                insights["cardinality"] = "Low cardinality - categorical column with few distinct values"
        
        return insights
    
    def _get_selection_criteria(self, goal: QualityGoal) -> Dict[str, str]:
        """Get the criteria used for rule selection."""
        criteria = {
            QualityGoal.STANDARD: "Rules selected based on operational data quality needs",
            QualityGoal.REGULATORY: "Rules selected to meet compliance and audit requirements",
            QualityGoal.AI: "Rules selected to ensure ML model fitness and stability"
        }
        return {
            "primary_criteria": criteria.get(goal, "Standard quality criteria"),
            "cde_alignment": "Rules applied only to Critical Data Elements",
            "severity_based": "Rule severity matches column importance",
            "goal_specific": "Rules tailored to quality goal requirements"
        }
    
    def _explain_single_rule(
        self, 
        rule: RuleDefinition, 
        cdes: List[str],
        goal: QualityGoal
    ) -> Dict[str, Any]:
        """Explain why a specific rule was selected."""
        return {
            "rule_id": rule.rule_id,
            "rule_type": rule.rule_type,
            "column": rule.column,
            "dimension": rule.dimension,
            "severity": rule.severity.value,
            "reason": self._get_rule_reason(rule, goal),
            "what_it_checks": self._describe_rule_check(rule),
            "why_it_matters": self._explain_rule_importance(rule, goal)
        }
    
    def _get_rule_reason(self, rule: RuleDefinition, goal: QualityGoal) -> str:
        """Get the reason why this rule was selected."""
        reasons = {
            "not_null": f"Ensures {rule.column} is always populated - critical for {self.dimension_descriptions.get(rule.dimension, 'data quality')}",
            "regex_match": f"Validates {rule.column} format - ensures data consistency and validity",
            "range": f"Checks {rule.column} is within acceptable bounds - prevents invalid values",
            "unique": f"Ensures {rule.column} has no duplicates - maintains data integrity"
        }
        return reasons.get(rule.rule_type, f"Validates {rule.dimension} for {rule.column}")
    
    def _describe_rule_check(self, rule: RuleDefinition) -> str:
        """Describe what the rule actually checks."""
        descriptions = {
            "not_null": f"Verifies that every row has a value in {rule.column}",
            "regex_match": f"Validates that {rule.column} matches the expected format pattern",
            "range": f"Ensures {rule.column} values fall within the specified minimum and maximum",
            "unique": f"Confirms that {rule.column} has no duplicate values across all rows"
        }
        return descriptions.get(rule.rule_type, f"Performs {rule.rule_type} validation on {rule.column}")
    
    def _explain_rule_importance(self, rule: RuleDefinition, goal: QualityGoal) -> str:
        """Explain why this rule matters for the goal."""
        if goal == QualityGoal.REGULATORY:
            return f"Required for compliance - {rule.dimension} is a mandatory dimension for regulatory reporting"
        elif goal == QualityGoal.AI:
            return f"Critical for ML - {rule.dimension} ensures model input quality and prediction accuracy"
        else:
            return f"Important for operations - {rule.dimension} maintains data reliability for business processes"
    
    def _explain_why_not_selected(
        self, 
        rule_type: str, 
        goal: QualityGoal,
        cdes: List[str]
    ) -> Dict[str, str]:
        """Explain why a rule type was not selected."""
        reasons = {
            "unique": "Not applicable - no identifier columns selected as CDEs",
            "range": "Not applicable - no numeric columns requiring range validation",
            "regex_match": "Not applicable - no text columns requiring format validation",
            "not_null": "Not applicable - all critical columns already have completeness checks",
            "referential_integrity": "Not applicable - no foreign key relationships in selected CDEs",
            "statistical_outlier": "Not applicable - standard quality goal doesn't require outlier detection",
            "drift_detection": "Not applicable - only required for AI/ML quality goals",
            "bias_check": "Not applicable - only required for AI/ML quality goals with protected attributes"
        }
        
        return {
            "rule_type": rule_type,
            "reason": reasons.get(rule_type, "Not required for current quality goal and CDE selection"),
            "when_applicable": self._when_rule_applicable(rule_type, goal)
        }
    
    def _when_rule_applicable(self, rule_type: str, goal: QualityGoal) -> str:
        """Explain when this rule would be applicable."""
        applicability = {
            "drift_detection": "Applicable when goal is AI/ML and continuous monitoring is enabled",
            "bias_check": "Applicable when goal is AI/ML and dataset contains protected attributes",
            "statistical_outlier": "Applicable when anomaly detection is required",
            "referential_integrity": "Applicable when foreign key relationships exist between tables"
        }
        return applicability.get(rule_type, "Applicable when relevant columns are selected as CDEs")
    
    def _analyze_coverage(self, selected_rules: List[RuleDefinition], goal: QualityGoal) -> Dict[str, Any]:
        """Analyze the coverage of selected rules."""
        dimensions_covered = list(set(r.dimension for r in selected_rules))
        required_dimensions = self.goal_descriptions.get(goal, {}).get("key_dimensions", [])
        
        coverage_pct = (len(dimensions_covered) / len(required_dimensions) * 100) if required_dimensions else 100
        
        return {
            "dimensions_covered": dimensions_covered,
            "required_dimensions": required_dimensions,
            "coverage_percentage": f"{coverage_pct:.0f}%",
            "is_sufficient": coverage_pct >= 75,
            "missing_dimensions": [d for d in required_dimensions if d not in dimensions_covered]
        }
    
    def _generate_rule_recommendations(
        self, 
        selected_rules: List[RuleDefinition],
        goal: QualityGoal
    ) -> List[str]:
        """Generate recommendations based on selected rules."""
        recommendations = []
        
        if len(selected_rules) < 3:
            recommendations.append("⚠️ Consider adding more rules for comprehensive quality coverage")
        
        severities = [r.severity for r in selected_rules]
        if Severity.CRITICAL not in severities and goal == QualityGoal.REGULATORY:
            recommendations.append("💡 Consider marking key compliance rules as CRITICAL severity")
        
        dimensions = set(r.dimension for r in selected_rules)
        if "Completeness" not in dimensions:
            recommendations.append("💡 Consider adding completeness checks - they're fundamental for data quality")
        
        if goal == QualityGoal.AI and "Consistency" not in dimensions:
            recommendations.append("🤖 For AI/ML, consistency checks help maintain model performance")
        
        if not recommendations:
            recommendations.append("✅ Rule selection looks comprehensive for your quality goal")
        
        return recommendations
    
    def _explain_failure_impact(self, rule: RuleDefinition, failure_rate: float) -> str:
        """Explain the impact of a rule failure."""
        if failure_rate > 10:
            return f"⚠️ HIGH IMPACT: {failure_rate:.1f}% failure rate significantly affects data quality"
        elif failure_rate > 5:
            return f"⚠️ MEDIUM IMPACT: {failure_rate:.1f}% failure rate requires attention"
        else:
            return f"ℹ️ LOW IMPACT: {failure_rate:.1f}% failure rate is within acceptable range"
    
    def _explain_business_impact(self, rule: RuleDefinition, failure_rate: float) -> str:
        """Explain the business impact of the failure."""
        impacts = {
            "Completeness": "Missing data can lead to incomplete reports and incorrect business decisions",
            "Validity": "Invalid data formats cause downstream processing errors and system failures",
            "Accuracy": "Inaccurate data results in wrong business insights and poor decision-making",
            "Consistency": "Inconsistent data creates confusion and reduces trust in analytics",
            "Uniqueness": "Duplicate records cause double-counting and inflated metrics",
            "Integrity": "Broken relationships lead to orphaned records and data inconsistencies"
        }
        return impacts.get(rule.dimension, "Data quality issues can impact business operations")
    
    def _recommend_remediation(self, rule: RuleDefinition, failure_rate: float) -> List[str]:
        """Recommend remediation actions."""
        actions = []
        
        if failure_rate > 10:
            actions.append("🔴 URGENT: Investigate root cause immediately")
            actions.append("🔴 Consider quarantining affected data")
        elif failure_rate > 5:
            actions.append("🟡 Review data source and transformation logic")
        
        actions.append(f"📊 Analyze failure patterns in {rule.column}")
        actions.append(f"🔧 Update data validation at source if possible")
        
        if rule.severity == Severity.CRITICAL:
            actions.append("⚠️ Escalate to data steward for approval")
        
        return actions
