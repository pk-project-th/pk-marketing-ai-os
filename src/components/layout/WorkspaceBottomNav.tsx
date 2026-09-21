"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Lightbulb,
  Film,
  FileText,
  Settings
} from "lucide-react";

export const WorkspaceBottomNav: React.FC = () => {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: "Home", href: "/", icon: LayoutDashboard },
    { label: "Ideas", href: "/ideas", icon: Lightbulb },
    { label: "Studio", href: "/commercial", icon: Film, highlight: true },
    { label: "Create", href: "/content", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E9EC] lg:hidden px-1 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center justify-around shadow-luxury-lg">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all flex-1 select-none active:scale-95 ${
              isActive
                ? "text-[#17181A] font-bold"
                : "text-slate-600 hover:text-[#17181A]"
            }`}
          >
            {item.highlight ? (
              <div className={`p-1.5 rounded-xl mb-0.5 transition-all ${
                isActive 
                  ? "bg-gradient-to-tr from-amber-500 to-amber-300 text-white shadow-sm" 
                  : "bg-slate-100 text-slate-700"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
            ) : (
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-[#C9A96E]" : "text-slate-500"}`} />
            )}
            <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
