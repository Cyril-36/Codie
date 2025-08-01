from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from .main import app


def export_openapi_json(output_path: str) -> None:
    schema: dict[str, Any] = app.openapi()
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2, sort_keys=True, ensure_ascii=False)
    print(f"Wrote OpenAPI schema to {out.resolve()}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Export FastAPI OpenAPI schema to a JSON file.")
    parser.add_argument(
        "-o",
        "--output",
        default=str(Path(__file__).resolve().parents[2] / "docs" / "openapi" / "openapi.json"),
        help="Output file path (default: docs/openapi/openapi.json)",
    )
    args = parser.parse_args()
    export_openapi_json(args.output)


if __name__ == "__main__":
    main()
