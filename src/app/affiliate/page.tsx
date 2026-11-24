"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Flame,
  Camera,
  Tag,
  ArrowRight,
  ExternalLink,
  Smartphone,
  Monitor,
  Wand2
} from "lucide-react";
import { useHub, HubHandoffPayload, HubSceneItem } from "@/context/HubContext";
import { DepartmentHandoffBar } from "@/components/hub/DepartmentHandoffBar";
import { useToast } from "@/components/ui/ToastProvider";

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
        voiceoverThai: "แดดเมืองไทยร้อนทะลุ 40 องศา แต่ทำไมหน้ายังฉ่ำใส ไม่เยิ้ม ไม่เป็นคราบเลย?",
        onScreenText: "☀️ แดดแรงแค่ไหนก็ไม่กลัวเยิ้ม!",
        visualPromptEn:
          "[TOPIC LOCK: Sunscreen Serum Bottle] Cinematic 9:16 close-up of a cheerful Thai female creator in a bright outdoor morning market holding a sleek UV sunscreen serum bottle under golden sunlight, glowing dewy skin, photorealistic 8k, zero watches, zero unrelated objects",
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
        voiceoverThai: "ทาเทียบให้ดูชัดๆ ข้างที่ทาผิวดูโกลว์เล่นแสงทันที ไม่วอก ไม่ลอย แต่งหน้าทับติดทนทั้งวัน",
        onScreenText: "✨ ผิวโกลว์เล่นแสง ไม่วอก ไม่เทา",
        visualPromptEn:
          "[TOPIC LOCK: Glowing Skin Mirror Reflection] Medium close-up of Thai woman smiling into a vanity mirror touching her radiant dewy cheek with natural sunlight reflection, clean skincare aesthetic, 8k",
        motionPromptEn: "Slow dolly push-in toward mirror reflection with soft bokeh"
      },
      {
        title: "ช็อต 04: กันน้ำกันเหงื่อ พิสูจน์ชัดๆ",
        voiceoverThai: "จะเหงื่อออกหรือโดนน้ำก็ไม่หลุดเป็นคราบขาว ล็อกผิวสวยสู้แดดได้ตั้งแต่เช้าจรดเย็น",
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
    categoryLabel: "🍛 อาหาร & เครื่องดื่ม",
    title: "อาหารคลีน Meal Prep 7 วัน อกไก่นุ่มฉ่ำ หุ่นเฟิร์มสั่งได้",
    productName: "เซ็ตอาหารคลีน Meal Prep 7 วัน",
    priceBadge: "เซ็ต 7 กล่อง เริ่มต้น 590.-",
    mode: "AFFILIATE_5SHOT",
    hookThai: "ใครว่ากินคลีนแล้วต้องฝืนกินอกไก่แห้งๆ? ดูเซ็ตอาหารคลีน 7 วันกล่องนี้ก่อน!",
    scenes: [
      {
        title: "ช็อต 01: เปิดกล่องอาหารคลีนสีสันน่ากินสุดๆ",
        voiceoverThai: "ลืมภาพอกไก่แห้งๆ ไปได้เลย! นี่คือเซ็ตอาหารคลีน 7 วันที่เปิดกล่องมาแล้วหอมน่ากินเหมือนเชฟมาทำให้ที่บ้าน",
        onScreenText: "🥗 อาหารคลีน 7 วัน อร่อยเหมือนเชฟทำให้!",
        visualPromptEn:
          "[TOPIC LOCK: Clean Food Meal Prep] Overhead 9:16 commercial shot of herb-grilled juicy chicken breast slices, ripe Hass avocado, rainbow quinoa, and steamed broccoli in a glass meal prep container, natural morning light, zero watches, zero cars",
        motionPromptEn: "Smooth top-down push-in revealing vibrant steam and glistening herbs"
      },
      {
        title: "ช็อต 02: ซูมความฉ่ำของอกไก่ย่างและแซลมอน",
        voiceoverThai: "คัดวัตถุดิบเกรดพรีเมียม ทั้งอกไก่ย่างสมุนไพรเนื้อนุ่มฉ่ำ และแซลมอนนอร์เวย์ย่างเกลือชมพู",
        onScreenText: "🍗 อกไก่นุ่มฉ่ำ + แซลมอนนอร์เวย์แท้",
        visualPromptEn:
          "[TOPIC LOCK: Grilled Chicken & Salmon Clean Food] Macro food cinematography of a chef slicing tender herb-crusted grilled chicken breast and pink-salt seared salmon fillet, juicy texture, warm 3200K key light, 8k",
        motionPromptEn: "Slow-motion knife slice revealing tender juicy interior"
      },
      {
        title: "ช็อต 03: ราดน้ำสลัดน้ำมันมะกอกสกัดเย็น",
        voiceoverThai: "คลุกเคล้ากับผักเคลออร์แกนิกและน้ำสลัดเลมอนน้ำมันมะกอก คุมแคลอรีเป๊ะทุกมื้อ",
        onScreenText: "🍋 แคลต่ำ โปรตีนสูง คุมหุ่นเป๊ะ",
        visualPromptEn:
          "[TOPIC LOCK: Olive Oil Salad Dressing Pour] High-speed 120fps slow-motion shot of golden extra-virgin olive oil and lemon dressing drizzling over crisp green kale and quinoa salad bowl, 8k food commercial",
        motionPromptEn: "120fps slow-motion golden drizzle catching sunlight"
      },
      {
        title: "ช็อต 04: จัดเรียงเข้าตู้เย็นพร้อมทานทั้งสัปดาห์",
        voiceoverThai: "แค่แช่ตู้เย็นไว้ ตอนเช้าหยิบอุ่นไมโครเวฟ 2 นาที พร้อมทานทันที ประหยัดเวลาสุดๆ",
        onScreenText: "⏱️ อุ่น 2 นาทีพร้อมทาน อิ่มครบ 7 วัน",
        visualPromptEn:
          "[TOPIC LOCK: Meal Prep Glass Containers in Fridge] Clean modern refrigerator interior with 7 neatly organized glass meal prep containers filled with colorful healthy clean food meals, bright LED lighting, 8k",
        motionPromptEn: "Smooth dolly pull-back as hand picks up one ready meal box"
      },
      {
        title: "ช็อต 05: ปิดการขาย & ชี้เป้าปักตะกร้า",
        voiceoverThai: "สั่งเซ็ตทดลอง 7 วันวันนี้ ส่งฟรีด้วยรถควบคุมความเย็น กดสั่งที่ตะกร้าซ้ายล่างได้เลยครับ!",
        onScreenText: "🛒 กดสั่งเซ็ต 7 วัน ที่ตะกร้าซ้ายล่าง!",
        visualPromptEn:
          "[TOPIC LOCK: Clean Food Meal Prep Set Hero] Hero commercial shot of 3 glass meal prep containers arranged on a Scandinavian wooden kitchen island with fresh avocado and lemon, 8k photorealistic",
        motionPromptEn: "Gentle hero arc shot around the meal prep set"
      }
    ]
  },
  {
    id: "vault-auto-1",
    category: "auto",
    categoryLabel: "🚗 รถยนต์ & ยานยนต์",
    title: "รีวิวรถสวยสภาพนางฟ้า 5 ช็อตปิดการขาย ฟรีดาวน์ 0 บาท",
    productName: "รถครอบครัว SUV สภาพป้ายแดง ไมล์น้อย",
    priceBadge: "ฟรีดาวน์ 0 บาท · ผ่อนสบาย",
    mode: "AFFILIATE_5SHOT",
    hookThai: "งบผ่อนแค่วันละ 200 กว่าบาท แต่ได้รถ SUV สภาพป้ายแดงไมล์แท้คันนี้ จะคุ้มแค่ไหนมาดู!",
    scenes: [
      {
        title: "ช็อต 01: เปิดตัวหน้ารถไฟ LED สว่างวาบ",
        voiceoverThai: "ใครกำลังมองหารถครอบครัวสภาพป้ายแดงในงบประหยัดครึ่งล้าน ต้องดูคันนี้เลยครับ!",
        onScreenText: "🚘 สภาพป้ายแดง ประหยัดไปเกือบครึ่งล้าน!",
        visualPromptEn:
          "[TOPIC LOCK: Pearl White SUV Showroom] Low-angle 9:16 cinematic shot of a sleek pearl white modern SUV parked in a clean showroom bay as matrix LED headlights power on, glossy floor reflection, 8k",
        motionPromptEn: "Dynamic low-angle push-in as headlights illuminate"
      },
      {
        title: "ช็อต 02: โชว์เส้นสายรอบคันและล้อแม็กซ์",
        voiceoverThai: "สีเดิมโรงงานเงาวับทั้งคัน ล้อแม็กซ์อัลลอยด์ทูโทนไร้รอยขีดข่วน ยางใหม่พร้อมใช้งาน",
        onScreenText: "✨ สีเดิมโรงงาน ล้อแม็กซ์ทูโทนไร้รอย",
        visualPromptEn:
          "[TOPIC LOCK: SUV Side Profile & Alloy Wheel] Smooth tracking shot along the sculpted metallic pearl white side body of the SUV ending on diamond-cut alloy sport wheels, studio lighting, 8k",
        motionPromptEn: "Low-angle tracking glide along the side profile"
      },
      {
        title: "ช็อต 03: เปิดห้องโดยสาร POV เบาะหนังหรู",
        voiceoverThai: "ภายในเบาะหนังแท้ตึงแน่นเหมือนเพิ่งออกจากศูนย์ หน้าจอดิจิทัลคู่พร้อมหลังคา Panoramic",
        onScreenText: "💺 ภายในใหม่กริบ หลังคาแก้วเต็มบาน",
        visualPromptEn:
          "[TOPIC LOCK: Luxury SUV Interior Cockpit] First-person POV entering the immaculate leather SUV cockpit, dual digital screen illuminated, panoramic glass sunroof above, warm ambient LED light, 8k",
        motionPromptEn: "Smooth POV pan across steering wheel and digital dashboard"
      },
      {
        title: "ช็อต 04: พื้นที่เก็บสัมภาระท้ายรถกว้างขวาง",
        voiceoverThai: "ฝาท้ายไฟฟ้าเปิดขึ้นโชว์พื้นที่เก็บของกว้างสุดๆ จะขนของหรือไปเที่ยวทั้งครอบครัวก็สบาย",
        onScreenText: "🧳 ฝาท้ายไฟฟ้า จุของได้เต็มพิกัด",
        visualPromptEn:
          "[TOPIC LOCK: SUV Electric Tailgate Cargo] Medium rear shot of the SUV with power tailgate opening smoothly to reveal a spacious spotless rear cargo trunk, modern dealership background, 8k",
        motionPromptEn: "Smooth upward tilt following the opening power tailgate"
      },
      {
        title: "ช็อต 05: ข้อเสนอฟรีดาวน์ & ทักแชทด่วน",
        voiceoverThai: "คันนี้มีเพียงคันเดียว ฟรีดาวน์ 0 บาท ดอกเบี้ยพิเศษ รีบทักแชทหรือโทรจองก่อนหลุดมือครับ!",
        onScreenText: "🔥 ฟรีดาวน์ 0% คันเดียวเท่านั้น ทักแชทด่วน!",
        visualPromptEn:
          "[TOPIC LOCK: Pearl White SUV Hero Deal] Hero 3/4 front angle of the pearl white SUV under warm golden showroom lighting with red bow accent, commercial automotive photography, 8k",
        motionPromptEn: "Slow hero orbit around front 3/4 view"
      }
    ]
  },
  {
    id: "vault-gadgets-1",
    category: "gadgets",
    categoryLabel: "🎣 อุปกรณ์ตกปลา & ไลฟ์สไตล์",
    title: "รอกตกปลา PP Fishing ตีไกลลื่นหัวแตก ปักตะกร้าสายหมายธรรมชาติ",
    productName: "รอกหยดน้ำ PP Fishing Pro Carbon",
    priceBadge: "โปรหน้าร้านเชียงราย ลดพิเศษ",
    mode: "AFFILIATE_5SHOT",
    hookThai: "ตีเหยื่อสวนลมยังไงให้ไม่ฟู่ แถมพุ่งไกลทะลุหมายธรรมชาติ? สายตีเหยื่อปลอมดูตัวนี้!",
    scenes: [
      {
        title: "ช็อต 01: ตีเหยื่อปลอมพุ่งแหวกอากาศริมอ่างเก็บน้ำ",
        voiceoverThai: "สายตีเหยื่อปลอมที่เบื่อปัญหาสายฟู่เวลาตีสวนลม ต้องลองรอกหยดน้ำตัวท็อปจาก PP Fishing ตัวนี้เลย!",
        onScreenText: "🎣 ตีสวนลมไม่ฟู่ พุ่งไกลทะลุหมาย!",
        visualPromptEn:
          "[TOPIC LOCK: Carbon Baitcasting Fishing Reel] Cinematic 9:16 action shot of an angler casting a sleek carbon-fiber baitcasting fishing reel beside a misty Chiang Rai mountain lake at sunrise, water droplets, 8k",
        motionPromptEn: "Dynamic slow-motion whip pan following the smooth cast"
      },
      {
        title: "ช็อต 02: ซูมดีไซน์บอดี้คาร์บอนและสปูลอัลลอยด์",
        voiceoverThai: "บอดี้คาร์บอนน้ำหนักเบาแต่แกร่งสุดๆ ลูกปืนสแตนเลสกันสนิม หมุนลื่นเนียนมือไร้เสียงสะดุด",
        onScreenText: "⚙️ บอดี้คาร์บอน ลูกปืนลื่นหัวแตก",
        visualPromptEn:
          "[TOPIC LOCK: Baitcasting Reel Macro Detail] Extreme macro product shot of a matte carbon-fiber baitcasting reel with gold anodized aluminum spool spinning smoothly, dramatic rim light, 8k",
        motionPromptEn: "Macro orbit around the spinning gold anodized spool"
      },
      {
        title: "ช็อต 03: ระบบหน่วงแม่เหล็กปรับละเอียด",
        voiceoverThai: "มาพร้อมระบบหน่วงแม่เหล็กความแม่นยำสูง จะเหยื่อเบาหรือเหยื่อหนักก็คุมระยะตกได้ดั่งใจ",
        onScreenText: "🧲 หน่วงแม่เหล็กแม่นยำ ตีเหยื่อเบาได้สบาย",
        visualPromptEn:
          "[TOPIC LOCK: Fishing Reel Magnetic Brake Dial] Close-up shot of angler fingers adjusting the precision magnetic brake dial on the side of the baitcasting reel, lake bokeh background, 8k",
        motionPromptEn: "Tight rack focus on the precision brake dial click"
      },
      {
        title: "ช็อต 04: เบรคหนักอัดปลาชะโดใหญ่ริมตลิ่ง",
        voiceoverThai: "กำลังเบรคหนักแน่น เอาอยู่ทุกไซซ์ จะช่อนใหญ่หรือชะโดโทรฟี่ก็งัดขึ้นฝั่งได้แบบมั่นใจ",
        onScreenText: "💪 เบรคหนักแน่น งัดโทรฟี่สบาย!",
        visualPromptEn:
          "[TOPIC LOCK: Angler Fighting Fish with Bent Rod] Action shot of a fishing rod bending in a powerful arc as the angler reels in a big fish with splashes on the water surface during golden hour, 8k",
        motionPromptEn: "Handheld action tracking shot capturing water splash energy"
      },
      {
        title: "ช็อต 05: ชี้เป้าปักตะกร้า & หน้าร้าน PP Fishing เชียงราย",
        voiceoverThai: "มีพร้อมส่งทุกหมุนซ้าย-ขวา กดสั่งที่ตะกร้าซ้ายล่าง หรือแวะชมที่หน้าร้าน PP Fishing เชียงรายได้เลยครับ!",
        onScreenText: "🛒 กดตะกร้าซ้ายล่าง / PP Fishing เชียงราย",
        visualPromptEn:
          "[TOPIC LOCK: Fishing Reel Packshot on Wooden Dock] Hero product packshot of the carbon baitcasting fishing reel resting on a rustic wooden lakeside dock with fishing lures, golden sunrise, 8k",
        motionPromptEn: "Smooth hero dolly push-in toward the reel"
      }
    ]
  },
  {
    id: "vault-viral-1",
    category: "viral",
    categoryLabel: "😂 สูตร Viral ละครสั้นฮิต",
    title: "สูตร Viral: ช่างแอร์ในตำนานบุกช่วยบ้านร้อนตับแตก (หักมุมขายบริการ)",
    productName: "บริการล้างแอร์พรีเมียม ฉีดโฟมฆ่าเชื้อ",
    priceBadge: "ล้างใหญ่เริ่มต้น 490.- ประกัน 30 วัน",
    mode: "VIRAL_STORY",
    hookThai: "เมื่อแอร์บ้านไม่เย็นตอนบ่ายสอง ร้อนจนแทบละลาย แล้วฮีโร่ชุดช่างแอร์ก็ปรากฏตัว!",
    scenes: [
      {
        title: "ช็อต 01: เปิดเรื่องฮาๆ ร้อนจนพัดลมเป่าไอไฟ",
        voiceoverThai: "บ่ายสองเมืองไทย แอร์เปิด 18 องศาแต่ลมออกมาเหมือนอยู่หน้าเตาหมูกระทะ!",
        onScreenText: "🥵 เปิดแอร์ 18 องศา ทำไมร้อนเหมือนเตาไฟ?!",
        visualPromptEn:
          "[TOPIC LOCK: Sweating Homeowner & Air Conditioner] Cinematic 9:16 comedy shot of a dramatic Thai homeowner fanning himself in front of a dusty wall air conditioner in a warm living room, expressive funny reaction, 8k",
        motionPromptEn: "Quick comedic zoom-in to homeowner's dramatic sweating face"
      },
      {
        title: "ช็อต 02: เปิดตัวทีมช่างแอร์มือโปรเหมือนหน่วยกู้ภัย",
        voiceoverThai: "ทันใดนั้น ทีมช่างแอร์มืออาชีพก็ก้าวเข้ามาพร้อมผ้าใบกันเปื้อนและปืนฉีดน้ำแรงดันสูง!",
        onScreenText: "🦸‍♂️ ฮีโร่ช่างแอร์มือโปรมาแล้ว!",
        visualPromptEn:
          "[TOPIC LOCK: Professional AC Technician Hero] Low-angle cinematic hero shot of a neat Thai air-con technician in clean uniform carrying a high-pressure washer and tool kit entering the living room with dramatic backlight, 8k",
        motionPromptEn: "Slow-motion hero walk tracking backward"
      },
      {
        title: "ช็อต 03: ฉีดโฟมสลายคราบฝุ่นคอยล์เย็นสะใจ (ASMR)",
        voiceoverThai: "ฉีดโฟมฆ่าเชื้อสลายคราบฝุ่นสะสม ล้างสะอาดทุกซอกคอยล์ น้ำไม่หยดเลอะบ้านแม้แต่หยดเดียว",
        onScreenText: "🧼 ฉีดโฟมฆ่าเชื้อ ล้างสะอาดเกลี้ยง!",
        visualPromptEn:
          "[TOPIC LOCK: AC Coil High Pressure Cleaning] Satisfying close-up shot of technician spraying rich white sanitizing foam and high-pressure water jet onto AC evaporator fins inside a protective blue wash bag, 8k",
        motionPromptEn: "Macro panning shot across gleaming clean aluminum fins"
      },
      {
        title: "ช็อต 04: เปิดแอร์ใหม่ ลมเย็นฉ่ำเหมือนขั้วโลกเหนือ",
        voiceoverThai: "พอล้างเสร็จกดเปิดแอร์เท่านั้นแหละ ลมเย็นฉ่ำพุ่งปะทะหน้า หอมสดชื่นแถมค่าไฟลดฮวบ!",
        onScreenText: "❄️ เย็นฉ่ำเหมือนขั้วโลก ค่าไฟลดทันที!",
        visualPromptEn:
          "[TOPIC LOCK: Fresh Cold Air Flow from Clean AC] Joyful homeowner smiling in relief as crisp cool mist breeze flows from the sparkling clean white wall air conditioner in a bright living room, 8k",
        motionPromptEn: "Smooth dolly pull-back showing refreshing cool atmosphere"
      },
      {
        title: "ช็อต 05: ปิดการขายคิวล้างแอร์ & รับประกัน",
        voiceoverThai: "โปรล้างแอร์พรีเมียมวันนี้เริ่มต้น 490 บาท พร้อมรับประกันงาน 30 วัน ทักแชทจองคิวด่วนเลยครับ!",
        onScreenText: "📲 เริ่มต้น 490.- ประกัน 30 วัน ทักแชทจองคิว!",
        visualPromptEn:
          "[TOPIC LOCK: Friendly AC Technician Thumbs Up] Friendly Thai AC technician in uniform giving a warm smile beside a spotless modern wall air conditioner, professional service commercial look, 8k",
        motionPromptEn: "Gentle push-in ending on clean composition for contact badge"
      }
    ]
  }
];

export default function AffiliateStudioPage() {
  const { activeHandoff, setActiveHandoff, saveToVault } = useHub();
  const { showToast } = useToast();

  const [productName, setProductName] = useState("");
  const [priceBadge, setPriceBadge] = useState("ลดพิเศษ 50% · ส่งฟรีวันนี้");
  const [sellingPoints, setSellingPoints] = useState("");
  const [studioMode, setStudioMode] = useState<"AFFILIATE_5SHOT" | "VIRAL_STORY" | "PHOTO_PACK">("AFFILIATE_5SHOT");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [sceneCount, setSceneCount] = useState<number>(5);
  const [productRefImage, setProductRefImage] = useState<string>("");
  const [selectedVaultCategory, setSelectedVaultCategory] = useState<string>("all");

  const [generating, setGenerating] = useState(false);
  const [payload, setPayload] = useState<HubHandoffPayload | null>(null);
  const [imgBusyScene, setImgBusyScene] = useState<number | null>(null);
  const [ttsBusyScene, setTtsBusyScene] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync incoming handoff from OS automatically on mount
  useEffect(() => {
    if (activeHandoff && !payload) {
      setPayload(activeHandoff);
      setProductName(activeHandoff.productInfo?.productName || activeHandoff.title || activeHandoff.topic);
      if (activeHandoff.productInfo?.price) setPriceBadge(activeHandoff.productInfo.price);
      setAspectRatio(activeHandoff.aspectRatio || "9:16");
    }
  }, [activeHandoff, payload]);

  const handleProductPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setProductRefImage(dataUrl);
      showToast("แนบรูปสินค้าอ้างอิงสำเร็จ! ระบบจะล็อกลักษณะสินค้าในทุกช็อต", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleLoadVaultTemplate = (tpl: PromptVaultTemplate) => {
    setProductName(tpl.productName);
    setPriceBadge(tpl.priceBadge);
    setStudioMode(tpl.mode);
    const mappedScenes: HubSceneItem[] = tpl.scenes.map((s, idx) => ({
      sceneNumber: idx + 1,
      title: s.title,
      durationSec: 3,
      timecode: `00:${String(idx * 3).padStart(2, "0")} - 00:${String((idx + 1) * 3).padStart(2, "0")}`,
      voiceoverThai: s.voiceoverThai,
      onScreenText: s.onScreenText,
      visualPromptEn: s.visualPromptEn,
      motionPromptEn: s.motionPromptEn,
      cameraAngle: "Commercial Product Shot"
    }));

    const newPayload: HubHandoffPayload = {
      id: `aff-${Date.now()}`,
      title: tpl.title,
      topic: tpl.productName,
      aspectRatio,
      hook3Sec: tpl.hookThai,
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
        .join("\n")}\n\n🛒 พิกัดสั่งซื้อ กดที่ตะกร้าเหลืองซ้ายล่างได้เลย!`,
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
      aspectRatio,
      payload: newPayload
    });
    showToast(`โหลดสูตร "${tpl.title}" เข้ากระดานเรียบร้อย!`, "success");
  };

  const handleGenerateAffiliateScript = async () => {
    const cleanName = productName.trim();
    if (!cleanName) {
      showToast("กรุณาระบุชื่อสินค้าหรือบริการที่ต้องการทำคลิปขายของก่อนครับ", "info");
      return;
    }

    setGenerating(true);
    try {
      const modeDesc =
        studioMode === "AFFILIATE_5SHOT"
          ? "สูตรคลิปปักตะกร้า TikTok Shop ปิดการขาย (Hook ปัญหา -> โชว์สินค้า -> สาธิตใช้งาน -> ผลลัพธ์ Before/After -> โปรโมชัน FOMO ชี้เป้าปักตะกร้าซ้ายล่าง)"
          : studioMode === "VIRAL_STORY"
          ? "สูตร Viral ละครสั้นหักมุมขายของเนียนๆ สไตล์คลิปไวรัลคนไทยชอบแชร์"
          : "เซ็ตภาพสินค้า Master Commercial Packshot & Lifestyle";

      const res = await fetch("/api/ai/easy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE",
          prompt: `[แผนกทำคลิปขายของ & ปักตะกร้า: ${modeDesc}] สินค้า: ${cleanName} | โปรโมชัน/ราคา: ${priceBadge} | จุดเด่นเพิ่มเติม: ${sellingPoints}`,
          format: "VIDEO",
          aiMode: "AI_FLOW",
          aspectRatio,
          contentGoal: studioMode === "VIRAL_STORY" ? "VIRAL_POV" : "COMMERCIAL",
          sceneCount: String(sceneCount)
        })
      });

      const data = await res.json().catch(() => ({}));
      const bp = data?.blueprint;

      if (res.ok && bp?.video_blueprint?.scenes?.length > 0) {
        const mappedScenes: HubSceneItem[] = bp.video_blueprint.scenes.map((s: any, idx: number) => ({
          sceneNumber: idx + 1,
          title: s.scene_role || s.what_to_shoot || `ช็อตขายของที่ ${idx + 1}`,
          durationSec: s.duration_sec || 3,
          timecode: `00:${String(idx * 3).padStart(2, "0")} - 00:${String((idx + 1) * 3).padStart(2, "0")}`,
          voiceoverThai: s.voiceover_text || "",
          onScreenText: s.on_screen_text || (idx === bp.video_blueprint.scenes.length - 1 ? `🛒 ${priceBadge}` : ""),
          visualPromptEn: `[TOPIC LOCK: ${cleanName}] ${s.flow_prompt || `Commercial product shot of ${cleanName}`}, zero in-image text, zero unrelated objects`,
          motionPromptEn: s.camera_angle || "Smooth commercial product camera movement, 4k 60fps"
        }));

        const newPayload: HubHandoffPayload = {
          id: `aff-${Date.now()}`,
          title: `${cleanName} (${priceBadge})`,
          topic: cleanName,
          aspectRatio,
          hook3Sec: bp.hook_3sec || mappedScenes[0]?.voiceoverThai || "",
          concept: bp.concept || modeDesc,
          fullScriptThai: mappedScenes.map((s) => s.voiceoverThai).join(" "),
          scenes: mappedScenes,
          productInfo: {
            productName: cleanName,
            price: priceBadge,
            promoBadge: priceBadge,
            referenceImageUrl: productRefImage
          },
          caption: bp.social_caption || `🔥 ${cleanName} — ${priceBadge}\nกดสั่งที่ตะกร้าซ้ายล่างได้เลย!`,
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
          aspectRatio,
          payload: newPayload
        });
        showToast(`สร้างสตอรี่บอร์ดขายของ ${mappedScenes.length} ช็อตเรียบร้อย!`, "success");
      } else {
        // Fallback deterministic 5-shot affiliate generator
        const roles = [
          "ช็อต 01: Hook หยุดนิ้ว & ชี้ปัญหา",
          "ช็อต 02: เปิดตัวพระเอก (โชว์สินค้าชัดๆ)",
          "ช็อต 03: สาธิตการใช้งาน & เนื้อสัมผัสจริง",
          "ช็อต 04: พิสูจน์ผลลัพธ์ Before / After",
          "ช็อต 05: โปรโมชัน FOMO & ชี้เป้าปักตะกร้าซ้ายล่าง"
        ];
        const fallbackScenes: HubSceneItem[] = Array.from({ length: sceneCount }).map((_, idx) => ({
          sceneNumber: idx + 1,
          title: roles[idx] || `ช็อตขายของที่ ${idx + 1}`,
          durationSec: 3,
          timecode: `00:${String(idx * 3).padStart(2, "0")} - 00:${String((idx + 1) * 3).padStart(2, "0")}`,
          voiceoverThai:
            idx === 0
              ? `ใครกำลังมองหา ${cleanName} ที่คุ้มที่สุดในตอนนี้ หยุดดูคลิปนี้ก่อนเลยครับ!`
              : idx === sceneCount - 1
              ? `วันนี้จัดโปร ${priceBadge} ของมีจำนวนจำกัด กดที่ตะกร้าเหลืองซ้ายล่างได้เลยครับ!`
              : `จุดเด่นของ ${cleanName} คือ ${sellingPoints || "คุณภาพเกรดพรีเมียม ใช้งานง่าย เห็นผลชัดเจนตั้งแต่วันแรก"}`,
          onScreenText:
            idx === 0
              ? `🔥 ห้ามพลาด! ${cleanName}`
              : idx === sceneCount - 1
              ? `🛒 ${priceBadge} · กดตะกร้าซ้ายล่าง!`
              : `✨ ${cleanName} คุ้มเกินราคา`,
          visualPromptEn: `[TOPIC LOCK: ${cleanName}] High-converting commercial 8K shot ${idx + 1} of ${cleanName}, studio lighting, crisp product focus, ${aspectRatio} vertical framing, zero in-image text, zero watches, zero unrelated objects`,
          motionPromptEn: "Dynamic commercial dolly push-in at 60fps"
        }));

        const fbPayload: HubHandoffPayload = {
          id: `aff-${Date.now()}`,
          title: `${cleanName} (${priceBadge})`,
          topic: cleanName,
          aspectRatio,
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
            .join("\n")}\n\n🛒 กดสั่งที่ตะกร้าซ้ายล่างได้เลย!`,
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
          aspectRatio,
          payload: fbPayload
        });
        showToast("สร้างสตอรี่บอร์ดปักตะกร้าเรียบร้อยแล้ว!", "success");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateScene = (sceneNumber: number, field: keyof HubSceneItem, val: string) => {
    if (!payload) return;
    const nextScenes = payload.scenes.map((s) =>
      s.sceneNumber === sceneNumber ? { ...s, [field]: val } : s
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
          aspectRatio
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
          voiceId: "EXAVITQu4vr4xnSDxMaL", // Bella - energetic reviewer voice
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
      {/* Top Department Header */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-800 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 px-2.5 py-1 rounded-lg">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>แผนกที่ 1 · PKShortClips & Affiliate Studio (Chat 88c0f026)</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              สตูดิโอทำคลิปขายของ & ปักตะกร้า (TikTok Shop / Reels / สูตร Viral)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              วางโครงคลิปปักตะกร้า 5–8 ช็อตปิดการขาย พร้อมป้ายราคาโปรโมชัน FOMO, แนบรูปสินค้าจริงล็อก Topic 100%, พากย์เสียงนักรีวิว และคลังสูตรลับขายดี
            </p>
          </div>

          {activeHandoff && (
            <button
              type="button"
              onClick={() => {
                setPayload(activeHandoff);
                setProductName(activeHandoff.productInfo?.productName || activeHandoff.title);
                showToast("ซิงค์ข้อมูลล่าสุดจากหน้า OS เข้าแผนกปักตะกร้าแล้ว!", "success");
              }}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold inline-flex items-center gap-2 self-start cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ดึงสคริปต์ล่าสุดจากหน้า OS</span>
            </button>
          )}
        </div>

        {/* 3 Modes Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            {
              id: "AFFILIATE_5SHOT" as const,
              title: "🛍️ สูตรปักตะกร้า 5-Shot ปิดการขาย",
              desc: "Hook ปัญหา ➔ โชว์สินค้า ➔ สาธิต ➔ รีวิวผลลัพธ์ ➔ ชี้เป้าตะกร้า"
            },
            {
              id: "VIRAL_STORY" as const,
              title: "🔥 สูตร Viral ละครสั้นหักมุมขายของ",
              desc: "เปิดเรื่องตลก/ดราม่าหยุดนิ้ว แล้วหักมุมเข้าสินค้าแบบเนียนๆ"
            },
            {
              id: "PHOTO_PACK" as const,
              title: "📸 เซ็ตภาพสินค้า Master Packshot",
              desc: "ภาพสินค้าสตูดิโอ + นางแบบถือสินค้า + ป้ายโปรโมชัน AIDA"
            }
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setStudioMode(m.id)}
              className={`p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                studioMode === m.id
                  ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                  : "bg-slate-50 dark:bg-zinc-800/70 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:bg-orange-50/50"
              }`}
            >
              <div className="text-xs font-extrabold">{m.title}</div>
              <div className={`text-[11px] mt-0.5 ${studioMode === m.id ? "text-orange-100" : "text-slate-500 dark:text-zinc-400"}`}>
                {m.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Product Brief Form + Reference Image Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
          <div className="lg:col-span-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  ชื่อสินค้า / บริการที่จะปักตะกร้า *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="เช่น เซรั่มกันแดดหน้าฉ่ำ, รอกตกปลา PP Fishing, กล่องอาหารคลีน..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  ป้ายราคา / โปรโมชัน FOMO กระตุ้นยอดซื้อ
                </label>
                <input
                  type="text"
                  value={priceBadge}
                  onChange={(e) => setPriceBadge(e.target.value)}
                  placeholder="เช่น ซื้อ 1 แถม 1 (199.-) ส่งฟรีวันนี้"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                จุดขายเด่น / ปัญหาของลูกค้าที่สินค้านี้ช่วยแก้ (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={sellingPoints}
                onChange={(e) => setSellingPoints(e.target.value)}
                placeholder="เช่น กันน้ำกันเหงื่อ ไม่วอก, ตีไกลไม่ฟู่, ฟรีดาวน์ 0 บาท..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <select
                  value={sceneCount}
                  onChange={(e) => setSceneCount(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                >
                  <option value={5}>5 ช็อต (15 วิ ปิดการขายไว)</option>
                  <option value={6}>6 ช็อต (18 วิ มาตรฐาน)</option>
                  <option value={8}>8 ช็อต (24 วิ รีวิวละเอียด)</option>
                </select>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as "9:16" | "16:9")}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                >
                  <option value="9:16">📱 9:16 แนวตั้ง (TikTok/Reels)</option>
                  <option value="16:9">🖥️ 16:9 แนวนอน</option>
                </select>
              </div>

              <button
                type="button"
                disabled={generating}
                onClick={handleGenerateAffiliateScript}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังวางช็อตขายของ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>สร้างสตอรี่บอร์ดปักตะกร้าทันที</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Product Reference Image Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-dashed border-slate-300 dark:border-zinc-700 flex flex-col items-center justify-center text-center gap-2">
            {productRefImage ? (
              <div className="space-y-2 w-full">
                <img
                  src={productRefImage}
                  alt="Product Reference"
                  className="w-full h-32 object-contain rounded-lg bg-white dark:bg-zinc-900 p-1 border border-slate-200 dark:border-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => setProductRefImage("")}
                  className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                >
                  ลบรูปอ้างอิง
                </button>
              </div>
            ) : (
              <>
                <Camera className="w-7 h-7 text-orange-500" />
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  แนบรูปสินค้าจริง (Product Reference)
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  ใช้ดูคู่กับ Prompt หรือส่งเข้าช่อง Reference Image ใน Google Flow
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-orange-600" />
                  <span>เลือกรูปสินค้า</span>
                </button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProductPhotoUpload}
              className="hidden"
            />
          </div>
        </div>
      </section>

      {/* Built-in Prompt Vault (72 Formulas Starter Pack) */}
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
              { id: "gadgets", label: "🎣 ตกปลา/อุปกรณ์" },
              { id: "viral", label: "😂 สูตร Viral ฮิต" }
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {/* Active Affiliate Storyboard & Cross-Department Handoff */}
      {payload && (
        <section className="space-y-4 animate-fade-in-up">
          <DepartmentHandoffBar currentDeptId="affiliate" payload={payload} />

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                  TIKTOK SHOP / REELS STORYBOARD · {payload.scenes.length} SHOTS
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
                      <span className="px-2 py-0.5 rounded bg-orange-600 text-white font-mono text-[11px] font-bold">
                        SHOT {String(scene.sceneNumber).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {scene.timecode || `${scene.durationSec}s`}
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {scene.title}
                    </div>

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
                        🔊 บทพากย์ขายของภาษาไทย:
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
                      className="min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-orange-600 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === `shot-${scene.sceneNumber}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
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
