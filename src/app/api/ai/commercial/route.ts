import { NextResponse } from "next/server";
import {
  TOP_20_ACTIONS,
  THAI_CAMERA_ANGLES_36,
  STRICT_FACIAL_CONSISTENCY_PROMPT,
  STORYBOARD_8_PANEL_COMMERCIAL,
  STORYBOARD_9_BEATS_HOLLYWOOD
} from "@/lib/constants/video-production-kb";

export interface SceneData {
  id: string;
  sceneNumber: number;
  timecode: string;
  durationSec: number;
  shotType: string;
  cameraMovement: string;
  motionPrompt?: string;
  visualPromptEn: string;
  thaiVoiceover: string;
  onScreenTextTh: string;
  textPosition?: string;
  audioSfx: string;
  status: "READY" | "RENDERED";
}

export interface ReferenceAssetGuide {
  slotNumber: number;
  slotName: string;
  requirement: string;
  reason: string;
  exampleTip: string;
}

export interface ShotTiming {
  shotNumber: number;
  startSec: number;
  endSec: number;
  durationSec: number;
  timecode: string;
}

/**
 * Calculates realistic, variable shot durations that sum up to targetDuration
 */
function calculateShotDurations(totalSeconds: number, shotCount: number): ShotTiming[] {
  const count = Math.max(1, Math.min(36, Math.round(shotCount)));
  const total = Math.max(3, Math.min(180, Number(totalSeconds) || 30));

  if (count === 1) {
    const sStr = total < 10 ? `0${total}` : `${total}`;
    return [{
      shotNumber: 1,
      startSec: 0,
      endSec: total,
      durationSec: total,
      timecode: `00:00 - 00:${sStr} (${total}s)`
    }];
  }

  // Weight distribution:
  // Hook is snappy, CTA is slightly longer, middle scenes vary organically
  const weights: number[] = [];
  for (let i = 0; i < count; i++) {
    if (i === 0) {
      weights.push(count <= 3 ? 1.0 : count <= 8 ? 0.9 : 0.85);
    } else if (i === count - 1) {
      weights.push(count <= 3 ? 1.2 : count <= 8 ? 1.25 : 1.15);
    } else {
      // Natural subtle rhythm variation
      weights.push(1.0 + 0.12 * Math.sin((i / (count - 1)) * Math.PI));
    }
  }

  const sumWeight = weights.reduce((a, b) => a + b, 0);
  let currentStart = 0;
  const result: ShotTiming[] = [];

  for (let i = 0; i < count; i++) {
    let rawDuration = (weights[i] / sumWeight) * total;
    let durationSec = Math.round(rawDuration * 10) / 10;

    if (i === count - 1) {
      durationSec = Math.round((total - currentStart) * 10) / 10;
    }
    if (durationSec < 0.8 && total >= count * 0.8) {
      durationSec = 0.8;
    }

    const endSec = Math.round((currentStart + durationSec) * 10) / 10;
    const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      const ds = Math.round((sec - Math.floor(sec)) * 10);
      const mStr = m < 10 ? `0${m}` : `${m}`;
      const sStr = s < 10 ? `0${s}` : `${s}`;
      return ds > 0 ? `${mStr}:${sStr}.${ds}` : `${mStr}:${sStr}`;
    };

    result.push({
      shotNumber: i + 1,
      startSec: currentStart,
      endSec,
      durationSec: Math.round((endSec - currentStart) * 10) / 10,
      timecode: `${formatTime(currentStart)} - ${formatTime(endSec)} (${durationSec}s)`
    });

    currentStart = endSec;
  }

  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      brand = "All Brands",
      productName = "คอนเทนต์นำเสนอพิเศษ",
      productPrice = "เซฟพิกัดตามรอย / ข้อเสนอพิเศษ",
      customOnScreenText = "",
      aspectRatio = "9:16",
      hasPresenter = true,
      hasProduct = true,
      referenceMode = "pure_prompt", // "pure_prompt" | "with_images"
      strictFaceLock = false,
      storyboardType = "standard_4",
      selectedActions = [],
      selectedCameraAngle = null,
      presenterGender = "female",
      presenterStyle = "เน้นหรู ดูแพง",
      presenterPersonas = [],
      autoPersona = true,
      environment = "สวนอังกฤษ, สถาปัตยกรรมอวกาศ, เรือนกระจกสวนมอส",
      environments = [],
      autoEnvironment = true,
      adStyle = "Cinematic Luxury",
      targetDuration = 30, // Default 30s
      sceneCount = 8, // Default 8 scenes
      pacingStyle = "standard", // "standard" | "dynamic_fast" | "cinematic_slow" | "custom"
      masterPrompt = "",
      productionMode = "multi_image",
      promptStrategy = "single_master"
    } = body;

    // Target Duration in Seconds (clamp between 4s and 180s)
    const totalSeconds = Math.max(4, Math.min(180, Number(targetDuration) || 30));

    // Determine shot count based on pacing or explicit count
    let resolvedCount = Number(sceneCount);
    if (!resolvedCount || isNaN(resolvedCount)) {
      if (pacingStyle === "dynamic_fast") {
        resolvedCount = Math.max(6, Math.min(30, Math.round(totalSeconds / 1.6)));
      } else if (pacingStyle === "cinematic_slow") {
        resolvedCount = Math.max(2, Math.min(6, Math.round(totalSeconds / 6)));
      } else {
        // Standard
        resolvedCount = totalSeconds <= 10 ? 3 : totalSeconds <= 20 ? 4 : totalSeconds <= 35 ? 8 : 12;
      }
    }
    resolvedCount = Math.max(1, Math.min(36, resolvedCount));

    // Calculate exact variable shot durations and timecodes
    const shotTimings = calculateShotDurations(totalSeconds, resolvedCount);

    // Parse optional custom on-screen Thai text instructions
    const userCustomTexts = typeof customOnScreenText === "string" && customOnScreenText.trim()
      ? customOnScreenText.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean)
      : [];

    const combinedStr = `${brand} ${productName} ${productPrice}`.toLowerCase();

    // Specific Domain Detections (Strictly Separated & Accurate)
    const isFishOrPlaSom =
      combinedStr.includes("ปลาส้ม") ||
      combinedStr.includes("ปลา") ||
      combinedStr.includes("fish") ||
      combinedStr.includes("ทอดปลา") ||
      combinedStr.includes("ปลากรอบ") ||
      combinedStr.includes("ซีฟู้ด");

    const isPadGaprao =
      !isFishOrPlaSom &&
      (combinedStr.includes("กะเพรา") ||
       combinedStr.includes("gaprao") ||
       combinedStr.includes("ใบกะเพรา"));

    const isCooking =
      isFishOrPlaSom ||
      isPadGaprao ||
      combinedStr.includes("อาหาร") ||
      combinedStr.includes("ผัด") ||
      combinedStr.includes("ไข่ดาว") ||
      combinedStr.includes("ทำอาหาร") ||
      combinedStr.includes("ครัว") ||
      combinedStr.includes("สูตร") ||
      combinedStr.includes("หมูสับ") ||
      combinedStr.includes("เนื้อ") ||
      combinedStr.includes("พริก") ||
      combinedStr.includes("กระเทียม") ||
      combinedStr.includes("cooking") ||
      combinedStr.includes("คั่ว") ||
      combinedStr.includes("กระทะ") ||
      combinedStr.includes("ต้ม") ||
      combinedStr.includes("ทอด") ||
      combinedStr.includes("แกง") ||
      combinedStr.includes("ของกิน") ||
      combinedStr.includes("จานเด็ด") ||
      combinedStr.includes("เมนู") ||
      combinedStr.includes("อร่อย");

    const isGraduation =
      combinedStr.includes("รับปริญญา") ||
      combinedStr.includes("ชุดครุย") ||
      combinedStr.includes("บัณฑิต");

    const isTemple =
      combinedStr.includes("วัด") ||
      combinedStr.includes("ทำบุญ") ||
      combinedStr.includes("ไหว้พระ") ||
      combinedStr.includes("สายมู") ||
      combinedStr.includes("พระธาตุ") ||
      combinedStr.includes("อาราม") ||
      combinedStr.includes("พุทธ");

    const isDinosaurOrWildlife =
      combinedStr.includes("ไดโนเสาร์") ||
      combinedStr.includes("dinosaur") ||
      combinedStr.includes("จูราสสิก") ||
      combinedStr.includes("jurassic") ||
      combinedStr.includes("ป่าดึกดำบรรพ์") ||
      combinedStr.includes("สัตว์โลก") ||
      combinedStr.includes("ป่าลึก") ||
      combinedStr.includes("wildlife") ||
      combinedStr.includes("สารคดี") ||
      combinedStr.includes("documentary") ||
      combinedStr.includes("prehistoric") ||
      combinedStr.includes("สัตว์ป่า") ||
      combinedStr.includes("บรรพชีวิน") ||
      combinedStr.includes("ไดโน") ||
      combinedStr.includes("dino");

    const isAuto =
      combinedStr.includes("mazda") ||
      combinedStr.includes("byd") ||
      combinedStr.includes("รถ") ||
      combinedStr.includes("car") ||
      combinedStr.includes("ev");

    const isFishing = combinedStr.includes("fishing") || combinedStr.includes("ตกปลา");

    const isTravel =
      !isCooking &&
      !isGraduation &&
      !isTemple &&
      !isAuto &&
      !isFishing &&
      (combinedStr.includes("เชียงใหม่") ||
       combinedStr.includes("คาเฟ่") ||
       combinedStr.includes("cafe") ||
       combinedStr.includes("เที่ยว") ||
       combinedStr.includes("พิกัดลับ") ||
       combinedStr.includes("ทริป") ||
       combinedStr.includes("trip") ||
       combinedStr.includes("แพลน") ||
       combinedStr.includes("วันเดย์ทริป") ||
       (productName.toLowerCase().includes("พิกัด") || brand.toLowerCase().includes("พิกัด")) ||
       (productName.toLowerCase().includes("ถ่ายรูป") || brand.toLowerCase().includes("ถ่ายรูป")));

    // Dynamic Multi-Select & Auto Resolutions
    let resolvedPersonaList: string[] = [];
    if (hasPresenter) {
      resolvedPersonaList = Array.isArray(presenterPersonas) && presenterPersonas.length > 0
        ? presenterPersonas
        : [presenterStyle];

      if (autoPersona) {
        if (isDinosaurOrWildlife) {
          resolvedPersonaList = ["นักสำรวจสารคดีสัตว์โลก & นักบรรพชีวินวิทยา (National Geographic Safari Explorer)", "ผู้สังเกตการณ์สัตว์ป่าดึกดำบรรพ์ (Khaki Safari Gear)"];
        } else if (isGraduation) {
          resolvedPersonaList = ["บัณฑิตสาวสดใส (ชุดครุย/ชุดขาวมินิมอล)", "ช่างภาพสายคอนเทนต์ (ฟีลอบอุ่น)", "ลุคธรรมชาติ Clean Korean Tone"];
        } else if (isTemple) {
          resolvedPersonaList = ["นักท่องเที่ยวสายบุญ/สายวัฒนธรรม แต่งกายสุภาพเรียบร้อย เรียบหรู", "ผู้ดำเนินรายการสายท่องเที่ยวเชิงวัฒนธรรม"];
        } else if (isCooking) {
          resolvedPersonaList = ["เชฟรุ่นใหม่ สดใส ลุคโฮมเมด สวมผ้ากันเปื้อนมินิมอล", "ฟู้ดครีเอเตอร์สายป้ายยา"];
        } else if (isTravel) {
          resolvedPersonaList = ["Travel Blogger & นักสำรวจเมือง", "ครีเอเตอร์สายท่องเที่ยว ลุคมินิมอลลินิน สดใส"];
        } else if (isAuto) {
          resolvedPersonaList = ["ผู้บริหารรุ่นใหม่ เท่ สุขุม ดูแพง", "เจ้าของรถผู้หลงใหลในสมรรถนะ"];
        } else if (isFishing) {
          resolvedPersonaList = ["นักตกปลาสายสปอร์ต แอคทีฟ ลุยธรรมชาติ"];
        } else {
          resolvedPersonaList = ["เน้นหรู ดูแพง (Luxury & Modern)", "ครีเอเตอร์สายรีวิวเป็นกันเอง"];
        }
      }
    }

    let resolvedEnvironmentList = Array.isArray(environments) && environments.length > 0
      ? environments
      : [environment];

    if (autoEnvironment) {
      if (isDinosaurOrWildlife) {
        resolvedEnvironmentList = [
          "ป่าดึกดำบรรพ์ยุคจูราสสิก แสงแดดส่องทะลุยอดไม้สูง ต้นเฟิร์นโบราณยักษ์ หมอกยามเช้าลอยเหนือน้ำ",
          "หุบเขาไดโนเสาร์ ลำธารน้ำตกใสสะอาด พืชพรรณยุคโบราณ ดินชื้นธรรมชาติ",
          "ทุ่งหญ้าสะวันนาดึกดำบรรพ์ แสงสีทองยามเย็น (Golden Hour) ผาหินโบราณตระหง่าน"
        ];
      } else if (isCooking) {
        resolvedEnvironmentList = [
          "ห้องครัวสไตล์สแกนดิเนเวียน ไม้โอ๊คอบอุ่น เคาน์เตอร์หินอ่อนสีขาว",
          "แสงแดดธรรมชาติส่องกระทบผิวกระทะและเครื่องครัวพรีเมียม"
        ];
      } else if (isGraduation) {
        resolvedEnvironmentList = [
          "สวนอังกฤษและสะพานหิน Fleur Cafe (แม่ริม)",
          "สถาปัตยกรรมอวกาศทรงกลม Pluto Cafe (สันทราย)",
          "เรือนกระจกสวนมอสป่าเฟิร์น Fern Forest (คูเมือง)",
          "แสงธรรมชาติ Golden Hour ยามบ่ายสี่โมงครึ่ง วิวดอยสุเทพ"
        ];
      } else if (isTemple) {
        resolvedEnvironmentList = [
          "พระธาตุดอยสุเทพและลานเจดีย์สีทองอร่ามรับแสงอรุณ",
          "วัดผาลาด (สกทาคามี) ซ่อนตัวกลางป่าและธารน้ำตกธรรมชาติ",
          "วัดเจดีย์หลวง วิหารไม้สักโบราณและสถาปัตยกรรมล้านนาอันทรงคุณค่า",
          "แสงธรรมชาติยามเย็นส่องกระทบจิตรกรรมฝาผนังและลานธรรมอันสงบ"
        ];
      } else if (isTravel) {
        resolvedEnvironmentList = [
          "จุดชมวิวยอดดอย สัมผัสทะเลหมอกและแสงอาทิตย์ยามเช้า",
          "ถนนคนเดินและย่านเมืองเก่า สถาปัตยกรรมล้านนาผสมโมเดิร์น",
          "คาเฟ่บรรยากาศร่มรื่นริมลำธารธรรมชาติแม่ริม",
          "จุดชมพระอาทิตย์ตกดินแสงสีทองเหนือเทือกเขาเชียงใหม่"
        ];
      } else if (isAuto) {
        resolvedEnvironmentList = [
          "สตูดิโอโมเดิร์นพร้อมไฟ Rim Light หรูหรา",
          "ถนนโค้งวิวภูเขายามเย็น Sunset Scenic Highway",
          "โชว์รูมไฮเอนด์ พื้นอีพ็อกซีสะท้อนเงาคมกริบ"
        ];
      } else if (isFishing) {
        resolvedEnvironmentList = [
          "อ่างเก็บน้ำธรรมชาติยามเช้า มีหมอกเรี่ยผิวน้ำ",
          "แพตกปลากลางธรรมชาติ แสงอาทิตย์แรกของวัน"
        ];
      } else {
        resolvedEnvironmentList = [
          "สตูดิโอโมเดิร์น คลีน มินิมอล",
          "ฉากสตรีทไลฟ์สไตล์ใจกลางเมือง"
        ];
      }
    }

    const effectivePersonaText = hasPresenter ? resolvedPersonaList.join(" + ") : "ไม่มีพรีเซนเตอร์ (เน้นสินค้าและบรรยากาศล้วน)";
    const effectiveEnvironmentText = resolvedEnvironmentList.join(" / ");

    // Gender styling (Domain Aware)
    const genderEn = isDinosaurOrWildlife
      ? (presenterGender === "female"
          ? "courageous Asian female wildlife explorer (25-28 y/o) in khaki safari expedition gear with binoculars"
          : presenterGender === "male"
            ? "courageous Asian male wildlife explorer (26-29 y/o) in khaki safari field apparel with binoculars"
            : "wildlife documentary explorer expedition team")
      : isCooking
      ? (presenterGender === "female"
          ? "talented Asian female chef/food creator (24-27 y/o) in minimalist modern apron"
          : presenterGender === "male"
            ? "talented Asian male chef/food creator (26-29 y/o) in stylish chef apron"
            : "charismatic Asian culinary creator duo")
      : isGraduation
      ? (presenterGender === "female"
          ? "radiant Asian female graduate (22-24 y/o) in academic graduation gown"
          : presenterGender === "male"
            ? "proud Asian male graduate (22-24 y/o) in academic graduation gown"
            : "radiant Asian graduate duo celebrating")
      : isTemple
        ? (presenterGender === "female"
            ? "respectful Asian female traveler (24-27 y/o) in elegant modest linen attire"
            : presenterGender === "male"
              ? "respectful Asian male traveler (26-29 y/o) in neat smart casual attire"
              : "respectful Asian travel companions")
        : isTravel
          ? (presenterGender === "female"
              ? "stylish Asian female traveler (24-27 y/o) in casual chic travel outfit"
              : presenterGender === "male"
                ? "stylish Asian male traveler with camera strap (26-29 y/o) in modern travel outfit"
                : "charismatic Asian travel duo")
          : (presenterGender === "female"
              ? "radiant Asian female presenter (24-27 y/o)"
              : presenterGender === "male"
                ? "stylish Asian male presenter (26-29 y/o)"
                : "charismatic Asian duo/presenter couple");

    const isPurePrompt = referenceMode === "pure_prompt";

    // Domain-Specific Camera Lens & Lighting Atmosphere for Pure Prompt Generation
    const domainCameraSpecs = isDinosaurOrWildlife
      ? {
          lens: "RED Monstro 8K with Canon CN-E 30-300mm Cinema Zoom lens, BBC Earth & National Geographic wildlife documentary cinematography",
          lighting: "volumetric morning god rays piercing through dense prehistoric rainforest canopy, glistening dew on giant ferns, ethereal humid mist",
          grading: "cinematic National Geographic wildlife 35mm film grade, rich emerald flora, earthy primeval tones, 8K hyper-realistic texture"
        }
      : isCooking
      ? {
          lens: "Cooke Anamorphic /i 85mm T2.3 prime lens, shallow depth of field, creamy circular bokeh",
          lighting: "dramatic culinary chiaroscuro rim lighting, glowing amber gas burner flares, soft diffuse natural fill, translucent rising steam plumes",
          grading: "ARRI Alexa LF commercial food grading, rich warm amber highlights, deep organic shadows, 8K ultra photorealistic"
        }
      : isGraduation
      ? {
          lens: "Canon Cinema Prime 85mm f/1.4 lens, dreamy background blur, razor-sharp eye focus",
          lighting: "golden hour 16:30 diagonal backlight, soft warm lens flare, ambient botanical bounce",
          grading: "warm filmic Korean commercial color palette, glowing skin tones, 8K ultra photorealistic"
        }
      : isTemple
      ? {
          lens: "Zeiss Supreme Prime 35mm T1.5 lens, crisp architectural depth and majestic perspective",
          lighting: "serene early morning sun cutting through mountain mist, golden stupa specular glints, soft incense haze",
          grading: "tranquil cinematic film grade, natural emerald foliage tones, 8K photorealism"
        }
      : isAuto
      ? {
          lens: "Cooke Anamorphic 50mm T2.3 lens, horizontal anamorphic blue streak flares, razor-sharp contours",
          lighting: "high-contrast studio softbox reflections, sculpted rim lighting tracing aerodynamic curves, twilight dusk horizon",
          grading: "luxury automotive commercial grading, deep metallic luster, 8K ultra photorealistic"
        }
      : isTravel
      ? {
          lens: "ARRI Master Prime 35mm f/1.8 lens, expansive cinematic framing with natural depth",
          lighting: "golden morning sunlight filtering through tree canopy, crisp sparkling water reflections, soft volumetric haze",
          grading: "vibrant wanderlust travel editorial grade, Kodak 5207 warmth, 8K photorealism"
        }
      : {
          lens: "Cinema Prime 50mm f/1.8 lens, clean commercial framing, shallow depth of field",
          lighting: "studio three-point commercial lighting, clean softbox key, subtle accent hair light",
          grading: "clean modern luxury commercial grade, 8K photorealism"
        };

    // 1. AI REFERENCE ASSET RECOMMENDATIONS
    const referenceAssetRecommendations: ReferenceAssetGuide[] = [];

    if (isPurePrompt) {
      referenceAssetRecommendations.push({
        slotNumber: 1,
        slotName: "✨ โหมด Prompt ล้วน (Pure Prompt to Video Mode)",
        requirement: "ไม่ต้องอัปโหลดรูปภาพอ้างอิงใดๆ ทั้งสิ้นใน Google Flow",
        reason: "Prompt แต่ละช็อตได้รับการบรรยายลักษณะหน้าตา วัตถุดิบ แสง และมุมกล้องอย่างละเอียดครบถ้วนแล้ว",
        exampleTip: "สามารถคัดลอก Master Directive ไปวางรัน หรือก๊อปปี้ Visual Prompt รายช็อตไปเจนในเมนู Videos ได้ทันที 100%"
      });
    } else {
      if (hasPresenter) {
        referenceAssetRecommendations.push({
          slotNumber: referenceAssetRecommendations.length + 1,
          slotName: isCooking ? "Slot 1: Chef / Food Creator Reference (รูปคน/เชฟ)" : "Slot 1: Character Sheet / Presenter Reference (รูปคน)",
          requirement: isCooking
            ? "ภาพถ่ายหน้าตรง/ครึ่งตัวของเชฟ หรือผู้ดำเนินรายการ สวมผ้ากันเปื้อนมินิมอล แสงสตูดิโอคลีน"
            : isGraduation
              ? "ภาพถ่ายหน้าตรง/ครึ่งตัวของบัณฑิต หรือนางแบบในชุดครุย หรือชุดขาวมินิมอล แสงธรรมชาติ"
              : isTemple
                ? "ภาพถ่ายหน้าตรง/ครึ่งตัวของพรีเซนเตอร์ แต่งกายสุภาพเรียบร้อย แสงธรรมชาติ"
                : "ภาพถ่ายหน้าตรง/มุม 45 องศาของพรีเซนเตอร์ แสงคลีน เป็นธรรมชาติ",
          reason: "ใช้สำหรับ FaceID / IP-Adapter Face ล็อกหน้าตา ทรงผม และสีผิวให้เป๊ะทุกช็อต ไม่เปลี่ยนหน้า",
          exampleTip: "แนะนำภาพความละเอียดสูง โฟกัสตาชัด ไม่มีแว่นกันแดดบัง"
        });
      }

      if (hasProduct) {
        referenceAssetRecommendations.push({
          slotNumber: referenceAssetRecommendations.length + 1,
          slotName: isCooking ? "Slot 2: Culinary Dish / Food Packshot (รูปอาหาร/วัตถุดิบ)" : "Slot 2: Product Packshot Reference (รูปสินค้า)",
          requirement: isCooking
            ? `ภาพถ่ายจานอาหาร ${productName} หน้าตรง และมุมเฉียง 45 องศา หรือภาพวัตถุดิบหลัก แสงธรรมชาติคมชัด`
            : isAuto
              ? "ภาพรถยนต์ตัวถังภายนอก โลโก้ และคอนโซลภายใน"
              : isGraduation
                ? "ภาพชุดครุย ปริญญาบัตร หรืออุปกรณ์กล้องถ่ายรูป"
                : isTemple
                  ? "ภาพองค์พระพุทธรูป สถาปัตยกรรมพระเจดีย์ หรือสถานที่สำคัญในวัด"
                  : `ภาพถ่ายเดี่ยวของ ${productName} หน้าตรง และมุมเฉียง พร้อมฉลากชัดเจน`,
          reason: "ใช้สำหรับ ControlNet / Product Reference เพื่อล็อกขนาด ทรง และหน้าตาอาหารให้ตรงปก 100%",
          exampleTip: isCooking ? "ภาพจานอาหารที่จัดเสร็จแล้วบนจานเซรามิกสวยงาม หรือวัตถุดิบสดบนเขียงไม้" : "วางบนพื้นหลังขาวหรือฉากสตูดิโอเรียบหรู"
        });
      }

      referenceAssetRecommendations.push({
        slotNumber: referenceAssetRecommendations.length + 1,
        slotName: `Slot ${referenceAssetRecommendations.length + 1}: Style & Lighting Reference (สไตล์และแสง)`,
        requirement: "ภาพถ่ายเรฟโทนภาพ เช่น Cinematic Warm Sun, Nordic Minimal หรือ Clean Luxury Studio",
        reason: "ควบคุมมู้ดแอนด์โทน แสงสะท้อน และสีสันในทุกซีนให้สอดคล้องกันทั้งคลิป",
        exampleTip: "เลือกภาพที่มี Contrast นุ่มนวล แสงเฉียง Golden Hour"
      });
    }

    // 2. Action Direction
    const actionPrompts = Array.isArray(selectedActions) && selectedActions.length > 0
      ? selectedActions.join(", ")
      : hasPresenter
        ? (isCooking
            ? "stir-frying ingredients in hot wok, tasting with spoon, presenting delicious dish with confident smile"
            : hasProduct ? "holding product, presenting product, confident smile" : "smiling, looking at camera, waving")
        : "cinematic slow pan, macro details";

    // 3. DYNAMIC SCENE BLUEPRINT BUILDER (1 to 36 SCENES)

    const generatedScenes: SceneData[] = [];

    // ==========================================
    // CULINARY MASTER POOL (8 CORE NARRATIVE BEATS)
    // ==========================================
    const cookingMasterPool8 = [
      {
        type: "เปิดเรื่อง (Wok Fire Burst & Sizzle Hook)",
        camera: "Dynamic Low-Angle Macro Whip In 100mm",
        motion: `Photorealistic 8K image-to-video. Chef's hand firmly grips wooden handle of seasoned black carbon steel wok over roaring gas burner. Swirling fragrant oil, then dropping crushed fiery red Thai chilies and minced purple garlic into smoking oil. Micro-bubbles violently pop with aggressive sizzling. Controlled burst of golden-orange wok-hei flame flares gracefully along back edge of wok. White translucent steam plumes rise vertically into amber backlight. Spatula quickly flips aromatics. Low-angle macro push with locked focal plane on sizzling chili seeds. Rigid cookware geometry, authentic fluid dynamics, zero morphing, 24fps.`,
        prompt: isPurePrompt
          ? `Photorealistic 8K cinematic commercial hook. Blazing wok hei flame flare bursting from seasoned black carbon steel wok. Extreme close-up of coarsely crushed red and green Thai bird's eye chilies and minced purple garlic sizzling vigorously in bubbling smoking oil, glowing embers, rising translucent steam plumes. ${hasPresenter ? `${genderEn} skillfully tossing ingredients with authentic confident smile.` : "Pure culinary craftsmanship."} Shot on ARRI Alexa LF with ${domainCameraSpecs.lens}. Lighting: ${domainCameraSpecs.lighting}. Grading: ${domainCameraSpecs.grading}. Pure cinematography, zero in-image text, zero watermarks. --ar ${aspectRatio}`
          : `Photorealistic 8K cinematic commercial hook. Blazing wok hei flame flare bursting from seasoned black cast iron wok. Extreme close-up of crushed red bird's eye chilies and minced garlic sizzling vigorously in smoking oil. Dramatic amber culinary rim lighting, rising steam plumes. ${hasPresenter ? `${genderEn} expertly tossing ingredients with ${actionPrompts}. [Slot 1 Face Anchor]: Lock face to Slot 1 reference.` : "Pure culinary artistry."} [Slot 2 Dish Anchor]: Lock dish look to Slot 2 packshot. Pure cinematography, zero text or watermarks in frame. --ar ${aspectRatio}`,
        voice: "เคยสงสัยไหมครับ... ทำไมผัดกะเพราแท้ๆ ถึงต้องผัดจนกระทะไหม้เกรียม และมีสีเข้มจัดขนาดนี้!",
        text: "ความลับกะเพราคั่วกระทะไหม้ 🔥",
        textPos: "Top Headline",
        sfx: "Fierce gas burner roar, energetic wok sizzle, cracking dried chili pop."
      },
      {
        type: "ตำเครื่องแกง (Crushed Chili & Fragrant Garlic)",
        camera: "Overhead 90-Degree Top Down Macro Push",
        motion: `Photorealistic 8K image-to-video. Overhead top-down macro view. Two hands holding solid dark granite pestle firmly pounding inside stone mortar, rhythmically crushing fresh red bird's eye chilies and purple garlic cloves. Droplets of spicy chili oil and bruised garlic skins bounce with authentic kinetic physics. Hand uses small spoon to scrape the aromatic crushed paste onto wooden board next to fresh dewy holy basil leaves. Downward camera push, locked depth of field, authentic granite textures, zero warping, 24fps.`,
        prompt: isPurePrompt
          ? `Artisan rustic flat-lay overhead shot on dark charred timber surface. Coarsely crushed fiery red and green Thai bird's eye chilies, bruised Thai purple garlic cloves with scorched skins, and freshly plucked dark holy basil leaves glistening with dew droplets. Fresh raw ingredients ready for high-heat stir-fry. Shot on ARRI Alexa LF with 50mm Cine Prime lens. Lighting: soft directional natural window light with subtle warm side fill. Grading: rich organic natural food tones, 8K ultra photorealistic, zero text. --ar ${aspectRatio}`
          : `Artisan rustic flat-lay on dark charred wood surface. Coarsely crushed red and green Thai bird's eye chilies, bruised Thai purple garlic cloves, and fresh dark holy basil leaves glistened with dew droplets. [Slot 2 Product Anchor]: Match ingredients to Slot 2 reference. Editorial culinary photography, shallow depth of field. --ar ${aspectRatio}`,
        voice: "หัวใจแรกคือพริกแห้งคั่วและกระเทียมไทยตำหยาบ ที่ต้องลงน้ำมันร้อนจัดเพื่อดึงน้ำมันหอมระเหยออกมาให้สุด",
        text: "พริกแห้งคั่ว & กระเทียมไทย 🧄",
        textPos: "Lower Third",
        sfx: "Rhythmic granite mortar pestle crush, ambient kitchen foley."
      },
      {
        type: "ผัดไฟแรงสูง (High-Heat Sizzling Minced Meat)",
        camera: "High-Speed 120fps Slow Motion Wok Action",
        motion: `Photorealistic 8K image-to-video. 120fps high-speed macro slow motion inside searing cast iron wok. A portion of juicy coarse ground meat hits smoking hot iron with aggressive crackle. Sizzling fat bubbles rapidly around meat bits. Chef wielding stainless steel spatula firmly presses and breaks apart minced meat, flipping it across dark wok surface. Rich dark golden-brown Maillard caramelization crusts form on edges. Whisps of savory steam swirl upwards. Rigid spatula and wok physics, ultra-realistic sizzling meat textures, 24fps.`,
        prompt: isPurePrompt
          ? `Extreme macro 120fps slow-motion capture inside searing hot cast iron wok. Juicy coarsely ground meat hitting glowing metal, sizzling aggressively, savory juices vaporizing instantly, edges caramelizing into rich dark golden brown with visible crispy charred bits, intense Maillard browning reaction. Shot on Phantom Flex 4K with 100mm Macro lens. Lighting: intense directional rim light highlighting glistening meat juices. Grading: commercial food grade, zero text. --ar ${aspectRatio}`
          : `Extreme macro 120fps slow-motion capture inside searing wok. Juicy coarsely ground meat hitting blazing iron, savory juices vaporizing instantly, edges caramelizing into golden brown perfection with visible crispy burnt bits. [Slot 2 Dish Anchor]: Match meat texture to Slot 2 packshot. --ar ${aspectRatio}`,
        voice: "ใส่หมูสับลงไป ใช้ไฟแรงสุดคั่วจนแห้งเกรียม เกิดปฏิกิริยา Maillard Reaction ที่ทำให้เนื้อมีกลิ่นหอมรมควันเฉพาะตัว",
        text: "ไฟแรงคั่วแห้ง Maillard Reaction 🥩",
        textPos: "Center Punchy",
        sfx: "Intense sizzling meat crackle, metal spatula scraping hot iron."
      },
      {
        type: "ซอสไหม้ขอบกระทะ (Wok Edge Glaze Caramelization)",
        camera: "Close-up 60fps Rim Pour & Steam Plume",
        motion: `Photorealistic 8K image-to-video. Macro 60fps profile shot of red-hot wok rim. A silver ladle pours continuous thin stream of dark umami soy sauce and fish sauce directly onto scorching interior slope of wok. Liquid instantly sizzles violently and flash-vaporizes into a thick, aromatic billow of white steam. Bubbling brown sauce runs down into minced meat as chef swiftly tosses wok forward and back, coating every glistening grain of meat in lustrous dark amber glaze. Buttery smooth focus, zero morphing, 24fps.`,
        prompt: isPurePrompt
          ? `Cinematic macro 60fps of rich dark umami soy sauce and fish sauce drizzled directly onto the scorching glowing rim of the wok. Sauce flash-caramelizing into aromatic smoky vapor, coating the sizzling minced meat in a glossy dark amber glaze with glistening savory oils. Shot on ARRI Alexa LF with 85mm prime lens. Lighting: low-key dramatic backlight illuminating the rising steam plumes. Pure cinematography, zero text. --ar ${aspectRatio}`
          : `Cinematic macro of rich dark umami soy sauce and fish sauce drizzled directly onto the red-hot glowing rim of the wok. Sauce flash-caramelizing into aromatic smoky steam, coating the sizzling minced pork in a glossy dark amber glaze. [Slot 2 Dish Anchor]: Match sauce color to Slot 2 reference. --ar ${aspectRatio}`,
        voice: "เคล็ดลับสีเข้มคือการราดซอสที่ขอบกระทะร้อนจัด ให้ซอสไหม้นิดๆ เคลือบเนื้อทุกชิ้นจนเงาวับ",
        text: "ราดซอสขอบกระทะ หอมกลิ่นไหม้ ✨",
        textPos: "Lower Third",
        sfx: "Dramatic sauce hiss on red-hot metal, deep aromatic steam whoosh."
      },
      {
        type: "ใบกะเพราสะบัดไฟ (Holy Basil Explosion & Fast Toss)",
        camera: "Dynamic Wok Toss & Kinetic Motion",
        motion: `Photorealistic 8K image-to-video. High-speed capture of fresh dark green Thai holy basil leaves showered by hand into steaming wok. Chef's wrist jerks wok upward, launching caramelized meat and basil leaves in graceful airborne parabolic arc. Leaves tumble mid-air through rising golden steam embers and land back into wok, instantly wilting upon contact with hot meat into glistening dark emerald gloss. Gas burner clicks off, flame receding. Rigid cookware physics, zero warping, 24fps.`,
        prompt: isPurePrompt
          ? `Dynamic high-speed capture of fresh dark green Thai holy basil leaves showered into the searing wok, tossed gracefully mid-air through golden steam embers, wilting within seconds to release intense peppery aroma and glossy dark emerald sheen. Shot on ARRI Alexa LF with 35mm wide cine lens. Lighting: ambient gas flame glow contrasting with soft overhead key. Pure cinematography, zero text. --ar ${aspectRatio}`
          : `High-speed capture of fresh dark green Thai holy basil leaves showered into the searing wok, tossed gracefully mid-air through golden steam embers, wilting within seconds to release intense peppery aroma. [Slot 2 Dish Anchor]: Match holy basil appearance to Slot 2 reference. --ar ${aspectRatio}`,
        voice: "สะบัดใบกะเพราลงไป ปิดไฟทันทีแล้วคลุกเร็วๆ เพื่อล็อกความหอมฉุนเผ็ดร้อนไว้ ไม่ให้ใบดำเฉา",
        text: "สะบัดกะเพราปิดไฟ ล็อกความหอม 🌿",
        textPos: "Lower Third",
        sfx: "Satisfying wok toss sweep, leaves fluttering into heat, quick sizzle."
      },
      {
        type: "ทอดไข่ดาวขอบกรอบ (Crispy Lace Fried Egg)",
        camera: "Macro 100mm Forward Push with 4K Depth of Field",
        motion: `Photorealistic 8K image-to-video. Extreme macro of Thai-style crispy fried egg sizzling in small wok of hot bubbling oil. Outer egg white ruffles into ultra-crispy golden-brown lace with popping micro-bubbles. Center plump vibrant orange liquid egg yolk wobbles gently with real surface tension. Slotted brass skimmer lifts crispy egg out of oil, letting excess golden drops drain back down. Camera pushes forward smoothly, tack-sharp focus on glistening yolk, 24fps.`,
        prompt: isPurePrompt
          ? `Mouthwatering extreme macro of authentic Thai-style crispy fried egg. Golden ruffled lace edges bubbling crisply, crowned by a rich vibrant runny orange egg yolk gently placed atop steaming hot fluffy jasmine rice bowl. Shot on ARRI Alexa LF with 100mm Macro f/2.8. Lighting: soft diffuse top-down softbox with glistening oil specular highlights. Pure cinematography, zero text. --ar ${aspectRatio}`
          : `Mouthwatering macro of authentic Thai-style crispy fried egg. Golden ruffled lace edges bubbling crisply, crowned by a rich vibrant runny orange egg yolk gently placed atop steaming jasmine rice bowl. [Slot 2 Product Anchor]: Match egg presentation to Slot 2 reference. --ar ${aspectRatio}`,
        voice: "และจะขาดไม่ได้เด็ดขาด ไข่ดาวขอบกรอบฟู ไข่แดงเยิ้มๆ วางบนข้าวสวยร้อนๆ หอมมะลิแท้",
        text: "ไข่ดาวลาวา ขอบกรอบฟู 🍳",
        textPos: "Center Punchy",
        sfx: "Crispy fried egg sizzling bubble, soft rice steam whisper."
      },
      {
        type: "เจาะไข่แดงลาวา (The Master Plating & Yolk Break)",
        camera: "Slow Slider In with 85mm Bokeh",
        motion: `Photorealistic 8K image-to-video. 60fps macro close-up. Steaming artisan plate of dark caramelized Pad Gaprao served over jasmine rice with crispy fried egg. Stainless steel spoon enters frame and gently punctures delicate membrane of egg yolk. Thick, velvety, rich golden yolk slowly cascades down across glistening spicy meat and wilted basil in luscious decadent flow. Real fluid viscosity, rising soft steam, mouthwatering shine. Slider push on 85mm lens, zero morphing, 24fps.`,
        prompt: isPurePrompt
          ? `Steaming artisan plate of dark caramelized Pad Gaprao served over warm jasmine rice. A silver spoon gently pierces the runny egg yolk, rich golden yolk flowing luxuriantly over glossy spicy dark meat, chili flakes, and wilted basil. Shot on ARRI Alexa LF with 85mm T1.5 lens, shallow depth of field, creamy circular bokeh. Lighting: warm golden backlight, soft side fill. Pure cinematography, zero text. --ar ${aspectRatio}`
          : `Steaming plate of dark caramelized Pad Gaprao served over warm jasmine rice. A spoon gently pierces the runny egg yolk, rich golden yolk flowing luxuriantly over glossy spicy dark meat, chili flakes, and wilted basil. [Slot 2 Dish Anchor]: Match finished plate to Slot 2 packshot. Ultra photorealistic food commercial. --ar ${aspectRatio}`,
        voice: "ตักกะเพราคั่วร้อนๆ ราดทับลงไป กลิ่นควันกระทะตีขึ้นจมูก ชวนน้ำลายสอตั้งแต่คำแรก",
        text: "กลิ่นควันกระทะฉ่ำๆ คำแรกฟิน 🤤",
        textPos: "Top Center",
        sfx: "Spoon piercing crisp egg, rich savory drip, upbeat culinary groove."
      },
      {
        type: "เผยผลลัพธ์ & Call to Action (Heroic Culinary Showcase)",
        camera: "Centered Master Culinary Pullback",
        motion: hasPresenter
          ? `Photorealistic 8K image-to-video. Heroic wide-to-medium camera pullback. Complete artisan plate of Pad Gaprao steams gently under warm commercial key light on dark wooden table. ${genderEn} standing proudly, raising hands in welcoming gesture with warm genuine smile, natural eye contact with camera, relaxed breathing, zero facial warping. Camera glides smoothly back settling into stable hero frame with clean negative space, 24fps.`
          : `Photorealistic 8K image-to-video. Heroic wide-to-medium camera pullback. Complete artisan plate of Pad Gaprao steams gently under warm commercial key light on dark wooden table. Award-winning restaurant presentation with clean composition. Camera glides smoothly back settling into stable hero frame with clean negative space, 24fps.`,
        prompt: isPurePrompt
          ? `Heroic 8K master culinary presentation of the complete dish on dark artisan ceramic plate with chopsticks and spoon. Soft natural daylight mingling with warm amber backlight, steam drifting gently upward. ${hasPresenter ? `${genderEn} smiling warmly with inviting gesture.` : "Award-winning restaurant presentation."} Shot on ARRI Alexa LF, 50mm Master Prime. Commercial color grading, pure cinematography, zero visible text or watermarks. --ar ${aspectRatio}`
          : `Heroic 8K master culinary presentation of the complete dish on dark artisan ceramic plate. Soft natural daylight mingling with warm amber backlight, steam drifting gently upward. ${hasPresenter ? `${genderEn} smiling warmly with thumb up. [Slot 1 Face Anchor]: Match face to Slot 1.` : ""} [Slot 2 Dish Anchor]: Match plate to Slot 2 packshot. Pure cinematography, zero text. --ar ${aspectRatio}`,
        voice: "นี่คือรสชาติกะเพราแท้ที่ทุกคนตามหา เซฟสูตรนี้ไว้ลองทำตาม หรือกดติดตามไว้ เมนูเด็ดต่อไปรออยู่ครับ!",
        text: "เซฟสูตรกดติดตามด่วน! 🍽️",
        textPos: "Bottom Center CTA",
        sfx: "Signature luxury brand crescendo, triumphant culinary chime."
      }
    ];

    // ==========================================
    // CULINARY EXPANDED POOL (16 FULL SEQUENCED SCENES)
    // ==========================================
    const cookingMasterPool16 = [
      cookingMasterPool8[0], // 1. Wok Fire Burst
      cookingMasterPool8[1], // 2. Pounding Aromatics
      {
        type: "คั่วพริกกระเทียมลงน้ำมัน (Aromatics Hitting Smoking Oil)",
        camera: "Low-Angle Macro Sizzle Track",
        motion: `Photorealistic 8K image-to-video. Crushed chilies and garlic slide from wooden spatula into smoking wok oil. Instant eruption of sizzling micro-bubbles, releasing translucent aromatic vapor. Chef swirls wok in smooth circular wrist motion. Cookware stays rigid, zero morphing, 24fps.`,
        prompt: `Cinematic macro of crushed red chili and purple garlic sizzling in shimmering oil in cast iron wok. Rich golden embers, rising steam. ARRI Alexa LF, 85mm prime lens. --ar ${aspectRatio}`,
        voice: "พริกกระเทียมลงกระทะร้อนๆ ผัดจนกลิ่นฉุนเตะจมูก น้ำมันเคลือบทั่วกระทะ",
        text: "ผัดพริกกระเทียมหอมฟุ้ง 🧄",
        textPos: "Lower Third",
        sfx: "Aggressive oil sizzle, light metal spatula clang."
      },
      cookingMasterPool8[2], // 4. Searing Minced Meat
      {
        type: "คั่วหมูสับให้เกรียม (Spatula Chopping & Searing Meat)",
        camera: "Dynamic 45-Degree Spatula Action",
        motion: `Photorealistic 8K image-to-video. Spatula firmly breaks up minced pork in rhythmic downward chops, spreading meat across glowing iron surface. Crispy caramelized bits develop rapidly, savory pork oil bubbling gently. Spatula and wok geometry strictly locked, 24fps.`,
        prompt: `Macro action shot of metal spatula pressing minced meat against hot wok wall, creating deep brown caramelized crust. Glistening oils, rising steam. ARRI Alexa LF, 100mm Macro. --ar ${aspectRatio}`,
        voice: "ยีเนื้อหมูให้กระจาย คั่วบนไฟแรงจนผิวด้านนอกเกรียมกรอบ แต่เนื้อในยังนุ่มฉ่ำ",
        text: "ยีหมูคั่วแห้งเนื้อนุ่มฉ่ำ 🥩",
        textPos: "Center Punchy",
        sfx: "Rhythmic metal spatula scraping iron, sizzling fat crackle."
      },
      cookingMasterPool8[3], // 6. Wok Edge Glaze Caramelization
      {
        type: "ปรุงรสกลมกล่อม (Deglazing with Seasoning Sauce)",
        camera: "Overhead 60fps Liquid Glaze Glide",
        motion: `Photorealistic 8K image-to-video. Dark seasoned sauce bubbling furiously at base of wok, melding with meat juices into thick savory glaze. Chef tosses wok twice in rapid succession, sauce coating every particle evenly. Real fluid viscosity, 24fps.`,
        prompt: `Overhead macro view of dark savory umami sauce bubbling violently among ground pork morsels in wok. Intense steam billows, glossy brown coating. ARRI Alexa LF, 50mm prime. --ar ${aspectRatio}`,
        voice: "ปรุงรสด้วยซีอิ๊วดำและน้ำปลาแท้ ให้ซอสซึมเข้าเนื้อหมูทุกชิ้น หอมกรุ่นทั้งครัว",
        text: "ปรุงรสเข้มข้น หอมกรุ่น ✨",
        textPos: "Lower Third",
        sfx: "Rich boiling bubble sizzle, wok flick."
      },
      cookingMasterPool8[4], // 8. Holy Basil Explosion
      cookingMasterPool8[5], // 9. Crispy Lace Fried Egg
      {
        type: "ตักข้าวสวยร้อนๆ (Fluffy Steaming Jasmine Rice Plating)",
        camera: "Smooth Slider In with 85mm Bokeh",
        motion: `Photorealistic 8K image-to-video. Wooden rice paddle scoops generous mound of steaming hot, fragrant jasmine rice into dark matte artisan ceramic bowl. Plumes of delicate translucent steam drift upward into soft daylight. Grains tender and distinct. Buttery slider glide, 24fps.`,
        prompt: `Close-up of fluffy steaming jasmine rice scooped into artisan dark ceramic bowl. Translucent rising steam plumes caught in warm morning light. ARRI Alexa LF, 85mm T1.5 lens. --ar ${aspectRatio}`,
        voice: "ตักข้าวสวยหอมมะลิแท้ร้อนๆ ควันกรุ่น รอเสิร์ฟคู่กับกะเพราคั่วกระทะ",
        text: "ข้าวหอมมะลิแท้ร้อนๆ 🍚",
        textPos: "Lower Third",
        sfx: "Soft rice steam whisper, wooden paddle tap."
      },
      {
        type: "ราดกะเพราบนข้าว (Pouring Savory Pad Gaprao over Rice)",
        camera: "Overhead 45-Degree Angle Dolly",
        motion: `Photorealistic 8K image-to-video. Chef uses polished stainless spatula to ladle steaming dark caramelized Pad Gaprao directly over mound of white jasmine rice. Savory juices seep into white crevices. Glistening chili oils and wilted basil shine under soft key light. Smooth dolly in, 24fps.`,
        prompt: `45-degree angle macro shot of glossy dark minced pork Pad Gaprao being poured generously over hot white jasmine rice. Rich juices glistening. ARRI Alexa LF, 50mm prime. --ar ${aspectRatio}`,
        voice: "ตักกะเพราคั่วร้อนๆ ราดทับลงบนข้าวสวย กลิ่นควันกระทะตีขึ้นจมูก ชวนน้ำลายสอ",
        text: "ราดกะเพราฉ่ำๆ บนข้าวสวย 🤤",
        textPos: "Center Punchy",
        sfx: "Savory liquid sizzle, satisfying plate landing."
      },
      {
        type: "วางไข่ดาวขอบกรอบ (Crowning with Crispy Lace Fried Egg)",
        camera: "Macro 85mm Slow Push",
        motion: `Photorealistic 8K image-to-video. Culinary tongs gently lower crispy lace fried egg on top of spicy Pad Gaprao. Golden ruffled edge settles with faint crackle, vibrant orange yolk wobbles delicately in center without breaking. Tack-sharp focus on yolk, 24fps.`,
        prompt: `Macro slow push showing crispy lace fried egg placed atop mound of Pad Gaprao and rice. Golden ruffled edges, vibrant plump yolk. ARRI Alexa LF, 85mm Macro. --ar ${aspectRatio}`,
        voice: "โปะทับด้วยไข่ดาวขอบกรอบฟู ไข่แดงเต่งตึง พร้อมเสิร์ฟความฟินระดับมาสเตอร์",
        text: "โปะไข่ดาวกรอบฟู 🍳",
        textPos: "Lower Third",
        sfx: "Crispy egg lace landing crackle, soft steam."
      },
      cookingMasterPool8[6], // 13. Spoon Piercing Yolk Break
      {
        type: "ตักคำแรกสุดฟิน (The First Irresistible Big Spoonful)",
        camera: "Macro Tracking Tilt Up 60fps",
        motion: `Photorealistic 8K image-to-video. Stainless spoon scoops hearty bite combining white rice, dark caramelized pork, wilted holy basil, and creamy golden egg yolk. Spoon lifts smoothly toward camera with wisps of hot steam trailing behind. Tracking focus stays sharp on spoonful, 24fps.`,
        prompt: `Extreme macro of silver spoon lifting overflowing bite of rice, caramelized meat, basil leaf, and flowing golden yolk toward camera. Rising steam, creamy texture. ARRI Alexa LF, 100mm Macro. --ar ${aspectRatio}`,
        voice: "คำแรกที่ตักเข้าปาก รสชาติเผ็ดร้อน เค็มหวาน หอมกลิ่นกระทะไหม้ คลุกเคล้าไข่แดงเยิ้มๆ กลมกล่อมที่สุด",
        text: "คำแรกคือที่สุดแห่งความฟิน 🥄",
        textPos: "Center Punchy",
        sfx: "Soft spoon scoop, rich savory crunch, upbeat groove."
      },
      {
        type: "รีแอคชั่นชิมความอร่อย (Chef Tasting & Delightful Reaction)",
        camera: "Medium Eye-Level Push In 50mm",
        motion: `Photorealistic 8K image-to-video. Presenter tastes spoonful, closes eyes for split second savoring intense wok-hei and umami, opens eyes with genuine delighted smile and gives confident nod of approval and thumbs up. Natural posture, relaxed breathing, zero facial distortion, 24fps.`,
        prompt: `Cinematic medium shot of ${genderEn} tasting delicious food, eyes lighting up with genuine delight, giving confident thumbs up. Warm kitchen daylight, ARRI Alexa LF, 50mm Cine Prime. --ar ${aspectRatio}`,
        voice: "รสชาติที่ลงตัวแบบนี้ ใครได้ลองก็ต้องยกนิ้วให้ การันตีความอร่อยระดับมืออาชีพ",
        text: "อร่อยยกนิ้ว การันตีฟินทุกคำ 👍",
        textPos: "Lower Third",
        sfx: "Satisfied smile hum, upbeat culinary acoustic chime."
      },
      cookingMasterPool8[7]  // 16. Heroic Showcase & CTA
    ];

    // ==========================================
    // GRADUATION PHOTOSHOOTS MASTER POOL (WITH PHYSICAL ACTIONS)
    // ==========================================
    const graduationMasterPool = [
      {
        type: "เปิดเรื่อง (Graduation Viral Hook)",
        camera: "Smooth Forward Tracking 35mm",
        motion: hasPresenter
          ? `Photorealistic 8K image-to-video. Smooth tracking glide across rustic European stone bridge at Fleur Cafe Chiang Mai. ${genderEn} walking gracefully, graduation gown hem swaying naturally in breeze, holding pastel bouquet, turning back with radiant candid smile. Golden sunbeams filtering through garden trees, soft river ripples, zero facial warping, 24fps.`
          : `Photorealistic 8K image-to-video. Smooth tracking glide across rustic European stone bridge at Fleur Cafe Chiang Mai. Scenic bridge panorama. Golden sunbeams filtering through garden trees, soft river ripples, 24fps.`,
        prompt: `Photorealistic 8K cinematic commercial hook. European cottage garden at Fleur Cafe Chiang Mai, stone arched bridge with golden morning sunbeams. ${hasPresenter ? `${genderEn} in graduation gown over white dress walking gracefully across bridge with ${actionPrompts}.` : "Scenic panoramic view of blooming roses."} --ar ${aspectRatio}`,
        voice: "ถ้าคิดว่าภาพเซ็ตนี้ถ่ายที่อังกฤษ... จริงๆ อยู่แค่แม่ริม เชียงใหม่นี่เองครับ!",
        text: "พิกัดถ่ายรูปฟีลอังกฤษ 🇬🇧",
        textPos: "Top Headline",
        sfx: "Gentle morning breeze, acoustic guitar chime, stream water."
      },
      {
        type: "เตรียมพร้อม (Candid Portrait)",
        camera: "Subtle Orbit 30-degree",
        motion: `Photorealistic 8K image-to-video. Warm candid portrait. Graduate playfully adjusts camera strap around neck, laughing naturally with friend or photographer. Light morning breeze rustling through hair, natural eye contact, relaxed breathing, authentic smile, 24fps.`,
        prompt: `Warm romantic medium shot at Fleur Cafe garden. Graduate playfully checking camera lens with photographer, warm candid laughter among blooming floral bushes. --ar ${aspectRatio}`,
        voice: "วันนี้พามาดูพิกัดถ่ายรูปรับปริญญาฟีลเกาหลีอบอุ่น ถ่ายมุมไหนก็ปัง",
        text: "เตรียมกล้องชวนเพื่อนด่วน 📸",
        textPos: "Lower Third",
        sfx: "Shutter click sound, gentle acoustic piano."
      },
      {
        type: "เริ่มลงมือ (Stone Bridge Action)",
        camera: "Dynamic Low-Angle Glide",
        motion: `Photorealistic 8K image-to-video. Low angle glide following footsteps across historic mossy stone bridge. Graduate turns with playful laugh, bouquet held gently, morning light glinting off silk tassel on graduation cap. Rigid stone geometry, fluid fabric motion, 24fps.`,
        prompt: `Dynamic low-angle action shot walking across historic stone bridge, graduation gown flowing gently, holding pastel bouquet, looking back with radiant happy smile. --ar ${aspectRatio}`,
        voice: "จุดแรกบนสะพานหิน Fleur Cafe แสงเช้ากระทบผิวน้ำ สวยเหมือนหลุดมาจากซีรีส์",
        text: "📍 Fleur Cafe แม่ริม 🌿",
        textPos: "Lower Third",
        sfx: "Tactile shoe steps on stone, river stream."
      },
      {
        type: "จุดเปลี่ยนสำคัญ (Pluto Brutalist Contrast)",
        camera: "Ultra-wide Dramatic Tilt Up",
        motion: `Photorealistic 8K image-to-video. Ultra-wide upward tilt in brutalist curved concrete spacecraft corridor at Pluto Cafe. Graduate walks forward with confident poised stride, dramatic architectural sunlight and sharp diagonal shadows across concrete. Editorial aesthetic, 24fps.`,
        prompt: `Brutalist minimalist dark architecture at Pluto Cafe Chiang Mai. Curved spacecraft concrete corridors with striking diagonal sunlight and shadows. Graduate in graduation gown standing proudly. --ar ${aspectRatio}`,
        voice: "เปลี่ยนมู้ดมาต่อที่ Pluto Cafe สันทราย ตึกทรงกระสวยอวกาศสุดล้ำ ถ่ายย้อนแสงเกิดเงา Dramatic เท่ไม่ซ้ำใคร",
        text: "📍 Pluto Cafe สันทราย 🚀",
        textPos: "Lower Third",
        sfx: "Sub-bass modern cinematic drop, atmospheric space reverb."
      },
      {
        type: "ความคืบหน้า (Pluto Spiral Skylight)",
        camera: "Slow Circular Crane Motion",
        motion: `Photorealistic 8K image-to-video. Slow circular crane movement looking down spiral concrete staircase. Graduate ascends steps gracefully, hand gliding lightly along smooth rail, beam of warm sunlight from circular skylight illuminating face. Natural eye focus, 24fps.`,
        prompt: `Architectural composition at Pluto Cafe circular skylight stairwell. Graduate posing naturally on concrete steps, beam of sunlight illuminating face, editorial magazine aesthetic. --ar ${aspectRatio}`,
        voice: "มุมบันไดวนยอดฮิต ถ่ายมุมเงยให้เห็นสกายไลท์ โคตรปัง ได้ยอดไลก์รัวๆ แน่นอน",
        text: "มุมบันไดวนยอดฮิต ✨",
        textPos: "Center Punchy",
        sfx: "Crisp camera shutter snap, electronic synth swell."
      },
      {
        type: "มุมมองพิเศษ (Fern Forest Jungle Cafe)",
        camera: "Smooth Slider In with 85mm Bokeh",
        motion: `Photorealistic 8K image-to-video. Lush botanical glasshouse. Graduate sits at rustic wooden table, picking up clear glass of iced Dirty coffee with condensation droplets, taking gentle sip with relaxed joyful smile. Soft tropical ferns swaying in background breeze, 24fps.`,
        prompt: `Lush botanical glasshouse enveloped in giant green ferns at Fern Forest Cafe Chiang Mai. Graduate sitting at rustic wooden table sipping iced Dirty coffee, cozy intimate gaze. --ar ${aspectRatio}`,
        voice: "ต่อด้วย Fern Forest ในคูเมือง เรือนกระจกกลางป่าเฟิร์นเขียวฉ่ำ นั่งจิบกาแฟฟินๆ ฟีลฟิล์มอบอุ่น",
        text: "📍 Fern Forest คูเมือง 🌿",
        textPos: "Lower Third",
        sfx: "Glass ice clinking, tropical waterfall droplet ambience."
      },
      {
        type: "ขั้นตอนสุดท้าย (Golden Hour Sunset Cap Toss)",
        camera: "Pullback Sunset Panorama",
        motion: `Photorealistic 8K image-to-video. Breathtaking golden hour twilight at 16:30. Graduate smiling happily in sunset field with Doi Suthep mountain backdrop, gently tossing graduation cap into air in clean parabolic arc, golden rim light framing silhouette. Smooth camera pullback, 24fps.`,
        prompt: `Breathtaking twilight golden hour backlight at 16:30. Graduate smiling happily through panoramic sunset field with Doi Suthep mountain backdrop, glowing amber rim lights. --ar ${aspectRatio}`,
        voice: "ไฮไลต์ช่วงแสงเย็นบ่ายสี่โมงครึ่ง แสง Golden Hour สีทองอร่าม ถ่ายมุมไหนก็ละมุนตา",
        text: "แสงเย็นละมุนตาสุดๆ 🌅",
        textPos: "Top Center",
        sfx: "Emotional cinematic strings crescendo, warm acoustic swell."
      },
      {
        type: "เผยผลลัพธ์ & Call to Action",
        camera: "Centered Master Brand Pullback",
        motion: `Photorealistic 8K image-to-video. Heroic wide shot of graduate holding diploma bouquet, smiling proudly into camera at sunset. Camera smoothly pulls back into stable hero composition with clean negative space for post-production text graphics, 24fps.`,
        prompt: `Heroic 8K wide shot of graduate holding diploma bouquet looking proudly into camera at sunset, beautiful composition with clean negative space for post-production branding. Pure cinematography, zero visible text or watermarks in frame. --ar ${aspectRatio}`,
        voice: "บัณฑิตปีนี้เซฟคลิปนี้ไว้เลย แล้วแชร์ชวนเพื่อนๆ หรือจองคิวช่างภาพทักแชตได้เลยครับ!",
        text: "เซฟพิกัดถ่ายรูปด่วน 📸",
        textPos: "Bottom Center CTA",
        sfx: "Signature luxury brand crescendo, triumphant crystal chime."
      }
    ];

    // ==========================================
    // SERENE TEMPLE & MERIT MASTER POOL
    // ==========================================
    const templeMasterPool = [
      {
        type: "เปิดเรื่อง (Serene Temple Hook)",
        camera: "Smooth Forward Tracking 35mm",
        motion: `Photorealistic 8K image-to-video. Forward tracking glide through ancient Lanna temple entrance. Morning mist drifting past golden stupa bathed in soft dawn sunbeams. Traveler walking mindfully in elegant linen attire, brass chimes ringing gently in mountain breeze. 24fps.`,
        prompt: `Photorealistic 8K cinematic commercial hook. Majestic golden stupa and ancient Lanna temple entrance bathed in soft golden morning sunlight with gentle mist. ${hasPresenter ? `${genderEn} walking mindfully into the temple courtyard with ${actionPrompts}.` : "Scenic panoramic view of golden pagoda."} Pure cinematography, zero text or watermarks in frame. --ar ${aspectRatio}`,
        voice: "ถ้ากำลังมองหาที่พักใจและเสริมสิริมงคล... นี่คือพิกัดวัดลับกลางเชียงใหม่ที่สงบและงดงามที่สุดครับ",
        text: "พิกัดวัดลับสุดสงบ 🪷",
        textPos: "Top Headline",
        sfx: "Gentle morning breeze, distant temple brass bell chime, calm stream."
      },
      {
        type: "เตรียมพร้อม (Ancient Stone Steps & Nagas)",
        camera: "Dynamic Low-Angle Glide",
        motion: `Photorealistic 8K image-to-video. Low angle tracking following footsteps up mossy ancient stone staircase flanked by carved stone Nagas. Filtered emerald forest canopy light, authentic stone textures, natural stride, 24fps.`,
        prompt: `Atmospheric low-angle tracking shot along ancient mossy stone staircase flanked by sacred sculpted Naga balustrades. Filtered emerald light through lush mountain canopy. --ar ${aspectRatio}`,
        voice: "สัมผัสความร่มรื่นตั้งแต่ทางเดินบันไดพญานาคโบราณ แวดล้อมด้วยผืนป่าธรรมชาติอันเงียบสงบ",
        text: "บรรยากาศสงบเย็นใจ 🌿",
        textPos: "Lower Third",
        sfx: "Soft tactile shoe footsteps on mossy stone, bird song."
      },
      {
        type: "กราบสักการะ (Sacred Vihara & Golden Buddha)",
        camera: "Slow Reverent Push In 50mm",
        motion: `Photorealistic 8K image-to-video. Slow reverent push into tranquil teakwood vihara. Golden Buddha statue illuminated by soft window light, delicate incense smoke curling peacefully upwards. Traveler kneeling with hands pressed in respectful Wai. 24fps.`,
        prompt: `Sacred tranquil interior of historic Lanna wooden Vihara. Golden Buddha statue illuminated by soft window light, delicate incense smoke drifting peacefully. ${hasPresenter ? `${genderEn} paying respect with heartfelt reverence.` : "Serene golden Buddha aura."} --ar ${aspectRatio}`,
        voice: "กราบสักการะองค์พระประธาน ขอพรเสริมสิริมงคล ให้ชีวิตราบรื่น มีพลังกายพลังใจเต็มเปี่ยม",
        text: "กราบขอพรเสริมมงคล 🙏",
        textPos: "Center Punchy",
        sfx: "Deep meditative singing bowl tone, soft acoustic resonance."
      },
      {
        type: "ศิลปวัฒนธรรม (Lanna Gold Leaf & Brass Bells)",
        camera: "Macro 100mm Forward Push",
        motion: `Photorealistic 8K image-to-video. Extreme macro forward push across ornate gold leaf carvings on ancient teakwood pillar. Brass wind chimes swaying gently in background against clear sky, delicate specular reflections, 24fps.`,
        prompt: `Extreme macro close-up of intricate antique gold leaf carvings on teakwood temple pillars, brass wind chimes swaying gently against azure sky. --ar ${aspectRatio}`,
        voice: "ประณีตในทุกรายละเอียด สถาปัตยกรรมไม้สักโบราณและลวดลายล้านนาอันทรงคุณค่า",
        text: "สถาปัตยกรรมล้านนา ✨",
        textPos: "Lower Third",
        sfx: "Crisp melodic wind chime chime, soft wooden texture resonance."
      },
      {
        type: "เวียนประทักษิณ (Circumambulation & Merit)",
        camera: "Subtle Orbit 30-degree",
        motion: `Photorealistic 8K image-to-video. Smooth 360 orbit following pilgrims walking mindfully around perimeter of ancient golden stupa, holding fresh white lotus flowers with gentle steps, serene contemplation, 24fps.`,
        prompt: `Sunlit wide angle of ancient golden Chedi stupa. Pilgrims walking mindfully around the perimeter with lotus flowers in hand, peaceful contemplation. --ar ${aspectRatio}`,
        voice: "ร่วมเดินเวียนประทักษิณรอบองค์พระธาตุเจดีย์ น้อมรับความสุข ความสงบใจที่แท้จริง",
        text: "เวียนประทักษิณรอบเจดีย์ ☀️",
        textPos: "Lower Third",
        sfx: "Warm soothing ambient cello, breeze sweep."
      },
      {
        type: "จุดชมวิวพาโนรามา (Mountain Vista & Mist)",
        camera: "Panoramic Drone Arc 60fps",
        motion: `Photorealistic 8K image-to-video. Sweeping drone arc over temple rooftops revealing mist-covered mountain valleys of Chiang Mai. Pagoda spire gleaming above lush green forest, warm morning light, 24fps.`,
        prompt: `Breathtaking high-angle panoramic sweep over temple rooftops and mist-covered mountain valleys of Chiang Mai. Golden pagoda tips gleaming above lush green forest. --ar ${aspectRatio}`,
        voice: "มุมมองจากลานชมวิว มองเห็นยอดเจดีย์ทองตัดกับขุนเขาเขียวขจี อากาศสดชื่นสบายใจ",
        text: "วิวพาโนรามากลางหุบเขา ⛰️",
        textPos: "Top Center",
        sfx: "Expansive emotional cinematic strings, gentle mountain wind."
      },
      {
        type: "ถวายดอกบัวและจุดประทีป (Lotus Offering & Light)",
        camera: "Smooth Slider In with 85mm Bokeh",
        motion: `Photorealistic 8K image-to-video. Intimate slider shot. Hands gently placing pristine white lotus flower on stone altar next to warm flickering candle flame, soft wax glow, tranquil mood, 24fps.`,
        prompt: `Intimate warm close-up of delicate fresh white lotus flower and flickering candle flame placed reverently on temple altar, warm glowing embers. --ar ${aspectRatio}`,
        voice: "ถวายดอกบัวและจุดประทีปบูชา เติมเต็มพลังบวก ปล่อยวางทุกความเหนื่อยล้าได้อย่างหมดจด",
        text: "เติมพลังใจ เติมพลังบวก 🪷",
        textPos: "Lower Third",
        sfx: "Soft candle wick crackle, harmonic bell reverberation."
      },
      {
        type: "เผยผลลัพธ์ & Call to Action",
        camera: "Centered Master Brand Pullback",
        motion: `Photorealistic 8K image-to-video. Wide pullback showing historic temple silhouette against glowing amber sunset sky. Traveler smiling peacefully toward camera with hands clasped in greeting, clean negative space, 24fps.`,
        prompt: `Heroic 8K wide shot at golden sunset. Beautiful historic temple silhouette against glowing amber sky, joyful peaceful traveler smiling gratefully toward camera. Pure cinematography, zero visible text or watermarks in frame. --ar ${aspectRatio}`,
        voice: "เซฟคลิปนี้ไว้ตามรอย แล้วแชร์ให้คนที่คุณอยากชวนมาไหว้พระทำบุญด้วยกันนะครับ!",
        text: "เซฟไว้พาคนที่รักมาไหว้พระ 🙏",
        textPos: "Bottom Center CTA",
        sfx: "Signature triumphant temple chime crescendo, warm uplifting outro."
      }
    ];

    // ==========================================
    // TRAVEL & CITY TRIP MASTER POOL
    // ==========================================
    const travelMasterPool = [
      {
        type: "เปิดเรื่อง (Viral Travel Hook)",
        camera: "Smooth Forward Tracking 35mm",
        motion: `Photorealistic 8K image-to-video. Panoramic sunrise over Doi Inthanon misty mountain ridge. Traveler standing at scenic wooden rail breathing in fresh morning breeze, jacket fluttering gently. Smooth tracking forward, 24fps.`,
        prompt: `Photorealistic 8K cinematic commercial hook. Panoramic sunrise over Doi Inthanon mountain ridge Chiang Mai, rolling sea of mist with golden morning sunbeams. ${hasPresenter ? `${genderEn} standing at scenic viewpoint taking in the fresh breeze with ${actionPrompts}.` : "Scenic panoramic mountain view."} Pure cinematography, zero text or watermarks in frame. --ar ${aspectRatio}`,
        voice: "แจกแพลน 1 วัน ตะลุยเที่ยวเชียงใหม่ เช้าจรดค่ำ เที่ยวครบ กินคุ้ม มุมถ่ายรูปสวยเพียบ!",
        text: "แจกแพลนเที่ยวเชียงใหม่ 🚗",
        textPos: "Top Headline",
        sfx: "Gentle mountain wind rush, upbeat energetic travel acoustic groove."
      },
      {
        type: "เริ่มต้นเช้าวันใหม่ (Old Town Street Life)",
        camera: "Dynamic Tracking Walking Shot 50mm",
        motion: `Photorealistic 8K image-to-video. Dynamic medium tracking shot walking along historic brick walls and ancient trees in Chiang Mai Old City. Traveler holding artisan iced coffee, walking with relaxed rhythm, morning shadows, 24fps.`,
        prompt: `Vibrant morning street scene in Chiang Mai Old City heritage quarter. Historic brick wall and ancient shade trees, holding artisan iced coffee, warm morning sunlight. --ar ${aspectRatio}`,
        voice: "สตาร์ทเช้าวันใหม่เดินชิลย่านเมืองเก่า สัมผัสวิถีชีวิตสโลว์ไลฟ์ จิบกาแฟท้องถิ่นรสชาติดี",
        text: "📍 คูเมืองเชียงใหม่ 🚲",
        textPos: "Lower Third",
        sfx: "Bicycle bell chime, gentle city breeze, morning birds."
      },
      {
        type: "คาเฟ่ธรรมชาติ (Hidden Riverside Cafe)",
        camera: "Smooth Slider In with 85mm Bokeh",
        motion: `Photorealistic 8K image-to-video. Slider glide across outdoor wooden deck beside clear flowing mountain stream. Traveler sipping cold brew coffee, sunlight glinting on water ripples and giant lush ferns, 24fps.`,
        prompt: `Artistic open-air wooden cafe nestled beside a babbling clear mountain stream and giant ferns in Mae Rim. Drinking cold brew coffee with sunlight dancing on crystal water. --ar ${aspectRatio}`,
        voice: "แวะเติมความสดชื่นที่คาเฟ่ลับริมลำธาร ฟังเสียงน้ำไหลเพลินๆ แชะรูปได้ทุกมุม",
        text: "📍 คาเฟ่ลับริมลำธาร ☕",
        textPos: "Lower Third",
        sfx: "Crisp water stream splashing, ice cubes clinking in glass."
      },
      {
        type: "มื้อเที่ยงท้องถิ่น (Famous Khao Soi Bowl)",
        camera: "Macro 100mm Overhead Tilt",
        motion: `Photorealistic 8K image-to-video. Macro tilt up. Chopsticks lift tender braised beef and golden crispy egg noodles out of rich, steaming aromatic curry broth. Droplets of rich coconut curry glisten on spoon, 24fps.`,
        prompt: `Mouthwatering extreme close-up of authentic Chiang Mai Khao Soi curry noodles. Crispy egg noodles on top, tender braised beef, fresh lime and shallots, rich aromatic curry broth. --ar ${aspectRatio}`,
        voice: "มื้อเที่ยงจัดเต็ม ข้าวซอยสูตรเด็ดในตำนาน น้ำแกงหอมเครื่องเทศเข้มข้น รสชาติลำแต๊ๆ",
        text: "📍 ข้าวซอยสูตรเด็ด 🍜",
        textPos: "Center Punchy",
        sfx: "Sizzling wok sound, rich simmer bubble, upbeat percussion."
      },
      {
        type: "กิจกรรมแอดเวนเจอร์/ธรรมชาติ (Pine Forest Trail)",
        camera: "Subtle 360 Orbit Glide",
        motion: `Photorealistic 8K image-to-video. Slow orbit around traveler walking along pine needle trail through towering Bo Kaeo pine forest. Diagonal sunbeams filtering through tree canopy, gentle breeze, 24fps.`,
        prompt: `Lush tall pine forest bathed in diagonal sunbeams at Bo Kaeo Pine Forest. Traveler walking along pine needle trail, light breeze rustling through tree canopy. --ar ${aspectRatio}`,
        voice: "บ่ายนี้ลุยต่อที่ป่าสนและธรรมชาติเขียวขจี อากาศเย็นสบาย ถ่ายรูปฟีลเกาหลีแบบไม่ต้องบินไปไกล",
        text: "📍 ป่าสนฟีลธรรมชาติ 🌲",
        textPos: "Lower Third",
        sfx: "Tactile footsteps on dry pine needles, gentle wind whisper."
      },
      {
        type: "จุดชมวิวพระอาทิตย์ตก (Golden Hour Horizon)",
        camera: "Pullback Sunset Panorama",
        motion: `Photorealistic 8K image-to-video. Pullback panorama atop mountain viewpoint overlooking Chiang Mai cityscape at 16:30. Warm amber backlight casting long soft shadows, mountain peaks glowing golden, 24fps.`,
        prompt: `Spectacular golden hour twilight atop mountain viewpoint overlooking Chiang Mai cityscape. Warm amber backlight casting long shadows, mountain peaks glowing. --ar ${aspectRatio}`,
        voice: "ช่วงแสงเย็นบ่ายสี่โมงครึ่ง ขึ้นมาชมวิวพระอาทิตย์ตก แสงสีทองอบอุ่นสวยสะกดใจ",
        text: "📍 จุดชมวิวดอยสุเทพ 🌅",
        textPos: "Top Center",
        sfx: "Emotional cinematic acoustic swell, sweeping violin crescendo."
      },
      {
        type: "ตลาดคนเดินและสตรีทฟู้ด (Bustling Night Market)",
        camera: "Low-Angle Steadicam Glide",
        motion: `Photorealistic 8K image-to-video. Steadicam glide through lively night walking street. Warm hanging lantern glow, colorful artisan craft stalls, steaming street food skewers, joyful bustling evening ambiance, 24fps.`,
        prompt: `Lively Chiang Mai night walking street festival. Warm hanging fairy lights, artisan craft stalls, steaming street food skewers, joyful bustling evening vibe. --ar ${aspectRatio}`,
        voice: "ตกค่ำปิดท้ายทริป ตะลุยถนนคนเดินและสตรีทฟู้ดยามค่ำ ชิมของอร่อย ช้อปงานคราฟต์สุดชิค",
        text: "📍 สตรีทฟู้ดยามค่ำ 🍢",
        textPos: "Lower Third",
        sfx: "Lively night market chatter, sizzling street food grills, folk music."
      },
      {
        type: "เผยผลลัพธ์ & Call to Action",
        camera: "Centered Master Brand Pullback",
        motion: `Photorealistic 8K image-to-video. Heroic wide shot of traveler smiling brightly into camera against illuminated Chiang Mai night cityscape, giving friendly wave, clean negative space, 24fps.`,
        prompt: `Heroic 8K wide shot of traveler smiling brightly into camera against illuminated Chiang Mai night cityscape. Pure cinematography, zero visible text or watermarks in frame. --ar ${aspectRatio}`,
        voice: "เซฟแพลนเที่ยวนี้ไว้เลย แล้วแท็กเพื่อนด่วน! ทริปเชียงใหม่ครั้งหน้าเตรียมตัวลุยกันได้เลยครับ!",
        text: "เซฟแพลนแท็กเพื่อนด่วน! 🎒",
        textPos: "Bottom Center CTA",
        sfx: "Signature upbeat brand crescendo, crystal sonic chime."
      }
    ];

    // ==========================================
    // AUTOMOTIVE MASTER POOL
    // ==========================================
    const autoMasterPool = [
      {
        type: "เปิดเรื่อง (Hero Vehicle Reveal)",
        camera: "Smooth Dynamic Tracking Push",
        motion: `Photorealistic 8K image-to-video. Revealing ${productName} on high-end studio turntable. Softbox lights sweep across soul red metallic curves, LED signature lights ignite with sequential sweep. Anamorphic flare, 24fps.`,
        prompt: `Photorealistic 8K cinematic commercial hook. Revealing ${productName} in ${effectiveEnvironmentText}. Soul red metallic paint reflecting studio softbox lights. --ar ${aspectRatio}`,
        voice: `เมื่อนิยามแห่งยนตรกรรมพรีเมียม... สะท้อนตัวตนที่เหนือระดับของคุณ กับ ${productName}`,
        text: "THE NEW DEFINITION OF LUXURY ✨",
        textPos: "Top Headline",
        sfx: "Deep sub-bass power surge, engine idle purr."
      },
      {
        type: "เตรียมพร้อม (Cockpit & Leather Craft)",
        camera: "Slow Slider through Cabin",
        motion: `Photorealistic 8K image-to-video. Slow slider through cabin interior. Hand gently traces over perforated Nappa leather seat stitching, dual digital screens animating to life with high-tech graphics, 24fps.`,
        prompt: `Close-up interior of ${productName}. Luxurious Nappa leather seats with contrast stitching, digital instrument cluster activating. --ar ${aspectRatio}`,
        voice: "ภายในห้องโดยสารที่ออกแบบอย่างประณีต สัมผัสความหรูหราในทุกรายละเอียด",
        text: "ห้องโดยสารพรีเมียม Nappa Leather 🛋️",
        textPos: "Lower Third",
        sfx: "Soft leather creak, high-tech interface chime."
      },
      {
        type: "เริ่มลงมือ (Ignition & Steering)",
        camera: "Dynamic Macro Push",
        motion: `Photorealistic 8K image-to-video. Driver's finger presses illuminated engine start button, steering wheel leather grip, vehicle accelerating smoothly into illuminated tunnel, 24fps.`,
        prompt: `Close-up of driver pressing push-start button, hands gripping leather-wrapped steering wheel, LED headlights illuminating dark tunnel. --ar ${aspectRatio}`,
        voice: "พร้อมทะยานสู่ทุกจุดหมาย ด้วยพลังขับเคลื่อนอันเร้าใจและแม่นยำ",
        text: "เร้าใจทุกการสตาร์ท ⚡",
        textPos: "Center Punchy",
        sfx: "Engine rev roar, electric drive hum."
      },
      {
        type: "จุดเปลี่ยนสำคัญ (High-Speed Mountain Drive)",
        camera: "Car-to-Car Tracking Shot 60fps",
        motion: `Photorealistic 8K image-to-video. High-speed car-to-car tracking shot of ${productName} cornering with poise on winding sunset mountain highway. Realistic tire grip on asphalt, glowing brake caliper, 24fps.`,
        prompt: `High-speed dynamic tracking shot of ${productName} cornering gracefully on winding sunset mountain highway, tire grip, aerodynamic body lines. --ar ${aspectRatio}`,
        voice: "สมรรถนะการควบคุมที่เหนือชั้น เข้าโค้งมั่นใจ เกาะถนนหนึบทุกจังหวะ",
        text: "สมรรถนะการเข้าโค้งระดับไฮเอนด์ 🏎️",
        textPos: "Lower Third",
        sfx: "Tire grip on asphalt, roaring exhaust note."
      },
      {
        type: "ความคืบหน้า (Smart Tech & Safety)",
        camera: "Macro POV Cockpit Angle",
        motion: `Photorealistic 8K image-to-video. Driver POV showing Heads-Up Display projecting glowing navigation graphics on windshield, smart blind-spot radar indicators, smooth lane change, 24fps.`,
        prompt: `Driver perspective showing active Heads-Up Display projecting navigation on windshield, smart radar sensor graphics. --ar ${aspectRatio}`,
        voice: "มั่นใจสูงสุดด้วยเทคโนโลยีความปลอดภัยอัจฉริยะ คอยปกป้องคุณตลอดเส้นทาง",
        text: "ระบบความปลอดภัยรอบคัน 360° 🛡️",
        textPos: "Lower Third",
        sfx: "Futuristic radar ping, gentle alert tone."
      },
      {
        type: "มุมมองพิเศษ (360 Aero Silhouette)",
        camera: "360 Drone Orbit 90-degree",
        motion: `Photorealistic 8K image-to-video. High-angle drone orbiting ${productName} parked on scenic mountain summit overlooking twilight city lights. Metallic paint reflecting city glow, anamorphic lens flare, 24fps.`,
        prompt: `Dramatic drone shot orbiting ${productName} standing majestically on scenic mountain peak overlooking city lights at dusk. Anamorphic flare. --ar ${aspectRatio}`,
        voice: "ดีไซน์สปอร์ตโฉบเฉี่ยว สะกดทุกสายตาตั้งแต่แรกเห็นจนถึงวินาทีสุดท้าย",
        text: "ดีไซน์สปอร์ตสะกดทุกสายตา 💎",
        textPos: "Top Center",
        sfx: "Cinematic orchestral riser, wind sweep."
      },
      {
        type: "ขั้นตอนสุดท้าย (Arrival & Executive Stance)",
        camera: "Steadicam Glide alongside Vehicle",
        motion: `Photorealistic 8K image-to-video. Steadicam glide. Driver in tailored suit opens vehicle door with solid mechanical latch thud, stepping out onto hotel driveway with confident stride, 24fps.`,
        prompt: `Driver in tailored sharp suit stepping out of ${productName} in front of luxury hotel entrance, confident stride. --ar ${aspectRatio}`,
        voice: "ก้าวสู่ความสำเร็จในแบบคุณ เติมเต็มความภาคภูมิใจในทุกการเดินทาง",
        text: "ก้าวสู่ความสำเร็จในแบบคุณ 👑",
        textPos: "Center Punchy",
        sfx: "Door latch solid thud, elegant footsteps."
      },
      {
        type: "เผยผลลัพธ์ & ข้อเสนอพิเศษ (Grand Finale & Offer)",
        camera: "Centered Master Brand Pullback",
        motion: `Photorealistic 8K image-to-video. Centered master pullback in luxury showroom. ${productName} with glowing LED lights on glossy epoxy floor, stable composition with ample space for promotional offer graphic, 24fps.`,
        prompt: `Heroic master shot of ${productName} with glowing LED signature lights in luxury modern showroom, sleek reflections, pure cinematography, zero visible text or watermarks in frame. --ar ${aspectRatio}`,
        voice: `เป็นเจ้าของ ${productName} วันนี้ ดอกเบี้ย 0% ฟรีประกันภัยชั้น 1 ทดลองขับได้แล้วที่โชว์รูมครับ!`,
        text: "ดอกเบี้ย 0% ฟรีประกันภัยชั้น 1 🚗",
        textPos: "Bottom Center CTA",
        sfx: "Brand signature sonic chime, triumphant crescendo."
      }
    ];

    // ==========================================
    // PREHISTORIC DINOSAUR & NATURE DOCUMENTARY MASTER POOL (16 CINEMATIC SCENES)
    // ==========================================
    const dinosaurMasterPool16 = [
      {
        type: "เปิดเรื่อง (Primeval Jurassic Dawn & Titan Silhouette)",
        camera: "Slow Majestic Forward Crane & Mist Reveal",
        motion: `Photorealistic 8K image-to-video. Slow majestic forward crane glide through ancient giant Jurassic ferns and dangling moss vines. Early morning sunlight pierces dense emerald canopy with volumetric god rays. In the distance, a massive gentle Brachiosaurus gracefully raises its towering neck above the misty treetops, exhaling soft visible breath. Ultra-photorealistic reptilian skin texture, natural biomechanical anatomy, 24fps.`,
        prompt: isPurePrompt
          ? `Cinematic 8K nature documentary establishing shot. Primeval Jurassic misty rainforest at sunrise. Ancient giant tree ferns, moss-covered towering cycads, golden morning god rays cutting through dense humid fog. In background, a majestic towering Brachiosaurus peacefully browsing prehistoric canopy leaves. BBC Earth cinematography, shot on RED Monstro 8K with 35mm cinema lens, ARRI Alexa LF wildlife grading, zero visible text or watermarks in frame. --ar ${aspectRatio}`
          : `Cinematic 8K nature documentary establishing shot. Primeval Jurassic misty rainforest at sunrise. Ancient giant tree ferns, moss-covered towering cycads, golden morning god rays cutting through dense humid fog. In background, a majestic towering Brachiosaurus peacefully browsing prehistoric canopy leaves. [Slot 2 Creature Anchor]: Match dinosaur appearance to Slot 2 reference. Zero visible text or watermarks. --ar ${aspectRatio}`,
        voice: "เคยเห็นไดโนเสาร์หัวเราะไหม? ยินดีต้อนรับสู่การเดินทางสำรวจหัวใจแห่งป่าดึกดำบรรพ์ ที่ซ่อนความอ่อนโยนและปริศนาอันน่าทึ่ง",
        text: "เคยเห็นไดโนเสาร์หัวเราะไหม? 🦕",
        textPos: "Top Headline",
        sfx: "Low subsonic prehistoric earth rumble, distant gentle dinosaur resonance call, morning jungle birds and gentle breeze."
      },
      {
        type: "สำรวจรอยเท้ายักษ์ (Ancient Footprint Skim & Riverbed)",
        camera: "Low-Angle Tracking 24mm skimming River Surface",
        motion: `Photorealistic 8K image-to-video. Low-angle tracking shot skimming crystalline primeval river waters with gentle ripples. Camera reveals a colossal, fossil-like fresh dinosaur footprint deeply imprinted into the damp mossy volcanic mud along the riverbank. Dewdrops glisten on ancient liverwort plants, small prehistoric dragonflies hovering, 24fps.`,
        prompt: `Low-angle tracking shot along a pristine prehistoric riverbed. A gigantic, fresh herbivore dinosaur footprint deeply imprinted in damp volcanic soil and emerald moss, crystal-clear water trickling into the depression. Dense Jurassic ferns in background, morning dew sparkling in diagonal sunbeams. National Geographic wildlife documentary style, 8K ultra detail. --ar ${aspectRatio}`,
        voice: "รอยเท้ายักษ์ริมธารน้ำใส บ่งบอกถึงการมีอยู่ของสิ่งมีชีวิตที่ยิ่งใหญ่ที่สุดที่เคยเดินบนผืนโลก",
        text: "รอยเท้ายักษ์กลางป่าลึก 🐾",
        textPos: "Lower Third",
        sfx: "Trickling pristine river stream, damp earth footsteps, gentle insect chirps."
      },
      {
        type: "สายใยแม่ลูก (Triceratops Mother & Infant Gentle Bond)",
        camera: "Intimate 85mm Prime Slider Push",
        motion: `Photorealistic 8K image-to-video. Intimate portrait. A massive armored mother Triceratops gently nudges her small playful baby calf with her blunt snout under giant prehistoric palm fronds. The calf nuzzles back affectionately against mother's front leg. Lifelike wrinkled skin, realistic blinking eyes, warm gentle breathing motion, 24fps.`,
        prompt: `Photorealistic 8K intimate wildlife portrait of an armored mother Triceratops tenderly nuzzling her curious infant calf in a sun-dappled Jurassic clearing. Hyper-detailed textured scales, gentle intelligent eyes, warm morning backlight filtering through palm fronds. BBC Earth documentary cinematography. Pure visual storytelling, zero text. --ar ${aspectRatio}`,
        voice: "แม้ภายนอกจะดูแข็งแกร่งด้วยเกราะหนาและเขาแหลมคม แต่ลึกลงไปคือสายใยความรักที่อ่อนโยนระหว่างแม่กับลูก",
        text: "สายใยความรักที่อ่อนโยน 💖",
        textPos: "Lower Third",
        sfx: "Low affectionate rumbling purr from mother dinosaur, soft calf chirp, rustling leaves."
      },
      {
        type: "ไดโนเสาร์ขี้เล่นริมน้ำตก (Playful Dinosaur by the Waterfall)",
        camera: "Dynamic Medium Tracking & Water Splash",
        motion: `Photorealistic 8K image-to-video. A juvenile Parasaurolophus with an elegant curved head crest stands near a crystal-clear jungle waterfall. It playfully tilts its head, opens its beak-like mouth in joyful resonance vocalization, splashing cool water droplets with its forefoot with cheerful agility. Water droplets sparkle in sunlight, real fluid dynamics, 24fps.`,
        prompt: `Medium shot of a spirited juvenile Parasaurolophus dinosaur playfully splashing crystalline water in a turquoise prehistoric lagoon beneath a cascading jungle waterfall. Head tilted joyfully, mouth slightly agape in vocal resonance, water droplets frozen mid-air in warm sunlight. National Geographic documentary photography, 8K photorealism. --ar ${aspectRatio}`,
        voice: "นี่คือช่วงเวลาที่หาดูได้ยาก ไดโนเสาร์รุ่นเยาว์ที่กำลังเล่นน้ำตกอย่างเพลิดเพลิน ส่งเสียงก้องกังวานราวกับกำลังหัวเราะอย่างมีความสุข",
        text: "เสียงหัวเราะแห่งป่าโบราณ ✨",
        textPos: "Center Punchy",
        sfx: "Cascading waterfall roar, playful water splashes, musical flute-like dinosaur call echoing through jungle."
      },
      {
        type: "ใจกลางป่าลึก (Heart of the Primeval Rainforest)",
        camera: "Epic Sweeping Crane Arc above Rainforest Canopy",
        motion: `Photorealistic 8K image-to-video. Sweeping crane shot soaring above giant prehistoric redwood and fern canopy. The vista opens up to reveal a hidden, breathtaking valley sanctuary surrounded by mist-capped ancient volcanic peaks, where diverse peaceful herbivore dinosaurs graze harmoniously, 24fps.`,
        prompt: `Spectacular panoramic crane shot soaring over a lush prehistoric rainforest canopy, revealing a secret ancient green valley sanctuary bathed in golden rays. Flocks of prehistoric birds glide beneath the clouds, herds of Stegosaurus and sauropods graze peacefully beside winding azure rivers. ARRI Alexa LF cinematic film, 8K ultra wide. --ar ${aspectRatio}`,
        voice: "ใจกลางป่าลึกแห่งนี้ คือดินแดนที่ธรรมชาติและสิ่งมีชีวิตโบราณใช้ชีวิตร่วมกันอย่างสงบสุขและสมดุล",
        text: "หัวใจแห่งป่าดึกดำบรรพ์ 🌿",
        textPos: "Top Center",
        sfx: "Lush ambient jungle wind, flock of ancient birds fluttering, deep resonant earth hum."
      },
      {
        type: "จ้าวเวหาโบราณ (Pteranodons Gliding Through Mist)",
        camera: "Aerial Forward Tracking Shot following Flight Path",
        motion: `Photorealistic 8K image-to-video. Aerial camera tracks closely behind a majestic Pteranodon with expansive leathery wings gliding gracefully above misty jungle canyons and crashing waterfalls. The creature turns its head smoothly, scanning the primeval canopy below as morning sun illuminates translucent wing membranes, 24fps.`,
        prompt: `Cinematic aerial tracking shot following a majestic Pterosaur gliding gracefully through low-hanging morning mist over prehistoric jungle canyons and waterfalls. Translucent amber wing membranes backlit by early sun, aerodynamic flight physics. BBC Earth wildlife aerial cinematography, 8K resolution. --ar ${aspectRatio}`,
        voice: "เหนือยอดไม้สูง คืออาณาจักรของเหล่านักร่อนโบราณ ที่โบยบินเคียงคู่สายหมอกมานับล้านปี",
        text: "จ้าวเวหาแห่งยุคดึกดำบรรพ์ 🦅",
        textPos: "Lower Third",
        sfx: "Wind whoosh across leathery wings, high-pitched screech echoing over canyon."
      },
      {
        type: "แสงอัสดงสีทอง (Golden Hour Twilight Companionship)",
        camera: "Slow Lateral Tracking with 135mm Telephoto Compression",
        motion: `Photorealistic 8K image-to-video. Breathtaking golden hour backlight at 17:30. Two peaceful long-necked Brachiosaurus stand side by side on a gentle grassy ridge, their long necks curving harmoniously against a vivid orange and magenta sunset sky. Golden rim light wraps around their massive silhouettes as cool evening mist settles over the valley. 24fps.`,
        prompt: `Breathtaking golden hour wildlife composition at sunset. Two towering sauropod dinosaurs silhouetted against a dramatic fiery amber and crimson twilight sky, soft rim light highlighting their contours. Telephoto lens compression, National Geographic award-winning photography, 8K photorealism, zero text. --ar ${aspectRatio}`,
        voice: "เมื่อยามเย็นมาถึง แสงสีทองสาดส่องลงบนความเงียบสงบ ความรักและความผูกพันยังคงดำเนินต่อไปในทุกยุคทุกสมัย",
        text: "ความสงบยามแสงอัสดง 🌅",
        textPos: "Top Center",
        sfx: "Gentle evening crickets, calm wind rustle, warm emotional cello swell."
      },
      {
        type: "เผยบทสรุป & เชิญชวนติดตาม (Grand Finale & Outro)",
        camera: "Centered Master Horizon Pullback",
        motion: `Photorealistic 8K image-to-video. Centered master pullback shot slowly rising away from peaceful dinosaur family resting in lush prehistoric meadow under emerging evening stars. The sky transitions from dusk to twilight indigo, stable cinematic framing with clean negative space for closing graphics, 24fps.`,
        prompt: `Heroic cinematic master pullback shot of peaceful dinosaurs resting in a lush primeval sanctuary as evening stars begin to twinkle in a deep indigo twilight sky. Vast majestic scale, pure cinematography, zero visible text or watermarks in frame. --ar ${aspectRatio}`,
        voice: "นี่คือความลับของหัวใจแห่งป่าไดโนเสาร์... อย่าลืมกดบันทึกคลิปนี้ไว้ และแชร์ให้เพื่อนๆ ได้ร่วมเดินทางไปสัมผัสความมหัศจรรย์ด้วยกันนะครับ!",
        text: "กดเซฟ & แชร์ให้เพื่อนดูด่วน! 🦕✨",
        textPos: "Bottom Center CTA",
        sfx: "Triumphant orchestral documentary crescendo, gentle resonant dinosaur chime."
      },
      {
        type: "ลูกไดโนเสาร์ฟักไข่ (Ancient Hatchling Discovery)",
        camera: "Extreme Macro 100mm Forward Push",
        motion: `Photorealistic 8K image-to-video. Extreme macro close-up of a large textured dinosaur egg in a warm nest of dried prehistoric moss. The shell hairline fractures and cracks open, revealing a tiny curious baby dinosaur with moist glistening scales blinking into the morning light. 24fps.`,
        prompt: `Extreme macro close-up of a baby dinosaur hatching from a textured prehistoric egg nestled in amber moss. Tiny moist scales, curious blinking eyes, soft morning light. BBC Earth style, 8K macro photorealism. --ar ${aspectRatio}`,
        voice: "การกำเนิดใหม่เริ่มต้นขึ้นเสมอ ชีวิตเล็กๆ ที่พร้อมเติบโตสู่ผืนป่าอันกว้างใหญ่",
        text: "การกำเนิดแห่งชีวิตใหม่ 🥚",
        textPos: "Lower Third",
        sfx: "Delicate shell cracking sounds, soft baby dinosaur chirp, morning forest ambiance."
      },
      {
        type: "แผงหนามอันสง่างาม (Stegosaurus Majestic Display)",
        camera: "Low-Angle Circular Orbit 50mm",
        motion: `Photorealistic 8K image-to-video. Camera executes a low-angle circular orbit around a majestic adult Stegosaurus. Morning sunbeams illuminate the vascular red and amber patterns on its iconic dorsal plates. The creature gracefully browses low ferns, tail spikes resting peacefully, 24fps.`,
        prompt: `Low-angle cinematic orbit around an adult Stegosaurus in a sunlit ancient glade. Backlit dorsal plates glowing ruby and amber in morning rays, ultra-realistic scute textures. National Geographic nature documentary, 8K. --ar ${aspectRatio}`,
        voice: "แผงหนามรูปทรงเรขาคณิตอันเป็นเอกลักษณ์ ที่ทำหน้าที่ปรับอุณหภูมิและสะท้อนความสง่างามของธรรมชาติ",
        text: "ความสง่างามแห่งยุคโบราณ 🛡️",
        textPos: "Center Punchy",
        sfx: "Heavy plodding footsteps, gentle branch rustle, deep rumbling breath."
      },
      {
        type: "ลำธารมรกตและพืชโบราณ (Emerald Prehistoric Stream)",
        camera: "Slow Slider Glide across Water Surface",
        motion: `Photorealistic 8K image-to-video. Smooth slider glide just inches above crystal turquoise mountain stream. Ancient horse-tails and giant ferns dip gently into the running water. Sun flecks dance on polished river pebbles, 24fps.`,
        prompt: `Cinematic macro slider along a pristine turquoise stream in a Jurassic forest. Dewdrops on giant fern fronds, sunlight glinting through crystalline water. ARRI Alexa LF nature documentary, 8K. --ar ${aspectRatio}`,
        voice: "สายน้ำบริสุทธิ์ที่หล่อเลี้ยงทุกชีวิตในหุบเขามายาวนานหลายล้านปี",
        text: "สายน้ำหล่อเลี้ยงชีวิต 💧",
        textPos: "Lower Third",
        sfx: "Rushing clear water stream, forest wind, crisp water bubbles."
      },
      {
        type: "การอพยพข้ามทุ่งกว้าง (The Great Dinosaur Migration)",
        camera: "Wide Panoramic Tracking 35mm",
        motion: `Photorealistic 8K image-to-video. Expansive wide panoramic tracking shot capturing an entire herd of diverse herbivore dinosaurs marching peacefully across an open sunlit prehistoric savanna toward towering mountain ranges, 24fps.`,
        prompt: `Expansive wide-angle cinematic shot of a peaceful dinosaur herd migrating across a vast primeval savanna toward towering misty mountain peaks. Golden sunlight, dust motes drifting in the air, BBC Earth scale. --ar ${aspectRatio}`,
        voice: "การเดินทางร่วมกันของฝูงสัตว์ยักษ์ ที่เคารพและเกื้อกูลซึ่งกันและกันตลอดเส้นทาง",
        text: "การเดินทางอันยิ่งใหญ่ 🌍",
        textPos: "Top Center",
        sfx: "Rhythmic earth-shaking thuds of migrating herd, atmospheric wind sweep."
      },
      {
        type: "ความอยากรู้อยากเห็นของแรปเตอร์ตัวจิ๋ว (Curious Feathered Raptor in Ferns)",
        camera: "Intimate Eye-Level Tracking 50mm",
        motion: `Photorealistic 8K image-to-video. A small, colorfully feathered raptor peeks curiously from behind a lush fern leaf. It twitches its head bird-like, inspecting a dewdrop on a blade of grass with intelligent golden eyes before darting lightly across a mossy branch, 24fps.`,
        prompt: `Intimate eye-level wildlife shot of an iridescent feathered small raptor peeking through lush green ferns. Intelligent inquisitive golden eyes, delicate plumage, morning forest mist. National Geographic, 8K. --ar ${aspectRatio}`,
        voice: "ความเฉลียวฉลาดและความอยากรู้อยากเห็น ปรากฏอยู่ในสิ่งมีชีวิตทุกขนาดของป่าแห่งนี้",
        text: "สัญชาตญาณและความอยากรู้ 👁️",
        textPos: "Lower Third",
        sfx: "Quick feathered rustle, inquisitive bird-like clicking sound."
      },
      {
        type: "ทะเลสาบกระจกเงา (Mirrored Lagoon Reflections)",
        camera: "Static Ultra-Wide Symmetrical Lock",
        motion: `Photorealistic 8K image-to-video. Symmetrical ultra-wide shot of a placid mirror-like prehistoric lagoon at midday. A family of duck-billed hadrosaurs wade peacefully in the shallows, their reflections perfectly mirrored on the glass-like water surface. 24fps.`,
        prompt: `Ultra-wide symmetrical composition of a placid crystal lagoon reflecting towering prehistoric peaks and drifting clouds. Gentle hadrosaur dinosaurs drinking at water's edge, perfect mirror reflections. 8K photorealism. --ar ${aspectRatio}`,
        voice: "ผืนน้ำนิ่งสงบสะท้อนภาพท้องฟ้าและธรรมชาติอันบริสุทธิ์ ที่ไร้สิ่งปรุงแต่ง",
        text: "ภาพสะท้อนอันสงบงาม 🪞",
        textPos: "Center Punchy",
        sfx: "Gentle water ripples, quiet lake breeze, distant dinosaur call."
      },
      {
        type: "สายรุ้งหลังพายุดึกดำบรรพ์ (Rainbow Over Jurassic Valley)",
        camera: "Slow Tilt Up from Wet Leaves to Rainbow",
        motion: `Photorealistic 8K image-to-video. Raindrops drip gently from glistening giant fern leaves. Camera tilts slowly up to reveal a double rainbow arcing across a dramatic clearing sky over misty prehistoric mountain ridges, 24fps.`,
        prompt: `Slow tilt up from glistening rain-soaked prehistoric jungle foliage to a vivid double rainbow stretching across a dramatic sunbreak sky over a Jurassic valley. National Geographic cinematography, 8K. --ar ${aspectRatio}`,
        voice: "หลังสายฝนผ่านพ้น ความสดชื่นและความหวังใหม่ก็กลับคืนสู่ผืนป่าเสมอ",
        text: "สายรุ้งแห่งความหวังใหม่ 🌈",
        textPos: "Top Center",
        sfx: "Gentle post-rain water drips, warm sunbreak swell, peaceful forest ambience."
      },
      {
        type: "รัตติกาลใต้แสงจันทร์ (Moonlit Prehistoric Slumber)",
        camera: "Tranquil Night Crane Glide with 85mm Prime",
        motion: `Photorealistic 8K image-to-video. Blue hour twilight turning into a serene moonlit night. Massive dinosaurs rest peacefully in a secure hollow surrounded by glowing bioluminescent fungi and moss. A huge silvery full moon illuminates the primeval valley, 24fps.`,
        prompt: `Magical nocturnal wildlife composition. Gentle dinosaurs sleeping peacefully in a moonlit clearing dotted with glowing bioluminescent fungi. Silvery moonbeams through canopy, starry night sky. 8K cinematic poetry. --ar ${aspectRatio}`,
        voice: "เมื่อค่ำคืนมาเยือน ป่าดึกดำบรรพ์ก็เข้าสู่ช่วงเวลาแห่งการพักผ่อนอย่างอบอุ่นและปลอดภัย",
        text: "ราตรีอันสงบสุขใต้แสงจันทร์ 🌙",
        textPos: "Lower Third",
        sfx: "Nocturnal jungle hum, gentle deep breathing of resting giants, quiet night wind."
      }
    ];

        // ==========================================
    // PLA SOM / CRISPY FISH MASTER POOL (16 FULL DIVERSE SHOTS - 100% ACCURATE)
    // ==========================================
    const plaSomMasterPool16 = [
      {
        type: "เปิดเรื่อง Hook ไวรัล (Crispy Fish Sizzle Hook)",
        camera: "Dynamic Low-Angle Macro Push-in 100mm",
        motion: `Photorealistic 8K image-to-video. Macro slow motion. Golden seasoned Pla Som fish gently sizzling in hot cooking oil inside deep wok. Delicate micro-bubbles shimmer smoothly along crispy golden skin. Shimmering steam rises into warm amber backlight. Low-angle camera slowly pushes in with tack-sharp focus on bubbling crispy golden scales, 24fps.`,
        prompt: isPurePrompt
          ? `Photorealistic 8K culinary opening hook of authentic Thai Pla Som (fermented crispy fish) sizzling in shimmering hot oil inside deep wok. Extreme macro 100mm f/2.8 of bubbling golden oil micro-bubbles erupting against crispy scored fish skin, aromatic steam plumes. Shot on ARRI Alexa LF with 100mm Macro Prime. Lighting: warm 3200K side rim light. Commercial food grade, pure cinematography, zero text. --ar ${aspectRatio}`
          : `Photorealistic 8K cinematic commercial hook of authentic Thai Pla Som sizzling in hot oil. [Slot 2 Product Anchor]: Match fish appearance to Slot 2 reference. Macro 100mm, bubbling oil, golden crispy skin. Pure cinematography, zero text. --ar ${aspectRatio}`,
        voice: "เคยเจอปัญหาทอดปลาส้มแล้วเนื้อเละติดกระทะไหม? วันนี้เรามีเคล็ดลับทอดปลาส้มให้หนังกรอบฟู เนื้อในนุ่มฉ่ำ ไม่เละ 100%!",
        text: "เคล็ดลับทอดปลาส้ม หนังกรอบฟู ไม่เละ! 🐟",
        textPos: "Top Headline",
        sfx: "Aggressive hot oil sizzling crackle, deep culinary whoosh."
      },
      {
        type: "เตรียมวัตถุดิบปลาส้ม (Pla Som Marinated Prep)",
        camera: "Overhead 90-Degree Top Down Artisan Macro",
        motion: `Photorealistic 8K image-to-video. Overhead top-down view on rustic wooden cutting board. Chef's hand gently pats dry a premium marinated whole Pla Som with paper towel. Scored patterned skin shows fresh tender white fish meat. Chef dusts a whisper of fine rice flour over the skin with fine mesh sieve. Smooth downward slider, natural morning window daylight, 24fps.`,
        prompt: `Artisan overhead flat-lay of premium Thai Pla Som fish on dark rustic wooden board. Diamond scored skin dusted lightly with fine rice flour, surrounded by fresh lime wedges, Thai garlic, sliced shallots, and fiery bird's eye chilies. Shot on ARRI Alexa LF, 50mm Prime, soft natural lighting. --ar ${aspectRatio}`,
        voice: "เริ่มจากซับปลาส้มให้แห้งสนิท แล้วคลุกแป้งข้าวเจ้าบางเบา เพื่อล็อกความชุ่มชื้นและช่วยให้หนังฟูกรอบเป็นพิเศษ",
        text: "ซับให้แห้ง คลุกแป้งบางเบา ✨",
        textPos: "Lower Third",
        sfx: "Gentle flour sifting, rustling kitchen board foley."
      },
      {
        type: "🔍 Extreme Macro เช็กความร้อนน้ำมัน (Testing Oil Temperature)",
        camera: "🔍 Extreme Macro 100mm f/2.8 Surface Tension",
        motion: `Photorealistic 8K image-to-video. Extreme macro close-up of wooden chopstick dipped into center of wok oil. Tiny energetic micro-bubbles immediately fizz and pop vigorously around tip of chopstick, indicating perfect medium-high frying temperature. Steam shimmers across golden oil surface, 24fps.`,
        prompt: `Extreme macro 100mm f/2.8 of wooden chopstick tip touching hot frying oil, micro-bubbles fizzing rapidly around wood, shimmering heat haze, professional kitchen lighting. --ar ${aspectRatio}`,
        voice: "เคล็ดลับคือน้ำมันต้องร้อนพอดี ใช้ตะเกียบจุ่มลงไปถ้ามีฟองปุดขึ้นมา แปลว่าพร้อมทอดแล้วครับ",
        text: "เช็กความร้อน: ฟองปุดพร้อมทอด! 🔥",
        textPos: "Lower Third",
        sfx: "Gentle bubbling sizzle, soft oil resonance."
      },
      {
        type: "หย่อนปลาลงกระทะ (Fish Entering Hot Oil)",
        camera: "Dynamic Side Tracking at Oil Surface Level",
        motion: `Photorealistic 8K image-to-video. Brass tongs hold whole dusted Pla Som gently sizzling in hot shimmering oil. Shimmering foam waves dance along the pan. Camera tracks smoothly alongside, locked focal plane on sizzling golden tail fin, 24fps.`,
        prompt: `Side angle macro shot of marinated fish lowered into shimmering hot oil in cast iron pan, dynamic splashing bubbles, crisp steam release, dramatic low-key lighting with golden rim. --ar ${aspectRatio}`,
        voice: "ค่อยๆ วางปลาลงไป แล้วเปิดไฟกลางค่อนข้างแรง ปล่อยให้เซ็ตตัว ห้ามคนหรือขยับเด็ดขาดใน 3 นาทีแรก!",
        text: "วางปลาลงไฟกลาง ห้ามขยับเด็ดขาด ⏳",
        textPos: "Center Punchy",
        sfx: "Loud aggressive frying sizzle roar, metal tongs click."
      },
      {
        type: "🔍 Extreme Macro หนังปลาพองกรอบ (Fish Skin Blistering Golden)",
        camera: "🔍 Extreme Macro 100mm f/2.8 Shallow DOF",
        motion: `Photorealistic 8K image-to-video. Macro 100mm tight focus on fish skin. Scored textured surface reveals glistening white tender meat within, while outer skin caramelizes into an ultra-crispy, puffed golden-brown texture with miniature oil bubbles dancing across ridges. Buttery smooth bokeh, 24fps.`,
        prompt: `Extreme macro 100mm f/2.8 shot of fish skin crisping into golden brown lace and blistered crackling texture in hot oil, shimmering oil droplets, mouthwatering culinary cinematography. --ar ${aspectRatio}`,
        voice: "ดูความฟูของหนังปลาส้มครับ... แป้งบางๆ ทำปฏิกิริยากับน้ำมันจนหนังพองกรอบ สีเหลืองทองเสมอกัน",
        text: "หนังพองฟูกรอบ สีทองอร่าม 🤤",
        textPos: "Lower Third",
        sfx: "Crisp continuous frying crackle, delicate bubbling pops."
      },
      {
        type: "พลิกกลับด้านปลาสีทองอร่าม (The Master Golden Flip)",
        camera: "Kinetic Medium Close-Up 45-Degree Angle",
        motion: `Photorealistic 8K image-to-video. Chef smoothly slides wide stainless spatula under fish, gracefully lifting and turning whole Pla Som over in one confident motion. Revealing underside fried to breathtaking uniform golden-brown crunchiness. Sizzling oil drains in shimmering rivulets. Zero splashing distortion, 24fps.`,
        prompt: `Dynamic culinary shot of chef flipping whole crispy fried fish in wok with spatula, revealing perfectly browned, crispy golden skin, steam swirling upwards, commercial warm kitchen glow. --ar ${aspectRatio}`,
        voice: "พลิกแค่ครั้งเดียวพอ! หนังปลาอีกด้านเหลืองกรอบสวยงาม ไม่หลุด ไม่ติดกระทะแม้แต่น้อย",
        text: "พลิกแค่ครั้งเดียว หนังไม่ติดกระทะ! 🏆",
        textPos: "Center Punchy",
        sfx: "Satisfying spatula scoop and flip splash, loud sizzle."
      },
      {
        type: "เจียวเครื่องเคียงสมุนไพร (Crisping Shallots & Garlic Garnish)",
        camera: "High-Angle 60-Degree Close-Up 85mm",
        motion: `Photorealistic 8K image-to-video. High-angle close-up of sliced Thai shallots, crushed garlic, and fresh red chilies thrown into hot oil around fish. Aromatics flash-fry into crispy amber-gold crisps within seconds, releasing savory fragrance through translucent steam, 24fps.`,
        prompt: `Close-up 85mm of sliced shallots, garlic, and fresh chilies sizzling into golden crispy garnish in pan alongside fried fish, fragrant steam, vibrant food commercial lighting. --ar ${aspectRatio}`,
        voice: "เจียวกระเทียมไทย หอมแดง และพริกขี้หนูสวนลงไปในน้ำมันรอบๆ ดึงกลิ่นหอมสมุนไพรคลุมทั่วตัวปลา",
        text: "เจียวเครื่องเคียง หอมแดง & พริกกระเทียม 🧄",
        textPos: "Lower Third",
        sfx: "Aromatic sizzling herbs, light ladle stir."
      },
      {
        type: "💡 B-Roll ตักปลาขึ้นสะเด็ดน้ำมัน (Resting on Wire Rack)",
        camera: "💡 B-Roll Slow Slider 50mm Backlight Glow",
        motion: `Photorealistic 8K image-to-video. Chef lifts golden crispy Pla Som with brass skimmer onto stainless wire resting rack. Shimmering oil droplets fall cleanly through wire grid. Evening golden sunbeam illuminates delicate steam rising from crispy skin, 24fps.`,
        prompt: `Cinematic B-roll of steaming golden crispy fried fish resting on stainless steel wire rack, excess oil dripping away, backlit by warm golden hour sunlight, artisan kitchen background. --ar ${aspectRatio}`,
        voice: "ตักขึ้นพักบนตะแกรงสะเด็ดน้ำมัน หนังปลาจะเซ็ตตัวกรอบนานขึ้น ไม่อมน้ำมัน",
        text: "พักสะเด็ดน้ำมัน หนังกรอบนานไม่อมน้ำมัน ✨",
        textPos: "Lower Third",
        sfx: "Wire rack metal clink, delicate hot oil dripping drops."
      },
      {
        type: "📐 Kinetic Crash Zoom โรยเครื่องสมุนไพรไม่อั้น (Garnish Waterfall)",
        camera: "📐 Kinetic Crash Zoom 24mm-70mm Fast Snap",
        motion: `Photorealistic 8K image-to-video. Fast snap zoom as chef's fingers shower mountain of crispy fried garlic, translucent golden shallots, and spicy red-green chilies across top of fried Pla Som. Crisp aromatics settle with light crunching sound, 24fps.`,
        prompt: `Kinetic crash zoom of crispy fried golden garlic and chili flakes showered generously over hot crispy fried fish, high speed 60fps, dynamic motion blur, commercial food grading. --ar ${aspectRatio}`,
        voice: "โรยเครื่องเคียงกระเทียมเจียวและพริกทอดลงไปแบบจุใจ เพิ่มมิติรสชาติและสัมผัสความกรอบ",
        text: "โรยเครื่องเคียงล้นๆ หอมกรอบสะใจ 🌶️",
        textPos: "Center Punchy",
        sfx: "Crispy flakes showering crunch, fast cinematic swoosh."
      },
      {
        type: "🔍 Extreme Macro บิเนื้อปลาเสียงกรอบสะท้าน (The Auditory Crunch Test)",
        camera: "🔍 Extreme Macro 100mm f/2.8 Sound & Steam Focus",
        motion: `Photorealistic 8K image-to-video. Extreme macro close-up. Wooden chopsticks gently press down on middle of fish. Outer skin cracks with crisp audible acoustic snap. Thick, flaky white fish meat separates easily, glistening with natural savory juices, pure white steam wafting outward, 24fps.`,
        prompt: `Extreme macro 100mm f/2.8 of chopsticks breaking through ultra-crispy golden fish skin, revealing tender steaming moist flaky white fish meat inside, visible steam, shallow DOF. --ar ${aspectRatio}`,
        voice: "ฟังเสียงความกรอบนะครับ... ข้างนอกกรอบสะท้าน แต่ข้างในเนื้อปลาขาวฟูนุ่มฉ่ำ รสเปรี้ยวกลมกล่อมแท้ๆ",
        text: "เสียงกรอบสะท้าน! เนื้อในนุ่มฉ่ำ 🥢",
        textPos: "Top Center",
        sfx: "Ultra-crisp loud skin crunch snap, soft steaming hiss."
      },
      {
        type: "บีบมะนาวสดฉ่ำ (Fresh Lime Squeeze & Droplet Spray)",
        camera: "60fps Slow Motion Macro Profile Push",
        motion: `Photorealistic 8K image-to-video. Fingers squeeze juicy green Key lime wedge over steaming crispy fish. Translucent citrus juice mist and glistening droplets spray mid-air in slow motion, landing onto crispy skin and white fish flakes, glistening under rim light, 24fps.`,
        prompt: `Macro 60fps slow motion of fresh lime wedge being squeezed over crispy fried fish, glistening lime juice droplets bursting and flowing over golden fish skin, vibrant commercial lighting. --ar ${aspectRatio}`,
        voice: "บีบมะนาวสดลงไปเพิ่มความจี๊ดจ๊าด ตัดรสเปรี้ยวเค็มมันของปลาส้มให้กลมกล่อมยิ่งขึ้น",
        text: "บีบมะนาวสด ตัดเลี่ยนกลมกล่อม 🍋",
        textPos: "Lower Third",
        sfx: "Juicy lime squeeze spritz, delicate citrus splash."
      },
      {
        type: "ตักคู่ข้าวสวยร้อนๆ (The Perfect First Bite Pairing)",
        camera: "Over-The-Shoulder (OTS) 45-Degree Dining Angle",
        motion: `Photorealistic 8K image-to-video. OTS view over chef/customer shoulder. Stainless spoon scoops large portion of crispy fish skin, white flaky meat, fried garlic, and fresh chili resting atop steaming fluffy Thai jasmine rice. Steam rises gently, spoon elevates towards camera, 24fps.`,
        prompt: `Over the shoulder culinary shot of a spoon lifting steaming white jasmine rice crowned with golden crispy fish skin, fried garlic, and red chili, shallow depth of field, warm cozy dining ambiance. --ar ${aspectRatio}`,
        voice: "ตักเนื้อปลาชิ้นโตพร้อมกระเทียมเจียว วางบนข้าวสวยร้อนๆ หอมกลิ่นมะลิแท้ คำนี้คือสวรรค์!",
        text: "ทานคู่ข้าวสวยร้อนๆ ฟินทุกคำ 🍚",
        textPos: "Center Punchy",
        sfx: "Soft rice steam whisper, spoon clink, joyful dining foley."
      },
      {
        type: "ชิมคำแรก & ปฏิกิริยาฟิน (First Bite Tasting Reaction)",
        camera: "Medium Portrait 85mm Prime with Warm Bokeh",
        motion: hasPresenter
          ? `Photorealistic 8K image-to-video. ${genderEn} takes delicious bite of crispy fish and rice, chewing with genuine pleasure and closing eyes in authentic culinary satisfaction, smiling warmly at camera with joyful nod, zero facial warping, 24fps.`
          : `Photorealistic 8K image-to-video. Artisan ceramic dining table view with chopsticks resting gracefully on ceramic stand beside pristine empty bowl, savory steam drifting under warm lamp, award-winning restaurant vibe, 24fps.`,
        prompt: `Medium portrait of person taking a bite of crispy fish, expressions of genuine joy and delicious savoring, smiling warmly at camera, natural cozy restaurant lighting, 85mm portrait bokeh. --ar ${aspectRatio}`,
        voice: "รสชาติเปรี้ยวกำลังดี หนังกรอบเนื้อนุ่ม ข้าวสวยร้อนๆ ช่วยดึงรสชาติปลาส้มออกมาได้สมบูรณ์แบบ",
        text: "รสชาติเปรี้ยวกำลังดี อร่อยจนหยุดไม่ได้ 😋",
        textPos: "Lower Third",
        sfx: "Joyful dining chime, cheerful ambient restaurant warmth."
      },
      {
        type: "💡 B-Roll เสิร์ฟคู่เครื่องเคียงครบเซ็ต (Full Artisan Table Set)",
        camera: "Slow 360-Degree Table Glide Orbit 35mm",
        motion: `Photorealistic 8K image-to-video. Smooth gimbal orbit around table. Full set of crispy Pla Som surrounded by baskets of hot sticky rice, cucumber slices, fresh coriander, ginger slices, and dipping sauce. Balanced composition, warm rustic wooden texture, 24fps.`,
        prompt: `Cinematic 360 table glide of complete Thai Pla Som dinner set, basket of sticky rice, fresh cucumbers, herbs, dipping sauce, warm artisan mood, rich natural grading. --ar ${aspectRatio}`,
        voice: "จะทานกับข้าวสวยหรือปั้นคู่ข้าวเหนียวร้อนๆ ก็เข้ากันได้ทุกมื้อ เมนูง่ายๆ ที่ใครทำก็อร่อย",
        text: "จัดเซ็ตพร้อมเสิร์ฟ อร่อยทั้งบ้าน 🌿",
        textPos: "Lower Third",
        sfx: "Gentle camera glide whoosh, atmospheric dining acoustic."
      },
      {
        type: "สรุป 3 เคล็ดลับสำคัญ (3 Golden Tips Recap)",
        camera: "Dynamic Split-Second Triple Focus Snap",
        motion: `Photorealistic 8K image-to-video. Elegant composite macro shot highlighting: 1. Pat dry, 2. Dust flour, 3. Medium-heat patience. Clean negative space, pristine culinary presentation, 24fps.`,
        prompt: `Crisp professional food commercial graphic showcase of crispy fried fish, highlighting texture, golden color, and chef craftsmanship, clean studio lighting. --ar ${aspectRatio}`,
        voice: "จำ 3 ข้อนี้ไว้: ซับให้แห้ง คลุกแป้งบาง ทอดไฟกลาง... รับรองได้ปลาส้มกรอบอร่อยระดับภัตตาคาร!",
        text: "3 เคล็ดลับ: ซับแห้ง • แป้งบาง • ไฟกลาง 💡",
        textPos: "Center Punchy",
        sfx: "Upbeat motivational culinary beats, bright bell chime."
      },
      {
        type: "เผยผลลัพธ์ & Call to Action (Heroic Pla Som Showcase & CTA)",
        camera: "Centered Master Culinary Pullback",
        motion: hasPresenter
          ? `Photorealistic 8K image-to-video. Heroic wide pullback. Complete plate of golden crispy Pla Som steams gently under warm commercial light. ${genderEn} stands proudly, holding plate with welcoming warm smile, gesturing invite to viewer, natural eye contact, relaxed breathing, zero warping, 24fps.`
          : `Photorealistic 8K image-to-video. Heroic wide pullback. Complete platter of golden crispy Pla Som steams on dark artisan table under studio rim lights, clean composition, award-winning food commercial presentation, 24fps.`,
        prompt: `Heroic 8K master presentation of golden crispy fried Pla Som on artisan ceramic platter with lime and herbs. Warm amber backlight, steam drifting. Commercial food color grading, pure cinematography, zero visible text or watermarks. --ar ${aspectRatio}`,
        voice: "เซฟสูตรนี้ไว้ลองทำทานที่บ้าน หรือแชร์ให้คนที่คุณรักดูได้เลยครับ กดติดตามครัวเราไว้ เมนูเด็ดต่อไปรออยู่ครับ!",
        text: "เซฟสูตรกดติดตามด่วน! 🍽️",
        textPos: "Bottom Center CTA",
        sfx: "Signature luxury brand crescendo, triumphant culinary chime."
      }
    ];

    // ==========================================
    // GENERAL CULINARY MASTER POOL (DYNAMIC TO ANY DISH - ZERO GAPRAO POLLUTION)
    // ==========================================
    // NOTE: Pool has 9 curated entries despite "16" in name. For shots > 9, the dynamic wrapping logic at the assembly section handles overflow gracefully.
    const generalCookingMasterPool16 = [
      {
        type: `เปิดเรื่อง Hook ไวรัล (${productName})`,
        camera: "Dynamic Low-Angle Macro Push-in 100mm",
        motion: `Photorealistic 8K image-to-video. Chef initiating preparation of ${productName}. Sizzling pan with shimmering oil, controlled burst of culinary steam catching warm golden backlight. Sizzle sound, focused push-in on main ingredients. 24fps.`,
        prompt: `Master commercial culinary opening hook of ${productName}. Sizzling ingredients in seasoned cast-iron cookware, aromatic steam illuminated by warm 3200K key light. Shot on ARRI Alexa LF with 100mm Macro Prime. Commercial food grading, pure cinematography, zero text. --ar ${aspectRatio}`,
        voice: `เคยสงสัยไหมครับ... เคล็ดลับทำ ${productName} ให้อร่อยเข้มข้นจนทุกคนติดใจ อยู่ที่ขั้นตอนไหน!`,
        text: `เคล็ดลับเด็ด ${productName} ✨`,
        textPos: "Top Headline",
        sfx: "Aggressive cooking sizzle, dramatic culinary whoosh."
      },
      {
        type: "เตรียมวัตถุดิบคุณภาพพรีเมียม (Raw Ingredients Prep)",
        camera: "Overhead 90-Degree Flat Lay 50mm",
        motion: `Photorealistic 8K image-to-video. Overhead flat-lay on dark rustic timber surface. Chef gracefully arranging fresh premium ingredients for ${productName}. Dew droplets, natural organic color balance, 24fps.`,
        prompt: `Artisan overhead flat-lay of fresh premium raw ingredients for ${productName} on rustic wooden board. Shot on ARRI Alexa LF, 50mm Prime, soft natural lighting. --ar ${aspectRatio}`,
        voice: `จุดเริ่มต้นของความอร่อย คือการคัดสรรวัตถุดิบที่สดใหม่และลงตัวที่สุดสำหรับ ${productName}`,
        text: "คัดสรรวัตถุดิบสดใหม่ คุณภาพพรีเมียม 🌿",
        textPos: "Lower Third",
        sfx: "Light kitchen prep foley, rustling fresh herbs."
      },
      {
        type: "🔍 Extreme Macro ปรุงรสเข้มข้น (Seasoning & Heat Reaction)",
        camera: "🔍 Extreme Macro 100mm f/2.8",
        motion: `Photorealistic 8K image-to-video. Extreme macro of rich seasonings blending into ${productName}. Micro-bubbles bubbling actively, releasing aromatic vapor into backlight, 24fps.`,
        prompt: `Extreme macro 100mm f/2.8 of rich culinary seasonings blending into ${productName}, simmering micro-bubbles, glistening savory oils, cinematic lighting. --ar ${aspectRatio}`,
        voice: "ผสมผสานเครื่องปรุงสูตรลับเฉพาะ คลุกเคล้าให้ซึมลึกเข้าสู่ทุกอณู",
        text: "ปรุงรสสูตรเด็ด ซึมลึกเข้าเนื้อ 🍯",
        textPos: "Center Punchy",
        sfx: "Simmering bubbling sizzle, ladle scrape."
      },
      {
        type: "เร่งไฟแรงดึงกลิ่นหอม (High Heat Searing Action)",
        camera: "Low-Angle Tracking across Pan",
        motion: `Photorealistic 8K image-to-video. Cookware over roaring flame burner. Chef swiftly tossing and searing ${productName}, vapor swirling gracefully, 24fps.`,
        prompt: `Dynamic low-angle action shot of ${productName} sizzling in hot cookware over flames, chef tossing ingredients, rising aromatic steam. ARRI Alexa LF, 35mm Prime. --ar ${aspectRatio}`,
        voice: "คุมไฟอย่างแม่นยำ เพื่อล็อกรสชาติและความชุ่มฉ่ำให้อยู่ข้างใน",
        text: "คุมไฟแม่นยำ ล็อกความฉ่ำเต็มคำ 🔥",
        textPos: "Lower Third",
        sfx: "Energetic stove flame roar, cookware sizzle."
      },
      {
        type: "💡 B-Roll บรรยากาศกลิ่นหอมฟุ้ง (Kitchen Atmosphere)",
        camera: "💡 B-Roll 50mm Backlit Golden Haze",
        motion: `Photorealistic 8K image-to-video. Atmospheric slow slider. Savory culinary smoke ribbons drift through warm sunbeams in rustic kitchen, 24fps.`,
        prompt: `Cinematic B-roll cutaway of fragrant culinary steam ribbons drifting through golden sunbeams in kitchen, soft bokeh, nostalgic film atmosphere. --ar ${aspectRatio}`,
        voice: "กลิ่นหอมฟุ้งแตะจมูกทันที บ่งบอกว่าความอร่อยใกล้พร้อมเสิร์ฟแล้วครับ",
        text: "กลิ่นหอมฟุ้ง ชวนน้ำลายสอ 🤤",
        textPos: "Lower Third",
        sfx: "Gentle culinary acoustic atmosphere."
      },
      {
        type: "📐 Kinetic Crash Zoom จัดจานสุดประณีต (Artisan Plating)",
        camera: "📐 Kinetic Crash Zoom 24mm-70mm",
        motion: `Photorealistic 8K image-to-video. Snap zoom into artisan ceramic platter as ${productName} is beautifully arranged. Glistening textures, fresh garnishes placed with precision, 24fps.`,
        prompt: `Kinetic crash zoom of ${productName} being elegantly plated on artisan ceramic dish, glistening savory gloss, macro focus. --ar ${aspectRatio}`,
        voice: `จัดจานอย่างประณีต เผยให้เห็นหน้าตาของ ${productName} ที่สวยงามน่าทานที่สุด`,
        text: `จัดเสิร์ฟ ${productName} พร้อมชิม 🍽️`,
        textPos: "Center Punchy",
        sfx: "Dynamic swoosh, gentle plate set clink."
      },
      {
        type: "🔍 Extreme Macro ซูมเจาะความฉ่ำ (Texture & Moisture Close-up)",
        camera: "🔍 Extreme Macro 100mm f/2.8",
        motion: `Photorealistic 8K image-to-video. Extreme macro 100mm focus on glistening surface texture of ${productName}. Savory juices reflecting warm softbox highlights, steam rising softly, 24fps.`,
        prompt: `Extreme macro 100mm f/2.8 shot of succulent glistening textures of ${productName}, mouthwatering moisture highlights, shallow DOF. --ar ${aspectRatio}`,
        voice: "ดูความฉ่ำและรายละเอียดของอาหารครับ ทุกคำการันตีความอร่อยระดับพรีเมียม",
        text: "สัมผัสความฉ่ำ ละมุนลิ้นทุกคำ ✨",
        textPos: "Top Center",
        sfx: "Soft steam whisper, delicate dining sound."
      },
      {
        type: "ชิมคำแรกฟินเต็มคำ (First Bite Tasting Delight)",
        camera: "Medium Portrait 85mm Prime",
        motion: hasPresenter
          ? `Photorealistic 8K image-to-video. ${genderEn} takes delicious bite of ${productName}, closing eyes in authentic satisfaction and smiling warmly at camera, 24fps.`
          : `Photorealistic 8K image-to-video. Pristine dining showcase of ${productName} ready for tasting under soft restaurant spotlight, 24fps.`,
        prompt: `Warm commercial portrait of person savoring delicious bite of ${productName}, authentic smile of culinary delight, cozy restaurant lighting. --ar ${aspectRatio}`,
        voice: `คำแรกที่สัมผัส... รสชาติกลมกล่อมลงตัว ความอร่อยที่ทำเองที่บ้านก็ฟินได้เหมือนร้านดัง`,
        text: "ฟินตั้งแต่คำแรก อร่อยจนหยุดไม่ได้ 😋",
        textPos: "Lower Third",
        sfx: "Bright pleasant chime, cheerful dining warmth."
      },
      {
        type: "เผยผลลัพธ์ & Call to Action (Heroic Showcase & CTA)",
        camera: "Centered Master Culinary Pullback",
        motion: hasPresenter
          ? `Photorealistic 8K image-to-video. Heroic pullback. ${genderEn} proudly holding plate of ${productName}, smiling with welcoming invite, 24fps.`
          : `Photorealistic 8K image-to-video. Master presentation of ${productName} on wooden table with elegant styling, steam drifting, 24fps.`,
        prompt: `Heroic 8K master culinary presentation of ${productName} on dark ceramic plate. Soft daylight and warm backlight, steam drifting. Pure cinematography, zero text. --ar ${aspectRatio}`,
        voice: `เซฟสูตร ${productName} นี้ไว้ลองทำตามดูนะครับ หรือแชร์ให้คนที่คุณรัก กดติดตามครัวเราไว้ได้เลยครับ!`,
        text: "เซฟสูตรกดติดตามด่วน! 🍽️",
        textPos: "Bottom Center CTA",
        sfx: "Signature luxury brand crescendo, triumphant culinary chime."
      }
    ];

// ==========================================
    // BASE POOL SELECTION (DOMAIN-AWARE & SCALE-AWARE)
    // ==========================================
    const activePool = isDinosaurOrWildlife
      ? (resolvedCount <= 8 ? dinosaurMasterPool16.slice(0, 8) : dinosaurMasterPool16)
      : isFishOrPlaSom
      ? (resolvedCount <= 8 ? plaSomMasterPool16.slice(0, 8) : plaSomMasterPool16)
      : isPadGaprao
      ? (resolvedCount <= 8 ? cookingMasterPool8 : generalCookingMasterPool16)
      : isCooking
      ? (resolvedCount <= 8 ? generalCookingMasterPool16.slice(0, 8) : generalCookingMasterPool16)
      : isGraduation
      ? graduationMasterPool
      : isTemple
        ? templeMasterPool
        : isTravel
          ? travelMasterPool
          : isAuto
            ? autoMasterPool
            : STORYBOARD_8_PANEL_COMMERCIAL.panels.map((p, idx) => {
            const angleObj = THAI_CAMERA_ANGLES_36[idx % THAI_CAMERA_ANGLES_36.length];
            return {
              type: p.name,
              camera: idx % 2 === 0 ? "Smooth Forward Tracking Shot" : "Subtle 360 Orbit Glide",
              motion: `Photorealistic 8K image-to-video. Camera executes ${idx % 2 === 0 ? "Smooth Forward Tracking Shot" : "Subtle 360 Orbit Glide"}. ${hasPresenter ? `${genderEn} naturally performing ${actionPrompts} with relaxed charisma.` : "Heroic product showcase."} Real-world physical dynamics, rigid geometry, zero morphing. 24fps.`,
              prompt: `Photorealistic 8K commercial panel ${idx + 1} [${p.name}]. ${angleObj.promptKeyword}. ${p.detail} of ${productName} in ${effectiveEnvironmentText}. ${hasPresenter ? `${genderEn} with ${actionPrompts}.` : "Premium showcase."} --ar ${aspectRatio}`,
              voice: idx === 0
                ? `เริ่มต้นสัมผัสความพิเศษของ ${productName} ไปด้วยกัน`
                : idx === 3
                  ? `จุดเปลี่ยนสำคัญ ที่ทำให้ ${productName} แตกต่างจากสิ่งอื่น`
                  : idx === 7
                    ? `พร้อมให้คุณได้สัมผัสแล้ววันนี้! ${productPrice} ทักข้อความจองสิทธิ์ด่วน`
                    : `ความประทับใจในสเต็ปที่ ${idx + 1} ของ ${productName}`,
              sfx: idx === 7 ? "Triumphant brand sonic chime" : "Cinematic atmospheric soundscape."
            };
          });

    // Build exactly `resolvedCount` scenes
    if (resolvedCount === 1) {
      // 1-Shot Epic Master Single Take
      const timing = shotTimings[0];
      generatedScenes.push({
        id: `scene-1shot-1`,
        sceneNumber: 1,
        timecode: timing.timecode,
        durationSec: timing.durationSec,
        shotType: "วันเทคมาสเตอร์ช็อต (One-Take Epic Master Shot)",
        cameraMovement: "Continuous Seamless Steadicam Tracking with Dynamic Orbit",
        motionPrompt: `Photorealistic 8K image-to-video. Continuous seamless steadicam tracking shot. Subject and environment obey real-world Newtonian physical dynamics with natural motion blur. No morphing, rigid object geometry, authentic fluid/steam physics. 24fps.`,
        visualPromptEn: `Photorealistic 8K cinematic commercial one-take. ${productName} in ${effectiveEnvironmentText}. Seamless fluid steadicam tracking starting from wide establishing, smoothly transitioning into intimate medium shot of ${hasPresenter ? `${genderEn} with ${actionPrompts}` : "hero product showcase"}, culminating in heroic brand lockup. ARRI Alexa LF grading, pure cinematography, zero visible text or watermarks in frame. --ar ${aspectRatio}`,
        onScreenTextTh: userCustomTexts[0] || (isDinosaurOrWildlife ? "ปริศนาหัวใจแห่งป่าไดโนเสาร์ 🦕" : isFishOrPlaSom ? "เคล็ดลับทอดปลาส้ม หนังกรอบฟู ไม่เละ! 🐟" : isPadGaprao ? "เคล็ดลับกะเพราคั่วกระทะไหม้ 🔥" : isCooking ? `เคล็ดลับเด็ด ${productName} ✨` : isGraduation ? "พิกัดถ่ายรูปรับปริญญา 🎓" : isTemple ? "พิกัดวัดลับสุดสงบ 🪷" : isTravel ? "แจกแพลนเที่ยวเชียงใหม่ 🚗" : isAuto ? "THE DEFINITION OF LUXURY ✨" : `${productName} 🌟`),
        textPosition: "Top Center (Headline)",
        thaiVoiceover: isDinosaurOrWildlife
          ? "สำรวจความรักและความอ่อนโยนของไดโนเสาร์ในป่าลึก เซฟคลิปนี้ไว้แล้วแชร์ให้เพื่อนๆ รู้กันนะครับ!"
          : isFishOrPlaSom
          ? "เคล็ดลับทอดปลาส้มให้หนังกรอบฟู เนื้อในนุ่มฉ่ำ ไม่ติดกระทะ เซฟสูตรนี้ไว้ทำตาม แล้วกดติดตามกันได้เลยครับ!"
          : isPadGaprao
          ? "ความลับของกะเพราคั่วกระทะไหม้ สีเข้ม หอมกลิ่นกระทะแท้ เซฟสูตรนี้ไว้ทำตาม แล้วกดติดตามกันได้เลยครับ!"
          : isCooking
          ? `ความลับความอร่อยของ ${productName} ทำตามได้ง่ายๆ เซฟสูตรนี้ไว้ทำตาม แล้วกดติดตามกันได้เลยครับ!`
          : isGraduation
          ? "3 พิกัดถ่ายรูปรับปริญญาเชียงใหม่ฟีลต่างประเทศ เซฟคลิปนี้ไว้ถ่ายรูปด่วน จองคิวทักแชตเลยครับ!"
          : isTemple
            ? "พิกัดวัดลับสุดสงบกลางเชียงใหม่ ไหว้พระทำบุญเสริมสิริมงคล เซฟคลิปนี้ไว้ตามรอยกันได้เลยครับ!"
            : isTravel
              ? "แจกแพลน 1 วัน ตะลุยเที่ยวเชียงใหม่ เช้าจรดค่ำ เที่ยวครบ กินคุ้ม เซฟคลิปนี้ไว้ลุยทริปหน้าได้เลยครับ!"
              : isAuto
              ? `สัมผัสความเหนือระดับในทุกการขับขี่กับ ${productName} เป็นเจ้าของวันนี้รับข้อเสนอสุดพิเศษทันทีครับ!`
              : `นี่คือ ${productName} ที่ทุกคนตามหา ตอบโจทย์ทุกไลฟ์สไตล์ ทักข้อความรับสิทธิ์พิเศษทันที!`,
        audioSfx: "Continuous dynamic cinematic soundscape with triumphant closing chord.",
        status: "READY"
      });
    } else if (resolvedCount === 2) {
      // 2-Shot Short Hook & Solution
      const shot1 = activePool[0];
      const shot2 = activePool[activePool.length - 1] || activePool[1];
      const t1 = shotTimings[0];
      const t2 = shotTimings[1];

      generatedScenes.push({
        id: `scene-2shot-1`,
        sceneNumber: 1,
        timecode: t1.timecode,
        durationSec: t1.durationSec,
        shotType: "ช็อตเปิดดึงดูด (Viral Hook)",
        cameraMovement: shot1.camera,
        motionPrompt: (shot1 as any).motion || `Photorealistic 8K image-to-video. Camera executes ${shot1.camera}. Real-world physical action, rigid object geometry, zero morphing. 24fps.`,
        visualPromptEn: shot1.prompt,
        onScreenTextTh: userCustomTexts[0] || (shot1 as any).text || "พิกัดลับที่ไม่ควรพลาด ✨",
        textPosition: (shot1 as any).textPos || "Top Headline",
        thaiVoiceover: shot1.voice,
        audioSfx: shot1.sfx,
        status: "READY"
      });

      generatedScenes.push({
        id: `scene-2shot-2`,
        sceneNumber: 2,
        timecode: t2.timecode,
        durationSec: t2.durationSec,
        shotType: "ช็อตปิดและข้อเสนอ (Hero Solution & CTA)",
        cameraMovement: shot2.camera,
        motionPrompt: (shot2 as any).motion || `Photorealistic 8K image-to-video. Camera executes ${shot2.camera}. Real-world physical action, rigid object geometry, zero morphing. 24fps.`,
        visualPromptEn: shot2.prompt,
        onScreenTextTh: userCustomTexts[1] || (shot2 as any).text || "เซฟคลิปไว้แล้วทักแชตด่วน 📸",
        textPosition: (shot2 as any).textPos || "Bottom Center CTA",
        thaiVoiceover: shot2.voice,
        audioSfx: shot2.sfx,
        status: "READY"
      });
    } else if (resolvedCount === 3) {
      // 3-Shot Hook ➔ Highlight ➔ CTA
      const t1 = shotTimings[0];
      const t2 = shotTimings[1];
      const t3 = shotTimings[2];

      const s1 = activePool[0];
      const s2 = activePool[Math.floor(activePool.length / 2)] || activePool[1];
      const s3 = activePool[activePool.length - 1] || activePool[2];

      generatedScenes.push({
        id: `scene-3shot-1`,
        sceneNumber: 1,
        timecode: t1.timecode,
        durationSec: t1.durationSec,
        shotType: "ช็อตเปิดดึงดูด (Viral Hook)",
        cameraMovement: s1.camera,
        motionPrompt: (s1 as any).motion || `Photorealistic 8K image-to-video. Camera executes ${s1.camera}. Real-world physical action, rigid object geometry, zero morphing. 24fps.`,
        visualPromptEn: s1.prompt,
        onScreenTextTh: userCustomTexts[0] || (s1 as any).text || (isCooking ? `เคล็ดลับทำ ${productName} ให้อร่อย 🔥` : isTemple ? "พิกัดวัดลับสุดสงบ 🪷" : isTravel ? "แจกแพลนเที่ยวเชียงใหม่ 🚗" : "พิกัดพิเศษห้ามพลาด ✨"),
        textPosition: (s1 as any).textPos || "Top Headline",
        thaiVoiceover: s1.voice,
        audioSfx: s1.sfx,
        status: "READY"
      });

      generatedScenes.push({
        id: `scene-3shot-2`,
        sceneNumber: 2,
        timecode: t2.timecode,
        durationSec: t2.durationSec,
        shotType: "ช็อตไฮไลต์และประสบการณ์ (Core Highlight)",
        cameraMovement: s2.camera,
        motionPrompt: (s2 as any).motion || `Photorealistic 8K image-to-video. Camera executes ${s2.camera}. Real-world physical action, rigid object geometry, zero morphing. 24fps.`,
        visualPromptEn: s2.prompt,
        onScreenTextTh: userCustomTexts[1] || (s2 as any).text || "สัมผัสประสบการณ์เหนือระดับ 💎",
        textPosition: "Lower Third",
        thaiVoiceover: s2.voice,
        audioSfx: s2.sfx,
        status: "READY"
      });

      generatedScenes.push({
        id: `scene-3shot-3`,
        sceneNumber: 3,
        timecode: t3.timecode,
        durationSec: t3.durationSec,
        shotType: "ช็อตปิดการขาย (Call to Action & Offer)",
        cameraMovement: s3.camera,
        motionPrompt: (s3 as any).motion || `Photorealistic 8K image-to-video. Camera executes ${s3.camera}. Real-world physical action, rigid object geometry, zero morphing. 24fps.`,
        visualPromptEn: s3.prompt,
        onScreenTextTh: userCustomTexts[2] || (s3 as any).text || "เซฟพิกัดตามรอยด่วน! 📸",
        textPosition: (s3 as any).textPos || "Bottom Center CTA",
        thaiVoiceover: s3.voice,
        audioSfx: s3.sfx,
        status: "READY"
      });
    } else {
      // 4 to 36 shots: dynamically synthesize from active pool and 36 camera angles
      for (let i = 0; i < resolvedCount; i++) {
        const timing = shotTimings[i];

        let baseScene: { type: string; camera: string; motion?: string; prompt: string; voice: string; sfx: string };

        if (i < activePool.length) {
          baseScene = activePool[i];
        } else {
          // Dynamic generation for high shot counts (10 to 36 scenes)
          const angleIdx = i % THAI_CAMERA_ANGLES_36.length;
          const currentAngle = THAI_CAMERA_ANGLES_36[angleIdx];
          const actionItem = TOP_20_ACTIONS[i % TOP_20_ACTIONS.length];

          const cameraMovements = [
            "Dynamic Tracking Low-Angle",
            "Whip Pan Kinetic Transition",
            "Subtle 360 Orbit Glide",
            "Macro 85mm Push In",
            "Drone Panoramic Arc",
            "Smooth Steadicam Forward",
            "High-Speed 120fps Slow Dolly",
            "Dutch Angle Kinetic Push"
          ];
          const chosenMovement = cameraMovements[i % cameraMovements.length];

          const dynamicMotion = isCooking
            ? `Photorealistic 8K image-to-video. ${currentAngle.promptKeyword}. Authentic culinary action: chef smoothly works with cookware, tossing ingredients or adjusting heat, natural sizzling steam plumes rising into soft key light. Spatula and wok maintain rigid physical geometry, zero morphing, realistic fluid and heat dynamics, 24fps.`
            : `Photorealistic 8K image-to-video. Camera executes ${chosenMovement} (${currentAngle.en}). ${hasPresenter ? `${genderEn} styled in ${effectivePersonaText}, naturally performing ${actionItem.en} with relaxed charisma, authentic eye contact, natural posture and breathing.` : `Heroic commercial showcase of ${productName} in ${effectiveEnvironmentText}.`} Strict Newtonian physical dynamics, rigid object geometry, photorealistic lighting bounce, zero morphing or warping. 24fps.`;

          baseScene = {
            type: `${currentAngle.th}`,
            camera: `${chosenMovement} (${currentAngle.en})`,
            motion: dynamicMotion,
            prompt: `Photorealistic 8K cinematic commercial shot ${i + 1}. ${currentAngle.promptKeyword}. Capturing ${productName} in ${effectiveEnvironmentText}. ${hasPresenter ? `${genderEn} styled in ${effectivePersonaText}, ${actionItem.en} with natural charisma.` : "High-end product showcase."} ARRI Alexa LF commercial grading. --ar ${aspectRatio}`,
            voice: i === resolvedCount - 1
              ? (isDinosaurOrWildlife
                  ? "เซฟคลิปสารคดีนี้ไว้เลย แล้วแชร์ให้เพื่อนๆ ได้สัมผัสความมหัศจรรย์ของไดโนเสาร์ในป่าลึกไปด้วยกันครับ!"
                  : isCooking
                  ? "เซฟสูตรนี้ไว้ทำตามกันได้เลย แล้วกดติดตามไว้ เมนูเด็ดต่อไปรอคุณอยู่ครับ!"
                  : isGraduation
                  ? "เซฟคลิปนี้ไว้เลย แล้วแชร์ชวนเพื่อนๆ หรือจองคิวช่างภาพทักแชตได้เลยครับ!"
                  : isTemple
                    ? "เซฟคลิปนี้ไว้ตามรอย แล้วแชร์ชวนคนที่คุณรักมาไหว้พระทำบุญด้วยกันนะครับ!"
                    : isTravel
                      ? "เซฟแพลนนี้ไว้แล้วแท็กเพื่อนด่วน! ทริปหน้าเจอกันแน่นอนครับ!"
                      : `เซฟคลิปนี้ไว้เลย แล้วแท็กคนที่คุณอยากพาไปด้วย จองสิทธิ์พิเศษ ${productPrice} ทักแชตเลยครับ!`)
              : `มุมมองที่ ${i + 1} ความประทับใจที่สะท้อนเสน่ห์ของ ${productName}`,
            sfx: i === resolvedCount - 1 ? "Brand signature sonic crescendo." : "Rhythmic cinematic sound foley, motivated beat cut."
          };
        }

        const defaultText = userCustomTexts.length > 0
          ? (userCustomTexts[i] || userCustomTexts[i % userCustomTexts.length])
          : ((baseScene as any).text || (i === 0 ? "พิกัดลับที่ไม่ควรพลาด ✨" : i === resolvedCount - 1 ? "เซฟคลิปไว้แล้วทักแชตด่วน! 📲" : `มุมมองที่ ${i + 1} โทนสีละมุน 🎞️`));
        const defaultPos = (baseScene as any).textPos || (i === 0 ? "Top Headline" : i === resolvedCount - 1 ? "Bottom Center CTA" : "Lower Third");

        generatedScenes.push({
          id: `scene-dyn-${i + 1}`,
          sceneNumber: i + 1,
          timecode: timing.timecode,
          durationSec: timing.durationSec,
          shotType: i === 0 ? "ช็อต 01: เปิดเรื่อง (Viral Hook)" : i === resolvedCount - 1 ? `ช็อต ${i + 1 < 10 ? '0' + (i + 1) : i + 1}: เผยผลลัพธ์ & CTA` : `ช็อต ${i + 1 < 10 ? '0' + (i + 1) : i + 1}: ${baseScene.type}`,
          cameraMovement: baseScene.camera,
          motionPrompt: (baseScene as any).motion || `Photorealistic 8K image-to-video. Camera executes ${baseScene.camera}. Duration: ${timing.durationSec}s. Real-world physical action, smooth motion, natural depth, preserve anatomical consistency, zero morphing. 24fps.`,
          visualPromptEn: baseScene.prompt,
          onScreenTextTh: defaultText,
          textPosition: defaultPos,
          thaiVoiceover: baseScene.voice,
          audioSfx: baseScene.sfx,
          status: "READY"
        });
      }
    }

    // Average seconds per shot
    const avgSecPerShot = (totalSeconds / generatedScenes.length).toFixed(1);

    // Format Shot-by-Shot Block for Master Directive
    const shotDirectivesFormatted = generatedScenes.map(s => 
      `[SHOT ${s.sceneNumber}] ${s.shotType} | Timecode: ${s.timecode}\n- Duration: ${s.durationSec}s\n- On-Screen Text (TH): "${s.onScreenTextTh}"\n- Text Position: ${s.textPosition || "Lower Third"}\n- Thai Voiceover Script: "${s.thaiVoiceover}"\n- Visual Prompt (EN): ${s.visualPromptEn.replace(/[`"]/g, "'")}\n- Camera & Physical Motion (Veo 2): ${s.motionPrompt || s.cameraMovement}`
    ).join("\n\n");

    const pacingStyleLabel =
      pacingStyle === "dynamic_fast"
        ? "Dynamic Fast Cuts (คัตเร็วหลายมุมมอง)"
        : pacingStyle === "cinematic_slow"
          ? "Cinematic Slow (ซีนยาวเน้นอารมณ์)"
          : "Standard Commercial (มาตรฐานโฆษณา)";

    const masterDirectiveV3 = [
      `=== GOOGLE FLOW 3.0 MASTER PRODUCTION DIRECTIVE ===`,
      `CAMPAIGN: ${productName} (${brand})`,
      `TOTAL RUNTIME: ${totalSeconds} SECONDS | EXACT SHOT COUNT: ${generatedScenes.length} SHOTS (AVG ${avgSecPerShot}s / SHOT)`,
      `PACING STYLE: ${pacingStyleLabel}`,
      `PRODUCTION MODE: ${isPurePrompt ? "✨ PURE PROMPT-TO-VIDEO (100% PROMPT-DRIVEN / ZERO IMAGE UPLOADS REQUIRED)" : "🖼️ IMAGE ANCHOR REFERENCE (SLOT 1 PRESENTEE + SLOT 2 PRODUCT)"}`,
      `PRODUCTION SPECS: Aspect Ratio ${aspectRatio}, Style ${adStyle}, ARRI Alexa LF commercial grading, 8K photorealism.`,
      isPurePrompt
        ? `[SUBJECT SPEC]: Character looks, styling, and expressions are fully embedded in each visual prompt.`
        : (hasPresenter ? `[SUBJECT / FACE ANCHOR]: Lock facial features strictly to Slot 1 character reference. Persona: ${effectivePersonaText}.` : `[SUBJECT]: Culinary and product showcase without human characters.`),
      isPurePrompt
        ? `[PRODUCT / SCENE SPEC]: Detailed ingredients, textures, cooking states, and materials are fully specified in each visual prompt.`
        : (hasProduct ? `[PRODUCT ANCHOR]: Preserve exact product geometry, colors, and textures from Slot 2 reference image.` : `[PRODUCT]: Brand storytelling showcase.`),
      `ENVIRONMENT: ${effectiveEnvironmentText}`,
      ``,
      `CRITICAL GOOGLE VEO 2 PHYSICAL MOTION & ANTI-MORPHING RULES:`,
      `1. RIGID BODY & ANATOMICAL INTEGRITY: Utensils (woks, spatulas, spoons, knives, mortars), human hands, and cookware must maintain solid rigid structure throughout the shot. Zero melting, zero rubbery distortion, zero floating phantom objects.`,
      `2. CHOREOGRAPHED PHYSICAL ACTIONS: Execute the specific physical interactions defined in "- Camera & Physical Motion (Veo 2)" for each shot (e.g. hand firmly gripping wok handle, spatula flipping meat, hot oil micro-bubbles popping, sauce flash-vaporizing into billowing steam, spoon piercing yolk with realistic liquid viscosity).`,
      `3. STABLE CINEMATIC CAMERA: Camera motion must maintain a locked focal plane at 24fps with natural motion blur, shallow depth of field, and zero erratic jitter.`,
      ``,
      isPurePrompt
        ? `CRITICAL PRODUCTION RULE FOR GOOGLE FLOW (PURE PROMPT MODE):
1. ZERO IMAGE UPLOADS REQUIRED: Do NOT wait for, require, or block on 'Add Presenter' or 'Add Product' image inputs. Proceed directly with text-to-video generation.
2. STANDALONE VISUAL SPECIFICATIONS: Every shot below contains comprehensive, self-contained descriptions for textures, cooking state, camera lenses (${domainCameraSpecs.lens}), and lighting (${domainCameraSpecs.lighting}).
3. TOTAL CLIP RUNTIME MUST BE EXACTLY ${totalSeconds} SECONDS WITH EXACTLY ${generatedScenes.length} SHOTS (FROM SHOT 1 TO SHOT ${generatedScenes.length}).
4. ADHERE STRICTLY TO THE SPECIFIED TIMECODE, DURATION, VISUAL PROMPT, THAI VOICEOVER, AND PHYSICAL MOTION BELOW.`
        : `CRITICAL PRODUCTION RULE FOR GOOGLE FLOW (IMAGE REFERENCE ANCHORS):
1. ATTACH SLOT 1: Presenter Face Reference image.
2. ATTACH SLOT 2: Product / Dish Packshot Reference image.
3. LOCK CONSISTENCY: Enforce facial features and product geometry from reference images across all shots.
4. TOTAL CLIP RUNTIME MUST BE EXACTLY ${totalSeconds} SECONDS WITH EXACTLY ${generatedScenes.length} SHOTS (FROM SHOT 1 TO SHOT ${generatedScenes.length}).
5. ADHERE STRICTLY TO THE SPECIFIED TIMECODE, DURATION, VISUAL PROMPT, THAI VOICEOVER, AND PHYSICAL MOTION BELOW.`,
      ``,
      `STRICT AUDIO & VISUAL ANTI-DISTORTION CONSTRAINTS:`,
      `1. ZERO IN-IMAGE TEXT: Do NOT render, draw, or burn Thai characters, English subtitles, or watermarks directly into the video frames. All visual frames must be 100% clean photographic cinematography. Broken Thai glyphs in visual pixels are strictly forbidden.`,
      `2. THAI VOICEOVER IS SPOKEN AUDIO ONLY: All Thai text scripts specified below are exclusively for Spoken Voiceover Audio (TTS) and external caption tracks.`,
      `3. NARRATIVE DIALOGUE COHESION: The voiceover lines are structured as a seamless conversational story arc. Speak each line naturally matching modern Thai creator cadence.`,
      ``,
      `--- SHOT-BY-SHOT BLUEPRINT & LOCKED THAI VOICEOVERS (${generatedScenes.length} SHOTS) ---`,
      shotDirectivesFormatted,
      ``,
      `--- ON-SCREEN THAI TEXT & TYPOGRAPHY OVERLAY DIRECTIVE ---`,
      `1. ON-SCREEN TEXT RENDERING: Display the specified 'On-Screen Text (TH)' for each shot as clean, stylish on-screen text graphics (Modern Thai font, bold, crisp, with subtle drop shadow or frosted glass pill container for 100% legibility over video).`,
      `2. POSITIONING: Render text at the specified [Position] tag (Top Headline / Lower Third / Bottom Center CTA) perfectly timed with scene cuts.`,
      ``,
      `--- TWO-STAGE EXECUTION DIRECTIVE ---`,
      `STAGE 1 (Keyframe Stills): Generate all ${generatedScenes.length} photographic still images first. Review subject facial consistency and product accuracy. Use Face Correction prompt if any face is distorted.`,
      `STAGE 2 (Video Animation): After human approval of all ${generatedScenes.length} keyframes, animate each frame into video clips using the '- Camera & Physical Motion (Veo 2)' directives above.`
    ].join("\n");

    // Phase 1 & Phase 2 Structured Objects
    const phase1Keyframes = generatedScenes.map(s => ({
      sceneNumber: s.sceneNumber,
      timecode: s.timecode,
      durationSec: s.durationSec,
      shotType: s.shotType,
      cameraAngle: s.cameraMovement,
      onScreenTextTh: s.onScreenTextTh,
      textPosition: s.textPosition,
      imagePrompt: s.visualPromptEn,
      faceLockDirective: strictFaceLock ? STRICT_FACIAL_CONSISTENCY_PROMPT : "Maintain natural facial features from Slot 1 reference image.",
      faceCorrectionPrompt: `Portrait of same subject from reference photo, symmetrical face, natural skin texture, sharp clear eyes, photorealistic 8k, fix distorted facial features --ar ${aspectRatio}`,
      thaiVoiceover: s.thaiVoiceover,
      audioSfx: s.audioSfx
    }));

    const phase2Motions = generatedScenes.map(s => ({
      sceneNumber: s.sceneNumber,
      timecode: s.timecode,
      durationSec: s.durationSec,
      cameraMovement: s.cameraMovement,
      veoMotionPrompt: s.motionPrompt || `Image-to-video animation: Camera executes ${s.cameraMovement}. Duration: ${s.durationSec}s. Real-world physical action, smooth motion, natural depth, preserve character and product consistency, zero morphing. 24fps.`,
      targetDurationSec: s.durationSec
    }));

    return NextResponse.json({
      success: true,
      campaignTitle: `${productName} · Commercial Video`,
      brand,
      referenceMode,
      aspectRatio,
      adStyle,
      hasPresenter,
      hasProduct,
      strictFaceLock,
      storyboardType,
      presenterGender,
      presenterStyle: effectivePersonaText,
      presenterPersonas: resolvedPersonaList,
      autoPersona,
      environment: effectiveEnvironmentText,
      environments: resolvedEnvironmentList,
      autoEnvironment,
      targetDuration: totalSeconds,
      sceneCount: generatedScenes.length,
      pacingStyle,
      avgSecPerShot: Number(avgSecPerShot),
      masterCreativePrompt: masterDirectiveV3,
      masterDirectiveV3,
      phase1Keyframes,
      phase2Motions,
      referenceAssetRecommendations,
      scenes: generatedScenes,
      googleFlowUrl: "https://labs.google/fx/tools/flow/shared/tool/cfc7240d-3118-41b6-a08d-4bac91a1b1c5"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
