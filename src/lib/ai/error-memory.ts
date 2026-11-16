import fs from "fs";
import path from "path";

export interface ErrorMemoryEntry {
  id: string;
  category: "AI_MODEL" | "GOOGLE_FLOW" | "TTS" | "IMAGE_GEN" | "NETWORK";
  signature: string; // e.g., "model:gemini-3.8-flash:503" or "flow:localhost:8200:ECONNREFUSED"
  message: string;
  resolution: string; // How the system self-healed / what to avoid next time
  occurrences: number;
  lastOccurredAt: string;
  avoidUntil?: string; // ISO timestamp until which this path is bypassed
}

const MEMORY_FILE = path.join(process.cwd(), "src", "data", "error-memory.json");
let inMemoryCache: ErrorMemoryEntry[] | null = null;

function loadMemory(): ErrorMemoryEntry[] {
  if (inMemoryCache) return inMemoryCache;
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      const raw = fs.readFileSync(MEMORY_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryCache = parsed;
        return inMemoryCache;
      }
    }
  } catch {
    // Ignore read errors on serverless/read-only environments
  }
  inMemoryCache = [];
  return inMemoryCache;
}

function saveMemory(entries: ErrorMemoryEntry[]) {
  inMemoryCache = entries.slice(0, 100); // Keep latest 100 unique patterns
  try {
    const dir = path.dirname(MEMORY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(inMemoryCache, null, 2), "utf-8");
  } catch {
    // Ignore write errors if filesystem is read-only
  }
}

/**
 * Record an error pattern and how the system healed/resolved it so it won't repeat the same mistake.
 */
export function recordErrorMemory(params: {
  category: ErrorMemoryEntry["category"];
  signature: string;
  message: string;
  resolution: string;
  cooldownMinutes?: number;
}): ErrorMemoryEntry {
  const entries = loadMemory();
  const now = new Date();
  const avoidUntil = params.cooldownMinutes
    ? new Date(now.getTime() + params.cooldownMinutes * 60 * 1000).toISOString()
    : undefined;

  const existingIdx = entries.findIndex((e) => e.signature === params.signature);
  if (existingIdx >= 0) {
    const updated: ErrorMemoryEntry = {
      ...entries[existingIdx],
      message: params.message,
      resolution: params.resolution,
      occurrences: entries[existingIdx].occurrences + 1,
      lastOccurredAt: now.toISOString(),
      avoidUntil: avoidUntil || entries[existingIdx].avoidUntil
    };
    entries[existingIdx] = updated;
    // Move to top
    entries.splice(existingIdx, 1);
    entries.unshift(updated);
    saveMemory(entries);
    return updated;
  }

  const created: ErrorMemoryEntry = {
    id: `err-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    category: params.category,
    signature: params.signature,
    message: params.message,
    resolution: params.resolution,
    occurrences: 1,
    lastOccurredAt: now.toISOString(),
    avoidUntil
  };
  entries.unshift(created);
  saveMemory(entries);
  return created;
}

/**
 * Check if a specific signature (e.g. a failing model or unreachable endpoint) is currently in cooldown.
 */
export function shouldAvoidSignature(signature: string): { avoid: boolean; entry?: ErrorMemoryEntry } {
  const entries = loadMemory();
  const match = entries.find((e) => e.signature === signature);
  if (!match || !match.avoidUntil) return { avoid: false };

  const now = Date.now();
  const until = new Date(match.avoidUntil).getTime();
  if (now < until) {
    return { avoid: true, entry: match };
  }
  return { avoid: false };
}

/**
 * Return all recorded error memories for diagnostics and transparency.
 */
export function getErrorMemories(): ErrorMemoryEntry[] {
  return loadMemory();
}

/**
 * Clear a specific error memory or all memories.
 */
export function clearErrorMemories(signature?: string) {
  if (!signature) {
    saveMemory([]);
    return;
  }
  const filtered = loadMemory().filter((e) => e.signature !== signature);
  saveMemory(filtered);
}
