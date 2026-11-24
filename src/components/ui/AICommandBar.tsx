"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  ShoppingBag,
  Film,
  Music,
  Subtitles,
  Download,
  Video,
  Wand2,
  LayoutDashboard
} from "lucide-react";
import { useBrand } from "@/context/BrandContext";

interface AICommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICommandBar: React.FC<AICommandBarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { activeBrand } = useBrand();
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

  const handleRunCommand = (targetHref: string) => {
    onClose();
    router.push(targetHref);
  };

  const HUB_ITEMS = [
    {
      title: "🏠 หน้าหลัก OS & คิดสคริปต์กลาง (AI Content OS)",
      desc: "คิดคอนเทนต์ เขียนสคริปต์ แยกฉาก แล้วกดส่งต่อไปทุกแผนกในคลิกเดียว",
      href: "/",
      icon: LayoutDashboard,
      color: "text-emerald-600",
      badge: "OS BRAIN"
    },
    {
      title: "🛒 แผนกทำคลิปขายของ & ปักตะกร้า (Affiliate & ShortClips)",
      desc: "สูตร 5-Shot ปิดการขาย · วิเคราะห์รูปสินค้า · คลัง 72 สูตรลับ",
      href: "/affiliate",
      icon: ShoppingBag,
      color: "text-orange-600",
      badge: "SHOP"
    },
    {
      title: "🎬 แผนกทำหนังสั้น & ซีรีส์ AI (PKFLOW Pro Film)",
      desc: "วางโครงเรื่อง 3 องก์ · ล็อกหน้าตาและชุดตัวละคร · มุมกล้อง FlowKit",
      href: "/short-film",
      icon: Film,
      color: "text-amber-600",
      badge: "FILM"
    },
    {
      title: "🎵 แผนกทำ MV เพลง & ซิงค์เนื้อร้อง (MV Creator v5.1)",
      desc: "แตกฉากจากเนื้อเพลง · Character Sheet นักร้อง · เคาะจังหวะซับคาราโอเกะ",
      href: "/mv-studio",
      icon: Music,
      color: "text-purple-600",
      badge: "MV v5.1"
    },
    {
      title: "💬 แผนกซับอัตโนมัติ & ตัดต่อไว (Auto Edit Kit Pro)",
      desc: "ถอดเสียง Groq/ElevenLabs · กันคำตกหล่น ≤24 ตัว · จอ Titanium 9:16",
      href: "/subtitles",
      icon: Subtitles,
      color: "text-blue-600",
      badge: "SUB PRO"
    },
    {
      title: "📥 แผนกโหลดคลิป & แปลงไฟล์สื่อ (PK Media Toolkit)",
      desc: "โหลด YouTube/TikTok/FB/IG · แยกเสียง .WAV ในเบราว์เซอร์ส่งทำซับ/MV",
      href: "/downloader",
      icon: Download,
      color: "text-teal-600",
      badge: "TOOLKIT"
    },
    {
      title: "🎥 แผนกโฆษณา Commercial & เสียง AI (Google Flow)",
      desc: "Universal Topic Lock 100% · พากย์ไทย ElevenLabs รายฉาก",
      href: "/commercial",
      icon: Video,
      color: "text-emerald-700",
      badge: "FLOW v16"
    },
    {
      title: "⚡ แผนกสกิลผู้กำกับ AI พิเศษ & เพิ่มแผนกใหม่ในอนาคต",
      desc: "ส่งมอบรถป้ายแดง 4 องก์ · รีวิวโชว์รูม 6 จังหวะ · แบนเนอร์ AIDA · +เพิ่มแผนก",
      href: "/skills-hub",
      icon: Wand2,
      color: "text-indigo-600",
      badge: "8+ SKILLS"
    }
  ].filter(
    (item) =>
      !query.trim() ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-zinc-800">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาแผนกใน HUB หรือพิมพ์ไอเดียแล้วกด Enter..."
            className="flex-1 text-sm text-slate-900 dark:text-white placeholder-slate-400 bg-transparent outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                handleRunCommand(`/easy?prompt=${encodeURIComponent(query.trim())}&autoRun=true`);
              }
            }}
          />
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 border border-slate-200 dark:border-zinc-700">
            ESC
          </span>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-2 bg-[#F7F8FA] dark:bg-zinc-800/80 border-b border-[#E8E9EC] dark:border-zinc-800 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300">
          <div>
            แบรนด์ปัจจุบัน: <strong>{activeBrand === "ALL" ? "🌐 ทุกแบรนด์" : activeBrand}</strong>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">PK CREATIVE HUB v3.0</span>
        </div>

        <div className="p-3 max-h-80 overflow-y-auto space-y-1 custom-scrollbar">
          {HUB_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleRunCommand(item.href)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                      {item.desc}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shrink-0 ml-2">
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
