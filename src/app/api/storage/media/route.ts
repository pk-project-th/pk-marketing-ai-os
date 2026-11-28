import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const VAULT_DIR = path.join(process.cwd(), "data", "media_vault");

function ensureVaultDir() {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-\u0E00-\u0E7F]/g, "_");
}

export async function POST(req: NextRequest) {
  try {
    ensureVaultDir();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const key = String(formData.get("key") || `file_${Date.now()}`);

    if (!file) {
      return NextResponse.json({ success: false, error: "ไม่พบไฟล์ที่อัปโหลด" }, { status: 400 });
    }

    const safeKey = sanitizeFileName(key);
    const safeOrig = sanitizeFileName(file.name || "media.bin");
    const savedFileName = `${safeKey}__${safeOrig}`;
    const fullPath = path.join(VAULT_DIR, savedFileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(fullPath, buffer);

    return NextResponse.json({
      success: true,
      fileName: savedFileName,
      originalName: file.name,
      size: buffer.length,
      serverPath: fullPath,
      serverUrl: `/api/storage/media?file=${encodeURIComponent(savedFileName)}`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Upload failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    ensureVaultDir();
    const { searchParams } = new URL(req.url);
    const fileParam = searchParams.get("file");
    const download = searchParams.get("download") === "1";

    if (!fileParam) {
      const files = fs.readdirSync(VAULT_DIR).map((f) => {
        const st = fs.statSync(path.join(VAULT_DIR, f));
        return { fileName: f, size: st.size, updatedAt: st.mtime.toISOString() };
      });
      return NextResponse.json({ success: true, files });
    }

    const safeFile = path.basename(fileParam);
    const fullPath = path.join(VAULT_DIR, safeFile);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(safeFile).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".mp4": "video/mp4",
      ".mov": "video/quicktime",
      ".mkv": "video/x-matroska",
      ".webm": "video/webm",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".m4a": "audio/mp4",
      ".flac": "audio/flac",
      ".opus": "audio/ogg",
      ".gif": "image/gif",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".zip": "application/zip",
      ".srt": "text/plain; charset=utf-8",
      ".vtt": "text/vtt; charset=utf-8",
      ".json": "application/json; charset=utf-8"
    };

    const contentType = mimeMap[ext] || "application/octet-stream";
    const fileBuffer = fs.readFileSync(fullPath);
    const cleanDownloadName = safeFile.includes("__") ? safeFile.split("__").slice(1).join("__") : safeFile;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileBuffer.length),
        ...(download
          ? {
              "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(cleanDownloadName)}`
            }
          : {})
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Read failed" }, { status: 500 });
  }
}
