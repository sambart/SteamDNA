from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import analysis, features
from app.config import settings
from app.database import init_db
from app.core.logging_config import setup_logging
import logging

# Setup logging
logger = setup_logging(debug=settings.DEBUG)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events

    Handles startup and shutdown events for the FastAPI application.
    """
    # Startup
    logger.info("Starting ML Service...")
    logger.info(f"Service Name: {settings.SERVICE_NAME}")
    logger.info(f"Version: {settings.VERSION}")
    logger.info(f"Debug Mode: {settings.DEBUG}")

    # Initialize database connection with retry
    try:
        logger.info("Initializing database connection...")
        init_db(retry_count=10, retry_delay=2)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        logger.warning("Service starting without database connection")

    yield

    # Shutdown
    logger.info("Shutting down ML Service...")


app = FastAPI(
    title=settings.SERVICE_NAME,
    description="Machine Learning service for Steam gaming profile analysis",
    version=settings.VERSION,
    lifespan=lifespan,
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
    """Root endpoint"""
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from app.database import engine
    from sqlalchemy import text

    # Check database connection
    db_status = "disconnected"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.warning(f"Database health check failed: {e}")

    return {
        "status": "healthy",
        "database": db_status,
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
    }
