"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Image as ImageIcon,
  Video,
  Sparkles,
  Download,
  Share2,
  Layers,
  Wand2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Eye,
  Type,
  Palette,
  Layout,
  ExternalLink,
  Copy,
  Upload,
  Play,
  ArrowRight,
  ShieldCheck,
  Check,
  Send,
  Zap,
  Edit3,
  BookOpen,
  Building2,
  Star,
  Film,
  Trash2,
  Maximize2,
  Plus,
  X,
  Camera,
  Info,
  RotateCw
} from "lucide-react";
import { ContentIdea, Platform, MediaBlueprint } from "@/types";
import { useBrand } from "@/context/BrandContext";
import { Badge } from "@/components/ui/Badge";

interface PlatformMeta {
  id: Platform;
  name: string;
  iconName: string;
  color: string;
  bgActive: string;
  desc: string;
  aspectRatio: "1:1" | "9:16" | "16:9" | "3:4";
  formatBadge: string;
  recommendedTime: string;
  externalToolRec: string;
}

const ALL_PLATFORMS: PlatformMeta[] = [
  {
    id: "facebook",
    name: "Facebook",
    iconName: "Facebook",
    color: "text-blue-600", bgActive: "bg-blue-50 border-blue-300 text-blue-900",
    desc: "โพสต์ยาวได้ เล่าเรื่องเต็มที่ สรุปประเด็นชัดเจน พร้อมอัลบั้ม 3-5 รูป หรือภาพเดี่ยว 1:1",
    aspectRatio: "1:1",
    formatBadge: "สัดส่วน 1:1 หรืออัลบั้ม 3-5 รูป",
    recommendedTime: "11:30 - 13:00 น. และ 19:00 - 21:00 น.",
    externalToolRec: "Bing Designer / Midjourney / ChatGPT"
  },
  {
    id: "tiktok",
    name: "TikTok",
    iconName: "Video",
    color: "text-rose-600", bgActive: "bg-rose-50 border-rose-300 text-rose-900",
    desc: "แคปชันสั้นกระชับ สคริปต์คลิปสั้นแนวตั้ง 9:16 เปิดด้วย Hook ใน 3 วินาทีแรก หรือ Photo Slideshow",
    aspectRatio: "9:16",
    formatBadge: "แนวตั้ง 9:16 (คลิป 30-60 วิ หรือ Photo Slideshow)",
    recommendedTime: "18:30 - 21:00 น. (ช่วงพีคคนดูคลิปสั้น)",
    externalToolRec: "Kling AI / Runway / Pika / ChatGPT"
  },
  {
    id: "instagram",
    name: "Instagram",
    iconName: "Instagram",
    color: "text-fuchsia-600", bgActive: "bg-fuchsia-50 border-fuchsia-300 text-fuchsia-900",
    desc: "แคปชันปานกลาง เว้นวรรคอ่านง่าย สบายตา ภาพคลีน Minimal หรือ Carousel 3-10 รูป",
    aspectRatio: "1:1",
    formatBadge: "สัดส่วน 1:1 หรือ 4:5 (รองรับ Carousel)",
    recommendedTime: "17:00 - 20:00 น. (ช่วงเลิกงาน)",
    externalToolRec: "Midjourney / Bing Designer / Leonardo.ai"
  },
  {
    id: "lemon8",
    name: "Lemon8",
    iconName: "Citrus",
    color: "text-amber-700", bgActive: "bg-amber-50 border-amber-300 text-amber-900",
    desc: "สรุปแบบ How-to / เทคนิคเป็นข้อๆ โทนละมุน ภาพการ์ดความรู้สัดส่วน 3:4 หลายใบ",
    aspectRatio: "3:4",
    formatBadge: "แนวตั้ง 3:4 สไตล์การ์ดความรู้",
    recommendedTime: "12:00 - 14:00 น. และ 20:00 - 22:00 น.",
    externalToolRec: "Bing Designer / Canva / Midjourney"
  },
  {
    id: "x",
    name: "X (Twitter)",
    iconName: "Twitter",
    color: "text-sky-700", bgActive: "bg-sky-50 border-sky-300 text-sky-900",
    desc: "แคปชันสั้นไม่เกิน 280 ตัวอักษร สรุปหมัดฮุก ภาพสแน็ปข่าวกระชับ 16:9",
    aspectRatio: "16:9",
    formatBadge: "แนวนอน 16:9 ข่าวสารสแน็ป",
    recommendedTime: "08:00 - 09:30 น. และ 17:30 - 19:30 น.",
    externalToolRec: "Bing Designer / Leonardo.ai"
  }
];

function ContentStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetIdParam = searchParams.get("id");

  const [acceptedIdeas, setAcceptedIdeas] = useState<ContentIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);

  // Platform selection & active tab (Default: FB and TikTok)
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "facebook",
    "tiktok"
  ]);
  const [activePlatformTab, setActivePlatformTab] = useState<Platform>("facebook");

  // Per-Platform Captions (Synchronized per idea)
  const [platformOutputs, setPlatformOutputs] = useState<Record<string, { content: string; video_script?: string }>>({});

  // Per-Platform Attached Media List (Array of images/videos for each platform!)
  const [platformMedia, setPlatformMedia] = useState<Record<string, string[]>>({});

  // Media Creation Mode: "MANUAL" (external gen & upload) vs "AUTO" (in-app)
  const [mediaCreationMode, setMediaCreationMode] = useState<"MANUAL" | "AUTO">("MANUAL");
  const [customImageUrlInput, setCustomImageUrlInput] = useState("");
  const [imageModel, setImageModel] = useState<"flux" | "flux-realism" | "nano-banana" | "imagen">("flux");
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // AI Vision Analysis States
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionAnalysisResult, setVisionAnalysisResult] = useState<{
    detected_elements: string[];
    lighting_tone: string;
    style_vibe: string;
    recommendation: string;
    image_count: number;
  } | null>(null);
  const [refinedPrompts, setRefinedPrompts] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchAcceptedIdeas();
  }, [targetIdParam]);

  const fetchAcceptedIdeas = async () => {
    try {
      const res = await fetch("/api/ai/ideas");
      const data = await res.json();
      if (data.ideas && data.ideas.length > 0) {
        const accepted = data.ideas.filter((i: ContentIdea) => i.status === "ACCEPTED");
        const listToUse = accepted.length > 0 ? accepted : data.ideas;
        setAcceptedIdeas(listToUse);

        let initial = listToUse[0];
        if (targetIdParam) {
          const match = listToUse.find((i: ContentIdea) => i.id === targetIdParam);
          if (match) initial = match;
        } else if (typeof window !== "undefined") {
          const lastActiveId = localStorage.getItem("pk_content_active_idea_id");
          if (lastActiveId) {
            const lastMatch = listToUse.find((i: ContentIdea) => i.id === lastActiveId);
            if (lastMatch) initial = lastMatch;
          }
        }

        handleSelectIdea(initial);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Synchronized Idea State Switcher: Updates captions, prompts, and media cleanly
  const handleSelectIdea = (idea: ContentIdea) => {
    setSelectedIdea(idea);

    // 1. Generate or load per-platform tailored captions
    const newPlatformOutputs: Record<string, { content: string; video_script?: string }> = {};
    
    // Check if idea has pre-generated platform_captions
    const savedCaptions = (idea as any).platform_captions;
    const title = idea.title || "คอนเทนต์";
    const hook = idea.hook || title;
    const concept = idea.concept || idea.caption || "";
    const tags = (idea.hashtags || []).map(h => (h.startsWith("#") ? h : `#${h}`)).join(" ");

    // Facebook: Long-form expert post referencing photos
    newPlatformOutputs.facebook = {
      content: savedCaptions?.facebook || `🔥 ${hook}\n\n${concept}\n\n🖼️ สังเกตจากภาพแรกตรงรายละเอียดพิมพ์ทรงและเนื้อหาสำคัญที่ถ่ายทอดออกมาอย่างชัดเจน\n🔍 เลื่อนดูภาพถัดไปเพื่อเจาะลึกจุดเด่นเฉพาะด้าน\n\n✨ ไฮไลต์ที่คุณจะได้รับ:\n• คัดสรรเนื้อหาคุณภาพระดับพรีเมียมจากผู้เชี่ยวชาญ\n• อธิบายชัดเจนตามหลักวิชาการและประสบการณ์จริง\n• การันตีความพึงพอใจและความคุ้มค่า\n\n📌 สนใจทักสอบถามหรือขอชมรูปเพิ่มเติมได้เลยครับ!\n\n${tags}`
    };

    // TikTok: Short, punchy hook script
    newPlatformOutputs.tiktok = {
      content: savedCaptions?.tiktok || `🔥 ${hook}!\nดูในคลิปนี้ให้จบแล้วสังเกตรายละเอียดตามภาพได้เลย เซฟไว้เลยน้าา #ฟีด #สาระดีๆ`
    };

    // Instagram: Medium aesthetic post
    newPlatformOutputs.instagram = {
      content: savedCaptions?.instagram || `✨ ${title}\n\n${concept}\n\nเลื่อนดูภาพรายละเอียดแต่ละมุม 🤍\n\n${(idea.hashtags || []).slice(0, 4).map(h => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`
    };

    // Lemon8: Step-by-step How-to / Listicle format
    newPlatformOutputs.lemon8 = {
      content: savedCaptions?.lemon8 || `📌 How-to สรุปเข้าใจง่าย: ${title}\n\n1. ดูภาพปกเพื่อเข้าใจภาพรวม\n2. ศึกษารายละเอียดแต่ละจุดในภาพถัดไป\n3. นำไปปรับใช้ได้ทันที\n\nเซฟเก็บไว้ลองทำตามดูนะทุกคน! ✨ #Lemon8บอกต่อ`
    };

    // X (Twitter): Under 250 characters
    newPlatformOutputs.x = {
      content: savedCaptions?.x || `🔥 ${title}\n\n${hook}\n\nอ่านต่อและดูภาพเพิ่มเติมที่นี่ ⬇️`
    };

    setPlatformOutputs(newPlatformOutputs);

    // 2. Initialize per-platform media (support array)
    const initMedia: Record<string, string[]> = {};
    const existingList = idea.media_urls && idea.media_urls.length > 0 
      ? idea.media_urls 
      : idea.media_url 
      ? [idea.media_url] 
      : [];

    ALL_PLATFORMS.forEach(p => {
      initMedia[p.id] = [...existingList];
    });

    // Check if user has a customized saved draft for this idea
    let hasRestoredCustomDraft = false;
    if (typeof window !== "undefined") {
      try {
        const savedDraftStr = localStorage.getItem("pk_content_studio_drafts_v2");
        if (savedDraftStr) {
          const savedDrafts = JSON.parse(savedDraftStr);
          const d = savedDrafts[idea.id];
          if (d) {
            if (d.platformOutputs) setPlatformOutputs(d.platformOutputs);
            else setPlatformOutputs(newPlatformOutputs);

            if (d.platformMedia) setPlatformMedia(d.platformMedia);
            else setPlatformMedia(initMedia);

            if (d.refinedPrompts) setRefinedPrompts(d.refinedPrompts);
            if (d.activePlatformTab) setActivePlatformTab(d.activePlatformTab);
            if (d.selectedPlatforms) setSelectedPlatforms(d.selectedPlatforms);

            hasRestoredCustomDraft = true;
          }
        }
      } catch (e) {
        console.warn("Error restoring content draft:", e);
      }
    }

    if (!hasRestoredCustomDraft) {
      setPlatformOutputs(newPlatformOutputs);
      setPlatformMedia(initMedia);
    }

    setNotification(
      hasRestoredCustomDraft
        ? `✓ โหลดแบบร่างที่คุณแก้ไขไว้สำหรับ '${idea.title}' อัตโนมัติ (ข้อมูลไม่หาย)`
        : `✓ สลับมาทำงานกับ '${idea.title}' เรียบร้อย!`
    );
    setTimeout(() => setNotification(null), 3200);
  };

  // Auto-save content edits to localStorage
  useEffect(() => {
    if (!selectedIdea || typeof window === "undefined") return;
    try {
      const savedDraftStr = localStorage.getItem("pk_content_studio_drafts_v2");
      const drafts = savedDraftStr ? JSON.parse(savedDraftStr) : {};
      drafts[selectedIdea.id] = {
        platformOutputs,
        platformMedia,
        refinedPrompts,
        activePlatformTab,
        selectedPlatforms,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem("pk_content_studio_drafts_v2", JSON.stringify(drafts));
      localStorage.setItem("pk_content_active_idea_id", selectedIdea.id);
    } catch (e) {
      console.warn("Content auto-save error:", e);
    }
  }, [selectedIdea, platformOutputs, platformMedia, refinedPrompts, activePlatformTab, selectedPlatforms]);

  // Reset Content Draft for current idea
  const handleResetContentDraft = () => {
    if (!selectedIdea) return;
    if (!confirm(`คุณต้องการรีเซ็ตแบบร่างของ '${selectedIdea.title}' กลับเป็นค่าเริ่มต้นใช่หรือไม่?`)) return;
    try {
      const savedDraftStr = localStorage.getItem("pk_content_studio_drafts_v2");
      if (savedDraftStr) {
        const drafts = JSON.parse(savedDraftStr);
        delete drafts[selectedIdea.id];
        localStorage.setItem("pk_content_studio_drafts_v2", JSON.stringify(drafts));
      }
    } catch (e) {}
    // Force clean re-init
    handleSelectIdea({ ...selectedIdea });
    setNotification("✓ รีเซ็ตแบบร่างกลับเป็นค่าเริ่มต้นจากไอเดียเรียบร้อยแล้ว");
    setTimeout(() => setNotification(null), 3000);
  };

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(p)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter(x => x !== p);
      } else {
        return [...prev, p];
      }
    });
  };

  // 1-Click Copy Prompt Helper
  const handleCopyPrompt = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setNotification(`✓ คัดลอก Prompt สำหรับ ${type} เรียบร้อย! นำไปวางใน Bing Designer / ChatGPT ได้ทันที`);
    setTimeout(() => {
      setCopiedType(null);
      setNotification(null);
    }, 3500);
  };

  // Upload Multiple Media for Active Platform
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const addedList: string[] = [];

    fileArray.forEach(file => {
      if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        addedList.push(url);
      } else {
        const reader = new FileReader();
        reader.onload = event => {
          const dataUrl = event.target?.result as string;
          if (dataUrl) {
            setPlatformMedia(prev => ({
              ...prev,
              [activePlatformTab]: [...(prev[activePlatformTab] || []), dataUrl]
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    });

    if (addedList.length > 0) {
      setPlatformMedia(prev => ({
        ...prev,
        [activePlatformTab]: [...(prev[activePlatformTab] || []), ...addedList]
      }));
    }

    setNotification(`✓ แนบรูปภาพ/คลิปเพิ่มสำหรับ ${activeMeta.name} เรียบร้อยแล้ว!`);
    setTimeout(() => setNotification(null), 3000);

    // Reset input value so same files can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove single image from active platform gallery
  const handleRemoveImage = (platform: Platform, index: number) => {
    setPlatformMedia(prev => {
      const list = prev[platform] || [];
      const updated = list.filter((_, idx) => idx !== index);
      return {
        ...prev,
        [platform]: updated
      };
    });
    setNotification(`✓ ลบรูปภาพที่ ${index + 1} ออกเรียบร้อย`);
    setTimeout(() => setNotification(null), 2500);
  };

  // Submit URL for Active Platform
  const handleUrlSubmit = () => {
    if (!customImageUrlInput.trim()) return;
    setPlatformMedia(prev => ({
      ...prev,
      [activePlatformTab]: [...(prev[activePlatformTab] || []), customImageUrlInput.trim()]
    }));
    setCustomImageUrlInput("");
    setNotification(`✓ เพิ่มรูปภาพจาก URL สำหรับ ${activeMeta.name} สำเร็จ!`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Copy active image album to all platforms
  const handleCopyImagesToAllPlatforms = () => {
    const currentList = platformMedia[activePlatformTab] || [];
    if (currentList.length === 0) {
      setNotification("ยังไม่มีรูปภาพในแพลตฟอร์มนี้ กรุณาอัปโหลดก่อนครับ");
      return;
    }
    const updated: Record<string, string[]> = {};
    ALL_PLATFORMS.forEach(p => {
      updated[p.id] = [...currentList];
    });
    setPlatformMedia(updated);
    setNotification(`✓ นำ ${currentList.length} รูปภาพนี้ไปใช้กับทุกแพลตฟอร์มเรียบร้อยแล้ว!`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Generate In-App Auto Image for Active Platform
  const handleGenerateInAppImage = async () => {
    if (!selectedIdea) return;
    setLoadingMedia(true);
    try {
      const promptToUse = currentPlatformPrompt || `Commercial photography of ${selectedIdea.title}, 8k photorealistic`;
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE_IMAGE",
          prompt: promptToUse,
          aspectRatio: activeMeta.aspectRatio,
          assetId: selectedIdea.id,
          modelPreference: imageModel
        })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setPlatformMedia(prev => ({
          ...prev,
          [activePlatformTab]: [...(prev[activePlatformTab] || []), data.imageUrl]
        }));
        setNotification(`✓ AI สร้างภาพสำหรับ ${activeMeta.name} สำเร็จแล้ว!`);
        setTimeout(() => setNotification(null), 3500);
      }
    } catch (e) {
      console.error(e);
      setNotification("เกิดข้อผิดพลาดในการสร้างภาพ");
    } finally {
      setLoadingMedia(false);
    }
  };

  // Submit to Step 3 (Publisher Queue)
  const handleSendToPublisher = async () => {
    if (!selectedIdea) return;

    try {
      const recommendedTimingMap: Record<string, { time: string; delayDays: number }> = {
        facebook: { time: "19:30", delayDays: 1 },
        tiktok: { time: "19:00", delayDays: 1 },
        instagram: { time: "18:00", delayDays: 2 },
        lemon8: { time: "12:30", delayDays: 2 },
        x: { time: "08:30", delayDays: 3 }
      };

      for (const platform of selectedPlatforms) {
        const out = platformOutputs[platform];
        const contentText = out?.content || selectedIdea.caption || selectedIdea.hook;
        const mediaList = platformMedia[platform] || (selectedIdea.media_urls || (selectedIdea.media_url ? [selectedIdea.media_url] : []));
        const primaryMedia = mediaList[0] || selectedIdea.media_url || "";
        const timing = recommendedTimingMap[platform] || { time: "19:00", delayDays: 1 };

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + timing.delayDays);
        const [hours, mins] = timing.time.split(":");
        targetDate.setHours(parseInt(hours, 10), parseInt(mins, 10), 0, 0);

        const platformMeta = ALL_PLATFORMS.find(p => p.id === platform);

        await fetch("/api/approvals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `[${platform.toUpperCase()}] ${selectedIdea.title}`,
            content_preview: contentText,
            entity_type: "CONTENT",
            entity_id: selectedIdea.id,
            source: `Content Studio (${platform})`,
            image_url: primaryMedia,
            media_urls: mediaList,
            media_blueprint: selectedIdea.media_blueprint,
            platform,
            media_type: selectedIdea.media_type === "VIDEO" ? "VIDEO" : (platform === "tiktok" ? "VIDEO" : "IMAGE"),
            publish_mode: "MANUAL",
            recommended_time: platformMeta?.recommendedTime || "19:00 - 21:00 น.",
            scheduled_at: targetDate.toISOString().slice(0, 16),
            brand_name: selectedIdea.brand_name || "เพจหลัก",
            is_series: selectedIdea.is_series || false,
            episode: selectedIdea.episode,
            connection_status: (platform === "facebook" || platform === "tiktok" || platform === "instagram") ? "CONNECTED" : "NOT_CONNECTED",
            status: "HUMAN_REVIEW"
          })
        });
      }

      setNotification(`✓ บันทึกโพสต์สำหรับ ${selectedPlatforms.length} แพลตฟอร์มแล้ว! กำลังพาไปยัง Step 3: หน้ารอโพสต์...`);
      setTimeout(() => {
        router.push("/publisher");
      }, 1200);

    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    const target = acceptedIdeas.find(i => i.id === id);
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคอนเทนต์ '${target?.title || "นี้"}' ออก?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/ai/ideas?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const remaining = acceptedIdeas.filter(i => i.id !== id);
        setAcceptedIdeas(remaining);
        if (selectedIdea?.id === id) {
          if (remaining.length > 0) {
            handleSelectIdea(remaining[0]);
          } else {
            setSelectedIdea(null);
          }
        }
        setNotification(`✓ ลบคอนเทนต์ '${target?.title || ""}' ออกเรียบร้อยแล้ว`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // AI Vision Analysis Handler
  const handleAnalyzeImagesWithVision = async () => {
    const imagesToAnalyze = platformMedia[activePlatformTab] || [];
    if (imagesToAnalyze.length === 0) {
      setNotification("กรุณาแนบรูปภาพอ้างอิงอย่างน้อย 1 รูป ก่อนสั่งให้ AI วิเคราะห์ครับ");
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    setVisionLoading(true);
    try {
      const res = await fetch("/api/ai/vision-refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId: selectedIdea?.id,
          images: imagesToAnalyze,
          title: selectedIdea?.title,
          caption: platformOutputs[activePlatformTab]?.content,
          hook: selectedIdea?.hook,
          brand_name: selectedIdea?.brand_name,
          platform: activePlatformTab
        })
      });
      const data = await res.json();
      if (data.success) {
        setVisionAnalysisResult(data.analysis);
        if (data.refinedCaption) {
          setPlatformOutputs(prev => ({
            ...prev,
            [activePlatformTab]: {
              ...prev[activePlatformTab],
              content: data.refinedCaption
            }
          }));
        }
        if (data.refinedMasterPrompt) {
          setRefinedPrompts(prev => ({
            ...prev,
            [activePlatformTab]: data.refinedMasterPrompt
          }));
        }
        setNotification(`✓ AI วิเคราะห์ภาพจริงสำเร็จ! ปรับปรุงแคปชั่นและ Prompt ให้ตรงกับภาพเรียบร้อยแล้ว`);
        setTimeout(() => setNotification(null), 4000);
      } else {
        setNotification(data.error || "เกิดข้อผิดพลาดในการวิเคราะห์ภาพ");
      }
    } catch (err) {
      console.error(err);
      setNotification("เกิดข้อผิดพลาดในการเชื่อมต่อ AI Vision");
    } finally {
      setVisionLoading(false);
    }
  };

  const activeMeta = ALL_PLATFORMS.find(p => p.id === activePlatformTab) || ALL_PLATFORMS[0];

  // Comprehensive Master Prompt
  const getExtensivePlatformPrompt = (platformId: Platform) => {
    if (refinedPrompts[platformId]) return refinedPrompts[platformId];
    if (!selectedIdea) return "";
    const pPrompts = (selectedIdea as any).platform_prompts;
    if (pPrompts && pPrompts[platformId]?.prompt && pPrompts[platformId].prompt.length > 80) {
      return pPrompts[platformId].prompt;
    }

    const title = selectedIdea.title || "Marketing Visual";
    const hook = selectedIdea.hook || title;

    if (platformId === "tiktok") {
      return `Cinematic 9:16 vertical 4K 60fps dynamic video advertisement representing ${title}, dynamic camera tracking shot, shallow depth of field, natural motion blur, slow-motion action, atmospheric studio lighting, hyperrealistic commercial quality. Typography: Features vibrant bold Thai hook typography overlay on the center-upper third stating: "${hook}" with crisp modern white letterforms and subtle glowing drop shadow for maximum readability. --ar 9:16 --v 6.0`;
    } else if (platformId === "lemon8") {
      return `Aesthetic 3:4 portrait infographic styled flatlay editorial photography representing ${title}, cozy soft morning sunlight, pastel warm color palette, clean organized lifestyle composition, macro texture details, 8k resolution. Typography: Features clean educational Thai title typography prominently rendered at the top stating: "${title}" in friendly modern sans-serif Thai font. --ar 3:4 --v 6.0`;
    } else if (platformId === "x") {
      return `Punchy 16:9 landscape documentary snapshot representing ${title}, bold high-contrast cinematic lighting, sharp focus, rich natural textures, 8k resolution, crisp photorealistic details. Typography: Features bold journalistic Thai quote typography prominently placed stating: "${hook}" in strong modern bold font. --ar 16:9 --v 6.0`;
    } else if (platformId === "instagram") {
      return `Minimalist aesthetic 1:1 square editorial photography representing ${title}, soft diffused natural lighting, clean beige pastel palette, artistic studio composition, depth of field, 8k resolution, high fashion commercial finish. Typography: Features minimalist elegant Thai typography badge in the bottom corner stating: "${title}" with crisp refined font. --ar 1:1 --v 6.0`;
    }
    // Default Facebook
    return `Master commercial 1:1 square advertising photography representing ${title}, studio environment, warm cinematic lighting, Hasselblad 100MP, 85mm prime lens, ultra-detailed textures, clean background, 8k photorealistic. Typography: Features bold modern Thai typography headline prominently rendered in the upper third stating: "${title}" in crisp, clean, elegant letterforms with high visual contrast. --ar 1:1 --v 6.0`;
  };

  const currentPlatformPrompt = getExtensivePlatformPrompt(activePlatformTab);
  const currentAttachedMediaList = platformMedia[activePlatformTab] || [];
  const mediaBlueprint = selectedIdea?.media_blueprint;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Step Header */}
      <div className="bg-white border border-[#E8E9EC] rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>STAGE 02 · CREATE: PLATFORM & MULTI-MEDIA STUDIO</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#17181A] tracking-tight">
              2. เลือกแพลตฟอร์ม & สตูดิโอสื่อ
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              สลับไอเดีย ➔ ดูคำแนะนำเตรียมสื่อ (Media Blueprint) ➔ อัปโหลดรูปภาพได้หลายรูป (อัลบั้ม) ➔ ส่งไปยังหน้ารอโพสต์
            </p>
          </div>

          <Link
            href="/ideas"
            className="text-xs text-slate-700 hover:text-slate-950 font-semibold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-[#E8E9EC] transition-colors cursor-pointer"
          >
            ← กลับไป Step 1 (ไอเดีย)
          </Link>
        </div>

        {notification && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs shadow-luxury-sm animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {acceptedIdeas.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E9EC] text-slate-400 space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-[#17181A]">ยังไม่มีไอเดียที่เลือกมาจาก Step 1</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            กรุณาไปที่ Step 1 แล้วกดปุ่ม &ldquo;✓ เอา (เลือกไอเดียนี้)&rdquo; เพื่อส่งมายังสตูดิโอนี้ครับ
          </p>
          <Link
            href="/ideas"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#17181A] hover:bg-slate-800 text-white text-xs font-bold shadow-luxury-sm shadow-blue-600/20"
          >
            <span>ไปที่ Step 1: สั่ง AI คิดไอเดีย</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SUBSTAGE 1: INTERACTIVE IDEA SELECTOR DECK */}
          <div className="bg-white border border-[#E8E9EC] rounded-2xl p-5 shadow-luxury-card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E9EC] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <h2 className="text-sm md:text-base font-bold text-[#17181A]">
                  เลือกไอเดียที่จะนำมาผลิตคอนเทนต์ ({acceptedIdeas.length} ไอเดียพร้อมใช้):
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">
                คลิกที่การ์ดเพื่อสลับไอเดียทำงาน ทุกส่วนจะอัปเดตตามทันที
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {acceptedIdeas.map((idea, idx) => {
                const isSelected = selectedIdea?.id === idea.id;
                return (
                  <div
                    key={idea.id}
                    onClick={() => handleSelectIdea(idea)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20 shadow-luxury-sm"
                        : "bg-[#F7F8FA] border-[#E8E9EC] hover:border-[#D1D5DB] opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {idea.is_series || idea.episode ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 font-semibold">
                              📚 EP. {idea.episode || idx + 1}
                            </span>
                          ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700 font-semibold"
                            }`}>
                              ไอเดีย #{idx + 1}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            🏢 {idea.brand_name || "เพจหลัก"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isSelected ? (
                            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> ใช้งาน
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">เลือก</span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteIdea(idea.id);
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                            title="ลบคอนเทนต์นี้ (ไม่ใช้แล้ว)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xs font-bold text-[#17181A] line-clamp-2 leading-relaxed">
                        {idea.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {idea.hook || idea.concept}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MEDIA BLUEPRINT GUIDE BOX (Requested: กำกับบอกด้วยว่าให้แนบสื่ออะไรแบบไหนและกี่รูป) */}
          {mediaBlueprint && (
            <div className="bg-indigo-50/40 border border-indigo-200 rounded-2xl p-5 shadow-luxury-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800 border border-indigo-200">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-bold text-[#17181A] flex items-center gap-2">
                      <span>📸 คำแนะนำการเตรียมสื่อจาก AI (Media Blueprint)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 border border-indigo-500/30 font-semibold">
                        แนะนำ {mediaBlueprint.count_recommended} รูป
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      รูปแบบ: <strong className="text-amber-300">{mediaBlueprint.format}</strong> • {mediaBlueprint.visual_direction}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-indigo-900 font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-luxury-sm">
                    แนบแล้ว {currentAttachedMediaList.length} / {mediaBlueprint.count_recommended} รูป
                  </span>
                </div>
              </div>

              {/* Slide-by-slide checklist */}
              {mediaBlueprint.slides && mediaBlueprint.slides.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {mediaBlueprint.slides.map((slide, sidx) => (
                    <div
                      key={sidx}
                      className="p-3.5 rounded-xl bg-white border border-[#E8E9EC] hover:border-indigo-300 shadow-luxury-sm transition-colors space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] border-b border-[#E8E9EC] pb-1.5">
                        <span className="font-bold text-indigo-900">
                          สไลด์ #{slide.slide_no || sidx + 1} {sidx === 0 ? "🔥 (ภาพปก)" : ""}
                        </span>
                        {slide.prompt && (
                          <button
                            type="button"
                            onClick={() => handleCopyPrompt(slide.prompt!, `สไลด์ ${slide.slide_no || sidx + 1}`)}
                            className="text-[10px] text-blue-400 hover:text-[#17181A] flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            <span>คัดลอก Prompt</span>
                          </button>
                        )}
                      </div>

                      <p className="text-slate-800 font-medium line-clamp-2 leading-relaxed text-[11px]">
                        {slide.visual}
                      </p>

                      {slide.text_overlay && (
                        <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold font-mono truncate">
                          พาดหัว: &ldquo;{slide.text_overlay}&rdquo;
                        </div>
                      )}

                      {slide.shoot_instruction && (
                        <p className="text-[10px] text-slate-600 font-medium italic line-clamp-1">
                          มุมกล้อง: {slide.shoot_instruction}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUBSTAGE 2: PLATFORM WORKSPACE (CAPTIONS, PROMPTS & MULTI-MEDIA ATTACHMENT) */}
          <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 space-y-5 shadow-luxury-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E9EC] pb-4">
              <div>
                <h2 className="text-sm md:text-base font-bold text-[#17181A] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                  <span>1. เลือกแพลตฟอร์ม & สตูดิโอสื่อ:</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  แคปชั่นและ Prompt สวมบทบาทผู้เชี่ยวชาญเฉพาะทาง พร้อมอ้างอิงรูปภาพในโพสต์โดยตรง
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlatforms(["facebook", "tiktok"])}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold cursor-pointer transition-colors"
                >
                  ✓ เลือก FB + TikTok (ค่าเริ่มต้น)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlatforms(["facebook", "tiktok", "instagram", "lemon8", "x"])}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-[#E8E9EC] text-xs font-semibold cursor-pointer"
                >
                  เลือกทั้งหมด 5 แพลตฟอร์ม
                </button>

                {selectedIdea && (
                  <button
                    type="button"
                    onClick={() => handleDeleteIdea(selectedIdea.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all cursor-pointer"
                    title="ลบคอนเทนต์ที่กำลังเปิดอยู่นี้ออก"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>🗑️ ลบคอนเทนต์นี้ (ไม่ใช้)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Platform Selection Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {ALL_PLATFORMS.map(p => {
                const isSelected = selectedPlatforms.includes(p.id);
                const mediaCount = (platformMedia[p.id] || []).length;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      togglePlatform(p.id);
                      setActivePlatformTab(p.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                      isSelected ? "bg-blue-50 border-blue-400 shadow-luxury-sm ring-1 ring-blue-400/30" : "bg-[#F7F8FA] border-[#E8E9EC] hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17181A]">{p.name}</span>
                      <div className="flex items-center gap-1">
                        {mediaCount > 0 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            {mediaCount} รูป
                          </span>
                        )}
                        <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-blue-400" : "bg-slate-600"}`}></span>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-800 font-mono font-medium">{p.formatBadge}</span>
                  </button>
                );
              })}
            </div>

            {/* Platform Workspace Tabs */}
            <div className="pt-2">
              <div className="flex border-b border-[#E8E9EC] gap-1 overflow-x-auto">
                {selectedPlatforms.map(pid => {
                  const pmeta = ALL_PLATFORMS.find(x => x.id === pid);
                  const isActive = activePlatformTab === pid;
                  const mediaCount = (platformMedia[pid] || []).length;
                  return (
                    <button
                      key={pid}
                      onClick={() => setActivePlatformTab(pid)}
                      className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
                        isActive ? "bg-white border-[#17181A] text-[#17181A] font-bold shadow-luxury-sm" : "border-transparent text-slate-600 hover:text-slate-950 font-medium"
                      }`}
                    >
                      <span>{pmeta?.name || pid}</span>
                      {mediaCount > 0 ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {mediaCount} รูป
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F7F8FA] text-slate-400 font-mono">
                          {pmeta?.formatBadge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Platform Workspace Card */}
              <div className="p-4 sm:p-6 rounded-b-xl rounded-tr-xl bg-[#F7F8FA] border border-t-0 border-[#E8E9EC] space-y-5">
                {/* 1. Tailored Caption Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        <span>แคปชันผู้เชี่ยวชาญสำหรับ {activeMeta.name} ({activeMeta.desc}):</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const text = platformOutputs[activePlatformTab]?.content || "";
                        navigator.clipboard.writeText(text);
                        setNotification(`✓ คัดลอกแคปชันสำหรับ ${activeMeta.name} แล้ว!`);
                        setTimeout(() => setNotification(null), 2500);
                      }}
                      className="text-[11px] bg-white hover:bg-slate-100 text-slate-800 font-semibold px-3 py-1 rounded-lg border border-[#E8E9EC] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>คัดลอกแคปชัน</span>
                    </button>
                  </div>

                  <textarea
                    rows={activePlatformTab === "facebook" ? 8 : activePlatformTab === "tiktok" ? 4 : 6}
                    value={platformOutputs[activePlatformTab]?.content || ""}
                    onChange={e => {
                      const val = e.target.value;
                      setPlatformOutputs(prev => ({
                        ...prev,
                        [activePlatformTab]: {
                          ...prev[activePlatformTab],
                          content: val
                        }
                      }));
                    }}
                    className="w-full p-3.5 bg-white border border-[#D1D5DB] rounded-xl text-xs text-[#17181A] leading-relaxed focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                {/* 2. Comprehensive Master Prompt with Thai Typography Directive */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 border-2 border-indigo-200/90 shadow-luxury-card space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-600 shadow-sm">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base font-extrabold text-[#17181A]">
                            Master Prompt แบบละเอียด สำหรับ {activeMeta.name} ({activeMeta.formatBadge}):
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          คำสั่งระดับโปรดักชัน คุมโทนภาพ แสง เลนส์กล้อง และมีคำสั่งใส่ตัวอักษรไทยคมชัด 100%
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>มีคำสั่งภาษาไทยในภาพ 100%</span>
                    </span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-indigo-100/90 text-xs font-mono text-slate-900 leading-relaxed max-h-[190px] overflow-y-auto shadow-inner select-all">
                    {currentPlatformPrompt}
                  </div>

                  {/* Copy Prompt & External Tools Links */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-indigo-100">
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(currentPlatformPrompt, activeMeta.name)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold shadow-md shadow-amber-500/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {copiedType === activeMeta.name ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>คัดลอก Prompt แล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-white" />
                          <span>คัดลอก Prompt ไปเจนรูป/คลิปฟรี ➔</span>
                        </>
                      )}
                    </button>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-xs font-bold text-slate-600 mr-1">เปิดเว็บสร้างภาพ/คลิป:</span>
                      <a
                        href="https://labs.google/fx/tools/flow/shared/tool/cfc7240d-3118-41b6-a08d-4bac91a1b1c5"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold inline-flex items-center gap-1 border border-indigo-200 transition-colors"
                      >
                        <span>🎬 Google Flow</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href="https://www.bing.com/images/create"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold inline-flex items-center gap-1 border border-blue-200 transition-colors"
                      >
                        <span>Bing Designer (ฟรี)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href="https://chatgpt.com"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold inline-flex items-center gap-1 border border-emerald-200 transition-colors"
                      >
                        <span>ChatGPT</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href="https://ideogram.ai"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold inline-flex items-center gap-1 border border-purple-200 transition-colors"
                      >
                        <span>Ideogram (ฟอนต์สวย)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3. MULTI-MEDIA ALBUM GALLERY & UPLOADER (Requested: อัปโหลดไปได้หลายสื่อ / หลายรูป) */}
                <div className="p-5 rounded-xl bg-white border border-[#E8E9EC] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E8E9EC]">
                    <div>
                      <h3 className="text-xs font-bold text-[#17181A] flex items-center gap-2">
                        <Upload className="w-4 h-4 text-purple-400" />
                        <span>อัลบั้มรูปภาพ / สื่อสำหรับ {activeMeta.name} ({activeMeta.formatBadge}):</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        สามารถเลือกอัปโหลดหลายรูปภาพพร้อมกันได้ เพื่อทำเป็นอัลบั้มเซ็ต (AI แนะนำ {mediaBlueprint?.count_recommended || 4} รูป)
                      </p>
                    </div>

                    {currentAttachedMediaList.length > 0 && (
                      <button
                        type="button"
                        onClick={handleCopyImagesToAllPlatforms}
                        className="text-[11px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2.5 py-1 rounded-lg border border-[#D1D5DB] inline-flex items-center gap-1 cursor-pointer"
                        title="หากต้องการนำเซ็ตภาพนี้ไปใช้กับทุกแพลตฟอร์ม"
                      >
                        <Copy className="w-3 h-3" />
                        <span>นำ {currentAttachedMediaList.length} รูปนี้ไปใช้กับทุกแพลตฟอร์ม</span>
                      </button>
                    )}
                  </div>

                  {/* 📸 AI Vision Reference & Analysis Box (เชื่อมต่อภาพจาก Step 1 และวิเคราะห์เพื่อปรับแต่งแคปชัน/Prompt) */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50/90 via-indigo-50/70 to-blue-50/80 border-2 border-purple-200/90 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-purple-600 text-white shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          </span>
                          <span className="text-xs font-extrabold text-[#17181A]">
                            AI Vision Analyzer: วิเคราะห์รูปจริงเพื่อปรับแคปชัน & Prompt ให้แม่นยำ
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          {currentAttachedMediaList.length > 0
                            ? `มีรูปภาพอ้างอิง ${currentAttachedMediaList.length} รูป (ส่งต่อมาจาก Step 1 หรือแนบเพิ่ม) พร้อมให้ AI ส่องวิเคราะห์`
                            : "แนบรูปถ่ายจริงด้านล่าง (เช่น รูปชุดครุยจริง, รูปสินค้า, หรือรูปคาเฟ่) เพื่อให้ AI นำไปวิเคราะห์"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAnalyzeImagesWithVision}
                        disabled={visionLoading || currentAttachedMediaList.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-extrabold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50 cursor-pointer active:scale-95 shrink-0"
                      >
                        {visionLoading ? (
                          <>
                            <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                            <span>กำลังส่องวิเคราะห์องค์ประกอบภาพ...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>✨ ให้ AI วิเคราะห์รูปจริง ({currentAttachedMediaList.length} รูป)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Vision Analysis Result Card */}
                    {visionAnalysisResult && (
                      <div className="bg-white/95 rounded-xl border border-purple-200 p-3.5 space-y-2 text-xs animate-fade-in shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-extrabold text-purple-950 text-[11.5px] flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ผลการวิเคราะห์รูปภาพจริงเรียบร้อยแล้ว:</span>
                          </span>
                          <span className="text-[10px] text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full font-semibold">
                            AI Vision Verified ✓
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-700 block">
                            🎯 องค์ประกอบและจุดเด่นที่ตรวจพบในภาพจริง:
                          </span>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {visionAnalysisResult.detected_elements.map((elem, eidx) => (
                              <span
                                key={eidx}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-[10.5px] font-medium"
                              >
                                ✓ {elem}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                          <div className="bg-[#F7F8FA] p-2 rounded-lg border border-[#E8E9EC]">
                            <span className="font-bold text-slate-700 block">☀️ แสงและโทนภาพ:</span>
                            <span className="text-slate-900 font-medium">{visionAnalysisResult.lighting_tone}</span>
                          </div>
                          <div className="bg-[#F7F8FA] p-2 rounded-lg border border-[#E8E9EC]">
                            <span className="font-bold text-slate-700 block">💡 การปรับแต่งที่ทำแล้ว:</span>
                            <span className="text-emerald-800 font-medium">อัปเดตแคปชันและ Master Prompt ให้ตรงกับภาพจริงเรียบร้อย!</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Multi-Image Gallery Grid */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {currentAttachedMediaList.map((mediaUrl, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-square rounded-xl overflow-hidden bg-[#F7F8FA] border border-[#E8E9EC] hover:border-blue-500 transition-all shadow"
                        >
                          {mediaUrl.endsWith(".mp4") || (mediaUrl.startsWith("blob:") && mediaUrl.includes("video")) ? (
                            <video src={mediaUrl} className="w-full h-full object-cover" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={mediaUrl} alt={`media-${idx}`} className="w-full h-full object-cover" />
                          )}

                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-black/70 text-[10px] text-[#17181A] font-mono font-bold">
                            #{idx + 1} {idx === 0 ? "ปก" : ""}
                          </span>

                          {/* Hover Actions */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setFullscreenImage(mediaUrl)}
                              className="p-1.5 rounded-lg bg-slate-800 text-[#17181A] hover:bg-slate-700 cursor-pointer"
                              title="ดูภาพขยาย"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(activePlatformTab, idx)}
                              className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
                              title="ลบรูปนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add More Media Tile */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-[#D1D5DB] hover:border-purple-500 bg-[#F7F8FA] hover:bg-purple-500/10 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-400 hover:text-purple-300 transition-all p-2 text-center"
                      >
                        <Plus className="w-6 h-6 text-purple-400" />
                        <span className="text-[11px] font-bold">+ เพิ่มรูป/คลิป</span>
                        <span className="text-[9px] text-slate-500">เลือกได้หลายไฟล์</span>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Quick URL Input */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={customImageUrlInput}
                        onChange={e => setCustomImageUrlInput(e.target.value)}
                        placeholder={`หรือวาง URL รูปภาพสำหรับ ${activeMeta.name} แล้วกดเพิ่ม...`}
                        className="flex-1 px-3.5 py-2 bg-[#F7F8FA] border border-[#D1D5DB] rounded-xl text-xs text-[#17181A] placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={handleUrlSubmit}
                        disabled={!customImageUrlInput.trim()}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-[#17181A] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        + เพิ่มรูปจาก URL
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. SUBMIT TO STEP 3 (PUBLISHER QUEUE) */}
                <div className="pt-4 border-t border-[#E8E9EC] flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#17181A] flex items-center gap-2">
                      <span>พร้อมส่งต่อไปยัง Step 3 แล้วหรือยัง?</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        {selectedPlatforms.length} แพลตฟอร์ม • รวม {currentAttachedMediaList.length} รูป
                      </span>
                    </span>
                    <p className="text-[11px] text-slate-400">
                      เมื่อกดบันทึก โพสต์พร้อมรูปภาพทั้งหมดจะถูกส่งไปยัง Step 3 เพื่อจัดตารางเวลาและเผยแพร่
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {selectedIdea && (
                      <Link
                        href={`/commercial?id=${selectedIdea.id}&autoGen=true`}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                        title="ส่งคอนเทนต์และสคริปต์นี้ไปสร้างวิดีโอโฆษณาใน Commercial Video Studio"
                      >
                        <Film className="w-4 h-4 text-indigo-600" />
                        <span>🎬 ส่งไปทำโฆษณาเสมือนจริง (Commercial Studio)</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleSendToPublisher}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <span>✓ บันทึกและส่งไปยังหน้ารอโพสต์ (Step 3)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE MODAL */}
      {fullscreenImage && (
        <div
          onClick={() => setFullscreenImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullscreenImage}
              alt="Fullscreen Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setFullscreenImage(null)}
              className="mt-3 px-4 py-1.5 rounded-full bg-slate-800 text-[#17181A] text-xs font-bold hover:bg-slate-700"
            >
              ✕ ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContentStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">กำลังโหลดสตูดิโอสื่อ...</div>}>
      <ContentStudioContent />
    </Suspense>
  );
}
