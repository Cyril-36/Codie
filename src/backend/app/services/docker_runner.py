from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, List, Optional


def _which(cmd: str) -> bool:
    return shutil.which(cmd) is not None


def _tail(s: str, n: int = 2000) -> str:
    return s[-n:]


def run_in_container(
    image: str,
    cmd: List[str],
    files: Optional[Dict[str, str]] = None,
    workdir: str = "/work",
    memory: str = "512m",
    cpus: str = "1.0",
) -> Dict:
    """
    Run a command inside a short-lived docker container with resource limits.
    Returns {exit_code, real_s?, stdout_tail, stderr_tail}
    """
    if not _which("docker"):
        return {"exit_code": -127, "error": "docker not available"}

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        (tmp_path / "work").mkdir(parents=True, exist_ok=True)
        if files:
            for name, content in files.items():
                p = tmp_path / "work" / name
                p.parent.mkdir(parents=True, exist_ok=True)
                p.write_text(content, encoding="utf-8")

        shell_cmd = " ".join(subprocess.list2cmdline(cmd))
        wrapped = f"time -p {shell_cmd}"
        docker_cmd = [
            "docker",
            "run",
            "--rm",
            "-v",
            f"{(tmp_path / 'work').as_posix()}:{workdir}",
            "-w",
            workdir,
            "--memory",
            memory,
            "--cpus",
            cpus,
            image,
            "sh",
            "-lc",
            wrapped,
        ]
        proc = subprocess.run(docker_cmd, capture_output=True, text=True)
        out = proc.stdout
        err = proc.stderr

        real_s = None
        for line in err.splitlines():
            # time -p emits: real X.XX
            if line.startswith("real "):
                try:
                    real_s = float(line.split()[1])
                except Exception:
                    pass
        result = {
            "exit_code": proc.returncode,
            "real_s": real_s,
            "stdout_tail": _tail(out),
            "stderr_tail": _tail(err),
        }
        return result


def default_python(code: str | None) -> Dict:
    image = "python:3.12-alpine"
    program = code or "print('ok')"
    files = {"main.py": program}
    return run_in_container(image, ["python", "main.py"], files=files)
