"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Subtitles,
  Sparkles,
  Upload,
  Play,
  Pause,
  Download,
  Scissors,
  Search,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Wand2,
  Clock
} from "lucide-react";
import { useHub } from "@/context/HubContext";
import { useToast } from "@/components/ui/ToastProvider";
import type { SubtitleChunkItem } from "@/app/api/ai/transcribe/route";

type CaptionStylePreset = "VIRAL_YELLOW" | "WHITE_STROKE" | "EMERALD_PILL" | "KARAOKE_SWEEP";

function formatSrtTimestamp(sec: number): string {
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  const ms = Math.round((sec - Math.floor(sec)) * 1000);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function formatVttTimestamp(sec: number): string {
  return formatSrtTimestamp(sec).replace(",", ".");
}

export default function AutoSubtitleStudioPage() {
  const { activeHandoff } = useHub();
  const { showToast } = useToast();

  const [engine, setEngine] = useState<"groq" | "elevenlabs">("groq");
  const [maxChars, setMaxChars] = useState<number>(24);
  const [scriptText, setScriptText] = useState<string>(
    "มาสด้าสินธานี สวัสดีค่ะ วันนี้พามาชมรถยนต์ไฟฟ้าดีไซน์สปอร์ตพรีเมียม ดาวน์เริ่มต้นเพียง 0 บาทค่ะ หรือเลือกรับดอกเบี้ยพิเศษ ทักแชทสอบถามได้เลยนะคะ"
  );
  const [subtitles, setSubtitles] = useState<SubtitleChunkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Titanium 9:16 Monitor & Playback State
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<"video" | "audio" | "none">("none");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  // Caption Visual Styling
  const [stylePreset, setStylePreset] = useState<CaptionStylePreset>("KARAOKE_SWEEP");
  const [fontSizePx, setFontSizePx] = useState<number>(20);
  const [bottomOffsetPct, setBottomOffsetPct] = useState<number>(18);

  const [transcribing, setTranscribing] = useState<boolean>(false);
  const [polishing, setPolishing] = useState<boolean>(false);
  const [engineUsedLabel, setEngineUsedLabel] = useState<string>("PK Anti-Orphan Thai Engine");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const simTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial subtitles or incoming handoff script
  useEffect(() => {
    if (activeHandoff) {
      const incomingScript =
        activeHandoff.fullScriptThai ||
        activeHandoff.scenes?.map((s) => s.voiceoverThai).join("\n") ||
        "";
      if (incomingScript.trim()) {
        setScriptText(incomingScript);
        handleGenerateFromScript(incomingScript);
        return;
      }
    }
    handleGenerateFromScript(scriptText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simulated playback timer when no video file is uploaded
  useEffect(() => {
    if (isPlaying && mediaType === "none") {
      const maxEnd = subtitles.length > 0 ? subtitles[subtitles.length - 1].end : 15;
      simTimerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev + 0.1 >= maxEnd) {
            setIsPlaying(false);
            return 0;
          }
          return Number((prev + 0.1).toFixed(2));
        });
      }, 100);
    } else if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
    }
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [isPlaying, mediaType, subtitles]);

  const handleGenerateFromScript = async (overrideScript?: string) => {
    const textToUse = (overrideScript ?? scriptText).trim();
    if (!textToUse) {
      showToast("กรุณาวางข้อความบทพากย์ภาษาไทยก่อนครับ", "info");
      return;
    }

    setTranscribing(true);
    try {
      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "FROM_SCRIPT",
          scriptText: textToUse,
          maxChars
        })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.subtitles)) {
        setSubtitles(data.subtitles);
        setEngineUsedLabel(data.engineUsed || "Anti-Orphan Thai Alignment");
        setCurrentTime(0);
      }
    } catch {
      showToast("จัดท่อนซับไม่สำเร็จ", "error");
    } finally {
      setTranscribing(false);
    }
  };

  const handleFileUploadTranscribe = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setMediaUrl(url);
    setMediaType(file.type.startsWith("video") ? "video" : "audio");

    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("engine", engine);
      formData.append("maxChars", String(maxChars));

      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.subtitles)) {
        setSubtitles(data.subtitles);
        setScriptText(data.fullText || data.subtitles.map((s: any) => s.text).join(" "));
        setEngineUsedLabel(data.engineUsed || "Groq Whisper Large v3");
        showToast(
          `ถอดเสียงสำเร็จ (${data.subtitles.length} ท่อน) ด้วย ${data.engineUsed}!`,
          "success"
        );
      } else {
        showToast(data.error || "ถอดเสียงจากไฟล์ไม่สำเร็จ", "error");
      }
    } catch (err: any) {
      showToast(`เกิดข้อผิดพลาดในการถอดเสียง: ${err?.message}`, "error");
    } finally {
      setTranscribing(false);
      e.target.value = "";
    }
  };

  const handleAIPolishSubtitles = async () => {
    if (subtitles.length === 0) return;
    setPolishing(true);
    try {
      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "POLISH_THAI",
          subtitles,
          maxChars
        })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.subtitles)) {
        setSubtitles(data.subtitles);
        showToast(`AI เกลาคำผิดภาษาไทยเรียบร้อย (${data.modelUsed})!`, "success");
      }
    } catch {
      showToast("ตรวจคำผิดไม่สำเร็จ", "error");
    } finally {
      setPolishing(false);
    }
  };

  // Priority-3 Audit Fix: 1-Click Auto-Split for any line > 24 characters!
  const handleAutoSplitChunk = (chunk: SubtitleChunkItem) => {
    const text = chunk.text.trim();
    if (text.length <= 4) return;
    const mid = Math.floor(text.length / 2);
    // Find nearest space or natural boundary around midpoint
    let splitIdx = text.indexOf(" ", mid - 4);
    if (splitIdx === -1 || splitIdx > mid + 6) {
      splitIdx = mid;
    }

    const part1 = text.slice(0, splitIdx).trim();
    const part2 = text.slice(splitIdx).trim();
    if (!part1 || !part2) return;

    const midTime = Number(((chunk.start + chunk.end) / 2).toFixed(2));
    const chunk1: SubtitleChunkItem = {
      ...chunk,
      id: `${chunk.id}-a`,
      end: midTime,
      text: part1,
      charCount: part1.length,
      isSafeZone: part1.length <= maxChars,
      words: [{ word: part1, start: chunk.start, end: midTime }]
    };
    const chunk2: SubtitleChunkItem = {
      ...chunk,
      id: `${chunk.id}-b`,
      start: midTime,
      text: part2,
      charCount: part2.length,
      isSafeZone: part2.length <= maxChars,
      words: [{ word: part2, start: midTime, end: chunk.end }]
    };

    setSubtitles((prev) => {
      const next: SubtitleChunkItem[] = [];
      for (const item of prev) {
        if (item.id === chunk.id) {
          next.push(chunk1, chunk2);
        } else {
          next.push(item);
        }
      }
      return next.map((item, idx) => ({ ...item, index: idx + 1 }));
    });
    showToast(`แบ่งท่อนที่ #${chunk.index} ออกเป็น 2 ท่อนพอดี Safe-Zone เรียบร้อย!`, "success");
  };

  const handleBatchShiftTiming = (deltaSec: number) => {
    setSubtitles((prev) =>
      prev.map((s) => ({
        ...s,
        start: Number(Math.max(0, s.start + deltaSec).toFixed(2)),
        end: Number(Math.max(0.2, s.end + deltaSec).toFixed(2))
      }))
    );
    showToast(`ขยับเวลาซับทุกท่อน ${deltaSec > 0 ? `+${deltaSec}` : deltaSec} วินาทีแล้ว`, "info");
  };

  const handleDownloadExport = (format: "srt" | "vtt" | "ass" | "capcut") => {
    if (subtitles.length === 0) return;
    let content = "";
    let filename = `PK_Subtitles_${Date.now()}`;

    if (format === "srt") {
      content = subtitles
        .map((s, idx) => `${idx + 1}\n${formatSrtTimestamp(s.start)} --> ${formatSrtTimestamp(s.end)}\n${s.text}`)
        .join("\n\n");
      filename += ".srt";
    } else if (format === "vtt") {
      const blocks = subtitles.map(
        (s) => `${formatVttTimestamp(s.start)} --> ${formatVttTimestamp(s.end)}\n${s.text}`
      );
      content = `WEBVTT\n\n${blocks.join("\n\n")}`;
      filename += ".vtt";
    } else if (format === "ass") {
      const header = `[Script Info]
Title: PK Auto Edit Kit Pro Subtitles
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Prompt,68,&H0000FFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,2,2,40,40,260,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;
      const fmtAss = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        const cs = Math.round((sec - Math.floor(sec)) * 100);
        return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
      };
      const events = subtitles.map(
        (s) => `Dialogue: 0,${fmtAss(s.start)},${fmtAss(s.end)},Default,,0,0,0,,${s.text}`
      );
      content = `${header}\n${events.join("\n")}`;
      filename += ".ass";
    } else {
      const capcutDraft = {
        version: "3.0.0",
        generator: "PK Auto Edit Kit Pro",
        canvas_config: { width: 1080, height: 1920, ratio: "9:16" },
        materials: {
          texts: subtitles.map((s) => ({
            id: s.id,
            type: "subtitle",
            content: s.text,
            font_size: fontSizePx
          }))
        },
        tracks: [
          {
            type: "text",
            segments: subtitles.map((s) => ({
              material_id: s.id,
              target_timerange: {
                start: Math.round(s.start * 1_000_000),
                duration: Math.round((s.end - s.start) * 1_000_000)
              }
            }))
          }
        ]
      };
      content = JSON.stringify(capcutDraft, null, 2);
      filename = "draft_content.json";
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`ดาวน์โหลดไฟล์ซับไตเติล (${filename}) เรียบร้อย!`, "success");
  };

  // Current active subtitle at currentTime
  const currentActiveSub =
    subtitles.find((s) => currentTime >= s.start && currentTime <= s.end) ||
    subtitles.find((s) => s.id === activeSubId) ||
    subtitles[0];

  const totalDuration = subtitles.length > 0 ? subtitles[subtitles.length - 1].end : 15;
  const filteredSubtitles = subtitles.filter(
    (s) => !searchQuery.trim() || s.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Deep Obsidian Studio Header (Matching Walkthrough from Chat a964252b) */}
      <section className="rounded-2xl bg-[#090D16] text-white border border-slate-800 border-t-white/20 p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
              <Subtitles className="w-3.5 h-3.5 text-emerald-400" />
              <span>แผนกที่ 4 · PK Auto Edit Kit — Subtitle Studio Pro (Chat a964252b)</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              สตูดิโอซับไตเติลภาษาไทยอัตโนมัติ & จอมอนิเตอร์ Titanium 9:16
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              ถอดเสียงแม่นยำด้วย Groq Whisper Large v3 & ElevenLabs Scribe · ระบบกันคำลงท้ายตกหล่น (ค่ะ/ครับ/บาท) · วัด Safe-Zone 24 ตัวอักษร พร้อมปุ่มแบ่งท่อนอัตโนมัติ
            </p>
          </div>

          {/* Micro-Dot AI Engine Status Indicators */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Groq Whisper v3</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ElevenLabs Scribe</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Anti-Orphan Thai</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3-Column Studio Pro Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* =================================================================
            COLUMN 1 (4 cols): Upload / Script Input & Caption Styling
        ================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Audio/Video Upload or Script Alignment */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                1. นำเข้าคลิปวิดีโอ / เสียง หรือ บทพากย์
              </h2>
              {activeHandoff && (
                <button
                  type="button"
                  onClick={() => {
                    const s =
                      activeHandoff.fullScriptThai ||
                      activeHandoff.scenes.map((x) => x.voiceoverThai).join("\n");
                    setScriptText(s);
                    handleGenerateFromScript(s);
                    showToast("ดึงสคริปต์จากหน้า OS มาทำซับเรียบร้อย!", "success");
                  }}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  📥 ดึงจากหน้า OS
                </button>
              )}
            </div>

            {/* Engine Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                เลือกโมเดลถอดเสียง AI (Speech-to-Text):
              </label>
              <select
                value={engine}
                onChange={(e) => setEngine(e.target.value as "groq" | "elevenlabs")}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
              >
                <option value="groq">⚡ Groq Whisper Large v3 Turbo (เร็วสูง & แม่นยำ)</option>
                <option value="elevenlabs">🎙️ ElevenLabs Scribe v1 (แยกคำไทยละเอียด)</option>
              </select>
            </div>

            {/* Upload Button inside Column 1 (Fixes Priority 1 Audit Issue #3!) */}
            <button
              type="button"
              disabled={transcribing}
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-xs"
            >
              {transcribing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังวิเคราะห์เสียงและตัดท่อนซับไทย...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>อัปโหลดคลิป MP4 / MP3 เพื่อถอดซับอัตโนมัติ</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,audio/*"
              onChange={handleFileUploadTranscribe}
              className="hidden"
            />

            {/* Or Paste Thai Script */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                หรือวางบทพากย์ไทยเพื่อให้ระบบตัดท่อนซับ & คำนวณเวลาอัตโนมัติ:
              </label>
              <textarea
                rows={4}
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="วางบทพากย์ภาษาไทยที่นี่..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => handleGenerateFromScript()}
                className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>จัดท่อนซับไทย (กันคำตกหล่น ≤ {maxChars} ตัวอักษร)</span>
              </button>
            </div>
          </div>

          {/* Card 2: Caption Style & Export Controls */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 space-y-3.5 shadow-2xs">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              2. ปรับแต่งสไตล์ซับ & ส่งออกไฟล์
            </h2>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "KARAOKE_SWEEP" as const, label: "🟣 คาราโอเกะไฮไลต์คำ" },
                { id: "VIRAL_YELLOW" as const, label: "🟡 เหลืองไวรัลขอบดำ" },
                { id: "WHITE_STROKE" as const, label: "⚪ ขาวคลีนขอบหนา" },
                { id: "EMERALD_PILL" as const, label: "🟢 กล่องเขียวมรกต" }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStylePreset(st.id)}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border text-left transition-all cursor-pointer ${
                    stylePreset === st.id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  ขนาดตัวอักษร: {fontSizePx}px
                </label>
                <input
                  type="range"
                  min={14}
                  max={28}
                  value={fontSizePx}
                  onChange={(e) => setFontSizePx(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  ระยะความสูงซับ: {bottomOffsetPct}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={45}
                  value={bottomOffsetPct}
                  onChange={(e) => setBottomOffsetPct(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Export Buttons */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                ดาวน์โหลดไฟล์ซับไตเติลพร้อมใช้งาน:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadExport("srt")}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>โหลด .SRT</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadExport("vtt")}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>โหลด .VTT</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadExport("ass")}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>โหลด .ASS (มีสี)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadExport("capcut")}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CapCut JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
            COLUMN 2 (4 cols): Titanium 9:16 Smartphone Live Monitor
        ================================================================= */}
        <div className="lg:col-span-4 flex flex-col items-center space-y-3">
          <div className="w-full max-w-[310px] rounded-[32px] p-3 bg-[#1E293B] border-2 border-slate-700 shadow-2xl">
            {/* Dynamic Island */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2" />

            {/* 9:16 Screen Canvas */}
            <div className="relative w-full aspect-[9/16] rounded-[22px] overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 flex flex-col justify-between">
              {mediaType === "video" && mediaUrl ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center opacity-40">
                  <Subtitles className="w-12 h-12 text-blue-400 mb-2" />
                  <div className="text-xs font-bold text-white">9:16 LIVE SUBTITLE MONITOR</div>
                  <div className="text-[10px] text-slate-300 mt-1">{engineUsedLabel}</div>
                </div>
              )}

              {/* Top HUD */}
              <div className="relative z-10 p-3 flex items-center justify-between text-[10px] font-mono text-white/90 bg-gradient-to-b from-black/60 to-transparent">
                <span>9:16 SAFE ZONE</span>
                <span>{currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s</span>
              </div>

              {/* Live Subtitle Overlay at bottomOffsetPct */}
              <div
                className="relative z-10 w-full px-3 text-center transition-all"
                style={{ marginBottom: `${bottomOffsetPct}%` }}
              >
                {currentActiveSub && (
                  <div
                    style={{ fontSize: `${fontSizePx}px` }}
                    className={`inline-block px-3 py-1.5 rounded-xl font-extrabold leading-snug tracking-tight ${
                      stylePreset === "VIRAL_YELLOW"
                        ? "text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000]"
                        : stylePreset === "EMERALD_PILL"
                        ? "bg-emerald-600/95 text-white shadow-lg border border-emerald-300/40"
                        : stylePreset === "WHITE_STROKE"
                        ? "text-white [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000]"
                        : "bg-black/75 text-white border border-white/15 backdrop-blur-xs"
                    }`}
                  >
                    {stylePreset === "KARAOKE_SWEEP" && currentActiveSub.words?.length > 0 ? (
                      <span>
                        {currentActiveSub.words.map((w, i) => {
                          const activeWord = currentTime >= w.start && currentTime <= w.end;
                          return (
                            <span
                              key={i}
                              className={`transition-colors ${
                                activeWord ? "text-yellow-300 underline decoration-2" : "text-white"
                              }`}
                            >
                              {w.word}
                            </span>
                          );
                        })}
                      </span>
                    ) : (
                      currentActiveSub.text
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Playback Controls Bar under Screen */}
            <div className="mt-3 px-2 space-y-2">
              <input
                type="range"
                min={0}
                max={Math.max(1, totalDuration)}
                step={0.1}
                value={currentTime}
                onChange={(e) => {
                  const t = Number(e.target.value);
                  setCurrentTime(t);
                  if (videoRef.current) videoRef.current.currentTime = t;
                }}
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (mediaType === "video" && videoRef.current) {
                      if (isPlaying) videoRef.current.pause();
                      else videoRef.current.play();
                    } else {
                      setIsPlaying(!isPlaying);
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? "หยุดพรีวิว" : "เล่นพรีวิวซับ"}</span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleBatchShiftTiming(-0.2)}
                    className="px-2 py-1 rounded bg-slate-800 text-slate-200 text-[10px] font-mono hover:bg-slate-700 cursor-pointer"
                  >
                    -0.2s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBatchShiftTiming(0.2)}
                    className="px-2 py-1 rounded bg-slate-800 text-slate-200 text-[10px] font-mono hover:bg-slate-700 cursor-pointer"
                  >
                    +0.2s
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
            COLUMN 3 (4 cols): Subtitle Studio Cards & Safe-Zone Inspector
        ================================================================= */}
        <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                3. การ์ดตรวจทานซับไตเติล ({subtitles.length} ท่อน)
              </h2>
              <p className="text-[11px] text-slate-500">
                Safe-Zone แนะนำไม่เกิน {maxChars} ตัวอักษรต่อ 1 แถว
              </p>
            </div>
            <button
              type="button"
              disabled={polishing}
              onClick={handleAIPolishSubtitles}
              className="min-h-[34px] px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{polishing ? "กำลังเกลา..." : "AI แก้คำผิด"}</span>
            </button>
          </div>

          {/* Search Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาคำในซับไตเติล..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
            />
          </div>

          {/* Subtitle Cards List */}
          <div className="max-h-[540px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {filteredSubtitles.map((sub) => {
              const isSafe = sub.text.length <= maxChars;
              const isPreviewing =
                (currentTime >= sub.start && currentTime <= sub.end) || activeSubId === sub.id;

              return (
                <div
                  key={sub.id}
                  className={`p-3 rounded-xl border transition-all space-y-2 ${
                    isPreviewing
                      ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700"
                      : "bg-slate-50/70 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#090D16] text-white font-mono text-[10px] font-bold">
                        #{sub.index}
                      </span>
                      <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-300">
                        {sub.start.toFixed(1)}s → {sub.end.toFixed(1)}s
                      </span>
                    </div>

                    {/* Safe-Zone Micro-Dot Meter */}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isSafe
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                          : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSafe ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <span>{sub.text.length}/{maxChars} ตัว</span>
                    </span>
                  </div>

                  <input
                    type="text"
                    value={sub.text}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSubtitles((prev) =>
                        prev.map((item) =>
                          item.id === sub.id
                            ? { ...item, text: val, charCount: val.length, isSafeZone: val.length <= maxChars }
                            : item
                        )
                      );
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white"
                  />

                  <div className="flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSubId(sub.id);
                        setCurrentTime(sub.start);
                        if (videoRef.current) videoRef.current.currentTime = sub.start;
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold text-blue-600 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>พรีวิวท่อนนี้</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {!isSafe && (
                        <button
                          type="button"
                          onClick={() => handleAutoSplitChunk(sub)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          title="แบ่งเป็น 2 ท่อนอัตโนมัติให้ไม่เกิน 24 ตัวอักษร"
                        >
                          <Scissors className="w-3 h-3" />
                          <span>แบ่งท่อนอัตโนมัติ</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setSubtitles((prev) =>
                            prev
                              .filter((item) => item.id !== sub.id)
                              .map((item, idx) => ({ ...item, index: idx + 1 }))
                          )
                        }
                        className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                        title="ลบท่อนนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
