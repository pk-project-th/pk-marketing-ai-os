"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Sparkles,
  Film,
  Sun,
  Moon,
  Cloud,
  FolderOpen,
  Trash2,
  X,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useHub } from "@/context/HubContext";
import { useToast } from "@/components/ui/ToastProvider";
import { AICommandBar } from "@/components/ui/AICommandBar";

interface WorkspaceHeaderProps {
  onOpenMobile?: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ onOpenMobile }) => {
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
      <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#0D0F14]/95 backdrop-blur-md border-b border-[#E8E9EC] dark:border-zinc-800 pt-[env(safe-area-inset-top)] transition-colors">
        <div className="h-14 sm:h-15 px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-2 max-w-full">
          {/* Left: Mobile Toggle, Brand & Command Bar */}
          <div className="flex items-center gap-2 min-w-0">
            {onOpenMobile && (
              <button
                type="button"
                onClick={onOpenMobile}
                className="lg:hidden w-11 h-11 flex items-center justify-center text-slate-700 dark:text-zinc-200 hover:text-slate-950 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer active:scale-95 transition-transform shrink-0"
                aria-label="เปิดเมนู"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href="/" className="lg:hidden flex items-center active:scale-95 transition-transform shrink-0">
              <img src="/favicon.svg" alt="PK HUB" className="w-8 h-8 rounded-xl shadow-xs" />
            </Link>

            {/* Global AI Command Bar Trigger */}
            <button
              type="button"
              onClick={() => setCommandBarOpen(true)}
              className="h-10 sm:h-9 flex items-center gap-2 px-3 sm:px-3.5 rounded-xl bg-slate-100/90 dark:bg-zinc-800/90 hover:bg-slate-200/70 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-all cursor-pointer group whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-12 transition-transform shrink-0" />
              <span className="hidden md:inline">ค้นหาแผนก / สั่งงาน AI ด่วน...</span>
              <span className="md:hidden">ค้นหา/สั่ง AI</span>
              <kbd className="hidden lg:inline-block font-mono text-[10px] bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                ⌘K
              </kbd>
            </button>

            {/* Active Handoff Pipeline Indicator */}
            {activeHandoff && (
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 max-w-xs truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">
                  สคริปต์ในสายพาน: <b>{activeHandoff.title || activeHandoff.topic}</b> ({activeHandoff.scenes?.length || 0} ฉาก)
                </span>
              </div>
            )}
          </div>

          {/* Right: Vault/Sync Modal, Theme Toggle, Google Flow */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Project Vault & Mobile Sync Button */}
            <button
              type="button"
              onClick={() => setVaultModalOpen(true)}
              className="h-10 sm:h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="เปิดคลังโปรเจกต์ & ซิงค์ข้ามเครื่องคอม-มือถือ"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">โปรเจกต์ & ซิงค์ ({vaultProjects.length})</span>
              <span className="sm:hidden">ซิงค์ ({vaultProjects.length})</span>
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700 text-slate-700 dark:text-amber-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              aria-label="สลับโทนมืด/สว่าง"
              title={darkMode ? "สลับเป็นโทนสว่าง (Editorial Light)" : "สลับเป็นโทนมืด (Studio Dark)"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Google Flow Quick Open */}
            <a
              href="https://flow.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex h-9 items-center gap-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
            >
              <Film className="w-3.5 h-3.5 text-emerald-300 dark:text-white shrink-0" />
              <span className="hidden md:inline">เปิด Google Flow</span>
              <span className="md:hidden">Flow</span>
            </a>
          </div>
        </div>
      </header>

      {/* Global AI Command Bar Modal */}
      <AICommandBar isOpen={commandBarOpen} onClose={() => setCommandBarOpen(false)} />

      {/* Universal Project Vault & Cross-Device Cloud Sync Modal */}
      {vaultModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vault-modal-title"
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85dvh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="vault-modal-title" className="text-base font-extrabold text-slate-900 dark:text-white">
                    คลังโปรเจกต์รวม & ซิงค์ข้ามเครื่อง (คอม ⇄ มือถือ iPhone)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    บันทึกอัตโนมัติทุกแผนก · ใช้รหัสซิงค์เดียวกันเพื่อดึงงานไปทำต่อบนโทรศัพท์ได้ทันที
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVaultModalOpen(false)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 custom-scrollbar">
              {/* Cloud Sync Code Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 space-y-3">
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                  รหัสซิงค์ส่วนตัวของคุณ (ตั้งชื่อเดียวกันทั้งในคอมและโทรศัพท์)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={syncCode}
                    onChange={(e) => setSyncCode(e.target.value)}
                    placeholder="เช่น PK-CREATOR-MAIN"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-sm font-mono font-bold text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    disabled={syncBusy}
                    onClick={async () => {
                      setSyncBusy(true);
                      const res = await syncToCloud();
                      setSyncBusy(false);
                      showToast(res.message, res.success ? "success" : "info");
                    }}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    ☁️ อัปโหลดงานขึ้น Cloud
                  </button>
                  <button
                    type="button"
                    disabled={syncBusy}
                    onClick={async () => {
                      setSyncBusy(true);
                      const res = await pullFromCloud(syncCode);
                      setSyncBusy(false);
                      showToast(res.message, res.success ? "success" : "info");
                    }}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    📲 ดึงงานลงเครื่องนี้
                  </button>
                </div>
              </div>

              {/* Saved Projects List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    โปรเจกต์ที่บันทึกไว้ล่าสุด ({vaultProjects.length})
                  </h3>
                </div>

                {vaultProjects.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
                    ยังไม่มีโปรเจกต์ในคลัง — เริ่มคิดสคริปต์ในหน้า OS หรือทำงานในแผนกใดก็ได้ ระบบจะบันทึกให้อัตโนมัติทันที
                  </div>
                ) : (
                  <div className="space-y-2">
                    {vaultProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-3.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3 hover:border-emerald-400 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {proj.departmentLabel}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {proj.title}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 truncate">
                            {proj.payload?.scenes?.length || 0} ฉาก · สัดส่วน {proj.aspectRatio} · อัปเดต{" "}
                            {new Date(proj.updatedAt).toLocaleString("th-TH")}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              loadFromVault(proj);
                              setVaultModalOpen(false);
                              showToast(`เปิดโปรเจกต์ "${proj.title}" เรียบร้อย!`, "success");
                            }}
                            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>เปิดทำต่อ</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteFromVault(proj.id)}
                            className="w-9 h-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center cursor-pointer"
                            title="ลบโปรเจกต์"
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
