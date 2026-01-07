from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analysis, features
from app.config import settings

app = FastAPI(
    title="SteamDNA ML Service",
    description="Machine Learning service for Steam gaming profile analysis",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analysis.router, prefix="/api/ml/analysis", tags=["analysis"])
app.include_router(features.router, prefix="/api/ml/features", tags=["features"])


@app.get("/")
async def root():
    return {
        "service": "SteamDNA ML Service",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
