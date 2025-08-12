from __future__ import annotations

from pathlib import Path
from typing import Dict, List


def _sample_repo_py(
    root: Path, max_files: int = 100, max_lines: int = 4000
) -> List[str]:
    texts: List[str] = []
    total = 0
    for p in root.rglob("*.py"):
        parts = "/".join(p.parts)
        if any(ex in parts for ex in ("/.", "venv/", "site-packages/", "__pycache__")):
            continue
        try:
            t = p.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        lines = t.splitlines()
        texts.extend(lines[: min(len(lines), max_lines - total)])
        total += len(lines)
        if total >= max_lines or len(texts) >= max_lines or max_files <= 0:
            break
        max_files -= 1
    return texts


def _indent_size(lines: List[str]) -> int:
    counts: Dict[int, int] = {}
    for line in lines:
        if line.startswith(" ") and line.strip():
            n = len(line) - len(line.lstrip(" "))
            # round to nearest 2 or 4
            guess = 4 if n % 4 == 0 else 2
            counts[guess] = counts.get(guess, 0) + 1
    return 4 if counts.get(4, 0) >= counts.get(2, 0) else 2


def _comma_space_ratio(lines: List[str]) -> float:
    with_sp = 0
    without = 0
    for line in lines:
        with_sp += line.count(", ")
        # count commas not followed by space
        without += sum(
            1
            for i, ch in enumerate(line)
            if ch == "," and (i + 1 >= len(line) or line[i + 1] != " ")
        )
    total = with_sp + without
    return (with_sp / total) if total else 1.0


def _quote_pref(lines: List[str]) -> str:
    s = sum(line.count("'") for line in lines)
    d = sum(line.count('"') for line in lines)
    return "single" if s >= d else "double"


def _line_len_p95(lines: List[str]) -> int:
    if not lines:
        return 88
    lens = sorted(len(line) for line in lines)
    idx = int(0.95 * (len(lens) - 1))
    return max(60, lens[idx])


def train_style(root_path: str) -> Dict:
    root = Path(root_path)
    lines = _sample_repo_py(root)
    return {
        "indent": _indent_size(lines),
        "comma_space_ratio": _comma_space_ratio(lines),
        "quote": _quote_pref(lines),
        "p95_len": _line_len_p95(lines),
    }


def analyze_snippet(snippet: str, style: Dict) -> Dict:
    lines = snippet.splitlines() or [snippet]
    deviations: List[Dict] = []
    score = 1.0

    # indent check
    for line in lines:
        if line.startswith(" ") and line.strip():
            n = len(line) - len(line.lstrip(" "))
            if style["indent"] == 4 and n % 4 != 0:
                deviations.append(
                    {
                        "rule": "indent-4",
                        "evidence": line[:20],
                        "suggestion": "Use multiples of 4 spaces",
                    }
                )
                score -= 0.15
                break
            if style["indent"] == 2 and n % 2 != 0:
                deviations.append(
                    {
                        "rule": "indent-2",
                        "evidence": line[:20],
                        "suggestion": "Use multiples of 2 spaces",
                    }
                )
                score -= 0.15
                break

    # comma spacing
    has_bad = any("," in line and ", " not in line for line in lines)
    if style["comma_space_ratio"] > 0.6 and has_bad:
        deviations.append(
            {
                "rule": "space-after-comma",
                "evidence": "comma without space",
                "suggestion": "Insert space after comma",
            }
        )
        score -= 0.15

    # quotes preference
    single_pref = style["quote"] == "single"
    uses_double = any('"' in line for line in lines)
    uses_single = any("'" in line for line in lines)
    if single_pref and uses_double and not uses_single:
        deviations.append(
            {
                "rule": "prefer-single-quotes",
                "evidence": '"..."',
                "suggestion": "Use single quotes where possible",
            }
        )
        score -= 0.1
    if (not single_pref) and uses_single and not uses_double:
        deviations.append(
            {
                "rule": "prefer-double-quotes",
                "evidence": "'...'",
                "suggestion": "Use double quotes where possible",
            }
        )
        score -= 0.1

    # line length
    if any(len(line) > style["p95_len"] for line in lines):
        deviations.append(
            {
                "rule": "line-length",
                "evidence": f">{style['p95_len']} chars",
                "suggestion": "Wrap or refactor long lines",
            }
        )
        score -= 0.2

    return {"score": max(0.0, round(score, 2)), "deviations": deviations}
