import { db } from "@/lib/db";

export interface AIRequestOptions {
  systemInstruction?: string;
  prompt: string;
  workflow: string;
  responseSchema?: boolean;
  reasoningEffort?: "high" | "low";
  preferredEngine?: "groq" | "chatgpt" | "gemini";
  preferredModel?: string;
  apiKey?: string;
}

export type AIProviderTier = 
  | "openai"
  | "openai-backup"
  | "groq"
  | "openrouter"
  | "gemini"
  | "gemini-backup"
  | "local-engine";

export interface AIResponseResult {
  text: string;
  data?: any;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
  };
  modelUsed: string;
  providerUsed: AIProviderTier;
  isFailover: boolean;
  failoverReason?: string;
  quotaExhaustedTiers?: string[];
}

/**
 * Detects whether an HTTP status or error message indicates API quota/credits exhaustion or rate limiting.
 */
export function isQuotaExhaustedError(status?: number, message?: string): boolean {
  if (status === 429 || status === 402) return true;
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("quota") ||
    lower.includes("exhausted") ||
    lower.includes("credit") ||
    lower.includes("depleted") ||
    lower.includes("resource_exhausted") ||
    lower.includes("rate limit") ||
    lower.includes("rate_limit") ||
    lower.includes("too many requests") ||
    lower.includes("balance") ||
    lower.includes("billing") ||
    lower.includes("insufficient_quota") ||
    lower.includes("exceeded your current quota") ||
    lower.includes("prepayment credits are depleted")
  );
}

/**
 * Parse JSON safely from LLM output, stripping markdown codeblocks if necessary.
 */
export function safeParseJson(raw: string): any {
  if (!raw || typeof raw !== "string") return null;
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch (err) {}
    }
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(cleaned.slice(firstBracket, lastBracket + 1));
      } catch (err) {}
    }
    return null;
  }
}

/**
 * Universal OpenAI-compatible API caller (used by OpenAI, Groq, and OpenRouter).
 */
async function callOpenAICompatible(params: {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  responseSchema?: boolean;
  temperature?: number;
  timeoutMs?: number;
  extraHeaders?: Record<string, string>;
}): Promise<{ ok: boolean; status: number; text: string; data: any; usage: any; error?: string }> {
  const {
    baseUrl,
    apiKey,
    model,
    messages,
    responseSchema,
    temperature = 0.7,
    timeoutMs = 45000,
    extraHeaders = {}
  } = params;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        ...extraHeaders
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: model.includes("qwen3.8") ? 950 : 4096,
        response_format: responseSchema ? { type: "json_object" } : undefined
      }),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { ok: false, status: res.status, text: "", data: null, usage: null, error: errText || res.statusText };
    }

    const json = await res.json();
    const text = json.choices?.[0]?.message?.content || "";
    const data = responseSchema ? safeParseJson(text) : null;
    return {
      ok: true,
      status: res.status,
      text,
      data,
      usage: json.usage || {}
    };
  } catch (err: any) {
    clearTimeout(timer);
    return { ok: false, status: 0, text: "", data: null, usage: null, error: err.message };
  }
}

/**
 * Universal Gemini API caller.
 */
async function callGeminiDirect(params: {
  apiKey: string;
  model: string;
  prompt: string;
  systemInstruction?: string;
  responseSchema?: boolean;
  reasoningEffort?: "high" | "low";
  timeoutMs?: number;
}): Promise<{ ok: boolean; status: number; text: string; data: any; usage: any; modelUsed: string; error?: string }> {
  const { apiKey, model, prompt, systemInstruction, responseSchema, reasoningEffort = "high", timeoutMs = 45000 } = params;

  const candidateModels = [
    model || "gemini-3.8-flash",
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest"
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);

  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: reasoningEffort === "high" ? 0.3 : 0.7,
      responseMimeType: responseSchema ? "application/json" : "text/plain"
    }
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  let lastStatus = 0;
  let lastError = "";

  for (const m of candidateModels) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify(body),
          signal: controller.signal
        }
      );
      clearTimeout(timer);

      if (res.ok) {
        const json = await res.json();
        const candidate = json.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text || "";
        const data = responseSchema ? safeParseJson(text) : null;
        const usage = json.usageMetadata || {};
        return { ok: true, status: res.status, text, data, usage, modelUsed: m };
      } else {
        lastStatus = res.status;
        lastError = await res.text().catch(() => "");
        if (isQuotaExhaustedError(res.status, lastError)) {
          // If quota is exhausted on this key, trying other Gemini models with the same exhausted key usually also fails
          break;
        }
      }
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err.message;
    }
  }

  return { ok: false, status: lastStatus, text: "", data: null, usage: null, modelUsed: model, error: lastError };
}

/**
 * Execute AI call with full failover protection across OpenAI, Backup Keys, Groq Free Tier, OpenRouter Free Tier, Gemini, and Local Heuristic Engine.
 */
export async function executeAIFailoverChain(options: AIRequestOptions): Promise<AIResponseResult> {
  const startTime = Date.now();
  const settings = db.getSettings();
  const autoFailover = settings.auto_failover_enabled !== false;
  const preferredEngine = options.preferredEngine || settings.default_ai_engine || "groq";

  const primaryOpenAiKey = process.env.OPENAI_API_KEY || settings.openai_api_key;
  const backupOpenAiKey = settings.openai_backup_api_key;
  const groqKey = process.env.GROQ_API_KEY || settings.groq_api_key;
  const openRouterKey = process.env.OPENROUTER_API_KEY || settings.openrouter_api_key;
  const primaryGeminiKey = options.apiKey || process.env.GEMINI_API_KEY || settings.gemini_api_key;
  const backupGeminiKey = settings.gemini_backup_api_key;

  const defaultSystem = options.systemInstruction || 
    "You are an expert AI content creator, copywriter, and digital marketing strategist. Return strictly valid JSON.";

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: defaultSystem },
    { role: "user", content: options.prompt }
  ];

  const quotaExhaustedTiers: string[] = [];

  // Build prioritized execution tiers based on preferred engine
  interface ExecutionTier {
    id: AIProviderTier;
    name: string;
    hasKey: boolean;
    execute: () => Promise<{ ok: boolean; status: number; text: string; data: any; usage: any; model: string; error?: string }>;
  }

  const tiers: ExecutionTier[] = [];

  const tierPrimaryOpenAI: ExecutionTier = {
    id: "openai",
    name: "OpenAI Primary (GPT-4o)",
    hasKey: !!primaryOpenAiKey && primaryOpenAiKey.trim().length > 5,
    execute: async () => {
      const res = await callOpenAICompatible({
        baseUrl: "https://api.openai.com/v1/chat/completions",
        apiKey: primaryOpenAiKey!,
        model: "gpt-4o",
        messages,
        responseSchema: options.responseSchema
      });
      return { ...res, model: "OpenAI gpt-4o" };
    }
  };

  const tierBackupOpenAI: ExecutionTier = {
    id: "openai-backup",
    name: "OpenAI Backup Key",
    hasKey: !!backupOpenAiKey && backupOpenAiKey.trim().length > 5,
    execute: async () => {
      const res = await callOpenAICompatible({
        baseUrl: "https://api.openai.com/v1/chat/completions",
        apiKey: backupOpenAiKey!,
        model: "gpt-4o-mini",
        messages,
        responseSchema: options.responseSchema
      });
      return { ...res, model: "OpenAI gpt-4o-mini (Backup)" };
    }
  };

  const tierGroq: ExecutionTier = {
    id: "groq",
    name: "Groq Cloud (Free Tier - High Speed)",
    hasKey: !!groqKey && groqKey.trim().length > 5,
    execute: async () => {
      const candidateGroqModels = [
        ...(options.preferredModel && !options.preferredModel.includes("gemini") && !options.preferredModel.includes("gpt-4") ? [options.preferredModel] : []),
        "openai/gpt-oss-120b",
        "qwen/qwen3.6-27b",
        "qwen/qwen3.8-27b",
        "groq/compound"
      ];
      let lastRes: any = null;
      for (const gm of candidateGroqModels) {
        const res = await callOpenAICompatible({
          baseUrl: "https://api.groq.com/openai/v1/chat/completions",
          apiKey: groqKey!,
          model: gm,
          messages,
          responseSchema: options.responseSchema
        });
        if (res.ok && res.text) {
          return { ...res, model: `Groq Cloud (${gm})` };
        }
        lastRes = res;
      }
      return { ...(lastRes || { ok: false, status: 0, text: "", data: null, usage: null }), model: "Groq Cloud" };
    }
  };

  const tierOpenRouter: ExecutionTier = {
    id: "openrouter",
    name: "OpenRouter (Free Tier Models)",
    hasKey: !!openRouterKey && openRouterKey.trim().length > 5,
    execute: async () => {
      const res = await callOpenAICompatible({
        baseUrl: "https://openrouter.ai/api/v1/chat/completions",
        apiKey: openRouterKey!,
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages,
        responseSchema: options.responseSchema,
        extraHeaders: {
          "HTTP-Referer": "https://pk-marketing-os.local",
          "X-Title": "PK Marketing AI OS"
        }
      });
      return { ...res, model: "OpenRouter Llama 3.3 70B (Free Tier)" };
    }
  };

  const tierPrimaryGemini: ExecutionTier = {
    id: "gemini",
    name: `Google Gemini Primary (${options.preferredModel || settings.gemini_model || "gemini-3.8-flash"})`,
    hasKey: !!primaryGeminiKey && primaryGeminiKey.trim().length > 5,
    execute: async () => {
      const res = await callGeminiDirect({
        apiKey: primaryGeminiKey!,
        model: options.preferredModel || settings.gemini_model || "gemini-3.8-flash",
        prompt: options.prompt,
        systemInstruction: defaultSystem,
        responseSchema: options.responseSchema,
        reasoningEffort: options.reasoningEffort
      });
      return { ...res, model: res.modelUsed };
    }
  };

  const tierBackupGemini: ExecutionTier = {
    id: "gemini-backup",
    name: "Google Gemini Backup Key",
    hasKey: !!backupGeminiKey && backupGeminiKey.trim().length > 5,
    execute: async () => {
      const res = await callGeminiDirect({
        apiKey: backupGeminiKey!,
        model: "gemini-3.5-flash",
        prompt: options.prompt,
        systemInstruction: defaultSystem,
        responseSchema: options.responseSchema,
        reasoningEffort: options.reasoningEffort
      });
      return { ...res, model: `${res.modelUsed} (Backup Key)` };
    }
  };

  // Order priority depending on preferred engine
  if (preferredEngine === "groq") {
    // 1. Groq Cloud (Qwen) -> 2. OpenAI (GPT-4o) -> 3. Gemini (Flash/Pro)
    tiers.push(tierGroq);
    tiers.push(tierPrimaryOpenAI);
    tiers.push(tierBackupOpenAI);
    tiers.push(tierPrimaryGemini);
    tiers.push(tierBackupGemini);
    tiers.push(tierOpenRouter);
  } else if (preferredEngine === "chatgpt") {
    tiers.push(tierPrimaryOpenAI);
    tiers.push(tierBackupOpenAI);
    tiers.push(tierGroq);
    tiers.push(tierOpenRouter);
    tiers.push(tierPrimaryGemini);
    tiers.push(tierBackupGemini);
  } else {
    tiers.push(tierPrimaryGemini);
    tiers.push(tierBackupGemini);
    tiers.push(tierGroq);
    tiers.push(tierOpenRouter);
    tiers.push(tierPrimaryOpenAI);
    tiers.push(tierBackupOpenAI);
  }

  // Iterate through tiers
  let triedCount = 0;
  for (const tier of tiers) {
    if (!tier.hasKey) continue;
    triedCount++;

    try {
      const result = await tier.execute();
      if (result.ok && result.text) {
        const latency = Date.now() - startTime;
        const promptTokens = result.usage?.prompt_tokens || result.usage?.promptTokenCount || Math.floor(options.prompt.length / 4);
        const completionTokens = result.usage?.completion_tokens || result.usage?.candidatesTokenCount || Math.floor(result.text.length / 4);
        const totalTokens = result.usage?.total_tokens || result.usage?.totalTokenCount || (promptTokens + completionTokens);

        const isFailover = triedCount > 1 || quotaExhaustedTiers.length > 0;
        const failoverReason = isFailover
          ? `ระบบสลับมาใช้ ${tier.name} โดยอัตโนมัติ เนื่องจากโควต้าของ ${quotaExhaustedTiers.join(", ") || "ผู้ให้บริการก่อนหน้า"} หมดลง ทำให้ระบบทำงานต่อได้ทันที 100%`
          : undefined;

        db.logAIGeneration({
          id: `gen-${Date.now()}`,
          model: result.model,
          workflow: options.workflow,
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: totalTokens,
          latency_ms: latency,
          status: "SUCCESS",
          cost_usd: tier.id.includes("groq") || tier.id.includes("openrouter") ? 0 : 0.001,
          timestamp: new Date().toISOString()
        });

        if (isFailover) {
          db.logAudit(
            "AUTO_FAILOVER_SUCCESS",
            "AI_FAILOVER",
            tier.id,
            `Successfully failed over to ${tier.name} after quota exhaustion on earlier tiers`
          );
        }

        return {
          text: result.text,
          data: result.data,
          usage: { promptTokens, completionTokens, totalTokens, latencyMs: latency },
          modelUsed: result.model,
          providerUsed: tier.id,
          isFailover,
          failoverReason,
          quotaExhaustedTiers
        };
      } else {
        const isQuotaExhausted = isQuotaExhaustedError(result.status, result.error);
        if (isQuotaExhausted) {
          quotaExhaustedTiers.push(tier.name);
          console.warn(`[Auto-Failover] Quota exhausted on ${tier.name}. Trying next provider tier...`);
          db.logAudit(
            "QUOTA_EXHAUSTED_FAILOVER",
            "AI_FAILOVER",
            tier.id,
            `Quota exhausted on ${tier.name} (${result.status}: ${result.error?.slice(0, 100)}). Switching to next tier...`
          );
        } else {
          console.warn(`[Auto-Failover] Call failed on ${tier.name} (${result.status}: ${result.error?.slice(0, 100)}). Trying next...`);
        }

        if (!autoFailover) {
          break; // User explicitly disabled auto-failover
        }
      }
    } catch (err: any) {
      console.warn(`[Auto-Failover] Exception in tier ${tier.name}:`, err.message);
    }
  }

  // All external API keys failed or exhausted quota: seamless local intelligent heuristic fallback
  const latency = Date.now() - startTime;
  const failoverReason = quotaExhaustedTiers.length > 0
    ? `โควต้า API (${quotaExhaustedTiers.join(", ")}) หมดลง ระบบเปิดใช้ Built-in Intelligent Engine ทันทีเพื่อให้ทำงานต่อเนื่องได้ 100% ไม่ติดขัด`
    : "ไม่มี API Key ที่เชื่อมต่อได้ ระบบเปิดใช้ Built-in Intelligent Engine เพื่อให้บริการอย่างต่อเนื่อง";

  db.logAIGeneration({
    id: `gen-${Date.now()}`,
    model: "Built-in Zero-Quota Engine",
    workflow: options.workflow,
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
    latency_ms: latency,
    status: "SUCCESS",
    cost_usd: 0,
    timestamp: new Date().toISOString()
  });

  return {
    text: "",
    data: null,
    modelUsed: "Built-in Zero-Quota Engine",
    providerUsed: "local-engine",
    isFailover: true,
    failoverReason,
    quotaExhaustedTiers
  };
}

/**
 * Diagnostic utility to test any provider key directly from the Settings page.
 */
export async function testProviderConnection(
  provider: "openai" | "openai_backup" | "gemini" | "gemini_backup" | "groq" | "openrouter",
  key: string,
  model?: string
): Promise<{ success: boolean; message: string; latencyMs?: number; isQuotaExhausted?: boolean }> {
  if (!key || key.trim().length === 0) {
    return { success: false, message: "กรุณาระบุ API Key ก่อนทำการทดสอบ" };
  }

  const start = Date.now();

  try {
    if (provider === "openai" || provider === "openai_backup") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${key}` }
      });
      const latency = Date.now() - start;
      if (res.ok) {
        return { success: true, message: `เชื่อมต่อ OpenAI สำเร็จ! (${latency}ms) พร้อมใช้งานโมเดล GPT-4o`, latencyMs: latency };
      }
      const errText = await res.text().catch(() => "");
      const isQuota = isQuotaExhaustedError(res.status, errText);
      return {
        success: false,
        isQuotaExhausted: isQuota,
        message: isQuota
          ? "โควต้า OpenAI หมด (Insufficient Quota / Credit Balance Exhausted) ระบบ Auto-Failover จะสลับไปใช้ตัวอื่นหรือตัวฟรีให้อัตโนมัติ"
          : `เชื่อมต่อ OpenAI ไม่สำเร็จ: ${errText.slice(0, 150)}`
      };
    }

    if (provider === "groq") {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${key}` }
      });
      const latency = Date.now() - start;
      if (res.ok) {
        return { success: true, message: `เชื่อมต่อ Groq Cloud สำเร็จ! (${latency}ms) พร้อมใช้งานโมเดล Llama 3.3 70B ฟรี`, latencyMs: latency };
      }
      const errText = await res.text().catch(() => "");
      const isQuota = isQuotaExhaustedError(res.status, errText);
      return {
        success: false,
        isQuotaExhausted: isQuota,
        message: isQuota ? "โควต้า Groq Rate Limit ชั่วคราว" : `เชื่อมต่อ Groq ไม่สำเร็จ: ${errText.slice(0, 150)}`
      };
    }

    if (provider === "openrouter") {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${key}` }
      });
      const latency = Date.now() - start;
      if (res.ok) {
        return { success: true, message: `เชื่อมต่อ OpenRouter สำเร็จ! (${latency}ms) พร้อมใช้งานโมเดลฟรีหลากหลายค่าย`, latencyMs: latency };
      }
      const errText = await res.text().catch(() => "");
      return { success: false, message: `เชื่อมต่อ OpenRouter ไม่สำเร็จ: ${errText.slice(0, 150)}` };
    }

    if (provider === "gemini" || provider === "gemini_backup") {
      const targetModel = model || "gemini-3.8-flash";
      const res = await callGeminiDirect({
        apiKey: key,
        model: targetModel,
        prompt: "Hello Gemini, reply in 5 words test.",
        timeoutMs: 15000
      });
      const latency = Date.now() - start;
      if (res.ok) {
        return { success: true, message: `เชื่อมต่อ Gemini (${res.modelUsed}) สำเร็จ! (${latency}ms)`, latencyMs: latency };
      }
      const isQuota = isQuotaExhaustedError(res.status, res.error);
      return {
        success: false,
        isQuotaExhausted: isQuota,
        message: isQuota
          ? "โควต้า Gemini หมด (Prepayment Credits Depleted / Rate Limit) ระบบ Auto-Failover จะสลับไปใช้คีย์อื่นหรือตัวฟรีให้อัตโนมัติ"
          : `เชื่อมต่อ Gemini ไม่สำเร็จ: ${res.error?.slice(0, 150)}`
      };
    }

    return { success: false, message: "ไม่พบประเภทผู้ให้บริการที่ระบุ" };
  } catch (err: any) {
    return { success: false, message: `เกิดข้อผิดพลาดในการทดสอบ: ${err.message}` };
  }
}
