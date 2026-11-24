"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Film,
  Music,
  Subtitles,
  Download,
  Video,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Send,
  Layers
} from "lucide-react";
import { useHub, HubHandoffPayload } from "@/context/HubContext";
import { useToast } from "@/components/ui/ToastProvider";

interface DepartmentHandoffBarProps {
  currentDeptId: string;
  payload: HubHandoffPayload;
  compact?: boolean;
}

export const DepartmentHandoffBar: React.FC<DepartmentHandoffBarProps> = ({
  currentDeptId,
  payload,
  compact = false
}) => {
  const { sendToDepartment, customDepartments } = useHub();
  const { showToast } = useToast();
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (type: "script" | "prompts" | "all") => {
    let text = "";
    if (type === "script") {
      text =
        payload.fullScriptThai ||
        payload.scenes.map((s) => `[ฉาก ${s.sceneNumber}] ${s.voiceoverThai}`).join("\n");
    } else if (type === "prompts") {
      text = payload.scenes
        .map(
          (s) =>
            `[SHOT ${String(s.sceneNumber).padStart(2, "0")}] ${s.title || `ฉากที่ ${s.sceneNumber}`} | Timecode: ${
              s.timecode || `00:${String((s.sceneNumber - 1) * 3).padStart(2, "0")} - 00:${String(s.sceneNumber * 3).padStart(2, "0")}`
            }\n- Duration: ${s.durationSec || 3}s\n- On-Screen Text (TH): "${s.onScreenText || ""}"\n- Thai Voiceover Script: "${
              s.voiceoverThai || ""
            }"\n- Visual Prompt (EN): ${s.visualPromptEn}\n- Camera & Physical Motion (Veo 2): ${
              s.motionPromptEn || "Smooth cinematic camera movement, 4k 60fps"
            }`
        )
        .join("\n\n");
    } else {
      const scenesBlock = payload.scenes
        .map(
          (s) =>
            `[ฉากที่ ${s.sceneNumber} · ${s.durationSec || 3}s] ${s.title}\n🎙️ พากย์ไทย: ${s.voiceoverThai}\n💬 ข้อความบนจอ: ${
              s.onScreenText || "-"
            }\n🎨 Visual Prompt (EN): ${s.visualPromptEn}\n🎥 Camera Motion: ${s.motionPromptEn || "Smooth cinematic dolly"}`
        )
        .join("\n\n");
      text = `CAMPAIGN: ${payload.title || payload.topic}\n⚡ HOOK 3 วินาทีแรก: ${payload.hook3Sec}\n\n${scenesBlock}\n\n📝 แคปชันโซเชียล:\n${
        payload.caption || ""
      }\n${(payload.hashtags || []).join(" ")}`;
    }

    navigator.clipboard.writeText(text);
    setCopiedType(type);
    showToast("คัดลอกข้อมูลเรียบร้อย พร้อมนำไปวางใช้งานทันที!", "success");
    setTimeout(() => setCopiedType(null), 2200);
  };

  const TARGETS = [
    {
      id: "affiliate",
      label: "ส่งไปทำคลิปขายของ/ปักตะกร้า",
      shortLabel: "ปักตะกร้า",
      href: "/affiliate",
      icon: ShoppingBag,
      style: "bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200"
    },
    {
      id: "short-film",
      label: "ส่งไปทำหนังสั้น (PKFLOW)",
      shortLabel: "ทำหนังสั้น",
      href: "/short-film",
      icon: Film,
      style: "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
    },
    {
      id: "mv-studio",
      label: "ส่งไปทำ MV เพลง/คาราโอเกะ",
      shortLabel: "ทำ MV เพลง",
      href: "/mv-studio",
      icon: Music,
      style: "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200"
    },
    {
      id: "subtitles",
      label: "ส่งไปทำซับอัตโนมัติ (9:16)",
      shortLabel: "ซับอัตโนมัติ",
      href: "/subtitles",
      icon: Subtitles,
      style: "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
    },
    {
      id: "commercial",
      label: "ส่งไปโฆษณา Commercial + เสียง AI",
      shortLabel: "โฆษณา Flow",
      href: "/commercial",
      icon: Video,
      style: "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
    },
    {
      id: "skills-hub",
      label: "ส่งไปสกิลผู้กำกับพิเศษ (ส่งมอบรถ/โชว์รูม)",
      shortLabel: "สกิลผู้กำกับ",
      href: "/skills-hub",
      icon: Sparkles,
      style: "bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200"
    },
    {
      id: "downloader",
      label: "เปิดแผนกโหลดคลิป & แปลงไฟล์",
      shortLabel: "โหลดคลิป",
      href: "/downloader",
      icon: Download,
      style: "bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200"
    }
  ].filter((t) => t.id !== currentDeptId);

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              ศูนย์ส่งต่องานข้ามแผนก & คัดลอกด่วน (1-Click Department Handoff)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              ก๊อปปี้สคริปต์/Prompt ไปใช้ทันที หรือกดส่งโปรเจกต์นี้ต่อไปยังแผนกเฉพาะทางโดยไม่ต้องพิมพ์ใหม่
            </p>
          </div>
        </div>

        {/* 1-Click Copy Trio */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleCopy("script")}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            {copiedType === "script" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>ก๊อปบทพากย์ไทย</span>
          </button>
          <button
            type="button"
            onClick={() => handleCopy("prompts")}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            {copiedType === "prompts" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>ก๊อป Prompt ลง Flow</span>
          </button>
          <button
            type="button"
            onClick={() => handleCopy("all")}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            {copiedType === "all" ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>ก๊อปทั้งชุด (สคริปต์+แคปชัน)</span>
          </button>
        </div>
      </div>

      {/* Department Handoff Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {TARGETS.map((target) => {
          const Icon = target.icon;
          return (
            <button
              key={target.id}
              type="button"
              onClick={() => {
                showToast(`กำลังส่งสคริปต์และฉากไปยัง "${target.label}"...`, "success");
                sendToDepartment(target.href, payload, target.shortLabel);
              }}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all active:scale-[0.98] cursor-pointer ${target.style}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold truncate">{compact ? target.shortLabel : target.label}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
            </button>
          );
        })}

        {/* Also render any user-created custom departments */}
        {customDepartments.map((cDept) => (
          <button
            key={cDept.id}
            type="button"
            onClick={() => {
              showToast(`กำลังส่งงานไปยังแผนก "${cDept.name}"...`, "success");
              sendToDepartment(`/skills-hub?dept=${encodeURIComponent(cDept.id)}`, payload, cDept.name);
            }}
            className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-900 text-left flex items-center justify-between gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Layers className="w-4 h-4 shrink-0 text-violet-600" />
              <span className="text-xs font-bold truncate">ส่งไป: {cDept.name}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
          </button>
        ))}
      </div>
    </div>
  );
};
