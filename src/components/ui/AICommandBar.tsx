"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, X, Lightbulb, FileText, Repeat, CheckSquare, Send, Search, Film } from "lucide-react";
import { useBrand } from "@/context/BrandContext";

interface AICommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICommandBar: React.FC<AICommandBarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { activeBrand, setActiveBrand, brands } = useBrand();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRunCommand = (targetHref: string, promptPreset?: string) => {
    onClose();
    if (promptPreset) {
      router.push(`${targetHref}?prompt=${encodeURIComponent(promptPreset)}`);
    } else {
      router.push(targetHref);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
    >
      <div 
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="พิมพ์สิ่งที่อยากทำคอนเทนต์แล้วกด Enter (เช่น เที่ยววัด, รีวิวคาเฟ่, มีมแมวบ่นงาน)..."
            className="flex-1 text-sm text-slate-900 placeholder-slate-400 bg-transparent outline-none"
            onKeyDown={e => {
              if (e.key === "Enter" && query.trim()) {
                handleRunCommand(`/easy?prompt=${encodeURIComponent(query.trim())}&autoRun=true`);
              }
            }}
          />
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
            ESC
          </span>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Brand Context Indicator */}
        <div className="px-4 py-2 bg-[#F7F8FA] border-b border-[#E8E9EC] flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span>บริบทแบรนด์ปัจจุบัน:</span>
            <strong className="text-[#17181A] font-semibold">
              {activeBrand === "ALL" ? "🌐 ทุกแบรนด์ (All Brands)" : activeBrand}
            </strong>
          </div>
          <span className="text-[11px] text-[#C9A96E] font-medium">PK Marketing AI OS v2.1</span>
        </div>

        {/* Suggested Quick Workflows */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
            เวิร์กโฟลว์ยอดนิยม (Quick Actions)
          </div>

          {[
            {
              title: "⚡ Easy Content Creator (แนะนำสำหรับทำคนเดียว)",
              desc: "พิมพ์ภาษาคนช่องเดียว → ได้ Hook 3 วิ + Prompt วางใน Google Flow + เสียงพากย์",
              href: "/easy",
              icon: Sparkles,
              color: "text-emerald-600",
              badge: "FAST AI"
            },
            {
              title: "01 · คิดไอเดียคอนเทนต์ใหม่ 5 ตอน",
              desc: "AI วิเคราะห์เทรนด์และวางแผนหัวข้อตามบรีฟแบรนด์",
              href: "/ideas",
              icon: Lightbulb,
              color: "text-amber-600",
              badge: "01 IDEA"
            },
            {
              title: "02 · Commercial Video Studio (Google Flow + เสียงพากย์)",
              desc: "สร้าง Storyboard หลายฉาก สคริปต์พากย์ไทย ElevenLabs และ Prompt",
              href: "/commercial",
              icon: Film,
              color: "text-emerald-600",
              badge: "02 VIDEO"
            },
            {
              title: "03 · สตูดิโอแคปชัน & ภาพกราฟิกโซเชียล",
              desc: "สร้างภาพถ่ายสมจริงและอัลบั้มภาพสไลด์ 3-5 รูป",
              href: "/content",
              icon: FileText,
              color: "text-blue-600",
              badge: "03 POST"
            },
            {
              title: "04 · ดัดแปลง 1 คอนเทนต์ลง 5 แพลตฟอร์ม",
              desc: "ปรับแคปชันให้เข้ากับ Facebook, IG, TikTok, X, Lemon8",
              href: "/repurpose",
              icon: Repeat,
              color: "text-slate-600",
              badge: "03 ADAPT"
            },
            {
              title: "STAGE 04 · ตรวจสอบ & อนุมัติคิวโพสต์",
              desc: "Human-in-the-loop Gate เพื่อความปลอดภัยก่อนเผยแพร่",
              href: "/approvals",
              icon: CheckSquare,
              color: "text-emerald-500",
              badge: "04 APPROVE"
            },
            {
              title: "STAGE 05 · Publishing Center (ตารางออกอากาศ)",
              desc: "จัดการคิวโพสต์และตั้งเวลาตาม Golden Hours",
              href: "/publisher",
              icon: Send,
              color: "text-rose-500",
              badge: "05 PUBLISH"
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleRunCommand(item.href)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-white border border-slate-200/60 shadow-sm">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#17181A] group-hover:text-[#C9A96E] transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500">{item.desc}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-[#E8E9EC] flex items-center justify-between text-[11px] text-slate-500">
          <span>กด Enter เพื่อสั่งการ | ⌘K เปิดคำสั่งด่วน</span>
          <span className="text-emerald-600 font-medium">● AI Engine Ready</span>
        </div>
      </div>
    </div>
  );
};
