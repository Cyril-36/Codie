from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from functools import lru_cache
from typing import Optional


def _vault_addr() -> Optional[str]:
    addr = os.getenv("VAULT_ADDR")
    token = os.getenv("VAULT_TOKEN")
    if addr and token:
        return addr.rstrip("/")
    return None


@lru_cache(maxsize=128)
def get_secret(path: str, key: str, default: Optional[str] = None) -> Optional[str]:
    """
    Fetch a secret value from Vault KV v2 at 'secret/<path>' with key 'key'.
    If Vault is not configured or fails, fall back to environment variable 'key'.
    Returns default if not found.
    """
    # Try Vault first if configured
    addr = _vault_addr()
    if addr:
        try:
            req = urllib.request.Request(
                url=f"{addr}/v1/secret/data/{path}",
                headers={"X-Vault-Token": os.environ["VAULT_TOKEN"]},
                method="GET",
            )
            with urllib.request.urlopen(req, timeout=3) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
                data = payload.get("data", {}).get("data", {})
                if key in data:
                    return data[key]
        except Exception:
            # Any error → fall back to env
            pass

    # Fallback to environment variable
    return os.getenv(key, default)


@lru_cache(maxsize=128)
def get_env_or_vault(key: str, default: Optional[str] = None) -> Optional[str]:
    """
    Convenience accessor:
    1) If VAULT configured, read secret/codie and return key if present.
    2) Else return os.environ[key] or default.
    """
    val = get_secret("codie", key, None)
    return val if val is not None else os.getenv(key, default)


def clear_cache():
    """Clear the LRU cache for testing purposes."""
    get_secret.cache_clear()
    get_env_or_vault.cache_clear()
