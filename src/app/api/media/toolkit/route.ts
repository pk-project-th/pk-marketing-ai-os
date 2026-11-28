import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export const dynamic = "force-dynamic";

const VAULT_DIR = path.join(process.cwd(), "data", "media_vault");
const COOKIES_FILE = path.join(VAULT_DIR, "cookies.txt");
const CLI_SCRIPT = path.join(process.cwd(), "python_engines", "media_toolkit_cli.py");

function ensureVaultDir() {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }
  // Auto-seed cookies.txt from Downloads if present and not yet seeded
  if (!fs.existsSync(COOKIES_FILE)) {
    const candidateDownloads = [
      "C:\\Users\\Marketing\\Downloads\\www.youtube.com_cookies.txt",
      "C:\\Users\\Marketing\\Downloads\\www.youtube.com_cookies (1).txt",
      "C:\\Users\\Marketing\\.gemini\\antigravity\\scratch\\media-toolkit-web\\workspace\\cookies\\default.txt"
    ];
    for (const c of candidateDownloads) {
      if (fs.existsSync(c)) {
        try {
          fs.copyFileSync(c, COOKIES_FILE);
          break;
        } catch {}
      }
    }
  }
}

async function runPythonToolkit(payload: Record<string, any>): Promise<any> {
  const tmpId = `mt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const reqFile = path.join(os.tmpdir(), `${tmpId}_req.json`);
  const resFile = path.join(os.tmpdir(), `${tmpId}_res.json`);

  fs.writeFileSync(reqFile, JSON.stringify({ ...payload, vaultDir: VAULT_DIR }), "utf-8");

  try {
    await execFileAsync("python", [CLI_SCRIPT, reqFile, resFile], {
      env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1" },
      timeout: 300000,
      maxBuffer: 20 * 1024 * 1024
    });

    if (fs.existsSync(resFile)) {
      return JSON.parse(fs.readFileSync(resFile, "utf-8"));
    }
    return { success: false, error: "Engine returned no response" };
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
    const { action = "INSPECT" } = body;

    if (action === "COOKIES_STATUS") {
      const res = await runPythonToolkit({ action: "COOKIES_STATUS" });
      return NextResponse.json(res);
    }

    if (action === "SAVE_COOKIES") {
      const { cookiesText } = body;
      if (!cookiesText || typeof cookiesText !== "string" || !cookiesText.trim()) {
        return NextResponse.json({ success: false, error: "กรุณาวางข้อความ Cookies ก่อนบันทึก" }, { status: 400 });
      }
      fs.writeFileSync(COOKIES_FILE, cookiesText.replace(/\r\n/g, "\n"), "utf-8");
      const res = await runPythonToolkit({ action: "COOKIES_STATUS" });
      return NextResponse.json({
        success: true,
        message: "บันทึกและฝัง Cookies ถาวรเรียบร้อย! ใช้โหลดได้ทั้งคอมและมือถือ",
        cookiesMeta: res.cookiesMeta
      });
    }

    if (action === "CLEAR_COOKIES") {
      if (fs.existsSync(COOKIES_FILE)) fs.unlinkSync(COOKIES_FILE);
      return NextResponse.json({
        success: true,
        cookiesMeta: { loaded: false, total_cookie_lines: 0, youtube_cookies: 0, has_youtube_auth: false }
      });
    }

    if (action === "INSPECT") {
      const res = await runPythonToolkit(body);
      return NextResponse.json(res);
    }

    if (action === "DOWNLOAD") {
      const res = await runPythonToolkit(body);
      if (res.success && res.fileName) {
        return NextResponse.json({
          ...res,
          downloadUrl: `/api/storage/media?file=${encodeURIComponent(res.fileName)}&download=1`,
          previewUrl: `/api/storage/media?file=${encodeURIComponent(res.fileName)}`
        });
      }
      return NextResponse.json(res, { status: 422 });
    }

    if (action === "CONVERT") {
      const { fileName, serverPath } = body;
      const inputPath = serverPath || (fileName ? path.join(VAULT_DIR, path.basename(fileName)) : "");
      if (!inputPath || !fs.existsSync(inputPath)) {
        return NextResponse.json({ success: false, error: "ไม่พบไฟล์ต้นฉบับสำหรับแปลงไฟล์" }, { status: 400 });
      }
      const res = await runPythonToolkit({
        ...body,
        action: "CONVERT",
        inputPath
      });
      if (res.success && res.fileName) {
        return NextResponse.json({
          ...res,
          downloadUrl: `/api/storage/media?file=${encodeURIComponent(res.fileName)}&download=1`,
          previewUrl: `/api/storage/media?file=${encodeURIComponent(res.fileName)}`
        });
      }
      return NextResponse.json(res, { status: 422 });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Server error" }, { status: 500 });
  }
}
