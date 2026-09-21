/**
 * Video Production & AI Prompt Engineering Knowledge Base
 * สำหรับใช้ในงาน Veo, Kling, Runway, Midjourney, ComfyUI, Google Flow
 */

export interface ActionItem {
  id: string;
  en: string;
  th: string;
  category: "expression" | "movement" | "product" | "gesture";
}

export const TOP_20_ACTIONS: ActionItem[] = [
  { id: "act-01", en: "smiling", th: "ยิ้ม", category: "expression" },
  { id: "act-02", en: "looking at camera", th: "มองกล้อง", category: "expression" },
  { id: "act-03", en: "making eye contact", th: "สบตากล้อง", category: "expression" },
  { id: "act-04", en: "walking toward camera", th: "เดินเข้าหากล้อง", category: "movement" },
  { id: "act-05", en: "looking back", th: "หันกลับมามอง", category: "movement" },
  { id: "act-06", en: "turning around", th: "หมุนตัว", category: "movement" },
  { id: "act-07", en: "waving", th: "โบกมือ", category: "gesture" },
  { id: "act-08", en: "pointing", th: "ชี้นิ้ว", category: "gesture" },
  { id: "act-09", en: "holding product", th: "ถือสินค้า", category: "product" },
  { id: "act-10", en: "presenting product", th: "นำเสนอสินค้า", category: "product" },
  { id: "act-11", en: "sipping coffee", th: "จิบกาแฟ", category: "gesture" },
  { id: "act-12", en: "laughing softly", th: "หัวเราะเบาๆ", category: "expression" },
  { id: "act-13", en: "nodding", th: "พยักหน้า", category: "gesture" },
  { id: "act-14", en: "leaning forward", th: "โน้มตัวเข้าหากล้อง", category: "movement" },
  { id: "act-15", en: "crossing arms", th: "กอดอก", category: "gesture" },
  { id: "act-16", en: "touching hair", th: "จับผม", category: "gesture" },
  { id: "act-17", en: "looking off-camera", th: "มองออกนอกเฟรม", category: "expression" },
  { id: "act-18", en: "gazing into distance", th: "มองไกล", category: "expression" },
  { id: "act-19", en: "confident smile", th: "ยิ้มมั่นใจ", category: "expression" },
  { id: "act-20", en: "hero pose", th: "ท่าฮีโร่", category: "gesture" }
];

export interface CameraAngleItem {
  id: number;
  th: string;
  en: string;
  promptKeyword: string;
}

export const THAI_CAMERA_ANGLES_36: CameraAngleItem[] = [
  { id: 1, th: "หน้าตรงเต็มตัว", en: "Full-body front shot", promptKeyword: "full body front view shot, centered subject" },
  { id: 2, th: "หน้าตรงครึ่งตัว", en: "Medium front shot", promptKeyword: "medium shot front view, waist up" },
  { id: 3, th: "หน้าตรงระยะใกล้ (ใบหน้า)", en: "Close-up front portrait", promptKeyword: "close-up portrait front view, sharp facial focus" },
  { id: 4, th: "มุมเฉียง 45 องศาเต็มตัว", en: "Full-body 45-degree angle", promptKeyword: "full body three-quarter 45-degree angle shot" },
  { id: 5, th: "มุมเฉียง 45 องศาครึ่งตัว", en: "Medium 45-degree angle", promptKeyword: "medium shot three-quarter 45-degree angle view" },
  { id: 6, th: "มุมเฉียง 45 องศาระยะใกล้", en: "Close-up 45-degree portrait", promptKeyword: "close-up three-quarter portrait, 45-degree profile" },
  { id: 7, th: "ด้านข้างเต็มตัว (ด้านข้าง)", en: "Full-body side profile", promptKeyword: "full body complete side profile view" },
  { id: 8, th: "ด้านข้างระยะใกล้", en: "Close-up side profile", promptKeyword: "close-up side profile shot, sharp silhouette" },
  { id: 9, th: "ด้านหลัง", en: "Back view shot", promptKeyword: "shot from behind, back view of subject" },
  { id: 10, th: "หันมองข้ามไหล่", en: "Over-the-shoulder glance", promptKeyword: "over the shoulder shot looking back toward lens" },
  { id: 11, th: "มุมสูงเต็มตัว", en: "High-angle full shot", promptKeyword: "high angle full body shot looking down from above" },
  { id: 12, th: "มุมสูงระยะใกล้", en: "High-angle close-up", promptKeyword: "high angle close-up portrait angled downward" },
  { id: 13, th: "มุมต่ำเต็มตัว", en: "Low-angle full shot", promptKeyword: "heroic low-angle full body shot looking upward" },
  { id: 14, th: "มุมต่ำระยะใกล้", en: "Low-angle close-up", promptKeyword: "low angle close-up dramatic portrait" },
  { id: 15, th: "มุมมองจากด้านบน 90 องศาเต็มตัว", en: "Top-down 90-degree full flatlay", promptKeyword: "bird's eye view 90-degree flat lay full perspective" },
  { id: 16, th: "มุมมองจากด้านบน 90 องศาครึ่งตัว", en: "Top-down 90-degree medium", promptKeyword: "overhead 90-degree shot medium composition" },
  { id: 17, th: "มุมมองจากด้านบน 90 องศา (นอน)", en: "Top-down 90-degree lying down", promptKeyword: "straight overhead 90-degree shot of subject lying down" },
  { id: 18, th: "มุมมองจากด้านบน 90 องศา (นั่ง)", en: "Top-down 90-degree seated", promptKeyword: "overhead top-down 90-degree shot of subject seated" },
  { id: 19, th: "มุมกว้างมาก", en: "Extreme wide shot", promptKeyword: "extreme wide establishing landscape shot, expansive scale" },
  { id: 20, th: "มุมใกล้แบบกว้าง", en: "Wide-angle close-up", promptKeyword: "wide angle dynamic close-up with environmental depth" },
  { id: 21, th: "มุมเอียง", en: "Dutch angle tilt", promptKeyword: "cinematic Dutch angle tilted frame, dynamic tension" },
  { id: 22, th: "ระดับเอว กอดอก", en: "Waist-level arms crossed", promptKeyword: "waist level shot, crossing arms with confident posture" },
  { id: 23, th: "ครึ่งตัวกอดอก", en: "Half-body arms crossed", promptKeyword: "medium half-body portrait with arms crossed" },
  { id: 24, th: "กำลังจัดแว่น", en: "Adjusting glasses gesture", promptKeyword: "subtle gesture adjusting eyeglasses with fingertips" },
  { id: 25, th: "ภาพระยะใกล้เนื้อผ้า", en: "Macro fabric texture", promptKeyword: "extreme macro close-up of fabric texture and stitching" },
  { id: 26, th: "ท่าเดิน", en: "Walking dynamic action", promptKeyword: "dynamic walking stride motion with natural fabric flow" },
  { id: 27, th: "ท่านั่งบนสตูล", en: "Sitting on stool pose", promptKeyword: "editorial pose seated on wooden studio stool" },
  { id: 28, th: "ท่าพิงกำแพง", en: "Leaning against wall", promptKeyword: "relaxed casual pose leaning back against architectural wall" },
  { id: 29, th: "เงยหน้ามองขึ้น", en: "Looking up upward gaze", promptKeyword: "subject looking upward toward soft sky light" },
  { id: 30, th: "ก้มหน้ามองลง", en: "Looking down downward gaze", promptKeyword: "thoughtful pose looking downward in quiet contemplation" },
  { id: 31, th: "ภาพระยะใกล้ดวงตา", en: "Extreme close-up eye macro", promptKeyword: "extreme macro close-up of eyes with reflection in iris" },
  { id: 32, th: "แสงหน้าต่างและลวดลายเงา", en: "Window shadow patterns", promptKeyword: "cinematic window gobo shadow pattern falling across subject" },
  { id: 33, th: "ภาพระยะใกล้ครึ่งใบหน้า", en: "Close-up half face portrait", promptKeyword: "intimate half-face close-up cropped portrait, cinematic lighting" },
  { id: 34, th: "โน้มตัวไปด้านหน้า", en: "Leaning forward engaging", promptKeyword: "engaging posture leaning forward toward the camera" },
  { id: 35, th: "ยกมือจัดทรงผม", en: "Touching hair gesture", promptKeyword: "graceful hand touching hair gesture, natural lifestyle" },
  { id: 36, th: "ท่ายืนเชิงศิลป์", en: "Artistic fashion stance", promptKeyword: "editorial artistic standing fashion pose, haute couture silhouette" }
];

export const STRICT_FACIAL_CONSISTENCY_PROMPT =
  "Enable strict facial consistency mode. Prioritize the facial features from the provided reference image for all subsequent generations. Maintain the subject's identity accurately while only adapting the pose, lighting, and background. Do not alter the core facial structure.";

export const STORYBOARD_8_PANEL_COMMERCIAL = {
  name: "8-Panel Commercial Infographic Storyboard",
  description: "โครงสร้างสตอรี่บอร์ด 8 ฉาก สำหรับวิดีโอ 10 วินาที (ช็อตละ 1.25 วินาที) สไตล์ Infographic เชิงพาณิชย์",
  panels: [
    { panel: 1, name: "เปิดเรื่อง", angle: "มุมกว้าง (Wide Establishing Shot)", detail: "แนะนำตัวละครหลัก สถานที่ บรรยากาศ และวัตถุสำคัญ ให้เข้าใจทันทีว่าเรื่องเริ่มต้นอย่างไร" },
    { panel: 2, name: "เตรียมพร้อม", angle: "ภาพระยะกลางหรือระยะใกล้", detail: "แสดงตัวละครกำลังเตรียมอุปกรณ์หรือเริ่มต้นการทำงาน เปิดเผยเครื่องมือ วัตถุ หรือเป้าหมายสำคัญ" },
    { panel: 3, name: "เริ่มลงมือ", angle: "ภาพระยะใกล้", detail: "แสดงการเริ่มต้นของการกระทำหลัก ให้เห็นการเคลื่อนไหว ความตั้งใจ และการเปลี่ยนแปลงแรก" },
    { panel: 4, name: "จุดเปลี่ยนสำคัญ", angle: "ภาพระยะใกล้มากหรือมุมกล้องโดดเด่น", detail: "แสดงช่วงเวลาสำคัญที่สุดของเรื่อง ให้เป็นภาพที่ทรงพลังที่สุดของสตอรี่บอร์ด" },
    { panel: 5, name: "ความคืบหน้า", angle: "ภาพระยะกลางค่อนใกล้", detail: "แสดงผลลัพธ์ที่กำลังเกิดขึ้น ตัวละครยังคงดำเนินการไปสู่เป้าหมาย" },
    { panel: 6, name: "มุมมองพิเศษ", angle: "มุมมองด้านบน / มุมต่ำ / มุมสะท้อน", detail: "มุมมองที่น่าสนใจ เช่น Top-down 90 องศา หรือภาพมุมสะท้อน เพื่อให้ภาพหลากหลาย" },
    { panel: 7, name: "ขั้นตอนสุดท้าย", angle: "ภาพระยะใกล้แบบดรามาติก", detail: "แสดงขั้นตอนสุดท้ายก่อนเผยผลลัพธ์ ให้เห็นว่าการเปลี่ยนแปลงเกือบสมบูรณ์แล้ว" },
    { panel: 8, name: "เผยผลลัพธ์", angle: "ภาพมุมกว้าง", detail: "ภาพผลลัพธ์สุดท้ายอย่างชัดเจน ตัวละครแสดงความพึงพอใจ ปิดเรื่องอย่างสมบูรณ์แบบ" }
  ]
};

export const STORYBOARD_9_BEATS_HOLLYWOOD = {
  name: "9-Beat Hollywood Cinematic Production Storyboard",
  description: "โครงสร้างสตอรี่บอร์ดภาพยนตร์ระดับมืออาชีพ 9 จังหวะ (Hollywood Beat Sheet)",
  beats: [
    { beat: 1, name: "ESTABLISHING", shot: "WIDE SHOT", desc: "เปิดฉาก แนะนำสถานที่ บรรยากาศ และสเกลของโลกในเรื่อง" },
    { beat: 2, name: "INTRO CHARACTER", shot: "MEDIUM SHOT", desc: "แนะนำตัวละครหลัก สภาพแวดล้อม และสถานการณ์ปัจจุบัน" },
    { beat: 3, name: "ENVIRONMENT / CONTEXT", shot: "TRACKING SHOT", desc: "ขยายบริบทความสัมพันธ์ระหว่างตัวละครกับสิ่งรอบตัว" },
    { beat: 4, name: "CONFLICT INTRO", shot: "CLOSE-UP", desc: "แนะนำจุดเริ่มต้นของปัญหา หรือความท้าทายที่ต้องเผชิญ" },
    { beat: 5, name: "BUILD TENSION", shot: "DUTCH ANGLE / TIGHT CLOSE-UP", desc: "สร้างความกดดัน ความคาดหวัง หรือจังหวะบีบคั้นอารมณ์" },
    { beat: 6, name: "ACTION", shot: "DYNAMIC TRACKING", desc: "การกระทำหลัก การเคลื่อนไหวที่ทรงพลัง หรือการปะทะ" },
    { beat: 7, name: "TWIST", shot: "OVER-THE-SHOULDER / POV", desc: "จุดหักมุม หรือการค้นพบสิ่งที่คาดไม่ถึง" },
    { beat: 8, name: "CLIMAX", shot: "HEROIC LOW-ANGLE", desc: "จุดพีคสูงสุดของเรื่อง การตัดสินใจหรือโมเมนต์สำคัญที่สุด" },
    { beat: 9, name: "RESOLUTION", shot: "WIDE PULLBACK", desc: "บทสรุป อารมณ์ตกผลึก และภาพจำสุดท้ายก่อนจบคลิป" }
  ]
};
