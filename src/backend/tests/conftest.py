"""Test configuration and fixtures."""
import warnings
from sqlalchemy.exc import SAWarning

# Suppress SQLAlchemy connection warnings that don't affect test functionality
warnings.filterwarnings(
    "ignore", 
    category=SAWarning, 
    message=".*garbage collector.*connection.*"
)
