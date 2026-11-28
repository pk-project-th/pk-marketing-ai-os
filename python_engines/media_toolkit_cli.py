# -*- coding: utf-8 -*-
"""
CLI JSON bridge for PK Media Toolkit (Downloader & Multi-File Converter) inside PK Creative Hub.
"""
import sys
import os
import json
import time
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ENGINE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ENGINE_DIR)

from services.downloader import inspect_url, run_download_job
from services.converter import run_convert_job
from services.job_manager import JobManager


def inspect_cookies_meta(path: Path) -> dict:
    if not path.exists() or path.stat().st_size == 0:
        return {"loaded": False, "total_cookie_lines": 0, "youtube_cookies": 0, "has_youtube_auth": False}
    text = path.read_text(encoding="utf-8", errors="ignore")
    lines = [ln for ln in text.splitlines() if ln.strip() and not ln.lstrip().startswith("#")]
    tab_lines = [ln for ln in lines if ln.count("\t") >= 6]
    yt_lines = [ln for ln in tab_lines if "youtube.com" in ln.split("\t")[0].lower()]
    auth_names = {"SAPISID", "SID", "__Secure-3PAPISID", "__Secure-1PSID", "LOGIN_INFO"}
    has_auth = any(ln.split("\t")[5] in auth_names for ln in yt_lines if len(ln.split("\t")) >= 7)
    return {
        "loaded": True,
        "total_cookie_lines": len(lines),
        "valid_tab_lines": len(tab_lines),
        "youtube_cookies": len(yt_lines),
        "has_youtube_auth": has_auth,
    }


def main():
    if len(sys.argv) < 3:
        sys.exit(1)

    req_path = sys.argv[1]
    res_path = sys.argv[2]

    with open(req_path, "r", encoding="utf-8") as f:
        req = json.load(f)

    action = req.get("action", "INSPECT")
    vault_dir = Path(req.get("vaultDir", "."))
    vault_dir.mkdir(parents=True, exist_ok=True)
    cookies_path = vault_dir / "cookies.txt"
    cfile = cookies_path if (cookies_path.exists() and cookies_path.stat().st_size > 0) else None

    out = {"success": False}

    try:
        if action == "COOKIES_STATUS":
            out = {"success": True, "cookiesMeta": inspect_cookies_meta(cookies_path)}

        elif action == "INSPECT":
            url = req["url"]
            cbrowser = req.get("cookiesBrowser") or None
            if cbrowser == "custom":
                cbrowser = None
            info = inspect_url(url, cookies_browser=cbrowser, cookies_file=cfile)
            out = {"success": True, "data": info}

        elif action == "DOWNLOAD":
            url = req["url"]
            target_format = req.get("targetFormat", "mp4")
            quality = req.get("quality", "1080")
            cbrowser = req.get("cookiesBrowser") or None
            if cbrowser == "custom":
                cbrowser = None

            jm = JobManager()
            job = jm.create_job(kind="download", title=req.get("title") or url, source=url, target_format=target_format)
            run_download_job(
                job_id=job["id"],
                url=url,
                output_dir=vault_dir,
                target_format=target_format,
                quality=quality,
                cookies_browser=cbrowser,
                cookies_file=cfile,
                job_manager=jm,
            )
            finished = jm.get_job(job["id"])
            if finished and finished.get("status") == "completed" and finished.get("output_path"):
                out_p = Path(finished["output_path"])
                out = {
                    "success": True,
                    "job": finished,
                    "fileName": out_p.name,
                    "size": out_p.stat().st_size if out_p.exists() else 0,
                }
            else:
                out = {
                    "success": False,
                    "error": (finished or {}).get("error") or "ดาวน์โหลดไม่สำเร็จ",
                    "job": finished,
                }

        elif action == "CONVERT":
            input_path = Path(req["inputPath"])
            target_format = req.get("targetFormat", "mp4")
            quality = req.get("quality", "original")
            audio_bitrate = req.get("audioBitrate", "192")
            start_time = req.get("startTime") or None
            end_time = req.get("endTime") or None

            jm = JobManager()
            job = jm.create_job(kind="convert", title=input_path.name, source=str(input_path), target_format=target_format)
            run_convert_job(
                job_id=job["id"],
                input_path=input_path,
                output_dir=vault_dir,
                target_format=target_format,
                quality=quality,
                audio_bitrate=audio_bitrate,
                start_time=start_time,
                end_time=end_time,
                job_manager=jm,
                delete_source=False,
            )
            finished = jm.get_job(job["id"])
            if finished and finished.get("status") == "completed" and finished.get("output_path"):
                out_p = Path(finished["output_path"])
                out = {
                    "success": True,
                    "job": finished,
                    "fileName": out_p.name,
                    "size": out_p.stat().st_size if out_p.exists() else 0,
                }
            else:
                out = {
                    "success": False,
                    "error": (finished or {}).get("error") or "แปลงไฟล์ไม่สำเร็จ",
                    "job": finished,
                }

    except Exception as e:
        out = {"success": False, "error": str(e)}

    with open(res_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)


if __name__ == "__main__":
    main()
