import pytest

from backend.app.services.complexity_analyzer import compute_complexity


def test_js_complexity_if_else():
    code = "function foo(x){ if(x){ return 1; } else { return 0; } }"
    c = compute_complexity("javascript", code)
    assert c >= 2, f"expected complexity >= 2, got {c}"


def test_ts_complexity_if_else():
    code = "function foo(x: number){ if(x){ return 1; } else { return 0; } }"
    c = compute_complexity("ts", code)
    assert c >= 2, f"expected complexity >= 2, got {c}"
