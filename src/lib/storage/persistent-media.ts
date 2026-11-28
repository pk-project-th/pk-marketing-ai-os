"use client";

/**
 * IndexedDB Persistent Binary File & State Vault (PKHubMediaDB v4)
 * Embeds uploaded video (.mp4/.mov), audio (.mp3/.wav), images (.png/.jpg),
 * and rendered output files directly inside the browser's IndexedDB so that
 * switching tabs/pages or pressing F5 Refresh NEVER loses the user's files!
 */

const DB_NAME = "PKHubMediaVaultDB_v4";
const DB_VERSION = 1;
const FILE_STORE = "embedded_files";
const STATE_STORE = "studio_states";

export interface EmbeddedFileRecord {
  key: string;
  name: string;
  type: string;
  size: number;
  blob: Blob;
  serverPath?: string;
  serverUrl?: string;
  updatedAt: string;
}

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STATE_STORE)) {
        db.createObjectStore(STATE_STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Embeds a File or Blob in IndexedDB (and optionally uploads to /api/storage/media for backend FFmpeg use).
 */
export async function saveEmbeddedFile(
  key: string,
  fileOrBlob: File | Blob,
  fileName?: string,
  uploadToServer: boolean = false
): Promise<{ objectUrl: string; record: EmbeddedFileRecord }> {
  const name = fileName || (fileOrBlob instanceof File ? fileOrBlob.name : `${key}.bin`);
  const type = fileOrBlob.type || "application/octet-stream";
  let serverPath: string | undefined;
  let serverUrl: string | undefined;

  if (uploadToServer) {
    try {
      const form = new FormData();
      form.append("key", key);
      form.append("file", fileOrBlob, name);
      const res = await fetch("/api/storage/media", { method: "POST", body: form });
      if (res.ok) {
        const data = await res.json();
        serverPath = data.serverPath;
        serverUrl = data.serverUrl;
      }
    } catch {
      // Offline / client-only fallback still works via IndexedDB
    }
  }

  const record: EmbeddedFileRecord = {
    key,
    name,
    type,
    size: fileOrBlob.size,
    blob: fileOrBlob,
    serverPath,
    serverUrl,
    updatedAt: new Date().toISOString()
  };

  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(FILE_STORE, "readwrite");
      tx.objectStore(FILE_STORE).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (e) {
    console.warn("[PKHubMediaDB] IndexedDB save warning:", e);
  }

  const objectUrl = URL.createObjectURL(fileOrBlob);
  return { objectUrl, record };
}

/**
 * Restores an embedded File/Blob from IndexedDB when the user returns to a page or refreshes (F5).
 */
export async function loadEmbeddedFile(
  key: string
): Promise<{ objectUrl: string; record: EmbeddedFileRecord } | null> {
  try {
    const db = await openMediaDB();
    const record = await new Promise<EmbeddedFileRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(FILE_STORE, "readonly");
      const req = tx.objectStore(FILE_STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();

    if (record && record.blob) {
      const objectUrl = URL.createObjectURL(record.blob);
      return { objectUrl, record };
    }
  } catch (e) {
    console.warn("[PKHubMediaDB] IndexedDB load warning:", e);
  }
  return null;
}

/**
 * Deletes an embedded File/Blob from IndexedDB.
 */
export async function removeEmbeddedFile(key: string): Promise<void> {
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(FILE_STORE, "readwrite");
      tx.objectStore(FILE_STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {}
}

export async function getEmbeddedFile(key: string): Promise<EmbeddedFileRecord | null> {
  const res = await loadEmbeddedFile(key);
  return res ? res.record : null;
}

export const deleteEmbeddedFile = removeEmbeddedFile;

export async function listEmbeddedFiles(): Promise<Array<EmbeddedFileRecord & { studio: string }>> {
  try {
    const db = await openMediaDB();
    const records = await new Promise<EmbeddedFileRecord[]>((resolve, reject) => {
      const tx = db.transaction(FILE_STORE, "readonly");
      const req = tx.objectStore(FILE_STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return records.map((r) => {
      let studio = "subtitles";
      if (r.key.startsWith("mv")) studio = "mv-studio";
      else if (r.key.startsWith("aff")) studio = "affiliate";
      else if (r.key.startsWith("dl") || r.key.startsWith("conv")) studio = "downloader";
      else if (r.key.startsWith("film")) studio = "short-film";
      return { ...r, studio };
    });
  } catch {
    return [];
  }
}

/**
 * Saves arbitrary JSON studio state into both localStorage and IndexedDB (for large states with base64 images).
 */
export async function saveStudioState<T>(key: string, state: T): Promise<void> {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {}
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STATE_STORE, "readwrite");
      tx.objectStore(STATE_STORE).put({ key, state, updatedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {}
}

/**
 * Loads studio state from IndexedDB first, falling back to localStorage.
 */
export async function loadStudioState<T>(key: string): Promise<T | null> {
  try {
    const db = await openMediaDB();
    const res = await new Promise<{ key: string; state: T } | undefined>((resolve, reject) => {
      const tx = db.transaction(STATE_STORE, "readonly");
      const req = tx.objectStore(STATE_STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (res && res.state !== undefined) return res.state;
  } catch {}

  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return null;
}
