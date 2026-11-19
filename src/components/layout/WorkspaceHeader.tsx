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
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandBarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

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
      <header className="sticky top-0 z-30 w-full workspace-header pt-[env(safe-area-inset-top)]">
        <div className="h-14 sm:h-16 px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-2 max-w-full">
          {/* Left: Mobile Toggle, Brand & Command Bar */}
          <div className="flex items-center gap-2 min-w-0">
            {onOpenMobile && (
              <button
                type="button"
                onClick={onOpenMobile}
                className="lg:hidden w-11 h-11 flex items-center justify-center text-slate-700 hover:text-slate-950 rounded-xl hover:bg-slate-100 cursor-pointer active:scale-95 transition-transform shrink-0"
                aria-label="เปิดเมนู"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Mobile/Tablet Brand Link */}
            <Link href="/" className="lg:hidden flex items-center active:scale-95 transition-transform shrink-0">
              <img src="/favicon.svg" alt="PK OS" className="w-8 h-8 rounded-xl shadow-xs" />
            </Link>

            {/* Global AI Command Bar Trigger */}
            <button
              type="button"
              onClick={() => setCommandBarOpen(true)}
              className="h-10 sm:h-9 flex items-center gap-2 px-3 sm:px-3.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/80 text-xs font-semibold text-slate-600 transition-all cursor-pointer group whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-12 transition-transform shrink-0" />
              <span className="hidden md:inline">วันนี้อยากให้ AI ช่วยทำอะไร?</span>
              <span className="md:hidden">สั่ง AI</span>
              <kbd className="hidden lg:inline-block font-mono text-[10px] bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            {/* Quick Easy AI Creator Button */}
            <Link
              href="/easy"
              className="h-10 sm:h-9 flex items-center gap-1.5 px-3 sm:px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              title="เปิดโหมดคิดคอนเทนต์ง่าย + ก๊อป Prompt ลง Google Flow"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">คิดคอนเทนต์ AI</span>
              <span className="sm:hidden">Easy AI</span>
            </Link>
          </div>

          {/* Center: Global Background Task Pill */}
          {backgroundTask && (
            <div className="hidden md:flex items-center mx-2 animate-fade-in">
              {backgroundTask.isGenerating ? (
                <Link
                  href="/ideas"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-900 shadow-xs animate-pulse hover:bg-amber-100 transition-all cursor-pointer whitespace-nowrap"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>AI กำลังคิดคอนเทนต์...</span>
                </Link>
              ) : (
                <Link
                  href="/ideas"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900 shadow-xs hover:bg-emerald-100 transition-all cursor-pointer whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>คิดคอนเทนต์เสร็จแล้ว →</span>
                </Link>
              )}
            </div>
          )}

          {/* Right: Balanced Desktop Actions & User Avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Active Brand Pill (Desktop only for clean mobile width) */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-semibold text-slate-700 whitespace-nowrap">
              <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[120px]">
                {activeBrand === "ALL" ? "All Brands" : activeBrand}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500">{campaignName}</span>
            </div>

            {/* Google Flow Quick Open */}
            <a
              href="https://flow.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex h-9 items-center gap-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <Film className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden md:inline">เปิด Google Flow</span>
              <span className="md:hidden">Flow</span>
            </a>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200/80">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
                PK
              </div>
              <div className="hidden lg:block text-left text-xs leading-none">
                <div className="font-bold text-slate-900">Creator</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">● ออนไลน์</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global AI Command Bar Modal */}
      <AICommandBar isOpen={commandBarOpen} onClose={() => setCommandBarOpen(false)} />
    </>
  );
};
