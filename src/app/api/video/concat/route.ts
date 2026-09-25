import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoUrls, aspectRatio = "9:16", title = "PK Commercial Video" } = body;

    if (!Array.isArray(videoUrls) || videoUrls.length === 0) {
      return NextResponse.json(
        { error: "กรุณาระบุรายการลิงก์วิดีโอที่ต้องการรวม (videoUrls array)" },
        { status: 400 }
      );
    }

    // Filter valid URLs or paths
    const validUrls = videoUrls.filter((u: any) => typeof u === "string" && u.trim().length > 0);
    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบวิดีโอที่พร้อมใช้งานสำหรับการรวมคลิป" },
        { status: 400 }
      );
    }

    const tempDir = path.join(os.tmpdir(), `pk_concat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const downloadedFiles: string[] = [];

    // Download each video to temp directory
    for (let i = 0; i < validUrls.length; i++) {
      const url = validUrls[i];
      const targetExt = url.includes(".webm") ? ".webm" : ".mp4";
      const localFile = path.join(tempDir, `clip_${String(i).padStart(3, "0")}${targetExt}`);

      if (url.startsWith("http://") || url.startsWith("https://")) {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`ไม่สามารถดาวน์โหลดวิดีโอคลิปที่ ${i + 1} (${res.statusText})`);
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(localFile, buffer);
      } else if (fs.existsSync(url)) {
        fs.copyFileSync(url, localFile);
      } else {
        throw new Error(`ไม่พบไฟล์หรือ URL ของคลิปที่ ${i + 1}`);
      }

      downloadedFiles.push(localFile);
    }

    // Prepare output directory in public/output
    const publicOutputDir = path.join(process.cwd(), "public", "output");
    fs.mkdirSync(publicOutputDir, { recursive: true });

    const outputFileName = `commercial_master_${Date.now()}.mp4`;
    const finalOutputPath = path.join(publicOutputDir, outputFileName);

    // Determine target resolution based on aspect ratio
    const isVertical = aspectRatio === "9:16" || aspectRatio !== "16:9";
    const targetWidth = isVertical ? 1080 : 1920;
    const targetHeight = isVertical ? 1920 : 1080;

    // Standardize each video first into normalized 24fps 1080x1920 / 1920x1080 H.264
    const standardizedFiles: string[] = [];
    for (let i = 0; i < downloadedFiles.length; i++) {
      const srcFile = downloadedFiles[i];
      const normalizedFile = path.join(tempDir, `norm_${String(i).padStart(3, "0")}.mp4`);

      // Scale & pad to exact resolution, 24fps, yuv420p
      const normCmd = `ffmpeg -y -i "${srcFile}" -vf "scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -an "${normalizedFile}"`;
      await execAsync(normCmd);
      standardizedFiles.push(normalizedFile);
    }

    // Create concat list file
    const concatListPath = path.join(tempDir, "concat_list.txt");
    const listContent = standardizedFiles
      .map((f) => `file '${f.replace(/\\/g, "/")}'`)
      .join("\n");
    fs.writeFileSync(concatListPath, listContent, "utf-8");

    // Run Concat Demuxer
    const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c copy "${finalOutputPath}"`;
    await execAsync(concatCmd);

    // Cleanup temp files asynchronously
    setTimeout(() => {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {
        // ignore cleanup error
      }
    }, 10000);

    return NextResponse.json({
      success: true,
      videoUrl: `/output/${outputFileName}`,
      fileName: outputFileName,
      clipCount: standardizedFiles.length,
      aspectRatio,
      title
    });
  } catch (error: any) {
    console.error("Video concat error:", error);
    return NextResponse.json(
      {
        error: error.message || "เกิดข้อผิดพลาดในการรวมคลิปวิดีโอด้วย FFmpeg"
      },
      { status: 500 }
    );
  }
}
