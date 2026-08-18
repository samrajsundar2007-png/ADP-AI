import os
import re

def secure_filename(filename: str) -> str:
    """Sanitizes filename strings to prevent directory traversal exploits."""
    name, ext = os.path.splitext(filename)
    # Remove any character that isn't alphanumeric, a hyphen, underscore, or period
    clean_name = re.sub(r'[^a-zA-Z0-9_\-]', '', name)
    return f"{clean_name}{ext}"

def compute_percentage(part: float, total: float) -> float:
    """Safely calculates percentages handling zero division errors."""
    if total == 0:
        return 0.0
    return round((part / total) * 100, 2)
