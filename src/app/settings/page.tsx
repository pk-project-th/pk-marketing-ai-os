"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Settings,
  Shield,
  Key,
  Network,
  Cloud,
  Layers,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  Database,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  BookOpen,
  ExternalLink,
  Bot,
  Image as ImageIcon,
  Zap,
  Info,
  Activity,
  Cpu,
  BarChart3,
  Clock,
  DollarSign,
  ChevronRight,
  HelpCircle,
  Check
} from "lucide-react";
import { SystemSettings, AuditLog, AIGenerationLog } from "@/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    gemini_api_key: "",
    openai_api_key: "",
    default_ai_engine: "groq",
    gemini_model: "gemini-3.8-flash",
    gemini_thinking_effort: "high",
    n8n_base_url: "",
    n8n_api_key: "",
    n8n_webhook_url: "",
    google_drive_status: "NOT_CONNECTED",
    google_sheets_status: "NOT_CONNECTED",
    google_forms_status: "NOT_CONNECTED",
    image_gen_provider: "NONE",
    custom_image_api_key: "",
    social_publisher_status: "NOT_CONNECTED"
  });

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [openaiKeyInput, setOpenaiKeyInput] = useState("");
  const [openaiBackupKeyInput, setOpenaiBackupKeyInput] = useState("");
  const [geminiBackupKeyInput, setGeminiBackupKeyInput] = useState("");
  const [groqKeyInput, setGroqKeyInput] = useState("");
  const [openrouterKeyInput, setOpenrouterKeyInput] = useState("");
  const [autoFailoverEnabled, setAutoFailoverEnabled] = useState(true);
  const [customImageKeyInput, setCustomImageKeyInput] = useState("");
  const [n8nWebhookInput, setN8nWebhookInput] = useState("");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [aiGenerations, setAiGenerations] = useState<AIGenerationLog[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [storageMode, setStorageMode] = useState<string>("LOCAL_JSON");
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{ success: boolean; message: string; model?: string } | null>(null);
  const [testingGeminiBackup, setTestingGeminiBackup] = useState(false);
  const [geminiBackupTestResult, setGeminiBackupTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingOpenai, setTestingOpenai] = useState(false);
  const [openaiTestResult, setOpenaiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingOpenaiBackup, setTestingOpenaiBackup] = useState(false);
  const [openaiBackupTestResult, setOpenaiBackupTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingGroq, setTestingGroq] = useState(false);
  const [groqTestResult, setGroqTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingOpenrouter, setTestingOpenrouter] = useState(false);
  const [openrouterTestResult, setOpenrouterTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseStatusText, setSupabaseStatusText] = useState<string | null>(null);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGeminiBackupKey, setShowGeminiBackupKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showOpenaiBackupKey, setShowOpenaiBackupKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showOpenrouterKey, setShowOpenrouterKey] = useState(false);
  const [showImageKey, setShowImageKey] = useState(false);
  const [activeTab, setActiveTab] = useState<"CONFIG" | "USAGE" | "GUIDE">("CONFIG");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        if (data.settings.gemini_api_key) setApiKeyInput(data.settings.gemini_api_key);
        if (data.settings.gemini_backup_api_key) setGeminiBackupKeyInput(data.settings.gemini_backup_api_key);
        if (data.settings.openai_api_key) setOpenaiKeyInput(data.settings.openai_api_key);
        if (data.settings.openai_backup_api_key) setOpenaiBackupKeyInput(data.settings.openai_backup_api_key);
        if (data.settings.groq_api_key) setGroqKeyInput(data.settings.groq_api_key);
        if (data.settings.openrouter_api_key) setOpenrouterKeyInput(data.settings.openrouter_api_key);
        if (data.settings.auto_failover_enabled !== undefined) setAutoFailoverEnabled(data.settings.auto_failover_enabled);
        if (data.settings.custom_image_api_key) setCustomImageKeyInput(data.settings.custom_image_api_key);
        if (data.settings.n8n_webhook_url) setN8nWebhookInput(data.settings.n8n_webhook_url);
        if (data.settings.storage_mode) setStorageMode(data.settings.storage_mode);
        if (data.settings.supabase_status?.message) setSupabaseStatusText(data.settings.supabase_status.message);
      }
      if (data.auditLogs) {
        setAuditLogs(data.auditLogs);
      }
      if (data.aiGenerations) {
        setAiGenerations(data.aiGenerations);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Usage statistics calculations
  const usageStats = useMemo(() => {
    const totalCalls = aiGenerations.length;
    const totalTokens = aiGenerations.reduce((acc, g) => acc + (g.total_tokens || 0), 0);
    const promptTokens = aiGenerations.reduce((acc, g) => acc + (g.prompt_tokens || 0), 0);
    const completionTokens = aiGenerations.reduce((acc, g) => acc + (g.completion_tokens || 0), 0);
    const avgLatency = totalCalls > 0 ? Math.round(aiGenerations.reduce((acc, g) => acc + (g.latency_ms || 0), 0) / totalCalls) : 0;
    const totalCostUsd = aiGenerations.reduce((acc, g) => acc + (g.cost_usd || 0), 0);

    // Group by model
    const modelBreakdown: Record<string, { count: number; tokens: number }> = {};
    aiGenerations.forEach(g => {
      const m = g.model || "Unknown";
      if (!modelBreakdown[m]) modelBreakdown[m] = { count: 0, tokens: 0 };
      modelBreakdown[m].count += 1;
      modelBreakdown[m].tokens += (g.total_tokens || 0);
    });

    return {
      totalCalls,
      totalTokens,
      promptTokens,
      completionTokens,
      avgLatency,
      totalCostUsd,
      modelBreakdown
    };
  }, [aiGenerations]);

  const handleTestGemini = async () => {
    setTestingGemini(true);
    setGeminiTestResult(null);
    try {
      const trimmed = apiKeyInput.trim();
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_GEMINI",
          gemini_api_key: trimmed.startsWith("••••") ? undefined : trimmed,
          gemini_model: settings.gemini_model
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeminiTestResult({
          success: true,
          message: data.message || `เชื่อมต่อสำเร็จ! (${data.latencyMs}ms, Model: ${data.model})`,
          model: data.model
        });
        fetchSettings(); // refresh logs
      } else {
        setGeminiTestResult({
          success: false,
          message: data.message || data.error || "เกิดข้อผิดพลาดในการเชื่อมต่อ"
        });
      }
    } catch (err: any) {
      setGeminiTestResult({
        success: false,
        message: err.message || "Network Error"
      });
    } finally {
      setTestingGemini(false);
    }
  };

  const handleTestOpenai = async () => {
    setTestingOpenai(true);
    setOpenaiTestResult(null);
    try {
      const trimmed = openaiKeyInput.trim();
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_OPENAI",
          openai_api_key: trimmed.startsWith("••••") ? undefined : trimmed
        })
      });
      const data = await res.json();
      if (data.success) {
        setOpenaiTestResult({
          success: true,
          message: data.message
        });
      } else {
        setOpenaiTestResult({
          success: false,
          message: data.message || "การเชื่อมต่อล้มเหลว"
        });
      }
    } catch (err: any) {
      setOpenaiTestResult({
        success: false,
        message: err.message || "Network Error"
      });
    } finally {
      setTestingOpenai(false);
    }
  };

  const handleTestOpenaiBackup = async () => {
    setTestingOpenaiBackup(true);
    setOpenaiBackupTestResult(null);
    try {
      const trimmed = openaiBackupKeyInput.trim();
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_OPENAI_BACKUP",
          openai_backup_api_key: trimmed.startsWith("••••") ? undefined : trimmed
        })
      });
      const data = await res.json();
      setOpenaiBackupTestResult({
        success: data.success,
        message: data.message || (data.success ? "เชื่อมต่อ OpenAI Backup สำเร็จ" : "เชื่อมต่อไม่สำเร็จ")
      });
    } catch (err: any) {
      setOpenaiBackupTestResult({ success: false, message: err.message || "Network Error" });
    } finally {
      setTestingOpenaiBackup(false);
    }
  };

  const handleTestGeminiBackup = async () => {
    setTestingGeminiBackup(true);
    setGeminiBackupTestResult(null);
    try {
      const trimmed = geminiBackupKeyInput.trim();
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_GEMINI_BACKUP",
          gemini_backup_api_key: trimmed.startsWith("••••") ? undefined : trimmed
        })
      });
      const data = await res.json();
      setGeminiBackupTestResult({
        success: data.success,
        message: data.message || (data.success ? "เชื่อมต่อ Gemini Backup สำเร็จ" : "เชื่อมต่อไม่สำเร็จ")
      });
    } catch (err: any) {
      setGeminiBackupTestResult({ success: false, message: err.message || "Network Error" });
    } finally {
      setTestingGeminiBackup(false);
    }
  };

  const handleTestGroq = async () => {
    setTestingGroq(true);
    setGroqTestResult(null);
    try {
      const trimmed = groqKeyInput.trim();
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_GROQ",
          groq_api_key: trimmed.startsWith("••••") ? undefined : trimmed
        })
      });
      const data = await res.json();
      setGroqTestResult({
        success: data.success,
        message: data.message || (data.success ? "เชื่อมต่อ Groq สำเร็จ" : "เชื่อมต่อไม่สำเร็จ")
      });
    } catch (err: any) {
      setGroqTestResult({ success: false, message: err.message || "Network Error" });
    } finally {
      setTestingGroq(false);
    }
  };

  const handleTestOpenrouter = async () => {
    setTestingOpenrouter(true);
    setOpenrouterTestResult(null);
    try {
      const trimmed = openrouterKeyInput.trim();
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_OPENROUTER",
          openrouter_api_key: trimmed.startsWith("••••") ? undefined : trimmed
        })
      });
      const data = await res.json();
      setOpenrouterTestResult({
        success: data.success,
        message: data.message || (data.success ? "เชื่อมต่อ OpenRouter สำเร็จ" : "เชื่อมต่อไม่สำเร็จ")
      });
    } catch (err: any) {
      setOpenrouterTestResult({ success: false, message: err.message || "Network Error" });
    } finally {
      setTestingOpenrouter(false);
    }
  };

  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TEST_SUPABASE" })
      });
      const data = await res.json();
      if (data.status) {
        setStorageMode(data.status.mode);
        setSupabaseStatusText(data.status.message);
      }
    } catch (err: any) {
      setSupabaseStatusText("ตรวจสอบล้มเหลว: " + err.message);
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<SystemSettings> = {
        ...settings,
        gemini_api_key: apiKeyInput.startsWith("••••") ? undefined : apiKeyInput,
        gemini_backup_api_key: geminiBackupKeyInput.startsWith("••••") ? undefined : geminiBackupKeyInput,
        openai_api_key: openaiKeyInput.startsWith("••••") ? undefined : openaiKeyInput,
        openai_backup_api_key: openaiBackupKeyInput.startsWith("••••") ? undefined : openaiBackupKeyInput,
        groq_api_key: groqKeyInput.startsWith("••••") ? undefined : groqKeyInput,
        openrouter_api_key: openrouterKeyInput.startsWith("••••") ? undefined : openrouterKeyInput,
        auto_failover_enabled: autoFailoverEnabled,
        custom_image_api_key: customImageKeyInput.startsWith("••••") ? undefined : customImageKeyInput,
        n8n_webhook_url: n8nWebhookInput
      };
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setNotification("✓ บันทึกการตั้งค่าระบบ, คีย์สำรอง และโหมด Auto-Failover เรียบร้อยแล้ว");
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E9EC] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-[#E8E9EC] text-slate-800 text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5 text-blue-400" />
            <span>SYSTEM HUB & API ORCHESTRATION</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#17181A] tracking-tight">การตั้งค่าและศูนย์ควบคุม API (Settings & Usage)</h2>
          <p className="text-xs text-slate-700 mt-1">
            เลือกโมเดล Gemini Pro / Flash, ตรวจสอบปริมาณการใช้งาน API Usage, ดูคำแนะนำการเชื่อมต่อ และจัดการ Credentials
          </p>
        </div>

        {notification && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs shadow-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-[#E8E9EC] gap-2">
        <button
          onClick={() => setActiveTab("CONFIG")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
            activeTab === "CONFIG"
              ? "bg-[#17181A] border-[#17181A] text-white font-bold"
              : "border-transparent text-slate-700 hover:text-slate-950"
          }`}
        >
          <Key className="w-4 h-4 text-blue-400" />
          <span>การตั้งค่าโมเดล & API (API Config)</span>
        </button>
        <button
          onClick={() => setActiveTab("USAGE")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
            activeTab === "USAGE"
              ? "bg-[#17181A] border-[#17181A] text-white font-bold"
              : "border-transparent text-slate-700 hover:text-slate-950"
          }`}
        >
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>ปริมาณการใช้งาน (API Usage & Quota)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] text-cyan-300">
            {usageStats.totalCalls} ครั้ง
          </span>
        </button>
        <button
          onClick={() => setActiveTab("GUIDE")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
            activeTab === "GUIDE"
              ? "bg-[#17181A] border-[#17181A] text-white font-bold"
              : "border-transparent text-slate-700 hover:text-slate-950"
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span>คู่มือเชื่อมต่อ & คำแนะนำโมเดล (Guide)</span>
        </button>
      </div>

      {/* TAB 1: API CONFIGURATION */}
      {activeTab === "CONFIG" && (
        <form onSubmit={handleSave} className="space-y-6 animate-fade-in">
          {/* AUTO-FAILOVER SMART RESILIENCE CONTROLLER */}
          <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#17181A]">⚡ ระบบ Auto-Failover สลับผู้ให้บริการอัตโนมัติเมื่อโควต้าหมด</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Zero Interruption
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    ป้องกันระบบหยุดชะงัก: เมื่อ API โควต้าหมด (Error 429) ระบบจะสลับไปใช้คีย์สำรอง หรือโมเดลฟรี (Groq / OpenRouter) หรือ Built-in Engine ทันที
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoFailoverEnabled}
                  onChange={e => setAutoFailoverEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2.5 text-xs font-bold text-[#17181A]">
                  {autoFailoverEnabled ? "เปิดใช้งาน (Auto)" : "ปิดการสลับ"}
                </span>
              </label>
            </div>

            {/* Preferred Engine Selector */}
            <div className="bg-white/90 border border-amber-200 rounded-xl p-3.5 space-y-2">
              <label className="text-xs font-bold text-[#17181A] flex items-center justify-between">
                <span>🎯 ลำดับโมเดลหลักที่ต้องการให้ระบบเรียกใช้เป็นอันดับ 1 (Default AI Engine):</span>
                <span className="text-[10px] text-amber-700 font-normal">หากโควต้าหมด ระบบจะสลับไปยังอันดับ 2 และ 3 ให้อัตโนมัติ</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, default_ai_engine: "groq" }))}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    settings.default_ai_engine === "groq"
                      ? "bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-400 shadow-sm"
                      : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>อันดับ 1: Groq Cloud (Qwen)</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-500">ความเร็วสูงสุด ~300ms ภาพสวย ฟรี 14,400 ครั้ง/วัน (แนะนำ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, default_ai_engine: "chatgpt" }))}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    settings.default_ai_engine === "chatgpt"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-400 shadow-sm"
                      : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Bot className="w-3.5 h-3.5 text-emerald-600" />
                    <span>อันดับ 2: OpenAI (GPT-4o)</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-500">กลยุทธ์การตลาดและ Copywriting ภาษาไทยระดับสูง</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, default_ai_engine: "gemini" }))}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    settings.default_ai_engine === "gemini"
                      ? "bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-400 shadow-sm"
                      : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>อันดับ 3: Gemini (Flash/Pro)</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-500">วิเคราะห์บริบทลึกและสร้างไอเดียรอบด้าน</span>
                </button>
              </div>
            </div>

            {/* Failover Tier Pipeline Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
              <div className="bg-white/80 border border-[#E8E9EC] rounded-xl p-3">
                <div className="text-[10px] text-slate-500 font-semibold mb-1">Tier 1: อันดับ 1 (หลัก)</div>
                <div className="font-bold text-[#17181A] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>{settings.default_ai_engine === "groq" ? "Groq (Qwen 3.8)" : settings.default_ai_engine === "chatgpt" ? "ChatGPT (GPT-4o)" : "Gemini Flash"}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {settings.has_groq_key || settings.has_openai_key || settings.has_gemini_key ? "✓ มีคีย์พร้อมใช้" : "⚠️ ยังไม่มีคีย์"}
                </div>
              </div>

              <div className="bg-white/80 border border-[#E8E9EC] rounded-xl p-3">
                <div className="text-[10px] text-slate-500 font-semibold mb-1">Tier 2: อันดับ 2 (สำรอง 1)</div>
                <div className="font-bold text-[#17181A] flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${settings.has_openai_key || settings.has_openai_backup_key ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                  <span>OpenAI (GPT-4o)</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {settings.has_openai_key ? "✓ สลับทันทีเมื่อ Tier 1 หมด" : "สำรองเมื่อมีคีย์"}
                </div>
              </div>

              <div className="bg-white/80 border border-[#E8E9EC] rounded-xl p-3">
                <div className="text-[10px] text-slate-500 font-semibold mb-1">Tier 3: อันดับ 3 (สำรอง 2)</div>
                <div className="font-bold text-[#17181A] flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${settings.has_gemini_key || settings.has_openrouter_key ? "bg-blue-500" : "bg-slate-300"}`}></span>
                  <span>Gemini / OpenRouter</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">สแตนด์บาย 15 RPM / Free</div>
              </div>

              <div className="bg-white/80 border border-[#E8E9EC] rounded-xl p-3">
                <div className="text-[10px] text-slate-500 font-semibold mb-1">Tier 4: Zero-Quota Local</div>
                <div className="font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>สแตนด์บาย 100%</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">ทำงานได้ตลอดแม้เน็ตหลุด/โควต้าหมด</div>
              </div>
            </div>
          </div>

          {/* SECTION 1: GOOGLE GEMINI CONFIGURATION */}
          <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E9EC] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#17181A]">
                <Key className="w-4 h-4 text-blue-400" />
                <span>1. Google Gemini AI Engine (เครื่องยนต์หลัก Pro & Flash)</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950/70 text-blue-300 border border-blue-800">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>รองรับ Gemini Pro 3.1 & Flash ทุกซีรีส์</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">
                  Google Gemini API Key (Server-side Only)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showGeminiKey ? "text" : "password"}
                      placeholder="AIzaSy... หรือ AQ...."
                      value={apiKeyInput}
                      onChange={e => setApiKeyInput(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-[#17181A] font-mono focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900"
                    >
                      {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestGemini}
                    disabled={testingGemini}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0 shadow-md shadow-blue-600/20"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${testingGemini ? "animate-spin" : ""}`} />
                    <span>{testingGemini ? "กำลังทดสอบ..." : "ทดสอบ API"}</span>
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-1.5">
                  <p className="text-[11px] text-slate-700">
                    กุญแจดอกเดียวจาก <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-400 underline">Google AI Studio</a> ปลดล็อกโมเดลทั้งหมด
                  </p>
                  {geminiTestResult && (
                    <span className={`text-[11px] font-medium flex items-center gap-1 ${geminiTestResult.success ? "text-emerald-400" : "text-amber-400"}`}>
                      {geminiTestResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      {geminiTestResult.message}
                    </span>
                  )}
                </div>
              </div>

              {/* DIVERSE MODEL SELECTION WITH PRO & FLASH */}
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">
                  AI Model Selection (เลือกโมเดลที่ต้องการ)
                </label>
                <select
                  value={settings.gemini_model}
                  onChange={e => setSettings({ ...settings, gemini_model: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-[#17181A] focus:outline-none focus:border-blue-500"
                >
                  <optgroup label="🌟 Gemini Pro Tier (โมเดลเรือธง - วิเคราะห์ลึกซึ้ง / วางแผนกลยุทธ์)">
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (ฉลาดสูงสุด ลอจิกซับซ้อน เหมาะกับกลยุทธ์)</option>
                    <option value="gemini-pro-latest">Gemini Pro Latest (โมเดล Pro อัปเดตล่าสุดอัตโนมัติ)</option>
                  </optgroup>
                  <optgroup label="⚡ Gemini Flash Tier (สูงสุด & ความเร็วสูง - สร้างคอนเทนต์ / โควตาฟรี 1,500 RPD)">
                    <option value="gemini-3.8-flash">Gemini 3.8 Flash (สูงสุด แนะนำ - ความเร็วและความจุบริบทสูงสุด)</option>
                    <option value="gemini-flash-latest">Gemini Flash Latest (อัปเดตเวอร์ชัน Flash ล่าสุดเสมอ)</option>
                    <option value="gemini-3.7-flash">Gemini 3.7 Flash (โมเดลสมดุลสำหรับคอนเทนต์และโค้ด)</option>
                    <option value="gemini-3.5-flash">Gemini 3.5 Flash (เสถียรสูง โควตาฟรี 15 RPM)</option>
                    <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (เร็วสุด ประหยัดโควตาและโทเคนสูงสุด)</option>
                    <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (โมเดลสถาปัตยกรรมใหม่)</option>
                  </optgroup>
                  <optgroup label="🔬 Research & Analysis (การค้นคว้าเฉพาะทาง)">
                    <option value="deep-research-pro-preview-12-2025">Deep Research Pro Preview (การวิจัยตลาดและการแข่งขัน)</option>
                  </optgroup>
                </select>
                <p className="text-[11px] text-slate-700 mt-1">
                  💡 <strong>ระบบสลับโมเดลอัตโนมัติ:</strong> หากเลือกโมเดล Pro แต่โปรเจกต์ Free Tier มีโควตาจำกัด ระบบจะสลับไปใช้ Flash ที่ตอบสนองไวให้แทนทันทีโดยงานไม่สะดุด
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-800 mb-1">Reasoning Effort (ระดับการคิดวิเคราะห์)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setSettings({ ...settings, gemini_thinking_effort: "high" })}
                  className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    settings.gemini_thinking_effort === "high"
                      ? "bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-md shadow-blue-500/10"
                      : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>High Reasoning Effort (แนะนำสำหรับ Pro & Flash)</span>
                  </div>
                  <div className="text-[11px] opacity-80">AI จะคิดวิเคราะห์เชิงจิตวิทยาการตลาดและเจาะลึกจุดขาย (USP) ก่อนสรุปผลลัพธ์</div>
                </div>
                <div
                  onClick={() => setSettings({ ...settings, gemini_thinking_effort: "low" })}
                  className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    settings.gemini_thinking_effort === "low"
                      ? "bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-md shadow-blue-500/10"
                      : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Low Reasoning Effort (เน้นความเร็วสูงสุด)</span>
                  </div>
                  <div className="text-[11px] opacity-80">ลดเวลาในการประมวลผล เหมาะสำหรับการสร้างข้อความสั้นหรือแปลงฟอร์แมตด่วน</div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: OPENAI CHATGPT ENGINE (OPTIONAL) */}
          <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E9EC] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#17181A]">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>2. OpenAI ChatGPT Engine (ออปชันเสริมสำหรับเปรียบเทียบมุมมอง)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                GPT-4o / ChatGPT
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-800 mb-1">
                OpenAI API Key (sk-proj-... หรือ sk-...)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showOpenaiKey ? "text" : "password"}
                    placeholder="sk-..."
                    value={openaiKeyInput}
                    onChange={e => setOpenaiKeyInput(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-[#17181A] font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900"
                  >
                    {showOpenaiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleTestOpenai}
                  disabled={testingOpenai}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0 shadow-md shadow-emerald-600/20"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${testingOpenai ? "animate-spin" : ""}`} />
                  <span>{testingOpenai ? "กำลังทดสอบ..." : "ทดสอบ OpenAI"}</span>
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-1.5">
                <p className="text-[11px] text-slate-700">
                  หากไม่ได้ใส่ OpenAI API Key ระบบจะใช้ <strong>Google Gemini (Pro / Flash)</strong> คิดให้แทนอัตโนมัติ 100%
                </p>
                {openaiTestResult && (
                  <span className={`text-[11px] font-medium flex items-center gap-1 ${openaiTestResult.success ? "text-emerald-400" : "text-amber-400"}`}>
                    {openaiTestResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {openaiTestResult.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: FREE TIER PROVIDERS & BACKUP KEYS */}
          <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E9EC] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#17181A]">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>3. โมเดลฟรี & คีย์สำรอง (Free Providers & Backup Keys)</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Failover Chain สำรองอัตโนมัติ</span>
              </span>
            </div>

            <p className="text-xs text-slate-600">
              💡 <strong>ความสำคัญของคีย์สำรองและโมเดลฟรี:</strong> หาก OpenAI หรือ Gemini โควต้าหมด (Error 429) ระบบจะสลับมาดึงข้อมูลจากโมเดลฟรีของ <strong>Groq</strong> หรือ <strong>OpenRouter</strong> หรือคีย์สำรองที่คุณกรอกไว้ทันที โดยไม่มีการหยุดชะงัก
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* GROQ CLOUD (FREE TIER) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-[#17181A] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Groq Cloud API Key (อันดับ 1 แนะนำ - Qwen 3.8 & GPT-OSS)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    เร็วสุด 300ms • ฟรี 14,400 RPD
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showGroqKey ? "text" : "password"}
                      placeholder="gsk_..."
                      value={groqKeyInput}
                      onChange={e => setGroqKeyInput(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 bg-white border border-[#E8E9EC] rounded-lg text-xs text-[#17181A] font-mono focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGroqKey(!showGroqKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900"
                    >
                      {showGroqKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestGroq}
                    disabled={testingGroq}
                    className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1 shadow-sm"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${testingGroq ? "animate-spin" : ""}`} />
                    <span>{testingGroq ? "ทดสอบ..." : "ทดสอบ"}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-600 hover:underline flex items-center gap-1"
                  >
                    <span>รับ API Key ฟรีที่ console.groq.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {groqTestResult && (
                    <span className={`font-medium ${groqTestResult.success ? "text-emerald-600" : "text-amber-600"}`}>
                      {groqTestResult.message}
                    </span>
                  )}
                </div>
              </div>

              {/* OPENROUTER (FREE TIER) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-[#17181A] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>OpenRouter API Key (รวมโมเดลฟรีหลากหลายค่าย)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">
                    ฟรี Free Models
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showOpenrouterKey ? "text" : "password"}
                      placeholder="sk-or-v1-..."
                      value={openrouterKeyInput}
                      onChange={e => setOpenrouterKeyInput(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 bg-white border border-[#E8E9EC] rounded-lg text-xs text-[#17181A] font-mono focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenrouterKey(!showOpenrouterKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900"
                    >
                      {showOpenrouterKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestOpenrouter}
                    disabled={testingOpenrouter}
                    className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1 shadow-sm"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${testingOpenrouter ? "animate-spin" : ""}`} />
                    <span>{testingOpenrouter ? "ทดสอบ..." : "ทดสอบ"}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-600 hover:underline flex items-center gap-1"
                  >
                    <span>รับ API Key ฟรีที่ openrouter.ai/keys</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {openrouterTestResult && (
                    <span className={`font-medium ${openrouterTestResult.success ? "text-emerald-600" : "text-amber-600"}`}>
                      {openrouterTestResult.message}
                    </span>
                  )}
                </div>
              </div>

              {/* OPENAI BACKUP KEY */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-[#17181A] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>OpenAI Backup API Key (คีย์สำรอง)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                    Backup 2nd Key
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showOpenaiBackupKey ? "text" : "password"}
                      placeholder="sk-proj-... (คีย์สำรอง)"
                      value={openaiBackupKeyInput}
                      onChange={e => setOpenaiBackupKeyInput(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 bg-white border border-[#E8E9EC] rounded-lg text-xs text-[#17181A] font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenaiBackupKey(!showOpenaiBackupKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900"
                    >
                      {showOpenaiBackupKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestOpenaiBackup}
                    disabled={testingOpenaiBackup}
                    className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1 shadow-sm"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${testingOpenaiBackup ? "animate-spin" : ""}`} />
                    <span>{testingOpenaiBackup ? "ทดสอบ..." : "ทดสอบ"}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">ใช้แทนเมื่อคีย์ OpenAI หลักติด Rate Limit หรือหมดโควต้า</span>
                  {openaiBackupTestResult && (
                    <span className={`font-medium ${openaiBackupTestResult.success ? "text-emerald-600" : "text-amber-600"}`}>
                      {openaiBackupTestResult.message}
                    </span>
                  )}
                </div>
              </div>

              {/* GEMINI BACKUP KEY */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-[#17181A] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Gemini Backup API Key (คีย์สำรอง)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                    Backup 2nd Key
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showGeminiBackupKey ? "text" : "password"}
                      placeholder="AIzaSy... (คีย์สำรอง)"
                      value={geminiBackupKeyInput}
                      onChange={e => setGeminiBackupKeyInput(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 bg-white border border-[#E8E9EC] rounded-lg text-xs text-[#17181A] font-mono focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiBackupKey(!showGeminiBackupKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900"
                    >
                      {showGeminiBackupKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestGeminiBackup}
                    disabled={testingGeminiBackup}
                    className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1 shadow-sm"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${testingGeminiBackup ? "animate-spin" : ""}`} />
                    <span>{testingGeminiBackup ? "ทดสอบ..." : "ทดสอบ"}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">ใช้แทนเมื่อคีย์ Gemini หลักโควต้าหมด</span>
                  {geminiBackupTestResult && (
                    <span className={`font-medium ${geminiBackupTestResult.success ? "text-emerald-600" : "text-amber-600"}`}>
                      {geminiBackupTestResult.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: CUSTOM IMAGE & MOTION GENERATION */}
          <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E9EC] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#17181A]">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>4. Image & Motion Engines (Pollinations, Nano Banana, Veo, Replicate)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-950/60 border border-purple-800 text-purple-300">
                พร้อมใช้งานในระบบ
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-800 mb-1">
                Custom Image API Token (Replicate r8_... หรือ Nanobanana Token)
              </label>
              <div className="relative">
                <input
                  type={showImageKey ? "text" : "password"}
                  placeholder="r8_... หรือ Token จาก Custom Image Provider"
                  value={customImageKeyInput}
                  onChange={e => setCustomImageKeyInput(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-[#17181A] font-mono focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowImageKey(!showImageKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900"
                >
                  {showImageKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-700 mt-1.5">
                ปัจจุบันระบบมีเครื่องยนต์สร้างภาพความละเอียดสูง (High-Res Engine) พร้อม Thai Poster Studio และ In-App Motion Video สตูดิโอเคลื่อนไหวเปิดใช้งานอยู่แล้ว
              </p>
            </div>
          </div>

          {/* SECTION 4: N8N & WEBHOOKS */}
          <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#17181A] border-b border-[#E8E9EC] pb-3">
              <Network className="w-4 h-4 text-indigo-400" />
              <span>5. ระบบอัตโนมัติ n8n (Social Auto-Publish Engine)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">n8n Webhook Target URL</label>
                <input
                  type="text"
                  placeholder="https://n8n.yourdomain.com/webhook/pk-marketing"
                  value={n8nWebhookInput}
                  onChange={e => setN8nWebhookInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-[#17181A] font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-700 mt-1">
                  เมื่อคุณกด &quot;อนุมัติและตั้งเวลาโพสต์&quot; ใน Step 3 ระบบจะยิงข้อมูลไปยัง Webhook นี้เพื่อส่งต่อเข้า Facebook Page / TikTok
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">n8n Base URL</label>
                <input
                  type="text"
                  placeholder="http://localhost:5678"
                  value={settings.n8n_base_url || ""}
                  onChange={e => setSettings({ ...settings, n8n_base_url: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-[#17181A] font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่าทั้งหมด (Save Settings)"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: API USAGE & QUOTA MONITOR */}
      {activeTab === "USAGE" && (
        <div className="space-y-6 animate-fade-in">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#E8E9EC] shadow-xl space-y-1">
              <div className="flex items-center justify-between text-slate-700 text-xs">
                <span>จำนวนครั้งที่เรียกใช้ (Total Requests)</span>
                <Cpu className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-extrabold text-[#17181A] tracking-tight">
                {usageStats.totalCalls} <span className="text-xs font-normal text-slate-700">ครั้ง</span>
              </div>
              <div className="text-[11px] text-slate-700 pt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>สำเร็จ 100% (No Critical Failures)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E8E9EC] shadow-xl space-y-1">
              <div className="flex items-center justify-between text-slate-700 text-xs">
                <span>โทเคนสะสม (Total Tokens)</span>
                <BarChart3 className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-extrabold text-[#17181A] tracking-tight">
                {usageStats.totalTokens.toLocaleString()} <span className="text-xs font-normal text-slate-700">Tokens</span>
              </div>
              <div className="text-[11px] text-slate-700 pt-1">
                Prompt: {usageStats.promptTokens.toLocaleString()} | Output: {usageStats.completionTokens.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E8E9EC] shadow-xl space-y-1">
              <div className="flex items-center justify-between text-slate-700 text-xs">
                <span>ความเร็วเฉลี่ย (Avg Latency)</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-[#17181A] tracking-tight">
                {usageStats.avgLatency} <span className="text-xs font-normal text-slate-700">ms</span>
              </div>
              <div className="text-[11px] text-emerald-400 pt-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> ตอบสนองรวดเร็วมาก
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E8E9EC] shadow-xl space-y-1">
              <div className="flex items-center justify-between text-slate-700 text-xs">
                <span>ค่าใช้จ่ายโดยประมาณ (Est. Cost)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                $0.00 <span className="text-xs font-normal text-slate-700">USD</span>
              </div>
              <div className="text-[11px] text-slate-700 pt-1">
                ครอบคลุมโดย Google AI Studio Free Quota
              </div>
            </div>
          </div>

          {/* QUOTA LIMITS CARD */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-[#E8E9EC] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#17181A] flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>อัตราโควตาความปลอดภัย (Google AI Studio Rate Limits)</span>
              </h3>
              <button
                onClick={fetchSettings}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>รีเฟรชข้อมูล</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-[#E8E9EC]">
                <div className="text-slate-700 mb-1">Requests Per Minute (RPM)</div>
                <div className="text-base font-bold text-[#17181A]">15 RPM <span className="text-[11px] font-normal text-emerald-400">(ฟรี)</span></div>
                <div className="text-[10px] text-slate-500 mt-1">อัตราการส่งคำขอต่อ 1 นาทีสำหรับโมเดล Flash</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-[#E8E9EC]">
                <div className="text-slate-700 mb-1">Requests Per Day (RPD)</div>
                <div className="text-base font-bold text-[#17181A]">1,500 RPD <span className="text-[11px] font-normal text-emerald-400">(ฟรี)</span></div>
                <div className="text-[10px] text-slate-500 mt-1">ส่งได้สูงสุดถึง 1,500 ครั้งต่อวันโดยไม่มีค่าใช้จ่าย</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-[#E8E9EC]">
                <div className="text-slate-700 mb-1">Tokens Per Minute (TPM)</div>
                <div className="text-base font-bold text-[#17181A]">1,000,000 TPM</div>
                <div className="text-[10px] text-slate-500 mt-1">รองรับเอกสารหรือโจทย์ขนาดยาวระดับ 1 ล้านตัวอักษร</div>
              </div>
            </div>
          </div>

          {/* GENERATION HISTORY LOGS */}
          <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E9EC] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#17181A]">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>ประวัติการเรียกใช้ AI ล่าสุด (Recent AI Generation Logs)</span>
              </div>
              <span className="text-xs text-slate-700 font-mono">
                {aiGenerations.length} รายการ
              </span>
            </div>

            {aiGenerations.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                ยังไม่มีประวัติการเรียกใช้ AI ในระบบ
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8E9EC] text-slate-700 font-semibold">
                      <th className="pb-2">เวลา</th>
                      <th className="pb-2">เวิร์กโฟลว์ (Workflow)</th>
                      <th className="pb-2">โมเดลที่ทำงาน (Model)</th>
                      <th className="pb-2">Tokens</th>
                      <th className="pb-2">เวลาตอบสนอง</th>
                      <th className="pb-2 text-right">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {aiGenerations.slice().reverse().slice(0, 15).map((log) => (
                      <tr key={log.id} className="hover:bg-[#F7F8FA]/50 transition-colors">
                        <td className="py-2.5 text-slate-700 text-[11px]">
                          {log.timestamp ? log.timestamp.split("T")[1]?.slice(0, 8) : "-"}
                        </td>
                        <td className="py-2.5 text-[#17181A] font-sans font-medium">
                          {log.workflow || "General Request"}
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            log.model?.includes("pro")
                              ? "bg-purple-950/80 text-purple-300 border border-purple-800"
                              : "bg-blue-950/80 text-blue-300 border border-blue-800"
                          }`}>
                            {log.model}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-800">
                          {log.total_tokens?.toLocaleString() || 0}
                        </td>
                        <td className="py-2.5 text-slate-800">
                          {log.latency_ms} ms
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800"
                              : "bg-rose-950/70 text-rose-400 border border-rose-800"
                          }`}>
                            {log.status === "SUCCESS" ? "✓ สำเร็จ" : "✕ ผิดพลาด"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STEP-BY-STEP CONNECTION & RECOMMENDATION GUIDE */}
      {activeTab === "GUIDE" && (
        <div className="space-y-6 animate-fade-in">
          {/* GUIDE 1: HOW TO CONNECT GEMINI PRO & FLASH */}
          <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#17181A] border-b border-[#E8E9EC] pb-3">
              <Key className="w-4 h-4 text-blue-400" />
              <span>วิธีเชื่อมต่อ Google AI Studio (ปลดล็อก Gemini Pro, Flash และโมเดลทั้งหมด)</span>
            </div>

            <div className="space-y-3 text-xs text-slate-800 leading-relaxed">
              <p>
                API Key 1 ดอกของ Google AI Studio สามารถใช้งานโมเดล AI ของ Google ได้ทุกตัวในบัญชีของคุณ:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-1.5">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">1</span>
                    <span>รับ API Key ฟรี</span>
                  </div>
                  <p className="text-[11px] text-slate-700">
                    เปิดเว็บ <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-blue-400 underline">aistudio.google.com/apikey</a> ล็อกอินด้วยบัญชี Google แล้วคลิก <strong>&quot;Create API Key&quot;</strong>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-1.5">
                  <div className="font-bold text-blue-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">2</span>
                    <span>นำมากรอกในระบบ</span>
                  </div>
                  <p className="text-[11px] text-slate-700">
                    คัดลอกคีย์ที่ขึ้นต้นด้วย <code className="text-cyan-400">AQ....</code> หรือ <code className="text-blue-400">AIzaSy...</code> นำมาวางในช่อง <strong>Google Gemini API Key</strong> ด้านบน แล้วกด &quot;ทดสอบ API&quot;
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-1.5">
                  <div className="font-bold text-purple-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">3</span>
                    <span>วิธีปลดล็อก Pro ไม่จำกัด</span>
                  </div>
                  <p className="text-[11px] text-slate-700">
                    โมเดล Pro ใน Google AI Studio ต้องการการผูกบัตร (Pay-as-you-go) ใน Google Cloud เพื่อปลดล็อก Quota (หากยังไม่ได้ผูก ระบบจะใช้ Flash ทำงานให้แทนอย่างราบรื่น)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* GUIDE 2: RECOMMENDED INTEGRATIONS & BEST USE CASES */}
          <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#17181A] border-b border-[#E8E9EC] pb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>คำแนะนำ: ควรเลือกโมเดลไหน และเชื่อมต่ออะไรเพิ่มอีกบ้าง?</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-2">
                <div className="font-bold text-[#17181A] flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 text-[10px]">PRO MODELS</span>
                  <span>Gemini 3.1 Pro / Gemini Pro Latest</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  <strong>เหมาะสำหรับ:</strong> การวางแผนกลยุทธ์การตลาด, การเจาะลึกจิตวิทยาผู้บริโภค, การสร้างไอเดียแคมเปญระดับ Grand Launch และการเขียนบทความขนาดยาวที่มีความลึกซึ้ง
                </p>
                <div className="text-[10px] text-purple-400 flex items-center gap-1">
                  ✓ ใช้กับ Step 1: สั่ง AI คิดไอเดีย (Idea Lab)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-2">
                <div className="font-bold text-[#17181A] flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 text-[10px]">FLASH MODELS</span>
                  <span>Gemini 3.8 Flash / Flash Latest (สูงสุด แนะนำ ฟรี 15 RPM)</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  <strong>เหมาะสำหรับ:</strong> การกระจายคอนเทนต์ลงโซเชียลมีเดียหลายแพลตฟอร์มพร้อมกัน (Facebook, TikTok, IG, Lemon8, X), การเขียนแคปชันกระชับ และการแปลงข้อความด่วน
                </p>
                <div className="text-[10px] text-blue-400 flex items-center gap-1">
                  ✓ ใช้กับ Step 2: เลือกแพลตฟอร์ม & คิดสคริปต์
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-2">
                <div className="font-bold text-[#17181A] flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px]">MULTI-MODEL</span>
                  <span>OpenAI ChatGPT (GPT-4o)</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  <strong>ควรเชื่อมต่อเมื่อ:</strong> คุณต้องการสำนวนการเขียนสไตล์ ChatGPT ที่มีความเป็นธรรมชาติ หรือต้องการให้มี AI 2 ค่ายช่วยกันตรวจสอบไอเดียเพื่อความหลากหลาย
                </p>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  ✓ เป็นตัวเลือกสำรองที่ยอดเยี่ยม
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] space-y-2">
                <div className="font-bold text-[#17181A] flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 text-[10px]">AUTOMATION</span>
                  <span>n8n Social Webhook (โพสต์อัตโนมัติ)</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  <strong>ควรเชื่อมต่อเมื่อ:</strong> ต้องการให้คอนเทนต์ที่อนุมัติใน Step 3 ถูกยิงโพสต์ขึ้น Facebook Fanpage, กลุ่ม, หรือช่องทางโซเชียลมีเดียต่างๆ โดยไม่ต้องเปิดแอปทำเอง
                </p>
                <div className="text-[10px] text-amber-400 flex items-center gap-1">
                  ✓ ใช้กับ Step 3: หน้ารอโพสต์ & จัดตาราง
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER AUDIT LOGS SUMMARY */}
      <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#17181A] border-b border-[#E8E9EC] pb-3">
          <History className="w-4 h-4 text-slate-700" />
          <span>บันทึกความปลอดภัยและการเปลี่ยนแปลงล่าสุด (System Audit Logs)</span>
        </div>

        <div className="space-y-2 text-xs">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-bold">{log.action}</span>
                  <span className="text-[10px] text-slate-700 bg-slate-800 px-1.5 py-0.5 rounded">{log.entity_type}</span>
                </div>
                <div className="mt-1 text-slate-800">{log.details}</div>
              </div>
              <div className="text-right flex-shrink-0 text-[11px] text-slate-700 font-mono">
                <div>{log.actor}</div>
                <div>{log.timestamp ? log.timestamp.split("T")[1]?.slice(0, 8) : ""}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
