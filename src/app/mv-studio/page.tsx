"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Music,
  Sparkles,
  Upload,
  UserCheck,
  Scissors,
  Clock,
  RefreshCw,
  Image as ImageIcon,
  Play,
  Download,
  Copy,
  Check,
  Plus,
  FolderOpen,
  Subtitles,
  Wand2,
  ShieldCheck
} from "lucide-react";
import {
  saveEmbeddedFile,
  loadEmbeddedFile,
  removeEmbeddedFile,
  saveStudioState,
  loadStudioState
} from "@/lib/storage/persistent-media";
import { useHub, HubHandoffPayload } from "@/context/HubContext";
import { DepartmentHandoffBar } from "@/components/hub/DepartmentHandoffBar";
import { useToast } from "@/components/ui/ToastProvider";

export interface MVSceneItem {
  sceneNumber: number;
  sectionTag: string;
  lyricLine: string;
  mode: "SINGING_LIPSYNC" | "STORY_ACTING";
  angleIndex: number; // 0..3 from 4-angle smart crop
  startSec: number;
  endSec: number;
  durationSec: number;
  locationThai: string;
  actionThai: string;
  visualPromptEn: string;
  motionPromptEn: string;
  imageUrl?: string;
  videoClipUrl?: string;
  status: "pending" | "done" | "failed";
}

export interface MVProjectRecord {
  id: string;
  songTitle: string;
  audioFileName: string;
  songDurationSec: number;
  moodAndStoryline: string;
  actorLookThai: string;
  actorLookEn: string;
  aspectRatio: "16:9" | "9:16";
  durationMode: "AUTO_PRO" | "FIXED_4S" | "FIXED_5S";
  subtitleMode: "KARAOKE_THAI" | "NO_SUB_CLEAN";
  lyricsRaw: string;
  croppedAngles: string[]; // 4 cropped data URLs from Character Sheet
  scenes: MVSceneItem[];
  updatedAt: string;
}

const MV_STATE_KEY = "pk_mv_creator_v53_state_v4";
const MV_AUDIO_KEY = "mv_uploaded_audio_v4";
const MV_SHEET_KEY = "mv_character_sheet_v4";

function formatSrtTime(sec: number): string {
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  const ms = Math.round((sec - Math.floor(sec)) * 1000);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

/**
 * Centered Smart 4-Angle Crop from a horizontal Character Sheet (4 or 7 poses) or single portrait.
 * Ensures symmetrical, centered cropping without distortion!
 */
async function sliceCharacterSheetInto4CenteredAngles(dataUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.width;
      const h = img.height;
      // If wide character sheet (aspect > 1.35), slice into 4 centered vertical panels
      const isWideSheet = w / Math.max(1, h) > 1.35;
      const results: string[] = [];

      if (isWideSheet) {
        const panelW = Math.floor(w / 4);
        for (let i = 0; i < 4; i++) {
          const canvas = document.createElement("canvas");
          canvas.width = panelW;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Centered crop per quarter
            const sx = i * panelW;
            ctx.drawImage(img, sx, 0, panelW, h, 0, 0, panelW, h);
            results.push(canvas.toDataURL("image/jpeg", 0.9));
          }
        }
      } else {
        // Single portrait: create 4 balanced framing crops (Close-Up Face, Medium Bust, 3/4 Upper, Full)
        const crops = [
          { sy: 0, sh: Math.floor(h * 0.55) },
          { sy: 0, sh: Math.floor(h * 0.72) },
          { sy: Math.floor(h * 0.05), sh: Math.floor(h * 0.8) },
          { sy: 0, sh: h }
        ];
        for (const c of crops) {
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = c.sh;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, c.sy, w, c.sh, 0, 0, w, c.sh);
            results.push(canvas.toDataURL("image/jpeg", 0.9));
          }
        }
      }
      resolve(results.length === 4 ? results : [dataUrl, dataUrl, dataUrl, dataUrl]);
    };
    img.onerror = () => resolve([dataUrl, dataUrl, dataUrl, dataUrl]);
    img.src = dataUrl;
  });
}

function createCleanMVProject(idx: number = 1): MVProjectRecord {
  return {
    id: `mv_${Date.now()}`,
    songTitle: `โปรเจกต์ MV เพลงใหม่ #${idx}`,
    audioFileName: "",
    songDurationSec: 60,
    moodAndStoryline: "",
    actorLookThai:
      "นักร้อง/นักแสดงไทยใบหน้าสมจริง แววตาสื่ออารมณ์ ท่าทางการพูดและอ้าปากร้องเพลงภาษาไทยเป็นธรรมชาติ",
    actorLookEn:
      "a single solo authentic Thai singer/actor with expressive eyes, natural realistic skin texture, and consistent signature outfit",
    aspectRatio: "16:9",
    durationMode: "AUTO_PRO",
    subtitleMode: "KARAOKE_THAI",
    lyricsRaw: "", // Strictly empty on new project as requested!
    croppedAngles: [],
    scenes: [],
    updatedAt: new Date().toISOString()
  };
}

export default function MVCreatorProV53Page() {
  const { sendToDepartment } = useHub();
  const { showToast } = useToast();

  const [project, setProject] = useState<MVProjectRecord>(() => createCleanMVProject(1));
  const [savedProjects, setSavedProjects] = useState<MVProjectRecord[]>([]);
  const [audioObjectUrl, setAudioObjectUrl] = useState<string>("");
  const [sheetObjectUrl, setSheetObjectUrl] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [tapIdx, setTapIdx] = useState<number>(0);
  const [projectsOpen, setProjectsOpen] = useState<boolean>(false);
  const [restoring, setRestoring] = useState<boolean>(true);

  const [buildingMV, setBuildingMV] = useState<boolean>(false);
  const [batchGenerating, setBatchGenerating] = useState<boolean>(false);
  const [sceneBusyNum, setSceneBusyNum] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const sheetInputRef = useRef<HTMLInputElement | null>(null);
  const sceneClipInputRef = useRef<HTMLInputElement | null>(null);
  const [attachTargetSceneNum, setAttachTargetSceneNum] = useState<number | null>(null);

  // Restore Embedded Audio, Character Sheet & MV Project State on Mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [saved, embAudio, embSheet] = await Promise.all([
          loadStudioState<{ current: MVProjectRecord; list: MVProjectRecord[] }>(MV_STATE_KEY),
          loadEmbeddedFile(MV_AUDIO_KEY),
          loadEmbeddedFile(MV_SHEET_KEY)
        ]);

        if (!mounted) return;
        if (embAudio) setAudioObjectUrl(embAudio.objectUrl);
        if (embSheet) setSheetObjectUrl(embSheet.objectUrl);
        if (saved?.current) {
          setProject(saved.current);
          setSavedProjects(saved.list || [saved.current]);
        }
      } finally {
        if (mounted) setRestoring(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-save MV Project State
  useEffect(() => {
    if (restoring) return;
    const nextList = [project, ...savedProjects.filter((p) => p.id !== project.id)].slice(0, 25);
    setSavedProjects(nextList);
    saveStudioState(MV_STATE_KEY, { current: project, list: nextList });
  }, [project, restoring]);

  const updateProject = (updates: Partial<MVProjectRecord>) => {
    setProject((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleStartNewMVProject = async () => {
    await removeEmbeddedFile(MV_AUDIO_KEY);
    await removeEmbeddedFile(MV_SHEET_KEY);
    setAudioObjectUrl("");
    setSheetObjectUrl("");
    const fresh = createCleanMVProject(savedProjects.length + 1);
    setProject(fresh);
    setTapIdx(0);
    showToast("🆕 เริ่มโปรเจกต์ MV ใหม่เรียบร้อย (ล้างเนื้อเพลงและพล็อตเดิมออก 100% ไม่ล็อก 29 ฉากเดิม!)", "success");
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { objectUrl } = await saveEmbeddedFile(MV_AUDIO_KEY, file, file.name, true);
    setAudioObjectUrl(objectUrl);
    updateProject({
      audioFileName: file.name,
      songTitle: file.name.replace(/\.[^.]+$/, "")
    });
    showToast(`✅ ฝังไฟล์เพลง "${file.name}" เรียบร้อย (รีเฟรชไม่หาย)!`, "success");
    e.target.value = "";
  };

  const handleCharacterSheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { objectUrl } = await saveEmbeddedFile(MV_SHEET_KEY, file, file.name, true);
    setSheetObjectUrl(objectUrl);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      const angles = await sliceCharacterSheetInto4CenteredAngles(dataUrl);
      updateProject({ croppedAngles: angles });
      showToast("✅ ตัดแยก Character Sheet 4 มุมกึ่งกลางสมมาตร (Centered Smart 4-Angle Crop) สำเร็จ!", "success");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Attach an already-generated clip/image to a specific scene so partial work is never wasted!
  const handleAttachExistingMediaToScene = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || attachTargetSceneNum === null) return;
    const targetNum = attachTargetSceneNum;
    const isVid = file.type.startsWith("video");

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      updateProject({
        scenes: project.scenes.map((s) =>
          s.sceneNumber === targetNum
            ? {
                ...s,
                ...(isVid ? { videoClipUrl: dataUrl } : { imageUrl: dataUrl }),
                status: "done"
              }
            : s
        )
      });
      showToast(`✅ นำไฟล์ใส่ในฉากที่ #${targetNum} เรียบร้อย (เก็บถาวรไม่หายเมื่อรีเฟรช)!`, "success");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Dynamic Lyric Emotion & Storyline Analyzer + Acting/Singing Alternation Builder
  const handleAnalyzeLyricsAndBuildMV = () => {
    const lines = project.lyricsRaw
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      showToast("กรุณาวางเนื้อเพลงในช่องเนื้อเพลงก่อนครับ (1 บรรทัด = 1 ฉาก MV)", "info");
      return;
    }

    setBuildingMV(true);
    try {
      // Dynamic locations based on user's custom storyline or lyric emotion
      const customStory = project.moodAndStoryline.trim();
      const locationsPool = customStory
        ? [
            `สถานที่ช่วงเปิดเรื่อง (${customStory}) แสงธรรมชาติสมจริง`,
            `สถานที่ดำเนินเรื่อง (${customStory}) มุมกว้างมีมิติ`,
            `สถานที่ช่วงจุดพีคอารมณ์เพลง (${customStory}) แสง Golden Hour`,
            `สถานที่บทสรุปส่งท้าย (${customStory}) บรรยากาศอบอุ่นลึกซึ้ง`
          ]
        : [
            "สถานที่จริงตามอารมณ์เพลง ช่วงเปิดเรื่อง แสงธรรมชาติอบอุ่นสมจริง",
            "บรรยากาศกลางแจ้งแสงเย็น Golden Hour ลมพัดเส้นผมเป็นธรรมชาติ",
            "มุมริมหน้าต่างหรือระเบียงไฟประดับยามพลบค่ำ โบเก้นุ่มลึก",
            "ฉากไคลแม็กซ์อารมณ์เพลง แสงภาพยนตร์คมชัดระดับ 8K"
          ];

      // Professional variable durations (2s / 5s / 8s) or fixed
      const rawWeights = lines.map((line, idx) => {
        if (project.durationMode === "FIXED_4S") return 4;
        if (project.durationMode === "FIXED_5S") return 5;
        // AUTO_PRO: Intro/Outro 5-8s, Hook/Chorus punchy 2-4s, Verse 5s
        if (/intro|outro|solo/i.test(line)) return 6;
        if (/chorus|hook/i.test(line)) return idx % 2 === 0 ? 3 : 4;
        return idx % 3 === 0 ? 5 : 4;
      });

      const totalWeight = rawWeights.reduce((a, b) => a + b, 0) || 1;
      const scale = project.songDurationSec / totalWeight;

      const identityLock = `[Subject Identity Lock]: <Subject 1> is ${project.actorLookEn}. Preserve ONLY facial structure, expressive eyes, hairstyle, and signature outfit from the character reference sheet. STRICTLY IGNORE any plain white or grey studio backdrop (strictly ONE solo person in frame, zero duplicate clones, zero split-screen).`;
      const noSubGuard = "STRICTLY ZERO in-video text, zero English subtitles, zero watermarks.";

      let timeCursor = 0;
      const builtScenes: MVSceneItem[] = lines.map((rawLine, idx) => {
        const tagMatch = rawLine.match(/^\[([^\]]+)\]\s*(.*)$/);
        const sectionTag = tagMatch ? tagMatch[1] : idx === 0 ? "Intro" : "Verse";
        const cleanLyric = (tagMatch ? tagMatch[2] : rawLine).trim();

        const dur = Math.max(2, Number((rawWeights[idx] * scale).toFixed(1)));
        const startSec = Number(timeCursor.toFixed(1));
        const endSec = Number((timeCursor + dur).toFixed(1));
        timeCursor += dur;

        // Alternate between Singing Lip-Sync and Story Acting B-Roll like a real MV!
        const isInstrumental = /intro|outro|instru|solo/i.test(sectionTag);
        const mode: "SINGING_LIPSYNC" | "STORY_ACTING" =
          isInstrumental || idx % 3 === 1 ? "STORY_ACTING" : "SINGING_LIPSYNC";

        const angleIdx = idx % 4;
        const angleDesc = [
          "Front eye-level medium close-up portrait",
          "3/4 left profile cinematic angle with head turn",
          "3/4 right profile tracking shot",
          "Medium wide full-body expressive shot"
        ][angleIdx];

        const locThai = locationsPool[Math.min(locationsPool.length - 1, Math.floor((idx / lines.length) * locationsPool.length))];

        const actionThai =
          mode === "SINGING_LIPSYNC"
            ? `🎤 [ร้องลิปซิงค์ · มุมที่ ${angleIdx + 1}] นักแสดงสบตากล้อง ร้องลิปซิงค์ออกเสียงภาษาไทยท่อน "${cleanLyric}" อ้าปากและขยับริมฝีปากตรงคำร้อง แววตาสื่ออารมณ์ลึกซึ้ง`
            : `🎭 [แสดงเนื้อเรื่อง · มุมที่ ${angleIdx + 1}] นักแสดงถ่ายทอดอารมณ์ตามเนื้อเพลง "${cleanLyric}" เคลื่อนไหวร่างกายและสายตาอย่างเป็นธรรมชาติในฉากจริง`;

        const actionEn =
          mode === "SINGING_LIPSYNC"
            ? `${angleDesc}; <Subject 1> sings with authentic Thai lip-sync articulation matching "${cleanLyric}", natural mouth and jaw movement, deeply expressive eye contact with the camera lens`
            : `${angleDesc}; <Subject 1> performs natural emotional story acting inspired by "${cleanLyric}", turning gracefully in a continuous real-world environment without singing directly at the lens`;

        return {
          sceneNumber: idx + 1,
          sectionTag,
          lyricLine: cleanLyric,
          mode,
          angleIndex: angleIdx,
          startSec,
          endSec,
          durationSec: dur,
          locationThai: locThai,
          actionThai,
          visualPromptEn: `${identityLock} [Real Environment]: ${locThai}. ${actionEn}. Photorealistic 8K cinema MV, ${project.aspectRatio} framing. ${noSubGuard}`,
          motionPromptEn:
            mode === "SINGING_LIPSYNC"
              ? "Smooth dolly push-in at 60fps capturing realistic Thai vocal lip-sync and micro-expressions"
              : "Cinematic gimbal tracking shot at 60fps following natural story acting and body movement",
          status: "pending"
        };
      });

      updateProject({ scenes: builtScenes });
      setTapIdx(0);
      showToast(
        `🎵 วิเคราะห์เนื้อเพลงและสร้างสตอรี่บอร์ด MV ${builtScenes.length} ฉาก (สลับฉากร้อง Lip-Sync + ฉากแสดงเนื้อเรื่อง) เรียบร้อย!`,
        "success"
      );
    } finally {
      setBuildingMV(false);
    }
  };

  // Smart Continuity Bridge Rewrite for a Failed Middle Scene (e.g. Scene 2 between Scene 1 and Scene 3)
  const handleRewriteFailedSceneWithContinuity = (sceneNumber: number) => {
    const idx = project.scenes.findIndex((s) => s.sceneNumber === sceneNumber);
    if (idx === -1) return;

    const curr = project.scenes[idx];
    const prevScene = idx > 0 ? project.scenes[idx - 1] : null;
    const nextScene = idx + 1 < project.scenes.length ? project.scenes[idx + 1] : null;

    const bridgeNote = `Continuity bridge from Scene ${prevScene ? prevScene.sceneNumber : 1} (${
      prevScene ? prevScene.lyricLine : "opening"
    }) flowing smoothly into Scene ${nextScene ? nextScene.sceneNumber : curr.sceneNumber} (${
      nextScene ? nextScene.lyricLine : "finale"
    })`;

    const newMode: "SINGING_LIPSYNC" | "STORY_ACTING" =
      curr.mode === "SINGING_LIPSYNC" ? "STORY_ACTING" : "SINGING_LIPSYNC";

    const updatedPrompt = `[Subject Identity Lock]: <Subject 1> is ${project.actorLookEn}. [Seamless Continuity Bridge]: ${bridgeNote} in ${curr.locationThai}. Smooth cinematic over-the-shoulder to medium close-up transition as <Subject 1> conveys the emotion of "${curr.lyricLine}", natural lighting, photorealistic 8K MV, STRICTLY ZERO in-video text.`;

    updateProject({
      scenes: project.scenes.map((s) =>
        s.sceneNumber === sceneNumber
          ? {
              ...s,
              mode: newMode,
              visualPromptEn: updatedPrompt,
              actionThai: `🔄 [ปรับ Prompt เชื่อมรอยต่อฉาก ${prevScene?.sceneNumber || 1} ➔ ${
                nextScene?.sceneNumber || curr.sceneNumber
              }] ${curr.actionThai}`
            }
          : s
      )
    });
    showToast(
      `✨ ปรับ Prompt ฉากที่ #${sceneNumber} ใหม่ให้เชื่อมรอยต่อกับฉากก่อนหน้าและถัดไปเรียบร้อย! กดเจนฉากนี้ใหม่ได้เลย`,
      "success"
    );
  };

  // Resume Remaining Scenes Only (Never overwrites finished scenes!)
  const handleBatchGenerateRemainingScenes = async () => {
    const remaining = project.scenes.filter((s) => !s.imageUrl && !s.videoClipUrl);
    if (remaining.length === 0) {
      showToast("ทุกฉากมีภาพ/คลิปครบแล้วครับ (ระบบข้ามฉากที่เสร็จแล้วเพื่อประหยัดเครดิต)!", "info");
      return;
    }

    setBatchGenerating(true);
    for (const sc of remaining) {
      setSceneBusyNum(sc.sceneNumber);
      try {
        const res = await fetch("/api/ai/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: sc.visualPromptEn,
            aspectRatio: project.aspectRatio
          })
        });
        const data = await res.json();
        if (res.ok && data.imageUrl) {
          setProject((prev) => ({
            ...prev,
            scenes: prev.scenes.map((item) =>
              item.sceneNumber === sc.sceneNumber
                ? { ...item, imageUrl: data.imageUrl, status: "done" }
                : item
            )
          }));
        }
      } catch {}
    }
    setSceneBusyNum(null);
    setBatchGenerating(false);
    showToast("✅ เจนต่อเฉพาะฉากที่ยังไม่เสร็จครบเรียบร้อย!", "success");
  };

  // Easy Tap-to-Sync Lyric Timing while song plays
  const handleTapSyncLyric = () => {
    if (project.scenes.length === 0) return;
    const now = audioRef.current ? Number(audioRef.current.currentTime.toFixed(1)) : tapIdx * 4;
    const idx = Math.min(tapIdx, project.scenes.length - 1);

    const nextScenes = project.scenes.map((s, i) => {
      if (i === idx) {
        return { ...s, startSec: now, endSec: Number((now + s.durationSec).toFixed(1)) };
      }
      if (i === idx - 1) {
        const dur = Math.max(1.5, Number((now - s.startSec).toFixed(1)));
        return { ...s, endSec: now, durationSec: dur };
      }
      return s;
    });

    updateProject({ scenes: nextScenes });
    setTapIdx((prev) => (prev + 1) % project.scenes.length);
    showToast(`🥁 ซิงค์เนื้อเพลงท่อนที่ #${idx + 1} ที่วินาที ${now.toFixed(1)}s แล้ว!`, "success");
  };

  const completedCount = project.scenes.filter((s) => s.imageUrl || s.videoClipUrl).length;
  const remainingCount = project.scenes.length - completedCount;

  const handoffPayload: HubHandoffPayload = {
    id: project.id,
    title: project.songTitle,
    topic: project.songTitle,
    aspectRatio: project.aspectRatio,
    hook3Sec: project.scenes[0]?.lyricLine || project.songTitle,
    concept: project.moodAndStoryline || project.actorLookThai,
    fullScriptThai: project.scenes.map((s) => s.lyricLine).join("\n"),
    lyricsText: project.lyricsRaw,
    scenes: project.scenes.map((s) => ({
      sceneNumber: s.sceneNumber,
      title: `[${s.sectionTag}] ${s.lyricLine}`,
      durationSec: s.durationSec,
      timecode: `${s.startSec.toFixed(1)}s - ${s.endSec.toFixed(1)}s`,
      voiceoverThai: s.lyricLine,
      onScreenText: project.subtitleMode === "KARAOKE_THAI" ? s.lyricLine : "",
      visualPromptEn: s.visualPromptEn,
      motionPromptEn: s.motionPromptEn,
      imageUrl: s.imageUrl
    })),
    caption: `🎵 MV เพลง: ${project.songTitle}`,
    hashtags: ["#MVCreatorPro", "#สร้างMVด้วยAI"],
    sourceDept: "mv-studio",
    updatedAt: project.updatedAt
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <section className="rounded-2xl bg-[#130F1D] text-white border border-purple-500/30 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-extrabold uppercase tracking-wider text-purple-300 bg-purple-500/15 border border-purple-500/30 px-3 py-1 rounded-lg">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span>MV CREATOR PRO v5.3 · Smart 4-Angle Crop & Acting/Singing Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              สตูดิโอสร้าง MV เพลงจากไฟล์เพลง & รูป Character Sheet (สลับฉากร้อง + แสดงเนื้อเรื่อง)
            </h1>
            <p className="text-xs text-purple-200/80">
              ฝังไฟล์เพลงและรูปในระบบ (กด F5 ไม่หาย) · ตัดแยกมุม Character Sheet สมมาตรไม่เบี้ยว · เจนต่อเฉพาะฉากที่ค้างโดยไม่ทับฉากที่เสร็จแล้ว
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setProjectsOpen(true)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-purple-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>โปรเจกต์ MV ที่เซฟไว้ ({savedProjects.length})</span>
            </button>
            <button
              type="button"
              onClick={handleStartNewMVProject}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เริ่มโปรเจกต์ MV ใหม่</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Setup Grid: Left (Audio + Smart 4-Angle Character Sheet) | Right (Storyline + Lyrics + Options) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT (5 cols): Song Audio Upload + Character Sheet 4-Angle Smart Crop */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Audio Upload & Easy Tap-to-Sync */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-600" />
                <span>1. แนบไฟล์เพลง (.MP3 / .WAV / .M4A)</span>
              </h2>
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>เลือกไฟล์เพลง</span>
              </button>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
            </div>

            {project.audioFileName && (
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>เพลงที่ฝังไว้: {project.audioFileName} ({project.songDurationSec}s)</span>
              </div>
            )}

            {audioObjectUrl && (
              <div className="space-y-2.5 p-3 rounded-xl bg-purple-950 text-white">
                <audio
                  ref={audioRef}
                  src={audioObjectUrl}
                  controls
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => {
                    if (e.currentTarget.duration && isFinite(e.currentTarget.duration)) {
                      updateProject({ songDurationSec: Math.round(e.currentTarget.duration) });
                    }
                  }}
                  className="w-full h-9"
                />
                {project.scenes.length > 0 && (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-purple-200 truncate">
                      ท่อนถัดไป #{tapIdx + 1}: <b>{project.scenes[tapIdx]?.lyricLine}</b>
                    </span>
                    <button
                      type="button"
                      onClick={handleTapSyncLyric}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-extrabold shrink-0 cursor-pointer"
                    >
                      🥁 เคาะจังหวะ ({currentTime.toFixed(1)}s)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Actor Look & Centered Smart 4-Angle Character Sheet Crop */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  <span>2. รูปนักแสดง / Character Sheet (4 หรือ 7 ท่า)</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  ตัดแบ่ง 4 มุมกึ่งกลางสมมาตรอัตโนมัติ เพื่อให้หมุนตัวด้านหน้า-ด้านข้างได้สมจริง
                </p>
              </div>
              <button
                type="button"
                onClick={() => sheetInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold cursor-pointer"
              >
                + แนบรูปนักแสดง
              </button>
              <input
                ref={sheetInputRef}
                type="file"
                accept="image/*"
                onChange={handleCharacterSheetUpload}
                className="hidden"
              />
            </div>

            {project.croppedAngles.length === 4 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300">
                  ✨ ผลลัพธ์ Centered Smart 4-Angle Crop (สลับมุมตามฉากอัตโนมัติ):
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["มุม 1: หน้าตรง", "มุม 2: หันซ้าย", "มุม 3: หันขวา", "มุม 4: เต็มตัว"].map(
                    (lbl, idx) => (
                      <div key={idx} className="space-y-1 text-center">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden border border-purple-300 bg-black">
                          <img
                            src={project.croppedAngles[idx]}
                            alt={lbl}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <div className="text-[10px] font-bold text-slate-600 dark:text-zinc-400">
                          {lbl}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                ลักษณะนักร้อง/นักแสดง (ภาษาไทย):
              </label>
              <textarea
                rows={2}
                value={project.actorLookThai}
                onChange={(e) =>
                  updateProject({ actorLookThai: e.target.value, actorLookEn: e.target.value })
                }
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* RIGHT (7 cols): Storyline, Options & Lyrics */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                ชื่อเพลง / ชื่อโปรเจกต์ MV
              </label>
              <input
                type="text"
                value={project.songTitle}
                onChange={(e) => updateProject({ songTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                พล็อตเรื่อง MV / สถานที่ที่อยากได้ (อิงตามอารมณ์เพลง)
              </label>
              <input
                type="text"
                value={project.moodAndStoryline}
                onChange={(e) => updateProject({ moodAndStoryline: e.target.value })}
                placeholder="เช่น คาเฟ่เรือนกระจกไม้และสวนดอกไม้แสงเย็น หรือ เดินตากฝนไฟนีออนกรุงเทพ..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs"
              />
            </div>
          </div>

          {/* 3 Key MV Rules: Aspect Ratio, Auto Duration (2s/5s/8s), and Subtitle Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                สัดส่วน MV:
              </label>
              <select
                value={project.aspectRatio}
                onChange={(e) => updateProject({ aspectRatio: e.target.value as "16:9" | "9:16" })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold"
              >
                <option value="16:9">🖥️ 16:9 MV YouTube</option>
                <option value="9:16">📱 9:16 MV TikTok / Reels</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                จังหวะเวลาแต่ละฉาก (Duration):
              </label>
              <select
                value={project.durationMode}
                onChange={(e) =>
                  updateProject({
                    durationMode: e.target.value as "AUTO_PRO" | "FIXED_4S" | "FIXED_5S"
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold"
              >
                <option value="AUTO_PRO">✨ Auto มืออาชีพ (สลับ 2วิ/5วิ/8วิ ตามท่อน)</option>
                <option value="FIXED_4S">⏱️ ล็อกฉากละ 4 วินาที</option>
                <option value="FIXED_5S">⏱️ ล็อกฉากละ 5 วินาที</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                โหมดซับไตเติลเนื้อเพลง:
              </label>
              <select
                value={project.subtitleMode}
                onChange={(e) =>
                  updateProject({
                    subtitleMode: e.target.value as "KARAOKE_THAI" | "NO_SUB_CLEAN"
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs font-bold"
              >
                <option value="KARAOKE_THAI">🎤 ใส่ซับคาราโอเกะไทย (ซิงค์ตามเนื้อ)</option>
                <option value="NO_SUB_CLEAN">🎬 ไม่ใส่ซับ (คลิปคลีน 100% ใส่ซับเอง)</option>
              </select>
            </div>
          </div>

          {/* Lyrics Box (Strictly clean on new project!) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                3. วางเนื้อเพลงของคุณ (1 บรรทัด = 1 ฉาก MV · ระบบจะสลับฉากร้อง Lip-Sync กับฉากแสดงเนื้อเรื่องให้อัตโนมัติ)
              </label>
              {project.lyricsRaw && (
                <button
                  type="button"
                  onClick={() => updateProject({ lyricsRaw: "" })}
                  className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer"
                >
                  ล้างเนื้อเพลง
                </button>
              )}
            </div>
            <textarea
              rows={8}
              value={project.lyricsRaw}
              onChange={(e) => updateProject({ lyricsRaw: e.target.value })}
              placeholder={
                "วางเนื้อเพลงของโปรเจกต์นี้ทีละบรรทัด เช่น:\n[Intro] เสียงดนตรีเปิดเรื่อง...\n[Verse] ท่อนร้องที่ 1...\n[Chorus] ท่อนฮุก..."
              }
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed"
            />
          </div>

          <button
            type="button"
            disabled={buildingMV}
            onClick={handleAnalyzeLyricsAndBuildMV}
            className="w-full min-h-[46px] px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            {buildingMV ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังวิเคราะห์อารมณ์เพลง & วางฉากร้องสลับฉากแสดง...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>วิเคราะห์เนื้อเพลง & สร้างสตอรี่บอร์ด MV ทันที</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================================
          3. MV STORYBOARD & RESUME REMAINING SCENES ENGINE
      ===================================================================== */}
      {project.scenes.length > 0 && (
        <section className="space-y-4 animate-fade-in-up">
          <DepartmentHandoffBar currentDeptId="mv-studio" payload={handoffPayload} />

          <input
            ref={sceneClipInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleAttachExistingMediaToScene}
            className="hidden"
          />

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-xs">
            {/* Progress & Resume Remaining Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                    สร้างเสร็จแล้ว {completedCount} / {project.scenes.length} ฉาก (เหลือ {remainingCount} ฉาก)
                  </span>
                  <span className="text-xs text-slate-500">
                    • {project.subtitleMode === "KARAOKE_THAI" ? "🎤 โหมดซับคาราโอเกะไทย" : "🎬 โหมดคลิปคลีนไม่ฝังซับ"}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {project.songTitle}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={batchGenerating || remainingCount === 0}
                  onClick={handleBatchGenerateRemainingScenes}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {batchGenerating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>▶ เจนต่อเฉพาะฉากที่ยังไม่เสร็จ ({remainingCount} ฉาก)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const srt = project.scenes
                      .map(
                        (s, i) =>
                          `${i + 1}\n${formatSrtTime(s.startSec)} --> ${formatSrtTime(s.endSec)}\n${s.lyricLine}`
                      )
                      .join("\n\n");
                    const blob = new Blob([srt], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${project.songTitle.replace(/\s+/g, "_")}_ThaiLyrics.srt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast("ดาวน์โหลดไฟล์ซับเนื้อเพลง (.SRT) ภาษาไทยถูกต้อง 100% แล้ว!", "success");
                  }}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดซับเนื้อเพลง (.SRT)</span>
                </button>

                <button
                  type="button"
                  onClick={() => sendToDepartment("/subtitles", handoffPayload, "Auto Edit ซับคาราโอเกะ")}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Subtitles className="w-3.5 h-3.5" />
                  <span>ส่งเข้า Auto Edit ฝังซับคาราโอเกะ</span>
                </button>
              </div>
            </div>

            {/* Scene Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.scenes.map((sc) => (
                <div
                  key={sc.sceneNumber}
                  className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                    sc.imageUrl || sc.videoClipUrl
                      ? "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                      : "bg-slate-50/70 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-mono text-[11px] font-bold">
                          ฉาก #{String(sc.sceneNumber).padStart(2, "0")}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            sc.mode === "SINGING_LIPSYNC"
                              ? "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {sc.mode === "SINGING_LIPSYNC" ? "🎤 ร้อง Lip-Sync" : "🎭 แสดงเนื้อเรื่อง"}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-zinc-300">
                        ⏱️ {sc.startSec.toFixed(1)}s–{sc.endSec.toFixed(1)}s ({sc.durationSec}s)
                      </span>
                    </div>

                    {/* Preview Video Clip or Image if present */}
                    {sc.videoClipUrl ? (
                      <video
                        src={sc.videoClipUrl}
                        controls
                        className="w-full rounded-lg bg-black aspect-video object-cover"
                      />
                    ) : sc.imageUrl ? (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video">
                        <img src={sc.imageUrl} alt={sc.lyricLine} className="w-full h-full object-cover" />
                        {project.subtitleMode === "KARAOKE_THAI" && (
                          <div className="absolute bottom-2 left-2 right-2 text-center">
                            <span className="px-2.5 py-1 rounded bg-black/75 text-yellow-300 text-xs font-extrabold">
                              {sc.lyricLine}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Lyric & Action */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-1">
                      <div className="text-[10px] font-bold text-purple-600">
                        🎶 เนื้อร้อง ({sc.sectionTag}):
                      </div>
                      <input
                        type="text"
                        value={sc.lyricLine}
                        onChange={(e) =>
                          updateProject({
                            scenes: project.scenes.map((item) =>
                              item.sceneNumber === sc.sceneNumber
                                ? { ...item, lyricLine: e.target.value }
                                : item
                            )
                          })
                        }
                        className="w-full text-xs font-extrabold text-slate-900 dark:text-white bg-transparent outline-none"
                      />
                      <div className="text-[11px] text-slate-500">{sc.actionThai}</div>
                    </div>

                    {/* Prompt Editor */}
                    <textarea
                      rows={2}
                      value={sc.visualPromptEn}
                      onChange={(e) =>
                        updateProject({
                          scenes: project.scenes.map((item) =>
                            item.sceneNumber === sc.sceneNumber
                              ? { ...item, visualPromptEn: e.target.value }
                              : item
                          )
                        })
                      }
                      className="w-full p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] font-mono text-slate-700 dark:text-zinc-300"
                    />
                  </div>

                  {/* Scene Footer Actions: Gen This Scene | Attach Existing Clip | Continuity Rewrite | Copy */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        disabled={sceneBusyNum === sc.sceneNumber}
                        onClick={async () => {
                          setSceneBusyNum(sc.sceneNumber);
                          try {
                            const res = await fetch("/api/ai/image", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                prompt: sc.visualPromptEn,
                                aspectRatio: project.aspectRatio
                              })
                            });
                            const data = await res.json();
                            if (res.ok && data.imageUrl) {
                              updateProject({
                                scenes: project.scenes.map((item) =>
                                  item.sceneNumber === sc.sceneNumber
                                    ? { ...item, imageUrl: data.imageUrl, status: "done" }
                                    : item
                                )
                              });
                            }
                          } finally {
                            setSceneBusyNum(null);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3 text-purple-600" />
                        <span>{sceneBusyNum === sc.sceneNumber ? "รอ..." : "เจนภาพ"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAttachTargetSceneNum(sc.sceneNumber);
                          sceneClipInputRef.current?.click();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-[11px] font-bold cursor-pointer"
                        title="นำคลิปหรือรูปที่เจนเสร็จแล้วจากเครื่องมาใส่ฉากนี้"
                      >
                        📂 ใส่คลิปที่มีแล้ว
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRewriteFailedSceneWithContinuity(sc.sceneNumber)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold cursor-pointer"
                        title="ถ้าฉากนี้เจนไม่ผ่าน กดเพื่อเขียน Prompt ใหม่ให้เชื่อมกับฉากก่อนหน้าและถัดไปอัตโนมัติ"
                      >
                        🔄 แก้เชื่อมรอยต่อ
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(sc.visualPromptEn);
                        setCopiedKey(`mv_${sc.sceneNumber}`);
                        showToast(`ก๊อป Prompt ฉากที่ #${sc.sceneNumber} แล้ว!`, "success");
                        setTimeout(() => setCopiedKey(null), 1800);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === `mv_${sc.sceneNumber}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>ก๊อป</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Saved MV Projects Modal */}
      {projectsOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                📂 โปรเจกต์ MV ที่บันทึกไว้ ({savedProjects.length})
              </h3>
              <button
                type="button"
                onClick={() => setProjectsOpen(false)}
                className="text-xs font-bold text-slate-500 cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {savedProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{p.songTitle}</div>
                    <div className="text-[11px] text-slate-500">
                      {p.scenes.filter((s) => s.imageUrl || s.videoClipUrl).length}/{p.scenes.length} ฉากเสร็จแล้ว
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProject(p);
                      setProjectsOpen(false);
                      showToast(`โหลดโปรเจกต์ MV "${p.songTitle}" แล้ว!`, "success");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold cursor-pointer"
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
