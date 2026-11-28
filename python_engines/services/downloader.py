"""Media inspection and download service powered by yt-dlp and FFmpeg."""

import os
import time
from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import yt_dlp

from services.converter import probe_duration
from services.job_manager import JobManager
from services.security import sanitize_filename, validate_media_url


AUDIO_FORMATS = {"mp3", "m4a", "wav", "flac", "opus"}
VIDEO_FORMATS = {"mp4", "mkv", "webm"}


def _normalize_media_url(raw_url: str) -> str:
    """Validate URL and strip YouTube auto-generated Radio Mix params (list=RD...) from watch URLs."""
    url = validate_media_url(raw_url)
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    if ("youtube.com" in host or "youtu.be" in host) and parsed.path.startswith("/watch"):
        params = parse_qsl(parsed.query, keep_blank_values=True)
        has_video_id = any(k == "v" and v for k, v in params)
        is_radio_mix = any(
            (k == "list" and v.startswith("RD")) or k == "start_radio"
            for k, v in params
        )
        if has_video_id and is_radio_mix:
            cleaned_params = [
                (k, v) for k, v in params if k not in ("list", "start_radio", "index")
            ]
            return urlunparse(parsed._replace(query=urlencode(cleaned_params)))
    return url


def _can_use_local_browser_cookies() -> bool:
    # On Windows/macOS desktop, local browser cookies may exist.
    # On Linux cloud containers (e.g. Render), local browsers are not installed.
    return os.name == "nt" or Path("/Applications").exists()


def _apply_cookies(
    opts: dict[str, Any],
    cookies_browser: str | None = None,
    cookies_file: Path | None = None,
) -> bool:
    has_cookies = False
    if cookies_file and cookies_file.exists():
        opts["cookiefile"] = str(cookies_file)
        has_cookies = True
    elif (
        cookies_browser
        and cookies_browser in {"chrome", "edge", "firefox", "brave", "opera"}
        and _can_use_local_browser_cookies()
    ):
        opts["cookiesfrombrowser"] = (cookies_browser,)
        has_cookies = True
    else:
        env_cookie_path = os.environ.get("COOKIES_FILE_PATH", "").strip()
        if env_cookie_path and Path(env_cookie_path).exists():
            opts["cookiefile"] = env_cookie_path
            has_cookies = True

    return has_cookies


def _format_friendly_error(exc: Exception, has_cookies: bool = False) -> str:
    err_text = str(exc)
    lowered = err_text.lower()
    if "cookies database" in lowered:
        return (
            "บนเซิร์ฟเวอร์ Cloud ไม่มีเบราว์เซอร์ Chrome/Edge/Firefox ติดตั้งอยู่ "
            "กรุณาเลือก 'ไม่ใช้ Cookies' หรือ 'อัปโหลด cookies.txt' แทน"
        )
    if "not a bot" in lowered or "sign in to confirm" in lowered:
        if has_cookies:
            return (
                "Cookies ที่มีอยู่หมดอายุ ถูก YouTube รีเซ็ต หรือยังไม่ได้ล็อกอินในไฟล์ cookies.txt — "
                "แนะนำให้เปิดหน้าต่าง Incognito ล็อกอิน YouTube → Export เฉพาะ youtube.com → แล้วปิดหน้าต่าง Incognito ทันที (ป้องกัน YouTube รีเซ็ต Session)"
            )
        return (
            "YouTube ขอให้ยืนยันตัวตนเนื่องจากเป็น IP ของเซิร์ฟเวอร์ Cloud — "
            "กรุณาเลือกช่อง Cookies เป็น 'อัปโหลด cookies.txt' แล้วเลือกไฟล์ cookies.txt (ระบบจะจำไว้ในเบราว์เซอร์ให้ ไม่ต้องอัปโหลดซ้ำ)"
        )
    return err_text


def _format_duration(seconds: Any) -> str:
    if not isinstance(seconds, (int, float)) or seconds <= 0:
        return ""
    total = int(seconds)
    hrs, rem = divmod(total, 3600)
    mins, secs = divmod(rem, 60)
    if hrs > 0:
        return f"{hrs}:{mins:02d}:{secs:02d}"
    return f"{mins}:{secs:02d}"


def _format_bytes(num_bytes: Any) -> str:
    if not isinstance(num_bytes, (int, float)) or num_bytes <= 0:
        return ""
    for unit in ("B", "KB", "MB", "GB"):
        if num_bytes < 1024:
            return f"{num_bytes:.1f} {unit}"
        num_bytes /= 1024
    return f"{num_bytes:.1f} TB"


def _extract_with_fallback(
    url: str,
    base_opts: dict[str, Any],
    download: bool,
    has_cookies: bool,
) -> dict[str, Any]:
    """Run yt-dlp extract_info with automatic client fallback for cloud IPs."""
    try:
        with yt_dlp.YoutubeDL(base_opts) as ydl:
            info = ydl.extract_info(url, download=download)
            if info:
                return info
    except Exception as first_exc:
        lowered = str(first_exc).lower()
        is_yt_bot = "not a bot" in lowered or "sign in" in lowered
        is_format_err = "requested format is not available" in lowered
        if not is_yt_bot and not is_format_err:
            raise

        # Retry with alternate player clients + broader format selector
        fallback_opts = dict(base_opts)
        fallback_opts["extractor_args"] = {
            "youtube": {
                "player_client": (
                    ["tv", "web", "mweb", "web_safari"]
                    if has_cookies
                    else ["mweb", "tv", "web_safari", "android_vr"]
                ),
            }
        }
        if is_format_err and "format" in fallback_opts:
            if fallback_opts["format"] != "bestaudio/best":
                fallback_opts["format"] = "bestvideo*+bestaudio/best"
        with yt_dlp.YoutubeDL(fallback_opts) as ydl:
            info = ydl.extract_info(url, download=download)
            if info:
                return info
        raise first_exc

    raise ValueError("Could not extract media information from this URL.")


def inspect_url(
    raw_url: str,
    cookies_browser: str | None = None,
    cookies_file: Path | None = None,
) -> dict[str, Any]:
    """Extract metadata for a single media URL or a playlist/multi-item post."""
    url = _normalize_media_url(raw_url)

    opts: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": "in_playlist",
        "skip_download": True,
        "socket_timeout": 25,
        "js_runtimes": {"node": {}, "deno": {}},
        "remote_components": ["ejs:github"],
    }
    has_cookies = _apply_cookies(opts, cookies_browser, cookies_file)

    try:
        info = _extract_with_fallback(url, opts, download=False, has_cookies=has_cookies)
    except Exception as exc:
        raise ValueError(_format_friendly_error(exc, has_cookies=has_cookies)) from exc

    extractor = info.get("extractor_key") or info.get("extractor") or "Media"
    is_playlist = info.get("_type") == "playlist" or bool(info.get("entries"))

    if is_playlist:
        raw_entries = list(info.get("entries") or [])
        entries: list[dict[str, Any]] = []
        for idx, entry in enumerate(raw_entries[:100], start=1):
            if not entry:
                continue
            entry_url = entry.get("webpage_url") or entry.get("url") or ""
            if entry_url and not entry_url.startswith(("http://", "https://")):
                if "youtube" in extractor.lower() and entry.get("id"):
                    entry_url = f"https://www.youtube.com/watch?v={entry['id']}"
            if not entry_url:
                continue
            entries.append(
                {
                    "index": idx,
                    "id": str(entry.get("id") or idx),
                    "title": entry.get("title") or f"Item {idx}",
                    "url": entry_url,
                    "duration": _format_duration(entry.get("duration")),
                    "thumbnail": entry.get("thumbnail") or "",
                }
            )
        return {
            "type": "playlist",
            "url": url,
            "title": info.get("title") or f"{extractor} Playlist",
            "uploader": info.get("uploader") or info.get("channel") or "",
            "extractor": extractor,
            "count": len(entries),
            "entries": entries,
        }

    heights: set[int] = set()
    for fmt in info.get("formats") or []:
        h = fmt.get("height")
        if isinstance(h, int) and h >= 144:
            heights.add(h)

    return {
        "type": "single",
        "url": info.get("webpage_url") or url,
        "title": info.get("title") or "Untitled Media",
        "uploader": info.get("uploader") or info.get("channel") or "",
        "extractor": extractor,
        "duration": _format_duration(info.get("duration")),
        "thumbnail": info.get("thumbnail") or "",
        "available_heights": sorted(heights, reverse=True),
    }


def _build_format_selector(target_format: str, quality: str) -> str:
    if target_format in AUDIO_FORMATS:
        return "bestaudio/best"

    if quality == "best" or not quality.isdigit():
        return "bestvideo*+bestaudio/best"

    height = int(quality)
    return f"bestvideo*[height<={height}]+bestaudio/best[height<={height}]/best"


def run_download_job(
    job_id: str,
    raw_url: str,
    target_format: str,
    quality: str,
    downloads_dir: Path,
    job_manager: JobManager,
    cookies_browser: str | None = None,
    cookies_file: Path | None = None,
) -> None:
    """Execute a yt-dlp download job and stream progress to JobManager."""
    try:
        url = _normalize_media_url(raw_url)
    except ValueError as exc:
        job_manager.update_job(job_id, status="error", error=str(exc), message="Invalid URL")
        return

    fmt = target_format.lower().strip()
    if fmt not in AUDIO_FORMATS and fmt not in VIDEO_FORMATS:
        fmt = "mp4"

    downloads_dir.mkdir(parents=True, exist_ok=True)
    job_manager.update_job(job_id, status="running", progress=1.0, message="Fetching media info...")

    last_emit = 0.0
    final_paths: list[str] = []

    def progress_hook(data: dict[str, Any]) -> None:
        nonlocal last_emit
        status = data.get("status")
        now = time.monotonic()

        if status == "downloading":
            if now - last_emit < 0.25:
                return
            last_emit = now
            total = data.get("total_bytes") or data.get("total_bytes_estimate") or 0
            downloaded = data.get("downloaded_bytes") or 0
            pct = (downloaded / total * 100.0) if total > 0 else 0.0
            speed_val = data.get("speed")
            eta_val = data.get("eta")
            speed_str = f"{_format_bytes(speed_val)}/s" if speed_val else ""
            eta_str = _format_duration(eta_val) if eta_val else ""
            job_manager.update_job(
                job_id,
                status="running",
                progress=round(min(pct, 95.0), 1),
                speed=speed_str,
                eta=eta_str,
                message="Downloading...",
            )
        elif status == "finished":
            filename = data.get("filename")
            if filename:
                final_paths.append(filename)
            job_manager.update_job(
                job_id,
                status="running",
                progress=96.0,
                speed="",
                eta="",
                message="Processing / Merging...",
            )

    def postprocessor_hook(data: dict[str, Any]) -> None:
        if data.get("status") == "finished":
            filepath = (data.get("info_dict") or {}).get("filepath")
            if filepath:
                final_paths.append(filepath)

    out_template = str(downloads_dir / f"%(title).100s [{job_id}].%(ext)s")

    ydl_opts: dict[str, Any] = {
        "format": _build_format_selector(fmt, quality),
        "outtmpl": out_template,
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "restrictfilenames": False,
        "windowsfilenames": True,
        "progress_hooks": [progress_hook],
        "postprocessor_hooks": [postprocessor_hook],
        "socket_timeout": 30,
        "retries": 3,
        "js_runtimes": {"node": {}, "deno": {}},
        "remote_components": ["ejs:github"],
    }
    has_cookies = _apply_cookies(ydl_opts, cookies_browser, cookies_file)

    if fmt in AUDIO_FORMATS:
        audio_quality = quality if quality in {"320", "256", "192", "128"} else "192"
        ydl_opts["postprocessors"] = [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": fmt,
                "preferredquality": audio_quality,
            }
        ]
    else:
        ydl_opts["merge_output_format"] = fmt

    try:
        info = _extract_with_fallback(url, ydl_opts, download=True, has_cookies=has_cookies)
        title = sanitize_filename((info or {}).get("title") or "media")
        duration_str = _format_duration((info or {}).get("duration"))
        job_manager.update_job(job_id, title=title, duration=duration_str)

        resolved_file: Path | None = None
        for candidate in reversed(final_paths):
            p = Path(candidate)
            if p.exists() and p.is_file():
                resolved_file = p
                break

        if not resolved_file:
            matches = list(downloads_dir.glob(f"*[{job_id}]*"))
            if matches:
                resolved_file = max(matches, key=lambda item: item.stat().st_mtime)

        if not resolved_file or not resolved_file.exists():
            raise FileNotFoundError("Download finished but output file was not found.")

        size = os.path.getsize(resolved_file)
        if not duration_str:
            duration_str = _format_duration(probe_duration(resolved_file))
        job_manager.update_job(
            job_id,
            status="completed",
            progress=100.0,
            speed="",
            eta="",
            message="Completed",
            output_filename=resolved_file.name,
            output_path=str(resolved_file),
            file_size=size,
            duration=duration_str,
        )
    except Exception as exc:
        job_manager.update_job(
            job_id,
            status="error",
            speed="",
            eta="",
            error=_format_friendly_error(exc, has_cookies=has_cookies),
            message="Download failed",
        )
