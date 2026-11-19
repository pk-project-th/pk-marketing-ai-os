"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Film,
  FileText,
  Settings
} from "lucide-react";

export const WorkspaceBottomNav: React.FC = () => {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: "หน้าหลัก", href: "/", icon: LayoutDashboard },
    { label: "สตูดิโอ", href: "/commercial", icon: Film },
    { label: "Easy AI", href: "/easy", icon: Sparkles, highlight: true },
    { label: "โพสต์ภาพ", href: "/content", icon: FileText },
    { label: "ตั้งค่า", href: "/settings", icon: Settings },
  ];

  return (
    <nav
      aria-label="เมนูหลักบนมือถือ"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 lg:hidden px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-[0_-4px_20px_-6px_rgba(15,23,42,0.08)]"
    >
      <div className="grid grid-cols-5 items-center gap-1 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[52px] rounded-xl transition-all select-none active:scale-95 ${
                isActive
                  ? "text-slate-900 font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {item.highlight ? (
                <div
                  className={`w-10 h-7 rounded-xl mb-1 flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 flex items-center justify-center mb-0.5">
                  <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                </div>
              )}
              <span className="text-[10px] leading-none font-semibold tracking-tight whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
