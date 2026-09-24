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

  // Grouped Navigation according to Section 10 of prompt:
  // OVERVIEW, CREATE (5-stage), MANAGE, GROW, SYSTEM
  const WORKFLOW_STAGES = [
    {
      stage: "01",
      label: "Ideas",
      sublabel: "คิดไอเดีย & หัวข้อ",
      href: "/ideas",
      icon: Lightbulb,
      activeColor: "text-amber-600 bg-amber-50 border-amber-200"
    },
    {
      stage: "02",
      label: "Content",
      sublabel: "สตูดิโอสื่อ & แคปชัน",
      href: "/content",
      icon: FileText,
      activeColor: "text-blue-600 bg-blue-50 border-blue-200"
    },
    {
      stage: "03",
      label: "Repurpose",
      sublabel: "ปรับแต่ง 5 สื่อ",
      href: "/repurpose",
      icon: Repeat,
      activeColor: "text-purple-600 bg-purple-50 border-purple-200"
    },
    {
      stage: "04",
      label: "Approval",
      sublabel: "ตรวจสอบ & ความปลอดภัย",
      href: "/approvals",
      icon: CheckSquare,
      activeColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
    },
    {
      stage: "05",
      label: "Publishing",
      sublabel: "ตารางออกอากาศ",
      href: "/publisher",
      icon: Send,
      activeColor: "text-rose-600 bg-rose-50 border-rose-200"
    }
  ];

  const PRODUCTION_STUDIO_ITEMS = [
    {
      label: "AI Video Studio",
      sublabel: "สร้างวิดีโออัตโนมัติ (Veo 3.1 & Flow)",
      href: "/studio",
      icon: Video,
      badge: "AUTO",
      activeColor: "text-blue-600 bg-blue-50 border-blue-200"
    },
    {
      label: "Commercial Studio",
      sublabel: "สร้างโฆษณาเสมือนจริง (Google Flow)",
      href: "/commercial",
      icon: Film,
      badge: "STUDIO",
      activeColor: "text-indigo-600 bg-indigo-50 border-indigo-200"
    }
  ];

  const MANAGE_ITEMS = [
    { label: "Calendar", href: "/publisher?tab=calendar", icon: Calendar },
    { label: "Prompts & Knowledge", href: "/knowledge", icon: BookOpen },
    { label: "Creative Briefs", href: "/creative", icon: Compass },
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
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700 px-2 mb-1">
              Overview
            </div>
            <Link
              href="/"
              onClick={onCloseMobile}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                pathname === "/"
                  ? "bg-[#17181A] text-white font-semibold shadow-luxury-sm"
                  : "text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-600" />
              <span>Dashboard (ภาพรวม)</span>
            </Link>
          </div>

          {/* CREATE — 5 GLOBAL WORKFLOW STAGES */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700">
                Create & Workflow
              </span>
              <span className="text-[9px] font-mono text-[#C9A96E] font-bold">STUDIO</span>
            </div>
            <div className="space-y-1">
              {WORKFLOW_STAGES.map((step) => {
                const Icon = step.icon;
                const isActive = pathname === step.href;
                return (
                  <Link
                    key={step.stage}
                    href={step.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isActive
                        ? step.activeColor + " font-bold shadow-luxury-sm"
                        : "border-transparent text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <div>
                        <div className="leading-tight font-semibold">{step.label}</div>
                        <div className="text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
                          {step.sublabel}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {step.stage}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* AI PRODUCTION & STUDIOS */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700">
                AI Studios & Tools
              </span>
              <span className="text-[9px] font-mono text-indigo-600 font-bold">VIRTUAL</span>
            </div>
            <div className="space-y-1">
              {PRODUCTION_STUDIO_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isActive
                        ? item.activeColor + " font-bold shadow-luxury-sm"
                        : "border-transparent text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0 text-indigo-600" />
                      <div>
                        <div className="leading-tight font-semibold text-[#17181A]">{item.label}</div>
                        <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                          {item.sublabel}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {item.badge}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* MANAGE */}
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700 px-2 mb-1">
              Manage & Assets
            </div>
            <div className="space-y-0.5">
              {MANAGE_ITEMS.map((item) => {
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
                        : "text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* GROW */}
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700 px-2 mb-1">
              Grow & Analytics
            </div>
            <Link
              href="/analytics"
              onClick={onCloseMobile}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                pathname === "/analytics"
                  ? "bg-slate-100 text-[#17181A] font-bold"
                  : "text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span className="font-semibold">Marketing Analytics</span>
            </Link>
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
