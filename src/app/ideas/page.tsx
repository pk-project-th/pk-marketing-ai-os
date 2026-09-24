"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lightbulb,
  Sparkles,
  Check,
  Trash2,
  RefreshCw,
  ArrowRight,
  Image as ImageIcon,
  Video,
  Bot,
  Zap,
  Copy,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  BookOpen,
  Building2,
  Star,
  TrendingUp,
  Layers,
  Car,
  ShoppingBag,
  User,
  Tv,
  UtensilsCrossed,
  Trophy,
  Flame,
  FileText,
  Camera,
  Compass,
  Film,
  Upload,
  Mic
} from "lucide-react";
import { ContentIdea } from "@/types";
import { useBrand } from "@/context/BrandContext";
import { Badge } from "@/components/ui/Badge";

interface BrandPreset {
  name: string;
  category: string;
  badge: string;
  defaultBrief: string;
}

const BRAND_CATEGORIES: { id: string; name: string; icon: any; brands: BrandPreset[] }[] = [
  {
    id: "auto",
    name: "🚗 งานประจำ & ยานยนต์",
    icon: Car,
    brands: [
      {
        name: "Mazda & BYD (ดีลเลอร์ & โปรโมชั่น)",
        category: "auto",
        badge: "ดีลเลอร์",
        defaultBrief: "โปรโมชั่นออกรถ Mazda & BYD ประจำเดือน และเปรียบเทียบข้อดีความคุ้มค่ารถยนต์ไฟฟ้ายุคใหม่"
      },
      {
        name: "เพจรถ (ความรู้เรื่องรถ & ข่าวสารยานยนต์)",
        category: "auto",
        badge: "สาระรถ",
        defaultBrief: "เทคนิคการตรวจเช็กและดูแลรักษารถยนต์เบื้องต้นที่เจ้าของรถทุกคนควรรู้ พร้อมวิธีประหยัดน้ำมัน"
      }
    ]
  },
  {
    id: "shop",
    name: "🎣 ธุรกิจ ร้านค้า & นายหน้า",
    icon: ShoppingBag,
    brands: [
      {
        name: "PP Fishing (ขายอุปกรณ์ตกปลา & ความรู้หน้าร้าน เชียงราย)",
        category: "shop",
        badge: "ตกปลา",
        defaultBrief: "แนะนำรอกและคันเบ็ดสำหรับตกปลาหมายธรรมชาติเชียงราย พร้อมเทคนิคเลือกเหยื่อปลอมตกปลาช่อน-ชะโด"
      },
      {
        name: "Lanna Lab Records (ค่ายเพลง & ดนตรีล้านนา)",
        category: "shop",
        badge: "ค่ายเพลง",
        defaultBrief: "เบื้องหลังการทำเพลงดนตรีล้านนาร่วมสมัย แรงบันดาลใจจากวัฒนธรรมพื้นบ้านสู่บทเพลงฟังสบาย"
      },
      {
        name: "Mr. Must Have (นายหน้า / ป้ายยาของน่าใช้)",
        category: "shop",
        badge: "นายหน้าป้ายยา",
        defaultBrief: "ป้ายยา 5 ไอเทมของแต่งโต๊ะทำงานและของใช้ในบ้านที่คุ้มค่าเกินราคา มีแล้วชีวิตสะดวกขึ้น 300%"
      },
      {
        name: "ขายพระเครื่อง (ลงขายพระของพ่อ / พระแท้)",
        category: "shop",
        badge: "พระเครื่อง",
        defaultBrief: "เปิดกรุพระเครื่องสะสมยอดนิยม ชี้ตำหนิจุดสังเกตพระแท้ และประวัติความศักดิ์สิทธิ์ประจำบ้าน"
      },
      {
        name: "ขายของต่าง ๆ (ของมือสอง & ของไม่ใช้แล้ว)",
        category: "shop",
        badge: "ของมือสอง",
        defaultBrief: "ส่งต่อของใช้มือสองสภาพนางฟ้า ของสะสมและเครื่องใช้ในบ้าน ราคาแบ่งปัน นัดรับหรือส่งด่วนได้"
      }
    ]
  },
  {
    id: "content",
    name: "📚 ช่องคอนเทนต์ & สาระน่ารู้",
    icon: BookOpen,
    brands: [
      {
        name: "หนังสือ (คำคม & สาระจากหนังสือ)",
        category: "content",
        badge: "สรุปหนังสือ",
        defaultBrief: "สรุป 10 บทเรียนสำคัญจากหนังสือ Atomic Habits กฎ 4 ข้อในการสร้างนิสัยที่ดีและทำลายความขี้เกียจ"
      },
      {
        name: "ช่องข่าว (ข่าวทั่วไป & ประเด็นร้อน)",
        category: "content",
        badge: "ข่าวทั่วไป",
        defaultBrief: "สรุปประเด็นข่าวเด่นรอบวัน เจาะลึกสิ่งที่ประชาชนต้องรู้แบบกระชับ เข้าใจง่ายใน 3 นาที"
      },
      {
        name: "สารคดี (ประวัติศาสตร์ & สัตว์โลก)",
        category: "content",
        badge: "สารคดี",
        defaultBrief: "สารคดีไขปริศนาอารยธรรมโบราณที่สาบสูญ และพฤติกรรมสุดแปลกของสัตว์โลกที่คุณอาจไม่เคยรู้"
      },
      {
        name: "นิทาน (สำหรับเด็ก & นิทานทั่วไป)",
        category: "content",
        badge: "นิทาน",
        defaultBrief: "นิทานก่อนนอนสอนใจ เสริมสร้างจินตนาการ สอนเรื่องความมีน้ำใจ ความอดทน และความพยายาม"
      },
      {
        name: "ทำอาหาร (สูตร & ขั้นตอนการทำอาหาร)",
        category: "content",
        badge: "ทำอาหาร",
        defaultBrief: "แจกสูตรและเคล็ดลับทำเมนูโปรดให้อร่อยเข้มข้น รสชาติต้นตำรับฉบับโฮมเมด ทำตามได้ทันที"
      },
      {
        name: "ฟุตบอล (ไฮไลท์ยิงประตู & กีฬา)",
        category: "content",
        badge: "ฟุตบอล",
        defaultBrief: "วิเคราะห์จังหวะยิงประตูสุดสวย และไฮไลต์แมตช์สำคัญประจำสัปดาห์ที่แฟนบอลตัวจริงต้องดู"
      }
    ]
  },
  {
    id: "personal",
    name: "👤 ส่วนตัว",
    icon: User,
    brands: [
      {
        name: "แอคเค้าท์ส่วนตัว (Lifestyle & คอนเทนต์ส่วนตัว)",
        category: "personal",
        badge: "ส่วนตัว",
        defaultBrief: "บันทึกเรื่องราวชีวิตประจำวัน มุมมองความคิดดีๆ วันทำงาน และการเดินทางท่องเที่ยววันหยุด"
      }
    ]
  }
];

export default function IdeaGeneratorPage() {
  const router = useRouter();
  
  // Brand & Mode Settings
  const { activeBrand } = useBrand();
  const [brandName, setBrandName] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pk_ideas_brandName_v2");
      if (saved) return saved;
    }
    return activeBrand !== "ALL" ? activeBrand : "Mazda & BYD (ดีลเลอร์ & โปรโมชั่น)";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("pk_ideas_brandName_v2", brandName);
    } catch (e) {}
  }, [brandName]);
  const [activeBrandTab, setActiveBrandTab] = useState<string>("all");
  const [isSeriesMode, setIsSeriesMode] = useState(false);
  const [contentCount, setContentCount] = useState<number>(3);

  // Content Brief with Persistent Draft
  const [briefText, setBriefText] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pk_ideas_briefText_v2");
      if (saved) return saved;
    }
    return "โปรโมชั่นออกรถ Mazda & BYD ประจำเดือน และเปรียบเทียบข้อดีความคุ้มค่ารถยนต์ไฟฟ้ายุคใหม่";
  });

  // Auto-save briefText on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("pk_ideas_briefText_v2", briefText);
    } catch (e) {}
  }, [briefText]);

  const [aiEngine, setAiEngine] = useState<"groq" | "chatgpt" | "gemini">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pk_ideas_ai_engine");
      if (saved === "groq" || saved === "chatgpt" || saved === "gemini") return saved;
    }
    return "groq";
  });

  // Auto-save aiEngine on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("pk_ideas_ai_engine", aiEngine);
    } catch (e) {}
  }, [aiEngine]);

  const [hasOpenAiKey, setHasOpenAiKey] = useState(false);
  const [mediaPreference, setMediaPreference] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [imageCountMode, setImageCountMode] = useState<"auto" | "1" | "2" | "3" | "4" | "carousel">("auto");
  const [videoLayoutMode, setVideoLayoutMode] = useState<string>("auto");
  const [customVideoSceneCount, setCustomVideoSceneCount] = useState<string>("");

  const [ideas, setIdeas] = useState<ContentIdea[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("pk_ideas_library_v2");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  // Auto-save ideas to localStorage whenever ideas state changes
  useEffect(() => {
    if (typeof window === "undefined" || !ideas) return;
    try {
      localStorage.setItem("pk_ideas_library_v2", JSON.stringify(ideas));
    } catch (e) {}
  }, [ideas]);

  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [activeIdeaTab, setActiveIdeaTab] = useState<Record<string, "caption" | "script">>({});
  const [expandedPromptId, setExpandedPromptId] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchIdeas();
    checkSettings();

    // Check if an idea generation task was in progress when user switched pages
    if (typeof window !== "undefined") {
      try {
        const taskStr = localStorage.getItem("pk_active_ideas_generation_task");
        if (taskStr) {
          const task = JSON.parse(taskStr);
          if (task.isGenerating && Date.now() - task.startedAt < 90000) {
            setLoading(true);
            setNotification("⚡ AI กำลังประมวลผลไอเดียต่อจากที่คุณสั่งไว้... ระบบกำลังดึงผลลัพธ์");

            let attempts = 0;
            const pollInterval = setInterval(async () => {
              attempts++;
              try {
                const res = await fetch("/api/ai/ideas");
                const data = await res.json();
                if (data.ideas && data.ideas.length > 0) {
                  setIdeas(prev => {
                    const localMap = new Map(prev.map(i => [i.id, i]));
                    for (const sIdea of data.ideas) {
                      if (!localMap.has(sIdea.id)) localMap.set(sIdea.id, sIdea);
                    }
                    const combined = Array.from(localMap.values());
                    try {
                      localStorage.setItem("pk_ideas_library_v2", JSON.stringify(combined));
                    } catch (e) {}
                    return combined;
                  });
                  const currentTaskStr = localStorage.getItem("pk_active_ideas_generation_task");
                  const currentTask = currentTaskStr ? JSON.parse(currentTaskStr) : null;
                  if (!currentTask?.isGenerating || attempts >= 20) {
                    clearInterval(pollInterval);
                    setLoading(false);
                    setNotification("✓ AI สร้างคอนเทนต์เสร็จสมบูรณ์แล้ว! (ข้อมูลที่คุณพิมพ์และผลลัพธ์ไม่หาย)");
                    setTimeout(() => setNotification(null), 4500);
                    localStorage.setItem("pk_active_ideas_generation_task", JSON.stringify({ isGenerating: false }));
                    window.dispatchEvent(new Event("storage"));
                  }
                }
              } catch (e) {
                console.error("Poll error", e);
              }
            }, 2000);

            return () => clearInterval(pollInterval);
          } else if (!task.isGenerating && task.completedAt && Date.now() - task.completedAt < 45000) {
            setNotification("✓ ไอเดียชุดใหม่ที่คุณสั่งไว้ สร้างเสร็จเรียบร้อยขณะที่คุณดูหน้าอื่น!");
            setTimeout(() => setNotification(null), 4500);
          }
        }
      } catch (e) {}
    }
  }, []);

  const checkSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings?.has_openai_key || (data.settings?.openai_api_key && data.settings.openai_api_key.trim().length > 5)) {
        setHasOpenAiKey(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchIdeas = async () => {
    try {
      // 1. Immediately read from localStorage so user never experiences data loss on refresh
      let localList: ContentIdea[] = [];
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("pk_ideas_library_v2");
          if (saved) {
            localList = JSON.parse(saved);
            if (Array.isArray(localList) && localList.length > 0) {
              setIdeas(localList);
            }
          }
        } catch (e) {}
      }

      // 2. Fetch from server and merge seamlessly
      const res = await fetch("/api/ai/ideas");
      const data = await res.json();
      if (data.ideas && Array.isArray(data.ideas)) {
        const localIdMap = new Map(localList.map(i => [i.id, i]));
        const merged = [...localList];
        const serverIdSet = new Set(data.ideas.map((i: ContentIdea) => i.id));
        
        for (const sIdea of data.ideas) {
          if (!localIdMap.has(sIdea.id)) {
            merged.push(sIdea);
          }
        }

        // If local has ideas that server database lost (e.g. Render restart/deploy), sync back to server in background
        const ideasMissingOnServer = localList.filter(i => !serverIdSet.has(i.id));
        if (ideasMissingOnServer.length > 0) {
          fetch("/api/ai/ideas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ syncIdeas: ideasMissingOnServer })
          }).catch(err => console.warn("Background idea sync to server failed:", err));
        }

        setIdeas(merged);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("pk_ideas_library_v2", JSON.stringify(merged));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error("fetchIdeas error:", e);
    }
  };

  const handleSelectPreset = (preset: BrandPreset) => {
    setBrandName(preset.name);
    setBriefText(preset.defaultBrief);
    setNotification(`✓ เลือกเพจ '${preset.name}' พร้อมแนะนำหัวข้อคอนเทนต์ตัวอย่างให้แล้ว สามารถปรับแต่งข้อความได้อิสระครับ`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefText.trim()) return;
    setLoading(true);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("pk_active_ideas_generation_task", JSON.stringify({
          isGenerating: true,
          briefText,
          brandName,
          startedAt: Date.now()
        }));
        window.dispatchEvent(new Event("storage"));
      } catch (e) {}
    }

    try {
      const res = await fetch("/api/ai/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefText,
          brand_name: brandName,
          count: contentCount,
          is_series: isSeriesMode,
          aiEngine,
          preferredMediaType: mediaPreference,
          imageCountMode,
          videoLayoutMode: customVideoSceneCount ? customVideoSceneCount : videoLayoutMode
        })
      });
      const data = await res.json();
      if (data.success && data.ideas) {
        setIdeas(prev => [...data.ideas, ...prev]);
        if (data.meta?.isFailover) {
          setNotification(
            `⚡ สร้างคอนเทนต์สำเร็จ! (${data.meta.failoverReason || "ระบบเปิดใช้ Auto-Failover อัตโนมัติ เพื่อให้ทำงานได้ต่อเนื่อง 100% ไม่ติดขัดแม้โควต้า API หลักหมด"})`
          );
          setTimeout(() => setNotification(null), 6500);
        } else {
          setNotification(
            `✓ AI สร้างคอนเทนต์ ${isSeriesMode ? "โหมดซีรีส์ต่อเนื่อง" : ""} จำนวน ${data.ideas.length} รายการสำหรับ '${brandName}' เรียบร้อย!`
          );
          setTimeout(() => setNotification(null), 4500);
        }
      }
    } catch (err) {
      console.error(err);
      setNotification("เกิดข้อผิดพลาดในการสร้างไอเดีย");
    } finally {
      setLoading(false);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("pk_active_ideas_generation_task", JSON.stringify({
            isGenerating: false,
            completedAt: Date.now(),
            brandName
          }));
          window.dispatchEvent(new Event("storage"));
        } catch (e) {}
      }
    }
  };

  const handleClearBrief = () => {
    setBriefText("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("pk_ideas_briefText_v2");
    }
    setNotification("ล้างข้อความบรีฟเรียบร้อย");
    setTimeout(() => setNotification(null), 2000);
  };

  const [ideaAttachments, setIdeaAttachments] = useState<Record<string, string[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("pk_idea_attachments_v2");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to load idea attachments", e);
      }
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem("pk_idea_attachments_v2", JSON.stringify(ideaAttachments));
    } catch (e) {
      console.warn("Failed to save idea attachments", e);
    }
  }, [ideaAttachments]);

  const handleAttachImageToIdea = (ideaId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newUrls = Array.from(files).map(f => URL.createObjectURL(f));
    setIdeaAttachments(prev => ({
      ...prev,
      [ideaId]: [...(prev[ideaId] || []), ...newUrls]
    }));
    setNotification(`✓ แนบรูปภาพให้ไอเดียเรียบร้อยแล้ว (${newUrls.length} รูป) - พร้อมส่งต่อไป Step 2`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRemoveIdeaImage = (ideaId: string, idx: number) => {
    setIdeaAttachments(prev => ({
      ...prev,
      [ideaId]: (prev[ideaId] || []).filter((_, i) => i !== idx)
    }));
  };

  const handleAccept = async (idea: ContentIdea) => {
    try {
      const attached = ideaAttachments[idea.id] || idea.media_urls || (idea.media_url ? [idea.media_url] : []);
      const res = await fetch("/api/ai/ideas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: idea.id,
          action: "ACCEPT",
          updates: {
            media_urls: attached,
            media_url: attached[0] || idea.media_url
          }
        })
      });
      const data = await res.json();
      if (data.success && data.idea) {
        setIdeas(prev => prev.map(i => i.id === idea.id ? data.idea : i));
        setNotification(`✓ เลือก '${idea.title}' เรียบร้อย! กำลังพาไปยัง Step 2: สตูดิโอสื่อ (พร้อมส่งภาพ ${attached.length} รูปที่แนบไว้)...`);
        setTimeout(() => {
          router.push(`/content?id=${idea.id}`);
        }, 800);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: string) => {
    const target = ideas.find(i => i.id === id);
    if (!confirm(`คุณต้องการลบคอนเทนต์ '${target?.title || "นี้"}' ออกใช่หรือไม่?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/ai/ideas?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setIdeas(prev => prev.filter(i => i.id !== id));
        setNotification("✓ ลบรายการคอนเทนต์ที่ไม่ต้องการออกเรียบร้อย");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyScriptText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptId(id);
    setTimeout(() => setCopiedScriptId(null), 2000);
  };

  const copyPromptText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const acceptedCount = ideas.filter(i => i.status === "ACCEPTED").length;

  const allPresets = BRAND_CATEGORIES.flatMap(c => c.brands);
  const displayedPresets = activeBrandTab === "all" 
    ? allPresets 
    : BRAND_CATEGORIES.find(c => c.id === activeBrandTab)?.brands || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="bg-white border border-[#E8E9EC] rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>STAGE 01 · IDEA</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#17181A] tracking-tight">
              1. สั่ง AI คิดไอเดียและแคปชัน
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              สร้างคอนเทนต์เดี่ยว หรือ <strong className="text-amber-800">ซีรีส์เนื้อหาต่อเนื่อง (EP.1–10)</strong> พร้อมเรตติ้งดาวความน่าสนใจ รองรับครบทุกธุรกิจของคุณ หรือพิมพ์ชื่อเพจเองได้อิสระ
            </p>
          </div>

          {acceptedCount > 0 && (
            <Link
              href="/content"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
            >
              <span>ไปที่ STAGE 02 · สตูดิโอสื่อ ({acceptedCount} รายการที่เลือก)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {notification && (
          <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs shadow-luxury-sm animate-fade-in ${
            notification.includes("Auto-Failover") || notification.includes("⚡")
              ? "bg-amber-50/90 border border-amber-300 text-amber-900"
              : "bg-emerald-50 border border-emerald-200 text-emerald-800"
          }`}>
            {notification.includes("Auto-Failover") || notification.includes("⚡") ? (
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            )}
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Main Generator Form */}
      <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-luxury-card space-y-6">
        <form onSubmit={handleGenerate} className="space-y-5">
          {/* 1. Target Page / Business Selector */}
          <div className="space-y-3 pb-5 border-b border-[#E8E9EC]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs md:text-sm font-semibold text-[#17181A] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>เลือกเพจเป้าหมาย หรือพิมพ์ชื่อเพจเองได้อิสระ:</span>
              </label>
              <span className="text-[11px] text-amber-800">
                ✨ มีเพจของคุณครบทุกหมวดหมู่ (คลิกเพื่อเลือกหรือพิมพ์เอง)
              </span>
            </div>

            {/* Free-text Input with Active Name */}
            <div className="relative">
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="พิมพ์ชื่อเพจเป้าหมายหรือเลือกจากรายการด้านล่าง เช่น Mazda & BYD, PP Fishing, หนังสือ..."
                className="w-full px-4 py-3 bg-[#F7F8FA] border border-[#D1D5DB] rounded-xl text-sm text-[#17181A] placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
              />
              {brandName && (
                <span className="absolute right-3 top-3 text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-800 border border-blue-500/30 font-semibold">
                  เพจปัจจุบัน
                </span>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveBrandTab("all")}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                    activeBrandTab === "all"
                      ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                      : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-400 hover:text-[#17181A]"
                  }`}
                >
                  🏢 ทุกเพจของคุณ ({allPresets.length})
                </button>
                {BRAND_CATEGORIES.map(c => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveBrandTab(c.id)}
                      className={`text-[11px] px-3 py-1.5 rounded-lg border font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                        activeBrandTab === c.id
                          ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                          : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-400 hover:text-[#17181A]"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Presets Grid */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {displayedPresets.map(preset => {
                  const isSelected = brandName === preset.name;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-[11px] px-3 py-2 rounded-xl border transition-all text-left flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-sm shadow-blue-500/20"
                          : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-700 hover:border-[#D1D5DB] hover:text-[#17181A]"
                      }`}
                    >
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
                      }`}>
                        {preset.badge}
                      </span>
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Mode Selector: Single Post vs Content Series */}
          <div className="space-y-2 pb-4 border-b border-[#E8E9EC]">
            <div className="flex items-center justify-between">
              <label className="text-xs md:text-sm font-semibold text-[#17181A] flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>รูปแบบคอนเทนต์:</span>
              </label>
              <span className="text-[11px] text-amber-800 font-medium">
                {isSeriesMode ? "📚 ซีรีส์เนื้อหาเชื่อมโยงกัน EP.1 ถึง EP.10" : "💡 ไอเดียเดี่ยวหลากหลายมุมมอง"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsSeriesMode(false);
                  if (contentCount > 5) setContentCount(3);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  !isSeriesMode
                    ? "bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-luxury-sm"
                    : "bg-[#F7F8FA] border-[#E8E9EC] hover:border-[#D1D5DB] opacity-80"
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${!isSeriesMode ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"}`}>
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#17181A]">💡 คอนเทนต์เดี่ยวทั่วไป (Single Posts)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    สร้างไอเดียที่หลากหลายมุมมอง (รีวิว, โปรโมชั่น, สาระ) เพื่อทดสอบโพสต์ลงเพจ
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSeriesMode(true);
                  if (contentCount < 5) setContentCount(5);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  isSeriesMode
                    ? "bg-purple-50/70 border-purple-400 ring-2 ring-purple-500/20 shadow-luxury-sm"
                    : "bg-[#F7F8FA] border-[#E8E9EC] hover:border-[#D1D5DB] opacity-80"
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isSeriesMode ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-700"}`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#17181A] flex items-center gap-1.5">
                    <span>📚 โหมดซีรีส์เนื้อหาต่อเนื่อง (Content Series EP.1 - EP.10)</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-800 px-1.5 py-0.2 rounded font-mono">แนะนำ</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    สร้างเป็นตอนต่อเนื่อง เช่น สรุปหนังสือทีละบท, เทคนิคย่อย 1-10 วัน, สารคดีมหากาพย์
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Content Count Selector */}
          <div className="space-y-2 pb-4 border-b border-[#E8E9EC]">
            <div className="flex items-center justify-between">
              <label className="text-xs md:text-sm font-semibold text-[#17181A]">
                จำนวนคอนเทนต์ที่ต้องการให้ AI เจนออกมา:
              </label>
              <span className="text-xs text-blue-700 font-bold">
                {contentCount} คอนเทนต์ {isSeriesMode ? `(EP.1 ถึง EP.${contentCount})` : ""}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 5, 10].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setContentCount(cnt)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    contentCount === cnt ? "bg-[#17181A] border-[#17181A] text-white shadow-luxury-sm shadow-blue-600/30"
                      : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-400 hover:text-[#17181A] hover:border-[#D1D5DB]"
                  }`}
                >
                  <span>{cnt} คอนเทนต์</span>
                  {cnt === 5 && <span className="block text-[9px] text-amber-800 font-normal">ยอดนิยม</span>}
                  {cnt === 10 && <span className="block text-[9px] text-purple-800 font-normal">ซีรีส์เต็มชุด</span>}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Content Brief / Topic */}
          <div className="space-y-2 pb-4 border-b border-[#E8E9EC]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs md:text-sm font-semibold text-[#17181A]">
                หัวข้อคอนเทนต์ / สินค้า / หนังสือ / สาระที่ต้องการเล่า:
              </label>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>บันทึกอัตโนมัติ (สลับหน้าข้อความไม่หาย)</span>
                </span>
                {briefText && (
                  <button
                    type="button"
                    onClick={handleClearBrief}
                    className="text-[10.5px] text-slate-500 hover:text-rose-600 font-semibold cursor-pointer px-2 py-0.5 rounded hover:bg-rose-50 transition-colors"
                  >
                    ✕ ล้างข้อความ
                  </button>
                )}
              </div>
            </div>
            <textarea
              rows={3}
              value={briefText}
              onChange={e => setBriefText(e.target.value)}
              placeholder="กรอกหัวข้อ ประเด็นสำคัญ หรือบทเรียนที่ต้องการสรุป..."
              className="w-full px-4 py-3 bg-[#F7F8FA] border border-[#E8E9EC] rounded-xl text-xs text-[#17181A] placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed font-medium"
            />
          </div>

          {/* 5. Model & Media Preferences */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-2">
            <div className="lg:col-span-7">
              <label className="text-xs font-semibold text-[#17181A] block mb-1.5 flex items-center gap-1.5">
                <span>โมเดล AI ที่ใช้คิด:</span>
                <span className="text-[10px] text-slate-500 font-normal">(ลำดับการทำงานอัตโนมัติ 1 ➔ 2 ➔ 3)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAiEngine("groq")}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    aiEngine === "groq"
                      ? "bg-amber-50 border-amber-500 text-amber-900 shadow-sm ring-1 ring-amber-400"
                      : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
                  }`}
                  title="Groq Cloud (Qwen 3.8 / GPT-OSS) - เร็วสูงสุด ~300ms ภาพสวย ฟรี 14,400 ครั้ง/วัน"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                  <span className="truncate">1. Groq (Qwen)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAiEngine("chatgpt")}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    aiEngine === "chatgpt"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm ring-1 ring-emerald-400"
                      : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
                  }`}
                  title="OpenAI (GPT-4o) - ชั้นนำเรื่องกลยุทธ์การตลาดและ Copywriting"
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">2. GPT-4o</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAiEngine("gemini")}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    aiEngine === "gemini"
                      ? "bg-blue-50 border-blue-500 text-blue-900 shadow-sm ring-1 ring-blue-400"
                      : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
                  }`}
                  title="Google Gemini (Flash/Pro) - วิเคราะห์บริบทลึกและสร้างไอเดียรอบด้าน"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">3. Gemini</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <label className="text-xs font-semibold text-[#17181A] block mb-1.5">
                เน้นประเภทสื่อในไอเดีย:
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: "ALL", label: "ทั้งหมด" },
                  { id: "IMAGE", label: "ภาพนิ่ง" },
                  { id: "VIDEO", label: "วิดีโอ/คลิป" }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMediaPreference(m.id as any)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      mediaPreference === m.id
                        ? "bg-[#17181A] border-[#17181A] text-white shadow-sm"
                        : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-700 hover:text-[#17181A] hover:bg-slate-100"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Note badge when ALL is selected */}
          {mediaPreference === "ALL" && (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-50/80 via-indigo-50/80 to-purple-50/80 border border-indigo-200/70 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-slate-800 font-medium">
                  <strong>โหมดแนะนำสื่อทั้งหมด:</strong> AI จะสร้างทั้ง <strong>&ldquo;ภาพนิ่ง/อัลบั้ม&rdquo;</strong> และ <strong>&ldquo;วิดีโอคลิปสั้น&rdquo;</strong> ผสมผสานกันในชุดไอเดียอย่างสมดุล คุณสามารถกำหนดสไตล์ของทั้ง 2 รูปแบบได้ด้านล่างนี้
                </span>
              </div>
            </div>
          )}

          {/* 1. Photo Count & Layout Selector (when IMAGE or ALL is selected) */}
          {(mediaPreference === "IMAGE" || mediaPreference === "ALL") && (
            <div className="space-y-2 pb-3 border-b border-[#E8E9EC]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#17181A] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    {mediaPreference === "ALL" 
                      ? "📷 สไตล์สื่อ & จำนวนรูปภาพที่ต้องการ (สำหรับไอเดียภาพนิ่ง):" 
                      : "📷 สไตล์สื่อ & จำนวนรูปภาพที่ต้องการ:"}
                  </span>
                </label>
                <span className="text-[11px] text-emerald-700 font-mono font-bold">
                  {imageCountMode === "auto" && "AI วิเคราะห์เลือกให้ตามเนื้อหา (1-6 รูป)"}
                  {imageCountMode === "1" && "ภาพเดี่ยวจบในใบเดียว (1 รูป)"}
                  {imageCountMode === "2" && "เปรียบเทียบ Before & After (2 รูป)"}
                  {imageCountMode === "3" && "Facebook Trio Grid (3 รูป)"}
                  {imageCountMode === "4" && "อัลบั้มเจาะลึก 4 มุมมอง (4 รูป)"}
                  {imageCountMode === "carousel" && "Carousel สไลด์ความรู้ (5-6 รูป)"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { id: "auto", label: "🤖 AI ตัดสินใจ", desc: "1-6 รูปตามหัวข้อ" },
                  { id: "1", label: "🖼️ ภาพเดี่ยว (1)", desc: "Poster / Hero / คำคม" },
                  { id: "2", label: "⚖️ เปรียบเทียบ (2)", desc: "Before & After / Vs" },
                  { id: "3", label: "📐 Trio Grid (3)", desc: "1 ปกใหญ่ + 2 ดีเทล" },
                  { id: "4", label: "📸 เจาะลึก (4)", desc: "4 มุม / 4 จุดเด่น" },
                  { id: "carousel", label: "📚 Carousel (5+)", desc: "Lemon8 / How-to" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setImageCountMode(opt.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      imageCountMode === opt.id
                        ? "bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400/30"
                        : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-700 hover:text-[#17181A] hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-[#17181A] leading-tight">{opt.label}</span>
                    <span className="text-[10px] text-slate-500 mt-1 leading-snug">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Video & Multi-Shot Sequence Selector (when VIDEO or ALL is selected) */}
          {(mediaPreference === "VIDEO" || mediaPreference === "ALL") && (
            <div className="space-y-2.5 pb-3 border-b border-[#E8E9EC]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-semibold text-[#17181A] flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {mediaPreference === "ALL"
                      ? "🎬 สไตล์วิดีโอ & ลำดับฉาก (สำหรับไอเดียวิดีโอ/คลิปสั้น):"
                      : "🎬 สไตล์วิดีโอ & ลำดับฉาก (Video / Multi-Angle Coverage):"}
                  </span>
                </label>
                <span className="text-[11px] text-indigo-700 font-mono font-bold">
                  {videoLayoutMode === "auto" && !customVideoSceneCount && "AI จัดตามเนื้อหาจริง (Pro Multi-Shot ไม่จำกัดฉาก 8-20+ ฉาก)"}
                  {videoLayoutMode === "12" && !customVideoSceneCount && "🎬 Pro Multi-Shot (12 ฉาก: มี Insert, Zoom, Cutaway)"}
                  {videoLayoutMode === "16" && !customVideoSceneCount && "🎥 Full Cinema Production (16 ฉาก ฟูลโปรดักชันภาพยนตร์)"}
                  {videoLayoutMode === "20" && !customVideoSceneCount && "🌟 Epic Masterpiece (20+ ฉาก ละเอียดสูงสุด)"}
                  {videoLayoutMode === "8" && !customVideoSceneCount && "🎞️ โฆษณาพรีเมียมมาตรฐาน (8 ฉาก 30 วินาที)"}
                  {videoLayoutMode === "4" && !customVideoSceneCount && "⚡ คลิปสั้นกระชับ (4 ฉาก 15 วินาที)"}
                  {videoLayoutMode === "multi_image" && !customVideoSceneCount && "📸 เจนหลายภาพต่อกัน (Keyframe Shots สำหรับ Flow)"}
                  {customVideoSceneCount && `🎯 กำหนดเอง: ${customVideoSceneCount} ฉากระดับมืออาชีพ`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { id: "auto", label: "🤖 AI จัดตามเนื้อหาจริง", desc: "ไม่จำกัดฉาก (Pro 8-20+ ฉาก)" },
                  { id: "12", label: "🎬 Pro Multi-Shot", desc: "12 ฉาก (มี Insert, Zoom)" },
                  { id: "16", label: "🎥 Full Cinema", desc: "16 ฉาก ฟูลโปรดักชัน" },
                  { id: "20", label: "🌟 Epic Master", desc: "20+ ฉาก ละเอียดสูงสุด" },
                  { id: "8", label: "🎞️ มาตรฐาน (8)", desc: "8 ฉาก 30 วินาที" },
                  { id: "4", label: "⚡ สั้นกระชับ (4)", desc: "4 ตอน 15 วินาที" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setVideoLayoutMode(opt.id);
                      setCustomVideoSceneCount("");
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      videoLayoutMode === opt.id && !customVideoSceneCount
                        ? "bg-indigo-50 border-indigo-400 text-indigo-950 ring-1 ring-indigo-400/30 shadow-xs"
                        : "bg-[#F7F8FA] border-[#E8E9EC] text-slate-700 hover:text-[#17181A] hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-[#17181A] leading-tight">{opt.label}</span>
                    <span className="text-[10px] text-slate-500 mt-1 leading-snug">{opt.desc}</span>
                  </button>
                ))}
              </div>

              {/* Custom Scene Count & Professional Cinematography Note */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="text-[10.5px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                    ✨ ถ่ายทำแบบมืออาชีพ
                  </span>
                  <span className="text-[11px] text-slate-500">
                    วางสตอรี่บอร์ดหลายมุมกล้อง (Wide, Medium, 🔍 Macro Insert, 📐 Kinetic Zoom, 🎬 OTS, 💡 B-Roll Cutaway) สมจริง ไม่เหมือนงาน AI
                  </span>
                </div>

                <div className="flex items-center gap-1.5 ml-auto bg-[#F7F8FA] px-2.5 py-1 rounded-xl border border-[#E8E9EC]">
                  <span className="text-[11px] font-bold text-slate-600">กำหนดเอง:</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={customVideoSceneCount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomVideoSceneCount(val);
                      if (val) setVideoLayoutMode(val);
                    }}
                    placeholder="เช่น 14"
                    className="w-14 bg-white text-xs font-mono font-bold text-center py-0.5 rounded border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[11px] font-bold text-slate-500">ฉาก</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !briefText.trim()}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังสั่ง AI สร้างไอเดียและแคปชัน {contentCount} รายการสำหรับ &apos;{brandName}&apos;...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-800" />
                  <span>สร้างคอนเทนต์ {contentCount} รายการ {isSeriesMode ? "(โหมดซีรีส์)" : ""} สำหรับ &apos;{brandName}&apos;</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Ideas Deck */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <h2 className="text-lg font-bold text-[#17181A]">
              ไอเดียทั้งหมดในคลัง ({ideas.length} รายการ)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            คลิกปุ่ม <strong className="text-emerald-700">&ldquo;✓ เอา (เลือกไอเดียนี้)&rdquo;</strong> เพื่อส่งไปสตูดิโอสื่อใน Step 2 หรือกด <strong className="text-rose-700">&ldquo;🗑️ ลบทิ้ง&rdquo;</strong> หากไม่ต้องการใช้
          </span>
        </div>

        {ideas.length === 0 && !loading && (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E9EC] text-slate-400 space-y-2">
            <Lightbulb className="w-10 h-10 text-amber-800/50 mx-auto" />
            <p className="text-sm font-medium text-[#17181A]">ยังไม่มีไอเดียในระบบ</p>
            <p className="text-xs text-slate-500">กรอกหัวข้อหรือเลือกเพจเป้าหมายด้านบน แล้วกดปุ่มสร้างคอนเทนต์เพื่อเริ่มต้น</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ideas.map((idea, idx) => {
            const isAccepted = idea.status === "ACCEPTED";
            const isVideo = idea.media_type === "VIDEO" || idea.format?.includes("คลิป") || idea.format?.includes("วิดีโอ");
            const ratingValue = idea.rating || 4.9;
            const virality = idea.virality_score || "สูงมาก";

            return (
              <div
                key={idea.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all shadow-luxury-sm ${
                  isAccepted
                    ? "bg-white border-emerald-500/50 ring-1 ring-emerald-500/30"
                    : "bg-white border-[#E8E9EC] hover:border-[#D1D5DB]"
                }`}
              >
                <div>
                  {/* Top Bar: Episode / Index + Star Rating + Brand */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#E8E9EC]">
                    <div className="flex items-center gap-1.5">
                      {idea.is_series || idea.episode ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-800 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>EP. {idea.episode || idx + 1}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-700">
                          #{idx + 1}
                        </span>
                      )}

                      {/* Brand Tag */}
                      <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E8E9EC]">
                        🏢 {idea.brand_name || brandName}
                      </span>
                    </div>

                    {/* Star Rating & Virality Score */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-800" />
                        <span>{ratingValue.toFixed(1)}/5</span>
                      </span>

                      <span className="text-[10px] text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 font-semibold">
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span>ไวรัล: {virality}</span>
                      </span>
                    </div>
                  </div>

                  {/* Media Type Badge & Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                      isVideo
                        ? "bg-rose-500/15 border-rose-500/30 text-rose-800"
                        : "bg-blue-500/15 border-blue-500/30 text-blue-800"
                    }`}>
                      {isVideo ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                      <span>{isVideo ? "วิดีโอ / คลิปสั้น" : "ภาพนิ่งกราฟิก"}</span>
                    </span>

                    {isAccepted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3" /> เอา (ส่งไปยัง Step 2 แล้ว)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">รอเลือก</span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-[#17181A] leading-snug mb-2">
                    {idea.title}
                  </h3>

                  {/* Hook */}
                  {idea.hook && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs mb-3">
                      <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">🔥 Hook เปิดหัว:</div>
                      <p className="text-slate-900 font-semibold italic mt-0.5">&ldquo;{idea.hook}&rdquo;</p>
                    </div>
                  )}

                  {/* Caption & Spoken Script Container */}
                  {isVideo ? (
                    <div className="mb-3 rounded-xl border border-[#E8E9EC] bg-[#F7F8FA] overflow-hidden">
                      {/* Tab Header */}
                      <div className="flex flex-wrap items-center justify-between border-b border-[#E8E9EC] bg-slate-100/80 p-1.5 gap-1">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setActiveIdeaTab(prev => ({ ...prev, [idea.id]: "caption" }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              (activeIdeaTab[idea.id] || "caption") === "caption"
                                ? "bg-white text-blue-700 shadow-xs border border-blue-100"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>📝 แคปชั่นสำหรับโพสต์จริง</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveIdeaTab(prev => ({ ...prev, [idea.id]: "script" }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              activeIdeaTab[idea.id] === "script"
                                ? "bg-white text-purple-700 shadow-xs border border-purple-100"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <Mic className="w-3.5 h-3.5 text-purple-600" />
                            <span>🎙️ บทพูดถ่ายทำ / พากย์เสียง</span>
                          </button>
                        </div>

                        {/* Copy Button for Active Tab */}
                        {(activeIdeaTab[idea.id] || "caption") === "caption" ? (
                          <button
                            type="button"
                            onClick={() => copyText(idea.caption || idea.concept, idea.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            title="คัดลอกแคปชั่นสำหรับนำไปโพสต์"
                          >
                            {copiedId === idea.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                            <span>{copiedId === idea.id ? "คัดลอกแคปชั่นแล้ว" : "คัดลอกแคปชั่น"}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => copyScriptText(idea.video_script || idea.spoken_script || idea.concept || idea.caption || "", idea.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            title="คัดลอกบทพูดสำหรับอ่านถ่ายคลิป"
                          >
                            {copiedScriptId === idea.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-purple-500" />}
                            <span>{copiedScriptId === idea.id ? "คัดลอกบทพูดแล้ว" : "คัดลอกบทพูด"}</span>
                          </button>
                        )}
                      </div>

                      {/* Tab Body */}
                      <div className="p-3 text-xs space-y-2">
                        {(activeIdeaTab[idea.id] || "caption") === "caption" ? (
                          <>
                            <p className="text-slate-800 font-medium whitespace-pre-line leading-relaxed font-sans text-xs">
                              {idea.caption || idea.concept}
                            </p>
                            {idea.hashtags && idea.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1.5 border-t border-[#E8E9EC]">
                                {idea.hashtags.map((h, hidx) => (
                                  <span key={hidx} className="text-[11px] text-blue-700 font-mono">
                                    {h.startsWith("#") ? h : `#${h}`}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 uppercase tracking-wide bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60 w-fit">
                              <span>📢 บทพูดอ่านออกเสียงตามธรรมชาติ (ไม่มีเวลา 0:00 / สำหรับอ่านลงไมค์หรือ Teleprompter)</span>
                            </div>
                            <p className="text-slate-900 font-medium whitespace-pre-line leading-relaxed text-xs bg-white p-2.5 rounded-lg border border-purple-100">
                              {idea.video_script || idea.spoken_script || idea.concept || idea.caption}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Static Image Caption */
                    <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] text-xs space-y-2 mb-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>แคปชันเนื้อหาโพสต์:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(idea.caption || idea.concept, idea.id)}
                          className="text-slate-600 hover:text-[#17181A] flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs"
                        >
                          {copiedId === idea.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === idea.id ? "คัดลอกแล้ว" : "คัดลอก"}</span>
                        </button>
                      </div>
                      <p className="text-slate-800 font-medium whitespace-pre-line leading-relaxed font-sans text-xs line-clamp-6">
                        {idea.caption || idea.concept}
                      </p>

                      {idea.hashtags && idea.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-[#E8E9EC]">
                          {idea.hashtags.map((h, hidx) => (
                            <span key={hidx} className="text-[11px] text-blue-700 font-mono">
                              {h.startsWith("#") ? h : `#${h}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Production Cinematography Prompt Box */}
                  <div className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] space-y-2 mb-3 border border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                        {isVideo ? (
                          <>
                            <Film className="w-3.5 h-3.5 text-rose-400" />
                            <span>🎬 Prompt วิดีโอระดับโปรดักชั่น (สำหรับ Kling / Runway Gen-3 / Luma):</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-3.5 h-3.5 text-blue-400" />
                            <span>📸 Master Commercial Photography Prompt:</span>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => copyPromptText(idea.media_prompt || "", idea.id)}
                        className="px-2 py-0.5 text-[10px] font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                        title="คัดลอก Prompt สำหรับนำไปเจน"
                      >
                        {copiedPromptId === idea.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>คัดลอก Prompt</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Production Spec Badges */}
                    <div className="flex flex-wrap gap-1">
                      {isVideo ? (
                        <>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            🎥 50mm f/1.8 Prime Lens
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            💡 Warm 3200K + Diffused Rim
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            🔍 Macro / B-Roll Inserts
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            🎞️ ARRI Alexa 4K Grade
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            📸 Hasselblad 100MP
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            💡 Soft Studio Light
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            📐 Golden Ratio 8K
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            🇹🇭 Modern Thai Typography
                          </span>
                        </>
                      )}
                    </div>

                    {/* Prompt Text with expand/collapse */}
                    <div className="relative">
                      <p className={`font-mono text-slate-300 text-[10.5px] leading-relaxed select-all ${
                        expandedPromptId[idea.id] ? "" : "line-clamp-3"
                      }`}>
                        {idea.media_prompt || "Commercial clean cinematography..."}
                      </p>
                      {(idea.media_prompt || "").length > 150 && (
                        <button
                          type="button"
                          onClick={() => setExpandedPromptId(prev => ({ ...prev, [idea.id]: !prev[idea.id] }))}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-sans mt-1 cursor-pointer"
                        >
                          {expandedPromptId[idea.id] ? "▲ ย่อ Prompt" : "▼ ดู Prompt ทั้งหมด"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 💡 AI Photo Recommendation & User Photo Attachment Slot (ส่งต่อไปวิเคราะห์ใน Step 2) */}
                  {(() => {
                    const currentCardImages = ideaAttachments[idea.id] || idea.media_urls || (idea.media_url ? [idea.media_url] : []);
                    const photoTip = idea.media_blueprint?.slides?.[0]?.real_photo_tip ||
                      (idea.title.includes("รับปริญญา") || idea.title.includes("ชุดครุย")
                        ? "ภาพถ่ายเดี่ยว/คู่ในชุดครุย หรือภาพบัณฑิต เพื่อให้ AI ล็อกสไตล์"
                        : idea.title.includes("วัด") || idea.title.includes("ไหว้พระ") || idea.title.includes("ทำบุญ")
                        ? "ภาพถ่ายเจดีย์ พระพุทธรูป หรือบรรยากาศสงบภายในวัด เพื่อให้ AI ล็อกสไตล์"
                        : idea.title.includes("คาเฟ่") || idea.title.includes("กาแฟ")
                        ? "ภาพถ่ายมุมซิกเนเจอร์ของร้าน หรือแก้วกาแฟ เพื่อให้ AI ล็อกสไตล์"
                        : idea.title.includes("เชียงใหม่") || idea.title.includes("เที่ยว")
                        ? "ภาพถ่ายบรรยากาศสถานที่ท่องเที่ยว วิวธรรมชาติ หรือจุดเช็คอิน เพื่อให้ AI ล็อกสไตล์"
                        : "ภาพถ่ายสินค้ามุมตรง หรือภาพบุคคลที่ต้องการใช้งานจริง");

                    return (
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/50 border border-indigo-100/90 text-xs space-y-2.5 mb-2">
                        {/* AI Recommendation */}
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-indigo-950 text-[11px] block">
                              {isVideo ? "🎬 AI แนะนำฟุตเทจ/ช็อตที่ควรเตรียมถ่าย:" : "💡 AI แนะนำรูปที่ควรเตรียมแนบ:"}
                            </span>
                            <p className="text-[11px] text-slate-700 leading-relaxed mt-0.5">
                              {photoTip}
                            </p>
                          </div>
                        </div>

                        {/* Attached Photos Preview on Idea Card */}
                        {currentCardImages.length > 0 && (
                          <div className="space-y-1 pt-1.5 border-t border-indigo-100/80">
                            <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-600">
                              <span>รูปที่แนบไว้ ({currentCardImages.length} รูป - จะส่งเข้า Step 2 สตูดิโอสื่อ):</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                              {currentCardImages.map((imgUrl, imgIdx) => (
                                <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white group shadow-xs">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={imgUrl} alt={`ref-${imgIdx}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveIdeaImage(idea.id, imgIdx)}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 hover:bg-rose-600 text-white text-[9px] flex items-center justify-center cursor-pointer transition-colors"
                                    title="ลบรูปนี้"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Attach Button */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-[#E8E9EC] text-[11px] font-bold text-indigo-700 transition-colors shadow-xs">
                            <Upload className="w-3.5 h-3.5 text-indigo-600" />
                            <span>+ แนบรูปจริงสำหรับไอเดียนี้</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleAttachImageToIdea(idea.id, e.target.files)}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {currentCardImages.length > 0 ? "พร้อมส่งต่อ Step 2" : "แนบรูปเพื่อให้ AI วิเคราะห์ใน Step 2"}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Card Action Buttons: เอา vs ลบทิ้ง vs ส่งเข้า Commercial Studio */}
                <div className="mt-4 pt-3 border-t border-[#E8E9EC] flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleReject(idea.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                    title="ลบคอนเทนต์นี้ออกจากคลัง"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>🗑️ ลบทิ้ง</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/commercial?id=${idea.id}&autoGen=true`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                      title="ส่งไอเดียนี้ไปสร้างวิดีโอโฆษณาใน Commercial Video Studio"
                    >
                      <Film className="w-3.5 h-3.5 text-indigo-600" />
                      <span>🎬 ทำโฆษณาเสมือนจริง</span>
                    </Link>

                    {isAccepted ? (
                      <Link
                        href={`/content?id=${idea.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-luxury-sm shadow-emerald-600/20 transition-all cursor-pointer"
                      >
                        <span>ไปยังสตูดิโอสื่อ (Step 2) →</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAccept(idea)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-luxury-sm shadow-emerald-600/20 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>✓ เอา (เลือกไอเดียนี้)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
