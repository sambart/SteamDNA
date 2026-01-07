from fastapi import APIRouter, HTTPException
from app.schemas.analysis import AnalysisRequest, AnalysisResponse, PersonaResult
from app.services.feature_extractor import FeatureExtractor
from app.services.clustering import GamingPersonaClusterer
import numpy as np

router = APIRouter()

# Initialize ML services
feature_extractor = FeatureExtractor()
clusterer = GamingPersonaClusterer(n_clusters=5)


def convert_numpy_types(obj):
    """Recursively convert numpy types to native Python types and handle NaN/Inf"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        value = float(obj)
        # Handle NaN and Infinity
        if np.isnan(value):
            return 0.0
        elif np.isinf(value):
            return 0.0
        return value
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, (float, int)) and not isinstance(obj, bool):
        # Handle regular Python float/int that might be NaN or Inf
        if isinstance(obj, float):
            if np.isnan(obj) or np.isinf(obj):
                return 0.0
        return obj
    return obj


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
        # Validate input data
        if not request.userGames or len(request.userGames) == 0:
            # Return default response for users with no games
            return AnalysisResponse(
                userId=int(request.userId),
                featureVector=[0.0] * 16,
                persona=PersonaResult(
                    clusterId=0,
                    personaName="New Gamer",
                    confidence=1.0,
                    description="Just starting your gaming journey",
                    traits=["Beginner"],
                    insights=["Start exploring different game genres to discover your preferences"],
                ),
                topGenres=[],
                totalGames=0,
                totalPlaytime=0.0,
                featureDetails={},
            )

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

        # Convert all numpy types to native Python types
        cleaned_feature_details = convert_numpy_types(features["feature_details"])
        cleaned_feature_vector = convert_numpy_types(features["feature_vector"])
        cleaned_top_genres = convert_numpy_types(top_genres)

        return AnalysisResponse(
            userId=int(request.userId),
            featureVector=cleaned_feature_vector,
            persona=persona_result,
            topGenres=cleaned_top_genres,
            totalGames=int(features["total_games"]),
            totalPlaytime=float(features["total_playtime"] / 60.0),  # Convert to hours
            featureDetails=cleaned_feature_details,
        )

    except ValueError as e:
        # Handle data validation errors - return default analysis instead of 500
        import traceback
        error_detail = f"Data validation error: {str(e)}"
        print(f"WARNING in /analyze endpoint: {error_detail}")
        print(f"Traceback: {traceback.format_exc()}")

        # Return a fallback response instead of raising 500
        return AnalysisResponse(
            userId=int(request.userId),
            featureVector=[0.0] * 16,
            persona=PersonaResult(
                clusterId=0,
                personaName="Casual Gamer",
                confidence=0.5,
                description="Unable to perform detailed analysis",
                traits=["Casual"],
                insights=["Analysis could not be completed with available data"],
            ),
            topGenres=[],
            totalGames=len(request.userGames) if request.userGames else 0,
            totalPlaytime=0.0,
            featureDetails={},
        )
    except Exception as e:
        # Handle unexpected errors - log and return fallback
        import traceback
        error_detail = f"Unexpected error: {str(e)}"
        print(f"ERROR in /analyze endpoint: {error_detail}")
        print(f"Traceback: {traceback.format_exc()}")

        # Return a fallback response instead of raising 500
        return AnalysisResponse(
            userId=int(request.userId),
            featureVector=[0.0] * 16,
            persona=PersonaResult(
                clusterId=0,
                personaName="Casual Gamer",
                confidence=0.5,
                description="Analysis temporarily unavailable",
                traits=["Casual"],
                insights=["Please try again later"],
            ),
            topGenres=[],
            totalGames=len(request.userGames) if request.userGames else 0,
            totalPlaytime=0.0,
            featureDetails={},
        )


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
