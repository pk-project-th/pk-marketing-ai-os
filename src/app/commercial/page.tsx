"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Film,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  RotateCw,
  Trash2,
  Camera,
  CheckCircle2,
  Zap,
  Image as ImageIcon,
  Compass,
  ArrowRight,
  User,
  ShoppingBag,
  Info,
  Eye,
  Download,
  Code2,
  Volume2,
  RefreshCw,
  Clock,
  Sliders,
  Play,
  Type,
  Wand2,
  Layers,
  Save,
  FolderOpen,
  X
} from "lucide-react";
import { useBrand } from "@/context/BrandContext";
import { ContentIdea } from "@/types";
import { SceneData, ReferenceAssetGuide } from "@/app/api/ai/commercial/route";

export interface CommercialProject {
  id: string;
  name: string;
  brandName?: string;
  productName: string;
  targetDuration: number;
  sceneCount: number;
  aspectRatio: string;
  adStyle: string;
  referenceMode: "pure_prompt" | "with_images";
  scenes: SceneData[];
  masterDirectiveV3: string;
  referenceGuides?: ReferenceAssetGuide[];
  createdAt: string;
  updatedAt: string;
}

const GOOGLE_FLOW_TOOL_URL = "https://labs.google/fx/tools/flow/shared/tool/cfc7240d-3118-41b6-a08d-4bac91a1b1c5";

const GOOGLE_FLOW_FIX_PROMPT = `CRITICAL ARCHITECTURE UPGRADE: PK STUDIO v6.0 PRO — SPLIT PIPELINE & FULL FIELD EDITOR:

จากหลักฐานการใช้งานจริง ปัญหาหลัก 3 ข้อที่ต้องแก้ไขทันที:

## ปัญหาที่ 1: ⚡ รูปภาพเจนได้แต่วิดีโอเจนไม่ได้
- สาเหตุ: ระบบเดิมรวม Image + Video เป็น Pipeline เดียว เมื่อ Veo ปฏิเสธภาพ (Safety / Quota) ทั้งช็อตจะล้มเหลวทันที
- แก้ไข: แยก Pipeline เป็น 2 ขั้นตอนอิสระ 100% (Two-Stage Split Pipeline):
  1) ปุ่ม "🖼️ เจนรูปทั้งหมด (Batch Images)" → เรียก generateImage สำหรับทุกช็อตพร้อมกัน (Promise.allSettled) ไม่ยุ่งกับวิดีโอ
  2) ปุ่ม "🎬 เจนวิดีโอทั้งหมด (Batch Videos)" → เรียก generateVideo สำหรับทุกช็อตที่มีรูปภาพแล้ว ถ้าช็อตไหนไม่มีรูปให้ fallback เป็น Text-to-Video อัตโนมัติ
  3) ในแต่ละการ์ดช็อต มีปุ่ม:
     - "🖼️ เจนรูปช็อตนี้" (เฉพาะรูปภาพ)
     - "🎬 เจนวิดีโอช็อตนี้" (เฉพาะวิดีโอ จากรูปที่มีอยู่แล้ว หรือ Text-to-Video)
     - "🎥 Text-to-Video" (บายพาสรูปภาพ สร้างวิดีโอจากข้อความโดยตรง)

## ปัญหาที่ 2: ✏️ ฟิลด์แก้ไขไม่ตรงกับ OS (ต้อง Sync ทุกฟิลด์)
- แก้ไข: Inline Editor ครบ 4 ฟิลด์เหมือน PK Marketing AI OS:
  1) 📸 Visual Prompt (EN) — Prompt สร้างรูปภาพ
  2) 🎬 Motion Prompt (EN) — Prompt สั่ง Camera & Veo
  3) 🎙️ Thai Voiceover — เสียงพากย์ภาษาไทย
  4) 📝 On-Screen Text (TH) — ข้อความบนจอภาษาไทย
- ทุกฟิลด์ต้อง copy-paste ได้ทั้งจาก OS มา Flow และจาก Flow กลับ OS

## ปัญหาที่ 3: 💥 "Expected object response with media fields" Crash
- แก้ไข: Media Fields Armor ป้องกันทุกกรณี:
  * const cleanImg = (typeof imgUrl === 'string' && imgUrl.startsWith('http')) ? imgUrl : null;
  * ถ้ามี cleanImg ➔ generateVideo({ image: cleanImg, prompt: motionPrompt })
  * ถ้าไม่มี cleanImg ➔ ห้ามส่ง image: undefined เด็ดขาด! ➔ generateVideo({ prompt: (visualPrompt + '. ' + motionPrompt).trim() })

---

แก้ไขโครงสร้างโค้ดทั้งหมดดังนี้:

### 1. 🗂️ SHOT STATE MANAGEMENT (แต่ละช็อตแยกสถานะอิสระ):
const [shotStates, setShotStates] = useState<Record<string, {
  imgStatus: 'idle' | 'generating' | 'success' | 'error';
  vidStatus: 'idle' | 'generating' | 'success' | 'error';
  imgErrorMsg?: string;
  vidErrorMsg?: string;
  imageUrl?: string;
  videoUrl?: string;
}>>({});

### 2. 🖼️ IMAGE GENERATION FUNCTIONS (แยกจาก Video 100%):
async function generateSingleImage(shot: ShotItem) {
  const shotId = String(shot.shotNumber);
  setShotStates(prev => ({ ...prev, [shotId]: { ...prev[shotId], imgStatus: 'generating', imgErrorMsg: undefined } }));
  try {
    const cleanPrompt = (shot.visualPrompt || '').replace(/--ar\\s*\\d+:\\d+/gi, '').trim() + ', zero in-image text, zero watches, zero cars, zero jewelry, pure culinary cinematography';
    const result = await generateImage({ prompt: cleanPrompt, aspectRatio: '9:16' });
    const url = typeof result === 'string' ? result : (result?.url || result?.media?.[0]?.url || null);
    if (!url) throw new Error('ไม่ได้รับรูปภาพจากระบบ');
    setShotStates(prev => ({ ...prev, [shotId]: { ...prev[shotId], imgStatus: 'success', imageUrl: url, imgErrorMsg: undefined } }));
  } catch (err: any) {
    setShotStates(prev => ({ ...prev, [shotId]: { ...prev[shotId], imgStatus: 'error', imgErrorMsg: err?.message || 'สร้างรูปไม่สำเร็จ' } }));
  }
}

async function generateAllImages() {
  setCurrentProgress('🖼️ กำลังเจนรูปทั้งหมด...');
  await Promise.allSettled(shots.map(s => generateSingleImage(s)));
  setCurrentProgress('✅ เจนรูปเสร็จ ตรวจสอบผลลัพธ์แต่ละช็อตด้านล่าง');
}

### 3. 🎬 VIDEO GENERATION FUNCTIONS (แยกจาก Image 100% พร้อม AUTO FALLBACK):
async function generateSingleVideo(shot: ShotItem, useTextOnly = false) {
  const shotId = String(shot.shotNumber);
  const imgUrl = shotStates[shotId]?.imageUrl;
  setShotStates(prev => ({ ...prev, [shotId]: { ...prev[shotId], vidStatus: 'generating', vidErrorMsg: undefined } }));

  // Sanitize prompts: strip --ar parameters and sensitive keywords like 'crash'
  const cleanMotion = (shot.motionPrompt || shot.visualPrompt || '')
    .replace(/--ar\s*\d+:\d+/gi, '')
    .replace(/\bcrash\b/gi, 'rapid snap')
    .trim();
  const cleanVisual = (shot.visualPrompt || '')
    .replace(/--ar\s*\d+:\d+/gi, '')
    .replace(/\bcrash\b/gi, 'dynamic')
    .trim();
  const combinedTextPrompt = (cleanVisual + '. ' + cleanMotion).trim();

  let result = null;
  const cleanImg = (!useTextOnly && typeof imgUrl === 'string' && (imgUrl.startsWith('http') || imgUrl.startsWith('blob:') || imgUrl.startsWith('data:'))) ? imgUrl : null;

  // STEP 1: ลอง Image-to-Video ก่อน (ถ้ามีรูปภาพ)
  if (cleanImg) {
    try {
      result = await generateVideo({ image: cleanImg, prompt: cleanMotion || combinedTextPrompt });
    } catch (imgErr: any) {
      console.warn('Image-to-Video failed, auto-falling back to Text-to-Video...', imgErr);
    }
  }

  // STEP 2: Auto Fallback เป็น Text-to-Video อัตโนมัติ (แก้ปัญหา Expected object response with media fields เด็ดขาด)
  if (!result) {
    try {
      result = await generateVideo({ prompt: combinedTextPrompt });
    } catch (txtErr: any) {
      setShotStates(prev => ({
        ...prev,
        [shotId]: {
          ...prev[shotId],
          vidStatus: 'error',
          vidErrorMsg: 'Veo ประมวลผลไม่สำเร็จ กรุณากดปุ่ม ✏️ แก้ไข Prompt ให้สั้นลงแล้วกดลองใหม่'
        }
      }));
      return;
    }
  }

  const url = typeof result === 'string' ? result : (result?.url || result?.media?.[0]?.url || null);
  if (!url) {
    setShotStates(prev => ({ ...prev, [shotId]: { ...prev[shotId], vidStatus: 'error', vidErrorMsg: 'ไม่ได้รับวิดีโอจากระบบ' } }));
    return;
  }
  setShotStates(prev => ({ ...prev, [shotId]: { ...prev[shotId], vidStatus: 'success', videoUrl: url, vidErrorMsg: undefined } }));
}

async function generateAllVideos() {
  setCurrentProgress('🎬 กำลังเจนวิดีโอทั้งหมด (พร้อมระบบ Auto-Fallback ป้องกัน Error)...');
  await Promise.allSettled(shots.map(s => generateSingleVideo(s)));
  setCurrentProgress('✅ เจนวิดีโอเสร็จ ตรวจสอบผลลัพธ์แต่ละช็อตด้านล่าง');
}

### 4. ✏️ FULL 4-FIELD INLINE EDITOR (ตรงกับ OS ทุกฟิลด์):
- State:
  const [editingShotNumber, setEditingShotNumber] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<{ visualPrompt: string; motionPrompt: string; voiceover: string; onScreenText: string }>({ visualPrompt: '', motionPrompt: '', voiceover: '', onScreenText: '' });

- เมื่อกดปุ่ม "✏️ แก้ไขช็อต N":
  function handleStartEdit(shot: ShotItem) {
    setEditingShotNumber(shot.shotNumber);
    setEditFields({
      visualPrompt: shot.visualPrompt || '',
      motionPrompt: shot.motionPrompt || '',
      voiceover: shot.thaiVoiceover || '',
      onScreenText: shot.onScreenText || ''
    });
  }

- เมื่อกดบันทึก:
  function handleSaveEdit(shotNumber: number) {
    setShots(prev => prev.map(s => s.shotNumber === shotNumber ? {
      ...s,
      visualPrompt: editFields.visualPrompt,
      motionPrompt: editFields.motionPrompt,
      thaiVoiceover: editFields.voiceover,
      onScreenText: editFields.onScreenText
    } : s));
    setEditingShotNumber(null);
  }

- Inline Editor UI (เปิดใต้การ์ดแต่ละช็อต):
  <div className="bg-slate-800/90 border border-emerald-500/30 p-4 rounded-xl space-y-3 text-xs backdrop-blur">
    <div className="font-bold text-emerald-400 text-sm">✏️ แก้ไขช็อต {shot.shotNumber}</div>
    <div>
      <label className="font-semibold text-slate-300 text-xs">📸 Visual Prompt (EN):</label>
      <textarea rows={3} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white font-mono text-[11px] mt-1" value={editFields.visualPrompt} onChange={e => setEditFields(f => ({ ...f, visualPrompt: e.target.value }))} />
    </div>
    <div>
      <label className="font-semibold text-slate-300 text-xs">🎬 Motion Prompt (EN):</label>
      <textarea rows={2} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white font-mono text-[11px] mt-1" value={editFields.motionPrompt} onChange={e => setEditFields(f => ({ ...f, motionPrompt: e.target.value }))} />
    </div>
    <div>
      <label className="font-semibold text-slate-300 text-xs">🎙️ เสียงพากย์ไทย (Thai Voiceover):</label>
      <textarea rows={2} className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white font-mono text-[11px] mt-1" value={editFields.voiceover} onChange={e => setEditFields(f => ({ ...f, voiceover: e.target.value }))} />
    </div>
    <div>
      <label className="font-semibold text-slate-300 text-xs">📝 ข้อความบนจอ (On-Screen Text TH):</label>
      <input type="text" className="w-full p-2 bg-slate-900 border border-slate-600 rounded text-white font-mono text-[11px] mt-1" value={editFields.onScreenText} onChange={e => setEditFields(f => ({ ...f, onScreenText: e.target.value }))} />
    </div>
    <div className="flex gap-2 justify-end pt-1">
      <button className="px-3 py-1.5 bg-slate-600 text-white rounded-lg text-xs font-bold" onClick={() => setEditingShotNumber(null)}>✕ ยกเลิก</button>
      <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold" onClick={() => handleSaveEdit(shot.shotNumber)}>💾 บันทึก</button>
      <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold" onClick={() => { handleSaveEdit(shot.shotNumber); generateSingleImage(shot); }}>💾 บันทึก + เจนรูปใหม่</button>
    </div>
  </div>

### 5. 📊 HEADER CONTROL BAR (ปุ่มหลัก 4 ปุ่มเรียงแถวด้านบน):
<div className="flex flex-wrap gap-2 justify-center py-3">
  <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm" onClick={generateAllImages}>🖼️ เจนรูปทั้งหมด</button>
  <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm" onClick={generateAllVideos}>🎬 เจนวิดีโอทั้งหมด</button>
  <button className="px-4 py-2 bg-slate-600 text-white rounded-xl font-bold text-sm" onClick={hardReset}>🗑️ ล้างข้อมูล</button>
</div>

### 6. 🎴 SHOT CARD LAYOUT (แต่ละช็อตแสดงข้อมูลครบ):
ในแต่ละการ์ด ให้แสดง:
- หัวข้อช็อต + ระยะเวลา
- รูปภาพ (ถ้ามี) พร้อม status badge (🟡/🟢/🔴) แยกระหว่าง Image กับ Video
- ข้อความบนจอ (On-Screen Text TH)
- เสียงพากย์ (Thai Voiceover) — แสดงเป็นข้อความย่อใต้รูป
- ปุ่ม 4 ปุ่มเรียงแถว:
  * "🖼️ เจนรูป" — generateSingleImage(shot)
  * "🎬 เจนวิดีโอ" — generateSingleVideo(shot)
  * "🎥 Text-to-Video" — generateSingleVideo(shot, true)
  * "✏️ แก้ไข" — handleStartEdit(shot)

### 7. 🥣 UNIVERSAL TOPIC LOCK:
- ข้าวกล้อง / โบว์ล / อาหารคลีน: ล็อกเป็นอาหารสุขภาพระดับพรีเมียม (brown rice, grilled chicken, avocado, soft-boiled egg, edamame, sesame dressing). ห้ามมีนาฬิกา รถยนต์ มีดเดี่ยว เครื่องปั่น!
- ข้าวผัด: ล็อก zero avocado, zero salad dressing!

### 8. 🗑️ HARD RESET:
function hardReset() { setShots([]); setShotStates({}); setEditingShotNumber(null); setCurrentProgress(''); }
สคริปต์เริ่มต้นว่างเปล่า 100% ไม่มี Oat Milk หรือ Mock Data ค้างอยู่!`;

const GOOGLE_FLOW_FULL_BUILDER_PROMPT = `Build "PK Commercial Video Studio v6.0 Pro (Split Pipeline & Full Field Editor Edition)" — a professional-grade 2-stage video production tool with separate image/video batch controls, per-shot 4-field inline editing synchronized with PK Marketing AI OS, and bulletproof media-fields error defense.

## 1. TWO-STAGE SPLIT PIPELINE (Image & Video Separated):
- Provide THREE main action buttons in the header bar:
  1) "🖼️ เจนรูปทั้งหมด (Batch Images)": Runs generateImage for ALL shots simultaneously (Promise.allSettled). Only images, no videos.
  2) "🎬 เจนวิดีโอทั้งหมด (Batch Videos)": Runs generateVideo for ALL shots that have images (image-to-video), or falls back to text-to-video for shots without images. Uses Promise.allSettled.
  3) "🗑️ ล้างข้อมูล (Hard Reset)": Clears all shots, states, and editor.

- On EACH shot card, provide FOUR individual action buttons:
  * "🖼️ เจนรูป" — generateSingleImage(shot): generates only this shot's image
  * "🎬 เจนวิดีโอ" — generateSingleVideo(shot): generates video from existing image, or text-to-video fallback
  * "🎥 Text-to-Video" — generateSingleVideo(shot, true): bypasses image, creates video from text prompts directly
  * "✏️ แก้ไข" — opens inline 4-field editor for this shot

## 2. INDEPENDENT SHOT STATE (Image & Video tracked separately):
- Each shot card has TWO independent status indicators:
  * Image status: 🟡 Generating / 🟢 Ready / 🔴 Error (with specific error message)
  * Video status: 🟡 Generating / 🟢 Ready / 🔴 Error (with specific error message)
- State structure per shot:
  { imgStatus, vidStatus, imgErrorMsg, vidErrorMsg, imageUrl, videoUrl }

## 3. FULL 4-FIELD INLINE EDITOR (Synchronized with PK Marketing AI OS):
- When user clicks "✏️ แก้ไข" on any shot, open an inline editor panel with EXACTLY 4 fields:
  1) 📸 Visual Prompt (EN) — textarea 3 rows, monospace font
  2) 🎬 Motion Prompt (EN) — textarea 2 rows, monospace font
  3) 🎙️ Thai Voiceover (เสียงพากย์ไทย) — textarea 2 rows
  4) 📝 On-Screen Text (TH) (ข้อความบนจอ) — single line input
- These field names and format EXACTLY match PK Marketing AI OS, so users can copy-paste between both platforms seamlessly.
- Provide 3 action buttons in the editor:
  * "✕ ยกเลิก" — close editor without saving
  * "💾 บันทึก" — save edits to shot data
  * "💾 บันทึก + เจนรูปใหม่" — save edits AND regenerate image immediately

## 4. SHOT CARD DISPLAY (Professional & Informative):
Each shot card shows:
- Shot number, title, and duration badge
- Generated image (if available) with click-to-enlarge
- On-Screen Text (TH) displayed below image
- Thai Voiceover text displayed as a small quoted block
- Image status badge (top-left corner)
- Video status badge (top-right corner)
- 4 action buttons at the bottom

## 5. MEDIA FIELDS ARMOR (Zero Crash Guarantee):
- Image generation: const cleanPrompt = visualPrompt.replace(/--ar.*$/gi,'').trim() + ', zero in-image text, zero watches, zero cars, zero jewelry';
- Video generation with image: const cleanImg = (typeof url === 'string' && url.startsWith('http')) ? url : null;
  * If cleanImg exists: generateVideo({ image: cleanImg, prompt: motionPrompt })
  * If cleanImg is null: generateVideo({ prompt: (visualPrompt + '. ' + motionPrompt).trim() })
  * NEVER pass image: undefined or image: null to generateVideo!

## 6. UNIVERSAL TOPIC LOCK:
- Clean food / brown rice bowl (ข้าวกล้อง / โบว์ล / อาหารคลีน): Lock to wholesome food imagery (brown rice, grilled chicken, avocado, soft-boiled egg, edamame, sesame dressing). Zero watches, zero cars, zero knives, zero juicers!
- Stir-fried rice (ข้าวผัด): Lock to wok, rice, egg, chicken, scallions, lime, cucumber. Zero avocado, zero salad dressing!

## 7. ROCK-SOLID PARSER REGEX:
/\\[(?:SHOT|SCENE|ช็อต)\\s*(\\d+)\\]\\s*([^|\\n]*)(?:\\|\\s*Timecode:\\s*([^\\n]*))?\\n([\\s\\S]*?)(?=\\[(?:SHOT|SCENE|ช็อต)\\s*\\d+\\]|$)/gi
Parse fields:
- visualPrompt from "- Visual Prompt (EN):" or "- Visual Prompt:"
- motionPrompt from "- Camera & Physical Motion (Veo 2):" or "- Camera & Movement:" or "- Motion Prompt:"
- thaiVoiceover from "- Thai Voiceover Script:" or "- Voiceover (TH):" or "- Voiceover:"
- onScreenText from "- On-Screen Text (TH):" or "- On-Screen Text:"
- duration from "- Duration: [N]s"

## 8. ABSOLUTE BAN ON MOCK DATA:
- NO sample buttons, NO Oat Milk demos, NO pre-filled data.
- Campaign Script textarea starts 100% empty.
- Clean "🗑️ ล้างข้อมูล" button to wipe everything in 1 click.`;

export default function CommercialStudioPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-mono">Loading Commercial Studio...</div>}>
      <CommercialStudioContent />
    </React.Suspense>
  );
}

function CommercialStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetIdParam = searchParams.get("id") || searchParams.get("ideaId");
  const autoGenParam = searchParams.get("autoGen") === "true";

  const { activeBrand, selectedBrandData } = useBrand();

  // Ideas Integration State
  const [availableIdeas, setAvailableIdeas] = useState<ContentIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);

  // Core Production Settings
  const [targetDuration, setTargetDuration] = useState<number>(30); // Seconds (default 30s)
  const [pacingStyle, setPacingStyle] = useState<"standard" | "dynamic_fast" | "cinematic_slow" | "custom">("standard");
  const [sceneCount, setSceneCount] = useState<number>(12); // Default to rich 12-scene multi-shot
  const [isAutoSceneCount, setIsAutoSceneCount] = useState<boolean>(true); // Auto dynamic scene allocation
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">("9:16");
  const [adStyle, setAdStyle] = useState<string>("Cinematic Travel & Lifestyle");
  const [productName, setProductName] = useState<string>("");
  const [productPrice, setProductPrice] = useState<string>("");
  const [customOnScreenText, setCustomOnScreenText] = useState<string>("");
  const [hasPresenter, setHasPresenter] = useState<boolean>(true);
  const [hasProduct, setHasProduct] = useState<boolean>(true);
  const [referenceMode, setReferenceMode] = useState<"pure_prompt" | "with_images">("pure_prompt");
  const [strictFaceLock, setStrictFaceLock] = useState<boolean>(true);

  // Custom Duration Input State
  const [customDurationInput, setCustomDurationInput] = useState<string>("30");

  // Output States
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [masterDirectiveV3, setMasterDirectiveV3] = useState<string>("");
  const [scenes, setScenes] = useState<SceneData[]>([]);
  const [referenceGuides, setReferenceGuides] = useState<ReferenceAssetGuide[]>([]);
  const [activePipelineTab, setActivePipelineTab] = useState<"phase1_stills" | "phase2_motion" | "all">("phase1_stills");

  // Scene Inline Editing & Re-roll State
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [rerollingSceneId, setRerollingSceneId] = useState<string | null>(null);
  const [rerollSeeds, setRerollSeeds] = useState<Record<string, number>>({});
  const [editForm, setEditForm] = useState<{
    thaiVoiceover: string;
    onScreenTextTh: string;
    textPosition: string;
    visualPromptEn: string;
    cameraMovement: string;
    motionPrompt: string;
  }>({
    thaiVoiceover: "",
    onScreenTextTh: "",
    textPosition: "Lower Third",
    visualPromptEn: "",
    cameraMovement: "",
    motionPrompt: ""
  });

  // Modals & Drawers
  const [blueprintV3ModalOpen, setBlueprintV3ModalOpen] = useState<boolean>(false);
  const [mappingGuideOpen, setMappingGuideOpen] = useState<boolean>(false);
  const [jsonDrawerOpen, setJsonDrawerOpen] = useState<boolean>(false);
  const [showFlowFixPreview, setShowFlowFixPreview] = useState<boolean>(false);
  const [selectedFlowPromptTab, setSelectedFlowPromptTab] = useState<"edit" | "rebuild">("edit");

  // Project Library States
  const [projects, setProjects] = useState<CommercialProject[]>([]);
  const [projectHistoryModalOpen, setProjectHistoryModalOpen] = useState<boolean>(false);
  const [saveProjectModalOpen, setSaveProjectModalOpen] = useState<boolean>(false);
  const [projectNameInput, setProjectNameInput] = useState<string>("");

  // Load Projects from localStorage
  useEffect(() => {
    try {
      const savedProjs = localStorage.getItem("pk_commercial_projects_library");
      if (savedProjs) {
        setProjects(JSON.parse(savedProjs));
      }
    } catch (e) {
      console.warn("Failed to load projects library:", e);
    }
  }, []);

  const handleOpenSaveModal = () => {
    const defaultName = productName 
      ? `${productName} (${scenes.length || sceneCount} ฉาก · ${targetDuration}s)`
      : `โปรเจกต์โฆษณา (${scenes.length || sceneCount} ฉาก · ${targetDuration}s)`;
    setProjectNameInput(defaultName);
    setSaveProjectModalOpen(true);
  };

  const handleSaveProjectConfirm = () => {
    if (!projectNameInput.trim()) return;
    const newProj: CommercialProject = {
      id: `proj-${Date.now()}`,
      name: projectNameInput.trim(),
      brandName: activeBrand,
      productName: productName || "งานโฆษณา",
      targetDuration,
      sceneCount: scenes.length || sceneCount,
      aspectRatio,
      adStyle,
      referenceMode,
      scenes,
      masterDirectiveV3,
      referenceGuides,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newProj, ...projects];
    setProjects(updated);
    try {
      localStorage.setItem("pk_commercial_projects_library", JSON.stringify(updated));
    } catch (e) {
      console.warn("Save project error:", e);
    }
    setSaveProjectModalOpen(false);
    showToast(`✓ บันทึกโปรเจกต์ "${newProj.name}" สำเร็จ!`);
  };

  const handleLoadProject = (proj: CommercialProject) => {
    setProductName(proj.productName || "");
    setTargetDuration(proj.targetDuration || 30);
    setCustomDurationInput(String(proj.targetDuration || 30));
    setSceneCount(proj.sceneCount || proj.scenes?.length || 8);
    setAspectRatio((proj.aspectRatio as any) || "9:16");
    setAdStyle(proj.adStyle || "Cinematic Travel & Lifestyle");
    setReferenceMode(proj.referenceMode || "pure_prompt");
    setMasterDirectiveV3(proj.masterDirectiveV3 || "");
    setScenes(proj.scenes || []);
    if (proj.referenceGuides) setReferenceGuides(proj.referenceGuides);
    setProjectHistoryModalOpen(false);
    showToast(`✓ เปิดโปรเจกต์ "${proj.name}" (${proj.scenes?.length || 0} ฉาก) เรียบร้อยแล้ว!`);
  };

  const handleDeleteProject = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    try {
      localStorage.setItem("pk_commercial_projects_library", JSON.stringify(updated));
    } catch (e) {}
    showToast("✓ ลบโปรเจกต์ออกจากประวัติแล้ว");
  };

  // Auto-Save Persistence
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const copyToClipboard = (text: string, key: string, label?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`✓ คัดลอก ${label || "ข้อความ"} เรียบร้อยแล้ว!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Helper to extract shot-by-shot script only for Google Flow Campaign Script box
  const getCleanShotsScript = () => {
    if (!scenes || scenes.length === 0) return masterDirectiveV3 || "";
    return scenes.map(s => 
      `[SHOT ${s.sceneNumber}] ${s.shotType} | Timecode: ${s.timecode}\n- Duration: ${s.durationSec}s\n- On-Screen Text (TH): "${s.onScreenTextTh}"\n- Text Position: ${s.textPosition || "Lower Third"}\n- Thai Voiceover Script: "${s.thaiVoiceover}"\n- Visual Prompt (EN): ${s.visualPromptEn.replace(/[\`"]/g, "'")}\n- Camera & Physical Motion (Veo 2): ${s.motionPrompt || s.cameraMovement}`
    ).join("\n\n");
  };

  // 1. Initial Load: Restore draft from localStorage
  useEffect(() => {
    try {
      const draftStr = localStorage.getItem("pk_commercial_clean_v3");
      if (draftStr) {
        const d = JSON.parse(draftStr);
        if (d && (!targetIdParam || d.selectedIdeaId === targetIdParam)) {
          if (d.selectedIdea) setSelectedIdea(d.selectedIdea);
          if (d.productName) setProductName(d.productName);
          if (d.productPrice) setProductPrice(d.productPrice);
          if (d.customOnScreenText) setCustomOnScreenText(d.customOnScreenText);
          if (d.targetDuration !== undefined) {
            setTargetDuration(d.targetDuration);
            setCustomDurationInput(String(d.targetDuration));
          }
          if (d.pacingStyle) setPacingStyle(d.pacingStyle);
          if (d.sceneCount !== undefined) setSceneCount(d.sceneCount);
          if (d.aspectRatio) setAspectRatio(d.aspectRatio);
          if (d.adStyle) setAdStyle(d.adStyle);
          if (d.referenceMode) setReferenceMode(d.referenceMode);
          if (d.masterDirectiveV3) setMasterDirectiveV3(d.masterDirectiveV3);
          if (d.scenes && Array.isArray(d.scenes) && d.scenes.length > 0) setScenes(d.scenes);
          if (d.referenceGuides) setReferenceGuides(d.referenceGuides);
          if (d.savedAt) {
            setLastSavedTime(new Date(d.savedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }));
          }
        }
      }
    } catch (e) {
      console.warn("Restore error:", e);
    } finally {
      setIsInitialized(true);
    }
  }, [targetIdParam]);

  // 2. Fetch available ideas and apply
  useEffect(() => {
    fetchIdeas();
  }, [targetIdParam]);

  const fetchIdeas = async () => {
    try {
      const res = await fetch("/api/ai/ideas");
      const data = await res.json();
      if (data.ideas && data.ideas.length > 0) {
        setAvailableIdeas(data.ideas);
        if (targetIdParam) {
          const match = data.ideas.find((i: ContentIdea) => i.id === targetIdParam);
          if (match) {
            applyIdea(match, true);
            return;
          }
        }
        // Default to first accepted or first idea if no draft
        const draftStr = localStorage.getItem("pk_commercial_clean_v3");
        if (!draftStr) {
          const defaultIdea = data.ideas.find((i: ContentIdea) => i.status === "ACCEPTED") || data.ideas[0];
          if (defaultIdea) {
            applyIdea(defaultIdea, true);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Auto-save state
  useEffect(() => {
    if (!isInitialized) return;
    try {
      const payload = {
        selectedIdeaId: selectedIdea?.id,
        selectedIdea,
        productName,
        productPrice,
        customOnScreenText,
        targetDuration,
        pacingStyle,
        sceneCount,
        aspectRatio,
        adStyle,
        referenceMode,
        masterDirectiveV3,
        scenes,
        referenceGuides,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem("pk_commercial_clean_v3", JSON.stringify(payload));
      setLastSavedTime(new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.warn("Auto-save error:", e);
    }
  }, [selectedIdea, productName, productPrice, customOnScreenText, targetDuration, pacingStyle, sceneCount, aspectRatio, adStyle, referenceMode, masterDirectiveV3, scenes, referenceGuides, isInitialized]);

  // Apply idea
  const applyIdea = (idea: ContentIdea, triggerAutoGenerate = false) => {
    setSelectedIdea(idea);
    setProductName(idea.title);
    setProductPrice(idea.cta || "เซฟพิกัดตามรอย / ทักข้อความจองสิทธิ์ด่วน");

    const ideaText = `${idea.title} ${idea.concept || ""} ${idea.brand_name || ""}`.toLowerCase();
    let nextHasPresenter = hasPresenter;
    let nextAdStyle = adStyle;

    if (
      ideaText.includes("ไดโนเสาร์") ||
      ideaText.includes("dinosaur") ||
      ideaText.includes("จูราสสิก") ||
      ideaText.includes("jurassic") ||
      ideaText.includes("สารคดี") ||
      ideaText.includes("ธรรมชาติ") ||
      ideaText.includes("สัตว์ป่า") ||
      ideaText.includes("สัตว์โลก") ||
      ideaText.includes("ป่าลึก") ||
      ideaText.includes("prehistoric")
    ) {
      nextAdStyle = "Cinematic Wildlife Documentary";
      nextHasPresenter = false; // Pure wildlife focus
    } else if (
      ideaText.includes("ข้าวกล้อง") ||
      ideaText.includes("ไรซ์เบอร์รี่") ||
      ideaText.includes("โบว์ล") ||
      ideaText.includes("โบว์ลิ่ง") ||
      ideaText.includes("โบล") ||
      ideaText.includes("bowl") ||
      ideaText.includes("grain bowl") ||
      ideaText.includes("คลีน") ||
      ideaText.includes("อาหารคลีน") ||
      ideaText.includes("clean food") ||
      ideaText.includes("สลัด") ||
      ideaText.includes("meal prep")
    ) {
      nextAdStyle = "Cinematic Food & Wholesome Lifestyle";
      nextHasPresenter = false;
    } else if (ideaText.includes("กะเพรา") || ideaText.includes("อาหาร") || ideaText.includes("ผัด") || ideaText.includes("cooking")) {
      nextAdStyle = "Cinematic Culinary";
      nextHasPresenter = false;
    } else if (ideaText.includes("เชียงใหม่") || ideaText.includes("คาเฟ่") || ideaText.includes("รับปริญญา")) {
      nextAdStyle = "Cinematic Travel & Lifestyle";
      nextHasPresenter = true;
    } else if (ideaText.includes("mazda") || ideaText.includes("byd") || ideaText.includes("รถ")) {
      nextAdStyle = "Cinematic Luxury";
      nextHasPresenter = false;
    }

    setAdStyle(nextAdStyle);
    setHasPresenter(nextHasPresenter);

    let targetCount = sceneCount;
    if (idea.media_blueprint?.slides && idea.media_blueprint.slides.length > 0) {
      targetCount = idea.media_blueprint.slides.length;
      setSceneCount(targetCount);
      setIsAutoSceneCount(true);
    } else if (isAutoSceneCount) {
      targetCount = calculateAutoSceneCount(targetDuration, pacingStyle);
      setSceneCount(targetCount);
    }

    if (triggerAutoGenerate || autoGenParam) {
      setTimeout(() => {
        executeGeneration(
          idea.title,
          idea.cta || "เซฟพิกัดตามรอย / ทักข้อความจองสิทธิ์ด่วน",
          targetCount,
          aspectRatio,
          targetDuration,
          pacingStyle,
          customOnScreenText,
          referenceMode,
          nextHasPresenter,
          nextAdStyle
        );
      }, 150);
    }
  };

  // Helper to calculate rich multi-shot scene count automatically (Insert, Zoom, Macro, OTS, B-roll)
  const calculateAutoSceneCount = (dur: number, pacing = pacingStyle): number => {
    if (pacing === "dynamic_fast") {
      // Dynamic fast: rapid cuts, frequent macro inserts (~1.5s - 2s per shot)
      return Math.max(8, Math.min(30, Math.round(dur / 1.8)));
    } else if (pacing === "cinematic_slow") {
      // Cinematic slow: longer mood takes (~4s - 6s per shot)
      return Math.max(4, Math.min(12, Math.round(dur / 4.5)));
    }
    // Standard Commercial: Rich Multi-Shot Coverage with full cinematic angles
    if (dur <= 8) return 4;
    if (dur <= 16) return 6;
    if (dur <= 25) return 8;
    if (dur <= 35) return 10; // 30s default is 10 perfect commercial scenes (3.0s each) for viral food & product reels
    if (dur <= 50) return 16;
    if (dur <= 70) return 20;
    return Math.min(30, Math.max(12, Math.round(dur / 2.5)));
  };

  // Handler when user clicks "🤖 อัตโนมัติ"
  const handleAutoSceneCount = () => {
    setIsAutoSceneCount(true);
    const autoCount = calculateAutoSceneCount(targetDuration, pacingStyle);
    setSceneCount(autoCount);
    executeGeneration(productName, productPrice, autoCount, aspectRatio, targetDuration, pacingStyle);
    showToast(`🤖 เปิดโหมดอัตโนมัติ: AI คำนวณ ${autoCount} ฉากตามเนื้อหาจริง (มี Insert, Zoom ครบถ้วน)`);
  };

  // Duration changes with AI Pacing Calculation
  const handleDurationChange = (newDur: number) => {
    setTargetDuration(newDur);
    setCustomDurationInput(String(newDur));

    let count = sceneCount;
    if (isAutoSceneCount) {
      count = calculateAutoSceneCount(newDur, pacingStyle);
    } else {
      if (pacingStyle === "dynamic_fast") {
        count = Math.max(6, Math.min(30, Math.round(newDur / 1.5)));
      } else if (pacingStyle === "cinematic_slow") {
        count = Math.max(2, Math.min(6, Math.round(newDur / 6)));
      } else if (pacingStyle === "standard") {
        count = newDur <= 10 ? 3 : newDur <= 20 ? 4 : newDur <= 35 ? 8 : 12;
      }
    }
    setSceneCount(count);
    executeGeneration(productName, productPrice, count, aspectRatio, newDur, pacingStyle);
  };

  // Pacing Style Change
  const handlePacingChange = (style: "standard" | "dynamic_fast" | "cinematic_slow") => {
    setPacingStyle(style);
    let count = sceneCount;
    if (isAutoSceneCount) {
      count = calculateAutoSceneCount(targetDuration, style);
    } else {
      if (style === "dynamic_fast") {
        count = Math.max(6, Math.min(30, Math.round(targetDuration / 1.5)));
      } else if (style === "cinematic_slow") {
        count = Math.max(2, Math.min(6, Math.round(targetDuration / 6)));
      } else {
        count = targetDuration <= 10 ? 3 : targetDuration <= 20 ? 4 : targetDuration <= 35 ? 8 : 12;
      }
    }
    setSceneCount(count);
    executeGeneration(productName, productPrice, count, aspectRatio, targetDuration, style);
  };

  // Scene Count Change
  const handleSceneCountChange = (count: number) => {
    setIsAutoSceneCount(false);
    const clamped = Math.max(1, Math.min(36, count));
    setSceneCount(clamped);
    setPacingStyle("custom");
    executeGeneration(productName, productPrice, clamped, aspectRatio, targetDuration, "custom");
    showToast(`🔒 ล็อกจำนวนฉากไว้ที่ ${clamped} ฉาก`);
  };

  // Reset Form & Clear LocalStorage
  const handleResetForm = () => {
    try {
      localStorage.removeItem("pk_commercial_clean_v3");
    } catch (e) {
      console.warn("Clear error:", e);
    }
    setSelectedIdea(null);
    setProductName("");
    setProductPrice("");
    setCustomOnScreenText("");
    setTargetDuration(30);
    setCustomDurationInput("30");
    setPacingStyle("standard");
    setSceneCount(8);
    setAspectRatio("9:16");
    setAdStyle("Cinematic Travel & Lifestyle");
    setScenes([]);
    setMasterDirectiveV3("");
    setReferenceGuides([]);
    showToast("✓ ล้างข้อมูลแบบร่างเรียบร้อยแล้ว พร้อมเริ่มโปรเจกต์ใหม่!");
  };

  // Start Editing Scene
  const handleStartEditScene = (scene: SceneData) => {
    setEditingSceneId(scene.id);
    setEditForm({
      thaiVoiceover: scene.thaiVoiceover || "",
      onScreenTextTh: scene.onScreenTextTh || "",
      textPosition: scene.textPosition || "Lower Third",
      visualPromptEn: scene.visualPromptEn || "",
      cameraMovement: scene.cameraMovement || "",
      motionPrompt: scene.motionPrompt || ""
    });
  };

  // Helper to sync updated scenes to Master Directive
  const syncMasterDirectiveWithScenes = (updatedScenes: SceneData[]) => {
    const updatedDirectives = updatedScenes.map(s => 
      `[SHOT ${s.sceneNumber}] ${s.shotType} | Timecode: ${s.timecode}\n- Duration: ${s.durationSec}s\n- On-Screen Text (TH): "${s.onScreenTextTh}"\n- Text Position: ${s.textPosition || "Lower Third"}\n- Thai Voiceover Script: "${s.thaiVoiceover}"\n- Visual Prompt (EN): ${s.visualPromptEn.replace(/[\`"]/g, "'")}\n- Camera & Physical Motion (Veo 2): ${s.motionPrompt || s.cameraMovement}`
    ).join("\n\n");

    if (masterDirectiveV3) {
      const blueprintHeader = "--- SHOT-BY-SHOT BLUEPRINT & LOCKED THAI VOICEOVERS";
      const onScreenHeader = "--- ON-SCREEN THAI TEXT & TYPOGRAPHY OVERLAY DIRECTIVE ---";
      const idx1 = masterDirectiveV3.indexOf(blueprintHeader);
      const idx2 = masterDirectiveV3.indexOf(onScreenHeader);
      if (idx1 !== -1 && idx2 !== -1) {
        const headerEnd = masterDirectiveV3.indexOf("\n", idx1);
        const headerPart = masterDirectiveV3.slice(0, headerEnd + 1);
        const footerPart = masterDirectiveV3.slice(idx2);
        setMasterDirectiveV3(`${headerPart}\n${updatedDirectives}\n\n${footerPart}`);
      }
    }
  };

  // Save Scene Edits & Update Master Directive
  const handleSaveScene = (sceneId: string) => {
    const updatedScenes = scenes.map(s => {
      if (s.id === sceneId) {
        return {
          ...s,
          thaiVoiceover: editForm.thaiVoiceover,
          onScreenTextTh: editForm.onScreenTextTh,
          textPosition: editForm.textPosition,
          visualPromptEn: editForm.visualPromptEn,
          cameraMovement: editForm.cameraMovement,
          motionPrompt: editForm.motionPrompt
        };
      }
      return s;
    });
    setScenes(updatedScenes);
    setEditingSceneId(null);
    syncMasterDirectiveWithScenes(updatedScenes);
    showToast("✓ บันทึกการแก้ไขฉากและอัปเดต Master Directive สำเร็จ!");
  };

  // Re-roll prompt for a single scene while strictly preserving narrative continuity
  const handleRerollScenePrompt = async (targetScene: SceneData) => {
    const currentSeed = (rerollSeeds[targetScene.id] || 0) + 1;
    setRerollSeeds(prev => ({ ...prev, [targetScene.id]: currentSeed }));
    setRerollingSceneId(targetScene.id);

    try {
      const res = await fetch("/api/ai/commercial/reroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene: targetScene,
          allScenes: scenes,
          productName,
          brand: selectedIdea?.brand_name || activeBrand,
          aspectRatio,
          adStyle,
          variationSeed: currentSeed
        })
      });

      const data = await res.json();
      if (data.success && data.scene) {
        const newScene = data.scene;
        const updatedScenes = scenes.map(s => s.id === targetScene.id ? newScene : s);
        setScenes(updatedScenes);
        syncMasterDirectiveWithScenes(updatedScenes);

        // If currently editing this scene, update editForm as well
        if (editingSceneId === targetScene.id) {
          setEditForm({
            thaiVoiceover: newScene.thaiVoiceover,
            onScreenTextTh: newScene.onScreenTextTh,
            textPosition: newScene.textPosition,
            visualPromptEn: newScene.visualPromptEn,
            cameraMovement: newScene.cameraMovement,
            motionPrompt: newScene.motionPrompt || ""
          });
        }

        showToast(`✨ สร้าง Prompt ทางเลือกใหม่สำหรับช็อต ${targetScene.sceneNumber} สำเร็จ! (รักษาเนื้อเรื่องเดิม 100%)`);
      } else {
        showToast("ไม่สามารถสร้าง Prompt ทางเลือกได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error("Re-roll scene prompt failed:", err);
      showToast("เกิดข้อผิดพลาดในการสร้าง Prompt ทางเลือก");
    } finally {
      setRerollingSceneId(null);
    }
  };

  // Reference Mode Change
  const handleReferenceModeChange = (mode: "pure_prompt" | "with_images") => {
    setReferenceMode(mode);
    executeGeneration(productName, productPrice, sceneCount, aspectRatio, targetDuration, pacingStyle, customOnScreenText, mode);
  };

  // Execute Generation (API Call to get authentic scenes + locked voiceovers)
  const executeGeneration = async (
    name = productName,
    price = productPrice,
    count = sceneCount,
    aspect = aspectRatio,
    dur = targetDuration,
    pacing = pacingStyle,
    onScreenText = customOnScreenText,
    refMode = referenceMode,
    presenterFlag?: boolean,
    customStyle?: string
  ) => {
    const finalHasPresenter = typeof presenterFlag === "boolean" ? presenterFlag : hasPresenter;
    const finalAdStyle = customStyle || adStyle;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/commercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: selectedIdea?.brand_name || activeBrand,
          productName: name || "คอนเทนต์โฆษณาพรีเมียม",
          productPrice: price || "เซฟพิกัดตามรอย / ทักข้อความจองสิทธิ์ด่วน",
          customOnScreenText: onScreenText,
          aspectRatio: aspect,
          hasPresenter: finalHasPresenter,
          hasProduct,
          referenceMode: refMode,
          strictFaceLock,
          targetDuration: dur,
          sceneCount: count,
          pacingStyle: pacing,
          adStyle: finalAdStyle
        })
      });

      const data = await res.json();
      if (data.success) {
        setScenes(data.scenes || []);
        setMasterDirectiveV3(data.masterDirectiveV3 || data.masterCreativePrompt || "");
        if (data.referenceAssetRecommendations) {
          setReferenceGuides(data.referenceAssetRecommendations);
        }
        showToast(`✨ สร้างสคริปต์ ${data.scenes?.length || count} ฉาก (${dur} วิ) สำเร็จ!`);
      }
    } catch (e) {
      console.error(e);
      showToast("เกิดข้อผิดพลาดในการประมวลผลสคริปต์");
    } finally {
      setLoading(false);
    }
  };

  // Realtime avg seconds per shot
  const currentSceneTotal = scenes.length || sceneCount || 1;
  const avgSecPerShot = (targetDuration / currentSceneTotal).toFixed(1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-4 right-4 sm:left-auto sm:right-5 z-50 bg-[#17181A] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fade-in justify-center sm:justify-start">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              COMMERCIAL VIDEO STUDIO · GOOGLE FLOW 3.0
            </span>
            <span className="text-xs text-slate-500 font-medium">ปรับความยาวและฉากได้อิสระ (1 ถึง 30+ ฉาก) · ล็อกเสียงพากย์ตรง 100%</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Commercial Video Studio (ระบบสตอรี่บอร์ดและคำสั่ง Google Flow)
          </h1>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            เลือกช่วงวินาทีของคลิป ➔ ให้ AI คำนวณจังหวะ หรือเลือกจำนวนฉากเอง ➔ คัดลอก Master Directive ไปวางใน Google Flow ได้ทันที
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
            title="ล้างข้อมูลและเริ่มใหม่ทั้งหมด"
          >
            <RotateCw className="w-3.5 h-3.5 text-rose-500" />
            <span>เริ่มใหม่ / ล้างฟอร์ม</span>
          </button>

          <button
            type="button"
            onClick={() => setBlueprintV3ModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-300 text-xs font-bold text-teal-950 transition-all cursor-pointer shadow-2xs"
            title="ดูคำสั่งสำหรับนำไปใส่ในแท็บ [แก้ไข] ของ Google Flow"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>🛠️ Prompt แก้ Flow Tool (แก้ Error/ล้างภาพมั่ว)</span>
          </button>

          <button
            type="button"
            onClick={() => setMappingGuideOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4 text-slate-500" />
            <span>🗺️ ตารางจับคู่ช่องกรอก</span>
          </button>

          <button
            type="button"
            onClick={handleOpenSaveModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-950 transition-colors cursor-pointer shadow-2xs"
            title="บันทึกงานนี้เก็บไว้ในประวัติโปรเจกต์"
          >
            <Save className="w-3.5 h-3.5 text-amber-600" />
            <span>💾 บันทึกโปรเจกต์</span>
          </button>

          <button
            type="button"
            onClick={() => setProjectHistoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold text-indigo-950 transition-colors cursor-pointer shadow-2xs"
            title="ดูประวัติโปรเจกต์ทั้งหมดที่เคยบันทึกไว้"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>📂 ประวัติโปรเจกต์ ({projects.length})</span>
          </button>

          <a
            href={GOOGLE_FLOW_TOOL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>🚀 เปิด Google Flow Tool</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* COMPREHENSIVE PRODUCTION CONTROL BAR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
        {/* ROW 1: Content Picker, Aspect Ratio & Large Action Button */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-slate-100 pb-4">
          {/* 1. Pick Content / Idea */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>1. คอนเทนต์ต้นทาง</span>
              {selectedIdea && (
                <span className="text-[10.5px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                  ✓ เชื่อมต่อกับคอนเทนต์แล้ว
                </span>
              )}
            </label>
            <select
              value={selectedIdea?.id || ""}
              onChange={(e) => {
                const target = availableIdeas.find(i => i.id === e.target.value);
                if (target) applyIdea(target, true);
              }}
              className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">-- เลือกคอนเทนต์จาก Step 1 หรือ Step 2 --</option>
              {availableIdeas.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.status === "ACCEPTED" ? "⭐ " : "💡 "} {i.title} ({i.brand_name || "เพจหลัก"})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Aspect Ratio Selector */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-800">สัดส่วนวิดีโอ (Aspect Ratio)</label>
            <div className="grid grid-cols-3 gap-1 bg-[#F7F8FA] p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAspectRatio("9:16");
                  executeGeneration(productName, productPrice, sceneCount, "9:16", targetDuration, pacingStyle);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  aspectRatio === "9:16" ? "bg-white text-indigo-950 shadow-xs" : "text-slate-500"
                }`}
              >
                9:16 (ตั้ง)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAspectRatio("16:9");
                  executeGeneration(productName, productPrice, sceneCount, "16:9", targetDuration, pacingStyle);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  aspectRatio === "16:9" ? "bg-white text-indigo-950 shadow-xs" : "text-slate-500"
                }`}
              >
                16:9 (นอน)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAspectRatio("1:1");
                  executeGeneration(productName, productPrice, sceneCount, "1:1", targetDuration, pacingStyle);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  aspectRatio === "1:1" ? "bg-white text-indigo-950 shadow-xs" : "text-slate-500"
                }`}
              >
                1:1 (จัตุรัส)
              </button>
            </div>
          </div>

          {/* 3. Large Generate Button */}
          <div className="md:col-span-4 flex items-end">
            <button
              type="button"
              onClick={() => executeGeneration()}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>กำลังคำนวณและสร้างสคริปต์...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>สร้างสคริปต์ {sceneCount} ฉาก ({targetDuration} วินาที)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ROW 1.5: Reference Generation Mode (เลือกวิธีคิดและเจนภาพ) */}
        <div className="space-y-2 pt-1 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>โหมดการคิดและเจนเนอเรทภาพ (Generation Mode)</span>
            </label>
            <span className="text-[11px] font-semibold text-slate-500">
              {referenceMode === "pure_prompt" ? "✨ เจนจาก Prompt ล้วน (ไม่ต้องใช้รูปภาพ)" : "🖼️ อ้างอิงรูปภาพที่แนบ (Reference Anchors)"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Option 1: Pure Prompt Mode */}
            <button
              type="button"
              onClick={() => handleReferenceModeChange("pure_prompt")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                referenceMode === "pure_prompt"
                  ? "bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-xs ring-1 ring-indigo-200"
                  : "bg-[#F7F8FA] hover:bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${referenceMode === "pure_prompt" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                <Wand2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">เจนจาก Prompt ล้วน (ไม่ต้องใช้รูปภาพ)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    แนะนำ
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Prompt ระบุลักษณะหน้าตา ตัวละคร วัตถุดิบ ความฉ่ำ แสง และมุมกล้องชัดเจน เจนใน Google Flow ได้ทันที ไม่ต้องมีรูปเรฟ
                </p>
              </div>
            </button>

            {/* Option 2: Image Reference Anchors */}
            <button
              type="button"
              onClick={() => handleReferenceModeChange("with_images")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                referenceMode === "with_images"
                  ? "bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-xs ring-1 ring-indigo-200"
                  : "bg-[#F7F8FA] hover:bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${referenceMode === "with_images" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                <Layers className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">อ้างอิงรูปภาพที่แนบ (Reference Anchors)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  ล็อกหน้าตาตามรูปพรีเซนเตอร์ (Slot 1) และสินค้า/อาหารจริง (Slot 2) ให้ตรงปกตามภาพเรฟที่อัปโหลด
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ROW 1.7: Presenter Mode & Character Presence */}
        <div className="space-y-2 pt-1 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>การมีตัวละคร / พรีเซนเตอร์ในคลิป (Character & Presenter Mode)</span>
            </label>
            <span className="text-[11px] font-semibold text-slate-500">
              {hasPresenter ? "👤 มีพรีเซนเตอร์ดำเนินเรื่องในคลิป" : "🌿 โฟกัสสินค้า / วัตถุ / บรรยากาศล้วน 100% (ไร้คน)"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Option 1: Pure Product / Food / Scenery Focus (No Presenter) */}
            <button
              type="button"
              onClick={() => {
                setHasPresenter(false);
                executeGeneration(productName, productPrice, sceneCount, aspectRatio, targetDuration, pacingStyle, customOnScreenText, referenceMode, false);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                !hasPresenter
                  ? "bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs ring-1 ring-emerald-200"
                  : "bg-[#F7F8FA] hover:bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${!hasPresenter ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">🌿 โฟกัสสินค้า / วัตถุ / บรรยากาศล้วน 100%</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    แนะนำ: สินค้า / อาหาร / สถานที่
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  ไม่มีมนุษย์ในเฟรม AI จะโฟกัสถ่ายเจาะสินค้า วัตถุดิบ ขั้นตอน หรือบรรยากาศ 100% ป้องกันภาพคนแปลกหน้าโผล่มาถือกล่อง
                </p>
              </div>
            </button>

            {/* Option 2: With Presenter / Character */}
            <button
              type="button"
              onClick={() => {
                setHasPresenter(true);
                executeGeneration(productName, productPrice, sceneCount, aspectRatio, targetDuration, pacingStyle, customOnScreenText, referenceMode, true);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                hasPresenter
                  ? "bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-xs ring-1 ring-indigo-200"
                  : "bg-[#F7F8FA] hover:bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${hasPresenter ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                <User className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">👤 มีพรีเซนเตอร์ / ตัวละครดำเนินเรื่อง</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  มีตัวละครในเฟรม (เช่น พิธีกร, ครีเอเตอร์, เชฟ, ผู้เชี่ยวชาญ หรือลูกค้า) เพื่อเล่าเรื่องและสร้างความน่าเชื่อถือ
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ROW 2: Target Duration (ช่วงวินาทีของคลิปที่ต้องการ) */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>ความยาวคลิปที่ต้องการ (Target Duration)</span>
            </label>
            <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
              ⏱️ กำหนดไว้: {targetDuration} วินาที
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { sec: 6, label: "6 วิ (Bumper / Hook)" },
              { sec: 15, label: "15 วิ (Shorts / Reels)" },
              { sec: 30, label: "⭐ 30 วิ (มาตรฐานโฆษณา)" },
              { sec: 45, label: "45 วิ (Showcase)" },
              { sec: 60, label: "60 วิ (1 นาทีเต็ม)" },
              { sec: 90, label: "90 วิ (Storytelling)" }
            ].map((dur) => (
              <button
                key={dur.sec}
                type="button"
                onClick={() => handleDurationChange(dur.sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  targetDuration === dur.sec
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-[#F7F8FA] hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {dur.label}
              </button>
            ))}

            {/* Custom Seconds Input */}
            <div className="flex items-center gap-1.5 ml-auto bg-[#F7F8FA] px-3 py-1 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600">กำหนดเอง:</span>
              <input
                type="number"
                min={4}
                max={180}
                value={customDurationInput}
                onChange={(e) => setCustomDurationInput(e.target.value)}
                onBlur={() => {
                  const val = Number(customDurationInput);
                  if (val && val >= 4 && val <= 180) {
                    handleDurationChange(val);
                  } else {
                    setCustomDurationInput(String(targetDuration));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = Number(customDurationInput);
                    if (val && val >= 4 && val <= 180) {
                      handleDurationChange(val);
                    }
                  }
                }}
                className="w-12 bg-white text-xs font-mono font-bold text-center py-0.5 rounded border border-slate-300 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] font-bold text-slate-500">วิ</span>
            </div>
          </div>
        </div>

        {/* ROW 3: Pacing & Scene Count Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1 border-t border-slate-100">
          {/* AI Pacing Recommendation */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>จังหวะการตัดต่อ (AI Pacing)</span>
              </span>
              <span className="text-[10.5px] text-slate-400">คำนวณจำนวนฉากให้อัตโนมัติ</span>
            </label>

            <div className="grid grid-cols-3 gap-1.5 bg-[#F7F8FA] p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handlePacingChange("standard")}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                  pacingStyle === "standard"
                    ? "bg-white text-indigo-950 shadow-xs border border-indigo-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                🎬 มาตรฐาน (~3-4s)
              </button>

              <button
                type="button"
                onClick={() => handlePacingChange("dynamic_fast")}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                  pacingStyle === "dynamic_fast"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="เหมาะสำหรับต้องการหลายมุมมอง สลับมุมกล้องเร็ว 15-30 ฉาก"
              >
                ⚡ คัตเร็วหลายมุม (~1.5s)
              </button>

              <button
                type="button"
                onClick={() => handlePacingChange("cinematic_slow")}
                className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                  pacingStyle === "cinematic_slow"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-300"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                🧘 ซีนยาว (~5-8s)
              </button>
            </div>
          </div>

          {/* Quick Scene Chips (Auto, 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 30) */}
          <div className="md:col-span-7 space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-indigo-600" />
                <span>จำนวนฉาก & มุมกล้อง (Scene & Multi-Angle Count)</span>
              </label>
              <span className="text-[10.5px] font-bold">
                {isAutoSceneCount ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    🤖 AI คำนวณอัตโนมัติ ({scenes.length || sceneCount} ฉาก: มี Insert, Zoom, Cutaway ครบ)
                  </span>
                ) : (
                  <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    🔒 ล็อกไว้ที่ {sceneCount} ฉาก
                  </span>
                )}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1 bg-[#F7F8FA] p-1.5 rounded-xl border border-slate-200">
              {/* 🤖 Auto Multi-Shot Button */}
              <button
                type="button"
                onClick={handleAutoSceneCount}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  isAutoSceneCount
                    ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
                title="AI ปรับจำนวนฉากอัตโนมัติตามเนื้อหาจริง มีหลายมุมกล้อง (Insert, Zoom, OTS) ครบถ้วน ไม่จำกัดฉาก"
              >
                <span>🤖 อัตโนมัติ</span>
                {isAutoSceneCount && (
                  <span className="text-[9.5px] bg-white/20 text-white px-1.5 py-0.2 rounded-md font-bold">
                    เปิดใช้งาน
                  </span>
                )}
              </button>

              <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

              {[1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 30].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSceneCountChange(c)}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    !isAutoSceneCount && sceneCount === c
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  {c === 8 ? "⭐ 8" : c}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-1 pl-1">
                <input
                  type="number"
                  min={1}
                  max={36}
                  value={sceneCount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val && val >= 1 && val <= 36) {
                      handleSceneCountChange(val);
                    }
                  }}
                  className="w-10 bg-white text-xs font-mono font-bold text-center py-0.5 rounded border border-slate-300 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] font-bold text-slate-500">ฉาก</span>
              </div>
            </div>

            {/* Explanatory Multi-shot Badge */}
            <p className="text-[10.5px] text-slate-500 flex items-center gap-1 pt-0.5">
              <span>✨</span>
              <span>
                {isAutoSceneCount
                  ? "โหมดอัตโนมัติ: AI จัดวางสตอรี่บอร์ดหลายมุมกล้อง (Wide, Medium, 🔍 Extreme Macro Insert, 📐 Kinetic Zoom, 🎬 OTS, 💡 B-Roll Cutaway) ยิ่งมีฉากเยอะยิ่งดูสมจริงเหมือนโปรดักชันภาพยนตร์"
                  : `กำลังล็อกคงที่ ${sceneCount} ฉาก (คลิก '🤖 อัตโนมัติ' หากต้องการให้ AI กระจายมุมกล้องและจำนวนฉากตามความเหมาะสมของเนื้อหา)`}
              </span>
            </p>
          </div>
        </div>

        {/* ROW 4: Custom On-Screen Thai Text / Graphic Headline */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-600" />
              <span>กำหนดข้อความตัวหนังสือบนคลิป (Custom On-Screen Thai Text)</span>
            </label>
            <span className="text-[10.5px] text-slate-400">
              พิมพ์ข้อความคั่นด้วยเครื่องหมายจุลภาค (,) หรือเว้นว่างเพื่อให้ AI สร้างพาดหัวและแท็กพิกัดให้อัตโนมัติ
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customOnScreenText}
              onChange={(e) => setCustomOnScreenText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  executeGeneration(productName, productPrice, sceneCount, aspectRatio, targetDuration, pacingStyle, customOnScreenText);
                }
              }}
              placeholder="เช่น: 3 พิกัดลับเชียงใหม่ ฟีลอังกฤษ 🇬🇧, บรรยากาศอบอุ่น, เซฟพิกัดไว้พาแฟนไปถ่ายด่วน! (เว้นว่างไว้ = AI คิดให้ครบทุกฉาก)"
              className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            />
            {customOnScreenText && (
              <button
                type="button"
                onClick={() => {
                  setCustomOnScreenText("");
                  executeGeneration(productName, productPrice, sceneCount, aspectRatio, targetDuration, pacingStyle, "");
                }}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer rounded-lg hover:bg-slate-100"
                title="ล้างข้อความและใช้ข้อความอัตโนมัติ"
              >
                ล้าง
              </button>
            )}
            <button
              type="button"
              onClick={() => executeGeneration(productName, productPrice, sceneCount, aspectRatio, targetDuration, pacingStyle, customOnScreenText)}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs whitespace-nowrap cursor-pointer border border-indigo-200"
            >
              อัปเดตข้อความ
            </button>
          </div>
        </div>

        {/* REALTIME PRODUCTION STATS BANNER */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              สเปกการผลิต: ความยาวคลิป <strong>{targetDuration} วินาที</strong> · ทั้งหมด <strong>{sceneCount} ฉาก</strong> (เฉลี่ยฉากละ ~<strong>{avgSecPerShot} วินาที</strong>)
            </span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-indigo-800 font-medium">
              สไตล์: {pacingStyle === "dynamic_fast" ? "⚡ คัตเร็วหลายมุมมอง (Dynamic Montage)" : pacingStyle === "cinematic_slow" ? "🧘 ซีนยาวเน้นอารมณ์" : "🎬 มาตรฐานโฆษณา"}
            </span>
          </div>

          {lastSavedTime && (
            <div className="text-[10.5px] text-slate-400 flex items-center gap-1.5 ml-auto">
              <span>บันทึกร่างอัตโนมัติ {lastSavedTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* GOOGLE FLOW TOOL FIX & SETUP STATION (ALWAYS VISIBLE HERO PROMPT CARD) */}
      <div className="bg-white border-2 border-teal-600/50 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-teal-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-teal-700 text-white shadow-xs shrink-0 mt-0.5">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10.5px] font-bold uppercase px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                  🛠️ GOOGLE FLOW FIX & SETUP STATION (v5.8 PRO STUDIO)
                </span>
                <span className="text-xs font-bold text-slate-600">
                  ⚡ ป้องกัน Rate-Limit & Media Fields Error · Safe Sequential Queue · แก้ไข Prompt อิสระสัมพันธ์กับ OS
                </span>
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight mt-1">
                คำสั่งแก้และอัปเกรด Google Flow Tool (นำไปวางในแท็บ [แก้ไข] ของ Flow)
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                Google Flow ทำงานบนเบราว์เซอร์ของคุณ — เพียงคุณกด <strong>"คัดลอกคำสั่งแก้ Tool เดิม (v5.8 Pro)"</strong> แล้วนำไปวางในแท็บ <strong>[ แก้ไข ]</strong> ของหน้า Google Flow แล้วกด Enter หรือคลิกบันทึก Flow AI จะ<strong>อัปเกรดระบบเป็น Safe Sequential Queue + Media Fields Armor ไม่หลุด Rate Limit ไม่เจอ Media Fields Crash และมีกล่องแก้ไข Prompt รายช็อตสัมพันธ์กับ OS</strong> ทันที!
              </p>
            </div>
          </div>

          <a
            href={GOOGLE_FLOW_TOOL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>🚀 เปิด Google Flow Tool</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        {/* 3 Step Visual Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-md bg-teal-700 text-white flex items-center justify-center text-[11px] font-mono">1</span>
              <span>กดคัดลอกคำสั่งแก้</span>
            </div>
            <p className="text-[11.5px] text-slate-600 leading-snug">
              กดปุ่มสีเขียว <strong>"📋 คัดลอกคำสั่งแก้ Tool เดิม (v5.7 Pro)"</strong> ด้านล่างนี้
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-md bg-teal-700 text-white flex items-center justify-center text-[11px] font-mono">2</span>
              <span>ไปที่แท็บ [แก้ไข] ใน Flow</span>
            </div>
            <p className="text-[11.5px] text-slate-600 leading-snug">
              เปิด Google Flow ของคุณ แล้วคลิกแท็บ <strong>[ แก้ไข ]</strong> (Edit Tool)
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-5 h-5 rounded-md bg-teal-700 text-white flex items-center justify-center text-[11px] font-mono">3</span>
              <span>วางคำสั่งแล้วกดบันทึก</span>
            </div>
            <p className="text-[11.5px] text-slate-600 leading-snug">
              วางข้อความลงในช่องแชต แล้วกด Enter เพื่ออัปเกรด Tool เป็นระบบ Parallel ทันที
            </p>
          </div>
        </div>

        {/* Action Bar with 1-Click Copy Buttons and Preview Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Primary: Copy Fix Prompt */}
            <button
              type="button"
              onClick={() => copyToClipboard(GOOGLE_FLOW_FIX_PROMPT, "station-fix-prompt", "คำสั่งแก้ Tool เดิมในแท็บ [แก้ไข]")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {copiedKey === "station-fix-prompt" ? (
                <>
                  <Check className="w-4 h-4 text-teal-200" />
                  <span>✓ คัดลอกคำสั่งแก้แล้ว! (พร้อมไปวางในแท็บ [แก้ไข])</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-teal-200" />
                  <span>📋 คัดลอกคำสั่งแก้ Tool เดิม (v5.8 Pro Sequential Armor) — แนะนำ</span>
                </>
              )}
            </button>

            {/* Secondary: Copy Rebuild Prompt */}
            <button
              type="button"
              onClick={() => copyToClipboard(GOOGLE_FLOW_FULL_BUILDER_PROMPT, "station-rebuild-prompt", "คำสั่งสร้าง Tool ใหม่ v5.8 Pro")}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              {copiedKey === "station-rebuild-prompt" ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>✓ คัดลอกคำสั่งสร้างใหม่แล้ว!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>คำสั่งสร้าง Tool ใหม่ (v5.8 Pro Rebuild)</span>
                </>
              )}
            </button>

            {/* Modal details trigger */}
            <button
              type="button"
              onClick={() => setBlueprintV3ModalOpen(true)}
              className="text-xs text-teal-700 hover:text-teal-900 font-bold underline px-2 py-1 cursor-pointer"
            >
              ดูสถาปัตยกรรมพิมพ์เขียวเต็ม ➔
            </button>
          </div>

          {/* Toggle Preview Drawer */}
          <button
            type="button"
            onClick={() => setShowFlowFixPreview(!showFlowFixPreview)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{showFlowFixPreview ? "ซ่อนตัวอย่างข้อความคำสั่ง" : "👁️ ดูตัวอย่างข้อความคำสั่งที่จะนำไปวาง"}</span>
          </button>
        </div>

        {/* Expandable Preview Area */}
        {showFlowFixPreview && (
          <div className="space-y-2 pt-2 border-t border-teal-100 animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFlowPromptTab("edit")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    selectedFlowPromptTab === "edit"
                      ? "bg-teal-100 text-teal-900 border border-teal-300"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ข้อความแก้ Tool เดิม (แท็บ [แก้ไข])
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFlowPromptTab("rebuild")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    selectedFlowPromptTab === "rebuild"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ข้อความสร้าง Tool ใหม่ (Full Rebuild)
                </button>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedFlowPromptTab === "edit" ? "Fix & Topic Lock Prompt v5.4" : "Full Builder Prompt v5.4"}
              </span>
            </div>
            <textarea
              readOnly
              value={selectedFlowPromptTab === "edit" ? GOOGLE_FLOW_FIX_PROMPT : GOOGLE_FLOW_FULL_BUILDER_PROMPT}
              rows={9}
              className="w-full bg-slate-900 text-slate-100 p-3.5 rounded-xl border border-slate-800 font-mono text-[11.5px] leading-relaxed select-all focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* HERO SECTION: MASTER DIRECTIVE CARD (THE STAR OF GOOGLE FLOW) */}
      <div className="bg-white rounded-2xl border-2 border-indigo-200/90 p-6 shadow-xs space-y-4 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Zap className="w-5 h-5 text-amber-300" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  GOOGLE FLOW 3.0 MASTER DIRECTIVE (คำสั่งเดียวรันจบ ไร้ Error)
                </h2>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ⚡ บังคับ {scenes.length || sceneCount} ฉาก ({targetDuration} วินาที) · เสียงพากย์ไทยตรง 100%
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                รวมคำสั่งช็อต 1-{scenes.length || sceneCount}, ความยาวและไทม์โค้ดรายฉาก, สเปก 8K, สัดส่วน {aspectRatio} และล็อกหน้าคน-สินค้าไว้ในคำสั่งเดียว
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Button 1: Copy Full Master Directive */}
            <button
              type="button"
              onClick={() => copyToClipboard(masterDirectiveV3, "hero-master", `Master Directive ${scenes.length || sceneCount} ฉาก`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {copiedKey === "hero-master" ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>คัดลอก Master Directive สำเร็จแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-indigo-200" />
                  <span>📋 คัดลอก Master Directive {scenes.length || sceneCount} ฉาก ({targetDuration}s)</span>
                </>
              )}
            </button>

            {/* Button 2: Copy Clean Shots Script (Campaign Script) */}
            <button
              type="button"
              onClick={() => copyToClipboard(getCleanShotsScript(), "clean-shots-script", `เฉพาะสคริปต์ ${scenes.length || sceneCount} ช็อตสำหรับ Google Flow`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="คัดลอกเฉพาะบล็อก [SHOT 1] ถึง [SHOT N] เพื่อนำไปวางในช่อง Campaign Script ของ Google Flow โดยตรง"
            >
              {copiedKey === "clean-shots-script" ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>คัดลอกสคริปต์ช็อตแล้ว!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>🎬 คัดลอกเฉพาะสคริปต์ช็อต (วางใน Flow)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Master Directive Preview Area */}
        <div className="relative">
          <textarea
            readOnly
            value={masterDirectiveV3 || "กำลังประมวลผลคำสั่ง Master Directive..."}
            rows={10}
            className="w-full bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed focus:outline-none select-all shadow-inner"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="text-[10.5px] bg-slate-800/90 text-amber-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
              ⏱️ {targetDuration}s Total
            </span>
            <span className="text-[10.5px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
              {scenes.length} Shots Ready
            </span>
          </div>
        </div>

        {/* Guidance Section: Pure Prompt Banner vs 2-Slot Guidance Pills */}
        {referenceMode === "pure_prompt" ? (
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                  ✨ โหมด Prompt ล้วน (Pure Prompt to Video): ไม่จำเป็นต้องใช้รูปภาพอ้างอิง
                </span>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  สคริปต์ได้ระบุลักษณะคน วัตถุดิบ ความฉ่ำ แสง ({adStyle}) และมุมกล้องครบถ้วนในทุกช็อต สามารถนำไปกดรันใน Google Flow ได้ทันทีโดยไม่ต้องอัปโหลดรูป
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleReferenceModeChange("with_images")}
              className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline whitespace-nowrap self-end sm:self-center cursor-pointer"
            >
              สลับเป็นโหมดอ้างอิงรูปภาพ ➔
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <User className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Add Presenter (Slot 1):</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-700">
                  {referenceGuides[0]?.slotName?.includes("เชฟ") || referenceGuides[0]?.slotName?.includes("คน")
                    ? "แนบรูปหน้าเชฟ/ตัวแบบ หรือเว้นว่างได้"
                    : "แนบรูปหน้าตัวแบบ (Face Reference) หรือเว้นว่างได้"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-950 font-bold">
                  <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Add Product (Slot 2):</span>
                </div>
                <span className="text-[11px] font-semibold text-amber-800">
                  {referenceGuides[1]?.requirement ? "แนบรูปอาหาร/สินค้าจริง (Product Reference)" : "แนบรูปสินค้าหรืออาหารจริง (Product Reference)"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => handleReferenceModeChange("pure_prompt")}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
              >
                สลับเป็นโหมด Prompt ล้วน (ไม่ใช้รูป) ➔
              </button>
            </div>
          </div>
        )}

        {/* Pro-Tip Box for Google Flow */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-slate-900">
            <span>💡 เทคนิคการรันใน Google Flow ให้ได้ผล 100%:</span>
          </div>
          <p className="text-[11.5px] leading-relaxed text-slate-600">
            • <b>หากใช้โหมด Prompt ล้วน (ไม่ใช้รูป):</b> คัดลอก <b>Visual Prompt (EN)</b> รายช็อตด้านล่าง ไปวางสร้างในแท็บ <code className="bg-slate-200 text-slate-900 px-1.5 py-0.5 rounded font-bold">วิดีโอ (Videos)</code> หรือ <code className="bg-slate-200 text-slate-900 px-1.5 py-0.5 rounded font-bold">รูปภาพ (Images)</code> ของ Google Flow ได้ทันที ไม่ต้องใส่รูปใดๆ ทั้งสิ้น!
            <br />
            • <b>หากใช้โหมดอ้างอิงรูปภาพ (ผ่าน Tool PK Studio):</b> หากกด <code className="bg-slate-200 text-slate-900 px-1.5 py-0.5 rounded font-bold">🚀 RUN FULL PRODUCTION</code> แล้วปุ่มไม่ทำงาน ให้ลากรูปอาหาร/สินค้าลงในช่อง <b>Add Product</b> (และรูปคนในช่อง <b>Add Presenter</b>) ระบบจะเริ่มเรนเดอร์ทันที
          </p>
        </div>

        {/* Action Link Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-indigo-100">
          <span className="text-slate-600 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ก๊อปปี้ไปวางในช่อง Campaign Directive ของ Google Flow ➔ จะแตกเจน {scenes.length || sceneCount} ฉากพร้อมเสียงพากย์ทันที</span>
          </span>
          <a
            href={GOOGLE_FLOW_TOOL_URL}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 hover:text-indigo-800 font-bold underline inline-flex items-center gap-1"
          >
            <span>ไปที่หน้าต่าง Google Flow ทันที ➔</span>
          </a>
        </div>
      </div>

      {/* DYNAMIC SCENE VERIFICATION & SCRIPT SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-black text-[#17181A] uppercase tracking-wide">
                ตรวจสอบสคริปต์ {scenes.length} ฉากจริง ({targetDuration} วินาที · ภาพ + เสียงพากย์ไทยตรง 100%)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ทุกซีนด้านล่างนี้ถูกจัดลำดับเวลาและจังหวะกล้องอยู่ใน Master Directive แล้ว สามารถคัดลอกรายช็อตได้
            </p>
          </div>

          {/* Phase Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setActivePipelineTab("phase1_stills")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePipelineTab === "phase1_stills"
                  ? "bg-white text-indigo-950 shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🖼️ ภาพนิ่งตรวจหน้า
            </button>
            <button
              type="button"
              onClick={() => setActivePipelineTab("phase2_motion")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePipelineTab === "phase2_motion"
                  ? "bg-white text-purple-950 shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🎬 คำสั่งวิดีโอ (Veo)
            </button>
            <button
              type="button"
              onClick={() => setActivePipelineTab("all")}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePipelineTab === "all"
                  ? "bg-white text-slate-900 shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ทั้งหมด
            </button>
          </div>
        </div>

        {/* Dynamic Scene Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {scenes.map((scene, sceneIdx) => {
            const accentColor = sceneIdx === 0
              ? "amber"
              : sceneIdx === scenes.length - 1
              ? "emerald"
              : "indigo";
            const accentBarClass = sceneIdx === 0
              ? "bg-amber-500"
              : sceneIdx === scenes.length - 1
              ? "bg-emerald-500"
              : "bg-indigo-600";

            return (
            <div
              key={scene.id}
              className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all duration-200 overflow-hidden"
            >
              {/* Left Accent Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBarClass} rounded-l-2xl`} />

              <div className="pl-5 pr-5 pt-5 pb-4 space-y-4">
                {/* Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-xs text-white ${
                      sceneIdx === 0
                        ? "bg-amber-500"
                        : sceneIdx === scenes.length - 1
                        ? "bg-emerald-600"
                        : "bg-indigo-600"
                    }`}>
                      {scene.sceneNumber < 10 ? `0${scene.sceneNumber}` : scene.sceneNumber}
                    </span>
                    <div>
                      <span className="text-[13px] font-bold text-slate-900 leading-tight block">{scene.shotType}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-indigo-600 font-mono font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {scene.timecode}
                        </span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[10px] font-semibold text-slate-500">{scene.durationSec}s</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-semibold max-w-[140px] truncate hidden sm:flex items-center gap-1" title={scene.cameraMovement}>
                      <Camera className="w-3 h-3 text-slate-400 shrink-0" />
                      {scene.cameraMovement}
                    </span>

                    {/* Re-roll Alternative Prompt for this scene */}
                    <button
                      type="button"
                      disabled={rerollingSceneId === scene.id}
                      onClick={() => handleRerollScenePrompt(scene)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-amber-800 hover:text-white bg-amber-50 hover:bg-amber-600 border border-amber-200 hover:border-amber-600 cursor-pointer flex items-center gap-1.5 transition-all duration-200 disabled:opacity-50"
                      title="สร้าง Prompt ทางเลือกใหม่สำหรับฉากนี้ โดยรักษาเนื้อเรื่องและเชื่อมกับฉากอื่นตามปกติ"
                    >
                      {rerollingSceneId === scene.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                          <span className="hidden sm:inline">กำลังคิด...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>✨ เจนใหม่</span>
                        </>
                      )}
                    </button>

                    {editingSceneId === scene.id ? (
                      <button
                        type="button"
                        onClick={() => setEditingSceneId(null)}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
                      >
                        ✕ ยกเลิก
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartEditScene(scene)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-indigo-700 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 cursor-pointer flex items-center gap-1.5 transition-all duration-200"
                      >
                        <span>✏️ แก้ไข</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* CARD BODY: EDIT MODE VS VIEW MODE */}
                {editingSceneId === scene.id ? (
                  <div className="space-y-4 p-5 bg-gradient-to-br from-amber-50/60 to-orange-50/30 rounded-xl border border-amber-200/80 text-xs">
                    <div className="font-bold text-amber-950 flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-[13px]">
                        <Wand2 className="w-4 h-4 text-amber-600" />
                        แก้ไขช็อต {scene.sceneNumber}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={rerollingSceneId === scene.id}
                          onClick={() => handleRerollScenePrompt(scene)}
                          className="text-[11px] text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                          title="สร้าง Prompt ทางเลือกใหม่สำหรับช็อตนี้ โดยรักษาเนื้อเรื่องและเชื่อมกับฉากอื่น"
                        >
                          {rerollingSceneId === scene.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-amber-700" />
                              <span>กำลังคิด Prompt ทางเลือกใหม่...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                              <span>✨ สุ่ม Prompt ทางเลือกใหม่ (คงเรื่องเดิม)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Edit On-Screen Text */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5 text-indigo-600" />
                        ข้อความบนคลิป (ภาษาไทย)
                      </label>
                      <input
                        type="text"
                        value={editForm.onScreenTextTh}
                        onChange={(e) => setEditForm(prev => ({ ...prev, onScreenTextTh: e.target.value }))}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                        placeholder="พิมพ์ข้อความภาษาไทย..."
                      />
                    </div>

                    {/* Edit Text Position */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        ตำแหน่งข้อความ
                      </label>
                      <select
                        value={editForm.textPosition}
                        onChange={(e) => setEditForm(prev => ({ ...prev, textPosition: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="Top Headline">Top Headline (พาดหัวบนสุด)</option>
                        <option value="Lower Third">Lower Third (แถบด้านล่าง)</option>
                        <option value="Center Punchy">Center Punchy (เด่นตรงกลาง)</option>
                        <option value="Bottom Center CTA">Bottom Center CTA (ปุ่มกระตุ้นท้ายคลิป)</option>
                      </select>
                    </div>

                    {/* Edit Voiceover */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-emerald-900 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                        เสียงพากย์ไทย (Voiceover)
                      </label>
                      <textarea
                        rows={2}
                        value={editForm.thaiVoiceover}
                        onChange={(e) => setEditForm(prev => ({ ...prev, thaiVoiceover: e.target.value }))}
                        className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-[13px] text-emerald-950 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                        placeholder="บทพูดพากย์ภาษาไทย..."
                      />
                    </div>

                    {/* Edit Visual Prompt */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                        Visual Prompt (EN)
                      </label>
                      <textarea
                        rows={3}
                        value={editForm.visualPromptEn}
                        onChange={(e) => setEditForm(prev => ({ ...prev, visualPromptEn: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 font-mono text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                        placeholder="Photorealistic 8k..."
                      />
                    </div>

                    {/* Edit Camera Movement */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        Camera Movement
                      </label>
                      <input
                        type="text"
                        value={editForm.cameraMovement}
                        onChange={(e) => setEditForm(prev => ({ ...prev, cameraMovement: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Smooth Forward Tracking 35mm"
                      />
                    </div>

                    {/* Edit Physical Motion Choreography (Veo 2) */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-purple-900 flex items-center gap-2">
                        <Film className="w-3.5 h-3.5 text-purple-600" />
                        <span>Motion Choreography (Veo 2)</span>
                        <span className="text-[9px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-semibold">ฟิสิกส์จริง</span>
                      </label>
                      <textarea
                        rows={3}
                        value={editForm.motionPrompt}
                        onChange={(e) => setEditForm(prev => ({ ...prev, motionPrompt: e.target.value }))}
                        className="w-full bg-white border border-purple-200 rounded-xl p-3 font-mono text-[12px] text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm"
                        placeholder="Photorealistic 8K image-to-video. Real-world physical action..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-200/60">
                      <button
                        type="button"
                        onClick={() => setEditingSceneId(null)}
                        className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveScene(scene.id)}
                        className="px-5 py-2 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-95"
                      >
                        ✓ บันทึกการแก้ไข
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Thai Voiceover Script */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-200/70 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[12px] font-bold text-emerald-900">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                            <Volume2 className="w-3.5 h-3.5" />
                          </div>
                          เสียงพากย์ไทย
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(scene.thaiVoiceover, `voice-${scene.id}`, "เสียงพากย์ไทย")}
                          className="text-[11px] text-emerald-700 hover:text-white hover:bg-emerald-600 font-bold px-3 py-1 rounded-lg border border-emerald-200 hover:border-emerald-600 cursor-pointer transition-all duration-200 flex items-center gap-1.5"
                        >
                          {copiedKey === `voice-${scene.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedKey === `voice-${scene.id}` ? "คัดลอกแล้ว!" : "คัดลอก"}
                        </button>
                      </div>
                      <p className="text-[13px] font-semibold text-emerald-950 leading-relaxed pl-8">
                        &ldquo;{scene.thaiVoiceover}&rdquo;
                      </p>
                    </div>

                    {/* On-Screen Thai Text */}
                    <div className="bg-gradient-to-r from-indigo-50 to-violet-50/50 border border-indigo-200/70 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[12px] font-bold text-indigo-900">
                          <div className="w-6 h-6 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
                            <Type className="w-3.5 h-3.5" />
                          </div>
                          ข้อความบนคลิป
                          {scene.textPosition && (
                            <span className="text-[10px] text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-full font-semibold ml-1">
                              {scene.textPosition}
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(scene.onScreenTextTh || "", `text-${scene.id}`, "ข้อความบนคลิป")}
                          className="text-[11px] text-indigo-700 hover:text-white hover:bg-indigo-600 font-bold px-3 py-1 rounded-lg border border-indigo-200 hover:border-indigo-600 cursor-pointer transition-all duration-200 flex items-center gap-1.5"
                        >
                          {copiedKey === `text-${scene.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedKey === `text-${scene.id}` ? "คัดลอกแล้ว!" : "คัดลอก"}
                        </button>
                      </div>
                      <p className="text-[14px] font-black text-indigo-950 leading-relaxed pl-8 font-sans">
                        &ldquo;{scene.onScreenTextTh || "พิกัดลับที่ไม่ควรพลาด ✨"}&rdquo;
                      </p>
                    </div>

                    {/* Visual Prompt */}
                    {(activePipelineTab === "phase1_stills" || activePipelineTab === "all") && (
                      <div className="space-y-2 bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-xl border border-slate-200/70">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-[12px] font-bold text-slate-800">
                            <div className="w-6 h-6 rounded-lg bg-slate-700 text-white flex items-center justify-center">
                              <ImageIcon className="w-3.5 h-3.5" />
                            </div>
                            Visual Prompt (EN)
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={rerollingSceneId === scene.id}
                              onClick={() => handleRerollScenePrompt(scene)}
                              className="text-[11px] text-amber-700 hover:text-white hover:bg-amber-600 font-bold px-2.5 py-1 rounded-lg border border-amber-200 hover:border-amber-600 cursor-pointer transition-all duration-200 flex items-center gap-1 disabled:opacity-50"
                              title="สร้าง Prompt ทางเลือกใหม่สำหรับภาพนี้ โดยรักษาเรื่องเดิม"
                            >
                              {rerollingSceneId === scene.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                              ) : (
                                <Sparkles className="w-3 h-3 text-amber-500" />
                              )}
                              <span>สุ่มมุมมองใหม่</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(scene.visualPromptEn, `visual-${scene.id}`, "Visual Prompt")}
                              className="text-[11px] text-slate-600 hover:text-white hover:bg-slate-700 font-bold px-3 py-1 rounded-lg border border-slate-200 hover:border-slate-700 cursor-pointer transition-all duration-200 flex items-center gap-1.5"
                            >
                              {copiedKey === `visual-${scene.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              {copiedKey === `visual-${scene.id}` ? "คัดลอกแล้ว!" : "คัดลอก Prompt"}
                            </button>
                          </div>
                        </div>
                        <p className="font-mono text-[12px] text-slate-700 leading-relaxed select-all pl-8">
                          {scene.visualPromptEn}
                        </p>
                      </div>
                    )}

                    {/* Veo Motion Prompt */}
                    {(activePipelineTab === "phase2_motion" || activePipelineTab === "all") && (
                      <div className="space-y-2 bg-gradient-to-br from-purple-50/60 to-violet-50/40 p-4 rounded-xl border border-purple-200/70">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-[12px] font-bold text-purple-900">
                            <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                              <Film className="w-3.5 h-3.5" />
                            </div>
                            <span>Veo 2 Motion ({scene.durationSec}s)</span>
                            <span className="text-[9px] px-2 py-0.5 bg-purple-200/60 text-purple-800 rounded-full font-semibold">ฟิสิกส์จริง</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const veo = scene.motionPrompt || `Image-to-video animation: Camera executes ${scene.cameraMovement}. Duration: ${scene.durationSec}s. Real-world physical action, smooth motion, natural depth, preserve character and product consistency, zero morphing. 24fps.`;
                              copyToClipboard(veo, `veo-${scene.id}`, "Veo 2 Motion Prompt");
                            }}
                            className="text-[11px] text-purple-700 hover:text-white hover:bg-purple-600 font-bold px-3 py-1 rounded-lg border border-purple-200 hover:border-purple-600 cursor-pointer transition-all duration-200 flex items-center gap-1.5"
                          >
                            {copiedKey === `veo-${scene.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            {copiedKey === `veo-${scene.id}` ? "คัดลอกแล้ว!" : "คัดลอก Motion"}
                          </button>
                        </div>
                        <p className="font-mono text-[12px] text-purple-900 leading-relaxed select-all pl-8">
                          {scene.motionPrompt || `Image-to-video animation: Camera executes ${scene.cameraMovement}. Duration: ${scene.durationSec}s. Real-world physical action, smooth motion, natural depth, preserve character and product consistency, zero morphing. 24fps.`}
                        </p>
                      </div>
                    )}

                    {/* Face Correction Prompt Button */}
                    <div className="pt-1.5 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const fix = `Portrait of same subject from Slot 1 reference photo, symmetrical face, natural skin texture, sharp clear eyes, photorealistic 8k, fix distorted facial features --ar ${aspectRatio}`;
                          copyToClipboard(fix, `facefix-${scene.id}`, "คำสั่งแก้ใบหน้า");
                        }}
                        className="text-[11px] font-bold text-slate-500 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-purple-300 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                        title="ใช้เมื่อภาพใน Google Flow มีใบหน้าเพี้ยนหรือไม่ตรง"
                      >
                        {copiedKey === `facefix-${scene.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <RefreshCw className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copiedKey === `facefix-${scene.id}` ? "คัดลอกคำสั่งแก้หน้าแล้ว" : "🔄 แก้ใบหน้า (Face Correction)"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
          })}
        </div>
      </div>

      {/* DISCREET DEVELOPER JSON DRAWER (BOTTOM - ZERO CLUTTER) */}
      <div className="border-t border-[#E8E9EC] pt-6">
        <button
          type="button"
          onClick={() => setJsonDrawerOpen(!jsonDrawerOpen)}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1.5 cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>⚙️ ขั้นสูงสำหรับ Developer: ดู Google Flow JSON Schema (v2.1.0) {jsonDrawerOpen ? "▲ ซ่อน" : "▼ แสดง"}</span>
        </button>

        {jsonDrawerOpen && (
          <div className="mt-3 bg-slate-950 p-4 rounded-xl text-cyan-300 font-mono text-xs max-h-64 overflow-y-auto select-all border border-slate-800 shadow-inner">
            <pre>
              {JSON.stringify({
                workflow_name: "PK_Commercial_Video_Studio_v3",
                target_duration_sec: targetDuration,
                pacing_style: pacingStyle,
                scene_count: scenes.length,
                aspect_ratio: aspectRatio,
                scenes: scenes.map(s => ({
                  scene: s.sceneNumber,
                  duration_sec: s.durationSec,
                  timecode: s.timecode,
                  type: s.shotType,
                  prompt: s.visualPromptEn,
                  voiceover: s.thaiVoiceover,
                  camera: s.cameraMovement
                }))
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* BLUEPRINT V3 MODAL */}
      {blueprintV3ModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    พิมพ์เขียว Google Flow 3.0 (Zero-Error Architecture)
                  </h2>
                  <p className="text-xs text-slate-500">
                    รองรับทุกความยาวคลิปและจำนวนฉาก ➔ เจนภาพนิ่งตรวจหน้า ➔ แปลงเป็นวิดีโอ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBlueprintV3ModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕ ปิด
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="font-bold text-emerald-950 text-[13px]">
                  💡 แก้ปัญหา Error ที่ต้นตอ:
                </div>
                <p>
                  1. <strong>ไม่มีปุ่มซับซ้อนใน Google Flow</strong>: ให้ OS คิดสัดส่วน จังหวะเวลา ไทม์โค้ด และสคริปต์มาให้ครบใน Master Directive<br />
                  2. <strong>Plain-Text Directive</strong>: ไม่ใส่ Markdown Backticks หรือ JSON แปลกปลอม ทำให้ตัวแปลงของ Google Flow ทำงานได้ราบรื่น 100%<br />
                  3. <strong>Image-First Pipeline</strong>: เจนภาพนิ่ง Keyframes ออกมาก่อน ตรวจเช็คหน้าคนให้เป๊ะ ➔ ค่อยกดแปลงเป็นวิดีโอ หมดปัญหาคลิปหน้าเบี้ยว
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  โครงสร้าง 3 ช่องที่ต้องมีใน Google Flow:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="font-bold text-indigo-900">1. Master Directive</div>
                    <div className="text-slate-500 text-[10px] mt-1">ช่อง Textarea รับคำสั่งเดียวจาก OS</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="font-bold text-purple-900">2. Face Reference</div>
                    <div className="text-slate-500 text-[10px] mt-1">ช่องอัปโหลดรูปตัวแบบ/ใบหน้า</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="font-bold text-amber-900">3. Product Packshot</div>
                    <div className="text-slate-500 text-[10px] mt-1">ช่องอัปโหลดรูปสินค้าจริง</div>
                  </div>
                </div>
              </div>

              {/* Ready-to-copy Edit Fix Prompt Box */}
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-teal-800/80 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>ทางเลือกที่ 1: คำสั่งแก้ Tool เดิมในแท็บ [ แก้ไข ] (แก้ Error + ล้าง Mock + Auto-Retry + บังคับไม่ปนเรื่อง):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(GOOGLE_FLOW_FIX_PROMPT, "modal-fix-prompt", "Prompt แก้ไขในแท็บ [แก้ไข]")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                  >
                    {copiedKey === "modal-fix-prompt" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-teal-200" />
                        <span>✓ คัดลอกคำสั่งแก้แล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-teal-200" />
                        <span>📋 คัดลอกคำสั่งแก้ในแท็บ [แก้ไข]</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  คลิกแท็บ <strong>[ แก้ไข ]</strong> ขวาบนใน Google Flow แล้ววางคำสั่งนี้ลงในช่องแชต เพื่อให้ Flow AI แก้ปัญหา Error และเพิ่มปุ่มเลือก มีรูป/ไม่มีรูป ทันที
                </p>
              </div>

              {/* Ready-to-copy Full Rebuild Prompt Box */}
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>ทางเลือกที่ 2: คำสั่งสร้าง Tool ใหม่ v4.8 (Full Rebuild Prompt):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(GOOGLE_FLOW_FULL_BUILDER_PROMPT, "modal-builder-prompt", "Prompt สร้าง Tool ใหม่")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                  >
                    {copiedKey === "modal-builder-prompt" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-200" />
                        <span>✓ คัดลอก Prompt แล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-emerald-200" />
                        <span>📋 คัดลอก Prompt สร้าง Tool ใหม่</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                  คัดลอกข้อความนี้ไปวางในช่อง "Describe the tool you want to build" เมื่อต้องการสร้าง Tool ใหม่
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAPPING GUIDE MODAL */}
      {mappingGuideOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">
                  ตารางสรุปจับคู่ช่องกรอก (PK Marketing AI OS ➔ Google Flow)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMappingGuideOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕ ปิด
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-bold text-indigo-950">📋 Master Directive (บนสุด)</span>
                <span className="text-slate-600 font-medium">วางในช่อง Prompt หลักของ Google Flow</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-bold text-purple-950">👤 Slot 1: Face Reference</span>
                <span className="text-slate-600 font-medium">แนบรูปใบหน้านางแบบ/พรีเซนเตอร์/บัณฑิต</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-bold text-amber-950">📦 Slot 2: Product Packshot</span>
                <span className="text-slate-600 font-medium">แนบรูปสินค้า/รถยนต์/สถานที่จริง</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-bold text-slate-900">⏱️ ความยาวคลิปและไทม์โค้ด</span>
                <span className="text-slate-600 font-medium">ระบุอัตโนมัติใน Master Directive ตามที่เลือก</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVE PROJECT MODAL */}
      {saveProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black text-slate-900">
                  บันทึกงานเป็นโปรเจกต์ (Save Project)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSaveProjectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                ตั้งชื่อโปรเจกต์เพื่อให้ค้นหาและนำกลับมาทำต่อได้ง่ายในประวัติ:
              </p>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ชื่อโปรเจกต์</label>
                <input
                  type="text"
                  value={projectNameInput}
                  onChange={(e) => setProjectNameInput(e.target.value)}
                  placeholder="เช่น กะเพราพริกแห้งโบราณ (20 ฉาก · 60s)"
                  className="w-full bg-[#F7F8FA] border border-[#E8E9EC] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              {/* Summary Pill */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 space-y-1.5 text-[11px]">
                <div className="font-bold text-amber-950 flex items-center justify-between">
                  <span>รายละเอียดที่กำลังบันทึก:</span>
                  <span className="text-amber-800 font-bold">{scenes.length || sceneCount} ฉาก ({targetDuration}s)</span>
                </div>
                <div className="text-slate-600 flex flex-wrap gap-2 pt-1 border-t border-amber-200/60">
                  <span>สัดส่วน: {aspectRatio}</span>
                  <span>•</span>
                  <span>โหมด: {referenceMode === "pure_prompt" ? "✨ Prompt ล้วน" : "🖼️ อ้างอิงรูป"}</span>
                  {activeBrand && (
                    <>
                      <span>•</span>
                      <span>แบรนด์: {activeBrand}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSaveProjectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveProjectConfirm}
                disabled={!projectNameInput.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                ✓ ยืนยันบันทึกโปรเจกต์
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT HISTORY MODAL */}
      {projectHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    คลังประวัติโปรเจกต์ (Project History)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    มีโปรเจกต์ที่บันทึกไว้ทั้งหมด {projects.length} รายการ (เปิดดูฉากย่อยและโหลดกลับมาทำงานต่อได้)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProjectHistoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Project List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
              {projects.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">ยังไม่มีโปรเจกต์ที่บันทึกไว้</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    เมื่อคุณตั้งค่าหรือสร้างสคริปต์เสร็จแล้ว สามารถกดปุ่ม <span className="font-bold text-amber-700">"💾 บันทึกโปรเจกต์"</span> ด้านบน เพื่อเก็บงานไว้เป็นประวัติได้ตลอดเวลาครับ
                  </p>
                </div>
              ) : (
                projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50 transition-all shadow-2xs space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                          {proj.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200/60">
                            {proj.sceneCount || proj.scenes?.length || 8} ฉาก
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                            ⏱️ {proj.targetDuration}s
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                            สัดส่วน {proj.aspectRatio}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200/60">
                            {proj.referenceMode === "pure_prompt" ? "✨ Prompt ล้วน" : "🖼️ อ้างอิงรูป"}
                          </span>
                          {proj.brandName && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              แบรนด์: {proj.brandName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteProject(proj.id, e)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="ลบโปรเจกต์นี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLoadProject(proj)}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span>เปิดทำงานต่อ</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Meta info & sample shot titles */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>
                        บันทึกเมื่อ: {new Date(proj.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })} {new Date(proj.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {proj.scenes && proj.scenes.length > 0 && (
                        <span className="text-slate-500 font-medium truncate max-w-xs">
                          ช็อตแรก: {proj.scenes[0].onScreenTextTh || proj.scenes[0].shotType}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
