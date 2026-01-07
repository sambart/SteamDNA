import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any, Tuple


class GamingPersonaClusterer:
    """Cluster users into gaming personas using K-means"""

    PERSONA_NAMES = {
        0: "Casual Explorer",
        1: "Hardcore Completionist",
        2: "Genre Specialist",
        3: "Achievement Hunter",
        4: "Social Gamer",
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
            0: {  # Casual Explorer
                "description": "Enjoys exploring various games without deep commitment",
                "traits": ["Diverse library", "Moderate playtime", "Variety seeker"],
            },
            1: {  # Hardcore Completionist
                "description": "Dedicates significant time to mastering games",
                "traits": [
                    "High playtime",
                    "Achievement focused",
                    "Deep game knowledge",
                ],
            },
            2: {  # Genre Specialist
                "description": "Focuses deeply on specific game genres",
                "traits": ["Genre loyalty", "Expert knowledge", "Focused collection"],
            },
            3: {  # Achievement Hunter
                "description": "Driven by completing achievements and challenges",
                "traits": [
                    "High achievement rate",
                    "Completionist",
                    "Goal-oriented",
                ],
            },
            4: {  # Social Gamer
                "description": "Enjoys multiplayer and social gaming experiences",
                "traits": [
                    "Multiplayer focused",
                    "Community engagement",
                    "Cooperative play",
                ],
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
            insights.append(f"Favorite genres: {', '.join(top_genres[:3])}")

        playtime_features = feature_details.get("playtime_features", {})
        total_hours = playtime_features.get("total_playtime_hours", 0)
        if total_hours > 1000:
            insights.append(f"Dedicated player with {int(total_hours):,} total hours")

        achievement_features = feature_details.get("achievement_features", {})
        achievement_rate = achievement_features.get("avg_achievement_rate", 0)
        if achievement_rate > 50:
            insights.append(f"Strong achievement hunter ({achievement_rate:.1f}%)")

        return {
            **base_char,
            "insights": insights,
        }
