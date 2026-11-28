"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ShoppingBag,
  Sparkles,
  Image as ImageIcon,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  Upload,
  BookOpen,
  Camera,
  ArrowRight,
  ExternalLink,
  Download,
  RotateCcw,
  UserCheck,
  HardDrive,
  Film,
  Layers
} from "lucide-react";
import { useHub, HubHandoffPayload, HubSceneItem } from "@/context/HubContext";
import { DepartmentHandoffBar } from "@/components/hub/DepartmentHandoffBar";
import { useToast } from "@/components/ui/ToastProvider";
import {
  saveEmbeddedFile,
  getEmbeddedFile,
  deleteEmbeddedFile,
  saveStudioState,
  loadStudioState
} from "@/lib/storage/persistent-media";

interface PromptVaultTemplate {
  id: string;
  category: "skincare" | "food" | "auto" | "gadgets" | "viral";
  categoryLabel: string;
  title: string;
  productName: string;
  priceBadge: string;
  mode: "AFFILIATE_5SHOT" | "VIRAL_STORY" | "PHOTO_PACK";
  hookThai: string;
  scenes: Array<{
    title: string;
    voiceoverThai: string;
    onScreenText: string;
    visualPromptEn: string;
    motionPromptEn: string;
  }>;
}

const MASTER_VAULT_TEMPLATES: PromptVaultTemplate[] = [
  {
    id: "vault-skincare-1",
    category: "skincare",
    categoryLabel: "✨ สกินแคร์ & ความงาม",
    title: "กันแดดเนื้อเซรั่ม ทากลางตลาดแดดแรง หน้าฉ่ำไม่วอก",
    productName: "เซรั่มกันแดดไฮยา SPF50+ PA++++",
    priceBadge: "ลด 50% เหลือ 199.- ส่งฟรี",
    mode: "AFFILIATE_5SHOT",
    hookThai: "แดดเมืองไทยแรงขนาดนี้ ทำไมแม่ค้าส้มตำหน้ายังฉ่ำใสไม่ไหลเยิ้ม? ดูตัวนี้เลย!",
    scenes: [
      {
        title: "ช็อต 01: Hook หยุดนิ้วกลางแดดจริง",
        voiceoverThai: "แดดเมืองไทยร้อนทะลุ 40 องศา แต่ทำไมหน้ายังฉ่ำใส ไม่เยิ้ม ไม่เป็นคราบเลยค่ะ?",
        onScreenText: "☀️ แดดแรงแค่ไหนก็ไม่กลัวเยิ้ม!",
        visualPromptEn:
          "[TOPIC LOCK: Sunscreen Serum Bottle] Cinematic 9:16 close-up of a cheerful Thai female creator in a bright outdoor morning market holding a sleek UV sunscreen serum bottle under golden sunlight, glowing dewy skin, photorealistic 8k, zero in-image text, zero unrelated objects",
        motionPromptEn: "Fast zoom-in to glowing skin and sunscreen bottle in hand, 60fps"
      },
      {
        title: "ช็อต 02: โชว์เนื้อสัมผัสเซรั่มแตกตัวเป็นน้ำ",
        voiceoverThai: "ความลับอยู่ที่กันแดดเนื้อเซรั่มหลอดนี้เลยค่ะ บีบออกมาบางเบา เกลี่ยปุ๊บซึมไวใน 3 วิ",
        onScreenText: "💧 เนื้อเซรั่มบางเบา ซึมไวใน 3 วิ",
        visualPromptEn:
          "[TOPIC LOCK: Sunscreen Serum Texture] Macro beauty shot of silky white UV sunscreen serum droplet spreading smoothly on clean skin, transforming into weightless translucent moisture, studio rim lighting, 8k macro",
        motionPromptEn: "Smooth macro pan across skin showing instant absorption"
      },
      {
        title: "ช็อต 03: ทดสอบความฉ่ำ & ไม่วอกไม่เทา",
        voiceoverThai: "ทาเทียบให้ดูชัดๆ ข้างที่ทาผิวดูโกลว์เล่นแสงทันที ไม่วอก ไม่ลอย แต่งหน้าทับติดทนทั้งวันค่ะ",
        onScreenText: "✨ ผิวโกลว์เล่นแสง ไม่วอก ไม่เทา",
        visualPromptEn:
          "[TOPIC LOCK: Glowing Skin Mirror Reflection] Medium close-up of Thai woman smiling into a vanity mirror touching her radiant dewy cheek with natural sunlight reflection, clean skincare aesthetic, 8k",
        motionPromptEn: "Slow dolly push-in toward mirror reflection with soft bokeh"
      },
      {
        title: "ช็อต 04: กันน้ำกันเหงื่อ พิสูจน์ชัดๆ",
        voiceoverThai: "จะเหงื่อออกหรือโดนน้ำก็ไม่หลุดเป็นคราบขาว ล็อกผิวสวยสู้แดดได้ตั้งแต่เช้าจรดเย็นค่ะ",
        onScreenText: "🛡️ กันน้ำ กันเหงื่อ SPF50+ PA++++",
        visualPromptEn:
          "[TOPIC LOCK: Waterproof Sunscreen Protection] High-speed macro shot of fine water mist beading cleanly on protected glowing skin beside the UV sunscreen serum bottle, golden sun flare, 8k commercial",
        motionPromptEn: "Slow-motion 120fps water droplets bouncing off protected skin"
      },
      {
        title: "ช็อต 05: โปรโมชัน FOMO & ชี้เป้าปักตะกร้า",
        voiceoverThai: "วันนี้มีโปรซื้อ 1 แถม 1 เหลือแค่ 199 ส่งฟรี! ของมีจำนวนจำกัด กดที่ตะกร้าเหลืองซ้ายล่างได้เลยค่ะ!",
        onScreenText: "🛒 ซื้อ 1 แถม 1 (199.-) กดตะกร้าซ้ายล่าง!",
        visualPromptEn:
          "[TOPIC LOCK: Sunscreen Packshot Offer] Hero commercial packshot of two sleek UV sunscreen serum bottles on a sunlit marble podium with water splash and botanical leaves, clean space for promo badge, 8k",
        motionPromptEn: "Cinematic hero orbit around the twin bottles settling on center frame"
      }
    ]
  },
  {
    id: "vault-food-1",
    category: "food",
    categoryLabel: "🍛 อาหารคลีน & ของกินขายดี",
    title: "ข้าวกล่องคลีนอกไก่นุ่ม 5 รสชาติ เวฟ 2 นาทีอร่อยเหมือนเชฟทำสด",
    productName: "เซ็ตข้าวกล่องคลีนอกไก่ซูวี 5 กล่อง",
    priceBadge: "เซ็ต 5 กล่อง 299.- ส่งฟรีรถเย็น",
    mode: "AFFILIATE_5SHOT",
    hookThai: "ใครบอกกินคลีนแล้วต้องทนกินอกไก่ฝืดคอ? ดูความฉ่ำของกล่องนี้ก่อน!",
    scenes: [
      {
        title: "ช็อต 01: Hook ฉีกภาพจำอกไก่ฝืดคอ",
        voiceoverThai: "ใครลดหุ่นแล้วท้อกับอกไก่แห้งๆ ฝืดคอ หยุดดูความฉ่ำของอกไก่ซูวีกล่องนี้ก่อนเลยครับ!",
        onScreenText: "🍗 อกไก่คลีนอะไร ทำไมฉ่ำขนาดนี้?!",
        visualPromptEn:
          "[TOPIC LOCK: Sous-Vide Chicken Clean Meal Box] Extreme macro food porn 9:16 shot of tender juicy sous-vide chicken breast being sliced with a fork, glistening savory herb jus, warm steam rising, 8k commercial food photography",
        motionPromptEn: "Slow-motion fork slicing juicy chicken breast with steam rising"
      },
      {
        title: "ช็อต 02: โชว์ความสะดวก เวฟ 2 นาทีพร้อมกิน",
        voiceoverThai: "แค่หยิบออกจากช่องฟรีซ เข้าไมโครเวฟ 2 นาที กลิ่นหอมฟุ้งเหมือนเชฟมาทำให้กินสดๆ ที่บ้านครับ",
        onScreenText: "⏱️ เวฟแค่ 2 นาที หอมอร่อยพร้อมทาน",
        visualPromptEn:
          "[TOPIC LOCK: Clean Meal Box Microwave Ready] Clean modern kitchen shot of a fitness creator opening a steaming healthy meal prep box with brown rice, sous-vide chicken, and bright broccoli, warm daylight, 8k",
        motionPromptEn: "Smooth tracking shot from microwave to kitchen counter reveal"
      },
      {
        title: "ช็อต 03: โชว์สารอาหาร โปรตีนแน่น แคลต่ำ",
        voiceoverThai: "หนึ่งกล่องได้โปรตีนเน้นๆ 38 กรัม แคลอรี่แค่ 320 แคล โซเดียมต่ำ ไม่บวมน้ำแน่นอนครับ",
        onScreenText: "💪 โปรตีน 38g · แค่ 320 Kcal!",
        visualPromptEn:
          "[TOPIC LOCK: High Protein Clean Meal Prep Set] Overhead flat-lay of 5 colorful healthy meal prep boxes arranged neatly on a wooden dining table, vibrant fresh ingredients, crisp commercial lighting, 8k",
        motionPromptEn: "Top-down slow crane rotation over the 5 meal boxes"
      },
      {
        title: "ช็อต 04: รีวิวรสชาติกินง่ายไม่จำเจ",
        voiceoverThai: "มีให้เลือกถึง 5 รสชาติ ทั้งกะเพราคลีน เทอริยากิ พริกไทยดำ กินวนได้ทั้งอาทิตย์ไม่มีเบื่อครับ",
        onScreenText: "😋 5 รสชาติสุดเข้มข้น กินคลีนไม่มีเบื่อ",
        visualPromptEn:
          "[TOPIC LOCK: Fit Creator Enjoying Clean Meal] Medium close-up of athletic Thai creator taking a delicious bite of clean chicken rice box with genuine delighted expression, bright lifestyle condo dining room, 8k",
        motionPromptEn: "Natural handheld push-in capturing authentic taste reaction"
      },
      {
        title: "ช็อต 05: ปิดการขายเซ็ตสุดคุ้มส่งรถเย็น",
        voiceoverThai: "จัดเซ็ตทดลอง 5 กล่องวันนี้เพียง 299 บาท ส่งฟรีรถควบคุมอุณหภูมิถึงหน้าบ้าน กดตะกร้าซ้ายล่างเลยครับ!",
        onScreenText: "🛒 เซ็ต 5 กล่อง 299.- ส่งฟรีรถเย็น!",
        visualPromptEn:
          "[TOPIC LOCK: 5 Clean Meal Boxes Stack Promo] Hero commercial shot of 5 sealed clean food containers stacked neatly with fresh herbs and chilled mist effect, clean background for price badge, 8k",
        motionPromptEn: "Dynamic push-in to the 5-box bundle with subtle light sweep"
      }
    ]
  },
  {
    id: "vault-gadgets-1",
    category: "gadgets",
    categoryLabel: "🎣 อุปกรณ์ตกปลา & แกตเจ็ต",
    title: "รอกหยดน้ำ PP Fishing ตีไกลไม่ฟู่ เบรคหนักงัดชะโดสบาย",
    productName: "รอกหยดน้ำ PP Fishing รุ่น Pro Carbon",
    priceBadge: "ลดล้างสต็อก 590.- แถมสาย PE ฟรี!",
    mode: "AFFILIATE_5SHOT",
    hookThai: "ตีเหยื่อสวนลมยังไงก็ไม่ฟู่! น้าๆ นักตกปลาดูระบบหน่วงแม่เหล็กตัวนี้เลย",
    scenes: [
      {
        title: "ช็อต 01: Hook ตีเหยื่อสวนลมพุ่งไกลไม่ฟู่",
        voiceoverThai: "น้าคนไหนเจอปัญหาตีเหยื่อสวนลมแล้วสายฟู่ทุกไม้ มาดูรอกหยดน้ำ PP Fishing ตัวนี้ก่อนเลยครับ!",
        onScreenText: "🎣 ตีสวนลมพุ่งไกล สายไม่ฟู่!",
        visualPromptEn:
          "[TOPIC LOCK: Baitcasting Fishing Reel Casting] Action close-up 9:16 shot of an angler casting a sleek carbon-black baitcasting fishing reel at golden sunrise by a Thai reservoir, braided line flying smoothly with water droplets, 8k",
        motionPromptEn: "High-speed 120fps slow-motion cast following the spinning spool"
      },
      {
        title: "ช็อต 02: เจาะดีเทลบอดี้คาร์บอน & ลูกปืนลื่นหัวแตก",
        voiceoverThai: "บอดี้คาร์บอนน้ำหนักเบา จับถนัดมือ มาพร้อมลูกปืนสแตนเลสกันสนิม หมุนลื่นสมูทสุดๆ ครับ",
        onScreenText: "⚙️ บอดี้คาร์บอนเบาหวิว ลูกปืนกันสนิม",
        visualPromptEn:
          "[TOPIC LOCK: Carbon Baitcasting Reel Macro] Extreme macro product shot of a matte carbon-fiber baitcasting fishing reel with anodized gold spool spinning effortlessly, morning lake bokeh, 8k commercial",
        motionPromptEn: "Slow macro orbit showcasing carbon texture and spinning spool"
      },
      {
        title: "ช็อต 03: ทดสอบระบบหน่วงแม่เหล็ก 10 เม็ด",
        voiceoverThai: "ระบบหน่วงแม่เหล็กปรับละเอียด คุมสปูลนิ่งกริบ จะเหยื่อเบาหรือเหยื่อหนักก็ส่งได้สุดสายครับ",
        onScreenText: "🧲 หน่วงแม่เหล็กคุมนิ่ง ตีเหยื่อเบาได้จริง",
        visualPromptEn:
          "[TOPIC LOCK: Fishing Reel Magnetic Brake Dial] Close-up of angler fingers adjusting the precision magnetic brake dial on the side plate of the baitcasting reel, crisp metallic detail, 8k",
        motionPromptEn: "Rack focus from angler fingers to precision brake dial"
      },
      {
        title: "ช็อต 04: ทดสอบเบรคหนัก งัดปลาใหญ่",
        voiceoverThai: "กำลังเบรคสูงสุด 8 กิโลกรัม อัดชะโดหรือกระพงใหญ่ได้อยู่หมัด เบรคเนียนไม่สะดุดครับ",
        onScreenText: "🐟 เบรคหนัก 8 KG งัดชะโดอยู่หมัด!",
        visualPromptEn:
          "[TOPIC LOCK: Angler Fighting Big Fish with Baitcaster] Dynamic low-angle shot of angler bending a fishing rod heavily while reeling in a powerful strike at the lake edge, water splash in sunlight, 8k",
        motionPromptEn: "Energetic handheld action tracking the bent rod and reel"
      },
      {
        title: "ช็อต 05: โปรแถมสาย PE & ชี้เป้าตะกร้า",
        voiceoverThai: "โปรวันนี้เหลือเพียง 590 บาท แถมฟรีสาย PE ถัก 4 อีก 1 ม้วน รีบกดที่ตะกร้าซ้ายล่างก่อนของหมดครับ!",
        onScreenText: "🛒 590.- แถมสาย PE ฟรี! กดตะกร้าเลย",
        visualPromptEn:
          "[TOPIC LOCK: Baitcasting Reel and Braided Line Gift Pack] Hero commercial display of the carbon baitcasting fishing reel resting on a weathered wooden dock beside a bonus spool of braided PE line, sunrise glow, 8k",
        motionPromptEn: "Cinematic push-in hero shot with golden rim light"
      }
    ]
  },
  {
    id: "vault-auto-1",
    category: "auto",
    categoryLabel: "🚗 โชว์รูมรถ & ส่งมอบรถใหม่",
    title: "โปรออกรถใหม่ฟรีดาวน์ 0 บาท ผ่อนสบาย พร้อมชุดแต่งรอบคัน",
    productName: "แคมเปญออกรถใหม่ ฟรีดาวน์ 0 บาท ชุดแต่งครบ",
    priceBadge: "ฟรีดาวน์ 0.- · ดอกเบี้ยพิเศษ · ส่งรถถึงบ้าน",
    mode: "VIRAL_STORY",
    hookThai: "มีงบ 0 บาท ออกรถป้ายแดงพร้อมชุดแต่งรอบคันได้จริงไหม? คลิปนี้มีคำตอบ!",
    scenes: [
      {
        title: "ช็อต 01: Hook เปิดผ้าคลุมรถป้ายแดงพร้อมโบว์ยักษ์",
        voiceoverThai: "งบดาวน์ 0 บาท แต่อยากได้รถป้ายแดงพร้อมชุดแต่งจัดเต็มรอบคัน มาดูคันจริงที่โชว์รูมวันนี้เลยครับ!",
        onScreenText: "🎀 ฟรีดาวน์ 0 บาท ได้ชุดแต่งครบแบบนี้เลย!",
        visualPromptEn:
          "[TOPIC LOCK: New Car Showroom Red Bow Reveal] Vertical 9:16 cinematic shot of a gleaming modern SUV in a luxury showroom with a giant red satin handover bow on the hood, dramatic ceiling LED reflections, 8k",
        motionPromptEn: "Low-angle gimbal glide revealing the front grille and red bow"
      },
      {
        title: "ช็อต 02: โชว์ไฟหน้า Matrix LED & ล้อแม็กชุดแต่ง",
        voiceoverThai: "ได้ทั้งกระจังหน้าสปอร์ต ไฟหน้า LED เต็มระบบ พร้อมล้ออัลลอยและชุดสเกิร์ตรอบคันตั้งแต่วันรับรถครับ",
        onScreenText: "✨ ชุดแต่งสปอร์ตรอบคัน + ล้ออัลลอยแท้",
        visualPromptEn:
          "[TOPIC LOCK: Modern Car Matrix LED Headlight Detail] Close-up commercial shot of modern matrix LED headlights illuminating and sporty alloy wheel rim on polished showroom floor, 8k",
        motionPromptEn: "Dynamic pan from glowing LED headlight down to alloy wheel"
      },
      {
        title: "ช็อต 03: พาชมภายในห้องโดยสารสุดล้ำ",
        voiceoverThai: "ภายในกว้างขวาง เบาะหนังพรีเมียม หน้าจอทัชสกรีนขนาดใหญ่ เชื่อมต่อสมาร์ทโฟนไร้สายครบครันครับ",
        onScreenText: "🛋️ ภายในหรูหรา จอใหญ่ ออปชันล้นคัน",
        visualPromptEn:
          "[TOPIC LOCK: Luxury Car Cockpit Interior POV] First-person POV sitting in the driver seat of a modern car with leather steering wheel, panoramic infotainment screen, ambient cabin lighting, 8k",
        motionPromptEn: "Smooth interior pan across dashboard and leather seats"
      },
      {
        title: "ช็อต 04: บรรยากาศส่งมอบรถสุดประทับใจ",
        voiceoverThai: "ดันทุกเคส ช่วยทุกอาชีพ อนุมัติไว มีบริการไฟแนนซ์เซ็นถึงที่และสไลด์ส่งรถถึงหน้าบ้านทั่วไทยครับ",
        onScreenText: "✅ ช่วยทุกคัน ดันทุกเคส ส่งรถฟรีทั่วไทย",
        visualPromptEn:
          "[TOPIC LOCK: Happy Thai Family Car Handover Ceremony] Joyful Thai family receiving a large ceremonial car key from a professional sales consultant beside their new car with bouquet of flowers, warm showroom lighting, 8k",
        motionPromptEn: "Slow-motion celebratory moment with warm lens flare"
      },
      {
        title: "ช็อต 05: CTA ทักแชทจองสิทธิ์โปรพิเศษ",
        voiceoverThai: "โควต้าฟรีดาวน์พร้อมชุดแต่งมีจำนวนจำกัด सिर्फ 5 คันในเดือนนี้ ทักแชทหรือกดลิงก์หน้าโปรไฟล์ได้เลยครับ!",
        onScreenText: "📲 จองสิทธิ์ฟรีดาวน์วันนี้ ทักแชทเลย!",
        visualPromptEn:
          "[TOPIC LOCK: New Car Golden Hour Drive Off] Cinematic rear three-quarter view of the new SUV driving smoothly out of the showroom bay into golden hour sunset light, 8k automotive commercial",
        motionPromptEn: "Smooth tracking shot as the car drives toward golden sunset"
      }
    ]
  }
];

function enforcePoliteParticle(text: string, particle: "ครับ" | "ค่ะ"): string {
  if (!text) return "";
  let cleaned = text
    .replace(/ครับ\s*\/\s*ค่ะ/g, particle)
    .replace(/ค่ะ\s*\/\s*ครับ/g, particle)
    .replace(/ครับผม/g, particle === "ครับ" ? "ครับผม" : "นะคะ");

  if (particle === "ครับ") {
    cleaned = cleaned.replace(/นะคะ/g, "นะครับ").replace(/ค่ะ/g, "ครับ").replace(/คะ/g, "ครับ");
  } else {
    cleaned = cleaned.replace(/นะครับ/g, "นะคะ").replace(/ครับ/g, "ค่ะ");
  }
  return cleaned;
}

export default function AffiliateStudioPage() {
  const { activeHandoff, setActiveHandoff, saveToVault } = useHub();
  const { showToast } = useToast();

  const [productName, setProductName] = useState("");
  const [priceBadge, setPriceBadge] = useState("ลดพิเศษ 50% · ส่งฟรีวันนี้");
  const [sellingPoints, setSellingPoints] = useState("");
  const [studioMode, setStudioMode] = useState<"AFFILIATE_5SHOT" | "VIRAL_STORY" | "PHOTO_PACK">("AFFILIATE_5SHOT");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "4:5" | "16:9">("9:16");
  const [sceneCount, setSceneCount] = useState<number>(5);
  const [politeParticle, setPoliteParticle] = useState<"ครับ" | "ค่ะ">("ค่ะ");

  const [productRefImage, setProductRefImage] = useState<string>("");
  const [productFileName, setProductFileName] = useState<string>("");
  const [modelRefImage, setModelRefImage] = useState<string>("");
  const [modelFileName, setModelFileName] = useState<string>("");
  const [selectedVaultCategory, setSelectedVaultCategory] = useState<string>("all");

  const [generating, setGenerating] = useState(false);
  const [payload, setPayload] = useState<HubHandoffPayload | null>(null);
  const [imgBusyScene, setImgBusyScene] = useState<number | null>(null);
  const [ttsBusyScene, setTtsBusyScene] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  const productInputRef = useRef<HTMLInputElement | null>(null);
  const modelInputRef = useRef<HTMLInputElement | null>(null);

  // Restore embedded images & studio state from IndexedDB on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const savedState = await loadStudioState<any>("affiliate");
        if (mounted && savedState) {
          if (savedState.productName !== undefined) setProductName(savedState.productName);
          if (savedState.priceBadge !== undefined) setPriceBadge(savedState.priceBadge);
          if (savedState.sellingPoints !== undefined) setSellingPoints(savedState.sellingPoints);
          if (savedState.studioMode) setStudioMode(savedState.studioMode);
          if (savedState.aspectRatio) setAspectRatio(savedState.aspectRatio);
          if (savedState.sceneCount) setSceneCount(Number(savedState.sceneCount));
          if (savedState.politeParticle) setPoliteParticle(savedState.politeParticle);
          if (savedState.payload) setPayload(savedState.payload);
        }

        const savedProdImg = await getEmbeddedFile("aff-product-img");
        if (mounted && savedProdImg) {
          setProductFileName(savedProdImg.name);
          const reader = new FileReader();
          reader.onload = () => {
            if (mounted) setProductRefImage(String(reader.result || ""));
          };
          reader.readAsDataURL(savedProdImg.blob);
        }

        const savedModelImg = await getEmbeddedFile("aff-model-img");
        if (mounted && savedModelImg) {
          setModelFileName(savedModelImg.name);
          const reader = new FileReader();
          reader.onload = () => {
            if (mounted) setModelRefImage(String(reader.result || ""));
          };
          reader.readAsDataURL(savedModelImg.blob);
        }
      } catch (e) {
        console.warn("Restore affiliate studio state warning:", e);
      } finally {
        if (mounted) setIsRestored(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-save studio state to IndexedDB whenever fields change
  useEffect(() => {
    if (!isRestored) return;
    saveStudioState("affiliate", {
      productName,
      priceBadge,
      sellingPoints,
      studioMode,
      aspectRatio,
      sceneCount,
      politeParticle,
      payload
    });
  }, [
    isRestored,
    productName,
    priceBadge,
    sellingPoints,
    studioMode,
    aspectRatio,
    sceneCount,
    politeParticle,
    payload
  ]);

  // Sync incoming handoff from OS if board is empty
  useEffect(() => {
    if (isRestored && activeHandoff && !payload) {
      setPayload(activeHandoff);
      setProductName(activeHandoff.productInfo?.productName || activeHandoff.title || activeHandoff.topic);
      if (activeHandoff.productInfo?.price) setPriceBadge(activeHandoff.productInfo.price);
    }
  }, [isRestored, activeHandoff, payload]);

  // Dynamically synced Single Master Prompt computed directly from current shots
  const singleMasterPrompt = useMemo(() => {
    if (!payload || !payload.scenes || payload.scenes.length === 0) return "";
    const modeLabel =
      studioMode === "PHOTO_PACK"
        ? `4:5 LIFESTYLE & PRODUCT PHOTO SET (${payload.scenes.length} SHOTS)`
        : `9:16 VERTICAL VIRAL / AFFILIATE VIDEO (${payload.scenes.length} SHOTS)`;
    const lines = [
      `=== PKSHORTCLIPS CINEBOARD 4.0 · SINGLE MASTER PROMPT ===`,
      `PROJECT: ${payload.title}`,
      `MODE: ${modeLabel} | ASPECT RATIO: ${aspectRatio} | POLITE PARTICLE: ${politeParticle}`,
      `PRODUCT LOCK: ${productName || payload.topic} | PROMO: ${priceBadge}`,
      productFileName ? `PRODUCT REFERENCE IMAGE: [Attached: ${productFileName}]` : null,
      modelFileName ? `MODEL FACE REFERENCE IMAGE: [Attached: ${modelFileName}]` : null,
      `=========================================================`,
      ...payload.scenes.map(
        (s) =>
          `[SHOT ${String(s.sceneNumber).padStart(2, "0")} | ${s.timecode || "3s"}] ${s.title}\n` +
          `• Visual Prompt (EN): ${s.visualPromptEn}\n` +
          `• Camera/Motion (EN): ${s.motionPromptEn}\n` +
          `• บทพากย์ไทย (${politeParticle}): "${enforcePoliteParticle(s.voiceoverThai, politeParticle)}"\n` +
          `• ข้อความบนจอ: "${s.onScreenText}"`
      )
    ].filter(Boolean);
    return lines.join("\n\n");
  }, [payload, studioMode, aspectRatio, politeParticle, productName, priceBadge, productFileName, modelFileName]);

  const handleProductPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await saveEmbeddedFile("aff-product-img", file, file.name);
    setProductFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setProductRefImage(String(reader.result || ""));
      showToast(`ฝังรูปสินค้า "${file.name}" ลงระบบถาวรแล้ว (สลับหน้า/รีเฟรชไม่หาย)`, "success");
    };
    reader.readAsDataURL(file);
  };

  const handleModelPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await saveEmbeddedFile("aff-model-img", file, file.name);
    setModelFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setModelRefImage(String(reader.result || ""));
      showToast(`ฝังรูปนายแบบ/นางแบบ "${file.name}" ลงระบบถาวรแล้ว!`, "success");
    };
    reader.readAsDataURL(file);
  };

  const handleSwitchPoliteParticle = (nextParticle: "ครับ" | "ค่ะ") => {
    setPoliteParticle(nextParticle);
    if (payload) {
      const updatedScenes = payload.scenes.map((s) => ({
        ...s,
        voiceoverThai: enforcePoliteParticle(s.voiceoverThai, nextParticle)
      }));
      const nextPayload: HubHandoffPayload = {
        ...payload,
        scenes: updatedScenes,
        fullScriptThai: updatedScenes.map((s) => s.voiceoverThai).join(" "),
        updatedAt: new Date().toISOString()
      };
      setPayload(nextPayload);
      setActiveHandoff(nextPayload);
      showToast(`ปรับคำลงท้ายทุกช็อตเป็น "${nextParticle}" ล้วนเรียบร้อย!`, "success");
    }
  };

  const handleNewProject = async () => {
    setProductName("");
    setPriceBadge("ลดพิเศษ 50% · ส่งฟรีวันนี้");
    setSellingPoints("");
    setPayload(null);
    setProductRefImage("");
    setProductFileName("");
    setModelRefImage("");
    setModelFileName("");
    await deleteEmbeddedFile("aff-product-img");
    await deleteEmbeddedFile("aff-model-img");
    await saveStudioState("affiliate", null);
    showToast("ล้างกระดานเริ่มโปรเจกต์ปักตะกร้าใหม่เรียบร้อย!", "info");
  };

  const handleExportProjectFile = (ext: "txt" | "json") => {
    if (!payload) return;
    const safeTitle = (productName || payload.title || "pkshortclips").replace(/[^a-zA-Z0-9ก-๙_-]/g, "_");
    const content =
      ext === "json"
        ? JSON.stringify({ ...payload, singleMasterPrompt }, null, 2)
        : singleMasterPrompt;
    const blob = new Blob([content], {
      type: ext === "json" ? "application/json;charset=utf-8" : "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeTitle}_CineBoard_${payload.scenes.length}shots.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`ดาวน์โหลดไฟล์ .${ext.toUpperCase()} เรียบร้อยแล้ว!`, "success");
  };

  const handleLoadVaultTemplate = (tpl: PromptVaultTemplate) => {
    setProductName(tpl.productName);
    setPriceBadge(tpl.priceBadge);
    setStudioMode(tpl.mode);
    setSceneCount(tpl.scenes.length);
    const mappedScenes: HubSceneItem[] = tpl.scenes.map((s, idx) => ({
      sceneNumber: idx + 1,
      title: s.title,
      durationSec: 3,
      timecode: `00:${String(idx * 3).padStart(2, "0")} - 00:${String((idx + 1) * 3).padStart(2, "0")}`,
      voiceoverThai: enforcePoliteParticle(s.voiceoverThai, politeParticle),
      onScreenText: s.onScreenText,
      visualPromptEn: s.visualPromptEn,
      motionPromptEn: s.motionPromptEn,
      cameraAngle: "Commercial Product Shot"
    }));

    const newPayload: HubHandoffPayload = {
      id: `aff-${Date.now()}`,
      title: tpl.title,
      topic: tpl.productName,
      aspectRatio: aspectRatio === "4:5" ? "9:16" : aspectRatio,
      hook3Sec: enforcePoliteParticle(tpl.hookThai, politeParticle),
      concept: `สูตรสำเร็จจากคลัง Prompt Vault: ${tpl.title}`,
      fullScriptThai: mappedScenes.map((s) => s.voiceoverThai).join(" "),
      scenes: mappedScenes,
      productInfo: {
        productName: tpl.productName,
        price: tpl.priceBadge,
        promoBadge: tpl.priceBadge,
        referenceImageUrl: productRefImage
      },
      caption: `🔥 ${tpl.title}\n💰 ${tpl.priceBadge}\n\n${mappedScenes
        .map((s) => `✅ ${s.voiceoverThai}`)
        .join("\n")}\n\n🛒 พิกัดสั่งซื้อ กดที่ตะกร้าเหลืองซ้ายล่างได้เลย${politeParticle}!`,
      hashtags: ["#ปักตะกร้า", "#TikTokShop", "#รีวิวของดี", "#ป้ายยา", "#PKShortClips"],
      sourceDept: "affiliate",
      updatedAt: new Date().toISOString()
    };

    setPayload(newPayload);
    setActiveHandoff(newPayload);
    saveToVault({
      id: newPayload.id,
      title: newPayload.title,
      department: "affiliate",
      departmentLabel: "SHOP & AFFILIATE",
      aspectRatio: newPayload.aspectRatio,
      payload: newPayload
    });
    showToast(`โหลดสูตร "${tpl.title}" เข้ากระดานเรียบร้อย!`, "success");
  };

  const handleGenerateAffiliateScript = async () => {
    const cleanName = productName.trim();
    if (!cleanName) {
      showToast(`กรุณาระบุชื่อสินค้าหรือบริการที่ต้องการทำคลิปขายของก่อน${politeParticle}`, "info");
      return;
    }

    setGenerating(true);
    try {
      const modeDesc =
        studioMode === "AFFILIATE_5SHOT"
          ? `สูตรคลิปปักตะกร้า TikTok Shop ปิดการขาย ${sceneCount} ช็อต (Hook ปัญหา -> โชว์สินค้า -> สาธิตใช้งาน -> ผลลัพธ์ Before/After -> โปรโมชัน FOMO ชี้เป้าปักตะกร้าซ้ายล่าง)`
          : studioMode === "VIRAL_STORY"
          ? `สูตร Viral ละครสั้นหักมุมขายของเนียนๆ ${sceneCount} ช็อต สไตล์คลิปไวรัลคนไทยชอบแชร์`
          : `เซ็ตภาพนิ่งไลฟ์สไตล์และสินค้า Master Packshot 4:5 จำนวน ${sceneCount} ภาพ`;

      const res = await fetch("/api/ai/easy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE",
          prompt: `[PKShortClips CineBoard 4.0: ${modeDesc}] สินค้า: ${cleanName} | โปรโมชัน/ราคา: ${priceBadge} | จุดเด่นเพิ่มเติม: ${sellingPoints} | คำลงท้ายบังคับใช้คำว่า "${politeParticle}" เท่านั้น (ห้ามใช้ "ครับ/ค่ะ" เด็ดขาด)`,
          format: studioMode === "PHOTO_PACK" ? "IMAGE" : "VIDEO",
          aiMode: "AI_FLOW",
          aspectRatio: aspectRatio === "4:5" ? "9:16" : aspectRatio,
          contentGoal: studioMode === "VIRAL_STORY" ? "VIRAL_POV" : "COMMERCIAL",
          sceneCount: String(sceneCount)
        })
      });

      const data = await res.json().catch(() => ({}));
      const bp = data?.blueprint;

      if (res.ok && bp?.video_blueprint?.scenes?.length > 0) {
        const rawScenes = bp.video_blueprint.scenes;
        const mappedScenes: HubSceneItem[] = Array.from({ length: sceneCount }).map((_, idx) => {
          const s = rawScenes[idx] || rawScenes[idx % rawScenes.length] || {};
          return {
            sceneNumber: idx + 1,
            title: s.scene_role || s.what_to_shoot || `ช็อตขายของที่ ${idx + 1}`,
            durationSec: s.duration_sec || 3,
            timecode: `00:${String(idx * 3).padStart(2, "0")} - 00:${String((idx + 1) * 3).padStart(2, "0")}`,
            voiceoverThai: enforcePoliteParticle(
              s.voiceover_text || `ช็อตที่ ${idx + 1} โชว์จุดเด่นของ ${cleanName} ${sellingPoints} ${politeParticle}`,
              politeParticle
            ),
            onScreenText:
              s.on_screen_text || (idx === sceneCount - 1 ? `🛒 ${priceBadge}` : `✨ ${cleanName}`),
            visualPromptEn: `[TOPIC LOCK: ${cleanName}] ${
              s.flow_prompt || `Commercial ${aspectRatio} product shot ${idx + 1} of ${cleanName}`
            }${modelFileName ? ", featuring consistent model face from reference" : ""}, zero in-image text, zero unrelated objects`,
            motionPromptEn:
              studioMode === "PHOTO_PACK"
                ? "Still 4:5 editorial lifestyle photography, sharp focus, 8k"
                : s.camera_angle || "Smooth commercial product camera movement, 4k 60fps"
          };
        });

        const newPayload: HubHandoffPayload = {
          id: `aff-${Date.now()}`,
          title: `${cleanName} (${priceBadge})`,
          topic: cleanName,
          aspectRatio: aspectRatio === "4:5" ? "9:16" : aspectRatio,
          hook3Sec: enforcePoliteParticle(bp.hook_3sec || mappedScenes[0]?.voiceoverThai || "", politeParticle),
          concept: bp.concept || modeDesc,
          fullScriptThai: mappedScenes.map((s) => s.voiceoverThai).join(" "),
          scenes: mappedScenes,
          productInfo: {
            productName: cleanName,
            price: priceBadge,
            promoBadge: priceBadge,
            referenceImageUrl: productRefImage
          },
          caption: enforcePoliteParticle(
            bp.social_caption || `🔥 ${cleanName} — ${priceBadge}\nกดสั่งที่ตะกร้าซ้ายล่างได้เลย${politeParticle}!`,
            politeParticle
          ),
          hashtags: bp.hashtags || ["#ปักตะกร้า", "#TikTokShop", "#รีวิวของดี"],
          sourceDept: "affiliate",
          updatedAt: new Date().toISOString()
        };

        setPayload(newPayload);
        setActiveHandoff(newPayload);
        saveToVault({
          id: newPayload.id,
          title: newPayload.title,
          department: "affiliate",
          departmentLabel: "SHOP & AFFILIATE",
          aspectRatio: newPayload.aspectRatio,
          payload: newPayload
        });
        showToast(`สร้างสตอรี่บอร์ดขายของ ${mappedScenes.length} ช็อตเรียบร้อย!`, "success");
      } else {
        const roles = [
          "ช็อต 01: Hook หยุดนิ้ว & ชี้ปัญหา",
          "ช็อต 02: เปิดตัวพระเอก (โชว์สินค้าชัดๆ)",
          "ช็อต 03: สาธิตการใช้งาน & เนื้อสัมผัสจริง",
          "ช็อต 04: พิสูจน์ผลลัพธ์ Before / After",
          "ช็อต 05: โปรโมชัน FOMO & ชี้เป้าปักตะกร้าซ้ายล่าง"
        ];
        const fallbackScenes: HubSceneItem[] = Array.from({ length: sceneCount }).map((_, idx) => ({
          sceneNumber: idx + 1,
          title:
            idx === sceneCount - 1
              ? `ช็อต ${String(idx + 1).padStart(2, "0")}: โปรโมชัน FOMO & ชี้เป้าปักตะกร้า`
              : roles[idx] || `ช็อต ${String(idx + 1).padStart(2, "0")}: เจาะจุดเด่นสินค้า & ไลฟ์สไตล์การใช้งาน`,
          durationSec: 3,
          timecode: `00:${String(idx * 3).padStart(2, "0")} - 00:${String((idx + 1) * 3).padStart(2, "0")}`,
          voiceoverThai: enforcePoliteParticle(
            idx === 0
              ? `ใครกำลังมองหา ${cleanName} ที่คุ้มที่สุดในตอนนี้ หยุดดูคลิปนี้ก่อนเลย${politeParticle}!`
              : idx === sceneCount - 1
              ? `วันนี้จัดโปร ${priceBadge} ของมีจำนวนจำกัด กดที่ตะกร้าเหลืองซ้ายล่างได้เลย${politeParticle}!`
              : `จุดเด่นช็อตที่ ${idx + 1} ของ ${cleanName} คือ ${
                  sellingPoints || "คุณภาพเกรดพรีเมียม ใช้งานง่าย เห็นผลชัดเจนตั้งแต่วันแรก"
                }${politeParticle}`,
            politeParticle
          ),
          onScreenText:
            idx === 0
              ? `🔥 ห้ามพลาด! ${cleanName}`
              : idx === sceneCount - 1
              ? `🛒 ${priceBadge} · กดตะกร้าซ้ายล่าง!`
              : `✨ ${cleanName} (ช็อต ${idx + 1}/${sceneCount})`,
          visualPromptEn: `[TOPIC LOCK: ${cleanName}] High-converting commercial 8K shot ${idx + 1} of ${sceneCount} featuring ${cleanName}, studio lighting, crisp product focus, ${aspectRatio} framing, zero in-image text, zero watches, zero unrelated objects`,
          motionPromptEn:
            studioMode === "PHOTO_PACK"
              ? "Editorial 4:5 still photography, crisp commercial depth of field"
              : "Dynamic commercial dolly push-in at 60fps"
        }));

        const fbPayload: HubHandoffPayload = {
          id: `aff-${Date.now()}`,
          title: `${cleanName} (${priceBadge})`,
          topic: cleanName,
          aspectRatio: aspectRatio === "4:5" ? "9:16" : aspectRatio,
          hook3Sec: fallbackScenes[0].voiceoverThai,
          concept: modeDesc,
          fullScriptThai: fallbackScenes.map((s) => s.voiceoverThai).join(" "),
          scenes: fallbackScenes,
          productInfo: {
            productName: cleanName,
            price: priceBadge,
            promoBadge: priceBadge,
            referenceImageUrl: productRefImage
          },
          caption: `🔥 ${cleanName}\n💥 โปรพิเศษ: ${priceBadge}\n\n${fallbackScenes
            .map((s) => `• ${s.voiceoverThai}`)
            .join("\n")}\n\n🛒 กดสั่งที่ตะกร้าซ้ายล่างได้เลย${politeParticle}!`,
          hashtags: ["#ปักตะกร้า", "#TikTokShop", "#ป้ายยา", "#รีวิวของดี"],
          sourceDept: "affiliate",
          updatedAt: new Date().toISOString()
        };

        setPayload(fbPayload);
        setActiveHandoff(fbPayload);
        saveToVault({
          id: fbPayload.id,
          title: fbPayload.title,
          department: "affiliate",
          departmentLabel: "SHOP & AFFILIATE",
          aspectRatio: fbPayload.aspectRatio,
          payload: fbPayload
        });
        showToast(`สร้างสตอรี่บอร์ดปักตะกร้าครบ ${sceneCount} ช็อตเรียบร้อยแล้ว!`, "success");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateScene = (sceneNumber: number, field: keyof HubSceneItem, val: string) => {
    if (!payload) return;
    const cleanVal = field === "voiceoverThai" ? enforcePoliteParticle(val, politeParticle) : val;
    const nextScenes = payload.scenes.map((s) =>
      s.sceneNumber === sceneNumber ? { ...s, [field]: cleanVal } : s
    );
    const nextPayload: HubHandoffPayload = {
      ...payload,
      scenes: nextScenes,
      fullScriptThai: nextScenes.map((s) => s.voiceoverThai).join(" "),
      updatedAt: new Date().toISOString()
    };
    setPayload(nextPayload);
    setActiveHandoff(nextPayload);
  };

  const handleGenImage = async (scene: HubSceneItem) => {
    setImgBusyScene(scene.sceneNumber);
    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: scene.visualPromptEn,
          aspectRatio: aspectRatio === "4:5" ? "9:16" : aspectRatio
        })
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        handleUpdateScene(scene.sceneNumber, "imageUrl", data.imageUrl);
        showToast(`เจนภาพสินค้าช็อตที่ ${scene.sceneNumber} สำเร็จ!`, "success");
      }
    } catch {
      showToast("เจนภาพไม่สำเร็จ กรุณาลองใหม่", "error");
    } finally {
      setImgBusyScene(null);
    }
  };

  const handleGenVoice = async (scene: HubSceneItem) => {
    if (!scene.voiceoverThai.trim()) return;
    setTtsBusyScene(scene.sceneNumber);
    try {
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scene.voiceoverThai,
          voiceId: politeParticle === "ครับ" ? "ErXwobaYiN019PkySvjV" : "EXAVITQu4vr4xnSDxMaL",
          mode: "generate_single"
        })
      });
      const data = await res.json();
      if (res.ok && data.audioBase64) {
        handleUpdateScene(scene.sceneNumber, "audioUrl", `data:audio/mpeg;base64,${data.audioBase64}`);
        showToast(`พากย์เสียงขายของช็อตที่ ${scene.sceneNumber} สำเร็จ!`, "success");
      }
    } catch {
      showToast("สร้างเสียงพากย์ไม่สำเร็จ", "error");
    } finally {
      setTtsBusyScene(null);
    }
  };

  const filteredTemplates = MASTER_VAULT_TEMPLATES.filter(
    (t) => selectedVaultCategory === "all" || t.category === selectedVaultCategory
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Department Header — Warm Editorial Palette (#FAF9F5 / Beeswax #FBEFC5 / Red-Orange #F71C25) */}
      <section
        className="rounded-2xl border border-amber-300/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-5"
        style={{ backgroundColor: "#FAF9F5", color: "#1C1917" }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg border border-amber-400/70"
                style={{ backgroundColor: "#FBEFC5", color: "#9A3412" }}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>PKShortClips Studio · CineBoard 4.0 (Chat 88c0f026)</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                <HardDrive className="w-3.5 h-3.5" />
                ฝังรูปสินค้า & สตอรี่บอร์ดอัตโนมัติ (สลับหน้า/รีเฟรชงานไม่หาย)
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              สตูดิโอทำคลิปสั้นไวรัล & ปักตะกร้า (Dual-Mode 9:16 Video / 4:5 Photo Set)
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              รองรับสูงสุด 50 ช็อตต่อเนื่อง · ล็อกคำลงท้ายเดี่ยว (ครับ หรือ ค่ะ ห้ามปนกัน) · แนบรูปสินค้า + รูปนางแบบล็อกความต่อเนื่อง · คัดลอก Single Master Prompt ที่ซิงค์กับทุกช็อตแบบเรียลไทม์
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start">
            {activeHandoff && (
              <button
                type="button"
                onClick={() => {
                  setPayload(activeHandoff);
                  setProductName(activeHandoff.productInfo?.productName || activeHandoff.title);
                  showToast("ซิงค์ข้อมูลล่าสุดจากหน้า OS เข้าแผนกปักตะกร้าแล้ว!", "success");
                }}
                className="min-h-[40px] px-3.5 py-2 rounded-xl text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                style={{ backgroundColor: "#F71C25" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>ดึงโจทย์จากหน้า OS</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleNewProject}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-600" />
              <span>🆕 เริ่มโปรเจกต์ใหม่</span>
            </button>
          </div>
        </div>

        {/* Dual-Mode & 3 Formula Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            {
              id: "AFFILIATE_5SHOT" as const,
              ratio: "9:16" as const,
              title: "🎬 โหมดวิดีโอปักตะกร้า 9:16 (TikTok / Reels)",
              desc: "Hook หยุดนิ้ว ➔ โชว์สินค้า ➔ สาธิต ➔ ผลลัพธ์ ➔ ชี้เป้าตะกร้า"
            },
            {
              id: "VIRAL_STORY" as const,
              ratio: "9:16" as const,
              title: "🔥 โหมดคลิปสั้นไวรัล / ละครสั้นหักมุมขายของ 9:16",
              desc: "เปิดเรื่องดึงคนดูจนจบ แล้วหักมุมเข้าสินค้าแบบเนียนๆ"
            },
            {
              id: "PHOTO_PACK" as const,
              ratio: "4:5" as const,
              title: "📸 โหมดเซ็ตภาพนิ่งไลฟ์สไตล์ & สินค้า 4:5",
              desc: "สร้างอัลบั้มภาพสินค้า + นางแบบถือสินค้า ลง IG / Facebook / Shopee"
            }
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setStudioMode(m.id);
                setAspectRatio(m.ratio);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                studioMode === m.id
                  ? "text-white border-red-600 shadow-xs"
                  : "bg-white text-stone-800 border-stone-300 hover:border-amber-500"
              }`}
              style={studioMode === m.id ? { backgroundColor: "#F71C25" } : undefined}
            >
              <div className="text-xs font-extrabold">{m.title}</div>
              <div className={`text-[11px] mt-0.5 ${studioMode === m.id ? "text-red-100" : "text-stone-500"}`}>
                {m.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Product Brief Form + Dual Reference Image Slots (Product + Model Face) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
          <div className="lg:col-span-7 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-stone-800 mb-1">
                  1. ชื่อสินค้า / หัวข้อคลิปไวรัล *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="เช่น เซรั่มกันแดดหน้าฉ่ำ, รอกตกปลา PP Fishing, ข้าวกล่องคลีน..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-sm text-stone-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-stone-800 mb-1">
                  2. ป้ายราคา / โปรโมชัน FOMO กระตุ้นยอดซื้อ
                </label>
                <input
                  type="text"
                  value={priceBadge}
                  onChange={(e) => setPriceBadge(e.target.value)}
                  placeholder="เช่น ซื้อ 1 แถม 1 (199.-) ส่งฟรีวันนี้"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-sm text-stone-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-800 mb-1">
                3. จุดขายเด่น / ปัญหาของลูกค้าที่สินค้านี้ช่วยแก้
              </label>
              <input
                type="text"
                value={sellingPoints}
                onChange={(e) => setSellingPoints(e.target.value)}
                placeholder="เช่น กันน้ำกันเหงื่อ ไม่วอก, ตีไกลไม่ฟู่, ฟรีดาวน์ 0 บาท..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-sm text-stone-900 font-medium"
              />
            </div>

            {/* Shot Count (4 to 50 shots) + Single Polite Particle Rule (ครับ OR ค่ะ) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 mb-1">
                  จำนวนช็อต (สูงสุด 50 ช็อต)
                </label>
                <select
                  value={sceneCount}
                  onChange={(e) => setSceneCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-extrabold text-stone-900"
                >
                  <option value={4}>4 ช็อต (12 วิ กระชับ)</option>
                  <option value={5}>5 ช็อต (15 วิ มาตรฐานปักตะกร้า)</option>
                  <option value={6}>6 ช็อต (18 วิ รีวิวครบ)</option>
                  <option value={8}>8 ช็อต (24 วิ ละครสั้น/สาธิต)</option>
                  <option value={10}>10 ช็อต (30 วิ จัดเต็ม)</option>
                  <option value={12}>12 ช็อต (36 วิ มินิซีรีส์ขายของ)</option>
                  <option value={16}>16 ช็อต (48 วิ รีวิวเจาะลึก)</option>
                  <option value={20}>20 ช็อต (60 วิ 1 นาทีเต็ม)</option>
                  <option value={30}>30 ช็อต (90 วิ สตอรี่บอร์ดใหญ่)</option>
                  <option value={50}>50 ช็อต (Full Production 50 Shots)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 mb-1">
                  คำลงท้าย (ห้ามปน ครับ/ค่ะ)
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-stone-200/80 border border-stone-300">
                  <button
                    type="button"
                    onClick={() => handleSwitchPoliteParticle("ครับ")}
                    className={`py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      politeParticle === "ครับ"
                        ? "bg-stone-900 text-white shadow-xs"
                        : "text-stone-700 hover:bg-white/60"
                    }`}
                  >
                    👨 ครับ (ชาย)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchPoliteParticle("ค่ะ")}
                    className={`py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      politeParticle === "ค่ะ"
                        ? "bg-stone-900 text-white shadow-xs"
                        : "text-stone-700 hover:bg-white/60"
                    }`}
                  >
                    👩 ค่ะ (หญิง)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-stone-700 mb-1">
                  สัดส่วนภาพ (Aspect Ratio)
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as "9:16" | "4:5" | "16:9")}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-extrabold text-stone-900"
                >
                  <option value="9:16">📱 9:16 แนวตั้ง (TikTok/Reels)</option>
                  <option value="4:5">📸 4:5 เซ็ตภาพนิ่ง (IG/FB Feed)</option>
                  <option value="16:9">🖥️ 16:9 แนวนอน (YouTube)</option>
                </select>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                disabled={generating}
                onClick={handleGenerateAffiliateScript}
                className="w-full min-h-[46px] px-6 py-2.5 rounded-xl text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-sm"
                style={{ backgroundColor: "#F71C25" }}
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังวางสตอรี่บอร์ด {sceneCount} ช็อต (ลงท้าย &ldquo;{politeParticle}&rdquo;)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>สร้างสตอรี่บอร์ด {sceneCount} ช็อต + Single Master Prompt ทันที</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2 Embedded Reference Image Slots: Product Reference + Presenter Face Reference */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Slot 1: Product Image */}
            <div
              className="p-3.5 rounded-xl border border-amber-400/80 flex flex-col items-center justify-between text-center gap-2"
              style={{ backgroundColor: "#FBEFC5" }}
            >
              <div className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-red-600" />
                <span>รูปสินค้าจริง (Product Lock)</span>
              </div>
              {productRefImage ? (
                <div className="space-y-1.5 w-full">
                  <img
                    src={productRefImage}
                    alt="Product Reference"
                    className="w-full h-28 object-contain rounded-lg bg-white p-1 border border-amber-300"
                  />
                  <div className="text-[10px] font-bold text-stone-700 truncate">{productFileName}</div>
                  <button
                    type="button"
                    onClick={async () => {
                      setProductRefImage("");
                      setProductFileName("");
                      await deleteEmbeddedFile("aff-product-img");
                    }}
                    className="text-[11px] font-extrabold text-red-700 hover:underline cursor-pointer"
                  >
                    ลบรูปสินค้า
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-stone-700 leading-relaxed">
                    อัปโหลดรูปสินค้าจริงเพื่อฝังล็อกรูปทรงและสีสินค้าทุกช็อต
                  </p>
                  <button
                    type="button"
                    onClick={() => productInputRef.current?.click()}
                    className="min-h-[36px] w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-extrabold text-stone-900 inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-stone-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-red-600" />
                    <span>เลือกรูปสินค้า</span>
                  </button>
                </>
              )}
              <input
                ref={productInputRef}
                type="file"
                accept="image/*"
                onChange={handleProductPhotoUpload}
                className="hidden"
              />
            </div>

            {/* Slot 2: Model / Presenter Face Reference */}
            <div
              className="p-3.5 rounded-xl border border-amber-400/80 flex flex-col items-center justify-between text-center gap-2"
              style={{ backgroundColor: "#FBEFC5" }}
            >
              <div className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-red-600" />
                <span>รูปนายแบบ/นางแบบ (Face Lock)</span>
              </div>
              {modelRefImage ? (
                <div className="space-y-1.5 w-full">
                  <img
                    src={modelRefImage}
                    alt="Model Reference"
                    className="w-full h-28 object-contain rounded-lg bg-white p-1 border border-amber-300"
                  />
                  <div className="text-[10px] font-bold text-stone-700 truncate">{modelFileName}</div>
                  <button
                    type="button"
                    onClick={async () => {
                      setModelRefImage("");
                      setModelFileName("");
                      await deleteEmbeddedFile("aff-model-img");
                    }}
                    className="text-[11px] font-extrabold text-red-700 hover:underline cursor-pointer"
                  >
                    ลบรูปนางแบบ
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-stone-700 leading-relaxed">
                    อัปโหลดรูปใบหน้านักรีวิวเพื่อล็อกคนเดิมถือสินค้าครบทุกช็อต
                  </p>
                  <button
                    type="button"
                    onClick={() => modelInputRef.current?.click()}
                    className="min-h-[36px] w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-extrabold text-stone-900 inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-stone-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-red-600" />
                    <span>เลือกรูปนางแบบ</span>
                  </button>
                </>
              )}
              <input
                ref={modelInputRef}
                type="file"
                accept="image/*"
                onChange={handleModelPhotoUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Active Affiliate Storyboard, 1-Click Single Master Prompt & Real File Save */}
      {payload && (
        <section className="space-y-4 animate-fade-in-up">
          <DepartmentHandoffBar currentDeptId="affiliate" payload={payload} />

          {/* 1-Click Single Master Prompt Box (Dynamically Synced with Individual Shot Edits) */}
          <div
            className="rounded-2xl border-2 border-amber-400 p-4 sm:p-5 space-y-3 shadow-xs"
            style={{ backgroundColor: "#FBEFC5", color: "#1C1917" }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-red-600 text-white">
                  <Layers className="w-3.5 h-3.5" />
                  <span>1-CLICK SINGLE MASTER PROMPT · ซิงค์ข้อมูลทุกช็อตแบบเรียลไทม์</span>
                </div>
                <h3 className="text-base font-extrabold text-stone-900 mt-1">
                  พรอมต์รวมชุดเดียวครบทั้ง {payload.scenes.length} ช็อต (แก้ไขช็อตด้านล่างปุ๊บ กล่องนี้เปลี่ยนตามทันที!)
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(singleMasterPrompt);
                    setCopiedKey("master-all");
                    showToast(`คัดลอก Single Master Prompt ครบทั้ง ${payload.scenes.length} ช็อตแล้ว!`, "success");
                    setTimeout(() => setCopiedKey(null), 2000);
                  }}
                  className="min-h-[40px] px-4 py-2 rounded-xl text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  style={{ backgroundColor: "#F71C25" }}
                >
                  {copiedKey === "master-all" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>📋 คัดลอก Single Master Prompt ({payload.scenes.length} ช็อต)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportProjectFile("txt")}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>บันทึกไฟล์ .TXT</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportProjectFile("json")}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>บันทึกไฟล์ .JSON</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              rows={5}
              value={singleMasterPrompt}
              className="w-full p-3 rounded-xl bg-white/95 border border-amber-300 text-xs font-mono text-stone-800 leading-relaxed"
            />
          </div>

          {/* Individual Shot Cards Grid */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                  CINEBOARD 4.0 STORYBOARD · {payload.scenes.length} SHOTS · {aspectRatio} · คำลงท้าย &ldquo;{politeParticle}&rdquo;
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {payload.title}
                </h2>
              </div>
              <a
                href="https://flow.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1.5 self-start"
              >
                <span>เปิด Google Flow เพื่อวาง Prompt</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {payload.scenes.map((scene) => (
                <div
                  key={scene.sceneNumber}
                  className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 p-3.5 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-white font-mono text-[11px] font-bold"
                        style={{ backgroundColor: "#F71C25" }}
                      >
                        SHOT {String(scene.sceneNumber).padStart(2, "0")} / {String(payload.scenes.length).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {scene.timecode || `${scene.durationSec}s`}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={scene.title}
                      onChange={(e) => handleUpdateScene(scene.sceneNumber, "title", e.target.value)}
                      className="w-full px-2 py-1 rounded bg-transparent border border-transparent hover:border-slate-300 focus:border-orange-500 focus:bg-white dark:focus:bg-zinc-900 text-xs font-extrabold text-slate-900 dark:text-white"
                    />

                    {scene.imageUrl && (
                      <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 bg-black aspect-video">
                        <img src={scene.imageUrl} alt={scene.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* On-Screen Promo Badge */}
                    <div>
                      <label className="block text-[10px] font-bold text-orange-700 dark:text-orange-300 mb-0.5">
                        🏷️ ป้ายข้อความบนจอ (On-Screen Badge):
                      </label>
                      <input
                        type="text"
                        value={scene.onScreenText}
                        onChange={(e) => handleUpdateScene(scene.sceneNumber, "onScreenText", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-orange-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Thai Voiceover */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-0.5">
                        🔊 บทพากย์ขายของภาษาไทย (ล็อกลงท้าย &ldquo;{politeParticle}&rdquo;):
                      </label>
                      <textarea
                        rows={2}
                        value={scene.voiceoverThai}
                        onChange={(e) => handleUpdateScene(scene.sceneNumber, "voiceoverThai", e.target.value)}
                        className="w-full p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    {scene.audioUrl && <audio controls src={scene.audioUrl} className="w-full h-8" />}

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-0.5">
                        🎨 Visual Prompt (EN - ล็อกสินค้า 100%):
                      </label>
                      <textarea
                        rows={2}
                        value={scene.visualPromptEn}
                        onChange={(e) => handleUpdateScene(scene.sceneNumber, "visualPromptEn", e.target.value)}
                        className="w-full p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] font-mono text-slate-700 dark:text-zinc-300"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={imgBusyScene === scene.sceneNumber}
                        onClick={() => handleGenImage(scene)}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                        <span>{imgBusyScene === scene.sceneNumber ? "กำลังวาด..." : "เจนภาพ"}</span>
                      </button>
                      <button
                        type="button"
                        disabled={ttsBusyScene === scene.sceneNumber}
                        onClick={() => handleGenVoice(scene)}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{ttsBusyScene === scene.sceneNumber ? "รอ..." : "พากย์"}</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(scene.visualPromptEn);
                        setCopiedKey(`shot-${scene.sceneNumber}`);
                        showToast(`ก๊อป Prompt ช็อต ${scene.sceneNumber} แล้ว!`, "success");
                        setTimeout(() => setCopiedKey(null), 1800);
                      }}
                      className="min-h-[34px] px-2.5 py-1 rounded-lg text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      style={{ backgroundColor: "#F71C25" }}
                    >
                      {copiedKey === `shot-${scene.sceneNumber}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>ก๊อปช็อตนี้</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Built-in Prompt Vault (Starter Pack) */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-600" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              คลังสูตรลับขายดี & สูตร Viral สำเร็จรูป (กดเลือกเพื่อโหลดทั้งสตอรี่บอร์ดในคลิกเดียว)
            </h2>
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              { id: "all", label: "ทั้งหมด" },
              { id: "skincare", label: "✨ สกินแคร์" },
              { id: "food", label: "🍛 อาหารคลีน/ของกิน" },
              { id: "auto", label: "🚗 รถยนต์" },
              { id: "gadgets", label: "🎣 ตกปลา/อุปกรณ์" }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedVaultCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedVaultCategory === cat.id
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex flex-col justify-between gap-3 hover:border-orange-400 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300">
                    {tpl.categoryLabel}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    {tpl.scenes.length} ช็อตครบชุด
                  </span>
                </div>
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                  {tpl.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                  ⚡ Hook: &ldquo;{tpl.hookThai}&rdquo;
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleLoadVaultTemplate(tpl)}
                className="min-h-[36px] w-full px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-orange-600 dark:bg-zinc-700 dark:hover:bg-orange-600 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>ใช้สูตรนี้ทันที ({tpl.scenes.length} ช็อต)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
