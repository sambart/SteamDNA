from fastapi import APIRouter, HTTPException
from app.schemas.analysis import AnalysisRequest, AnalysisResponse, PersonaResult
from app.services.feature_extractor import FeatureExtractor
from app.services.clustering import GamingPersonaClusterer

router = APIRouter()

# Initialize ML services
feature_extractor = FeatureExtractor()
clusterer = GamingPersonaClusterer(n_clusters=5)


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_user(request: AnalysisRequest):
    """
    Analyze user gaming profile and return ML-based insights

    This endpoint:
    1. Extracts features from user's gaming data
    2. Classifies user into a gaming persona
    3. Returns detailed analysis
    """
    try:
        # Convert Pydantic models to dictionaries
        user_games_data = [game.model_dump() for game in request.userGames]
        games_info_data = [game.model_dump() for game in request.gamesInfo]

        # Extract features
        features = feature_extractor.extract_user_features(
            user_games_data, games_info_data
        )

        # Predict persona
        cluster_id, persona_name, confidence = clusterer.predict_persona(
            features["feature_vector"]
        )

        # Get persona characteristics
        persona_chars = clusterer.get_persona_characteristics(
            cluster_id, features["feature_details"]
        )

        # Build persona result
        persona_result = PersonaResult(
            clusterId=cluster_id,
            personaName=persona_name,
            confidence=confidence,
            description=persona_chars["description"],
            traits=persona_chars["traits"],
            insights=persona_chars["insights"],
        )

        # Get top genres
        genre_features = features["feature_details"].get("genre_features", {})
        top_genres = genre_features.get("top_genres", [])

        return AnalysisResponse(
            userId=request.userId,
            featureVector=features["feature_vector"],
            persona=persona_result,
            topGenres=top_genres,
            totalGames=features["total_games"],
            totalPlaytime=features["total_playtime"] / 60.0,  # Convert to hours
            featureDetails=features["feature_details"],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/personas")
async def get_personas():
    """Get list of available gaming personas"""
    return {
        "personas": [
            {
                "id": cluster_id,
                "name": name,
                "description": clusterer.get_persona_characteristics(cluster_id, {})[
                    "description"
                ],
            }
            for cluster_id, name in clusterer.PERSONA_NAMES.items()
        ]
    }
