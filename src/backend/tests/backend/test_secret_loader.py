import json
import os
from unittest.mock import patch

from backend.app.core.secret_loader import get_secret, get_env_or_vault, clear_cache


def test_env_fallback_when_no_vault(monkeypatch):
    clear_cache()  # Clear cache before test
    monkeypatch.delenv("VAULT_ADDR", raising=False)
    monkeypatch.delenv("VAULT_TOKEN", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "env-value")
    assert get_env_or_vault("GEMINI_API_KEY") == "env-value"
    assert get_secret("codie", "GEMINI_API_KEY", "default") == "env-value"


def test_vault_success_overrides_env(monkeypatch):
    clear_cache()  # Clear cache before test
    # Configure vault env
    monkeypatch.setenv("VAULT_ADDR", "http://vault:8200")
    monkeypatch.setenv("VAULT_TOKEN", "dev-root")
    monkeypatch.setenv("GEMINI_API_KEY", "env-value")

    payload = {"data": {"data": {"GEMINI_API_KEY": "vault-value"}}}
    mock_resp = json.dumps(payload).encode("utf-8")

    class DummyResponse:
        def __init__(self, data):
            self._data = data

        def read(self):
            return self._data

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

    with patch("urllib.request.urlopen", return_value=DummyResponse(mock_resp)):
        assert get_env_or_vault("GEMINI_API_KEY") == "vault-value"
        assert get_secret("codie", "GEMINI_API_KEY") == "vault-value"


def test_vault_error_falls_back_to_env(monkeypatch):
    clear_cache()  # Clear cache before test
    monkeypatch.setenv("VAULT_ADDR", "http://vault:8200")
    monkeypatch.setenv("VAULT_TOKEN", "dev-root")
    monkeypatch.setenv("GEMINI_API_KEY", "env-value")

    # Simulate network error
    with patch("urllib.request.urlopen", side_effect=Exception("boom")):
        assert get_env_or_vault("GEMINI_API_KEY") == "env-value"
        assert get_secret("codie", "GEMINI_API_KEY", "default") == "env-value"
