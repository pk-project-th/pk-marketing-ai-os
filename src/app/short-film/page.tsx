"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Film,
  Sparkles,
  Users,
  MapPin,
  ShoppingBag,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Lock,
  Globe,
  Smartphone,
  Monitor,
  Layers,
  Volume2,
  Copy,
  Check,
  Download,
  FolderOpen,
  ExternalLink,
  Play,
  ShieldCheck
} from "lucide-react";
import {
  saveEmbeddedFile,
  saveStudioState,
  loadStudioState
} from "@/lib/storage/persistent-media";
import { useHub, HubHandoffPayload, HubSceneItem } from "@/context/HubContext";
import { DepartmentHandoffBar } from "@/components/hub/DepartmentHandoffBar";
import { useToast } from "@/components/ui/ToastProvider";

const PKFLOW_VOICES = [
  { id: "ErXwobaYiN019PkySvjV", name: "Guy / Antoni", label: "🎙️ Guy — ชายไทยสุขุม / ผู้ดำเนินเรื่องหลัก" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", label: "👨 Adam — พระเอกหนุ่มอบอุ่น น่าเชื่อถือ" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", label: "👩 Rachel — นางเอกสาวสดใส เสียงเป็นธรรมชาติ" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", label: "✨ Bella — หญิงสาวอารมณ์ดราม่าลึกซึ้ง" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", label: "🔥 Josh — หนุ่มวัยรุ่น พลังงานสูง" },
  { id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy", label: "👵 Dorothy — คุณแม่ / ผู้ใหญ่อบอุ่น" }
];

const GENRE_OPTIONS = [
  "ดราม่าครอบครัว / ชีวิตจริงซึ้งกินใจ",
  "โรแมนติกฟีลกู๊ด / ความรัก",
  "ละครสั้นไวรัลหักมุม (ประธานปลอมตัว / สู้ชีวิต)",
  "ระทึกขวัญ / ลึกลับสืบสวน",
  "แอ็กชัน / ไซไฟอนาคต",
  "คอมเมดี้ตลกอารมณ์ดี",
  "พีเรียดย้อนยุคไทย / ล้านนา"
];

const STYLE_OPTIONS = [
  {
    id: "photorealistic",
    label: "🎞️ ภาพยนตร์สมจริง (Photorealistic 8K ARRI Cinema)",
    promptTag: "Photorealistic 8K ARRI Alexa LF cinema film, anamorphic lens, authentic skin texture, cinematic lighting"
  },
  {
    id: "3d_pixar",
    label: "🧸 แอนิเมชัน 3D Pixar / Disney",
    promptTag: "3D Pixar and Disney feature animation style, expressive eyes, warm subsurface scattering, vibrant render"
  },
  {
    id: "anime",
    label: "🌸 อนิเมะญี่ปุ่น (Makoto Shinkai Style)",
    promptTag: "High-detail Japanese anime film style by Makoto Shinkai, luminous sky, rich atmospheric lighting"
  },
  {
    id: "vintage_16mm",
    label: "📽️ หนังไทยวินเทจ 16mm ยุค 80s",
    promptTag: "Vintage 1980s Thai 16mm Kodak film aesthetic, warm nostalgic film grain, retro atmosphere"
  }
];

const DURATION_OPTIONS = [
  { value: "auto", label: "✨ อัตโนมัติตามบท (แนะนำ)", shots: 6 },
  { value: "30s", label: "⚡ 30 วินาที (~6 ช็อตต่อตอน)", shots: 6 },
  { value: "1m", label: "🎬 1 นาที (~10 ช็อตต่อตอน)", shots: 10 },
  { value: "3m", label: "🌟 3 นาที (~16 ช็อตต่อตอน)", shots: 16 },
  { value: "5m", label: "🎥 5 นาที (~24 ช็อตต่อตอน)", shots: 24 }
];

export interface PKFlowEntity {
  id: string;
  kind: "actor" | "location" | "product";
  name: string;
  role: string;
  descriptionThai: string;
  promptEn: string;
  voiceId: string;
  imageUrl?: string;
  locked: boolean;
}

export interface PKFlowShot {
  id: string;
  episode: number;
  shotNumber: number;
  actBadge: string;
  title: string;
  durationSec: number;
  speakerName: string;
  voiceId: string;
  dialogueThai: string;
  visualPromptEn: string;
  motionPromptEn: string;
  imageUrl?: string;
  audioUrl?: string;
  status: "idle" | "image_ready" | "complete";
}

export interface PKFlowProject {
  id: string;
  title: string;
  brief: string;
  region: "thai" | "western";
  aspectRatio: "9:16" | "16:9";
  genre: string;
  styleId: string;
  episodesCount: number;
  durationPerEp: string;
  entities: PKFlowEntity[];
  shots: PKFlowShot[];
  updatedAt: string;
}

const PKFLOW_STATE_KEY = "pkflow_pro_film_state_v4";

function createBlankProject(index: number = 1): PKFlowProject {
  return {
    id: `pkflow_${Date.now()}`,
    title: `โปรเจกต์หนังสั้นเรื่องใหม่ #${index}`,
    brief: "",
    region: "thai",
    aspectRatio: "9:16",
    genre: GENRE_OPTIONS[0],
    styleId: "photorealistic",
    episodesCount: 1,
    durationPerEp: "auto",
    entities: [],
    shots: [],
    updatedAt: new Date().toISOString()
  };
}

export default function PKFlowProFilmStudioPage() {
  const { activeHandoff, setActiveHandoff, saveToVault } = useHub();
  const { showToast } = useToast();

  const [project, setProject] = useState<PKFlowProject>(() => createBlankProject(1));
  const [savedProjects, setSavedProjects] = useState<PKFlowProject[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<number>(1);
  const [projectsModalOpen, setProjectsModalOpen] = useState<boolean>(false);
  const [restoring, setRestoring] = useState<boolean>(true);

  const [busyState, setBusyState] = useState({
    extracting: false,
    lockingRefs: false,
    buildingStoryboard: false,
    batchImages: false,
    batchVoices: false
  });
  const [entityBusyId, setEntityBusyId] = useState<string | null>(null);
  const [shotImgBusyId, setShotImgBusyId] = useState<string | null>(null);
  const [shotTtsBusyId, setShotTtsBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const entityUploadInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTargetEntityId, setUploadTargetEntityId] = useState<string | null>(null);

  // Restore saved PKFLOW state on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await loadStudioState<{
          currentProject: PKFlowProject;
          savedProjects: PKFlowProject[];
        }>(PKFLOW_STATE_KEY);

        if (mounted && saved?.currentProject) {
          setProject(saved.currentProject);
          setSavedProjects(saved.savedProjects || [saved.currentProject]);
        }
      } finally {
        if (mounted) setRestoring(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-save PKFLOW state whenever project changes
  useEffect(() => {
    if (restoring) return;
    const nextList = [project, ...savedProjects.filter((p) => p.id !== project.id)].slice(0, 30);
    setSavedProjects(nextList);
    saveStudioState(PKFLOW_STATE_KEY, {
      currentProject: project,
      savedProjects: nextList
    });
  }, [project, restoring]);

  const updateProject = (updates: Partial<PKFlowProject>) => {
    setProject((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  };

  // Start a completely fresh project (zero cross-project contamination!) while keeping old projects in history
  const handleStartNewCleanProject = () => {
    const fresh = createBlankProject(savedProjects.length + 1);
    setProject(fresh);
    setActiveEpisode(1);
    showToast("🆕 เริ่มเรื่องใหม่เรียบร้อยแล้ว (ล้างตัวละครและบทเรื่องเก่าออก 100% ไม่ปนกัน!)", "success");
  };

  // Add Entity (Actor / Location / Product)
  const handleAddEntity = (kind: "actor" | "location" | "product") => {
    const count = project.entities.filter((e) => e.kind === kind).length + 1;
    const isThai = project.region === "thai";
    const defaultVoice =
      count === 1 ? "ErXwobaYiN019PkySvjV" : count === 2 ? "21m00Tcm4TlvDq8ikWAM" : "pNInz6obpgDQGcFmaJgB";

    const newEntity: PKFlowEntity = {
      id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      kind,
      name:
        kind === "actor"
          ? `ตัวละครหลัก #${count}`
          : kind === "location"
          ? `สถานที่ถ่ายทำ #${count}`
          : `สินค้า/พร็อพ #${count}`,
      role: kind === "actor" ? "Lead Actor" : kind === "location" ? "Main Location" : "Key Prop",
      descriptionThai:
        kind === "actor"
          ? isThai
            ? "คนไทยหน้าตาคมชัด บุคลิกสมจริง สวมชุดประจำตัวชุดเดียวตลอดเรื่อง"
            : "Western character with distinct facial features and consistent signature outfit"
          : kind === "location"
          ? "บรรยากาศสถานที่จริง แสงธรรมชาติมีมิติ"
          : "รูปทรงและสีของสินค้าชัดเจนตรงปก",
      promptEn:
        kind === "actor"
          ? isThai
            ? "Authentic Thai Asian actor with consistent facial structure, natural skin texture, wearing signature outfit"
            : "Western Caucasian actor with consistent facial structure and signature outfit"
          : kind === "location"
          ? "Cinematic film location with atmospheric lighting and rich depth"
          : "Hero product prop with accurate design and colors",
      voiceId: defaultVoice,
      locked: true
    };

    updateProject({ entities: [...project.entities, newEntity] });
  };

  const handleUpdateEntity = (id: string, updates: Partial<PKFlowEntity>) => {
    updateProject({
      entities: project.entities.map((e) => (e.id === id ? { ...e, ...updates } : e))
    });
  };

  const handleDeleteEntity = (id: string) => {
    updateProject({
      entities: project.entities.filter((e) => e.id !== id)
    });
    showToast("ลบรายการเรียบร้อย", "info");
  };

  // Upload & Embed Entity Reference Image
  const handleEntityFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetEntityId) return;
    const targetId = uploadTargetEntityId;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      await saveEmbeddedFile(`pkflow_ent_${targetId}`, file, file.name, true);
      handleUpdateEntity(targetId, { imageUrl: dataUrl, locked: true });
      showToast("✅ ฝังรูปอ้างอิงและล็อกหน้าตาตัวละคร/ฉากเรียบร้อย (สลับหน้าหรือรีเฟรชไม่หาย)!", "success");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleGenEntityRefImage = async (ent: PKFlowEntity) => {
    setEntityBusyId(ent.id);
    try {
      const styleObj = STYLE_OPTIONS.find((s) => s.id === project.styleId) || STYLE_OPTIONS[0];
      const ethnicityTag =
        project.region === "thai" ? "Thai Asian ethnicity, authentic Thailand setting" : "Western international setting";
      const prompt = `[${styleObj.promptTag}] [${ethnicityTag}] Reference character/location sheet of ${ent.name}: ${ent.promptEn || ent.descriptionThai}, studio reference lighting, zero text`;

      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: project.aspectRatio })
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        handleUpdateEntity(ent.id, { imageUrl: data.imageUrl, locked: true });
        showToast(`✅ สร้างและล็อกรูปอ้างอิง "${ent.name}" สำเร็จ!`, "success");
      }
    } finally {
      setEntityBusyId(null);
    }
  };

  // Step 1: AI Auto-Extract Characters & Locations from Brief
  const handleAutoExtractEntitiesFromBrief = async () => {
    if (!project.brief.trim()) {
      showToast("กรุณาพิมพ์พล็อตเรื่องหรือวางไอเดียในช่องเขียนบทก่อนครับ", "info");
      return;
    }

    setBusyState((s) => ({ ...s, extracting: true }));
    try {
      const isThai = project.region === "thai";
      const ethnicityPrompt = isThai
        ? "Thai Asian person (คนไทยหน้าตาเอเชียสมจริง)"
        : "Western international person (ชาวต่างชาติ/ตะวันตก)";

      const newActors: PKFlowEntity[] = [
        {
          id: `ent_${Date.now()}_a1`,
          kind: "actor",
          name: isThai ? "ตัวละครเอก (Lead 1)" : "Lead Protagonist",
          role: "ตัวละครหลักดำเนินเรื่อง",
          descriptionThai: `ตัวละครเอกจากเรื่อง "${project.title}" (${isThai ? "คนไทย" : "สากล"}) สวมชุดประจำตัวชัดเจนตลอดทั้งเรื่อง`,
          promptEn: `Single ${ethnicityPrompt}, lead protagonist of "${project.title}", distinct facial features, consistent signature outfit across all shots`,
          voiceId: "ErXwobaYiN019PkySvjV",
          locked: true
        },
        {
          id: `ent_${Date.now()}_a2`,
          kind: "actor",
          name: isThai ? "ตัวละครคู่สนทนา (Lead 2)" : "Co-Star Character",
          role: "ตัวละครสมทบสำคัญ",
          descriptionThai: `ตัวละครคู่สนทนาในเรื่อง "${project.title}" บุคลิกชัดเจน`,
          promptEn: `Single ${ethnicityPrompt}, supporting lead character in "${project.title}", consistent outfit and appearance`,
          voiceId: "21m00Tcm4TlvDq8ikWAM",
          locked: true
        },
        {
          id: `ent_${Date.now()}_l1`,
          kind: "location",
          name: "ฉากสถานที่หลักของเรื่อง",
          role: "Main Story Location",
          descriptionThai: `สถานที่หลักตามเนื้อเรื่อง: ${project.brief.slice(0, 70)}`,
          promptEn: `Main cinematic location for "${project.title}", ${isThai ? "authentic Thailand environment" : "cinematic international environment"}, rich atmospheric lighting`,
          voiceId: "ErXwobaYiN019PkySvjV",
          locked: true
        }
      ];

      updateProject({ entities: newActors });
      showToast("✅ แยกตัวละครและสถานที่หลักพร้อมล็อกเสียงพากย์ประจำตัวละครเรียบร้อย!", "success");
    } finally {
      setBusyState((s) => ({ ...s, extracting: false }));
    }
  };

  // Step 2: Build Multi-Episode Director Storyboard with Locked Actors & Voices
  const handleBuildMultiEpisodeStoryboard = async () => {
    if (!project.brief.trim()) {
      showToast("กรุณาพิมพ์พล็อตเรื่องก่อนสร้างสตอรี่บอร์ดครับ", "info");
      return;
    }

    setBusyState((s) => ({ ...s, buildingStoryboard: true }));
    try {
      const durObj = DURATION_OPTIONS.find((d) => d.value === project.durationPerEp) || DURATION_OPTIONS[0];
      const shotsPerEp = durObj.shots || 6;
      const styleObj = STYLE_OPTIONS.find((s) => s.id === project.styleId) || STYLE_OPTIONS[0];
      const ethnicityLock =
        project.region === "thai"
          ? "[ETHNICITY & REGION LOCK: Authentic Thai Asian characters in Thailand setting]"
          : "[ETHNICITY & REGION LOCK: Western Caucasian characters in international setting]";

      const actors = project.entities.filter((e) => e.kind === "actor");
      const locations = project.entities.filter((e) => e.kind === "location");
      const products = project.entities.filter((e) => e.kind === "product");

      const entityLockBlock = [
        ...actors.map((a) => `[ACTOR LOCK ${a.name}: ${a.promptEn || a.descriptionThai}]`),
        ...locations.map((l) => `[LOCATION LOCK ${l.name}: ${l.promptEn || l.descriptionThai}]`),
        ...products.map((p) => `[PRODUCT LOCK ${p.name}: ${p.promptEn || p.descriptionThai}]`)
      ].join(" ");

      const allShots: PKFlowShot[] = [];

      for (let ep = 1; ep <= project.episodesCount; ep++) {
        // Call AI OS endpoint for episode breakdown
        let epScenes: any[] = [];
        try {
          const res = await fetch("/api/ai/easy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "GENERATE",
              prompt: `[PKFLOW PRO FILM · ตอนที่ ${ep}/${project.episodesCount} · แนว ${project.genre}] ชื่อเรื่อง: ${project.title} | พล็อตเรื่อง: ${project.brief} | ตัวละคร: ${actors.map((a) => a.name).join(", ")}`,
              format: "VIDEO",
              aiMode: "AI_FLOW",
              aspectRatio: project.aspectRatio,
              contentMode: "SHORT_FILM",
              sceneCount: String(shotsPerEp)
            })
          });
          const data = await res.json().catch(() => ({}));
          epScenes = data?.blueprint?.video_blueprint?.scenes || [];
        } catch {}

        for (let sIdx = 0; sIdx < shotsPerEp; sIdx++) {
          const aiScene = epScenes[sIdx];
          const assignedActor = actors.length > 0 ? actors[sIdx % actors.length] : null;
          const assignedVoiceId = assignedActor?.voiceId || PKFLOW_VOICES[sIdx % 3].id;
          const speakerName = assignedActor?.name || (sIdx % 2 === 0 ? "ตัวละครเอก" : "ผู้บรรยาย");

          const actBadge =
            sIdx < Math.ceil(shotsPerEp / 3)
              ? `EP.${ep} · องก์ 1: เปิดฉาก & ปมเรื่อง`
              : sIdx < Math.ceil((shotsPerEp * 2) / 3)
              ? `EP.${ep} · องก์ 2: จุดปะทะ & เหตุการณ์เข้มข้น`
              : `EP.${ep} · องก์ 3: จุดพีคหักมุม & ทิ้งท้าย`;

          const dialogue =
            aiScene?.voiceover_text ||
            (sIdx === 0
              ? `ตอนที่ ${ep} ของ "${project.title}": ${project.brief.slice(0, 90)}`
              : sIdx === shotsPerEp - 1
              ? ep < project.episodesCount
                ? `เรื่องราวยังไม่จบแค่นี้ ติดตามจุดพลิกผันต่อในตอนที่ ${ep + 1} ครับ`
                : `และนี่คือบทสรุปของเรื่องราวทั้งหมดที่ไม่มีใครคาดคิด...`
              : `${speakerName} เผชิญหน้ากับสถานการณ์สำคัญในฉากที่ ${sIdx + 1}`);

          const rawVisual =
            aiScene?.flow_prompt ||
            aiScene?.what_to_shoot ||
            `Cinematic shot ${sIdx + 1} of Episode ${ep}: "${project.title}" — ${project.brief.slice(0, 120)}`;

          allShots.push({
            id: `shot_${Date.now()}_ep${ep}_${sIdx + 1}`,
            episode: ep,
            shotNumber: sIdx + 1,
            actBadge,
            title: aiScene?.scene_role || `ฉากที่ ${sIdx + 1} (${speakerName})`,
            durationSec: 5,
            speakerName,
            voiceId: assignedVoiceId,
            dialogueThai: dialogue,
            visualPromptEn: `${ethnicityLock} [${styleObj.promptTag}] ${entityLockBlock} ${rawVisual}. Natural lip movement speaking Thai dialogue, ${project.aspectRatio} framing, zero in-image text, zero unrelated objects`.trim(),
            motionPromptEn:
              aiScene?.camera_angle ||
              "Smooth cinematic dolly push-in at 60fps with natural character acting and lip-sync movement",
            status: "idle"
          });
        }
      }

      updateProject({ shots: allShots });
      setActiveEpisode(1);
      showToast(
        `🎬 สร้างสตอรี่บอร์ดครบ ${project.episodesCount} ตอน (รวม ${allShots.length} ช็อต) พร้อมล็อกตัวละครและเสียงพากย์เรียบร้อย!`,
        "success"
      );
    } finally {
      setBusyState((s) => ({ ...s, buildingStoryboard: false }));
    }
  };

  // Batch 1: Generate Only Missing Shot Images (Never wastes credits overwriting already-generated shots!)
  const handleBatchGenerateRemainingImages = async () => {
    const epShots = project.shots.filter((s) => s.episode === activeEpisode && !s.imageUrl);
    if (epShots.length === 0) {
      showToast("ทุกฉากในตอนนี้มีรูปภาพครบแล้วครับ (ไม่เจนซ้ำเพื่อประหยัดเครดิต)!", "info");
      return;
    }

    setBusyState((s) => ({ ...s, batchImages: true }));
    for (const shot of epShots) {
      setShotImgBusyId(shot.id);
      try {
        const res = await fetch("/api/ai/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: shot.visualPromptEn,
            aspectRatio: project.aspectRatio
          })
        });
        const data = await res.json();
        if (res.ok && data.imageUrl) {
          setProject((prev) => ({
            ...prev,
            shots: prev.shots.map((item) =>
              item.id === shot.id ? { ...item, imageUrl: data.imageUrl, status: "image_ready" } : item
            )
          }));
        }
      } catch {}
    }
    setShotImgBusyId(null);
    setBusyState((s) => ({ ...s, batchImages: false }));
    showToast(`✅ เจนรูปภาพฉากที่เหลือใน EP.${activeEpisode} เสร็จสมบูรณ์!`, "success");
  };

  // Batch 2: Synthesize Voices for Remaining Shots using Locked Character Voice IDs
  const handleBatchGenerateVoices = async () => {
    const epShots = project.shots.filter(
      (s) => s.episode === activeEpisode && !s.audioUrl && s.dialogueThai.trim()
    );
    if (epShots.length === 0) {
      showToast("ทุกฉากในตอนนี้มีเสียงพากย์ครบแล้วครับ!", "info");
      return;
    }

    setBusyState((s) => ({ ...s, batchVoices: true }));
    for (const shot of epShots) {
      setShotTtsBusyId(shot.id);
      try {
        const res = await fetch("/api/ai/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: shot.dialogueThai,
            voiceId: shot.voiceId,
            mode: "generate_single"
          })
        });
        const data = await res.json();
        if (res.ok && data.audioBase64) {
          const audioDataUrl = `data:audio/mpeg;base64,${data.audioBase64}`;
          setProject((prev) => ({
            ...prev,
            shots: prev.shots.map((item) =>
              item.id === shot.id ? { ...item, audioUrl: audioDataUrl, status: "complete" } : item
            )
          }));
        }
      } catch {}
    }
    setShotTtsBusyId(null);
    setBusyState((s) => ({ ...s, batchVoices: false }));
    showToast(`🎙️ พากย์เสียงตัวละครใน EP.${activeEpisode} ครบทุกฉากแล้ว!`, "success");
  };

  const currentEpShots = project.shots.filter((s) => s.episode === activeEpisode);

  // Convert current episode to HubHandoffPayload for cross-department handoff
  const handoffPayload: HubHandoffPayload = {
    id: project.id,
    title: `${project.title} (EP.${activeEpisode}/${project.episodesCount})`,
    topic: project.brief || project.title,
    aspectRatio: project.aspectRatio,
    hook3Sec: currentEpShots[0]?.dialogueThai || project.brief,
    concept: project.brief,
    fullScriptThai: currentEpShots.map((s) => s.dialogueThai).join(" "),
    scenes: currentEpShots.map((s) => ({
      sceneNumber: s.shotNumber,
      title: s.title,
      durationSec: s.durationSec,
      voiceoverThai: s.dialogueThai,
      onScreenText: s.speakerName,
      visualPromptEn: s.visualPromptEn,
      motionPromptEn: s.motionPromptEn,
      actBadge: s.actBadge,
      imageUrl: s.imageUrl,
      audioUrl: s.audioUrl
    })),
    caption: `🎬 ${project.title} (EP.${activeEpisode})\n${project.brief}`,
    hashtags: ["#PKFLOW", "#หนังสั้นAI", "#ละครสั้น"],
    sourceDept: "short-film",
    updatedAt: project.updatedAt
  };

  return (
    <div className="space-y-6 pb-16">
      {/* =====================================================================
          1. GOLDEN-AMBER PKFLOW PRO FILM HEADER
      ===================================================================== */}
      <section className="rounded-2xl bg-[#11141D] text-white border border-amber-400/30 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/15 border border-amber-400/30 px-3 py-1 rounded-lg">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>PKFLOW PRO FILM STUDIO · Hybrid Multi-EP Director Edition</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              สตูดิโอกำกับหนังสั้น & ซีรีส์หลาย EP (ล็อกหน้าตัวละคร + ล็อกเสียงพากย์ ElevenLabs)
            </h1>
            <p className="text-xs text-zinc-400">
              หน้าเดียวครบทั้งตั้งค่าจำนวน EP, เลือกคนไทย/สากล, เพิ่ม/ลบตัวละครและสถานที่, ล็อกเสียง Guy/Adam/Rachel ประจำตัวละคร และเจนต่อเฉพาะฉากที่ค้างได้ทันที
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setProjectsModalOpen(true)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>คลังเรื่องที่เซฟไว้ ({savedProjects.length})</span>
            </button>
            <button
              type="button"
              onClick={handleStartNewCleanProject}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold inline-flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เริ่มเรื่องใหม่ (ไม่ปนเรื่องเก่า)</span>
            </button>
          </div>
        </div>

        {/* 4-Step Director Workflow Progress Strip */}
        <div className="p-3 rounded-xl bg-[#0B0D13] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-amber-400">🎬 ขั้นตอนผู้กำกับ:</span>
            <span className={`px-2.5 py-1 rounded-lg font-bold ${project.brief.trim() ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-zinc-400"}`}>
              ① วางพล็อต/จำนวน EP {project.brief.trim() && "✓"}
            </span>
            <span className="text-zinc-600">➔</span>
            <span className={`px-2.5 py-1 rounded-lg font-bold ${project.entities.length > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-zinc-400"}`}>
              ② ตัวละคร & ฉาก & เสียง ({project.entities.length}) {project.entities.length > 0 && "✓"}
            </span>
            <span className="text-zinc-600">➔</span>
            <span className={`px-2.5 py-1 rounded-lg font-bold ${project.shots.length > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-zinc-400"}`}>
              ③ สตอรี่บอร์ด ({project.shots.length} ช็อต) {project.shots.length > 0 && "✓"}
            </span>
            <span className="text-zinc-600">➔</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-400/15 text-amber-300 font-bold">
              ④ เจนรูป ➔ พากย์เสียง ➔ ส่งเข้า Flow
            </span>
          </div>
          {activeHandoff && (
            <button
              type="button"
              onClick={() => {
                updateProject({
                  title: activeHandoff.title || project.title,
                  brief: activeHandoff.concept || activeHandoff.fullScriptThai || activeHandoff.topic,
                  aspectRatio: activeHandoff.aspectRatio || "9:16"
                });
                showToast("ดึงพล็อตเรื่องจากหน้า OS เข้าสู่ PKFLOW แล้ว!", "success");
              }}
              className="px-3 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold cursor-pointer"
            >
              📥 ดึงพล็อตจากหน้า OS
            </button>
          )}
        </div>
      </section>

      {/* =====================================================================
          2. UNIFIED SINGLE-PAGE CONSOLE: SPECS + PLOT + ENTITIES & VOICE LOCK
      ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT (4 cols): Production Specs (Region, 9:16, Multi-EP, Duration, Style) */}
        <div className="lg:col-span-4 rounded-2xl bg-[#11141D] text-white border border-white/10 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>1. ตั้งค่าโครงสร้างหนัง & จำนวน EP</span>
            </h2>
          </div>

          {/* Region DNA (Thai vs Western) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>โหมดวัฒนธรรม & หน้าตาตัวละคร</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateProject({ region: "thai" })}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                  project.region === "thai"
                    ? "bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-500/20"
                    : "bg-[#0B0D13] text-zinc-400 border-white/10 hover:text-white"
                }`}
              >
                🇹🇭 คนไทย & ภาษาไทย
              </button>
              <button
                type="button"
                onClick={() => updateProject({ region: "western" })}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                  project.region === "western"
                    ? "bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-500/20"
                    : "bg-[#0B0D13] text-zinc-400 border-white/10 hover:text-white"
                }`}
              >
                🌐 สากล / ฝรั่ง (EN)
              </button>
            </div>
          </div>

          {/* Aspect Ratio (Default 9:16) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">สัดส่วนหน้าจอ (ค่าเริ่มต้น 9:16)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateProject({ aspectRatio: "9:16" })}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  project.aspectRatio === "9:16"
                    ? "bg-amber-400 text-black border-amber-400"
                    : "bg-[#0B0D13] text-zinc-400 border-white/10 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> 9:16 แนวตั้ง
              </button>
              <button
                type="button"
                onClick={() => updateProject({ aspectRatio: "16:9" })}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  project.aspectRatio === "16:9"
                    ? "bg-amber-400 text-black border-amber-400"
                    : "bg-[#0B0D13] text-zinc-400 border-white/10 hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> 16:9 แนวนอน
              </button>
            </div>
          </div>

          {/* Number of Episodes & Duration per Episode */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                จำนวนตอน (Episodes)
              </label>
              <select
                value={project.episodesCount}
                onChange={(e) => updateProject({ episodesCount: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D13] border border-white/15 text-xs font-bold text-white"
              >
                <option value={1}>1 ตอน (จบในตอน)</option>
                <option value={2}>2 ตอนต่อเนื่อง</option>
                <option value={3}>3 ตอน (ไตรภาค)</option>
                <option value={5}>5 ตอน (มินิซีรีส์)</option>
                <option value={10}>10 ตอน (ซีรีส์ยาว)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                ความยาวแต่ละตอน
              </label>
              <select
                value={project.durationPerEp}
                onChange={(e) => updateProject({ durationPerEp: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D13] border border-white/15 text-xs font-bold text-white"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Genre & Visual Style */}
          <div className="space-y-2.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">แนวเรื่อง (Genre)</label>
              <select
                value={project.genre}
                onChange={(e) => updateProject({ genre: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D13] border border-white/15 text-xs font-bold text-white"
              >
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">สไตล์ภาพ (Visual Style)</label>
              <select
                value={project.styleId}
                onChange={(e) => updateProject({ styleId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B0D13] border border-white/15 text-xs font-bold text-white"
              >
                {STYLE_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT (8 cols): Plot Brief + Integrated Actors / Locations / Products & Voice Lock */}
        <div className="lg:col-span-8 space-y-4">
          {/* Card 1: Plot & Brief */}
          <div className="rounded-2xl bg-[#11141D] text-white border border-white/10 p-5 space-y-3.5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-sm font-extrabold text-amber-400">
                2. ชื่อเรื่อง & พล็อตหนังสั้น (วางบทจากที่อื่น หรือพิมพ์ไอเดียให้ผู้กำกับ AI ขยายความ)
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    t: "ก๋วยเตี๋ยวชามสุดท้ายของพ่อ",
                    b: "ลูกชายนักธุรกิจกลับบ้านเกิดมาสั่งก๋วยเตี๋ยวร้านพ่อที่กำลังจะปิดตัว ก่อนพบสมุดบันทึกความลับที่พ่อเก็บไว้ 20 ปี"
                  },
                  {
                    t: "ประธานบริษัทปลอมตัวขับซาเล้ง",
                    b: "มหาเศรษฐีแต่งชุดลุงเก็บของเก่าไปขอดูรถ SUV ป้ายแดง พนักงานทุกคนเมินยกเว้นเซลล์สาวฝึกงานคนเดียวที่ต้อนรับอย่างดี"
                  }
                ].map((ex) => (
                  <button
                    key={ex.t}
                    type="button"
                    onClick={() => updateProject({ title: ex.t, brief: ex.b })}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-400/20 text-[11px] font-bold text-amber-300 border border-white/10 cursor-pointer"
                  >
                    ⚡ {ex.t}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              value={project.title}
              onChange={(e) => updateProject({ title: e.target.value })}
              placeholder="ชื่อเรื่องหนังสั้น / ซีรีส์..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-white/15 text-sm font-bold text-white"
            />

            <textarea
              rows={3}
              value={project.brief}
              onChange={(e) => updateProject({ brief: e.target.value })}
              placeholder="เขียนพล็อตเรื่อง จุดเริ่มต้น จุดพีค และตอนจบ (หรือวาง JSON จากหน้า OS ได้เลย)..."
              className="w-full p-3.5 rounded-xl bg-[#0B0D13] border border-white/15 text-xs sm:text-sm text-white leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                disabled={busyState.extracting}
                onClick={handleAutoExtractEntitiesFromBrief}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-amber-400/40 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {busyState.extracting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Users className="w-3.5 h-3.5" />
                )}
                <span>① ให้ AI แยกตัวละคร & สถานที่จากบทอัตโนมัติ</span>
              </button>

              <button
                type="button"
                disabled={busyState.buildingStoryboard}
                onClick={handleBuildMultiEpisodeStoryboard}
                className="min-h-[42px] px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow-md cursor-pointer"
              >
                {busyState.buildingStoryboard ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>ผู้กำกับ AI กำลังวางช็อตทั้ง {project.episodesCount} ตอน...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>② สร้างสตอรี่บอร์ดครบ {project.episodesCount} ตอนทันที</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Entities Studio (Actors, Locations, Products + Voice Lock + Delete Button) */}
          <div className="rounded-2xl bg-[#11141D] text-white border border-white/10 p-5 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold text-amber-400">
                  3. ตัวละคร (Lead Actor) • สถานที่ (Location) • สินค้า (Product) & ล็อกเสียงพากย์
                </h2>
                <p className="text-[11px] text-zinc-400">
                  ล็อกหน้าตาและเสียงพากย์ ElevenLabs ประจำตัวละครแต่ละตัว เพื่อไม่ให้ตัวละครเดิมเสียงหรือหน้าเปลี่ยนไปมา
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddEntity("actor")}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 text-black text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> เพิ่มตัวละคร
                </button>
                <button
                  type="button"
                  onClick={() => handleAddEntity("location")}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> เพิ่มสถานที่
                </button>
                <button
                  type="button"
                  onClick={() => handleAddEntity("product")}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-orange-400" /> เพิ่มสินค้า
                </button>
              </div>
            </div>

            <input
              ref={entityUploadInputRef}
              type="file"
              accept="image/*"
              onChange={handleEntityFileUpload}
              className="hidden"
            />

            {project.entities.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-white/15 text-center text-xs text-zinc-400">
                ยังไม่มีตัวละครหรือสถานที่ — กดปุ่ม <b>&ldquo;① ให้ AI แยกตัวละคร&rdquo;</b> หรือกด <b>&ldquo;+ เพิ่มตัวละคร&rdquo;</b> ด้านบนได้เลยครับ
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {project.entities.map((ent) => (
                  <div
                    key={ent.id}
                    className="p-3.5 rounded-xl bg-[#0B0D13] border border-white/10 flex gap-3"
                  >
                    {/* Reference Image Box */}
                    <div className="w-24 shrink-0 flex flex-col gap-1.5">
                      <div className="w-24 h-28 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center">
                        {ent.imageUrl ? (
                          <img src={ent.imageUrl} alt={ent.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-6 h-6 text-zinc-600" />
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={entityBusyId === ent.id}
                        onClick={() => handleGenEntityRefImage(ent)}
                        className="w-full py-1 px-1.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold cursor-pointer"
                      >
                        {entityBusyId === ent.id ? "กำลังวาด..." : "✨ เจนรูป Ref"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadTargetEntityId(ent.id);
                          entityUploadInputRef.current?.click();
                        }}
                        className="w-full py-1 px-1.5 rounded bg-white/10 text-zinc-300 text-[10px] font-semibold cursor-pointer"
                      >
                        📂 แนบรูปจริง
                      </button>
                    </div>

                    {/* Entity Fields + Voice Lock + Delete Button */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 uppercase">
                          {ent.kind}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntity(ent.id)}
                          className="p-1 text-zinc-400 hover:text-red-400 rounded cursor-pointer"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={ent.name}
                        onChange={(e) => handleUpdateEntity(ent.id, { name: e.target.value })}
                        className="w-full px-2.5 py-1 rounded-lg bg-[#11141D] border border-white/15 text-xs font-bold text-white"
                        placeholder="ชื่อตัวละคร / สถานที่"
                      />

                      <textarea
                        rows={2}
                        value={ent.descriptionThai}
                        onChange={(e) =>
                          handleUpdateEntity(ent.id, {
                            descriptionThai: e.target.value,
                            promptEn: e.target.value
                          })
                        }
                        className="w-full p-2 rounded-lg bg-[#11141D] border border-white/15 text-[11px] text-zinc-200"
                        placeholder="รูปร่างหน้าตาและชุดที่ใส่ประจำตัว..."
                      />

                      {ent.kind === "actor" && (
                        <div>
                          <label className="block text-[10px] font-bold text-amber-400 mb-0.5">
                            🔒 ล็อกเสียงพากย์ประจำตัวละครนี้ (ElevenLabs):
                          </label>
                          <select
                            value={ent.voiceId}
                            onChange={(e) => handleUpdateEntity(ent.id, { voiceId: e.target.value })}
                            className="w-full px-2 py-1 rounded-lg bg-[#11141D] border border-amber-400/30 text-[11px] font-bold text-amber-200"
                          >
                            {PKFLOW_VOICES.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. MULTI-EPISODE STORYBOARD & 3-BUTTON BATCH PIPELINE
      ===================================================================== */}
      {project.shots.length > 0 && (
        <section className="space-y-4 animate-fade-in-up">
          <DepartmentHandoffBar currentDeptId="short-film" payload={handoffPayload} />

          <div className="rounded-2xl bg-[#11141D] text-white border border-amber-400/30 p-5 space-y-4 shadow-xl">
            {/* Episode Tabs + 3-Step Batch Pipeline Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {Array.from({ length: project.episodesCount }).map((_, i) => {
                  const epNum = i + 1;
                  const count = project.shots.filter((s) => s.episode === epNum).length;
                  return (
                    <button
                      key={epNum}
                      type="button"
                      onClick={() => setActiveEpisode(epNum)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                        activeEpisode === epNum
                          ? "bg-amber-400 text-black shadow-md"
                          : "bg-white/5 text-zinc-300 hover:bg-white/10"
                      }`}
                    >
                      🎬 EP.{epNum} ({count} ช็อต)
                    </button>
                  );
                })}
              </div>

              {/* 3-Step Sequential Batch Buttons: เจนรูปทั้งหมด -> พากย์เสียง/เจนต่อที่ค้าง -> ส่งออกโปรเจกต์ */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busyState.batchImages}
                  onClick={handleBatchGenerateRemainingImages}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {busyState.batchImages ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5" />
                  )}
                  <span>1. เจนรูปทั้งหมด (เฉพาะฉากที่ยังไม่เสร็จ)</span>
                </button>

                <button
                  type="button"
                  disabled={busyState.batchVoices}
                  onClick={handleBatchGenerateVoices}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {busyState.batchVoices ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                  <span>2. พากย์เสียงทุกฉาก (ตามเสียงตัวละคร)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(project, null, 2)], {
                      type: "application/json"
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `PKFLOW_${project.title.replace(/\s+/g, "_")}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast("บันทึกไฟล์โปรเจกต์ PKFLOW (.json) ลงเครื่องเรียบร้อย!", "success");
                  }}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>3. เซฟโปรเจกต์ (.JSON)</span>
                </button>
              </div>
            </div>

            {/* Shot Cards Grid for Active Episode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentEpShots.map((shot) => (
                <div
                  key={shot.id}
                  className="rounded-xl bg-[#0B0D13] border border-white/10 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-mono text-[11px] font-extrabold">
                          EP.{shot.episode} · SHOT {String(shot.shotNumber).padStart(2, "0")}
                        </span>
                        <span className="text-[11px] font-bold text-amber-300 truncate">
                          {shot.actBadge}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {shot.imageUrl ? "🟢 รูปพร้อม" : "⚪ รอเจนรูป"}
                      </span>
                    </div>

                    {shot.imageUrl && (
                      <div className="rounded-lg overflow-hidden border border-white/10 bg-black aspect-video">
                        <img src={shot.imageUrl} alt={shot.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Per-Shot Voice & Dialogue */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">
                          ผู้พูดในฉากนี้:
                        </label>
                        <input
                          type="text"
                          value={shot.speakerName}
                          onChange={(e) =>
                            updateProject({
                              shots: project.shots.map((s) =>
                                s.id === shot.id ? { ...s, speakerName: e.target.value } : s
                              )
                            })
                          }
                          className="w-full px-2.5 py-1 rounded bg-[#11141D] border border-white/15 text-xs font-bold text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-amber-400 mb-0.5">
                          เสียงพากย์ฉากนี้ (เปลี่ยนเฉพาะฉากได้):
                        </label>
                        <select
                          value={shot.voiceId}
                          onChange={(e) =>
                            updateProject({
                              shots: project.shots.map((s) =>
                                s.id === shot.id ? { ...s, voiceId: e.target.value } : s
                              )
                            })
                          }
                          className="w-full px-2 py-1 rounded bg-[#11141D] border border-amber-400/30 text-[11px] font-bold text-amber-200"
                        >
                          {PKFLOW_VOICES.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">
                        🎙️ บทพูดภาษาไทย (อ้าปากพูดตรงจังหวะ):
                      </label>
                      <textarea
                        rows={2}
                        value={shot.dialogueThai}
                        onChange={(e) =>
                          updateProject({
                            shots: project.shots.map((s) =>
                              s.id === shot.id ? { ...s, dialogueThai: e.target.value } : s
                            )
                          })
                        }
                        className="w-full p-2 rounded-lg bg-[#11141D] border border-white/15 text-xs text-white"
                      />
                    </div>

                    {shot.audioUrl && <audio controls src={shot.audioUrl} className="w-full h-8" />}

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-0.5">
                        🎨 Prompt ภาพ & วิดีโอ (ล็อกหน้าตาตัวละคร + เชื้อชาติ):
                      </label>
                      <textarea
                        rows={2}
                        value={shot.visualPromptEn}
                        onChange={(e) =>
                          updateProject({
                            shots: project.shots.map((s) =>
                              s.id === shot.id ? { ...s, visualPromptEn: e.target.value } : s
                            )
                          })
                        }
                        className="w-full p-2 rounded-lg bg-[#11141D] border border-white/15 text-[11px] font-mono text-zinc-300"
                      />
                    </div>
                  </div>

                  {/* Shot Footer Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={shotImgBusyId === shot.id}
                        onClick={async () => {
                          setShotImgBusyId(shot.id);
                          try {
                            const res = await fetch("/api/ai/image", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                prompt: shot.visualPromptEn,
                                aspectRatio: project.aspectRatio
                              })
                            });
                            const data = await res.json();
                            if (res.ok && data.imageUrl) {
                              updateProject({
                                shots: project.shots.map((s) =>
                                  s.id === shot.id
                                    ? { ...s, imageUrl: data.imageUrl, status: "image_ready" }
                                    : s
                                )
                              });
                            }
                          } finally {
                            setShotImgBusyId(null);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>{shotImgBusyId === shot.id ? "กำลังวาด..." : "เจนรูปฉากนี้"}</span>
                      </button>

                      <button
                        type="button"
                        disabled={shotTtsBusyId === shot.id}
                        onClick={async () => {
                          setShotTtsBusyId(shot.id);
                          try {
                            const res = await fetch("/api/ai/tts", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                text: shot.dialogueThai,
                                voiceId: shot.voiceId,
                                mode: "generate_single"
                              })
                            });
                            const data = await res.json();
                            if (res.ok && data.audioBase64) {
                              updateProject({
                                shots: project.shots.map((s) =>
                                  s.id === shot.id
                                    ? {
                                        ...s,
                                        audioUrl: `data:audio/mpeg;base64,${data.audioBase64}`,
                                        status: "complete"
                                      }
                                    : s
                                )
                              });
                            }
                          } finally {
                            setShotTtsBusyId(null);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>{shotTtsBusyId === shot.id ? "รอ..." : "พากย์เสียง"}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(shot.visualPromptEn);
                        setCopiedId(shot.id);
                        showToast(`ก๊อป Prompt ช็อตที่ ${shot.shotNumber} แล้ว!`, "success");
                        setTimeout(() => setCopiedId(null), 1800);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === shot.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>ก๊อป Prompt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Saved Projects Modal */}
      {projectsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#11141D] text-white border border-amber-400/30 rounded-2xl max-w-xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-amber-400">
                📂 คลังโปรเจกต์หนังสั้นที่บันทึกไว้ ({savedProjects.length})
              </h3>
              <button
                type="button"
                onClick={() => setProjectsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {savedProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-[#0B0D13] border border-white/10 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{p.title}</div>
                    <div className="text-[11px] text-zinc-400">
                      {p.episodesCount} ตอน · {p.shots.length} ช็อต · {p.aspectRatio}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProject(p);
                      setActiveEpisode(1);
                      setProjectsModalOpen(false);
                      showToast(`โหลดโปรเจกต์ "${p.title}" เรียบร้อย!`, "success");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-extrabold cursor-pointer"
                  >
                    เปิดทำต่อ
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
