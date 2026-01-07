from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.feature_extractor import FeatureExtractor

router = APIRouter()
feature_extractor = FeatureExtractor()


class FeatureExtractionRequest(BaseModel):
    userGames: List[Dict[str, Any]]
    gamesInfo: List[Dict[str, Any]]


@router.post("/extract")
async def extract_features(request: FeatureExtractionRequest):
    """Extract feature vector from user gaming data"""
    features = feature_extractor.extract_user_features(
        request.userGames, request.gamesInfo
    )

    return {
        "featureVector": features["feature_vector"],
        "featureDetails": features["feature_details"],
        "metadata": {
            "totalGames": features["total_games"],
            "totalPlaytime": features["total_playtime"],
        },
    }


@router.get("/schema")
async def get_feature_schema():
    """Get description of feature vector schema"""
    return {
        "featureCount": 16,
        "features": [
            {"index": 0, "name": "total_playtime_hours", "type": "continuous"},
            {"index": 1, "name": "avg_playtime_hours", "type": "continuous"},
            {"index": 2, "name": "median_playtime_hours", "type": "continuous"},
            {"index": 3, "name": "max_playtime_hours", "type": "continuous"},
            {"index": 4, "name": "playtime_std", "type": "continuous"},
            {"index": 5, "name": "games_never_played_ratio", "type": "ratio"},
            {"index": 6, "name": "heavily_played_ratio", "type": "ratio"},
            {"index": 7, "name": "genre_diversity", "type": "continuous"},
            {"index": 8, "name": "unique_genres", "type": "count"},
            {"index": 9, "name": "unique_games", "type": "count"},
            {"index": 10, "name": "free_games_ratio", "type": "ratio"},
            {"index": 11, "name": "avg_metacritic_score", "type": "continuous"},
            {"index": 12, "name": "avg_achievement_rate", "type": "percentage"},
            {"index": 13, "name": "total_achievements_unlocked", "type": "count"},
            {"index": 14, "name": "achievement_hunter_score", "type": "continuous"},
            {"index": 15, "name": "recent_playtime_hours", "type": "continuous"},
        ],
    }
