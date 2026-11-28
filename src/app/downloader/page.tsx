"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  RefreshCw,
  Search,
  Upload,
  Trash2,
  CheckCircle2,
  Subtitles,
  Music,
  ShieldCheck,
  Cookie,
  Film,
  FileAudio,
  ClipboardPaste,
  ExternalLink
} from "lucide-react";
import {
  saveEmbeddedFile,
  saveStudioState,
  loadStudioState
} from "@/lib/storage/persistent-media";
import { useToast } from "@/components/ui/ToastProvider";

interface InspectEntry {
  url: string;
  title: string;
  duration?: number;
  thumbnail?: string;
  uploader?: string;
  selected?: boolean;
}

interface MediaJobRecord {
  id: string;
  kind: "download" | "convert";
  title: string;
  targetFormat: string;
  quality: string;
  status: "running" | "completed" | "failed";
  fileName?: string;
  serverPath?: string;
  downloadUrl?: string;
  previewUrl?: string;
  sizeBytes?: number;
  error?: string;
  createdAt: string;
}

interface PersistedToolkitState {
  activeTab: "download" | "convert";
  urlInput: string;
  dlFormat: string;
  dlQuality: string;
  dlCookiesBrowser: string;
  cvFormat: string;
  cvQuality: string;
  cvBitrate: string;
  cvStartTime: string;
  cvEndTime: string;
  inspectEntries: InspectEntry[];
  jobs: MediaJobRecord[];
}

const TOOLKIT_STATE_KEY = "pk_mediatoolkit_state_v4";

function formatDuration(sec?: number): string {
  if (!sec || sec <= 0) return "ไม่ระบุเวลา";
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")} นาที`;
}

export default function PKMediaToolkitPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"download" | "convert">("download");

  // Download Panel State
  const [urlInput, setUrlInput] = useState<string>("");
  const [dlFormat, setDlFormat] = useState<string>("mp4");
  const [dlQuality, setDlQuality] = useState<string>("1080");
  const [dlCookiesBrowser, setDlCookiesBrowser] = useState<string>("");
  const [cookiesText, setCookiesText] = useState<string>("");
  const [cookiesMeta, setCookiesMeta] = useState<{
    loaded: boolean;
    total_cookie_lines?: number;
    youtube_cookies?: number;
    has_youtube_auth?: boolean;
  }>({ loaded: false });

  const [inspecting, setInspecting] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [inspectEntries, setInspectEntries] = useState<InspectEntry[]>([]);

  // Convert Panel State
  const [selectedConvertFiles, setSelectedConvertFiles] = useState<
    Array<{ name: string; size: number; serverPath: string; fileName: string }>
  >([]);
  const [cvFormat, setCvFormat] = useState<string>("mp4");
  const [cvQuality, setCvQuality] = useState<string>("original");
  const [cvBitrate, setCvBitrate] = useState<string>("192");
  const [cvStartTime, setCvStartTime] = useState<string>("");
  const [cvEndTime, setCvEndTime] = useState<string>("");
  const [converting, setConverting] = useState<boolean>(false);

  // Persistent Jobs Queue
  const [jobs, setJobs] = useState<MediaJobRecord[]>([]);
  const [restoring, setRestoring] = useState<boolean>(true);

  const convertInputRef = useRef<HTMLInputElement | null>(null);
  const cookiesFileRef = useRef<HTMLInputElement | null>(null);

  // Restore saved state & check embedded cookies on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await loadStudioState<PersistedToolkitState>(TOOLKIT_STATE_KEY);
        if (mounted && saved) {
          setActiveTab(saved.activeTab || "download");
          setUrlInput(saved.urlInput || "");
          setDlFormat(saved.dlFormat || "mp4");
          setDlQuality(saved.dlQuality || "1080");
          setDlCookiesBrowser(saved.dlCookiesBrowser || "");
          setCvFormat(saved.cvFormat || "mp4");
          setCvQuality(saved.cvQuality || "original");
          setCvBitrate(saved.cvBitrate || "192");
          setCvStartTime(saved.cvStartTime || "");
          setCvEndTime(saved.cvEndTime || "");
          setInspectEntries(saved.inspectEntries || []);
          setJobs(saved.jobs || []);
        }

        const cRes = await fetch("/api/media/toolkit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "COOKIES_STATUS" })
        });
        const cData = await cRes.json();
        if (mounted && cData.cookiesMeta) {
          setCookiesMeta(cData.cookiesMeta);
        }
      } catch {
      } finally {
        if (mounted) setRestoring(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-save state on change
  useEffect(() => {
    if (restoring) return;
    saveStudioState<PersistedToolkitState>(TOOLKIT_STATE_KEY, {
      activeTab,
      urlInput,
      dlFormat,
      dlQuality,
      dlCookiesBrowser,
      cvFormat,
      cvQuality,
      cvBitrate,
      cvStartTime,
      cvEndTime,
      inspectEntries,
      jobs
    });
  }, [
    restoring,
    activeTab,
    urlInput,
    dlFormat,
    dlQuality,
    dlCookiesBrowser,
    cvFormat,
    cvQuality,
    cvBitrate,
    cvStartTime,
    cvEndTime,
    inspectEntries,
    jobs
  ]);

  const handleSaveCookies = async (rawText: string) => {
    if (!rawText.trim()) return;
    try {
      const res = await fetch("/api/media/toolkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SAVE_COOKIES", cookiesText: rawText })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCookiesMeta(data.cookiesMeta || { loaded: true });
        setCookiesText("");
        showToast(data.message || "ฝัง Cookies ถาวรเรียบร้อย!", "success");
      } else {
        showToast(data.error || "บันทึก Cookies ไม่สำเร็จ", "error");
      }
    } catch (err: any) {
      showToast(`เกิดข้อผิดพลาด: ${err?.message}`, "error");
    }
  };

  const handleInspectLinks = async () => {
    const urls = urlInput
      .split(/\r?\n/)
      .map((u) => u.trim())
      .filter(Boolean);
    if (urls.length === 0) {
      showToast("กรุณาวางลิงก์วิดีโออย่างน้อย 1 ลิงก์ก่อนครับ", "info");
      return;
    }

    setInspecting(true);
    try {
      const allEntries: InspectEntry[] = [];
      for (const u of urls) {
        const res = await fetch("/api/media/toolkit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "INSPECT",
            url: u,
            cookiesBrowser: dlCookiesBrowser
          })
        });
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          const info = data.data;
          if (info.is_playlist && Array.isArray(info.entries)) {
            info.entries.forEach((e: any) => {
              allEntries.push({
                url: e.url,
                title: e.title || e.url,
                duration: e.duration,
                thumbnail: e.thumbnail || info.thumbnail,
                uploader: e.uploader || info.uploader,
                selected: true
              });
            });
          } else {
            allEntries.push({
              url: info.url || u,
              title: info.title || u,
              duration: info.duration,
              thumbnail: info.thumbnail,
              uploader: info.uploader,
              selected: true
            });
          }
        } else {
          // Fallback to fast oEmbed inspect endpoint
          const fbRes = await fetch("/api/media/inspect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: u, action: "INSPECT" })
          });
          const fbData = await fbRes.json();
          allEntries.push({
            url: u,
            title: fbData.title || u,
            duration: fbData.durationSec || 0,
            thumbnail: fbData.thumbnail || "",
            uploader: fbData.author || "Media",
            selected: true
          });
        }
      }
      setInspectEntries(allEntries);
      showToast(`ตรวจสอบพบ ${allEntries.length} รายการ พร้อมระบุความยาวคลิปเรียบร้อย!`, "success");
    } catch (err: any) {
      showToast(`ตรวจสอบลิงก์ไม่สำเร็จ: ${err?.message}`, "error");
    } finally {
      setInspecting(false);
    }
  };

  const handleStartDownload = async () => {
    const targets: Array<{ url: string; title: string }> =
      inspectEntries.length > 0
        ? inspectEntries.filter((e) => e.selected !== false).map((e) => ({ url: e.url, title: e.title }))
        : urlInput
            .split(/\r?\n/)
            .map((u) => u.trim())
            .filter(Boolean)
            .map((u) => ({ url: u, title: u }));

    if (targets.length === 0) {
      showToast("กรุณาวางลิงก์หรือเลือกรายการที่ต้องการดาวน์โหลดก่อนครับ", "info");
      return;
    }

    setDownloading(true);
    for (const item of targets) {
      const tempJobId = `dl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const pendingJob: MediaJobRecord = {
        id: tempJobId,
        kind: "download",
        title: item.title,
        targetFormat: dlFormat,
        quality: dlQuality,
        status: "running",
        createdAt: new Date().toISOString()
      };
      setJobs((prev) => [pendingJob, ...prev]);

      try {
        const res = await fetch("/api/media/toolkit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "DOWNLOAD",
            url: item.url,
            title: item.title,
            targetFormat: dlFormat,
            quality: dlQuality,
            cookiesBrowser: dlCookiesBrowser
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === tempJobId
                ? {
                    ...j,
                    status: "completed",
                    title: data.job?.title || item.title,
                    fileName: data.fileName,
                    serverPath: data.job?.output_path,
                    downloadUrl: data.downloadUrl,
                    previewUrl: data.previewUrl,
                    sizeBytes: data.size
                  }
                : j
            )
          );
          showToast(`✅ ดาวน์โหลด "${data.fileName}" เสร็จสมบูรณ์! กดบันทึกไฟล์ได้เลย`, "success");
        } else {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === tempJobId
                ? { ...j, status: "failed", error: data.error || "ดาวน์โหลดไม่สำเร็จ" }
                : j
            )
          );
          showToast(data.error || "ดาวน์โหลดไม่สำเร็จ", "error");
        }
      } catch (err: any) {
        setJobs((prev) =>
          prev.map((j) => (j.id === tempJobId ? { ...j, status: "failed", error: err?.message } : j))
        );
      }
    }
    setDownloading(false);
  };

  const handleSelectConvertFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    showToast(`กำลังฝังไฟล์ ${fileList.length} รายการเข้าสู่ระบบ...`, "info");
    const uploaded: Array<{ name: string; size: number; serverPath: string; fileName: string }> = [];

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      const { record } = await saveEmbeddedFile(`convert_${Date.now()}_${i}`, f, f.name, true);
      if (record.serverPath) {
        uploaded.push({
          name: f.name,
          size: f.size,
          serverPath: record.serverPath,
          fileName: record.serverPath.split(/[\\/]/).pop() || f.name
        });
      }
    }

    setSelectedConvertFiles((prev) => [...prev, ...uploaded]);
    showToast(`✅ เพิ่มไฟล์พร้อมแปลง ${uploaded.length} ไฟล์เรียบร้อย!`, "success");
    e.target.value = "";
  };

  const handleStartConvert = async () => {
    if (selectedConvertFiles.length === 0) {
      showToast("กรุณาเลือกไฟล์ที่ต้องการแปลงอย่างน้อย 1 ไฟล์ก่อนครับ", "info");
      return;
    }

    setConverting(true);
    for (const f of selectedConvertFiles) {
      const tempJobId = `cv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const pendingJob: MediaJobRecord = {
        id: tempJobId,
        kind: "convert",
        title: `${f.name} ➔ .${cvFormat.toUpperCase()}`,
        targetFormat: cvFormat,
        quality: cvQuality,
        status: "running",
        createdAt: new Date().toISOString()
      };
      setJobs((prev) => [pendingJob, ...prev]);

      try {
        const res = await fetch("/api/media/toolkit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "CONVERT",
            serverPath: f.serverPath,
            fileName: f.fileName,
            targetFormat: cvFormat,
            quality: cvQuality,
            audioBitrate: cvBitrate,
            startTime: cvStartTime.trim() || undefined,
            endTime: cvEndTime.trim() || undefined
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === tempJobId
                ? {
                    ...j,
                    status: "completed",
                    fileName: data.fileName,
                    serverPath: data.job?.output_path,
                    downloadUrl: data.downloadUrl,
                    previewUrl: data.previewUrl,
                    sizeBytes: data.size
                  }
                : j
            )
          );
          showToast(`✅ แปลงไฟล์ "${data.fileName}" สำเร็จ!`, "success");
        } else {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === tempJobId ? { ...j, status: "failed", error: data.error || "แปลงไฟล์ไม่สำเร็จ" } : j
            )
          );
        }
      } catch (err: any) {
        setJobs((prev) =>
          prev.map((j) => (j.id === tempJobId ? { ...j, status: "failed", error: err?.message } : j))
        );
      }
    }
    setConverting(false);
  };

  // Send a completed video/audio directly into Auto Edit Kit (/subtitles) or MV Studio (/mv-studio)!
  const handleSendJobToStudio = async (job: MediaJobRecord, target: "subtitles" | "mv-studio") => {
    if (!job.previewUrl || !job.fileName) return;
    try {
      showToast(`กำลังส่งไฟล์ "${job.fileName}" เข้าไปยังแผนกปลายทาง...`, "info");
      const resp = await fetch(job.previewUrl);
      const blob = await resp.blob();

      if (target === "subtitles") {
        await saveEmbeddedFile("autoedit_uploaded_video_v4", blob, job.fileName, false);
        await saveStudioState("pk_autoedit_pro_state_v4", {
          fileName: job.fileName,
          fileSize: blob.size,
          serverPath: job.serverPath || "",
          serverUrl: job.previewUrl,
          isImageUpload: false,
          presetName: "🔥 CapCut ฮิต (ขาว-แดง เด้ง)",
          font: "Kanit (คณิต BD)",
          linesMode: "1 แถว (แนะนำ)",
          fontSize: 8.5,
          maxWords: 5,
          letterSpacing: 3.5,
          baseColor: "#FFFFFF",
          focusColor: "#FF1E27",
          stroke: 8,
          shadow: 80,
          karaoke: true,
          animLabel: "💥 ขยายเด้ง (Pop Bounce - แนะนำ)",
          vertPosPct: 82,
          enableAiRefine: true,
          cutSilenceEnabled: true,
          pacing: "มาตรฐาน (แนะนำ)",
          sttEngineChoice: "🎯 ElevenLabs Scribe STT (แม่นยำสูงสุด)",
          videoInfo: null,
          analysis: null,
          subtitles: [],
          rawAiSubtitles: [],
          masterWords: [],
          sttStatus: null,
          exports: {},
          renderedMp4Url: "",
          renderedMp4DownloadUrl: "",
          renderedMp4Name: "",
          selectedSubIdx: 0
        });
        router.push("/subtitles");
      } else {
        await saveEmbeddedFile("mv_uploaded_audio_v4", blob, job.fileName, false);
        router.push("/mv-studio");
      }
    } catch (err: any) {
      showToast(`ส่งไฟล์ไม่สำเร็จ: ${err?.message}`, "error");
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header matching media-toolkit-web/static/index.html */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center font-extrabold shadow-sm">
            PK
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              PK · โหลดลิงก์ & แปลงไฟล์
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              YouTube · Facebook · IG · TikTok · FFmpeg (ฝัง Cookies ถาวร & บันทึกไฟล์ต้นฉบับลงเครื่องจริง)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              cookiesMeta.loaded
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700"
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>
              {cookiesMeta.loaded
                ? `ฝัง Cookies แล้ว (${cookiesMeta.youtube_cookies || cookiesMeta.total_cookie_lines} บรรทัด)`
                : "ยังไม่ได้ฝัง Cookies"}
            </span>
          </span>
          <a
            href="https://pk-media-toolkit.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <span>Cloud สำรอง</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>

      {/* Main 2-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN (7 cols): Mode Tabs + Active Panel */}
        <div className="lg:col-span-7 space-y-4">
          {/* 2 Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-zinc-800 border border-slate-300/60 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setActiveTab("download")}
              className={`min-h-[44px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "download"
                  ? "bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-sm"
                  : "text-slate-600 dark:text-zinc-400"
              }`}
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดสื่อ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("convert")}
              className={`min-h-[44px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "convert"
                  ? "bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-sm"
                  : "text-slate-600 dark:text-zinc-400"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>แปลงไฟล์ (หลายไฟล์)</span>
            </button>
          </div>

          {/* ===============================================================
              PANEL 1: DOWNLOAD PANEL
          =============================================================== */}
          {activeTab === "download" && (
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    ดาวน์โหลดวิดีโอ & เสียงความชัดต้นฉบับ
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    รองรับวางหลายลิงก์พร้อมกัน (บรรทัดละ 1 ลิงก์) หรือตรวจสอบเพลย์ลิสต์เพื่อดูความยาวและเลือกไฟล์
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {["YouTube", "Facebook", "Instagram", "TikTok", "+1000"].map((b) => (
                    <span
                      key={b}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* URL Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    ลิงก์สื่อ (URL)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const t = await navigator.clipboard.readText();
                          if (t) setUrlInput((prev) => (prev ? `${prev}\n${t.trim()}` : t.trim()));
                        } catch {}
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ClipboardPaste className="w-3 h-3" />
                      <span>วางลิงก์ (Paste)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUrlInput("");
                        setInspectEntries([]);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-[11px] font-bold cursor-pointer"
                    >
                      ล้าง
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={
                    "https://www.youtube.com/watch?v=...\nhttps://www.tiktok.com/@user/video/...\nhttps://www.instagram.com/reel/..."
                  }
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs sm:text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>

              {/* 3 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    รูปแบบไฟล์
                  </label>
                  <select
                    value={dlFormat}
                    onChange={(e) => setDlFormat(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold"
                  >
                    <optgroup label="วิดีโอ (Video)">
                      <option value="mp4">MP4 (แนะนำ)</option>
                      <option value="mkv">MKV (ต้นฉบับ)</option>
                      <option value="webm">WEBM</option>
                    </optgroup>
                    <optgroup label="เสียงอย่างเดียว (Audio)">
                      <option value="mp3">MP3 (เสียง)</option>
                      <option value="m4a">M4A (AAC)</option>
                      <option value="wav">WAV (Lossless)</option>
                      <option value="flac">FLAC (Lossless)</option>
                      <option value="opus">OPUS</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    ความละเอียด
                  </label>
                  <select
                    value={dlQuality}
                    onChange={(e) => setDlQuality(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold"
                  >
                    <option value="best">สูงสุดที่มี (Best)</option>
                    <option value="2160">4K (2160p)</option>
                    <option value="1080">Full HD (1080p)</option>
                    <option value="720">HD (720p)</option>
                    <option value="480">SD (480p)</option>
                    <option value="360">360p</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Cookies (คลิปส่วนตัว)
                  </label>
                  <select
                    value={dlCookiesBrowser}
                    onChange={(e) => setDlCookiesBrowser(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold"
                  >
                    <option value="">
                      {cookiesMeta.loaded ? "✅ ใช้ Cookies ที่ฝังไว้ในระบบ" : "ไม่ใช้ Cookies"}
                    </option>
                    <option value="chrome">ดึงจาก Chrome อัตโนมัติ</option>
                    <option value="edge">ดึงจาก Edge อัตโนมัติ</option>
                    <option value="firefox">ดึงจาก Firefox อัตโนมัติ</option>
                    <option value="custom">อัปโหลด/วาง cookies.txt ใหม่</option>
                  </select>
                </div>
              </div>

              {/* Embedded Cookies Upload / Paste Box */}
              {dlCookiesBrowser === "custom" && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      ฝังไฟล์ cookies.txt ถาวร (บันทึกครั้งเดียวเรียกใช้ได้ตลอดทั้งคอมและมือถือ)
                    </span>
                    <button
                      type="button"
                      onClick={() => cookiesFileRef.current?.click()}
                      className="px-3 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 text-xs font-bold cursor-pointer"
                    >
                      📂 เลือกไฟล์ cookies.txt
                    </button>
                    <input
                      ref={cookiesFileRef}
                      type="file"
                      accept=".txt"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = () => handleSaveCookies(String(reader.result || ""));
                        reader.readAsText(f);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={cookiesText}
                      onChange={(e) => setCookiesText(e.target.value)}
                      placeholder="# Netscape HTTP Cookie File (วางเนื้อหาไฟล์ cookies.txt ที่นี่แล้วกดบันทึก)"
                      className="flex-1 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveCookies(cookiesText)}
                      className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-bold cursor-pointer"
                    >
                      บันทึกฝังไว้
                    </button>
                  </div>
                </div>
              )}

              {/* Actions Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={inspecting || downloading}
                  onClick={handleInspectLinks}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {inspecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>กำลังตรวจสอบลิงก์ & เวลาคลิป...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>ตรวจสอบ / เลือกเพลย์ลิสต์</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={downloading}
                  onClick={handleStartDownload}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {downloading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>กำลังดาวน์โหลดไฟล์ต้นฉบับ...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>เริ่มดาวน์โหลด</span>
                    </>
                  )}
                </button>
              </div>

              {/* Inspect Result Box with Duration & Checkboxes */}
              {inspectEntries.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>พบ {inspectEntries.length} รายการ (ติ๊กเลือกคลิปที่ต้องการโหลด)</span>
                    <button
                      type="button"
                      onClick={() =>
                        setInspectEntries((prev) =>
                          prev.map((e) => ({ ...e, selected: !prev.every((x) => x.selected) }))
                        )
                      }
                      className="text-teal-600 hover:underline cursor-pointer"
                    >
                      เลือก/ยกเลิกทั้งหมด
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {inspectEntries.map((entry, idx) => (
                      <label
                        key={idx}
                        className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={entry.selected !== false}
                          onChange={(e) =>
                            setInspectEntries((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, selected: e.target.checked } : item
                              )
                            )
                          }
                          className="rounded text-teal-600"
                        />
                        {entry.thumbnail && (
                          <img
                            src={entry.thumbnail}
                            alt={entry.title}
                            className="w-16 h-10 object-cover rounded shrink-0 bg-black"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {entry.title}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>⏱️ ความยาว: <b>{formatDuration(entry.duration)}</b></span>
                            {entry.uploader && <span>• {entry.uploader}</span>}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===============================================================
              PANEL 2: MULTI-FILE CONVERT PANEL
          =============================================================== */}
          {activeTab === "convert" && (
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  แปลงไฟล์วิดีโอ & เสียง (หลายไฟล์พร้อมกัน)
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  เลือกได้หลายไฟล์พร้อมกัน แปลงข้ามฟอร์แมต ปรับความชัด หรือตัดช่วงเวลาด้วย FFmpeg
                </p>
              </div>

              <div
                onClick={() => convertInputRef.current?.click()}
                className="rounded-xl bg-slate-50 dark:bg-zinc-800/70 hover:bg-teal-50/50 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-teal-500 p-6 text-center cursor-pointer transition-all"
              >
                <Upload className="w-7 h-7 text-teal-600 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                  แตะเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  เลือกได้หลายไฟล์ (MP4, MKV, MOV, WEBM, MP3, WAV, FLAC ฯลฯ)
                </div>
                <input
                  ref={convertInputRef}
                  type="file"
                  multiple
                  accept="video/*,audio/*,.mkv,.flv,.avi,.mov,.webm,.m4a,.opus,.flac,.wav,.mp3,.mp4"
                  onChange={handleSelectConvertFiles}
                  className="hidden"
                />
              </div>

              {selectedConvertFiles.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>ไฟล์ที่เลือก ({selectedConvertFiles.length} ไฟล์)</span>
                    <button
                      type="button"
                      onClick={() => setSelectedConvertFiles([])}
                      className="text-red-600 hover:underline cursor-pointer"
                    >
                      ล้างรายการ
                    </button>
                  </div>
                  {selectedConvertFiles.map((f, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold truncate">{f.name}</span>
                      <span className="font-mono text-slate-500 shrink-0 ml-2">
                        {(f.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">แปลงเป็นไฟล์</label>
                  <select
                    value={cvFormat}
                    onChange={(e) => setCvFormat(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold"
                  >
                    <optgroup label="วิดีโอ / ภาพเคลื่อนไหว">
                      <option value="mp4">MP4 (H.264 / AAC)</option>
                      <option value="mkv">MKV</option>
                      <option value="webm">WEBM (VP9)</option>
                      <option value="gif">GIF (ภาพเคลื่อนไหว)</option>
                    </optgroup>
                    <optgroup label="เสียง (Audio)">
                      <option value="mp3">MP3</option>
                      <option value="m4a">M4A (AAC)</option>
                      <option value="wav">WAV (Lossless)</option>
                      <option value="flac">FLAC (Lossless)</option>
                      <option value="opus">OPUS</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">ความละเอียดวิดีโอ</label>
                  <select
                    value={cvQuality}
                    onChange={(e) => setCvQuality(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold"
                  >
                    <option value="original">คงเดิม (Original)</option>
                    <option value="1080">1080p (Full HD)</option>
                    <option value="720">720p (HD)</option>
                    <option value="480">480p (SD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">คุณภาพเสียง (Bitrate)</label>
                  <select
                    value={cvBitrate}
                    onChange={(e) => setCvBitrate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold"
                  >
                    <option value="320">320 kbps (สูงสุด)</option>
                    <option value="192">192 kbps (มาตรฐาน)</option>
                    <option value="128">128 kbps</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">เวลาเริ่มตัด (ไม่บังคับ)</label>
                  <input
                    type="text"
                    value={cvStartTime}
                    onChange={(e) => setCvStartTime(e.target.value)}
                    placeholder="เช่น 00:00:05"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">เวลาจบ (ไม่บังคับ)</label>
                  <input
                    type="text"
                    value={cvEndTime}
                    onChange={(e) => setCvEndTime(e.target.value)}
                    placeholder="เช่น 00:01:30"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={converting || selectedConvertFiles.length === 0}
                onClick={handleStartConvert}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {converting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังแปลงไฟล์...</span>
                  </>
                ) : (
                  <span>⚡ เริ่มแปลงไฟล์ทั้งหมด ({selectedConvertFiles.length} ไฟล์)</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (5 cols): Persistent Job Queue & Direct File Save / Studio Handoff */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                📋 คิวงาน & ไฟล์ที่พร้อมบันทึก ({jobs.length})
              </h2>
              <p className="text-[11px] text-slate-500">
                ฝังไฟล์ไว้ในระบบอัตโนมัติ สลับหน้าหรือรีเฟรชไม่หาย
              </p>
            </div>
            {jobs.length > 0 && (
              <button
                type="button"
                onClick={() => setJobs([])}
                className="text-xs font-bold text-slate-400 hover:text-red-600 cursor-pointer"
              >
                ล้างคิว
              </button>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-zinc-800 p-8 text-center space-y-2">
              <Download className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                ยังไม่มีรายการดาวน์โหลดหรือแปลงไฟล์
              </div>
              <p className="text-[11px] text-slate-500">
                เมื่อดาวน์โหลดหรือแปลงไฟล์เสร็จ ปุ่มบันทึกไฟล์ลงเครื่องและส่งต่อเข้า Auto Edit จะแสดงที่นี่
              </p>
            </div>
          ) : (
            <div className="max-h-[620px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 uppercase">
                        {job.kind === "download" ? "DOWNLOAD" : "CONVERT"} • .{job.targetFormat}
                      </span>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-1 break-words">
                        {job.title}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setJobs((prev) => prev.filter((j) => j.id !== job.id))}
                      className="text-slate-400 hover:text-red-600 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {job.status === "running" && (
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-600">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังประมวลผลไฟล์...</span>
                    </div>
                  )}

                  {job.status === "failed" && (
                    <div className="text-xs font-semibold text-red-600">
                      ❌ {job.error || "เกิดข้อผิดพลาด"}
                    </div>
                  )}

                  {job.status === "completed" && job.downloadUrl && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] text-emerald-600 font-bold flex items-center justify-between">
                        <span>✅ พร้อมบันทึก: {job.fileName}</span>
                        {job.sizeBytes ? (
                          <span className="font-mono">
                            {(job.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        ) : null}
                      </div>

                      {/* Real Preview Player */}
                      {job.previewUrl &&
                        (["mp4", "mkv", "webm"].includes(job.targetFormat) ? (
                          <video
                            src={job.previewUrl}
                            controls
                            className="w-full max-h-44 rounded-lg bg-black"
                          />
                        ) : ["mp3", "m4a", "wav", "flac", "opus"].includes(job.targetFormat) ? (
                          <audio src={job.previewUrl} controls className="w-full h-9" />
                        ) : null)}

                      {/* Save File & Direct Studio Handoff Buttons */}
                      <a
                        href={job.downloadUrl}
                        download={job.fileName}
                        className="w-full min-h-[38px] px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>💾 บันทึกไฟล์ลงเครื่อง / มือถือ</span>
                      </a>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSendJobToStudio(job, "subtitles")}
                          className="py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Subtitles className="w-3 h-3" />
                          <span>ส่งทำซับ Auto Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendJobToStudio(job, "mv-studio")}
                          className="py-1.5 px-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Music className="w-3 h-3" />
                          <span>ส่งทำ MV เพลง</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
