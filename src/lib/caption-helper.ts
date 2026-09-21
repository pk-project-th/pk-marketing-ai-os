/**
 * Cleans unnecessary parentheses, stage directions, and director cues from captions.
 * Ensures captions read naturally for social media posts without screenplay artifacts.
 */
export function cleanCaptionText(text: string): string {
  if (!text || typeof text !== "string") return "";

  let cleaned = text
    // Remove screenplay markers & timecodes if they ever appear in post captions
    .replace(/^🎬\s*บทพูดคลิป[^\n]*\n?/gm, "")
    .replace(/^⏱️?\s*\d+:\d+\s*-\s*\d+:\d+[^\n:]*:\s*/gm, "")
    .replace(/\((?:Hook\s*เปิดคลิป|เนื้อเรื่องจริง|Call\s*to\s*action|บทสรุป|เปิดคลิป)\)/gi, "")
    .replace(/\[(?:Hook\s*เปิดคลิป|เนื้อเรื่องจริง|Call\s*to\s*action|บทสรุป|เปิดคลิป)\]/gi, "")
    // 1. Remove stage directions in parentheses with action verbs / cues
    // e.g. (ชี้ไปที่ตัวเลข 13-16 บนหน้าจอ), (ตัดภาพไปที่...), (ยิ้ม), (ซูมเข้า), (หันมองกล้อง), (โชว์สินค้า)
    .replace(/\s*\([^)]*(?:ชี้|ภาพ|ตัด|ซูม|หัน|เดิน|ยิ้ม|พูด|มอง|ทำท่า|เสียง|โชว์|หน้าจอ|ก้มมอง|ฉาก|แอ็กชัน|หยิบ|ถือ|เปิด|กด|ชู|พยักหน้า|หัวเราะ|ถอนหายใจ|เอฟเฟกต์|ดนตรี|คิวกล้อง|มุมกล้อง|สลับ)[^)]*\)/gi, "")
    // 2. Remove stage directions in square brackets [action]
    .replace(/\s*\[[^\]]*(?:ชี้|ภาพ|ตัด|ซูม|หัน|เดิน|ยิ้ม|พูด|มอง|ทำท่า|เสียง|โชว์|หน้าจอ|ก้มมอง|ฉาก|แอ็กชัน|หยิบ|ถือ|เปิด|กด|ชู|พยักหน้า|หัวเราะ|ถอนหายใจ|เอฟเฟกต์|ดนตรี|คิวกล้อง|มุมกล้อง|สลับ)[^\]]*\]/gi, "")
    // 3. Remove English stage directions in parentheses: (pointing...), (camera cuts...), (smiling), etc.
    .replace(/\s*\([^)]*(?:pointing|camera|cut to|zoom|smile|gesture|screen|holding|showing|music|sound effect|sfx|b-roll|pov)[^)]*\)/gi, "")
    // 4. Remove empty parentheses or brackets
    .replace(/\s*\(\s*\)/g, "")
    .replace(/\s*\[\s*\]/g, "")
    // 5. Clean up dangling spaces before punctuation (e.g. "!  เร..." -> "! เร...")
    .replace(/\s+([!?,.])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned;
}

/**
 * Extracts a 100% natural, continuous spoken voiceover script without timecodes or cue labels.
 */
export function extractCleanSpokenScript(text: string): string {
  if (!text || typeof text !== "string") return "";

  let cleaned = text
    .replace(/^🎬\s*บทพูดคลิป[^\n]*\n?/gm, "")
    .replace(/^⏱️?\s*\d+:\d+\s*-\s*\d+:\d+[^\n:]*:\s*/gm, "")
    .replace(/\((?:Hook\s*เปิดคลิป|เนื้อเรื่องจริง|Call\s*to\s*action|บทสรุป|เปิดคลิป)\)/gi, "")
    .replace(/\[(?:Hook\s*เปิดคลิป|เนื้อเรื่องจริง|Call\s*to\s*action|บทสรุป|เปิดคลิป)\]/gi, "")
    // Remove stage directions
    .replace(/\s*\([^)]*(?:ชี้|ภาพ|ตัด|ซูม|หัน|เดิน|ยิ้ม|พูด|มอง|ทำท่า|เสียง|โชว์|หน้าจอ|ก้มมอง|ฉาก|แอ็กชัน|หยิบ|ถือ|เปิด|กด|ชู|พยักหน้า|หัวเราะ|ถอนหายใจ|เอฟเฟกต์|ดนตรี|คิวกล้อง|มุมกล้อง|สลับ)[^)]*\)/gi, "")
    .replace(/\s*\[[^\]]*(?:ชี้|ภาพ|ตัด|ซูม|หัน|เดิน|ยิ้ม|พูด|มอง|ทำท่า|เสียง|โชว์|หน้าจอ|ก้มมอง|ฉาก|แอ็กชัน|หยิบ|ถือ|เปิด|กด|ชู|พยักหน้า|หัวเราะ|ถอนหายใจ|เอฟเฟกต์|ดนตรี|คิวกล้อง|มุมกล้อง|สลับ)[^\]]*\]/gi, "")
    .replace(/\s*\(\s*\)/g, "")
    .replace(/\s*\[\s*\]/g, "")
    .trim();

  // If there's a post caption marker, remove the post caption part
  const postIndex = cleaned.search(/(?:📝\s*แคปชั[่น]|📌\s*พิกัด|✨\s*สรุป|#)/);
  if (postIndex > 40) {
    cleaned = cleaned.slice(0, postIndex).trim();
  }

  // Combine lines into a natural continuous voiceover
  return cleaned
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .join(" ");
}

/**
 * Safely truncates Thai text without chopping syllables, breaking words, or leaving dangling front vowels / tone marks.
 */
export function safeThaiTruncate(str: string, maxLen: number = 35): string {
  if (!str) return "";
  const trimmed = str.trim();
  if (trimmed.length <= maxLen) return trimmed;

  let cutIndex = maxLen;
  const lastSpace = trimmed.lastIndexOf(" ", maxLen);
  if (lastSpace > maxLen * 0.6) {
    cutIndex = lastSpace;
  }

  let sub = trimmed.slice(0, cutIndex);
  // Remove dangling Thai front vowels (เ, แ, โ, ใ, ไ) at the very end
  sub = sub.replace(/[\u0E40-\u0E44]+$/, "");
  // Remove dangling Thai combining vowels and tones (ะ-ู, ็-๎) at the very end
  sub = sub.replace(/[\u0E30-\u0E3A\u0E47-\u0E4E]+$/, "");
  return sub.trim();
}

/**
 * Extracts a clean, concise topic title from a verbose brief without parentheses or extra fluff.
 */
export function extractCleanTopic(text: string): string {
  if (!text) return "คอนเทนต์พิเศษ";
  let cleaned = text.replace(/\([^)]*\)/g, "").replace(/\[[^\]]*\]/g, "").trim();
  cleaned = cleaned.replace(/^[\s#*•-]+/, "").trim();
  if (cleaned.length > 40) {
    const parts = cleaned.split(/[\n,;]/);
    if (parts[0] && parts[0].trim().length >= 5 && parts[0].trim().length <= 40) {
      cleaned = parts[0].trim();
    }
  }
  return cleaned || text.trim();
}
