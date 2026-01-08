import numpy as np
import pandas as pd
from typing import List, Dict, Any
from collections import Counter
from datetime import datetime, timedelta


class FeatureExtractor:
    """Extract features from user gaming data for ML models"""

    # Genre categorization for persona detection
    STORY_RPG_GENRES = ['RPG', 'Adventure', 'Story Rich', 'Narrative', 'Visual Novel']
    STRATEGY_SIMULATION_GENRES = ['Strategy', 'Simulation', 'Management', 'Turn-Based Strategy', 'RTS']
    COMPETITIVE_PVP_GENRES = ['PvP', 'Competitive', 'MOBA', 'FPS', 'Battle Royale', 'Fighting', 'Tactical Shooter']
    MULTIPLAYER_COOP_GENRES = ['Multiplayer', 'Co-op', 'Online Co-Op', 'Local Co-Op', 'Party Game']
    CASUAL_INDIE_GENRES = ['Casual', 'Indie', 'Relaxing', 'Puzzle', 'Family Friendly']
    SINGLE_PLAYER_GENRES = ['Single-player', 'Singleplayer']

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

        playtime_std = df["playtimeForever"].std() / 60.0
        playtime_std = 0.0 if pd.isna(playtime_std) else playtime_std

        avg_playtime = played_games["playtimeForever"].mean() / 60.0 if len(played_games) > 0 else 0
        avg_playtime = 0.0 if pd.isna(avg_playtime) else avg_playtime

        median_playtime = played_games["playtimeForever"].median() / 60.0 if len(played_games) > 0 else 0
        median_playtime = 0.0 if pd.isna(median_playtime) else median_playtime

        max_playtime = df["playtimeForever"].max() / 60.0
        max_playtime = 0.0 if pd.isna(max_playtime) else max_playtime

        # New features for persona detection
        # Deep dive game count (100+ hours)
        deep_dive_count = len(df[df["playtimeForever"] > 6000])  # > 100 hours

        # Top game concentration (top 5 games playtime / total playtime)
        sorted_playtime = df["playtimeForever"].sort_values(ascending=False)
        top_5_playtime = sorted_playtime.head(5).sum()
        top_game_concentration = (top_5_playtime / total_playtime) if total_playtime > 0 else 0

        # Repeat play intensity (top 1 game / total playtime)
        top_1_playtime = sorted_playtime.iloc[0] if len(sorted_playtime) > 0 else 0
        repeat_play_intensity = (top_1_playtime / total_playtime) if total_playtime > 0 else 0

        # Estimate average session length
        # Using median as proxy for typical session (more robust than mean)
        avg_session_length = median_playtime  # Simplified estimate

        return {
            "total_playtime_hours": float(total_playtime / 60.0),
            "avg_playtime_hours": float(avg_playtime),
            "median_playtime_hours": float(median_playtime),
            "max_playtime_hours": float(max_playtime),
            "playtime_std": float(playtime_std),
            "games_never_played_ratio": float(
                len(df[df["playtimeForever"] == 0]) / len(df) if len(df) > 0 else 0
            ),
            "heavily_played_ratio": float(
                len(df[df["playtimeForever"] > 3000]) / len(df) if len(df) > 0 else 0
            ),  # > 50 hours
            # New features
            "avg_session_length": float(avg_session_length),
            "deep_dive_game_count": float(deep_dive_count),
            "top_game_concentration": float(top_game_concentration),
            "repeat_play_intensity": float(repeat_play_intensity),
        }

    def _extract_genre_features(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Extract genre preference features"""
        # Flatten genres array and count
        all_genres = []
        genre_playtime = {}
        total_playtime = df["playtimeForever"].sum()

        for _, row in df.iterrows():
            genres_value = row.get("genres")
            # Check if genres exists and is not empty (handle both list and numpy array)
            if genres_value is not None and not (isinstance(genres_value, float) and pd.isna(genres_value)):
                genres = genres_value if isinstance(genres_value, list) else []
                # Additional check for non-empty list
                if len(genres) > 0:
                    playtime = row["playtimeForever"]

                    for genre in genres:
                        all_genres.append(genre)
                        genre_playtime[genre] = genre_playtime.get(genre, 0) + playtime

        genre_counts = Counter(all_genres)
        top_genres = genre_counts.most_common(10)

        # Calculate genre diversity
        genre_entropy = self._calculate_entropy([count for _, count in top_genres])

        # New features: Genre category ratios
        story_rpg_playtime = sum(genre_playtime.get(g, 0) for g in self.STORY_RPG_GENRES)
        strategy_sim_playtime = sum(genre_playtime.get(g, 0) for g in self.STRATEGY_SIMULATION_GENRES)
        competitive_playtime = sum(genre_playtime.get(g, 0) for g in self.COMPETITIVE_PVP_GENRES)
        multiplayer_coop_playtime = sum(genre_playtime.get(g, 0) for g in self.MULTIPLAYER_COOP_GENRES)
        casual_indie_playtime = sum(genre_playtime.get(g, 0) for g in self.CASUAL_INDIE_GENRES)
        single_player_playtime = sum(genre_playtime.get(g, 0) for g in self.SINGLE_PLAYER_GENRES)

        return {
            "top_genres": [genre for genre, _ in top_genres[:5]],
            "genre_counts": dict(top_genres),
            "genre_playtime": genre_playtime,
            "genre_diversity": genre_entropy,
            "unique_genres": len(genre_counts),
            # New persona-specific features
            "story_rpg_ratio": float(story_rpg_playtime / total_playtime if total_playtime > 0 else 0),
            "single_player_ratio": float(single_player_playtime / total_playtime if total_playtime > 0 else 0),
            "strategy_simulation_ratio": float(strategy_sim_playtime / total_playtime if total_playtime > 0 else 0),
            "competitive_pvp_ratio": float(competitive_playtime / total_playtime if total_playtime > 0 else 0),
            "casual_indie_ratio": float(casual_indie_playtime / total_playtime if total_playtime > 0 else 0),
            "multiplayer_coop_ratio": float(multiplayer_coop_playtime / total_playtime if total_playtime > 0 else 0),
        }

    def _extract_diversity_features(self, df: pd.DataFrame) -> Dict[str, float]:
        """Extract game diversity features"""
        avg_metacritic = df["metacriticScore"].mean() if "metacriticScore" in df.columns else 0
        avg_metacritic = 0.0 if pd.isna(avg_metacritic) else float(avg_metacritic)

        # New feature: New release purchase rate
        # Games released within the last year
        current_date = datetime.now()
        one_year_ago = current_date - timedelta(days=365)

        new_release_count = 0
        if "releaseDate" in df.columns:
            for release_date in df["releaseDate"]:
                if release_date is not None and not pd.isna(release_date):
                    # Handle both string and datetime objects
                    if isinstance(release_date, str):
                        try:
                            release_dt = pd.to_datetime(release_date)
                            if release_dt >= one_year_ago:
                                new_release_count += 1
                        except (ValueError, TypeError, pd.errors.ParserError) as e:
                            # Skip invalid date strings
                            continue
                    elif isinstance(release_date, (datetime, pd.Timestamp)):
                        if pd.Timestamp(release_date) >= one_year_ago:
                            new_release_count += 1

        new_release_rate = new_release_count / len(df) if len(df) > 0 else 0

        return {
            "unique_games": float(len(df)),
            "free_games_ratio": float(
                len(df[df["isFree"] == True]) / len(df) if len(df) > 0 else 0
            ),
            "avg_metacritic_score": avg_metacritic,
            "new_release_purchase_rate": float(new_release_rate),
        }

    def _extract_achievement_features(self, df: pd.DataFrame) -> Dict[str, float]:
        """Extract achievement-based features"""
        achievements_data = df["achievements"].dropna()

        if len(achievements_data) == 0:
            return {
                "avg_achievement_rate": 0.0,
                "total_achievements_unlocked": 0.0,
                "achievement_hunter_score": 0.0,
            }

        total_unlocked = 0
        total_possible = 0

        for achievement_json in achievements_data:
            if isinstance(achievement_json, dict):
                total_unlocked += achievement_json.get("unlockedAchievements", 0)
                total_possible += achievement_json.get("totalAchievements", 0)

        avg_achievement_rate = (
            (total_unlocked / total_possible * 100) if total_possible > 0 else 0.0
        )

        return {
            "avg_achievement_rate": float(avg_achievement_rate),
            "total_achievements_unlocked": float(total_unlocked),
            "achievement_hunter_score": float(avg_achievement_rate * len(achievements_data)),  # Composite score
        }

    def _extract_temporal_features(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Extract time-based features"""
        recent_playtime = df["playtimeTwoWeeks"].sum() if "playtimeTwoWeeks" in df.columns else 0
        recent_playtime = 0 if pd.isna(recent_playtime) else recent_playtime

        return {
            "recent_playtime_hours": float(recent_playtime / 60.0 if recent_playtime else 0),
            "active_recently": bool(recent_playtime > 0),
        }

    def _calculate_entropy(self, counts: List[int]) -> float:
        """Calculate Shannon entropy for diversity measurement"""
        if not counts:
            return 0.0

        total = sum(counts)
        if total == 0:
            return 0.0

        probabilities = [count / total for count in counts if count > 0]

        entropy = -sum(p * np.log2(p) for p in probabilities if p > 0)
        entropy = 0.0 if np.isnan(entropy) or np.isinf(entropy) else float(entropy)
        return entropy

    def _combine_features(self, features: Dict[str, Any]) -> np.ndarray:
        """Combine all feature dictionaries into a single feature vector"""
        vector = []

        # Playtime features (11 features: 7 original + 4 new)
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
                # New features
                playtime["avg_session_length"],
                playtime["deep_dive_game_count"],
                playtime["top_game_concentration"],
                playtime["repeat_play_intensity"],
            ]
        )

        # Genre features (8 features: 2 original + 6 new)
        genre = features["genre_features"]
        vector.extend([
            genre["genre_diversity"],
            genre["unique_genres"],
            # New persona-specific features
            genre["story_rpg_ratio"],
            genre["single_player_ratio"],
            genre["strategy_simulation_ratio"],
            genre["competitive_pvp_ratio"],
            genre["casual_indie_ratio"],
            genre["multiplayer_coop_ratio"],
        ])

        # Diversity features (4 features: 3 original + 1 new)
        diversity = features["diversity_features"]
        vector.extend(
            [
                diversity["unique_games"],
                diversity["free_games_ratio"],
                diversity["avg_metacritic_score"],
                diversity["new_release_purchase_rate"],
            ]
        )

        # Achievement features (3 features: unchanged)
        achievement = features["achievement_features"]
        vector.extend(
            [
                achievement["avg_achievement_rate"],
                achievement["total_achievements_unlocked"],
                achievement["achievement_hunter_score"],
            ]
        )

        # Temporal features (1 feature: unchanged)
        temporal = features["temporal_features"]
        vector.extend([temporal["recent_playtime_hours"]])

        # Replace NaN and Inf with 0
        cleaned_vector = []
        for x in vector:
            if x is None or (isinstance(x, (int, float)) and (np.isnan(x) or np.isinf(x))):
                cleaned_vector.append(0.0)
            else:
                cleaned_vector.append(float(x))

        return np.array(cleaned_vector, dtype=float)

    def _empty_features(self) -> Dict[str, Any]:
        """Return empty feature set for users with no games"""
        return {
            "feature_vector": [0] * 27,  # 27 total features (11 + 8 + 4 + 3 + 1)
            "feature_details": {},
            "total_games": 0,
            "total_playtime": 0,
        }
