"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Copy,
  Check,
  Video,
  Camera,
  Layers,
  Clock,
  Music,
  Scissors,
  Mic,
  FileText,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Flame,
  Zap,
  Smartphone,
  Monitor,
  Volume2,
  Download,
  History,
  CheckCircle2,
  Circle,
  Pencil
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface SceneItem {
  scene_number: number;
  duration_sec: number;
  flow_mode?: string;
  what_to_shoot: string;
  camera_angle: string;
  continuity_note: string;
  voiceover_text: string;
  on_screen_text: string;
  popup_badge?: string;
  subtitle_line?: string;
  scene_role?: string;
  act_badge?: string;
  camera_badge?: string;
  thai_story_beats?: string;
  sound_fx?: string;
  flow_prompt: string;
}

interface FilmBible {
  genre: string;
  logline: string;
  visual_style: string;
  subject_identity_lock: string;
  acts_overview: string[];
  characters: Array<{ name: string; role: string; appearance_thai: string; character_sheet_prompt: string }>;
  locations: Array<{ name: string; mood: string; location_ref_prompt: string }>;
}

interface ShotItem {
  shot_number: number;
  role: string;
  angle_and_framing: string;
  lighting_and_props: string;
  text_overlay: string;
  image_prompt: string;
}

interface AngleIdea {
  id: string;
  goal: string;
  category_badge: string;
  title: string;
  hook_preview: string;
  description: string;
  why_it_works: string;
  suggested_prompt: string;
}

interface ResearchBrief {
  subject: string;
  location_or_context: string;
  highlights: string[];
  practical_info: string;
  what_to_shoot: string[];
  sources?: Array<{ title: string; url: string; snippet: string }>;
}

interface EasyBlueprint {
  title: string;
  content_mode?: "SOCIAL" | "SHORT_FILM";
  location_and_facts_summary?: string;
  content_goal_label?: string;
  film_bible?: FilmBible;
  text_overlay_pack?: Array<{ scene_number: number; time_range: string; popup_badge: string; on_screen_text: string; subtitle_line: string }>;
  hook_3sec?: string;
  viral_meme_angle?: string;
  concept: string;
  flow_setup_guide?: {
    tool_mode: string;
    aspect_ratio: string;
    recommended_model: string;
    quick_steps: string[];
  };
  video_blueprint?: {
    total_duration_sec: number;
    scene_count: number;
    mood_and_music: string;
    scenes: SceneItem[];
    editing_guide: string[];
    full_voiceover_script: string;
  };
  photo_blueprint?: {
    photo_style: string;
    shots: ShotItem[];
  };
  social_caption: string;
  hashtags: string[];
}

interface SavedEasyProject {
  id: string;
  prompt: string;
  format: "VIDEO" | "PHOTO" | "BOTH";
  aiMode: "AI_FLOW" | "REAL_SHOOT";
  aspectRatio: "9:16" | "16:9";
  createdAt: string;
  blueprint: EasyBlueprint;
  meta?: { modelUsed?: string; isFailover?: boolean } | null;
  completedScenes?: number[];
}

interface TrendIdea {
  tag: string;
  title: string;
  prompt_idea: string;
  why_viral: string;
}

interface ErrorMemoryItem {
  id: string;
  category: string;
  signature: string;
  message: string;
  resolution: string;
  occurrences: number;
  lastOccurredAt: string;
}

const STORAGE_KEY = "pk_easy_projects_v1";

const QUICK_EXAMPLES = [
  "ช่วยคิดคอนเทนต์ไปวัดร่องขุ่น เชียงราย",
  "รีวิวคาเฟ่มินิมอลเปิดใหม่ แสงสวย",
  "ส่งมอบรถใหม่ป้ายแดงให้ลูกค้า ฟีลอบอุ่นซึ้งๆ",
  "แมวอ้วนใส่สูทบ่นเรื่องงานวันจันทร์ แบบมีมฮาๆ"
];

const SHORT_FILM_EXAMPLES = [
  "หนังสั้นดราม่าพ่อลูกในร้านก๋วยเตี๋ยวโบราณ หักมุมซึ้งๆ",
  "หนังสั้นโรแมนติกพบกันโดยบังเอิญที่วัดร่องขุ่น เชียงราย",
  "หนังสั้นระทึกขวัญในคอนโดร้าง หักมุมตอนจบ",
  "หนังสั้นไซไฟกรุงเทพปี 2099 ชายหนุ่มตามหาความทรงจำ"
];

const PKFLOW_PRO_FILM_URL =
  "https://flow.google.com/project/06056731-4488-47e7-b13d-72c2792c4def/tool/1612491d-a170-4e9d-884d-93194cad1c4f?fromViewSource=tools";

const PK_COMMERCIAL_STUDIO_URL =
  "https://flow.google.com/project/41fad0b2-d63b-402d-9398-9160fb591592/tool/0706859a-d6a4-4391-a879-77f386fb5699?fromViewSource=tools/browser";

const VOICE_OPTIONS = [
  { id: "ErXwobaYiN019PkySvjV", label: "🎙️ Antoni — ผู้บรรยายพรีเมียม" },
  { id: "21m00Tcm4TlvDq8ikWAM", label: "👩 Rachel — หญิงสดใส เป็นมิตร" },
  { id: "pNInz6obpgDQGcFmaJgB", label: "👨 Adam — ชายอบอุ่น น่าเชื่อถือ" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "✨ Bella — สาวรีวิวตื่นเต้น ชวนดู" },
  { id: "TxGEqnHWrfWFTfGW9XjX", label: "🔥 Josh — หนุ่มวัยรุ่น สนุกกระชับ" }
];

export default function EasyContentPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto p-10 text-center text-xs text-slate-500 font-medium">
          กำลังเตรียมสตูดิโอ Easy Content Creator...
        </div>
      }
    >
      <EasyContentWorkspace />
    </Suspense>
  );
}

function EasyContentWorkspace() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const autoRunTriggered = useRef(false);

  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState<"VIDEO" | "PHOTO" | "BOTH">("VIDEO");
  const [aiMode, setAiMode] = useState<"AI_FLOW" | "REAL_SHOOT">("AI_FLOW");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [includeTrends, setIncludeTrends] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [brainstorming, setBrainstorming] = useState(false);
  const [sceneCount, setSceneCount] = useState<string>("AUTO");
  const [contentMode, setContentMode] = useState<"SOCIAL" | "SHORT_FILM">("SOCIAL");
  const [angles, setAngles] = useState<AngleIdea[]>([]);
  const [researchBrief, setResearchBrief] = useState<ResearchBrief | null>(null);
  const [activeAngleId, setActiveAngleId] = useState<string | null>(null);
  const [trends, setTrends] = useState<TrendIdea[]>([]);

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedEasyProject[]>([]);
  const [blueprint, setBlueprint] = useState<EasyBlueprint | null>(null);
  const [meta, setMeta] = useState<{ modelUsed?: string; isFailover?: boolean } | null>(null);
  const [completedScenes, setCompletedScenes] = useState<number[]>([]);
  const [editingSceneNum, setEditingSceneNum] = useState<number | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorMemories, setErrorMemories] = useState<ErrorMemoryItem[]>([]);

  // Voiceover TTS state
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [sceneTtsLoading, setSceneTtsLoading] = useState<number | null>(null);
  const [sceneAudioUrls, setSceneAudioUrls] = useState<Record<number, string>>({});

  // Persist helper
  const persistProjects = (projects: SavedEasyProject[]) => {
    const trimmed = projects.slice(0, 20);
    setSavedProjects(trimmed);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // ignore quota error
    }
  };

  // Load saved projects & error memories
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: SavedEasyProject[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedProjects(parsed);
          // Load most recent project automatically if no URL prompt
          if (!searchParams.get("prompt")) {
            const latest = parsed[0];
            setActiveProjectId(latest.id);
            setPrompt(latest.prompt);
            setFormat(latest.format);
            setAiMode(latest.aiMode);
            setAspectRatio(latest.aspectRatio);
            setBlueprint(latest.blueprint);
            setMeta(latest.meta || null);
            setCompletedScenes(latest.completedScenes || []);
          }
        }
      }
    } catch {
      // ignore
    }
    loadMemories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Support ?prompt=...&autoRun=true from Home or Cmd+K
  useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    const autoRun = searchParams.get("autoRun");
    if (urlPrompt && !autoRunTriggered.current) {
      autoRunTriggered.current = true;
      setPrompt(urlPrompt);
      if (autoRun === "true") {
        handleBrainstorm(urlPrompt);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadMemories = async () => {
    try {
      const res = await fetch("/api/ai/error-memory");
      const data = await res.json();
      if (data.success && Array.isArray(data.memories)) {
        setErrorMemories(data.memories);
      }
    } catch {
      // ignore
    }
  };

  const handleCopy = async (text: string, key: string, toastLabel?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast(toastLabel || "ก๊อปปี้ลงคลิปบอร์ดเรียบร้อย", "success");
      setTimeout(() => setCopiedKey(null), 2200);
    } catch {
      showToast("ไม่สามารถก๊อปปี้ได้ กรุณาลากคลุมแล้วกด Ctrl+C", "error");
    }
  };

  const handleFetchTrends = async () => {
    setLoadingTrends(true);
    try {
      const res = await fetch("/api/ai/easy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TREND_RADAR" })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.trends)) {
        setTrends(data.trends);
        showToast("ดึงไอเดียเทรนด์ไวรัล & มีมล่าสุดแล้ว", "info");
      }
    } catch {
      showToast("ไม่สามารถดึงเทรนด์ได้ชั่วคราว", "error");
    } finally {
      setLoadingTrends(false);
    }
  };

  const handleBrainstorm = async (customPrompt?: string) => {
    const targetPrompt = (customPrompt ?? prompt).trim();
    if (!targetPrompt) return;
    if (customPrompt) setPrompt(customPrompt);
    setBrainstorming(true);
    setErrorMsg(null);
    setAngles([]);
    setResearchBrief(null);
    setActiveAngleId(null);
    try {
      const res = await fetch("/api/ai/easy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "BRAINSTORM", prompt: targetPrompt, aspectRatio, contentMode })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.angles)) {
        setAngles(data.angles);
        setResearchBrief(data.research_brief || null);
        showToast("ค้นข้อมูลจริง + คิด 5 แนวทางให้แล้ว เลือกแนวที่ชอบได้เลย", "success");
        loadMemories();
      } else {
        setErrorMsg(data.error || "ไม่สามารถคิดไอเดียได้ กรุณาลองใหม่");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setBrainstorming(false);
    }
  };

  const handleGenerate = async (customPrompt?: string, angle?: AngleIdea) => {
    const targetPrompt = (customPrompt ?? prompt).trim();
    if (!targetPrompt) return;
    if (customPrompt) setPrompt(customPrompt);
    if (angle) setActiveAngleId(angle.id);

    setLoading(true);
    setErrorMsg(null);
    setTtsAudioUrl(null);
    setSceneAudioUrls({});
    setEditingSceneNum(null);

    try {
      const res = await fetch("/api/ai/easy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE",
          prompt: targetPrompt,
          format,
          aiMode,
          aspectRatio,
          includeTrends,
          sceneCount,
          contentMode,
          contentGoal: angle?.goal || (contentMode === "SHORT_FILM" ? "FILM_DRAMA" : "COMMERCIAL"),
          selectedAngle: angle || undefined,
          researchBrief: researchBrief || undefined
        })
      });
      const data = await res.json();
      if (data.success && data.blueprint) {
        const newId = `proj-${Date.now()}`;
        const newProject: SavedEasyProject = {
          id: newId,
          prompt: targetPrompt,
          format,
          aiMode,
          aspectRatio,
          createdAt: new Date().toISOString(),
          blueprint: data.blueprint,
          meta: data.meta || null,
          completedScenes: []
        };
        setActiveProjectId(newId);
        setBlueprint(data.blueprint);
        setMeta(data.meta || null);
        setCompletedScenes([]);
        persistProjects([newProject, ...savedProjects.filter((p) => p.id !== newId)]);
        showToast("ถอดสูตรคอนเทนต์และบันทึกอัตโนมัติเรียบร้อย!", "success");
        loadMemories();
      } else {
        setErrorMsg(data.error || "ไม่สามารถสร้างแผนคอนเทนต์ได้ กรุณาลองใหม่");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSavedProject = (proj: SavedEasyProject) => {
    setActiveProjectId(proj.id);
    setPrompt(proj.prompt);
    setFormat(proj.format);
    setAiMode(proj.aiMode);
    setAspectRatio(proj.aspectRatio);
    setBlueprint(proj.blueprint);
    setMeta(proj.meta || null);
    setCompletedScenes(proj.completedScenes || []);
    setTtsAudioUrl(null);
    setSceneAudioUrls({});
    setEditingSceneNum(null);
    showToast(`เปิดโปรเจกต์ "${proj.blueprint.title}"`, "info");
  };

  const handleDeleteSavedProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedProjects.filter((p) => p.id !== id);
    persistProjects(updated);
    if (activeProjectId === id) {
      if (updated.length > 0) {
        handleSelectSavedProject(updated[0]);
      } else {
        setActiveProjectId(null);
        setBlueprint(null);
      }
    }
    showToast("ลบโปรเจกต์ออกจากประวัติแล้ว", "info");
  };

  const toggleSceneComplete = (sceneNumber: number) => {
    const next = completedScenes.includes(sceneNumber)
      ? completedScenes.filter((n) => n !== sceneNumber)
      : [...completedScenes, sceneNumber];
    setCompletedScenes(next);
    if (activeProjectId) {
      const updated = savedProjects.map((p) =>
        p.id === activeProjectId ? { ...p, completedScenes: next } : p
      );
      persistProjects(updated);
    }
  };

  const updateSceneField = (sceneNumber: number, field: "flow_prompt" | "voiceover_text", value: string) => {
    if (!blueprint?.video_blueprint) return;
    const updatedScenes = blueprint.video_blueprint.scenes.map((s) =>
      s.scene_number === sceneNumber ? { ...s, [field]: value } : s
    );
    const updatedFullVo =
      field === "voiceover_text"
        ? updatedScenes.map((s) => s.voiceover_text).filter(Boolean).join(" ")
        : blueprint.video_blueprint.full_voiceover_script;

    const updatedBlueprint: EasyBlueprint = {
      ...blueprint,
      video_blueprint: {
        ...blueprint.video_blueprint,
        scenes: updatedScenes,
        full_voiceover_script: updatedFullVo
      }
    };
    setBlueprint(updatedBlueprint);
    if (activeProjectId) {
      const updatedProjects = savedProjects.map((p) =>
        p.id === activeProjectId ? { ...p, blueprint: updatedBlueprint } : p
      );
      persistProjects(updatedProjects);
    }
  };

  const handleGenerateVoiceover = async (text: string, sceneNum?: number) => {
    if (!text.trim()) {
      showToast("ไม่มีข้อความสำหรับสร้างเสียงพากย์", "error");
      return;
    }
    if (sceneNum !== undefined) {
      setSceneTtsLoading(sceneNum);
    } else {
      setTtsLoading(true);
    }
    try {
      let storedKey = "";
      try {
        storedKey = localStorage.getItem("pk_elevenlabs_api_key") || "";
      } catch {
        // ignore
      }
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          voiceId: selectedVoice,
          apiKey: storedKey || undefined,
          mode: "generate_single"
        })
      });
      const data = await res.json();
      if (!res.ok || !data.audioBase64) {
        throw new Error(data.error || "ไม่สามารถสร้างเสียงพากย์ได้");
      }
      const dataUrl = `data:audio/mpeg;base64,${data.audioBase64}`;
      if (sceneNum !== undefined) {
        setSceneAudioUrls((prev) => ({ ...prev, [sceneNum]: dataUrl }));
        showToast(`สร้างเสียงพากย์ฉากที่ ${sceneNum} สำเร็จ!`, "success");
      } else {
        setTtsAudioUrl(dataUrl);
        showToast("สร้างไฟล์เสียงพากย์ MP3 ทั้งคลิปสำเร็จ!", "success");
      }
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาดในการสร้างเสียงพากย์", "error");
    } finally {
      if (sceneNum !== undefined) {
        setSceneTtsLoading(null);
      } else {
        setTtsLoading(false);
      }
    }
  };

  const buildAllPromptsOnly = () => {
    if (!blueprint?.video_blueprint?.scenes?.length) return "";
    return blueprint.video_blueprint.scenes
      .map(
        (s) =>
          `[Scene ${s.scene_number} - ${s.duration_sec}s | ${s.flow_mode || "Text to Video"}]\n${s.flow_prompt}`
      )
      .join("\n\n");
  };

  const buildSingleMasterMultiShotPrompt = () => {
    if (!blueprint?.video_blueprint?.scenes?.length) return "";
    const scenes = blueprint.video_blueprint.scenes;
    const styleLine = blueprint.film_bible?.visual_style || "Cinematic 4K commercial photorealism";
    const lockLine = blueprint.film_bible?.subject_identity_lock ? `${blueprint.film_bible.subject_identity_lock} ` : "";
    const shotSequence = scenes
      .map((s, i) => `Shot ${i + 1} (${s.camera_angle}): ${s.flow_prompt.replace(/no garbled text,?\s*no watermark\.?/gi, "").trim()}`)
      .join(" -> CUT TO: ");
    return `A seamless multi-shot cinematic sequence (${aspectRatio}, ${styleLine}). ${lockLine}${shotSequence}. Consistent lighting, cohesive color grading, smooth transitions, photorealistic 4K, no garbled text, no watermark.`;
  };

  const buildFlowToolProjectJSON = () => {
    if (!blueprint?.video_blueprint?.scenes?.length) return "";
    const scenes = blueprint.video_blueprint.scenes;
    const isFilm = blueprint.content_mode === "SHORT_FILM" || contentMode === "SHORT_FILM" || !!blueprint.film_bible;
    const payload = {
      version: "5.1-PKFLOW-PRO-FILM",
      exportedAt: new Date().toISOString(),
      source: "PK-Marketing-AI-OS",
      projectType: isFilm ? "SHORT_FILM" : "COMMERCIAL_SOCIAL",
      isCustomOSProject: true,
      aspectRatio,
      project: {
        id: `proj_${Date.now()}`,
        name: blueprint.title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sceneCount: scenes.length,
        doneCount: 0
      },
      filmBible: blueprint.film_bible || undefined,
      lyrics: scenes
        .map((s) => `[Scene ${s.scene_number}${s.act_badge ? ` | ${s.act_badge}` : ""}] ${s.voiceover_text || s.on_screen_text || s.what_to_shoot}`)
        .join("\n"),
      style: blueprint.film_bible?.visual_style || "Cinematic",
      targetDuration: isFilm ? "🎬 Cinematic Film Pacing" : "⚡ Dynamic Pacing",
      subtitleMode: "none",
      performanceMode: "acting",
      cameraMode: isFilm ? "smooth_pov" : "dynamic_mv",
      firstFrameChain: true,
      scenes: scenes.map((s) => ({
        id: `scene_${s.scene_number}_${Date.now()}`,
        lyrics: s.voiceover_text || s.on_screen_text || s.what_to_shoot,
        popupBadge: s.popup_badge || "",
        onScreenText: s.on_screen_text || "",
        subtitleLine: s.subtitle_line || "",
        soundFx: s.sound_fx || "",
        prompt: s.flow_prompt,
        duration: s.duration_sec || 5,
        pacingLabel: `⏱️ ${s.duration_sec || 5}s`,
        actBadge: s.act_badge || `🎬 ฉากที่ ${s.scene_number}`,
        cameraBadge: s.camera_badge || `🎥 ${s.camera_angle}`,
        thaiStory: s.thai_story_beats || `${s.what_to_shoot} (${s.continuity_note})`,
        status: "idle",
        retryAttempt: 0,
        variationIndex: 0
      }))
    };
    return JSON.stringify(payload, null, 2);
  };

  const handleDownloadFlowToolJSON = () => {
    const jsonStr = buildFlowToolProjectJSON();
    if (!jsonStr || !blueprint) return;
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${blueprint.title.replace(/[^\u0E00-\u0E7Fa-zA-Z0-9_-]+/g, "_")}_FlowTool.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("ดาวน์โหลดไฟล์ .JSON สำหรับโหลดเข้า Google Flow Tool แล้ว!", "success");
  };

  const buildFullTextToCopy = () => {
    if (!blueprint) return "";
    const lines: string[] = [];
    lines.push(`📌 ${blueprint.title}`);
    if (blueprint.hook_3sec) lines.push(`⚡ Hook 3 วิแรก: ${blueprint.hook_3sec}`);
    if (blueprint.viral_meme_angle) lines.push(`🔥 มุมไวรัล/มีม: ${blueprint.viral_meme_angle}`);
    lines.push(`💡 แนวคิด: ${blueprint.concept}\n`);
    if (blueprint.text_overlay_pack?.length) {
      lines.push("💬 ตัวหนังสือป๊อปอัพในคลิป (วางใน CapCut ตามเวลา):");
      blueprint.text_overlay_pack.forEach((t) => lines.push(`• ${t.time_range} | ${t.popup_badge} | ${t.on_screen_text} | คำบรรยาย: ${t.subtitle_line}`));
      lines.push("");
    }

    if (blueprint.video_blueprint && (format === "VIDEO" || format === "BOTH")) {
      const vb = blueprint.video_blueprint;
      lines.push(`🎬 แผนผลิตวิดีโอ (${vb.scene_count} ฉาก | รวม ${vb.total_duration_sec} วินาที | สัดส่วน ${aspectRatio})`);
      lines.push(`🎵 เพลง/อารมณ์: ${vb.mood_and_music}\n`);
      vb.scenes?.forEach((s) => {
        lines.push(`--- ฉากที่ ${s.scene_number} (${s.duration_sec} วิ) [${s.flow_mode || "Text to Video"}] ---`);
        lines.push(`• ภาพ/เหตุการณ์: ${s.what_to_shoot}`);
        lines.push(`• มุมกล้อง: ${s.camera_angle}`);
        lines.push(`• ต่อเนื่อง: ${s.continuity_note}`);
        lines.push(`• เสียงพากย์: "${s.voiceover_text}"`);
        lines.push(`• ข้อความขึ้นจอ: ${s.on_screen_text}`);
        lines.push(`• Google Flow Prompt: ${s.flow_prompt}\n`);
      });
      if (vb.editing_guide?.length) {
        lines.push(`✂️ คู่มือตัดต่อ:`);
        vb.editing_guide.forEach((g) => lines.push(`  ${g}`));
        lines.push("");
      }
      lines.push(`🎙️ บทพากย์รวม:\n${vb.full_voiceover_script}\n`);
    }

    if (blueprint.photo_blueprint && (format === "PHOTO" || format === "BOTH")) {
      const pb = blueprint.photo_blueprint;
      lines.push(`📸 แผนภาพนิ่ง (${pb.photo_style})`);
      pb.shots?.forEach((sh) => {
        lines.push(`• รูปที่ ${sh.shot_number} (${sh.role}):`);
        lines.push(`  มุมกล้อง: ${sh.angle_and_framing}`);
        lines.push(`  แสง & พร็อพ: ${sh.lighting_and_props}`);
        lines.push(`  พาดหัวบนรูป: ${sh.text_overlay}`);
        lines.push(`  Prompt: ${sh.image_prompt}`);
      });
      lines.push("");
    }

    lines.push(`✍️ แคปชันพร้อมโพสต์:\n${blueprint.social_caption}`);
    lines.push(`\n${(blueprint.hashtags || []).join(" ")}`);
    return lines.join("\n");
  };

  const handleClearMemories = async () => {
    try {
      await fetch("/api/ai/error-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CLEAR" })
      });
      setErrorMemories([]);
      showToast("ล้างประวัติความจำข้อผิดพลาดเรียบร้อย", "info");
    } catch {
      // ignore
    }
  };

  const totalScenes = blueprint?.video_blueprint?.scenes?.length || 0;
  const completedCount = completedScenes.filter((n) =>
    blueprint?.video_blueprint?.scenes?.some((s) => s.scene_number === n)
  ).length;
  const progressPct = totalScenes > 0 ? Math.round((completedCount / totalScenes) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-20">
      {/* 1. Clean Editorial Creator Command Card */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-8 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Solo AI Creator Workspace</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              พิมพ์ไอเดียช่องเดียว → พร้อมเจนใน Google Flow
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              คิด Hook หยุดนิ้ว 3 วิแรก ผสมกระแสไวรัล/มีม จัด Prompt รายฉาก 5–8 วิ และสร้างเสียงพากย์ MP3 จบในหน้าเดียว
            </p>
          </div>

          <button
            type="button"
            onClick={handleFetchTrends}
            disabled={loadingTrends}
            className="w-full md:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            {loadingTrends ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Flame className="w-3.5 h-3.5 text-amber-400" />}
            <span>{loadingTrends ? "กำลังสแกนเทรนด์..." : "ดึงเทรนด์ไวรัล & มีมวันนี้"}</span>
          </button>
        </div>

        {/* Trend & Viral Radar */}
        {trends.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                ไอเดียตามกระแส & มีมน่าเล่น (คลิกเพื่อนำไปถอดสูตรทันที)
              </span>
              <button
                type="button"
                onClick={() => setTrends([])}
                className="text-[11px] text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ซ่อน
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {trends.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleBrainstorm(t.prompt_idea)}
                  disabled={loading}
                  className="text-left p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-2"
                >
                  <div>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 mb-1.5">
                      {t.tag}
                    </span>
                    <div className="text-xs font-bold text-slate-900 leading-snug">{t.title}</div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{t.why_viral}</p>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>ใช้ไอเดียนี้ →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mode Switcher: Social/Commercial vs Short Film (PKFLOW PRO FILM) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setContentMode("SOCIAL");
              setAspectRatio("9:16");
              setAngles([]);
              setResearchBrief(null);
            }}
            className={`min-h-[44px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              contentMode === "SOCIAL"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>⚡ คอนเทนต์โซเชียล / ขายของ</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setContentMode("SHORT_FILM");
              setAspectRatio("16:9");
              setAngles([]);
              setResearchBrief(null);
            }}
            className={`min-h-[44px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              contentMode === "SHORT_FILM"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🎬 หนังสั้น (PKFLOW PRO FILM)</span>
          </button>
        </div>

        {/* Main Prompt Input */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading && !brainstorming) handleBrainstorm();
              }}
              placeholder={contentMode === "SHORT_FILM" ? "พิมพ์ไอเดียหนังสั้น เช่น: หนังสั้นดราม่าพ่อลูกในร้านก๋วยเตี๋ยว หักมุมซึ้งๆ..." : "พิมพ์สิ่งที่อยากทำเป็นภาษาคน เช่น: ช่วยคิดคอนเทนต์ไปวัดร่องขุ่น เชียงราย..."}
              className="flex-1 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-500/10 transition-all"
            />
            <button
              type="button"
              onClick={() => handleBrainstorm()}
              disabled={loading || brainstorming || !prompt.trim()}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              {loading || brainstorming ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{brainstorming ? "กำลังค้นข้อมูลจริง..." : "กำลังถอดสูตร..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ค้นข้อมูล + คิดไอเดีย</span>
                </>
              )}
            </button>
          </div>

          {/* Symmetric Controls Bar (Flush Grid on iPhone 17, Clean Inline on Desktop) */}
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-2 pt-0.5">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
              จำนวนฉาก
              <select
                value={sceneCount}
                onChange={(e) => setSceneCount(e.target.value)}
                className="min-h-[38px] px-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
              >
                <option value="AUTO">AI เลือกให้ (5-10 ฉาก)</option>
                {[4, 5, 6, 8, 10, 12].map((n) => (
                  <option key={n} value={String(n)}>{n} ฉาก</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 sm:inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 gap-1">
              <button
                type="button"
                onClick={() => setAiMode("AI_FLOW")}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  aiMode === "AI_FLOW" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                เจน AI ใน Google Flow
              </button>
              <button
                type="button"
                onClick={() => setAiMode("REAL_SHOOT")}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  aiMode === "REAL_SHOOT" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ถ่ายทำเอง
              </button>
            </div>

            <div className="grid grid-cols-3 sm:inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 gap-1">
              {[
                { id: "VIDEO", label: "วิดีโอ", icon: Video },
                { id: "PHOTO", label: "ภาพนิ่ง", icon: Camera },
                { id: "BOTH", label: "ทั้งคู่", icon: Layers }
              ].map((item) => {
                const Icon = item.icon;
                const active = format === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormat(item.id as any)}
                    className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1 ${
                      active ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
              <div className="grid grid-cols-2 sm:inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 gap-1">
                <button
                  type="button"
                  onClick={() => setAspectRatio("9:16")}
                  className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1 ${
                    aspectRatio === "9:16" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>9:16</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio("16:9")}
                  className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1 ${
                    aspectRatio === "16:9" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>16:9</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIncludeTrends(!includeTrends)}
                className={`min-h-[44px] sm:min-h-[42px] px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                  includeTrends
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-white border-slate-200 text-slate-500"
                }`}
              >
                <Flame className={`w-3.5 h-3.5 shrink-0 ${includeTrends ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="truncate">{includeTrends ? "Hook + มีมไวรัล" : "โหมดปกติ"}</span>
              </button>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">ลองกด:</span>
            {(contentMode === "SHORT_FILM" ? SHORT_FILM_EXAMPLES : QUICK_EXAMPLES).map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleBrainstorm(ex)}
                disabled={loading}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </section>

      {/* 2. Auto-Saved Project History Strip */}
      {savedProjects.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-emerald-600" />
              <span>งานที่บันทึกอัตโนมัติ ({savedProjects.length} โปรเจกต์ — รีเฟรชไม่หาย)</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
            {savedProjects.map((proj) => {
              const isSelected = proj.id === activeProjectId;
              return (
                <div
                  key={proj.id}
                  onClick={() => handleSelectSavedProject(proj)}
                  className={`group shrink-0 max-w-[240px] px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{proj.blueprint.title}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                      {proj.aspectRatio} · {new Date(proj.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSavedProject(e, proj.id)}
                    className={`p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity cursor-pointer ${
                      isSelected ? "hover:bg-slate-800 text-slate-300" : "hover:bg-rose-50 hover:text-rose-600 text-slate-400"
                    }`}
                    title="ลบโปรเจกต์นี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Loading Skeleton */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
            <div className="h-28 bg-slate-100 rounded-xl" />
            <div className="h-28 bg-slate-100 rounded-xl" />
          </div>
        </div>
      )}

      {/* 4. Generated Blueprint Result */}
      {(brainstorming || researchBrief || angles.length > 0) && (
        <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-5 shadow-sm">
          {brainstorming && (
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              กำลังค้นข้อมูลจริงจากเว็บ แล้วคิด 5 แนวทางให้...
            </div>
          )}
          {researchBrief && (
            <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-4 space-y-2">
              <div className="text-xs font-bold text-emerald-800">📍 ข้อมูลจริงที่ใช้ก่อนเขียนสคริปต์</div>
              <div className="text-sm font-extrabold text-slate-900">{researchBrief.subject}</div>
              {researchBrief.location_or_context && <p className="text-xs text-slate-700 leading-relaxed">{researchBrief.location_or_context}</p>}
              {researchBrief.highlights?.length > 0 && (
                <ul className="text-xs text-slate-700 list-disc pl-4 space-y-0.5">
                  {researchBrief.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              )}
              {researchBrief.practical_info && <p className="text-xs text-slate-700"><b>ข้อมูลที่ควรรู้:</b> {researchBrief.practical_info}</p>}
              {researchBrief.what_to_shoot?.length > 0 && (
                <div className="text-xs text-slate-700"><b>ควรถ่ายอะไร:</b>
                  <ul className="list-disc pl-4 mt-0.5 space-y-0.5">{researchBrief.what_to_shoot.map((w, i) => <li key={i}>{w}</li>)}</ul>
                </div>
              )}
              {researchBrief.sources && researchBrief.sources.length > 0 && (
                <div className="text-[11px] text-slate-500">แหล่งข้อมูล: {researchBrief.sources.map((src, i) => (
                  <a key={i} href={src.url} target="_blank" rel="noreferrer" className="underline mr-2">{src.title}</a>
                ))}</div>
              )}
            </div>
          )}
          {angles.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-extrabold text-slate-900">เลือกแนวคอนเทนต์ที่อยากทำ (กดแล้วสร้างสคริปต์ + Prompt ให้ทันที)</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {angles.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    disabled={loading}
                    onClick={() => handleGenerate(prompt, a)}
                    className={`text-left rounded-xl border p-4 space-y-1.5 transition-all cursor-pointer min-h-[44px] ${activeAngleId === a.id ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-400"}`}
                  >
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-900 text-white text-[11px] font-bold">{a.category_badge}</span>
                    <div className="text-sm font-extrabold text-slate-900 leading-snug">{a.title}</div>
                    <div className="text-xs text-emerald-800 font-semibold">{a.hook_preview}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{a.description}</p>
                    <p className="text-[11px] text-slate-500">ทำไมปัง: {a.why_it_works}</p>
                    <div className="text-xs font-bold text-emerald-700">{loading && activeAngleId === a.id ? "กำลังสร้างสคริปต์..." : "สร้างสคริปต์แนวนี้ →"}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {!loading && blueprint && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Header Summary + Clean Symmetric Action Bar */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="space-y-4 border-b border-slate-100 pb-5">
              {/* Full-Width Title & Concept (Never Squished) */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    blueprint.film_bible || contentMode === "SHORT_FILM"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {blueprint.film_bible || contentMode === "SHORT_FILM" ? "🎬 โหมดหนังสั้น PKFLOW PRO FILM" : "⚡ โหมดคอนเทนต์โซเชียล"}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {aspectRatio} • {blueprint.video_blueprint?.scenes?.length || 0} ฉาก
                  </span>
                  {meta?.modelUsed && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      {meta.modelUsed}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {blueprint.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
                  {blueprint.concept}
                </p>
              </div>

              {/* Primary 1-Click Multi-Scene Flow Export */}
              {blueprint.video_blueprint?.scenes?.length ? (
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          buildFlowToolProjectJSON(),
                          "FLOW_JSON",
                          `ก๊อปครบทั้ง ${blueprint.video_blueprint?.scenes?.length || 0} ฉากในครั้งเดียวแล้ว! ไปกด 'วางจาก OS' ใน Flow Tool ได้เลย`
                        )
                      }
                      className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    >
                      {copiedKey === "FLOW_JSON" ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Copy className="w-4 h-4 text-emerald-400 shrink-0" />}
                      <span>
                        {blueprint.film_bible || contentMode === "SHORT_FILM"
                          ? `⚡ ก๊อปทุกฉากทีเดียว (${blueprint.video_blueprint.scenes.length} ฉาก) ➔ PKFLOW PRO FILM`
                          : `⚡ ก๊อปทุกฉากทีเดียว (${blueprint.video_blueprint.scenes.length} ฉาก) ➔ Flow Tool`}
                      </span>
                    </button>

                    <a
                      href={blueprint.film_bible || contentMode === "SHORT_FILM" ? PKFLOW_PRO_FILM_URL : PK_COMMERCIAL_STUDIO_URL}
                      target="_blank"
                      rel="noreferrer"
                      className={`min-h-[46px] px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors shadow-xs ${
                        blueprint.film_bible || contentMode === "SHORT_FILM"
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      <span>
                        {blueprint.film_bible || contentMode === "SHORT_FILM"
                          ? "🎬 เปิด PKFLOW PRO FILM Studio ↗"
                          : "🚀 เปิด PK Commercial Studio ↗"}
                      </span>
                    </a>
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    💡 <b>ไม่ต้องก๊อปทีละฉาก:</b> กดปุ่มสีดำด้านบนแค่ <b>1 ครั้ง</b> ➔ กดเปิด Tool ด้านขวา ➔ กด <b>&ldquo;วางจาก OS&rdquo;</b> ทุกฉากจะเรียงคิวอัตโนมัติพร้อมเจนรวดเดียว ไม่มีตกหล่น
                  </p>

                  {/* Secondary Utility Actions (Symmetric 3-Column Row) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          buildSingleMasterMultiShotPrompt(),
                          "MASTER_MULTI",
                          "ก๊อป Master Prompt ใบเดียว (รวบทุกฉาก) แล้ว!"
                        )
                      }
                      className="min-h-[42px] px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey === "MASTER_MULTI" ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      <span>Copy Master Prompt เดียว (รวบทุกฉาก)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadFlowToolJSON}
                      className="min-h-[42px] px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>โหลดไฟล์ .JSON เข้า Flow Tool</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(buildFullTextToCopy(), "ALL", "ก๊อปปี้สูตรทั้งหมดพร้อมส่งลง LINE / Note แล้ว!")
                      }
                      className="min-h-[42px] px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey === "ALL" ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                      <span>Copy สูตรทั้งหมด (LINE / Note)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(buildFullTextToCopy(), "ALL", "ก๊อปปี้สูตรทั้งหมดพร้อมส่งลง LINE / Note แล้ว!")
                    }
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedKey === "ALL" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy สูตรทั้งหมด</span>
                  </button>
                </div>
              )}
            </div>

            {(blueprint.hook_3sec || blueprint.viral_meme_angle) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blueprint.film_bible && (
                  <div className="rounded-2xl bg-indigo-50/70 border border-indigo-200 p-4 sm:p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[11px] font-bold mb-1">
                          🎬 คัมภีร์หนังสั้นสำหรับ PKFLOW PRO FILM Studio
                        </span>
                        <div className="text-sm font-extrabold text-slate-900">
                          {blueprint.film_bible.genre} • {blueprint.film_bible.visual_style}
                        </div>
                      </div>
                    </div>
                    {blueprint.film_bible.logline && (
                      <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        <b>Logline:</b> {blueprint.film_bible.logline}
                      </p>
                    )}
                    {blueprint.film_bible.acts_overview?.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {blueprint.film_bible.acts_overview.map((act, i) => (
                          <div key={i} className="rounded-xl bg-white border border-indigo-100 p-3 text-xs text-slate-700 leading-relaxed">
                            {act}
                          </div>
                        ))}
                      </div>
                    )}
                    {blueprint.film_bible.characters?.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-indigo-900">🎭 ตัวละครหลัก (ก๊อป Prompt ไปเจนรูป Character Sheet ใน PKFLOW PRO FILM)</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {blueprint.film_bible.characters.map((ch, i) => (
                            <div key={i} className="rounded-xl bg-white border border-indigo-100 p-3 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-slate-900">{ch.name} ({ch.role})</span>
                                {ch.character_sheet_prompt && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(ch.character_sheet_prompt, `CHAR_${i}`, `ก๊อป Prompt ตัวละคร ${ch.name} แล้ว!`)}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer shrink-0"
                                  >
                                    {copiedKey === `CHAR_${i}` ? "✓ ก๊อปแล้ว" : "Copy Prompt ตัวละคร"}
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600">{ch.appearance_thai}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {blueprint.film_bible.locations?.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-indigo-900">📍 โลเคชันหลัก (ก๊อป Prompt ไปใส่ช่อง Scene Reference)</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {blueprint.film_bible.locations.map((loc, i) => (
                            <div key={i} className="rounded-xl bg-white border border-indigo-100 p-3 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-slate-900">{loc.name}</span>
                                {loc.location_ref_prompt && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(loc.location_ref_prompt, `LOC_${i}`, `ก๊อป Prompt โลเคชัน ${loc.name} แล้ว!`)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold cursor-pointer shrink-0"
                                  >
                                    {copiedKey === `LOC_${i}` ? "✓ ก๊อปแล้ว" : "Copy Prompt ฉากหลัก"}
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600">{loc.mood}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {blueprint.hook_3sec && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hook 3 วินาทีแรก (หยุดนิ้วคนดู)</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{blueprint.hook_3sec}</p>
                  </div>
                )}
                {blueprint.viral_meme_angle && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>มุมเล่นกระแส / มีมไวรัล</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{blueprint.viral_meme_angle}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Google Flow Bridge Setup Guide */}
          {blueprint.flow_setup_guide && aiMode === "AI_FLOW" && (
            <section className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Google Flow Bridge · ตั้งค่าก่อนวาง Prompt
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
                      โหมด: <strong className="text-white">{blueprint.flow_setup_guide.tool_mode}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
                      สัดส่วน: <strong className="text-emerald-400">{blueprint.flow_setup_guide.aspect_ratio}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
                      โมเดล: <strong className="text-white">{blueprint.flow_setup_guide.recommended_model}</strong>
                    </span>
                  </div>
                </div>

                <a
                  href="https://flow.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-colors shrink-0"
                >
                  <span>เปิด Google Flow</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {blueprint.flow_setup_guide.quick_steps?.map((st, idx) => (
                  <div key={idx} className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 leading-relaxed">
                    {st}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. Video Production Scenes with Checklist + Inline Edit + Per-Scene Audio */}
          {blueprint.video_blueprint && (format === "VIDEO" || format === "BOTH") && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-600" />
                    <span>รายการฉากสำหรับ Google Flow ({blueprint.video_blueprint.scene_count} ฉาก)</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> รวม ~{blueprint.video_blueprint.total_duration_sec} วิ
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Music className="w-3.5 h-3.5 text-slate-400" /> {blueprint.video_blueprint.mood_and_music}
                    </span>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="min-w-[180px] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-600">ความคืบหน้าเจนใน Flow</span>
                    <span className="text-emerald-700">{completedCount}/{totalScenes} ฉาก ({progressPct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Scene Cards */}
              <div className="space-y-4">
                {blueprint.video_blueprint.scenes?.map((scene) => {
                  const isDone = completedScenes.includes(scene.scene_number);
                  const isEditing = editingSceneNum === scene.scene_number;
                  return (
                    <div
                      key={scene.scene_number}
                      className={`border rounded-xl p-4 sm:p-5 space-y-3.5 transition-all ${
                        isDone
                          ? "bg-emerald-50/30 border-emerald-200/80"
                          : "bg-slate-50/60 border-slate-200"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSceneComplete(scene.scene_number)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              isDone
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "bg-white border-slate-300 text-slate-800 hover:border-emerald-500"
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5 text-slate-400" />}
                            <span>ฉากที่ {scene.scene_number}</span>
                          </button>

                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-xs font-semibold">
                            {scene.duration_sec} วิ
                          </span>

                          {scene.flow_mode && (
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-100 text-[11px] font-semibold">
                              {scene.flow_mode}
                            </span>
                          )}

                          {scene.act_badge && (
                            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 text-[11px] font-bold">{scene.act_badge}</span>
                          )}
                          {scene.popup_badge && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px] font-bold">{scene.popup_badge}</span>
                          )}
                          {scene.sound_fx && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">🔊 {scene.sound_fx}</span>
                          )}
                          {scene.on_screen_text && (
                            <span className="text-xs font-semibold text-slate-700">
                              ขึ้นจอ: &ldquo;{scene.on_screen_text}&rdquo;
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditingSceneNum(isEditing ? null : scene.scene_number)}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-200/60 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>{isEditing ? "เสร็จสิ้น" : "แก้ไขข้อความ"}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                          <div className="text-[11px] font-bold text-slate-500 mb-1">ภาพในฉากนี้</div>
                          <div className="text-slate-800 leading-relaxed">{scene.what_to_shoot}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                          <div className="text-[11px] font-bold text-slate-500 mb-1">มุมกล้อง & การขยับ</div>
                          <div className="text-slate-800 leading-relaxed">{scene.camera_angle}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                          <div className="text-[11px] font-bold text-slate-500 mb-1">ความต่อเนื่อง</div>
                          <div className="text-slate-800 leading-relaxed">{scene.continuity_note}</div>
                        </div>
                      </div>

                      {/* Voiceover & Flow Prompt */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between gap-2.5">
                          <div>
                            <div className="text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                              <Mic className="w-3.5 h-3.5 text-emerald-600" />
                              <span>บทพากย์ฉากนี้</span>
                            </div>
                            {isEditing ? (
                              <textarea
                                rows={2}
                                value={scene.voiceover_text}
                                onChange={(e) => updateSceneField(scene.scene_number, "voiceover_text", e.target.value)}
                                className="w-full p-2 text-xs border border-emerald-400 rounded-lg focus:outline-none"
                              />
                            ) : (
                              <div className="text-slate-900 font-medium leading-relaxed">&ldquo;{scene.voiceover_text}&rdquo;</div>
                            )}
                          </div>

                          {sceneAudioUrls[scene.scene_number] && (
                            <audio controls src={sceneAudioUrls[scene.scene_number]} className="w-full h-8" />
                          )}

                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleGenerateVoiceover(scene.voiceover_text, scene.scene_number)}
                              disabled={sceneTtsLoading === scene.scene_number}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              {sceneTtsLoading === scene.scene_number ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Volume2 className="w-3 h-3 text-emerald-600" />
                              )}
                              <span>เจนเสียงฉากนี้</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(scene.voiceover_text, `vo-${scene.scene_number}`, `ก๊อปบทพากย์ฉาก ${scene.scene_number} แล้ว`)
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === `vo-${scene.scene_number}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>Copy</span>
                            </button>
                          </div>
                        </div>

                        <div className="bg-slate-900 text-slate-100 rounded-lg p-3.5 flex flex-col justify-between gap-2.5">
                          <div>
                            <div className="text-[11px] font-bold text-emerald-400 mb-1">
                              Google Flow Prompt (ก๊อปไปวางช่อง Describe your video)
                            </div>
                            {isEditing ? (
                              <textarea
                                rows={3}
                                value={scene.flow_prompt}
                                onChange={(e) => updateSceneField(scene.scene_number, "flow_prompt", e.target.value)}
                                className="w-full p-2 text-[11px] font-mono bg-slate-800 text-white border border-emerald-500 rounded-lg focus:outline-none"
                              />
                            ) : (
                              <div className="text-slate-200 font-mono text-[11px] leading-relaxed break-words">
                                {scene.flow_prompt}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  scene.flow_prompt,
                                  `fp-${scene.scene_number}`,
                                  `ก๊อป Prompt ฉาก ${scene.scene_number} แล้ว! วางลง Google Flow ได้เลย`
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              {copiedKey === `fp-${scene.scene_number}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>Copy Prompt ฉาก {scene.scene_number}</span>
                            </button>
                            <a
                              href="https://flow.google.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold inline-flex items-center gap-1"
                            >
                              <span>ไปวาง</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full Voiceover Studio (ElevenLabs) + Editing Guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-emerald-600" />
                      <span>สร้างเสียงพากย์ MP3 ทั้งคลิป (ElevenLabs)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(blueprint.video_blueprint?.full_voiceover_script || "", "vo-all", "ก๊อปบทพากย์รวมแล้ว")
                      }
                      className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy บทพากย์</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80 whitespace-pre-line">
                    {blueprint.video_blueprint.full_voiceover_script}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      {VOICE_OPTIONS.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleGenerateVoiceover(blueprint.video_blueprint?.full_voiceover_script || "")}
                      disabled={ttsLoading}
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {ttsLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{ttsLoading ? "กำลังสร้างเสียง..." : "สร้างเสียงพากย์ MP3"}</span>
                    </button>
                  </div>

                  {ttsAudioUrl && (
                    <div className="bg-white border border-emerald-200 rounded-xl p-3 space-y-2 animate-fade-in">
                      <audio controls src={ttsAudioUrl} className="w-full h-9" />
                      <a
                        href={ttsAudioUrl}
                        download={`${blueprint.title.replace(/[^\wก-๙]+/g, "_")}_voiceover.mp3`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ดาวน์โหลดไฟล์เสียง MP3 ไปใส่ CapCut</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-slate-600" />
                    <span>คู่มือตัดต่อใน CapCut (Editing Guide)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {blueprint.video_blueprint.editing_guide?.map((step, i) => (
                      <li key={i} className="leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* 6. Photo Blueprint */}
          {blueprint.photo_blueprint && (format === "PHOTO" || format === "BOTH") && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>แผนภาพนิ่ง & อัลบั้มสไลด์</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">สไตล์ภาพ: {blueprint.photo_blueprint.photo_style}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blueprint.photo_blueprint.shots?.map((shot) => (
                  <div key={shot.shot_number} className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-bold">
                        รูปที่ {shot.shot_number}: {shot.role}
                      </span>
                      {shot.text_overlay && (
                        <span className="font-semibold text-slate-700 truncate">&ldquo;{shot.text_overlay}&rdquo;</span>
                      )}
                    </div>
                    <div className="text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">มุมกล้อง: </strong>{shot.angle_and_framing}
                    </div>
                    <div className="text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">แสง & พร็อพ: </strong>{shot.lighting_and_props}
                    </div>
                    <div className="bg-slate-900 text-slate-100 rounded-lg p-3 flex items-start justify-between gap-2">
                      <span className="font-mono text-[11px] text-slate-200 break-words leading-relaxed">{shot.image_prompt}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(shot.image_prompt, `img-${shot.shot_number}`, `ก๊อป Prompt รูปที่ ${shot.shot_number} แล้ว`)}
                        className="px-2.5 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedKey === `img-${shot.shot_number}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 7. Social Caption */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-base text-slate-900">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>แคปชัน & แฮชแท็กพร้อมโพสต์</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `${blueprint.social_caption}\n\n${(blueprint.hashtags || []).join(" ")}`,
                    "caption",
                    "ก๊อปปี้แคปชันและแฮชแท็กเรียบร้อย!"
                  )
                }
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === "caption" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy แคปชัน</span>
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-line leading-relaxed">
              {blueprint.social_caption}
              {"\n\n"}
              <span className="text-emerald-700 font-semibold">{(blueprint.hashtags || []).join(" ")}</span>
            </div>
          </section>
        </div>
      )}

      {/* 8. Compact Self-Healing Error Memory Panel */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">
                ระบบป้องกันข้อผิดพลาดอัตโนมัติ (Self-Healing Error Memory)
              </h3>
              <p className="text-[11px] text-slate-500">
                จำจุดที่เคยขัดข้องและข้ามไปใช้โมเดลสำรองที่เสถียรกว่าทันที
              </p>
            </div>
          </div>
          {errorMemories.length > 0 && (
            <button
              type="button"
              onClick={handleClearMemories}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างประวัติ</span>
            </button>
          )}
        </div>

        {errorMemories.length === 0 ? (
          <div className="text-xs text-emerald-800 bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-3.5 py-2.5 font-medium">
            ✓ ระบบทำงานปกติทุกโมเดล ไม่มีข้อผิดพลาดค้างอยู่
          </div>
        ) : (
          <div className="space-y-2">
            {errorMemories.slice(0, 5).map((mem) => (
              <div key={mem.id} className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900">[{mem.category}] {mem.message}</span>
                  <div className="text-emerald-700 font-medium mt-0.5">
                    ↳ แก้ไขอัตโนมัติ: {mem.resolution}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold shrink-0">
                  ป้องกันแล้ว ({mem.occurrences} ครั้ง)
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
