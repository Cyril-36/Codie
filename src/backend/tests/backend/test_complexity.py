import pytest

from backend.app.services.complexity_analyzer import compute_complexity


def test_python_complexity_if_else():
    code = "def foo(x):\n    if x:\n        return 1\n    else:\n        return 0\n"
    c = compute_complexity("python", code)
    assert c >= 2, f"expected complexity >= 2, got {c}"
