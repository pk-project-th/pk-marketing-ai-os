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
  Check,
  Trash2
} from "lucide-react";
import { SystemSettings, AuditLog, AIGenerationLog } from "@/types";
import { useToast } from "@/components/ui/ToastProvider";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [resettingUsage, setResettingUsage] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    gemini_api_key: "",
    openai_api_key: "",
    default_ai_engine: "gemini",
    gemini_model: "gemini-4-hydrogen",
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
    const successCalls = aiGenerations.filter((g) => g.status === "SUCCESS").length;
    const successRate = totalCalls > 0 ? Math.round((successCalls / totalCalls) * 100) : 100;
    const promptTokens = aiGenerations.reduce((acc, g) => acc + (g.prompt_tokens || 0), 0);
    const completionTokens = aiGenerations.reduce((acc, g) => acc + (g.completion_tokens || 0), 0);
    const rawTotalTokens = aiGenerations.reduce((acc, g) => acc + (g.total_tokens || 0), 0);
    const totalTokens = rawTotalTokens > 0 ? rawTotalTokens : promptTokens + completionTokens;
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
      successCalls,
      successRate,
      totalTokens,
      promptTokens,
      completionTokens,
      avgLatency,
      totalCostUsd,
      modelBreakdown
    };
  }, [aiGenerations]);

  const handleResetUsage = async () => {
    setResettingUsage(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_USAGE" })
      });
      const data = await res.json();
      if (data.success) {
        setAiGenerations([]);
        showToast("รีเซ็ตสถิติการใช้งาน AI เป็น 0 เรียบร้อยแล้ว!", "success");
        fetchSettings();
      } else {
        showToast("ไม่สามารถรีเซ็ตสถิติได้", "error");
      }
    } catch {
      showToast("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    } finally {
      setResettingUsage(false);
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-bold tracking-wide mb-2.5 shadow-2xs">
            <Settings className="w-3.5 h-3.5 text-emerald-600" />
            <span>SYSTEM HUB &amp; API ORCHESTRATION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            การตั้งค่าและศูนย์ควบคุม API (Settings &amp; Usage)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            เลือกโมเดล AI หลัก, ตรวจสอบปริมาณการใช้งานจริง, รีเซ็ตสถิติ และจัดการ API Keys
          </p>
        </div>

        {notification && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold shadow-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* TABS NAVIGATION (Symmetric 3-Column Segmented Control for iPhone 17 & Desktop) */}
      <div className="grid grid-cols-3 w-full sm:max-w-2xl p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/90 gap-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab("CONFIG")}
          className={`min-h-[44px] px-2 sm:px-4 py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
            activeTab === "CONFIG"
              ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent"
          }`}
        >
          <Key className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === "CONFIG" ? "text-emerald-600" : "text-slate-400"}`} />
          <span className="truncate">ตั้งค่า API</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("USAGE")}
          className={`min-h-[44px] px-2 sm:px-4 py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
            activeTab === "USAGE"
              ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent"
          }`}
        >
          <Activity className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === "USAGE" ? "text-emerald-600" : "text-slate-400"}`} />
          <span className="truncate">สถิติใช้ AI</span>
          <span className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
            activeTab === "USAGE"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
              : "bg-slate-200/80 text-slate-700"
          }`}>
            {usageStats.totalCalls}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("GUIDE")}
          className={`min-h-[44px] px-2 sm:px-4 py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
            activeTab === "GUIDE"
              ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent"
          }`}
        >
          <BookOpen className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === "GUIDE" ? "text-emerald-600" : "text-slate-400"}`} />
          <span className="truncate">คู่มือโมเดล</span>
        </button>
      </div>

      {/* TAB 1: API CONFIGURATION */}
      {activeTab === "CONFIG" && (
        <form onSubmit={handleSave} className="space-y-6 animate-fade-in">
          {/* AUTO-FAILOVER SMART RESILIENCE CONTROLLER (GEMINI-ONLY CLEAN) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.06)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      ระบบ Auto-Failover เฉพาะ Google Gemini (สลับโมเดลอัตโนมัติไม่ให้สะดุด)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Gemini Only
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    หากโมเดล Gemini หลักติดโควตาหรือโหลดสูง ระบบจะสลับไปยังโมเดล Gemini ฟรีสำรองและ Local Engine ให้อัตโนมัติทันที
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={autoFailoverEnabled}
                  onChange={e => setAutoFailoverEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2.5 text-xs font-bold text-slate-900">
                  {autoFailoverEnabled ? "เปิดใช้งาน (Auto)" : "ปิดการสลับ"}
                </span>
              </label>
            </div>

            {/* Clean 3-Tier Gemini Pipeline Badges */}
            {(() => {
              const formatGeminiModelLabel = (m?: string) => {
                if (!m || m === "gemini-4-hydrogen") return "Gemini 4 Hydrogen";
                if (m === "gemini-4-neon") return "Gemini 4 Neon";
                if (m === "gemini-4-carbon") return "Gemini 4 Carbon";
                if (m === "gemini-4-argon") return "Gemini 4 Argon";
                if (m === "gemini-3-flash-preview") return "Gemini 3 Flash";
                return m;
              };
              const primaryLabel = `Google Gemini (${formatGeminiModelLabel(settings.gemini_model)})`;

              const pipelineBadges = [
                {
                  title: "Tier 1: โมเดลหลัก",
                  name: primaryLabel,
                  hasKey: !!settings.has_gemini_key,
                  color: "bg-emerald-500",
                  pulse: true,
                  desc: settings.has_gemini_key ? "✓ มีคีย์พร้อมใช้งาน" : "⚠️ กรุณาใส่ Gemini API Key"
                },
                {
                  title: "Tier 2: โมเดล Gemini สำรอง",
                  name: "Gemini 3 Flash Preview",
                  hasKey: !!settings.has_gemini_key,
                  color: "bg-blue-500",
                  pulse: false,
                  desc: "✓ สลับอัตโนมัติเมื่อโมเดลหลักติดโควตา"
                },
                {
                  title: "Tier 3: Zero-Quota Local",
                  name: "สแตนด์บาย 100%",
                  hasKey: true,
                  color: "bg-slate-800",
                  pulse: false,
                  desc: "ทำงานได้ตลอดแม้เน็ตหลุด/API ขัดข้อง"
                }
              ];

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  {pipelineBadges.map((badge, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
                      <div className="text-[10px] text-slate-500 font-bold mb-1">{badge.title}</div>
                      <div className="font-extrabold text-slate-900 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${badge.hasKey ? badge.color : "bg-slate-300"} ${badge.pulse ? "animate-pulse" : ""}`}></span>
                        <span>{badge.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">{badge.desc}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* SECTION 1: GOOGLE GEMINI CONFIGURATION */}
          <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E9EC] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#17181A]">
                <Key className="w-4 h-4 text-blue-400" />
                <span>1. Google Gemini AI Engine (เครื่องยนต์หลัก Pro & Flash)</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>รองรับ Gemini 4 Hydrogen / Neon &amp; Flash ทุกซีรีส์</span>
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
                  <optgroup label="🚀 Gemini 4 Series (รุ่นใหม่ล่าสุด — แนะนำ Hydrogen ใช้ฟรีได้ทันที!)">
                    <option value="gemini-4-hydrogen">Gemini 4 Hydrogen (แนะนำที่สุด! ฉลาดรุ่นใหม่ ใช้งานฟรีผ่าน API ได้ทันที)</option>
                    <option value="gemini-4-neon">Gemini 4 Neon (เรือธงสูงสุด — ต้องผูกบัตร Billing ใน Google Cloud)</option>
                    <option value="gemini-4-carbon">Gemini 4 Carbon (งานซับซ้อน/วิเคราะห์ลึก — ต้องผูกบัตร Billing)</option>
                    <option value="gemini-4-argon">Gemini 4 Argon (โมเดลเฉพาะทาง — ต้องผูกบัตร Billing)</option>
                  </optgroup>
                  <optgroup label="⚡ Gemini 3 Flash Tier (สำรองความเร็วสูง โควตาฟรี)">
                    <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (เสถียรสูง ใช้ฟรีได้ทันที เป็นตัวสำรองหลัก)</option>
                    <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite Preview (เร็วมาก ประหยัดโทเคน)</option>
                    <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
                    <option value="gemini-flash-latest">Gemini Flash Latest</option>
                  </optgroup>
                  <optgroup label="🌟 Gemini 3 Pro Tier">
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (ต้องผูกบัตร Billing)</option>
                    <option value="gemini-pro-latest">Gemini Pro Latest</option>
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

          {/* SECTION 2: GEMINI BACKUP KEY (OPTIONAL) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.06)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <Key className="w-4 h-4 text-blue-600" />
                <span>2. Gemini Backup API Key (คีย์สำรอง Google Gemini — ไม่จำเป็นต้องกรอก)</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                Optional Backup
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showGeminiBackupKey ? "text" : "password"}
                    placeholder="AQ.... หรือ AIzaSy... (คีย์ Gemini สำรองถ้ามีอีกบัญชี)"
                    value={geminiBackupKeyInput}
                    onChange={e => setGeminiBackupKeyInput(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiBackupKey(!showGeminiBackupKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                  >
                    {showGeminiBackupKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleTestGeminiBackup}
                  disabled={testingGeminiBackup}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${testingGeminiBackup ? "animate-spin" : ""}`} />
                  <span>{testingGeminiBackup ? "ทดสอบ..." : "ทดสอบคีย์สำรอง"}</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">ใช้แทนอัตโนมัติเมื่อคีย์ Gemini หลักติดโควตา (หากไม่กรอก ระบบจะสลับโมเดลในคีย์หลักแทน)</span>
                {geminiBackupTestResult && (
                  <span className={`font-medium ${geminiBackupTestResult.success ? "text-emerald-600" : "text-amber-600"}`}>
                    {geminiBackupTestResult.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: CUSTOM IMAGE & MOTION GENERATION */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.06)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>3. Image &amp; Motion Engines (Google Flow, Nano Banana, Imagen)</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
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
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.06)] space-y-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              <Network className="w-4 h-4 text-slate-600" />
              <span>4. ระบบอัตโนมัติ n8n (Optional — Social Auto-Publish)</span>
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
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
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
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl px-5 py-3.5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)]">
            <div className="text-xs text-slate-600">
              <strong className="text-slate-900">สถิติการใช้งานจริงในระบบ (Local Usage Log)</strong> — นับเฉพาะคำสั่ง AI ที่ถูกเรียกใช้งานจากหน้าเว็บนี้
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={fetchSettings}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>รีเฟรช</span>
              </button>
              <button
                type="button"
                onClick={handleResetUsage}
                disabled={resettingUsage || usageStats.totalCalls === 0}
                className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 disabled:opacity-40 border border-rose-200 text-rose-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{resettingUsage ? "กำลังรีเซ็ต..." : "รีเซ็ตค่าเป็น 0"}</span>
              </button>
            </div>
          </div>

          {/* STATS CARDS (Symmetric 2x2 on iPhone 17, 4x1 on Desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_20px_-6px_rgba(15,23,42,0.12)] transition-all space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">จำนวนครั้งที่เรียกใช้</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {usageStats.totalCalls.toLocaleString()}{" "}
                <span className="text-xs font-semibold text-slate-500">ครั้ง</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 pt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>
                  {usageStats.totalCalls === 0
                    ? "เริ่มต้นใหม่พร้อมใช้งาน"
                    : `สำเร็จ ${usageStats.successRate}% (${usageStats.successCalls}/${usageStats.totalCalls})`}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_20px_-6px_rgba(15,23,42,0.12)] transition-all space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">โทเคนสะสม (Tokens)</span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {usageStats.totalTokens.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 font-medium pt-0.5">
                ส่งเข้า: <strong className="text-slate-700">{usageStats.promptTokens.toLocaleString()}</strong> · ตอบกลับ:{" "}
                <strong className="text-slate-700">{usageStats.completionTokens.toLocaleString()}</strong>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_20px_-6px_rgba(15,23,42,0.12)] transition-all space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">ความเร็วเฉลี่ย (Latency)</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {usageStats.avgLatency >= 1000
                  ? `${(usageStats.avgLatency / 1000).toFixed(1)}`
                  : usageStats.avgLatency}{" "}
                <span className="text-xs font-semibold text-slate-500">
                  {usageStats.avgLatency >= 1000 ? "วินาที" : "ms"}
                </span>
              </div>
              <div
                className={`text-[11px] font-semibold pt-0.5 flex items-center gap-1 ${
                  usageStats.totalCalls === 0
                    ? "text-slate-500"
                    : usageStats.avgLatency <= 3500
                    ? "text-emerald-700"
                    : usageStats.avgLatency <= 8000
                    ? "text-blue-700"
                    : "text-amber-700"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {usageStats.totalCalls === 0
                    ? "ยังไม่มีข้อมูลความเร็ว"
                    : usageStats.avgLatency <= 3500
                    ? "ตอบสนองรวดเร็วมาก"
                    : usageStats.avgLatency <= 8000
                    ? "ความเร็วปกติ (โหมดคิดละเอียด)"
                    : "ใช้เวลารอโมเดล/สลับตัวสำรอง"}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_20px_-6px_rgba(15,23,42,0.12)] transition-all space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">ค่าใช้จ่ายประมาณการ</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                ${usageStats.totalCostUsd.toFixed(4)}{" "}
                <span className="text-xs font-semibold text-slate-500">USD</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium pt-0.5">
                คำนวณเบื้องต้น (ไม่รวม Free Quota)
              </div>
            </div>
          </div>

          {/* QUOTA LIMITS REFERENCE CARD (High-Contrast Dimensional Slate Navy) */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/80 shadow-xl space-y-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>เพดานโควตาฟรีมาตรฐาน (Google AI Studio Reference Limits)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ค่ามาตรฐานอ้างอิงสำหรับโมเดล Gemini Flash ฟรี (ไม่ใช่ยอดคงเหลือเรียลไทม์จากบัญชี Google)
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 self-start sm:self-center">
                Reference Spec
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              <div className="p-4 rounded-xl bg-white/[0.06] border border-white/10 shadow-inner space-y-1">
                <div className="text-slate-300 font-medium">Requests Per Minute (RPM)</div>
                <div className="text-xl font-extrabold text-white tracking-tight">
                  15 RPM <span className="text-xs font-bold text-emerald-400">(ฟรี)</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                  สั่งงานได้สูงสุด ~15 ครั้งต่อ 1 นาทีสำหรับโมเดลตระกูล Flash
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.06] border border-white/10 shadow-inner space-y-1">
                <div className="text-slate-300 font-medium">Requests Per Day (RPD)</div>
                <div className="text-xl font-extrabold text-white tracking-tight">
                  1,500 RPD <span className="text-xs font-bold text-emerald-400">(ฟรี)</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                  สร้างคอนเทนต์ได้สูงสุด ~1,500 ครั้งต่อวันโดยไม่มีค่าใช้จ่าย
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.06] border border-white/10 shadow-inner space-y-1">
                <div className="text-slate-300 font-medium">Tokens Per Minute (TPM)</div>
                <div className="text-xl font-extrabold text-white tracking-tight">
                  1,000,000 <span className="text-xs font-bold text-sky-400">TPM</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                  รองรับบรีฟและเอกสารขนาดยาวระดับ 1 ล้านโทเคนต่อนาที
                </div>
              </div>
            </div>
          </div>

          {/* GENERATION HISTORY LOGS */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.06)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>ประวัติการเรียกใช้ AI ล่าสุด (Recent AI Generation Logs)</span>
              </div>
              <span className="text-xs text-slate-500 font-mono font-semibold">
                {aiGenerations.length} รายการ
              </span>
            </div>

            {aiGenerations.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                ยังไม่มีประวัติการเรียกใช้ AI — เมื่อคุณสั่งคิดคอนเทนต์ ระบบจะเริ่มเก็บสถิติจริงที่นี่
              </div>
            ) : (
              <>
                {/* Mobile Stacked Cards (iPhone 17 Zero Horizontal Scroll) */}
                <div className="md:hidden space-y-2.5">
                  {aiGenerations.slice(0, 15).map((log) => (
                    <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 truncate">{log.workflow || "General Request"}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          {log.status === "SUCCESS" ? "✓ สำเร็จ" : "✕ ผิดพลาด"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 font-mono">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[10px]">
                          {log.model}
                        </span>
                        <span>
                          {log.total_tokens?.toLocaleString() || 0} tok · {log.latency_ms >= 1000 ? `${(log.latency_ms / 1000).toFixed(1)}s` : `${log.latency_ms}ms`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold">
                        <th className="pb-2.5">เวลา</th>
                        <th className="pb-2.5">เวิร์กโฟลว์ (Workflow)</th>
                        <th className="pb-2.5">โมเดลที่ทำงาน</th>
                        <th className="pb-2.5">Tokens</th>
                        <th className="pb-2.5">เวลาตอบสนอง</th>
                        <th className="pb-2.5 text-right">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {aiGenerations.slice(0, 15).map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 text-slate-500 text-[11px]">
                            {log.timestamp ? log.timestamp.split("T")[1]?.slice(0, 8) : "-"}
                          </td>
                          <td className="py-2.5 text-slate-900 font-sans font-semibold">
                            {log.workflow || "General Request"}
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              log.model?.includes("pro")
                                ? "bg-purple-50 text-purple-800 border-purple-200"
                                : "bg-blue-50 text-blue-800 border-blue-200"
                            }`}>
                              {log.model}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-700">
                            {log.total_tokens?.toLocaleString() || 0}
                          </td>
                          <td className="py-2.5 text-slate-700">
                            {log.latency_ms >= 1000 ? `${(log.latency_ms / 1000).toFixed(1)}s` : `${log.latency_ms}ms`}
                          </td>
                          <td className="py-2.5 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold border ${
                              log.status === "SUCCESS"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}>
                              {log.status === "SUCCESS" ? "✓ สำเร็จ" : "✕ ผิดพลาด"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
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
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-xs">1</span>
                    <span>รับ API Key ฟรี</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    เปิดเว็บ <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold underline">aistudio.google.com/apikey</a> ล็อกอินด้วยบัญชี Google แล้วคลิก <strong>&quot;Create API Key&quot;</strong>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">2</span>
                    <span>นำมากรอกในระบบ</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    คัดลอกคีย์ที่ขึ้นต้นด้วย <code className="text-emerald-700 font-semibold">AQ....</code> หรือ <code className="text-blue-700 font-semibold">AIzaSy...</code> นำมาวางในช่อง <strong>Google Gemini API Key</strong> แล้วกด &quot;ทดสอบ API&quot;
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-extrabold flex items-center justify-center text-xs">3</span>
                    <span>วิธีปลดล็อก Pro ไม่จำกัด</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
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
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.06)] space-y-4">
        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
          <History className="w-4 h-4 text-slate-600" />
          <span>บันทึกความปลอดภัยและการเปลี่ยนแปลงล่าสุด (System Audit Logs)</span>
        </div>

        <div className="space-y-2 text-xs">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-700 font-bold">{log.action}</span>
                  <span className="text-[10px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    {log.entity_type}
                  </span>
                </div>
                <div className="mt-1 text-slate-700">{log.details}</div>
              </div>
              <div className="text-right flex-shrink-0 text-[11px] text-slate-500 font-mono">
                <div className="font-semibold text-slate-700">{log.actor}</div>
                <div>{log.timestamp ? log.timestamp.split("T")[1]?.slice(0, 8) : ""}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
