from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import Pool
from app.config import settings
import logging
import time

logger = logging.getLogger(__name__)

# Create engine with connection pool settings
engine = create_engine(
    settings.database_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,  # Enable connection health checks
    pool_size=5,
    max_overflow=10,
    pool_recycle=3600,  # Recycle connections after 1 hour
)

# Add connection checkout listener for debugging
@event.listens_for(Pool, "checkout")
def receive_checkout(dbapi_conn, connection_record, connection_proxy):
    logger.debug("Connection checked out from pool")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Get database session

    Yields:
        Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(retry_count: int = 5, retry_delay: int = 2):
    """
    Initialize database connection with retry logic

    Args:
        retry_count: Number of connection attempts
        retry_delay: Delay between retries in seconds

    Raises:
        Exception: If unable to connect after all retries
    """
    for attempt in range(retry_count):
        try:
            # Test the connection
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database connection established successfully")
            return
        except Exception as e:
            if attempt < retry_count - 1:
                logger.warning(
                    f"Database connection attempt {attempt + 1}/{retry_count} failed: {e}. "
                    f"Retrying in {retry_delay} seconds..."
                )
                time.sleep(retry_delay)
            else:
                logger.error(f"Failed to connect to database after {retry_count} attempts")
                raise
