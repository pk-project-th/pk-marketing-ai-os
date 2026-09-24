"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Lightbulb,
  Image as ImageIcon,
  Repeat,
  CheckSquare,
  Send,
  Settings,
  Car,
  ShieldCheck,
  Zap,
  BarChart3,
  Sparkles,
  Film,
  X
} from "lucide-react";

const CORE_STEPS = [
  {
    step: "01",
    label: "1. สั่ง AI คิดไอเดีย",
    sublabel: "กรอกบรีฟ ➔ ซีรีส์เนื้อหา / เดี่ยว",
    href: "/ideas",
    icon: Lightbulb,
    color: "text-amber-400",
    bgActive: "bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold"
  },
  {
    step: "02",
    label: "2. สตูดิโอสื่อ & อัลบั้ม",
    sublabel: "Imagen 3 / Flux / Blueprint",
    href: "/content",
    icon: ImageIcon,
    color: "text-blue-400",
    bgActive: "bg-blue-500/15 border-blue-500/40 text-blue-300 font-bold"
  },
  {
    step: "03",
    label: "3. ดัดแปลง 5 แพลตฟอร์ม",
    sublabel: "FB, TikTok, IG, X, Lemon8",
    href: "/repurpose",
    icon: Repeat,
    color: "text-purple-400",
    bgActive: "bg-purple-500/15 border-purple-500/40 text-purple-300 font-bold"
  },
  {
    step: "04",
    label: "4. ตรวจสอบ & คิวโพสต์",
    sublabel: "Human-in-the-Loop Gate",
    href: "/approvals",
    icon: CheckSquare,
    color: "text-emerald-400",
    bgActive: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
  },
  {
    step: "05",
    label: "5. ตารางโพสต์ & ออกอากาศ",
    sublabel: "Golden Hours & เครดิต AiPASS",
    href: "/publisher",
    icon: Send,
    color: "text-rose-400",
    bgActive: "bg-rose-500/15 border-rose-500/40 text-rose-300 font-bold"
  }
];

const UTILITY_ITEMS = [
  { label: "Dashboard (ภาพรวม 13 แบรนด์)", href: "/", icon: LayoutDashboard },
  { label: "AI Video Studio (Veo 3.1 & Flow)", href: "/studio", icon: Film },
  { label: "Marketing Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings & API Keys", href: "/settings", icon: Settings }
];

interface AppSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>PK Marketing AI</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 font-mono px-1.5 py-0.5 rounded border border-blue-500/30">v2.1</span>
              </div>
              <p className="text-xs text-slate-400">13 Brands Command Center</p>
            </div>
          </Link>
          {onCloseMobile && (
            <button onClick={onCloseMobile} className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 5 Sequential Steps */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>ลำดับการทำงาน 5 ขั้นตอน</span>
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1.5 custom-scrollbar">
          {CORE_STEPS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs border transition-all ${
                  isActive
                    ? item.bgActive + " shadow-sm shadow-blue-500/10"
                    : "border-transparent text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isActive ? "bg-white/10" : "bg-slate-800/80"}`}>
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : item.color}`} />
                  </div>
                  <div>
                    <div className="text-white text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{item.sublabel}</div>
                  </div>
                </div>

                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive ? "bg-white/20 text-white font-bold" : "bg-slate-800 text-slate-400"
                }`}>
                  {item.step}
                </span>
              </Link>
            );
          })}

          <div className="pt-4 pb-1 px-1">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              เมนูเสริม & ตั้งค่า
            </span>
          </div>

          {UTILITY_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Pro Plan Card matching user's media_1788927171003.png */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E9D5FF] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
              </div>
              <span className="text-sm font-bold text-slate-800">Pro Plan</span>
            </div>
            
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#10B981] via-[#F59E0B] to-[#EF4444] h-full w-3/4 rounded-full"></div>
            </div>

            <p className="text-xs text-slate-500 font-medium">ใช้งาน AI ไปแล้ว 75%</p>
          </div>
        </div>
      </aside>
    </>
  );
};
