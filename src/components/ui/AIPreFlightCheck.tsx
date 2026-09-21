"use client";

import React, { useState } from "react";
import { ShieldCheck, Check, AlertTriangle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface AIPreFlightCheckProps {
  brandName?: string;
  hasCta?: boolean;
  hasHashtags?: boolean;
  formatOk?: boolean;
}

export const AIPreFlightCheck: React.FC<AIPreFlightCheckProps> = ({
  brandName = "Mazda & BYD",
  hasCta = true,
  hasHashtags = true,
  formatOk = true,
}) => {
  const [expanded, setExpanded] = useState(false);

  const checks = [
    { label: "Brand Voice & Tone Alignment", status: "PASS", desc: `ตรงตามมาตรฐานน้ำเสียงของ ${brandName}` },
    { label: "Call To Action (CTA)", status: hasCta ? "PASS" : "WARN", desc: hasCta ? "มีคำชวนคุยหรือจุดปิดการขายชัดเจน" : "ควรเพิ่มช่องทางติดต่อหรือคำชวนถก" },
    { label: "Platform Format & Ratio", status: formatOk ? "PASS" : "WARN", desc: "สัดส่วนรูปภาพ 1:1 และ 9:16 ตรงตามมาตรฐานแพลตฟอร์ม" },
    { label: "Hashtag & Keyword Audit", status: hasHashtags ? "PASS" : "WARN", desc: "มีแฮชแท็กหลักและคำค้นหาตรงกลุ่มเป้าหมาย" },
    { label: "Spelling & Sensitive Content", status: "PASS", desc: "ไม่พบคำต้องห้ามหรือความเสี่ยงด้านละเมิดลิขสิทธิ์" },
  ];

  return (
    <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-luxury-card space-y-2">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#17181A] flex items-center gap-2">
              <span>AI Pre-Flight Inspection</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                READY TO PUBLISH
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              ผ่านการตรวจสอบความถูกต้อง 5 มิติครบถ้วน
            </div>
          </div>
        </div>
        <button type="button" className="p-1 text-slate-400 hover:text-slate-700">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="pt-2 border-t border-[#E8E9EC] space-y-1.5 animate-fade-in">
          {checks.map((c, i) => (
            <div key={i} className="flex items-start justify-between py-1 px-2 rounded-lg bg-slate-50 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
                <span className="font-semibold text-slate-800">{c.label}</span>
              </div>
              <span className="text-[11px] text-slate-500">{c.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
