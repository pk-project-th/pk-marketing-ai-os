"use client";

import React, { useState, useEffect } from "react";
import {
  Film,
  Sparkles,
  Users,
  Camera,
  Image as ImageIcon,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  Download,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  Smartphone,
  Monitor
} from "lucide-react";
import {
  useHub,
  HubHandoffPayload,
  HubSceneItem,
  HubCharacterItem
} from "@/context/HubContext";
import { DepartmentHandoffBar } from "@/components/hub/DepartmentHandoffBar";
import { useToast } from "@/components/ui/ToastProvider";

const MATERIAL_STYLES = [
  {
    id: "photorealistic",
    label: "🎞️ ภาพยนตร์สมจริง (Photorealistic 8K)",
    promptTag: "Photorealistic 8K ARRI Alexa LF cinema film, anamorphic lens, natural skin texture, dramatic film lighting"
  },
  {
    id: "3d_pixar",
    label: "🧸 แอนิเมชัน 3D Pixar / Disney",
    promptTag: "3D Pixar and Disney feature animation style, expressive eyes, warm subsurface scattering, vibrant cinematic render"
  },
  {
    id: "anime",
    label: "🌸 อนิเมะญี่ปุ่น (Makoto Shinkai Style)",
    promptTag: "High-detail Japanese anime film style by Makoto Shinkai, luminous sky, rich atmospheric lighting, crisp cel shading"
  },
  {
    id: "vintage_thai",
    label: "📽️ หนังไทยวินเทจ 16mm ยุค 80s",
    promptTag: "Vintage 1980s Thai 16mm Kodak film aesthetic, warm nostalgic grain, authentic retro Thailand atmosphere"
  },
  {
    id: "stop_motion",
    label: "🎨 สต็อปโมชันดินปั้น (Stop Motion)",
    promptTag: "Handcrafted Laika studio stop-motion miniature aesthetic, tactile fabric and clay texture, studio macro lighting"
  }
];

const CAMERA_MOVEMENTS = [
  {
    id: "dolly_in",
    label: "🎥 Slow Dolly Push-In (ซูมเข้าหาอารมณ์ตัวละคร)",
    prompt: "Slow cinematic dolly push-in toward the character's focused emotional expression, shallow depth of field"
  },
  {
    id: "tracking",
    label: "🏃 Gimbal Tracking Shot (กล้องเคลื่อนตามตัวละคร)",
    prompt: "Smooth gimbal tracking shot moving alongside the character through the scene at 60fps"
  },
  {
    id: "orbit",
    label: "🔄 Circular 360 Orbit (หมุนรอบตัวละคร/จุดพีค)",
    prompt: "Circular 180-degree orbit arc shot rotating smoothly around the subject with dramatic background bokeh"
  },
  {
    id: "drone",
    label: "🚁 Drone Aerial Reveal (มุมสูงเปิดฉากอลังการ)",
    prompt: "Cinematic drone ascending shot revealing the vast environment and establishing atmosphere"
  },
  {
    id: "crane",
    label: "🏗️ Crane Rising Shot (ยกกล้องจากพื้นสู่มุมสูง)",
    prompt: "Sweeping crane jib shot rising smoothly from low ground level up to eye-level framing"
  },
  {
    id: "pov",
    label: "👀 First-Person POV (มุมมองสายตาตัวละคร)",
    prompt: "Intimate first-person POV camera movement looking directly at the character with natural handheld breathing"
  }
];

const FILM_PRESETS = [
  {
    title: "ก๋วยเตี๋ยวชามสุดท้ายของพ่อ (ดราม่าครอบครัวหักมุมซึ้ง)",
    logline: "ลูกชายนักธุรกิจกลับบ้านเกิดมาสั่งก๋วยเตี๋ยวร้านพ่อที่กำลังจะปิดตัว ก่อนพบสมุดบันทึกความลับที่พ่อเก็บไว้ 20 ปี",
    characters: [
      {
        id: "char-1",
        name: "เฮียชัย (พ่อวัย 62)",
        role: "พ่อเจ้าของร้านก๋วยเตี๋ยวโบราณ",
        appearanceThai: "ชายไทยวัย 62 ปี ผมหงอกแซมขาว ใบหน้าใจดีมีริ้วรอยแห่งความทุ่มเท สวมเสื้อเชิ้ตขาวพับแขนและผ้ากันเปื้อนสีน้ำเงินเข้ม",
        characterSheetPromptEn:
          "A 62-year-old kind Thai father with salt-and-pepper short hair, warm weathered face, wearing a rolled-sleeve white cotton shirt and dark navy canvas apron"
      },
      {
        id: "char-2",
        name: "นนท์ (ลูกชายวัย 28)",
        role: "ลูกชายคนทำงานเมืองหลวง",
        appearanceThai: "ชายหนุ่มไทยวัย 28 ปี ทรงผมเรียบร้อย สวมเสื้อเชิ้ตสีกรมท่าสะพายกระเป๋าหนัง แววตาเหนื่อยล้าแต่อ่อนโยน",
        characterSheetPromptEn:
          "A 28-year-old handsome Thai young man with neat dark hair, wearing a fitted navy dress shirt with a leather messenger bag"
      }
    ]
  },
  {
    title: "ประธานบริษัทปลอมตัวขับซาเล้งไปโชว์รูมรถ (ละครสั้นไวรัล)",
    logline: "มหาเศรษฐีแต่งชุดลุงเก็บของเก่าไปขอดูรถ SUV ป้ายแดง พนักงานทุกคนเมินยกเว้นเซลล์สาวฝึกงานคนเดียวที่ต้อนรับอย่างดี",
    characters: [
      {
        id: "char-1",
        name: "คุณท่านอาทิตย์ (วัย 55)",
        role: "ประธานบริษัทในชุดลุงซาเล้ง",
        appearanceThai: "ชายไทยวัย 55 ปี บุคลิกภูมิฐานแต่สวมเสื้อยืดเก่าหมวกสานและกางเกงขาก๊วย ดวงตาคมกริบทรงพลัง",
        characterSheetPromptEn:
          "A 55-year-old dignified Thai billionaire man disguised in a humble faded t-shirt, straw hat, and traditional fisherman pants, sharp wise eyes"
      },
      {
        id: "char-2",
        name: "น้องฟ้า (เซลล์สาววัย 24)",
        role: "ที่ปรึกษาการขายจิตใจดี",
        appearanceThai: "หญิงสาวไทยวัย 24 ปี ยิ้มหวานจริงใจ สวมสูททำงานสีเทาเรียบหรูของโชว์รูมรถยนต์",
        characterSheetPromptEn:
          "A 24-year-old polite Thai female automotive sales consultant with a warm sincere smile, wearing a tailored charcoal grey dealership suit"
      }
    ]
  }
];

export default function ShortFilmStudioPage() {
  const { activeHandoff, setActiveHandoff, saveToVault } = useHub();
  const { showToast } = useToast();

  const [filmTitle, setFilmTitle] = useState("");
  const [logline, setLogline] = useState("");
  const [materialId, setMaterialId] = useState("photorealistic");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [sceneCount, setSceneCount] = useState<number>(6);
  const [characters, setCharacters] = useState<HubCharacterItem[]>(FILM_PRESETS[0].characters);

  const [generating, setGenerating] = useState(false);
  const [payload, setPayload] = useState<HubHandoffPayload | null>(null);
  const [charImgBusy, setCharImgBusy] = useState<string | null>(null);
  const [sceneImgBusy, setSceneImgBusy] = useState<number | null>(null);
  const [sceneTtsBusy, setSceneTtsBusy] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedMaterial = MATERIAL_STYLES.find((m) => m.id === materialId) || MATERIAL_STYLES[0];

  useEffect(() => {
    if (activeHandoff && !payload) {
      setPayload(activeHandoff);
      setFilmTitle(activeHandoff.title || activeHandoff.topic);
      setLogline(activeHandoff.concept || activeHandoff.hook3Sec);
      setAspectRatio(activeHandoff.aspectRatio || "9:16");
      if (activeHandoff.characters && activeHandoff.characters.length > 0) {
        setCharacters(activeHandoff.characters);
      }
    }
  }, [activeHandoff, payload]);

  const handleLoadFilmPreset = (preset: (typeof FILM_PRESETS)[0]) => {
    setFilmTitle(preset.title);
    setLogline(preset.logline);
    setCharacters(preset.characters);
    showToast(`โหลดโครงเรื่อง "${preset.title}" พร้อมตัวละครแล้ว! กดสร้างสตอรี่บอร์ด 3 องก์ได้เลย`, "success");
  };

  const handleAddCharacter = () => {
    const idx = characters.length + 1;
    setCharacters((prev) => [
      ...prev,
      {
        id: `char-${Date.now()}`,
        name: `ตัวละครที่ ${idx}`,
        role: "ตัวละครสมทบ",
        appearanceThai: "ระบุรูปร่างหน้าตา ทรงผม และชุดที่สวมใส่ชุดเดียวตลอดเรื่อง",
        characterSheetPromptEn: "A Thai character with distinct facial features and consistent signature outfit"
      }
    ]);
  };

  const handleUpdateCharacter = (id: string, field: keyof HubCharacterItem, value: string) => {
    setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleGenerateCharacterPortrait = async (char: HubCharacterItem) => {
    setCharImgBusy(char.id);
    try {
      const prompt = `${selectedMaterial.promptTag}. Character reference portrait sheet of ${char.characterSheetPromptEn || char.appearanceThai}, clean studio lighting, clear facial features, zero text`;
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "9:16" })
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        handleUpdateCharacter(char.id, "imageUrl", data.imageUrl);
        showToast(`สร้างภาพอ้างอิงตัวละคร "${char.name}" สำเร็จ!`, "success");
      }
    } catch {
      showToast("เจนภาพตัวละครไม่สำเร็จ", "error");
    } finally {
      setCharImgBusy(null);
    }
  };

  const handleApplyCharacterLockToAllScenes = () => {
    if (!payload) return;
    const lockPrefix = characters
      .map((c) => `[CHARACTER LOCK ${c.name}: ${c.characterSheetPromptEn || c.appearanceThai}]`)
      .join(" ");

    const nextScenes = payload.scenes.map((s) => {
      const cleaned = s.visualPromptEn.replace(/\[CHARACTER LOCK[^\]]*\]\s*/g, "");
      return {
        ...s,
        visualPromptEn: `${lockPrefix} [${selectedMaterial.promptTag}] ${cleaned}`.trim()
      };
    });

    const nextPayload: HubHandoffPayload = {
      ...payload,
      characters,
      scenes: nextScenes,
      updatedAt: new Date().toISOString()
    };
    setPayload(nextPayload);
    setActiveHandoff(nextPayload);
    showToast("ล็อกหน้าตาตัวละครและสไตล์ภาพเข้าสู่ทุกฉากครบ 100% แล้ว!", "success");
  };

  const handleGenerateShortFilm = async () => {
    const cleanTitle = filmTitle.trim() || "หนังสั้น AI เรื่องใหม่";
    const cleanLogline = logline.trim() || cleanTitle;

    setGenerating(true);
    try {
      const charContext = characters
        .map((c) => `${c.name} (${c.role}): ${c.appearanceThai} | EN: ${c.characterSheetPromptEn}`)
        .join(" ; ");

      const res = await fetch("/api/ai/easy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE",
          prompt: `หนังสั้นเรื่อง: ${cleanTitle} | เรื่องย่อ: ${cleanLogline} | ตัวละครหลัก: ${charContext} | สไตล์ภาพ: ${selectedMaterial.label}`,
          format: "VIDEO",
          aiMode: "AI_FLOW",
          aspectRatio,
          contentMode: "SHORT_FILM",
          sceneCount: String(sceneCount)
        })
      });

      const data = await res.json().catch(() => ({}));
      const bp = data?.blueprint;

      const lockPrefix = characters
        .map((c) => `[CHARACTER LOCK ${c.name}: ${c.characterSheetPromptEn}]`)
        .join(" ");

      if (res.ok && bp?.video_blueprint?.scenes?.length > 0) {
        const mappedScenes: HubSceneItem[] = bp.video_blueprint.scenes.map((s: any, idx: number) => {
          const actLabel =
            idx < Math.ceil(sceneCount / 3)
              ? "องก์ 1: ปูเรื่อง & ปมขัดแย้ง"
              : idx < Math.ceil((sceneCount * 2) / 3)
              ? "องก์ 2: จุดปะทะ & เหตุการณ์พลิกผัน"
              : "องก์ 3: จุดพีค & บทสรุปซึ้งกินใจ";

          return {
            sceneNumber: idx + 1,
            title: s.scene_role || s.what_to_shoot || `ฉากที่ ${idx + 1}`,
            durationSec: s.duration_sec || 5,
            timecode: `00:${String(idx * 5).padStart(2, "0")} - 00:${String((idx + 1) * 5).padStart(2, "0")}`,
            voiceoverThai: s.voiceover_text || "",
            onScreenText: s.on_screen_text || "",
            visualPromptEn: `${lockPrefix} [${selectedMaterial.promptTag}] ${s.flow_prompt || s.what_to_shoot}, zero in-image text`,
            motionPromptEn: s.camera_angle || CAMERA_MOVEMENTS[idx % CAMERA_MOVEMENTS.length].prompt,
            cameraAngle: CAMERA_MOVEMENTS[idx % CAMERA_MOVEMENTS.length].label,
            actBadge: s.act_badge || actLabel
          };
        });

        const newPayload: HubHandoffPayload = {
          id: `film-${Date.now()}`,
          title: bp.title || cleanTitle,
          topic: cleanLogline,
          aspectRatio,
          hook3Sec: bp.hook_3sec || mappedScenes[0]?.voiceoverThai || "",
          concept: cleanLogline,
          fullScriptThai: mappedScenes.map((s) => s.voiceoverThai).join(" "),
          scenes: mappedScenes,
          characters,
          caption: bp.social_caption || `🎬 หนังสั้น: ${cleanTitle}\n${cleanLogline}`,
          hashtags: bp.hashtags || ["#หนังสั้นAI", "#ละครสั้น", "#PKFLOW", "#GoogleFlow"],
          sourceDept: "short-film",
          updatedAt: new Date().toISOString()
        };

        setPayload(newPayload);
        setActiveHandoff(newPayload);
        saveToVault({
          id: newPayload.id,
          title: newPayload.title,
          department: "short-film",
          departmentLabel: "PRO FILM",
          aspectRatio,
          payload: newPayload
        });
        showToast(`สร้างสตอรี่บอร์ดหนังสั้น 3 องก์ (${mappedScenes.length} ฉาก) เรียบร้อย!`, "success");
      } else {
        const fallbackScenes: HubSceneItem[] = Array.from({ length: sceneCount }).map((_, idx) => {
          const actLabel =
            idx < Math.ceil(sceneCount / 3)
              ? "องก์ 1: ปูเรื่อง & ปมปัญหา"
              : idx < Math.ceil((sceneCount * 2) / 3)
              ? "องก์ 2: จุดปะทะ & ความจริงเปิดเผย"
              : "องก์ 3: จุดพีคหักมุม & บทสรุป";
          const cam = CAMERA_MOVEMENTS[idx % CAMERA_MOVEMENTS.length];
          return {
            sceneNumber: idx + 1,
            title: `${actLabel} — ฉากที่ ${idx + 1}`,
            durationSec: 5,
            timecode: `00:${String(idx * 5).padStart(2, "0")} - 00:${String((idx + 1) * 5).padStart(2, "0")}`,
            voiceoverThai:
              idx === 0
                ? `${cleanLogline}`
                : idx === sceneCount - 1
                ? "และในวินาทีนั้นเอง ความจริงที่ถูกเก็บซ่อนไว้ตลอดมาก็ปรากฏขึ้นตรงหน้า..."
                : `ฉากที่ ${idx + 1} ตัวละครเผชิญหน้ากับเหตุการณ์สำคัญที่เปลี่ยนทุกอย่างไปตลอดกาล`,
            onScreenText: "",
            visualPromptEn: `${lockPrefix} [${selectedMaterial.promptTag}] Scene ${idx + 1} of "${cleanTitle}": ${cleanLogline}. ${cam.prompt}, ${aspectRatio} framing, zero in-image text`,
            motionPromptEn: cam.prompt,
            cameraAngle: cam.label,
            actBadge: actLabel
          };
        });

        const fbPayload: HubHandoffPayload = {
          id: `film-${Date.now()}`,
          title: cleanTitle,
          topic: cleanLogline,
          aspectRatio,
          hook3Sec: fallbackScenes[0].voiceoverThai,
          concept: cleanLogline,
          fullScriptThai: fallbackScenes.map((s) => s.voiceoverThai).join(" "),
          scenes: fallbackScenes,
          characters,
          caption: `🎬 หนังสั้น AI: ${cleanTitle}\n\n${cleanLogline}`,
          hashtags: ["#หนังสั้นAI", "#ละครสั้น", "#PKFLOW"],
          sourceDept: "short-film",
          updatedAt: new Date().toISOString()
        };

        setPayload(fbPayload);
        setActiveHandoff(fbPayload);
        saveToVault({
          id: fbPayload.id,
          title: fbPayload.title,
          department: "short-film",
          departmentLabel: "PRO FILM",
          aspectRatio,
          payload: fbPayload
        });
        showToast("สร้างสตอรี่บอร์ดหนังสั้น 3 องก์พร้อมล็อกตัวละครเรียบร้อย!", "success");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleExportFlowJson = () => {
    if (!payload) return;
    const flowJson = {
      version: "5.1-PKFLOW-PRO-FILM",
      source: "PK-Creative-Hub-v3",
      project: {
        name: payload.title,
        description: payload.concept,
        material: materialId,
        aspect_ratio: payload.aspectRatio
      },
      entities: characters.map((c) => ({
        type: "character",
        name: c.name,
        role: c.role,
        description_th: c.appearanceThai,
        prompt_en: c.characterSheetPromptEn
      })),
      shots: payload.scenes.map((s) => ({
        shot_number: s.sceneNumber,
        act: s.actBadge,
        title: s.title,
        duration_sec: s.durationSec,
        dialogue_th: s.voiceoverThai,
        image_prompt_en: s.visualPromptEn,
        motion_prompt_en: s.motionPromptEn
      }))
    };

    const blob = new Blob([JSON.stringify(flowJson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PKFLOW_${payload.title.slice(0, 24).replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("ดาวน์โหลดไฟล์โปรเจกต์ PKFLOW (.json) สำหรับ Google Flow / FlowKit เรียบร้อย!", "success");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Presets */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-lg">
              <Film className="w-3.5 h-3.5" />
              <span>แผนกที่ 2 · PKFLOW PRO FILM Studio (Chat 9b806395 + FlowKit Director)</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              สตูดิโอกำกับหนังสั้น & ละครสั้น AI (3-Act Storyboard & Character Lock)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              วางโครงเรื่อง 3 องก์ ล็อกหน้าตาและชุดตัวละครให้เหมือนกันทุกฉาก (Character Consistency) เลือกมุมกล้องระดับฮอลลีวูด และส่งเข้า Google Flow ได้ในคลิกเดียว
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start">
            {FILM_PRESETS.map((preset) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => handleLoadFilmPreset(preset)}
                className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-zinc-800 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-zinc-700 text-xs font-bold cursor-pointer"
              >
                🎬 โหลดตัวอย่าง: {preset.title.slice(0, 26)}...
              </button>
            ))}
          </div>
        </div>

        {/* Film Bible Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                ชื่อเรื่องหนังสั้น / ละครสั้น *
              </label>
              <input
                type="text"
                value={filmTitle}
                onChange={(e) => setFilmTitle(e.target.value)}
                placeholder="เช่น ก๋วยเตี๋ยวชามสุดท้ายของพ่อ, ประธานบริษัทปลอมตัว..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                โครงเรื่องย่อ (Plot / Logline — จุดเริ่มต้น จุดพลิกผัน และตอนจบ)
              </label>
              <textarea
                rows={2}
                value={logline}
                onChange={(e) => setLogline(e.target.value)}
                placeholder="บรรยายเหตุการณ์สำคัญของเรื่อง..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Visual Style (Material) & Aspect Ratio */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                สไตล์ภาพหลัก (Visual Material Lock)
              </label>
              <select
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                {MATERIAL_STYLES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as "9:16" | "16:9")}
                className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
              >
                <option value="9:16">📱 9:16 ละครสั้นแนวตั้ง</option>
                <option value="16:9">🖥️ 16:9 ภาพยนตร์แนวนอน</option>
              </select>
              <select
                value={sceneCount}
                onChange={(e) => setSceneCount(Number(e.target.value))}
                className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
              >
                <option value={6}>6 ฉาก (3 องก์กระชับ)</option>
                <option value={8}>8 ฉาก (มาตรฐาน)</option>
                <option value={12}>12 ฉาก (หนังสั้นเต็มเรื่อง)</option>
              </select>
            </div>

            <button
              type="button"
              disabled={generating}
              onClick={handleGenerateShortFilm}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังเขียนบท 3 องก์ & ล็อกตัวละคร...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>สร้างบทหนังสั้น & สตอรี่บอร์ด 3 องก์</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Character Consistency Studio (/fk-gen-refs) */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                ระบบคุมหน้าตาและชุดตัวละคร (Character Consistency Entities)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                ระบุหน้าตาและชุดเริ่มต้นชุดเดียว ระบบจะส่ง Prompt ล็อกตัวละครเข้าทุกฉากเพื่อไม่ให้หน้าตัวละครเปลี่ยนไปมา
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddCharacter}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มตัวละคร</span>
            </button>
            {payload && (
              <button
                type="button"
                onClick={handleApplyCharacterLockToAllScenes}
                className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>อัปเดตล็อกหน้าตัวละครเข้าทุกฉาก</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {characters.map((char) => (
            <div
              key={char.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex gap-3"
            >
              {/* Character Portrait Preview */}
              <div className="w-24 shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-24 h-32 rounded-lg bg-slate-200 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 overflow-hidden flex items-center justify-center">
                  {char.imageUrl ? (
                    <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-7 h-7 text-slate-400" />
                  )}
                </div>
                <button
                  type="button"
                  disabled={charImgBusy === char.id}
                  onClick={() => handleGenerateCharacterPortrait(char)}
                  className="w-full py-1 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[10px] font-bold text-amber-700 dark:text-amber-300 cursor-pointer"
                >
                  {charImgBusy === char.id ? "กำลังวาด..." : "✨ เจนรูป Ref"}
                </button>
              </div>

              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => handleUpdateCharacter(char.id, "name", e.target.value)}
                    className="flex-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-extrabold"
                    placeholder="ชื่อตัวละคร"
                  />
                  {characters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setCharacters((prev) => prev.filter((c) => c.id !== char.id))}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={char.appearanceThai}
                  onChange={(e) => handleUpdateCharacter(char.id, "appearanceThai", e.target.value)}
                  placeholder="ลักษณะรูปร่างหน้าตาและชุดประจำตัว (ภาษาไทย)..."
                  className="w-full p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs"
                />
                <input
                  type="text"
                  value={char.characterSheetPromptEn}
                  onChange={(e) => handleUpdateCharacter(char.id, "characterSheetPromptEn", e.target.value)}
                  placeholder="English Character Identity Lock Prompt..."
                  className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] font-mono text-slate-600 dark:text-zinc-300"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Short Film Storyboard */}
      {payload && (
        <section className="space-y-4 animate-fade-in-up">
          <DepartmentHandoffBar currentDeptId="short-film" payload={payload} />

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  PKFLOW 3-ACT FILM STORYBOARD · {payload.scenes.length} SCENES
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {payload.title}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportFlowJson}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดไฟล์ PKFLOW (.json)</span>
                </button>
                <a
                  href="https://flow.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <span>เปิด Google Flow</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payload.scenes.map((scene) => (
                <div
                  key={scene.sceneNumber}
                  className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-mono text-[11px] font-bold">
                          SCENE {String(scene.sceneNumber).padStart(2, "0")}
                        </span>
                        <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                          {scene.actBadge || "3-Act Story"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{scene.durationSec}s</span>
                    </div>

                    {scene.imageUrl && (
                      <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 bg-black aspect-video">
                        <img src={scene.imageUrl} alt={scene.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Camera Direction Selector (fk-camera-guide) */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-0.5">
                        🎥 เลือกมุมกล้องภาพยนตร์ (FlowKit Camera Guide):
                      </label>
                      <select
                        value={
                          CAMERA_MOVEMENTS.find((c) => c.prompt === scene.motionPromptEn)?.id || "dolly_in"
                        }
                        onChange={(e) => {
                          const found = CAMERA_MOVEMENTS.find((c) => c.id === e.target.value);
                          if (!found) return;
                          const nextScenes = payload.scenes.map((s) =>
                            s.sceneNumber === scene.sceneNumber
                              ? { ...s, motionPromptEn: found.prompt, cameraAngle: found.label }
                              : s
                          );
                          const nextPayload = { ...payload, scenes: nextScenes };
                          setPayload(nextPayload);
                          setActiveHandoff(nextPayload);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-semibold"
                      >
                        {CAMERA_MOVEMENTS.map((cam) => (
                          <option key={cam.id} value={cam.id}>
                            {cam.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dialogue / Voiceover */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-0.5">
                        🎙️ บทพูดตัวละคร / เสียงบรรยายไทย:
                      </label>
                      <textarea
                        rows={2}
                        value={scene.voiceoverThai}
                        onChange={(e) => {
                          const nextScenes = payload.scenes.map((s) =>
                            s.sceneNumber === scene.sceneNumber ? { ...s, voiceoverThai: e.target.value } : s
                          );
                          const nextPayload = { ...payload, scenes: nextScenes };
                          setPayload(nextPayload);
                          setActiveHandoff(nextPayload);
                        }}
                        className="w-full p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs"
                      />
                    </div>

                    {scene.audioUrl && <audio controls src={scene.audioUrl} className="w-full h-8" />}

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-0.5">
                        🎨 Scene Prompt (EN + Character Lock):
                      </label>
                      <textarea
                        rows={3}
                        value={scene.visualPromptEn}
                        onChange={(e) => {
                          const nextScenes = payload.scenes.map((s) =>
                            s.sceneNumber === scene.sceneNumber ? { ...s, visualPromptEn: e.target.value } : s
                          );
                          const nextPayload = { ...payload, scenes: nextScenes };
                          setPayload(nextPayload);
                          setActiveHandoff(nextPayload);
                        }}
                        className="w-full p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={sceneImgBusy === scene.sceneNumber}
                        onClick={async () => {
                          setSceneImgBusy(scene.sceneNumber);
                          try {
                            const res = await fetch("/api/ai/image", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ prompt: scene.visualPromptEn, aspectRatio })
                            });
                            const data = await res.json();
                            if (res.ok && data.imageUrl) {
                              const nextScenes = payload.scenes.map((s) =>
                                s.sceneNumber === scene.sceneNumber ? { ...s, imageUrl: data.imageUrl } : s
                              );
                              const nextPayload = { ...payload, scenes: nextScenes };
                              setPayload(nextPayload);
                              setActiveHandoff(nextPayload);
                            }
                          } finally {
                            setSceneImgBusy(null);
                          }
                        }}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                        <span>{sceneImgBusy === scene.sceneNumber ? "กำลังวาด..." : "เจนภาพฉาก"}</span>
                      </button>

                      <button
                        type="button"
                        disabled={sceneTtsBusy === scene.sceneNumber}
                        onClick={async () => {
                          if (!scene.voiceoverThai.trim()) return;
                          setSceneTtsBusy(scene.sceneNumber);
                          try {
                            const res = await fetch("/api/ai/tts", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                text: scene.voiceoverThai,
                                voiceId: "pNInz6obpgDQGcFmaJgB",
                                mode: "generate_single"
                              })
                            });
                            const data = await res.json();
                            if (res.ok && data.audioBase64) {
                              const nextScenes = payload.scenes.map((s) =>
                                s.sceneNumber === scene.sceneNumber
                                  ? { ...s, audioUrl: `data:audio/mpeg;base64,${data.audioBase64}` }
                                  : s
                              );
                              const nextPayload = { ...payload, scenes: nextScenes };
                              setPayload(nextPayload);
                              setActiveHandoff(nextPayload);
                            }
                          } finally {
                            setSceneTtsBusy(null);
                          }
                        }}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{sceneTtsBusy === scene.sceneNumber ? "รอ..." : "พากย์บท"}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${scene.visualPromptEn}\nMotion: ${scene.motionPromptEn}`);
                        setCopiedId(`film-scene-${scene.sceneNumber}`);
                        showToast(`ก๊อป Prompt ฉากที่ ${scene.sceneNumber} แล้ว!`, "success");
                        setTimeout(() => setCopiedId(null), 1800);
                      }}
                      className="min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-amber-600 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === `film-scene-${scene.sceneNumber}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>ก๊อป Prompt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
