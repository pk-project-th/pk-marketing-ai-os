"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Film,
  Sparkles,
  Play,
  RotateCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Settings,
  ChevronRight,
  ExternalLink,
  Layers,
  Send,
  CheckSquare,
  Terminal,
  Activity,
  Globe,
  Radio,
  Copy,
  Lightbulb,
  Sliders,
  Check,
  Zap,
  ArrowRight
} from "lucide-react";
import { useBrand } from "@/context/BrandContext";
import { ContentIdea } from "@/types";

interface StudioJobStatus {
  status: "IDLE" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress: number;
  step: number;
  step_title: string;
  log: string[];
  video_url: string | null;
  error: string | null;
}

export default function VideoStudioPage() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";
  const { activeBrand } = useBrand();

  // Inputs
  const [topic, setTopic] = useState(
    initialTopic || "บรรยากาศตกปลาที่เขื่อนแม่สรวย จังหวัดเชียงราย ยามเช้า ทะเลหมอกและเรือหางยาว"
  );
  const [orientation, setOrientation] = useState<"VERTICAL" | "HORIZONTAL">("VERTICAL");

  // Server & Connection State
  const [studioUrl, setStudioUrl] = useState<string>("http://127.0.0.1:8200");
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [extensionOnline, setExtensionOnline] = useState<boolean | null>(null);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(false);
  const [showServerModal, setShowServerModal] = useState<boolean>(false);

  // Job Execution State
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<StudioJobStatus>({
    status: "IDLE",
    progress: 0,
    step: 0,
    step_title: "พร้อมทำงาน",
    log: ["> ระบบพร้อมทำงาน กรุณากรอกหัวข้อแล้วกด [เริ่มสร้างวิดีโอทันที]"],
    video_url: null,
    error: null
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Ideas Integration
  const [savedIdeas, setSavedIdeas] = useState<ContentIdea[]>([]);
  const [showIdeasModal, setShowIdeasModal] = useState<boolean>(false);

  // Approval Pipeline
  const [sendApprovalLoading, setSendApprovalLoading] = useState<boolean>(false);
  const [approvalSent, setApprovalSent] = useState<boolean>(false);

  // Auto-scroll for console log
  const consoleLogRef = useRef<HTMLDivElement>(null);

  // Initialize Studio URL from protocol and localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isHttps = window.location.protocol === "https:";
      const savedUrl = localStorage.getItem("pk_studio_server_url");
      if (savedUrl) {
        setStudioUrl(savedUrl);
      } else if (isHttps) {
        setStudioUrl("https://safari-acetone-jubilance.ngrok-free.dev");
      } else {
        setStudioUrl("http://127.0.0.1:8200");
      }

      // Load saved ideas from localStorage
      try {
        const raw = localStorage.getItem("pk_ideas_library_v2");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setSavedIdeas(parsed);
        }
      } catch (e) {
        console.error("Failed to load ideas:", e);
      }
    }
  }, []);

  // Check health on mount or when studioUrl changes
  useEffect(() => {
    checkConnection();
  }, [studioUrl]);

  // Auto-scroll console log
  useEffect(() => {
    if (consoleLogRef.current) {
      consoleLogRef.current.scrollTop = consoleLogRef.current.scrollHeight;
    }
  }, [jobState.log]);

  const checkConnection = async (customUrl?: string) => {
    setCheckingHealth(true);
    const target = (customUrl || studioUrl).replace(/\/$/, "");
    try {
      const res = await fetch(`/api/studio/health?server=${encodeURIComponent(target)}`);
      const data = await res.json();
      if (data.online) {
        setServerOnline(true);
        // Also check extension via status if available
        setExtensionOnline(true);
      } else {
        // Fallback: direct browser check
        try {
          const directRes = await fetch(`${target}/health`, {
            headers: { "ngrok-skip-browser-warning": "true" }
          });
          if (directRes.ok) {
            setServerOnline(true);
            setExtensionOnline(true);
            setCheckingHealth(false);
            return;
          }
        } catch (_) {}
        setServerOnline(false);
        setExtensionOnline(false);
      }
    } catch (err) {
      setServerOnline(false);
      setExtensionOnline(false);
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleSaveStudioUrl = (url: string) => {
    const clean = url.trim().replace(/\/$/, "");
    setStudioUrl(clean);
    if (typeof window !== "undefined") {
      localStorage.setItem("pk_studio_server_url", clean);
    }
    checkConnection(clean);
    setShowServerModal(false);
  };

  // Start Generation
  const handleStartGeneration = async () => {
    if (!topic.trim()) {
      alert("กรุณากรอกหัวข้อเนื้อเรื่องที่ต้องการสร้างคลิปวิดีโอครับ");
      return;
    }

    setIsSubmitting(true);
    setApprovalSent(false);
    setJobState({
      status: "PROCESSING",
      progress: 5,
      step: 1,
      step_title: "กำลังเริ่มคำสั่งผลิตวิดีโอ...",
      log: [
        `> ได้รับคำสั่งสร้างวิดีโอ: "${topic.trim()}"`,
        `> สัดส่วน: ${orientation === "VERTICAL" ? "แนวตั้ง 9:16 (TikTok/Reels)" : "แนวนอน 16:9 (YouTube)"}`,
        `> กำลังเชื่อมต่อเข้าสู่สตูดิโอ (${studioUrl})...`
      ],
      video_url: null,
      error: null
    });

    try {
      // Step 1: Call API generate
      const res = await fetch("/api/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          orientation,
          studioUrl
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Attempt direct client fetch fallback if proxy failed
        try {
          const directRes = await fetch(`${studioUrl}/api/studio/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify({
              topic: topic.trim(),
              orientation
            })
          });
          const directData = await directRes.json();
          if (directRes.ok && directData.job_id) {
            setJobId(directData.job_id);
            pollJobStatus(directData.job_id);
            return;
          }
        } catch (_) {}

        throw new Error(data.error || "เกิดข้อผิดพลาดในการเริ่มสร้างวิดีโอ");
      }

      const newJobId = data.job_id;
      setJobId(newJobId);
      pollJobStatus(newJobId);
    } catch (err: any) {
      setJobState((prev) => ({
        ...prev,
        status: "FAILED",
        progress: 0,
        error: err.message,
        log: [...prev.log, `❌ ข้อผิดพลาด: ${err.message}`]
      }));
      setIsSubmitting(false);
    }
  };

  // Poll Job Status
  const pollJobStatus = (id: string) => {
    const interval = setInterval(async () => {
      try {
        let currentStatus: any = null;

        // Try proxy first
        try {
          const res = await fetch(`/api/studio/status/${id}?server=${encodeURIComponent(studioUrl)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) currentStatus = data;
          }
        } catch (_) {}

        // Fallback: direct fetch
        if (!currentStatus) {
          const directRes = await fetch(`${studioUrl}/api/studio/status/${id}`, {
            headers: { "ngrok-skip-browser-warning": "true" }
          });
          if (directRes.ok) {
            currentStatus = await directRes.json();
          }
        }

        if (!currentStatus) return;

        // Parse video url to ensure it has full host if relative
        let resolvedVideoUrl = currentStatus.video_url;
        if (resolvedVideoUrl && resolvedVideoUrl.startsWith("/")) {
          resolvedVideoUrl = `${studioUrl.replace(/\/$/, "")}${resolvedVideoUrl}`;
        }

        setJobState((prev) => ({
          status: currentStatus.status || prev.status,
          progress: currentStatus.progress ?? prev.progress,
          step: currentStatus.step ?? prev.step,
          step_title: currentStatus.step_title ?? prev.step_title,
          log: currentStatus.log && currentStatus.log.length > 0 ? currentStatus.log : prev.log,
          video_url: resolvedVideoUrl || prev.video_url,
          error: currentStatus.error || null
        }));

        if (currentStatus.status === "COMPLETED") {
          clearInterval(interval);
          setIsSubmitting(false);
        } else if (currentStatus.status === "FAILED") {
          clearInterval(interval);
          setIsSubmitting(false);
        }
      } catch (e: any) {
        console.error("Poll error:", e);
      }
    }, 3500);
  };

  // Send to Step 4 Approval Queue
  const handleSendToApproval = async () => {
    if (!jobState.video_url) return;
    setSendApprovalLoading(true);
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE",
          title: `[Video Final] ${topic.substring(0, 50)}`,
          content_preview: `วิดีโอภาพยนตร์ 3 ฉากผลิตอัตโนมัติด้วย Google Veo 3.1 & FlowKit (${orientation === "VERTICAL" ? "9:16" : "16:9"})`,
          entity_type: "VIDEO",
          media_type: "VIDEO",
          image_url: jobState.video_url,
          media_urls: [jobState.video_url],
          brand_name: activeBrand === "ALL" ? "เพจหลัก" : activeBrand,
          status: "HUMAN_REVIEW"
        })
      });
      const data = await res.json();
      if (data.success) {
        setApprovalSent(true);
      } else {
        alert("ไม่สามารถส่งเข้าคิวอนุมัติได้: " + (data.error || "Unknown error"));
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSendApprovalLoading(false);
    }
  };

  // Quick Preset Topics
  const PRESET_TOPICS = [
    { label: "🎣 ตกปลาเขื่อนแม่สรวย", text: "บรรยากาศตกปลาที่เขื่อนแม่สรวย จังหวัดเชียงราย ยามเช้า ทะเลหมอกและเรือหางยาว" },
    { label: "☕ คาเฟ่ดอยสูง", text: "คาเฟ่สไตล์แคมป์ปิ้งวิวทะเลหมอกบนดอยสูง กาแฟดริปยามเช้าและเสียงนกร้อง แสงสีทองอบอุ่น" },
    { label: "🏞️ ธรรมชาติเมืองเหนือ", text: "การเดินทางท่องเที่ยวธรรมชาติ ลำธารใส ป่าสนเขียวชอุ่ม และน้ำตกเมืองเหนือในม่านหมอก" },
    { label: "🥊 มวยไทยโบราณ", text: "การฝึกซ้อมแม่ไม้มวยไทยโบราณกลางลานดินในสายหมอกยามเช้า แสงแดดส่องลอดแมกไม้" },
    { label: "🚗 รถยนต์ไฮบริดสุดหรู", text: "การขับขี่รถยนต์ซีดานไฮบริดสีขาวมุกระดับพรีเมียมบนถนนเลียบชายฝั่งยามพระอาทิตย์ตกดิน" },
    { label: "🍜 สตรีทฟู้ดต้มยำกุ้ง", text: "การปรุงต้มยำกุ้งน้ำข้นสูตรโบราณ ควันกรุ่น พริกเผาแดงสด กุ้งแม่น้ำตัวใหญ่ไฟลุกท่วมกระทะ" }
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Film className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              AI Video Studio
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold border border-blue-200">
                Veo 3.1 & FlowKit
              </span>
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            ระบบสร้างคลิปวิดีโอ 3 ฉากระดับภาพยนตร์อัตโนมัติ พร้อม Keyframe และต่อคลิป Final MP4 ผ่าน FFmpeg
          </p>
        </div>

        {/* Server Status Pill & Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => checkConnection()}
            disabled={checkingHealth}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              serverOnline
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            }`}
            title="คลิกเพื่อตรวจสอบการเชื่อมต่อใหม่"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                serverOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>
              {checkingHealth
                ? "กำลังตรวจสอบ..."
                : serverOnline
                ? "Studio พร้อมทำงาน 100%"
                : "Studio ออฟไลน์ (ตรวจสอบ Server)"}
            </span>
          </button>

          <button
            onClick={() => setShowServerModal(true)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            title="ตั้งค่า Studio Server URL"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Input Form (Left 7 Cols) & Workflow / Output (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            {/* Topic Input with Idea Library Button */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span>📌 หัวข้อหรือเนื้อเรื่องที่ต้องการสร้างคลิป:</span>
                </label>
                {savedIdeas.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowIdeasModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 transition"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>ดึงจากคลังไอเดีย ({savedIdeas.length})</span>
                  </button>
                )}
              </div>

              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="เช่น บรรยากาศตกปลาที่เขื่อนแม่สรวย จังหวัดเชียงราย ยามเช้า ทะเลหมอกและเรือหางยาว..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Quick Suggestions */}
            <div>
              <span className="text-xs text-slate-500 font-semibold block mb-2">
                💡 ตัวอย่างไอเดียด่วน:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_TOPICS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(item.text)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2.5">
                📐 อัตราส่วนวิดีโอ (Aspect Ratio):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrientation("VERTICAL")}
                  className={`flex items-center p-3.5 rounded-xl border text-left transition ${
                    orientation === "VERTICAL"
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 shrink-0">
                    📱
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">แนวตั้ง 9:16</div>
                    <div className="text-[11px] text-slate-500">TikTok, Reels, YouTube Shorts</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOrientation("HORIZONTAL")}
                  className={`flex items-center p-3.5 rounded-xl border text-left transition ${
                    orientation === "HORIZONTAL"
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3 shrink-0">
                    🖥️
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">แนวนอน 16:9</div>
                    <div className="text-[11px] text-slate-500">YouTube, Facebook, TV</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleStartGeneration}
              disabled={isSubmitting || !topic.trim()}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] ${
                isSubmitting
                  ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25"
              }`}
            >
              {isSubmitting ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span>กำลังสั่งงานสตูดิโอและเรนเดอร์คลิป...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-amber-300" />
                  <span>🚀 เริ่มต้นสร้างคลิปวิดีโอทันที (Google Veo 3.1)</span>
                </>
              )}
            </button>
          </div>

          {/* Shortcut Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/commercial"
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                  Commercial Studio
                </div>
                <div className="text-[11px] text-slate-500">เขียนสคริปต์โฆษณา 16 ฉาก & Motion</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/content"
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                  Content Studio
                </div>
                <div className="text-[11px] text-slate-500">สร้างภาพและแคปชั่น 5 แพลตฟอร์ม</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>

        {/* Right Column: Workflow Progress & Video Player */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>📊 ขั้นตอนการผลิต (Workflow)</span>
              </h2>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  jobState.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800"
                    : jobState.status === "PROCESSING"
                    ? "bg-blue-100 text-blue-800 animate-pulse"
                    : jobState.status === "FAILED"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {jobState.step_title}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  jobState.status === "FAILED"
                    ? "bg-rose-500"
                    : jobState.status === "COMPLETED"
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600"
                }`}
                style={{ width: `${jobState.progress}%` }}
              />
            </div>

            {/* 4 Step Indicators */}
            <div className="space-y-3 pt-2 text-xs">
              {[
                { stepNum: 1, title: "วางโครงเรื่อง 3 ฉากระดับภาพยนตร์ (Story Arc)" },
                { stepNum: 2, title: "สร้างภาพต้นแบบ Keyframe สำหรับทั้ง 3 ฉาก" },
                { stepNum: 3, title: "เรนเดอร์คลิปวิดีโอ 8 วินาทีผ่าน Google Veo 3.1" },
                { stepNum: 4, title: "ตัดต่อและรวมคลิป Final Video ผ่าน FFmpeg" }
              ].map((s) => {
                const isDone = jobState.step > s.stepNum || jobState.status === "COMPLETED";
                const isCurrent = jobState.step === s.stepNum && jobState.status === "PROCESSING";

                return (
                  <div
                    key={s.stepNum}
                    className={`flex items-center space-x-3 transition ${
                      isDone
                        ? "text-emerald-700 font-semibold"
                        : isCurrent
                        ? "text-blue-700 font-bold"
                        : "text-slate-400"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                        isDone
                          ? "bg-emerald-100 border border-emerald-300 text-emerald-700"
                          : isCurrent
                          ? "bg-blue-100 border border-blue-400 text-blue-700 animate-pulse"
                          : "border border-slate-300 bg-slate-50 text-slate-400"
                      }`}
                    >
                      {isDone ? "✓" : s.stepNum}
                    </span>
                    <span>{s.title}</span>
                  </div>
                );
              })}
            </div>

            {/* Live Console Terminal */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-500 font-mono mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  <span>Live Console Log:</span>
                </span>
                <span className="font-bold text-slate-700">{jobState.progress}%</span>
              </div>
              <div
                ref={consoleLogRef}
                className="w-full h-36 bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-cyan-400 overflow-y-auto space-y-1 select-text"
              >
                {jobState.log.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.includes("❌")
                        ? "text-rose-400"
                        : line.includes("🎉")
                        ? "text-emerald-400 font-bold"
                        : line.includes("🎬") || line.includes("🎥")
                        ? "text-amber-300"
                        : "text-slate-300"
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Result Area (Appears when completed) */}
            {jobState.video_url && (
              <div className="pt-4 border-t border-slate-200 space-y-3 animate-fade-in">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>🎉 สร้างวิดีโอเสร็จสมบูรณ์เรียบร้อยแล้ว!</span>
                </div>

                {/* Video Player */}
                <video
                  src={jobState.video_url}
                  controls
                  playsInline
                  autoPlay
                  className={`w-full rounded-xl border border-slate-300 bg-black mx-auto object-cover ${
                    orientation === "VERTICAL" ? "aspect-[9/16] max-h-80" : "aspect-[16/9] max-h-64"
                  }`}
                />

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <a
                    href={jobState.video_url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs text-center flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>📥 ดาวน์โหลดวิดีโอ Final MP4</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleSendToApproval}
                      disabled={sendApprovalLoading || approvalSent}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                        approvalSent
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      }`}
                    >
                      {approvalSent ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ส่งคิวอนุมัติแล้ว</span>
                        </>
                      ) : sendApprovalLoading ? (
                        <span>กำลังส่ง...</span>
                      ) : (
                        <>
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>ส่งไป Step 4 (Approval)</span>
                        </>
                      )}
                    </button>

                    <Link
                      href="/publisher"
                      className="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ไป Step 5 (Publish)</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ideas Import Modal */}
      {showIdeasModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">เลือกไอเดียจากคลังเพื่อสร้างวิดีโอ</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIdeasModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {savedIdeas.map((idea) => (
                <div
                  key={idea.id}
                  onClick={() => {
                    setTopic(`${idea.title} - ${idea.hook || ""}`.trim());
                    setShowIdeasModal(false);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition text-left group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition">
                    {idea.title}
                  </div>
                  {idea.hook && (
                    <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      🎯 {idea.hook}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowIdeasModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Server Config Modal */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">ตั้งค่า Studio Server URL</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowServerModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-500">
                เลือกหรือกรอก URL ของเซิร์ฟเวอร์ที่รันสตูดิโอ (Port 8200 หรือ Tunnel สาธารณะ):
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleSaveStudioUrl("http://127.0.0.1:8200")}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                    studioUrl === "http://127.0.0.1:8200"
                      ? "border-blue-600 bg-blue-50 text-blue-800 font-bold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div>
                    <div className="font-semibold">Local Server (เครื่องนี้)</div>
                    <div className="text-[11px] text-slate-500">http://127.0.0.1:8200</div>
                  </div>
                  {studioUrl === "http://127.0.0.1:8200" && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveStudioUrl("https://safari-acetone-jubilance.ngrok-free.dev")}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                    studioUrl.includes("ngrok")
                      ? "border-blue-600 bg-blue-50 text-blue-800 font-bold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div>
                    <div className="font-semibold">Ngrok HTTPS Cloud Tunnel</div>
                    <div className="text-[11px] text-slate-500">https://safari-acetone-jubilance.ngrok-free.dev</div>
                  </div>
                  {studioUrl.includes("ngrok") && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              </div>

              <div className="pt-2">
                <label className="block text-slate-700 font-semibold mb-1">Custom URL:</label>
                <input
                  type="text"
                  defaultValue={studioUrl}
                  id="customStudioUrlInput"
                  placeholder="https://your-tunnel.dev หรือ http://127.0.0.1:8200"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowServerModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById("customStudioUrlInput") as HTMLInputElement;
                  if (input && input.value) handleSaveStudioUrl(input.value);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
