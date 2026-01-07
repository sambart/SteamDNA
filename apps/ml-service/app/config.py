from pydantic_settings import BaseSettings
from typing import List


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

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:4000",
    ]

    # ML Settings
    MIN_GAMES_FOR_ANALYSIS: int = 5
    CLUSTERING_N_CLUSTERS: int = 5
    FEATURE_VECTOR_SIZE: int = 50

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def database_url(self) -> str:
        return f"postgresql://{self.DB_USERNAME}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_DATABASE}"


settings = Settings()
