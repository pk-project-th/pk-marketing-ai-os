import { MediaBlueprint, MediaSlideDirective, Platform } from "@/types";
import { safeThaiTruncate } from "@/lib/caption-helper";

export interface PlatformMediaGuideline {
  recommendedCount: string;
  bestFormat: string;
  aspectRatio: string;
  tip: string;
}

export const PLATFORM_MEDIA_GUIDELINES: Record<string, PlatformMediaGuideline> = {
  facebook: {
    recommendedCount: "1 รูป หรือ 3-4 รูป",
    bestFormat: "ภาพเดี่ยว 1:1 หรือ อัลบั้ม Grid 3-4 รูป",
    aspectRatio: "1:1 / 4:5",
    tip: "Facebook เหมาะกับภาพเดี่ยวมีม/คำคม หรือเลย์เอาต์อัลบั้ม 1 ภาพใหญ่ + 2-3 ภาพย่อยเพื่อดึงยอดคลิกขยายภาพ"
  },
  instagram: {
    recommendedCount: "1 รูป หรือ 3-5 รูป",
    bestFormat: "ภาพเดี่ยว 1:1 / 4:5 หรือ Swipe Carousel",
    aspectRatio: "1:1 หรือ 4:5 (เต็มจอมือถือ)",
    tip: "IG ชอบภาพเดี่ยวคลีนมินิมอล หรือ Carousel 3-5 สไลด์เพื่อเพิ่มเวลาดู (Dwell Time) ของผู้ใช้"
  },
  tiktok: {
    recommendedCount: "1 คลิป 9:16 หรือ 4-6 รูป (Photo Mode)",
    bestFormat: "วิดีโอแนวตั้ง 9:16 หรือ สไลด์ภาพ TikTok Photo Mode",
    aspectRatio: "9:16 แนวตั้ง",
    tip: "TikTok Photo Mode กำลังไวรัลสูงมาก! นำภาพแนวตั้ง 4-6 รูปมาทำสไลด์ปัดคลอเพลงฮิต"
  },
  lemon8: {
    recommendedCount: "4-6 รูป",
    bestFormat: "การ์ดความรู้ 3:4 (Cover + Step-by-Step)",
    aspectRatio: "3:4 แนวตั้งการ์ด",
    tip: "Lemon8 ต้องมีภาพปกพาดหัวตัวหนังสือใหญ่ชัดเจน ตามด้วยสไลด์ทีละขั้นตอน และภาพสรุปของแท้/พิกัด/ราคา"
  },
  x: {
    recommendedCount: "1-2 รูป",
    bestFormat: "ภาพเดี่ยวแนวนอน 16:9 หรือ 1:1 Snapshot",
    aspectRatio: "16:9 หรือ 1:1",
    tip: "ผู้ใช้บน X ชอบภาพสแน็ปเหตุการณ์จริงภาพเดียวที่กระแทกตา ไม่ชอบกดเปิดอัลบั้มหลายรูป"
  },
  all: {
    recommendedCount: "1-4 รูป",
    bestFormat: "ปรับตามความเหมาะสมของเนื้อหา",
    aspectRatio: "1:1 หรือ 4:5",
    tip: "เลือกจำนวนรูปภาพให้สอดคล้องกับวัตถุประสงค์ เช่น ภาพเดี่ยวสำหรับประกาศ, 2 รูปสำหรับเปรียบเทียบ, หรืออัลบั้มสำหรับเจาะลึก"
  }
};

/**
 * Domain-specific real-world photography, camera angles, and shot-list generator.
 * Guides creators on what physical photos to shoot, what angles to use, and tricks with smartphones.
 * Dynamically adapts to 1, 2, 3, 4, 5+ images based on content type and platform!
 */
export function buildDefaultMediaBlueprint(
  brandName: string,
  title: string,
  brief: string = "",
  rawBlueprint?: Partial<MediaBlueprint> | null,
  preferredCountInput?: number | string,
  isVideoMode?: boolean
): MediaBlueprint {
  const combined = `${brandName} ${title} ${brief}`.toLowerCase();
  const isVideo = isVideoMode !== undefined
    ? isVideoMode
    : (combined.includes("วิดีโอ") || combined.includes("คลิปสั้น") || combined.includes("reels") || combined.includes("tiktok"));

  if (isVideo && (!rawBlueprint || !rawBlueprint.slides || rawBlueprint.slides.length === 0)) {
    const isFood = combined.includes("อาหาร") || combined.includes("ทำอาหาร") || combined.includes("สูตร") || combined.includes("เมนู") || combined.includes("ครัว") || combined.includes("เชฟ") || combined.includes("กิน") || combined.includes("กะเพรา") || combined.includes("ผัด");
    const isTemple = combined.includes("วัด") || combined.includes("ทำบุญ") || combined.includes("ไหว้พระ") || combined.includes("สายมู") || combined.includes("พระธาตุ") || combined.includes("พุทธ");
    const isTravel = combined.includes("เชียงใหม่") || combined.includes("เที่ยว") || combined.includes("คาเฟ่") || combined.includes("ถ่ายรูป") || combined.includes("ทริป");
    const isCar = combined.includes("รถ") || combined.includes("mazda") || combined.includes("byd") || combined.includes("ev") || combined.includes("car");
    const isDinosaur = combined.includes("ไดโนเสาร์") || combined.includes("dinosaur") || combined.includes("จูราสสิก") || combined.includes("jurassic") || combined.includes("สารคดี") || combined.includes("ป่าดึกดำบรรพ์") || combined.includes("สัตว์ป่า") || combined.includes("สัตว์โลก") || combined.includes("ป่าลึก");

    // Resolve Requested Scene Count (Dynamic & Uncapped: 4 to 24+ scenes)
    let targetCount = 10; // Default Pro Multi-Shot (10-12 scenes)
    if (typeof preferredCountInput === "number" && preferredCountInput > 0) {
      targetCount = preferredCountInput;
    } else if (typeof preferredCountInput === "string") {
      const parsed = parseInt(preferredCountInput, 10);
      if (!isNaN(parsed) && parsed > 0) {
        targetCount = parsed;
      } else if (preferredCountInput === "3") {
        targetCount = 3;
      } else if (preferredCountInput === "4") {
        targetCount = 4;
      } else if (preferredCountInput === "6") {
        targetCount = 6;
      } else if (preferredCountInput === "8") {
        targetCount = 8;
      } else if (preferredCountInput === "12" || preferredCountInput === "pro_12") {
        targetCount = 12;
      } else if (preferredCountInput === "16" || preferredCountInput === "pro_16") {
        targetCount = 16;
      } else if (preferredCountInput === "20" || preferredCountInput === "epic_20") {
        targetCount = 20;
      } else if (preferredCountInput === "auto") {
        targetCount = 10; // AI Auto Pro Multi-Shot
      }
    }
    targetCount = Math.max(1, Math.min(30, targetCount));

    // ==========================================
    // DOMAIN-SPECIFIC COMPREHENSIVE MULTI-SHOT POOLS (UP TO 16-20 SCENES)
    // ==========================================
    let domainMasterPool: MediaSlideDirective[] = [];

    if (isFood) {
      domainMasterPool = [
        {
          slide_no: 1,
          visual: `ช็อต 01: เปิดตัว Hook ไวรัล (0:00 - 0:03): ช็อตกระทะเหล็กร้อนฉ่า เปลวไฟลุกสะบัดเบาๆ เสียงฉ่าสนั่นจอ ควันหอมพุ่งกระแทกสายตา หยุดนิ้วคนดูทันที`,
          camera_angle: "📐 Motorized Gimbal 45° Push-in ดิ่งเข้าหาหน้ากระทะ เลนส์ 50mm f/1.8",
          real_photo_tip: "💡 ถ่าย 4K 60fps เปิดคลิปด้วยช็อตกระทะร้อนๆ ตอนควันพวยพุ่ง ห้ามเปิดด้วยการยืนนิ่ง",
          text_overlay: safeThaiTruncate(title, 35),
          shoot_instruction: "ถ่ายแนวตั้ง 9:16 มุมมองชวนหิว แสงเฉียง 45 องศา เห็นควันและประกายน้ำมันชัดเจน",
          prompt: `Master commercial culinary cinematography 9:16 vertical opening hook of ${title}, sizzling ingredients in seasoned cast-iron wok with dynamic flame flares, 60fps high-speed capture. Camera: Motorized gimbal push-in. Lighting: Warm 3200K key light with soft overhead softbox, steam illuminated. ARRI Alexa Mini LF, 4K photorealism.`
        },
        {
          slide_no: 2,
          visual: `ช็อต 02: บดโขลกเครื่องปรุงสด (0:03 - 0:06): ครกหินโขลกพริกจินดาแดงและกระเทียมไทยสดๆ เสียงตึงตังหนักแน่น น้ำมันหอมระเหยกระจาย`,
          camera_angle: "📐 High-Angle 60° Close-up เลนส์ 85mm f/1.8",
          real_photo_tip: "💡 โคลสอัพใกล้ปากครก ให้เห็นเนื้อพริกกระเทียมแตกหยาบๆ สีสันสดจัดจ้าน",
          text_overlay: "พริกกระเทียมสด โขลกหยาบหอมเตะจมูก",
          shoot_instruction: "ถ่ายเก็บจังหวะสากกระทบครก 2-3 วินาที เน้นความสดของวัตถุดิบ",
          prompt: `Cinematic close-up of granite mortar and pestle rhythmically crushing vibrant red chilies and fresh garlic cloves for ${title}. Aromatics releasing moisture droplets, high-speed 60fps.`
        },
        {
          slide_no: 3,
          visual: `ช็อต 03: 🔍 Extreme Macro Insert (0:06 - 0:09): พริกกระเทียมสไลด์ลงน้ำมันร้อนจัด ฟองเดือดปุดรอบขอบพริก เกิดควันหอมฟุ้งลอยม้วนขึ้น`,
          camera_angle: "🔍 Extreme Macro 100mm f/2.8 เจาะลึกระดับหยดน้ำมัน",
          real_photo_tip: "💡 ซูม 2x-3x เจาะที่ผิวหน้ากระทะตอนวัตถุดิบสัมผัสน้ำมัน วินาทีแรกที่กลิ่นฉุนกระจาย",
          text_overlay: "ผัดพริกกระเทียมลงน้ำมันร้อนจัด 🔥",
          shoot_instruction: "โคลสอัพมาโครนิ่งๆ คมกริบ เห็นการเดือดของน้ำมันรอบชิ้นกระเทียม",
          prompt: `Extreme macro 100mm f/2.8 insert of crushed chilies and garlic hitting shimmering hot wok oil for ${title}. Rapid micro-bubble eruption, rising golden vapor, cinematic lighting.`
        },
        {
          slide_no: 4,
          visual: `ช็อต 04: 📐 Kinetic Crash Zoom (0:09 - 0:12): หมูสับ/เนื้อสัตว์สดๆ โดนเทลงกระทะ เสียงฉ่าดังกึกก้อง ซูมเร็วพุ่งเข้าหาเนื้อสัตว์`,
          camera_angle: "📐 Kinetic Crash Zoom 24mm-70mm สลับสปีดเร็ว",
          real_photo_tip: "💡 ดันซูมเข้าอย่างรวดเร็ว (Snap Zoom) จังหวะที่เนื้อสัมผัสกระทะ สร้างความตื่นเต้นสะใจ",
          text_overlay: "ลงเนื้อคั่วกระทะ เสียงฉ่าสะท้านจอ 🥩",
          shoot_instruction: "จังหวะซูมกระชับ เพิ่มความดุดันและน่ากินของกระบวนการทำอาหาร",
          prompt: `Kinetic crash zoom commercial shot of seasoned ground meat hitting scorching iron wok for ${title}, sizzling aggressively, aromatic steam explosion, crisp cinematic focus.`
        },
        {
          slide_no: 5,
          visual: `ช็อต 05: การยีเนื้อและคั่วไฟแรง (0:12 - 0:15): ตะหลิวเหล็กสับยีเนื้อให้กระจายทั่วผิวกระทะ คั่วจนเนื้อเริ่มเกรียมกรอบด้านนอกแต่นุ่มฉ่ำด้านใน`,
          camera_angle: "📐 Low-Angle 45° Side Tracking มองผ่านขอบกระทะ",
          real_photo_tip: "💡 ถ่ายมุมต่ำระดับเตาไฟ เห็นเปลวแก๊สสีฟ้าทองเลียใต้กระทะและตะหลิวกำลังคั่วเนื้อ",
          text_overlay: "คั่วไฟแรงจนเนื้อเกรียมหอมฉ่ำ",
          shoot_instruction: "ถ่ายเก็บแอ็กชันมือเชฟและการเคลื่อนไหวของกระทะอย่างมั่นคง",
          prompt: `Low-angle dynamic tracking of metal spatula rapidly breaking and tossing minced meat in seasoned wok for ${title}, golden brown caramelization forming on high heat, 60fps.`
        },
        {
          slide_no: 6,
          visual: `ช็อต 06: 💡 B-Roll Atmosphere Cutaway (0:15 - 0:18): ควันกระทะหอมกรุ่นลอยผ่านลำแสงแดดยามบ่ายที่ส่องผ่านหน้าต่างครัว มู้ดโทนอบอุ่นน่ากิน`,
          camera_angle: "💡 Atmosphere B-Roll 50mm ย้อนแสงธรรมชาติ (Backlight Glow)",
          real_photo_tip: "💡 ถ่ายช็อตตัดควันลอยตัดกับแสงหน้าต่าง ช่วยเบรกจังหวะและยกระดับวิดีโอให้ดูเหมือนภาพยนตร์",
          text_overlay: "กลิ่นควันกระทะแท้ ฟุ้งทั้งครัว ✨",
          shoot_instruction: "ถ่ายนิ่งๆ 2 วินาที คุมแสงย้อนให้เห็นละอองควันลอยละมุนตา",
          prompt: `Cinematic B-roll cutaway of fragrant culinary smoke ribbons drifting through warm golden sunbeams in a rustic modern kitchen, soft bokeh, nostalgic film atmosphere, 4K.`
        },
        {
          slide_no: 7,
          visual: `ช็อต 07: 🔍 Extreme Macro Insert ราดซอสขอบกระทะ (0:18 - 0:21): ซอสปรุงรสเข้มข้นถูกราดลงบนขอบกระทะที่ร้อนจัด ซอสเดือดฟู่เปลี่ยนเป็นคาราเมลสีเข้มเคลือบเนื้อ`,
          camera_angle: "🔍 Extreme Macro 100mm f/2.8 ซูมเจาะขอบกระทะ",
          real_photo_tip: "💡 ราดซอสที่ขอบกระทะแทนที่จะราดลงเนื้อโดยตรง ซอสจะไหม้นิดๆ ให้กลิ่นหอมกระทะอันเป็นเอกลักษณ์",
          text_overlay: "เคล็ดลับ: ราดซอสขอบกระทะร้อนจัด!",
          shoot_instruction: "โคลสอัพจังหวะซอสสัมผัสโลหะร้อนจัด เกิดฟองฟู่และสีเคลือบมันวาว",
          prompt: `Extreme macro 100mm insert of dark umami seasoning sauce drizzled along the red-hot rim of the wok for ${title}, instantly caramelizing into aromatic glaze, rich bubbles.`
        },
        {
          slide_no: 8,
          visual: `ช็อต 08: 🎬 Over-The-Shoulder (OTS) สะบัดกะเพรา (0:21 - 0:24): มุมมองผ่านไหล่เชฟ มองตรงไปที่การโปรยใบกะเพราสดแล้วสะบัดกระทะลอยเคว้งกลางอากาศ`,
          camera_angle: "🎬 Over-The-Shoulder (OTS) 35mm f/2.0 ถ่ายจากด้านหลังเชฟ",
          real_photo_tip: "💡 ยืนถ่ายจากด้านหลังเห็นหัวไหล่เชฟและมุมมองที่เชฟเห็น เพิ่มความสมจริงเหมือนคนดูอยู่หน้าเตา",
          text_overlay: "สะบัดใบกะเพรา ปิดไฟล็อกความหอม 🌿",
          shoot_instruction: "ถ่ายจับจังหวะใบกะเพราลอยกลางอากาศและตกลงมาสลดความร้อนในกระทะ",
          prompt: `Over-the-shoulder perspective of chef tossing fresh holy basil leaves into the smoking wok for ${title}, airborne food toss, vibrant green leaves glistening, 60fps.`
        },
        {
          slide_no: 9,
          visual: `ช็อต 09: 🌀 360° Circular Orbit คลุกเคล้า (0:24 - 0:27): กล้องหมุนวนเบาๆ รอบกระทะ เห็นเนื้อสัตว์เคลือบซอสเข้มข้นเงาวับและใบกะเพราสีเขียวมรกต`,
          camera_angle: "🌀 Smooth 360° Circular Orbit เลนส์ 50mm",
          real_photo_tip: "💡 เดินวนรอบเตาหรือหมุนกิมบอลอย่างนุ่มนวล ให้เห็นมิติความฉ่ำเงาทุกองศา",
          text_overlay: "เคลือบซอสเงาวับ หอมฉุนเตะจมูก",
          shoot_instruction: "หมุนกล้องสมูทต่อเนื่อง แสดงความสุกและเนื้อสัมผัสที่สมบูรณ์แบบ",
          prompt: `Smooth circular orbit tracking shot around steaming finished wok stir-fry of ${title}, glossy dark amber glaze, wilted basil leaves, rich appetizing shine, 4K.`
        },
        {
          slide_no: 10,
          visual: `ช็อต 10: ทอดไข่ดาวขอบกรอบฟู (0:27 - 0:30): ไข่ดาวลงกระทะน้ำมันร้อนจัด ขอบไข่ขาวฟูพองเป็นลูกไม้สีน้ำตาลทอง ไข่แดงตรงกลางเต่งตึงดั่งดวงตะวัน`,
          camera_angle: "📐 Top-Down 90° Flat-lay สลับ Macro 45°",
          real_photo_tip: "💡 ใช้น้ำมันท่วมและร้อนจัด ตักน้ำมันราดรอบไข่ขาวให้กรอบฟู แต่ไข่แดงยังเยิ้มลาวา",
          text_overlay: "ไข่ดาวลาวา ขอบกรอบฟูสีทอง 🍳",
          shoot_instruction: "ถ่ายเก็บฟองน้ำมันเดือดรอบขอบไข่ดาวอย่างชัดเจน",
          prompt: `Cinematic close-up of Thai-style crispy fried egg sizzling in wok oil for ${title}, golden ruffled lace edges, plump vibrant orange runny yolk, macro sizzle.`
        },
        {
          slide_no: 11,
          visual: `ช็อต 11: 📐 Kinetic Zoom In วางบนข้าวสวย (0:30 - 0:33): ข้าวสวยร้อนๆ เม็ดเรียวขาวนุ่มในจานเซรามิก ตักไข่ดาวและกะเพราราดทับลงไป ซูมเข้าหาความน่ากิน`,
          camera_angle: "📐 Kinetic Zoom In เลนส์ 50mm f/1.8",
          real_photo_tip: "💡 ถ่ายข้าวสวยตอนควันกำลังกรุ่น ตักอาหารราดลงไปช้าๆ ให้คนดูเห็นเลเยอร์ของอาหาร",
          text_overlay: "ตักเสิร์ฟบนข้าวสวยร้อนๆ หอมฟุ้ง 🍚",
          shoot_instruction: "ซูมกล้องเข้าหาจานข้าวอย่างนุ่มนวลและตรงจังหวะ",
          prompt: `Smooth kinetic push-in as crispy fried egg and glistening savory meat of ${title} are plated over a steaming bowl of fluffy jasmine rice, rising steam, warm restaurant ambience.`
        },
        {
          slide_no: 12,
          visual: `ช็อต 12: 🔍 Extreme Macro Insert เจาะไข่แดงลาวา (0:33 - 0:36): ปลายช้อนแตะเจาะเยื่อไข่แดง ไข่แดงสีส้มทองข้นคลั่กไหลเยิ้มช้าๆ เคลือบลงบนเนื้อหมูและข้าวสวย`,
          camera_angle: "🔍 Extreme Macro 100mm f/2.8 โฟกัสจุดไข่แดงแตก",
          real_photo_tip: "💡 ใช้ 60fps ซูมใกล้สุดๆ ช็อตเจาะไข่แดงคือ 'Money Shot' ที่ทำให้อัตราการดูซ้ำ (Loop rate) พุ่งสูงที่สุด",
          text_overlay: "เจาะไข่แดงลาวา ฟินเต็มคำ! 🤤",
          shoot_instruction: "กดช้อนช้าๆ ให้ไข่แดงค่อยๆ ไหลเยิ้มอย่างเป็นธรรมชาติ",
          prompt: `Extreme macro 100mm 60fps shot of a stainless steel spoon piercing delicate runny egg yolk of ${title}, thick velvety golden yolk slowly cascading over glossy meat and rice grains.`
        },
        {
          slide_no: 13,
          visual: `ช็อต 13: ⏳ Slow-Motion 120fps ตักคำโต (0:36 - 0:39): ช้อนตักเนื้อหมู ข้าว และไข่แดงเยิ้มๆ ยกขึ้นมาช้าๆ เม็ดพริกและใบกะเพราติดขึ้นมาครบเครื่อง`,
          camera_angle: "📐 Low-to-High Upward Tilt สโลว์โมชัน 120fps",
          real_photo_tip: "💡 ตักอาหารยกขึ้นตรงเข้าหากล้อง แสงด้านหลังส่องให้เห็นความฉ่ำของซอสที่หยดเบาๆ",
          text_overlay: "คำแรกฟินตาค้าง เข้มข้นถึงใจ ✨",
          shoot_instruction: "ยกช้อนนิ่งๆ ปลายช้อนโฟกัสชัดเจน ฉ่ำวาวน่าทานที่สุด",
          prompt: `Slow-motion 120fps upward tilt of a spoon lifting a generous bite of ${title} with glistening sauce droplets and runny yolk, steam swirling, mouthwatering commercial focus.`
        },
        {
          slide_no: 14,
          visual: `ช็อต 14: 🎬 Reaction ความฟินของผู้ชิม (0:39 - 0:42): คนชิมนำเข้าปาก เคี้ยวคำแรกแล้วเบิกตากว้างด้วยความอร่อย ยิ้มพยักหน้าอย่างมีความสุข`,
          camera_angle: "🎬 Medium Portrait 85mm f/1.4 หน้าชัดหลังละลาย",
          real_photo_tip: "💡 จับสีหน้าจริงที่เป็นธรรมชาติ ไม่ต้องโอเวอร์แอ็กติ้ง ให้เห็นความสุขที่ได้กินของอร่อย",
          text_overlay: "อร่อยจนต้องหยุดพูด! รสชาติต้นตำรับ",
          shoot_instruction: "ถ่ายจับรีแอ็กชัน 2-3 วินาที สร้างความน่าเชื่อถือและความอยากกินตาม",
          prompt: `Cinematic medium portrait of food creator tasting ${title}, genuine spontaneous joyful reaction, nodding with delighted smile, warm natural lighting, shallow depth of field.`
        },
        {
          slide_no: 15,
          visual: `ช็อต 15: 🌅 บรรยากาศโต๊ะอาหาร Golden Hour (0:42 - 0:45): ภาพกว้างโต๊ะอาหารไม้ชนบท แก้วน้ำมีน้ำแข็งกระทบ แสงแดดสีทองยามเย็นสะท้อนจานอาหารอย่างอบอุ่น`,
          camera_angle: "🌅 Wide Cinematic 35mm แสง Golden Hour ย้อนแสง",
          real_photo_tip: "💡 เก็บบรรยากาศโต๊ะอาหารรอบๆ เพื่อให้คลิปมีเรื่องราวและดูมีชีวิตชีวา",
          text_overlay: "เมนูโปรดประจำบ้าน ทำง่ายอร่อยจริง 🏡",
          shoot_instruction: "ถ่ายนิ่งๆ 2 วินาที คุมแสงให้อบอุ่น ละมุนตา",
          prompt: `Warm cinematic wide shot of dining table setting with ${title}, golden hour evening light filtering through window, cold drink with ice condensation, cozy lifestyle atmosphere.`
        },
        {
          slide_no: 16,
          visual: `ช็อต 16: 👑 Hero Plating & Call To Action (0:45 - 0:48): จานอาหารสมบูรณ์แบบตั้งกลางเฟรมอย่างสง่างาม ควันลอยกรุ่น พร้อมกราฟิกข้อความชวนเซฟสูตรและกดติดตาม`,
          camera_angle: "📐 Centered Master Pullback ถอยกล้องตั้งหลักกลางเฟรม",
          real_photo_tip: "💡 ถอยกล้องนิ่งๆ เว้นพื้นที่ด้านบนและล่างสำหรับวางตัวหนังสือ CTA อย่างชัดเจน",
          text_overlay: "เซฟสูตรไว้ทำตามด่วน! กดติดตามเลย 🍽️✨",
          shoot_instruction: "ซีนปิดท้ายดึงดูดใจ กระตุ้นให้ผู้ชมกดบันทึกหรือแชร์ทันที",
          prompt: `Master heroic culinary commercial pullback of completed plate of ${title} on artisan ceramic platter, gentle steam ribbons rising, award-winning food styling, clean negative space for branding.`
        }
      ];
    } else if (isDinosaur) {
      domainMasterPool = [
        {
          slide_no: 1,
          visual: `ช็อต 01: เปิดเรื่องหมอกยามเช้ากลางหุบเขาจูราสสิก (0:00 - 0:03): เคลื่อนกล้องลอดซุ้มเฟิร์นโบราณยักษ์ แสงอรุณส่องทะลุม่านหมอกหนาทึบ เผยเงาสะท้อนอันยิ่งใหญ่ของไดโนเสาร์คอยาวกำลังกินยอดไม้`,
          camera_angle: "📐 Slow Forward Crane Glide 35mm มุมมองกว้างสะกดตา",
          real_photo_tip: "💡 ถ่ายทอดสไตล์สารคดี BBC Earth เปิดคลิปด้วยสเกลความยิ่งใหญ่ของธรรมชาติยุคดึกดำบรรพ์",
          text_overlay: "เคยเห็นไดโนเสาร์หัวเราะไหม? 🦕",
          shoot_instruction: "ถ่ายมูดโทนลึกลับและสงบ แสงแดดส่องทะลุหมอก (God rays) ต้นเฟิร์นโบราณไหวตามลม",
          prompt: `Cinematic 8K nature documentary establishing shot of primeval Jurassic misty rainforest at sunrise. Ancient giant tree ferns, moss-covered cycads, golden morning god rays cutting through dense humid fog. In background, a majestic towering Brachiosaurus peacefully browsing prehistoric canopy leaves. BBC Earth cinematography, shot on RED Monstro 8K, 35mm lens, ARRI Alexa LF wildlife grade, zero visible text or watermarks. --ar 9:16`
        },
        {
          slide_no: 2,
          visual: `ช็อต 02: สำรวจรอยเท้ายักษ์ริมธารน้ำใส (0:03 - 0:06): กล้องเคลื่อนเลี่ยผิวน้ำใสแจ๋ว เผยรอยเท้ายักษ์ของไดโนเสาร์ที่ฝังลึกลงในดินโคลนภูเขาไฟและมอสเขียวชอุ่ม`,
          camera_angle: "📐 Low-Angle 24mm เลี่ยผิวน้ำลำธาร (Skimming Water)",
          real_photo_tip: "💡 ถ่ายมุมต่ำระดับผิวดิน ให้เห็นมิติความลึกของรอยเท้าและความชุ่มชื้นของผืนป่า",
          text_overlay: "รอยเท้ายักษ์กลางป่าลึก 🐾",
          shoot_instruction: "เคลื่อนกล้องนุ่มนวล ผิวน้ำกระเพื่อมเบาๆ ละอองน้ำประกายแสง",
          prompt: `Low-angle tracking shot skimming crystalline primeval river waters with gentle ripples. Camera reveals a colossal, fossil-like fresh dinosaur footprint deeply imprinted into the damp mossy volcanic mud along the riverbank. Dewdrops glisten on ancient liverwort plants, small prehistoric dragonflies hovering, 24fps.`
        },
        {
          slide_no: 3,
          visual: `ช็อต 03: 🔍 Extreme Macro Insert เกล็ดผิวสัมผัสสมจริง (0:06 - 0:09): โคลสอัพมาโครเกล็ดผิวหนังของไดโนเสาร์ที่มีลวดลายตามธรรมชาติ หยดน้ำค้างเกาะพราวตา มีชีวิตชีวา`,
          camera_angle: "🔍 Extreme Macro 100mm f/2.8 เจาะลึกระดับเกล็ด",
          real_photo_tip: "💡 ซูมเจาะลึกที่ผิวสัมผัสและกล้ามเนื้อที่ขยับตามการหายใจ ไร้ความรู้สึกเหมือนงาน AI หลอกตา",
          text_overlay: "ผิวสัมผัสเกล็ดสมจริง ดั่งมีชีวิต 🔬",
          shoot_instruction: "โคลสอัพนิ่งๆ คมชัดทุกรูขุมขนและเกล็ดสัตว์เลื้อยคลานโบราณ",
          prompt: `Extreme macro 100mm f/2.8 insert of lifelike reptilian textured scales on a resting dinosaur, morning dew droplets clinging to rough ridges, gentle organic chest breathing motion, photorealistic skin pores, 8K ultra detail.`
        },
        {
          slide_no: 4,
          visual: `ช็อต 04: 📐 Kinetic Crash Zoom ลูกไดโนเสาร์โผล่พงหญ้า (0:09 - 0:12): ซูมเร็วพุ่งเข้าหาพุ่มเฟิร์น ลูกไดโนเสาร์ตัวน้อยเอียงคอแววตาสงสัยกระพริบตาแป๋ว`,
          camera_angle: "📐 Kinetic Crash Zoom 50mm สลับรวดเร็ว",
          real_photo_tip: "💡 ดันซูมเข้าหาแววตาของสิ่งมีชีวิต สร้างจุดโฟกัสที่น่ารักและน่าประทับใจทันที",
          text_overlay: "สิ่งมีชีวิตตัวน้อยกลางป่าโบราณ ✨",
          shoot_instruction: "ซูมรวดเร็วจับอารมณ์ความอยากรู้อยากเห็นของลูกไดโนเสาร์",
          prompt: `Kinetic snap zoom into lush prehistoric ferns, revealing a curious infant dinosaur with sparkling intelligent golden eyes, head tilting inquisitively, soft downy feathers, BBC Earth wildlife photography.`
        },
        {
          slide_no: 5,
          visual: `ช็อต 05: สายใยความผูกพันของแม่ลูก (0:12 - 0:15): แม่ไดโนเสาร์เกราะหนาไตรเซอราทอปส์ก้มลงเอาปลายจมูกคลอเคลียลูกน้อยอย่างอ่อนโยนใต้ร่มใบปาล์มยักษ์`,
          camera_angle: "🎬 Intimate 85mm Prime Slider ช้าๆ ละมุนตา",
          real_photo_tip: "💡 ถ่ายทอดความอ่อนโยนที่ซ่อนอยู่ในความแข็งแกร่ง ให้ภาพเล่าเรื่องราวความรักของธรรมชาติ",
          text_overlay: "สายใยความรักที่อ่อนโยน 💖",
          shoot_instruction: "เคลื่อนกล้องสไลด์นุ่มนวล แสงแดดรำไรตกกระทบแผงคอ",
          prompt: `Photorealistic 8K intimate wildlife portrait of an armored mother Triceratops tenderly nuzzling her curious infant calf in a sun-dappled Jurassic clearing. Hyper-detailed textured scales, gentle intelligent eyes, warm morning backlight filtering through palm fronds.`
        },
        {
          slide_no: 6,
          visual: `ช็อต 06: ไดโนเสาร์ขี้เล่นริมน้ำตก (0:15 - 0:18): ไดโนเสาร์พาราซอโรโลฟัสรุ่นเยาว์ยืนริมน้ำตกสีมรกต สะบัดเท้าเล่นน้ำกระจายเป็นประกาย ส่งเสียงร้องก้องกังวานดั่งเสียงหัวเราะ`,
          camera_angle: "📐 Dynamic Medium 50mm จับละอองน้ำกระเซ็น",
          real_photo_tip: "💡 ถ่ายสปีดสูงหยุดหยดน้ำกระเซ็นกลางอากาศ สื่อถึงความสุขและ 'เสียงหัวเราะของไดโนเสาร์'",
          text_overlay: "เสียงหัวเราะแห่งป่าโบราณ 💦",
          shoot_instruction: "จับจังหวะละอองน้ำสะท้อนแสงแดดระยิบระยับ",
          prompt: `Medium shot of a spirited juvenile Parasaurolophus dinosaur playfully splashing crystalline water in a turquoise prehistoric lagoon beneath a cascading jungle waterfall. Head tilted joyfully, mouth slightly agape in vocal resonance, water droplets frozen mid-air in warm sunlight.`
        },
        {
          slide_no: 7,
          visual: `ช็อต 07: 💡 B-Roll Atmosphere Cutaway แดดส่องทะลุยอดไม้ (0:18 - 0:21): ลำแสงแดดสีทองพุ่งผ่านเรือนยอดไม้สูงส่องกระทบผืนน้ำตก หมอกละอองน้ำลอยละล่องดั่งดินแดนเทพนิยาย`,
          camera_angle: "💡 Atmosphere Cutaway 35mm ย้อนแสงแดดธรรมชาติ",
          real_photo_tip: "💡 ถ่ายเก็บความงดงามของผืนป่าโบราณ ตัดสลับเพื่อสร้างมิติและอารมณ์ร่วม",
          text_overlay: "หัวใจแห่งธรรมชาติอันบริสุทธิ์ 🌿",
          shoot_instruction: "ภาพนิ่งสงบเห็นแสงแดดและละอองน้ำตกฟุ้งกระจาย",
          prompt: `Cinematic B-roll cutaway of majestic volumetric sunbeams piercing the prehistoric jungle canopy over a cascading turquoise waterfall, humid emerald mist, pristine ancient nature.`
        },
        {
          slide_no: 8,
          visual: `ช็อต 08: 🎬 Over-The-Shoulder (OTS) มองทะลุหุบเขา (0:21 - 0:24): มุมมองผ่านหลังไดโนเสาร์ยักษ์ มองออกไปเห็นหุบเขากว้างใหญ่ไพศาล มีฝูงไดโนเสาร์กินพืชอยู่ร่วมกันอย่างสันติ`,
          camera_angle: "🎬 Over-The-Shoulder (OTS) 35mm ถ่ายจากด้านหลังตัวแบบ",
          real_photo_tip: "💡 ให้ตัวไดโนเสาร์อยู่ชิดขอบข้างหนึ่งของจอ เพื่อเปิดพื้นที่ให้เห็นทัศนียภาพอันตระการตา",
          text_overlay: "ดินแดนที่ซ่อนความลับนับล้านปี 🏞️",
          shoot_instruction: "มุมมองเปิดกว้าง เห็นระบบนิเวศอันสมดุล",
          prompt: `Cinematic over-the-shoulder perspective from beside a gentle herbivore dinosaur, gazing out over a vast prehistoric valley sanctuary bathed in golden morning light, roaming herds in distance.`
        },
        {
          slide_no: 9,
          visual: `ช็อต 09: 🌀 360° Circular Orbit สเตโกซอรัสผู้สง่างาม (0:24 - 0:27): กล้องหมุนวนรอบไดโนเสาร์สเตโกซอรัส แผงหนามสีทับทิมสะท้อนแสงอาทิตย์ เดินก้าวอย่างมั่นคงและสงบ`,
          camera_angle: "🌀 Smooth 360° Circular Orbit เลนส์ 50mm",
          real_photo_tip: "💡 หมุนวนช้าๆ ให้เห็นโครงสร้างแผงหลังและสัดส่วนที่สมดุลของสัตว์ยุคโบราณ",
          text_overlay: "ความสง่างามแห่งยุคดึกดำบรรพ์ 🛡️",
          shoot_instruction: "เคลื่อนกล้องสมูทรอบทิศทาง เห็นแผงหนามโปร่งแสง",
          prompt: `Low-angle cinematic orbit around an adult Stegosaurus in a sunlit ancient glade. Backlit dorsal plates glowing ruby and amber in morning rays, ultra-realistic scute textures, heavy dignified steps.`
        },
        {
          slide_no: 10,
          visual: `ช็อต 10: จ้าวเวหาร่อนผ่านม่านหมอก (0:27 - 0:30): นกยักษ์เทอราโนดอนกางปีกหนังโบยบินผ่านหุบผาแคนยอนและสายหมอกยามเช้าอย่างสง่างาม`,
          camera_angle: "📐 Aerial Tracking Shot ติดตามวิถีการบิน",
          real_photo_tip: "💡 ถ่ายมุมสูงจากด้านบนหรือติดตามด้านหลัง ให้เห็นความกว้างใหญ่ของปีกและท้องฟ้า",
          text_overlay: "จ้าวเวหาแห่งยุคดึกดำบรรพ์ 🦅",
          shoot_instruction: "เคลื่อนกล้องตามแนวปีก เห็นปีกสะท้อนแสงแดดเช้า",
          prompt: `Cinematic aerial tracking shot following a majestic Pterosaur gliding gracefully through low-hanging morning mist over prehistoric jungle canyons and waterfalls, translucent wing membranes, BBC Earth scale.`
        },
        {
          slide_no: 11,
          visual: `ช็อต 11: 🌅 แสงอัสดงสีทอง Golden Hour (0:30 - 0:33): ไดโนเสาร์สองตัวยืนเคียงข้างกันบนเนินหญ้า แสงสีทองและส้มอมชมพูของอาทิตย์อัสดงโอบล้อมเป็นเงาซิลูเอทอันอบอุ่น`,
          camera_angle: "🌅 Telephoto 135mm บีบอัดมิติภาพย้อนแสงเย็น",
          real_photo_tip: "💡 ถ่ายย้อนแสงช่วง 17:30 น. ท้องฟ้าสีทองจะช่วยขับเน้นอารมณ์ความรักและความผูกพันให้ลึกซึ้ง",
          text_overlay: "ความสงบงามยามแสงอัสดง 🌅",
          shoot_instruction: "ภาพซิลูเอทตัดกับท้องฟ้าสีเพลิงอันตราตรึงใจ",
          prompt: `Breathtaking golden hour wildlife composition at sunset. Two towering sauropod dinosaurs silhouetted against a dramatic fiery amber and crimson twilight sky, soft rim light highlighting their contours, National Geographic award-winning tone.`
        },
        {
          slide_no: 12,
          visual: `ช็อต 12: 👑 สรุปความลับแห่งป่าดึกดำบรรพ์ & Call To Action (0:33 - 0:36): กล้องถอยขึ้นสู่ท้องฟ้า ดินแดนไดโนเสาร์สงบนิ่งใต้แสงดาวแรกของค่ำคืน ชวนกดเซฟและแชร์ความมหัศจรรย์นี้`,
          camera_angle: "📐 Centered Master Horizon Pullback ลอยขึ้นสู่ขอบฟ้า",
          real_photo_tip: "💡 ดึงกล้องถอยหลังช้าๆ ให้เห็นภาพรวมของดินแดน เว้นที่ด้านล่างสำหรับกราฟิก Call to Action",
          text_overlay: "เซฟ & แชร์ความมหัศจรรย์นี้ให้เพื่อนดูด่วน! 🦕✨",
          shoot_instruction: "ซีนปิดท้ายทรงพลัง ประทับใจในความอ่อนโยนของธรรมชาติ",
          prompt: `Heroic cinematic master pullback shot of peaceful dinosaurs resting in a lush primeval sanctuary as evening stars begin to twinkle in a deep indigo twilight sky, vast majestic scale, pure cinematography.`
        }
      ];
    } else if (isTemple) {
      domainMasterPool = [
        {
          slide_no: 1,
          visual: `ช็อต 01: เปิดตัว Hook สงบฮีลใจ (0:00 - 0:03): มุมกว้างลอดซุ้มประตูวัดโบราณ แสงแดดเช้าส่องทะลุแมกไม้เขียวชอุ่ม ให้ความรู้สึกสงบหลุดพ้นจากความวุ่นวาย`,
          camera_angle: "📐 Slow Forward Push-in 35mm ลอดผ่านซุ้มประตู",
          real_photo_tip: "💡 ถ่ายด้วย 4K 60fps แพนกล้องช้าๆ นิ่งๆ เน้นความสงบ แสงเช้า 08:00 - 09:30 น. มู้ดดีที่สุด",
          text_overlay: safeThaiTruncate(title, 35),
          shoot_instruction: "ถ่ายแนวตั้ง 9:16 มุมเปิดรับบรรยากาศเงียบสงบ แสงธรรมชาติลอดแมกไม้",
          prompt: `Cinematic 9:16 vertical video opening hook of ${title}, serene ancient Lanna temple gate, morning golden sunlight filtering through misty trees, peaceful tranquil atmosphere, 4k 60fps.`
        },
        {
          slide_no: 2,
          visual: `ช็อต 02: บันไดพญานาคโบราณกลางป่า (0:03 - 0:06): เดินก้าวขึ้นบันไดหินโบราณที่ปกคลุมด้วยมอสเขียวชอุ่ม ขนาบด้วยราวพญานาคแกะสลักหินเก่าแก่`,
          camera_angle: "📐 Low-Angle Tracking 24mm ก้าวขึ้นบันไดหิน",
          real_photo_tip: "💡 ก้มกล้องต่ำจับก้าวเดินบนบันไดหินมอสเขียว ให้เห็นความเก่าแก่และร่มรื่น",
          text_overlay: "บันไดหินโบราณกลางผืนป่าสงบ 🌿",
          shoot_instruction: "เดินก้าวอย่างสำรวม กล้องเคลื่อนตามอย่างมั่นคง",
          prompt: `Atmospheric low-angle tracking shot along ancient mossy stone staircase flanked by sacred sculpted Naga balustrades for ${title}, filtered emerald light through lush mountain canopy.`
        },
        {
          slide_no: 3,
          visual: `ช็อต 03: 🔍 Extreme Macro Insert ลายแกะสลักไม้สัก (0:06 - 0:09): โคลสอัพลายแกะสลักไม้สักโบราณบนหน้าบันวิหาร ลวดลายช่อฟ้าและทองคำเปลวที่ผ่านกาลเวลา`,
          camera_angle: "🔍 Extreme Macro 100mm f/2.8 เจาะลึกเนื้อไม้โบราณ",
          real_photo_tip: "💡 ซูม 2x แตะโฟกัสที่รอยแกะสลักไม้โบราณ ขับเน้นคุณค่าทางศิลปะวัฒนธรรม",
          text_overlay: "ศิลปะล้านนาโบราณ ทรงคุณค่า 🪷",
          shoot_instruction: "โคลสอัพนิ่งๆ เห็นร่องรอยงานฝีมือช่างโบราณ",
          prompt: `Extreme macro 100mm f/2.8 insert of centuries-old teakwood carvings and weathered gold leaf on Lanna vihara pediment for ${title}, rich organic wood grain textures.`
        },
        {
          slide_no: 4,
          visual: `ช็อต 04: 📐 Kinetic Zoom In ระฆังลมก้องกังวาน (0:09 - 0:12): ลมภูเขาพัดผ่านใบโพธิ์และระฆังลมทองเหลือง ซูมกล้องเข้าหาระฆังที่พลิ้วไหวส่งเสียงใสก้องกังวาน`,
          camera_angle: "📐 Kinetic Zoom 50mm-85mm ดันเข้าหาระฆังลม",
          real_photo_tip: "💡 ถ่ายย้อนแสงฟ้าครามตอนลมพัดระฆังเบาๆ เก็บเสียงระฆังสดๆ มาใช้ในคลิป",
          text_overlay: "เสียงระฆังลม ฮีลใจให้สงบนิ่ง 🔔",
          shoot_instruction: "ซูมเข้าหาระฆังที่แกว่งไกวอย่างอ่อนโยน",
          prompt: `Kinetic zoom-in shot focusing on brass temple wind chimes swaying gently under ancient temple eaves for ${title}, soft mountain breeze, crystal clear bell tone, peaceful bokeh.`
        },
        {
          slide_no: 5,
          visual: `ช็อต 05: วิหารไม้สักกลางผืนป่า (0:12 - 0:15): พาเดินชมวิหารไม้สักโบราณริมลำธารธรรมชาติ สถาปัตยกรรมที่กลมกลืนกับป่าไม้อย่างลงตัว`,
          camera_angle: "📐 Medium Steadicam Walk ผ่านลำธารและวิหาร",
          real_photo_tip: "💡 เดินตามหลังอย่างช้าๆ ให้เห็นทั้งอาคารไม้สักและผืนป่าที่โอบล้อม",
          text_overlay: "พิกัดลับกลางป่าริมธารน้ำตก 🌊",
          shoot_instruction: "เคลื่อนกล้องนุ่มนวล เห็นสายน้ำไหลข้างวิหาร",
          prompt: `Vertical 9:16 steadicam shot exploring historic wooden vihara nestled beside a mountain waterfall stream for ${title}, lush foliage, tranquil spiritual sanctuary.`
        },
        {
          slide_no: 6,
          visual: `ช็อต 06: 💡 B-Roll Atmosphere Cutaway ควันธูปและแสงเทียน (0:15 - 0:18): ควันธูปหอมกรุ่นลอยม้วนตัวผ่านลำแสงหน้าต่าง เปลวเทียนไหวระยิบระยับหน้าพระประธาน`,
          camera_angle: "💡 Atmosphere B-Roll 85mm T1.5 โบเก้แสงเทียน",
          real_photo_tip: "💡 ถ่ายนิ่งๆ โฟกัสที่ควันธูป แสงเทียนละมุนตาช่วยสร้างความรู้สึกศรัทธาอย่างลึกซึ้ง",
          text_overlay: "จุดเทียนกราบขอพร เสริมสิริมงคล 🙏",
          shoot_instruction: "ควันธูปลอยตัดกับแสงมืดสลัวในวิหารอย่างงดงาม",
          prompt: `Cinematic B-roll cutaway of delicate incense smoke ribbons curling peacefully before candlelit golden Buddha statue for ${title}, serene devotional atmosphere, warm candlelight glow.`
        },
        {
          slide_no: 7,
          visual: `ช็อต 07: 🔍 Extreme Macro Insert พระพักตร์องค์พระ (0:18 - 0:21): โคลสอัพพระพักตร์อันเปี่ยมด้วยความเมตตาของพระพุทธรูปโบราณ แสงทองอร่ามกระทบผิวสัมผัส`,
          camera_angle: "🔍 Extreme Macro 100mm f/2.8 มุมสำรวม",
          real_photo_tip: "💡 ปิดเสียงชัตเตอร์ ไม่เปิดแฟลช ถ่ายด้วยความเคารพและสำรวม",
          text_overlay: "พระพักตร์เปี่ยมเมตตา เสริมพลังใจ",
          shoot_instruction: "โคลสอัพนิ่งๆ 3 วินาที ให้ผู้ชมรู้สึกสงบใจตาม",
          prompt: `Extreme macro close-up of serene golden Buddha face illuminated by warm temple soft lighting for ${title}, compassionate expression, ancient metal patina, peaceful meditation.`
        },
        {
          slide_no: 8,
          visual: `ช็อต 08: 🎬 Over-The-Shoulder (OTS) ผู้แสวงบุญพนมมือ (0:21 - 0:24): มุมมองผ่านไหล่ผู้มาเยือน นั่งพนมมือไหว้อย่างสงบเบื้องหน้าพระประธาน จิตใจสงบนิ่ง`,
          camera_angle: "🎬 Over-The-Shoulder (OTS) 50mm f/1.8",
          real_photo_tip: "💡 แต่งกายสุภาพเรียบร้อย ถ่ายจากด้านหลังให้เห็นความตั้งใจในการทำบุญ",
          text_overlay: "ตั้งจิตอธิษฐาน ขอให้ชีวิตราบรื่น 🌸",
          shoot_instruction: "ถ่ายจากด้านหลังอย่างสำรวม ไม่รบกวนสมาธิ",
          prompt: `Over-the-shoulder perspective of traveler in modest linen attire sitting respectfully with hands pressed in prayer before golden Buddha for ${title}, heartfelt reverence.`
        },
        {
          slide_no: 9,
          visual: `ช็อต 09: 🌀 360° Circular Orbit พระเจดีย์สีทอง (0:24 - 0:27): กล้องหมุนวนรอบลานพระเจดีย์สีทองอร่ามที่สะท้อนแสงแดดเจิดจ้า ตัดกับท้องฟ้าแจ่มใส`,
          camera_angle: "🌀 Smooth 360° Orbit 24mm เลนส์มุมกว้าง",
          real_photo_tip: "💡 เดินวนรอบเจดีย์ตามเข็มนาฬิกา (ประทักษิณ) กล้องแพนขึ้นเห็นยอดฉัตรทองคำ",
          text_overlay: "พระธาตุเจดีย์ศักดิ์สิทธิ์ คู่เมืองล้านนา ✨",
          shoot_instruction: "มุมเงยขึ้นเล็กน้อยให้เห็นความสูงสง่าของพระเจดีย์",
          prompt: `Smooth low-angle circular orbit tracking around majestic golden Chedi stupa for ${title}, brilliant reflections against deep blue sky, sacred Lanna landmark.`
        },
        {
          slide_no: 10,
          visual: `ช็อต 10: สวนพุทธธรรมใต้ร่มไม้ร่มรื่น (0:27 - 0:30): ทางเดินในสวนป่าที่ร่มรื่น มีโขดหินและป้ายข้อคิดคติธรรมเตือนสติ ลมพัดเย็นสบาย`,
          camera_angle: "📐 Medium Eye-Level Glide เดินผ่านสวนร่มรื่น",
          real_photo_tip: "💡 ถ่ายเก็บความเขียวขจีของมอสและต้นไม้ใหญ่ ให้คนดูสัมผัสได้ถึงความเย็นสบาย",
          text_overlay: "เดินจงกรม สูดอากาศบริสุทธิ์เต็มปอด 🍃",
          shoot_instruction: "เดินอย่างผ่อนคลาย เล่าเรื่องการฮีลใจด้วยธรรมชาติ",
          prompt: `Peaceful eye-level tracking shot walking through shaded temple botanical garden with moss-covered stone paths and lush tropical greenery for ${title}, refreshing serenity.`
        },
        {
          slide_no: 11,
          visual: `ช็อต 11: 🌅 แสงสีทองยามเย็น Golden Hour (0:30 - 0:33): แสงแดดยามเย็นบ่ายสี่โมงครึ่งสาดส่องกระทบวิหารไม้และกำแพงหินโบราณ เกิดแสงสีส้มทองละมุนตา`,
          camera_angle: "🌅 Golden Hour 50mm ย้อนแสงธรรมชาติ",
          real_photo_tip: "💡 แสงช่วง 16:30 - 17:15 น. จะนุ่มนวลที่สุด ไม่ร้อน และได้ภาพฟีลฟิล์มที่สวยงาม",
          text_overlay: "แสงเย็นละมุนตา บรรยากาศแสนอบอุ่น 🌇",
          shoot_instruction: "แสงสีทองตกกระทบพื้นหินและตัวอาคารอย่างละมุน",
          prompt: `Atmospheric golden hour backlight at 16:30 illuminating ancient wooden vihara and stone corridors for ${title}, warm amber hues, tranquil dusk peace.`
        },
        {
          slide_no: 12,
          visual: `ช็อต 12: 👑 สรุปพิกัดสงบฮีลใจ & Call To Action (0:33 - 0:36): ภาพกว้างนั่งพักใจใต้ร่มไม้ใหญ่ สบตากล้องส่งยิ้ม พร้อมข้อความชวนเซฟคลิปและแชร์ให้เพื่อนสายบุญ`,
          camera_angle: "📐 Centered Master Pullback ถอยกล้องอย่างสงบ",
          real_photo_tip: "💡 จบคลิปด้วยบรรยากาศที่ผ่อนคลาย ชวนให้คนเซฟเก็บไว้ตามรอยเมื่อต้องการพักใจ",
          text_overlay: "เซฟไว้ฮีลใจ หรือแชร์ให้คนที่รักมาด้วยกัน! 🪷🙏",
          shoot_instruction: "ซีนปิดท้ายอบอุ่น ผ่อนคลาย สร้างพลังบวกเต็มเปี่ยม",
          prompt: `Peaceful cinematic vertical 9:16 outro shot of tranquil temple garden for ${title}, wind chimes, peaceful creator sitting in contemplation, soft daylight, warm cinematic color grade.`
        }
      ];
    } else if (isTravel) {
      domainMasterPool = [
        {
          slide_no: 1,
          visual: `ช็อต 01: เปิดตัว Hook ไวรัล (0:00 - 0:03): เดินก้าวเข้าเฟรมในชุดลินินสดใส แว่นตากันแดด แสงแดดบ่ายสะท้อนรอยยิ้ม พร้อมหันมาสบตากล้องกระตุกความสนใจ`,
          camera_angle: "📐 Dynamic Gimbal Push-in 35mm f/1.8",
          real_photo_tip: "💡 ถ่าย 4K 60fps เปิดคลิปด้วย Movement ทันที ห้ามยืนนิ่ง เพื่อหยุดนิ้วโป้งคนดูใน 3 วิแรก",
          text_overlay: safeThaiTruncate(title, 35),
          shoot_instruction: "ถ่ายแนวตั้ง 9:16 เดินเข้าเฟรมอย่างมั่นใจ แสงแดดธรรมชาติสวยงาม",
          prompt: `Cinematic 9:16 vertical video opening hook of ${title}, beautiful travel aesthetic, golden hour sunlight, handheld smooth gimbal motion, high frame rate, 35mm film grain, 4K resolution.`
        },
        {
          slide_no: 2,
          visual: `ช็อต 02: ก้าวแรกสู่พิกัดลับ (0:03 - 0:06): เดินข้ามสะพานไม้ริมลำธารธรรมชาติ ล้อมรอบด้วยต้นเฟิร์นและเรือนกระจกดีไซน์มินิมอล`,
          camera_angle: "📐 Medium Tracking Shot เดินเคียงข้างตัวแบบ",
          real_photo_tip: "💡 แพนกล้องช้าๆ หรือเดินตามหลังเบาๆ ให้คนและสถานที่เข้ากันอย่างมีชีวิตชีวา",
          text_overlay: "พิกัดลับฟีลต่างประเทศกลางเชียงใหม่ ✈️",
          shoot_instruction: "ถ่ายเก็บทั้งตัวแบบและบรรยากาศสถานที่อย่างลงตัว",
          prompt: `Vertical 9:16 video tracking shot showing authentic travel moments for ${title}, natural environment, cinematic depth of field, warm sun flare, Kodak Portra 400 color science.`
        },
        {
          slide_no: 3,
          visual: `ช็อต 03: 🔍 Extreme Macro Insert แก้วกาแฟซิกเนเจอร์ (0:06 - 0:09): โคลสอัพแก้ว Dirty Coffee หยดน้ำเย็นเกาะข้างแก้วใส กลิ่นกาแฟและนมสดแยกชั้นชัดเจน`,
          camera_angle: "🔍 Extreme Macro 100mm f/2.8 หยดน้ำเกาะแก้ว",
          real_photo_tip: "💡 ซูม 2x แตะโฟกัสที่หยดน้ำเย็นข้างแก้วกาแฟ เสียงน้ำแข็งกระทบแก้วชวนสดชื่น",
          text_overlay: "กาแฟซิกเนเจอร์ นุ่มละมุนลิ้น ☕",
          shoot_instruction: "โคลสอัพนิ่งๆ 2-3 วินาที ให้เห็นเลเยอร์ชั้นกาแฟสวยงาม",
          prompt: `Extreme macro 100mm f/2.8 insert of artisan layered iced Dirty coffee in clear glass for ${title}, chilled condensation beads dripping, sunlit coffee crema.`
        },
        {
          slide_no: 4,
          visual: `ช็อต 04: 📐 Kinetic Crash Zoom มุมถ่ายรูปปัง (0:09 - 0:12): ซูมพุ่งเข้าหามุมบันไดวนหรือซุ้มประตูอวกาศสุดเก๋ โพสท่าเป็นธรรมชาติสไตล์แมกกาซีน`,
          camera_angle: "📐 Kinetic Snap Zoom 24-70mm สลับรวดเร็ว",
          real_photo_tip: "💡 ซูมเข้าหาโพสท่าตอนกำลังก้าวขาหรือหันมองข้าง ได้ลุคโมเดลแฟชั่น",
          text_overlay: "มุมถ่ายรูปซิกเนเจอร์ ยอดไลก์รัวๆ 📸",
          shoot_instruction: "จังหวะซูมคมชัด เพิ่มความชิคให้กับคลิป",
          prompt: `Kinetic snap zoom shot of stylish traveler posing naturally on iconic spiral staircase for ${title}, modern architectural framing, editorial fashion magazine aesthetic.`
        },
        {
          slide_no: 5,
          visual: `ช็อต 05: จิบกาแฟนั่งชิลใต้ร่มไม้ (0:12 - 0:15): นั่งจิบกาแฟที่โต๊ะไม้ริมน้ำตก ลมพัดเบาๆ ปอยผมปลิวไหว รอยยิ้มผ่อนคลายเต็มเปี่ยม`,
          camera_angle: "🎬 Medium Portrait 85mm f/1.4 โบเก้ละมุน",
          real_photo_tip: "💡 ใช้เลนส์ 85mm ถอยห่างออกไป ละลายหลังให้ฟุ้งละมุน ขับเน้นตัวแบบ",
          text_overlay: "นั่งชิลรับลม จิบกาแฟฟินๆ 🌿",
          shoot_instruction: "ถ่ายจับอารมณ์ความสุขและความผ่อนคลาย",
          prompt: `Close-up cinematic vertical 9:16 shot focusing on authentic joyful moments and details related to ${title}, soft daylight, 50mm f/1.4 prime lens bokeh.`
        },
        {
          slide_no: 6,
          visual: `ช็อต 06: 💡 B-Roll Atmosphere Cutaway แสงธรรมชาติส่องผ่านใบไม้ (0:15 - 0:18): แสงแดดตกกระทบพื้นไม้และใบเฟิร์นเขียวฉ่ำ ละอองน้ำตกฟุ้งในอากาศ`,
          camera_angle: "💡 Atmosphere B-Roll 50mm สโลว์โมชัน 60fps",
          real_photo_tip: "💡 ถ่ายช็อตตัดบรรยากาศคั่น ช่วยให้คลิปมีจังหวะหายใจและดูแพงขึ้น",
          text_overlay: "บรรยากาศร่มรื่น ฟีลธรรมชาติบำบัด 🍃",
          shoot_instruction: "ถ่ายนิ่งๆ เน้นความสวยงามของธรรมชาติ",
          prompt: `Cinematic B-roll cutaway of lush tropical ferns swaying in mountain breeze, sparkling water droplets on green leaves, warm ambient sunshine.`
        },
        {
          slide_no: 7,
          visual: `ช็อต 07: 🎬 Over-The-Shoulder (OTS) เปิดสมุดแพลนเที่ยว (0:18 - 0:21): มุมมองผ่านไหล่ ก้มดูแผนที่หรือสมุดโน้ตแนะนำพิกัดลับ ชี้ให้เห็นเส้นทาง`,
          camera_angle: "🎬 Over-The-Shoulder (OTS) 35mm f/2.0",
          real_photo_tip: "💡 ถ่ายจากด้านหลังเห็นมือชี้พิกัดบนมือถือหรือแผนที่ สร้างความรู้สึกพาเพื่อนเที่ยว",
          text_overlay: "แจกพิกัดลับที่คนพื้นที่แนะนำ 🗺️",
          shoot_instruction: "ถ่ายจากด้านหลังอย่างเป็นกันเอง",
          prompt: `Over-the-shoulder perspective of traveler reviewing a handwritten Chiang Mai cafe map for ${title}, warm wooden cafe table, cozy wanderlust vibe.`
        },
        {
          slide_no: 8,
          visual: `ช็อต 08: 🌀 360° Circular Orbit วิวยอดดอยตระการตา (0:21 - 0:24): หมุนวนรอบตัวแบบที่ยืนกางแขนรับลมบนจุดชมวิวทิวทัศน์ภูเขาสลับซับซ้อน`,
          camera_angle: "🌀 Smooth 360° Orbit 24mm เลนส์กว้าง",
          real_photo_tip: "💡 กางแขนรับลมหมุนตัวเบาๆ ให้เห็นทะเลหมอกหรือแนวเทือกเขารอบทิศ",
          text_overlay: "สูดอากาศบริสุทธิ์ วิวพาโนรามา 360° ⛰️",
          shoot_instruction: "กล้องหมุนวนอย่างราบรื่น เห็นวิวรอบด้าน",
          prompt: `Panoramic 360-degree orbit shot around traveler on scenic mountain overlook for ${title}, rolling green hills, refreshing mountain air, 4K.`
        },
        {
          slide_no: 9,
          visual: `ช็อต 09: เดินชิมสตรีทฟู้ดย่านเมืองเก่า (0:24 - 0:27): เดินเลือกขนมและอาหารพื้นเมืองริมทาง กลิ่นหอมกรุ่น รอยยิ้มของพ่อค้าแม่ค้า`,
          camera_angle: "📐 Handheld Steadicam เดินลุยสตรีทฟู้ด",
          real_photo_tip: "💡 ถ่ายสไตล์ POV เดินชิมของอร่อย ได้ฟีลเรียลเหมือนคนดูมาเดินด้วยตัวเอง",
          text_overlay: "แวะชิมของอร่อยเจ้าเด็ดท้องถิ่น 🍜",
          shoot_instruction: "ถ่ายเก็บบรรยากาศผู้คนและความมีชีวิตชีวา",
          prompt: `Authentic street food market walk in Chiang Mai old town for ${title}, steaming street snacks, colorful lanterns, vibrant lively cultural atmosphere.`
        },
        {
          slide_no: 10,
          visual: `ช็อต 10: 🔍 Extreme Macro Insert ขนมหวานท้องถิ่น (0:27 - 0:30): โคลสอัพขนมหวานหรือจานอาหารพื้นเมืองจัดจานสวยงาม สีสันน่ารับประทาน`,
          camera_angle: "🔍 Extreme Macro 100mm f/2.8 เจาะลึกอาหาร",
          real_photo_tip: "💡 ซูมใกล้เห็นความสดและควันกรุ่นของอาหารพื้นเมือง",
          text_overlay: "รสชาติลำขนาด ต้องมาลองสักครั้ง!",
          shoot_instruction: "โคลสอัพอาหารชวนหิว สร้างความประทับใจ",
          prompt: `Extreme macro close-up of local Chiang Mai artisanal delicacy for ${title}, steaming hot, rich textures, mouthwatering presentation.`
        },
        {
          slide_no: 11,
          visual: `ช็อต 11: 🌅 พระอาทิตย์ตกดิน Golden Hour (0:30 - 0:33): ท้องฟ้าเปลี่ยนเป็นสีส้มทองอมชมพู แสงสุดท้ายของวันสาดกระทบยอดดอยและตัวแบบอย่างโรแมนติก`,
          camera_angle: "🌅 Telephoto 135mm บีบอัดมิติภาพแสงเย็น",
          real_photo_tip: "💡 ถ่ายช่วงบ่ายสี่โมงครึ่งถึงห้าโมงเย็น แสงสีทองจะทำให้ผิวดูโกลว์สุขภาพดีที่สุด",
          text_overlay: "ไฮไลต์แสงเย็น โรแมนติกสุดๆ 🌅",
          shoot_instruction: "แสงย้อนสีทองละมุนตา บันทึกความทรงจำอันงดงาม",
          prompt: `Breathtaking twilight golden hour backlight at 17:00 for ${title}, traveler smiling happily through panoramic sunset field with Doi Suthep mountain backdrop, glowing amber rim lights.`
        },
        {
          slide_no: 12,
          visual: `ช็อต 12: 👑 สรุปแพลนเที่ยว & Call To Action (0:33 - 0:36): ตัวแบบโบกมือส่งยิ้มให้กล้อง พร้อมกราฟิกข้อความชวนเซฟแพลนและแท็กเพื่อนร่วมทริป`,
          camera_angle: "📐 Centered Master Pullback ถอยกล้องปิดท้าย",
          real_photo_tip: "💡 จบคลิปด้วยการส่งสายตาเป็นมิตร ชวนให้คนเซฟคลิปเก็บไว้เที่ยวทริปหน้า",
          text_overlay: "เซฟแพลนนี้ไว้เลย แล้วแท็กเพื่อนด่วน! 🚗💨",
          shoot_instruction: "ซีนปิดท้ายสดใส กระตุ้นให้คนมีส่วนร่วมและกดแชร์",
          prompt: `Warm cinematic vertical 9:16 outro shot for ${title}, smiling creator holding travel backpack, inviting atmosphere, space for typography overlay, soft golden hour glow.`
        }
      ];
    } else {
      // General / Commercial Multi-Shot Pool
      domainMasterPool = [
        {
          slide_no: 1,
          visual: `ช็อต 01: เปิดตัว Hook ไวรัล (0:00 - 0:03): ช็อตกระแทกสายตาทันที พาดหัวประเด็นที่คนดูสงสัย พร้อมเปิดมูดโทนสุดพรีเมียม`,
          camera_angle: "📐 Dynamic Gimbal Push-in 35mm f/1.8",
          real_photo_tip: "💡 ถ่ายแนวตั้ง 9:16 (4K 60fps) ขยับกล้องตั้งแต่เฟรมแรก หยุดนิ้วคนดูใน 3 วินาที",
          text_overlay: safeThaiTruncate(title, 35),
          shoot_instruction: "ถ่ายแนวตั้ง 9:16 ดึงดูดสายตา แสงสตูดิโอคมชัด",
          prompt: `Dynamic cinematic 9:16 vertical video opening hook of ${title}, smooth motorized gimbal push-in, professional studio lighting, 50mm f/1.8 bokeh, 4K resolution.`
        },
        {
          slide_no: 2,
          visual: `ช็อต 02: ชี้ปัญหา / จุดเปลี่ยน (0:03 - 0:06): แสดงจุดสำคัญที่ทำให้เกิดความต้องการ หรือปัญหาเดิมที่เคยเจอ`,
          camera_angle: "📐 Medium Tracking 50mm f/2.0",
          real_photo_tip: "💡 แพนกล้องติดตามจุดสนใจ ให้คนดูเข้าใจปัญหาหรือประเด็นหลักในทันที",
          text_overlay: "สิ่งที่คุณอาจมองข้ามไป!",
          shoot_instruction: "ถ่ายเก็บอารมณ์และประเด็นที่ต้องการสื่ออย่างชัดเจน",
          prompt: `Vertical 9:16 commercial video tracking shot demonstrating the core feature and challenge for ${title}, crystal clear details, soft diffused side key lighting, 60fps.`
        },
        {
          slide_no: 3,
          visual: `ช็อต 03: 🔍 Extreme Macro Insert (0:06 - 0:09): โคลสอัพซูมเจาะลึกดีเทล วัตถุดิบ หรือฟังก์ชันที่เป็นจุดเด่นที่สุด`,
          camera_angle: "🔍 Extreme Macro 100mm f/2.8 เจาะลึกระดับไมโคร",
          real_photo_tip: "💡 ซูม 2x-3x ให้เห็นผิวสัมผัส วัสดุพรีเมียม หรือเทคโนโลยีข้างใน",
          text_overlay: "เจาะลึกฟังก์ชันเด่นที่ไม่เหมือนใคร 🔬",
          shoot_instruction: "โคลสอัพนิ่งๆ คมกริบ ขับเน้นความน่าเชื่อถือ",
          prompt: `Extreme macro 100mm f/2.8 close-up showcasing fine details and genuine craftsmanship for ${title}, studio quality, sharp texture focus.`
        },
        {
          slide_no: 4,
          visual: `ช็อต 04: 📐 Kinetic Crash Zoom (0:09 - 0:12): ดันซูมเร็วพุ่งเข้าหาจุดสำคัญ จังหวะเซอร์ไพรส์หรือฟีเจอร์เด็ด`,
          camera_angle: "📐 Kinetic Snap Zoom 24-70mm สลับความเร็ว",
          real_photo_tip: "💡 ซูมเร็วตอนเปิดเผยจุดเด่น เพิ่มความตื่นเต้นและน่าติดตาม",
          text_overlay: "จุดเปลี่ยนสำคัญที่ตอบโจทย์! ⚡",
          shoot_instruction: "ซูมกระชับ เพิ่มพลังให้กับวิดีโอ",
          prompt: `Kinetic crash zoom shot into the centerpiece feature of ${title}, dynamic camera push, crisp commercial lighting, high contrast.`
        },
        {
          slide_no: 5,
          visual: `ช็อต 05: การใช้งานจริงและการสาธิต (0:12 - 0:15): แสดงการใช้งานในชีวิตประจำวันอย่างราบรื่นและมีระดับ`,
          camera_angle: "📐 Medium 45° Angle Tracking Shot",
          real_photo_tip: "💡 ให้เห็นการจับถือหรือใช้งานจริงที่ดูง่าย เป็นธรรมชาติ",
          text_overlay: "ใช้งานง่าย ตอบโจทย์ทุกวัน",
          shoot_instruction: "ถ่ายเก็บแอ็กชันการใช้งานอย่างเป็นธรรมชาติ",
          prompt: `Medium commercial tracking shot showing seamless authentic usage of ${title}, lifestyle environment, natural movement, warm soft daylight.`
        },
        {
          slide_no: 6,
          visual: `ช็อต 06: 💡 B-Roll Atmosphere Cutaway (0:15 - 0:18): ภาพบรรยากาศแสงเงา มูดโทนหรูหราสะท้อนไลฟ์สไตล์`,
          camera_angle: "💡 Atmosphere B-Roll 50mm ย้อนแสงธรรมชาติ",
          real_photo_tip: "💡 ถ่ายช็อตตัดแสงเงา ช่วยยกระดับความหรูหราของแบรนด์",
          text_overlay: "ความพรีเมียมในทุกรายละเอียด ✨",
          shoot_instruction: "ถ่ายนิ่งๆ คุมแสงเงาแบบโมเดิร์นลักชูรี",
          prompt: `Cinematic B-roll cutaway showing premium textures and ambient reflections for ${title}, soft volumetric lighting, modern luxury aesthetic.`
        },
        {
          slide_no: 7,
          visual: `ช็อต 07: 🎬 Over-The-Shoulder (OTS) มุมมองผู้ใช้ (0:18 - 0:21): มุมมองผ่านไหล่ เสมือนผู้ชมกำลังสัมผัสหรือใช้งานด้วยตนเอง`,
          camera_angle: "🎬 Over-The-Shoulder (OTS) 35mm f/2.0",
          real_photo_tip: "💡 ถ่ายจากด้านหลังตัวแบบ ให้คนดูรู้สึกมีส่วนร่วมและอยากลอง",
          text_overlay: "สัมผัสประสบการณ์ที่เหนือกว่า",
          shoot_instruction: "ถ่ายจากด้านหลังอย่างเป็นธรรมชาติ",
          prompt: `Over-the-shoulder POV perspective experiencing ${title} firsthand, natural focus, authentic interaction, commercial film grade.`
        },
        {
          slide_no: 8,
          visual: `ช็อต 08: 🌀 360° Circular Orbit แสดงรอบด้าน (0:21 - 0:24): กล้องหมุนวนรอบตัวแบบ แสดงความสมบูรณ์แบบในทุกมิติ`,
          camera_angle: "🌀 Smooth 360° Circular Orbit 50mm",
          real_photo_tip: "💡 หมุนกล้องอย่างนุ่มนวล ให้เห็นมิติรอบด้าน 360 องศา",
          text_overlay: "ดีไซน์สมบูรณ์แบบทุกมุมมอง 💎",
          shoot_instruction: "หมุนกล้องต่อเนื่อง สว่างคมชัดรอบทิศ",
          prompt: `Smooth 360-degree circular orbit showcasing ${title} from all angles, glossy reflections, pristine studio lighting, 4K.`
        },
        {
          slide_no: 9,
          visual: `ช็อต 09: ข้อพิสูจน์ & ประสิทธิภาพจริง (0:24 - 0:27): แสดงผลลัพธ์ที่จับต้องได้จริง สร้างความมั่นใจสูงสุด`,
          camera_angle: "📐 Clean Commercial Straight-on 50mm",
          real_photo_tip: "💡 จัดฉากให้สะอาด โฟกัสที่ผลลัพธ์ชัดเจน ไร้สิ่งรบกวน",
          text_overlay: "ผลลัพธ์ที่พิสูจน์ได้จริง 💯",
          shoot_instruction: "ถ่ายตรงๆ คมชัด แสดงความจริงใจ",
          prompt: `Clean commercial presentation shot highlighting measurable results of ${title}, sharp focus, confident presentation.`
        },
        {
          slide_no: 10,
          visual: `ช็อต 10: ความสุขและความพึงพอใจ (0:27 - 0:30): รอยยิ้มและความพึงพอใจของตัวแบบ สะท้อนความคุ้มค่า`,
          camera_angle: "🎬 Portrait 85mm f/1.4 หน้าชัดหลังละลาย",
          real_photo_tip: "💡 ถ่ายจับรอยยิ้มจริงที่เป็นธรรมชาติ ไม่เสแสร้ง",
          text_overlay: "ความประทับใจที่ใครก็บอกต่อ ⭐",
          shoot_instruction: "ถ่ายจับอารมณ์ความสุขอย่างละมุน",
          prompt: `Heartwarming portrait of customer delighted with ${title}, genuine natural smile, warm authentic lighting, shallow depth of field.`
        },
        {
          slide_no: 11,
          visual: `ช็อต 11: 🌅 แสงสีทองยามเย็น Golden Hour (0:30 - 0:33): ช็อตย้อนแสงธรรมชาติสีทอง ยกระดับความทรงคุณค่าของแบรนด์`,
          camera_angle: "🌅 Golden Hour Backlight 50mm",
          real_photo_tip: "💡 ใช้แสงธรรมชาติช่วงบ่ายแก่ๆ เพิ่มความอบอุ่นและคุณค่า",
          text_overlay: "คุณค่าที่คู่ควรกับคุณ 🌟",
          shoot_instruction: "คุมแสงย้อนสีทองสวยงาม",
          prompt: `Cinematic golden hour composition for ${title}, warm sunlight rim light, premium branding tone, 8K resolution.`
        },
        {
          slide_no: 12,
          visual: `ช็อต 12: 👑 Hero Final Reveal & Call To Action (0:33 - 0:36): ช็อตฮีโร่ปิดท้ายที่สง่างาม สบตากล้องพร้อมข้อความกระตุ้นการตัดสินใจ`,
          camera_angle: "📐 Centered Master Pullback ถอยกล้องปิดท้าย",
          real_photo_tip: "💡 เว้นที่ว่างด้านบนและล่างสำหรับวางตัวหนังสือ CTA อย่างชัดเจน",
          text_overlay: "พร้อมให้คุณสัมผัสแล้ววันนี้! ทักแชตด่วน 📲",
          shoot_instruction: "ซีนปิดท้ายทรงพลัง กระตุ้นยอดขายและการทักแชต",
          prompt: `Warm cinematic vertical 9:16 outro shot for ${title}, high converting call to action visual, balanced composition, commercial color grade.`
        }
      ];
    }

    // Adapt pool to exact targetCount
    let finalScenes: MediaSlideDirective[] = [];
    if (domainMasterPool.length === targetCount) {
      finalScenes = domainMasterPool;
    } else if (domainMasterPool.length > targetCount) {
      // Intelligently sample from pool while preserving Hook (index 0) and CTA (last index)
      const sampled: MediaSlideDirective[] = [];
      sampled.push(domainMasterPool[0]);
      const step = (domainMasterPool.length - 2) / (targetCount - 2);
      for (let i = 1; i < targetCount - 1; i++) {
        const pickedIdx = Math.round(i * step);
        sampled.push(domainMasterPool[pickedIdx]);
      }
      sampled.push(domainMasterPool[domainMasterPool.length - 1]);
      finalScenes = sampled.map((s, idx) => ({ ...s, slide_no: idx + 1 }));
    } else {
      // When targetCount > domainMasterPool.length (e.g. 16, 20, 24 scenes):
      // Extend pool with extra specialized camera angles and insert shots
      const extended = [...domainMasterPool];
      const extraAngleTypes = [
        { name: "🔍 Macro B-Roll Insert", angle: "🔍 Extreme Macro 100mm f/2.8", text: "เจาะลึกดีเทลวัสดุและพื้นผิว", promptExt: "Extreme macro insert shot capturing fine tactile textures and micro-details" },
        { name: "📐 Kinetic Crash Zoom", angle: "📐 Kinetic Fast Snap Zoom", text: "จังหวะสำคัญ ซูมกระแทกสายตา", promptExt: "Kinetic fast snap zoom punch emphasizing dramatic focal element" },
        { name: "🎬 Over-The-Shoulder (OTS)", angle: "🎬 Over-The-Shoulder POV 35mm", text: "มุมมองสายตาบุคคลที่หนึ่ง", promptExt: "Over-the-shoulder perspective observing the scene in natural lighting" },
        { name: "💡 Atmosphere Ambient Cutaway", angle: "💡 Atmosphere Ambient 50mm", text: "แสงเงาและบรรยากาศแวดล้อม", promptExt: "Atmospheric ambient lighting cutaway with volumetric haze and bokeh" },
        { name: "🌀 360° Circular Orbit", angle: "🌀 Smooth 360° Circular Orbit", text: "หมุนวนรอบตัวแบบ 360 องศา", promptExt: "Smooth circular camera orbit revealing complete three-dimensional environment" },
        { name: "⏳ 120fps Slow-Motion", angle: "⏳ High-Speed 120fps Slow Dolly", text: "สโลว์โมชันหยุดเวลา", promptExt: "High-speed 120fps slow-motion capture isolating dynamic motion in crystal clarity" },
        { name: "📐 Low-Angle Dutch Tilt", angle: "📐 Low-Angle Dutch Tilt 24mm", text: "มุมมองทรงพลัง น่าตื่นเต้น", promptExt: "Low-angle dynamic Dutch tilt adding heroic cinematic tension and energy" },
        { name: "🌅 Golden Hour Silhouette", angle: "🌅 Golden Hour Silhouette 85mm", text: "แสงสีทองยามเย็นย้อนแสง", promptExt: "Warm golden hour backlight framing subject in breathtaking rim glow" }
      ];

      let addIdx = 0;
      while (extended.length < targetCount) {
        const template = extraAngleTypes[addIdx % extraAngleTypes.length];
        const num = extended.length + 1;
        extended.splice(extended.length - 1, 0, {
          slide_no: num,
          visual: `ช็อต ${num < 10 ? '0' + num : num}: ${template.name} (${title}): ถ่ายทอดความประณีตของรายละเอียด เพิ่มมิติให้วิดีโอดูสมจริงระดับภาพยนตร์ ไม่เหมือนงาน AI`,
          camera_angle: template.angle,
          real_photo_tip: `💡 ถ่ายด้วย 4K 60fps ใช้เลนส์เจาะเฉพาะจุด ช่วยให้วิดีโอมีหลายมุมมองแบบโปรดักชันมืออาชีพ`,
          text_overlay: `${template.text} ✨`,
          shoot_instruction: `ถ่ายเก็บช็อต ${template.name} อย่างประณีต คุมแสงและโฟกัสให้คมกริบ`,
          prompt: `Cinematic 9:16 vertical commercial shot ${num} of ${title}. ${template.promptExt}. ARRI Alexa LF commercial grading, 8K ultra photorealistic, zero AI artifacts.`
        });
        addIdx++;
      }
      finalScenes = extended.map((s, idx) => ({ ...s, slide_no: idx + 1 }));
    }

    return {
      count_recommended: finalScenes.length,
      format: `วิดีโอระดับมืออาชีพ Multi-Angle Coverage 9:16 (${finalScenes.length} ฉาก)`,
      visual_direction: "ภาพเคลื่อนไหวแนวตั้ง 9:16 โทน Cinematic ธรรมชาติ ถ่ายทำแบบมืออาชีพ มีหลายมุมกล้อง (Wide, Medium, 🔍 Macro Insert, 📐 Kinetic Zoom, 🎬 OTS, 💡 B-Roll Cutaway) จังหวะตัดต่อกระชับ สอดคล้องกับจังหวะคำพูด",
      real_shoot_guide: "🎬 คู่มือถ่ายคลิปจริงระดับมืออาชีพ: ตั้งกล้องแนวตั้ง 9:16 (4K 60fps), ถ่ายช็อตมุมกว้างสลับ Macro Insert เจาะลึก และ Kinetic Zoom, ใช้กิมบอลกันสั่น 3 แกน, จัดไฟ Key light นุ่มนวลคู่กับ Rim light ขับขอบ, ใช้ไมค์หนีบปกเสื้อไร้สาย (Wireless Mic) เพื่อเสียงคมชัด 100%",
      equipment_needed: "📱 สมาร์ตโฟนแนวตั้ง (4K 60fps) + 🎙️ ไมค์ไร้สายติดปกเสื้อ (DJI Mic / Rode Wireless) + 🦯 กิมบอลกันสั่น 3 แกน + 🔍 เลนส์มาโครเสริมสำหรับสมาร์ตโฟน",
      slides: finalScenes
    };
  }
  // 1. Identify Domain
  const isTempleGeneral =
    combined.includes("วัด") ||
    combined.includes("ทำบุญ") ||
    combined.includes("ไหว้พระ") ||
    combined.includes("สายมู") ||
    combined.includes("พระธาตุ") ||
    combined.includes("พุทธ");

  const isAmulet =
    !isTempleGeneral &&
    (combined.includes("พระเครื่อง") ||
    combined.includes("สมเด็จ") ||
    combined.includes("เครื่องราง") ||
    combined.includes("ของพ่อ") ||
    combined.includes("ส่องพระ") ||
    combined.includes("พระแท้"));

  const isFishing =
    combined.includes("fishing") ||
    combined.includes("ตกปลา") ||
    combined.includes("รอก") ||
    combined.includes("คันเบ็ด") ||
    combined.includes("เหยื่อ");

  const isCar =
    combined.includes("mazda") ||
    combined.includes("byd") ||
    combined.includes("รถ") ||
    combined.includes("ev") ||
    combined.includes("ยานยนต์") ||
    combined.includes("ดีลเลอร์");

  const isReview =
    combined.includes("must have") ||
    combined.includes("ป้ายยา") ||
    combined.includes("แกดเจ็ต") ||
    combined.includes("ของใช้") ||
    combined.includes("นายหน้า");

  const isKnowledge =
    combined.includes("หนังสือ") ||
    combined.includes("habits") ||
    combined.includes("สรุป") ||
    combined.includes("จิตวิทยา") ||
    combined.includes("นิทาน") ||
    combined.includes("สารคดี");

  const isMusic =
    combined.includes("เพลง") ||
    combined.includes("ดนตรี") ||
    combined.includes("lanna") ||
    combined.includes("ซอ") ||
    combined.includes("ซึง") ||
    combined.includes("ขลุ่ย");

  const isTravelOrCafe =
    combined.includes("เชียงใหม่") ||
    combined.includes("คาเฟ่") ||
    combined.includes("cafe") ||
    combined.includes("พิกัด") ||
    combined.includes("ท่องเที่ยว") ||
    combined.includes("เที่ยว") ||
    combined.includes("ถ่ายรูป") ||
    combined.includes("เช็คอิน") ||
    combined.includes("ต่างประเทศ") ||
    combined.includes("ฟิลเตอร์") ||
    combined.includes("travel") ||
    combined.includes("จุดเช็คอิน") ||
    combined.includes("ร้านกาแฟ");

  const isFood =
    combined.includes("อาหาร") ||
    combined.includes("ทำอาหาร") ||
    combined.includes("สูตร") ||
    combined.includes("เมนู") ||
    combined.includes("ครัว") ||
    combined.includes("เชฟ") ||
    combined.includes("กิน") ||
    combined.includes("ของหวาน") ||
    combined.includes("เบเกอรี่") ||
    combined.includes("ขนม") ||
    combined.includes("รสชาติ") ||
    combined.includes("กะเพรา") ||
    combined.includes("ผัด") ||
    combined.includes("ต้ม") ||
    combined.includes("ทอด") ||
    combined.includes("แกง") ||
    combined.includes("ยำ") ||
    combined.includes("หมู") ||
    combined.includes("ไก่") ||
    combined.includes("เนื้อ") ||
    combined.includes("ปลา") ||
    combined.includes("กุ้ง") ||
    combined.includes("ข้าว") ||
    combined.includes("จาน") ||
    combined.includes("ขั้นตอนการทำ") ||
    combined.includes("วิธีทำ") ||
    combined.includes("cooking");

  // 2. Determine Image Count
  let targetCount = 3; // default baseline

  if (rawBlueprint && rawBlueprint.slides && Array.isArray(rawBlueprint.slides) && rawBlueprint.slides.length > 0) {
    targetCount = rawBlueprint.slides.length;
  } else if (typeof preferredCountInput === "number" && preferredCountInput > 0) {
    targetCount = Math.min(Math.max(preferredCountInput, 1), 7);
  } else if (typeof preferredCountInput === "string" && preferredCountInput !== "auto") {
    const parsed = parseInt(preferredCountInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      targetCount = Math.min(Math.max(parsed, 1), 7);
    } else if (preferredCountInput === "carousel") {
      targetCount = 5;
    }
  } else {
    // Intelligent Auto-detection based on content keywords
    const isComparison =
      combined.includes("เปรียบเทียบ") ||
      combined.includes("vs") ||
      combined.includes("ก่อน") ||
      combined.includes("หลัง") ||
      combined.includes("before") ||
      combined.includes("after") ||
      combined.includes("เทียบ") ||
      combined.includes("ต่างกันยังไง");

    const isSinglePost =
      combined.includes("ภาพเดียว") ||
      combined.includes("1 รูป") ||
      combined.includes("โปสเตอร์") ||
      combined.includes("poster") ||
      combined.includes("ประกาศ") ||
      combined.includes("ด่วน") ||
      combined.includes("คำคม") ||
      combined.includes("quote") ||
      combined.includes("meme") ||
      combined.includes("มีม") ||
      combined.includes("ใบเดียวจบ");

    const isCarouselOrGuide =
      combined.includes("สรุป") ||
      combined.includes("หนังสือ") ||
      combined.includes("สเต็ป") ||
      combined.includes("step") ||
      combined.includes("วิธี") ||
      combined.includes("how-to") ||
      combined.includes("carousel") ||
      combined.includes("lemon8") ||
      combined.includes("5 ข้อ") ||
      combined.includes("6 ข้อ") ||
      combined.includes("คู่มือ");

    if (isSinglePost) {
      targetCount = 1;
    } else if (isComparison) {
      targetCount = 2;
    } else if (isCarouselOrGuide) {
      targetCount = 5;
    } else if (isTravelOrCafe) {
      targetCount = 4;
    } else if (isAmulet) {
      targetCount = 4;
    } else if (isCar) {
      targetCount = 4;
    } else if (isFood) {
      targetCount = 4;
    } else if (isFishing) {
      targetCount = 3;
    } else {
      targetCount = 3;
    }
  }

  // 3. Construct domain-tailored slides bank
  let real_shoot_guide = "";
  let equipment_needed = "";
  let formatLabel = "";
  let visual_direction = "";

  if (targetCount === 1) {
    formatLabel = "ภาพเดี่ยวทรงพลัง (Single Hero Shot 1 รูป)";
  } else if (targetCount === 2) {
    formatLabel = "ชุดภาพเปรียบเทียบ 2 รูป (Before & After / Comparison)";
  } else if (targetCount === 3) {
    formatLabel = "ชุดภาพ 3 รูป (Facebook Trio Grid: ภาพหลัก + ฟังก์ชัน + ผลลัพธ์)";
  } else if (targetCount === 4) {
    formatLabel = "อัลบั้มเจาะลึก 4 รูป (4-Grid Detailed Album)";
  } else {
    formatLabel = `สไลด์ความรู้ Carousel (${targetCount} รูป: ปก + เนื้อหาทีละสเต็ป + สรุป)`;
  }

  let slidesPool: MediaSlideDirective[] = [];

  if (isTempleGeneral) {
    real_shoot_guide = "📸 คำแนะนำถ่ายจริงด้วยมือถือ: ถ่ายช่วงเช้า 07:30 - 09:30 น. แสงแดดอ่อนๆ ส่องกระทบยอดเจดีย์และซุ้มประตูวัด แนะนำแต่งกายสุภาพโทนขาว/ครีม/เอิร์ธโทน ถ่ายด้วยเลนส์ 0.5x ย่อมุมต่ำเก็บยอดเจดีย์ และเลนส์ 2x โคลสอัพลายปูนปั้นหรือระฆังลม";
    equipment_needed = "📱 สมาร์ตโฟน (เลนส์ 0.5x Ultra-wide + เลนส์ 2x Portrait) + 🦯 ขาตั้งกล้องขนาดพกพา";
    visual_direction = "โทนสงบ อบอุ่น แสงธรรมชาติยามเช้าขับลวดลายสถาปัตยกรรมล้านนาและแมกไม้เขียวชอุ่ม";

    if (targetCount === 1) {
      slidesPool = [
        {
          slide_no: 1,
          visual: `ภาพซุ้มประตูวัดโบราณหรือยอดเจดีย์ประธาน ท่ามกลางแสงแดดเช้าส่องลอดร่มไม้ สวยสงบจบในใบเดียว`,
          camera_angle: "📐 มุมต่ำ 0.5x เงยหน้ากล้องขึ้นเก็บยอดเจดีย์และท้องฟ้า (Low-Angle Hero Shot)",
          real_photo_tip: "💡 ย่อตัวลงระดับเอว เปิดเลนส์ 0.5x ให้ยอดเจดีย์หรือซุ้มประตูตั้งตระหง่านกึ่งกลางภาพ แสงเช้าเฉียง 45 องศา",
          text_overlay: title,
          shoot_instruction: "ถ่ายภาพรวมเจดีย์ประธานหรือซุ้มประตูวัด สวยสงบ คมชัด",
          prompt: `Master commercial travel photography of ${title}, magnificent ancient Lanna pagoda, golden morning sunlight, lush tranquil trees, 8k resolution.`
        }
      ];
    } else if (targetCount === 2) {
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพเปิดตัวยอดเจดีย์หรือซุ้มประตูวัด สถาปัตยกรรมล้านนาโบราณสง่างาม",
          camera_angle: "📐 มุมกว้างระดับสายตา 3/4",
          real_photo_tip: "💡 ถ่ายให้เห็นความโอ่อ่าของวิหารหรือเจดีย์ แสงแดดอุ่นช่วงเช้า",
          text_overlay: title,
          shoot_instruction: "ถ่ายภาพรวมสถาปัตยกรรมวัดเปิดเรื่อง",
          prompt: `Scenic wide shot of ancient Chiang Mai temple architecture, morning light.`
        },
        {
          slide_no: 2,
          visual: "ภาพดีเทลพระพุทธรูปโบราณ ระฆังลม หรือ ลอดอุโมงค์โบราณ",
          camera_angle: "🔍 ซูมระยะ 2x พอร์ตเทรตหน้าชัดหลังละลาย",
          real_photo_tip: "💡 ถ่ายเจาะลวดลายแกะสลักไม้ หรือระฆังลมที่กำลังพลิ้วไหวอย่างสงบ",
          text_overlay: "บรรยากาศสงบ ฮีลใจ สัมผัสความร่มเย็น",
          shoot_instruction: "โคลสอัพดีเทลพระพุทธรูปหรือระฆังลม",
          prompt: `Macro closeup of ancient Buddhist temple bells and sacred sculptures, soft lighting.`
        }
      ];
    } else {
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพหน้าปก: ยอดเจดีย์ประธานหรือซุ้มประตูวัดโบราณ แสงแดดยามเช้าลอดแมกไม้ (ภาพปกดึงดูดสายตา)",
          camera_angle: "📐 มุมต่ำ 0.5x เงยขึ้นเก็บยอดเจดีย์และท้องฟ้า (Pagoda Hero Shot)",
          real_photo_tip: "💡 ถ่ายช่วง 08:00 - 09:30 น. แสงแดดเช้าสีทองจะส่องกระทบองค์เจดีย์ได้อย่างสง่างาม",
          text_overlay: title,
          shoot_instruction: "ถ่ายยอดเจดีย์หรือซุ้มประตูวัดโบราณ แสงเช้า",
          prompt: `Master architectural photography representing ${title}, ancient Lanna pagoda, lush forest backdrop, warm morning sunlight, 8k.`
        },
        {
          slide_no: 2,
          visual: "พิกัดที่ 1: อุโมงค์โบราณ หรือ วิหารลายคำ ศิลปะล้านนาแท้ทรงคุณค่า",
          camera_angle: "📐 ถ่ายมุมกว้าง 3/4 นำสายตาผ่านแนวเสาหรือแนวอิฐ",
          real_photo_tip: "💡 จัดแนวอุโมงค์หรือเสาวิหารให้พุ่งเข้าสู่จุดกึ่งกลางภาพ สร้างมิติลึกน่าค้นหา",
          text_overlay: "สถาปัตยกรรมโบราณ 700 ปี งดงามสะกดตา",
          shoot_instruction: "ถ่ายแนวอุโมงค์อิฐหรือจิตรกรรมวิหารลายคำ",
          prompt: "Ancient underground brick tunnel at Wat Umong Chiang Mai, historic Buddhist architecture, serene daylight."
        },
        {
          slide_no: 3,
          visual: "พิกัดที่ 2: พระพุทธรูปศักดิ์สิทธิ์ หรือ เสาอินทขิลหลักเมืองเชียงใหม่",
          camera_angle: "🔍 ซูมระยะ 2x ระดับสายตา (Sacred Focal Point)",
          real_photo_tip: "💡 ถ่ายระยะห่างอย่างสำรวม แสงเทียนหรือแสงธรรมชาติขับองค์พระเด่นชัด",
          text_overlay: "กราบสักการะ ขอพรเสริมสิริมงคล",
          shoot_instruction: "ถ่ายองค์พระประธานหรือจุดไหว้ขอพรหลัก",
          prompt: "Revered golden Buddha statue inside ancient Lanna chapel, respectful photography, peaceful aura."
        },
        {
          slide_no: 4,
          visual: "พิกัดที่ 3: มุมสงบกลางป่า ลำธารริมน้ำตก หรือระฆังลมฮีลใจ",
          camera_angle: "🌿 Eye-level สอดรับกับธรรมชาติริมลำธาร",
          real_photo_tip: "💡 ถ่ายมุมร่มรื่นริมน้ำตกหรือใต้ต้นโพธิ์ใหญ่ สื่อถึงความเงียบสงบและการพักผ่อนจิตใจ",
          text_overlay: "มุมสงบฮีลใจ หลีกหนีความวุ่นวาย",
          shoot_instruction: "ถ่ายบรรยากาศร่มรื่นรอบวัดริมน้ำตกหรือสวนพุทธธรรม",
          prompt: "Tranquil temple sanctuary in forest beside mountain waterfall, Wat Pha Lat Chiang Mai, healing nature."
        },
        {
          slide_no: 5,
          visual: "สรุปแพลนและช่วงเวลาแนะนำ: แผนที่เส้นทางไหว้พระ และข้อปฏิบัติในการเข้าชม",
          camera_angle: "🗺️ Flatlay Infographic การ์ดสรุปพิกัดและเส้นทาง",
          real_photo_tip: "💡 รวมภาพไฮไลต์ทั้ง 3-4 จุด พร้อมสรุปการเดินทางและการแต่งกายสุภาพ",
          text_overlay: "เซฟโพสต์นี้ไว้ตามรอยทริปไหว้พระเชียงใหม่ได้เลย!",
          shoot_instruction: "สรุปแผนที่และช่วงเวลาเปิด-ปิดวัด",
          prompt: "Clean minimalist travel route infographic for Chiang Mai temple tour, tranquil pastel tones."
        }
      ];
    }
  } else if (isAmulet) {
    real_shoot_guide = "📸 คำแนะนำถ่ายจริงด้วยมือถือ: วางองค์พระบนผ้ากำมะหยี่สีดำด้านหรือกระดาษอาร์ตดำเพื่อตัดแสงสะท้อน วางริมหน้าต่างที่มีแสงธรรมชาติส่องเฉียง 45° ให้เกิดมิติแสงเงารอยลึก เลี่ยงการเปิดแฟลชมือถือตรงๆ เพื่อไม่ให้มวลสารแบนและสีเพี้ยน";
    equipment_needed = "📱 สมาร์ตโฟน (เปิดโหมด 2x หรือโหมดมาโคร) + 🗜️ ขาตั้งโต๊ะขนาดเล็ก + 💡 แผ่นโฟมขาวสะท้อนเงา (Reflector)";
    visual_direction = "คมชัด สีผิวพระเป็นธรรมชาติ แสงนุ่มส่องเฉียง 45 องศา โชว์มวลสาร ความลึก และรอยตัดขอบแท้";

    if (targetCount === 1) {
      slidesPool = [
        {
          slide_no: 1,
          visual: `ภาพองค์พระเต็มองค์ พร้อมวางบนพื้นหลังกำมะหยี่หรูหรา และมีข้อความพาดหัวเด่นชัด`,
          camera_angle: "📐 หน้าตรง 90° ขนานระนาบเลนส์ หรือ มุม 3/4 เอียง 15°",
          real_photo_tip: "💡 จัดวางองค์พระกึ่งกลางเลนส์ แสงธรรมชาติเฉียง 45° จากด้านบนซ้าย ให้เห็นมิติมวลสารลึกชัดเจนจบในรูปเดียว",
          text_overlay: title,
          shoot_instruction: "ถ่ายเต็มองค์พระ กึ่งกลางภาพ แสงส่องเฉียง 45 องศา",
          prompt: `Master commercial advertising photography of ${title}, sacred Thai amulet, centered composition, soft velvet black background, dramatic rim lighting, 8k resolution.`
        }
      ];
    } else if (targetCount === 2) {
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพหน้าตรงเต็มองค์พระ (ส่องพิมพ์ทรงและมิติองค์รวม)",
          camera_angle: "📐 หน้าตรง 90° ขนานระนาบองค์พระ",
          real_photo_tip: "💡 วางเลนส์ขนานกับองค์พระ แสงเฉียง 45° ขับมิติซอกแขนและเส้นซุ้ม",
          text_overlay: title,
          shoot_instruction: "ถ่ายหน้าตรง 90 องศา ระนาบขนานเป๊ะ",
          prompt: `Frontal view 90 degree studio photo of ${title}, velvet dark background, museum lighting.`
        },
        {
          slide_no: 2,
          visual: "ภาพเจาะลึกมวลสาร/รอยตัดขอบข้าง หรือ วางบนฝ่ามือเทียบขนาดจริง",
          camera_angle: "🔍 ซูมมาโคร 10x-20x หรือ วางบนฝ่ามือ 45°",
          real_photo_tip: "💡 นำแว่นส่องพระ 10x แนบหน้าเลนส์มือถือ ขยับโฟกัสจนเห็นคราบกรุ หรือวางบนอุ้งมือเพื่อเทียบสเกล",
          text_overlay: "ส่องมวลสารธรรมชาติแท้สากล",
          shoot_instruction: "โคลสอัพมาโครเน้นความแห้งเดิมของมวลสาร",
          prompt: `Extreme macro closeup photography of ${title} mineral textures, razor sharp focus.`
        }
      ];
    } else if (targetCount === 3) {
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพหน้าตรงเต็มองค์พระ (ภาพหลักดึงดูดสายตา)",
          camera_angle: "📐 หน้าตรง 90° ขนานระนาบเลนส์",
          real_photo_tip: "💡 แสงธรรมชาติเฉียง 45° บนพื้นหลังกำมะหยี่สีเข้ม",
          text_overlay: title,
          shoot_instruction: "ภาพหลักเปิดหัว หน้าตรงคมชัด",
          prompt: `Master hero shot of ${title}, sacred Thai amulet, front flat 90 deg, 8k.`
        },
        {
          slide_no: 2,
          visual: "ภาพเจาะลึกเฉพาะจุด ส่องมวลสาร คราบกรุ และรอยเหนอะ",
          camera_angle: "🔍 ซูมมาโคร 10x ส่องมวลสาร",
          real_photo_tip: "💡 ใช้โหมดมาโครล็อกโฟกัสที่จุดมวลสารแร่หรือรอยปริแยก",
          text_overlay: "ส่องมวลสารและความแห้งเดิม",
          shoot_instruction: "ซูมมาโครเจาะลึกผิวพรรณ",
          prompt: `Macro closeup photography of antique sacred textures in ${title}, 8k.`
        },
        {
          slide_no: 3,
          visual: "ภาพด้านหลังเต็มองค์พระ และรอยตัดขอบข้าง",
          camera_angle: "🔄 พลิกหลัง 90° หรือมุมเอียง 45°",
          real_photo_tip: "💡 ตรวจรอยปาด รอยหนอนด้น หรือรอยตัดขอบธรรมชาติ",
          text_overlay: "ด้านหลังธรรมชาติและรอยตัดแท้",
          shoot_instruction: "พลิกหลังองค์พระ แสงเฉียงส่องรอยลึก",
          prompt: `Rear and side view photography of ${title}, natural antique patina.`
        }
      ];
    } else {
      // 4 or 5+ slides
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพหน้าตรงเต็มองค์พระ วางกึ่งกลางเฟรม (ภาพปก)",
          camera_angle: "📐 หน้าตรง 90° ขนานระนาบเลนส์ (Eye-Level 90° Flat)",
          real_photo_tip: "💡 วางเลนส์ขนานกับองค์พระ อย่าเอียงมุม แสงเฉียง 45° จากด้านบนซ้าย ให้เห็นความลึกของพิมพ์ทรงชัดเจน",
          text_overlay: title,
          shoot_instruction: "ถ่ายหน้าตรง 90 องศา แสงเข้าเฉียงบนซ้าย องค์พระอยู่กลางภาพ",
          prompt: `Master commercial advertising studio photography of ${title}, sacred Thai amulet, front flat view 90 degree, 8k.`
        },
        {
          slide_no: 2,
          visual: "ภาพเจาะลึกเฉพาะจุด ส่องมวลสาร เม็ดแร่ คราบกรุ รอยแตกลายงา",
          camera_angle: "🔍 ซูมมาโครระยะใกล้ 10x-20x (Extreme Macro Closeup)",
          real_photo_tip: "💡 ใช้โหมดมาโคร หรือแว่นส่องพระ 10x แนบหน้าเลนส์มือถือ ล็อกโฟกัสที่จุดไข่ปลาหรือมวลสาร",
          text_overlay: "ส่องมวลสาร คราบกรุ และความแห้งเดิมธรรมชาติ",
          shoot_instruction: "โคลสอัพมาโครเจาะเฉพาะพื้นผิวและมวลสาร",
          prompt: `Extreme macro 10x closeup photography of ${title}, showing intricate antique textures.`
        },
        {
          slide_no: 3,
          visual: "ภาพพลิกด้านหลังเต็มองค์ และมุมเอียง 45° ส่องรอยตัดขอบข้าง",
          camera_angle: "🔄 พลิกด้านหลัง 90° และมุมเอียงข้าง 45° (Rear & Side Edge Profile)",
          real_photo_tip: "💡 ถ่ายด้านหลังเช็กรอยปาด รอยหนอนด้น และตะแคง 45 องศาเช็กรอยตัดขอบข้าง",
          text_overlay: "ด้านหลังธรรมชาติ และรอยตัดขอบแท้ตามหลักสากล",
          shoot_instruction: "ถ่ายด้านหลังองค์พระเต็มองค์ และตะแคงข้าง 45 องศา",
          prompt: `Rear and side profile photography of ${title}, displaying authentic cutting edge markings.`
        },
        {
          slide_no: 4,
          visual: "ภาพองค์พระวางบนฝ่ามือ หรือ เลี่ยมตลับทองคำแท้พร้อมบูชา",
          camera_angle: "✋ มุมมองบนฝ่ามือ 45° หรือในตลับทอง (Handheld POV / In Case)",
          real_photo_tip: "💡 วางองค์พระบนอุ้งมือเพื่อเทียบสเกลขนาดจริงกับนิ้วมือ ช่วยให้ผู้บูชาตัดสินใจง่ายขึ้น",
          text_overlay: "ขนาดจริงบนฝ่ามือ พร้อมส่งต่อบูชา รับประกันแท้สากล",
          shoot_instruction: "วางบนฝ่ามือหรือในตลับทอง แสงธรรมชาติ",
          prompt: `Authentic handheld photograph of ${title} resting gracefully on palm of hand, warm daylight.`
        },
        {
          slide_no: 5,
          visual: "ภาพใบเซอร์รับรองพระแท้ หรือ กล่องกำมะหยี่พร้อมส่งมอบ",
          camera_angle: "📜 Top-Down Flatlay 90° ถ่ายคู่ใบเซอร์รับประกัน",
          real_photo_tip: "💡 วางองค์พระเคียงข้างใบรับรองสถาบันสากล แสงสว่างสม่ำเสมอทั้งแผ่นเพื่อความน่าเชื่อถือสูงสุด",
          text_overlay: "มีบัตรรับรองพระแท้ การันตีความสบายใจ",
          shoot_instruction: "ถ่ายคู่ใบเซอร์และกล่องพระอย่างเป็นระเบียบ",
          prompt: `Flatlay photograph of ${title} beside official authenticity certificate card and velvet box.`
        },
        {
          slide_no: 6,
          visual: "ภาพสรุปรายละเอียดการติดต่อ ช่องทางแชท และราคาแบ่งปันบูชา",
          camera_angle: "🏷️ กราฟิกการ์ดสรุปเงื่อนไขและบริการจัดส่งฟรี",
          real_photo_tip: "💡 วางการ์ดหรือภาพถ่ายสวยๆ สไตล์มินิมอล ใส่รายละเอียดติดต่อครบถ้วน",
          text_overlay: "สนใจทักแชทสอบถามหรือนัดชมองค์จริงได้เลยครับ",
          shoot_instruction: "ภาพสรุป Call to Action ปิดการขาย",
          prompt: `Clean minimalist closing card with ${title}, premium gallery presentation.`
        }
      ];
    }
  } else if (isFishing) {
    real_shoot_guide = "📸 คำแนะนำถ่ายจริงด้วยมือถือ: ไปถ่ายที่หมายจริงริมน้ำช่วงเช้า 07:00-09:00 หรือเย็น 16:30-18:00 เลี่ยงแดดเที่ยงตรง เช็ดหยดน้ำที่สปูลให้เงา ใช้โหมด Portrait ละลายฉากหลังแม่น้ำ";
    equipment_needed = "📱 มือถือ (โหมด Portrait หน้าชัดหลังเบลอ) + 🎣 คัน+รอก+เหยื่อตัวจริง + 🐟 กริปเปอร์จับปลา";
    visual_direction = "บรรยากาศหมายธรรมชาติริมน้ำ แสงเช้า/เย็น Golden Hour ให้ความรู้สึกสมบุกสมบันและเป็นมือโปร";

    if (targetCount === 1) {
      slidesPool = [
        {
          slide_no: 1,
          visual: `ภาพรวมชุดคันเบ็ดประกอบรอกและเหยื่อตัวเด็ด วางพาดริมน้ำอย่างเท่ พร้อมพาดหัวสเปกเด่น`,
          camera_angle: "📐 มุม 45° ริมตลิ่งแม่น้ำ หรือ ถือแอ็กชันพร้อมตีเหยื่อ",
          real_photo_tip: "💡 วางคันเบ็ดและรอกพาดบนหินริมน้ำ แสงแดดเช้าส่องสะท้อนสปูล โชว์ความงามของตัวคันจบในภาพเดียว",
          text_overlay: title,
          shoot_instruction: "วางองค์ประกอบริมน้ำ แสงเช้าเฉียงกระทบสปูลและคันเบ็ด",
          prompt: `Hero commercial outdoor photography of premium fishing gear set beside scenic river, golden light, 8k.`
        }
      ];
    } else if (targetCount === 2) {
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพชุดคันเบ็ดและรอกตัวจริงริมหมายธรรมชาติ",
          camera_angle: "📐 มุม 45° โคลสอัพสปูลและตัวคัน",
          real_photo_tip: "💡 ถ่ายให้เห็นโลโก้และงานกลึงสปูลชัดเจน แสงเช้าสะท้อนขอบเงา",
          text_overlay: title,
          shoot_instruction: "ถ่ายโชว์อุปกรณ์หลักริมน้ำ",
          prompt: `Commercial photo of fishing rod and reel set on riverside rocks, morning light.`
        },
        {
          slide_no: 2,
          visual: "ภาพผลงานปลาโทรฟี่คู่กับชุดอุปกรณ์ หรือภาพดัดคันงอโชว์แอ็กชัน",
          camera_angle: "🏆 มุมเสยต่ำ 30° ชูปลาคู่คัน หรือ ดัดคันด้านข้าง 90°",
          real_photo_tip: "💡 ชูปลาคู่กับคันเบ็ด ย่อตัวถ่ายมุมเสยเพื่อให้เห็นทั้งผลงานและอุปกรณ์อย่างภาคภูมิใจ",
          text_overlay: "ผลงานจริงหมายธรรมชาติ การันตีความหมาน",
          shoot_instruction: "ถ่ายคู่ผลงานปลาโทรฟี่",
          prompt: `Angler holding trophy catch alongside fishing gear, authentic action shot.`
        }
      ];
    } else {
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพรวมชุดคันเบ็ดประกอบรอกและเหยื่อตัวเด็ด วางเท่ๆ ริมน้ำ (ภาพเปิด)",
          camera_angle: "📐 มุมมอง Flatlay 45° หรือวางพาดโขดหินริมน้ำ",
          real_photo_tip: "💡 วางคันเบ็ดและรอกพาดบนหินริมน้ำ ให้ฉากหลังเห็นผืนน้ำสะท้อนแสงแดดเช้า",
          text_overlay: title,
          shoot_instruction: "ภาพรวมชุดคันเบ็ด แสงแดดเช้าเฉียง",
          prompt: `Commercial outdoor photography of premium fishing rod and reel set beside river, morning golden light, 8k.`
        },
        {
          slide_no: 2,
          visual: "ภาพเจาะลึกสปูลรอก สายพีอี ไกด์เซรามิก และรีลซีท",
          camera_angle: "🔍 โคลสอัพ 45° เจาะกลไกรอกและไกด์",
          real_photo_tip: "💡 หมุนสปูลให้โลโก้หันตรง แสงสะท้อนขอบอะลูมิเนียมโชว์ความประณีต",
          text_overlay: "สปูลลื่น เสียงหวาน ไกด์ทนทาน",
          shoot_instruction: "โฟกัสเฉพาะสปูลและชุดเกียร์",
          prompt: `Macro closeup photography of aluminum fishing reel spool, metallic reflections, 8k.`
        },
        {
          slide_no: 3,
          visual: "ภาพดัดคันงอ 45-60 องศา โชว์พาวเวอร์ลิฟต์และแอ็กชันเหนียวหนึบ",
          camera_angle: "⚡ มุมกว้างด้านข้าง 90° (Action Curve)",
          real_photo_tip: "💡 ให้เพื่อนช่วยดึงสายเบ็ดให้คันโค้งลงเต็มแอ็กชัน ถ่ายด้านข้างระนาบ 90 องศา",
          text_overlay: "งัดหนักแค่ไหนก็เอาอยู่ พาวเวอร์ลิฟต์เหนียวสะใจ",
          shoot_instruction: "ถ่ายด้านข้างเต็มความยาวคัน โชว์ความโค้ง",
          prompt: `Action side view photography of fishing rod bending under heavy load, dynamic power curve.`
        },
        {
          slide_no: 4,
          visual: "ภาพผลงานปลาโทรฟี่คู่กับชุดคันเบ็ดและเหยื่อตัวจริง",
          camera_angle: "🏆 มุมเสยต่ำ 30° ชูปลาคู่คันเบ็ด",
          real_photo_tip: "💡 ชูปลาหันด้านข้างคู่กับคันเบ็ด ย่อตัวถ่ายมุมเสยมุมต่ำ",
          text_overlay: "การันตีผลงานหมายธรรมชาติ ปลากินดุตัวจริง",
          shoot_instruction: "ย่อมุมกล้องต่ำ ถ่ายคู่โทรฟี่",
          prompt: `Hero photography of angler holding trophy snakehead fish alongside matching rod, authentic lake.`
        },
        {
          slide_no: 5,
          visual: "ภาพชุดของแถม ซองใส่คัน หรือโปรโมชั่นหน้าร้านเชียงราย",
          camera_angle: "📦 จัดวางสินค้าครบชุดพร้อมซองใส่คันและของแถม",
          real_photo_tip: "💡 จัดวางคันใส่ซองกำมะหยี่ พร้อมกล่องรอกและสายแถม สรุปราคาจบ",
          text_overlay: "ครบเซ็ตพร้อมลุย สั่งซื้อส่งฟรีหน้าร้าน PP Fishing",
          shoot_instruction: "ถ่ายสรุปของแถมและชุดสินค้า",
          prompt: `Retail package layout of fishing gear set with rod bag and accessories, clean presentation.`
        }
      ];
    }
  } else if (isCar) {
    real_shoot_guide = "📸 คำแนะนำถ่ายจริงด้วยมือถือ: ถ่ายในโชว์รูมหรือลานกลางแจ้งช่วงบ่ายแก่ๆ เลี้ยวล้อหน้า 15-20 องศาโชว์ลายแม็กซ์ ย่อตัวลงระดับเดียวกับไฟหน้ารถ เช็ดตัวถังและล้อแม็กซ์ให้สะอาด";
    equipment_needed = "📱 มือถือ (เลนส์ Ultra-Wide 0.5x สำหรับถ่ายในรถ) + 🧽 ผ้าไมโครไฟเบอร์เช็ดรถ + 📋 ป้ายโปรโมชั่น";
    visual_direction = "สไตล์ยานยนต์หรูหราทันสมัย เงาสะท้อนตัวถังคมชัด ไฟรถเปิดสว่างครบ";

    if (targetCount === 1) {
      slidesPool = [
        {
          slide_no: 1,
          visual: `ภาพมุม 3/4 ด้านหน้ารถ โชว์เส้นสายดีไซน์สปอร์ต ไฟหน้า LED เปิดสว่าง พร้อมพาดหัวแคมเปญดาวน์-ผ่อนเด่นชัด`,
          camera_angle: "📐 มุม 3/4 ด้านหน้า ระดับสายตาไฟหน้ารถ (Front 3/4 Low-Angle)",
          real_photo_tip: "💡 ย่อตัวลงระดับไฟหน้ารถ หักล้อหน้า 15 องศาเปิดลายแม็กซ์ ถ่ายช่วงบ่ายแก่ๆ แสงสะท้อนเส้นสายตัวถังสวยงามจบในใบเดียว",
          text_overlay: title,
          shoot_instruction: "ย่อกล้องลงระดับไฟหน้า เลี้ยวล้อ 15 องศา แสงบ่ายสะท้อนเส้นสายตัวถัง",
          prompt: `Commercial automotive hero photo of ${title}, 3/4 front view, sparkling metallic finish, showroom lighting, 8k.`
        }
      ];
    } else if (targetCount === 2) {
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพมุม 3/4 ด้านหน้ารถ โชว์ดีไซน์ภายนอกและลายล้อแม็กซ์",
          camera_angle: "📐 มุม 3/4 ด้านหน้า ระดับไฟหน้ารถ",
          real_photo_tip: "💡 ย่อตัวลงระดับไฟหน้า หักล้อ 15 องศา เปิดไฟ Day Light",
          text_overlay: title,
          shoot_instruction: "ถ่ายภายนอกมุม 3/4 สปอร์ตคมชัด",
          prompt: `Front three quarter exterior shot of modern car, dynamic angle, showroom.`
        },
        {
          slide_no: 2,
          visual: "ภาพค็อกพิทภายใน หรือ การ์ดข้อเสนอโปรโมชั่นดาวน์-ผ่อนพิเศษ",
          camera_angle: "🎛️ มุมมองคนขับ POV หรือ ถือป้ายข้อเสนอพิเศษ",
          real_photo_tip: "💡 ถ่ายจากเบาะหลังตรงกลางให้เห็นหน้าจอดิจิทัลและพวงมาลัย หรือถ่ายคู่ป้ายโปรโมชั่นค่างวด",
          text_overlay: "ภายในล้ำสมัย ข้อเสนอออกรถง่ายที่สุด",
          shoot_instruction: "ถ่ายห้องโดยสารภายในหรือป้ายโปรโมชั่น",
          prompt: `Interior cockpit view of modern electric car with glowing digital displays.`
        }
      ];
    } else {
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพมุม 3/4 ด้านหน้ารถ โชว์ลายเส้นสายตัวถังและไฟหน้า LED",
          camera_angle: "📐 มุม 3/4 ด้านหน้า ระดับสายตาไฟหน้ารถ (Front 3/4 Low-Angle)",
          real_photo_tip: "💡 ย่อตัวลงระดับไฟหน้ารถ หักล้อหน้า 15 องศาเพื่อเปิดลายแม็กซ์ เปิดไฟหน้า Day Light",
          text_overlay: title,
          shoot_instruction: "ย่อกล้องลงระดับไฟหน้า เลี้ยวล้อ 15 องศา",
          prompt: "Automotive commercial photography of car front three-quarter low angle, gleaming finish."
        },
        {
          slide_no: 2,
          visual: "ภาพห้องโดยสาร คอนโซล จอกลาง พวงมาลัยมัลติฟังก์ชัน",
          camera_angle: "🎛️ มุมมองคนขับ POV หรือถ่ายจากเบาะหลังตรงกลาง",
          real_photo_tip: "💡 เปิดเลนส์กว้าง 0.5x ถ่ายจากตำแหน่งเบาะหลังตรงกลาง สตาร์ตรถให้จอเรือนไมล์และไฟ Ambient Light ติดครบ",
          text_overlay: "ห้องโดยสารพรีเมียม ฟังก์ชันครบ สัมผัสล้ำสมัย",
          shoot_instruction: "ถ่ายจากเบาะหลังตรงกลาง โชว์แดชบอร์ด จอกลาง",
          prompt: "Interior automotive photography of driver cockpit, wide view from rear seat, ambient lighting."
        },
        {
          slide_no: 3,
          visual: "ภาพด้านท้ายรถและพื้นที่เก็บสัมภาระเปิดกว้าง",
          camera_angle: "🚗 มุมท้ายตรง 90° เปิดฝาท้ายสัมภาระ",
          real_photo_tip: "💡 จัดวางกระเป๋าเดินทางหรือกล่องสัมภาระจริงลงไป ให้ลูกค้าเห็นความจุจริงทันที",
          text_overlay: "พื้นที่สัมภาระกว้างขวาง ตอบโจทย์ทุกการเดินทาง",
          shoot_instruction: "เปิดฝาท้าย วางกระเป๋าเดินทางเทียบขนาดจริง",
          prompt: "Rear view photography of car with open power tailgate revealing spacious trunk."
        },
        {
          slide_no: 4,
          visual: "ภาพป้ายแคมเปญ ข้อเสนอพิเศษดาวน์-ผ่อน ถ่ายคู่ที่ปรึกษาการขาย",
          camera_angle: "🏷️ มุมตรงระดับสายตา พร้อมการ์ดโปรโมชั่น",
          real_photo_tip: "💡 ถ่ายคู่ตัวรถพร้อมผูกโบส่งมอบ หรือถือการ์ดสรุปค่างวด/ดอกเบี้ย 0% พร้อมรอยยิ้มจริงใจ",
          text_overlay: "ออกรถง่าย ดอกเบี้ยพิเศษ รับรถได้ทันที",
          shoot_instruction: "ถ่ายคู่ตัวรถพร้อมป้ายข้อเสนอโปรโมชั่น",
          prompt: "Commercial dealership photo featuring sleek promotional banner with car financing terms."
        },
        {
          slide_no: 5,
          visual: "ภาพรีวิวการส่งมอบรถจริงให้ลูกค้า หรือภาพทดลองขับบนถนนจริง",
          camera_angle: "🛣️ มุมมอง Rolling Shot หรือ ภาพความประทับใจวันรับรถ",
          real_photo_tip: "💡 ภาพวันส่งมอบรถจริงพร้อมพวงมาลัยหรือกุญแจรีโมท เสริมความมั่นใจสูงสุด",
          text_overlay: "ส่งมอบความสุขให้ลูกค้าทุกวัน พร้อมดูแลตลอดการขับขี่",
          shoot_instruction: "ถ่ายบรรยากาศส่งมอบรถจริง",
          prompt: "Customer delivery ceremony at modern automobile showroom, happy client holding keys."
        }
      ];
    }
  } else if (isKnowledge || isReview) {
    real_shoot_guide = "📸 คำแนะนำถ่ายจริงด้วยมือถือ: ถ่ายบนโต๊ะทำงานหรือมุมบ้านที่มีแสงธรรมชาติเข้าด้านข้าง จัดของรอบข้างให้เป็นระเบียบ ถ่ายให้เห็นตอนมือจับใช้งานจริง";
    equipment_needed = "📱 มือถือ (โหมด 1x และ 2x) + ☕ พร็อพประกอบฉาก เช่น โน้ตบุ๊ก แก้วกาแฟ ปากกาไฮไลต์";
    visual_direction = "สมจริง มีสไตล์ มินิมอล จัดวางบนโต๊ะหรือห้องที่ใช้งานจริง อบอุ่น สบายตา";

    if (targetCount === 1) {
      slidesPool = [
        {
          slide_no: 1,
          visual: `ภาพหน้าปกหนังสือหรือแกดเจ็ตวางบนโต๊ะมินิมอล พร้อมพาดหัวสรุปประเด็นหลักที่ต้องรู้`,
          camera_angle: "📐 Flatlay 90° หรือ มุมกด 45° Cozy Lifestyle",
          real_photo_tip: "💡 วางคู่แก้วกาแฟหรือโน้ตบุ๊ก แสงธรรมชาติริมหน้าต่าง สร้างมูดที่น่าสนใจและชวนหยุดอ่านทันที",
          text_overlay: title,
          shoot_instruction: "จัดวางบนโต๊ะสไตล์มินิมอล แสงธรรมชาติริมหน้าต่าง",
          prompt: `Aesthetic minimal flatlay photography representing ${title}, cozy desk setting, soft window light, 8k.`
        }
      ];
    } else if (targetCount === 2) {
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพเปิดตัวหนังสือ/ปัญหาที่คนส่วนใหญ่พบเจอในชีวิตประจำวัน",
          camera_angle: "📐 มุมกด 45° บนโต๊ะทำงาน",
          real_photo_tip: "💡 ถ่ายหน้าปกหรือจุดที่คนมักมองข้าม แสงนุ่มสบายตา",
          text_overlay: title,
          shoot_instruction: "ถ่ายภาพหน้าปกหรือชิ้นงานเปิดเรื่อง",
          prompt: `Aesthetic photography of book or problem situation on desk.`
        },
        {
          slide_no: 2,
          visual: "ภาพประโยคทองคำที่ไฮไลต์ไว้ หรือ ผลลัพธ์หลังแก้ไขปัญหา",
          camera_angle: "🔍 โคลสอัพขนานหน้ากระดาษ หรือ มุมมองผู้ใช้ POV",
          real_photo_tip: "💡 ใช้ปากกาไฮไลต์สีสะท้อนแสงเน้นข้อความ ถ่ายให้ตัวหนังสือคมชัดอ่านออกทันที",
          text_overlay: "ประโยคสั้นๆ ที่เปลี่ยนวิธีคิดทั้งชีวิต",
          shoot_instruction: "โคลสอัพประโยคเด็ดหรือฟังก์ชันสำคัญ",
          prompt: `Macro closeup of highlighted text in book, crisp letters, shallow depth of field.`
        }
      ];
    } else {
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพหน้าปกหนังสือ/แกดเจ็ต วางคู่แก้วกาแฟ แสงนุ่ม (ภาพเปิด)",
          camera_angle: "📐 มุมกด 45° สไตล์ Cozy Lifestyle บนโต๊ะทำงาน",
          real_photo_tip: "💡 จัดวางเยื้องกึ่งกลาง วางแก้วกาแฟไว้มุมตรงข้ามเพื่อสร้างบาลานซ์ภาพ",
          text_overlay: title,
          shoot_instruction: "จัดวางคู่แก้วกาแฟ แสงแดดรำไรสร้างอารมณ์สบายตา",
          prompt: `Aesthetic cozy flatlay photography of ${title} on wooden table beside coffee mug, 8k.`
        },
        {
          slide_no: 2,
          visual: "ภาพกางหน้าหนังสือ เปิดไฮไลต์ข้อความประโยคสำคัญจุดที่ 1",
          camera_angle: "🔍 โคลสอัพขนานหน้ากระดาษ (Text Macro Focus)",
          real_photo_tip: "💡 ขีดไฮไลต์ท่อนที่โดนใจที่สุด ถ่ายให้ตัวหนังสือคมกริบ ชวนให้คนหยุดอ่าน",
          text_overlay: "กฎข้อที่ 1: ก้าวแรกสู่การเปลี่ยนแปลง",
          shoot_instruction: "โคลสอัพท่อนประโยคเด็ด ตัวอักษรคมชัด",
          prompt: "Closeup macro photograph of open book page with highlighter emphasizing key quote."
        },
        {
          slide_no: 3,
          visual: "ภาพสมุดโน้ตเขียนสรุปกฎข้อที่ 2 หรือ Mindmap การนำไปใช้",
          camera_angle: "📝 Flatlay 90° ถ่ายตรงจากด้านบน (Top-down Notes)",
          real_photo_tip: "💡 เขียนลายมือสวยงามบนกระดาษโน้ต วางปากกาเคียงข้าง แสงสว่างสม่ำเสมอ",
          text_overlay: "กฎข้อที่ 2: สร้างระบบที่ทำได้จริงทุกวัน",
          shoot_instruction: "ถ่ายมุม Top-down โชว์สรุปบนสมุดบันทึก",
          prompt: "Top-down flatlay photography of handwritten summary note with pen."
        },
        {
          slide_no: 4,
          visual: "ภาพโคลสอัพประเด็นสำคัญข้อที่ 3 พร้อมตัวอย่างจริง",
          camera_angle: "🔍 ซูมมาโคร 2x เน้นจุดตัดสินความสำเร็จ",
          real_photo_tip: "💡 ถ่ายให้เห็นความแตกต่างเมื่อนำไปลงมือทำจริง",
          text_overlay: "กฎข้อที่ 3: วัดผลลัพธ์เล็กๆ ที่สะสมจนยิ่งใหญ่",
          shoot_instruction: "ถ่ายเน้นประเด็นสำคัญข้อที่ 3",
          prompt: "Focused macro shot of diagram or key takeaways note."
        },
        {
          slide_no: 5,
          visual: "ภาพมือถือหนังสืออ่านในบรรยากาศสบายๆ พร้อม Action Plan",
          camera_angle: "📖 มุมมองคนอ่าน POV (First-person Reading View)",
          real_photo_tip: "💡 ถือหนังสือด้วยมือเดียว เปิดกางในมุมผ่อนคลาย ชวนให้เริ่มลงมือทำ",
          text_overlay: "เซฟโพสต์นี้ไว้เตือนใจ แล้วเริ่มลงมือทำวันนี้",
          shoot_instruction: "ถ่ายมุมมองบุคคลที่หนึ่ง ถือหนังสืออ่านริมหน้าต่าง",
          prompt: "POV aesthetic photography of hands holding open book by sunny window."
        }
      ];
    }
  } else if (isTravelOrCafe) {
    real_shoot_guide = "📸 คู่มือออกกองถ่ายจริง (Local Cafe & Travel Production Guide):\n• พิกัดที่ 1 (Fleur Cafe & Eatery - สวนอังกฤษแม่ริม): ถ่ายมุมซุ้มบันไดหิน สวนกุหลาบ และลำธาร แสงบ่าย 15:30-17:00 น. แดดส่องเฉียงลอดแมกไม้ฟีลยุโรป\n• พิกัดที่ 2 (Pluto Cafe หรือ Mars.cnx - สถาปัตยกรรมยานอวกาศสันทราย/คูเมือง): มุมบันไดวนสีดำ Brutalist แสงเงา Dramatic แนะนำเลนส์ 0.5x ย่อมุมต่ำให้โครงสร้างดูโอ่อ่า\n• พิกัดที่ 3 (Fern Forest Cafe หรือ Transit No.8 - สวนมอสและเรือนกระจก / ทางม้าลายสไตล์ญี่ปุ่น): แสงเช้า 09:00 น. นุ่มละมุน โซนเรือนกระจก ถ่ายคู่แก้ว Dirty หรือเบเกอรี่ซิกเนเจอร์\n• ทริกแต่งตัว: สวมชุดลินินโทนขาว/ครีม/เอิร์ธโทน หมวกปีกกว้าง เพื่อให้ตัดกับสีเขียวและสีปูนเปลือย ถ่ายออกมาสวยเป๊ะโดยไม่ต้องพึ่งฟิลเตอร์!";
    equipment_needed = "📱 สมาร์ตโฟน (เลนส์ 0.5x Ultra-wide + เลนส์ 2x Portrait) + 🦯 ขาตั้งกล้องขนาดพกพา + ☕ พร็อพแก้วกาแฟซิกเนเจอร์/แว่นกันแดด/กล้องฟิล์ม";
    visual_direction = "มู้ดแอนด์โทนฟีลต่างประเทศ แสงธรรมชาติ Golden Hour อบอุ่น คอนทราสต์นุ่มนวล สถาปัตยกรรมโดดเด่น คุมโทนภาพสไตล์นิตยสาร Kinfolk";

    if (targetCount === 1) {
      slidesPool = [
        {
          slide_no: 1,
          visual: `ภาพช็อตซิกเนเจอร์ฟีลยุโรป ณ Fleur Cafe & Eatery สวนอังกฤษแม่ริม ท่ามกลางแสงแดดอุ่นลอดผ่านแมกไม้ พร้อมพาดหัวพิกัดเด่นชัด`,
          camera_angle: "📐 มุมกว้างระดับเอว (Waist-level 0.5x) หรือ มุมมองกึ่งพอร์ตเทรต 2x",
          real_photo_tip: "💡 ถ่ายช่วง 16:00-17:00 น. ให้แดดเฉียงสร้างแสง Rim Light สีทองรอบตัวแบบ โดยไม่ต้องเปิดฟิลเตอร์",
          text_overlay: title,
          shoot_instruction: "ถ่ายที่ Fleur Cafe & Eatery บริเวณซุ้มสวนอังกฤษและสะพานหิน",
          prompt: `Cinematic editorial travel photography representing ${title}, European cottage aesthetic at Fleur Cafe Chiang Mai, lush rose garden, stone bridge, golden hour soft rim lighting, Hasselblad 8k.`
        }
      ];
    } else if (targetCount === 2) {
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพเปิดตัวพิกัดฟีลต่างประเทศ มุมสวนสไตล์อังกฤษคฤหาสน์ยุโรป Fleur Cafe & Eatery",
          camera_angle: "📐 มุมกว้าง 3/4 ระดับสายตา",
          real_photo_tip: "💡 ถ่ายให้เห็นสถาปัตยกรรมและสวนธรรมชาติ แสงนุ่มฟุ้งชวนฝัน",
          text_overlay: title,
          shoot_instruction: "ถ่ายภาพรวมบรรยากาศสวนยุโรปเปิดเรื่อง",
          prompt: `Aesthetic European cottage garden cafe in Chiang Mai, blooming flowers, soft natural sunlight, kinfolk magazine style.`
        },
        {
          slide_no: 2,
          visual: "ภาพช็อตดีเทล กาแฟ Dirty ซิกเนเจอร์วางบนโต๊ะหินอ่อน และมุมสถาปัตยกรรมอวกาศ Pluto Cafe",
          camera_angle: "🔍 ซูมระยะ 2x พอร์ตเทรตหน้าชัดหลังละลาย",
          real_photo_tip: "💡 วางแก้วเยื้องขอบโต๊ะ แสงธรรมชาติส่องเข้าด้านข้าง ให้เห็นเลเยอร์นมและกาแฟชัดเจน",
          text_overlay: "พิกัดที่ 2: สถาปัตยกรรมมินิมอล ถ่ายมุมไหนก็ปัง",
          shoot_instruction: "ถ่ายโคลสอัพแก้วกาแฟและมุมดีเทลร้าน",
          prompt: `Macro closeup of signature iced dirty coffee on marble table at aesthetic cafe, blurred garden backdrop.`
        }
      ];
    } else {
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพหน้าปกพิกัดรวม: ช็อตซิกเนเจอร์ฟีลยุโรป ณ Fleur Cafe & Eatery สวนอังกฤษแม่ริม ท่ามกลางแสงแดดอุ่นลอดผ่านแมกไม้",
          camera_angle: "📐 มุมกว้างระดับเอว (Waist-level 0.5x) หรือ มุมมองกึ่งพอร์ตเทรต 2x",
          real_photo_tip: "💡 ถ่ายช่วง 16:00-17:00 น. ให้แดดเฉียงสร้างแสง Rim Light สีทองรอบตัวแบบ โดยไม่ต้องเปิดฟิลเตอร์",
          text_overlay: title,
          shoot_instruction: "พิกัด: Fleur Cafe & Eatery (แม่ริม เชียงใหม่) บริเวณซุ้มสวนอังกฤษและสะพานหิน",
          prompt: `Cinematic editorial travel photography representing ${title}, European cottage aesthetic at Fleur Cafe Chiang Mai, lush rose garden, stone bridge, golden hour soft rim lighting, Hasselblad 8k.`
        },
        {
          slide_no: 2,
          visual: "พิกัดที่ 1: Fleur Cafe & Eatery (แม่ริม) - โต๊ะน้ำชากลางสวนสไตล์อังกฤษ และสะพานหินข้ามลำธารใส",
          camera_angle: "📐 ถ่ายมุมกว้าง 3/4 เปิดรับวิวสวนเต็มระนาบ",
          real_photo_tip: "💡 วางแก้วกาแฟหรือขนมเค้กไว้ขอบโต๊ะในโฟร์กราวด์ ให้ฉากหลังเป็นสวนเบลอละมุนตา",
          text_overlay: "พิกัดที่ 1: Fleur Cafe & Eatery (สวนอังกฤษแม่ริม)",
          shoot_instruction: "พิกัด: อ.แม่ริม จ.เชียงใหม่ โซนสวนยุโรป สั่งชา Signature Rose Tea",
          prompt: "Aesthetic European garden tea table at Fleur Cafe Chiang Mai, stone fountain, lush roses, soft daylight."
        },
        {
          slide_no: 3,
          visual: "พิกัดที่ 2: Pluto Cafe (สันทราย) - มินิมอลทรงพลัง สถาปัตยกรรมอวกาศสีดำโค้งมน Brutalist ฟีลสแกนดิเนเวีย",
          camera_angle: "📐 มุมเสยย่อต่ำ (Low-angle shot 0.5x) เน้นความโค้งมนของตัวอาคาร",
          real_photo_tip: "💡 ให้ตัวแบบยืนกลางโถงบันไดโค้ง แสงธรรมชาติส่องลงมาจากเพดาน เกิดเงาคอนทราสต์คมกริบแบบ Editorial Fashion",
          text_overlay: "พิกัดที่ 2: Pluto Cafe (สถาปัตยกรรมอวกาศ สันทราย)",
          shoot_instruction: "พิกัด: อ.สันทราย จ.เชียงใหม่ มุมโถงวงกลมชั้นใน แสงแดดบ่าย 14:30 น.",
          prompt: "Brutalist futuristic minimalist architecture at Pluto Cafe Chiang Mai, dramatic natural shadows, high fashion editorial."
        },
        {
          slide_no: 4,
          visual: "พิกัดที่ 3: Fern Forest Cafe (สิงหราช) หรือ Transit No.8 - เรือนกระจกยุโรปท่ามกลางสวนเฟิร์นเขียวชอุ่มและละอองหมอก",
          camera_angle: "📐 โคลสอัพ 2x หน้าชัดหลังเบลอ (Portrait Macro)",
          real_photo_tip: "💡 ถ่ายมุมโต๊ะริมกระจกที่มีแสงส่องผ่านละอองหมอกไอน้ำ แสงนุ่มฟุ้งชวนฝัน ละมุนตาโดยไม่ต้องใส่ฟิลเตอร์",
          text_overlay: "พิกัดที่ 3: Fern Forest Cafe (เรือนกระจกสวนมอส)",
          shoot_instruction: "พิกัด: ถ.สิงหราช คูเมืองเชียงใหม่ โซนกลาสเฮาส์ สั่งกาแฟ Dirty และเค้กแครอท",
          prompt: "Lush botanical glasshouse cafe at Fern Forest Chiang Mai, giant ferns, morning light filtering through mist, cozy atmosphere."
        },
        {
          slide_no: 5,
          visual: "สรุป Action Plan เที่ยว 1 วัน: แผนที่การเดินทาง ช่วงเวลาเปิด-ปิด และชุดที่แนะนำใส่",
          camera_angle: "🗺️ Flatlay Infographic การ์ดสรุปพิกัด",
          real_photo_tip: "💡 นำภาพทั้ง 3 พิกัดมาต่อกัน พร้อมสรุปช่วงเวลาที่ควรไป เช่น เช้าไป Fern Forest, บ่ายไป Pluto, เย็นไป Fleur",
          text_overlay: "เซฟโพสต์นี้ไว้จัดทริปสุดสัปดาห์ได้เลย!",
          shoot_instruction: "สรุปแผนที่และแพลนการเดินทาง 3 พิกัด",
          prompt: "Clean minimalist travel map infographic of Chiang Mai cafe hopping spots, pastel aesthetic."
        }
      ];
    }
  } else if (isFood) {
    real_shoot_guide = "📸 คำแนะนำถ่ายภาพอาหารด้วยมือถือ: จัดถ่ายริมหน้าต่างแสงธรรมชาติ 45° หรือไฟสตูดิโอ 5600K เช็ดขอบจานให้สะอาด แนะนำใช้ช้อนหรือตะเกียบคีบวัตถุดิบขึ้นมาตอนควันยังกรุ่นๆ เปิดโหมด Portrait 2x ละลายหลังให้จานอาหารเด่นชัด";
    equipment_needed = "📱 สมาร์ตโฟน (โหมด Portrait 2x) + 🍽️ จานเซรามิกสีเอิร์ธโทน + 🥢 ช้อน/ตะเกียบสำหรับช็อตคีบ";
    visual_direction = "มู้ดอาหารโฮมเมดชวนหิว ควันกรุ่น แสงอุ่น วัตถุดิบฉ่ำเงาสะท้อนแสง";

    if (targetCount === 1) {
      slidesPool = [
        {
          slide_no: 1,
          visual: `ภาพจาน ${title} จัดเสิร์ฟร้อนๆ บนโต๊ะไม้ ควันกรุ่นน่าทาน พร้อมตกแต่งด้วยพริกและใบกะเพราสด`,
          camera_angle: "📐 มุม 45° Hero Shot แสงธรรมชาติริมหน้าต่าง",
          real_photo_tip: "💡 ถ่ายระดับสายตา 45 องศา แสงแดดอุ่นส่องเฉียงให้เห็นความเงาของเนื้อสัตว์และซอสฉ่ำๆ จบในใบเดียว",
          text_overlay: title,
          shoot_instruction: "วางจานหลักกึ่งกลาง แสงส่องกระทบให้เห็นความฉ่ำและควันหอมกรุ่น",
          prompt: `Master commercial culinary photography of ${title}, freshly cooked steaming dish on rustic wooden table, appetizing glaze, natural side window lighting, 8k photorealistic --ar 1:1`
        }
      ];
    } else if (targetCount === 2) {
      slidesPool = [
        {
          slide_no: 1,
          visual: `ภาพจาน ${title} ที่ปรุงเสร็จแล้วพร้อมเสิร์ฟ ควันกรุ่นชวนน้ำลายสอ`,
          camera_angle: "📐 มุม 45° หน้าชัดหลังละลาย",
          real_photo_tip: "💡 แสงส่องเฉียง 45 องศา เช็ดขอบจานให้สะอาดก่อนกดชัตเตอร์",
          text_overlay: title,
          shoot_instruction: "ถ่ายจานสำเร็จรูปเป็นภาพเปิดดึงดูดสายตา",
          prompt: `Commercial food photography of delicious ${title}, warm ambient lighting, 8k.`
        },
        {
          slide_no: 2,
          visual: "ภาพวัตถุดิบสดและการเตรียมเครื่องปรุงก่อนลงกระทะ",
          camera_angle: "🔍 Top-down Flatlay 90° หรือมุม 45° โคลสอัพวัตถุดิบ",
          real_photo_tip: "💡 จัดวางเครื่องปรุงและวัตถุดิบในถ้วยเล็กๆ ให้ดูเป็นระเบียบน่าทำตาม",
          text_overlay: "วัตถุดิบน้อย ขั้นตอนง่าย ทำตามได้ทันที",
          shoot_instruction: "ถ่ายเก็บวัตถุดิบสดสะอาด",
          prompt: `Flatlay overhead photograph of fresh cooking ingredients and spices on kitchen counter.`
        }
      ];
    } else {
      slidesPool = [
        {
          slide_no: 1,
          visual: `ภาพจาน ${title} จัดเสิร์ฟสวยงามบนโต๊ะ ควันกรุ่น ความฉ่ำเงาระดับภัตตาคาร (ภาพปก)`,
          camera_angle: "📐 มุม 45° Hero Shot แสงเฉียงริมหน้าต่าง",
          real_photo_tip: "💡 ถ่ายระดับสายตา 45 องศา ให้เห็นมิติด้านหน้าและความสูงของจานอาหาร",
          text_overlay: title,
          shoot_instruction: "ภาพเปิดจานอาหารชวนหิวที่สุด ควันกรุ่น",
          prompt: `Master commercial food photography of ${title}, appetizing presentation on ceramic dish, soft natural window light, 8k --ar 1:1`
        },
        {
          slide_no: 2,
          visual: "ภาพรวมวัตถุดิบหลัก พริก กระเทียม และเครื่องปรุงรสลับ จัดวางพร้อมปรุง",
          camera_angle: "📐 Top-Down 90° Flat-lay สไตล์คุกกิ้งแมกกาซีน",
          real_photo_tip: "💡 วางวัตถุดิบบนเขียงไม้หรือถ้วยเซรามิกขนาดเล็ก จัดวางให้เห็นสัดส่วนชัดเจน",
          text_overlay: "วัตถุดิบและสัดส่วนเครื่องปรุงลับ",
          shoot_instruction: "ถ่ายมุมมองจากด้านบน 90 องศา สะอาดตา",
          prompt: `Clean flatlay top-down photography of organized raw cooking ingredients and spices, culinary magazine aesthetic --ar 1:1`
        },
        {
          slide_no: 3,
          visual: "ภาพขั้นตอนสะบัดกระทะไฟแรง จังหวะคั่วพริกกระเทียมและเนื้อสัตว์ส่งกลิ่นหอม",
          camera_angle: "🔥 Action Shot มุม 45° ขอบกระทะ ควันและเปลวไฟอ่อนๆ",
          real_photo_tip: "💡 กดถ่ายรัวตอนลงเครื่องปรุงและสะบัดกระทะ เพื่อจับจังหวะควันและเปลวไฟสวยๆ",
          text_overlay: "เทคนิคคั่วไฟแรง ล็อกความฉ่ำหอมกระทะ",
          shoot_instruction: "ถ่ายแอ็กชันการทำอาหารบนเตาไฟ",
          prompt: `Dynamic cooking action shot, seasoned wok on high heat with aromatic steam and sizzling ingredients for ${title} --ar 1:1`
        },
        {
          slide_no: 4,
          visual: "ภาพใช้ช้อนตักชิ้นอาหารหรือไข่ดาวกรอบๆ ซูมความฉ่ำเข้าหากล้อง พร้อมข้อความชวนเซฟสูตร",
          camera_angle: "🔍 Extreme Macro Close-up ซูม 2x ตักอาหารเข้าหากล้อง",
          real_photo_tip: "💡 ถือช้อนตักอาหารยื่นเข้าหากล้อง แตะโฟกัสที่ช้อน ฉากหลังละลายสวยงาม",
          text_overlay: "เซฟสูตรไว้เข้าครัววันหยุด หรือแท็กคนข้างๆ!",
          shoot_instruction: "ช็อตปิดท้ายกระตุ้นความอยากอาหาร ชวนเซฟสูตร",
          prompt: `Close-up shot of spoon lifting delicious bite of ${title}, glistening sauce, shallow depth of field, inviting food styling --ar 1:1`
        }
      ];
    }
  } else {
    // Default Domain
    real_shoot_guide = "📸 คำแนะนำถ่ายจริงด้วยมือถือ: จัดถ่ายริมหน้าต่างที่มีแสงสว่างธรรมชาติสม่ำเสมอ แสงเข้าเฉียง 45° วางแผ่นโฟมขาวด้านตรงข้ามเพื่อลบเงาดำ ถ่ายด้วยระยะ 2x เพื่อไม่ให้ภาพบวม";
    equipment_needed = "📱 สมาร์ตโฟน (เปิดโหมด 1x/2x เลี่ยงเลนส์ไวด์) + ⬜ แผ่นโฟมขาวสะท้อนเงา";
    visual_direction = "คลีน สว่าง คมชัดระดับมืออาชีพ แสงเข้าด้านข้าง 45 องศา";

    if (targetCount === 1) {
      slidesPool = [
        {
          slide_no: 1,
          visual: `ภาพรวมหลักของหัวข้อ/สินค้า ช็อตเปิดตัวดึงดูดสายตา พร้อมพาดหัวสรุปประเด็นครบจบ`,
          camera_angle: "📐 มุม 3/4 ระดับสายตา (Eye-Level 45° Perspective)",
          real_photo_tip: "💡 วางสินค้าเอียง 45 องศา แสงเข้าจากซ้ายเฉียง 45° แผ่นโฟมขาวด้านขวาลบเงา จัดวางให้เด่นตรงกลางจบในใบเดียว",
          text_overlay: title,
          shoot_instruction: "จัดองค์ประกอบหลักให้อยู่กึ่งกลาง แสงสว่างคมชัด",
          prompt: `Master commercial photography of ${title}, studio lighting, 8k --ar 1:1`
        }
      ];
    } else if (targetCount === 2) {
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพเปิดตัวสินค้าหลัก หรือ ปัญหาที่เกิดขึ้น",
          camera_angle: "📐 มุม 3/4 ระดับสายตา",
          real_photo_tip: "💡 แสงธรรมชาติส่องเฉียง 45° พื้นหลังสะอาดตา",
          text_overlay: title,
          shoot_instruction: "ถ่ายภาพรวมหลักให้คมชัด",
          prompt: `Commercial shot of ${title}, clean minimalist backdrop, 8k.`
        },
        {
          slide_no: 2,
          visual: "ภาพผลลัพธ์หลังใช้งาน หรือ ฟังก์ชันเด่นที่เหนือกว่า",
          camera_angle: "🔍 ซูมระยะใกล้ 2x หรือ มุมมองผู้ใช้งาน POV",
          real_photo_tip: "💡 จับถือในมือหรือวางในบริบทใช้งานจริง",
          text_overlay: "ผลลัพธ์ที่พิสูจน์ได้จริง คุ้มค่าเกินราคา",
          shoot_instruction: "ถ่ายให้เห็นผลลัพธ์และความพึงพอใจ",
          prompt: `Lifestyle context shot showing results of ${title}, natural lighting.`
        }
      ];
    } else {
      slidesPool = [
        {
          slide_no: 1,
          visual: "ภาพรวมหลักของหัวข้อ/สินค้า ช็อตเปิดตัวดึงดูดสายตา (ภาพปก)",
          camera_angle: "📐 มุม 3/4 ระดับสายตา (Eye-Level 45° Perspective)",
          real_photo_tip: "💡 วางสินค้าเอียง 45 องศา แสงเข้าจากซ้ายเฉียง 45° แผ่นโฟมขาวด้านขวาลบเงา",
          text_overlay: title,
          shoot_instruction: "จัดองค์ประกอบหลักให้อยู่กึ่งกลาง แสงสว่างคมชัด",
          prompt: `Master commercial photography of ${title}, studio lighting, 8k --ar 1:1`
        },
        {
          slide_no: 2,
          visual: "ภาพเจาะลึกเฉพาะจุดสำคัญ คุณภาพพื้นผิว และวัสดุ",
          camera_angle: "🔍 ซูมระยะใกล้ 2x หรือโหมดมาโคร (Closeup Detail)",
          real_photo_tip: "💡 เข้าใกล้ชิ้นงาน 15-20 ซม. แตะโฟกัสที่จุดเด่นที่สุด เพื่อให้เห็นพื้นผิวชัดเจน",
          text_overlay: "เจาะลึกรายละเอียดและคุณภาพพรีเมียม",
          shoot_instruction: "ถ่ายโคลสอัพมาโครเน้นพื้นผิวและวัสดุ",
          prompt: `Macro closeup photography of ${title}, extreme details, sharp focus --ar 1:1`
        },
        {
          slide_no: 3,
          visual: "ภาพการใช้งานจริง หรือวางในบริบทจริง (Lifestyle Context)",
          camera_angle: "👀 มุมมองผู้ใช้งาน (Contextual View / POV)",
          real_photo_tip: "💡 มีมือจับถือหรือวางในสภาพแวดล้อมที่ใช้งานจริง เพื่อให้คนดูเห็นสเกลขนาด",
          text_overlay: "สัมผัสประสบการณ์จริงที่เหนือกว่า",
          shoot_instruction: "ถ่ายให้เห็นบรรยากาศจริงหรือการจับถือใช้งาน",
          prompt: `Atmospheric contextual commercial photography of ${title}, authentic environment --ar 1:1`
        },
        {
          slide_no: 4,
          visual: "ภาพสรุปแพ็กเกจจิ้ง ของแถม และช่องทางติดต่อสั่งซื้อ",
          camera_angle: "🏷️ มุมมองด้านหน้าตรง 90° จัดวางเป็นระเบียบ (Summary & CTA)",
          real_photo_tip: "💡 จัดวางสินค้าคู่กล่องและอุปกรณ์ครบชุด แสงสว่างสม่ำเสมอทั่วทั้งภาพ",
          text_overlay: "สั่งซื้อหรือสอบถามโปรโมชั่นพิเศษได้เลย",
          shoot_instruction: "ดีไซน์คลีน เรียบง่าย ตัวอักษรอ่านสบายตา",
          prompt: `Clean minimalist flatlay infographic background representing ${title} --ar 1:1`
        }
      ];
    }
  }

  // 4. Merge with rawBlueprint if provided by AI
  if (rawBlueprint && rawBlueprint.slides && Array.isArray(rawBlueprint.slides) && rawBlueprint.slides.length > 0) {
    const actualSlidesCount = rawBlueprint.slides.length;
    const mergedSlides: MediaSlideDirective[] = rawBlueprint.slides.map((s, idx) => {
      const fallbackSlide = slidesPool[idx % slidesPool.length];
      return {
        slide_no: s.slide_no || idx + 1,
        visual: s.visual || fallbackSlide.visual,
        text_overlay: s.text_overlay || fallbackSlide.text_overlay,
        camera_angle: s.camera_angle || fallbackSlide.camera_angle,
        real_photo_tip: s.real_photo_tip || fallbackSlide.real_photo_tip,
        shoot_instruction: s.shoot_instruction || fallbackSlide.shoot_instruction,
        prompt: s.prompt || fallbackSlide.prompt
      };
    });

    let format = rawBlueprint.format;
    if (!format || format.includes("4 รูป") && actualSlidesCount !== 4) {
      if (actualSlidesCount === 1) format = "ภาพเดี่ยวทรงพลัง (Single Hero Shot 1 รูป)";
      else if (actualSlidesCount === 2) format = "ชุดภาพเปรียบเทียบ 2 รูป (Before & After)";
      else if (actualSlidesCount === 3) format = "ชุดภาพ 3 รูป (Facebook Trio Grid)";
      else if (actualSlidesCount === 4) format = "อัลบั้มเจาะลึก 4 รูป (4-Grid Showcase)";
      else format = `สไลด์ความรู้ Carousel (${actualSlidesCount} รูป)`;
    }

    return {
      count_recommended: actualSlidesCount,
      format,
      visual_direction: rawBlueprint.visual_direction || visual_direction,
      real_shoot_guide: rawBlueprint.real_shoot_guide || real_shoot_guide,
      equipment_needed: rawBlueprint.equipment_needed || equipment_needed,
      slides: mergedSlides
    };
  }

  // Slice or adapt slidesPool to match targetCount
  const finalSlides: MediaSlideDirective[] = [];
  for (let i = 0; i < targetCount; i++) {
    const template = slidesPool[i] || slidesPool[i % slidesPool.length];
    finalSlides.push({
      slide_no: i + 1,
      visual: template.visual,
      text_overlay: template.text_overlay,
      camera_angle: template.camera_angle,
      real_photo_tip: template.real_photo_tip,
      shoot_instruction: template.shoot_instruction,
      prompt: template.prompt
    });
  }

  return {
    count_recommended: targetCount,
    format: formatLabel,
    visual_direction,
    real_shoot_guide,
    equipment_needed,
    slides: finalSlides
  };
}
