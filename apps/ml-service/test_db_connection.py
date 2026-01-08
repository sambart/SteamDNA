"""
Database connection test script

This script tests the database connection and provides detailed diagnostic information.
Run this script to verify database connectivity before starting the application.

Usage:
    python test_db_connection.py
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import Settings
from sqlalchemy import create_engine, text
import time

def test_connection():
    """Test database connection with detailed diagnostics"""

    print("=" * 60)
    print("Database Connection Test")
    print("=" * 60)

    # Load settings
    settings = Settings()

    print(f"\nConfiguration:")
    print(f"  DB_HOST: {settings.DB_HOST}")
    print(f"  DB_PORT: {settings.DB_PORT}")
    print(f"  DB_DATABASE: {settings.DB_DATABASE}")
    print(f"  DB_USERNAME: {settings.DB_USERNAME}")
    print(f"  Database URL: {settings.database_url.replace(settings.DB_PASSWORD, '***')}")

    # Create engine
    print(f"\nCreating database engine...")
    try:
        engine = create_engine(
            settings.database_url,
            echo=True,
            pool_pre_ping=True
        )
        print("✓ Engine created successfully")
    except Exception as e:
        print(f"✗ Failed to create engine: {e}")
        return False

    # Test connection with retries
    max_retries = 5
    retry_delay = 2

    for attempt in range(1, max_retries + 1):
        print(f"\nConnection attempt {attempt}/{max_retries}...")

        try:
            with engine.connect() as conn:
                # Execute simple query
                result = conn.execute(text("SELECT 1 as test"))
                row = result.fetchone()

                print(f"✓ Connection successful!")
                print(f"  Test query result: {row}")

                # Get database version
                result = conn.execute(text("SELECT version()"))
                version = result.fetchone()[0]
                print(f"  PostgreSQL version: {version.split(',')[0]}")

                # List tables
                result = conn.execute(text("""
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                    ORDER BY table_name
                """))
                tables = [row[0] for row in result.fetchall()]

                if tables:
                    print(f"\n  Found {len(tables)} tables:")
                    for table in tables:
                        print(f"    - {table}")
                else:
                    print("\n  No tables found (database is empty)")

                print("\n" + "=" * 60)
                print("✓ Database connection test PASSED")
                print("=" * 60)
                return True

        except Exception as e:
            print(f"✗ Connection failed: {e}")

            if attempt < max_retries:
                print(f"  Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("\n" + "=" * 60)
                print("✗ Database connection test FAILED")
                print("=" * 60)
                print("\nTroubleshooting:")
                print("1. Verify PostgreSQL is running:")
                print("   docker ps | grep postgres")
                print("\n2. Check database logs:")
                print("   docker logs steamdna-postgres")
                print("\n3. Verify environment variables:")
                print("   cat apps/ml-service/.env")
                print("\n4. Test connection from host:")
                print(f"   psql -h {settings.DB_HOST} -p {settings.DB_PORT} -U {settings.DB_USERNAME} -d {settings.DB_DATABASE}")
                return False

    return False


if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
