import sys
import os
from pathlib import Path

# Add parent directory to path to import backend
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.server import app

# This file is used for Vercel serverless functions
__all__ = ["app"]

