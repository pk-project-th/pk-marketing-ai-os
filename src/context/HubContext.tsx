"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface HubSceneItem {
  sceneNumber: number;
  title: string;
  durationSec: number;
  timecode?: string;
  voiceoverThai: string;
  onScreenText: string;
  visualPromptEn: string;
  motionPromptEn: string;
  cameraAngle?: string;
  actBadge?: string;
  isVocal?: boolean;
  lyricLine?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface HubCharacterItem {
  id: string;
  name: string;
  role: string;
  appearanceThai: string;
  characterSheetPromptEn: string;
  imageUrl?: string;
}

export interface HubHandoffPayload {
  id: string;
  title: string;
  topic: string;
  brandName?: string;
  aspectRatio: "9:16" | "16:9";
  hook3Sec: string;
  concept: string;
  fullScriptThai: string;
  lyricsText?: string;
  mediaUrl?: string;
  scenes: HubSceneItem[];
  characters?: HubCharacterItem[];
  productInfo?: {
    productName: string;
    price?: string;
    promoBadge?: string;
    affiliateUrl?: string;
    sellingPoints?: string[];
    referenceImageUrl?: string;
  };
  caption: string;
  hashtags: string[];
  sourceDept: string;
  targetDept?: string;
  updatedAt: string;
}

export interface HubProjectRecord {
  id: string;
  title: string;
  department: "os" | "affiliate" | "short-film" | "mv-studio" | "subtitles" | "downloader" | "commercial" | "skills-hub" | string;
  departmentLabel: string;
  aspectRatio: "9:16" | "16:9";
  payload: HubHandoffPayload;
  createdAt: string;
  updatedAt: string;
}

export interface CustomDepartmentItem {
  id: string;
  name: string;
  sublabel: string;
  badge: string;
  iconName: "Sparkles" | "ShoppingBag" | "Film" | "Music" | "Subtitles" | "Download" | "Wand2" | "Layers" | "Globe" | "Bot";
  mode: "ai_workspace" | "external_app";
  systemPromptTemplate?: string;
  externalUrl?: string;
  defaultAspectRatio?: "9:16" | "16:9";
  createdAt: string;
}

export interface CoreDepartmentMeta {
  id: string;
  name: string;
  shortName: string;
  sublabel: string;
  chatOrigin: string;
  href: string;
  badge: string;
  accentColor: string;
  bgLight: string;
  borderLight: string;
  description: string;
  capabilities: string[];
  externalCloudUrl?: string;
}

export const CORE_DEPARTMENTS: CoreDepartmentMeta[] = [
  {
    id: "os",
    name: "AI Content OS (ศูนย์คิดคอนเทนต์ & สคริปต์กลาง)",
    shortName: "หน้าหลัก OS",
    sublabel: "คิดไอเดีย · เขียนสคริปต์ · แยกฉาก · ส่งต่อทุกแผนก",
    chatOrigin: "c3b20788-9a57-46ac-80b6-fe2624d32ffc",
    href: "/",
    badge: "OS BRAIN",
    accentColor: "text-emerald-600",
    bgLight: "bg-emerald-50",
    borderLight: "border-emerald-200",
    description: "สมองกลกลางสำหรับคิดคอนเทนต์ วาง Hook 3 วินาทีแรก เขียนบทพากย์ไทย 100% แยกฉาก Visual Prompt (EN) แล้วกดส่งต่อไปยังแผนกต่างๆ ในคลิกเดียว",
    capabilities: ["คิดสคริปต์ & Hook 3 วิ", "แยกฉาก Prompt อังกฤษ", "13 แบรนด์ & สินค้าทั่วไป", "ส่งต่อข้ามแผนกใน 1 คลิก"]
  },
  {
    id: "affiliate",
    name: "คลิปขายของ & ปักตะกร้า (Affiliate & ShortClips)",
    shortName: "ขายของ/ปักตะกร้า",
    sublabel: "สูตร 5-Shot ปิดการขาย · วิเคราะห์รูปสินค้า · 72 สูตรลับ",
    chatOrigin: "88c0f026-d4a2-4656-abd9-efbee56aa4b9",
    href: "/affiliate",
    badge: "SHOP & VIRAL",
    accentColor: "text-orange-600",
    bgLight: "bg-orange-50",
    borderLight: "border-orange-200",
    description: "สตูดิโอทำคลิปปักตะกร้า TikTok Shop / Shopee / Reels พร้อมสูตร Viral คอมเมดี้ วิเคราะห์ภาพสินค้าจริงด้วย AI Vision และคลัง 72 Master Prompts",
    capabilities: ["สูตรปักตะกร้า 5-8 ช็อต", "คลัง 72 สูตรลับขายดี", "วิเคราะห์รูปสินค้า AI", "พากย์เสียงขายของ ElevenLabs"]
  },
  {
    id: "short-film",
    name: "ทำหนังสั้น & ซีรีส์ AI (PKFLOW Pro Film Studio)",
    shortName: "ทำหนังสั้น",
    sublabel: "Film Bible · ล็อกหน้าตัวละคร · 3-Act Storyboard",
    chatOrigin: "9b806395-9a22-4fe2-a7f0-7ab0c2231c6c",
    href: "/short-film",
    badge: "PRO FILM",
    accentColor: "text-amber-600",
    bgLight: "bg-amber-50",
    borderLight: "border-amber-200",
    description: "กำกับหนังสั้นและละครสั้น AI ครบวงจร วางโครงเรื่อง 3-4 องก์ ล็อกหน้าตาและชุดตัวละคร (Character Consistency) พร้อมมุมกล้องภาพยนตร์ส่งเข้า Google Flow",
    capabilities: ["ล็อกหน้าตัวละคร (Entity Lock)", "โครงเรื่อง 3 องก์ & Film Bible", "มุมกล้อง FlowKit Camera", "ส่งออก Google Flow JSON"]
  },
  {
    id: "mv-studio",
    name: "ทำ MV เพลง & ซิงค์เนื้อร้อง (MV Creator v5.1)",
    shortName: "ทำ MV เพลง",
    sublabel: "แตกฉากจากเนื้อเพลง · ล็อกหน้านักร้อง · ซับคาราโอเกะ",
    chatOrigin: "ea01f6c5-fe7a-43aa-8239-df35eb811ebd",
    href: "/mv-studio",
    badge: "MV & KARAOKE",
    accentColor: "text-purple-600",
    bgLight: "bg-purple-50",
    borderLight: "border-purple-200",
    description: "สร้างมิวสิกวิดีโอจากไฟล์เพลงและเนื้อร้อง แตกฉากอัตโนมัติ 12-29 ฉาก (Lip-Sync + B-Roll) คุมคาแรคเตอร์นักร้องเดี่ยว พร้อมระบบซิงค์ซับคาราโอเกะแบบง่าย",
    capabilities: ["แตกฉากจากเนื้อเพลงอัตโนมัติ", "Character Sheet นักร้อง", "2-Beat Lip-Sync & Story", "ซิงค์ซับคาราโอเกะ 1 คลิก"]
  },
  {
    id: "subtitles",
    name: "ซับอัตโนมัติ & ตัดเสียงเงียบ (Auto Edit Kit Pro)",
    shortName: "ซับอัตโนมัติ",
    sublabel: "ถอดเสียงไทยเป๊ะ · Safe-Zone 24 ตัว · พรีวิว 9:16",
    chatOrigin: "a964252b-1bcc-4404-a3eb-a411d29e8137",
    href: "/subtitles",
    badge: "SUBTITLE PRO",
    accentColor: "text-blue-600",
    bgLight: "bg-blue-50",
    borderLight: "border-blue-200",
    description: "ถอดเสียงซับไตเติลภาษาไทยด้วย Groq Whisper v3 & ElevenLabs Scribe ป้องกันคำลงท้ายตกหล่น (ค่ะ/ครับ/บาท) วัด Safe-Zone 24 ตัวอักษร พรีวิวจอ Titanium 9:16",
    capabilities: ["ถอดเสียง Groq/ElevenLabs", "กันคำตกหล่น + Safe-Zone 24 ตัว", "จอมอนิเตอร์ 9:16 คาราโอเกะ", "ส่งออก SRT / VTT / ASS / CapCut"]
  },
  {
    id: "downloader",
    name: "โหลดคลิป & แปลงไฟล์สื่อ (PK Media Toolkit)",
    shortName: "โหลดคลิป/แปลงไฟล์",
    sublabel: "โหลด YouTube/TikTok/FB/IG · แยกเสียง MP3 · แปลงไฟล์",
    chatOrigin: "c2c37810-d1a7-4dcc-8f31-b6d0aeef5bc9",
    href: "/downloader",
    badge: "MEDIA TOOLKIT",
    accentColor: "text-teal-600",
    bgLight: "bg-teal-50",
    borderLight: "border-teal-200",
    description: "ดาวน์โหลดวิดีโอและเสียงความคมชัดต้นฉบับจาก YouTube, TikTok, Facebook, IG Reels พร้อมแยกเสียง MP3/WAV ส่งต่อไปทำซับอัตโนมัติหรือทำ MV ได้ทันที",
    capabilities: ["โหลดคลิปทุกแพลตฟอร์ม", "แยกเสียง MP3 / WAV ในตัว", "จัดการ Cookies.txt", "ส่งไฟล์ไปแผนกทำซับ/MV ทันที"],
    externalCloudUrl: "https://pk-media-toolkit.onrender.com"
  },
  {
    id: "commercial",
    name: "วิดีโอโฆษณา & พากย์เสียง AI (Commercial Studio)",
    shortName: "วิดีโอโฆษณา",
    sublabel: "Universal Topic Lock · พากย์ไทย 6 เสียง · Google Flow",
    chatOrigin: "c3b20788-9a57-46ac-80b6-fe2624d32ffc",
    href: "/commercial",
    badge: "COMMERCIAL",
    accentColor: "text-emerald-700",
    bgLight: "bg-emerald-50",
    borderLight: "border-emerald-300",
    description: "สตูดิโอผลิตโฆษณาหลายฉากพร้อมระบบ Universal Topic Lock (สั่งอาหารคลีนได้อาหารคลีน 100%) พากย์เสียงไทย ElevenLabs รายฉาก และส่งเข้า Google Flow",
    capabilities: ["Topic Lock 100% ไม่หลอนรูป", "พากย์ไทย ElevenLabs รายฉาก", "แนบรูปอ้างอิง 3 ช่อง", "Master Directive v16"]
  },
  {
    id: "skills-hub",
    name: "ศูนย์รวมสกิลผู้กำกับ AI & ขยายแผนกอนาคต",
    shortName: "สกิล AI & ขยายแผนก",
    sublabel: "ส่งมอบรถ · โชว์รูม 6 จังหวะ · แบนเนอร์ · +เพิ่มแผนกใหม่",
    chatOrigin: "ALL-SKILLS-INTEGRATION",
    href: "/skills-hub",
    badge: "8+ SKILLS",
    accentColor: "text-indigo-600",
    bgLight: "bg-indigo-50",
    borderLight: "border-indigo-200",
    description: "รวมสกิลพิเศษทั้งหมดของคุณ: กำกับคลิปส่งมอบรถป้ายแดง, รีวิวโชว์รูม 6 จังหวะ, แบนเนอร์โปรโมชัน AIDA, อินโฟกราฟิกสไลด์, มุมกล้อง FlowKit และระบบสร้างแผนกใหม่ในอนาคต",
    capabilities: ["ส่งมอบรถ & รีวิวโชว์รูม", "แบนเนอร์ AIDA & อินโฟกราฟิก", "มุมกล้อง & UX Microcopy", "+ เพิ่มแผนกใหม่ได้ไม่จำกัด"]
  }
];

const HANDOFF_STORAGE_KEY = "pk_hub_active_handoff_v3";
const VAULT_STORAGE_KEY = "pk_hub_projects_vault_v3";
const CUSTOM_DEPTS_KEY = "pk_hub_custom_depts_v3";
const THEME_STORAGE_KEY = "pk_hub_theme_v3";
const SYNC_CODE_KEY = "pk_hub_cloud_sync_code_v3";

interface HubContextType {
  activeHandoff: HubHandoffPayload | null;
  setActiveHandoff: (payload: HubHandoffPayload | null) => void;
  sendToDepartment: (targetHref: string, payload: HubHandoffPayload, deptLabel?: string) => void;
  vaultProjects: HubProjectRecord[];
  saveToVault: (record: Omit<HubProjectRecord, "createdAt" | "updatedAt"> & { createdAt?: string }) => HubProjectRecord;
  deleteFromVault: (id: string) => void;
  loadFromVault: (record: HubProjectRecord) => void;
  exportVaultJson: () => void;
  importVaultJson: (jsonText: string) => { success: boolean; count: number; error?: string };
  syncCode: string;
  setSyncCode: (code: string) => void;
  syncToCloud: () => Promise<{ success: boolean; message: string }>;
  pullFromCloud: (codeOverride?: string) => Promise<{ success: boolean; message: string }>;
  customDepartments: CustomDepartmentItem[];
  addCustomDepartment: (dept: Omit<CustomDepartmentItem, "id" | "createdAt">) => CustomDepartmentItem;
  removeCustomDepartment: (id: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const HubContext = createContext<HubContextType>({
  activeHandoff: null,
  setActiveHandoff: () => {},
  sendToDepartment: () => {},
  vaultProjects: [],
  saveToVault: () => ({} as HubProjectRecord),
  deleteFromVault: () => {},
  loadFromVault: () => {},
  exportVaultJson: () => {},
  importVaultJson: () => ({ success: false, count: 0 }),
  syncCode: "PK-CREATOR-MAIN",
  setSyncCode: () => {},
  syncToCloud: async () => ({ success: false, message: "" }),
  pullFromCloud: async () => ({ success: false, message: "" }),
  customDepartments: [],
  addCustomDepartment: () => ({} as CustomDepartmentItem),
  removeCustomDepartment: () => {},
  darkMode: false,
  setDarkMode: () => {}
});

export const HubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [activeHandoff, setActiveHandoffState] = useState<HubHandoffPayload | null>(null);
  const [vaultProjects, setVaultProjects] = useState<HubProjectRecord[]>([]);
  const [customDepartments, setCustomDepartments] = useState<CustomDepartmentItem[]>([]);
  const [darkMode, setDarkModeState] = useState<boolean>(false);
  const [syncCode, setSyncCodeState] = useState<string>("PK-CREATOR-MAIN");

  // Load persisted state on mount
  useEffect(() => {
    try {
      const rawHandoff = localStorage.getItem(HANDOFF_STORAGE_KEY);
      if (rawHandoff) {
        setActiveHandoffState(JSON.parse(rawHandoff));
      }
    } catch {}

    try {
      const rawVault = localStorage.getItem(VAULT_STORAGE_KEY);
      if (rawVault) {
        const parsed = JSON.parse(rawVault);
        if (Array.isArray(parsed)) setVaultProjects(parsed);
      }
    } catch {}

    try {
      const rawDepts = localStorage.getItem(CUSTOM_DEPTS_KEY);
      if (rawDepts) {
        const parsed = JSON.parse(rawDepts);
        if (Array.isArray(parsed)) setCustomDepartments(parsed);
      }
    } catch {}

    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "dark") {
        setDarkModeState(true);
        document.documentElement.classList.add("dark");
      }
    } catch {}

    try {
      const savedCode = localStorage.getItem(SYNC_CODE_KEY);
      if (savedCode) setSyncCodeState(savedCode);
    } catch {}
  }, []);

  const setDarkMode = useCallback((dark: boolean) => {
    setDarkModeState(dark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
      if (dark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  }, []);

  const setSyncCode = useCallback((code: string) => {
    const clean = code.trim().toUpperCase() || "PK-CREATOR-MAIN";
    setSyncCodeState(clean);
    try {
      localStorage.setItem(SYNC_CODE_KEY, clean);
    } catch {}
  }, []);

  const setActiveHandoff = useCallback((payload: HubHandoffPayload | null) => {
    setActiveHandoffState(payload);
    try {
      if (payload) {
        localStorage.setItem(HANDOFF_STORAGE_KEY, JSON.stringify(payload));
      } else {
        localStorage.removeItem(HANDOFF_STORAGE_KEY);
      }
    } catch {}
  }, []);

  const saveToVault = useCallback(
    (record: Omit<HubProjectRecord, "createdAt" | "updatedAt"> & { createdAt?: string }): HubProjectRecord => {
      const now = new Date().toISOString();
      const fullRecord: HubProjectRecord = {
        ...record,
        createdAt: record.createdAt || now,
        updatedAt: now
      };

      setVaultProjects((prev) => {
        const filtered = prev.filter((p) => p.id !== fullRecord.id);
        const updated = [fullRecord, ...filtered].slice(0, 60);
        try {
          localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      return fullRecord;
    },
    []
  );

  const deleteFromVault = useCallback((id: string) => {
    setVaultProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const sendToDepartment = useCallback(
    (targetHref: string, payload: HubHandoffPayload, deptLabel?: string) => {
      const updatedPayload: HubHandoffPayload = {
        ...payload,
        targetDept: targetHref,
        updatedAt: new Date().toISOString()
      };
      setActiveHandoff(updatedPayload);

      // Also auto-save to vault so user never loses work when switching departments
      const deptId = targetHref.replace(/^\//, "").split("?")[0] || "os";
      saveToVault({
        id: payload.id || `hub-${Date.now()}`,
        title: payload.title || payload.topic || "โปรเจกต์คอนเทนต์ใหม่",
        department: deptId,
        departmentLabel: deptLabel || deptId.toUpperCase(),
        aspectRatio: payload.aspectRatio || "9:16",
        payload: updatedPayload
      });

      router.push(targetHref);
    },
    [router, setActiveHandoff, saveToVault]
  );

  const loadFromVault = useCallback(
    (record: HubProjectRecord) => {
      setActiveHandoff(record.payload);
      const targetHref =
        record.department === "os"
          ? "/"
          : record.department.startsWith("custom-")
          ? `/skills-hub?dept=${encodeURIComponent(record.department)}`
          : `/${record.department}`;
      router.push(targetHref);
    },
    [router, setActiveHandoff]
  );

  const exportVaultJson = useCallback(() => {
    const bundle = {
      version: "3.0-PK-CREATIVE-HUB",
      exportedAt: new Date().toISOString(),
      activeHandoff,
      vaultProjects,
      customDepartments
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PK_Creative_Hub_Backup_${new Date().toISOString().slice(0, 10)}.pkhub.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [activeHandoff, vaultProjects, customDepartments]);

  const importVaultJson = useCallback(
    (jsonText: string): { success: boolean; count: number; error?: string } => {
      try {
        const parsed = JSON.parse(jsonText);
        let importedCount = 0;

        if (parsed.activeHandoff) {
          setActiveHandoff(parsed.activeHandoff);
        }
        if (Array.isArray(parsed.vaultProjects)) {
          setVaultProjects((prev) => {
            const map = new Map<string, HubProjectRecord>();
            for (const p of [...parsed.vaultProjects, ...prev]) {
              if (p && p.id && !map.has(p.id)) map.set(p.id, p);
            }
            const merged = Array.from(map.values()).slice(0, 60);
            try {
              localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          });
          importedCount = parsed.vaultProjects.length;
        }
        if (Array.isArray(parsed.customDepartments)) {
          setCustomDepartments((prev) => {
            const map = new Map<string, CustomDepartmentItem>();
            for (const d of [...parsed.customDepartments, ...prev]) {
              if (d && d.id && !map.has(d.id)) map.set(d.id, d);
            }
            const merged = Array.from(map.values());
            try {
              localStorage.setItem(CUSTOM_DEPTS_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
        return { success: true, count: importedCount || 1 };
      } catch (err: any) {
        return { success: false, count: 0, error: err?.message || "ไฟล์ไม่ถูกต้อง" };
      }
    },
    [setActiveHandoff]
  );

  const syncToCloud = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      const bundle = {
        id: `hub_sync_${syncCode}`,
        name: `PK Hub Cloud Sync (${syncCode})`,
        toolType: "PK_CREATIVE_HUB_V3",
        updatedAt: new Date().toISOString(),
        data: {
          activeHandoff,
          vaultProjects: vaultProjects.slice(0, 30),
          customDepartments
        }
      };
      const res = await fetch("/api/flow-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundle)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return {
        success: true,
        message: `ซิงค์ข้อมูลขึ้น Cloud สำเร็จ! (รหัสซิงค์: ${syncCode}) เปิดในมือถือแล้วใช้รหัสนี้ดึงงานต่อได้ทันที`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `ซิงค์ผ่านเซิร์ฟเวอร์ไม่สำเร็จ (${err?.message}) — คุณสามารถกดปุ่ม "บันทึกไฟล์ (.pkhub)" เพื่อส่งไฟล์เข้า LINE/iCloud ได้เลย`
      };
    }
  }, [syncCode, activeHandoff, vaultProjects, customDepartments]);

  const pullFromCloud = useCallback(
    async (codeOverride?: string): Promise<{ success: boolean; message: string }> => {
      const targetCode = (codeOverride || syncCode).trim().toUpperCase() || "PK-CREATOR-MAIN";
      try {
        const res = await fetch(`/api/flow-projects?id=${encodeURIComponent(`hub_sync_${targetCode}`)}`);
        const json = await res.json();
        const project = json?.project || (Array.isArray(json?.projects) ? json.projects.find((p: any) => p.id === `hub_sync_${targetCode}`) : null);
        if (!project || !project.data) {
          return {
            success: false,
            message: `ไม่พบข้อมูลซิงค์ของรหัส "${targetCode}" บนเซิร์ฟเวอร์ กรุณากดอัปโหลดซิงค์จากเครื่องต้นทางก่อนครับ`
          };
        }
        const imported = importVaultJson(JSON.stringify(project.data));
        if (imported.success) {
          return {
            success: true,
            message: `ดึงโปรเจกต์จากรหัส "${targetCode}" สำเร็จครบถ้วน (${imported.count} โปรเจกต์)!`
          };
        }
        return { success: false, message: imported.error || "ดึงข้อมูลไม่สำเร็จ" };
      } catch (err: any) {
        return { success: false, message: `ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์: ${err?.message}` };
      }
    },
    [syncCode, importVaultJson]
  );

  const addCustomDepartment = useCallback(
    (dept: Omit<CustomDepartmentItem, "id" | "createdAt">): CustomDepartmentItem => {
      const created: CustomDepartmentItem = {
        ...dept,
        id: `custom-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setCustomDepartments((prev) => {
        const updated = [...prev, created];
        try {
          localStorage.setItem(CUSTOM_DEPTS_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      return created;
    },
    []
  );

  const removeCustomDepartment = useCallback((id: string) => {
    setCustomDepartments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      try {
        localStorage.setItem(CUSTOM_DEPTS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  return (
    <HubContext.Provider
      value={{
        activeHandoff,
        setActiveHandoff,
        sendToDepartment,
        vaultProjects,
        saveToVault,
        deleteFromVault,
        loadFromVault,
        exportVaultJson,
        importVaultJson,
        syncCode,
        setSyncCode,
        syncToCloud,
        pullFromCloud,
        customDepartments,
        addCustomDepartment,
        removeCustomDepartment,
        darkMode,
        setDarkMode
      }}
    >
      {children}
    </HubContext.Provider>
  );
};

export const useHub = () => useContext(HubContext);
