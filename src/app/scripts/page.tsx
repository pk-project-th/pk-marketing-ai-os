"use client";

import React, { useState, useEffect } from "react";
import { Video, Play, Pause, Copy, Check, Sparkles, FileText, ChevronRight, Download } from "lucide-react";
import { ContentAsset } from "@/types";
import { exportToMarkdown } from "@/lib/export";

export default function ScriptStudioPage() {
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<ContentAsset | null>(null);
  const [teleprompterMode, setTeleprompterMode] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xl">("large");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/ai/produce");
        const data = await res.json();
        if (data.assets && data.assets.length > 0) {
          setAssets(data.assets);
          setSelectedAsset(data.assets[0]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const getFullScriptText = () => {
    if (!selectedAsset) return "";
    return `[HOOK - 00:00]\n${selectedAsset.script_hook}\n\n[INTRODUCTION]\n${selectedAsset.script_intro}\n\n[MAIN BODY]\n${selectedAsset.script_body}\n\n[PROOF & VALUE]\n${selectedAsset.script_proof}\n\n[CALL TO ACTION]\n${selectedAsset.script_cta}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullScriptText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    if (!selectedAsset) return;
    const md = `# Video Shooting Script — ${selectedAsset.framework}

## 1. บทพูดสำหรับพิธีกร / Teleprompter
${getFullScriptText()}

## 2. ตารางลำดับฉากและภาพประกอบ (Scene Breakdown)
${selectedAsset.video_scenes?.map((s, idx) => `### ฉากที่ ${idx + 1}: ${s.scene} (${s.timestamp})
- **ภาพ / การกระทำ:** ${s.visual}
- **เสียงพากย์:** ${s.dialogue}
- **ข้อความบนจอ:** ${s.on_screen_text}
- **มุมกล้อง:** ${s.camera_direction}
- **ดนตรี/เสียง:** ${s.sound_suggestion}
`).join("\n") || ""}
`;
    exportToMarkdown(md, `script_${selectedAsset.id}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E9EC] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Video className="w-3.5 h-3.5" />
            <span>SCRIPT & STORYBOARD STUDIO</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">สตูดิโอเขียนสคริปต์ (Script Studio)</h2>
          <p className="text-xs text-slate-700 mt-1">
            เครื่องมือฝึกซ้อมและบันทึกสคริปต์วิดีโอสั้น/ยาว พร้อมโหมด Teleprompter สำหรับผู้ดำเนินรายการ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTeleprompterMode(!teleprompterMode)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              teleprompterMode
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20"
                : "bg-slate-800 text-slate-800 border-[#E8E9EC] hover:bg-slate-700"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{teleprompterMode ? "ปิดโหมด Teleprompter" : "เปิดโหมด Teleprompter ซ้อมพูด"}</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-[#E8E9EC] text-slate-800 hover:text-slate-900 text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>ส่งออก .MD</span>
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 text-xs font-semibold shadow-sm transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "คัดลอกสคริปต์แล้ว" : "คัดลอกทั้งหมด"}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Script Selector */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            เลือกสคริปต์ในระบบ ({assets.length})
          </div>
          <div className="space-y-2">
            {assets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedAsset?.id === asset.id
                    ? "bg-[#F7F8FA] border-blue-500/60 shadow-md shadow-blue-500/10"
                    : "bg-white border-[#E8E9EC] hover:border-[#E8E9EC] text-slate-700"
                }`}
              >
                <div className="text-[10px] font-mono text-cyan-400 mb-1">
                  Framework: {asset.framework}
                </div>
                <div className="text-xs font-semibold text-slate-900 line-clamp-2">
                  {asset.script_hook}
                </div>
                <p className="mt-1 text-[11px] text-slate-700 line-clamp-1">
                  {asset.script_body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Script Reader / Teleprompter */}
        <div className="lg:col-span-2">
          {selectedAsset ? (
            <div className={`rounded-2xl border transition-all ${
              teleprompterMode 
                ? "bg-black border-amber-500/50 p-8 shadow-2xl min-h-[500px]" 
                : "bg-white border-[#E8E9EC] p-6"
            }`}>
              {/* Teleprompter Font Controls */}
              {teleprompterMode && (
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8E9EC]">
                  <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    <span>LIVE TELEPROMPTER VIEW</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-700">ขนาดตัวอักษร:</span>
                    <button
                      onClick={() => setFontSize("normal")}
                      className={`px-2.5 py-1 text-xs rounded ${fontSize === "normal" ? "bg-amber-500 text-black font-bold" : "bg-slate-800 text-slate-800"}`}
                    >
                      ปกติ
                    </button>
                    <button
                      onClick={() => setFontSize("large")}
                      className={`px-2.5 py-1 text-xs rounded ${fontSize === "large" ? "bg-amber-500 text-black font-bold" : "bg-slate-800 text-slate-800"}`}
                    >
                      ใหญ่
                    </button>
                    <button
                      onClick={() => setFontSize("xl")}
                      className={`px-2.5 py-1 text-xs rounded ${fontSize === "xl" ? "bg-amber-500 text-black font-bold" : "bg-slate-800 text-slate-800"}`}
                    >
                      ใหญ่พิเศษ
                    </button>
                  </div>
                </div>
              )}

              {/* Script Text */}
              <div className={`space-y-6 ${
                fontSize === "xl" ? "text-2xl leading-loose font-medium" : fontSize === "large" ? "text-lg leading-relaxed" : "text-sm leading-relaxed"
              }`}>
                {/* 01. Hook */}
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    01. HOOK (3 วินาทีแรก)
                  </span>
                  <p className="text-amber-200 font-semibold bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    "{selectedAsset.script_hook}"
                  </p>
                </div>

                {/* 02. Intro */}
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                    02. บทนำ (Introduction)
                  </span>
                  <p className="text-slate-100">
                    {selectedAsset.script_intro}
                  </p>
                </div>

                {/* 03. Main Body */}
                <div>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-1">
                    03. เนื้อหาหลัก ({selectedAsset.framework})
                  </span>
                  <p className="text-slate-100">
                    {selectedAsset.script_body}
                  </p>
                </div>

                {/* 04. Proof / Value */}
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                    04. ข้อมูลพิสูจน์ (Proof / Scientific Claims)
                  </span>
                  <p className="text-cyan-100 bg-cyan-950/30 p-3 rounded-xl border border-cyan-800/40">
                    {selectedAsset.script_proof}
                  </p>
                </div>

                {/* 05. CTA */}
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    05. คำเรียกร้องให้ลงมือทำ (Call to Action)
                  </span>
                  <p className="text-emerald-300 font-bold bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
                    👉 {selectedAsset.script_cta}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-700 bg-white border border-[#E8E9EC] rounded-2xl">
              เลือกสคริปต์จากรายการด้านซ้ายเพื่อเปิดดู
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
