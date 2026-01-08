from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union


class Settings(BaseSettings):
    # Service
    SERVICE_NAME: str = "SteamDNA ML Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USERNAME: str = "steamdna"
    DB_PASSWORD: str = "steamdna_password"
    DB_DATABASE: str = "steamdna"

    # CORS - Use Union to accept both string and list
    ALLOWED_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://localhost:4000",
    ]

    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_allowed_origins(cls, v):
        """Parse ALLOWED_ORIGINS from comma-separated string or list"""
        if isinstance(v, str):
            # Handle comma-separated string from environment variables
            return [origin.strip() for origin in v.split(',')]
        return v

    # ML Settings - Feature Extraction
    MIN_GAMES_FOR_ANALYSIS: int = 5
    FEATURE_VECTOR_SIZE: int = 27  # Updated to match actual feature count
    DEEP_DIVE_THRESHOLD_HOURS: int = 100  # Hours to be considered "deep dive"
    HEAVY_PLAY_THRESHOLD_MINUTES: int = 3000  # Minutes (50 hours)
    NEW_RELEASE_WINDOW_DAYS: int = 365  # Days to consider a game "new"

    # ML Settings - Clustering
    CLUSTERING_N_CLUSTERS: int = 5
    CLUSTERING_RANDOM_STATE: int = 42
    CLUSTERING_N_INIT: int = 10

    # ML Settings - Monitoring
    MONITOR_MAX_SAMPLES: int = 10000  # Maximum samples to store in memory
    LOW_CONFIDENCE_THRESHOLD: float = 0.5  # Threshold for low confidence warnings

    # Logging
    LOG_LEVEL: str = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    LOG_FORMAT: str = "json"  # json or text

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "env_parse_none_str": "null",
    }

    @property
    def database_url(self) -> str:
        return f"postgresql://{self.DB_USERNAME}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_DATABASE}"


# Global settings instance (use get_settings() from dependencies instead)
settings = Settings()
