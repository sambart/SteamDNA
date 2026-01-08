"""
Type conversion utilities

This module provides utilities for converting between different data types,
particularly for handling numpy types in API responses.
"""

import numpy as np
from typing import Any, Dict, List, Union


def convert_numpy_types(obj: Any) -> Any:
    """
    Recursively convert numpy types to native Python types and handle NaN/Inf

    This function is used to ensure API responses contain only JSON-serializable
    types by converting numpy types to their Python equivalents.

    Args:
        obj: Object to convert (can be numpy type, dict, list, or primitive)

    Returns:
        Converted object with native Python types

    Examples:
        >>> convert_numpy_types(np.int64(42))
        42
        >>> convert_numpy_types(np.float64(3.14))
        3.14
        >>> convert_numpy_types(np.nan)
        0.0
        >>> convert_numpy_types({'a': np.int64(1), 'b': [np.float64(2.5)]})
        {'a': 1, 'b': [2.5]}
    """
    if isinstance(obj, np.integer):
        return int(obj)

    elif isinstance(obj, np.floating):
        value = float(obj)
        # Handle NaN and Infinity - convert to 0.0 for JSON compatibility
        if np.isnan(value) or np.isinf(value):
            return 0.0
        return value

    elif isinstance(obj, np.ndarray):
        return obj.tolist()

    elif isinstance(obj, np.bool_):
        return bool(obj)

    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}

    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]

    elif isinstance(obj, (float, int)) and not isinstance(obj, bool):
        # Handle regular Python float/int that might be NaN or Inf
        if isinstance(obj, float):
            if np.isnan(obj) or np.isinf(obj):
                return 0.0
        return obj

    return obj


def safe_float(value: Any, default: float = 0.0) -> float:
    """
    Safely convert a value to float, handling NaN and Inf

    Args:
        value: Value to convert
        default: Default value if conversion fails or value is NaN/Inf

    Returns:
        Float value or default
    """
    try:
        result = float(value)
        if np.isnan(result) or np.isinf(result):
            return default
        return result
    except (ValueError, TypeError):
        return default


def safe_int(value: Any, default: int = 0) -> int:
    """
    Safely convert a value to int

    Args:
        value: Value to convert
        default: Default value if conversion fails

    Returns:
        Integer value or default
    """
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def clean_feature_vector(vector: Union[List[float], np.ndarray]) -> List[float]:
    """
    Clean a feature vector by replacing NaN/Inf with 0.0

    Args:
        vector: Feature vector (list or numpy array)

    Returns:
        Cleaned list of floats
    """
    cleaned = []
    for x in vector:
        if x is None or (isinstance(x, (int, float)) and (np.isnan(x) or np.isinf(x))):
            cleaned.append(0.0)
        else:
            cleaned.append(float(x))
    return cleaned
