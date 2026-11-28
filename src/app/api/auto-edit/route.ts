import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import { db } from "@/lib/db";

const execFileAsync = promisify(execFile);

export const dynamic = "force-dynamic";

const VAULT_DIR = path.join(process.cwd(), "data", "media_vault");
const CLI_SCRIPT = path.join(process.cwd(), "python_engines", "auto_edit_cli.py");

function ensureVaultDir() {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }
}

async function runPythonAutoEdit(payload: Record<string, any>): Promise<any> {
  const tmpId = `ae_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const reqFile = path.join(os.tmpdir(), `${tmpId}_req.json`);
  const resFile = path.join(os.tmpdir(), `${tmpId}_res.json`);

  fs.writeFileSync(reqFile, JSON.stringify(payload), "utf-8");

  const settings = db.getSettings();
  const env = {
    ...process.env,
    PYTHONIOENCODING: "utf-8",
    PYTHONUTF8: "1",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || settings.gemini_api_key || "",
    GROQ_API_KEY: process.env.GROQ_API_KEY || settings.groq_api_key || "",
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || (settings as any).elevenlabs_api_key || ""
  };

  try {
    await execFileAsync("python", [CLI_SCRIPT, reqFile, resFile], {
      env,
      timeout: 240000,
      maxBuffer: 20 * 1024 * 1024
    });

    if (fs.existsSync(resFile)) {
      const raw = fs.readFileSync(resFile, "utf-8");
      return JSON.parse(raw);
    }
    return { success: false, error: "Python engine did not produce response" };
  } finally {
    try {
      if (fs.existsSync(reqFile)) fs.unlinkSync(reqFile);
      if (fs.existsSync(resFile)) fs.unlinkSync(resFile);
    } catch {}
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureVaultDir();
    const body = await req.json();
    const { action = "ANALYZE" } = body;

    if (action === "ANALYZE") {
      const { fileName, serverPath } = body;
      const targetPath = serverPath || (fileName ? path.join(VAULT_DIR, path.basename(fileName)) : "");
      if (!targetPath || !fs.existsSync(targetPath)) {
        return NextResponse.json(
          { success: false, error: "ไม่พบไฟล์วิดีโอบนเซิร์ฟเวอร์ กรุณาอัปโหลดไฟล์วิดีโอ (.mp4, .mov) ก่อนครับ" },
          { status: 400 }
        );
      }

      const result = await runPythonAutoEdit({
        ...body,
        action: "ANALYZE",
        videoPath: targetPath
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error || "วิเคราะห์คลิปไม่สำเร็จ" }, { status: 422 });
      }

      // Also generate initial SRT/VTT/TXT exports
      const exportRes = await runPythonAutoEdit({
        action: "UPDATE_SUBS",
        operation: "realign",
        subtitles: result.subtitles,
        keepSegments: result.analysis?.keep_segments || [],
        masterWords: result.masterWords || [],
        vertPosPct: body.vertPosPct || 82
      });

      return NextResponse.json({
        ...result,
        subtitles: exportRes.subtitles || result.subtitles,
        exports: exportRes.exports || {}
      });
    }

    if (action === "UPDATE_SUBS") {
      const result = await runPythonAutoEdit(body);
      return NextResponse.json(result);
    }

    if (action === "RENDER_MP4") {
      const { fileName, serverPath } = body;
      const targetPath = serverPath || (fileName ? path.join(VAULT_DIR, path.basename(fileName)) : "");
      if (!targetPath || !fs.existsSync(targetPath)) {
        return NextResponse.json(
          { success: false, error: "ไม่พบไฟล์วิดีโอต้นฉบับสำหรับเรนเดอร์ MP4" },
          { status: 400 }
        );
      }

      const outFileName = `AutoEdit_Rendered_${Date.now()}.mp4`;
      const outFullPath = path.join(VAULT_DIR, outFileName);

      const result = await runPythonAutoEdit({
        ...body,
        action: "RENDER_MP4",
        videoPath: targetPath,
        outputPath: outFullPath
      });

      if (!result.success || !fs.existsSync(outFullPath)) {
        return NextResponse.json(
          { success: false, error: result.error || "เรนเดอร์ไฟล์ MP4 ไม่สำเร็จ" },
          { status: 422 }
        );
      }

      return NextResponse.json({
        success: true,
        renderedFileName: outFileName,
        previewUrl: `/api/storage/media?file=${encodeURIComponent(outFileName)}`,
        downloadUrl: `/api/storage/media?file=${encodeURIComponent(outFileName)}&download=1`
      });
    }

    if (action === "CAPCUT_DESKTOP") {
      const { fileName, serverPath } = body;
      const targetPath = serverPath || (fileName ? path.join(VAULT_DIR, path.basename(fileName)) : "");
      if (!targetPath || !fs.existsSync(targetPath)) {
        return NextResponse.json({ success: false, error: "ไม่พบไฟล์วิดีโอต้นฉบับ" }, { status: 400 });
      }
      const result = await runPythonAutoEdit({
        ...body,
        action: "CAPCUT_DESKTOP",
        videoPath: targetPath
      });
      return NextResponse.json(result);
    }

    if (action === "CLEANUP_CAPCUT") {
      const result = await runPythonAutoEdit({ action: "CLEANUP_CAPCUT" });
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Server error" }, { status: 500 });
  }
}
