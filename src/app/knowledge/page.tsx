"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, ShieldCheck, CheckCircle2, AlertTriangle, Plus, Search, Tag, FileText } from "lucide-react";
import { KnowledgeDocument } from "@/types";

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New doc form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"BRAND" | "PRODUCT" | "CAMPAIGN" | "CONTENT" | "TEMPLATES">("PRODUCT");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/knowledge");
      const data = await res.json();
      if (data.documents && data.documents.length > 0) {
        setDocs(data.documents);
        setSelectedDoc(data.documents[0]);
      }
    } catch (err) {
      console.error("Failed to load knowledge documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          content: newContent,
          tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
          verified: true
        })
      });
      const data = await res.json();
      if (data.success && data.document) {
        setDocs(prev => [data.document, ...prev]);
        setSelectedDoc(data.document);
        setShowAddModal(false);
        setNewTitle("");
        setNewContent("");
        setNewTags("");
        setNotification(`เพิ่มเอกสาร "${data.document.title}" เรียบร้อยแล้ว`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDocs = docs.filter(d => {
    if (activeCategory !== "ALL" && d.category !== activeCategory) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E9EC] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 font-bold text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>SOURCE-OF-TRUTH ENGINE</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">คลังความรู้แบรนด์และสเปก (Knowledge Base)</h2>
          <p className="text-xs text-slate-700 mt-1">
            ศูนย์รวมข้อมูลผลิตภัณฑ์ คำเคลมที่ได้รับอนุมัติ และแนวทางการสื่อสาร — AI จะดึงความรู้นี้ก่อนสร้างคอนเทนต์เสมอ เพื่อป้องกันข้อมูลเท็จ
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มเอกสารความรู้</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Source of truth hierarchy banner */}
      <div className="p-4 rounded-xl bg-white border border-[#E8E9EC] flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-800">ลำดับความสำคัญของข้อมูล:</span>
          <span className="font-semibold text-emerald-400">1. ข้อมูลที่ผู้ใช้ยืนยัน</span>
          <span className="text-slate-500">→</span>
          <span className="font-semibold text-blue-700 font-bold">2. คลังความรู้นี้ (Knowledge Base)</span>
          <span className="text-slate-500">→</span>
          <span className="text-slate-700">3. ฐานข้อมูลธุรกิจ</span>
          <span className="text-slate-500">→</span>
          <span className="text-slate-500">4. ความรู้ทั่วไปของ AI</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 4 Cols: Document List & Categories */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-700" />
            <input
              type="text"
              placeholder="ค้นหาตามชื่อหรือเนื้อหา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E8E9EC] rounded-lg text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs">
            {["ALL", "BRAND", "PRODUCT", "CAMPAIGN", "TEMPLATES"].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeCategory === cat ? "bg-blue-600 text-slate-900" : "bg-white border border-[#E8E9EC] text-slate-700 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedDoc?.id === doc.id
                    ? "bg-slate-850 border-blue-500/60 shadow-md"
                    : "bg-white border-[#E8E9EC] hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-700 font-bold uppercase">
                    {doc.category}
                  </span>
                  {doc.verified && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> ยืนยันแล้ว
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-900 line-clamp-2">{doc.title}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {doc.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 8 Cols: Viewer */}
        <div className="lg:col-span-8">
          {selectedDoc ? (
            <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-start justify-between border-b border-[#E8E9EC] pb-4">
                <div>
                  <div className="text-xs font-mono text-blue-700 font-bold uppercase mb-1">หมวดหมู่: {selectedDoc.category}</div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedDoc.title}</h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approved Source-of-Truth</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                {selectedDoc.content}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-700 bg-white border border-[#E8E9EC] rounded-2xl">
              เลือกเอกสารจากรายการเพื่อดูรายละเอียด
            </div>
          )}
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#E8E9EC] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-[#E8E9EC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-700 font-bold" />
                <h3 className="text-base font-bold text-slate-900">เพิ่มเอกสารความรู้ (Source-of-Truth)</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-700 hover:text-slate-900 text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-medium mb-1">หมวดหมู่ (Category)</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="PRODUCT">PRODUCT (สเปกรถยนต์ / การรับประกัน)</option>
                    <option value="BRAND">BRAND (Brand Voice & Guidelines)</option>
                    <option value="CAMPAIGN">CAMPAIGN (ข้อมูลแคมเปญ & ข้อเสนอ)</option>
                    <option value="CONTENT">CONTENT (แนวทางคอนเทนต์)</option>
                    <option value="TEMPLATES">TEMPLATES (แม่แบบการบรีฟ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-medium mb-1">แท็ก (Tags คั่นด้วยจุลภาค)</label>
                  <input
                    type="text"
                    placeholder="เช่น Hybrid, Warranty, Fuel Economy"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-medium mb-1">ชื่อเอกสาร (Document Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ข้อมูลทางเทคนิคและอัตราสิ้นเปลือง PK Sedan X 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-medium mb-1">เนื้อหาเอกสาร (Markdown content) *</label>
                <textarea
                  rows={8}
                  required
                  placeholder="# หัวข้อเอกสาร&#10;&#10;## ข้อมูลสำคัญและสเปกที่ได้รับการรับรอง&#10;- จุดเด่น 1...&#10;- คำเคลมที่ได้รับอนุญาต..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-3 bg-slate-850 border border-slate-700 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E9EC] flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  เอกสารนี้จะถูกบันทึกเป็น Verified Source-of-Truth สำหรับ AI
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-700 text-slate-800 rounded-lg hover:bg-slate-800"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold rounded-lg shadow-md shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isSubmitting ? "กำลังบันทึก..." : "บันทึกเอกสาร"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
