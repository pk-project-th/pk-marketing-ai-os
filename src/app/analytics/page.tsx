"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Layers,
  ChevronRight,
  Download,
  PlusCircle,
  Share2,
  X,
  Sliders,
  Check,
  Globe,
  Flame,
  ArrowRight,
  Clock,
  Car,
  ShoppingBag,
  Tv,
  BookOpen,
  UtensilsCrossed,
  Trophy,
  User
} from "lucide-react";
import { AnalyticsReport, MarketingMetrics, SocialPageAccount } from "@/types";
import { exportToMarkdown, exportToCSV } from "@/lib/export";

const BRAND_OPTIONS = [
  "Mazda & BYD (ดีลเลอร์ & โปรโมชั่น)",
  "เพจรถ (ความรู้เรื่องรถ & ข่าวสารยานยนต์)",
  "PP Fishing (ขายอุปกรณ์ตกปลา & ความรู้หน้าร้าน เชียงราย)",
  "Lanna Lab Records (ค่ายเพลง & ดนตรีล้านนา)",
  "Mr. Must Have (นายหน้า / ป้ายยาของน่าใช้)",
  "ขายพระเครื่อง (ลงขายพระของพ่อ / พระแท้)",
  "ขายของต่าง ๆ (ของมือสอง & ของไม่ใช้แล้ว)",
  "หนังสือ (พัฒนาตนเอง & สรุปข้อคิดดี ๆ)",
  "ช่องข่าว (ประเด็นร้อน & อัปเดตกระแสประจำวัน)",
  "สารคดี (เรื่องลึกลับ & วิทยาศาสตร์ & ประวัติศาสตร์)",
  "นิทาน (นิทานสอนใจ & เรื่องเล่าก่อนนอน)",
  "ทำอาหาร (สูตร & ขั้นตอนการทำอาหาร)",
  "ฟุตบอล (ไฮไลท์ยิงประตู & กีฬา)",
  "แอคเค้าท์ส่วนตัว (Lifestyle & คอนเทนต์ส่วนตัว)"
];

export default function AnalyticsPage() {
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [pushedMessage, setPushedMessage] = useState<string | null>(null);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("all");

  // Manual Entry Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualBrand, setManualBrand] = useState(BRAND_OPTIONS[5]); // default: ขายพระของพ่อ
  const [manualPeriod, setManualPeriod] = useState("สัปดาห์นี้ (ล่าสุด)");
  const [manualNotes, setManualNotes] = useState("เน้นโพสต์อัลบั้มภาพ 4 รูป ส่องมวลสารพระแท้ มีคนทักสอบถามเยอะมาก");
  const [manualMetrics, setManualMetrics] = useState<MarketingMetrics>({
    reach: 12500,
    impressions: 26000,
    engagement: 1650,
    engagement_rate: 13.2,
    ctr: 4.5,
    views: 8400,
    watch_time_hours: 120,
    conversions: 8,
    leads: 36,
    cost: 0,
    roas: 0,
    cpc: 0,
    cpm: 0
  });

  // Multi-Page Social Accounts & Sync Drawer
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialAccounts, setSocialAccounts] = useState<SocialPageAccount[]>([]);
  const [syncingPageId, setSyncingPageId] = useState<string | null>(null);
  const [syncAllLoading, setSyncAllLoading] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editPageId, setEditPageId] = useState("");
  const [editToken, setEditToken] = useState("");

  useEffect(() => {
    loadReports();
    loadSocialAccounts();
  }, []);

  const loadReports = async (brand?: string) => {
    try {
      setLoading(true);
      const url = brand && brand !== "all" ? `/api/ai/analytics?brand=${encodeURIComponent(brand)}` : "/api/ai/analytics";
      const res = await fetch(url);
      const data = await res.json();
      if (data.reports && data.reports.length > 0) {
        setReports(data.reports);
        setSelectedReport(data.reports[0]);
      } else {
        setReports([]);
        setSelectedReport(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSocialAccounts = async () => {
    try {
      const res = await fetch("/api/social/accounts");
      const data = await res.json();
      if (data.accounts) {
        setSocialAccounts(data.accounts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBrandFilterChange = (brand: string) => {
    setSelectedBrandFilter(brand);
    loadReports(brand);
  };

  // Submit Manual Metrics
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualLoading(true);
    try {
      const res = await fetch("/api/ai/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `รายงานสถิติ — ${manualBrand}`,
          brand_name: manualBrand,
          period: manualPeriod,
          dataSource: "MANUAL",
          metrics: manualMetrics,
          notes: manualNotes
        })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setPushedMessage(`✓ บันทึกสถิติและสร้างบทวิเคราะห์ 9 มิติของ "${manualBrand}" สำเร็จ!`);
        setTimeout(() => setPushedMessage(null), 5000);
        setManualModalOpen(false);
        loadReports(selectedBrandFilter);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setManualLoading(false);
    }
  };

  // Sync a single social page
  const handleSyncAccount = async (account: SocialPageAccount) => {
    setSyncingPageId(account.id);
    try {
      const res = await fetch("/api/social/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_id: account.page_id,
          brand_name: account.brand_name
        })
      });
      const data = await res.json();
      if (data.success) {
        setPushedMessage(`✓ ซิงค์สถิติล่าสุดของ "${account.brand_name}" สำเร็จ!`);
        setTimeout(() => setPushedMessage(null), 5000);
        loadSocialAccounts();
        loadReports(selectedBrandFilter);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingPageId(null);
    }
  };

  // Sync all pages
  const handleSyncAllAccounts = async () => {
    setSyncAllLoading(true);
    try {
      for (const acc of socialAccounts) {
        await fetch("/api/social/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page_id: acc.page_id,
            brand_name: acc.brand_name
          })
        });
      }
      setPushedMessage(`✓ ซิงค์สถิติครบทุกเพจ (${socialAccounts.length} เพจ) สำเร็จเรียบร้อย!`);
      setTimeout(() => setPushedMessage(null), 6000);
      loadSocialAccounts();
      loadReports(selectedBrandFilter);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncAllLoading(false);
    }
  };

  // Save Token & Page ID
  const handleSaveToken = async (account: SocialPageAccount) => {
    try {
      const res = await fetch("/api/social/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: account.id,
          page_id: editPageId.trim() || account.page_id,
          access_token: editToken.trim(),
          brand_name: account.brand_name,
          platform: account.platform,
          status: editToken.trim().length > 10 ? "CONNECTED" : "SIMULATED"
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingAccountId(null);
        loadSocialAccounts();
        setPushedMessage(`✓ อัปเดตข้อมูลเชื่อมต่อของ "${account.brand_name}" เรียบร้อยแล้ว`);
        setTimeout(() => setPushedMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePushOpportunityToIdeas = async (opp: any) => {
    try {
      const res = await fetch("/api/ai/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_name: selectedReport?.brand_name || opp.platform,
          briefText: `${opp.title} (${opp.rationale})`,
          count: 3
        })
      });
      const data = await res.json();
      if (data.success) {
        setPushedMessage(`✓ ส่งต่ออินไซต์ "${opp.title}" ไปสร้างชุดไอเดียใน Step 1 เรียบร้อยแล้ว!`);
        setTimeout(() => setPushedMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportMarkdown = () => {
    if (!selectedReport) return;
    const md = `# Marketing Performance Diagnostic Report
**Title:** ${selectedReport.title}
**Brand:** ${selectedReport.brand_name || "All"}
**Period:** ${selectedReport.period}
**Data Source:** ${selectedReport.data_source || "Multi-channel"}

## 1. บทสรุปสำหรับผู้บริหาร (Executive Summary)
${selectedReport.executive_summary}

## 2. ข้อค้นพบสำคัญ (Key Findings)
${selectedReport.key_findings?.map((k) => `- ${k}`).join("\n") || "- ไม่มีข้อมูล"}

## 3. รูปแบบเชิงพฤติกรรม (Performance Patterns)
${selectedReport.performance_patterns?.map((p) => `- ${p}`).join("\n") || "- ไม่มีข้อมูล"}

## 4. ปัญหาที่พบ (Identified Problems)
${selectedReport.identified_problems?.map((p) => `- ${p}`).join("\n") || "- ไม่มีข้อมูล"}

## 5. การวินิจฉัย 9 มิติ (9-Point Diagnostic)
### อะไรที่ทำได้ดี:
${selectedReport.what_performed_well?.map((w) => `- ${w}`).join("\n") || "- ไม่มีข้อมูล"}

### อะไรที่ทำได้ไม่ดี:
${selectedReport.what_performed_poorly?.map((w) => `- ${w}`).join("\n") || "- ไม่มีข้อมูล"}

### ธีมคอนเทนต์ที่ได้ผล:
${selectedReport.content_themes_worked?.map((t) => `- ${t}`).join("\n") || "- ไม่มีข้อมูล"}

### ฟอร์แมตที่ได้ผล:
${selectedReport.formats_worked?.map((f) => `- ${f}`).join("\n") || "- ไม่มีข้อมูล"}

### แพลตฟอร์มที่ได้ผล:
${selectedReport.platforms_worked?.map((p) => `- ${p}`).join("\n") || "- ไม่มีข้อมูล"}

## 6. ข้อเสนอแนะและโอกาสคอนเทนต์ถัดไป (Recommendations)
${selectedReport.recommendations?.map((r) => `- ${r}`).join("\n") || "- ไม่มีข้อมูล"}
`;
    exportToMarkdown(md, `analytics_report_${selectedReport.id}`);
  };

  const handleExportCSV = () => {
    if (!selectedReport || !selectedReport.metrics) return;
    const data = [
      {
        Report: selectedReport.title,
        Brand: selectedReport.brand_name || "All",
        Period: selectedReport.period,
        Reach: selectedReport.metrics.reach,
        Impressions: selectedReport.metrics.impressions,
        Engagement: selectedReport.metrics.engagement,
        "Engagement Rate %": selectedReport.metrics.engagement_rate,
        "CTR %": selectedReport.metrics.ctr,
        Leads: selectedReport.metrics.leads,
        Conversions: selectedReport.metrics.conversions,
        "Spend THB": selectedReport.metrics.cost,
        ROAS: selectedReport.metrics.roas,
        CPC: selectedReport.metrics.cpc,
        CPM: selectedReport.metrics.cpm
      }
    ];
    exportToCSV(data, `kpi_metrics_${selectedReport.id}`);
  };

  const m = selectedReport?.metrics;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E9EC] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>AGENT 05 — MARKETING ANALYTICS</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono">
              Auto-Sync & Manual
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#17181A] tracking-tight">
            ระบบวิเคราะห์ประสิทธิภาพการตลาด (Marketing Analytics)
          </h2>
          <p className="text-xs text-slate-700 mt-1">
            ตรวจวัดสุขภาพคอนเทนต์ 9 มิติ รองรับทั้งการกรอกตัวเลขเอง และการเชื่อมต่อซิงค์สถิติ 13 เพจผ่าน API อัตโนมัติ
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setManualModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 inline-flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>➕ บันทึกสถิติด้วยตนเอง</span>
          </button>

          <button
            onClick={() => setSocialModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>🔄 จัดการ & ซิงค์ 13 เพจ</span>
          </button>

          {selectedReport && (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-[#E8E9EC] text-slate-800 font-semibold text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-700" />
                <span>.CSV</span>
              </button>
              <button
                onClick={handleExportMarkdown}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-[#E8E9EC] text-slate-800 font-semibold text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-700" />
                <span>.MD</span>
              </button>
            </>
          )}
        </div>
      </div>

      {pushedMessage && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-xs shadow-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{pushedMessage}</span>
        </div>
      )}

      {/* Brand Selection Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E8E9EC]/80 scrollbar-thin">
        <button
          onClick={() => handleBrandFilterChange("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedBrandFilter === "all"
              ? "bg-blue-600 text-white shadow"
              : "text-slate-700 hover:text-slate-800 bg-white border border-[#E8E9EC]"
          }`}
        >
          ทั้งหมด ({reports.length})
        </button>
        {BRAND_OPTIONS.map((brand) => {
          const count = reports.filter((r) => r.brand_name?.toLowerCase().includes(brand.toLowerCase()) || r.title?.toLowerCase().includes(brand.toLowerCase())).length;
          return (
            <button
              key={brand}
              onClick={() => handleBrandFilterChange(brand)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedBrandFilter === brand
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-700 hover:text-slate-800 bg-white border border-[#E8E9EC]"
              }`}
            >
              <span>{brand.split(" (")[0]}</span>
              {count > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300 font-mono">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Report Switcher if multiple reports exist */}
      {reports.length > 1 && (
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#E8E9EC]">
          <div className="flex items-center gap-2 text-xs text-slate-800">
            <span className="text-slate-700">เลือกรายงาน:</span>
            <select
              value={selectedReport?.id || ""}
              onChange={(e) => {
                const rep = reports.find((r) => r.id === e.target.value);
                if (rep) setSelectedReport(rep);
              }}
              className="bg-white border border-[#E8E9EC] text-[#17181A] font-semibold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 shadow-luxury-sm"
            >
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.period})
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-700">
            แหล่งข้อมูล: <strong className="text-cyan-400">{selectedReport?.data_source}</strong>
          </div>
        </div>
      )}

      {/* Main Report View */}
      {selectedReport && m ? (
        <>
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-lg">
              <div className="text-[11px] text-slate-700">Reach (คนเข้าถึง)</div>
              <div className="mt-1 text-2xl font-black text-[#17181A] font-mono">{m.reach.toLocaleString()}</div>
              <div className="text-[10px] text-slate-700 mt-0.5">ผู้ใช้ไม่ซ้ำ</div>
            </div>

            <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-lg">
              <div className="text-[11px] text-slate-700">Engagement Rate</div>
              <div className="mt-1 text-2xl font-black text-purple-400 font-mono">{m.engagement_rate}%</div>
              <div className="text-[10px] text-purple-400 mt-0.5">อัตรามีส่วนร่วม</div>
            </div>

            <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-lg">
              <div className="text-[11px] text-slate-700">CTR (คลิกลิงก์)</div>
              <div className="mt-1 text-2xl font-black text-cyan-400 font-mono">{m.ctr}%</div>
              <div className="text-[10px] text-cyan-500 mt-0.5">อัตราการคลิก</div>
            </div>

            <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-lg">
              <div className="text-[11px] text-slate-700">Leads (คนทักแชท)</div>
              <div className="mt-1 text-2xl font-black text-emerald-400 font-mono">{m.leads}</div>
              <div className="text-[10px] text-emerald-500 mt-0.5">สอบถาม/ขอราคา</div>
            </div>

            <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-lg">
              <div className="text-[11px] text-slate-700">Conversions (ปิดการขาย)</div>
              <div className="mt-1 text-2xl font-black text-amber-300 font-mono">{m.conversions}</div>
              <div className="text-[10px] text-slate-700 mt-0.5">ยอดจอง/สั่งซื้อ</div>
            </div>

            <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-lg">
              <div className="text-[11px] text-slate-700">งบโฆษณา / ROAS</div>
              <div className="mt-1 text-xl font-bold text-[#17181A] font-mono">
                {m.cost > 0 ? `฿${m.cost.toLocaleString()}` : "โพสต์ฟรี"}
              </div>
              <div className="text-[10px] text-slate-700 mt-0.5">
                {m.roas > 0 ? `ROAS: ${m.roas}x` : "Organic 100%"}
              </div>
            </div>
          </div>

          {/* Executive Summary & Closed Loop Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white border border-[#E8E9EC] rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E8E9EC] pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#17181A]">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span>บทสรุปสำหรับผู้บริหาร (Executive Summary)</span>
                </div>
                <span className="text-xs text-cyan-400 font-mono">{selectedReport.period}</span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-sans bg-[#F7F8FA] p-4 rounded-2xl border border-[#E8E9EC]">
                {selectedReport.executive_summary}
              </p>

              <div>
                <div className="text-xs font-bold text-[#17181A] mb-2">ข้อค้นพบสำคัญ (Key Findings):</div>
                <div className="space-y-2">
                  {selectedReport.key_findings?.map((kf, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] text-xs text-slate-800 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <span>{kf}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Opportunities (Closed Loop) */}
            <div className="lg:col-span-4 bg-indigo-50/50 border border-indigo-200 rounded-3xl p-6 space-y-4 shadow-luxury-card flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <span>Closed Loop: ต่อยอดสู่ Step 1</span>
                </div>
                <h4 className="text-sm font-bold text-[#17181A]">โอกาสคอนเทนต์ถัดไป (Content Opportunities)</h4>
                <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                  คลิกเพื่อส่งอินไซต์ที่ได้ผลดีไปแตกเป็นคอนเทนต์ชุดใหม่ในหน้าคิดไอเดียทันที
                </p>

                <div className="space-y-3 mt-4">
                  {selectedReport.content_opportunities?.map((opp, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-indigo-200 text-xs space-y-2 hover:border-indigo-400 transition-all shadow-luxury-sm"
                    >
                      <div className="font-bold text-[#17181A]">{opp.title}</div>
                      <div className="text-[11px] text-slate-700 line-clamp-2">{opp.rationale}</div>
                      <div className="pt-2 flex items-center justify-between border-t border-[#E8E9EC]">
                        <span className="text-[10px] text-indigo-800 font-mono uppercase bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                          {opp.platform}
                        </span>
                        <button
                          onClick={() => handlePushOpportunityToIdeas(opp)}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 font-bold cursor-pointer"
                        >
                          <span>สร้างไอเดียต่อ</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-indigo-200 text-[10.5px] text-slate-700 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>ขับเคลื่อนด้วย Gemini 3.8 Flash Analytics Engine</span>
              </div>
            </div>
          </div>

          {/* 9-Point Diagnostic Grid */}
          <div className="bg-white border border-[#E8E9EC] rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="border-b border-[#E8E9EC] pb-3">
              <h3 className="text-base font-bold text-[#17181A]">การวินิจฉัยเชิงลึก 9 มิติ (9-Point Deep Diagnostic)</h3>
              <p className="text-xs text-slate-700 mt-0.5">การประเมินพฤติกรรมคนดูเพื่อนำไปปรับจริตคอนเทนต์และเวลาออกอากาศ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              {/* 1 & 2: Well vs Poorly */}
              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-3">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>✓</span>
                  <span>1. สิ่งที่ทำได้ดีเยี่ยม (Performed Well)</span>
                </div>
                <ul className="space-y-1.5 text-slate-800">
                  {selectedReport.what_performed_well?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-3">
                <div className="font-bold text-rose-400 flex items-center gap-1.5">
                  <span>✗</span>
                  <span>2. สิ่งที่ทำได้ต่ำกว่าเป้า (Performed Poorly)</span>
                </div>
                <ul className="space-y-1.5 text-slate-800">
                  {selectedReport.what_performed_poorly?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3: Themes */}
              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-3">
                <div className="font-bold text-cyan-400">3. ธีมคอนเทนต์ที่เวิร์ก (Themes Worked)</div>
                <ul className="space-y-1.5 text-slate-800">
                  {selectedReport.content_themes_worked?.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>

              {/* 4: Formats */}
              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-3">
                <div className="font-bold text-purple-400">4. รูปแบบสื่อที่เวิร์ก (Formats Worked)</div>
                <ul className="space-y-1.5 text-slate-800">
                  {selectedReport.formats_worked?.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>

              {/* 5: Hooks */}
              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-3">
                <div className="font-bold text-amber-400">5. คำเปิดหัวที่หยุดนิ้ว (Hooks Worked)</div>
                <ul className="space-y-1.5 text-slate-800">
                  {selectedReport.hooks_worked?.map((item, idx) => (
                    <li key={idx} className="italic text-slate-800">
                      "{item}"
                    </li>
                  ))}
                </ul>
              </div>

              {/* 6: Platforms */}
              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-3">
                <div className="font-bold text-blue-400">6. แพลตฟอร์มที่ตอบรับดี (Platforms Worked)</div>
                <ul className="space-y-1.5 text-slate-800">
                  {selectedReport.platforms_worked?.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>

              {/* 7: Repeat */}
              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-3">
                <div className="font-bold text-emerald-400">7. สิ่งที่ควรทำซ้ำ & ขยายผล (Repeat & Scale)</div>
                <ul className="space-y-1.5 text-slate-800">
                  {selectedReport.what_to_repeat?.map((item, idx) => (
                    <li key={idx}>+ {item}</li>
                  ))}
                </ul>
              </div>

              {/* 8: Reduce */}
              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-3">
                <div className="font-bold text-amber-400">8. สิ่งที่ควรลด & หยุดทำ (Reduce & Stop)</div>
                <ul className="space-y-1.5 text-slate-800">
                  {selectedReport.what_to_reduce?.map((item, idx) => (
                    <li key={idx}>- {item}</li>
                  ))}
                </ul>
              </div>

              {/* 9: Test Next */}
              <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-3">
                <div className="font-bold text-indigo-400">9. สิ่งที่ควรทดลองทำถัดไป (Test Next)</div>
                <ul className="space-y-1.5 text-slate-800">
                  {selectedReport.what_to_test_next?.map((item, idx) => (
                    <li key={idx}>? {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-16 text-center text-slate-700 bg-white border border-[#E8E9EC] rounded-3xl space-y-3">
          <BarChart3 className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
          <div className="text-base font-bold text-[#17181A]">ยังไม่มีรายงานสถิติของแบรนด์นี้</div>
          <p className="text-xs text-slate-700 max-w-md mx-auto">
            คุณสามารถคลิกปุ่ม <strong>"➕ บันทึกสถิติด้วยตนเอง"</strong> ด้านบนเพื่อกรอกตัวเลข หรือกด <strong>"🔄 จัดการ & ซิงค์ 13 เพจ"</strong> เพื่อดึงสถิติอัตโนมัติได้ทันทีครับ
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: MANUAL QUICK-ENTRY MODAL                         */}
      {/* ========================================================= */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8E9EC] rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative my-8">
            <button
              onClick={() => setManualModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-[#17181A]">บันทึกสถิติด้วยตนเอง (Manual Quick-Entry)</h3>
              </div>
              <p className="text-xs text-slate-700 mt-1">
                กรอกตัวเลขผลลัพธ์ของโพสต์หรือของเพจ แล้วให้ AI วิเคราะห์ 9 มิติและสรุปโอกาสต่อยอดทันที
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-medium mb-1">เลือกเพจ / แบรนด์:</label>
                  <select
                    value={manualBrand}
                    onChange={(e) => setManualBrand(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#E8E9EC] rounded-xl px-3 py-2 text-[#17181A] font-medium focus:border-blue-500 focus:outline-none"
                  >
                    {BRAND_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-medium mb-1">ช่วงเวลาของข้อมูล (Period):</label>
                  <input
                    type="text"
                    value={manualPeriod}
                    onChange={(e) => setManualPeriod(e.target.value)}
                    placeholder="เช่น สัปดาห์ที่ 1 ก.ย. 2026 หรือ เดือนล่าสุด"
                    className="w-full bg-[#F7F8FA] border border-[#E8E9EC] rounded-xl px-3 py-2 text-[#17181A] focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-[#E8E9EC] space-y-3">
                <div className="font-bold text-[#17181A] text-xs flex items-center justify-between">
                  <span>ตัวเลขผลลัพธ์ (KPI Metrics)</span>
                  <span className="text-[10px] text-slate-700">จดมาจากหน้าแอป Facebook / TikTok / IG</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-700 mb-0.5">Reach (คนเข้าถึง):</label>
                    <input
                      type="number"
                      value={manualMetrics.reach}
                      onChange={(e) => {
                        const r = Number(e.target.value);
                        setManualMetrics({
                          ...manualMetrics,
                          reach: r,
                          engagement_rate: r > 0 ? Number(((manualMetrics.engagement / r) * 100).toFixed(2)) : 0
                        });
                      }}
                      className="w-full bg-[#F7F8FA] border border-[#E8E9EC] rounded-xl px-2.5 py-1.5 text-[#17181A] font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-700 mb-0.5">Impressions (ยอดเห็น):</label>
                    <input
                      type="number"
                      value={manualMetrics.impressions}
                      onChange={(e) => setManualMetrics({ ...manualMetrics, impressions: Number(e.target.value) })}
                      className="w-full bg-[#F7F8FA] border border-[#E8E9EC] rounded-xl px-2.5 py-1.5 text-[#17181A] font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-700 mb-0.5">Engagement (ไลก์/เมนต์):</label>
                    <input
                      type="number"
                      value={manualMetrics.engagement}
                      onChange={(e) => {
                        const eng = Number(e.target.value);
                        setManualMetrics({
                          ...manualMetrics,
                          engagement: eng,
                          engagement_rate: manualMetrics.reach > 0 ? Number(((eng / manualMetrics.reach) * 100).toFixed(2)) : 0
                        });
                      }}
                      className="w-full bg-white border border-[#E8E9EC] rounded-xl px-2.5 py-1.5 text-purple-900 font-mono font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-700 mb-0.5">CTR % (คลิกลิงก์):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualMetrics.ctr}
                      onChange={(e) => setManualMetrics({ ...manualMetrics, ctr: Number(e.target.value) })}
                      className="w-full bg-white border border-[#E8E9EC] rounded-xl px-2.5 py-1.5 text-blue-900 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-700 mb-0.5">Video Views (ยอดวิว):</label>
                    <input
                      type="number"
                      value={manualMetrics.views}
                      onChange={(e) => setManualMetrics({ ...manualMetrics, views: Number(e.target.value) })}
                      className="w-full bg-[#F7F8FA] border border-[#E8E9EC] rounded-xl px-2.5 py-1.5 text-[#17181A] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-700 mb-0.5">Leads (คนทัก Inbox):</label>
                    <input
                      type="number"
                      value={manualMetrics.leads}
                      onChange={(e) => setManualMetrics({ ...manualMetrics, leads: Number(e.target.value) })}
                      className="w-full bg-white border border-[#E8E9EC] rounded-xl px-2.5 py-1.5 text-emerald-900 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-700 mb-0.5">Conversions (ยอดซื้อ):</label>
                    <input
                      type="number"
                      value={manualMetrics.conversions}
                      onChange={(e) => setManualMetrics({ ...manualMetrics, conversions: Number(e.target.value) })}
                      className="w-full bg-white border border-[#E8E9EC] rounded-xl px-2.5 py-1.5 text-amber-900 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-700 mb-0.5">งบโฆษณา (฿ ถ้ามี):</label>
                    <input
                      type="number"
                      value={manualMetrics.cost}
                      onChange={(e) => setManualMetrics({ ...manualMetrics, cost: Number(e.target.value) })}
                      className="w-full bg-white border border-[#E8E9EC] rounded-xl px-2.5 py-1.5 text-[#17181A] font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-medium mb-1">
                  ข้อสังเกตเพิ่มเติม / บริบทของโพสต์:
                </label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="เช่น สัปดาห์นี้เน้นโพสต์ภาพอัลบั้ม 4 รูป ส่องมวลสารพระแท้ มีคนทักถามราคาเยอะมาก..."
                  className="w-full bg-[#F7F8FA] border border-[#E8E9EC] rounded-xl p-3 text-[#17181A] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E8E9EC]">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={manualLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  {manualLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>กำลังวินิจฉัยด้วย AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>⚡ ให้ AI วินิจฉัย 9 มิติทันที</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: MULTI-PAGE SOCIAL ACCOUNTS & AUTO-SYNC DRAWER   */}
      {/* ========================================================= */}
      {socialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8E9EC] rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl relative my-8">
            <button
              onClick={() => setSocialModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E8E9EC] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-[#17181A]">
                    จัดการ & ซิงค์สถิติ 13 เพจโซเชียล (Multi-Page Sync)
                  </h3>
                </div>
                <p className="text-xs text-slate-700 mt-1">
                  รองรับการเชื่อมต่อหลายเพจผ่าน Meta Graph API และระบบซิงค์จำลองอัจฉริยะตามประเภทธุรกิจ
                </p>
              </div>

              <button
                onClick={handleSyncAllAccounts}
                disabled={syncAllLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncAllLoading ? "animate-spin" : ""}`} />
                <span>{syncAllLoading ? "กำลังซิงค์ทั้งหมด..." : "🔄 ซิงค์ทุกเพจพร้อมกัน (Sync All)"}</span>
              </button>
            </div>

            {/* List of Accounts */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {socialAccounts.map((acc) => {
                const isEditing = editingAccountId === acc.id;
                const isSyncing = syncingPageId === acc.id;

                return (
                  <div
                    key={acc.id}
                    className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E8E9EC] hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 font-bold uppercase text-[10px] font-mono">
                          {acc.platform}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#17181A]">{acc.brand_name}</div>
                          <div className="text-[11px] text-slate-700 flex items-center gap-2">
                            <span>{acc.page_name}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500 text-[10px]">ID: {acc.page_id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            acc.status === "CONNECTED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {acc.status === "CONNECTED" ? "● เชื่อมต่อ API สด" : "● จำลองสถิติอัจฉริยะ"}
                        </span>

                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditingAccountId(null);
                            } else {
                              setEditingAccountId(acc.id);
                              setEditPageId(acc.page_id);
                              setEditToken(acc.access_token || "");
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-[#E8E9EC] text-[11px] font-semibold"
                        >
                          {isEditing ? "ปิด" : "⚙️ ตั้งค่า Token"}
                        </button>

                        <button
                          onClick={() => handleSyncAccount(acc)}
                          disabled={isSyncing}
                          className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200 flex items-center gap-1 transition-all"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                          <span>{isSyncing ? "กำลังซิงค์..." : "ซิงค์สถิติ"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Token Editor */}
                    {isEditing && (
                      <div className="p-3.5 rounded-xl bg-white border border-cyan-500/30 space-y-2.5 text-xs animate-fade-in">
                        <div className="text-[11px] font-bold text-blue-900">
                          ตั้งค่า Meta / Platform Access Token สำหรับเพจนี้
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-700 mb-0.5">Page ID:</label>
                            <input
                              type="text"
                              value={editPageId}
                              onChange={(e) => setEditPageId(e.target.value)}
                              placeholder="เช่น 100234567890"
                              className="w-full bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg px-2.5 py-1 text-[#17181A] font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-700 mb-0.5">
                              Page Access Token (จาก Meta Developers):
                            </label>
                            <input
                              type="password"
                              value={editToken}
                              onChange={(e) => setEditToken(e.target.value)}
                              placeholder="EAA..."
                              className="w-full bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg px-2.5 py-1 text-[#17181A] font-mono text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-700">
                            *หากเว้นว่างไว้ ระบบจะใช้เอนจินจำลองตัวเลขเสมือนจริงของ {acc.brand_name}
                          </span>
                          <button
                            onClick={() => handleSaveToken(acc)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                          >
                            บันทึกข้อมูลเพจนี้
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-[#E8E9EC]/40">
                      <span>
                        ซิงค์ล่าสุด:{" "}
                        <strong className="text-slate-700">
                          {acc.last_synced_at ? new Date(acc.last_synced_at).toLocaleString("th-TH") : "ยังไม่เคยซิงค์"}
                        </strong>
                      </span>
                      <span>รองรับ Webhook อัตโนมัติ</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
