from __future__ import annotations

import asyncio
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from .ai_providers import get_ai_provider_manager, ProviderUnavailable
from .code_parser import parse_code
from .complexity_analyzer import compute_complexity

logger = logging.getLogger(__name__)


class AIAnalyzer:
    """Production-grade AI-powered code analyzer"""

    def __init__(self):
        self.ai_manager = get_ai_provider_manager()
        self.cache: Dict[str, Any] = {}
        self.cache_ttl = 3600  # 1 hour
        self.last_cache_cleanup = datetime.now()

    async def analyze_code(
        self,
        code: str,
        language: str,
        show_all: bool = False,
        analysis_type: str = "general",
    ) -> List[str]:
        """Analyze code using AI providers"""
        try:
            # Validate inputs
            if not code.strip():
                raise ValueError("Code cannot be empty")

            if language not in [
                "python",
                "javascript",
                "java",
                "typescript",
                "go",
                "rust",
            ]:
                raise ValueError(f"Unsupported language: {language}")

            # Check cache first
            cache_key = self._generate_cache_key(
                code, language, show_all, analysis_type
            )
            if cached_result := self._get_cached_result(cache_key):
                logger.info(f"Returning cached analysis for {cache_key}")
                return cached_result

            # Parse and analyze code
            parsed_code = parse_code(code, language)
            complexity = compute_complexity(language, code)

            # Generate context-aware prompt
            prompt_context = self._generate_analysis_context(
                code, language, complexity, analysis_type, show_all
            )

            # Get AI suggestions
            suggestions = await self._get_ai_suggestions(prompt_context, language)

            # Post-process suggestions
            processed_suggestions = self._process_suggestions(
                suggestions, code, language, complexity, show_all
            )

            # Cache results
            self._cache_result(cache_key, processed_suggestions)

            # Cleanup old cache entries
            await self._cleanup_cache()

            return processed_suggestions

        except Exception as e:
            logger.error(f"Code analysis failed: {e}")
            # Return fallback suggestions
            return self._get_fallback_suggestions(code, language, complexity)

    def _generate_cache_key(
        self, code: str, language: str, show_all: bool, analysis_type: str
    ) -> str:
        """Generate cache key for analysis results"""
        import hashlib

        # Create a hash of the code content
        code_hash = hashlib.md5(code.encode()).hexdigest()

        return f"{language}:{analysis_type}:{show_all}:{code_hash}"

    def _get_cached_result(self, cache_key: str) -> Optional[List[str]]:
        """Get cached analysis result"""
        if cache_key in self.cache:
            cache_entry = self.cache[cache_key]
            if datetime.now() - cache_entry["timestamp"] < timedelta(
                seconds=self.cache_ttl
            ):
                return cache_entry["suggestions"]
            else:
                # Remove expired entry
                del self.cache[cache_key]

        return None

    def _cache_result(self, cache_key: str, suggestions: List[str]):
        """Cache analysis result"""
        self.cache[cache_key] = {
            "suggestions": suggestions,
            "timestamp": datetime.now(),
        }

    async def _cleanup_cache(self):
        """Clean up old cache entries"""
        now = datetime.now()
        if now - self.last_cache_cleanup > timedelta(minutes=5):
            expired_keys = [
                key
                for key, entry in self.cache.items()
                if now - entry["timestamp"] > timedelta(seconds=self.cache_ttl)
            ]

            for key in expired_keys:
                del self.cache[key]

            self.last_cache_cleanup = now
            logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")

    def _generate_analysis_context(
        self,
        code: str,
        language: str,
        complexity: float,
        analysis_type: str,
        show_all: bool,
    ) -> str:
        """Generate context-aware analysis prompt"""
        context_parts = [
            f"Language: {language}",
            f"Code Complexity: {complexity}/10",
            f"Analysis Type: {analysis_type}",
            f"Show All: {show_all}",
        ]

        if analysis_type == "security":
            context_parts.append(
                "Focus on security vulnerabilities, input validation, and secure coding practices"
            )
        elif analysis_type == "performance":
            context_parts.append(
                "Focus on performance optimization, memory usage, and algorithmic efficiency"
            )
        elif analysis_type == "maintainability":
            context_parts.append(
                "Focus on code structure, readability, and maintainability"
            )
        else:
            context_parts.append(
                "Focus on general code quality, best practices, and improvements"
            )

        if complexity > 7:
            context_parts.append(
                "High complexity detected - prioritize simplification and refactoring"
            )
        elif complexity < 3:
            context_parts.append(
                "Low complexity - focus on optimization and edge cases"
            )

        context_parts.append(f"\nCode:\n{code}")

        return "\n".join(context_parts)

    async def _get_ai_suggestions(self, context: str, language: str) -> List[str]:
        """Get AI suggestions using the provider manager"""
        try:
            # Use the AI provider manager for suggestions
            suggestions = await self.ai_manager.get_suggestions(context, language)

            if not suggestions:
                logger.warning("No AI suggestions received")
                return []

            return suggestions

        except ProviderUnavailable as e:
            logger.error(f"AI provider unavailable: {e}")
            return []
        except Exception as e:
            logger.error(f"Failed to get AI suggestions: {e}")
            return []

    def _process_suggestions(
        self,
        suggestions: List[str],
        code: str,
        language: str,
        complexity: float,
        show_all: bool,
    ) -> List[str]:
        """Process and filter AI suggestions"""
        if not suggestions:
            return []

        processed = []

        for suggestion in suggestions:
            # Clean up suggestion text
            cleaned = suggestion.strip()
            if not cleaned or len(cleaned) < 10:
                continue

            # Remove common prefixes
            for prefix in ["- ", "• ", "* ", "1. ", "2. ", "3. "]:
                if cleaned.startswith(prefix):
                    cleaned = cleaned[len(prefix) :]
                    break

            # Filter based on show_all flag
            if not show_all:
                # Only show high-impact suggestions when show_all is False
                if self._is_high_impact_suggestion(cleaned, complexity):
                    processed.append(cleaned)
            else:
                processed.append(cleaned)

            # Limit number of suggestions
            if len(processed) >= 5:
                break

        return processed

    def _is_high_impact_suggestion(self, suggestion: str, complexity: float) -> bool:
        """Determine if a suggestion is high-impact"""
        high_impact_keywords = [
            "security",
            "vulnerability",
            "performance",
            "memory leak",
            "race condition",
            "deadlock",
            "buffer overflow",
            "sql injection",
            "refactor",
            "simplify",
            "optimize",
            "critical",
        ]

        suggestion_lower = suggestion.lower()

        # Check for high-impact keywords
        for keyword in high_impact_keywords:
            if keyword in suggestion_lower:
                return True

        # High complexity code gets more suggestions
        if complexity > 7:
            return True

        return False

    def _get_fallback_suggestions(
        self, code: str, language: str, complexity: float
    ) -> List[str]:
        """Get fallback suggestions when AI analysis fails"""
        fallback_suggestions = []

        # Language-specific fallback suggestions
        if language == "python":
            if complexity > 7:
                fallback_suggestions.append(
                    "Consider breaking down complex functions into smaller, more focused functions"
                )
            if "def " in code and "class " not in code:
                fallback_suggestions.append(
                    "Consider organizing code into classes for better structure"
                )
            if "import *" in code:
                fallback_suggestions.append(
                    "Avoid wildcard imports - import only what you need"
                )

        elif language in ["javascript", "typescript"]:
            if complexity > 7:
                fallback_suggestions.append(
                    "Consider using early returns to reduce nesting and complexity"
                )
            if "var " in code:
                fallback_suggestions.append(
                    "Use 'const' or 'let' instead of 'var' for better scoping"
                )
            if "function(" in code:
                fallback_suggestions.append(
                    "Consider using arrow functions for consistency"
                )

        elif language == "java":
            if complexity > 7:
                fallback_suggestions.append(
                    "Consider extracting complex logic into separate methods"
                )
            if "public static void main" in code:
                fallback_suggestions.append(
                    "Consider separating business logic from the main method"
                )

        # General fallback suggestions
        if len(code.splitlines()) > 50:
            fallback_suggestions.append(
                "Consider breaking large files into smaller, focused modules"
            )

        if not fallback_suggestions:
            fallback_suggestions.append(
                "Review code for potential improvements in readability and maintainability"
            )

        return fallback_suggestions[:3]  # Limit to 3 fallback suggestions

    async def get_analysis_metrics(self) -> Dict[str, Any]:
        """Get analysis metrics and statistics"""
        try:
            ai_status = self.ai_manager.get_provider_status()
            token_usage = self.ai_manager.get_token_usage()

            return {
                "ai_providers": ai_status,
                "token_usage": token_usage,
                "cache_stats": {
                    "total_entries": len(self.cache),
                    "cache_hit_rate": "N/A",  # Would need to track hits/misses
                },
                "analysis_count": len(self.cache),
                "last_cleanup": self.last_cache_cleanup.isoformat(),
            }

        except Exception as e:
            logger.error(f"Failed to get analysis metrics: {e}")
            return {"error": str(e)}


# Global analyzer instance
_analyzer = AIAnalyzer()


async def analyze_code(
    code: str, language: str, show_all: bool = False, analysis_type: str = "general"
) -> List[str]:
    """Main function to analyze code using AI"""
    return await _analyzer.analyze_code(code, language, show_all, analysis_type)


async def get_analysis_metrics() -> Dict[str, Any]:
    """Get analysis metrics"""
    return await _analyzer.get_analysis_metrics()


# Legacy function for backward compatibility
async def get_suggestions(code: str, language: str) -> List[str]:
    """Legacy function for backward compatibility"""
    return await analyze_code(code, language, show_all=False)
