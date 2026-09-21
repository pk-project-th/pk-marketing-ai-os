"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Lightbulb,
  FileText,
  Repeat,
  CheckSquare,
  Send,
  ArrowRight,
  Clock,
  Car,
  ShoppingBag,
  Tv,
  BookOpen,
  UtensilsCrossed,
  Trophy,
  User,
  Compass,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Globe,
  Sliders,
  Calendar,
  Layers,
  Film
} from "lucide-react";
import { useBrand, ALL_BRANDS, BrandItem } from "@/context/BrandContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ContentIdea, ApprovalItem } from "@/types";

export default function DashboardPage() {
  const { activeBrand, setActiveBrand, campaignName } = useBrand();
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    async function loadData() {
      try {
        const [ideasRes, queueRes] = await Promise.all([
          fetch("/api/ai/ideas").then((r) => r.json()),
          fetch("/api/approvals").then((r) => r.json())
        ]);
        if (ideasRes.ideas) setIdeas(ideasRes.ideas);
        if (queueRes.approvals) setApprovals(queueRes.approvals);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter ideas and approvals based on activeBrand if not "ALL"
  const filteredIdeas = activeBrand === "ALL" 
    ? ideas 
    : ideas.filter(i => (i.brand_name || "").toLowerCase().includes(activeBrand.toLowerCase()) || activeBrand.toLowerCase().includes((i.brand_name || "").toLowerCase()));

  const filteredApprovals = activeBrand === "ALL"
    ? approvals
    : approvals.filter(a => (a.brand_name || "").toLowerCase().includes(activeBrand.toLowerCase()));

  // Stats calculation
  const totalIdeasCount = filteredIdeas.length;
  const scheduledCount = filteredApprovals.filter(a => a.status === "SCHEDULED" || a.publish_mode === "AUTO").length;
  const publishedCount = filteredApprovals.filter(a => a.status === "EXECUTED" || a.status === "APPROVED").length;
  const needsReviewCount = filteredApprovals.filter(a => a.status === "HUMAN_REVIEW" || a.status === "DRAFT" || !a.status).length;

  // Filter brands list
  const displayedBrands = ALL_BRANDS.filter(b => {
    if (categoryFilter !== "all" && b.category !== categoryFilter) return false;
    if (activeBrand !== "ALL" && b.name !== activeBrand) return false;
    return true;
  });

  const getBrandIcon = (category: string) => {
    switch (category) {
      case "auto": return Car;
      case "shop": return ShoppingBag;
      case "content": return BookOpen;
      case "personal": return User;
      default: return Sparkles;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Command Center Hero Banner */}
      <div className="bg-white border border-[#E8E9EC] rounded-[20px] p-6 md:p-8 shadow-luxury-card relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold">
                <Sparkles className="w-3 h-3 text-[#A2834E]" />
                <span>AI MARKETING COMMAND CENTER</span>
              </Badge>
              <span className="text-xs text-slate-700 font-medium">
                {activeBrand === "ALL" ? "โหมด: รวม 13 แบรนด์" : `แบรนด์: ${activeBrand}`}
              </span>
              <span className="text-xs text-[#A2834E] font-semibold">· {campaignName}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-[#17181A] tracking-tight leading-tight">
              บริหารการตลาดทุกแบรนด์ในระบบเดียว
            </h1>
            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
              ครอบคลุมครบวงจรตั้งแต่คิดไอเดีย ➔ ผลิตสื่อและภาพ AI ➔ ดัดแปลง 5 แพลตฟอร์ม ➔ ตรวจสอบความถูกต้อง ➔ เผยแพร่ตามเวลาทองคำ (Golden Hours)
            </p>

            {/* Global Workflow Step Shortcuts */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Link href="/ideas">
                <Button variant="primary" size="sm" icon={Lightbulb}>
                  01 · คิดไอเดีย
                </Button>
              </Link>
              <Link href="/commercial">
                <Button variant="outline" size="sm" icon={Film} className="border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-900 font-bold">
                  🎬 สตูดิโอโฆษณา
                </Button>
              </Link>
              <Link href="/content">
                <Button variant="outline" size="sm" icon={FileText}>
                  02 · ทำสื่อ AI
                </Button>
              </Link>
              <Link href="/publisher">
                <Button variant="outline" size="sm" icon={Send}>
                  05 · ตารางออกอากาศ
                </Button>
              </Link>
            </div>
          </div>

          {/* Workflow Loop Visual */}
          <div className="hidden lg:flex flex-col gap-2 p-4 rounded-2xl bg-[#F7F8FA] border border-[#E8E9EC] min-w-[260px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Core Marketing Loop
            </div>
            {[
              { stage: "01", name: "Idea", sub: "Trend & Hook" },
              { stage: "02", name: "Create", sub: "Flux / Imagen 3" },
              { stage: "03", name: "Adapt", sub: "5 Social Platforms" },
              { stage: "04", name: "Approve", sub: "Human-in-the-Loop" },
              { stage: "05", name: "Publish", sub: "Golden Hours" },
            ].map((s, idx) => (
              <div key={s.stage} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] font-mono flex items-center justify-center font-bold">
                    {s.stage}
                  </span>
                  <span className="font-semibold text-slate-900">{s.name}</span>
                </div>
                <span className="text-[10px] text-slate-600 font-medium">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Vitrines (Section 16 of prompt) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-luxury-card flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-700">Scheduled (ตั้งเวลาโพสต์)</div>
            <div className="text-2xl font-black text-[#17181A] mt-1">
              {scheduledCount > 0 ? scheduledCount : "—"}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">รอส่งตาม Golden Hours</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#8B7CF6] flex items-center justify-center border border-purple-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-luxury-card flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-700">Published (เผยแพร่แล้ว)</div>
            <div className="text-2xl font-black text-[#17181A] mt-1">
              {publishedCount > 0 ? publishedCount : "—"}
            </div>
            <div className="text-[11px] text-slate-600 font-medium mt-0.5">เก็บบันทึกประวัติ & สถิติ</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#3FA77A] flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-luxury-card flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-700">Needs Review (รอตรวจสอบ)</div>
            <div className="text-2xl font-black text-[#17181A] mt-1">
              {needsReviewCount > 0 ? needsReviewCount : "—"}
            </div>
            <div className="text-[11px] text-amber-800 font-medium mt-0.5">Human-in-the-Loop Gate</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#A2834E] flex items-center justify-center border border-amber-100">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-luxury-card flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-700">Ideas in Bank (คลังไอเดีย)</div>
            <div className="text-2xl font-black text-[#17181A] mt-1">{totalIdeasCount}</div>
            <div className="text-[11px] text-blue-700 font-medium mt-0.5">พร้อมแปลงเป็นสื่อ</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Lightbulb className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. AI Marketing Insights (Section 22 of prompt) */}
      <div className="bg-white border border-[#E8E9EC] rounded-2xl p-5 shadow-luxury-card space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-[#A2834E] flex items-center justify-center border border-amber-200/50">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-[#17181A] uppercase tracking-wider">
              💡 AI Marketing Insight & Intelligence Loop
            </span>
          </div>
          <Badge variant="gold">แนะนำสัปดาห์นี้</Badge>
        </div>
        <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal">
          คอนเทนต์ประเภท <strong className="text-slate-900 font-bold">สาระ How-to และอัลบั้ม 4 รูป (Before/After)</strong> สำหรับแบรนด์ยานยนต์และร้านค้า มีอัตราการคลิกดูและการทักแชตสูงกว่าค่าเฉลี่ย <strong className="text-emerald-700 font-bold">34%</strong> แนะนำให้สร้างเนื้อหาต่อยอดในหมวดนี้เพิ่ม 5 ตอน
        </p>
        <div className="pt-1 flex items-center gap-3">
          <Link href="/ideas?brand=Mazda%20%26%20BYD">
            <span className="text-xs font-bold text-[#A2834E] hover:underline inline-flex items-center gap-1">
              สร้างซีรีส์แนะนำสำหรับ Mazda & BYD <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* 4. 13 Brands Management Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#17181A] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C9A96E]" />
              <span>แบรนด์ที่ดูแลในระบบ ({displayedBrands.length} แบรนด์)</span>
            </h2>
            <p className="text-xs text-slate-700 font-medium mt-0.5">
              คลิกที่การ์ดเพื่อกำหนดเป็นแบรนด์ทำงานหลัก หรือกดสั่ง AI คิดคอนเทนต์เฉพาะทาง
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-[#E8E9EC]">
            {[
              { id: "all", label: "ทั้งหมด (13)" },
              { id: "auto", label: "🚗 ยานยนต์" },
              { id: "shop", label: "🎣 ร้านค้า" },
              { id: "content", label: "📚 สาระ" },
              { id: "personal", label: "👤 ส่วนตัว" }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  categoryFilter === tab.id
                    ? "bg-[#17181A] text-white shadow-luxury-sm"
                    : "text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedBrands.map((brand) => {
            const Icon = getBrandIcon(brand.category);
            const isSelected = activeBrand === brand.name;

            return (
              <div
                key={brand.id}
                className={`bg-white border rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between shadow-luxury-card ${
                  isSelected
                    ? "border-[#C9A96E] ring-2 ring-[#C9A96E]/20"
                    : "border-[#E8E9EC] hover:border-slate-300 hover:shadow-luxury-hover"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                        <Icon className="w-4 h-4 text-slate-700" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#17181A] line-clamp-1">
                          {brand.shortName}
                        </h3>
                        <span className="text-[11px] text-slate-600 font-semibold">{brand.categoryLabel}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                      {brand.badge}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2 text-xs">
                    <div className="bg-[#F7F8FA] p-2 rounded-xl border border-[#E8E9EC] space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-semibold">
                        <Clock className="w-3 h-3 text-[#A2834E]" />
                        <span>เวลาทองคำ (Golden Hour):</span>
                      </div>
                      <div className="font-bold text-[#17181A] text-[11px]">
                        {brand.goldenHour}
                      </div>
                    </div>

                    <div className="bg-[#F7F8FA] p-2 rounded-xl border border-[#E8E9EC] space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-semibold">
                        <Layers className="w-3 h-3 text-[#8B7CF6]" />
                        <span>รูปแบบแนะนำ (Best Format):</span>
                      </div>
                      <div className="font-medium text-[#17181A] text-[11px] line-clamp-1">
                        {brand.bestFormat}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E9EC] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveBrand(brand.name)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-slate-100 text-[#17181A] font-bold"
                        : "text-slate-600 hover:text-[#17181A] hover:bg-slate-50"
                    }`}
                  >
                    {isSelected ? "✓ แบรนด์ปัจจุบัน" : "เลือกแบรนด์นี้"}
                  </button>

                  <Link
                    href={`/ideas?brand=${encodeURIComponent(brand.name)}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#17181A] hover:bg-slate-800 text-white text-xs font-semibold shadow-luxury-sm transition-transform active:scale-95"
                  >
                    <span>+ สั่ง AI คิดงาน</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
