"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Film,
  Music,
  Subtitles,
  Download,
  Video,
  ArrowRight,
  Copy,
  Check,
  Volume2,
  Image as ImageIcon,
  Layers,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  Wand2,
  FolderOpen,
  Smartphone,
  Monitor,
  CheckCircle2,
  Globe
} from "lucide-react";
import { useBrand } from "@/context/BrandContext";
import {
  useHub,
  CORE_DEPARTMENTS,
  HubHandoffPayload,
  HubSceneItem
} from "@/context/HubContext";
import { DepartmentHandoffBar } from "@/components/hub/DepartmentHandoffBar";
import { useToast } from "@/components/ui/ToastProvider";

type OSCreationPresetMode =
  | "AFFILIATE"
  | "SHORT_FILM"
  | "MV_SONG"
  | "CAR_HANDOVER"
  | "COMMERCIAL"
  | "VIRAL_SUBTITLE";

const OS_MODES: Array<{
  id: OSCreationPresetMode;
  label: string;
  badge: string;
  targetHref: string;
  targetLabel: string;
  defaultScenes: number;
  placeholder: string;
  examples: string[];
}> = [
  {
    id: "AFFILIATE",
    label: "🛒 คลิปขายของ & ปักตะกร้า",
    badge: "TikTok Shop / Reels",
    targetHref: "/affiliate",
    targetLabel: "แผนกขายของ & ปักตะกร้า",
    defaultScenes: 5,
    placeholder: "ระบุสินค้า จุดเด่น หรือโปรโมชัน เช่น: เซรั่มกันแดดหน้าฉ่ำ งบหลักร้อย, รอกตกปลา PP Fishing ตีไกลไม่ฟู่...",
    examples: [
      "กันแดดเนื้อเซรั่ม ทาแล้วหน้าฉ่ำไม่วอก กันน้ำกันเหงื่อ ปักตะกร้าลด 50%",
      "รอกหยดน้ำ PP Fishing ตีไกลลื่นหัวแตก สายตกปลาช่อนต้องมี",
      "กล่องอาหารคลีนพร้อมทาน 7 วัน อกไก่นุ่มฉ่ำ แคลต่ำ หุ่นเฟิร์ม"
    ]
  },
  {
    id: "SHORT_FILM",
    label: "🎬 หนังสั้น & ละครสั้น AI",
    badge: "PKFLOW 3-Act Film",
    targetHref: "/short-film",
    targetLabel: "แผนกทำหนังสั้น PKFLOW",
    defaultScenes: 8,
    placeholder: "ระบุพล็อตเรื่อง ตัวละคร และอารมณ์เรื่อง เช่น: หนังสั้นดราม่าพ่อลูกในร้านก๋วยเตี๋ยวโบราณ หักมุมซึ้งๆ...",
    examples: [
      "หนังสั้นดราม่าพ่อลูกในร้านก๋วยเตี๋ยวโบราณ หักมุมซึ้งกินใจตอนจบ",
      "หนังสั้นโรแมนติกพบกันโดยบังเอิญที่คาเฟ่เรือนกระจกเชียงราย",
      "ละครสั้นประธานบริษัทปลอมตัวมาขับซาเล้งลองใจพนักงานโชว์รูมรถ"
    ]
  },
  {
    id: "MV_SONG",
    label: "🎵 ทำ MV เพลง & คาราโอเกะ",
    badge: "MV Creator v5.1",
    targetHref: "/mv-studio",
    targetLabel: "แผนกทำ MV เพลง",
    defaultScenes: 12,
    placeholder: "ระบุชื่อเพลง แนวเพลง คาแรคเตอร์นักร้อง หรือวางเนื้อเพลง...",
    examples: [
      "MV เพลงอินดี้ป๊อปอบอุ่น 'ใจมันไปทางเธอ' นางเอกสาววัย 22 ในคาเฟ่เรือนกระจกและสวนแสงเย็น",
      "MV เพลงลูกทุ่งล้านนาร่วมสมัย บรรยากาศดอยเชียงรายยามเช้าหมอกจางๆ",
      "MV เพลงเศร้าอกหัก เดินตากฝนใต้แสงไฟนีออนกรุงเทพยามค่ำคืน"
    ]
  },
  {
    id: "CAR_HANDOVER",
    label: "🚗 ส่งมอบรถ & รีวิวโชว์รูม",
    badge: "Auto Director Skills",
    targetHref: "/skills-hub",
    targetLabel: "แผนกสกิลผู้กำกับยานยนต์",
    defaultScenes: 6,
    placeholder: "ระบุรุ่นรถ สีรถ ชื่อลูกค้า หรือโปรโมชัน เช่น: ส่งมอบรถ Mazda CX-6e สีขาวมุก โบว์แดงยักษ์ ฟีลอบอุ่นครอบครัว...",
    examples: [
      "พิธีส่งมอบรถใหม่ Mazda CX-6e สีขาวมุก ติดโบว์แดงยักษ์ ส่งมอบกุญแจพร้อมช่อดอกไม้ ขับออกช่วง Golden Hour",
      "รีวิวเจาะลึกรถไฟฟ้า BYD Sealion 7 ในโชว์รูม 6 จังหวะหยุดนิ้ว โชว์ไฟหน้า Matrix LED และห้องโดยสารหรู",
      "โปรออกรถ 0 บาท ดอกเบี้ยพิเศษ โควต้า 3 คันสุดท้ายของเดือน"
    ]
  },
  {
    id: "COMMERCIAL",
    label: "🎥 โฆษณา Commercial Pro",
    badge: "Universal Topic Lock",
    targetHref: "/commercial",
    targetLabel: "แผนกโฆษณา Commercial",
    defaultScenes: 8,
    placeholder: "ระบุสินค้าหรือบริการที่ต้องการโฆษณาระดับพรีเมียม เช่น: อาหารคลีนเพื่อสุขภาพ 7 วัน, บริการล้างแอร์บ้านพรีเมียม...",
    examples: [
      "อาหารคลีนเพื่อสุขภาพ 7 วัน อกไก่ย่างสมุนไพร อโวคาโด สลัดผักเคล ควินัว",
      "ปลาส้มทอดกรอบสูตรโบราณ หอมกระเทียมเจียว บีบมะนาวพริกขี้หนูสด",
      "บริการล้างแอร์บ้านระดับพรีเมียม ฉีดโฟมฆ่าเชื้อ เย็นฉ่ำประหยัดไฟ"
    ]
  },
  {
    id: "VIRAL_SUBTITLE",
    label: "💬 สคริปต์พากย์ & ซับอัตโนมัติ",
    badge: "Auto Edit Kit 9:16",
    targetHref: "/subtitles",
    targetLabel: "แผนกทำซับอัตโนมัติ",
    defaultScenes: 6,
    placeholder: "ระบุหัวข้อคลิปพูดเล่าเรื่อง สรุปข่าว หรือความรู้สั้นๆ เพื่อนำไปทำซับไตเติล 9:16...",
    examples: [
      "3 เทคนิคดูแลแบตเตอรี่รถยนต์ไฟฟ้าให้ใช้ได้นานเกิน 10 ปี แบบเข้าใจง่ายใน 30 วิ",
      "สรุป 3 ข้อคิดเปลี่ยนชีวิตจากหนังสือ Atomic Habits เริ่มทำแค่วันละ 1%",
      "พาทัวร์วัดร่องขุ่น เชียงราย จุดถ่ายรูปห้ามพลาดและเวลาที่แสงสวยที่สุด"
    ]
  }
];

function buildDeterministicFallbackPayload(
  topic: string,
  mode: OSCreationPresetMode,
  aspectRatio: "9:16" | "16:9",
  sceneCount: number,
  brandName: string
): HubHandoffPayload {
  const cleanTopic = topic.trim() || "คอนเทนต์ไวรัลคุณภาพสูง";
  const scenes: HubSceneItem[] = [];

  for (let i = 1; i <= sceneCount; i++) {
    const startSec = (i - 1) * 3;
    const endSec = i * 3;
    const timecode = `00:${String(startSec).padStart(2, "0")} - 00:${String(endSec).padStart(2, "0")}`;
    const roleTitle =
      i === 1
        ? "เปิดเรื่องหยุดนิ้ว (3-Sec Viral Hook)"
        : i === sceneCount
        ? "สรุปจบ & Call-to-Action ปิดการขาย"
        : i === 2
        ? "เจาะจุดเด่น & บรรยากาศหลัก"
        : `ฉากดำเนินเรื่อง & ดีเทลช็อตที่ ${i}`;

    const voiceover =
      i === 1
        ? `หยุดดูคลิปนี้ก่อนเลยครับ! วันนี้เรามาเจาะลึก "${cleanTopic}" ที่บอกเลยว่าคุ้มค่าและห้ามพลาดเด็ดขาด`
        : i === sceneCount
        ? `ใครที่สนใจ "${cleanTopic}" กดที่ลิงก์หรือปักตะกร้าด้านล่าง ทักแชทรับโปรพิเศษวันนี้ได้เลยครับ!`
        : `ช็อตที่ ${i} พาชมรายละเอียดของ ${cleanTopic} แบบชัดๆ ทุกมุม แสงสวยและตอบโจทย์การใช้งานจริงมากๆ ครับ`;

    const onScreen =
      i === 1
        ? `🔥 ห้ามพลาด! ${cleanTopic.slice(0, 22)}`
        : i === sceneCount
        ? "🛒 กดปักตะกร้า / ทักแชทด่วน!"
        : `✨ จุดเด่นที่ ${i - 1}: ${cleanTopic.slice(0, 18)}`;

    scenes.push({
      sceneNumber: i,
      title: roleTitle,
      durationSec: 3,
      timecode,
      voiceoverThai: voiceover,
      onScreenText: onScreen,
      visualPromptEn: `[TOPIC LOCK: ${cleanTopic}] Cinematic 8K commercial shot ${i} of ${cleanTopic}, natural studio & golden hour lighting, shallow depth of field, photorealistic detail, ${aspectRatio} framing, zero in-image text, zero unrelated objects`,
      motionPromptEn:
        i === 1
          ? "Dynamic slow dolly push-in at 60fps revealing the main subject clearly"
          : i === sceneCount
          ? "Smooth hero orbit camera movement settling on clean composition for CTA"
          : "Smooth gimbal tracking shot highlighting texture and authentic atmosphere",
      cameraAngle: i === 1 ? "Macro Push-In Hook" : i === sceneCount ? "Hero Orbit Shot" : "Medium Tracking Shot"
    });
  }

  return {
    id: `os-${Date.now()}`,
    title: cleanTopic,
    topic: cleanTopic,
    brandName,
    aspectRatio,
    hook3Sec: scenes[0]?.voiceoverThai || `เปิดความลับ ${cleanTopic} ใน 3 วินาทีแรก!`,
    concept: `โครงสร้างคอนเทนต์ ${mode} จำนวน ${sceneCount} ฉาก ออกแบบให้กระชับ หยุดนิ้วโป้ง และส่งต่อไปผลิตในแผนกเฉพาะทางได้ทันที`,
    fullScriptThai: scenes.map((s) => s.voiceoverThai).join(" "),
    scenes,
    productInfo: {
      productName: cleanTopic,
      price: "โปรโมชันพิเศษวันนี้",
      promoBadge: "ลดแรง / จำนวนจำกัด"
    },
    caption: `✨ ${cleanTopic}\n\n${scenes.map((s) => `• ${s.voiceoverThai}`).join("\n")}\n\n📲 สนใจสั่งซื้อหรือสอบถามเพิ่มเติม กดที่ตะกร้าหรือทักแชทได้เลยครับ!`,
    hashtags: ["#PKCreativeHub", "#รีวิวของดี", "#ป้ายยา", "#คลิปสั้นไวรัล", "#AIContent"],
    sourceDept: "os",
    updatedAt: new Date().toISOString()
  };
}

export default function UnifiedHubOSPage() {
  const { activeBrand } = useBrand();
  const {
    activeHandoff,
    setActiveHandoff,
    sendToDepartment,
    vaultProjects,
    loadFromVault,
    saveToVault,
    customDepartments
  } = useHub();
  const { showToast } = useToast();

  const [selectedMode, setSelectedMode] = useState<OSCreationPresetMode>("AFFILIATE");
  const [promptInput, setPromptInput] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [sceneCount, setSceneCount] = useState<number>(5);
  const [generating, setGenerating] = useState(false);

  const [currentPayload, setCurrentPayload] = useState<HubHandoffPayload | null>(null);
  const [ttsBusyScene, setTtsBusyScene] = useState<number | null>(null);
  const [imgBusyScene, setImgBusyScene] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeModeConfig = OS_MODES.find((m) => m.id === selectedMode) || OS_MODES[0];

  useEffect(() => {
    if (activeHandoff && !currentPayload) {
      setCurrentPayload(activeHandoff);
    }
  }, [activeHandoff, currentPayload]);

  const handleModeChange = (modeId: OSCreationPresetMode) => {
    setSelectedMode(modeId);
    const found = OS_MODES.find((m) => m.id === modeId);
    if (found) {
      setSceneCount(found.defaultScenes);
    }
  };

  const handleGenerateOSScript = async (overrideText?: string) => {
    const query = (overrideText ?? promptInput).trim();
    if (!query) {
      showToast("กรุณาพิมพ์หัวข้อคอนเทนต์ สินค้า หรือพล็อตเรื่องที่ต้องการให้ OS คิดก่อนครับ", "info");
      return;
    }
    if (overrideText) setPromptInput(overrideText);

    setGenerating(true);
    try {
      const contentMode = selectedMode === "SHORT_FILM" ? "SHORT_FILM" : "SOCIAL";
      const contentGoal =
        selectedMode === "AFFILIATE" || selectedMode === "COMMERCIAL" || selectedMode === "CAR_HANDOVER"
          ? "COMMERCIAL"
          : selectedMode === "VIRAL_SUBTITLE"
          ? "HOWTO"
          : "VIRAL_POV";

      const res = await fetch("/api/ai/easy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE",
          prompt: `[โหมดเป้าหมาย: ${activeModeConfig.label}] ${query}`,
          format: "VIDEO",
          aiMode: "AI_FLOW",
          aspectRatio,
          contentGoal,
          contentMode,
          sceneCount: String(sceneCount),
          includeTrends: true
        })
      });

      const data = await res.json().catch(() => ({}));
      const bp = data?.blueprint;

      if (res.ok && bp && bp.video_blueprint?.scenes?.length > 0) {
        const mappedScenes: HubSceneItem[] = bp.video_blueprint.scenes.map((s: any, idx: number) => ({
          sceneNumber: s.scene_number || idx + 1,
          title: s.scene_role || s.what_to_shoot || `ฉากที่ ${idx + 1}`,
          durationSec: s.duration_sec || 3,
          timecode: `00:${String(idx * 3).padStart(2, "0")} - 00:${String((idx + 1) * 3).padStart(2, "0")}`,
          voiceoverThai: s.voiceover_text || s.subtitle_line || "",
          onScreenText: s.on_screen_text || s.popup_badge || "",
          visualPromptEn: s.flow_prompt || `Cinematic 8K shot of ${query}, scene ${idx + 1}`,
          motionPromptEn: s.camera_angle || "Smooth cinematic camera motion, 4k 60fps",
          cameraAngle: s.camera_badge || s.camera_angle || "Cinematic Shot",
          actBadge: s.act_badge || activeModeConfig.badge
        }));

        const mappedCharacters = (bp.film_bible?.characters || []).map((c: any, idx: number) => ({
          id: `char-${idx + 1}`,
          name: c.name || `ตัวละครที่ ${idx + 1}`,
          role: c.role || "ตัวละครหลัก",
          appearanceThai: c.appearance_thai || "",
          characterSheetPromptEn: c.character_sheet_prompt || ""
        }));

        const newPayload: HubHandoffPayload = {
          id: `os-${Date.now()}`,
          title: bp.title || query,
          topic: query,
          brandName: activeBrand,
          aspectRatio,
          hook3Sec: bp.hook_3sec || mappedScenes[0]?.voiceoverThai || "",
          concept: bp.concept || "",
          fullScriptThai:
            bp.video_blueprint.full_voiceover_script ||
            mappedScenes.map((s) => s.voiceoverThai).join(" "),
          scenes: mappedScenes,
          characters: mappedCharacters,
          productInfo: {
            productName: query,
            price: "โปรโมชันพิเศษ",
            promoBadge: "ปักตะกร้าด่วน"
          },
          caption: bp.social_caption || "",
          hashtags: Array.isArray(bp.hashtags) ? bp.hashtags : ["#PKCreativeHub", "#AIContent"],
          sourceDept: "os",
          updatedAt: new Date().toISOString()
        };

        setCurrentPayload(newPayload);
        setActiveHandoff(newPayload);
        saveToVault({
          id: newPayload.id,
          title: newPayload.title,
          department: "os",
          departmentLabel: "OS BRAIN",
          aspectRatio,
          payload: newPayload
        });

        showToast(
          `คิดสคริปต์และแยก ${mappedScenes.length} ฉากเสร็จสมบูรณ์! กดก๊อปหรือกดส่งต่อไปแผนกที่ต้องการได้เลย`,
          "success"
        );
      } else {
        const fallback = buildDeterministicFallbackPayload(
          query,
          selectedMode,
          aspectRatio,
          sceneCount,
          activeBrand
        );
        setCurrentPayload(fallback);
        setActiveHandoff(fallback);
        saveToVault({
          id: fallback.id,
          title: fallback.title,
          department: "os",
          departmentLabel: "OS BRAIN",
          aspectRatio,
          payload: fallback
        });
        showToast("สร้างโครงสคริปต์และแยกฉากพร้อมส่งต่อเรียบร้อยแล้ว!", "success");
      }
    } catch {
      const fallback = buildDeterministicFallbackPayload(
        query,
        selectedMode,
        aspectRatio,
        sceneCount,
        activeBrand
      );
      setCurrentPayload(fallback);
      setActiveHandoff(fallback);
      saveToVault({
        id: fallback.id,
        title: fallback.title,
        department: "os",
        departmentLabel: "OS BRAIN",
        aspectRatio,
        payload: fallback
      });
      showToast("สร้างสคริปต์และแยกฉากด้วย Built-in Engine เรียบร้อยแล้ว!", "success");
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateSceneField = (
    sceneNumber: number,
    field: keyof HubSceneItem,
    value: string | number
  ) => {
    if (!currentPayload) return;
    const updatedScenes = currentPayload.scenes.map((s) =>
      s.sceneNumber === sceneNumber ? { ...s, [field]: value } : s
    );
    const updatedPayload: HubHandoffPayload = {
      ...currentPayload,
      scenes: updatedScenes,
      fullScriptThai: updatedScenes.map((s) => s.voiceoverThai).join(" "),
      updatedAt: new Date().toISOString()
    };
    setCurrentPayload(updatedPayload);
    setActiveHandoff(updatedPayload);
  };

  const handleGenerateSceneVoice = async (scene: HubSceneItem) => {
    if (!scene.voiceoverThai.trim()) {
      showToast("ฉากนี้ยังไม่มีข้อความบทพากย์ไทยครับ", "info");
      return;
    }
    setTtsBusyScene(scene.sceneNumber);
    try {
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scene.voiceoverThai,
          voiceId: "ErXwobaYiN019PkySvjV",
          mode: "generate_single"
        })
      });
      const data = await res.json();
      if (res.ok && data.audioBase64) {
        const audioDataUrl = `data:audio/mpeg;base64,${data.audioBase64}`;
        handleUpdateSceneField(scene.sceneNumber, "audioUrl", audioDataUrl);
        showToast(`สร้างเสียงพากย์ฉากที่ ${scene.sceneNumber} สำเร็จ!`, "success");
      } else {
        showToast(data.error || "สร้างเสียงพากย์ไม่สำเร็จ", "error");
      }
    } catch (err: any) {
      showToast(`เกิดข้อผิดพลาด: ${err?.message}`, "error");
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
        showToast(`สร้างภาพพรีวิวฉากที่ ${scene.sceneNumber} สำเร็จ!`, "success");
      } else {
        showToast(data.error || "สร้างภาพไม่สำเร็จ", "error");
      }
    } catch (err: any) {
      showToast(`เกิดข้อผิดพลาด: ${err?.message}`, "error");
    } finally {
      setImgBusyScene(null);
    }
  };

  const getDeptIcon = (id: string) => {
    switch (id) {
      case "affiliate":
        return ShoppingBag;
      case "short-film":
        return Film;
      case "mv-studio":
        return Music;
      case "subtitles":
        return Subtitles;
      case "downloader":
        return Download;
      case "commercial":
        return Video;
      case "skills-hub":
        return Wand2;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="space-y-7 pb-12">
      {/* =====================================================================
          1. CENTRAL AI CONTENT OS BRAIN & SCRIPT GENERATOR
      ===================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-lg">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PK CREATIVE HUB v3.0 · All-in-One AI Content OS & 6 Studios</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              สมองกลกลางคิดคอนเทนต์ & เขียนสคริปต์ พร้อมส่งต่อไปทุกแผนกในคลิกเดียว
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              รวมทุกโปรเจกต์ของคุณไว้เป็นหนึ่งเดียว (คลิปขายของปักตะกร้า · หนังสั้น PKFLOW · ทำ MV เพลง · ซับอัตโนมัติ · โหลดคลิป · โฆษณา Flow · สกิลผู้กำกับพิเศษ) เริ่มคิดสคริปต์ที่นี่ แล้วกดก๊อปหรือส่งต่อเข้าแผนกที่ต้องการได้ทันที
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/easy"
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold inline-flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>โหมด Easy AI ละเอียด</span>
            </Link>
            <a
              href="https://flow.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all"
            >
              <Film className="w-3.5 h-3.5 text-emerald-400" />
              <span>เปิด Google Flow</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* Mode Selector Pills */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
            1. เลือกประเภทงานที่อยากให้ OS คิดสคริปต์ & เตรียมส่งต่อ:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {OS_MODES.map((m) => {
              const active = selectedMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModeChange(m.id)}
                  className={`min-h-[48px] p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between ${
                    active
                      ? "bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-500 shadow-xs"
                      : "bg-slate-50/80 dark:bg-zinc-800/70 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700"
                  }`}
                >
                  <div className="text-xs font-bold leading-snug">{m.label}</div>
                  <div
                    className={`text-[10px] font-mono mt-1 ${
                      active ? "text-emerald-300 dark:text-emerald-100" : "text-slate-500 dark:text-zinc-400"
                    }`}
                  >
                    {m.badge}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio + Scene Count + Main Prompt Input */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="os-main-input" className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              2. บรีฟสิ่งที่ต้องการทำ (พิมพ์ภาษาคนธรรมดาได้เลย):
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {/* Aspect Ratio Toggle */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-zinc-800 p-1 border border-slate-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setAspectRatio("9:16")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer ${
                    aspectRatio === "9:16"
                      ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>9:16 แนวตั้ง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio("16:9")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer ${
                    aspectRatio === "16:9"
                      ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 text-blue-600" />
                  <span>16:9 แนวนอน</span>
                </button>
              </div>

              {/* Scene Count Selector */}
              <select
                value={sceneCount}
                onChange={(e) => setSceneCount(Number(e.target.value))}
                aria-label="จำนวนฉาก"
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200"
              >
                <option value={5}>5 ฉาก (15 วินาที)</option>
                <option value={6}>6 ฉาก (18 วินาที)</option>
                <option value={8}>8 ฉาก (24 วินาที)</option>
                <option value={10}>10 ฉาก (30 วินาที)</option>
                <option value={12}>12 ฉาก (หนังสั้น/MV)</option>
                <option value={16}>16 ฉาก (จัดเต็ม)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="os-main-input"
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !generating) handleGenerateOSScript();
              }}
              placeholder={activeModeConfig.placeholder}
              className="flex-1 px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-zinc-900 focus:ring-3 focus:ring-emerald-500/10 transition-all"
            />
            <button
              type="button"
              disabled={generating}
              onClick={() => handleGenerateOSScript()}
              className="min-h-[48px] px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shrink-0 disabled:opacity-60 shadow-sm"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>OS กำลังคิดสคริปต์ & แยกฉาก...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>คิดสคริปต์ & แยกฉากทันที</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Examples for Selected Mode */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">
              ตัวอย่างกดลองทันที ({activeModeConfig.label}):
            </span>
            {activeModeConfig.examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => handleGenerateOSScript(ex)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-800 dark:hover:text-emerald-300 hover:border-emerald-300 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer text-left"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. LIVE OS SCRIPT WORKSPACE & 1-CLICK DEPARTMENT HANDOFF
      ===================================================================== */}
      {currentPayload && (
        <section className="space-y-4 animate-fade-in-up">
          {/* 1-Click Department Handoff Bar */}
          <DepartmentHandoffBar currentDeptId="os" payload={currentPayload} />

          {/* Recommended Direct Handoff Banner for current mode */}
          <div className="p-4 rounded-2xl bg-emerald-950 text-white border border-emerald-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-[11px] font-mono text-emerald-300 font-bold uppercase">
                RECOMMENDED NEXT STEP · ส่งเข้าแผนกเฉพาะทาง
              </div>
              <div className="text-sm font-bold">
                สคริปต์ &ldquo;{currentPayload.title}&rdquo; ({currentPayload.scenes.length} ฉาก) พร้อมส่งต่อไปยัง{" "}
                <span className="text-emerald-300 underline">{activeModeConfig.targetLabel}</span> แล้ว!
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                sendToDepartment(activeModeConfig.targetHref, currentPayload, activeModeConfig.targetLabel)
              }
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shrink-0"
            >
              <span>ส่งไป {activeModeConfig.targetLabel} ทันที</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Master Script Summary & Hook Card */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  OS MASTER SCRIPT · {currentPayload.aspectRatio}
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {currentPayload.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(currentPayload.fullScriptThai);
                  setCopiedId("full-script");
                  showToast("คัดลอกบทพากย์ไทยทั้งหมดแล้ว!", "success");
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer self-start"
              >
                {copiedId === "full-script" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>คัดลอกบทพากย์ไทยรวม</span>
              </button>
            </div>

            {/* Hook 3 Sec + Full Voiceover Editable Box */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 space-y-1">
                <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                  ⚡ ประโยคเปิดหยุดนิ้ว 3 วินาทีแรก (3-Sec Hook)
                </div>
                <textarea
                  rows={2}
                  value={currentPayload.hook3Sec}
                  onChange={(e) => {
                    const updated = { ...currentPayload, hook3Sec: e.target.value };
                    setCurrentPayload(updated);
                    setActiveHandoff(updated);
                  }}
                  className="w-full bg-white dark:bg-zinc-900 border border-amber-200 dark:border-zinc-700 rounded-lg p-2 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="lg:col-span-2 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-1">
                <div className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                  🎙️ บทพากย์ภาษาไทยฉบับเต็ม (แก้ไขข้อความก่อนส่งต่อไปแผนกทำซับ/พากย์เสียงได้)
                </div>
                <textarea
                  rows={2}
                  value={currentPayload.fullScriptThai}
                  onChange={(e) => {
                    const updated = { ...currentPayload, fullScriptThai: e.target.value };
                    setCurrentPayload(updated);
                    setActiveHandoff(updated);
                  }}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Scene-by-Scene Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {currentPayload.scenes.map((scene) => (
                <div
                  key={scene.sceneNumber}
                  className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 p-3.5 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-emerald-600 text-white font-mono text-[11px] font-bold shrink-0">
                          ช็อต {String(scene.sceneNumber).padStart(2, "0")}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {scene.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 shrink-0">
                        {scene.durationSec}s · {currentPayload.aspectRatio}
                      </span>
                    </div>

                    {/* Preview Image if generated */}
                    {scene.imageUrl && (
                      <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 bg-black aspect-video">
                        <img
                          src={scene.imageUrl}
                          alt={`ฉากที่ ${scene.sceneNumber}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Thai Voiceover Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-0.5">
                        🔊 บทพากย์ไทย / ซับไตเติล:
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

                    {/* Audio Player if synthesized */}
                    {scene.audioUrl && (
                      <audio controls src={scene.audioUrl} className="w-full h-8" />
                    )}

                    {/* Collapsible English Visual & Motion Prompt */}
                    <details className="text-xs text-slate-600 dark:text-zinc-400">
                      <summary className="cursor-pointer font-semibold hover:text-slate-900 dark:hover:text-white">
                        🔍 ดู/แก้ไข Visual Prompt (EN) & มุมกล้อง Veo
                      </summary>
                      <div className="mt-2 space-y-1.5">
                        <textarea
                          rows={2}
                          value={scene.visualPromptEn}
                          onChange={(e) =>
                            handleUpdateSceneField(scene.sceneNumber, "visualPromptEn", e.target.value)
                          }
                          className="w-full rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 p-2 text-[11px] font-mono text-slate-800 dark:text-zinc-200"
                        />
                      </div>
                    </details>
                  </div>

                  {/* Per-Scene Quick Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-200/70 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={imgBusyScene === scene.sceneNumber}
                        onClick={() => handleGenerateSceneImage(scene)}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-100 border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{imgBusyScene === scene.sceneNumber ? "กำลังวาด..." : "เจนภาพ AI"}</span>
                      </button>
                      <button
                        type="button"
                        disabled={ttsBusyScene === scene.sceneNumber}
                        onClick={() => handleGenerateSceneVoice(scene)}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-100 border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{ttsBusyScene === scene.sceneNumber ? "กำลังพากย์..." : "พากย์เสียง"}</span>
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
                      className="min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-zinc-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === `scene-${scene.sceneNumber}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>ก๊อป Prompt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          3. ALL DEPARTMENTS DIRECTORY (6 Chat Projects + AI Skills + Future Builder)
      ===================================================================== */}
      <section className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              แผนกผลิตสื่อทั้งหมดใน HUB ของคุณ (6 Studios + 8 AI Director Skills)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              คลิกเข้าแผนกที่ต้องการได้โดยตรง หรือกดส่งสคริปต์จากด้านบนเข้าสู่แผนกใดก็ได้
            </p>
          </div>
          <Link
            href="/skills-hub?tab=custom"
            className="min-h-[38px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 self-start transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ เพิ่มแผนกใหม่ในอนาคต</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CORE_DEPARTMENTS.map((dept) => {
            const Icon = getDeptIcon(dept.id);
            return (
              <div
                key={dept.id}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 flex flex-col justify-between gap-4 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`w-10 h-10 rounded-xl ${dept.bgLight} dark:bg-zinc-800 flex items-center justify-center ${dept.accentColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                      {dept.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      {dept.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {dept.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 border border-slate-200/70 dark:border-zinc-700 font-medium"
                      >
                        ✓ {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                  <Link
                    href={dept.href}
                    className="flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-emerald-600 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <span>เปิดแผนกนี้</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {currentPayload && dept.id !== "os" && (
                    <button
                      type="button"
                      onClick={() => sendToDepartment(dept.href, currentPayload, dept.shortName)}
                      className="min-h-[40px] px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold cursor-pointer"
                      title="ส่งสคริปต์ปัจจุบันเข้าแผนกนี้ทันที"
                    >
                      ส่งงานไป
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Custom User-Added Future Departments */}
          {customDepartments.map((cDept) => (
            <div
              key={cDept.id}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-900/60 p-5 flex flex-col justify-between gap-4 shadow-2xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800">
                    {cDept.badge || "CUSTOM DEPT"}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{cDept.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{cDept.sublabel}</p>
                </div>
              </div>
              <Link
                href={`/skills-hub?dept=${encodeURIComponent(cDept.id)}`}
                className="min-h-[40px] px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5"
              >
                <span>เปิดแผนก {cDept.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          4. RECENT SAVED PROJECTS VAULT (Quick Resume on PC & Mobile)
      ===================================================================== */}
      {vaultProjects.length > 0 && (
        <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                โปรเจกต์ล่าสุดในคลังของคุณ (กดเพื่อเปิดทำต่อได้ทันที)
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              บันทึกอัตโนมัติ Real-time
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {vaultProjects.slice(0, 4).map((proj) => (
              <button
                key={proj.id}
                type="button"
                onClick={() => loadFromVault(proj)}
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
                  <span>{proj.payload?.scenes?.length || 0} ฉาก · {proj.aspectRatio}</span>
                  <span className="font-bold text-emerald-600 inline-flex items-center gap-0.5">
                    เปิดทำต่อ <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
