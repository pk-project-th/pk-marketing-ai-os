"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Lightbulb,
  FileText,
  Repeat,
  CheckSquare,
  BarChart3
} from "lucide-react";

const BOTTOM_NAV_ITEMS = [
  { label: "ไอเดีย", href: "/ideas", icon: Lightbulb, activeColor: "text-amber-400" },
  { label: "คอนเทนต์", href: "/content", icon: FileText, activeColor: "text-blue-400" },
  { label: "ปรับสื่อ", href: "/repurpose", icon: Repeat, activeColor: "text-purple-400" },
  { label: "อนุมัติ", href: "/approvals", icon: CheckSquare, activeColor: "text-emerald-400" },
  { label: "สถิติ", href: "/analytics", icon: BarChart3, activeColor: "text-rose-400" }
];

export const AppBottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 lg:hidden px-1 py-1.5 flex items-center justify-around">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all flex-1 ${
              isActive
                ? "bg-slate-800/80 " + item.activeColor
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? item.activeColor : "text-slate-400"}`} />
            <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
