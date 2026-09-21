import fs from "fs";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { 
  ContentIdea, 
  ContentAsset, 
  ExtractedDocument, 
  AnalyticsReport, 
  KnowledgeDocument, 
  ApprovalItem, 
  WorkflowItem,
  WorkflowRunLog,
  AIGenerationLog,
  AuditLog,
  SystemSettings,
  FormTemplate,
  SocialPageAccount
} from "@/types";
import { 
  DEMO_CAMPAIGNS, 
  DEMO_PRODUCTS, 
  ALL_DEMO_IDEAS, 
  ALL_DEMO_ASSETS, 
  DEMO_DOCUMENTS, 
  DEMO_FORM_TEMPLATES, 
  DEMO_ANALYTICS, 
  ALL_SEED_ANALYTICS,
  DEMO_KNOWLEDGE, 
  DEMO_APPROVALS, 
  DEMO_WORKFLOWS 
} from "@/lib/seed";

// Data directory for persistent local storage
const DATA_DIR = path.join(process.cwd(), "src", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export const DEFAULT_SOCIAL_ACCOUNTS: SocialPageAccount[] = [
  {
    id: "soc-01",
    brand_name: "Mazda & BYD (ดีลเลอร์ & โปรโมชั่น)",
    platform: "facebook",
    page_name: "Mazda & BYD Chiang Rai Dealer",
    page_id: "page_mazda_byd_cr",
    access_token: "",
    status: "SIMULATED",
    last_synced_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    auto_sync_enabled: true
  },
  {
    id: "soc-02",
    brand_name: "เพจรถ (ความรู้เรื่องรถ & ข่าวสารยานยนต์)",
    platform: "facebook",
    page_name: "เพจคนรักรถ & สาระยานยนต์",
    page_id: "page_auto_knowledge",
    access_token: "",
    status: "SIMULATED",
    last_synced_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    auto_sync_enabled: true
  },
  {
    id: "soc-03",
    brand_name: "PP Fishing (ขายอุปกรณ์ตกปลา & ความรู้หน้าร้าน เชียงราย)",
    platform: "facebook",
    page_name: "PP Fishing Shop เชียงราย",
    page_id: "page_pp_fishing",
    access_token: "",
    status: "SIMULATED",
    last_synced_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    auto_sync_enabled: true
  },
  {
    id: "soc-04",
    brand_name: "Lanna Lab Records (ค่ายเพลง & ดนตรีล้านนา)",
    platform: "youtube",
    page_name: "Lanna Lab Records Official",
    page_id: "yt_lanna_lab",
    access_token: "",
    status: "SIMULATED",
    last_synced_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    auto_sync_enabled: true
  },
  {
    id: "soc-05",
    brand_name: "Mr. Must Have (นายหน้า / ป้ายยาของน่าใช้)",
    platform: "tiktok",
    page_name: "Mr. Must Have ป้ายยาของดี",
    page_id: "tt_mr_must_have",
    access_token: "",
    status: "SIMULATED",
    last_synced_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    auto_sync_enabled: true
  },
  {
    id: "soc-06",
    brand_name: "ขายพระเครื่อง (ลงขายพระของพ่อ / พระแท้)",
    platform: "facebook",
    page_name: "ขายพระของพ่อ พระแท้มาตรฐานสากล",
    page_id: "page_father_amulets",
    access_token: "",
    status: "SIMULATED",
    last_synced_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    auto_sync_enabled: true
  },
  {
    id: "soc-07",
    brand_name: "ขายของต่าง ๆ (ของมือสอง & ของไม่ใช้แล้ว)",
    platform: "facebook",
    page_name: "ตลาดแบ่งปันของมือสองสภาพดี",
    page_id: "page_second_hand",
    access_token: "",
    status: "SIMULATED",
    last_synced_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    auto_sync_enabled: true
  },
  {
    id: "soc-08",
    brand_name: "หนังสือ (พัฒนาตนเอง & สรุปข้อคิดดี ๆ)",
    platform: "instagram",
    page_name: "Book Byte ข้อคิดเปลี่ยนชีวิต",
    page_id: "ig_book_byte",
    access_token: "",
    status: "SIMULATED",
    last_synced_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    auto_sync_enabled: true
  },
  {
    id: "soc-09",
    brand_name: "ช่องข่าว (ประเด็นร้อน & อัปเดตกระแสประจำวัน)",
    platform: "facebook",
    page_name: "ทันข่าว ทันกระแส ไวทุกประเด็น",
    page_id: "page_daily_news",
    access_token: "",
    status: "SIMULATED",
    last_synced_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    auto_sync_enabled: true
  },
  {
    id: "soc-10",
    brand_name: "สารคดี (เรื่องลึกลับ & วิทยาศาสตร์ & ประวัติศาสตร์)",
    platform: "youtube",
    page_name: "สารคดีรอบโลก & ปริศนาลี้ลับ",
    page_id: "yt_documentary_th",
    access_token: "",
    status: "SIMULATED",
    last_synced_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    auto_sync_enabled: true
  },
  {
    id: "soc-11",
    brand_name: "นิทาน (นิทานสอนใจ & เรื่องเล่าก่อนนอน)",
    platform: "youtube",
    page_name: "นิทานก่อนนอน สร้างแรงบันดาลใจ",
    page_id: "yt_bedtime_tales",
    access_token: "",
    status: "SIMULATED",
    last_synced_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    auto_sync_enabled: true
  },
  {
    id: "soc-12",
    brand_name: "ทำอาหาร (สูตร & ขั้นตอนการทำอาหาร)",
    platform: "tiktok",
    page_name: "ครัวก้นครัว สูตรเด็ดทำง่าย",
    page_id: "tt_cooking_secrets",
    access_token: "",
    status: "SIMULATED",
    last_synced_at: new Date(Date.now() - 3600000 * 7).toISOString(),
    auto_sync_enabled: true
  },
  {
    id: "soc-13",
    brand_name: "ฟุตบอล (ไฮไลท์ยิงประตู & กีฬา)",
    platform: "facebook",
    page_name: "คอบอลตัวจริง เกาะติดช็อตเด็ด",
    page_id: "page_football_zone",
    access_token: "",
    status: "SIMULATED",
    last_synced_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    auto_sync_enabled: true
  },
  {
    id: "soc-14",
    brand_name: "แอคเค้าท์ส่วนตัว (Lifestyle & คอนเทนต์ส่วนตัว)",
    platform: "instagram",
    page_name: "My Personal Lifestyle",
    page_id: "ig_personal_profile",
    access_token: "",
    status: "SIMULATED",
    last_synced_at: new Date(Date.now() - 3600000 * 16).toISOString(),
    auto_sync_enabled: true
  }
];

interface DBState {
  campaigns: any[];
  products: any[];
  ideas: ContentIdea[];
  assets: ContentAsset[];
  repurposed: any[];
  documents: ExtractedDocument[];
  form_templates: FormTemplate[];
  analytics: AnalyticsReport[];
  comparisons?: any[];
  social_accounts: SocialPageAccount[];
  knowledge: KnowledgeDocument[];
  approvals: ApprovalItem[];
  workflows: WorkflowItem[];
  workflow_runs: WorkflowRunLog[];
  ai_generations: AIGenerationLog[];
  audit_logs: AuditLog[];
  settings: SystemSettings;
}

function getInitialState(): DBState {
  return {
    campaigns: DEMO_CAMPAIGNS,
    products: DEMO_PRODUCTS,
    ideas: ALL_DEMO_IDEAS,
    assets: ALL_DEMO_ASSETS,
    repurposed: [],
    documents: DEMO_DOCUMENTS,
    form_templates: DEMO_FORM_TEMPLATES,
    analytics: ALL_SEED_ANALYTICS,
    comparisons: [],
    social_accounts: DEFAULT_SOCIAL_ACCOUNTS,
    knowledge: DEMO_KNOWLEDGE,
    approvals: DEMO_APPROVALS,
    workflows: DEMO_WORKFLOWS,
    workflow_runs: [
      {
        id: "run-001",
        workflow_id: "wf-001",
        workflow_name: "Idea Generation Pipeline",
        status: "SUCCESS",
        started_at: "2026-09-05T10:30:00Z",
        finished_at: "2026-09-05T10:30:02Z",
        duration_ms: 2150,
        trigger: "Manual",
        input_payload: { count: 15, brand: "PK Auto" },
        output_result: { ideas_generated: 15 }
      }
    ],
    ai_generations: [
      {
        id: "gen-001",
        model: "gemini-3.8-flash",
        workflow: "Idea Generation",
        prompt_tokens: 1240,
        completion_tokens: 1850,
        total_tokens: 3090,
        latency_ms: 2150,
        status: "SUCCESS",
        cost_usd: 0.00077,
        timestamp: "2026-09-05T10:30:00Z"
      }
    ],
    audit_logs: [
      {
        id: "audit-001",
        action: "APPROVE_CONTENT",
        entity_type: "CONTENT",
        entity_id: "asset-001",
        details: "Marketing Director approved PAS carousel copy",
        actor: "Marketing Director",
        timestamp: "2026-09-05T10:35:00Z"
      }
    ],
    settings: {
      gemini_api_key: "",
      default_ai_engine: "groq",
      gemini_model: "gemini-3.8-flash",
      gemini_thinking_effort: "high",
      auto_failover_enabled: true,
      google_drive_status: "NOT_CONNECTED",
      google_sheets_status: "NOT_CONNECTED",
      google_forms_status: "NOT_CONNECTED",
      image_gen_provider: "NONE",
      social_publisher_status: "NOT_CONNECTED"
    }
  };
}

let memoryState: DBState | null = null;

function readDB(): DBState {
  if (memoryState) return memoryState;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      memoryState = JSON.parse(data);
      if (!memoryState!.social_accounts || memoryState!.social_accounts.length === 0) {
        memoryState!.social_accounts = DEFAULT_SOCIAL_ACCOUNTS;
      }
      if (!memoryState!.analytics) memoryState!.analytics = [];
      const existingIds = new Set(memoryState!.analytics.map(a => a.id));
      let addedSeed = false;
      for (const sa of ALL_SEED_ANALYTICS) {
        if (!existingIds.has(sa.id)) {
          memoryState!.analytics.push(sa);
          addedSeed = true;
        }
      }
      if (!memoryState!.knowledge) memoryState!.knowledge = [];
      const existingKbIds = new Set(memoryState!.knowledge.map(k => k.id));
      for (const kb of DEMO_KNOWLEDGE) {
        if (!existingKbIds.has(kb.id)) {
          memoryState!.knowledge.push(kb);
          addedSeed = true;
        }
      }
      if (addedSeed) {
        writeDB(memoryState!);
      }
      if (!memoryState!.comparisons) {
        memoryState!.comparisons = [];
      }
      return memoryState!;
    }
  } catch (e) {
    console.error("Local DB read error, using initial state:", e);
  }
  memoryState = getInitialState();
  writeDB(memoryState);
  return memoryState;
}

function writeDB(state: DBState) {
  memoryState = state;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error("Local DB write error:", e);
  }
}
// Repository CRUD functions
export const db = {
  getCampaigns: () => readDB().campaigns,
  getProducts: () => readDB().products,
  
  getIdeas: () => readDB().ideas,
  saveIdea: (idea: ContentIdea) => {
    const state = readDB();
    const existing = state.ideas.findIndex(i => i.id === idea.id);
    if (existing >= 0) {
      state.ideas[existing] = { ...state.ideas[existing], ...idea, updated_at: new Date().toISOString() };
    } else {
      state.ideas.unshift({ ...idea, id: idea.id || `idea-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    writeDB(state);
    return idea;
  },
  saveIdeas: (newIdeas: ContentIdea[]) => {
    const state = readDB();
    const formatted = newIdeas.map((i, idx) => ({
      ...i,
      id: i.id || `idea-${Date.now()}-${idx}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    state.ideas = [...formatted, ...state.ideas];
    writeDB(state);
    return formatted;
  },
  updateIdeaStatus: (id: string, status: any) => {
    const state = readDB();
    const idx = state.ideas.findIndex(i => i.id === id);
    if (idx >= 0) {
      state.ideas[idx].status = status;
      state.ideas[idx].updated_at = new Date().toISOString();
      writeDB(state);
      return state.ideas[idx];
    }
    return null;
  },
  updateIdea: (id: string, updates: Partial<ContentIdea>) => {
    const state = readDB();
    const idx = state.ideas.findIndex(i => i.id === id);
    if (idx >= 0) {
      state.ideas[idx] = { ...state.ideas[idx], ...updates, updated_at: new Date().toISOString() };
      writeDB(state);
      return state.ideas[idx];
    }
    return null;
  },
  deleteIdea: (id: string) => {
    const state = readDB();
    state.ideas = state.ideas.filter(i => i.id !== id);
    writeDB(state);
    return true;
  },
  resetAllData: () => {
    const state = readDB();
    state.ideas = [];
    state.assets = [];
    state.repurposed = [];
    state.approvals = [];
    writeDB(state);
    return true;
  },

  getAssets: () => readDB().assets,
  getAssetById: (id: string) => readDB().assets.find(a => a.id === id),
  saveAsset: (asset: ContentAsset) => {
    const state = readDB();
    const idx = state.assets.findIndex(a => a.id === asset.id);
    if (idx >= 0) {
      state.assets[idx] = { ...state.assets[idx], ...asset, updated_at: new Date().toISOString() };
    } else {
      state.assets.unshift({ ...asset, id: asset.id || `asset-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    writeDB(state);
    return asset;
  },
  updateAsset: (id: string, updates: Partial<ContentAsset>) => {
    const state = readDB();
    const idx = state.assets.findIndex(a => a.id === id);
    if (idx >= 0) {
      state.assets[idx] = { ...state.assets[idx], ...updates, updated_at: new Date().toISOString() };
      writeDB(state);
      return state.assets[idx];
    }
    return null;
  },

  getRepurposed: () => readDB().repurposed,
  saveRepurposed: (item: any) => {
    const state = readDB();
    state.repurposed.unshift({ ...item, id: item.id || `rep-${Date.now()}`, created_at: new Date().toISOString() });
    writeDB(state);
    return item;
  },

  getDocuments: () => readDB().documents,
  getDocumentById: (id: string) => readDB().documents.find(d => d.id === id),
  saveDocument: (doc: ExtractedDocument) => {
    const state = readDB();
    const idx = state.documents.findIndex(d => d.id === doc.id);
    if (idx >= 0) {
      state.documents[idx] = { ...state.documents[idx], ...doc };
    } else {
      state.documents.unshift(doc);
    }
    writeDB(state);
    return doc;
  },
  getFormTemplates: () => readDB().form_templates,

  getAnalytics: () => readDB().analytics,
  getAnalyticsById: (id: string) => readDB().analytics.find(a => a.id === id),
  saveAnalytics: (report: AnalyticsReport) => {
    const state = readDB();
    const idx = state.analytics.findIndex(a => a.id === report.id);
    if (idx >= 0) {
      state.analytics[idx] = { ...state.analytics[idx], ...report };
    } else {
      state.analytics.unshift(report);
    }
    writeDB(state);
    return report;
  },
  deleteAnalytics: (id: string) => {
    const state = readDB();
    state.analytics = state.analytics.filter(a => a.id !== id);
    writeDB(state);
    return true;
  },

  getComparisons: () => readDB().comparisons || [],
  getComparisonById: (id: string) => (readDB().comparisons || []).find((c: any) => c.id === id),
  saveComparison: (comp: any) => {
    const state = readDB();
    if (!state.comparisons) state.comparisons = [];
    const idx = state.comparisons.findIndex((c: any) => c.id === comp.id);
    if (idx >= 0) {
      state.comparisons[idx] = { ...state.comparisons[idx], ...comp };
    } else {
      state.comparisons.unshift(comp);
    }
    writeDB(state);
    return comp;
  },
  deleteComparison: (id: string) => {
    const state = readDB();
    if (state.comparisons) {
      state.comparisons = state.comparisons.filter((c: any) => c.id !== id);
      writeDB(state);
    }
    return true;
  },

  getSocialAccounts: () => readDB().social_accounts || [],
  saveSocialAccount: (acc: SocialPageAccount) => {
    const state = readDB();
    if (!state.social_accounts) state.social_accounts = [];
    const idx = state.social_accounts.findIndex((a) => a.id === acc.id || a.page_id === acc.page_id);
    if (idx >= 0) {
      state.social_accounts[idx] = { ...state.social_accounts[idx], ...acc };
    } else {
      state.social_accounts.push(acc);
    }
    writeDB(state);
    return acc;
  },
  updateSocialAccount: (id: string, patch: Partial<SocialPageAccount>) => {
    const state = readDB();
    if (!state.social_accounts) state.social_accounts = [];
    const idx = state.social_accounts.findIndex((a) => a.id === id || a.page_id === id);
    if (idx >= 0) {
      state.social_accounts[idx] = { ...state.social_accounts[idx], ...patch };
      writeDB(state);
      return state.social_accounts[idx];
    }
    return null;
  },
  deleteSocialAccount: (id: string) => {
    const state = readDB();
    if (!state.social_accounts) return false;
    state.social_accounts = state.social_accounts.filter((a) => a.id !== id && a.page_id !== id);
    writeDB(state);
    return true;
  },

  getKnowledge: () => readDB().knowledge,
  saveKnowledge: (item: KnowledgeDocument) => {
    const state = readDB();
    state.knowledge.unshift({ ...item, id: item.id || `kb-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    writeDB(state);
    return item;
  },

  getApprovals: () => readDB().approvals,
  updateApprovalStatus: (id: string, status: any, reviewer?: string, reason?: string) => {
    const state = readDB();
    const idx = state.approvals.findIndex(a => a.id === id);
    if (idx >= 0) {
      state.approvals[idx].status = status;
      state.approvals[idx].reviewed_at = new Date().toISOString();
      if (reviewer) state.approvals[idx].reviewed_by = reviewer;
      if (reason) state.approvals[idx].rejection_reason = reason;
      writeDB(state);
      return state.approvals[idx];
    }
    return null;
  },
  updateApproval: (id: string, patch: Partial<ApprovalItem>) => {
    const state = readDB();
    const idx = state.approvals.findIndex(a => a.id === id);
    if (idx >= 0) {
      state.approvals[idx] = {
        ...state.approvals[idx],
        ...patch
      };
      writeDB(state);
      return state.approvals[idx];
    }
    return null;
  },
  createApproval: (item: Partial<ApprovalItem>) => {
    const state = readDB();
    const newItem: ApprovalItem = {
      id: `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: item.title || "คำขออนุมัติใหม่",
      entity_type: item.entity_type || "CONTENT",
      entity_id: item.entity_id || `ent-${Date.now()}`,
      content_preview: item.content_preview || "",
      source: item.source || "System Agent",
      image_url: item.image_url || (item.media_urls && item.media_urls[0]) || "",
      media_urls: item.media_urls || (item.image_url ? [item.image_url] : []),
      media_blueprint: item.media_blueprint,
      platform: item.platform,
      media_type: item.media_type,
      ai_generated_fields: item.ai_generated_fields || {},
      confidence: item.confidence || "HIGH",
      warnings: item.warnings || [],
      recommended_action: item.recommended_action || "พร้อมตรวจสอบและนำไปโพสต์",
      status: item.status || "HUMAN_REVIEW",
      scheduled_at: item.scheduled_at,
      publish_mode: item.publish_mode || "MANUAL",
      recommended_time: item.recommended_time,
      connection_status: item.connection_status || "NOT_CONNECTED",
      brand_name: item.brand_name || "เพจหลัก",
      is_series: item.is_series || false,
      episode: item.episode,
      created_at: new Date().toISOString()
    };
    state.approvals.unshift(newItem);
    writeDB(state);
    return newItem;
  },
  deleteApproval: (id: string) => {
    const state = readDB();
    state.approvals = state.approvals.filter(a => a.id !== id);
    writeDB(state);
    return true;
  },

  getWorkflows: () => readDB().workflows,
  getWorkflowRuns: () => readDB().workflow_runs,
  logWorkflowRun: (run: WorkflowRunLog) => {
    const state = readDB();
    state.workflow_runs.unshift(run);
    const wfIdx = state.workflows.findIndex(w => w.id === run.workflow_id);
    if (wfIdx >= 0) {
      state.workflows[wfIdx].last_run = run.finished_at || run.started_at;
      state.workflows[wfIdx].last_duration_ms = run.duration_ms;
      state.workflows[wfIdx].last_result = run.status === "SUCCESS" ? "SUCCESS" : "FAILED";
    }
    writeDB(state);
    return run;
  },

  getAIGenerations: () => readDB().ai_generations,
  logAIGeneration: (log: AIGenerationLog) => {
    const state = readDB();
    state.ai_generations.unshift(log);
    writeDB(state);
    return log;
  },

  getAuditLogs: () => readDB().audit_logs,
  logAudit: (action: string, entity_type: string, entity_id: string, details: string, actor: string = "Admin") => {
    const state = readDB();
    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      action,
      entity_type,
      entity_id,
      details,
      actor,
      timestamp: new Date().toISOString()
    };
    state.audit_logs.unshift(log);
    writeDB(state);
    return log;
  },

  getSettings: () => {
    const state = readDB();
    if (!state.settings) {
      state.settings = getInitialState().settings;
      writeDB(state);
    } else if (state.settings.auto_failover_enabled === undefined) {
      state.settings.auto_failover_enabled = true;
      writeDB(state);
    }
    return state.settings;
  },
  updateSettings: (newSettings: Partial<SystemSettings>) => {
    const state = readDB();
    state.settings = { ...state.settings, ...newSettings };
    writeDB(state);
    return state.settings;
  },

  getStorageMode: (): "SUPABASE_CLOUD" | "LOCAL_JSON" => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return (url && key) ? "SUPABASE_CLOUD" : "LOCAL_JSON";
  },

  getSupabase: (): SupabaseClient | null => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key, {
      auth: { persistSession: false }
    });
  },

  getSupabaseStatus: async (): Promise<{
    connected: boolean;
    mode: "SUPABASE_CLOUD" | "LOCAL_JSON";
    url?: string;
    message: string;
    latencyMs?: number;
  }> => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      return {
        connected: true,
        mode: "LOCAL_JSON",
        message: "ทำงานในโหมด Local JSON Database (src/data/db.json) พร้อมใช้งานแบบ Self-Hosted ทันทีโดยไม่ต้องต่อเน็ต"
      };
    }

    const start = Date.now();
    try {
      const client = createClient(url, key, { auth: { persistSession: false } });
      const { error } = await client.from("campaigns").select("id").limit(1);
      const latencyMs = Date.now() - start;
      if (error && error.code !== "PGRST116") {
        return {
          connected: false,
          mode: "SUPABASE_CLOUD",
          url: url.replace(/(https?:\/\/)([^.]+)(.*)/, "$1***$3"),
          latencyMs,
          message: `เชื่อมต่อ Supabase ได้แต่ Query ขัดข้อง: ${error.message}`
        };
      }
      return {
        connected: true,
        mode: "SUPABASE_CLOUD",
        url: url.replace(/(https?:\/\/)([^.]+)(.*)/, "$1***$3"),
        latencyMs,
        message: `เชื่อมต่อ Supabase Cloud สำเร็จ (Latency: ${latencyMs}ms)`
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      return {
        connected: false,
        mode: "SUPABASE_CLOUD",
        url: url ? url.replace(/(https?:\/\/)([^.]+)(.*)/, "$1***$3") : undefined,
        latencyMs,
        message: `ไม่สามารถเชื่อมต่อ Supabase ได้: ${err.message || "Network Error"}`
      };
    }
  }
};
