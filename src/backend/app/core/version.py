import os
import subprocess
from functools import lru_cache


@lru_cache(maxsize=1)
def get_build_hash() -> str:
    """
    Return the current git commit short SHA if available, else 'dev'.
    Cached to avoid repeated subprocess calls.
    """
    # Allow overriding via env for containerized builds/CI
    env_hash = os.getenv("BUILD_HASH")
    if env_hash:
        return env_hash

    try:
        sha = (
            subprocess.check_output(
                ["git", "rev-parse", "--short", "HEAD"], stderr=subprocess.DEVNULL
            )
            .decode("utf-8")
            .strip()
        )
        return sha or "dev"
    except Exception:
        return "dev"
