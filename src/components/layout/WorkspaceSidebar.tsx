"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Lightbulb,
  FileText,
  Repeat,
  CheckSquare,
  Send,
  Settings,
  BarChart3,
  Calendar,
  Sparkles,
  ChevronDown,
  Globe,
  Film,
  Compass,
  BookOpen,
  X,
  Layers,
  Zap,
  Video
} from "lucide-react";
import { useBrand } from "@/context/BrandContext";

interface WorkspaceSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenCommandBar?: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  onOpenCommandBar
}) => {
  const pathname = usePathname();
  const { activeBrand, setActiveBrand, brands } = useBrand();
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  // Redesigned Frictionless Workflow Architecture
  const CORE_PRODUCTION_ITEMS = [
    {
      id: "ideas",
      label: "Ideas & Strategy",
      sublabel: "คิดไอเดีย & กลยุทธ์แคมเปญ",
      href: "/ideas",
      icon: Lightbulb,
      badge: "01",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      activeColor: "text-amber-700 bg-amber-50/80 border-amber-200"
    },
    {
      id: "commercial",
      label: "Commercial Video Studio",
      sublabel: "วิดีโอโฆษณา + เสียงพากย์ AI + Flow",
      href: "/commercial",
      icon: Film,
      badge: "02 PRO",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
      activeColor: "text-emerald-800 bg-emerald-50/90 border-emerald-300"
    },
    {
      id: "content",
      label: "Social Copy & Posts",
      sublabel: "สตูดิโอแคปชัน & ภาพกราฟิกโซเชียล",
      href: "/content",
      icon: FileText,
      badge: "03",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      activeColor: "text-blue-700 bg-blue-50/80 border-blue-200"
    },
    {
      id: "repurpose",
      label: "Multi-Platform Repurpose",
      sublabel: "ดัดแปลงฟอร์แมต 5 แพลตฟอร์ม",
      href: "/repurpose",
      icon: Repeat,
      badge: "04",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      activeColor: "text-purple-700 bg-purple-50/80 border-purple-200"
    }
  ];

  const PUBLISH_AND_OPS = [
    {
      label: "Review & Approvals",
      sublabel: "ตรวจความถูกต้อง & กฎความปลอดภัย",
      href: "/approvals",
      icon: CheckSquare,
      activeColor: "text-emerald-700 bg-emerald-50 border-emerald-200"
    },
    {
      label: "Publishing & Calendar",
      sublabel: "ปฏิทินคอนเทนต์ & คิวออกอากาศ",
      href: "/publisher",
      icon: Calendar,
      activeColor: "text-rose-700 bg-rose-50 border-rose-200"
    }
  ];

  const ASSETS_AND_GROWTH = [
    { label: "Performance Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Prompts & Knowledge Bible", href: "/knowledge", icon: BookOpen },
    { label: "Creative Briefs & Positioning", href: "/creative", icon: Compass },
    { label: "Automated Veo Runner", href: "/studio", icon: Video }
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-[#E8E9EC] flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#E8E9EC] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/favicon.svg"
              alt="PK Marketing OS"
              className="w-8 h-8 rounded-xl shadow-luxury-sm group-hover:scale-105 transition-transform object-cover"
            />
            <div>
              <div className="font-extrabold text-sm text-[#17181A] tracking-tight leading-none">
                MARKETING OS
              </div>
              <div className="text-[10px] text-slate-600 font-semibold tracking-wide mt-0.5">
                Command Center v2.1
              </div>
            </div>
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Global Brand Switcher */}
        <div className="p-3 border-b border-[#E8E9EC] relative">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1 px-1">
            Workspace
          </div>
          <button
            type="button"
            onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-[#F7F8FA] hover:bg-slate-100 border border-[#E8E9EC] rounded-xl text-xs font-semibold text-[#17181A] transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <Globe className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
              <span className="truncate">
                {activeBrand === "ALL" ? "🌐 All Brands (13 แบรนด์)" : activeBrand}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
          </button>

          {/* Brand Switcher Dropdown */}
          {brandDropdownOpen && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-[#E8E9EC] rounded-xl shadow-luxury-lg z-50 p-1.5 max-h-64 overflow-y-auto custom-scrollbar animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setActiveBrand("ALL");
                  setBrandDropdownOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                  activeBrand === "ALL" ? "bg-slate-100 text-[#17181A] font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>🌐 All Brands (แสดงภาพรวมทั้งหมด)</span>
                {activeBrand === "ALL" && <span className="text-[#C9A96E] text-[10px]">✓</span>}
              </button>

              <div className="my-1 border-t border-[#E8E9EC]" />

              {brands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setActiveBrand(b.name);
                    setBrandDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between truncate ${
                    activeBrand === b.name ? "bg-slate-100 text-[#17181A] font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold shrink-0 ml-1">
                    {b.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* OVERVIEW */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Command Center
            </div>
            <Link
              href="/"
              onClick={onCloseMobile}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                pathname === "/"
                  ? "bg-[#17181A] text-white shadow-luxury-sm"
                  : "text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              <span>Dashboard (ภาพรวมระบบ)</span>
            </Link>
          </div>

          {/* 1. CREATIVE & PRODUCTION */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Creative Production
              </span>
              <span className="text-[9px] font-mono text-[#C9A96E] font-bold tracking-wider">STUDIOS</span>
            </div>
            <div className="space-y-1">
              {CORE_PRODUCTION_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isCommercial = item.id === "commercial";
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isActive
                        ? item.activeColor + " font-bold shadow-luxury-sm"
                        : isCommercial
                        ? "border-emerald-200/70 bg-gradient-to-r from-emerald-50/40 to-transparent text-slate-800 hover:bg-emerald-50/80 hover:border-emerald-300"
                        : "border-transparent text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isCommercial ? "text-emerald-600" : ""}`} />
                      <div>
                        <div className="leading-tight font-semibold flex items-center gap-1.5">
                          <span>{item.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                          {item.sublabel}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 2. PUBLISH & OPERATIONS */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-1.5">
              Publish & Operations
            </div>
            <div className="space-y-1">
              {PUBLISH_AND_OPS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isActive
                        ? item.activeColor + " font-bold shadow-luxury-sm"
                        : "border-transparent text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="leading-tight font-semibold">{item.label}</div>
                      <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                        {item.sublabel}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 3. INTELLIGENCE & ASSETS */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-1">
              Intelligence & Assets
            </div>
            <div className="space-y-0.5">
              {ASSETS_AND_GROWTH.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href.split("?")[0];
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 text-[#17181A] font-bold"
                        : "text-slate-600 hover:text-[#17181A] hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-xs">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* SYSTEM */}
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700 px-2 mb-1">
              System
            </div>
            <Link
              href="/settings"
              onClick={onCloseMobile}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                pathname === "/settings"
                  ? "bg-slate-100 text-[#17181A] font-bold"
                  : "text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
              }`}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="font-semibold">Settings & API Keys</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
};
