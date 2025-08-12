from __future__ import annotations

from typing import Dict, Tuple

# Very small in-memory counter registry for Prometheus exposition.
# Not thread/process safe; suitable for dev/single-instance and CI.
_counters: Dict[str, Dict[Tuple[Tuple[str, str], ...], int]] = {}


def _label_key(labels: Dict[str, str]) -> Tuple[Tuple[str, str], ...]:
    return tuple(sorted(labels.items()))


def inc(name: str, labels: Dict[str, str]) -> None:
    bucket = _counters.setdefault(name, {})
    key = _label_key(labels)
    bucket[key] = bucket.get(key, 0) + 1


def reset() -> None:
    """Reset all metrics counters for testing purposes."""
    global _counters
    _counters.clear()


def render_prom() -> str:
    lines: list[str] = []
    for name, series in sorted(_counters.items()):
        for key, value in series.items():
            if key:
                label_str = ",".join(f'{k}="{v}"' for k, v in key)
                lines.append(f"{name}{{{label_str}}} {value}")
            else:
                lines.append(f"{name} {value}")
    return "\n".join(lines) + ("\n" if lines else "")
