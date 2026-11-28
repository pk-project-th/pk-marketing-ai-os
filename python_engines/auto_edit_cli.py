# -*- coding: utf-8 -*-
"""
CLI JSON bridge for PK Auto Edit Kit (Subtitle Studio Pro) inside PK Creative Hub.
Reads a JSON request file, executes the exact auto-edit-kit Python modules, and writes a JSON response file.
"""
import sys
import os
import json
import time

sys.stdout.reconfigure(encoding="utf-8")
ENGINE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ENGINE_DIR)

from modules.ffmpeg_utils import get_video_info, render_video_with_subtitles
from modules.silence_detector import analyze_and_cut
from modules.transcriber import transcribe_audio_with_status
from modules.thai_formatter import (
    chunk_word_timestamps,
    generate_webvtt,
    generate_srt,
    generate_plain_script,
    map_timestamp_to_edited_timeline,
    realign_subtitle_words,
)
from modules.capcut_generator import create_capcut_project, cleanup_old_autoedit_drafts


def split_subtitle_at_midpoint(sub: dict, keep_segs: list, master_words: list):
    text = sub.get("text", "").strip()
    if len(text) < 4:
        return None
    try:
        from pythainlp.tokenize import word_tokenize
        toks = [t for t in word_tokenize(text, engine="newmm") if t]
    except Exception:
        toks = text.split()

    if len(toks) < 2:
        mid_c = len(text) // 2
        part1, part2 = text[:mid_c].strip(), text[mid_c:].strip()
    else:
        target_len = len(text) / 2.0
        accum = 0
        split_idx = max(1, len(toks) // 2)
        best_diff = float("inf")
        for idx in range(1, len(toks)):
            accum += len(toks[idx - 1])
            diff = abs(accum - target_len)
            if diff < best_diff:
                best_diff = diff
                split_idx = idx
        part1 = "".join(toks[:split_idx]).strip()
        part2 = "".join(toks[split_idx:]).strip()

    if not part1 or not part2:
        return None

    s_start = float(sub.get("source_start", 0.0))
    s_end = float(sub.get("source_end", s_start + 1.0))
    ratio = len(part1) / max(1, len(part1) + len(part2))
    mid_t = round(s_start + (s_end - s_start) * ratio, 3)

    w1 = realign_subtitle_words(part1, current_words=sub.get("words", []), master_words=master_words, s_start=s_start, s_end=mid_t, keep_segments=keep_segs)
    w2 = realign_subtitle_words(part2, current_words=sub.get("words", []), master_words=master_words, s_start=mid_t, s_end=s_end, keep_segments=keep_segs)

    ts1 = round(map_timestamp_to_edited_timeline(s_start, keep_segs), 3) if keep_segs else s_start
    te1 = round(map_timestamp_to_edited_timeline(mid_t, keep_segs), 3) if keep_segs else mid_t
    ts2 = round(map_timestamp_to_edited_timeline(mid_t, keep_segs), 3) if keep_segs else mid_t
    te2 = round(map_timestamp_to_edited_timeline(s_end, keep_segs), 3) if keep_segs else s_end

    seed = int(time.time() * 1000)
    return [
        {
            "id": f"sub_{seed}_a",
            "text": part1,
            "source_start": round(s_start, 3),
            "source_end": round(mid_t, 3),
            "timeline_start": ts1,
            "timeline_end": te1,
            "duration": round(max(0.2, te1 - ts1), 3),
            "words": w1,
        },
        {
            "id": f"sub_{seed}_b",
            "text": part2,
            "source_start": round(mid_t, 3),
            "source_end": round(s_end, 3),
            "timeline_start": ts2,
            "timeline_end": te2,
            "duration": round(max(0.2, te2 - ts2), 3),
            "words": w2,
        },
    ]


def merge_subtitles_pair(sub_a: dict, sub_b: dict, keep_segs: list, master_words: list) -> dict:
    t_a = sub_a.get("text", "").strip()
    t_b = sub_b.get("text", "").strip()
    sep = " " if (t_a and t_b and (t_a[-1].isascii() or t_b[0].isascii())) else ""
    merged_text = f"{t_a}{sep}{t_b}".strip()

    s_start = min(float(sub_a.get("source_start", 0.0)), float(sub_b.get("source_start", 0.0)))
    s_end = max(float(sub_a.get("source_end", s_start + 0.5)), float(sub_b.get("source_end", s_start + 0.5)))

    combined_words = list(sub_a.get("words", [])) + list(sub_b.get("words", []))
    realigned = realign_subtitle_words(
        text=merged_text,
        current_words=combined_words,
        master_words=master_words,
        s_start=s_start,
        s_end=s_end,
        keep_segments=keep_segs,
    )
    ts = round(map_timestamp_to_edited_timeline(s_start, keep_segs), 3) if keep_segs else round(s_start, 3)
    te = round(map_timestamp_to_edited_timeline(s_end, keep_segs), 3) if keep_segs else round(s_end, 3)

    return {
        "id": f"sub_{int(time.time()*1000)}_m",
        "text": merged_text,
        "source_start": round(s_start, 3),
        "source_end": round(s_end, 3),
        "timeline_start": ts,
        "timeline_end": te,
        "duration": round(max(0.2, te - ts), 3),
        "words": realigned,
    }


def main():
    if len(sys.argv) < 3:
        print("Usage: auto_edit_cli.py <req.json> <res.json>")
        sys.exit(1)

    req_path = sys.argv[1]
    res_path = sys.argv[2]

    with open(req_path, "r", encoding="utf-8") as f:
        req = json.load(f)

    action = req.get("action", "ANALYZE")
    out = {"success": False}

    try:
        if action == "ANALYZE":
            video_path = req["videoPath"]
            cut_silence = bool(req.get("cutSilenceEnabled", True))
            pacing = req.get("pacing", "มาตรฐาน (แนะนำ)")
            pref_engine = req.get("preferredEngine", "elevenlabs")
            lines_mode = req.get("linesMode", "1 แถว (แนะนำ)")
            max_words = int(req.get("maxWords", 5))
            enable_ai_refine = bool(req.get("enableAiRefine", True))

            if pacing == "กระชับเร็ว":
                silence_db, min_silence, padding = -28.0, 0.30, 0.04
            elif pacing == "ผ่อนคลาย":
                silence_db, min_silence, padding = -32.0, 0.60, 0.08
            else:
                silence_db, min_silence, padding = -30.0, 0.40, 0.06

            v_info = get_video_info(video_path)
            if cut_silence:
                analysis = analyze_and_cut(
                    video_path,
                    noise_threshold_db=silence_db,
                    min_silence_duration=min_silence,
                    padding=padding,
                )
            else:
                v_dur = float(v_info.get("duration", 10.0) or 10.0)
                analysis = {
                    "original_duration": v_dur,
                    "final_duration": v_dur,
                    "silence_saved": 0.0,
                    "keep_segments": [{"start": 0.0, "end": max(0.5, v_dur), "duration": max(0.5, v_dur)}],
                }

            words, stt_status = transcribe_audio_with_status(
                video_path,
                preferred_engine=pref_engine,
                keep_segments=analysis["keep_segments"],
            )

            subtitles = chunk_word_timestamps(
                words,
                keep_segments=analysis["keep_segments"],
                caption_mode="sentence",
                lines_mode="1 แถว" if "1 แถว" in lines_mode else "2 แถว",
                max_words_per_line=max_words,
                max_chars_per_line=22 if "1 แถว" in lines_mode else 46,
                pause_threshold=0.22,
            )

            if enable_ai_refine and os.environ.get("GEMINI_API_KEY") and not stt_status.get("is_mock"):
                try:
                    from modules.thai_refiner import refine_thai_captions_with_llm
                    refined_subs = refine_thai_captions_with_llm(
                        subtitles,
                        keep_segments=analysis["keep_segments"],
                    )
                    if refined_subs:
                        subtitles = refined_subs
                except Exception:
                    pass

            seed = int(time.time() * 1000)
            for idx, s in enumerate(subtitles):
                s["id"] = f"sub_{seed}_{idx}"

            vtt_source = generate_webvtt(subtitles, use_source_time=True, line_position=int(req.get("vertPosPct", 82)), karaoke_mode=True)

            out = {
                "success": True,
                "videoInfo": v_info,
                "analysis": analysis,
                "subtitles": subtitles,
                "masterWords": words,
                "sttStatus": stt_status,
                "vttPreview": vtt_source,
            }

        elif action == "UPDATE_SUBS":
            subtitles = req.get("subtitles", [])
            keep_segs = req.get("keepSegments", [])
            master_words = req.get("masterWords", [])
            op = req.get("operation", "realign")  # realign | split | merge | shift
            target_idx = int(req.get("targetIndex", -1))
            delta_sec = float(req.get("deltaSec", 0.0))

            if op == "split" and 0 <= target_idx < len(subtitles):
                pair = split_subtitle_at_midpoint(subtitles[target_idx], keep_segs, master_words)
                if pair:
                    subtitles[target_idx:target_idx + 1] = pair
            elif op == "merge" and 0 <= target_idx < len(subtitles) - 1:
                merged = merge_subtitles_pair(subtitles[target_idx], subtitles[target_idx + 1], keep_segs, master_words)
                subtitles[target_idx:target_idx + 2] = [merged]
            elif op == "shift":
                for s in subtitles:
                    new_s = max(0.0, round(float(s.get("source_start", 0.0)) + delta_sec, 3))
                    new_e = max(new_s + 0.15, round(float(s.get("source_end", 0.0)) + delta_sec, 3))
                    s["source_start"] = new_s
                    s["source_end"] = new_e
                    s["words"] = realign_subtitle_words(
                        s.get("text", ""),
                        current_words=s.get("words", []),
                        master_words=master_words,
                        s_start=new_s,
                        s_end=new_e,
                        keep_segments=keep_segs,
                    )
                    s["timeline_start"] = round(map_timestamp_to_edited_timeline(new_s, keep_segs), 3) if keep_segs else new_s
                    s["timeline_end"] = round(map_timestamp_to_edited_timeline(new_e, keep_segs), 3) if keep_segs else new_e
                    s["duration"] = round(max(0.2, s["timeline_end"] - s["timeline_start"]), 3)
            else:
                for s in subtitles:
                    curr_s = max(0.0, float(s.get("source_start", 0.0)))
                    curr_e = max(curr_s + 0.2, float(s.get("source_end", curr_s + 1.0)))
                    s["source_start"] = round(curr_s, 3)
                    s["source_end"] = round(curr_e, 3)
                    s["words"] = realign_subtitle_words(
                        s.get("text", ""),
                        current_words=s.get("words", []),
                        master_words=master_words,
                        s_start=curr_s,
                        s_end=curr_e,
                        keep_segments=keep_segs,
                    )
                    s["timeline_start"] = round(map_timestamp_to_edited_timeline(curr_s, keep_segs), 3) if keep_segs else round(curr_s, 3)
                    s["timeline_end"] = round(map_timestamp_to_edited_timeline(curr_e, keep_segs), 3) if keep_segs else round(curr_e, 3)
                    s["duration"] = round(max(0.2, s["timeline_end"] - s["timeline_start"]), 3)

            srt_cut = generate_srt(subtitles, use_source_time=False)
            srt_orig = generate_srt(subtitles, use_source_time=True)
            vtt_cut = generate_webvtt(subtitles, use_source_time=False, line_position=int(req.get("vertPosPct", 82)), karaoke_mode=False)
            vtt_orig = generate_webvtt(subtitles, use_source_time=True, line_position=int(req.get("vertPosPct", 82)), karaoke_mode=True)
            txt_plain = generate_plain_script(subtitles)

            out = {
                "success": True,
                "subtitles": subtitles,
                "exports": {
                    "srtCut": srt_cut,
                    "srtOrig": srt_orig,
                    "vttCut": vtt_cut,
                    "vttOrig": vtt_orig,
                    "txtPlain": txt_plain,
                },
            }

        elif action == "RENDER_MP4":
            video_path = req["videoPath"]
            output_path = req["outputPath"]
            keep_segs = req.get("keepSegments", [])
            subtitles = req.get("subtitles", [])

            rendered_file = render_video_with_subtitles(
                video_path=video_path,
                keep_segments=keep_segs,
                subtitles=subtitles,
                output_path=output_path,
                font_name=req.get("fontName", "Kanit (คณิต BD)"),
                font_size=float(req.get("fontSize", 8.5)),
                text_color_hex=req.get("baseColorHex", "#FFFFFF"),
                focus_color_hex=req.get("focusColorHex", "#FF1E27"),
                stroke_val=int(req.get("strokeVal", 8)),
                shadow_val=int(req.get("shadowVal", 80)),
                vertical_position_pct=int(req.get("vertPosPct", 82)),
                letter_spacing=float(req.get("letterSpacing", 3.5)),
                karaoke_mode=bool(req.get("karaokeMode", True)),
                anim_type=req.get("animType", "pop"),
                enable_pop=req.get("animType", "pop") != "none",
            )
            out = {
                "success": os.path.exists(rendered_file),
                "renderedPath": rendered_file,
            }

        elif action == "CAPCUT_DESKTOP":
            video_path = req["videoPath"]
            keep_segs = req.get("keepSegments", [])
            subtitles = req.get("subtitles", [])
            project_name = req.get("projectName", f"AutoEdit_{int(time.time())}")
            base_hex = req.get("baseColorHex", "#FFFFFF").lstrip("#")
            focus_hex = req.get("focusColorHex", "#FF1E27").lstrip("#")
            rgb_color = [int(base_hex[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
            focus_rgb = [int(focus_hex[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
            vert_pos_pct = int(req.get("vertPosPct", 82))
            capcut_y_pos = round((0.5 - (vert_pos_pct / 100.0)) * 2.0, 3)
            stroke_val = int(req.get("strokeVal", 8))
            shadow_val = int(req.get("shadowVal", 80))
            anim_type = req.get("animType", "pop")

            capcut_dir = create_capcut_project(
                video_path=video_path,
                keep_segments=keep_segs,
                subtitles=subtitles,
                project_name=project_name,
                font_name=req.get("fontName", "Kanit (คณิต BD)"),
                font_size=float(req.get("fontSize", 8.5)),
                text_color=rgb_color,
                focus_color=focus_rgb,
                stroke_width=(stroke_val / 10.0) * 0.018,
                stroke_color=[0.0, 0.0, 0.0],
                shadow_alpha=shadow_val / 100.0,
                shadow_distance=5.0,
                text_y_position=capcut_y_pos,
                letter_spacing=float(req.get("letterSpacing", 3.5)),
                karaoke_mode=bool(req.get("karaokeMode", True)),
                anim_type=anim_type,
                enable_pop=anim_type != "none",
            )
            out = {
                "success": True,
                "capcutDir": capcut_dir,
                "projectName": project_name,
            }

        elif action == "CLEANUP_CAPCUT":
            deleted = cleanup_old_autoedit_drafts(keep_recent=1)
            out = {"success": True, "deletedCount": deleted}

    except Exception as e:
        out = {"success": False, "error": str(e)}

    with open(res_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)


if __name__ == "__main__":
    main()
