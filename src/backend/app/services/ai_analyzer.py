"""Code analysis engine — local-first, AI-optional.

Local analysis (AST, metrics, security, complexity) runs always and
requires zero API keys.  When an AI provider key is available, the AI
layer enriches the results but never replaces them.
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from .smart_suggestions import generate_suggestions, generate_structured_suggestions
from .code_metrics import compute_metrics
from .complexity_analyzer import compute_complexity

logger = logging.getLogger(__name__)


class AIAnalyzer:
    """Local-first code analyzer with optional AI enrichment."""

    def __init__(self):
        self.cache: Dict[str, Any] = {}
        self.cache_ttl = 3600  # 1 hour
        self.last_cache_cleanup = datetime.now()

    # ── public API ───────────────────────────────────────────────────

    async def analyze_code(
        self,
        code: str,
        language: str,
        show_all: bool = False,
        analysis_type: str = "general",
    ) -> List[str]:
        """Analyze code and return a list of suggestion strings.

        1. Always runs the local analysis engine (zero dependencies).
        2. Optionally enriches with AI suggestions when a provider key
           is configured.
        """
        if not code.strip():
            return ["Code is empty — nothing to analyze."]

        # Normalise language
        language = language.lower()
        if language not in (
            "python", "javascript", "typescript", "js", "ts", "java", "go", "rust",
        ):
            return [f"Language '{language}' is not yet supported for deep analysis."]

        # Cache check
        cache_key = self._cache_key(code, language, show_all, analysis_type)
        if cached := self._get_cached(cache_key):
            return cached

        # ── 1. Local analysis (always) ───────────────────────────────
        local_suggestions = generate_suggestions(code, language, show_all)

        # ── 2. AI enrichment (optional) ──────────────────────────────
        ai_suggestions = await self._try_ai_suggestions(
            code, language, analysis_type, show_all
        )

        # Merge: local first, then any unique AI additions
        merged = self._merge_suggestions(local_suggestions, ai_suggestions)

        # Cap at a reasonable number
        max_count = 30 if show_all else 15
        result = merged[:max_count]

        self._cache_set(cache_key, result)
        await self._cleanup_cache()

        return result

    async def analyze_code_structured(
        self,
        code: str,
        language: str,
        show_all: bool = False,
        analysis_type: str = "general",
    ) -> Dict[str, Any]:
        """Full structured analysis with metrics, complexity, and suggestions."""
        language = language.lower()

        suggestions = generate_structured_suggestions(code, language, show_all)
        metrics = compute_metrics(code, language)
        complexity = compute_complexity(language, code)

        # AI enrichment (best-effort)
        ai_extras = await self._try_ai_suggestions(
            code, language, analysis_type, show_all
        )

        return {
            "suggestions": suggestions,
            "ai_suggestions": ai_extras,
            "metrics": metrics,
            "complexity": complexity,
            "analysis_type": analysis_type,
            "engine": "local" if not ai_extras else "local+ai",
        }

    async def get_analysis_metrics(self) -> Dict[str, Any]:
        """Return operational metrics about the analyzer."""
        ai_status = {}
        token_usage = {}
        try:
            from .ai_providers import get_ai_provider_manager
            mgr = get_ai_provider_manager()
            ai_status = mgr.get_provider_status()
            token_usage = mgr.get_token_usage()
        except Exception:
            pass

        return {
            "engine": "local-first",
            "ai_providers": ai_status,
            "token_usage": token_usage,
            "cache_stats": {
                "total_entries": len(self.cache),
            },
            "last_cleanup": self.last_cache_cleanup.isoformat(),
        }

    # ── AI layer (best-effort) ───────────────────────────────────────

    async def _try_ai_suggestions(
        self,
        code: str,
        language: str,
        analysis_type: str,
        show_all: bool,
    ) -> List[str]:
        """Try to get AI suggestions; return [] on any failure."""
        try:
            from .ai_providers import get_ai_provider_manager, ProviderUnavailable

            mgr = get_ai_provider_manager()

            # Quick check — if no provider has a key, skip entirely
            status = mgr.get_provider_status()
            if not any(p.get("enabled") for p in status.values()):
                return []

            context = self._build_ai_context(code, language, analysis_type, show_all)
            suggestions = await asyncio.wait_for(
                mgr.get_suggestions(context, language),
                timeout=15.0,
            )
            return self._clean_ai_suggestions(suggestions or [])

        except asyncio.TimeoutError:
            logger.warning("AI suggestion request timed out (15 s)")
            return []
        except Exception as e:
            logger.debug(f"AI enrichment skipped: {e}")
            return []

    @staticmethod
    def _build_ai_context(
        code: str, language: str, analysis_type: str, show_all: bool
    ) -> str:
        parts = [
            f"Language: {language}",
            f"Analysis type: {analysis_type}",
            f"Show all: {show_all}",
            "",
            "Code:",
            code,
        ]
        return "\n".join(parts)

    @staticmethod
    def _clean_ai_suggestions(raw: List[str]) -> List[str]:
        cleaned = []
        for s in raw:
            s = s.strip()
            if len(s) < 10:
                continue
            for prefix in ("- ", "• ", "* ", "1. ", "2. ", "3. "):
                if s.startswith(prefix):
                    s = s[len(prefix):]
                    break
            cleaned.append(s)
        return cleaned

    # ── merge helpers ────────────────────────────────────────────────

    @staticmethod
    def _merge_suggestions(
        local: List[str], ai: List[str]
    ) -> List[str]:
        """Combine local + AI, avoiding near-duplicates."""
        seen = {s.lower()[:60] for s in local}
        merged = list(local)
        for s in ai:
            key = s.lower()[:60]
            if key not in seen:
                seen.add(key)
                merged.append(s)
        return merged

    # ── caching ──────────────────────────────────────────────────────

    def _cache_key(
        self, code: str, language: str, show_all: bool, analysis_type: str
    ) -> str:
        h = hashlib.md5(code.encode()).hexdigest()
        return f"{language}:{analysis_type}:{show_all}:{h}"

    def _get_cached(self, key: str) -> Optional[List[str]]:
        entry = self.cache.get(key)
        if entry is None:
            return None
        if datetime.now() - entry["ts"] < timedelta(seconds=self.cache_ttl):
            return entry["data"]
        del self.cache[key]
        return None

    def _cache_set(self, key: str, data: List[str]) -> None:
        self.cache[key] = {"data": data, "ts": datetime.now()}

    async def _cleanup_cache(self) -> None:
        now = datetime.now()
        if now - self.last_cache_cleanup < timedelta(minutes=5):
            return
        cutoff = now - timedelta(seconds=self.cache_ttl)
        expired = [k for k, v in self.cache.items() if v["ts"] < cutoff]
        for k in expired:
            del self.cache[k]
        self.last_cache_cleanup = now


# ── module-level convenience functions ───────────────────────────────

_analyzer = AIAnalyzer()


async def analyze_code(
    code: str, language: str, show_all: bool = False, analysis_type: str = "general"
) -> List[str]:
    """Primary entry point — returns list of suggestion strings."""
    return await _analyzer.analyze_code(code, language, show_all, analysis_type)


async def analyze_code_structured(
    code: str, language: str, show_all: bool = False, analysis_type: str = "general"
) -> Dict[str, Any]:
    """Structured entry point — returns dict with suggestions, metrics, complexity."""
    return await _analyzer.analyze_code_structured(code, language, show_all, analysis_type)


async def get_analysis_metrics() -> Dict[str, Any]:
    return await _analyzer.get_analysis_metrics()


# Legacy alias
async def get_suggestions(code: str, language: str) -> List[str]:
    return await analyze_code(code, language, show_all=False)
