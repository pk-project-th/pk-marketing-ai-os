"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Sparkles, Search, Bell, ShieldCheck, Globe, RotateCw, CheckCircle2, Film } from "lucide-react";
import { useBrand } from "@/context/BrandContext";
import { AICommandBar } from "@/components/ui/AICommandBar";

interface WorkspaceHeaderProps {
  onOpenMobile?: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ onOpenMobile }) => {
  const { activeBrand, campaignName } = useBrand();
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [backgroundTask, setBackgroundTask] = useState<{
    isGenerating: boolean;
    brandName?: string;
    completedAt?: number;
  } | null>(null);

  useEffect(() => {
    const checkTask = () => {
      if (typeof window === "undefined") return;
      try {
        const taskStr = localStorage.getItem("pk_active_ideas_generation_task");
        if (taskStr) {
          const task = JSON.parse(taskStr);
          if (task.isGenerating && Date.now() - task.startedAt < 90000) {
            setBackgroundTask(task);
            return;
          } else if (!task.isGenerating && task.completedAt && Date.now() - task.completedAt < 40000) {
            setBackgroundTask(task);
            return;
          }
        }
        setBackgroundTask(null);
      } catch (e) {}
    };

    checkTask();
    const interval = setInterval(checkTask, 1500);
    window.addEventListener("storage", checkTask);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkTask);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 w-full workspace-header h-16 px-4 md:px-6 flex items-center justify-between">
        {/* Left: Mobile Toggle & Context Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenMobile && (
            <button
              onClick={onOpenMobile}
              className="lg:hidden p-2 text-slate-600 hover:text-[#17181A] rounded-xl hover:bg-slate-100 cursor-pointer active:scale-95 transition-transform"
              aria-label="เปิดเมนู"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Mobile/Tablet Brand Link */}
          <Link href="/" className="lg:hidden flex items-center gap-1.5 active:scale-95 transition-transform mr-1">
            <img src="/favicon.svg" alt="PK OS" className="w-7 h-7 rounded-lg shadow-sm" />
          </Link>

          {/* Global AI Command Bar Trigger */}
          <button
            type="button"
            onClick={() => setCommandBarOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F7F8FA] hover:bg-slate-100 border border-[#E8E9EC] text-xs font-medium text-slate-600 transition-all shadow-luxury-sm cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B7CF6] group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">✦ วันนี้อยากให้ AI ช่วยทำอะไร?</span>
            <span className="sm:hidden">สั่งงาน AI</span>
            <kbd className="hidden md:inline-block font-mono text-[10px] bg-white text-slate-500 px-1.5 py-0.5 rounded border border-[#E8E9EC]">
              ⌘K
            </kbd>
          </button>

          {/* Quick AI Video Studio Button */}
          <Link
            href="/studio"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all active:scale-95 cursor-pointer shrink-0"
            title="เปิดสตูดิโอสร้างวิดีโออัตโนมัติ (Google Veo 3.1 & FlowKit)"
          >
            <Film className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">🎬 AI Video Studio (Veo 3.1)</span>
            <span className="sm:hidden">🎬 Video</span>
          </Link>
        </div>

        {/* Center: Global Background Task Pill */}
        {backgroundTask && (
          <div className="flex items-center mx-2 animate-in fade-in zoom-in duration-300">
            {backgroundTask.isGenerating ? (
              <Link
                href="/ideas"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-900 shadow-sm animate-pulse hover:bg-amber-500/20 transition-all cursor-pointer"
                title="คลิกเพื่อกลับไปดูผลลัพธ์ไอเดีย"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span className="hidden md:inline">
                  ⚡ AI กำลังคิดคอนเทนต์ &apos;{backgroundTask.brandName || "ที่สั่งไว้"}&apos;... (เปลี่ยนหน้าไปมาได้)
                </span>
                <span className="md:hidden">⚡ กำลังคิดไอเดีย...</span>
                <span className="text-[10px] text-amber-700 underline font-normal ml-1">คลิกดู ➔</span>
              </Link>
            ) : (
              <Link
                href="/ideas"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold text-emerald-900 shadow-sm hover:bg-emerald-500/25 transition-all cursor-pointer"
                title="คลิกเพื่อเปิดดูไอเดียใหม่"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">✓ AI คิดคอนเทนต์เสร็จแล้ว!</span>
                <span className="md:hidden">✓ เสร็จแล้ว!</span>
                <span className="text-[10px] text-emerald-700 underline font-normal ml-1">เปิดดูไอเดีย ➔</span>
              </Link>
            )}
          </div>
        )}

        {/* Right: Brand Pill & AiPASS Tier & User */}
        <div className="flex items-center gap-3">
          {/* Active Brand Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-[#E8E9EC] text-[11px] font-medium text-slate-700">
            <Globe className="w-3 h-3 text-[#C9A96E]" />
            <span className="truncate max-w-[140px]">
              {activeBrand === "ALL" ? "All Brands" : activeBrand}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{campaignName}</span>
          </div>

          {/* AiPASS Link */}
          <a
            href="https://de.aipass.net"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-[11px] font-medium transition-colors"
          >
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>AiPASS: 10,000 เครดิต/วัน</span>
          </a>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E8E9EC]">
            <div className="w-8 h-8 rounded-full bg-[#17181A] text-white flex items-center justify-center text-xs font-bold shadow-luxury-sm">
              PK
            </div>
            <div className="hidden sm:block text-left text-xs leading-none">
              <div className="font-semibold text-[#17181A]">Creator</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">● ออนไลน์</div>
            </div>
          </div>
        </div>
      </header>

      {/* Global AI Command Bar Modal */}
      <AICommandBar isOpen={commandBarOpen} onClose={() => setCommandBarOpen(false)} />
    </>
  );
};
