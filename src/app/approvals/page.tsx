"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Facebook,
  Instagram,
  Video,
  Twitter,
  Citrus,
  Layers,
  Copy,
  Check,
  Edit3,
  Save,
  Trash2,
  ShieldCheck,
  Send,
  Sparkles,
  ArrowRight,
  Clock,
  ExternalLink
} from "lucide-react";
import { ApprovalItem } from "@/types";

const PLATFORM_TABS = [
  { id: "all", label: "ทั้งหมด", icon: Layers, color: "text-slate-400" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-400" },
  { id: "tiktok", label: "TikTok", icon: Video, color: "text-rose-400" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "text-fuchsia-400" },
  { id: "x", label: "X (Twitter)", icon: Twitter, color: "text-sky-400" },
  { id: "lemon8", label: "Lemon8", icon: Citrus, color: "text-amber-400" }
];

export default function PublishingQueuePage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/approvals");
      const data = await res.json();
      if (data.approvals) {
        setApprovals(data.approvals);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = async (id: string, action: "APPROVE" | "EXECUTE" | "REJECT" | "DELETE") => {
    try {
      if (action === "DELETE") {
        const res = await fetch(`/api/approvals?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          setApprovals(prev => prev.filter(a => a.id !== id));
          setNotification("ลบรายการออกจากคิวเรียบร้อย");
          setTimeout(() => setNotification(null), 3000);
        }
        return;
      }

      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, reviewer: "Marketing Lead" })
      });
      const data = await res.json();
      if (data.success && data.approval) {
        setApprovals(prev => prev.map(a => a.id === id ? data.approval : a));
        const msg = action === "APPROVE" ? "✓ อนุมัติคอนเทนต์พร้อมโพสต์แล้ว" : "ส่งเข้าตัวโพสต์เรียบร้อย (Executed)";
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action: "EDIT",
          title: editTitle,
          content_preview: editContent
        })
      });
      const data = await res.json();
      if (data.success && data.approval) {
        setApprovals(prev => prev.map(a => a.id === id ? data.approval : a));
        setEditingId(null);
        setNotification("บันทึกการแก้ไขข้อความเรียบร้อย!");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter items by tab
  const filteredQueue = approvals.filter(item => {
    if (activeTab === "all") return true;
    const itemPlatform = (item.entity_type || (item as any).platform || "").toLowerCase();
    return itemPlatform.includes(activeTab) || item.title.toLowerCase().includes(activeTab);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white border border-[#E8E9EC] rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>STAGE 04 · APPROVE / 5: PUBLISHING QUEUE & APPROVALS</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              4. คิวรอโพสต์แยกตามแพลตฟอร์ม
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              ตรวจสอบคอนเทนต์ที่จัดเตรียมไว้สำหรับแต่ละแพลตฟอร์ม สามารถกดแก้ไขข้อความ ตรวจทานความถูกต้อง และกดส่งต่อไปยัง <strong className="text-blue-400">Step 5: ตัวโพสต์โซเชียลอัตโนมัติ</strong>
            </p>
          </div>

          <Link
            href="/publisher"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
          >
            <span>ไปที่ Step 5: ตัวโพสต์โซเชียลอัตโนมัติ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {notification && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs shadow-md animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Platform Tabs */}
      <div className="flex border-b border-[#E8E9EC] bg-white rounded-2xl p-2 gap-1 overflow-x-auto">
        {PLATFORM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = approvals.filter(item => {
            if (tab.id === "all") return true;
            const p = (item.entity_type || (item as any).platform || "").toLowerCase();
            return p.includes(tab.id) || item.title.toLowerCase().includes(tab.id);
          }).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive ? "bg-[#17181A] text-white shadow-luxury-sm font-bold" : "text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? tab.color : "text-slate-500"}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                isActive ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-700 font-semibold"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Queue Items List */}
      <div className="space-y-4">
        {filteredQueue.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E9EC] text-slate-400 space-y-3">
            <CheckSquare className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">ยังไม่มีคอนเทนต์ในคิวสำหรับหมวดหมู่นี้</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              เมื่อคุณแปลงคอนเทนต์ใน Step 3 (Repurpose Studio) แล้วกดปุ่ม &ldquo;ส่งเข้าคิวรอโพสต์&rdquo; คอนเทนต์จะมาปรากฏในหน้านี้ตามแพลตฟอร์มโดยอัตโนมัติครับ
            </p>
            <Link
              href="/repurpose"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
            >
              <span>ไปที่ Step 3: แปลงคอนเทนต์</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          filteredQueue.map((item) => {
            const isEditing = editingId === item.id;
            const isApproved = item.status === "APPROVED";
            const isExecuted = item.status === "EXECUTED";

            return (
              <div
                key={item.id}
                className="bg-white border border-[#E8E9EC] rounded-2xl p-5 shadow-lg space-y-4 hover:border-[#D1D5DB] transition-all"
              >
                {/* Card Top: Platform Tag + Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                      {item.entity_type || "SOCIAL POST"}
                    </span>
                    <span className="text-xs text-slate-400">แหล่งที่มา: {item.source}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isExecuted ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-semibold">
                        ✓ โพสต์แล้ว (Executed)
                      </span>
                    ) : isApproved ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        ✓ อนุมัติแล้ว (พร้อมโพสต์)
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                        รอตรวจทาน (Review)
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Layout with Media */}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {(item as any).image_url && (
                    <div className="w-full sm:w-44 h-36 rounded-xl overflow-hidden bg-[#F7F8FA] border border-[#E8E9EC] shrink-0">
                      <img
                        src={(item as any).image_url}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-2 w-full">
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#F7F8FA] border border-amber-500/60 text-xs font-bold text-slate-900 focus:outline-none"
                        />
                        <textarea
                          rows={6}
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="w-full p-3 rounded-xl bg-[#F7F8FA] border border-amber-500/60 text-xs text-slate-800 leading-relaxed font-sans focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-[#E8E9EC]"
                          >
                            ยกเลิก
                          </button>
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>บันทึก</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditTitle(item.title);
                              setEditContent(item.content_preview);
                            }}
                            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>แก้ไขข้อความ</span>
                          </button>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed font-sans max-h-48 overflow-y-auto">
                          {item.content_preview}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Action Ribbon */}
                <div className="pt-3 border-t border-[#E8E9EC] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyText(item.content_preview, item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-[#E8E9EC] transition-colors"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === item.id ? "คัดลอกแล้ว" : "คัดลอกไปโพสต์เอง"}</span>
                    </button>

                    <button
                      onClick={() => handleAction(item.id, "DELETE")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบ</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isApproved && (
                      <button
                        onClick={() => handleAction(item.id, "APPROVE")}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>✓ อนุมัติ (Approve)</span>
                      </button>
                    )}

                    <Link
                      href="/publisher"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#17181A] hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ส่งเข้าตัวโพสต์อัตโนมัติ (Step 5) ➔</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
