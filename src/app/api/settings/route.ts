import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { testProviderConnection } from "@/lib/ai/failover-engine";

export async function GET() {
  try {
    const settings = db.getSettings();
    const auditLogs = db.getAuditLogs();
    const aiGenerations = db.getAIGenerations();
    const storageMode = db.getStorageMode();
    const supabaseStatus = await db.getSupabaseStatus();
    
    // Mask sensitive API keys before returning to client
    const safeSettings = {
      ...settings,
      gemini_api_key: settings.gemini_api_key ? "••••••••" + settings.gemini_api_key.slice(-4) : "",
      gemini_backup_api_key: settings.gemini_backup_api_key ? "••••••••" + settings.gemini_backup_api_key.slice(-4) : "",
      openai_api_key: settings.openai_api_key ? "••••••••" + settings.openai_api_key.slice(-4) : "",
      openai_backup_api_key: settings.openai_backup_api_key ? "••••••••" + settings.openai_backup_api_key.slice(-4) : "",
      groq_api_key: settings.groq_api_key ? "••••••••" + settings.groq_api_key.slice(-4) : "",
      openrouter_api_key: settings.openrouter_api_key ? "••••••••" + settings.openrouter_api_key.slice(-4) : "",
      custom_image_api_key: settings.custom_image_api_key ? "••••••••" + settings.custom_image_api_key.slice(-4) : "",
      n8n_api_key: settings.n8n_api_key ? "••••••••" + settings.n8n_api_key.slice(-4) : "",
      auto_failover_enabled: settings.auto_failover_enabled !== false,
      has_gemini_key: !!(process.env.GEMINI_API_KEY || (settings.gemini_api_key && settings.gemini_api_key.trim().length > 5)),
      has_gemini_backup_key: !!(settings.gemini_backup_api_key && settings.gemini_backup_api_key.trim().length > 5),
      has_openai_key: !!(process.env.OPENAI_API_KEY || (settings.openai_api_key && settings.openai_api_key.trim().length > 5)),
      has_openai_backup_key: !!(settings.openai_backup_api_key && settings.openai_backup_api_key.trim().length > 5),
      has_groq_key: !!(process.env.GROQ_API_KEY || (settings.groq_api_key && settings.groq_api_key.trim().length > 5)),
      has_openrouter_key: !!(process.env.OPENROUTER_API_KEY || (settings.openrouter_api_key && settings.openrouter_api_key.trim().length > 5)),
      has_custom_image_key: !!(process.env.CUSTOM_IMAGE_API_KEY || settings.custom_image_api_key),
      has_n8n_webhook: !!(process.env.N8N_WEBHOOK_URL || settings.n8n_webhook_url),
      storage_mode: storageMode,
      supabase_status: supabaseStatus
    };

    return NextResponse.json({ success: true, settings: safeSettings, auditLogs, aiGenerations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = db.getSettings();

    // Action: Test Gemini Primary API
    if (body.action === "TEST_GEMINI") {
      const explicitKey = body.gemini_api_key && !body.gemini_api_key.startsWith("••••") ? body.gemini_api_key.trim() : undefined;
      const testKey = explicitKey || process.env.GEMINI_API_KEY || current.gemini_api_key;

      if (!testKey) {
        return NextResponse.json({
          success: false,
          simulated: true,
          message: "ยังไม่ได้ระบุ Gemini API Key (ระบบ Auto-Failover จะใช้ตัวเลือกอื่นหรือ Local Engine แทน)"
        });
      }

      const res = await testProviderConnection("gemini", testKey, body.gemini_model || current.gemini_model);
      db.logAudit("TEST_API_GEMINI", "SETTINGS", "system", `Gemini Primary Test: ${res.success ? "SUCCESS" : "FAILED"}`);
      return NextResponse.json(res);
    }

    // Action: Test Gemini Backup API
    if (body.action === "TEST_GEMINI_BACKUP") {
      const explicitKey = body.gemini_backup_api_key && !body.gemini_backup_api_key.startsWith("••••") ? body.gemini_backup_api_key.trim() : undefined;
      const testKey = explicitKey || current.gemini_backup_api_key;

      if (!testKey) {
        return NextResponse.json({ success: false, message: "ยังไม่ได้ระบุ Gemini Backup Key" });
      }

      const res = await testProviderConnection("gemini_backup", testKey, "gemini-3.5-flash");
      db.logAudit("TEST_API_GEMINI_BACKUP", "SETTINGS", "system", `Gemini Backup Test: ${res.success ? "SUCCESS" : "FAILED"}`);
      return NextResponse.json(res);
    }

    // Action: Test OpenAI Primary API
    if (body.action === "TEST_OPENAI") {
      const explicitKey = body.openai_api_key && !body.openai_api_key.startsWith("••••") ? body.openai_api_key.trim() : undefined;
      const testKey = explicitKey || process.env.OPENAI_API_KEY || current.openai_api_key;

      if (!testKey) {
        return NextResponse.json({
          success: false,
          message: "ยังไม่ได้ระบุ OpenAI API Key (ระบบจะใช้โมเดลฟรีหรือ Gemini แทนอัตโนมัติ)"
        });
      }

      const res = await testProviderConnection("openai", testKey);
      db.logAudit("TEST_API_OPENAI", "SETTINGS", "system", `OpenAI Primary Test: ${res.success ? "SUCCESS" : "FAILED"}`);
      return NextResponse.json(res);
    }

    // Action: Test OpenAI Backup API
    if (body.action === "TEST_OPENAI_BACKUP") {
      const explicitKey = body.openai_backup_api_key && !body.openai_backup_api_key.startsWith("••••") ? body.openai_backup_api_key.trim() : undefined;
      const testKey = explicitKey || current.openai_backup_api_key;

      if (!testKey) {
        return NextResponse.json({ success: false, message: "ยังไม่ได้ระบุ OpenAI Backup Key" });
      }

      const res = await testProviderConnection("openai_backup", testKey);
      db.logAudit("TEST_API_OPENAI_BACKUP", "SETTINGS", "system", `OpenAI Backup Test: ${res.success ? "SUCCESS" : "FAILED"}`);
      return NextResponse.json(res);
    }

    // Action: Test Groq API (Free Tier)
    if (body.action === "TEST_GROQ") {
      const explicitKey = body.groq_api_key && !body.groq_api_key.startsWith("••••") ? body.groq_api_key.trim() : undefined;
      const testKey = explicitKey || process.env.GROQ_API_KEY || current.groq_api_key;

      if (!testKey) {
        return NextResponse.json({ success: false, message: "ยังไม่ได้ระบุ Groq API Key" });
      }

      const res = await testProviderConnection("groq", testKey);
      db.logAudit("TEST_API_GROQ", "SETTINGS", "system", `Groq Test: ${res.success ? "SUCCESS" : "FAILED"}`);
      return NextResponse.json(res);
    }

    // Action: Test OpenRouter API (Free Tier)
    if (body.action === "TEST_OPENROUTER") {
      const explicitKey = body.openrouter_api_key && !body.openrouter_api_key.startsWith("••••") ? body.openrouter_api_key.trim() : undefined;
      const testKey = explicitKey || process.env.OPENROUTER_API_KEY || current.openrouter_api_key;

      if (!testKey) {
        return NextResponse.json({ success: false, message: "ยังไม่ได้ระบุ OpenRouter API Key" });
      }

      const res = await testProviderConnection("openrouter", testKey);
      db.logAudit("TEST_API_OPENROUTER", "SETTINGS", "system", `OpenRouter Test: ${res.success ? "SUCCESS" : "FAILED"}`);
      return NextResponse.json(res);
    }

    // Action: Test Supabase Connection
    if (body.action === "TEST_SUPABASE") {
      const status = await db.getSupabaseStatus();
      db.logAudit("TEST_SUPABASE", "SETTINGS", "system", `Supabase status: ${status.mode} (connected: ${status.connected})`);
      return NextResponse.json({ success: true, status });
    }

    // Standard settings update
    const sanitizedUpdates = { ...body };

    const preserveSecret = (keyName: keyof typeof current) => {
      const val = sanitizedUpdates[keyName];
      if (!val || typeof val !== "string" || val.startsWith("••••") || val.trim() === "") {
        if (current[keyName]) {
          sanitizedUpdates[keyName] = current[keyName];
        } else {
          delete sanitizedUpdates[keyName];
        }
      }
    };

    preserveSecret("gemini_api_key");
    preserveSecret("gemini_backup_api_key");
    preserveSecret("openai_api_key");
    preserveSecret("openai_backup_api_key");
    preserveSecret("groq_api_key");
    preserveSecret("openrouter_api_key");
    preserveSecret("custom_image_api_key");
    preserveSecret("n8n_api_key");

    if (body.auto_failover_enabled !== undefined) {
      sanitizedUpdates.auto_failover_enabled = Boolean(body.auto_failover_enabled);
    }

    const updated = db.updateSettings(sanitizedUpdates);
    db.logAudit("UPDATE_SETTINGS", "SETTINGS", "system", "Updated system preferences & API configuration with Auto-Failover settings");

    const safeSettings = {
      ...updated,
      gemini_api_key: updated.gemini_api_key ? "••••••••" + updated.gemini_api_key.slice(-4) : "",
      gemini_backup_api_key: updated.gemini_backup_api_key ? "••••••••" + updated.gemini_backup_api_key.slice(-4) : "",
      openai_api_key: updated.openai_api_key ? "••••••••" + updated.openai_api_key.slice(-4) : "",
      openai_backup_api_key: updated.openai_backup_api_key ? "••••••••" + updated.openai_backup_api_key.slice(-4) : "",
      groq_api_key: updated.groq_api_key ? "••••••••" + updated.groq_api_key.slice(-4) : "",
      openrouter_api_key: updated.openrouter_api_key ? "••••••••" + updated.openrouter_api_key.slice(-4) : "",
      custom_image_api_key: updated.custom_image_api_key ? "••••••••" + updated.custom_image_api_key.slice(-4) : "",
      n8n_api_key: updated.n8n_api_key ? "••••••••" + updated.n8n_api_key.slice(-4) : "",
      auto_failover_enabled: updated.auto_failover_enabled !== false,
      has_gemini_key: !!(process.env.GEMINI_API_KEY || (updated.gemini_api_key && updated.gemini_api_key.trim().length > 5)),
      has_gemini_backup_key: !!(updated.gemini_backup_api_key && updated.gemini_backup_api_key.trim().length > 5),
      has_openai_key: !!(process.env.OPENAI_API_KEY || (updated.openai_api_key && updated.openai_api_key.trim().length > 5)),
      has_openai_backup_key: !!(updated.openai_backup_api_key && updated.openai_backup_api_key.trim().length > 5),
      has_groq_key: !!(process.env.GROQ_API_KEY || (updated.groq_api_key && updated.groq_api_key.trim().length > 5)),
      has_openrouter_key: !!(process.env.OPENROUTER_API_KEY || (updated.openrouter_api_key && updated.openrouter_api_key.trim().length > 5)),
      has_custom_image_key: !!(process.env.CUSTOM_IMAGE_API_KEY || updated.custom_image_api_key),
      has_n8n_webhook: !!(process.env.N8N_WEBHOOK_URL || updated.n8n_webhook_url),
      storage_mode: db.getStorageMode()
    };

    return NextResponse.json({ success: true, settings: safeSettings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

