import { NextRequest, NextResponse } from "next/server";
import { executeAIFailoverChain } from "@/lib/ai/failover-engine";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export interface SubtitleWordToken {
  word: string;
  start: number;
  end: number;
}

export interface SubtitleChunkItem {
  id: string;
  index: number;
  start: number;
  end: number;
  text: string;
  charCount: number;
  isSafeZone: boolean;
  words: SubtitleWordToken[];
}

const ENDING_PARTICLES = new Set([
  "ค่ะ",
  "ครับ",
  "นะคะ",
  "นะครับ",
  "จ้า",
  "เด้อ",
  "นะ",
  "ละ",
  "ล่ะ",
  "เลยค่ะ",
  "เลยครับ",
  "บาทค่ะ",
  "บาทครับ"
]);

/**
 * Splits Thai text into natural phrase tokens without breaking Thai combining characters
 * and keeps polite particles attached to their clause.
 */
function tokenizeThaiNatural(text: string): string[] {
  if (!text || !text.trim()) return [];
  const cleaned = text.replace(/\r\n/g, "\n").trim();

  // Use Intl.Segmenter if available in Node 18+ for accurate Thai word segmentation
  try {
    if (typeof Intl !== "undefined" && (Intl as any).Segmenter) {
      const segmenter = new (Intl as any).Segmenter("th", { granularity: "word" });
      const rawSegments = Array.from(segmenter.segment(cleaned)) as Array<{ segment: string; isWordLike?: boolean }>;
      const tokens: string[] = [];
      for (const seg of rawSegments) {
        const s = seg.segment.trim();
        if (!s) continue;
        if (ENDING_PARTICLES.has(s) && tokens.length > 0) {
          tokens[tokens.length - 1] += s;
        } else {
          tokens.push(s);
        }
      }
      if (tokens.length > 0) return tokens;
    }
  } catch {}

  return cleaned.split(/\s+/).filter(Boolean);
}

/**
 * Anti-Orphan Thai Subtitle Chunker (ported from auto-edit-kit/modules/thai_formatter.py)
 * Groups words into clean <= 24 character lines while preventing orphan ending particles.
 */
function buildAntiOrphanSubtitlesFromWords(
  words: SubtitleWordToken[],
  maxCharsPerLine: number = 24
): SubtitleChunkItem[] {
  if (!words || words.length === 0) return [];

  const chunks: SubtitleChunkItem[] = [];
  let currentWords: SubtitleWordToken[] = [];
  let currentText = "";

  const flushChunk = () => {
    if (currentWords.length === 0) return;
    const text = currentText.trim();
    const start = Number(currentWords[0].start.toFixed(2));
    const end = Number(Math.max(start + 0.4, currentWords[currentWords.length - 1].end).toFixed(2));
    chunks.push({
      id: `sub-${chunks.length + 1}-${Date.now()}`,
      index: chunks.length + 1,
      start,
      end,
      text,
      charCount: text.length,
      isSafeZone: text.length <= maxCharsPerLine,
      words: [...currentWords]
    });
    currentWords = [];
    currentText = "";
  };

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const token = w.word.trim();
    if (!token) continue;

    const isAscii = /^[A-Za-z0-9]/.test(token);
    const prevWasAscii = currentText.length > 0 && /[A-Za-z0-9]$/.test(currentText);
    const sep = currentText.length === 0 ? "" : isAscii || prevWasAscii ? " " : "";
    const candidateText = currentText + sep + token;

    const pauseGap =
      currentWords.length > 0 ? w.start - currentWords[currentWords.length - 1].end : 0;

    // Never orphan an ending particle onto a new line
    if (ENDING_PARTICLES.has(token) && currentWords.length > 0) {
      currentWords.push(w);
      currentText = candidateText;
      flushChunk();
      continue;
    }

    if (
      currentWords.length > 0 &&
      (candidateText.length > maxCharsPerLine || pauseGap > 0.45)
    ) {
      flushChunk();
      currentWords.push(w);
      currentText = token;
    } else {
      currentWords.push(w);
      currentText = candidateText;
    }
  }

  flushChunk();
  return chunks;
}

/**
 * Converts a plain Thai script or scene array into timed subtitle chunks with word-level karaoke tokens.
 */
function buildSubtitlesFromThaiScript(
  scriptText: string,
  totalDurationSec?: number,
  maxCharsPerLine: number = 24
): SubtitleChunkItem[] {
  const rawLines = scriptText
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .map((l) => l.replace(/^\[[^\]]+\]\s*/, "").trim())
    .filter(Boolean);

  const allTokens: string[] = [];
  for (const line of rawLines) {
    // Split on spaces first so natural Thai breath pauses are respected
    const clauses = line.split(/\s+/).filter(Boolean);
    for (const clause of clauses) {
      if (clause.length <= maxCharsPerLine) {
        allTokens.push(clause);
      } else {
        const subWords = tokenizeThaiNatural(clause);
        allTokens.push(...subWords);
      }
    }
  }

  if (allTokens.length === 0) return [];

  const totalChars = allTokens.reduce((acc, t) => acc + t.length, 0) || 1;
  const effectiveTotalSec = totalDurationSec || Math.max(6, Number((totalChars * 0.14).toFixed(1)));

  let cursor = 0;
  const timedWords: SubtitleWordToken[] = allTokens.map((tok) => {
    const dur = Math.max(0.28, (tok.length / totalChars) * effectiveTotalSec);
    const start = Number(cursor.toFixed(2));
    const end = Number((cursor + dur).toFixed(2));
    cursor += dur;
    return { word: tok, start, end };
  });

  return buildAntiOrphanSubtitlesFromWords(timedWords, maxCharsPerLine);
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // =========================================================================
    // CASE 1: Multipart File Upload (Video / Audio file -> Groq Whisper v3 / ElevenLabs Scribe)
    // =========================================================================
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const engine = String(formData.get("engine") || "groq");
      const maxChars = Number(formData.get("maxChars") || 24);

      if (!file) {
        return NextResponse.json({ success: false, error: "กรุณาเลือกไฟล์วิดีโอหรือไฟล์เสียงก่อนครับ" }, { status: 400 });
      }

      const settings = db.getSettings();
      const groqKey = (process.env.GROQ_API_KEY || settings.groq_api_key || "").trim();
      const elevenKey = (process.env.ELEVENLABS_API_KEY || (settings as any).elevenlabs_api_key || "").trim();

      // Try ElevenLabs Scribe v1 if selected
      if (engine === "elevenlabs" && elevenKey) {
        try {
          const elForm = new FormData();
          elForm.append("file", file);
          elForm.append("model_id", "scribe_v1");
          elForm.append("language_code", "tha");

          const elRes = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
            method: "POST",
            headers: { "xi-api-key": elevenKey },
            body: elForm
          });

          if (elRes.ok) {
            const elData = await elRes.json();
            const rawWords: SubtitleWordToken[] = (elData.words || [])
              .filter((w: any) => w.type === "word" || (w.text && w.text.trim()))
              .map((w: any) => ({
                word: String(w.text || "").trim(),
                start: Number(w.start || 0),
                end: Number(w.end || (w.start || 0) + 0.3)
              }));

            const chunks =
              rawWords.length > 0
                ? buildAntiOrphanSubtitlesFromWords(rawWords, maxChars)
                : buildSubtitlesFromThaiScript(elData.text || "", undefined, maxChars);

            return NextResponse.json({
              success: true,
              engineUsed: "ElevenLabs Scribe v1",
              fullText: elData.text || chunks.map((c) => c.text).join(" "),
              subtitles: chunks
            });
          }
        } catch (e) {
          console.warn("[Transcribe] ElevenLabs Scribe fallback to Groq Whisper:", e);
        }
      }

      // Primary / Fallback: Groq Whisper Large v3 Turbo
      if (groqKey) {
        try {
          const groqForm = new FormData();
          groqForm.append("file", file);
          groqForm.append("model", "whisper-large-v3-turbo");
          groqForm.append("language", "th");
          groqForm.append("response_format", "verbose_json");
          groqForm.append("timestamp_granularities[]", "word");
          groqForm.append("timestamp_granularities[]", "segment");

          const gRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${groqKey}` },
            body: groqForm
          });

          if (gRes.ok) {
            const gData = await gRes.json();
            const rawWords: SubtitleWordToken[] = (gData.words || []).map((w: any) => ({
              word: String(w.word || "").trim(),
              start: Number(w.start || 0),
              end: Number(w.end || (w.start || 0) + 0.3)
            }));

            let chunks: SubtitleChunkItem[] = [];
            if (rawWords.length > 0) {
              chunks = buildAntiOrphanSubtitlesFromWords(rawWords, maxChars);
            } else if (Array.isArray(gData.segments) && gData.segments.length > 0) {
              const segWords: SubtitleWordToken[] = [];
              for (const seg of gData.segments) {
                const tokens = tokenizeThaiNatural(String(seg.text || ""));
                const dur = Math.max(0.4, Number(seg.end || 0) - Number(seg.start || 0));
                const perTok = dur / Math.max(1, tokens.length);
                tokens.forEach((t, idx) => {
                  segWords.push({
                    word: t,
                    start: Number(seg.start || 0) + idx * perTok,
                    end: Number(seg.start || 0) + (idx + 1) * perTok
                  });
                });
              }
              chunks = buildAntiOrphanSubtitlesFromWords(segWords, maxChars);
            } else {
              chunks = buildSubtitlesFromThaiScript(gData.text || "", undefined, maxChars);
            }

            return NextResponse.json({
              success: true,
              engineUsed: "Groq Whisper Large v3 Turbo",
              fullText: gData.text || chunks.map((c) => c.text).join(" "),
              subtitles: chunks
            });
          }
        } catch (e) {
          console.warn("[Transcribe] Groq Whisper error:", e);
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถถอดเสียงไฟล์นี้ได้ (ไฟล์อาจมีขนาดใหญ่เกิน 25MB สำหรับ Cloud API) แนะนำให้แยกเฉพาะไฟล์เสียง MP3 ในแผนกโหลดคลิป หรือวางสคริปต์เพื่อซิงค์ซับอัตโนมัติครับ"
        },
        { status: 422 }
      );
    }

    // =========================================================================
    // CASE 2: JSON Request (FROM_SCRIPT | POLISH_THAI)
    // =========================================================================
    const body = await req.json();
    const { action = "FROM_SCRIPT", scriptText, subtitles, totalDurationSec, maxChars = 24 } = body;

    if (action === "FROM_SCRIPT") {
      if (!scriptText || typeof scriptText !== "string" || !scriptText.trim()) {
        return NextResponse.json({ success: false, error: "กรุณาวางบทพากย์หรือสคริปต์ภาษาไทยก่อนครับ" }, { status: 400 });
      }
      const chunks = buildSubtitlesFromThaiScript(scriptText, totalDurationSec, maxChars);
      return NextResponse.json({
        success: true,
        engineUsed: "PK Anti-Orphan Thai Alignment Engine",
        fullText: scriptText,
        subtitles: chunks
      });
    }

    if (action === "POLISH_THAI") {
      if (!Array.isArray(subtitles) || subtitles.length === 0) {
        return NextResponse.json({ success: false, error: "ไม่มีรายการซับไตเติลให้ตรวจคำผิด" }, { status: 400 });
      }

      const linesText = subtitles.map((s: any, idx: number) => `${idx + 1}. ${s.text}`).join("\n");
      const aiRes = await executeAIFailoverChain({
        systemInstruction: `คุณคือบรรณาธิการตรวจคำผิดซับไตเติลภาษาไทยระดับมืออาชีพ
หน้าที่ของคุณคือแก้คำพ้องเสียงที่ถอดเสียงผิด ให้เป็นภาษาไทยที่สะกดถูกต้อง 100% กระชับ อ่านง่ายบนหน้าจอมือถือ 9:16
ห้ามเพิ่มหรือลดจำนวนบรรทัดเด็ดขาด ตอบเป็น JSON เท่านั้น:
{ "corrected_lines": ["ข้อความบรรทัดที่ 1", "ข้อความบรรทัดที่ 2"] }`,
        prompt: `ตรวจและแก้คำผิดซับไตเติล ${subtitles.length} ท่อนต่อไปนี้:\n${linesText}`,
        workflow: "Thai Subtitle AI Polish",
        responseSchema: true
      });

      const corrected: string[] = aiRes.data?.corrected_lines || [];
      const polished = subtitles.map((sub: any, idx: number) => {
        const newText = (corrected[idx] && typeof corrected[idx] === "string" ? corrected[idx].trim() : sub.text) || sub.text;
        return {
          ...sub,
          text: newText,
          charCount: newText.length,
          isSafeZone: newText.length <= maxChars
        };
      });

      return NextResponse.json({
        success: true,
        modelUsed: aiRes.modelUsed,
        subtitles: polished
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Server error" }, { status: 500 });
  }
}
