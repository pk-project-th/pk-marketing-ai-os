/**
 * Multi-Format Document Text Extractor
 * Handles extraction of text from TXT, MD, JSON, CSV, and PDF/DOCX binary stream buffers.
 */

export interface ParsedDocumentResult {
  text: string;
  metadata: {
    format: string;
    charCount: number;
    wordCount: number;
    extractedLines: number;
    detectedType: string;
  };
}

/**
 * Extracts readable text from raw buffer or string based on file extension / MIME type
 */
export function extractTextFromDocument(
  content: string | Buffer,
  filename: string
): ParsedDocumentResult {
  const ext = filename.split(".").pop()?.toLowerCase() || "txt";

  let rawString = typeof content === "string" ? content : content.toString("utf-8");
  let processedText = "";

  switch (ext) {
    case "json": {
      try {
        const obj = JSON.parse(rawString);
        processedText = formatJsonToText(obj);
      } catch {
        processedText = rawString;
      }
      break;
    }

    case "csv": {
      processedText = formatCsvToText(rawString);
      break;
    }

    case "pdf": {
      // Clean extracted stream text from PDF buffers
      processedText = extractTextFromPdfStream(rawString);
      break;
    }

    case "docx": {
      // DOCX is a zip archive containing word/document.xml with <w:t> tags
      processedText = extractTextFromDocxXml(rawString);
      break;
    }

    case "md":
    case "txt":
    default: {
      processedText = rawString.trim();
      break;
    }
  }

  // Fallback if extraction returned empty
  if (!processedText.trim()) {
    processedText = rawString.replace(/[\x00-\x08\x0E-\x1F\x7F-\x9F]/g, "").trim();
  }

  const lines = processedText.split("\n").filter(l => l.trim().length > 0);
  const words = processedText.split(/\s+/).filter(Boolean);

  return {
    text: processedText,
    metadata: {
      format: ext.toUpperCase(),
      charCount: processedText.length,
      wordCount: words.length,
      extractedLines: lines.length,
      detectedType: detectMarketingDocumentType(processedText, filename)
    }
  };
}

/**
 * Formats JSON objects into readable text lines
 */
function formatJsonToText(obj: any, prefix = ""): string {
  if (typeof obj !== "object" || obj === null) {
    return `${prefix}: ${String(obj)}`;
  }

  const lines: string[] = [];
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      lines.push(formatJsonToText(item, `${prefix}[${index + 1}]`));
    });
  } else {
    for (const [key, value] of Object.entries(obj)) {
      const currentKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "object" && value !== null) {
        lines.push(formatJsonToText(value, currentKey));
      } else {
        lines.push(`${currentKey}: ${value}`);
      }
    }
  }
  return lines.join("\n");
}

/**
 * Formats CSV rows into clear labeled sections
 */
function formatCsvToText(csv: string): string {
  const rows = csv.split(/\r?\n/).filter(r => r.trim().length > 0);
  if (rows.length === 0) return "";

  const headers = rows[0].split(",").map(h => h.replace(/^["']|["']$/g, "").trim());
  const formatted: string[] = [`CSV Columns: ${headers.join(", ")}`];

  rows.slice(1, 15).forEach((row, idx) => {
    const cols = row.split(",").map(c => c.replace(/^["']|["']$/g, "").trim());
    const rowText = cols.map((col, cIdx) => `${headers[cIdx] || `Col ${cIdx + 1}`}: ${col}`).join(" | ");
    formatted.push(`Record ${idx + 1}: ${rowText}`);
  });

  return formatted.join("\n");
}

/**
 * Lightweight stream text extraction from PDF format
 */
function extractTextFromPdfStream(raw: string): string {
  const matches: string[] = [];

  // Match Tj and TJ text operators (e.g. (Some text) Tj or [(Some) 20 (text)] TJ)
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(raw)) !== null) {
    matches.push(match[1]);
  }

  // Match string literals inside stream blocks
  if (matches.length < 5) {
    const parenRegex = /\(([A-Za-z0-9\u0E00-\u0E7F\s.,:;/_+\-—()]{4,})\)/g;
    while ((match = parenRegex.exec(raw)) !== null) {
      if (!match[1].startsWith("/") && !match[1].includes("Font") && !match[1].includes("Obj")) {
        matches.push(match[1]);
      }
    }
  }

  // If stream operators extracted meaningful text, return it
  if (matches.length > 0) {
    return matches.join(" ");
  }

  // Clean ASCII/Thai text pass
  return raw.replace(/[^\x20-\x7E\u0E00-\u0E7F\n\r\t]/g, " ").replace(/\s{2,}/g, " ").trim();
}

/**
 * Extracts text from XML segments in DOCX stream
 */
function extractTextFromDocxXml(raw: string): string {
  const xmlTagRegex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
  const pieces: string[] = [];
  let match;
  while ((match = xmlTagRegex.exec(raw)) !== null) {
    pieces.push(match[1]);
  }

  if (pieces.length > 0) {
    return pieces.join(" ");
  }

  return raw.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}

/**
 * Heuristically identifies marketing document classification
 */
function detectMarketingDocumentType(text: string, filename: string): string {
  const lower = (text + " " + filename).toLowerCase();
  if (lower.includes("spec") || lower.includes("สเปก") || lower.includes("technical")) {
    return "Product Specification Sheet";
  }
  if (lower.includes("lead") || lower.includes("test drive") || lower.includes("ลงทะเบียน")) {
    return "Lead Registration / Test Drive Request";
  }
  if (lower.includes("brief") || lower.includes("บรีฟ") || lower.includes("campaign")) {
    return "Marketing Campaign Brief";
  }
  if (lower.includes("warranty") || lower.includes("การรับประกัน")) {
    return "Warranty & Compliance Policy";
  }
  return "General Marketing Document";
}
