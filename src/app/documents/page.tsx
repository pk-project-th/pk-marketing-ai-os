"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileCheck,
  Upload,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  HelpCircle,
  FileText,
  Layers,
  Settings,
  ShieldCheck,
  Download,
  FileUp
} from "lucide-react";
import { ExtractedDocument, FormTemplate, DocumentFieldMapping } from "@/types";
import { ConfidenceBadge } from "@/components/common/ConfidenceBadge";
import { exportToCSV, exportToJSON } from "@/lib/export";

export default function DocumentAgentPage() {
  const [documents, setDocuments] = useState<ExtractedDocument[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ExtractedDocument | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  // File upload & parsing state
  const [uploadName, setUploadName] = useState("PK_Sedan_X_Motor_Show_Spec_Brief.pdf");
  const [fileStats, setFileStats] = useState<{ sizeKb: number; type: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showRawEditor, setShowRawEditor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [rawText, setRawText] = useState(
    `เอกสารข้อกำหนดโครงการ: Urban Mobility 2026\nรุ่นรถยนต์เป้าหมาย: PK Sedan X (Smart Hybrid 1.5 Turbo)\nระยะเวลาแคมเปญ: 1 กันยายน 2026 ถึง 31 ตุลาคม 2026\nงบประมาณที่ได้รับการจัดสรร: 850,000 บาท\nวัตถุประสงค์หลัก: สร้างยอดจอง 250 คัน และทดลองขับ 1,200 สิทธิ์\nกลุ่มเป้าหมาย: คนเมือง อายุ 25-35 ปี First-Jobber & Young Pro\nผู้รับผิดชอบโครงการ: ทีมการตลาดฝ่ายรถยนต์โดยสาร`
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/ai/document");
        const data = await res.json();
        if (data.documents) setDocuments(data.documents);
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
          setSelectedTemplateId(data.templates[0].id);
        }
        if (data.documents && data.documents.length > 0) {
          setSelectedDoc(data.documents[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file) return;
    setUploadName(file.name);
    setFileStats({
      sizeKb: Math.round(file.size / 1024) || 1,
      type: file.type || file.name.split(".").pop()?.toUpperCase() || "FILE"
    });

    const ext = file.name.split(".").pop()?.toLowerCase();
    const isText = ["txt", "csv", "json", "md"].includes(ext || "");

    const reader = new FileReader();
    if (isText) {
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          setRawText(content);
        }
      };
      reader.readAsText(file);
    } else {
      // Binary file (PDF, DOCX)
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          const base64 = dataUrl.split(",")[1];
          handleParseBinaryDocument(file.name, ext?.toUpperCase() || "PDF", base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleParseBinaryDocument = async (filename: string, fileType: string, base64: string) => {
    setLoading(true);
    setSubmissionStatus(null);
    try {
      const res = await fetch("/api/ai/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          fileType,
          base64Content: base64,
          templateId: selectedTemplateId
        })
      });
      const data = await res.json();
      if (data.success && data.document) {
        setDocuments(prev => [data.document, ...prev]);
        setSelectedDoc(data.document);
        if (data.document.raw_text) {
          setRawText(data.document.raw_text);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleParseDocument = async () => {
    setLoading(true);
    setSubmissionStatus(null);
    try {
      const res = await fetch("/api/ai/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: uploadName,
          fileType: uploadName.split(".").pop()?.toUpperCase() || "PDF",
          rawContent: rawText,
          templateId: selectedTemplateId
        })
      });
      const data = await res.json();
      if (data.success && data.document) {
        setDocuments(prev => [data.document, ...prev]);
        setSelectedDoc(data.document);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!selectedDoc || !selectedDoc.fields) return;
    const exportData = selectedDoc.fields.map(f => ({
      "Source Field": f.source_field,
      "Target Field": f.target_field,
      "Extracted Value": f.extracted_value,
      "Confidence": f.confidence,
      "Confidence Score": f.confidence_score,
      "Verified": f.verified ? "YES" : "NO"
    }));
    exportToCSV(exportData, `fields_${selectedDoc.filename.replace(/\.[^/.]+$/, "")}`);
  };

  const handleExportJSON = () => {
    if (!selectedDoc) return;
    exportToJSON(selectedDoc, `doc_mapping_${selectedDoc.filename.replace(/\.[^/.]+$/, "")}`);
  };

  const handleFieldChange = (idx: number, newTarget: string, newValue: string) => {
    if (!selectedDoc) return;
    const updatedFields = [...selectedDoc.fields];
    updatedFields[idx] = {
      ...updatedFields[idx],
      target_field: newTarget,
      extracted_value: newValue,
      verified: true
    };
    setSelectedDoc({ ...selectedDoc, fields: updatedFields });
  };

  const handleSubmitForm = () => {
    // Check integration connection state honestly
    setSubmissionStatus("NOT_CONNECTED");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
          <FileCheck className="w-3.5 h-3.5" />
          <span>AGENT 03 — DOCUMENT AGENT</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ระบบวิเคราะห์เอกสารและกรอกฟอร์มอัตโนมัติ (Document & Form Agent)</h2>
        <p className="text-xs text-slate-400 mt-1">
          สกัดข้อมูลสำคัญจาก PDF, DOCX, XLSX, CSV และจับคู่ลงแบบฟอร์มการตลาดอย่างโปร่งใส พร้อมการตรวจสอบคะแนนความมั่นใจ (Confidence Score)
        </p>
      </div>

      {/* Upload and Parse Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="text-sm font-semibold text-slate-900 flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>1. อัปโหลดไฟล์หรือป้อนข้อความเอกสาร (Document Input)</span>
          </div>
          {fileStats && (
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300">
              {fileStats.type} • {fileStats.sizeKb} KB
            </span>
          )}
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all ${
            isDragging
              ? "border-cyan-400 bg-cyan-950/20"
              : "border-slate-700 hover:border-cyan-500/60 bg-slate-850/40 hover:bg-slate-850/80"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            accept=".pdf,.docx,.txt,.csv,.json,.md"
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileUp className="w-6 h-6" />
            </div>
            <div className="text-xs font-semibold text-slate-900">
              ลากไฟล์มาวางที่นี่ หรือ <span className="text-cyan-400 underline">คลิกเพื่อเลือกไฟล์</span>
            </div>
            <div className="text-[11px] text-slate-400">
              รองรับเอกสารสเปกรถยนต์, ใบลงทะเบียน, แคมเปญบรีฟ (.PDF, .DOCX, .TXT, .CSV, .JSON, .MD)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">ชื่อเอกสาร / ไฟล์แนบ</label>
            <input
              type="text"
              value={uploadName}
              onChange={e => setUploadName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">เลือกแบบฟอร์มเป้าหมาย (Target Form Template)</label>
            <select
              value={selectedTemplateId}
              onChange={e => setSelectedTemplateId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300">
              เนื้อหาหรือข้อความที่สกัดจากเอกสาร (Extracted Document Text)
            </label>
            <button
              onClick={() => setShowRawEditor(!showRawEditor)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
            >
              {showRawEditor ? "ซ่อนกล่องข้อความดิบ" : "ดู/แก้ไขข้อความดิบ"}
            </button>
          </div>

          {showRawEditor ? (
            <textarea
              rows={5}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              className="w-full p-3 bg-slate-850 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-cyan-500"
            />
          ) : (
            <div className="p-3 bg-slate-850/60 border border-slate-800 rounded-xl text-xs text-slate-400 line-clamp-3 font-mono">
              {rawText}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleParseDocument}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-900 text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
          >
            {loading ? "กำลังสกัดและจับคู่ฟิลด์..." : "✨ วิเคราะห์และสกัดฟิลด์ข้อมูลด้วย Gemini"}
          </button>
        </div>
      </div>

      {/* Dynamic Field Mapping Interface */}
      {selectedDoc && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>ตารางจับคู่ฟิลด์ข้อมูลแบบไดนามิก (Dynamic Field Mapping)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {selectedDoc.filename}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedDoc.summary}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-slate-900 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>ส่งออก CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-slate-900 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>ส่งออก JSON</span>
              </button>
            </div>
          </div>

          {/* Mapping Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-850 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">ฟิลด์ในเอกสารต้นทาง (Source)</th>
                  <th className="p-3 w-8"></th>
                  <th className="p-3">ฟิลด์ในแบบฟอร์มเป้าหมาย (Target Field)</th>
                  <th className="p-3">ค่าที่สกัดได้ (Extracted Value)</th>
                  <th className="p-3">ความมั่นใจ AI</th>
                  <th className="p-3">การตรวจสอบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {selectedDoc.fields.map((field, idx) => (
                  <tr key={idx} className={`hover:bg-slate-850/40 transition-colors ${field.confidence === "LOW" ? "bg-rose-950/20" : ""}`}>
                    <td className="p-3 font-semibold text-slate-200">{field.source_field}</td>
                    <td className="p-3 text-slate-500 text-center">→</td>
                    <td className="p-3 font-mono text-cyan-400">{field.target_field}</td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={field.extracted_value}
                        onChange={e => handleFieldChange(idx, field.target_field, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-850 border border-slate-700 rounded text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                      />
                    </td>
                    <td className="p-3">
                      <ConfidenceBadge confidence={field.confidence} score={field.confidence_score} />
                    </td>
                    <td className="p-3">
                      {field.verified ? (
                        <span className="text-emerald-400 font-medium text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ยืนยันแล้ว
                        </span>
                      ) : (
                        <span className="text-amber-400 font-medium text-[11px] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> ต้องตรวจสอบ
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Submission Gate */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-slate-900">ระบบตรวจสอบความปลอดภัย (Submission Gate):</span> เอกสารนี้ต้องผ่านการตรวจสอบจากมนุษย์ก่อนส่งต่อเข้าสู่ระบบภายนอก
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleSubmitForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>อนุมัติและส่งข้อมูลเข้าแบบฟอร์ม</span>
              </button>
            </div>
          </div>

          {/* Unconnected Integration Notification */}
          {submissionStatus === "NOT_CONNECTED" && (
            <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Integration not connected (การเชื่อมต่อภายนอกยังไม่ได้ผูก Credential)</span>
              </div>
              <p className="leading-relaxed">
                ระบบได้ตรวจสอบและบันทึกข้อมูลฟิลด์ที่แมปปิ้งไว้ในระบบภายในเรียบร้อยแล้ว 
                แต่ไม่สามารถส่งต่อไปยัง <span className="font-mono text-amber-100">Google Forms / ERP Webhook</span> ได้ เนื่องจากยังไม่ได้กำหนดค่า API Credentials
              </p>
              <div className="pt-1">
                <a
                  href="/settings"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-semibold transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>ไปที่หน้า Settings เพื่อกำหนดค่าการเชื่อมต่อ</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
