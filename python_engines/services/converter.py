"""Media file conversion service powered by FFmpeg & FFprobe."""

import os
import re
import subprocess
import time
from pathlib import Path

from services.job_manager import JobManager
from services.security import sanitize_filename


VIDEO_CONVERT_FORMATS = {"mp4", "mkv", "webm", "mov", "avi", "gif"}
AUDIO_CONVERT_FORMATS = {"mp3", "m4a", "wav", "flac", "opus", "ogg"}

_TIME_REGEX = re.compile(r"^\d{1,2}:\d{2}(:\d{2}(\.\d+)?)?$")


def probe_duration(input_path: Path) -> float:
    """Return media duration in seconds using ffprobe, or 0.0 if unknown."""
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(input_path),
    ]
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
        val = (proc.stdout or "").strip()
        return float(val) if val else 0.0
    except Exception:
        return 0.0


def _format_duration(seconds: float) -> str:
    if seconds <= 0:
        return ""
    total = int(round(seconds))
    hrs, rem = divmod(total, 3600)
    mins, secs = divmod(rem, 60)
    if hrs > 0:
        return f"{hrs}:{mins:02d}:{secs:02d}"
    return f"{mins}:{secs:02d}"


def _validate_time_str(raw: str | None) -> str | None:
    cleaned = (raw or "").strip()
    if not cleaned:
        return None
    if _TIME_REGEX.match(cleaned) or cleaned.replace(".", "", 1).isdigit():
        return cleaned
    raise ValueError(f"Invalid timestamp format: {cleaned} (use HH:MM:SS or seconds)")


def run_convert_job(
    job_id: str,
    input_path: Path,
    original_name: str,
    target_format: str,
    quality: str,
    converted_dir: Path,
    job_manager: JobManager,
    audio_bitrate: str = "192",
    start_time: str | None = None,
    end_time: str | None = None,
) -> None:
    """Convert a local media file using FFmpeg and stream progress to JobManager."""
    fmt = target_format.lower().strip()
    if fmt not in VIDEO_CONVERT_FORMATS and fmt not in AUDIO_CONVERT_FORMATS:
        job_manager.update_job(
            job_id,
            status="error",
            error=f"Unsupported target format: {fmt}",
            message="Unsupported format",
        )
        return

    if not input_path.exists():
        job_manager.update_job(
            job_id,
            status="error",
            error="Input file does not exist.",
            message="File missing",
        )
        return

    try:
        trim_start = _validate_time_str(start_time)
        trim_end = _validate_time_str(end_time)
    except ValueError as exc:
        job_manager.update_job(job_id, status="error", error=str(exc), message="Invalid trim time")
        return

    converted_dir.mkdir(parents=True, exist_ok=True)
    stem = sanitize_filename(Path(original_name).stem, fallback="converted")
    output_filename = f"{stem} [{job_id}].{fmt}"
    output_path = converted_dir / output_filename

    duration_sec = probe_duration(input_path)
    job_manager.update_job(
        job_id,
        status="running",
        progress=1.0,
        duration=_format_duration(duration_sec),
        message="Converting...",
    )

    cmd: list[str] = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error"]
    if trim_start:
        cmd.extend(["-ss", trim_start])
    cmd.extend(["-i", str(input_path)])
    if trim_end:
        cmd.extend(["-to", trim_end])

    bitrate = audio_bitrate if audio_bitrate in {"320", "256", "192", "128"} else "192"

    if fmt in AUDIO_CONVERT_FORMATS:
        cmd.append("-vn")
        codec_map = {
            "mp3": ["-c:a", "libmp3lame", "-b:a", f"{bitrate}k"],
            "m4a": ["-c:a", "aac", "-b:a", f"{bitrate}k"],
            "wav": ["-c:a", "pcm_s16le"],
            "flac": ["-c:a", "flac"],
            "opus": ["-c:a", "libopus", "-b:a", f"{bitrate}k"],
            "ogg": ["-c:a", "libvorbis", "-b:a", f"{bitrate}k"],
        }
        cmd.extend(codec_map[fmt])
    elif fmt == "gif":
        scale_h = quality if quality.isdigit() else "480"
        cmd.extend(
            [
                "-vf",
                f"fps=15,scale=-2:{scale_h}:flags=lanczos",
                "-loop",
                "0",
            ]
        )
    else:
        if quality.isdigit():
            cmd.extend(["-vf", f"scale=-2:{int(quality)}"])

        if fmt == "webm":
            cmd.extend(["-c:v", "libvpx-vp9", "-crf", "30", "-b:v", "0", "-c:a", "libopus", "-b:a", f"{bitrate}k"])
        elif fmt == "avi":
            cmd.extend(["-c:v", "mpeg4", "-q:v", "5", "-c:a", "libmp3lame", "-b:a", f"{bitrate}k"])
        else:
            # mp4, mkv, mov
            cmd.extend(["-c:v", "libx264", "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", f"{bitrate}k"])
            if fmt in {"mp4", "mov"}:
                cmd.extend(["-movflags", "+faststart"])

    cmd.extend(["-progress", "pipe:1", "-nostats", str(output_path)])

    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
        )

        last_emit = 0.0
        if proc.stdout:
            for line in proc.stdout:
                line = line.strip()
                if line.startswith("out_time_us=") and duration_sec > 0:
                    try:
                        out_us = int(line.split("=", 1)[1])
                        pct = min((out_us / 1_000_000.0) / duration_sec * 100.0, 99.0)
                        now = time.monotonic()
                        if now - last_emit >= 0.25:
                            last_emit = now
                            job_manager.update_job(
                                job_id,
                                status="running",
                                progress=round(pct, 1),
                                message="Converting...",
                            )
                    except ValueError:
                        pass

        stderr_output = proc.stderr.read() if proc.stderr else ""
        return_code = proc.wait()

        if return_code != 0 or not output_path.exists():
            raise RuntimeError(stderr_output.strip() or f"FFmpeg exited with code {return_code}")

        size = os.path.getsize(output_path)
        final_dur = probe_duration(output_path) or duration_sec
        job_manager.update_job(
            job_id,
            status="completed",
            progress=100.0,
            message="Completed",
            output_filename=output_filename,
            output_path=str(output_path),
            file_size=size,
            duration=_format_duration(final_dur),
        )
    except Exception as exc:
        job_manager.update_job(
            job_id,
            status="error",
            error=str(exc),
            message="Conversion failed",
        )
