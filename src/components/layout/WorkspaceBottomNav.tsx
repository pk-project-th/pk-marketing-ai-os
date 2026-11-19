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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden px-1 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center justify-around shadow-lg">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all flex-1 select-none active:scale-95 min-h-[44px] ${
              isActive
                ? "text-slate-900 font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {item.highlight ? (
              <div className={`p-2 rounded-xl mb-0.5 transition-all ${
                isActive 
                  ? "bg-emerald-600 text-white shadow-sm" 
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
            ) : (
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
            )}
            <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
