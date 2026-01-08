"""
Custom exceptions for ML Service

This module defines custom exceptions for better error handling
and more specific error messages.
"""


class MLServiceException(Exception):
    """Base exception for ML Service"""
    pass


class FeatureExtractionError(MLServiceException):
    """Raised when feature extraction fails"""
    pass


class InsufficientDataError(MLServiceException):
    """Raised when insufficient data is provided for analysis"""

    def __init__(self, message: str = "Insufficient data for analysis", min_games: int = None):
        self.min_games = min_games
        if min_games:
            message = f"{message}. 최소 {min_games}개의 게임이 필요합니다."
        super().__init__(message)


class ClusteringError(MLServiceException):
    """Raised when clustering operation fails"""
    pass


class ModelNotFittedError(ClusteringError):
    """Raised when trying to predict without fitting the model first"""

    def __init__(self, message: str = "모델이 학습되지 않았습니다"):
        super().__init__(message)


class InvalidFeatureVectorError(FeatureExtractionError):
    """Raised when feature vector has invalid dimensions or values"""

    def __init__(self, expected: int = None, got: int = None):
        if expected and got:
            message = f"피처 벡터 차원 불일치: 예상 {expected}개, 실제 {got}개"
        else:
            message = "잘못된 피처 벡터"
        super().__init__(message)
