import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any, Tuple


class GamingPersonaClusterer:
    """Cluster users into gaming personas using K-means"""

    PERSONA_NAMES = {
        0: "몰입형/사색형",
        1: "분석형/계획형",
        2: "자유형/탐색형",
        3: "성취지향/경쟁형",
        4: "소셜형/협동형",
    }

    def __init__(self, n_clusters: int = 5):
        self.n_clusters = n_clusters
        self.scaler = StandardScaler()
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        self.is_fitted = False

    def fit(self, feature_vectors: List[List[float]]):
        """Fit the clustering model on user feature vectors"""
        if len(feature_vectors) < self.n_clusters:
            raise ValueError(
                f"Need at least {self.n_clusters} samples to fit the model"
            )

        X = np.array(feature_vectors)
        X_scaled = self.scaler.fit_transform(X)
        self.kmeans.fit(X_scaled)
        self.is_fitted = True

        return self

    def predict_persona(self, feature_vector: List[float]) -> Tuple[int, str, float]:
        """
        Predict gaming persona for a single user

        Returns:
            Tuple of (cluster_id, persona_name, confidence)
        """
        if not self.is_fitted:
            # Return default persona if model not fitted
            return (0, "Casual Gamer", 0.5)

        X = np.array([feature_vector])
        X_scaled = self.scaler.transform(X)

        cluster = self.kmeans.predict(X_scaled)[0]
        distances = self.kmeans.transform(X_scaled)[0]

        # Calculate confidence (inverse of distance to cluster center)
        min_distance = distances[cluster]
        max_distance = distances.max()
        confidence = 1 - (min_distance / max_distance) if max_distance > 0 else 1.0

        persona_name = self.PERSONA_NAMES.get(cluster, f"Gamer Type {cluster}")

        return (int(cluster), persona_name, float(confidence))

    def get_persona_characteristics(
        self, cluster_id: int, feature_details: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get characteristic description of a persona"""
        characteristics = {
            0: {  # 몰입형/사색형
                "description": "스토리와 세계관에 깊이 몰입하는 플레이어",
                "traits": [
                    "스토리·RPG 게임 선호",
                    "긴 세션 플레이",
                    "감정 이입형",
                    "서사 중시",
                ],
                "gaming_style": "몰입력이 높고 게임의 세계관과 스토리를 깊이 있게 즐기며, 한 게임에 오래 시간을 투자합니다.",
            },
            1: {  # 분석형/계획형
                "description": "전략과 최적화를 중시하는 논리적 플레이어",
                "traits": [
                    "전략·시뮬레이션 선호",
                    "장기 플레이",
                    "효율 중시",
                    "계획적",
                ],
                "gaming_style": "논리적으로 접근하며 게임의 시스템을 분석하고 최적화된 전략을 세우는 것을 즐깁니다.",
            },
            2: {  # 자유형/탐색형
                "description": "다양한 경험을 추구하는 개방적 플레이어",
                "traits": [
                    "다양한 장르",
                    "짧은 플레이",
                    "트렌드 소비",
                    "경험 중시",
                ],
                "gaming_style": "개방적이고 즉흥적이며, 새로운 게임과 다양한 장르를 경험하는 것을 선호합니다.",
            },
            3: {  # 성취지향/경쟁형
                "description": "목표 달성과 경쟁을 즐기는 도전적 플레이어",
                "traits": [
                    "PvP·랭크 게임 선호",
                    "반복 플레이",
                    "성과·랭킹 중시",
                    "목표 지향",
                ],
                "gaming_style": "목표를 설정하고 달성하는 과정을 즐기며, 경쟁과 도전을 통해 성장하는 것을 추구합니다.",
            },
            4: {  # 소셜형/협동형
                "description": "함께 플레이하는 것을 즐기는 사교적 플레이어",
                "traits": [
                    "Co-op·멀티플레이",
                    "파티 게임 선호",
                    "관계 지향",
                    "협력 중시",
                ],
                "gaming_style": "친구들과 함께 게임하는 것을 선호하며, 협동과 공동의 경험을 중요하게 생각합니다.",
            },
        }

        base_char = characteristics.get(
            cluster_id,
            {
                "description": "Unique gaming profile",
                "traits": ["Diverse interests", "Unique style"],
            },
        )

        # Add personalized insights based on actual data
        insights = []

        genre_features = feature_details.get("genre_features", {})
        top_genres = genre_features.get("top_genres", [])
        if top_genres:
            insights.append(f"선호 장르: {', '.join(top_genres[:3])}")

        playtime_features = feature_details.get("playtime_features", {})
        total_hours = playtime_features.get("total_playtime_hours", 0)
        if total_hours > 1000:
            insights.append(f"총 {int(total_hours):,}시간 플레이한 헌신적인 게이머")

        deep_dive_count = playtime_features.get("deep_dive_game_count", 0)
        if deep_dive_count > 0:
            insights.append(f"{int(deep_dive_count)}개 게임을 100시간 이상 플레이")

        achievement_features = feature_details.get("achievement_features", {})
        achievement_rate = achievement_features.get("avg_achievement_rate", 0)
        if achievement_rate > 50:
            insights.append(f"업적 달성률 {achievement_rate:.1f}%의 컴플리셔니스트")

        # Add persona-specific insights
        story_rpg_ratio = genre_features.get("story_rpg_ratio", 0)
        if story_rpg_ratio > 0.3:
            insights.append(f"플레이타임의 {story_rpg_ratio*100:.0f}%를 스토리/RPG 게임에 투자")

        competitive_ratio = genre_features.get("competitive_pvp_ratio", 0)
        if competitive_ratio > 0.3:
            insights.append(f"플레이타임의 {competitive_ratio*100:.0f}%를 경쟁 게임에 투자")

        multiplayer_ratio = genre_features.get("multiplayer_coop_ratio", 0)
        if multiplayer_ratio > 0.3:
            insights.append(f"플레이타임의 {multiplayer_ratio*100:.0f}%를 멀티플레이 게임에 투자")

        return {
            **base_char,
            "insights": insights,
        }
