"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Send,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Globe,
  Layers,
  Repeat,
  FileText,
  Facebook,
  Instagram,
  Video,
  Twitter,
  Citrus,
  ArrowRight,
  Sliders
} from "lucide-react";
import { ApprovalItem, Platform, ContentIdea } from "@/types";
import { useBrand, ALL_BRANDS } from "@/context/BrandContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { AIScoreCard } from "@/components/ui/AIScoreCard";
import { AIPreFlightCheck } from "@/components/ui/AIPreFlightCheck";

const PLATFORM_CONFIG: Record<string, {
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  badgeBg: string;
  directUrl: string;
  bestTimes: string;
}> = {
  facebook: {
    name: "Facebook Page",
    icon: Facebook,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    badgeBg: "bg-blue-100 text-blue-800",
    directUrl: "https://www.facebook.com",
    bestTimes: "11:30 - 13:00 น. & 19:00 - 21:00 น."
  },
  tiktok: {
    name: "TikTok Creator",
    icon: Video,
    color: "text-rose-600",
    bgColor: "bg-rose-50 border-rose-200",
    badgeBg: "bg-rose-100 text-rose-800",
    directUrl: "https://www.tiktok.com/upload",
    bestTimes: "18:30 - 21:00 น. (ช่วงคลิปสั้น)"
  },
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "text-fuchsia-600",
    bgColor: "bg-fuchsia-50 border-fuchsia-200",
    badgeBg: "bg-fuchsia-100 text-fuchsia-800",
    directUrl: "https://www.instagram.com",
    bestTimes: "17:00 - 20:00 น. (ช่วงเลิกงาน)"
  },
  lemon8: {
    name: "Lemon8",
    icon: Citrus,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
    badgeBg: "bg-amber-100 text-amber-800",
    directUrl: "https://www.lemon8-app.com",
    bestTimes: "12:00 - 14:00 น. & 20:00 - 22:00 น."
  },
  x: {
    name: "X (Twitter)",
    icon: Twitter,
    color: "text-slate-800",
    bgColor: "bg-slate-100 border-slate-200",
    badgeBg: "bg-slate-200 text-slate-800",
    directUrl: "https://twitter.com",
    bestTimes: "08:00 - 09:30 น. & 12:00 - 13:30 น."
  }
};

function PublishingCenterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeBrand, setActiveBrand } = useBrand();

  const [activeTab, setActiveTab] = useState<"overview" | "calendar" | "queue" | "published" | "analytics">("overview");
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [notification, setNotification] = useState<string | null>(null);

  // Sync tab from URL if present
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "calendar", "queue", "published", "analytics"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, ideasRes] = await Promise.all([
        fetch("/api/approvals").then(r => r.json()),
        fetch("/api/ai/ideas").then(r => r.json())
      ]);
      if (appRes.approvals) setApprovals(appRes.approvals);
      if (ideasRes.ideas) setIdeas(ideasRes.ideas);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Filter items
  const filteredApprovals = approvals.filter(item => {
    if (activeBrand !== "ALL" && item.brand_name && !item.brand_name.toLowerCase().includes(activeBrand.toLowerCase()) && !activeBrand.toLowerCase().includes(item.brand_name.toLowerCase())) {
      return false;
    }
    if (platformFilter !== "all" && item.platform !== platformFilter) {
      return false;
    }
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    if (searchTerm) {
      const text = `${item.title || ""} ${(item as any).caption || item.content_preview || ""} ${item.brand_name || ""}`.toLowerCase();
      if (!text.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  // Metrics (Section 16 of prompt: Real or "—")
  const scheduledCount = approvals.filter(a => a.status === "SCHEDULED" || a.publish_mode === "AUTO").length;
  const publishedCount = approvals.filter(a => a.status === "EXECUTED" || a.status === "APPROVED").length;
  const needsReviewCount = approvals.filter(a => a.status === "HUMAN_REVIEW" || a.status === "DRAFT" || !a.status).length;
  const failedCount = approvals.filter(a => a.status === "REJECTED").length;

  const handleSimulatePublish = async (item: ApprovalItem) => {
    try {
      const res = await fetch("/api/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          status: "EXECUTED"
        })
      });
      if (res.ok) {
        setApprovals(prev => prev.map(a => a.id === item.id ? { ...a, status: "EXECUTED" } : a));
        setNotification(`✓ เผยแพร่คอนเทนต์ '${item.title}' ไปยัง ${(item.platform || "facebook").toUpperCase()} เรียบร้อยแล้ว`);
        setTimeout(() => setNotification(null), 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteApproval = async (id: string, title?: string) => {
    if (!confirm(`คุณต้องการลบโพสต์ '${title || "นี้"}' ออกจาก Publishing Center ใช่หรือไม่?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/approvals?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setApprovals(prev => prev.filter(a => a.id !== id));
        setNotification(`✓ ลบโพสต์ '${title || "รายการ"}' ออกเรียบร้อยแล้ว`);
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification("ไม่สามารถลบโพสต์ได้ โปรดลองอีกครั้ง");
      }
    } catch (e) {
      console.error(e);
      setNotification("เกิดข้อผิดพลาดในการลบโพสต์");
    }
  };

  const handleClearAllApprovals = async () => {
    if (!confirm(`คุณต้องการลบโพสต์ทั้งหมดในคิว (${approvals.length} รายการ) ใช่หรือไม่?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/approvals?all=true`, {
        method: "DELETE"
      });
      if (res.ok) {
        setApprovals([]);
        setNotification("✓ ล้างโพสต์ทั้งหมดใน Publishing Center เรียบร้อยแล้ว");
        setTimeout(() => setNotification(null), 3500);
      } else {
        setNotification("ไม่สามารถล้างคิวได้");
      }
    } catch (e) {
      console.error(e);
      setNotification("เกิดข้อผิดพลาดในการล้างคิว");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header with Global Standardized Badge */}
      <div className="bg-white border border-[#E8E9EC] rounded-[20px] p-6 md:p-8 shadow-luxury-card relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="stage">STAGE 05 · PUBLISH</Badge>
              <span className="text-xs text-slate-500 font-medium">Final Stage of Marketing Loop</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#17181A] tracking-tight">
              Publishing Center
            </h1>
            <p className="text-xs md:text-sm text-[#6B7280] leading-relaxed">
              จัดการ ตรวจสอบ และติดตาม Content ที่พร้อมเผยแพร่ในทุกแพลตฟอร์มตามเวลาทองคำ (Golden Hours)
            </p>
          </div>

          {/* Primary & Secondary CTAs (Section 15 of prompt) */}
          <div className="flex items-center gap-3">
            <Link href="/content">
              <Button variant="primary" size="md" icon={Plus}>
                + Create Content
              </Button>
            </Link>
            <Link href="/ideas">
              <Button variant="gold" size="md" icon={Sparkles}>
                Generate with AI
              </Button>
            </Link>
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* 2. Top Metrics Row (Section 16 of prompt) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-luxury-card flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-[#6B7280]">Scheduled</div>
            <div className="text-2xl font-black text-[#17181A] mt-0.5">
              {scheduledCount > 0 ? scheduledCount : "—"}
            </div>
            <div className="text-[10px] text-purple-600 mt-0.5">ตั้งเวลาออกอากาศแล้ว</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#8B7CF6] flex items-center justify-center border border-purple-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-luxury-card flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-[#6B7280]">Published</div>
            <div className="text-2xl font-black text-[#17181A] mt-0.5">
              {publishedCount > 0 ? publishedCount : "—"}
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5">เผยแพร่เสร็จสมบูรณ์</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#3FA77A] flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-luxury-card flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-[#6B7280]">Needs Review</div>
            <div className="text-2xl font-black text-[#17181A] mt-0.5">
              {needsReviewCount > 0 ? needsReviewCount : "—"}
            </div>
            <div className="text-[10px] text-amber-600 mt-0.5">รอตรวจก่อนส่งออก</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C9A96E] flex items-center justify-center border border-amber-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-luxury-card flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-[#6B7280]">Failed</div>
            <div className="text-2xl font-black text-[#17181A] mt-0.5">
              {failedCount > 0 ? failedCount : "—"}
            </div>
            <div className="text-[10px] text-rose-600 mt-0.5">ต้องตรวจสอบข้อผิดพลาด</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation & Search / Filter Controls */}
      <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-luxury-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E8E9EC]">
          {/* Segmented Tabs */}
          <div className="flex items-center gap-1 bg-[#F7F8FA] p-1 rounded-xl border border-[#E8E9EC] overflow-x-auto custom-scrollbar">
            {[
              { id: "overview", label: "Overview" },
              { id: "calendar", label: "Calendar" },
              { id: "queue", label: `Queue (${filteredApprovals.length})` },
              { id: "published", label: "Published" },
              { id: "analytics", label: "Analytics" }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white text-[#17181A] shadow-luxury-sm font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ค้นหาโพสต์, แคปชั่น..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F7F8FA] border border-[#E8E9EC] rounded-xl text-xs text-[#17181A] placeholder-slate-400 focus:outline-none focus:border-[#C9A96E]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium mr-1">แพลตฟอร์ม:</span>
          {["all", "facebook", "tiktok", "instagram", "lemon8", "x"].map(plat => (
            <button
              key={plat}
              type="button"
              onClick={() => setPlatformFilter(plat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                platformFilter === plat
                  ? "bg-[#17181A] text-white border-[#17181A]"
                  : "bg-white text-slate-600 border-[#E8E9EC] hover:bg-slate-50"
              }`}
            >
              {plat === "all" ? "ทุกช่องทาง" : plat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tab Views */}

      {/* TAB: OVERVIEW & MASTER CONTENT */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* AI Pre-flight and Quality Score preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AIPreFlightCheck brandName={activeBrand === "ALL" ? "Mazda & BYD" : activeBrand} />
            <AIScoreCard />
          </div>

          {/* Master Content Section */}
          <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-luxury-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E9EC]">
              <div>
                <h3 className="text-sm font-bold text-[#17181A] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C9A96E]" />
                  <span>Master Content Pipeline</span>
                </h3>
                <p className="text-xs text-slate-500">
                  1 Master Idea ปรับแยกย่อยสู่ 5 แพลตฟอร์มอัตโนมัติ
                </p>
              </div>
              <Link href="/content">
                <span className="text-xs font-semibold text-[#C9A96E] hover:underline flex items-center gap-1">
                  สร้าง Master ชิ้นใหม่ <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>

            {ideas.length === 0 ? (
              <EmptyState
                title="ยังไม่มี Master Content"
                description="เริ่มสร้างไอเดียแรกของคุณ เพื่อให้ AI วางแผนและแปลงเป็นคอนเทนต์สำหรับทุกแพลตฟอร์ม"
                actionLabel="สร้างไอเดียใหม่"
                onAction={() => router.push("/ideas")}
              />
            ) : (
              <div className="space-y-3">
                {ideas.slice(0, 3).map((idea, idx) => (
                  <div
                    key={idea.id}
                    className="p-4 rounded-xl border border-[#E8E9EC] hover:border-slate-300 transition-all bg-[#F7F8FA]/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                          MASTER #{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{idea.brand_name}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#17181A]">{idea.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-1">{idea.hook}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/content?id=${idea.id}`}>
                        <Button variant="outline" size="sm" icon={FileText}>
                          แต่งสื่อ
                        </Button>
                      </Link>
                      <Link href={`/repurpose?id=${idea.id}`}>
                        <Button variant="primary" size="sm" icon={Repeat}>
                          ดัดแปลง 5 สื่อ
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: CALENDAR VIEW */}
      {activeTab === "calendar" && (
        <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-luxury-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E9EC]">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#C9A96E]" />
              <h3 className="text-sm font-bold text-[#17181A]">
                ตารางออกอากาศรายเดือน (September 2026)
              </h3>
            </div>
            <div className="text-xs text-slate-500">
              เวลาทองคำ: อิงตามสถิติ Engagement สูงสุดของแต่ละเพจ
            </div>
          </div>

          {/* Calendar Grid (Days of Week) */}
          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-500 pb-2 border-b border-[#E8E9EC]">
            <div>จันทร์</div>
            <div>อังคาร</div>
            <div>พุธ</div>
            <div>พฤหัส</div>
            <div>ศุกร์</div>
            <div className="text-amber-600">เสาร์</div>
            <div className="text-rose-600">อาทิตย์</div>
          </div>

          {/* Sample Calendar Slots */}
          <div className="grid grid-cols-7 gap-2 min-h-[360px]">
            {Array.from({ length: 30 }).map((_, d) => {
              const day = d + 1;
              const hasPost = day % 3 === 0;
              return (
                <div
                  key={day}
                  className={`p-2 rounded-xl border min-h-[70px] text-xs transition-colors flex flex-col justify-between ${
                    hasPost
                      ? "bg-purple-50/50 border-purple-200/80 hover:bg-purple-50"
                      : "bg-[#F7F8FA]/60 border-[#E8E9EC] hover:bg-slate-50"
                  }`}
                >
                  <span className="font-mono text-[11px] font-bold text-slate-500">{day}</span>
                  {hasPost && (
                    <div className="mt-1 bg-white p-1 rounded border border-purple-200 text-[10px] text-purple-700 font-medium truncate shadow-luxury-sm">
                      ● 18:30 Post
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: QUEUE VIEW */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          {/* Queue Header & Clear All Controls */}
          {approvals.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-luxury-card">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-[#17181A]">
                  รายการในคิวรอเผยแพร่ ({filteredApprovals.length} จากทั้งหมด {approvals.length} รายการ)
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearAllApprovals}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
                title="ลบรายการทั้งหมดใน Publishing Center"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>🗑️ ล้างคิวทั้งหมด ({approvals.length})</span>
              </button>
            </div>
          )}

          {filteredApprovals.length === 0 ? (
            <EmptyState
              title="ไม่มีโพสต์ที่อยู่ในคิวรอเผยแพร่"
              description="คุณสามารถสร้างเนื้อหาใหม่หรือเลือกจากคลังไอเดียเพื่อส่งเข้ามาในคิวออกอากาศได้ทันที"
              actionLabel="+ สร้างคอนเทนต์ใหม่"
              onAction={() => router.push("/content")}
              secondaryLabel="ดูคลังไอเดีย"
              onSecondaryAction={() => router.push("/ideas")}
            />
          ) : (
            <div className="space-y-3">
              {filteredApprovals.map((item) => {
                const platKey = (item.platform || "facebook").toLowerCase();
                const platMeta = PLATFORM_CONFIG[platKey] || PLATFORM_CONFIG.facebook;
                const PlatIcon = platMeta.icon;

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-[#E8E9EC] rounded-2xl p-5 shadow-luxury-card flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${platMeta.badgeBg}`}>
                          <PlatIcon className="w-3 h-3" />
                          <span>{platMeta.name}</span>
                        </span>

                        <span className="text-xs font-semibold text-slate-600">
                          {item.brand_name || activeBrand}
                        </span>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.status || "DRAFT"}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#17181A]">{item.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {(item as any).caption || item.content_preview}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#C9A96E]" />
                          <span>เวลาทองคำแนะนำ: {platMeta.bestTimes}</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Send}
                        onClick={() => handleSimulatePublish(item)}
                      >
                        ยิงโพสต์ทันที
                      </Button>
                      <a href={platMeta.directUrl} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" icon={ExternalLink}>
                          เปิดหน้าเพจ
                        </Button>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteApproval(item.id, item.title)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
                        title="ลบโพสต์นี้ออกจากคิว"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: PUBLISHED */}
      {activeTab === "published" && (
        <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-luxury-card">
          <h3 className="text-sm font-bold text-[#17181A] mb-3">
            ประวัติคอนเทนต์ที่เผยแพร่สำเร็จแล้ว
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            บันทึกประวัติการส่งโพสต์และเก็บสถิติเพื่อนำกลับไปเรียนรู้ใน AI Intelligence Loop
          </p>

          <EmptyState
            title="ยังไม่มีบันทึกการเผยแพร่ล่าสุด"
            description="เมื่อคุณเผยแพร่คอนเทนต์จากคิว รายการจะถูกจัดเก็บที่นี่พร้อมตัวเลข Engagement"
            actionLabel="ไปยังคิวรอเผยแพร่"
            onAction={() => setActiveTab("queue")}
          />
        </div>
      )}

      {/* TAB: ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-luxury-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#17181A]">
              สถิติประสิทธิภาพการออกอากาศ
            </h3>
            <Link href="/analytics">
              <Button variant="outline" size="sm">
                เปิดหน้า Marketing Analytics เต็มรูปแบบ ↗
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            ระบบจะดึงข้อมูล Performance Feed กลับสู่ AI เพื่อแนะนำ Hook และสไตล์คอนเทนต์ที่ปังที่สุดในรอบถัดไป
          </p>
        </div>
      )}
    </div>
  );
}

export default function PublishingCenterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">กำลังโหลด Publishing Center...</div>}>
      <PublishingCenterContent />
    </Suspense>
  );
}
