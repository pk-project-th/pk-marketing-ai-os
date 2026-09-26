import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

// Curated ElevenLabs voices for Thai & Commercial narration
export const CURATED_VOICES = [
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", label: "👨‍🍳 เชฟหนุ่ม / เสียงผู้ชายอบอุ่น (Adam)", role: "chef" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", label: "👩‍🍳 พรีเซนเตอร์หญิง / สดใสเป็นมิตร (Rachel)", role: "presenter" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni", label: "🎙️ ผู้บรรยายหลัก / โฆษณาพรีเมียม (Antoni)", role: "narrator" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", label: "✨ สาวรีวิวชวนหิว / รีแอ็กชันตื่นเต้น (Bella)", role: "reviewer" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", label: "🔥 หนุ่มวัยรุ่น / สายสตรีทฟู้ด (Josh)", role: "youth" },
  { id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy", label: "👵 คุณแม่ / สูตรโบราณอบอุ่น (Dorothy)", role: "elder" },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      voiceId = "pNInz6obpgDQGcFmaJgB",
      apiKey,
      targetDurationSec,
      speed = 1.0,
      mode = "generate_single" // 'generate_single' | 'generate_master_track' | 'test_key'
    } = body;

    const effectiveApiKey = String(apiKey || process.env.ELEVENLABS_API_KEY || "").trim();

    if (!effectiveApiKey) {
      return NextResponse.json(
        { error: "กรุณาระบุ ElevenLabs API Key ในการตั้งค่า" },
        { status: 400 }
      );
    }

    // MODE 1: Test Connection & Get Subscription Quota
    if (mode === "test_key") {
      const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
        headers: { "xi-api-key": effectiveApiKey }
      });
      if (!res.ok) {
        // Fallback to /v1/voices for scoped keys
        const vRes = await fetch("https://api.elevenlabs.io/v1/voices", {
          headers: { "xi-api-key": effectiveApiKey }
        });
        if (!vRes.ok) {
          const err = await res.json().catch(() => ({}));
          return NextResponse.json(
            { success: false, error: err?.detail?.message || `API Key ไม่ถูกต้อง (${res.status})` },
            { status: 401 }
          );
        }
        return NextResponse.json({
          success: true,
          tier: "Custom/Active",
          remainingChars: "พร้อมใช้งาน",
          message: "✅ เชื่อมต่อ ElevenLabs API สำเร็จเรียบร้อย!"
        });
      }
      const data = await res.json();
      const remaining = (data.character_limit || 0) - (data.character_count || 0);
      return NextResponse.json({
        success: true,
        tier: data.tier || "Active",
        remainingChars: remaining,
        message: `✅ เชื่อมต่อ ElevenLabs API สำเร็จ! (โควตาคงเหลือ: ${remaining.toLocaleString()} ตัวอักษร)`
      });
    }

    // MODE 2: Generate Single Scene Audio with Precise Time-Fitting
    if (mode === "generate_single") {
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return NextResponse.json(
          { error: "กรุณาระบุข้อความบทพากย์ (text)" },
          { status: 400 }
        );
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": effectiveApiKey
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: Math.max(0.7, Math.min(1.2, speed))
          }
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: err?.detail?.message || `ElevenLabs API Error (${response.status})` },
          { status: response.status }
        );
      }

      const rawBuffer = Buffer.from(await response.arrayBuffer());

      // If targetDurationSec is provided, measure with FFmpeg and pad/time-fit
      let finalAudioBase64 = rawBuffer.toString("base64");
      let measuredDuration = targetDurationSec || 3.0;

      const tempDir = path.join(os.tmpdir(), `pk_tts_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
      fs.mkdirSync(tempDir, { recursive: true });
      const rawFile = path.join(tempDir, "raw.mp3");
      fs.writeFileSync(rawFile, rawBuffer);

      try {
        // Probe duration using ffprobe
        const probeCmd = `ffprobe -i "${rawFile}" -show_entries format=duration -v quiet -of csv="p=0"`;
        const { stdout: probeOut } = await execAsync(probeCmd);
        const durationFloat = parseFloat(probeOut.trim());
        if (!isNaN(durationFloat) && durationFloat > 0) {
          measuredDuration = Math.round(durationFloat * 100) / 100;
        }

        // Time-fitting logic: if targetDurationSec is defined and audio differs
        if (targetDurationSec && targetDurationSec > 0) {
          const target = Number(targetDurationSec);
          const ratio = measuredDuration / target;

          // If slightly longer (e.g. up to 25% longer), gently micro-speed with atempo to fit scene
          if (ratio > 1.05 && ratio < 1.35) {
            const fittedFile = path.join(tempDir, "fitted.mp3");
            const speedFactor = Math.min(1.3, ratio).toFixed(2);
            await execAsync(`ffmpeg -y -i "${rawFile}" -filter:a "atempo=${speedFactor}" -q:a 2 "${fittedFile}"`);
            if (fs.existsSync(fittedFile)) {
              const fittedBuffer = fs.readFileSync(fittedFile);
              finalAudioBase64 = fittedBuffer.toString("base64");
              measuredDuration = target;
            }
          }
          // If shorter than target by > 0.3s, pad with gentle silence to match video scene exactly
          else if (target - measuredDuration > 0.3) {
            const paddedFile = path.join(tempDir, "padded.mp3");
            const padDuration = (target - measuredDuration).toFixed(2);
            await execAsync(`ffmpeg -y -i "${rawFile}" -filter_complex "[0:a]apad=pad_dur=${padDuration}" -t ${target} -q:a 2 "${paddedFile}"`);
            if (fs.existsSync(paddedFile)) {
              const paddedBuffer = fs.readFileSync(paddedFile);
              finalAudioBase64 = paddedBuffer.toString("base64");
              measuredDuration = target;
            }
          }
        }
      } catch (ffErr) {
        console.warn("FFmpeg audio calibration note:", ffErr);
      } finally {
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch(e) {}
      }

      return NextResponse.json({
        success: true,
        audioBase64: finalAudioBase64,
        audioUrl: `data:audio/mpeg;base64,${finalAudioBase64}`,
        durationSec: measuredDuration,
        targetDurationSec: targetDurationSec || measuredDuration,
        isTimeFitted: Boolean(targetDurationSec)
      });
    }

    // MODE 3: Generate Master Timeline Audio Track (ต่อเสียงพากย์ทุกฉากตาม Timecode เป๊ะ 1 ไฟล์)
    if (mode === "generate_master_track") {
      const { sceneAudios } = body; // Array of { shotNumber, durationSec, audioBase64 }
      if (!Array.isArray(sceneAudios) || sceneAudios.length === 0) {
        return NextResponse.json(
          { error: "กรุณาระบุรายการเสียงพากย์รายฉาก (sceneAudios array)" },
          { status: 400 }
        );
      }

      const tempDir = path.join(os.tmpdir(), `pk_master_audio_${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });

      const concatListFile = path.join(tempDir, "concat_audio_list.txt");
      const listEntries: string[] = [];

      for (let i = 0; i < sceneAudios.length; i++) {
        const item = sceneAudios[i];
        const audioBuf = Buffer.from(item.audioBase64.replace(/^data:audio\/\w+;base64,/, ""), "base64");
        const chunkFile = path.join(tempDir, `shot_${String(i + 1).padStart(3, "0")}.mp3`);
        fs.writeFileSync(chunkFile, audioBuf);

        // Normalize each chunk to target shot duration
        const targetDur = item.durationSec || 3.0;
        const normFile = path.join(tempDir, `norm_${String(i + 1).padStart(3, "0")}.mp3`);
        await execAsync(`ffmpeg -y -i "${chunkFile}" -t ${targetDur} -q:a 2 "${normFile}"`);

        listEntries.push(`file '${normFile.replace(/\\/g, "/")}'`);
      }

      fs.writeFileSync(concatListFile, listEntries.join("\n"), "utf8");

      const masterOutputFile = path.join(tempDir, "master_voiceover.mp3");
      await execAsync(`ffmpeg -y -f concat -safe 0 -i "${concatListFile.replace(/\\/g, "/")}" -c copy "${masterOutputFile}"`);

      const masterBuffer = fs.readFileSync(masterOutputFile);
      const masterBase64 = masterBuffer.toString("base64");

      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch(e) {}

      return NextResponse.json({
        success: true,
        masterAudioBase64: masterBase64,
        masterAudioUrl: `data:audio/mpeg;base64,${masterBase64}`,
        message: "✅ รวมเสียงพากย์ทุกฉากตาม Timecode เป๊ะเรียบร้อยแล้ว!"
      });
    }

    return NextResponse.json({ error: "ไม่พบ mode การทำงานที่ระบุ" }, { status: 400 });
  } catch (error: any) {
    console.error("ElevenLabs TTS Route Error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการประมวลผลเสียง" }, { status: 500 });
  }
}
