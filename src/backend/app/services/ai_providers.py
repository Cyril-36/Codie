from __future__ import annotations

import asyncio
import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from enum import Enum

import httpx
from pydantic import BaseModel

from ..core.secret_loader import get_env_or_vault
from ..core.settings import get_settings

logger = logging.getLogger(__name__)


class ProviderType(str, Enum):
    """AI provider types"""

    GEMINI = "gemini"
    HUGGINGFACE = "huggingface"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class ProviderStatus(str, Enum):
    """Provider status for circuit breaker"""

    CLOSED = "closed"  # Normal operation
    OPEN = "open"  # Circuit is open (failing)
    HALF_OPEN = "half_open"  # Testing if service is back


@dataclass
class ProviderConfig:
    """Configuration for an AI provider"""

    name: str
    api_key: str
    base_url: str
    timeout: int = 30
    max_retries: int = 3
    weight: float = 1.0
    enabled: bool = True


class CircuitBreaker:
    """Production-grade circuit breaker implementation"""

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: type = Exception,
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception

        self.failure_count = 0
        self.last_failure_time = 0
        self.status = ProviderStatus.CLOSED

    def can_execute(self) -> bool:
        """Check if the circuit breaker allows execution"""
        if self.status == ProviderStatus.CLOSED:
            return True

        if self.status == ProviderStatus.OPEN:
            if time.time() - self.last_failure_time >= self.recovery_timeout:
                self.status = ProviderStatus.HALF_OPEN
                return True
            return False

        # HALF_OPEN - allow one request to test
        return True

    def on_success(self):
        """Handle successful execution"""
        self.failure_count = 0
        self.status = ProviderStatus.CLOSED
        logger.info("Circuit breaker reset to CLOSED")

    def on_failure(self, exception: Exception):
        """Handle failed execution"""
        if isinstance(exception, self.expected_exception):
            self.failure_count += 1
            self.last_failure_time = time.time()

            if self.failure_count >= self.failure_threshold:
                self.status = ProviderStatus.OPEN
                logger.warning(
                    f"Circuit breaker opened after {self.failure_count} failures"
                )
            else:
                logger.warning(
                    f"Circuit breaker failure count: {self.failure_count}/{self.failure_threshold}"
                )


class TokenUsageTracker:
    """Track token usage across AI providers"""

    def __init__(self):
        self.usage: Dict[str, Dict[str, int]] = {}

    def record_usage(self, provider: str, input_tokens: int, output_tokens: int = 0):
        """Record token usage for a provider"""
        if provider not in self.usage:
            self.usage[provider] = {"input": 0, "output": 0, "total": 0}

        self.usage[provider]["input"] += input_tokens
        self.usage[provider]["output"] += output_tokens
        self.usage[provider]["total"] += input_tokens + output_tokens

        logger.info(
            f"Token usage recorded for {provider}: {input_tokens} input, {output_tokens} output"
        )

    def get_usage_summary(self) -> Dict[str, Dict[str, int]]:
        """Get current usage summary"""
        return self.usage.copy()


class AIProvider(ABC):
    """Abstract base class for AI providers"""

    def __init__(self, config: ProviderConfig):
        self.config = config
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=5,
            recovery_timeout=60,
            expected_exception=ProviderUnavailable,
        )
        self.token_tracker = TokenUsageTracker()

    @abstractmethod
    async def generate_suggestions(self, code: str, lang: str) -> List[str]:
        """Generate code suggestions"""
        pass

    def estimate_tokens(self, text: str) -> int:
        """Estimate token count for text (rough approximation)"""
        # Rough approximation: 1 token ≈ 4 characters
        return len(text) // 4

    async def execute_with_circuit_breaker(self, func, *args, **kwargs):
        """Execute function with circuit breaker protection"""
        if not self.circuit_breaker.can_execute():
            raise ProviderUnavailable(f"Circuit breaker is OPEN for {self.config.name}")

        try:
            result = await func(*args, **kwargs)
            self.circuit_breaker.on_success()
            return result
        except Exception as e:
            self.circuit_breaker.on_failure(e)
            raise


class GeminiProvider(AIProvider):
    """Google Gemini AI provider"""

    def __init__(self, api_key: str):
        config = ProviderConfig(
            name="gemini",
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
            timeout=30,
            weight=0.7,
        )
        super().__init__(config)

    async def generate_suggestions(self, code: str, lang: str) -> List[str]:
        """Generate suggestions using Gemini"""

        async def _call_gemini():
            params = {"key": self.config.api_key}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": (
                                    f"Language: {lang}\nCode:\n{code}\n\n"
                                    "Suggest 3-5 concise code improvements "
                                    "(no prose, one sentence each, focus on quality and best practices)."
                                )
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 300,
                    "topP": 0.8,
                },
            }

            timeout = httpx.Timeout(self.config.timeout, connect=10.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    self.config.base_url, params=params, json=payload
                )

                if response.status_code != 200:
                    raise ProviderUnavailable(
                        f"Gemini API error: {response.status_code}"
                    )

                data = response.json()
                return self._parse_gemini_response(data)

        # Track token usage
        input_tokens = self.estimate_tokens(code)

        try:
            result = await self.execute_with_circuit_breaker(_call_gemini)
            self.token_tracker.record_usage(
                "gemini", input_tokens, len(result) * 20
            )  # Estimate output tokens
            return result
        except Exception as e:
            logger.error(f"Gemini provider error: {e}")
            raise ProviderUnavailable(f"Gemini failed: {e}")

    def _parse_gemini_response(self, data: Dict[str, Any]) -> List[str]:
        """Parse Gemini API response"""
        suggestions = []
        try:
            candidates = data.get("candidates", [])
            for candidate in candidates:
                parts = candidate.get("content", {}).get("parts", [])
                for part in parts:
                    text = part.get("text", "")
                    if text:
                        lines = [
                            line.strip().lstrip("-•").strip()
                            for line in text.splitlines()
                        ]
                        suggestions.extend(
                            [line for line in lines if line and len(line) > 10]
                        )
        except Exception as e:
            logger.error(f"Failed to parse Gemini response: {e}")

        return suggestions[:5]  # Return top 5 suggestions


class HuggingFaceProvider(AIProvider):
    """Hugging Face AI provider"""

    def __init__(self, api_token: str):
        config = ProviderConfig(
            name="huggingface",
            api_key=api_token,
            base_url="https://api-inference.huggingface.co/models/bigcode/starcoder2-3b",
            timeout=30,
            weight=0.3,
        )
        super().__init__(config)

    async def generate_suggestions(self, code: str, lang: str) -> List[str]:
        """Generate suggestions using Hugging Face"""

        async def _call_huggingface():
            headers = {"Authorization": f"Bearer {self.config.api_key}"}
            prompt = (
                f"Language: {lang}\n"
                f"Code:\n{code}\n\n"
                "Suggest 3-5 concise code improvements (no prose, one sentence each). Use bullets."
            )

            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 200,
                    "temperature": 0.3,
                    "top_p": 0.8,
                    "do_sample": True,
                },
            }

            timeout = httpx.Timeout(self.config.timeout, connect=10.0)
            async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
                response = await client.post(self.config.base_url, json=payload)

                if response.status_code != 200:
                    raise ProviderUnavailable(
                        f"Hugging Face API error: {response.status_code}"
                    )

                data = response.json()
                return self._parse_huggingface_response(data)

        # Track token usage
        input_tokens = self.estimate_tokens(code)

        try:
            result = await self.execute_with_circuit_breaker(_call_huggingface)
            self.token_tracker.record_usage(
                "huggingface", input_tokens, len(result) * 15
            )  # Estimate output tokens
            return result
        except Exception as e:
            logger.error(f"Hugging Face provider error: {e}")
            raise ProviderUnavailable(f"Hugging Face failed: {e}")

    def _parse_huggingface_response(self, data: Dict[str, Any]) -> List[str]:
        """Parse Hugging Face API response"""
        suggestions = []
        try:
            if isinstance(data, list) and data:
                text = data[0].get("generated_text", "")
            elif isinstance(data, dict):
                text = data.get("generated_text", "")
            else:
                text = ""

            if text:
                lines = [
                    line.strip().lstrip("-•").strip() for line in text.splitlines()
                ]
                suggestions = [line for line in lines if line and len(line) > 10]
        except Exception as e:
            logger.error(f"Failed to parse Hugging Face response: {e}")

        return suggestions[:5]  # Return top 5 suggestions


class AIProviderManager:
    """Production-grade AI provider manager with load balancing and fallback"""

    def __init__(self):
        self.settings = get_settings()
        self.providers: Dict[str, AIProvider] = {}
        self.token_tracker = TokenUsageTracker()
        self._initialize_providers()

    def _initialize_providers(self):
        """Initialize available AI providers"""
        try:
            # Initialize Gemini
            if self.settings.ai.gemini_api_key:
                self.providers["gemini"] = GeminiProvider(
                    self.settings.ai.gemini_api_key
                )
                logger.info("Gemini provider initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini provider: {e}")

        try:
            # Initialize Hugging Face
            if self.settings.ai.huggingface_api_key:
                self.providers["huggingface"] = HuggingFaceProvider(
                    self.settings.ai.huggingface_api_key
                )
                logger.info("Hugging Face provider initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize Hugging Face provider: {e}")

        try:
            # Initialize OpenAI
            if self.settings.ai.openai_api_key:
                # OpenAI provider not implemented yet, but we can add it here
                logger.info("OpenAI provider not yet implemented")
        except Exception as e:
            logger.warning(f"Failed to initialize OpenAI provider: {e}")

        # If no providers are configured, create a mock provider for development
        if not self.providers:
            logger.warning(
                "No AI providers configured, creating mock provider for development"
            )

            # Create a simple mock provider that returns basic suggestions
            class MockProvider:
                def __init__(self):
                    # Mock attributes for compatibility with health checks
                    self.circuit_breaker = type('MockCircuitBreaker', (), {
                        'status': type('MockStatus', (), {'value': 'closed'})(),
                        'failure_count': 0,
                        'last_failure_time': None
                    })()
                    self.token_tracker = type('MockTokenTracker', (), {
                        'get_usage_summary': lambda name=None: {}
                    })()

                async def generate_suggestions(self, code: str, lang: str) -> List[str]:
                    return [
                        "Consider adding type hints for better code clarity",
                        "Add docstrings to document function behavior",
                        "Consider breaking down complex functions into smaller ones",
                    ]

            self.providers["mock"] = MockProvider()
            logger.info("Mock provider initialized for development")

    async def get_suggestions(
        self, code: str, lang: str, max_retries: int = 3
    ) -> List[str]:
        """Get suggestions from AI providers with intelligent fallback"""
        if not code.strip():
            raise ValueError("Code cannot be empty")

        # Try providers in order of preference
        provider_order = ["gemini", "huggingface", "openai", "mock"]

        for provider_name in provider_order:
            if provider_name in self.providers:
                try:
                    result = await self.providers[provider_name].generate_suggestions(
                        code, lang
                    )
                    if result:
                        logger.info(f"Provider {provider_name} succeeded")
                        return result
                except Exception as e:
                    logger.warning(f"Provider {provider_name} failed: {e}")

        # If all providers fail, return empty list
        logger.error("All AI providers failed")
        return []

    def get_provider_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status of all providers"""
        status = {}
        for name, provider in self.providers.items():
            status[name] = {
                "enabled": True,
                "circuit_breaker_status": provider.circuit_breaker.status.value,
                "failure_count": provider.circuit_breaker.failure_count,
                "last_failure": provider.circuit_breaker.last_failure_time,
                "token_usage": provider.token_tracker.get_usage_summary().get(name, {}),
            }
        return status

    def get_token_usage(self) -> Dict[str, Dict[str, int]]:
        """Get overall token usage"""
        return self.token_tracker.get_usage_summary()


# Global provider manager instance
_provider_manager: Optional[AIProviderManager] = None


def get_ai_provider_manager() -> AIProviderManager:
    """Get the global AI provider manager instance"""
    global _provider_manager
    if _provider_manager is None:
        _provider_manager = AIProviderManager()
    return _provider_manager


# Legacy functions for backward compatibility
async def gemini_suggest(code: str, lang: str) -> List[str]:
    """Legacy Gemini suggestion function"""
    manager = get_ai_provider_manager()
    if "gemini" in manager.providers:
        return await manager.providers["gemini"].generate_suggestions(code, lang)
    raise ProviderUnavailable("Gemini provider not available")


async def huggingface_suggest(code: str, lang: str) -> List[str]:
    """Legacy Hugging Face suggestion function"""
    manager = get_ai_provider_manager()
    if "huggingface" in manager.providers:
        return await manager.providers["huggingface"].generate_suggestions(code, lang)
    raise ProviderUnavailable("Hugging Face provider not available")


async def get_suggestions_with_retry(
    code: str, lang: str, attempts: int = 2
) -> List[str]:
    """Legacy retry function - use AIProviderManager instead"""
    manager = get_ai_provider_manager()
    return await manager.get_suggestions(code, lang, max_retries=attempts)


class ProviderUnavailable(Exception):
    """Exception raised when AI provider is unavailable"""

    pass
