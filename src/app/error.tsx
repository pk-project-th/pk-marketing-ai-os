"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[65vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            ระบบตรวจพบข้อผิดพลาดชั่วคราว
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            ไม่ต้องกังวลครับ ข้อมูลของคุณยังปลอดภัย กดปุ่มลองใหม่เพื่อให้ระบบรีเซ็ตหน้านี้ให้อัตโนมัติ
          </p>
        </div>
        {error?.message && (
          <div className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3 text-left break-words max-h-24 overflow-y-auto">
            {error.message}
          </div>
        )}
        <div className="flex items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>โหลดหน้านี้ใหม่</span>
          </button>
          <Link
            href="/easy"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>ไปหน้า Easy Creator</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
