"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Subtitles,
  Download,
  Film,
  Music,
  ShoppingBag,
  Video,
  Wand2,
  PlusCircle,
  Settings,
  Save,
  FolderOpen,
  Cloud,
  ShieldCheck,
  X,
  Layers
} from "lucide-react";
import { useHub } from "@/context/HubContext";
import { useToast } from "@/components/ui/ToastProvider";

interface WorkspaceSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  mobileOpen,
  onCloseMobile
}) => {
  const pathname = usePathname();
  const {
    exportVaultJson,
    importVaultJson,
    syncToCloud,
    pullFromCloud,
    customDepartments,
    vaultProjects
  } = useHub();
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const CORE_APPS = [
    {
      id: "os",
      step: "OS",
      label: "หน้า OS คิดคอนเทนต์ & สคริปต์",
      sublabel: "คิดบท · แยกฉาก · ส่งต่อไปทุกแอพ",
      href: "/",
      icon: Sparkles,
      accent: "bg-emerald-600 text-white",
      activeBg: "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20",
      iconColor: "text-emerald-500"
    },
    {
      id: "subtitles",
      step: "01",
      label: "PK Auto Edit Kit (ซับอัตโนมัติ)",
      sublabel: "ตัดเดดแอร์ · ซับคาราโอเกะ · เรนเดอร์ MP4",
      href: "/subtitles",
      icon: Subtitles,
      accent: "bg-blue-600 text-white",
      activeBg: "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20",
      iconColor: "text-blue-500"
    },
    {
      id: "downloader",
      step: "02",
      label: "PK โหลดลิงก์ & แปลงไฟล์",
      sublabel: "โหลด YouTube/TikTok/FB · แปลงไฟล์",
      href: "/downloader",
      icon: Download,
      accent: "bg-teal-600 text-white",
      activeBg: "bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-600/20",
      iconColor: "text-teal-500"
    },
    {
      id: "short-film",
      step: "03",
      label: "PKFLOW PRO FILM (ทำหนังสั้น)",
      sublabel: "หลาย EP · ล็อกหน้า & เสียงตัวละคร",
      href: "/short-film",
      icon: Film,
      accent: "bg-amber-500 text-slate-950",
      activeBg: "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20",
      iconColor: "text-amber-500"
    },
    {
      id: "mv-studio",
      step: "04",
      label: "MV Creator Pro v5.3 (ทำ MV)",
      sublabel: "แนบเพลง & รูป 4-7 มุม · สลับร้อง/แสดง",
      href: "/mv-studio",
      icon: Music,
      accent: "bg-purple-600 text-white",
      activeBg: "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20",
      iconColor: "text-purple-500"
    },
    {
      id: "affiliate",
      step: "05",
      label: "PKShortClips (ขายของ/ปักตะกร้า)",
      sublabel: "สตอรี่บอร์ดขายของ · สูตร Viral · ภาพร่าง",
      href: "/affiliate",
      icon: ShoppingBag,
      accent: "bg-[#F71C25] text-white",
      activeBg: "bg-[#F71C25] text-white border-red-500 shadow-md shadow-red-600/20",
      iconColor: "text-[#F71C25]"
    },
    {
      id: "commercial",
      step: "06",
      label: "Commercial Studio (โฆษณา Flow)",
      sublabel: "3 รูปอ้างอิง · Topic Lock · พากย์ไทย",
      href: "/commercial",
      icon: Video,
      accent: "bg-emerald-700 text-white",
      activeBg: "bg-emerald-700 text-white border-emerald-600 shadow-md shadow-emerald-700/20",
      iconColor: "text-emerald-500"
    },
    {
      id: "skills-hub",
      step: "07",
      label: "สกิลผู้กำกับพิเศษ & +เพิ่มแอพใหม่",
      sublabel: "ส่งมอบรถ · โชว์รูม 6 จังหวะ · ขยายอนาคต",
      href: "/skills-hub",
      icon: Wand2,
      accent: "bg-indigo-600 text-white",
      activeBg: "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20",
      iconColor: "text-indigo-500"
    }
  ];

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importVaultJson(String(reader.result || ""));
      if (res.success) {
        showToast(`กู้คืนโปรเจกต์สำเร็จ (${res.count} รายการ)!`, "success");
      } else {
        showToast(`ไฟล์ไม่ถูกต้อง: ${res.error}`, "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0F1219] text-white border-r border-slate-800/90 flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Clean Brand Header */}
        <div className="p-4 border-b border-slate-800/90 flex items-center justify-between">
          <Link href="/" onClick={onCloseMobile} className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="PK Hub"
              className="w-10 h-10 rounded-xl shadow-md object-cover border border-white/10"
            />
            <div>
              <div className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                <span>PK CREATIVE HUB</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v4.0
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ฝังไฟล์อัตโนมัติ · สลับหน้าไม่หาย</span>
              </div>
            </div>
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
              aria-label="ปิดเมนู"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Clean Focused Apps List */}
        <div className="px-4 pt-3.5 pb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            เลือกเว็บแอป / แผนกที่ต้องการใช้งาน
          </span>
          <span className="text-[10px] font-mono text-slate-500">8 STUDIOS</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1.5 custom-scrollbar">
          {CORE_APPS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                  isActive
                    ? item.activeBg
                    : "border-transparent bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? "bg-black/20 text-white" : "bg-slate-800 " + item.iconColor
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-extrabold leading-tight truncate ${
                        isActive && item.id === "short-film" ? "text-slate-950" : "text-white"
                      }`}
                    >
                      {item.label}
                    </div>
                    <div
                      className={`text-[10px] leading-tight mt-0.5 truncate ${
                        isActive
                          ? item.id === "short-film"
                            ? "text-slate-800 font-semibold"
                            : "text-white/85"
                          : "text-slate-400"
                      }`}
                    >
                      {item.sublabel}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ml-1.5 ${
                    isActive ? "bg-black/25 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {item.step}
                </span>
              </Link>
            );
          })}

          {/* Any Custom User-Created Future Apps */}
          {customDepartments.map((cDept) => (
            <Link
              key={cDept.id}
              href={`/skills-hub?dept=${encodeURIComponent(cDept.id)}`}
              onClick={onCloseMobile}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-violet-500/30 bg-violet-950/30 hover:bg-violet-900/40 text-violet-100 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-violet-600/30 text-violet-300 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{cDept.name}</div>
                  <div className="text-[10px] text-violet-300 truncate">{cDept.sublabel}</div>
                </div>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-500/30 text-violet-200 font-bold">
                {cDept.badge}
              </span>
            </Link>
          ))}

          {/* Add Future App Button */}
          <Link
            href="/skills-hub?tab=custom"
            onClick={onCloseMobile}
            className="mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-dashed border-emerald-500/40 transition-colors"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>+ เพิ่มเว็บแอป / แผนกใหม่ในอนาคต</span>
          </Link>

          <Link
            href="/settings"
            onClick={onCloseMobile}
            className={`mt-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              pathname === "/settings"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>ตั้งค่าระบบ & ตรวจสอบ API Keys</span>
          </Link>
        </nav>

        {/* Bottom Persistent File & Project Box (Video Hub Style) */}
        <div className="p-3 border-t border-slate-800 bg-[#0A0C10] space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span className="font-bold flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ฝังไฟล์ในเครื่องอัตโนมัติ</span>
            </span>
            <span className="font-mono">{vaultProjects.length} โปรเจกต์</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                exportVaultJson();
                showToast("บันทึกไฟล์โปรเจกต์ทั้งหมด (.pkhub.json) ลงเครื่องแล้ว!", "success");
              }}
              className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>เซฟโปรเจกต์</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>โหลดโปรเจกต์</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.pkhub.json"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              disabled={syncing}
              onClick={async () => {
                setSyncing(true);
                const r = await syncToCloud();
                setSyncing(false);
                showToast(r.message, r.success ? "success" : "info");
              }}
              className="min-h-[34px] px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Cloud className="w-3 h-3" />
              <span>{syncing ? "กำลังซิงค์..." : "ซิงค์ขึ้น Cloud"}</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                const r = await pullFromCloud();
                showToast(r.message, r.success ? "success" : "info");
              }}
              className="min-h-[34px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Cloud className="w-3 h-3" />
              <span>ดึงงานเข้ามือถือ</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
