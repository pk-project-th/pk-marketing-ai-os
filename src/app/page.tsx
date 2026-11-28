"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ShoppingBag,
  Film,
  Music,
  Scissors,
  Download,
  Video,
  ArrowRight,
  Copy,
  Check,
  Volume2,
  Image as ImageIcon,
  Layers,
  PlusCircle,
  RefreshCw,
  Wand2,
  CheckCircle2,
  HardDrive,
  RotateCcw,
  FileDown
} from "lucide-react";
import {
  useHub,
  HubHandoffPayload,
  HubSceneItem
} from "@/context/HubContext";
import { useToast } from "@/components/ui/ToastProvider";
import {
  saveStudioState,
  loadStudioState,
  listEmbeddedFiles
} from "@/lib/storage/persistent-media";

type OSCreationPresetMode =
  | "AFFILIATE"
  | "SHORT_FILM"
  | "MV_SONG"
  | "COMMERCIAL"
  | "VIRAL_SUBTITLE"
  | "CAR_HANDOVER";

interface WebAppLauncherCard {
  id: string;
  studioKey: string;
  title: string;
  originalAppName: string;
  chatRef: string;
  href: string;
  description: string;
  highlights: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentBg: string;
  accentText: string;
  borderHover: string;
  btnBg: string;
}

const YOUR_6_WEB_APPS: WebAppLauncherCard[] = [
  {
    id: "subtitles",
    studioKey: "subtitles",
    title: "1. ซับอัตโนมัติ & ตัดช่วงเงียบ",
    originalAppName: "PK Auto Edit Kit — Subtitle Studio Pro",
    chatRef: "Chat a964252b",
    href: "/subtitles",
    description: "สตูดิโอ 3 คอลัมน์สมมาตร ตัดช่วงเงียบอัตโนมัติ ถอดซับไทย ElevenLabs Scribe / Whisper แก้ไขคำ/แบ่งครึ่ง/รวมบรรทัด เรนเดอร์ฝังซับลง MP4 และส่งเข้า CapCut",
    highlights: ["3-Column Studio แท้", "ตัดเงียบ + ถอดซับไทยแม่นยำ", "ฝังซับลง MP4 & ส่งออก SRT/CapCut"],
    icon: Scissors,
    accentBg: "bg-indigo-500/10",
    accentText: "text-indigo-600 dark:text-indigo-400",
    borderHover: "hover:border-indigo-500",
    btnBg: "bg-indigo-600 hover:bg-indigo-700"
  },
  {
    id: "downloader",
    studioKey: "downloader",
    title: "2. โหลดคลิป & แปลงไฟล์มีเดีย",
    originalAppName: "PK · โหลดลิงก์ & แปลงไฟล์ (Media Toolkit)",
    chatRef: "Chat c2c37810",
    href: "/downloader",
    description: "2 แท็บหลัก: โหลดคลิป TikTok / YouTube / Reels / Facebook (รองรับหลายลิงก์ + เช็คเพลย์ลิสต์ + ฝัง cookies.txt ถาวร) และแปลงไฟล์/ตัดช่วงเวลา FFmpeg",
    highlights: ["โหลดหลายลิงก์ + เพลย์ลิสต์", "แปลงไฟล์ MP4/MP3 + ตัดเวลา", "ส่งไฟล์เข้าทำซับ/MV ในคลิกเดียว"],
    icon: Download,
    accentBg: "bg-cyan-500/10",
    accentText: "text-cyan-600 dark:text-cyan-400",
    borderHover: "hover:border-cyan-500",
    btnBg: "bg-cyan-600 hover:bg-cyan-700"
  },
  {
    id: "short-film",
    studioKey: "short-film",
    title: "3. สตูดิโอทำหนังสั้นหลาย EP",
    originalAppName: "PKFLOW PRO FILM Studio",
    chatRef: "Chat 9b806395",
    href: "/short-film",
    description: "กำกับหนังสั้น 1–10 ตอนจบ (ปรับเวลาต่อ EP ได้อิสระ) ล็อกหน้าตานักแสดง/สถานที่/พร็อพ (DNA ไทยแท้ vs ตะวันตก) ล็อกเสียงพากย์ประจำตัวละคร และก๊อป Master Prompt",
    highlights: ["สร้างซีรีส์ 1–10 EP ต่อเนื่อง", "ล็อกนักแสดง + เสียงพากย์ประจำตัว", "ธีม Golden-Amber แท้ 100%"],
    icon: Film,
    accentBg: "bg-amber-500/10",
    accentText: "text-amber-600 dark:text-amber-400",
    borderHover: "hover:border-amber-500",
    btnBg: "bg-amber-500 hover:bg-amber-600 text-slate-950"
  },
  {
    id: "mv-studio",
    studioKey: "mv-studio",
    title: "4. สตูดิโอทำ MV เพลง & คาราโอเกะ",
    originalAppName: "MV Creator Pro v5.3",
    chatRef: "Chat ea01f6c5",
    href: "/mv-studio",
    description: "อัปโหลดไฟล์เพลง MP3/WAV + เนื้อเพลง + Character Sheet ครอป 4 มุมอัจฉริยะ สลับฉากร้อง Lip-Sync กับฉากเนื้อเรื่อง ออโต้ความยาว 2s/5s/8s และซ่อมฉากตกหล่น",
    highlights: ["ครอป Character Sheet 4 มุม", "สลับฉากร้อง Lip-Sync / เนื้อเรื่อง", "เลือกซับคาราโอเกะ หรือ No-Sub"],
    icon: Music,
    accentBg: "bg-pink-500/10",
    accentText: "text-pink-600 dark:text-pink-400",
    borderHover: "hover:border-pink-500",
    btnBg: "bg-pink-600 hover:bg-pink-700"
  },
  {
    id: "affiliate",
    studioKey: "affiliate",
    title: "5. คลิปสั้นไวรัล & ปักตะกร้า",
    originalAppName: "PKShortClips Studio · CineBoard 4.0",
    chatRef: "Chat 88c0f026",
    href: "/affiliate",
    description: "Dual-Mode วิดีโอปักตะกร้า 9:16 และเซ็ตภาพนิ่งไลฟ์สไตล์ 4:5 รองรับสูงสุด 50 ช็อต ล็อกคำลงท้ายเดี่ยว (ครับ/ค่ะ) ฝังรูปสินค้า+นางแบบ และ Single Master Prompt",
    highlights: ["Dual-Mode 9:16 & ภาพนิ่ง 4:5", "รองรับ 4–50 ช็อต + ล็อก ครับ/ค่ะ", "Single Master Prompt ซิงค์ทุกช็อต"],
    icon: ShoppingBag,
    accentBg: "bg-orange-500/10",
    accentText: "text-orange-600 dark:text-orange-400",
    borderHover: "hover:border-orange-500",
    btnBg: "bg-orange-600 hover:bg-orange-700"
  },
  {
    id: "commercial",
    studioKey: "commercial",
    title: "6. สตูดิโอโฆษณา Commercial Pro",
    originalAppName: "PK Commercial Video Studio (Emerald)",
    chatRef: "Chat c3b20788",
    href: "/commercial",
    description: "สร้างสตอรี่บอร์ดโฆษณาพรีเมียมพร้อมระบบ Universal Topic Lock (ห้ามหลอนเรื่องนาฬิกา/รถข้ามหัวข้อ) แนบรูปอ้างอิง 3 ช่อง พากย์เสียง ElevenLabs และรวมคลิป MP4",
    highlights: ["Universal Topic Lock 100%", "แนบรูป สินค้า/พรีเซนเตอร์/ฉาก", "พากย์เสียงไทย + รวมคลิป MP4"],
    icon: Video,
    accentBg: "bg-emerald-500/10",
    accentText: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-500",
    btnBg: "bg-emerald-600 hover:bg-emerald-700"
  }
];

const OS_MODES: Array<{
  id: OSCreationPresetMode;
  label: string;
  badge: string;
  targetHref: string;
  targetStudioKey: string;
  targetLabel: string;
  defaultScenes: number;
  placeholder: string;
  examples: string[];
}> = [
  {
    id: "AFFILIATE",
    label: "🛒 คลิปขายของ & ปักตะกร้า",
    badge: "ส่งไป PKShortClips",
    targetHref: "/affiliate",
    targetStudioKey: "affiliate",
    targetLabel: "สตูดิโอปักตะกร้า (PKShortClips)",
    defaultScenes: 5,
    placeholder: "ระบุสินค้า จุดเด่น หรือโปรโมชัน เช่น: เซรั่มกันแดดหน้าฉ่ำ ลด 50% เหลือ 199 ส่งฟรี, รอกตกปลา PP Fishing ตีไกลไม่ฟู่...",
    examples: [
      "กันแดดเนื้อเซรั่ม ทาแล้วหน้าฉ่ำไม่วอก กันน้ำกันเหงื่อ ปักตะกร้าลด 50% เหลือ 199.-",
      "รอกหยดน้ำ PP Fishing บอดี้คาร์บอน ตีไกลลื่นหัวแตก สายตกปลาช่อนต้องมี",
      "เซ็ตข้าวกล่องคลีนอกไก่ซูวี 5 กล่อง 299 บาท เวฟ 2 นาทีฉ่ำอร่อยเหมือนเชฟทำสด"
    ]
  },
  {
    id: "SHORT_FILM",
    label: "🎬 หนังสั้น & ละครสั้น AI",
    badge: "ส่งไป PKFLOW FILM",
    targetHref: "/short-film",
    targetStudioKey: "short-film",
    targetLabel: "สตูดิโอหนังสั้น (PKFLOW FILM)",
    defaultScenes: 6,
    placeholder: "ระบุพล็อตเรื่อง ตัวละคร และอารมณ์เรื่อง เช่น: หนังสั้นดราม่าพ่อลูกในร้านก๋วยเตี๋ยวโบราณ หักมุมซึ้งๆ...",
    examples: [
      "หนังสั้นดราม่าพ่อลูกในร้านก๋วยเตี๋ยวโบราณ หักมุมซึ้งกินใจตอนจบ",
      "หนังสั้นโรแมนติกพบกันโดยบังเอิญที่คาเฟ่เรือนกระจกเชียงรายท่ามกลางสายฝน",
      "ละครสั้นประธานบริษัทปลอมตัวมาขับซาเล้งลองใจพนักงานโชว์รูมรถ"
    ]
  },
  {
    id: "MV_SONG",
    label: "🎵 ทำ MV เพลง & คาราโอเกะ",
    badge: "ส่งไป MV Creator",
    targetHref: "/mv-studio",
    targetStudioKey: "mv-studio",
    targetLabel: "สตูดิโอทำ MV เพลง (MV Creator v5.3)",
    defaultScenes: 8,
    placeholder: "ระบุชื่อเพลง แนวเพลง คาแรคเตอร์นักร้อง หรือวางเนื้อเพลง...",
    examples: [
      "MV เพลงอินดี้ป๊อปอบอุ่น 'ใจมันไปทางเธอ' นางเอกสาววัย 22 ในคาเฟ่เรือนกระจกและสวนแสงเย็น",
      "MV เพลงลูกทุ่งล้านนาร่วมสมัย บรรยากาศดอยเชียงรายยามเช้าหมอกจางๆ",
      "MV เพลงเศร้าอกหัก เดินตากฝนใต้แสงไฟนีออนกรุงเทพยามค่ำคืน"
    ]
  },
  {
    id: "COMMERCIAL",
    label: "📺 โฆษณา Commercial Pro",
    badge: "ส่งไป Commercial Studio",
    targetHref: "/commercial",
    targetStudioKey: "commercial",
    targetLabel: "สตูดิโอโฆษณา (Commercial Pro)",
    defaultScenes: 8,
    placeholder: "ระบุสินค้าหรือบริการที่ต้องการโฆษณาระดับพรีเมียม เช่น: อาหารคลีนเพื่อสุขภาพ 7 วัน, บริการล้างแอร์บ้านพรีเมียม...",
    examples: [
      "โฆษณาอาหารคลีนเพื่อสุขภาพ 7 วัน อกไก่ซูวีและแซลมอนย่าง เสิร์ฟร้อนในคอนโดหรู",
      "โฆษณาบริการล้างแอร์บ้านพรีเมียม ทีมช่างมืออาชีพ สะอาดไร้ฝุ่น เย็นฉ่ำประหยัดไฟ",
      "โฆษณาคาเฟ่มัทฉะพรีเมียมเชียงราย ชงสดแก้วต่อแก้ว บรรยากาศสวนญี่ปุ่น"
    ]
  },
  {
    id: "VIRAL_SUBTITLE",
    label: "✂️ บทพูดคลิปไวรัล & ทำซับ",
    badge: "ส่งไป Auto Edit Kit",
    targetHref: "/subtitles",
    targetStudioKey: "subtitles",
    targetLabel: "สตูดิโอซับอัตโนมัติ (Auto Edit Kit)",
    defaultScenes: 5,
    placeholder: "ระบุหัวข้อคลิปพูดหน้ากล้อง ความรู้ หรือทริคสั้นๆ ที่ต้องการบทพูดพร้อมซับไตเติล...",
    examples: [
      "3 เทคนิคใช้ AI ช่วยทำคลิปขายของปักตะกร้าให้ยอดพุ่งโดยไม่ต้องออกกองถ่ายเอง",
      "วิธีเช็คสุขภาพแบตเตอรี่รถยนต์ไฟฟ้าก่อนเดินทางไกล ฉบับเข้าใจง่ายใน 30 วินาที",
      "5 ประโยคเปิดคลิป Hook หยุดนิ้วคนดูบน TikTok ตั้งแต่ 3 วินาทีแรก"
    ]
  },
  {
    id: "CAR_HANDOVER",
    label: "🚗 ส่งมอบรถใหม่ & โชว์รูม",
    badge: "ส่งไป สกิลผู้กำกับพิเศษ",
    targetHref: "/skills-hub",
    targetStudioKey: "skills-hub",
    targetLabel: "ศูนย์รวมสกิลผู้กำกับ (Skills Hub)",
    defaultScenes: 6,
    placeholder: "ระบุรุ่นรถ สีรถ ชื่อลูกค้า หรือโปรโมชัน เช่น: ส่งมอบรถ Mazda CX-6e สีขาวมุก โบว์แดงยักษ์ ฟีลอบอุ่นครอบครัว...",
    examples: [
      "พิธีส่งมอบรถใหม่ Mazda CX-6e สีขาวมุก ติดโบว์แดงยักษ์ ส่งมอบกุญแจพร้อมช่อดอกไม้ ขับออกช่วง Golden Hour",
      "รีวิวเจาะลึกรถไฟฟ้า BYD Sealion 7 ในโชว์รูม 6 จังหวะหยุดนิ้ว โชว์ไฟหน้า Matrix LED และห้องโดยสารหรู",
      "โปรออกรถ 0 บาท ดอกเบี้ยพิเศษ โควต้า 3 คันสุดท้ายของเดือน"
    ]
  }
];

function enforceSinglePoliteParticle(text: string, particle: "ครับ" | "ค่ะ"): string {
  if (!text) return "";
  let cleaned = text
    .replace(/ครับ\s*\/\s*ค่ะ/g, particle)
    .replace(/ค่ะ\s*\/\s*ครับ/g, particle);
  if (particle === "ครับ") {
    cleaned = cleaned.replace(/นะคะ/g, "นะครับ").replace(/ค่ะ/g, "ครับ").replace(/คะ/g, "ครับ");
  } else {
    cleaned = cleaned.replace(/นะครับ/g, "นะคะ").replace(/ครับ/g, "ค่ะ");
  }
  return cleaned;
}

export default function UnifiedOSCommandCenterPage() {
  const router = useRouter();
  const {
    activeHandoff,
    setActiveHandoff,
    saveToVault,
    vaultProjects,
    customDepartments
  } = useHub();
  const { showToast } = useToast();

  // OS Brain Generator State
  const [selectedMode, setSelectedMode] = useState<OSCreationPresetMode>("AFFILIATE");
  const [briefInput, setBriefInput] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [sceneCount, setSceneCount] = useState<number>(5);
  const [politeParticle, setPoliteParticle] = useState<"ครับ" | "ค่ะ">("ครับ");
  const [productPrice, setProductPrice] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Generated or active script payload
  const [currentPayload, setCurrentPayload] = useState<HubHandoffPayload | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ttsBusyScene, setTtsBusyScene] = useState<number | null>(null);
  const [imgBusyScene, setImgBusyScene] = useState<number | null>(null);

  // Live Embedded Status across all 6 apps
  const [activeAppBadges, setActiveAppBadges] = useState<Record<string, string>>({});
  const [isRestored, setIsRestored] = useState(false);

  const activeModeConfig = OS_MODES.find((m) => m.id === selectedMode) || OS_MODES[0];

  // Restore OS Brain state & check embedded files/states across all 6 studios
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const savedOS = await loadStudioState<any>("os-brain");
        if (mounted && savedOS) {
          if (savedOS.selectedMode) setSelectedMode(savedOS.selectedMode);
          if (savedOS.briefInput !== undefined) setBriefInput(savedOS.briefInput);
          if (savedOS.aspectRatio) setAspectRatio(savedOS.aspectRatio);
          if (savedOS.sceneCount) setSceneCount(Number(savedOS.sceneCount));
          if (savedOS.politeParticle) setPoliteParticle(savedOS.politeParticle);
          if (savedOS.productPrice !== undefined) setProductPrice(savedOS.productPrice);
          if (savedOS.currentPayload) setCurrentPayload(savedOS.currentPayload);
        } else if (mounted && activeHandoff) {
          setCurrentPayload(activeHandoff);
        }

        // Check embedded files and saved studio states for live badges
        const badgeMap: Record<string, string> = {};
        const allFiles = await listEmbeddedFiles();
        for (const f of allFiles) {
          badgeMap[f.studio] = `ฝังไฟล์: ${f.name}`;
        }
        for (const app of YOUR_6_WEB_APPS) {
          if (!badgeMap[app.studioKey]) {
            const st = await loadStudioState<any>(app.studioKey);
            if (st) {
              if (app.studioKey === "subtitles" && st.segments?.length > 0) {
                badgeMap[app.studioKey] = `มีซับค้างไว้ ${st.segments.length} บรรทัด`;
              } else if (app.studioKey === "short-film" && st.episodes?.length > 0) {
                badgeMap[app.studioKey] = `มีหนังสั้น ${st.episodes.length} EP`;
              } else if (app.studioKey === "mv-studio" && st.scenes?.length > 0) {
                badgeMap[app.studioKey] = `มีโปรเจกต์ MV ${st.scenes.length} ฉาก`;
              } else if (app.studioKey === "affiliate" && st.payload?.scenes?.length > 0) {
                badgeMap[app.studioKey] = `มีสตอรี่บอร์ด ${st.payload.scenes.length} ช็อต`;
              } else if (app.studioKey === "downloader" && st.urlsInput) {
                badgeMap[app.studioKey] = `มีรายการลิงก์ค้างไว้`;
              }
            }
          }
        }
        if (mounted) setActiveAppBadges(badgeMap);
      } catch (e) {
        console.warn("OS Brain restore warning:", e);
      } finally {
        if (mounted) setIsRestored(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activeHandoff]);

  // Persist OS Brain state automatically
  useEffect(() => {
    if (!isRestored) return;
    saveStudioState("os-brain", {
      selectedMode,
      briefInput,
      aspectRatio,
      sceneCount,
      politeParticle,
      productPrice,
      currentPayload
    });
  }, [
    isRestored,
    selectedMode,
    briefInput,
    aspectRatio,
    sceneCount,
    politeParticle,
    productPrice,
    currentPayload
  ]);

  const handleSelectMode = (mode: OSCreationPresetMode) => {
    setSelectedMode(mode);
    const cfg = OS_MODES.find((m) => m.id === mode);
    if (cfg) setSceneCount(cfg.defaultScenes);
  };

  const handleSwitchPoliteParticle = (nextParticle: "ครับ" | "ค่ะ") => {
    setPoliteParticle(nextParticle);
    if (currentPayload) {
      const updatedScenes = currentPayload.scenes.map((s) => ({
        ...s,
        voiceoverThai: enforceSinglePoliteParticle(s.voiceoverThai, nextParticle)
      }));
      const nextPayload: HubHandoffPayload = {
        ...currentPayload,
        hook3Sec: enforceSinglePoliteParticle(currentPayload.hook3Sec, nextParticle),
        fullScriptThai: updatedScenes.map((s) => s.voiceoverThai).join(" "),
        scenes: updatedScenes,
        updatedAt: new Date().toISOString()
      };
      setCurrentPayload(nextPayload);
      setActiveHandoff(nextPayload);
      showToast(`เปลี่ยนคำลงท้ายทุกฉากเป็น "${nextParticle}" ล้วนเรียบร้อย!`, "success");
    }
  };

  // Synced 1-Click Single Master Prompt
  const singleMasterPrompt = useMemo(() => {
    if (!currentPayload || !currentPayload.scenes?.length) return "";
    return [
      `=== PK CREATIVE HUB v4.0 · OS SINGLE MASTER PROMPT ===`,
      `TITLE: ${currentPayload.title} | MODE: ${selectedMode} | RATIO: ${currentPayload.aspectRatio}`,
      `POLITE PARTICLE LOCK: "${politeParticle}" ONLY | TOTAL SHOTS: ${currentPayload.scenes.length}`,
      `3-SEC HOOK: "${currentPayload.hook3Sec}"`,
      `======================================================`,
      ...currentPayload.scenes.map(
        (s) =>
          `[SHOT ${String(s.sceneNumber).padStart(2, "0")} | ${s.timecode || `${s.durationSec}s`}] ${s.title}\n` +
          `• Visual Prompt (EN): ${s.visualPromptEn}\n` +
          `• Camera/Motion (EN): ${s.motionPromptEn}\n` +
          `• บทพากย์ไทย (${politeParticle}): "${s.voiceoverThai}"\n` +
          `• ข้อความบนจอ: "${s.onScreenText}"`
      )
    ].join("\n\n");
  }, [currentPayload, selectedMode, politeParticle]);

  const handleGenerateFromOS = async () => {
    const cleanBrief = briefInput.trim();
    if (!cleanBrief) {
      showToast(`กรุณาพิมพ์โจทย์หรือเลือกตัวอย่างโจทย์ก่อน${politeParticle}`, "info");
      return;
    }

    setIsGenerating(true);
    try {
      const goalMap: Record<OSCreationPresetMode, string> = {
        AFFILIATE: "COMMERCIAL",
        SHORT_FILM: "SHORT_FILM",
        MV_SONG: "MV_KARAOKE",
        CAR_HANDOVER: "COMMERCIAL",
        COMMERCIAL: "COMMERCIAL",
        VIRAL_SUBTITLE: "VIRAL_POV"
      };

      const res = await fetch("/api/ai/easy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE",
          prompt: `${cleanBrief}${productPrice ? ` (ราคา/โปรโมชัน: ${productPrice})` : ""} [บังคับใช้คำลงท้าย "${politeParticle}" เท่านั้น ห้ามใช้ "ครับ/ค่ะ" เด็ดขาด]`,
          format: "VIDEO",
          aiMode: "AI_FLOW",
          aspectRatio,
          contentGoal: goalMap[selectedMode],
          sceneCount: String(sceneCount)
        })
      });

      const data = await res.json().catch(() => ({}));
      const bp = data?.blueprint;

      if (res.ok && bp) {
        const rawScenes = bp?.video_blueprint?.scenes || [];
        const mappedScenes: HubSceneItem[] =
          rawScenes.length > 0
            ? Array.from({ length: sceneCount }).map((_, idx) => {
                const s = rawScenes[idx] || rawScenes[idx % rawScenes.length] || {};
                return {
                  sceneNumber: idx + 1,
                  title: s.scene_role || s.what_to_shoot || `ฉากที่ ${idx + 1}`,
                  durationSec: Number(s.duration_sec) || 5,
                  timecode: `00:${String(idx * 5).padStart(2, "0")} - 00:${String((idx + 1) * 5).padStart(2, "0")}`,
                  voiceoverThai: enforceSinglePoliteParticle(
                    s.voiceover_text || s.what_to_shoot || "",
                    politeParticle
                  ),
                  onScreenText: s.on_screen_text || "",
                  visualPromptEn:
                    s.flow_prompt ||
                    `[TOPIC LOCK: ${cleanBrief}] Cinematic ${aspectRatio} video shot ${idx + 1} of ${cleanBrief}, ultra-realistic 8k lighting, zero in-image text, zero unrelated objects`,
                  motionPromptEn:
                    s.camera_angle || "Smooth cinematic gimbal push-in, 4K 60fps",
                  cameraAngle: s.camera_angle || "Medium Close-Up"
                };
              })
            : buildDeterministicScenes(cleanBrief, selectedMode, sceneCount, aspectRatio, productPrice, politeParticle);

        const fullScript =
          mappedScenes.map((s) => s.voiceoverThai).filter(Boolean).join(" ") ||
          enforceSinglePoliteParticle(bp.voiceover_script || cleanBrief, politeParticle);

        const payload: HubHandoffPayload = {
          id: `hub-${Date.now()}`,
          title: bp.title || cleanBrief.slice(0, 65),
          topic: cleanBrief,
          aspectRatio,
          hook3Sec: enforceSinglePoliteParticle(
            bp.hook_3sec || mappedScenes[0]?.voiceoverThai || cleanBrief,
            politeParticle
          ),
          concept: bp.concept || `สร้างโดยสมองกล OS โหมด ${activeModeConfig.label}`,
          fullScriptThai: fullScript,
          scenes: mappedScenes,
          productInfo: {
            productName: cleanBrief.slice(0, 50),
            price: productPrice || "โปรโมชันพิเศษวันนี้",
            sellingPoints: [bp.key_message || cleanBrief],
            promoBadge: productPrice || `กดสั่งที่ตะกร้าซ้ายล่างได้เลย${politeParticle}!`
          },
          caption: enforceSinglePoliteParticle(
            bp.social_caption || `${bp.title || cleanBrief}\n\n${fullScript}`,
            politeParticle
          ),
          hashtags: bp.hashtags || ["#PKCreativeHub", "#สร้างคลิปAI", "#ปักตะกร้า"],
          sourceDept: "os",
          updatedAt: new Date().toISOString()
        };

        setCurrentPayload(payload);
        setActiveHandoff(payload);
        saveToVault({
          id: payload.id,
          title: payload.title,
          department: selectedMode.toLowerCase(),
          departmentLabel: activeModeConfig.label,
          aspectRatio,
          payload
        });
        showToast(`คิดสคริปต์และแยก ${mappedScenes.length} ช็อตเรียบร้อย!`, "success");
      } else {
        const fallbackScenes = buildDeterministicScenes(
          cleanBrief,
          selectedMode,
          sceneCount,
          aspectRatio,
          productPrice,
          politeParticle
        );
        const fallbackPayload: HubHandoffPayload = {
          id: `hub-${Date.now()}`,
          title: cleanBrief.slice(0, 65),
          topic: cleanBrief,
          aspectRatio,
          hook3Sec: fallbackScenes[0]?.voiceoverThai || cleanBrief,
          concept: `สตอรี่บอร์ดพร้อมถ่ายทำสำหรับ "${cleanBrief}" (${activeModeConfig.label})`,
          fullScriptThai: fallbackScenes.map((s) => s.voiceoverThai).join(" "),
          scenes: fallbackScenes,
          productInfo: {
            productName: cleanBrief.slice(0, 50),
            price: productPrice || "ราคาพิเศษวันนี้",
            sellingPoints: [cleanBrief],
            promoBadge: productPrice || `กดตะกร้าซ้ายล่างได้เลย${politeParticle}!`
          },
          caption: `🔥 ${cleanBrief}\n\n${fallbackScenes.map((s) => `• ${s.voiceoverThai}`).join("\n")}`,
          hashtags: ["#PKCreativeHub", "#TikTokShop", "#AIContent"],
          sourceDept: "os",
          updatedAt: new Date().toISOString()
        };

        setCurrentPayload(fallbackPayload);
        setActiveHandoff(fallbackPayload);
        saveToVault({
          id: fallbackPayload.id,
          title: fallbackPayload.title,
          department: selectedMode.toLowerCase(),
          departmentLabel: activeModeConfig.label,
          aspectRatio,
          payload: fallbackPayload
        });
        showToast(`สร้างสคริปต์และสตอรี่บอร์ด ${fallbackScenes.length} ช็อตสำเร็จ!`, "success");
      }
    } catch {
      showToast("ระบบสร้างสคริปต์สำรองให้เรียบร้อยแล้ว", "info");
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct Deep-Sync Handoff: writes directly into the target studio's IndexedDB state AND navigates!
  const handleDirectSendToApp = async (targetStudioKey: string, targetHref: string, targetLabel: string) => {
    if (!currentPayload) return;
    setActiveHandoff(currentPayload);

    try {
      if (targetStudioKey === "affiliate") {
        const prev = (await loadStudioState<any>("affiliate")) || {};
        await saveStudioState("affiliate", {
          ...prev,
          productName: currentPayload.productInfo?.productName || currentPayload.title,
          priceBadge: currentPayload.productInfo?.price || productPrice || "ลดพิเศษ 50% · ส่งฟรีวันนี้",
          sellingPoints: currentPayload.topic,
          aspectRatio: currentPayload.aspectRatio,
          sceneCount: currentPayload.scenes.length,
          politeParticle,
          payload: currentPayload
        });
      } else if (targetStudioKey === "short-film") {
        const prev = (await loadStudioState<any>("short-film")) || {};
        await saveStudioState("short-film", {
          ...prev,
          title: currentPayload.title,
          logline: currentPayload.topic,
          aspectRatio: currentPayload.aspectRatio,
          episodes: [
            {
              epNumber: 1,
              epTitle: `EP.1: ${currentPayload.title}`,
              targetDurationSec: currentPayload.scenes.length * 8,
              scenes: currentPayload.scenes.map((s, idx) => ({
                id: `ep1-sc${idx + 1}`,
                sceneNumber: idx + 1,
                actLabel: idx === 0 ? "Act 1: เปิดเรื่อง" : idx === currentPayload.scenes.length - 1 ? "Act 3: บทสรุป" : "Act 2: ดำเนินเรื่อง",
                durationSec: 8,
                locationName: "ฉากหลักตามเนื้อเรื่อง",
                actorName: "ตัวละครหลัก",
                voiceId: politeParticle === "ครับ" ? "pNInz6obpgDQGcFmaJgB" : "21m00Tcm4TlvDq8ikWAM",
                dialogueThai: s.voiceoverThai,
                actionThai: s.title,
                cameraAngle: s.cameraAngle || "Cinematic Medium Shot",
                visualPromptEn: s.visualPromptEn,
                videoPromptEn: `${s.visualPromptEn} | Camera Motion: ${s.motionPromptEn}`
              }))
            }
          ]
        });
      } else if (targetStudioKey === "mv-studio") {
        const prev = (await loadStudioState<any>("mv-studio")) || {};
        await saveStudioState("mv-studio", {
          ...prev,
          songTitle: currentPayload.title,
          lyricsRaw: currentPayload.scenes.map((s) => s.voiceoverThai).join("\n"),
          conceptPrompt: currentPayload.topic,
          aspectRatio: currentPayload.aspectRatio,
          scenes: currentPayload.scenes.map((s, idx) => ({
            sceneNumber: idx + 1,
            timecode: s.timecode || `00:${String(idx * 5).padStart(2, "0")} - 00:${String((idx + 1) * 5).padStart(2, "0")}`,
            durationClipSec: 5,
            sceneType: idx % 2 === 0 ? "SINGING_LIPSYNC" : "STORY_ACTING",
            lyricLineThai: s.voiceoverThai,
            storyActionThai: s.title,
            cameraMove: s.motionPromptEn || "Smooth Gimbal Push-In",
            imagePromptEn: s.visualPromptEn,
            videoPromptEn: s.visualPromptEn,
            status: "DONE"
          }))
        });
      } else if (targetStudioKey === "subtitles") {
        const prev = (await loadStudioState<any>("subtitles")) || {};
        let cursor = 0;
        const segments = currentPayload.scenes.map((s, idx) => {
          const dur = s.durationSec || 3.5;
          const seg = {
            id: `sub-os-${idx + 1}`,
            index: idx + 1,
            start: Number(cursor.toFixed(2)),
            end: Number((cursor + dur).toFixed(2)),
            text: s.voiceoverThai,
            words: s.voiceoverThai.split(/\s+/).filter(Boolean).map((w, wIdx, arr) => ({
              word: w,
              start: Number((cursor + (wIdx * dur) / Math.max(1, arr.length)).toFixed(2)),
              end: Number((cursor + ((wIdx + 1) * dur) / Math.max(1, arr.length)).toFixed(2))
            }))
          };
          cursor += dur;
          return seg;
        });
        await saveStudioState("subtitles", {
          ...prev,
          segments
        });
      }
    } catch (e) {
      console.warn("Deep handoff state save warning:", e);
    }

    showToast(`ส่งสคริปต์และฝังข้อมูลเข้า "${targetLabel}" เรียบร้อย!`, "success");
    router.push(targetHref);
  };

  const handleUpdateSceneField = (
    sceneNumber: number,
    field: keyof HubSceneItem,
    value: string
  ) => {
    if (!currentPayload) return;
    const cleanVal =
      field === "voiceoverThai" ? enforceSinglePoliteParticle(value, politeParticle) : value;
    const nextScenes = currentPayload.scenes.map((sc) =>
      sc.sceneNumber === sceneNumber ? { ...sc, [field]: cleanVal } : sc
    );
    const updated: HubHandoffPayload = {
      ...currentPayload,
      scenes: nextScenes,
      fullScriptThai: nextScenes.map((s) => s.voiceoverThai).join(" "),
      updatedAt: new Date().toISOString()
    };
    setCurrentPayload(updated);
    setActiveHandoff(updated);
  };

  const handleGenerateSceneVoice = async (scene: HubSceneItem) => {
    if (!scene.voiceoverThai.trim()) return;
    setTtsBusyScene(scene.sceneNumber);
    try {
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scene.voiceoverThai,
          voiceId: politeParticle === "ครับ" ? "pNInz6obpgDQGcFmaJgB" : "21m00Tcm4TlvDq8ikWAM",
          mode: "generate_single"
        })
      });
      const data = await res.json();
      if (res.ok && data.audioBase64) {
        const audioDataUrl = `data:audio/mpeg;base64,${data.audioBase64}`;
        handleUpdateSceneField(scene.sceneNumber, "audioUrl", audioDataUrl);
        showToast(`สร้างเสียงพากย์ฉากที่ ${scene.sceneNumber} สำเร็จ!`, "success");
      } else {
        showToast(data.error || "ไม่สามารถสร้างเสียงพากย์ได้", "error");
      }
    } catch {
      showToast("เกิดข้อผิดพลาดในการสร้างเสียงพากย์", "error");
    } finally {
      setTtsBusyScene(null);
    }
  };

  const handleGenerateSceneImage = async (scene: HubSceneItem) => {
    setImgBusyScene(scene.sceneNumber);
    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: scene.visualPromptEn,
          aspectRatio: currentPayload?.aspectRatio || aspectRatio
        })
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        handleUpdateSceneField(scene.sceneNumber, "imageUrl", data.imageUrl);
        showToast(`เจนภาพฉากที่ ${scene.sceneNumber} สำเร็จ!`, "success");
      } else {
        showToast("ไม่สามารถเจนภาพตัวอย่างได้", "error");
      }
    } catch {
      showToast("เกิดข้อผิดพลาดในการเจนภาพ", "error");
    } finally {
      setImgBusyScene(null);
    }
  };

  const handleExportMasterScriptFile = (ext: "txt" | "json") => {
    if (!currentPayload) return;
    const safeName = (currentPayload.title || "PK_OS_Script").replace(/[^a-zA-Z0-9ก-๙_-]/g, "_");
    const content =
      ext === "json"
        ? JSON.stringify({ ...currentPayload, singleMasterPrompt }, null, 2)
        : singleMasterPrompt;
    const blob = new Blob([content], {
      type: ext === "json" ? "application/json;charset=utf-8" : "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}_${currentPayload.scenes.length}shots.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`บันทึกไฟล์สคริปต์ .${ext.toUpperCase()} ลงเครื่องเรียบร้อย!`, "success");
  };

  return (
    <div className="space-y-7 pb-12">
      {/* =====================================================================
          SECTION 1: 🗂️ แผงเข้าใช้งาน 6 เว็บแอพหลักของคุณโดยตรง (1-Click App Launcher)
      ===================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 text-[11px] font-extrabold">
                <HardDrive className="w-3.5 h-3.5" />
                ระบบฝังไฟล์อัตโนมัติ (IndexedDB + Media Vault) · สลับหน้าหรือกด F5 รีเฟรชงานไม่หาย 100%
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              เลือกเปิดใช้งาน 6 เว็บแอพหลักของคุณ (แยกหน้าต่างฟังก์ชันแท้ตามต้นฉบับทุกตัว)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              กดเลือกเว็บแอพด้านล่างเพื่อเข้าหน้าต่างทำงานของแอพนั้นทันที หรือใช้ &ldquo;สมองกล OS คิดคอนเทนต์&rdquo; ด้านล่างเพื่อเขียนสคริปต์แล้วส่งเข้าแอพที่ต้องการ
            </p>
          </div>

          <Link
            href="/skills-hub"
            className="min-h-[40px] px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold inline-flex items-center gap-1.5 self-start shrink-0 shadow-xs"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>✨ เปิดสกิลผู้กำกับพิเศษ & เพิ่มแอพใหม่</span>
          </Link>
        </div>

        {/* 6 Main Web App Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {YOUR_6_WEB_APPS.map((app) => {
            const Icon = app.icon;
            const liveBadge = activeAppBadges[app.studioKey];
            return (
              <div
                key={app.id}
                className={`rounded-2xl bg-slate-50/70 dark:bg-zinc-800/50 border-2 border-slate-200/90 dark:border-zinc-800 ${app.borderHover} p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-md`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`w-11 h-11 rounded-xl ${app.accentBg} ${app.accentText} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                        {app.chatRef}
                      </span>
                      {liveBadge && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {liveBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className={`text-[11px] font-extrabold uppercase tracking-wide ${app.accentText}`}>
                      {app.originalAppName}
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {app.title}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      {app.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {app.highlights.map((hl) => (
                      <span
                        key={hl}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700"
                      >
                        ✓ {hl}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-zinc-800">
                  <Link
                    href={app.href}
                    className={`flex-1 min-h-[42px] px-4 py-2 rounded-xl ${app.btnBg} text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-xs`}
                  >
                    <span>{liveBadge ? "เปิดทำงานต่อทันที" : "เปิดเว็บแอพนี้"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {currentPayload && (
                    <button
                      type="button"
                      onClick={() => handleDirectSendToApp(app.studioKey, app.href, app.title)}
                      className="min-h-[42px] px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-zinc-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-extrabold cursor-pointer"
                      title="ส่งสคริปต์จากสมองกล OS เข้าแอพนี้ทันที"
                    >
                      ส่งสคริปต์เข้า
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: 🧠 สมองกล OS คิดคอนเทนต์ & เขียนสคริปต์กลาง (Think Once -> Send Anywhere)
      ===================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border-2 border-emerald-500/30 dark:border-emerald-500/20 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ส่วนที่ 2 · สมองกล OS กลางคิดคอนเทนต์ & เขียนสคริปต์ (Universal Content Brain)</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              คิดไอเดีย เขียนบทพากย์ไทย แยกช็อตสตอรี่บอร์ด แล้วก๊อปหรือส่งต่อเข้าทั้ง 6 แอพในคลิกเดียว
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              ล็อกหัวข้อ 100% (ไม่มีมั่วเรื่องนาฬิกา/รถข้ามหัวข้อ) · ล็อกคำลงท้ายเดี่ยว (ครับ หรือ ค่ะ) · ซิงค์ Single Master Prompt อัตโนมัติ
            </p>
          </div>

          {currentPayload && (
            <button
              type="button"
              onClick={async () => {
                setBriefInput("");
                setCurrentPayload(null);
                await saveStudioState("os-brain", null);
                showToast("ล้างกระดานสมองกล OS เพื่อเริ่มคิดงานใหม่แล้ว", "info");
              }}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold inline-flex items-center gap-1.5 self-start cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-500" />
              <span>🆕 ล้างกระดานคิดงานใหม่</span>
            </button>
          )}
        </div>

        {/* STEP 1: Choose Target Content Type */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300">
            ขั้นที่ 1: เลือกประเภทงานที่คุณต้องการให้สมองกล OS คิดให้
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {OS_MODES.map((mode) => {
              const active = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleSelectMode(mode.id)}
                  className={`p-3 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                    active
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 dark:bg-zinc-800/70 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:border-emerald-400"
                  }`}
                >
                  <div className="text-xs font-extrabold leading-snug">{mode.label}</div>
                  <div
                    className={`text-[10px] mt-1 font-mono ${
                      active ? "text-emerald-100" : "text-slate-500 dark:text-zinc-400"
                    }`}
                  >
                    {mode.badge}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Prompt Input + Polite Particle + Shot Count */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="os-brief-textarea"
                className="text-xs font-extrabold text-slate-700 dark:text-zinc-300"
              >
                ขั้นที่ 2: พิมพ์โจทย์ สินค้า พล็อตเรื่อง หรือไอเดียของคุณ (ภาษาคนได้เลย)
              </label>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                เป้าหมาย: {activeModeConfig.targetLabel}
              </span>
            </div>

            <textarea
              id="os-brief-textarea"
              rows={3}
              value={briefInput}
              onChange={(e) => setBriefInput(e.target.value)}
              placeholder={activeModeConfig.placeholder}
              className="w-full rounded-xl bg-slate-50 dark:bg-zinc-800/90 border border-slate-300 dark:border-zinc-700 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* Quick Example Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-bold text-slate-400">ตัวอย่างโจทย์กดลองได้:</span>
              {activeModeConfig.examples.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setBriefInput(ex)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer text-left"
                >
                  &ldquo;{ex.slice(0, 48)}...&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Controls Column */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-2.5 bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-700/70">
            <div className="space-y-2.5">
              {/* Single Polite Particle Toggle */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-zinc-300 mb-1">
                  คำลงท้ายบทพากย์ (ล็อกคำเดียว ห้ามปน ครับ/ค่ะ)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSwitchPoliteParticle("ครับ")}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                      politeParticle === "ครับ"
                        ? "bg-slate-900 text-white dark:bg-emerald-600 border-slate-900 dark:border-emerald-500"
                        : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700"
                    }`}
                  >
                    👨 ลงท้าย &ldquo;ครับ&rdquo;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchPoliteParticle("ค่ะ")}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                      politeParticle === "ค่ะ"
                        ? "bg-slate-900 text-white dark:bg-emerald-600 border-slate-900 dark:border-emerald-500"
                        : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700"
                    }`}
                  >
                    👩 ลงท้าย &ldquo;ค่ะ&rdquo;
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-zinc-300 mb-1">
                    สัดส่วนภาพ
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as "9:16" | "16:9")}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                  >
                    <option value="9:16">📱 9:16 แนวตั้ง</option>
                    <option value="16:9">🖥️ 16:9 แนวนอน</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-zinc-300 mb-1">
                    จำนวนฉาก/ช็อต
                  </label>
                  <select
                    value={sceneCount}
                    onChange={(e) => setSceneCount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                  >
                    <option value={4}>4 ช็อต (12–20 วิ)</option>
                    <option value={5}>5 ช็อต (ปักตะกร้า 15 วิ)</option>
                    <option value={6}>6 ช็อต (30 วิ มาตรฐาน)</option>
                    <option value={8}>8 ช็อต (40–60 วิ)</option>
                    <option value={10}>10 ช็อต (จัดเต็ม)</option>
                    <option value={12}>12 ช็อต (MV / หนังสั้น)</option>
                    <option value={20}>20 ช็อต (สตอรี่บอร์ดใหญ่)</option>
                    <option value={30}>30 ช็อต (Full Production)</option>
                  </select>
                </div>
              </div>

              {(selectedMode === "AFFILIATE" || selectedMode === "COMMERCIAL") && (
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-zinc-300 mb-1">
                    ป้ายราคา / โปรโมชัน (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="เช่น ซื้อ 1 แถม 1 เพียง 199.- ส่งฟรี"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateFromOS}
              className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-extrabold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังคิดสคริปต์ {sceneCount} ช็อต...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>⚡ คิดคอนเทนต์ + แยก {sceneCount} ช็อตทันที</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* =====================================================================
            STEP 3: GENERATED OS SCRIPT, 1-CLICK SINGLE MASTER PROMPT & DIRECT APP HANDOFF
        ===================================================================== */}
        {currentPayload && (
          <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-zinc-800 animate-fade-in-up">
            {/* Direct App Handoff Bar */}
            <div className="p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-400/70 dark:border-emerald-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    🚀 ขั้นที่ 3: ส่งสคริปต์นี้เข้าเว็บแอพปลายทางของคุณทันที (ฝังข้อมูลเข้าหน้าแอพให้อัตโนมัติ)
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    เลือกเว็บแอพที่ต้องการนำสคริปต์ &ldquo;{currentPayload.title}&rdquo; ({currentPayload.scenes.length} ช็อต) ไปทำต่อ:
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleDirectSendToApp(
                      activeModeConfig.targetStudioKey,
                      activeModeConfig.targetHref,
                      activeModeConfig.targetLabel
                    )
                  }
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 self-start cursor-pointer shadow-xs"
                >
                  <span>ส่งเข้า {activeModeConfig.targetLabel} ทันที</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {YOUR_6_WEB_APPS.map((app) => {
                  const Icon = app.icon;
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => handleDirectSendToApp(app.studioKey, app.href, app.title)}
                      className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>ส่งไป {app.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1-Click Single Master Prompt & Real File Save Box */}
            <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                    1-CLICK SINGLE MASTER PROMPT · ซิงค์ทุกช็อตอัตโนมัติ
                  </span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                    พรอมต์รวมชุดเดียวครบทั้ง {currentPayload.scenes.length} ช็อต (ก๊อปปี้ไปวางหรือบันทึกเป็นไฟล์เก็บไว้ได้เลย)
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(singleMasterPrompt);
                      setCopiedId("os-master-prompt");
                      showToast(`คัดลอก Single Master Prompt (${currentPayload.scenes.length} ช็อต) แล้ว!`, "success");
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="min-h-[38px] px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === "os-master-prompt" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>📋 คัดลอก Single Master Prompt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportMasterScriptFile("txt")}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>บันทึก .TXT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportMasterScriptFile("json")}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>บันทึก .JSON</span>
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                rows={4}
                value={singleMasterPrompt}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-zinc-700 text-[11px] font-mono text-slate-800 dark:text-zinc-200"
              />
            </div>

            {/* Scene-by-Scene Editable Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentPayload.scenes.map((scene) => (
                <div
                  key={scene.sceneNumber}
                  className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 p-3.5 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-emerald-600 text-white font-mono text-[11px] font-bold shrink-0">
                        ช็อต {String(scene.sceneNumber).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                        {scene.durationSec}s · {currentPayload.aspectRatio}
                      </span>
                    </div>

                    <input
                      type="text"
                      value={scene.title}
                      onChange={(e) => handleUpdateSceneField(scene.sceneNumber, "title", e.target.value)}
                      className="w-full px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-extrabold text-slate-900 dark:text-white"
                    />

                    {scene.imageUrl && (
                      <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 bg-black aspect-video">
                        <img
                          src={scene.imageUrl}
                          alt={`ฉากที่ ${scene.sceneNumber}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-0.5">
                        🔊 บทพากย์ไทย (ลงท้าย &ldquo;{politeParticle}&rdquo;):
                      </label>
                      <textarea
                        rows={2}
                        value={scene.voiceoverThai}
                        onChange={(e) =>
                          handleUpdateSceneField(scene.sceneNumber, "voiceoverThai", e.target.value)
                        }
                        className="w-full rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 p-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    {scene.audioUrl && (
                      <audio controls src={scene.audioUrl} className="w-full h-8" />
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-0.5">
                        🎨 Visual Prompt (EN):
                      </label>
                      <textarea
                        rows={2}
                        value={scene.visualPromptEn}
                        onChange={(e) =>
                          handleUpdateSceneField(scene.sceneNumber, "visualPromptEn", e.target.value)
                        }
                        className="w-full rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 p-2 text-[11px] font-mono text-slate-800 dark:text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-200/70 dark:border-zinc-800">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={imgBusyScene === scene.sceneNumber}
                        onClick={() => handleGenerateSceneImage(scene)}
                        className="min-h-[32px] px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-100 border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{imgBusyScene === scene.sceneNumber ? "รอ..." : "เจนภาพ"}</span>
                      </button>
                      <button
                        type="button"
                        disabled={ttsBusyScene === scene.sceneNumber}
                        onClick={() => handleGenerateSceneVoice(scene)}
                        className="min-h-[32px] px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-100 border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{ttsBusyScene === scene.sceneNumber ? "รอ..." : "พากย์"}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(scene.visualPromptEn);
                        setCopiedId(`scene-${scene.sceneNumber}`);
                        showToast(`คัดลอก Prompt ช็อต ${scene.sceneNumber} แล้ว!`, "success");
                        setTimeout(() => setCopiedId(null), 1800);
                      }}
                      className="min-h-[32px] px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-zinc-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === `scene-${scene.sceneNumber}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>ก๊อปช็อตนี้</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          SECTION 3: RECENT SAVED PROJECTS VAULT & CUSTOM DEPARTMENTS
      ===================================================================== */}
      {(vaultProjects.length > 0 || customDepartments.length > 0) && (
        <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                คลังโปรเจกต์ล่าสุด & แผนกที่คุณสร้างเพิ่ม ({vaultProjects.length} รายการ)
              </h2>
            </div>
            <Link
              href="/skills-hub?tab=custom"
              className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ สร้างแผนกใหม่เพิ่ม</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {vaultProjects.slice(0, 4).map((proj) => (
              <button
                key={proj.id}
                type="button"
                onClick={() => {
                  setCurrentPayload(proj.payload);
                  setActiveHandoff(proj.payload);
                  setBriefInput(proj.payload.topic);
                  showToast(`โหลดโปรเจกต์ "${proj.title}" ขึ้นมาแล้ว`, "success");
                }}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 hover:bg-emerald-50/70 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-emerald-400 text-left transition-all cursor-pointer flex flex-col justify-between gap-2"
              >
                <div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {proj.departmentLabel}
                  </span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                    {proj.title}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                  <span>{proj.payload?.scenes?.length || 0} ช็อต · {proj.aspectRatio}</span>
                  <span className="font-bold text-emerald-600 inline-flex items-center gap-0.5">
                    ดึงมาใช้ <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            ))}

            {customDepartments.map((cDept) => (
              <Link
                key={cDept.id}
                href={`/skills-hub?dept=${encodeURIComponent(cDept.id)}`}
                className="p-3.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/70 hover:border-violet-500 flex flex-col justify-between gap-2"
              >
                <div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-800">
                    {cDept.badge || "CUSTOM DEPT"}
                  </span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                    {cDept.name}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-violet-600 dark:text-violet-400 font-bold">
                  <span>{cDept.sublabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function buildDeterministicScenes(
  topic: string,
  mode: OSCreationPresetMode,
  count: number,
  aspectRatio: "9:16" | "16:9",
  price: string,
  particle: "ครับ" | "ค่ะ"
): HubSceneItem[] {
  const affiliateRoles = [
    { role: "Hook 3 วิแรก หยุดนิ้วชี้ปัญหา", cam: "Fast Zoom-In Macro Shot" },
    { role: "เปิดตัวสินค้า & โชว์จุดเด่นชัดๆ", cam: "Hero Product Reveal Gimbal" },
    { role: "สาธิตการใช้งานจริง & เนื้อสัมผัส", cam: "Close-Up Detail Pan" },
    { role: "เปรียบเทียบผลลัพธ์ความประทับใจ", cam: "Medium Reaction Shot" },
    { role: "โปรโมชัน FOMO & ชี้เป้าปักตะกร้าซ้ายล่าง", cam: "Packshot with CTA Space" }
  ];

  const filmRoles = [
    { role: "Act 1 · เปิดฉากสร้างบรรยากาศ & แนะนำตัวละคร", cam: "Wide Establishing Crane Shot" },
    { role: "Act 1 · จุดเริ่มต้นของเหตุการณ์สำคัญ", cam: "Medium Tracking Shot" },
    { role: "Act 2 · ความขัดแย้ง / อุปสรรคเริ่มเข้มข้น", cam: "Over-the-Shoulder Handheld" },
    { role: "Act 2 · จุดหักมุมและอารมณ์พีคสุด (Climax)", cam: "Dramatic Push-In Close-Up" },
    { role: "Act 3 · คลี่คลายและบทสรุปกินใจ", cam: "Slow Dolly Pull-Back Golden Hour" }
  ];

  const handoverRoles = [
    { role: "เปิดผ้าคลุมรถใหม่พร้อมโบว์แดงยักษ์ในโชว์รูม", cam: "Low-Angle Gimbal Glide" },
    { role: "เจาะดีเทลไฟหน้า Matrix LED & ล้อแม็กเงาวับ", cam: "Macro Automotive Orbit" },
    { role: "บรรยากาศส่งมอบกุญแจและช่อดอกไม้รอยยิ้มครอบครัว", cam: "Slow-Motion Emotional Medium Shot" },
    { role: "มุมมองภายในห้องโดยสารหรูหรา & จออัจฉริยะ", cam: "Cockpit POV Pan" },
    { role: "ขับออกจากโชว์รูมสู่ถนนยามเย็น Golden Hour", cam: "Dynamic Tracking Shot" }
  ];

  const templates =
    mode === "SHORT_FILM"
      ? filmRoles
      : mode === "CAR_HANDOVER"
      ? handoverRoles
      : affiliateRoles;

  return Array.from({ length: count }).map((_, idx) => {
    const tpl = templates[idx % templates.length];
    const isLast = idx === count - 1;
    const isFirst = idx === 0;

    let vo = "";
    if (isFirst) {
      vo = `ใครที่กำลังมองหา ${topic} หยุดดูคลิปนี้ให้จบเลยนะ${particle}!`;
    } else if (isLast && (mode === "AFFILIATE" || mode === "COMMERCIAL")) {
      vo = `โปรพิเศษวันนี้ ${price || "ลดคุ้มสุดๆ"} รีบกดที่ตะกร้าซ้ายล่างก่อนของหมดนะ${particle}!`;
    } else {
      vo = `ฉากที่ ${idx + 1}: ${tpl.role} สำหรับ ${topic} ที่ตอบโจทย์และคุ้มค่าที่สุด${particle}`;
    }

    return {
      sceneNumber: idx + 1,
      title: `ช็อตที่ ${idx + 1}: ${tpl.role}`,
      durationSec: mode === "SHORT_FILM" ? 8 : 5,
      timecode: `00:${String(idx * 5).padStart(2, "0")} - 00:${String((idx + 1) * 5).padStart(2, "0")}`,
      voiceoverThai: enforceSinglePoliteParticle(vo, particle),
      onScreenText: isLast && price ? `🔥 ${price} · กดตะกร้าเลย!` : `${topic.slice(0, 28)}`,
      visualPromptEn: `[TOPIC LOCK: ${topic}] Ultra-realistic 8K ${aspectRatio} cinematic shot ${idx + 1} of ${count}: ${tpl.role} featuring ${topic}, authentic lighting, crisp focus, zero in-image text, zero watches, zero unrelated objects`,
      motionPromptEn: `${tpl.cam}, smooth 60fps commercial motion`,
      cameraAngle: tpl.cam
    };
  });
}
