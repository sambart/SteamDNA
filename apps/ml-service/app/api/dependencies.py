"""
Dependency injection for FastAPI endpoints

This module provides dependency injection functions for services,
making the code more testable and maintainable.
"""

from functools import lru_cache
from typing import Generator

from app.config import Settings
from app.services.feature_extractor import FeatureExtractor
from app.services.clustering import GamingPersonaClusterer
from app.services.cluster_monitor import ClusterMonitor


# Settings dependency (singleton)
@lru_cache()
def get_settings() -> Settings:
    """
    Get application settings (cached singleton)

    Returns:
        Settings instance
    """
    return Settings()


# Feature Extractor dependency
def get_feature_extractor(
    settings: Settings = None
) -> FeatureExtractor:
    """
    Get feature extractor service

    Args:
        settings: Application settings (optional)

    Returns:
        FeatureExtractor instance
    """
    return FeatureExtractor()


# Clusterer dependency
def get_clusterer(
    settings: Settings = None
) -> GamingPersonaClusterer:
    """
    Get clustering service

    Args:
        settings: Application settings

    Returns:
        GamingPersonaClusterer instance configured from settings
    """
    if settings is None:
        settings = get_settings()

    return GamingPersonaClusterer(
        n_clusters=settings.CLUSTERING_N_CLUSTERS
    )


# Cluster Monitor dependency
# Global instance for now - will move to Redis/DB in Phase 4
_cluster_monitor: ClusterMonitor = None

def get_cluster_monitor() -> ClusterMonitor:
    """
    Get cluster monitoring service (global singleton)

    Note: Currently uses in-memory storage.
    For production, consider persisting to Redis or database.

    Returns:
        ClusterMonitor instance
    """
    global _cluster_monitor
    if _cluster_monitor is None:
        _cluster_monitor = ClusterMonitor()
    return _cluster_monitor


def reset_cluster_monitor():
    """
    Reset the global cluster monitor instance

    Used for testing and manual resets
    """
    global _cluster_monitor
    if _cluster_monitor is not None:
        _cluster_monitor.reset()
