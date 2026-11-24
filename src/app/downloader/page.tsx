"use client";

import React, { useState, useRef } from "react";
import {
  Download,
  Sparkles,
  Link2,
  Music,
  Film,
  Subtitles,
  ExternalLink,
  RefreshCw,
  Upload,
  CheckCircle2,
  ArrowRight,
  FileAudio,
  ShieldCheck
} from "lucide-react";
import { useHub, HubHandoffPayload } from "@/context/HubContext";
import { useToast } from "@/components/ui/ToastProvider";

interface InspectedMediaResult {
  sourceEngine: string;
  platform: string;
  title: string;
  author: string;
  durationSec: number;
  thumbnail: string;
  url: string;
  cloudDownloadBase: string;
  formats: Array<{ id: string; label: string; ext: string; quality: string }>;
}

/**
 * Encodes an AudioBuffer into a standard 16-bit PCM WAV Blob directly in the browser!
 */
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = Math.min(2, buffer.numberOfChannels);
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new ArrayBuffer(length);
  const view = new DataView(out);
  const channels: Float32Array[] = [];
  let pos = 0;

  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16);
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 0;
  while (pos < length && offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out], { type: "audio/wav" });
}

export default function MediaDownloaderPage() {
  const { sendToDepartment } = useHub();
  const { showToast } = useToast();

  const [urlInput, setUrlInput] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("mp4-1080");
  const [inspecting, setInspecting] = useState(false);
  const [mediaInfo, setMediaInfo] = useState<InspectedMediaResult | null>(null);

  // In-browser instant audio extractor state
  const [extractingAudio, setExtractingAudio] = useState(false);
  const [extractedAudioUrl, setExtractedAudioUrl] = useState<string>("");
  const [extractedFileName, setExtractedFileName] = useState<string>("");

  const localVideoInputRef = useRef<HTMLInputElement | null>(null);

  const handleInspectUrl = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl ?? urlInput).trim();
    if (!targetUrl) {
      showToast("กรุณาวางลิงก์คลิป YouTube, TikTok, Facebook หรือ IG ก่อนครับ", "info");
      return;
    }
    if (overrideUrl) setUrlInput(overrideUrl);

    setInspecting(true);
    try {
      const res = await fetch("/api/media/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, action: "INSPECT" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMediaInfo(data);
        showToast(`ดึงข้อมูลคลิป "${data.title}" สำเร็จ!`, "success");
      } else {
        showToast(data.error || "ไม่สามารถดึงข้อมูลลิงก์นี้ได้", "error");
      }
    } catch (err: any) {
      showToast(`เกิดข้อผิดพลาด: ${err?.message}`, "error");
    } finally {
      setInspecting(false);
    }
  };

  const handleExtractAudioInBrowser = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractingAudio(true);
    try {
      const arrayBuf = await file.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const decoded = await ctx.decodeAudioData(arrayBuf);
      const wavBlob = audioBufferToWavBlob(decoded);
      const wavUrl = URL.createObjectURL(wavBlob);
      const outName = `${file.name.replace(/\.[^.]+$/, "")}_Audio.wav`;
      setExtractedAudioUrl(wavUrl);
      setExtractedFileName(outName);
      showToast(`แยกไฟล์เสียง "${outName}" สำเร็จทันทีในเบราว์เซอร์!`, "success");
    } catch {
      showToast("ไม่สามารถแยกเสียงจากไฟล์นี้ได้ กรุณาตรวจสอบว่าคลิปมีแทร็กเสียง", "error");
    } finally {
      setExtractingAudio(false);
      e.target.value = "";
    }
  };

  const handleHandoffMediaToDept = (targetHref: string, deptLabel: string) => {
    if (!mediaInfo) return;
    const handoffPayload: HubHandoffPayload = {
      id: `dl-${Date.now()}`,
      title: mediaInfo.title,
      topic: mediaInfo.title,
      aspectRatio: "9:16",
      hook3Sec: `ดัดแปลงคอนเทนต์จาก: ${mediaInfo.title}`,
      concept: `แหล่งที่มา: ${mediaInfo.platform} (${mediaInfo.author}) — ${mediaInfo.url}`,
      fullScriptThai: `สวัสดีครับ วันนี้เรามาสรุปและเจาะลึกประเด็นจากคลิป ${mediaInfo.title} แบบเข้าใจง่ายใน 30 วินาทีครับ`,
      mediaUrl: mediaInfo.url,
      scenes: [
        {
          sceneNumber: 1,
          title: `เปิดเรื่อง: ${mediaInfo.title.slice(0, 32)}`,
          durationSec: 3,
          voiceoverThai: `วันนี้พามาดู ${mediaInfo.title} ที่กำลังเป็นกระแสอยู่ตอนนี้เลยครับ`,
          onScreenText: `🔥 ${mediaInfo.title.slice(0, 22)}`,
          visualPromptEn: `Cinematic 8K visual inspired by ${mediaInfo.title}, studio lighting, photorealistic`,
          motionPromptEn: "Dynamic push-in hook shot"
        }
      ],
      caption: `📌 ${mediaInfo.title}\nเครดิต/อ้างอิง: ${mediaInfo.author} (${mediaInfo.platform})`,
      hashtags: ["#PKMediaToolkit", "#สรุปคลิป", "#ไวรัล"],
      sourceDept: "downloader",
      updatedAt: new Date().toISOString()
    };

    sendToDepartment(targetHref, handoffPayload, deptLabel);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-lg">
              <Download className="w-3.5 h-3.5" />
              <span>แผนกที่ 5 · PK — โหลดลิงก์ & แปลงไฟล์สื่อ (Chat c2c37810)</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ดาวน์โหลดคลิปทุกแพลตฟอร์ม & แยกไฟล์เสียงส่งต่อทำซับ / ทำ MV
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              รองรับลิงก์ YouTube, TikTok, Facebook, Instagram Reels, X · ดึงความคมชัดต้นฉบับ 1080p หรือแยกเฉพาะเสียง MP3/WAV เพื่อส่งต่อไปยังแผนกซับอัตโนมัติและแผนกทำ MV
            </p>
          </div>

          <a
            href="https://pk-media-toolkit.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[40px] px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1.5 self-start transition-colors"
          >
            <span>เปิดเซิร์ฟเวอร์โหลดเต็มรูปแบบ (Render Cloud)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Link Input Bar */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
            วางลิงก์วิดีโอหรือเพลงที่ต้องการดาวน์โหลด / ดึงข้อมูล:
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !inspecting) handleInspectUrl();
                }}
                placeholder="วางลิงก์ https://www.youtube.com/watch?v=... หรือ TikTok / Facebook / IG Reels..."
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="button"
              disabled={inspecting}
              onClick={() => handleInspectUrl()}
              className="min-h-[48px] px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shrink-0"
            >
              {inspecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังตรวจสอบลิงก์...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>ตรวจสอบลิงก์ & เตรียมดาวน์โหลด</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Inspected Media Card & Direct Handoff Actions */}
      {mediaInfo && (
        <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-teal-200 dark:border-teal-800 p-5 shadow-xs space-y-4 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            {mediaInfo.thumbnail ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-black aspect-video">
                <img src={mediaInfo.thumbnail} alt={mediaInfo.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-xl bg-slate-100 dark:bg-zinc-800 aspect-video flex items-center justify-center">
                <Film className="w-10 h-10 text-teal-600" />
              </div>
            )}

            <div className="md:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                  {mediaInfo.platform}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  โดย <b>{mediaInfo.author}</b> · Engine: {mediaInfo.sourceEngine}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                {mediaInfo.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                >
                  {mediaInfo.formats.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>

                <a
                  href={`${mediaInfo.cloudDownloadBase}/?url=${encodeURIComponent(mediaInfo.url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[42px] px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลดไฟล์ต้นฉบับ ({selectedFormat.toUpperCase()})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 1-Click Send to OS / Subtitles / MV */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">ส่งต่อเข้าแผนกอื่น:</span>
                <button
                  type="button"
                  onClick={() => handleHandoffMediaToDept("/", "หน้าหลัก OS")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ให้หน้า OS ดัดแปลงสคริปต์จากคลิปนี้</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleHandoffMediaToDept("/subtitles", "แผนกซับอัตโนมัติ")}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Subtitles className="w-3.5 h-3.5" />
                  <span>ส่งไปแผนกซับอัตโนมัติ</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleHandoffMediaToDept("/mv-studio", "แผนกทำ MV เพลง")}
                  className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>ส่งไปแผนกทำ MV เพลง</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* In-Browser Instant Audio Extractor (Works 100% Free & Offline on PC and iPhone!) */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
              <FileAudio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                เครื่องมือแยกเสียงจากคลิปวิดีโอในเบราว์เซอร์ (Instant Video-to-WAV Audio Extractor)
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                เปลี่ยนไฟล์คลิปวิดีโอ (.MP4 / .MOV) ในเครื่องหรือในโทรศัพท์ของคุณให้เป็นไฟล์เสียง .WAV ความคมชัดสูงทันทีโดยไม่ต้องง้อเซิร์ฟเวอร์ เพื่อนำไปถอดซับหรือทำ MV ต่อ
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={extractingAudio}
            onClick={() => localVideoInputRef.current?.click()}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 text-white text-xs font-bold inline-flex items-center gap-2 self-start cursor-pointer shrink-0"
          >
            {extractingAudio ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังแยกเสียง...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>เลือกไฟล์วิดีโอเพื่อแยกเสียง (.WAV)</span>
              </>
            )}
          </button>
          <input
            ref={localVideoInputRef}
            type="file"
            accept="video/*,audio/*"
            onChange={handleExtractAudioInBrowser}
            className="hidden"
          />
        </div>

        {extractedAudioUrl && (
          <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="space-y-1 flex-1">
              <div className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>แยกไฟล์เสียงสำเร็จ: {extractedFileName}</span>
              </div>
              <audio controls src={extractedAudioUrl} className="w-full h-9" />
            </div>
            <a
              href={extractedAudioUrl}
              download={extractedFileName}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>บันทึกไฟล์เสียง (.WAV)</span>
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
