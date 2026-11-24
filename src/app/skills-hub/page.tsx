"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Car,
  Tag,
  Layers,
  Camera,
  Send,
  PlusCircle,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Wand2,
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import {
  useHub,
  HubHandoffPayload,
  HubSceneItem,
  CustomDepartmentItem
} from "@/context/HubContext";
import { DepartmentHandoffBar } from "@/components/hub/DepartmentHandoffBar";
import { useToast } from "@/components/ui/ToastProvider";

type SkillTabId =
  | "handover"
  | "showroom"
  | "ad_banner"
  | "infographic"
  | "camera_sound"
  | "line_social"
  | "custom";

export default function SkillsHubPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-xs text-slate-500">
          กำลังโหลดศูนย์รวมสกิลผู้กำกับ AI & ระบบสร้างแผนกใหม่...
        </div>
      }
    >
      <SkillsHubWorkspace />
    </Suspense>
  );
}

function SkillsHubWorkspace() {
  const searchParams = useSearchParams();
  const {
    activeHandoff,
    setActiveHandoff,
    saveToVault,
    customDepartments,
    addCustomDepartment,
    removeCustomDepartment
  } = useHub();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<SkillTabId>("handover");
  const [activeCustomDept, setActiveCustomDept] = useState<CustomDepartmentItem | null>(null);

  // Handover Video Director State
  const [carModel, setCarModel] = useState("Mazda CX-6e (2026)");
  const [carColor, setCarColor] = useState("สีขาวมุก Pearl White");
  const [customerName, setCustomerName] = useState("ครอบครัวคุณธนภัทร");
  const [dealershipName, setDealershipName] = useState("โชว์รูมมาสด้า สินธานี");
  const [promoOffer, setPromoOffer] = useState("ฟรีดาวน์ 0% ดอกเบี้ยพิเศษ ของแถมแน่นคัน");

  // Showroom Reel Maker State
  const [showroomModel, setShowroomModel] = useState("BYD Sealion 7 Performance AWD");
  const [showroomHighlight, setShowroomHighlight] = useState("หลังคาแก้ว Panoramic, จอกลางอัจฉริยะ, ฝาท้ายไฟฟ้าเตะเปิด");
  const [showroomDailyPay, setShowroomDailyPay] = useState("299");

  // Ad Banner & Infographic State
  const [adTopic, setAdTopic] = useState("โปรออกรถใหม่ป้ายแดง ลดเพิ่ม 50,000 บาท เฉพาะ 3 คันสุดท้าย");
  const [infoTopic, setInfoTopic] = useState("5 วิธีดูแลแบตเตอรี่รถยนต์ไฟฟ้า EV ให้เสื่อมช้าและประหยัดค่าไฟสูงสุด");

  // Custom Department Builder State
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptSublabel, setNewDeptSublabel] = useState("");
  const [newDeptBadge, setNewDeptBadge] = useState("NEW STUDIO");
  const [newDeptMode, setNewDeptMode] = useState<"ai_workspace" | "external_app">("ai_workspace");
  const [newDeptPrompt, setNewDeptPrompt] = useState("");
  const [newDeptUrl, setNewDeptUrl] = useState("");
  const [customInputPrompt, setCustomInputPrompt] = useState("");
  const [generatingCustom, setGeneratingCustom] = useState(false);

  const [payload, setPayload] = useState<HubHandoffPayload | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const deptParam = searchParams.get("dept");
    if (tabParam === "custom") {
      setActiveTab("custom");
      setActiveCustomDept(null);
    } else if (deptParam) {
      const found = customDepartments.find((d) => d.id === deptParam);
      if (found) {
        setActiveCustomDept(found);
        setActiveTab("custom");
      }
    }
  }, [searchParams, customDepartments]);

  // 1. Handover Video Director Skill Generator (4-Act Emotional Arc)
  const handleRunHandoverSkill = () => {
    const scenes: HubSceneItem[] = [
      {
        sceneNumber: 1,
        title: "องค์ที่ 1: การรอคอย & เปิดตัวรถติดโบว์แดงยักษ์ (The Reveal)",
        durationSec: 4,
        timecode: "00:00 - 00:04",
        actBadge: "🎀 Act 1: Anticipation",
        voiceoverThai: `วันนี้ฤกษ์ดีมากๆ ครับ พามาชมวินาทีสำคัญของการส่งมอบรถใหม่ป้ายแดง ${carModel} ${carColor} ที่ ${dealershipName}`,
        onScreenText: `🚗✨ พิธีส่งมอบ ${carModel} ป้ายแดง!`,
        visualPromptEn: `[TOPIC LOCK: ${carModel} Handover Ceremony] Slow cinematic orbit shot at 60fps around a brand new sleek ${carModel} (${carColor}) parked in a luxury modern dealership delivery bay. A huge glossy red satin ribbon with gold trim sits elegantly on the hood. Professional studio lighting with clean soft reflections on polished paintwork, spotless floor reflection, photorealistic 8k, 9:16 vertical framing, zero text`,
        motionPromptEn: "Slow 60fps orbit around front 3/4 view of the car with red bow | SFX: Remote unlock click"
      },
      {
        sceneNumber: 2,
        title: "องค์ที่ 2: วินาทีมอบกุญแจและช่อดอกไม้ (Key Handover Moment)",
        durationSec: 4,
        timecode: "00:04 - 00:08",
        actBadge: "💐 Act 2: The Unveiling & Key",
        voiceoverThai: `ขอแสดงความยินดีกับ ${customerName} ด้วยนะครับ รอยยิ้มแห่งความภูมิใจของครอบครัวในวันรับรถใหม่คันสวย`,
        onScreenText: `🎉 ยินดีกับ ${customerName} ด้วยครับ!`,
        visualPromptEn: `[TOPIC LOCK: ${carModel} Key Handover] Medium eye-level shot with slow push-in. A joyful Thai family (${customerName}) smiling proudly beside their new ${carModel}, receiving an elegant gift box containing a smart key and a vibrant bouquet of fresh flowers from a courteous sales professional. Warm inviting showroom background with soft bokeh, authentic emotional celebration, 8k`,
        motionPromptEn: "Slow emotional dolly push-in capturing warm smiles and handshake"
      },
      {
        sceneNumber: 3,
        title: "องค์ที่ 3: สัมผัสแรกหลังพวงมาลัย (Cockpit Immersion POV)",
        durationSec: 4,
        timecode: "00:08 - 00:12",
        actBadge: "🛞 Act 3: Cockpit Immersion",
        voiceoverThai: `เปิดประตูเข้ามาสัมผัสกลิ่นรถใหม่ กดปุ่ม Push Start หน้าจอดิจิทัลและไฟ Ambient Light สว่างต้อนรับสุดล้ำ`,
        onScreenText: `✨ ห้องโดยสารหรู ล้ำสมัยทุกสัมผัส`,
        visualPromptEn: `[TOPIC LOCK: ${carModel} Interior Cockpit] First-person POV smooth camera entering the luxurious ${carModel} cockpit. Hand gently grips the perforated leather steering wheel, fingers press the glowing start-stop engine button. Dual digital dashboard screens illuminate with futuristic welcome animation, subtle ambient interior LED glow, 8k`,
        motionPromptEn: "First-person POV entering cockpit and pressing Push Start | SFX: Solid premium door thud & engine start"
      },
      {
        sceneNumber: 4,
        title: "องค์ที่ 4: ขับออกจากโชว์รูมรับแสงอาทิตย์ (Golden Hour Drive-Off)",
        durationSec: 4,
        timecode: "00:12 - 00:16",
        actBadge: "🌅 Act 4: Golden Hour Drive-Off",
        voiceoverThai: `ขอให้รถคันนี้นำพาความสุขและความเฮงในทุกเส้นทาง ใครสนใจโปร ${promoOffer} ทักแชทสอบถามได้เลยครับ!`,
        onScreenText: `🔥 ${promoOffer} ทักแชทเลย!`,
        visualPromptEn: `[TOPIC LOCK: ${carModel} Golden Hour Drive-Off] Low-angle tracking shot following the new ${carModel} (${carColor}) smoothly driving down the dealership exit ramp onto the open road. Warm golden hour sunlight creates subtle anamorphic lens flares on the windshield, sleek LED taillights glowing, triumphant mood, 9:16 vertical cinematography, 8k`,
        motionPromptEn: "Low-angle tracking shot following the car into golden hour sunset"
      }
    ];

    const newPayload: HubHandoffPayload = {
      id: `skill-handover-${Date.now()}`,
      title: `ส่งมอบรถใหม่ ${carModel} — ${customerName}`,
      topic: `${carModel} (${carColor})`,
      aspectRatio: "9:16",
      hook3Sec: scenes[0].voiceoverThai,
      concept: "แก่นเรื่อง 4 องก์ (The 4-Act Emotional Handover Story Arc) จากสกิล Handover Video Director",
      fullScriptThai: scenes.map((s) => s.voiceoverThai).join(" "),
      scenes,
      caption: `🚗✨ อีกหนึ่งก้าวแห่งความสำเร็จ ขอแสดงความยินดีกับ ${customerName} ด้วยนะครับ!\n\nขอบพระคุณที่ไว้วางใจให้ ${dealershipName} ดูแลส่งมอบ ${carModel} ${carColor} คันสวยคันนี้ ขอให้นำพาความสุข ความปลอดภัย และความเฮงๆ รวยๆ ในทุกเส้นทางครับ 🎉\n\n🔥 โปรพิเศษเดือนนี้: ${promoOffer}\n📲 สนใจทักแชทสอบถามได้เลยครับ!`,
      hashtags: ["#ส่งมอบรถใหม่", "#รับรถป้ายแดง", `#${carModel.replace(/\s+/g, "")}`, "#ออกรถ0บาท"],
      sourceDept: "skills-hub",
      updatedAt: new Date().toISOString()
    };

    setPayload(newPayload);
    setActiveHandoff(newPayload);
    saveToVault({
      id: newPayload.id,
      title: newPayload.title,
      department: "skills-hub",
      departmentLabel: "HANDOVER DIRECTOR",
      aspectRatio: "9:16",
      payload: newPayload
    });
    showToast("สร้างสตอรี่บอร์ดส่งมอบรถป้ายแดง 4 องก์ (Handover Video Director) สำเร็จ!", "success");
  };

  // 2. Showroom Reel Maker Skill Generator (6-Beat Formula)
  const handleRunShowroomSkill = () => {
    const beats = [
      {
        title: "Beat 1 (0-3s): The Thumb-Stopping Hook (ไฟหน้า Matrix LED)",
        vo: `ผ่อนเริ่มต้นแค่วันละ ${showroomDailyPay} บาท... ได้ขับ ${showroomModel} ตัวท็อปคันนี้แล้ว! มาดู 3 จุดเด่นก่อนตัดสินใจ`,
        badge: `[ NEW 2026 ] ผ่อนเริ่มวันละ ${showroomDailyPay}.-`,
        prompt: `[TOPIC LOCK: ${showroomModel}] Dramatic macro slow-motion shot revealing the front matrix LED headlights powering on with dynamic light sequence on a sleek ${showroomModel} in a glossy luxury showroom, anamorphic lens flare, 8k 9:16 vertical`,
        motion: "Fast dramatic push-in on illuminating LED headlights"
      },
      {
        title: "Beat 2 (3-8s): Exterior Sculpting & Sport Alloy Wheels",
        vo: "ดีไซน์ภายนอกสปอร์ตโฉบเฉี่ยวตามหลักอากาศพลศาสตร์ พร้อมล้อแม็กซ์อัลลอยด์ทูโทนขนาดใหญ่เต็มซุ้มล้อ",
        badge: "[ SPORT AERO ] ดีไซน์ระดับรถยุโรป",
        prompt: `[TOPIC LOCK: ${showroomModel} Side & Wheels] Dynamic low-angle camera gliding smoothly along the sculpted aerodynamic side contours of ${showroomModel} in a glass showroom, rotating around diamond-cut alloy sport rims, 8k`,
        motion: "Low-angle tracking glide ending on alloy wheel rotation"
      },
      {
        title: "Beat 3 (8-14s): Cockpit POV & Luxury Materials",
        vo: "เปิดประตูเข้ามาเจอห้องโดยสารเบาะหนัง Nappa ลายเพชร สัมผัสนุ่มหรูหราพร้อมหน้าจอสัมผัสขนาดใหญ่",
        badge: "[ LUXURY COCKPIT ] เบาะ Nappa + จอคู่",
        prompt: `[TOPIC LOCK: ${showroomModel} Interior] First-person POV entering the ultra-modern automotive interior of ${showroomModel}. Smooth pan across curved digital display, Nappa diamond-stitched leather seats, ambient neon cyan lighting, 8k`,
        motion: "First-person POV pan across dashboard and Nappa seats"
      },
      {
        title: "Beat 4 (14-20s): Star Tech & Secret Features",
        vo: `จัดเต็มฟีเจอร์เด็ด ทั้ง ${showroomHighlight} ที่ใช้งานสะดวกสุดๆ ในชีวิตจริง`,
        badge: `[ STAR TECH ] ${showroomHighlight.slice(0, 22)}`,
        prompt: `[TOPIC LOCK: ${showroomModel} Tech Features] Close-up commercial showcase of panoramic glass sunroof gliding open and smart electric power tailgate on ${showroomModel}, bright showroom environment, 8k`,
        motion: "Smooth tilt revealing panoramic glass roof and smart tech"
      },
      {
        title: "Beat 5 (20-25s): Practical Space & Family Comfort",
        vo: "พื้นที่ห้องโดยสารตอนหลังกว้างขวาง นั่งสบายตลอดทริป พร้อมพื้นที่เก็บสัมภาระด้านท้ายจุใจ",
        badge: "[ SPACIOUS ] กว้างขวาง นั่งสบายทั้งครอบครัว",
        prompt: `[TOPIC LOCK: ${showroomModel} Rear Space] Wide interior shot showing spacious rear passenger legroom and flat-folding cargo area inside ${showroomModel}, natural showroom lighting, 8k`,
        motion: "Smooth dolly pull-back showing cabin spaciousness"
      },
      {
        title: "Beat 6 (25-30s): Unbeatable Deal & Call-to-Action",
        vo: "เดือนนี้มีโปรพิเศษ ดาวน์เริ่มต้น 0% พร้อมโควต้าส่งมอบด่วน ทักแชทรับข้อเสนอพิเศษวันนี้ได้เลยครับ!",
        badge: "🔥 ดาวน์ 0% · ทักแชทจองโควต้าด่วน!",
        prompt: `[TOPIC LOCK: ${showroomModel} Hero Offer] Hero 3/4 front shot of ${showroomModel} under spotlight in luxury dealership showroom with clean space for promotional offer overlay, 8k commercial`,
        motion: "Hero orbit settling on front 3/4 center frame"
      }
    ];

    const scenes: HubSceneItem[] = beats.map((b, idx) => ({
      sceneNumber: idx + 1,
      title: b.title,
      durationSec: 5,
      timecode: `00:${String(idx * 5).padStart(2, "0")} - 00:${String((idx + 1) * 5).padStart(2, "0")}`,
      voiceoverThai: b.vo,
      onScreenText: b.badge,
      visualPromptEn: b.prompt,
      motionPromptEn: b.motion
    }));

    const newPayload: HubHandoffPayload = {
      id: `skill-showroom-${Date.now()}`,
      title: `รีวิวโชว์รูม 6 จังหวะ: ${showroomModel}`,
      topic: showroomModel,
      aspectRatio: "9:16",
      hook3Sec: scenes[0].voiceoverThai,
      concept: "โครงสร้าง 6 จังหวะหยุดนิ้วโป้ง (The 6-Beat Showroom Reel Formula) จากสกิล Showroom Reel Maker",
      fullScriptThai: scenes.map((s) => s.voiceoverThai).join(" "),
      scenes,
      caption: `🏎️ รีวิวเจาะลึก ${showroomModel} ภายใน 30 วินาที!\n✨ ไฮไลต์เด็ด: ${showroomHighlight}\n💰 ผ่อนเริ่มต้นเพียงวันละ ${showroomDailyPay} บาทเท่านั้น\n\n📩 ทักแชทรับตารางผ่อนและโควต้าโปรโมชันได้เลยครับ!`,
      hashtags: ["#รีวิวรถใหม่", "#โชว์รูมรถ", `#${showroomModel.split(" ")[0]}`, "#โปรรถใหม่"],
      sourceDept: "skills-hub",
      updatedAt: new Date().toISOString()
    };

    setPayload(newPayload);
    setActiveHandoff(newPayload);
    saveToVault({
      id: newPayload.id,
      title: newPayload.title,
      department: "skills-hub",
      departmentLabel: "SHOWROOM REEL",
      aspectRatio: "9:16",
      payload: newPayload
    });
    showToast("สร้างสคริปต์รีวิวรถในโชว์รูม 6 จังหวะ (Showroom Reel Maker) สำเร็จ!", "success");
  };

  // 3. Ad Creative Banner & AIDA Generator
  const handleRunAdBannerSkill = () => {
    const clean = adTopic.trim() || "โปรโมชันพิเศษจำนวนจำกัด";
    const scenes: HubSceneItem[] = [
      {
        sceneNumber: 1,
        title: "A — Attention (พาดหัวหยุดนิ้ว + ป้าย FOMO)",
        durationSec: 3,
        voiceoverThai: `หยุดดูตรงนี้ก่อนครับ! ${clean} ข้อเสนอที่คุ้มที่สุดแห่งปีมาถึงแล้ว`,
        onScreenText: `🔥 ด่วน! ${clean.slice(0, 28)}`,
        visualPromptEn: `[TOPIC LOCK: ${clean}] High-impact commercial hero advertising banner of ${clean}, dramatic studio rim lighting, clean composition for promotional discount stamp, 8k`,
        motionPromptEn: "Zoom-in hero reveal"
      },
      {
        sceneNumber: 2,
        title: "I & D — Interest & Desire (จุดเด่น + ความคุ้มค่าที่ปฏิเสธไม่ได้)",
        durationSec: 4,
        voiceoverThai: "จัดเต็มทั้งส่วนลด ของแถม และการรับประกันครบชุด คุ้มค่าทุกบาททุกสตางค์แน่นอน",
        onScreenText: "✨ ของแถมจัดเต็ม + ประกันครบชุด",
        visualPromptEn: `[TOPIC LOCK: ${clean} Feature Showcase] Close-up commercial detail showcase of ${clean} highlighting premium quality and craftsmanship, 8k`,
        motionPromptEn: "Smooth macro pan"
      },
      {
        sceneNumber: 3,
        title: "A — Action (UX Microcopy CTA กระตุ้นทักแชททันที)",
        durationSec: 3,
        voiceoverThai: "สิทธิ์มีจำนวนจำกัด กดรับสิทธิ์ฟรีที่ปุ่มด้านล่าง หรือทักแชทหาเราตอนนี้ได้เลยครับ!",
        onScreenText: "📲 ทักแชทรับสิทธิ์ทันที (ไม่ต้องมัดจำ)",
        visualPromptEn: `[TOPIC LOCK: ${clean} Call to Action] Clean luxury commercial packshot of ${clean} with warm spotlight and trust badge framing, 8k`,
        motionPromptEn: "Gentle hero settle"
      }
    ];

    const newPayload: HubHandoffPayload = {
      id: `skill-ad-${Date.now()}`,
      title: `แคมเปญโฆษณา AIDA: ${clean}`,
      topic: clean,
      aspectRatio: "9:16",
      hook3Sec: scenes[0].voiceoverThai,
      concept: "สูตรโฆษณา AIDA + UX Microcopy Alchemist",
      fullScriptThai: scenes.map((s) => s.voiceoverThai).join(" "),
      scenes,
      caption: `🔥 [ATTENTION] ${clean}\n\n✅ [INTEREST] คุ้มค่ากว่าที่เคยด้วยคุณภาพระดับพรีเมียม\n🎁 [DESIRE] รับข้อเสนอพิเศษพร้อมของแถมครบเซ็ตเฉพาะรอบนี้\n👉 [ACTION] ทักแชทรับสิทธิ์ฟรีใน 1 นาที (ไม่มีค่าใช้จ่ายแอบแฝง)`,
      hashtags: ["#โปรโมชัน", "#ลดราคา", "#ป้ายยา", "#PKCreativeHub"],
      sourceDept: "skills-hub",
      updatedAt: new Date().toISOString()
    };

    setPayload(newPayload);
    setActiveHandoff(newPayload);
    showToast("สร้างแคมเปญ AIDA + UX Microcopy สำเร็จ!", "success");
  };

  // 4. Infographic Carousel Composer (Rule of 3-to-5 Slides)
  const handleRunInfographicSkill = () => {
    const clean = infoTopic.trim() || "5 เทคนิคสำคัญที่ต้องรู้";
    const slides: HubSceneItem[] = [1, 2, 3, 4, 5].map((num) => ({
      sceneNumber: num,
      title:
        num === 1
          ? `สไลด์ปก #1: พาดหัวใหญ่ High-Contrast (${clean})`
          : num === 5
          ? `สไลด์สรุป #5: เช็กลิสต์นำไปใช้จริง & กดเซฟเก็บไว้`
          : `สไลด์ความรู้ #${num}: เคล็ดลับข้อที่ ${num - 1} (อ่านจบใน 5 วิ)`,
      durationSec: 4,
      voiceoverThai:
        num === 1
          ? `สรุปครบจบใน 5 สไลด์: ${clean} เซฟเก็บไว้ดูได้เลยครับ!`
          : num === 5
          ? "ถ้าเห็นว่ามีประโยชน์ กดเซฟและแชร์ต่อให้เพื่อนได้เลยครับ!"
          : `เทคนิคข้อที่ ${num - 1} ของ ${clean} ที่ทำตามได้ง่ายและเห็นผลจริงทันที`,
      onScreenText: `${num}/5 · ${clean.slice(0, 22)}`,
      visualPromptEn: `[TOPIC LOCK: Infographic Slide ${num} - ${clean}] High-contrast modern editorial infographic card design for "${clean}", bold visual focus, clean dark slate and emerald accent aesthetic, 8k, zero gibberish text`,
      motionPromptEn: "Clean editorial slide transition"
    }));

    const newPayload: HubHandoffPayload = {
      id: `skill-info-${Date.now()}`,
      title: `อินโฟกราฟิก 5 สไลด์: ${clean}`,
      topic: clean,
      aspectRatio: "9:16",
      hook3Sec: slides[0].voiceoverThai,
      concept: "Infographic Composer — Rule of 5 High-Contrast Carousel Deck",
      fullScriptThai: slides.map((s) => s.voiceoverThai).join(" "),
      scenes: slides,
      caption: `📊 สรุปจบใน 5 ภาพ: ${clean}\n\n1️⃣ ปูพื้นฐานเข้าใจง่าย\n2️⃣ เทคนิคสำคัญข้อที่ 1\n3️⃣ เทคนิคสำคัญข้อที่ 2\n4️⃣ ข้อควรระวังที่คนมักพลาด\n5️⃣ สรุปเช็กลิสต์นำไปใช้ทันที\n\n📌 กด Save เก็บไว้ใช้ได้เลย!`,
      hashtags: ["#สาระน่ารู้", "#อินโฟกราฟิก", "#สรุปความรู้"],
      sourceDept: "skills-hub",
      updatedAt: new Date().toISOString()
    };

    setPayload(newPayload);
    setActiveHandoff(newPayload);
    showToast("สร้างชุดสไลด์ Infographic 5 หน้าเรียบร้อย!", "success");
  };

  // Create New Custom Future Department
  const handleCreateCustomDept = () => {
    if (!newDeptName.trim()) {
      showToast("กรุณาตั้งชื่อแผนกหรือโปรเจกต์ใหม่ก่อนครับ", "info");
      return;
    }
    const created = addCustomDepartment({
      name: newDeptName.trim(),
      sublabel: newDeptSublabel.trim() || "แผนกขยายเพิ่มเติมใน HUB",
      badge: newDeptBadge.trim() || "CUSTOM",
      iconName: "Layers",
      mode: newDeptMode,
      systemPromptTemplate: newDeptPrompt.trim() || `สร้างสคริปต์และสตอรี่บอร์ดสำหรับแผนก ${newDeptName.trim()}`,
      externalUrl: newDeptUrl.trim() || undefined,
      defaultAspectRatio: "9:16"
    });
    setNewDeptName("");
    setNewDeptSublabel("");
    setNewDeptPrompt("");
    setNewDeptUrl("");
    setActiveCustomDept(created);
    showToast(`สร้างแผนกใหม่ "${created.name}" เพิ่มเข้าในแถบเมนู HUB เรียบร้อยแล้ว!`, "success");
  };

  const handleRunCustomDeptAI = async () => {
    if (!activeCustomDept) return;
    const q = customInputPrompt.trim() || activeCustomDept.name;
    setGeneratingCustom(true);
    try {
      const res = await fetch("/api/ai/easy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE",
          prompt: `[แผนกเฉพาะทาง: ${activeCustomDept.name} | คำสั่งพิเศษ: ${activeCustomDept.systemPromptTemplate}] หัวข้อ: ${q}`,
          format: "VIDEO",
          aiMode: "AI_FLOW",
          aspectRatio: activeCustomDept.defaultAspectRatio || "9:16",
          sceneCount: "5"
        })
      });
      const data = await res.json().catch(() => ({}));
      const bp = data?.blueprint;
      if (res.ok && bp?.video_blueprint?.scenes?.length > 0) {
        const mappedScenes: HubSceneItem[] = bp.video_blueprint.scenes.map((s: any, idx: number) => ({
          sceneNumber: idx + 1,
          title: s.scene_role || `ฉากที่ ${idx + 1}`,
          durationSec: s.duration_sec || 3,
          voiceoverThai: s.voiceover_text || "",
          onScreenText: s.on_screen_text || "",
          visualPromptEn: s.flow_prompt || `Cinematic 8K shot of ${q}`,
          motionPromptEn: s.camera_angle || "Smooth camera movement"
        }));
        const customPayload: HubHandoffPayload = {
          id: `custom-${Date.now()}`,
          title: `${activeCustomDept.name}: ${q}`,
          topic: q,
          aspectRatio: "9:16",
          hook3Sec: bp.hook_3sec || mappedScenes[0]?.voiceoverThai || "",
          concept: activeCustomDept.systemPromptTemplate || "",
          fullScriptThai: mappedScenes.map((s) => s.voiceoverThai).join(" "),
          scenes: mappedScenes,
          caption: bp.social_caption || "",
          hashtags: bp.hashtags || ["#PKCreativeHub"],
          sourceDept: activeCustomDept.id,
          updatedAt: new Date().toISOString()
        };
        setPayload(customPayload);
        setActiveHandoff(customPayload);
        showToast(`ผลิตสคริปต์ในแผนก "${activeCustomDept.name}" สำเร็จ!`, "success");
      }
    } finally {
      setGeneratingCustom(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-lg">
            <Wand2 className="w-3.5 h-3.5" />
            <span>แผนกที่ 6 · AI Director Skills Studio & Extensible Hub Builder</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ศูนย์รวมสกิลผู้กำกับ AI พิเศษของคุณ & ระบบเพิ่มแผนกใหม่ในอนาคต
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            รวบรวมสกิลทั้งหมดในเครื่องของคุณมาไว้ในหน้าเดียว (ส่งมอบรถป้ายแดง 4 องก์ · รีวิวโชว์รูม 6 จังหวะ · แบนเนอร์ AIDA · อินโฟกราฟิก · LINE Flex Card) พร้อมระบบสร้างแผนกใหม่ในอนาคตได้ไม่จำกัด
          </p>
        </div>

        {/* Skill Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "handover" as const, label: "🚗 ส่งมอบรถป้ายแดง (4 องก์)" },
            { id: "showroom" as const, label: "🏎️ รีวิวโชว์รูม (6 จังหวะ)" },
            { id: "ad_banner" as const, label: "🏷️ แบนเนอร์โปรโมชัน AIDA" },
            { id: "infographic" as const, label: "📊 สไลด์ Infographic 5 หน้า" },
            { id: "line_social" as const, label: "📱 LINE Flex & Social Poster" },
            { id: "custom" as const, label: "➕ เพิ่มแผนกใหม่ในอนาคต" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== "custom") setActiveCustomDept(null);
              }}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:bg-indigo-50/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Handover Video Director */}
        {activeTab === "handover" && (
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                🚗 สกิล Handover Video Director — กำกับคลิปพิธีส่งมอบรถยนต์ป้ายแดง 4 องก์
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                สร้างสตอรี่บอร์ด 4 องก์: เปิดตัวรถติดโบว์แดง ➔ มอบกุญแจและช่อดอกไม้ ➔ สัมผัสแรกหลังพวงมาลัย POV ➔ ขับออกรับแสง Golden Hour
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold mb-1">ชื่อรุ่นรถที่ส่งมอบ</label>
                <input
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1">สีรถ</label>
                <input
                  type="text"
                  value={carColor}
                  onChange={(e) => setCarColor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1">ชื่อลูกค้า / ครอบครัว</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1">ชื่อโชว์รูม / ทีมงาน</label>
                <input
                  type="text"
                  value={dealershipName}
                  onChange={(e) => setDealershipName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold mb-1">โปรโมชันปิดท้ายดึงลูกค้าใหม่</label>
                <input
                  type="text"
                  value={promoOffer}
                  onChange={(e) => setPromoOffer(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleRunHandoverSkill}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>เสกสตอรี่บอร์ดส่งมอบรถป้ายแดง 4 องก์ + Prompt Veo 3.1</span>
            </button>
          </div>
        )}

        {/* TAB 2: Showroom Reel Maker */}
        {activeTab === "showroom" && (
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                🏎️ สกิล Showroom Reel Maker — สูตรสำเร็จ 6 จังหวะรีวิวรถในโชว์รูม (15-30 วินาที)
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                0-3s ไฟหน้าหยุดนิ้ว ➔ 3-8s เส้นสาย & ล้อแม็กซ์ ➔ 8-14s ห้องโดยสาร POV ➔ 14-20s ฟังก์ชันลับ ➔ 20-25s ความกว้างขวาง ➔ 25-30s ป้ายโปร & CTA
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold mb-1">รุ่นรถที่รีวิวในโชว์รูม</label>
                <input
                  type="text"
                  value={showroomModel}
                  onChange={(e) => setShowroomModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1">ฟังก์ชันเด็ด (Star Tech)</label>
                <input
                  type="text"
                  value={showroomHighlight}
                  onChange={(e) => setShowroomHighlight(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1">ค่างวดผ่อนเริ่มต้นต่อวัน (บาท)</label>
                <input
                  type="text"
                  value={showroomDailyPay}
                  onChange={(e) => setShowroomDailyPay(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleRunShowroomSkill}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>สร้างสคริปต์รีวิวโชว์รูม 6 จังหวะ + ป้าย Stamp ราคา</span>
            </button>
          </div>
        )}

        {/* TAB 3: Ad Creative Banner */}
        {activeTab === "ad_banner" && (
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                🏷️ สกิล Ad Creative Generator & Microcopy Alchemist
              </h2>
              <p className="text-xs text-slate-500">
                เปลี่ยนโปรโมชันธรรมดาเป็นแบนเนอร์หยุดนิ้วตามสูตร AIDA พร้อมปุ่ม CTA ที่เพิ่มยอดทักแชท
              </p>
            </div>
            <input
              type="text"
              value={adTopic}
              onChange={(e) => setAdTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-sm"
            />
            <button
              type="button"
              onClick={handleRunAdBannerSkill}
              className="min-h-[42px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>สร้างชุดโฆษณา AIDA + ป้าย FOMO</span>
            </button>
          </div>
        )}

        {/* TAB 4: Infographic Composer */}
        {activeTab === "infographic" && (
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                📊 สกิล Infographic Composer — ย่อยเรื่องยากเป็นสไลด์ 5 หน้าอ่านจบใน 5 วิ
              </h2>
            </div>
            <input
              type="text"
              value={infoTopic}
              onChange={(e) => setInfoTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-sm"
            />
            <button
              type="button"
              onClick={handleRunInfographicSkill}
              className="min-h-[42px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>สร้างโครงสไลด์ Infographic 5 หน้าทันที</span>
            </button>
          </div>
        )}

        {/* TAB 5: LINE Autonomous Studio & Social Poster Engine */}
        {activeTab === "line_social" && (
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                LINE AGENT STUDIO + SOCIAL POSTER ENGINE
              </span>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                พรีวิวการ์ดอนุมัติงาน LINE Flex Message & ส่งออก 3 แพลตฟอร์ม
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                จำลองการ์ด LINE Flex Message สำหรับตรวจอนุมัติคอนเทนต์บนมือถือ พร้อมคัดลอกฟอร์แมตโพสต์สำหรับ Facebook Page, YouTube Shorts, และ TikTok
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = payload?.caption || activeHandoff?.caption || adTopic;
                    navigator.clipboard.writeText(text);
                    showToast("คัดลอกแคปชันพร้อมโพสต์ลง Facebook / TikTok / LINE แล้ว!", "success");
                  }}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ก๊อปข้อความส่งเข้า LINE / Facebook ทันที</span>
                </button>
              </div>
            </div>

            {/* Simulated LINE Flex Message Card */}
            <div className="max-w-xs mx-auto w-full rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-lg overflow-hidden">
              <div className="bg-[#06C755] text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between">
                <span>LINE Autonomous Content Studio</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">FLEX CARD</span>
              </div>
              <div className="p-4 space-y-2.5">
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {payload?.title || activeHandoff?.title || carModel}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-3">
                  {payload?.hook3Sec || activeHandoff?.hook3Sec || promoOffer}
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => showToast("อนุมัติโพสต์เรียบร้อย! คัดลอกแคปชันลงคลิปบอร์ดแล้ว", "success")}
                    className="w-full py-2 rounded-lg bg-[#06C755] text-white text-xs font-bold cursor-pointer"
                  >
                    🚀 อนุมัติโพสต์ (Approve & Dispatch)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("ad_banner")}
                    className="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    ✏️ ขอแคปชันใหม่ (Refine Copy)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Custom Future Department Builder */}
        {activeTab === "custom" && (
          <div className="space-y-5">
            {activeCustomDept ? (
              <div className="p-5 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-violet-600 text-white">
                      {activeCustomDept.badge}
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                      {activeCustomDept.name}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">{activeCustomDept.sublabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveCustomDept(null)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 text-xs font-bold cursor-pointer"
                  >
                    + สร้างแผนกใหม่อื่น
                  </button>
                </div>

                {activeCustomDept.mode === "external_app" && activeCustomDept.externalUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">ลิงก์ระบบภายนอก: {activeCustomDept.externalUrl}</span>
                      <a
                        href={activeCustomDept.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <span>เปิดในแท็บใหม่</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold">
                      สั่งงาน AI ในแผนก &ldquo;{activeCustomDept.name}&rdquo;:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={customInputPrompt}
                        onChange={(e) => setCustomInputPrompt(e.target.value)}
                        placeholder={`พิมพ์งานที่ต้องการให้แผนก ${activeCustomDept.name} ผลิต...`}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-sm"
                      />
                      <button
                        type="button"
                        disabled={generatingCustom}
                        onClick={handleRunCustomDeptAI}
                        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                      >
                        {generatingCustom ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        <span>ผลิตสคริปต์และฉากทันที</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    ➕ สร้างแผนกใหม่ / เพิ่มโปรเจกต์ในอนาคตเข้าสู่ HUB
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    เมื่อคุณสร้างโปรเจกต์ใหม่ในอนาคต สามารถนำมาเพิ่มไว้ใน HUB ได้ทันที ระบบจะเพิ่มปุ่มในเมนูซ้ายมือและในแผงส่งต่องานของหน้า OS ให้อัตโนมัติ
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold mb-1">ชื่อแผนก / โปรเจกต์ใหม่ *</label>
                    <input
                      type="text"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="เช่น สตูดิโอพอดแคสต์ AI, รีวิวอสังหาฯ..."
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold mb-1">คำอธิบายสั้นๆ</label>
                    <input
                      type="text"
                      value={newDeptSublabel}
                      onChange={(e) => setNewDeptSublabel(e.target.value)}
                      placeholder="เช่น คิดสคริปต์รีวิวบ้านและคอนโดหรู"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold mb-1">ป้ายกำกับ (Badge)</label>
                    <input
                      type="text"
                      value={newDeptBadge}
                      onChange={(e) => setNewDeptBadge(e.target.value)}
                      placeholder="เช่น PODCAST / REAL ESTATE"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold mb-1">
                      คำสั่ง AI ประจำแผนกนี้ (System Prompt / สูตรเฉพาะทาง)
                    </label>
                    <textarea
                      rows={2}
                      value={newDeptPrompt}
                      onChange={(e) => setNewDeptPrompt(e.target.value)}
                      placeholder="เช่น เน้นเล่าเรื่องสไตล์พอดแคสต์อบอุ่น มี 5 ช็อต พร้อมคำคมปิดท้าย..."
                      className="w-full p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold mb-1">
                      ลิงก์ Web App หรือ Google Flow Tool (ถ้ามีลิงก์ภายนอก)
                    </label>
                    <input
                      type="url"
                      value={newDeptUrl}
                      onChange={(e) => {
                        setNewDeptUrl(e.target.value);
                        if (e.target.value.trim()) setNewDeptMode("external_app");
                        else setNewDeptMode("ai_workspace");
                      }}
                      placeholder="https://... (เว้นว่างไว้หากต้องการใช้เป็นสตูดิโอ AI ใน HUB)"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateCustomDept}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>บันทึกและเพิ่มแผนกใหม่เข้าสู่ HUB ทันที</span>
                </button>
              </div>
            )}

            {/* Existing Custom Departments List */}
            {customDepartments.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  แผนกที่คุณสร้างเพิ่มไว้แล้ว ({customDepartments.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {customDepartments.map((d) => (
                    <div
                      key={d.id}
                      className="p-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveCustomDept(d)}
                        className="text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {d.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{d.sublabel}</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomDepartment(d.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                        title="ลบแผนกนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Output Storyboard & Handoff Bar */}
      {payload && (
        <section className="space-y-4 animate-fade-in-up">
          <DepartmentHandoffBar currentDeptId="skills-hub" payload={payload} />

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  AI DIRECTOR SKILL OUTPUT · {payload.scenes.length} SHOTS
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {payload.title}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {payload.scenes.map((scene) => (
                <div
                  key={scene.sceneNumber}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-[11px] font-bold">
                      SHOT {String(scene.sceneNumber).padStart(2, "0")}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                      {scene.onScreenText}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {scene.title}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 dark:border-zinc-700">
                    🔊 &ldquo;{scene.voiceoverThai}&rdquo;
                  </p>
                  <div className="p-2 rounded-lg bg-slate-900 text-emerald-300 font-mono text-[11px]">
                    {scene.visualPromptEn}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(scene.visualPromptEn);
                        setCopiedKey(`skill-${scene.sceneNumber}`);
                        showToast(`ก๊อป Prompt ช็อตที่ ${scene.sceneNumber} แล้ว!`, "success");
                        setTimeout(() => setCopiedKey(null), 1800);
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === `skill-${scene.sceneNumber}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
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
