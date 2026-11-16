"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Video,
  Camera,
  Layers,
  Clock,
  Music,
  Scissors,
  Mic,
  FileText,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Wand2,
  AlertTriangle,
  Trash2
} from "lucide-react";

interface SceneItem {
  scene_number: number;
  duration_sec: number;
  what_to_shoot: string;
  camera_angle: string;
  continuity_note: string;
  voiceover_text: string;
  on_screen_text: string;
  flow_prompt: string;
}

interface ShotItem {
  shot_number: number;
  role: string;
  angle_and_framing: string;
  lighting_and_props: string;
  text_overlay: string;
  image_prompt: string;
}

interface EasyBlueprint {
  title: string;
  concept: string;
  video_blueprint?: {
    total_duration_sec: number;
    scene_count: number;
    mood_and_music: string;
    scenes: SceneItem[];
    editing_guide: string[];
    full_voiceover_script: string;
  };
  photo_blueprint?: {
    photo_style: string;
    shots: ShotItem[];
  };
  social_caption: string;
  hashtags: string[];
}

interface ErrorMemoryItem {
  id: string;
  category: string;
  signature: string;
  message: string;
  resolution: string;
  occurrences: number;
  lastOccurredAt: string;
}

const QUICK_EXAMPLES = [
  "ช่วยคิดคอนเท้นไปเที่ยววัดให้หน่อย",
  "อยากถ่ายคลิปรีวิวคาเฟ่เปิดใหม่ สไตล์มินิมอล",
  "ส่งมอบรถใหม่ป้ายแดงให้ลูกค้า อยากได้คลิปซึ้งๆ",
  "ขายเซรั่มลดฝ้า ขอสคริปต์คลิปสั้น 15 วิ หยุดนิ้วคนดู"
];

export default function EasyContentPage() {
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState<"BOTH" | "VIDEO" | "PHOTO">("BOTH");
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<EasyBlueprint | null>(null);
  const [meta, setMeta] = useState<{ modelUsed?: string; isFailover?: boolean } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorMemories, setErrorMemories] = useState<ErrorMemoryItem[]>([]);

  const loadMemories = async () => {
    try {
      const res = await fetch("/api/ai/error-memory");
      const data = await res.json();
      if (data.success && Array.isArray(data.memories)) {
        setErrorMemories(data.memories);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleGenerate = async (customPrompt?: string) => {
    const targetPrompt = (customPrompt ?? prompt).trim();
    if (!targetPrompt) return;
    if (customPrompt) setPrompt(customPrompt);

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ai/easy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: targetPrompt, format })
      });
      const data = await res.json();
      if (data.success && data.blueprint) {
        setBlueprint(data.blueprint);
        setMeta(data.meta || null);
        loadMemories();
      } else {
        setErrorMsg(data.error || "ไม่สามารถสร้างแผนคอนเทนต์ได้ กรุณาลองใหม่");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const buildFullTextToCopy = () => {
    if (!blueprint) return "";
    const lines: string[] = [];
    lines.push(`📌 ${blueprint.title}`);
    lines.push(`💡 แนวคิด: ${blueprint.concept}\n`);

    if (blueprint.video_blueprint && (format === "VIDEO" || format === "BOTH")) {
      const vb = blueprint.video_blueprint;
      lines.push(`🎬 แผนถ่ายทำวิดีโอ (${vb.scene_count} ฉาก | รวม ${vb.total_duration_sec} วินาที)`);
      lines.push(`🎵 เพลง/อารมณ์: ${vb.mood_and_music}\n`);
      vb.scenes?.forEach((s) => {
        lines.push(`--- ฉากที่ ${s.scene_number} (${s.duration_sec} วิ) ---`);
        lines.push(`• ถ่ายอะไร: ${s.what_to_shoot}`);
        lines.push(`• มุมกล้อง: ${s.camera_angle}`);
        lines.push(`• ต่อเนื่องจากฉากก่อน: ${s.continuity_note}`);
        lines.push(`• เสียงพากย์: "${s.voiceover_text}"`);
        lines.push(`• ข้อความขึ้นจอ: ${s.on_screen_text}`);
        lines.push(`• Prompt (Google Flow): ${s.flow_prompt}\n`);
      });
      if (vb.editing_guide?.length) {
        lines.push(`✂️ คู่มือตัดต่อ:`);
        vb.editing_guide.forEach((g) => lines.push(`  ${g}`));
        lines.push("");
      }
      lines.push(`🎙️ บทพากย์รวม:\n${vb.full_voiceover_script}\n`);
    }

    if (blueprint.photo_blueprint && (format === "PHOTO" || format === "BOTH")) {
      const pb = blueprint.photo_blueprint;
      lines.push(`📸 แผนถ่ายภาพนิ่ง (${pb.photo_style})`);
      pb.shots?.forEach((sh) => {
        lines.push(`• รูปที่ ${sh.shot_number} (${sh.role}):`);
        lines.push(`  มุมกล้อง: ${sh.angle_and_framing}`);
        lines.push(`  แสง & พร็อพ: ${sh.lighting_and_props}`);
        lines.push(`  พาดหัวบนรูป: ${sh.text_overlay}`);
        lines.push(`  Prompt: ${sh.image_prompt}`);
      });
      lines.push("");
    }

    lines.push(`✍️ แคปชันพร้อมโพสต์:\n${blueprint.social_caption}`);
    lines.push(`\n${(blueprint.hashtags || []).join(" ")}`);
    return lines.join("\n");
  };

  const handleClearMemories = async () => {
    try {
      await fetch("/api/ai/error-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CLEAR" })
      });
      setErrorMemories([]);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 md:p-8 shadow-luxury-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
              <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>EASY CONTENT CREATOR • ใช้งานง่ายในชีวิตประจำวัน</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#17181A]">
              พิมพ์ภาษาคนธรรมดา → ได้สูตรทำคอนเทนต์พร้อมก๊อปปี้ทันที
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              ไม่ต้องกรอกฟอร์มการตลาดให้ยุ่งยาก แค่บอกว่าอยากทำเรื่องอะไร AI จะถอดสูตรให้ครบทั้งจำนวนฉาก มุมกล้อง วิธีตัดต่อ บทพากย์ แคปชัน และ Prompt สำหรับ Google Flow
            </p>
          </div>
        </div>

        {/* Simple 1-Box Input */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) handleGenerate();
              }}
              placeholder="พิมพ์ไอเดียง่ายๆ เช่น: ช่วยคิดคอนเท้นไปเที่ยววัดให้หน่อย..."
              className="flex-1 px-4 py-3.5 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] text-sm md:text-base text-[#17181A] font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={loading || !prompt.trim()}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังถอดสูตรให้...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ถอดสูตรคอนเทนต์เลย</span>
                </>
              )}
            </button>
          </div>

          {/* Format Selector + Quick Examples */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">เลือกรูปแบบ:</span>
              <button
                type="button"
                onClick={() => setFormat("BOTH")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  format === "BOTH"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>จัดเต็มทั้งวิดีโอ + ภาพนิ่ง</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat("VIDEO")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  format === "VIDEO"
                    ? "bg-blue-50 border-blue-500 text-blue-800"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>เฉพาะวิดีโอ / คลิปสั้น</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat("PHOTO")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  format === "PHOTO"
                    ? "bg-amber-50 border-amber-500 text-amber-800"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>เฉพาะภาพนิ่ง / อัลบั้ม</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">ลองกดตัวอย่าง:</span>
              {QUICK_EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleGenerate(ex)}
                  disabled={loading}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Results Blueprint */}
      {blueprint && (
        <div className="space-y-6">
          {/* Summary Header + Copy All */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-emerald-950">{blueprint.title}</h2>
                {meta?.modelUsed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 border border-emerald-200 text-emerald-700 font-semibold">
                    {meta.modelUsed}
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-emerald-900/80">{blueprint.concept}</p>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(buildFullTextToCopy(), "ALL")}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
            >
              {copiedKey === "ALL" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === "ALL" ? "ก๊อปปี้ทั้งหมดแล้ว!" : "Copy สูตรทั้งหมด (ส่งลง LINE / Note)"}</span>
            </button>
          </div>

          {/* 1. VIDEO BLUEPRINT */}
          {blueprint.video_blueprint && (format === "VIDEO" || format === "BOTH") && (
            <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#17181A]">
                      แผนถ่ายทำ & ตัดต่อวิดีโอ (Video Production Guide)
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-0.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                        <Layers className="w-3.5 h-3.5" /> {blueprint.video_blueprint.scene_count} ฉาก
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <Clock className="w-3.5 h-3.5" /> รวม ~{blueprint.video_blueprint.total_duration_sec} วินาที
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Music className="w-3.5 h-3.5 text-amber-600" /> {blueprint.video_blueprint.mood_and_music}
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://flow.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shrink-0"
                >
                  <span>เปิด Google Flow เพื่อวาง Prompt</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Scenes */}
              <div className="grid grid-cols-1 gap-4">
                {blueprint.video_blueprint.scenes?.map((scene) => (
                  <div
                    key={scene.scene_number}
                    className="border border-slate-200 rounded-xl p-4 bg-[#FAFBFC] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold">
                          ฉากที่ {scene.scene_number}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                          ⏱️ {scene.duration_sec} วินาที
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          ขึ้นจอ: &ldquo;{scene.on_screen_text}&rdquo;
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <div className="font-bold text-slate-500 mb-1">📷 ถ่ายอะไร</div>
                        <div className="text-slate-800 leading-relaxed">{scene.what_to_shoot}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <div className="font-bold text-slate-500 mb-1">🎥 มุมกล้อง & การขยับ</div>
                        <div className="text-slate-800 leading-relaxed">{scene.camera_angle}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <div className="font-bold text-slate-500 mb-1">🔗 ความต่อเนื่องกับฉากถัดไป</div>
                        <div className="text-slate-800 leading-relaxed">{scene.continuity_note}</div>
                      </div>
                    </div>

                    {/* Voiceover + Prompt Copy Boxes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
                            <Mic className="w-3.5 h-3.5" /> เสียงพากย์ฉากนี้
                          </div>
                          <div className="text-emerald-950 font-medium">&ldquo;{scene.voiceover_text}&rdquo;</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(scene.voiceover_text, `vo-${scene.scene_number}`)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          {copiedKey === `vo-${scene.scene_number}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === `vo-${scene.scene_number}` ? "แล้ว" : "Copy"}</span>
                        </button>
                      </div>

                      <div className="bg-slate-900 text-slate-100 rounded-lg p-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-amber-400 mb-1">⚡ Prompt สำหรับ Google Flow / Veo</div>
                          <div className="text-slate-200 font-mono text-[11px] break-words">{scene.flow_prompt}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(scene.flow_prompt, `fp-${scene.scene_number}`)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          {copiedKey === `fp-${scene.scene_number}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === `fp-${scene.scene_number}` ? "Copied" : "Copy Prompt"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Editing Guide + Full Voiceover */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
                  <div className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-amber-600" />
                    <span>วิธีตัดต่อคลิปนี้ให้น่าดู (Editing Guide)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {blueprint.video_blueprint.editing_guide?.map((step, i) => (
                      <li key={i} className="leading-relaxed">• {step}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-emerald-600" />
                      <span>บทพากย์รวมทั้งคลิป (อ่านรวดเดียว)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(blueprint.video_blueprint?.full_voiceover_script || "", "vo-all")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === "vo-all" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "vo-all" ? "ก๊อปปี้แล้ว" : "Copy บทพากย์"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-emerald-950 leading-relaxed whitespace-pre-line">
                    {blueprint.video_blueprint.full_voiceover_script}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. PHOTO BLUEPRINT */}
          {blueprint.photo_blueprint && (format === "PHOTO" || format === "BOTH") && (
            <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#17181A]">
                      แผนถ่ายภาพนิ่ง & อัลบั้มสไลด์ (Photo & Carousel Guide)
                    </h3>
                    <p className="text-xs text-slate-600">สไตล์ภาพ: {blueprint.photo_blueprint.photo_style}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blueprint.photo_blueprint.shots?.map((shot) => (
                  <div key={shot.shot_number} className="border border-slate-200 rounded-xl p-4 bg-[#FAFBFC] space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-extrabold">
                        รูปที่ {shot.shot_number}: {shot.role}
                      </span>
                      <span className="font-bold text-slate-700">พาดหัว: &ldquo;{shot.text_overlay}&rdquo;</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500">📐 มุมกล้อง & องค์ประกอบ: </span>
                      <span className="text-slate-800">{shot.angle_and_framing}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500">💡 แสง & พร็อพ: </span>
                      <span className="text-slate-800">{shot.lighting_and_props}</span>
                    </div>
                    <div className="bg-slate-900 text-slate-100 rounded-lg p-2.5 flex items-start justify-between gap-2">
                      <span className="font-mono text-[11px] text-slate-200 break-words">{shot.image_prompt}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(shot.image_prompt, `img-${shot.shot_number}`)}
                        className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedKey === `img-${shot.shot_number}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === `img-${shot.shot_number}` ? "แล้ว" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. SOCIAL CAPTION */}
          <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-base text-[#17181A]">
                <FileText className="w-5 h-5 text-purple-600" />
                <span>แคปชัน & แฮชแท็กพร้อมโพสต์</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `${blueprint.social_caption}\n\n${(blueprint.hashtags || []).join(" ")}`,
                    "caption"
                  )
                }
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === "caption" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "caption" ? "ก๊อปปี้แคปชันแล้ว!" : "Copy แคปชัน + แฮชแท็ก"}</span>
              </button>
            </div>
            <div className="bg-[#F7F8FA] border border-slate-200 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-line leading-relaxed">
              {blueprint.social_caption}
              {"\n\n"}
              <span className="text-blue-600 font-semibold">{(blueprint.hashtags || []).join(" ")}</span>
            </div>
          </div>
        </div>
      )}

      {/* Self-Healing Error Memory Panel */}
      <div className="bg-white border border-[#E8E9EC] rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-extrabold text-[#17181A]">
                ระบบจำข้อผิดพลาด & แก้ไขตัวเองอัตโนมัติ (Self-Healing Error Memory)
              </h3>
              <p className="text-[11px] text-slate-500">
                บันทึกปัญหาที่เคยเกิดขึ้น (เช่น โมเดลล่ม, โควตาหมด, Google Flow ขัดข้อง) เพื่อข้ามไปใช้ทางเลือกที่เสถียรกว่าทันทีโดยไม่ทำพลาดซ้ำ
              </p>
            </div>
          </div>
          {errorMemories.length > 0 && (
            <button
              type="button"
              onClick={handleClearMemories}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างประวัติ</span>
            </button>
          )}
        </div>

        {errorMemories.length === 0 ? (
          <div className="text-xs text-emerald-700 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 font-medium">
            ✓ ระบบทำงานปกติ ยังไม่มีข้อผิดพลาดที่ต้องหลีกเลี่ยงในขณะนี้
          </div>
        ) : (
          <div className="space-y-2">
            {errorMemories.slice(0, 5).map((mem) => (
              <div key={mem.id} className="text-xs bg-amber-50/60 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-amber-900">[{mem.category}] {mem.message}</span>
                  <div className="text-emerald-800 font-medium mt-0.5">
                    ↳ วิธีแก้ไขอัตโนมัติ: {mem.resolution}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-amber-200 text-amber-800 font-bold shrink-0">
                  จำแล้ว ({mem.occurrences} ครั้ง)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
