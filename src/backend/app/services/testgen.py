"""Smart test generation — AST-based function signature parsing.

Generates meaningful pytest stubs by analyzing function signatures,
type hints, and parameter types. Zero external API dependencies.
"""

from __future__ import annotations

import ast
import os
from typing import Dict, List, Optional, Any


def _has_ai_keys() -> bool:
    return any(
        os.getenv(k) for k in ("OPENAI_API_KEY", "GEMINI_API_KEY", "HF_API_TOKEN")
    )


def generate_tests(
    language: str, file: str | None, code: str, function: str | None
) -> Dict[str, Any]:
    """Generate test stubs for the given code."""
    language = (language or "python").lower()

    if language != "python":
        return {
            "framework": "pytest",
            "test_file": "tests/test_generated.py",
            "content": "# Unsupported language for now; provide Python code.\n",
            "function_count": 0,
            "coverage": 0.0,
        }

    # Parse all functions from the code
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return {
            "framework": "pytest",
            "test_file": "tests/test_generated.py",
            "content": "# Could not parse code — syntax error.\n",
            "function_count": 0,
            "coverage": 0.0,
        }

    functions = _extract_functions(tree)

    # Filter to specific function if requested
    if function:
        functions = [f for f in functions if f["name"] == function]

    if not functions:
        func = function or "target_fn"
        return {
            "framework": "pytest",
            "test_file": f"tests/test_{func}_generated.py",
            "content": f"# No functions found to test.\n",
            "function_count": 0,
            "coverage": 0.0,
        }

    # Generate import path
    module_import = "target"
    if file:
        path = file.rstrip(".py").replace("/", ".").replace("\\", ".")
        module_import = path

    # Build test content
    content = _build_test_file(functions, module_import)

    first_func = functions[0]["name"] if functions else "module"

    return {
        "framework": "pytest",
        "test_file": f"tests/test_{first_func}_generated.py",
        "content": content,
        "function_count": len(functions),
        "coverage": min(len(functions) * 15, 80),  # Estimate
    }


def _extract_functions(tree: ast.Module) -> List[Dict[str, Any]]:
    """Extract function signatures from AST."""
    functions = []

    for node in ast.walk(tree):
        if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue

        # Skip private/dunder
        if node.name.startswith("_"):
            continue

        func_info: Dict[str, Any] = {
            "name": node.name,
            "is_async": isinstance(node, ast.AsyncFunctionDef),
            "params": [],
            "return_type": None,
            "has_docstring": ast.get_docstring(node) is not None,
            "decorators": [_get_decorator_name(d) for d in node.decorator_list],
        }

        # Parse return type
        if node.returns:
            func_info["return_type"] = _annotation_to_str(node.returns)

        # Parse parameters (skip self/cls)
        for arg in node.args.args:
            if arg.arg in ("self", "cls"):
                continue
            param = {
                "name": arg.arg,
                "type": _annotation_to_str(arg.annotation) if arg.annotation else None,
            }
            func_info["params"].append(param)

        # Parse defaults
        defaults = node.args.defaults
        num_params = len(func_info["params"])
        num_defaults = len(defaults)
        for i, default in enumerate(defaults):
            param_idx = num_params - num_defaults + i
            if 0 <= param_idx < num_params:
                func_info["params"][param_idx]["default"] = _get_default_value(default)

        functions.append(func_info)

    return functions


def _get_decorator_name(node: ast.expr) -> str:
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        return f"{_get_decorator_name(node.value)}.{node.attr}"
    if isinstance(node, ast.Call):
        return _get_decorator_name(node.func)
    return "unknown"


def _annotation_to_str(node: Optional[ast.expr]) -> Optional[str]:
    if node is None:
        return None
    if isinstance(node, ast.Constant):
        return repr(node.value)
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        return f"{_annotation_to_str(node.value)}.{node.attr}"
    if isinstance(node, ast.Subscript):
        base = _annotation_to_str(node.value)
        if isinstance(node.slice, ast.Tuple):
            args = ", ".join(_annotation_to_str(e) for e in node.slice.elts)
            return f"{base}[{args}]"
        return f"{base}[{_annotation_to_str(node.slice)}]"
    return "Any"


def _get_default_value(node: ast.expr) -> Any:
    if isinstance(node, ast.Constant):
        return node.value
    if isinstance(node, ast.Name) and node.id == "None":
        return None
    if isinstance(node, (ast.List, ast.Tuple)):
        return []
    if isinstance(node, ast.Dict):
        return {}
    return "..."


def _build_test_file(functions: List[Dict], module_import: str) -> str:
    """Build a complete test file from function info."""
    parts = [
        'import pytest',
        'import importlib',
        '',
        f'mod = importlib.import_module("{module_import}")',
        '',
        '',
    ]

    for func in functions:
        parts.extend(_build_function_tests(func))

    return "\n".join(parts)


def _build_function_tests(func: Dict[str, Any]) -> List[str]:
    """Build test cases for a single function."""
    name = func["name"]
    params = func["params"]
    return_type = func["return_type"]
    is_async = func["is_async"]

    lines = []

    # Test 1: Basic existence and callable
    if is_async:
        lines.append(f'@pytest.mark.asyncio')
        lines.append(f'async def test_{name}_exists():')
    else:
        lines.append(f'def test_{name}_exists():')
    lines.append(f'    """Test that {name} exists and is callable."""')
    lines.append(f'    assert hasattr(mod, "{name}")')
    lines.append(f'    assert callable(getattr(mod, "{name}"))')
    lines.append('')
    lines.append('')

    # Test 2: Basic call with sample args
    sample_args = _generate_sample_args(params)
    args_str = ", ".join(f"{p['name']}={v}" for p, v in zip(params, sample_args))

    if is_async:
        lines.append(f'@pytest.mark.asyncio')
        lines.append(f'async def test_{name}_basic_call():')
        lines.append(f'    """Test {name} with basic arguments."""')
        if args_str:
            lines.append(f'    result = await mod.{name}({args_str})')
        else:
            lines.append(f'    result = await mod.{name}()')
    else:
        lines.append(f'def test_{name}_basic_call():')
        lines.append(f'    """Test {name} with basic arguments."""')
        if args_str:
            lines.append(f'    result = mod.{name}({args_str})')
        else:
            lines.append(f'    result = mod.{name}()')

    # Add assertion based on return type
    if return_type == "bool":
        lines.append(f'    assert isinstance(result, bool)')
    elif return_type == "str":
        lines.append(f'    assert isinstance(result, str)')
    elif return_type == "int":
        lines.append(f'    assert isinstance(result, int)')
    elif return_type == "float":
        lines.append(f'    assert isinstance(result, (int, float))')
    elif return_type and "List" in return_type:
        lines.append(f'    assert isinstance(result, list)')
    elif return_type and "Dict" in return_type:
        lines.append(f'    assert isinstance(result, dict)')
    elif return_type == "None":
        lines.append(f'    assert result is None')
    else:
        lines.append(f'    assert result is not None  # TODO: refine assertion')
    lines.append('')
    lines.append('')

    # Test 3: Edge cases for parameters with specific types
    edge_tests = _generate_edge_case_tests(name, params, is_async)
    lines.extend(edge_tests)

    return lines


def _generate_sample_args(params: List[Dict]) -> List[str]:
    """Generate sample argument values based on type hints."""
    samples = []
    for param in params:
        ptype = param.get("type", "")
        default = param.get("default")

        if default is not None and default != "...":
            samples.append(repr(default))
        elif ptype == "str":
            samples.append('"test"')
        elif ptype == "int":
            samples.append("1")
        elif ptype == "float":
            samples.append("1.0")
        elif ptype == "bool":
            samples.append("True")
        elif ptype and "List" in ptype:
            samples.append("[]")
        elif ptype and "Dict" in ptype:
            samples.append("{}")
        elif ptype and "Optional" in ptype:
            samples.append("None")
        else:
            samples.append('"test"')

    return samples


def _generate_edge_case_tests(
    name: str, params: List[Dict], is_async: bool
) -> List[str]:
    """Generate edge case tests based on parameter types."""
    lines = []

    # Empty string test for string params
    str_params = [p for p in params if p.get("type") == "str"]
    if str_params:
        call = "await " if is_async else ""
        # Use separate list entries for decorator and def to produce clean Python output
        if is_async:
            lines.append('@pytest.mark.asyncio')
            lines.append(f'async def test_{name}_empty_string():')
        else:
            lines.append(f'def test_{name}_empty_string():')
        lines.append(f'    """Test {name} with empty string input."""')
        args = []
        for p in params:
            if p.get("type") == "str":
                args.append(f'{p["name"]}=""')
            else:
                args.append(f'{p["name"]}={_generate_sample_args([p])[0]}')
        args_str = ", ".join(args)
        lines.append(f'    try:')
        lines.append(f'        result = {call}mod.{name}({args_str})')
        lines.append(f'        # Should either return a result or raise ValueError')
        lines.append(f'    except (ValueError, TypeError):')
        lines.append(f'        pass  # Expected for empty input')
        lines.append('')
        lines.append('')

    return lines
