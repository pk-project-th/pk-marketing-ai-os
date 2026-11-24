"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Lightbulb,
  FileText,
  Repeat,
  CheckSquare,
  Calendar,
  Settings,
  BarChart3,
  Sparkles,
  ChevronDown,
  Globe,
  Film,
  BookOpen,
  X,
  ShoppingBag,
  Music,
  Subtitles,
  Download,
  Video,
  PlusCircle,
  Save,
  FolderOpen,
  Cloud,
  Layers
} from "lucide-react";
import { useBrand } from "@/context/BrandContext";
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
  const { activeBrand, setActiveBrand, brands } = useBrand();
  const {
    exportVaultJson,
    importVaultJson,
    syncToCloud,
    pullFromCloud,
    syncCode,
    customDepartments,
    vaultProjects
  } = useHub();
  const { showToast } = useToast();

  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const OS_BRAIN_ITEMS = [
    {
      id: "os-home",
      label: "หน้าหลัก OS (คิดสคริปต์กลาง)",
      sublabel: "คิดคอนเทนต์ · แยกฉาก · ส่งต่อทุกแผนก",
      href: "/",
      icon: LayoutDashboard,
      badge: "OS HUB",
      badgeColor: "bg-emerald-600 text-white border-emerald-700",
      activeColor: "text-emerald-900 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700"
    },
    {
      id: "easy",
      label: "Easy AI คิดไว 10 วิ",
      sublabel: "พิมพ์ 1 ช่อง → ได้สูตร + เสียงพากย์",
      href: "/easy",
      icon: Sparkles,
      badge: "FAST",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      activeColor: "text-emerald-800 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
    },
    {
      id: "ideas",
      label: "คลังไอเดีย & กลยุทธ์ 13 แบรนด์",
      sublabel: "วางแผนแคมเปญ & ซีรีส์คอนเทนต์",
      href: "/ideas",
      icon: Lightbulb,
      badge: "IDEAS",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      activeColor: "text-amber-800 bg-amber-50 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
    }
  ];

  const CORE_DEPARTMENTS_NAV = [
    {
      id: "affiliate",
      label: "คลิปขายของ & ปักตะกร้า",
      sublabel: "TikTok Shop · วิเคราะห์รูป · 72 สูตร",
      href: "/affiliate",
      icon: ShoppingBag,
      badge: "SHOP",
      badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
      activeColor: "text-orange-900 bg-orange-50 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
      iconColor: "text-orange-600"
    },
    {
      id: "short-film",
      label: "ทำหนังสั้น & ซีรีส์ AI",
      sublabel: "PKFLOW · ล็อกหน้าตัวละคร · 3 องก์",
      href: "/short-film",
      icon: Film,
      badge: "FILM",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      activeColor: "text-amber-900 bg-amber-50 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
      iconColor: "text-amber-600"
    },
    {
      id: "mv-studio",
      label: "ทำ MV เพลง & คาราโอเกะ",
      sublabel: "แตกฉากจากเพลง · ล็อกหน้านักร้อง",
      href: "/mv-studio",
      icon: Music,
      badge: "MV v5.1",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      activeColor: "text-purple-900 bg-purple-50 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
      iconColor: "text-purple-600"
    },
    {
      id: "subtitles",
      label: "ซับอัตโนมัติ & ตัดต่อไว",
      sublabel: "ถอดเสียงไทย · Safe-Zone 24 ตัว · 9:16",
      href: "/subtitles",
      icon: Subtitles,
      badge: "SUB PRO",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
      activeColor: "text-blue-900 bg-blue-50 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
      iconColor: "text-blue-600"
    },
    {
      id: "downloader",
      label: "โหลดคลิป & แปลงไฟล์สื่อ",
      sublabel: "YouTube/TikTok/FB/IG · แยก MP3",
      href: "/downloader",
      icon: Download,
      badge: "TOOLKIT",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
      activeColor: "text-teal-900 bg-teal-50 border-teal-300 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
      iconColor: "text-teal-600"
    },
    {
      id: "commercial",
      label: "โฆษณา Commercial & Flow",
      sublabel: "Topic Lock 100% · พากย์ไทย 6 เสียง",
      href: "/commercial",
      icon: Video,
      badge: "FLOW v16",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      activeColor: "text-emerald-900 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
      iconColor: "text-emerald-600"
    }
  ];

  const SKILLS_AND_GROWTH = [
    {
      label: "ศูนย์รวมสกิลผู้กำกับ AI (8+ สกิล)",
      sublabel: "ส่งมอบรถ · โชว์รูม · แบนเนอร์ · อินโฟกราฟิก",
      href: "/skills-hub",
      icon: Sparkles,
      color: "text-indigo-600",
      badge: "SKILLS"
    },
    {
      label: "แคปชัน & กราฟิกโซเชียล",
      sublabel: "AIDA / PAS Copywriting & อัลบั้มภาพ",
      href: "/content",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      label: "ดัดแปลง 5 แพลตฟอร์ม",
      sublabel: "FB, TikTok, IG, X, Lemon8",
      href: "/repurpose",
      icon: Repeat,
      color: "text-purple-600"
    },
    {
      label: "ปฏิทินโพสต์ & อนุมัติงาน",
      sublabel: "Content Calendar & Approvals",
      href: "/publisher",
      icon: Calendar,
      color: "text-rose-600"
    },
    {
      label: "คลังความรู้ & สถิติการตลาด",
      sublabel: "Knowledge Bible & Analytics",
      href: "/knowledge",
      icon: BookOpen,
      color: "text-amber-600"
    }
  ];

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importVaultJson(String(reader.result || ""));
      if (res.success) {
        showToast(`โหลดไฟล์โปรเจกต์สำเร็จ (${res.count} รายการ)!`, "success");
      } else {
        showToast(`โหลดไฟล์ไม่สำเร็จ: ${res.error}`, "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleQuickCloudSync = async () => {
    setSyncing(true);
    const res = await syncToCloud();
    setSyncing(false);
    showToast(res.message, res.success ? "success" : "info");
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#0D0F14] border-r border-[#E8E9EC] dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Hub Identity Header (Inspired by Video Hub Studio UI) */}
        <div className="p-3.5 border-b border-[#E8E9EC] dark:border-zinc-800 flex items-center justify-between">
          <Link href="/" onClick={onCloseMobile} className="flex items-center gap-2.5 group">
            <img
              src="/favicon.svg"
              alt="PK Creative Hub"
              className="w-9 h-9 rounded-xl shadow-luxury-sm group-hover:scale-105 transition-transform object-cover"
            />
            <div>
              <div className="font-extrabold text-sm text-[#17181A] dark:text-white tracking-tight leading-none flex items-center gap-1.5">
                <span>PK CREATIVE HUB</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  v3.0
                </span>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>6 Studios + AI OS Unified</span>
              </div>
            </div>
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
              aria-label="ปิดเมนู"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Global Brand Switcher */}
        <div className="px-3 py-2.5 border-b border-[#E8E9EC] dark:border-zinc-800 relative">
          <div className="flex items-center justify-between mb-1 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              แบรนด์ / ช่องที่ใช้ผลิต
            </span>
            <span className="text-[9px] font-mono text-slate-400">{brands.length} แบรนด์</span>
          </div>
          <button
            type="button"
            onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-[#F7F8FA] dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-[#E8E9EC] dark:border-zinc-800 rounded-xl text-xs font-semibold text-[#17181A] dark:text-zinc-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">
                {activeBrand === "ALL" ? "🌐 ทุกแบรนด์ / สินค้าทั่วไป" : activeBrand}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
          </button>

          {brandDropdownOpen && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white dark:bg-zinc-900 border border-[#E8E9EC] dark:border-zinc-700 rounded-xl shadow-luxury-lg z-50 p-1.5 max-h-64 overflow-y-auto custom-scrollbar animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setActiveBrand("ALL");
                  setBrandDropdownOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                  activeBrand === "ALL"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold"
                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                }`}
              >
                <span>🌐 ทุกแบรนด์ / สินค้าทั่วไป</span>
                {activeBrand === "ALL" && <span className="text-emerald-600 text-[10px]">✓</span>}
              </button>

              <div className="my-1 border-t border-[#E8E9EC] dark:border-zinc-800" />

              {brands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setActiveBrand(b.name);
                    setBrandDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between truncate ${
                    activeBrand === b.name
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold"
                      : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold shrink-0 ml-1">
                    {b.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Workspaces */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-3.5 custom-scrollbar">
          {/* 1. AI OS BRAIN */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                1 · สมองกลคิดสคริปต์ (OS Brain)
              </span>
            </div>
            <div className="space-y-1">
              {OS_BRAIN_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isActive
                        ? item.activeColor + " font-bold shadow-luxury-sm"
                        : "border-transparent text-slate-700 dark:text-zinc-300 hover:text-[#17181A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 text-emerald-600" />
                      <div className="min-w-0">
                        <div className="leading-tight font-semibold truncate">{item.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal leading-tight mt-0.5 truncate">
                          {item.sublabel}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ml-1 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 2. CORE PRODUCTION DEPARTMENTS (From the 6 Chats) */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                2 · แผนกผลิตสื่อ (6 Studios)
              </span>
              <span className="text-[9px] font-mono text-emerald-600 font-bold">WORKSPACES</span>
            </div>
            <div className="space-y-1">
              {CORE_DEPARTMENTS_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isActive
                        ? item.activeColor + " font-bold shadow-luxury-sm"
                        : "border-transparent text-slate-700 dark:text-zinc-300 hover:text-[#17181A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${item.iconColor}`} />
                      <div className="min-w-0">
                        <div className="leading-tight font-semibold truncate">{item.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal leading-tight mt-0.5 truncate">
                          {item.sublabel}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ml-1 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 3. SKILLS HUB & EXTENSIONS */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                3 · สกิลผู้กำกับ & ขยายอนาคต
              </span>
            </div>
            <div className="space-y-0.5">
              {SKILLS_AND_GROWTH.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href.split("?")[0];
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isActive
                        ? "bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-200 font-bold"
                        : "border-transparent text-slate-700 dark:text-zinc-300 hover:text-[#17181A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                      <div className="min-w-0">
                        <div className="leading-tight font-semibold truncate">{item.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal leading-tight mt-0.5 truncate">
                          {item.sublabel}
                        </div>
                      </div>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0 ml-1">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Custom Future Departments */}
              {customDepartments.map((cDept) => (
                <Link
                  key={cDept.id}
                  href={`/skills-hub?dept=${encodeURIComponent(cDept.id)}`}
                  onClick={onCloseMobile}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium border border-transparent text-slate-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-zinc-800 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Layers className="w-4 h-4 shrink-0 text-violet-600" />
                    <div className="min-w-0">
                      <div className="leading-tight font-semibold truncate">{cDept.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">{cDept.sublabel}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 font-bold">
                    {cDept.badge || "CUSTOM"}
                  </span>
                </Link>
              ))}

              {/* Add New Department Button */}
              <Link
                href="/skills-hub?tab=custom"
                onClick={onCloseMobile}
                className="mt-1 flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/80 border border-dashed border-emerald-300 dark:border-emerald-800 transition-colors"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>+ เพิ่มแผนก / โปรเจกต์ใหม่ในอนาคต</span>
              </Link>
            </div>
          </div>

          {/* 4. SYSTEM SETTINGS */}
          <div>
            <Link
              href="/settings"
              onClick={onCloseMobile}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                pathname === "/settings"
                  ? "bg-slate-100 dark:bg-zinc-800 text-[#17181A] dark:text-white font-bold"
                  : "text-slate-600 dark:text-zinc-400 hover:text-[#17181A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="font-semibold">ตั้งค่าระบบ & API Keys</span>
            </Link>
          </div>
        </nav>

        {/* Bottom Project Vault & Cloud Sync Bar (Inspired by Video Hub photo's bottom-left PROJECT box) */}
        <div className="p-3 border-t border-[#E8E9EC] dark:border-zinc-800 bg-[#F7F8FA] dark:bg-zinc-900/80 space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              PROJECT VAULT ({vaultProjects.length})
            </span>
            <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              {syncCode}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                exportVaultJson();
                showToast("บันทึกไฟล์โปรเจกต์ (.pkhub.json) ลงเครื่องเรียบร้อย!", "success");
              }}
              className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>บันทึก (.pkhub)</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>โหลด (.pkhub)</span>
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
              onClick={handleQuickCloudSync}
              className="min-h-[34px] px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <Cloud className="w-3 h-3 shrink-0" />
              <span>{syncing ? "กำลังซิงค์..." : "ส่งขึ้น Cloud"}</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                const res = await pullFromCloud();
                showToast(res.message, res.success ? "success" : "info");
              }}
              className="min-h-[34px] px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-zinc-700 text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Cloud className="w-3 h-3 shrink-0" />
              <span>ดึงงานเข้ามือถือ</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
