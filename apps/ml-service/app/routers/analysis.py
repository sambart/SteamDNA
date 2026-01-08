from fastapi import APIRouter, HTTPException, Depends, Body
from app.schemas.analysis import AnalysisRequest, AnalysisResponse, PersonaResult
from app.services.feature_extractor import FeatureExtractor
from app.services.clustering import GamingPersonaClusterer
from app.services.cluster_monitor import ClusterMonitor
from app.api.dependencies import (
    get_settings,
    get_feature_extractor,
    get_clusterer,
    get_cluster_monitor,
    reset_cluster_monitor,
)
from app.core.logging_config import get_logger
from app.core.exceptions import InsufficientDataError, FeatureExtractionError
from app.config import Settings
from app.utils.type_conversion import convert_numpy_types

router = APIRouter()
logger = get_logger()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_user(
    request_body: AnalysisRequest,
    feature_extractor: FeatureExtractor = Depends(get_feature_extractor),
    clusterer: GamingPersonaClusterer = Depends(get_clusterer),
    monitor: ClusterMonitor = Depends(get_cluster_monitor),
    settings: Settings = Depends(get_settings),
):
    """
    Analyze user gaming profile and return ML-based insights

    This endpoint:
    1. Extracts features from user's gaming data
    2. Classifies user into a gaming persona
    3. Returns detailed analysis
    """
    logger.info(
        "Analysis request received",
        extra={
            "user_id": request_body.userId,
            "game_count": len(request_body.userGames) if request_body.userGames else 0
        }
    )

    try:
        # Validate input data
        if not request_body.userGames or len(request_body.userGames) == 0:
            logger.info("No games provided", extra={"user_id": request_body.userId})
            # Return default response for users with no games
            return AnalysisResponse(
                userId=int(request_body.userId),
                featureVector=[0.0] * settings.FEATURE_VECTOR_SIZE,
                persona=PersonaResult(
                    clusterId=0,
                    personaName="신규 게이머",
                    confidence=1.0,
                    description="게임 여정을 막 시작한 단계",
                    traits=["초보자"],
                    insights=["다양한 장르를 경험하며 자신의 취향을 찾아보세요"],
                ),
                topGenres=[],
                totalGames=0,
                totalPlaytime=0.0,
                featureDetails={},
            )

        # Check minimum games requirement
        if len(request_body.userGames) < settings.MIN_GAMES_FOR_ANALYSIS:
            logger.warning(
                "Insufficient games for analysis",
                extra={
                    "user_id": request_body.userId,
                    "game_count": len(request_body.userGames),
                    "min_required": settings.MIN_GAMES_FOR_ANALYSIS
                }
            )
            raise InsufficientDataError(min_games=settings.MIN_GAMES_FOR_ANALYSIS)

        # Convert Pydantic models to dictionaries
        user_games_data = [game.model_dump() for game in request_body.userGames]
        games_info_data = [game.model_dump() for game in request_body.gamesInfo]

        # Extract features
        features = feature_extractor.extract_user_features(
            user_games_data, games_info_data
        )

        # Predict persona
        cluster_id, persona_name, confidence = clusterer.predict_persona(
            features["feature_vector"]
        )

        # Record prediction for monitoring
        monitor.record_prediction(
            cluster_id=cluster_id,
            confidence=confidence,
            feature_vector=features["feature_vector"]
        )

        logger.info(
            "Analysis completed successfully",
            extra={
                "user_id": request_body.userId,
                "cluster_id": cluster_id,
                "confidence": confidence,
                "persona_name": persona_name
            }
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
            userId=int(request_body.userId),
            featureVector=cleaned_feature_vector,
            persona=persona_result,
            topGenres=cleaned_top_genres,
            totalGames=int(features["total_games"]),
            totalPlaytime=float(features["total_playtime"] / 60.0),  # Convert to hours
            featureDetails=cleaned_feature_details,
        )

    except InsufficientDataError as e:
        logger.warning(
            "Insufficient data for analysis",
            extra={"user_id": request_body.userId, "error": str(e)}
        )
        raise HTTPException(status_code=400, detail=str(e))

    except FeatureExtractionError as e:
        logger.error(
            "Feature extraction failed",
            extra={"user_id": request_body.userId, "error": str(e)},
            exc_info=True
        )
        raise HTTPException(
            status_code=422,
            detail=f"피처 추출 실패: {str(e)}"
        )

    except ValueError as e:
        logger.warning(
            "Data validation error",
            extra={"user_id": request_body.userId, "error": str(e)},
            exc_info=True
        )
        raise HTTPException(
            status_code=422,
            detail=f"데이터 유효성 검증 실패: {str(e)}"
        )

    except Exception as e:
        logger.error(
            "Unexpected error during analysis",
            extra={"user_id": request_body.userId, "error": str(e)},
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="분석 중 예상치 못한 오류가 발생했습니다. 나중에 다시 시도해주세요."
        )


@router.get("/personas")
async def get_personas(clusterer: GamingPersonaClusterer = Depends(get_clusterer)):
    """Get list of available gaming personas"""
    logger.info("Fetching available personas")

    personas = []
    for cluster_id, name in clusterer.PERSONA_NAMES.items():
        # Call get_persona_characteristics once per persona
        characteristics = clusterer.get_persona_characteristics(cluster_id, {})
        personas.append({
            "id": cluster_id,
            "name": name,
            "description": characteristics["description"],
            "traits": characteristics["traits"],
            "gaming_style": characteristics.get("gaming_style", ""),
        })

    return {"personas": personas}


@router.get("/monitoring/distribution")
async def get_cluster_distribution(monitor: ClusterMonitor = Depends(get_cluster_monitor)):
    """
    Get current cluster distribution statistics

    Returns information about how users are distributed across personas
    """
    logger.debug("Fetching cluster distribution")
    return monitor.get_distribution()


@router.get("/monitoring/quality")
async def get_clustering_quality(monitor: ClusterMonitor = Depends(get_cluster_monitor)):
    """
    Get clustering quality metrics

    Returns metrics like average confidence, balance score, etc.
    """
    logger.debug("Fetching clustering quality metrics")
    return monitor.get_persona_quality_metrics()


@router.get("/monitoring/features")
async def get_feature_statistics(monitor: ClusterMonitor = Depends(get_cluster_monitor)):
    """
    Get feature value statistics

    Returns min/max/avg for all 27 features
    """
    logger.debug("Fetching feature statistics")
    return monitor.get_feature_statistics()


@router.get("/monitoring/summary")
async def get_monitoring_summary(
    monitor: ClusterMonitor = Depends(get_cluster_monitor),
    clusterer: GamingPersonaClusterer = Depends(get_clusterer),
    settings: Settings = Depends(get_settings),
):
    """
    Get comprehensive monitoring summary

    Returns distribution, quality metrics, and key feature stats
    """
    logger.info("Fetching monitoring summary")
    distribution = monitor.get_distribution()
    quality = monitor.get_persona_quality_metrics()

    return {
        "distribution": distribution,
        "quality_metrics": quality,
        "persona_names": clusterer.PERSONA_NAMES,
        "total_features": settings.FEATURE_VECTOR_SIZE,
    }


@router.post("/monitoring/reset")
async def reset_monitoring():
    """
    Reset monitoring statistics

    Clears all accumulated monitoring data
    """
    logger.warning("Resetting monitoring statistics")
    reset_cluster_monitor()
    return {
        "status": "success",
        "message": "Monitoring statistics have been reset"
    }
