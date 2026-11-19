"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Lightbulb,
  FileText,
  Repeat,
  CheckSquare,
  ArrowRight,
  Clock,
  Car,
  ShoppingBag,
  BookOpen,
  User,
  CheckCircle2,
  Globe,
  Layers,
  Film,
  ExternalLink,
  History,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useBrand, ALL_BRANDS } from "@/context/BrandContext";
import { ContentIdea, ApprovalItem } from "@/types";

interface SavedEasySummary {
  id: string;
  prompt: string;
  aspectRatio: string;
  createdAt: string;
  blueprint: {
    title: string;
    concept: string;
    video_blueprint?: { scene_count: number; total_duration_sec: number };
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { activeBrand, setActiveBrand } = useBrand();
  const [quickPrompt, setQuickPrompt] = useState("");
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [recentProjects, setRecentProjects] = useState<SavedEasySummary[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showBrands, setShowBrands] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pk_easy_projects_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecentProjects(parsed.slice(0, 4));
      }
    } catch {
      // ignore
    }

    async function loadData() {
      try {
        const [ideasRes, queueRes] = await Promise.all([
          fetch("/api/ai/ideas").then((r) => r.json()).catch(() => ({})),
          fetch("/api/approvals").then((r) => r.json()).catch(() => ({}))
        ]);
        if (Array.isArray(ideasRes?.ideas)) setIdeas(ideasRes.ideas);
        if (Array.isArray(queueRes?.approvals)) setApprovals(queueRes.approvals);
      } catch {
        // graceful offline fallback
      }
    }
    loadData();
  }, []);

  const handleQuickLaunch = (customText?: string) => {
    const q = (customText ?? quickPrompt).trim();
    if (!q) {
      router.push("/easy");
      return;
    }
    router.push(`/easy?prompt=${encodeURIComponent(q)}&autoRun=true`);
  };

  const filteredIdeas =
    activeBrand === "ALL"
      ? ideas
      : ideas.filter(
          (i) =>
            (i.brand_name || "").toLowerCase().includes(activeBrand.toLowerCase()) ||
            activeBrand.toLowerCase().includes((i.brand_name || "").toLowerCase())
        );

  const filteredApprovals =
    activeBrand === "ALL"
      ? approvals
      : approvals.filter((a) => (a.brand_name || "").toLowerCase().includes(activeBrand.toLowerCase()));

  const totalIdeasCount = filteredIdeas.length;
  const scheduledCount = filteredApprovals.filter((a) => a.status === "SCHEDULED" || a.publish_mode === "AUTO").length;
  const publishedCount = filteredApprovals.filter((a) => a.status === "EXECUTED" || a.status === "APPROVED").length;
  const needsReviewCount = filteredApprovals.filter((a) => a.status === "HUMAN_REVIEW" || a.status === "DRAFT" || !a.status).length;

  const displayedBrands = ALL_BRANDS.filter((b) => {
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
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* 1. Solo AI Creator Hero Command Box */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PK Marketing AI OS · Solo Creator Edition</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              คิดคอนเทนต์ให้ปังใน 10 วินาที แล้วก๊อปไปเจนต่อใน Google Flow
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              พิมพ์ภาษาคนธรรมดาได้เลย ระบบจะถอดสูตร Hook 3 วิแรก ผสมกระแส/มีม แบ่งฉาก Prompt ภาษาอังกฤษ และสร้างเสียงพากย์ MP3 ให้จบในที่เดียว
            </p>
          </div>

          <a
            href="https://flow.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shrink-0 self-start"
          >
            <Film className="w-4 h-4 text-emerald-400" />
            <span>เปิด Google Flow</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>

        {/* Instant Prompt Input */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleQuickLaunch();
              }}
              placeholder="พิมพ์สิ่งที่อยากทำวันนี้ เช่น: ช่วยคิดคอนเท้นไปเที่ยววัด, มีมแมวบ่นงานวันจันทร์, รีวิวรถใหม่..."
              className="flex-1 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-500/10 transition-all"
            />
            <button
              type="button"
              onClick={() => handleQuickLaunch()}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>เริ่มสร้างสูตรเลย</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">ตัวอย่างกดเริ่มทันที:</span>
            {[
              "ช่วยคิดคอนเท้นไปเที่ยววัดให้หน่อย",
              "แมวอ้วนใส่สูทบ่นเรื่องงานวันจันทร์ แบบมีมฮาๆ",
              "ส่งมอบรถใหม่ให้ลูกค้า ฟีลอบอุ่นซึ้งๆ"
            ].map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => handleQuickLaunch(ex)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Quick Access Studios (Consistent with Sidebar) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            badge: "FAST · แนะนำ",
            title: "Easy Content Creator",
            desc: "พิมพ์ช่องเดียวได้ Hook + Prompt ลง Google Flow + เสียงพากย์ MP3",
            href: "/easy",
            icon: Sparkles,
            highlight: true
          },
          {
            badge: "01 · IDEAS",
            title: "Ideas & Strategy",
            desc: "คิดชุดไอเดีย 5 ตอน วางกลยุทธ์และมุมขายเฉพาะแบรนด์",
            href: "/ideas",
            icon: Lightbulb,
            highlight: false
          },
          {
            badge: "02 · VIDEO PRO",
            title: "Commercial Studio",
            desc: "สตูดิโอวิดีโอโฆษณา Storyboard หลายฉาก + พากย์ไทย ElevenLabs",
            href: "/commercial",
            icon: Film,
            highlight: false
          },
          {
            badge: "03 · SOCIAL POST",
            title: "Social Copy & Posts",
            desc: "สร้างแคปชันและผังภาพนิ่ง / อัลบั้มสไลด์ Facebook, IG, Lemon8",
            href: "/content",
            icon: FileText,
            highlight: false
          }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className={`group rounded-2xl p-5 border transition-all flex flex-col justify-between gap-4 ${
                card.highlight
                  ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-900 hover:border-emerald-500 hover:shadow-xs"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      card.highlight
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-100 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      card.highlight
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {card.badge}
                  </span>
                </div>
                <div>
                  <h2 className="text-sm font-extrabold tracking-tight">{card.title}</h2>
                  <p className={`text-xs mt-1 leading-relaxed ${card.highlight ? "text-slate-300" : "text-slate-500"}`}>
                    {card.desc}
                  </p>
                </div>
              </div>
              <div
                className={`text-xs font-bold inline-flex items-center gap-1 ${
                  card.highlight ? "text-emerald-400" : "text-emerald-700"
                }`}
              >
                <span>เปิดใช้งาน</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </section>

      {/* 3. Recent Saved Projects from Easy Creator */}
      {recentProjects.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <span>โปรเจกต์ล่าสุดที่คุณสร้างไว้</span>
            </h2>
            <Link href="/easy" className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1">
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentProjects.map((p) => (
              <Link
                key={p.id}
                href="/easy"
                className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{p.blueprint.title}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{p.blueprint.concept}</div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 shrink-0">
                  {p.aspectRatio}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. Compact Overview Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "คลังไอเดียทั้งหมด", value: totalIdeasCount, sub: "พร้อมแปลงเป็นสื่อ", icon: Lightbulb },
          { label: "รอตรวจสอบ (Review)", value: needsReviewCount || "0", sub: "คิวตรวจทานก่อนลง", icon: CheckSquare },
          { label: "ตั้งเวลาโพสต์แล้ว", value: scheduledCount || "0", sub: "รอส่งตามเวลาทองคำ", icon: Clock },
          { label: "เผยแพร่แล้ว", value: publishedCount || "0", sub: "บันทึกสถิติครบถ้วน", icon: CheckCircle2 }
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500">{m.label}</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{m.value}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{m.sub}</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </section>

      {/* 5. Collapsible Multi-Brand Manager (Keep clean for Solo Creators, 1-click expand for Brand Mode) */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <button
          type="button"
          onClick={() => setShowBrands(!showBrands)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-emerald-600" />
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                จัดการแบรนด์ในระบบ ({ALL_BRANDS.length} แบรนด์)
              </h2>
              <p className="text-xs text-slate-500">
                กดเพื่อขยายดูรายชื่อแบรนด์ เวลาทองคำ (Golden Hours) และสั่งคิดงานเฉพาะแบรนด์
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1">
            <span>{showBrands ? "ซ่อน" : "เปิดดูแบรนด์"}</span>
            {showBrands ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showBrands && (
          <div className="space-y-4 pt-3 border-t border-slate-100 animate-fade-in">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "ทั้งหมด (13)" },
                { id: "auto", label: "ยานยนต์" },
                { id: "shop", label: "ร้านค้า" },
                { id: "content", label: "สาระ" },
                { id: "personal", label: "ส่วนตัว" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    categoryFilter === tab.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedBrands.map((brand) => {
                const Icon = getBrandIcon(brand.category);
                const isSelected = activeBrand === brand.name;

                return (
                  <div
                    key={brand.id}
                    className={`bg-slate-50/70 border rounded-xl p-4 transition-all flex flex-col justify-between gap-3 ${
                      isSelected ? "border-emerald-500 ring-1 ring-emerald-500/20" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{brand.shortName}</h3>
                            <span className="text-[10px] text-slate-500">{brand.categoryLabel}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                          {brand.badge}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{brand.goldenHour}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{brand.bestFormat}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveBrand(brand.name)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                          isSelected ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-200/60"
                        }`}
                      >
                        {isSelected ? "✓ แบรนด์ปัจจุบัน" : "เลือกแบรนด์"}
                      </button>

                      <Link
                        href={`/ideas?brand=${encodeURIComponent(brand.name)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold"
                      >
                        <span>คิดงาน</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
