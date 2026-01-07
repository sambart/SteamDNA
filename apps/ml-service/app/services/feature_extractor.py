import numpy as np
import pandas as pd
from typing import List, Dict, Any
from collections import Counter


class FeatureExtractor:
    """Extract features from user gaming data for ML models"""

    def extract_user_features(
        self, user_games: List[Dict[str, Any]], games_info: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Extract comprehensive features from user's gaming data

        Returns:
            Dictionary containing feature vectors and metadata
        """
        if not user_games:
            return self._empty_features()

        # Convert to DataFrames for easier processing
        df_user_games = pd.DataFrame(user_games)
        df_games = pd.DataFrame(games_info)

        # Merge user games with game information
        df_merged = df_user_games.merge(
            df_games, left_on="appId", right_on="appId", how="left"
        )

        features = {
            "playtime_features": self._extract_playtime_features(df_merged),
            "genre_features": self._extract_genre_features(df_merged),
            "diversity_features": self._extract_diversity_features(df_merged),
            "achievement_features": self._extract_achievement_features(df_merged),
            "temporal_features": self._extract_temporal_features(df_merged),
        }

        # Combine all features into a single vector
        feature_vector = self._combine_features(features)

        return {
            "feature_vector": feature_vector.tolist(),
            "feature_details": features,
            "total_games": len(user_games),
            "total_playtime": df_merged["playtimeForever"].sum(),
        }

    def _extract_playtime_features(self, df: pd.DataFrame) -> Dict[str, float]:
        """Extract playtime-based features"""
        total_playtime = df["playtimeForever"].sum()
        played_games = df[df["playtimeForever"] > 0]

        return {
            "total_playtime_hours": total_playtime / 60.0,
            "avg_playtime_hours": (
                played_games["playtimeForever"].mean() / 60.0
                if len(played_games) > 0
                else 0
            ),
            "median_playtime_hours": (
                played_games["playtimeForever"].median() / 60.0
                if len(played_games) > 0
                else 0
            ),
            "max_playtime_hours": df["playtimeForever"].max() / 60.0,
            "playtime_std": df["playtimeForever"].std() / 60.0,
            "games_never_played_ratio": (
                len(df[df["playtimeForever"] == 0]) / len(df) if len(df) > 0 else 0
            ),
            "heavily_played_ratio": (
                len(df[df["playtimeForever"] > 3000]) / len(df) if len(df) > 0 else 0
            ),  # > 50 hours
        }

    def _extract_genre_features(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Extract genre preference features"""
        # Flatten genres array and count
        all_genres = []
        genre_playtime = {}

        for _, row in df.iterrows():
            if pd.notna(row.get("genres")) and row["genres"]:
                genres = row["genres"] if isinstance(row["genres"], list) else []
                playtime = row["playtimeForever"]

                for genre in genres:
                    all_genres.append(genre)
                    genre_playtime[genre] = genre_playtime.get(genre, 0) + playtime

        genre_counts = Counter(all_genres)
        top_genres = genre_counts.most_common(10)

        # Calculate genre diversity
        genre_entropy = self._calculate_entropy([count for _, count in top_genres])

        return {
            "top_genres": [genre for genre, _ in top_genres[:5]],
            "genre_counts": dict(top_genres),
            "genre_playtime": genre_playtime,
            "genre_diversity": genre_entropy,
            "unique_genres": len(genre_counts),
        }

    def _extract_diversity_features(self, df: pd.DataFrame) -> Dict[str, float]:
        """Extract game diversity features"""
        return {
            "unique_games": len(df),
            "free_games_ratio": (
                len(df[df["isFree"] == True]) / len(df) if len(df) > 0 else 0
            ),
            "avg_metacritic_score": df["metacriticScore"].mean()
            if "metacriticScore" in df.columns
            else 0,
        }

    def _extract_achievement_features(self, df: pd.DataFrame) -> Dict[str, float]:
        """Extract achievement-based features"""
        achievements_data = df["achievements"].dropna()

        if len(achievements_data) == 0:
            return {
                "avg_achievement_rate": 0,
                "total_achievements_unlocked": 0,
                "achievement_hunter_score": 0,
            }

        total_unlocked = 0
        total_possible = 0

        for achievement_json in achievements_data:
            if isinstance(achievement_json, dict):
                total_unlocked += achievement_json.get("unlockedAchievements", 0)
                total_possible += achievement_json.get("totalAchievements", 0)

        avg_achievement_rate = (
            (total_unlocked / total_possible * 100) if total_possible > 0 else 0
        )

        return {
            "avg_achievement_rate": avg_achievement_rate,
            "total_achievements_unlocked": total_unlocked,
            "achievement_hunter_score": avg_achievement_rate
            * len(achievements_data),  # Composite score
        }

    def _extract_temporal_features(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Extract time-based features"""
        recent_playtime = df["playtimeTwoWeeks"].sum() if "playtimeTwoWeeks" in df.columns else 0

        return {
            "recent_playtime_hours": recent_playtime / 60.0 if recent_playtime else 0,
            "active_recently": recent_playtime > 0,
        }

    def _calculate_entropy(self, counts: List[int]) -> float:
        """Calculate Shannon entropy for diversity measurement"""
        if not counts:
            return 0

        total = sum(counts)
        probabilities = [count / total for count in counts if count > 0]

        entropy = -sum(p * np.log2(p) for p in probabilities if p > 0)
        return entropy

    def _combine_features(self, features: Dict[str, Any]) -> np.ndarray:
        """Combine all feature dictionaries into a single feature vector"""
        vector = []

        # Playtime features (7 features)
        playtime = features["playtime_features"]
        vector.extend(
            [
                playtime["total_playtime_hours"],
                playtime["avg_playtime_hours"],
                playtime["median_playtime_hours"],
                playtime["max_playtime_hours"],
                playtime["playtime_std"],
                playtime["games_never_played_ratio"],
                playtime["heavily_played_ratio"],
            ]
        )

        # Genre features (2 features)
        genre = features["genre_features"]
        vector.extend([genre["genre_diversity"], genre["unique_genres"]])

        # Diversity features (3 features)
        diversity = features["diversity_features"]
        vector.extend(
            [
                diversity["unique_games"],
                diversity["free_games_ratio"],
                diversity["avg_metacritic_score"],
            ]
        )

        # Achievement features (3 features)
        achievement = features["achievement_features"]
        vector.extend(
            [
                achievement["avg_achievement_rate"],
                achievement["total_achievements_unlocked"],
                achievement["achievement_hunter_score"],
            ]
        )

        # Temporal features (1 feature)
        temporal = features["temporal_features"]
        vector.extend([temporal["recent_playtime_hours"]])

        # Replace NaN with 0
        vector = [0 if np.isnan(x) or x is None else x for x in vector]

        return np.array(vector, dtype=float)

    def _empty_features(self) -> Dict[str, Any]:
        """Return empty feature set for users with no games"""
        return {
            "feature_vector": [0] * 16,  # 16 total features
            "feature_details": {},
            "total_games": 0,
            "total_playtime": 0,
        }
