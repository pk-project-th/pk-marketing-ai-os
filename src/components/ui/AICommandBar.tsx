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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white border border-[#E8E9EC] rounded-2xl shadow-luxury-lg overflow-hidden animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E8E9EC]">
          <Sparkles className="w-5 h-5 text-[#8B7CF6] shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="✦ วันนี้อยากให้ AI ช่วยทำอะไร? (เช่น สร้างแคมเปญ, เขียนแคปชัน, ตรวจคิวโพสต์)..."
            className="flex-1 text-sm text-[#17181A] placeholder-[#9CA3AF] bg-transparent outline-none"
            onKeyDown={e => {
              if (e.key === "Enter" && query.trim()) {
                handleRunCommand(`/ideas?brand=${encodeURIComponent(activeBrand === "ALL" ? "Mazda & BYD" : activeBrand)}&prompt=${encodeURIComponent(query)}`);
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
              title: "STAGE 01 · คิดไอเดียคอนเทนต์ใหม่ 5 ตอน",
              desc: "AI วิเคราะห์เทรนด์และวางแผนหัวข้อตามบรีฟทันที",
              href: "/ideas",
              icon: Lightbulb,
              color: "text-amber-500",
              badge: "01 IDEA"
            },
            {
              title: "STAGE 02 · สตูดิโอสื่อ & เจนภาพ AI",
              desc: "สร้างภาพถ่ายสมจริงด้วย Imagen 3 / Flux Engine",
              href: "/content",
              icon: FileText,
              color: "text-blue-500",
              badge: "02 CREATE"
            },
            {
              title: "COMMERCIAL · สตูดิโอสร้างโฆษณา & วิดีโอเสมือนจริง (Google Flow)",
              desc: "สร้าง Storyboard 6 ฉาก สคริปต์พากย์ไทย ส่งต่อ Google Flow Tool",
              href: "/commercial",
              icon: Film,
              color: "text-indigo-500",
              badge: "AI ADS"
            },
            {
              title: "STAGE 03 · ดัดแปลง 1 คอนเทนต์ลง 5 แพลตฟอร์ม",
              desc: "ปรับแคปชันให้เข้ากับ Facebook, IG, TikTok, X, Lemon8",
              href: "/repurpose",
              icon: Repeat,
              color: "text-purple-500",
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
