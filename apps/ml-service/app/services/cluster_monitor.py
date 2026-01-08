from typing import Dict, List, Any
from collections import defaultdict
from datetime import datetime
import numpy as np


class ClusterMonitor:
    """Monitor and track clustering distribution and statistics"""

    def __init__(self):
        self.cluster_counts = defaultdict(int)
        self.total_predictions = 0
        self.confidence_scores = defaultdict(list)
        self.feature_stats = defaultdict(lambda: {"sum": 0, "count": 0, "min": float('inf'), "max": float('-inf')})
        self.last_reset = datetime.now()

    def record_prediction(
        self,
        cluster_id: int,
        confidence: float,
        feature_vector: List[float] = None,
    ):
        """Record a clustering prediction"""
        self.cluster_counts[cluster_id] += 1
        self.total_predictions += 1
        self.confidence_scores[cluster_id].append(confidence)

        # Track feature statistics if provided
        if feature_vector:
            for idx, value in enumerate(feature_vector):
                stats = self.feature_stats[idx]
                stats["sum"] += value
                stats["count"] += 1
                stats["min"] = min(stats["min"], value)
                stats["max"] = max(stats["max"], value)

    def get_distribution(self) -> Dict[str, Any]:
        """Get current cluster distribution"""
        if self.total_predictions == 0:
            return {
                "total_predictions": 0,
                "distribution": {},
                "last_reset": self.last_reset.isoformat(),
            }

        distribution = {}
        for cluster_id, count in self.cluster_counts.items():
            percentage = (count / self.total_predictions) * 100
            avg_confidence = (
                np.mean(self.confidence_scores[cluster_id])
                if self.confidence_scores[cluster_id]
                else 0.0
            )

            distribution[str(cluster_id)] = {
                "count": count,
                "percentage": round(percentage, 2),
                "avg_confidence": round(float(avg_confidence), 3),
            }

        return {
            "total_predictions": self.total_predictions,
            "distribution": distribution,
            "last_reset": self.last_reset.isoformat(),
        }

    def get_feature_statistics(self) -> Dict[str, Any]:
        """Get feature value statistics"""
        feature_names = [
            # Playtime features (11)
            "total_playtime_hours",
            "avg_playtime_hours",
            "median_playtime_hours",
            "max_playtime_hours",
            "playtime_std",
            "games_never_played_ratio",
            "heavily_played_ratio",
            "avg_session_length",
            "deep_dive_game_count",
            "top_game_concentration",
            "repeat_play_intensity",
            # Genre features (8)
            "genre_diversity",
            "unique_genres",
            "story_rpg_ratio",
            "single_player_ratio",
            "strategy_simulation_ratio",
            "competitive_pvp_ratio",
            "casual_indie_ratio",
            "multiplayer_coop_ratio",
            # Diversity features (4)
            "unique_games",
            "free_games_ratio",
            "avg_metacritic_score",
            "new_release_purchase_rate",
            # Achievement features (3)
            "avg_achievement_rate",
            "total_achievements_unlocked",
            "achievement_hunter_score",
            # Temporal features (1)
            "recent_playtime_hours",
        ]

        stats = {}
        for idx, name in enumerate(feature_names):
            if idx in self.feature_stats:
                feature_stat = self.feature_stats[idx]
                avg = feature_stat["sum"] / feature_stat["count"] if feature_stat["count"] > 0 else 0
                stats[name] = {
                    "avg": round(float(avg), 3),
                    "min": round(float(feature_stat["min"]) if feature_stat["min"] != float('inf') else 0, 3),
                    "max": round(float(feature_stat["max"]) if feature_stat["max"] != float('-inf') else 0, 3),
                    "count": feature_stat["count"],
                }

        return stats

    def get_persona_quality_metrics(self) -> Dict[str, Any]:
        """Get quality metrics for persona classification"""
        if self.total_predictions == 0:
            return {
                "overall_avg_confidence": 0.0,
                "low_confidence_rate": 0.0,
                "cluster_balance_score": 0.0,
            }

        # Calculate overall average confidence
        all_confidences = []
        for scores in self.confidence_scores.values():
            all_confidences.extend(scores)

        overall_avg_confidence = np.mean(all_confidences) if all_confidences else 0.0

        # Calculate low confidence rate (confidence < 0.5)
        low_confidence_count = sum(1 for c in all_confidences if c < 0.5)
        low_confidence_rate = (
            (low_confidence_count / len(all_confidences)) * 100
            if all_confidences
            else 0.0
        )

        # Calculate cluster balance score (using entropy)
        # Higher entropy = more balanced distribution
        if self.total_predictions > 0:
            probabilities = [
                count / self.total_predictions
                for count in self.cluster_counts.values()
            ]
            entropy = -sum(p * np.log2(p) for p in probabilities if p > 0)
            max_entropy = np.log2(len(self.cluster_counts)) if len(self.cluster_counts) > 0 else 1
            balance_score = (entropy / max_entropy) * 100 if max_entropy > 0 else 0
        else:
            balance_score = 0.0

        return {
            "overall_avg_confidence": round(float(overall_avg_confidence), 3),
            "low_confidence_rate": round(float(low_confidence_rate), 2),
            "cluster_balance_score": round(float(balance_score), 2),
            "total_samples": len(all_confidences),
        }

    def reset(self):
        """Reset all monitoring statistics"""
        self.cluster_counts.clear()
        self.total_predictions = 0
        self.confidence_scores.clear()
        self.feature_stats.clear()
        self.last_reset = datetime.now()


# Global monitor instance
cluster_monitor = ClusterMonitor()
