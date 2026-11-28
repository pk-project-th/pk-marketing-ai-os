"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Sparkles,
  Subtitles,
  Download,
  Film,
  Music,
  ShoppingBag,
  Video,
  Wand2,
  Sun,
  Moon,
  Cloud,
  FolderOpen,
  Trash2,
  X,
  CheckCircle2,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { useHub } from "@/context/HubContext";
import { useToast } from "@/components/ui/ToastProvider";
import { AICommandBar } from "@/components/ui/AICommandBar";

interface WorkspaceHeaderProps {
  onOpenMobile?: () => void;
}

const STUDIO_QUICK_TABS = [
  { id: "os", label: "🧠 หน้า OS", href: "/", icon: Sparkles },
  { id: "subtitles", label: "⚡ Auto Edit ซับ", href: "/subtitles", icon: Subtitles },
  { id: "downloader", label: "📥 โหลดคลิป", href: "/downloader", icon: Download },
  { id: "short-film", label: "🎬 หนังสั้น PKFLOW", href: "/short-film", icon: Film },
  { id: "mv-studio", label: "🎵 ทำ MV เพลง", href: "/mv-studio", icon: Music },
  { id: "affiliate", label: "🛒 ปักตะกร้า", href: "/affiliate", icon: ShoppingBag },
  { id: "commercial", label: "🎥 โฆษณา Flow", href: "/commercial", icon: Video },
  { id: "skills-hub", label: "⚡ สกิลพิเศษ", href: "/skills-hub", icon: Wand2 }
];

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ onOpenMobile }) => {
  const pathname = usePathname();
  const {
    activeHandoff,
    vaultProjects,
    loadFromVault,
    deleteFromVault,
    syncCode,
    setSyncCode,
    syncToCloud,
    pullFromCloud,
    darkMode,
    setDarkMode
  } = useHub();
  const { showToast } = useToast();

  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);

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

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#0D0F14]/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 pt-[env(safe-area-inset-top)] transition-colors">
        <div className="h-14 px-3 sm:px-5 flex items-center justify-between gap-2">
          {/* Left: Mobile Menu + Scrollable Quick Studio Switcher */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {onOpenMobile && (
              <button
                type="button"
                onClick={onOpenMobile}
                className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-700 dark:text-zinc-200 rounded-xl bg-slate-100 dark:bg-zinc-800 shrink-0 cursor-pointer"
                aria-label="เปิดเมนู"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Quick Studio Switcher Bar (Always clear which app you are in!) */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              {STUDIO_QUICK_TABS.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                      isActive
                        ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs"
                        : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Project Vault, Theme Toggle, Google Flow */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setVaultModalOpen(true)}
              className="h-9 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              title="คลังโปรเจกต์ที่บันทึกไว้ & ซิงค์ข้ามเครื่อง"
            >
              <Cloud className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">คลังงาน ({vaultProjects.length})</span>
              <span className="sm:hidden">{vaultProjects.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-amber-300 flex items-center justify-center cursor-pointer"
              title="สลับโทนสว่าง / โทนมืด"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <a
              href="https://flow.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex h-9 items-center gap-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 text-white text-xs font-bold"
            >
              <span>Google Flow</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>
      </header>

      <AICommandBar isOpen={commandBarOpen} onClose={() => setCommandBarOpen(false)} />

      {/* Universal Project Vault & Cloud Sync Modal */}
      {vaultModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85dvh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    คลังโปรเจกต์ที่ฝังไว้ในระบบ & ซิงค์ข้ามเครื่อง (คอม ⇄ iPhone)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    งานและไฟล์ที่อัปโหลดถูกฝังในเบราว์เซอร์อัตโนมัติ (IndexedDB) สลับหน้าหรือรีเฟรชไม่หาย
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVaultModalOpen(false)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 custom-scrollbar">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 space-y-3">
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                  รหัสซิงค์ข้ามอุปกรณ์ (ตั้งชื่อเดียวกันทั้งในคอมและ iPhone):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={syncCode}
                    onChange={(e) => setSyncCode(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-sm font-mono font-bold"
                  />
                  <button
                    type="button"
                    disabled={syncBusy}
                    onClick={async () => {
                      setSyncBusy(true);
                      const r = await syncToCloud();
                      setSyncBusy(false);
                      showToast(r.message, r.success ? "success" : "info");
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    ☁️ ส่งงานขึ้น Cloud
                  </button>
                  <button
                    type="button"
                    disabled={syncBusy}
                    onClick={async () => {
                      setSyncBusy(true);
                      const r = await pullFromCloud(syncCode);
                      setSyncBusy(false);
                      showToast(r.message, r.success ? "success" : "info");
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                  >
                    📲 ดึงงานลงเครื่องนี้
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  รายการโปรเจกต์ที่บันทึกไว้ ({vaultProjects.length})
                </h3>
                {vaultProjects.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
                    ยังไม่มีโปรเจกต์ที่บันทึกไว้ — เมื่อคุณเริ่มทำงานในแอพใดก็ตาม ระบบจะบันทึกให้อัตโนมัติทันที
                  </div>
                ) : (
                  <div className="space-y-2">
                    {vaultProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              {proj.departmentLabel}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {proj.title}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {proj.payload?.scenes?.length || 0} ฉาก · อัปเดต{" "}
                            {new Date(proj.updatedAt).toLocaleString("th-TH")}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              loadFromVault(proj);
                              setVaultModalOpen(false);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>เปิดทำต่อ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteFromVault(proj.id)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
