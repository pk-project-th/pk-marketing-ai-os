"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  RefreshCw,
  Play,
  Download,
  Scissors,
  Link2,
  Trash2,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Plus,
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import {
  saveEmbeddedFile,
  loadEmbeddedFile,
  removeEmbeddedFile,
  saveStudioState,
  loadStudioState
} from "@/lib/storage/persistent-media";
import { useHub } from "@/context/HubContext";
import { useToast } from "@/components/ui/ToastProvider";

const FONT_OPTIONS = [
  "Kanit (คณิต BD)",
  "MazdaTypeTH-Bold (มาสด้า โบลด์)",
  "Prompt (พร้อมท์)",
  "Mitr (มิตร)",
  "Chakra Petch (จักรเพชร)",
  "Bai Jamjuree (ใบจามจุรี)",
  "Itim (ไอติม)",
  "Mali (มะลิ)"
];

const ANIM_PRESETS: Record<string, "pop" | "zoom" | "glow" | "jump" | "none"> = {
  "💥 ขยายเด้ง (Pop Bounce - แนะนำ)": "pop",
  "⚡ ขยายค้างทั้งคำ (Zoom 1.15x)": "zoom",
  "✨ นีออนโกลว์เรืองแสง (Neon Glow)": "glow",
  "🌊 กระโดดยกตัว (Jump / Lift)": "jump",
  "🎯 ไฮไลต์สีนิ่งหรู (Clean Color)": "none"
};
const ANIM_LABELS = Object.keys(ANIM_PRESETS);

const STYLE_PRESETS: Record<
  string,
  {
    font: string;
    baseColor: string;
    focusColor: string;
    animLabel: string;
    karaoke: boolean;
    stroke: number;
    shadow: number;
  } | null
> = {
  "🔥 CapCut ฮิต (ขาว-แดง เด้ง)": {
    font: FONT_OPTIONS[0],
    baseColor: "#FFFFFF",
    focusColor: "#FF1E27",
    animLabel: ANIM_LABELS[0],
    karaoke: true,
    stroke: 8,
    shadow: 80
  },
  "💛 เหลืองคลาสสิก (เหลือง-ขาว)": {
    font: FONT_OPTIONS[0],
    baseColor: "#FFE500",
    focusColor: "#FFFFFF",
    animLabel: ANIM_LABELS[4],
    karaoke: true,
    stroke: 9,
    shadow: 85
  },
  "⚡ นีออนไซเบอร์ (ขาว-เขียวโกลว์)": {
    font: FONT_OPTIONS[2],
    baseColor: "#FFFFFF",
    focusColor: "#10B981",
    animLabel: ANIM_LABELS[2],
    karaoke: true,
    stroke: 8,
    shadow: 80
  },
  "✨ มินิมอลคลีน (ขาว-ส้มนิ่ง)": {
    font: FONT_OPTIONS[2],
    baseColor: "#FFFFFF",
    focusColor: "#F97316",
    animLabel: ANIM_LABELS[4],
    karaoke: true,
    stroke: 6,
    shadow: 65
  },
  "🎛️ กำหนดเอง (Custom)": null
};

export interface AutoEditWord {
  word: string;
  start: number;
  end: number;
  timeline_start?: number;
  timeline_end?: number;
}

export interface AutoEditSubtitle {
  id: string;
  text: string;
  source_start: number;
  source_end: number;
  timeline_start: number;
  timeline_end: number;
  duration: number;
  words: AutoEditWord[];
}

export interface AutoEditPersistedState {
  fileName: string;
  fileSize: number;
  serverPath: string;
  serverUrl: string;
  isImageUpload: boolean;
  presetName: string;
  font: string;
  linesMode: string;
  fontSize: number;
  maxWords: number;
  letterSpacing: number;
  baseColor: string;
  focusColor: string;
  stroke: number;
  shadow: number;
  karaoke: boolean;
  animLabel: string;
  vertPosPct: number;
  enableAiRefine: boolean;
  cutSilenceEnabled: boolean;
  pacing: string;
  sttEngineChoice: string;
  videoInfo: { duration: number; width: number; height: number; fps: number } | null;
  analysis: {
    original_duration: number;
    final_duration: number;
    silence_saved: number;
    keep_segments: Array<{ start: number; end: number; duration: number }>;
  } | null;
  subtitles: AutoEditSubtitle[];
  rawAiSubtitles: AutoEditSubtitle[];
  masterWords: AutoEditWord[];
  sttStatus: { engine?: string; is_mock?: boolean; errors?: string[] } | null;
  exports: {
    srtCut?: string;
    srtOrig?: string;
    vttCut?: string;
    vttOrig?: string;
    txtPlain?: string;
  };
  renderedMp4Url: string;
  renderedMp4DownloadUrl: string;
  renderedMp4Name: string;
  selectedSubIdx: number;
}

const STATE_KEY = "pk_autoedit_pro_state_v4";
const EMBEDDED_VIDEO_KEY = "autoedit_uploaded_video_v4";

export default function AutoEditKitProPage() {
  const { activeHandoff } = useHub();
  const { showToast } = useToast();

  // File & Media Persistence State
  const [videoObjectUrl, setVideoObjectUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [serverPath, setServerPath] = useState<string>("");
  const [isImageUpload, setIsImageUpload] = useState<boolean>(false);
  const [restoringVault, setRestoringVault] = useState<boolean>(true);

  // Style Settings (Matching app.py defaults 100%)
  const [presetName, setPresetName] = useState<string>("🔥 CapCut ฮิต (ขาว-แดง เด้ง)");
  const [font, setFont] = useState<string>(FONT_OPTIONS[0]);
  const [linesMode, setLinesMode] = useState<string>("1 แถว (แนะนำ)");
  const [fontSize, setFontSize] = useState<number>(8.5);
  const [maxWords, setMaxWords] = useState<number>(5);
  const [letterSpacing, setLetterSpacing] = useState<number>(3.5);
  const [baseColor, setBaseColor] = useState<string>("#FFFFFF");
  const [focusColor, setFocusColor] = useState<string>("#FF1E27");
  const [stroke, setStroke] = useState<number>(8);
  const [shadow, setShadow] = useState<number>(80);
  const [karaoke, setKaraoke] = useState<boolean>(true);
  const [animLabel, setAnimLabel] = useState<string>(ANIM_LABELS[0]);
  const [vertPosPct, setVertPosPct] = useState<number>(82);
  const [enableAiRefine, setEnableAiRefine] = useState<boolean>(true);
  const [customExpanderOpen, setCustomExpanderOpen] = useState<boolean>(false);

  // Silence Cut & STT Engine Settings
  const [cutSilenceEnabled, setCutSilenceEnabled] = useState<boolean>(true);
  const [pacing, setPacing] = useState<string>("มาตรฐาน (แนะนำ)");
  const [sttEngineChoice, setSttEngineChoice] = useState<string>("🎯 ElevenLabs Scribe STT (แม่นยำสูงสุด)");

  // Analysis & Subtitle Data
  const [videoInfo, setVideoInfo] = useState<AutoEditPersistedState["videoInfo"]>(null);
  const [analysis, setAnalysis] = useState<AutoEditPersistedState["analysis"]>(null);
  const [subtitles, setSubtitles] = useState<AutoEditSubtitle[]>([]);
  const [rawAiSubtitles, setRawAiSubtitles] = useState<AutoEditSubtitle[]>([]);
  const [masterWords, setMasterWords] = useState<AutoEditWord[]>([]);
  const [sttStatus, setSttStatus] = useState<AutoEditPersistedState["sttStatus"]>(null);
  const [exportsData, setExportsData] = useState<AutoEditPersistedState["exports"]>({});
  const [selectedSubIdx, setSelectedSubIdx] = useState<number>(0);

  // Export & Render State
  const [activeExportTab, setActiveExportTab] = useState<"mp4" | "sub" | "capcut">("mp4");
  const [srtTimelineMode, setSrtTimelineMode] = useState<"cut" | "orig">("cut");
  const [renderedMp4Url, setRenderedMp4Url] = useState<string>("");
  const [renderedMp4DownloadUrl, setRenderedMp4DownloadUrl] = useState<string>("");
  const [renderedMp4Name, setRenderedMp4Name] = useState<string>("");
  const [capcutProjName, setCapcutProjName] = useState<string>(`AutoEdit_${new Date().toISOString().slice(0, 10)}`);

  // Batch Tools & Search State
  const [batchToolsOpen, setBatchToolsOpen] = useState<boolean>(false);
  const [findWord, setFindWord] = useState<string>("");
  const [replaceWord, setReplaceWord] = useState<string>("");
  const [searchKw, setSearchKw] = useState<string>("");

  // Busy Flags & Current Video Time
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analyzeStepMsg, setAnalyzeStepMsg] = useState<string>("");
  const [renderingMp4, setRenderingMp4] = useState<boolean>(false);
  const [sendingCapcut, setSendingCapcut] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Restore Embedded Video File & Full Studio State on Mount (Never loses work on tab switch or F5!)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [savedState, embeddedVideo] = await Promise.all([
          loadStudioState<AutoEditPersistedState>(STATE_KEY),
          loadEmbeddedFile(EMBEDDED_VIDEO_KEY)
        ]);

        if (!mounted) return;

        if (embeddedVideo) {
          setVideoObjectUrl(embeddedVideo.objectUrl);
          setFileName(embeddedVideo.record.name);
          setFileSize(embeddedVideo.record.size);
          if (embeddedVideo.record.serverPath) setServerPath(embeddedVideo.record.serverPath);
        }

        if (savedState) {
          if (savedState.fileName && !embeddedVideo) {
            setFileName(savedState.fileName);
            setFileSize(savedState.fileSize || 0);
            if (savedState.serverUrl) setVideoObjectUrl(savedState.serverUrl);
          }
          if (savedState.serverPath) setServerPath(savedState.serverPath);
          setIsImageUpload(!!savedState.isImageUpload);
          setPresetName(savedState.presetName || "🔥 CapCut ฮิต (ขาว-แดง เด้ง)");
          setFont(savedState.font || FONT_OPTIONS[0]);
          setLinesMode(savedState.linesMode || "1 แถว (แนะนำ)");
          setFontSize(savedState.fontSize ?? 8.5);
          setMaxWords(savedState.maxWords ?? 5);
          setLetterSpacing(savedState.letterSpacing ?? 3.5);
          setBaseColor(savedState.baseColor || "#FFFFFF");
          setFocusColor(savedState.focusColor || "#FF1E27");
          setStroke(savedState.stroke ?? 8);
          setShadow(savedState.shadow ?? 80);
          setKaraoke(savedState.karaoke ?? true);
          setAnimLabel(savedState.animLabel || ANIM_LABELS[0]);
          setVertPosPct(savedState.vertPosPct ?? 82);
          setEnableAiRefine(savedState.enableAiRefine ?? true);
          setCutSilenceEnabled(savedState.cutSilenceEnabled ?? true);
          setPacing(savedState.pacing || "มาตรฐาน (แนะนำ)");
          setSttEngineChoice(savedState.sttEngineChoice || "🎯 ElevenLabs Scribe STT (แม่นยำสูงสุด)");
          setVideoInfo(savedState.videoInfo || null);
          setAnalysis(savedState.analysis || null);
          setSubtitles(savedState.subtitles || []);
          setRawAiSubtitles(savedState.rawAiSubtitles || []);
          setMasterWords(savedState.masterWords || []);
          setSttStatus(savedState.sttStatus || null);
          setExportsData(savedState.exports || {});
          setRenderedMp4Url(savedState.renderedMp4Url || "");
          setRenderedMp4DownloadUrl(savedState.renderedMp4DownloadUrl || "");
          setRenderedMp4Name(savedState.renderedMp4Name || "");
          setSelectedSubIdx(savedState.selectedSubIdx || 0);
        }
      } finally {
        if (mounted) setRestoringVault(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-save full studio state whenever anything changes
  useEffect(() => {
    if (restoringVault) return;
    const stateToSave: AutoEditPersistedState = {
      fileName,
      fileSize,
      serverPath,
      serverUrl: serverPath ? `/api/storage/media?file=${encodeURIComponent(serverPath.split(/[\\/]/).pop() || "")}` : "",
      isImageUpload,
      presetName,
      font,
      linesMode,
      fontSize,
      maxWords,
      letterSpacing,
      baseColor,
      focusColor,
      stroke,
      shadow,
      karaoke,
      animLabel,
      vertPosPct,
      enableAiRefine,
      cutSilenceEnabled,
      pacing,
      sttEngineChoice,
      videoInfo,
      analysis,
      subtitles,
      rawAiSubtitles,
      masterWords,
      sttStatus,
      exports: exportsData,
      renderedMp4Url,
      renderedMp4DownloadUrl,
      renderedMp4Name,
      selectedSubIdx
    };
    saveStudioState(STATE_KEY, stateToSave);
  }, [
    restoringVault,
    fileName,
    fileSize,
    serverPath,
    isImageUpload,
    presetName,
    font,
    linesMode,
    fontSize,
    maxWords,
    letterSpacing,
    baseColor,
    focusColor,
    stroke,
    shadow,
    karaoke,
    animLabel,
    vertPosPct,
    enableAiRefine,
    cutSilenceEnabled,
    pacing,
    sttEngineChoice,
    videoInfo,
    analysis,
    subtitles,
    rawAiSubtitles,
    masterWords,
    sttStatus,
    exportsData,
    renderedMp4Url,
    renderedMp4DownloadUrl,
    renderedMp4Name,
    selectedSubIdx
  ]);

  const handleApplyPreset = (nextPreset: string) => {
    setPresetName(nextPreset);
    const cfg = STYLE_PRESETS[nextPreset];
    if (cfg) {
      setFont(cfg.font);
      setBaseColor(cfg.baseColor);
      setFocusColor(cfg.focusColor);
      setAnimLabel(cfg.animLabel);
      setKaraoke(cfg.karaoke);
      setStroke(cfg.stroke);
      setShadow(cfg.shadow);
    } else {
      setCustomExpanderOpen(true);
    }
  };

  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lower = file.name.toLowerCase();
    const isImg = [".png", ".jpg", ".jpeg", ".heic", ".webp"].some((ext) => lower.endsWith(ext));
    setIsImageUpload(isImg);

    showToast(`กำลังฝังไฟล์ "${file.name}" เข้าสู่ระบบ (สลับหน้าหรือรีเฟรชไม่หาย)...`, "info");
    const { objectUrl, record } = await saveEmbeddedFile(EMBEDDED_VIDEO_KEY, file, file.name, true);

    setVideoObjectUrl(objectUrl);
    setFileName(file.name);
    setFileSize(file.size);
    setServerPath(record.serverPath || "");
    setSubtitles([]);
    setRawAiSubtitles([]);
    setMasterWords([]);
    setAnalysis(null);
    setRenderedMp4Url("");
    setRenderedMp4DownloadUrl("");
    setSelectedSubIdx(0);

    if (isImg) {
      showToast("🖼️ นี่คือไฟล์รูปภาพ — กรุณาเลือกไฟล์วิดีโอ .mp4 หรือ .mov ครับ", "error");
    } else {
      showToast(`✅ ฝังไฟล์ "${file.name}" สำเร็จ! กด 🚀 วิเคราะห์คลิป & สร้างซับอัตโนมัติ ได้เลย`, "success");
    }
    e.target.value = "";
  };

  const handleClearFileAndReset = async () => {
    await removeEmbeddedFile(EMBEDDED_VIDEO_KEY);
    setVideoObjectUrl("");
    setFileName("");
    setFileSize(0);
    setServerPath("");
    setIsImageUpload(false);
    setVideoInfo(null);
    setAnalysis(null);
    setSubtitles([]);
    setRawAiSubtitles([]);
    setMasterWords([]);
    setSttStatus(null);
    setExportsData({});
    setRenderedMp4Url("");
    setRenderedMp4DownloadUrl("");
    setRenderedMp4Name("");
    setSelectedSubIdx(0);
    showToast("ล้างไฟล์และเริ่มกระดานใหม่เรียบร้อย", "info");
  };

  const handleAnalyzeAndTranscribe = async () => {
    if (!serverPath && !fileName) {
      showToast("⚠️ กรุณาอัปโหลดไฟล์วิดีโอก่อนเริ่มวิเคราะห์ครับ", "error");
      return;
    }
    if (isImageUpload) {
      showToast("⚠️ ไฟล์ที่เลือกเป็นรูปภาพ กรุณาเปลี่ยนเป็นไฟล์วิดีโอ (.mp4, .mov)", "error");
      return;
    }

    const prefEngine = sttEngineChoice.includes("ElevenLabs")
      ? "elevenlabs"
      : sttEngineChoice.includes("Gemini")
      ? "gemini"
      : "groq";

    setAnalyzing(true);
    setAnalyzeStepMsg("✂️ 1/3 — วิเคราะห์และตัดช่วงเงียบ + 🎙️ 2/3 — ถอดเสียงภาษาไทย...");

    try {
      const res = await fetch("/api/auto-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ANALYZE",
          serverPath,
          fileName,
          cutSilenceEnabled,
          pacing,
          preferredEngine: prefEngine,
          linesMode,
          maxWords,
          enableAiRefine,
          vertPosPct
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVideoInfo(data.videoInfo || null);
        setAnalysis(data.analysis || null);
        setSubtitles(data.subtitles || []);
        setRawAiSubtitles(JSON.parse(JSON.stringify(data.subtitles || [])));
        setMasterWords(data.masterWords || []);
        setSttStatus(data.sttStatus || null);
        setExportsData(data.exports || {});
        setSelectedSubIdx(0);
        setRenderedMp4Url("");
        setRenderedMp4DownloadUrl("");
        showToast(`✅ วิเคราะห์และถอดเสียงเสร็จสมบูรณ์ (${(data.subtitles || []).length} ท่อน)!`, "success");
      } else {
        showToast(data.error || "เกิดข้อผิดพลาดในการวิเคราะห์คลิป", "error");
      }
    } catch (err: any) {
      showToast(`เกิดข้อผิดพลาด: ${err?.message}`, "error");
    } finally {
      setAnalyzing(false);
      setAnalyzeStepMsg("");
    }
  };

  // Sync edits, split, merge, or shift with backend word-level karaoke realignment
  const syncSubtitlesWithEngine = async (
    nextSubs: AutoEditSubtitle[],
    operation: "realign" | "split" | "merge" | "shift" = "realign",
    targetIndex: number = -1,
    deltaSec: number = 0
  ) => {
    setSubtitles(nextSubs);
    try {
      const res = await fetch("/api/auto-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SUBS",
          operation,
          targetIndex,
          deltaSec,
          subtitles: nextSubs,
          keepSegments: analysis?.keep_segments || [],
          masterWords,
          vertPosPct
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubtitles(data.subtitles);
        if (data.exports) setExportsData(data.exports);
      }
    } catch {}
  };

  const handleFindAndReplaceAll = async () => {
    if (!findWord.trim()) return;
    let count = 0;
    const updated = subtitles.map((s) => {
      if (s.text.includes(findWord)) {
        count++;
        return { ...s, text: s.text.split(findWord).join(replaceWord) };
      }
      return s;
    });
    if (count > 0) {
      await syncSubtitlesWithEngine(updated, "realign");
      showToast(`✅ แทนที่คำสำเร็จ ${count} ท่อน พร้อมคำนวณไฮไลต์คำใหม่เรียบร้อย!`, "success");
    } else {
      showToast(`ไม่พบคำว่า "${findWord}"`, "info");
    }
  };

  const handleRenderMp4WithSubtitles = async () => {
    if (!serverPath || subtitles.length === 0) return;
    setRenderingMp4(true);
    try {
      const animType = karaoke ? ANIM_PRESETS[animLabel] || "pop" : "none";
      const res = await fetch("/api/auto-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RENDER_MP4",
          serverPath,
          keepSegments: analysis?.keep_segments || [],
          subtitles,
          fontName: font,
          fontSize,
          baseColorHex: baseColor,
          focusColorHex: karaoke ? focusColor : baseColor,
          strokeVal: stroke,
          shadowVal: shadow,
          vertPosPct,
          letterSpacing,
          karaokeMode: karaoke,
          animType
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRenderedMp4Url(data.previewUrl);
        setRenderedMp4DownloadUrl(data.downloadUrl);
        setRenderedMp4Name(data.renderedFileName || `AutoEdit_${fileName}`);
        showToast("✅ เรนเดอร์ไฟล์ MP4 พร้อมตัดเดดแอร์และฝังซับเสร็จสมบูรณ์! กดดาวน์โหลดได้เลย", "success");
      } else {
        showToast(data.error || "เรนเดอร์ MP4 ไม่สำเร็จ", "error");
      }
    } catch (err: any) {
      showToast(`เรนเดอร์ไม่สำเร็จ: ${err?.message}`, "error");
    } finally {
      setRenderingMp4(false);
    }
  };

  const handleSendToCapCutDesktop = async () => {
    if (!serverPath || subtitles.length === 0) return;
    setSendingCapcut(true);
    try {
      const animType = karaoke ? ANIM_PRESETS[animLabel] || "pop" : "none";
      const res = await fetch("/api/auto-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CAPCUT_DESKTOP",
          serverPath,
          keepSegments: analysis?.keep_segments || [],
          subtitles,
          projectName: capcutProjName,
          fontName: font,
          fontSize,
          baseColorHex: baseColor,
          focusColorHex: karaoke ? focusColor : baseColor,
          strokeVal: stroke,
          shadowVal: shadow,
          vertPosPct,
          letterSpacing,
          karaokeMode: karaoke,
          animType
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`🎉 ส่งโปรเจกต์ "${data.projectName}" เข้า CapCut Desktop สำเร็จ! เปิด CapCut ได้เลย`, "success");
      } else {
        showToast(data.error || "ไม่สามารถสร้างโปรเจกต์ CapCut ได้", "error");
      }
    } finally {
      setSendingCapcut(false);
    }
  };

  const handleDownloadTextFile = (content: string, ext: string, prefix: string = "Subtitles") => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prefix}_${fileName.replace(/\.[^.]+$/, "") || Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`ดาวน์โหลดไฟล์ .${ext} ลงเครื่องเรียบร้อย!`, "success");
  };

  // Compute clean font family & WYSIWYG style
  const cleanFontFamily = font.includes("Kanit") || font.includes("คณิต")
    ? "Kanit"
    : font.includes("Mazda")
    ? "Prompt"
    : font.split("(")[0].trim();

  const animType = karaoke ? ANIM_PRESETS[animLabel] || "pop" : "none";
  const strokeW = Math.max(1, Math.min(3, Math.round(stroke / 4)));
  const shadowAlpha = Number((shadow / 100).toFixed(2));
  const baseTextShadow = `${strokeW}px ${strokeW}px 0 #000, -${strokeW}px -${strokeW}px 0 #000, ${strokeW}px -${strokeW}px 0 #000, -${strokeW}px ${strokeW}px 0 #000, 0 3px 8px rgba(0,0,0,${shadowAlpha})`;

  // Active subtitle for live video overlay and WYSIWYG preview strip
  const liveVideoSub =
    subtitles.find((s) => currentTime >= s.source_start && currentTime <= s.source_end) ||
    subtitles[selectedSubIdx] ||
    null;

  const wysiwygSampleText =
    subtitles[selectedSubIdx]?.text || subtitles[0]?.text || "ตัวอย่างสไตล์ซับไตเติล";
  const wysiwygTokens =
    subtitles[selectedSubIdx]?.words?.map((w) => w.word) || wysiwygSampleText.split(/\s+/);
  const highlightIdx = Math.min(wysiwygTokens.length - 1, Math.max(0, Math.floor(wysiwygTokens.length / 2)));

  const displayedSubtitles = subtitles
    .map((s, idx) => ({ idx, sub: s }))
    .filter(({ sub }) => !searchKw.trim() || sub.text.toLowerCase().includes(searchKw.trim().toLowerCase()));

  return (
    <div className="space-y-5 pb-12">
      {/* =====================================================================
          1. DEEP OBSIDIAN SLATE HEADER BAR (Exact PK Auto Edit Kit Pro Header)
      ===================================================================== */}
      <section
        className="rounded-2xl p-5 sm:p-6 text-white border border-white/10 border-t-white/20 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        style={{
          background: "radial-gradient(ellipse 90% 90% at 50% -20%, rgba(30, 58, 138, 0.48), rgba(9, 13, 22, 1))"
        }}
      >
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              ⚡ PK Auto Edit Kit
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Subtitle Studio Pro
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            ระบบตัดต่ออัตโนมัติ: ปรับแต่งฟอนต์ สี แถวคำให้เรียบร้อย แล้วค่อยกดเรนเดอร์ MP4 หรือส่งเข้า CapCut Desktop เพียงคลิกเดียว
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
            <span>ElevenLabs Scribe</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
            <span>Groq Whisper v3</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-400/30 text-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>ฝังไฟล์อัตโนมัติ (รีเฟรชไม่หาย)</span>
          </span>
        </div>
      </section>

      {/* =====================================================================
          2. 3-COLUMN SYMMETRICAL STUDIO LAYOUT (Matching app.py 100%)
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ===================================================================
            COLUMN 1: ⚙️ สตูดิโอตั้งค่า (Controls & Settings)
        =================================================================== */}
        <div className="lg:col-span-4 space-y-3.5">
          <div className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            ⚙️ สตูดิโอตั้งค่า
          </div>

          {/* Card 1: 📂 1. อัปโหลดคลิป & เริ่มทำงาน */}
          <div className="rounded-[14px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 shadow-2xs space-y-3">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              📂 1. อัปโหลดคลิป & เริ่มทำงาน
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-slate-50 dark:bg-zinc-800/70 hover:bg-blue-50/60 dark:hover:bg-zinc-800 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-blue-400 p-4 text-center cursor-pointer transition-all"
            >
              <Upload className="w-6 h-6 text-blue-600 mx-auto mb-1.5" />
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                คลิกเพื่อเลือกไฟล์วิดีโอ (.mp4, .mov, .mkv, .avi)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                ไฟล์ที่เลือกจะถูกฝังไว้ในระบบ สลับหน้าหรือรีเฟรชไม่หาย
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,.mp4,.mov,.mkv,.avi,.png,.jpg,.jpeg,.heic"
                onChange={handleVideoFileSelect}
                className="hidden"
              />
            </div>

            {fileName && (
              <div
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
                  isImageUpload
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                }`}
              >
                <span className="truncate">
                  {isImageUpload
                    ? "🖼️ นี่คือไฟล์รูปภาพ — กรุณาเลือกไฟล์วิดีโอ .mp4 หรือ .mov ครับ"
                    : `✅ ${fileName} (${(fileSize / (1024 * 1024)).toFixed(1)} MB)`}
                </span>
              </div>
            )}

            {/* Primary CTA right under uploader */}
            <button
              type="button"
              disabled={!fileName || isImageUpload || analyzing}
              onClick={handleAnalyzeAndTranscribe}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-[10px] bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] hover:from-[#3B82F6] hover:to-[#2563EB] text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{analyzeStepMsg || "กำลังวิเคราะห์คลิป..."}</span>
                </>
              ) : (
                <span>🚀 วิเคราะห์คลิป & สร้างซับอัตโนมัติ</span>
              )}
            </button>

            {fileName && (
              <button
                type="button"
                onClick={handleClearFileAndReset}
                className="w-full min-h-[38px] px-3 py-1.5 rounded-[10px] bg-white dark:bg-zinc-800 hover:bg-slate-50 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
              >
                🔄 ล้างไฟล์ / เริ่มคลิปใหม่
              </button>
            )}
          </div>

          {/* Card 2: 🎨 2. สไตล์ซับไตเติล (1 คลิก) */}
          <div className="rounded-[14px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 shadow-2xs space-y-3">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              🎨 2. สไตล์ซับไตเติล (1 คลิก)
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                เลือกสไตล์สำเร็จรูป:
              </label>
              <select
                value={presetName}
                onChange={(e) => handleApplyPreset(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                {Object.keys(STYLE_PRESETS).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={enableAiRefine}
                onChange={(e) => setEnableAiRefine(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span>✨ ขัดเกลาภาษาไทย & วรรคตอนด้วย Gemini AI</span>
            </label>

            {/* Fine-tuning Expander */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setCustomExpanderOpen(!customExpanderOpen)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/80 text-left text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer"
              >
                <span>🎛️ ปรับแต่งฟอนต์ สี และตำแหน่งละเอียด</span>
                <span>{customExpanderOpen ? "▲" : "▼"}</span>
              </button>

              {customExpanderOpen && (
                <div className="p-3.5 space-y-3 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-700">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                      เลือกฟอนต์:
                    </label>
                    <select
                      value={font}
                      onChange={(e) => setFont(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-semibold"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        จำนวนแถว:
                      </label>
                      <select
                        value={linesMode}
                        onChange={(e) => setLinesMode(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-semibold"
                      >
                        <option value="1 แถว (แนะนำ)">1 แถว (แนะนำ)</option>
                        <option value="2 แถว (ประโยคยาว)">2 แถว (ประโยคยาว)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        ขนาดตัวอักษร: {fontSize}
                      </label>
                      <input
                        type="range"
                        min={6.0}
                        max={14.0}
                        step={0.5}
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        คำสูงสุดต่อแถว: {maxWords}
                      </label>
                      <input
                        type="range"
                        min={3}
                        max={8}
                        step={1}
                        value={maxWords}
                        onChange={(e) => setMaxWords(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        ระยะห่างตัวอักษร: {letterSpacing}px
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={8}
                        step={0.5}
                        value={letterSpacing}
                        onChange={(e) => setLetterSpacing(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        สีข้อความหลัก:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={baseColor}
                          onChange={(e) => setBaseColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                        <span className="text-xs font-mono">{baseColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        สีคำที่กำลังพูด:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={focusColor}
                          onChange={(e) => setFocusColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                        <span className="text-xs font-mono">{focusColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        ขอบดำ: {stroke}
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        step={1}
                        value={stroke}
                        onChange={(e) => setStroke(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        เงา (%): {shadow}%
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={shadow}
                        onChange={(e) => setShadow(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={karaoke}
                      onChange={(e) => setKaraoke(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span>🔥 ไฮไลต์คำพูดตามเสียง (Word Focus)</span>
                  </label>

                  {karaoke && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        🎬 แอนิเมชันคำพูด:
                      </label>
                      <select
                        value={animLabel}
                        onChange={(e) => setAnimLabel(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-semibold"
                      >
                        {ANIM_LABELS.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                      ↕️ ตำแหน่งความสูงซับ (%): {vertPosPct}%
                    </label>
                    <input
                      type="range"
                      min={55}
                      max={92}
                      step={1}
                      value={vertPosPct}
                      onChange={(e) => setVertPosPct(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: ✂️ 3. ตัดเดดแอร์ & เครื่องยนต์ AI */}
          <div className="rounded-[14px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 shadow-2xs space-y-3">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              ✂️ 3. ตัดเดดแอร์ & เครื่องยนต์ AI
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={cutSilenceEnabled}
                onChange={(e) => setCutSilenceEnabled(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span>เปิดตัดเสียงเงียบอัตโนมัติ (Silence Cut)</span>
            </label>

            {cutSilenceEnabled && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  จังหวะการตัด:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["ผ่อนคลาย", "มาตรฐาน (แนะนำ)", "กระชับเร็ว"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPacing(p)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        pacing === p
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                🤖 เครื่องยนต์ AI ถอดเสียง:
              </label>
              <select
                value={sttEngineChoice}
                onChange={(e) => setSttEngineChoice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold"
              >
                <option value="🎯 ElevenLabs Scribe STT (แม่นยำสูงสุด)">
                  🎯 ElevenLabs Scribe STT (แม่นยำสูงสุด)
                </option>
                <option value="⚡ Groq Whisper Large v3 (เร็วพิเศษ)">
                  ⚡ Groq Whisper Large v3 (เร็วพิเศษ)
                </option>
                <option value="✨ Google Gemini 3.8 Flash (มัลติโมดอล)">
                  ✨ Google Gemini 3.8 Flash (มัลติโมดอล)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* ===================================================================
            COLUMN 2: 📱 จอมอนิเตอร์ & ส่งออก (Live Monitor & Export Studio)
        =================================================================== */}
        <div className="lg:col-span-4 space-y-3.5">
          <div className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            📱 จอมอนิเตอร์ & ส่งออก
          </div>

          {/* Card 1: 🎬 จอพรีวิวสด & ตัวอย่างสไตล์ */}
          <div className="rounded-[14px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 shadow-2xs space-y-3">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              🎬 จอพรีวิวสด & ตัวอย่างสไตล์
            </div>

            {videoObjectUrl && !isImageUpload ? (
              <div className="space-y-2">
                {/* Titanium Smartphone Frame */}
                <div className="relative max-w-[268px] mx-auto bg-black rounded-[26px] border-4 border-[#1E293B] shadow-2xl overflow-hidden">
                  <video
                    ref={videoRef}
                    src={renderedMp4Url || videoObjectUrl}
                    controls
                    playsInline
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    className="w-full h-auto max-h-[430px] object-contain block rounded-[22px]"
                  />

                  {/* Live Synchronized Subtitle Overlay (shown when playing raw video before MP4 burn-in) */}
                  {!renderedMp4Url && liveVideoSub && (
                    <div
                      className="pointer-events-none absolute left-2 right-2 text-center px-2"
                      style={{ top: `${Math.min(88, Math.max(15, vertPosPct - 10))}%` }}
                    >
                      <div
                        style={{
                          fontFamily: `'${cleanFontFamily}', 'Prompt', sans-serif`,
                          fontWeight: 900,
                          fontSize: `${Math.max(14, fontSize * 1.95)}px`,
                          letterSpacing: `${letterSpacing}px`,
                          lineHeight: 1.35
                        }}
                      >
                        {karaoke && liveVideoSub.words?.length > 0 ? (
                          liveVideoSub.words.map((w, wi) => {
                            const isWordActive = currentTime >= w.start && currentTime <= w.end;
                            return (
                              <span
                                key={wi}
                                style={{
                                  color: isWordActive ? focusColor : baseColor,
                                  textShadow:
                                    isWordActive && animType === "glow"
                                      ? `0 0 12px ${focusColor}, ${baseTextShadow}`
                                      : baseTextShadow,
                                  fontSize:
                                    isWordActive && (animType === "pop" || animType === "zoom")
                                      ? "1.16em"
                                      : "1em",
                                  display: "inline-block",
                                  transform:
                                    isWordActive && animType === "jump" ? "translateY(-2px)" : "none"
                                }}
                              >
                                {w.word}
                              </span>
                            );
                          })
                        ) : (
                          <span style={{ color: baseColor, textShadow: baseTextShadow }}>
                            {liveVideoSub.text}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {videoInfo && (
                  <div className="text-center text-xs text-slate-500 font-mono">
                    ความยาว <b>{videoInfo.duration?.toFixed(2)}s</b> •{" "}
                    <b>
                      {videoInfo.width}×{videoInfo.height}
                    </b>{" "}
                    • <b>{Math.round(videoInfo.fps || 30)} fps</b>
                  </div>
                )}
              </div>
            ) : (
              /* Editorial Craft Empty State (Zero sample clip pre-loaded!) */
              <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 p-8 text-center space-y-1.5">
                <div className="text-3xl">🎬</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  พร้อมแสดงตัวอย่างคลิป
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  อัปโหลดวิดีโอ (.mp4, .mov) แล้วกด <b>🚀 วิเคราะห์คลิป</b> เพื่อเริ่มงานทันที
                </p>
              </div>
            )}

            {/* Always-Visible WYSIWYG Subtitle Style Preview Strip */}
            <div
              className="rounded-xl p-3.5 text-center border border-slate-700 shadow-inner"
              style={{ background: "linear-gradient(145deg, #0F172A 0%, #1E293B 100%)" }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                ตัวอย่างสไตล์ซับจริง (WYSIWYG Preview)
              </div>
              <div
                style={{
                  fontFamily: `'${cleanFontFamily}', 'Prompt', sans-serif`,
                  fontWeight: 900,
                  fontSize: "1.22rem",
                  letterSpacing: `${letterSpacing}px`,
                  lineHeight: 1.35
                }}
              >
                {wysiwygTokens.map((tok, idx) => {
                  const isFocus = karaoke && idx === highlightIdx;
                  return (
                    <span
                      key={idx}
                      style={{
                        color: isFocus ? focusColor : baseColor,
                        textShadow:
                          isFocus && animType === "glow"
                            ? `0 0 12px ${focusColor}, ${baseTextShadow}`
                            : baseTextShadow,
                        fontSize:
                          isFocus && (animType === "pop" || animType === "zoom") ? "1.16em" : "1em",
                        display: "inline-block",
                        transform: isFocus && animType === "jump" ? "translateY(-2px)" : "none"
                      }}
                    >
                      {tok}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Symmetrical 3-Column Metrics Summary */}
            {analysis && (
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-center">
                  <div className="text-[11px] font-semibold text-slate-500">เดิม</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                    {analysis.original_duration?.toFixed(1)}s
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-center">
                  <div className="text-[11px] font-semibold text-slate-500">หลังตัด</div>
                  <div className="text-base font-extrabold text-emerald-600 font-mono">
                    {analysis.final_duration?.toFixed(1)}s
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-center">
                  <div className="text-[11px] font-semibold text-slate-500">ประหยัด</div>
                  <div className="text-base font-extrabold text-blue-600 font-mono">
                    -{analysis.silence_saved?.toFixed(1)}s
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: 📦 ส่งออกผลงาน (Export) — 3 Segmented Tabs */}
          <div className="rounded-[14px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 shadow-2xs space-y-3">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              📦 ส่งออกผลงาน (Export)
            </div>

            {/* iOS Segmented Control Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
              {[
                { id: "mp4" as const, label: "🎬 คลิป MP4" },
                { id: "sub" as const, label: "📄 ซับ SRT" },
                { id: "capcut" as const, label: "🚀 CapCut" }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveExportTab(t.id)}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeExportTab === t.id
                      ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-2xs"
                      : "text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Direct MP4 Render & Download */}
            {activeExportTab === "mp4" && (
              <div className="space-y-2.5 pt-1">
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  ตัดเดดแอร์และฝังซับไตเติลคาราโอเกะลงไฟล์ MP4 พร้อมบันทึกเข้าเครื่องคอมหรือมือถือทันที
                </p>
                <button
                  type="button"
                  disabled={subtitles.length === 0 || renderingMp4}
                  onClick={handleRenderMp4WithSubtitles}
                  className="w-full min-h-[42px] px-4 py-2 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {renderingMp4 ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>⏳ กำลังตัดเดดแอร์ + ฝังซับลงคลิป MP4...</span>
                    </>
                  ) : (
                    <span>⚡ เรนเดอร์ไฟล์ MP4 พร้อมซับ</span>
                  )}
                </button>

                {renderedMp4DownloadUrl && (
                  <div className="space-y-2 pt-1 animate-fade-in">
                    <a
                      href={renderedMp4DownloadUrl}
                      download={renderedMp4Name || "AutoEdit_Video.mp4"}
                      className="w-full min-h-[42px] px-4 py-2.5 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>⬇️ ดาวน์โหลดคลิป (.mp4) ลงเครื่อง/มือถือ</span>
                    </a>
                    <a
                      href="capcut://"
                      className="w-full min-h-[38px] px-4 py-2 rounded-[10px] bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center gap-2 border border-slate-700"
                    >
                      <span>📱 เปิดแอป CapCut บนมือถือ</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Editable Subtitles (.SRT / .VTT / .TXT) */}
            {activeExportTab === "sub" && (
              <div className="space-y-2.5 pt-1">
                {subtitles.length > 0 ? (
                  <>
                    <div className="space-y-1.5 text-xs">
                      <div className="font-bold text-slate-700 dark:text-zinc-300">
                        เลือกไทม์ไลน์ของไฟล์ซับ:
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="srt_mode"
                          checked={srtTimelineMode === "cut"}
                          onChange={() => setSrtTimelineMode("cut")}
                        />
                        <span>✂️ ไทม์ไลน์หลังตัดเดดแอร์ (ใช้กับ MP4 ที่เรนเดอร์)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="srt_mode"
                          checked={srtTimelineMode === "orig"}
                          onChange={() => setSrtTimelineMode("orig")}
                        />
                        <span>🎞️ ไทม์ไลน์คลิปเดิม (ใช้กับคลิปต้นฉบับใน CapCut มือถือ)</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadTextFile(
                          (srtTimelineMode === "orig" ? exportsData.srtOrig : exportsData.srtCut) || "",
                          "srt",
                          "Subtitles"
                        )
                      }
                      className="w-full min-h-[40px] px-3 py-2 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>📥 ดาวน์โหลดไฟล์ซับ (.srt) — แก้คำใน CapCut ได้</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadTextFile(
                            (srtTimelineMode === "orig" ? exportsData.vttOrig : exportsData.vttCut) || "",
                            "vtt",
                            "Subtitles"
                          )
                        }
                        className="min-h-[38px] px-3 py-1.5 rounded-[10px] bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold cursor-pointer"
                      >
                        📥 ไฟล์ .vtt (YouTube)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadTextFile(exportsData.txtPlain || "", "txt", "Script")
                        }
                        className="min-h-[38px] px-3 py-1.5 rounded-[10px] bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold cursor-pointer"
                      >
                        📝 สคริปต์ .txt
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">
                    กดวิเคราะห์คลิปในขั้นที่ 1 ก่อน จึงจะดาวน์โหลดไฟล์ `.srt`, `.vtt` และสคริปต์ได้ครับ
                  </p>
                )}
              </div>
            )}

            {/* Tab 3: CapCut Desktop */}
            {activeExportTab === "capcut" && (
              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    ชื่อโปรเจกต์ใน CapCut:
                  </label>
                  <input
                    type="text"
                    value={capcutProjName}
                    onChange={(e) => setCapcutProjName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold"
                  />
                </div>
                <button
                  type="button"
                  disabled={subtitles.length === 0 || sendingCapcut}
                  onClick={handleSendToCapCutDesktop}
                  className="w-full min-h-[42px] px-4 py-2 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {sendingCapcut ? "📦 กำลังสร้างโปรเจกต์..." : "🚀 ส่งเข้า CapCut Desktop ทันที"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch("/api/auto-edit", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "CLEANUP_CAPCUT" })
                    });
                    const data = await res.json();
                    showToast(
                      data.deletedCount > 0
                        ? `ล้างดราฟต์เก่าไป ${data.deletedCount} โฟลเดอร์เรียบร้อย`
                        : "ไม่มีดราฟต์เก่าที่ต้องลบ",
                      "info"
                    );
                  }}
                  className="w-full min-h-[36px] px-3 py-1.5 rounded-[10px] bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-semibold cursor-pointer"
                >
                  🧹 ล้าง Draft เก่าใน CapCut
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================
            COLUMN 3: 📝 ตรวจทาน & ปรับแต่งซับไตเติล (Subtitle Studio Cards)
        =================================================================== */}
        <div className="lg:col-span-4 space-y-3.5">
          <div className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            📝 ตรวจทาน & ปรับแต่งซับไตเติล
          </div>

          {subtitles.length > 0 ? (
            <div className="space-y-3">
              {/* Overview Stats Bar */}
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 text-xs font-bold font-mono">
                  🎯 {subtitles.length} ท่อน
                </span>
                {analysis && (
                  <>
                    <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-semibold font-mono">
                      ⏱️ เดิม {analysis.original_duration?.toFixed(1)}s
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold font-mono">
                      ✂️ หลังตัด {analysis.final_duration?.toFixed(1)}s
                    </span>
                  </>
                )}
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold uppercase font-mono">
                  🤖 {sttStatus?.engine || "AI"}
                </span>
              </div>

              {/* Batch Tools Expander */}
              <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setBatchToolsOpen(!batchToolsOpen)}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer"
                >
                  <span>⚡ เครื่องมือจัดการทั้งคลิป (ขยับเวลา • แทนที่คำ • เพิ่ม/คืนค่า)</span>
                  <span>{batchToolsOpen ? "▲" : "▼"}</span>
                </button>

                {batchToolsOpen && (
                  <div className="p-3.5 border-t border-slate-200 dark:border-zinc-800 space-y-3">
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => syncSubtitlesWithEngine(subtitles, "shift", -1, -0.1)}
                        className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                      >
                        ⏪ -0.1s
                      </button>
                      <button
                        type="button"
                        onClick={() => syncSubtitlesWithEngine(subtitles, "shift", -1, 0.1)}
                        className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                      >
                        +0.1s ⏩
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const lastEnd = subtitles.length > 0 ? subtitles[subtitles.length - 1].source_end : 0;
                          const ns = Number((lastEnd + 0.05).toFixed(2));
                          const ne = Number((ns + 1.8).toFixed(2));
                          const added: AutoEditSubtitle = {
                            id: `sub_${Date.now()}`,
                            text: "ข้อความใหม่...",
                            source_start: ns,
                            source_end: ne,
                            timeline_start: ns,
                            timeline_end: ne,
                            duration: 1.8,
                            words: [{ word: "ข้อความใหม่...", start: ns, end: ne }]
                          };
                          syncSubtitlesWithEngine([...subtitles, added], "realign");
                        }}
                        className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                      >
                        ➕ เพิ่มท่อน
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (rawAiSubtitles.length > 0) {
                            syncSubtitlesWithEngine(JSON.parse(JSON.stringify(rawAiSubtitles)), "realign");
                            showToast("คืนค่าซับไตเติลต้นฉบับจาก AI เรียบร้อย", "info");
                          }
                        }}
                        className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                      >
                        🔄 คืนค่า AI
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <input
                        type="text"
                        value={findWord}
                        onChange={(e) => setFindWord(e.target.value)}
                        placeholder="ค้นหาคำผิด..."
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs"
                      />
                      <input
                        type="text"
                        value={replaceWord}
                        onChange={(e) => setReplaceWord(e.target.value)}
                        placeholder="แทนที่ด้วย..."
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleFindAndReplaceAll}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
                      >
                        🔁 แทนที่ทั้งหมด
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKw}
                  onChange={(e) => setSearchKw(e.target.value)}
                  placeholder="🔍 พิมพ์คำเพื่อกรองเฉพาะท่อนที่ต้องการแก้..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs"
                />
              </div>

              {/* Scrollable Subtitle Cards */}
              <div className="max-h-[680px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                {displayedSubtitles.map(({ idx, sub }) => {
                  const isActive = idx === selectedSubIdx;
                  const charCount = sub.text.replace(/\n/g, "").trim().length;
                  const isSafe = charCount <= 24;
                  const dur = Math.max(0.1, sub.source_end - sub.source_start);
                  const showSplit = charCount > 16;
                  const showMerge = idx + 1 < subtitles.length;

                  return (
                    <div
                      key={sub.id}
                      className={`rounded-[14px] bg-white dark:bg-zinc-900 border p-3.5 shadow-2xs space-y-2.5 transition-all ${
                        isActive
                          ? "border-blue-500 ring-2 ring-blue-500/10"
                          : "border-slate-200 dark:border-zinc-800"
                      }`}
                    >
                      {/* Top Bar */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-[#0F172A] text-white text-[11px] font-bold font-mono">
                            ท่อน #{idx + 1}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/25 text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                              กำลังพรีวิว
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                            เดิม {sub.source_start.toFixed(2)}–{sub.source_end.toFixed(2)}s
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            ตัดแล้ว {sub.timeline_start.toFixed(2)}–{sub.timeline_end.toFixed(2)}s
                          </span>
                        </div>
                      </div>

                      {/* Editable Subtitle Text Input (auto-realigns word timestamps on blur!) */}
                      <input
                        type="text"
                        value={sub.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSubtitles((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, text: val } : item))
                          );
                        }}
                        onBlur={() => syncSubtitlesWithEngine(subtitles, "realign")}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-[13.5px] font-medium text-slate-900 dark:text-white focus:border-blue-600 focus:bg-white outline-none"
                      />

                      {/* Safe-Zone Meter & Duration */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono border ${
                            isSafe
                              ? "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]"
                              : "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSafe ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          {isSafe
                            ? `${charCount} ตัวอักษร (พอดี 1 แถว)`
                            : `${charCount} ตัวอักษร (ยาวเกิน 24 ตัว)`}
                        </span>
                        <span className="text-[11.5px] font-bold text-slate-500 font-mono">
                          {dur.toFixed(2)}s
                        </span>
                      </div>

                      {/* Symmetrical 50/50 Timing Row */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            🕒 เริ่ม (วิ)
                          </label>
                          <input
                            type="number"
                            step={0.05}
                            min={0}
                            value={sub.source_start}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value));
                              setSubtitles((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, source_start: val } : item
                                )
                              );
                            }}
                            onBlur={() => syncSubtitlesWithEngine(subtitles, "realign")}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            🏁 จบ (วิ)
                          </label>
                          <input
                            type="number"
                            step={0.05}
                            min={0}
                            value={sub.source_end}
                            onChange={(e) => {
                              const val = Math.max(sub.source_start + 0.1, Number(e.target.value));
                              setSubtitles((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, source_end: val } : item
                                )
                              );
                            }}
                            onBlur={() => syncSubtitlesWithEngine(subtitles, "realign")}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold font-mono"
                          />
                        </div>
                      </div>

                      {/* Symmetrical Equal-Height Action Bar */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubIdx(idx);
                            if (videoRef.current) {
                              videoRef.current.currentTime = sub.source_start;
                              videoRef.current.play().catch(() => {});
                            }
                          }}
                          className="flex-1 min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-50 border border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 cursor-pointer"
                        >
                          👁️ พรีวิว
                        </button>

                        {showSplit && (
                          <button
                            type="button"
                            onClick={() => syncSubtitlesWithEngine(subtitles, "split", idx)}
                            className="flex-1 min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-amber-50 border border-slate-300 dark:border-zinc-700 text-xs font-bold text-amber-700 dark:text-amber-300 cursor-pointer"
                            title="แบ่งครึ่งท่อนอัตโนมัติตรงคำไทย พร้อมปรับเวลาไฮไลต์"
                          >
                            {isSafe ? "✂️ แบ่งครึ่ง" : "✂️ แบ่ง!"}
                          </button>
                        )}

                        {showMerge && (
                          <button
                            type="button"
                            onClick={() => syncSubtitlesWithEngine(subtitles, "merge", idx)}
                            className="flex-1 min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-blue-50 border border-slate-300 dark:border-zinc-700 text-xs font-bold text-blue-700 dark:text-blue-300 cursor-pointer"
                            title="รวมกับท่อนถัดไป พร้อมปรับเวลาไฮไลต์คำพูดใหม่"
                          >
                            🔗 รวมล่าง
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const filtered = subtitles.filter((_, i) => i !== idx);
                            syncSubtitlesWithEngine(filtered, "realign");
                          }}
                          className="w-9 h-[34px] rounded-lg bg-white dark:bg-zinc-800 hover:bg-red-50 border border-slate-300 dark:border-zinc-700 text-xs flex items-center justify-center cursor-pointer"
                          title={`ลบท่อน #${idx + 1}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Editorial Craft Feature Grid Empty State (Exact match to app.py:2043) */
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border-2 border-dashed border-slate-300 dark:border-zinc-700 p-6 text-center space-y-4">
              <div className="text-4xl">⚡</div>
              <div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  สตูดิโอตรวจทานซับไตเติลระดับมืออาชีพ
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  อัปโหลดวิดีโอแล้วกด <b>🚀 วิเคราะห์คลิป & สร้างซับอัตโนมัติ</b> ด้านซ้าย
                  <br />
                  ระบบจะตัดเดดแอร์ ถอดเสียง และจัดท่อนภาษาไทยให้พร้อมแก้ไขทันที
                </p>
              </div>

              <div className="space-y-2.5 text-left max-w-md mx-auto">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700">
                  <div className="text-[10.5px] font-bold tracking-wider text-blue-700 dark:text-blue-400">
                    1-CLICK PRESETS & WYSIWYG
                  </div>
                  <div className="text-xs text-slate-700 dark:text-zinc-300 mt-0.5">
                    เลือกสไตล์ยอดนิยมใน 1 คลิก พร้อมดูตัวอย่างสีและฟอนต์จริงได้ทันทีบนทุกอุปกรณ์
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700">
                  <div className="text-[10.5px] font-bold tracking-wider text-blue-700 dark:text-blue-400">
                    SMART SPLIT • MERGE • FIND & REPLACE
                  </div>
                  <div className="text-xs text-slate-700 dark:text-zinc-300 mt-0.5">
                    แบ่งครึ่งท่อนยาว รวมท่อนสั้น หรือแก้คำผิดทั้งคลิปได้ในคลิกเดียว โดยไฮไลต์ไม่หลุดจังหวะ
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700">
                  <div className="text-[10.5px] font-bold tracking-wider text-blue-700 dark:text-blue-400">
                    FLEXIBLE EXPORT (MP4 / SRT / VTT / CAPCUT)
                  </div>
                  <div className="text-xs text-slate-700 dark:text-zinc-300 mt-0.5">
                    เลือกส่งออกได้ทั้งคลิป MP4 ฝังซับ หรือไฟล์ .SRT ที่ปรับเวลาตรงทั้งคลิปเดิมและคลิปตัดแล้ว
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
