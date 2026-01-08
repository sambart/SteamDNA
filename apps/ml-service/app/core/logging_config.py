"""
Structured logging configuration

This module sets up structured JSON logging for production environments
and human-readable logging for development.
"""

import logging
import sys
from typing import Any, Dict
from datetime import datetime
import json


class JSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging
    """

    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record as JSON

        Args:
            record: Log record

        Returns:
            JSON formatted log string
        """
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add extra fields from record
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "game_count"):
            log_data["game_count"] = record.game_count
        if hasattr(record, "cluster_id"):
            log_data["cluster_id"] = record.cluster_id
        if hasattr(record, "confidence"):
            log_data["confidence"] = record.confidence

        # Add any other custom fields from extra parameter
        for key, value in record.__dict__.items():
            if key not in [
                "name", "msg", "args", "created", "filename", "funcName",
                "levelname", "levelno", "lineno", "module", "msecs",
                "message", "pathname", "process", "processName", "relativeCreated",
                "thread", "threadName", "exc_info", "exc_text", "stack_info"
            ]:
                if not key.startswith("_"):
                    log_data[key] = value

        return json.dumps(log_data)


def setup_logging(debug: bool = False) -> logging.Logger:
    """
    Setup application logging

    Args:
        debug: Enable debug mode (human-readable logs)

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger("ml_service")

    # Remove existing handlers
    logger.handlers = []

    # Set log level
    logger.setLevel(logging.DEBUG if debug else logging.INFO)

    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG if debug else logging.INFO)

    # Set formatter based on environment
    if debug:
        # Human-readable format for development
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
    else:
        # JSON format for production
        formatter = JSONFormatter()

    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger


# Create global logger instance
logger = setup_logging(debug=True)  # Will be configured from settings in main.py


def get_logger() -> logging.Logger:
    """
    Get the application logger

    Returns:
        Logger instance
    """
    return logger
