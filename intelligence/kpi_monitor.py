"""
KPI Monitoring and Metrics Tracking.
Aligned with W3C DQV, DAMA-DMBOK, and regulatory standards (BCBS, SOX, GDPR).
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pathlib import Path
import json

from core.models_enhanced import KPIMetrics, QualityGoal, FitnessScore

class KPIMonitor:
    """
    Monitors and calculates platform-level KPIs.
    Tracks DQ maturity progression: Reactive → Managed → Governed → Trusted → Intelligent
    """
    
    def __init__(self, storage_dir: Path = Path("storage")):
        self.storage_dir = storage_dir
        self.kpi_file = storage_dir / "kpi_metrics.jsonl"
        self.storage_dir.mkdir(parents=True, exist_ok=True)
    
    def calculate_current_kpis(self) -> KPIMetrics:
        """
        Calculate current platform KPIs.
        In a real system, this would query a database.
        """
        # Mock data - in production, query actual metrics
        total_datasets = self._get_total_datasets()
        fitness_scores = self._get_all_fitness_scores()
        exceptions = self._get_active_exceptions()
        
        # Calculate core KPIs
        datasets_fit = sum(1 for score in fitness_scores if score.passed)
        datasets_fit_pct = (datasets_fit / total_datasets * 100) if total_datasets > 0 else 0
        
        # Mean Time to Quality (MTTQ)
        mttq = self._calculate_mean_time_to_quality()
        
        # Exception leakage
        exception_leakage = self._calculate_exception_leakage()
        
        # Regulatory readiness
        regulatory_readiness = self._calculate_regulatory_readiness()
        
        # AI Trust Index
        ai_trust_index = self._calculate_ai_trust_index()
        
        # Supporting metrics
        rules_24h = self._get_rules_executed_24h()
        failed_rules_24h = self._get_failed_rules_24h()
        avg_fitness = sum(score.overall_score for score in fitness_scores) / len(fitness_scores) if fitness_scores else 0
        
        kpis = KPIMetrics(
            datasets_fit_for_use_pct=datasets_fit_pct,
            mean_time_to_quality_hours=mttq,
            exception_leakage_pct=exception_leakage,
            regulatory_readiness_pct=regulatory_readiness,
            ai_trust_index=ai_trust_index,
            total_datasets=total_datasets,
            active_exceptions=len(exceptions),
            rules_executed_24h=rules_24h,
            failed_rules_24h=failed_rules_24h,
            avg_fitness_score=avg_fitness
        )
        
        # Log KPIs
        self._log_kpis(kpis)
        
        return kpis
    
    def get_kpi_trend(self, days: int = 30) -> List[KPIMetrics]:
        """
        Get KPI trend over the last N days.
        """
        if not self.kpi_file.exists():
            return []
        
        cutoff_date = datetime.now() - timedelta(days=days)
        trends = []
        
        with open(self.kpi_file, "r") as f:
            for line in f:
                try:
                    kpi = KPIMetrics.model_validate_json(line)
                    if kpi.timestamp >= cutoff_date:
                        trends.append(kpi)
                except Exception:
                    continue
        
        return sorted(trends, key=lambda x: x.timestamp)
    
    def get_maturity_level(self) -> Dict:
        """
        Assess DQ maturity level based on KPIs.
        Levels: Reactive → Managed → Governed → Trusted → Intelligent
        """
        kpis = self.calculate_current_kpis()
        
        # Maturity scoring
        score = 0
        criteria = []
        
        # Level 1: Reactive (0-20 points)
        if kpis.total_datasets > 0:
            score += 10
            criteria.append("Datasets being monitored")
        
        # Level 2: Managed (21-40 points)
        if kpis.rules_executed_24h > 0:
            score += 10
            criteria.append("Active rule execution")
        if kpis.datasets_fit_for_use_pct > 50:
            score += 10
            criteria.append("Majority of datasets tracked")
        
        # Level 3: Governed (41-60 points)
        if kpis.exception_leakage_pct < 20:
            score += 10
            criteria.append("Exception management in place")
        if kpis.mean_time_to_quality_hours < 48:
            score += 10
            criteria.append("Rapid issue resolution")
        
        # Level 4: Trusted (61-80 points)
        if kpis.regulatory_readiness_pct > 80:
            score += 10
            criteria.append("High regulatory readiness")
        if kpis.datasets_fit_for_use_pct > 85:
            score += 10
            criteria.append("High fitness rate")
        
        # Level 5: Intelligent (81-100 points)
        if kpis.ai_trust_index > 90:
            score += 10
            criteria.append("AI-ready data")
        if kpis.avg_fitness_score > 0.95:
            score += 10
            criteria.append("Exceptional quality")
        
        # Determine level
        if score >= 81:
            level = "INTELLIGENT"
            description = "AI-ready data with proactive quality management"
        elif score >= 61:
            level = "TRUSTED"
            description = "Certified datasets with strong governance"
        elif score >= 41:
            level = "GOVERNED"
            description = "Controlled quality with formal processes"
        elif score >= 21:
            level = "MANAGED"
            description = "Tracked failures with basic monitoring"
        else:
            level = "REACTIVE"
            description = "Ad-hoc quality fixes"
        
        return {
            "maturity_level": level,
            "score": score,
            "max_score": 100,
            "description": description,
            "criteria_met": criteria,
            "next_level_requirements": self._get_next_level_requirements(level)
        }
    
    def get_domain_health(self) -> Dict[str, Dict]:
        """
        Calculate average DQ score by business domain.
        """
        # Mock implementation - would query database in production
        domains = {
            "Finance": {"avg_score": 0.92, "datasets": 15, "issues": 3},
            "Customer": {"avg_score": 0.88, "datasets": 20, "issues": 8},
            "Operations": {"avg_score": 0.85, "datasets": 12, "issues": 5},
            "Marketing": {"avg_score": 0.90, "datasets": 10, "issues": 2}
        }
        
        return domains
    
    def get_goal_metrics(self) -> Dict[str, Dict]:
        """
        Get metrics broken down by quality goal.
        """
        return {
            "STANDARD_DQ": {
                "total_datasets": 30,
                "fit_for_use": 26,
                "fitness_pct": 86.7,
                "avg_score": 0.89
            },
            "REGULATORY_DQ": {
                "total_datasets": 10,
                "fit_for_use": 9,
                "fitness_pct": 90.0,
                "avg_score": 0.93,
                "signed_off": 8
            },
            "AI_DQ": {
                "total_datasets": 15,
                "fit_for_use": 13,
                "fitness_pct": 86.7,
                "avg_score": 0.91,
                "certified": 12
            }
        }
    
    # ==================== Private Helper Methods ====================
    
    def _get_total_datasets(self) -> int:
        """Get total number of monitored datasets."""
        # Mock - would query database
        return 55
    
    def _get_all_fitness_scores(self) -> List[FitnessScore]:
        """Get all current fitness scores."""
        # Mock - would query database
        scores = []
        for i in range(55):
            scores.append(FitnessScore(
                dataset_id=f"ds_{i:03d}",
                goal=QualityGoal.STANDARD,
                overall_score=0.85 + (i % 15) * 0.01,
                dimension_scores={},
                threshold=0.85,
                passed=(i % 10) != 0  # 90% pass rate
            ))
        return scores
    
    def _get_active_exceptions(self) -> List:
        """Get all active exceptions."""
        # Mock - would query database
        return [{"id": f"exc_{i}"} for i in range(12)]
    
    def _calculate_mean_time_to_quality(self) -> float:
        """Calculate average time from issue detection to resolution."""
        # Mock - would calculate from actual issue tracking
        return 36.5  # hours
    
    def _calculate_exception_leakage(self) -> float:
        """Calculate percentage of exceptions that recur."""
        # Mock - would analyze exception history
        return 15.3  # percent
    
    def _calculate_regulatory_readiness(self) -> float:
        """Calculate percentage of regulatory datasets with valid sign-offs."""
        # Mock - would query sign-off records
        return 85.0  # percent
    
    def _calculate_ai_trust_index(self) -> float:
        """Calculate percentage of AI datasets certified fit."""
        # Mock - would query AI fitness certifications
        return 88.0  # percent
    
    def _get_rules_executed_24h(self) -> int:
        """Get number of rules executed in last 24 hours."""
        # Mock - would query execution logs
        return 1250
    
    def _get_failed_rules_24h(self) -> int:
        """Get number of rules that failed in last 24 hours."""
        # Mock - would query failure logs
        return 87
    
    def _log_kpis(self, kpis: KPIMetrics):
        """Log KPIs to storage for trend analysis."""
        with open(self.kpi_file, "a") as f:
            f.write(kpis.model_dump_json() + "\n")
    
    def _get_next_level_requirements(self, current_level: str) -> List[str]:
        """Get requirements to reach next maturity level."""
        requirements = {
            "REACTIVE": [
                "Implement systematic rule execution",
                "Track dataset fitness scores",
                "Establish baseline monitoring"
            ],
            "MANAGED": [
                "Implement exception management",
                "Reduce mean time to quality below 48 hours",
                "Achieve >70% fitness rate"
            ],
            "GOVERNED": [
                "Implement regulatory sign-off workflows",
                "Achieve >80% regulatory readiness",
                "Maintain <20% exception leakage"
            ],
            "TRUSTED": [
                "Achieve >90% AI trust index",
                "Maintain >95% average fitness score",
                "Implement proactive drift monitoring"
            ],
            "INTELLIGENT": [
                "Maintain current excellence",
                "Continuous improvement",
                "Share best practices"
            ]
        }
        return requirements.get(current_level, [])

    def export_prometheus_metrics(self) -> str:
        """
        Export current KPIs in Prometheus format.
        For integration with monitoring systems.
        """
        kpis = self.calculate_current_kpis()
        timestamp = int(kpis.timestamp.timestamp() * 1000)
        
        metrics = f"""
# HELP dq_datasets_fit_for_use_pct Percentage of datasets meeting fitness threshold
# TYPE dq_datasets_fit_for_use_pct gauge
dq_datasets_fit_for_use_pct {kpis.datasets_fit_for_use_pct} {timestamp}

# HELP dq_mean_time_to_quality_hours Average time from issue detection to resolution
# TYPE dq_mean_time_to_quality_hours gauge
dq_mean_time_to_quality_hours {kpis.mean_time_to_quality_hours} {timestamp}

# HELP dq_exception_leakage_pct Percentage of exceptions that recur
# TYPE dq_exception_leakage_pct gauge
dq_exception_leakage_pct {kpis.exception_leakage_pct} {timestamp}

# HELP dq_regulatory_readiness_pct Percentage of regulatory datasets signed off
# TYPE dq_regulatory_readiness_pct gauge
dq_regulatory_readiness_pct {kpis.regulatory_readiness_pct} {timestamp}

# HELP dq_ai_trust_index Percentage of AI datasets certified fit
# TYPE dq_ai_trust_index gauge
dq_ai_trust_index {kpis.ai_trust_index} {timestamp}

# HELP dq_active_exceptions Current number of active exceptions
# TYPE dq_active_exceptions gauge
dq_active_exceptions {kpis.active_exceptions} {timestamp}

# HELP dq_rules_executed_24h Rules executed in last 24 hours
# TYPE dq_rules_executed_24h counter
dq_rules_executed_24h {kpis.rules_executed_24h} {timestamp}

# HELP dq_failed_rules_24h Rules failed in last 24 hours
# TYPE dq_failed_rules_24h counter
dq_failed_rules_24h {kpis.failed_rules_24h} {timestamp}

# HELP dq_avg_fitness_score Average fitness score across all datasets
# TYPE dq_avg_fitness_score gauge
dq_avg_fitness_score {kpis.avg_fitness_score} {timestamp}
"""
        return metrics.strip()
