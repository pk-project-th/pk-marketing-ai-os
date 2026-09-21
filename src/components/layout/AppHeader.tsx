"use client";

import React from "react";
import Link from "next/link";
import { Menu, Search, Bell, Sparkles, ShieldCheck } from "lucide-react";

interface AppHeaderProps {
  onOpenMobile?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenMobile }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 h-16 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">ระบบปฏิบัติการการตลาด:</span>
          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
            13 แบรนด์ & 5 แพลตฟอร์ม
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://de.aipass.net"
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-950/80 hover:bg-violet-900 border border-violet-700/50 text-violet-300 text-xs font-medium transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>AiPASS Creator Tier: 10,000 เครดิต/วัน</span>
        </a>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
            PK
          </div>
          <div className="hidden sm:block text-left text-xs">
            <div className="text-white font-semibold leading-tight">Creator</div>
            <div className="text-[10px] text-emerald-400 leading-tight">● ออนไลน์</div>
          </div>
        </div>
      </div>
    </header>
  );
};
