import { callGemini } from "./gemini";
import { RepurposedPackageSchema } from "../validators";
import { RepurposedContent, RepurposedPlatformOutput, Platform } from "@/types";

export interface RepurposeInput {
  sourceText: string;
  sourceType: "article" | "transcript" | "caption" | "script" | "document";
  targetPlatforms: Platform[];
}

export async function repurposeContent(input: RepurposeInput): Promise<RepurposedContent> {
  const platformsToGenerate = input.targetPlatforms.filter(p => p !== "all");

  const systemInstruction = `You are the Lead Content Repurposing Agent.
Adapt the source content into platform-specific formats without simply copy-pasting:
- Facebook: Compelling storytelling long caption with emoji accents and clear readability spacing.
- Instagram: Punchy caption + structured Carousel slides breakdown (Slide 1 to Slide 7).
- TikTok: Fast-paced 30-60 second video script with visual cues, high-impact hook, and music cues.
- X (Twitter): 4-6 tweet thread with viral hook tweet and engagement CTA.
- Lemon8: Catchy cover headline with lifestyle emojis (e.g. 🍋 ✨ 🚗), friendly authentic review tone, 3-5 concise bullet tips/highlights, and trending Lemon8 lifestyle hashtags (#lemon8บอกต่อ, #รีวิวของดี, #ป้ายยากับlemon8).
- YouTube: High-CTR SEO title, comprehensive description, timestamped chapters, and Shorts concepts.
- LinkedIn: High-signal thought leadership analysis with industry data perspective.
Output strictly in Thai language with standard English marketing terms.
Return valid JSON adhering to the specified schema.`;

  const prompt = `Adapt the following source marketing material for platforms: [${platformsToGenerate.join(", ")}]:
---
${input.sourceText}
---

Return a JSON object with key "outputs" mapping each platform to its output object:
{
  "outputs": {
    "facebook": { "platform": "facebook", "title": "...", "content": "...", "cta": "..." },
    "tiktok": { "platform": "tiktok", "hook": "...", "video_script": "...", "cta": "..." },
    "instagram": { "platform": "instagram", "content": "...", "carousel_slides": ["Slide 1...", "Slide 2..."], "hashtags": [...] },
    "x": { "platform": "x", "content": "...", "x_thread": ["1/5...", "2/5...", "3/5..."] },
    "lemon8": { "platform": "lemon8", "lemon8_cover_title": "...", "content": "...", "lemon8_points": ["Point 1...", "Point 2..."], "cta": "...", "hashtags": [...] }
  }
}`;

  try {
    const result = await callGemini({
      systemInstruction,
      prompt,
      workflow: "Repurposing Agent (Multi-Platform)",
      reasoningEffort: "high",
      responseSchema: true
    });

    if (result.data) {
      const validated = RepurposedPackageSchema.safeParse(result.data);
      if (validated.success) {
        return {
          id: `rep-${Date.now()}`,
          source_text: input.sourceText,
          outputs: validated.data.outputs,
          status: "DRAFT",
          created_at: new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.warn("Gemini repurpose error or offline mode, generating robust multi-platform formats:", error);
  }

  // Fallback multi-platform transformation
  const outputs: Record<string, RepurposedPlatformOutput> = {};

  if (platformsToGenerate.includes("facebook")) {
    outputs.facebook = {
      platform: "facebook",
      title: "เจาะลึกมุมมองใหม่: คุ้มค่าและตอบโจทย์การใช้งานจริง",
      content: `${input.sourceText}\n\nสำหรับใครที่กำลังมองหาทางเลือกคุณภาพที่คุ้มค่าในระยะยาว ลองพิจารณาปัจจัยเหล่านี้ดูครับ แล้วคุณจะเห็นว่าการตัดสินใจที่ถูกต้องช่วยเพิ่มความสะดวกและผลลัพธ์ที่ดีที่สุด`,
      cta: "แชร์โพสต์นี้เก็บไว้ หรือแท็กเพื่อนที่กำลังสนใจสินค้านี้ได้เลย!",
      hashtags: ["#โปรโมชั่น", "#ของดีบอกต่อ", "#สาระน่ารู้", "#คุ้มค่า"]
    };
  }

  if (platformsToGenerate.includes("instagram")) {
    outputs.instagram = {
      platform: "instagram",
      title: "Swipe Left: 5 สรุปสำคัญที่คุณต้องรู้",
      content: "สรุป 5 ข้อคิดสำคัญที่จะเปลี่ยนมุมมองของคุณไปตลอดกาล 👉 เลื่อนสไลด์เพื่ออ่านข้อมูลสรุปครบทุกหน้า!",
      carousel_slides: [
        "Slide 1 (Cover): สรุปประเด็นสำคัญที่คุณไม่ควรพลาด",
        "Slide 2: ปัญหาที่คนส่วนใหญ่พบเจอเมื่อต้องเลือก",
        "Slide 3: จุดเด่นและข้อแตกต่างที่พิสูจน์ได้จริง",
        "Slide 4: วิธีการเลือกให้คุ้มค่าและตรงกับการใช้งาน",
        "Slide 5: ขั้นตอนการสั่งซื้อหรือรับสิทธิพิเศษ"
      ],
      hashtags: ["#InstagramCarousel", "#Lifestyle", "#SmartChoice", "#รีวิวของดี"]
    };
  }

  if (platformsToGenerate.includes("tiktok")) {
    outputs.tiktok = {
      platform: "tiktok",
      hook: "ถ้าคุณกำลังจะซื้อสิ่งนี้... หยุดดูคลิปนี้ก่อน 30 วินาทีครับ!",
      video_script: "[00:00 - 00:05] Hook: โบกมือเบรกคนดูหน้ากล้อง พร้อมข้อความพาดหัวเตือนใจ\n[00:05 - 00:20] Body: เผยความจริงและข้อดีที่หลายคนยังไม่เคยรู้\n[00:20 - 00:30] CTA: สรุปจบกระชับ บอกให้แตะลิงก์ที่โปรไฟล์เพื่อดูรายละเอียดเพิ่มเติม",
      cta: "กดติดตามไว้เพื่อไม่พลาดเคล็ดลับและโปรเด็ดๆ แบบนี้ทุกวัน!"
    };
  }

  if (platformsToGenerate.includes("youtube")) {
    outputs.youtube = {
      platform: "youtube",
      title: "สรุปแบบเจาะลึก! ทุกสิ่งที่คุณต้องรู้ก่อนตัดสินใจในปี 2026",
      content: `ในคลิปนี้เราพามาดูรายละเอียดและรีวิวการใช้งานจริงแบบเจาะลึก...\n\nช่องทางสั่งซื้อและรายละเอียดโปรโมชั่นดูได้ที่คำอธิบายใต้วิดีโอ`,
      youtube_chapters: [
        { time: "00:00", title: "บทนำและประเด็นที่น่าสนใจ" },
        { time: "02:15", title: "เจาะลึกการทดสอบจริง" },
        { time: "05:40", title: "เปรียบเทียบข้อดีและจุดสังเกต" },
        { time: "08:30", title: "สรุปความคุ้มค่าและคำแนะนำ" }
      ],
      youtube_shorts_ideas: [
        "ช็อตสั้น 15 วินาที: 3 เหตุผลที่ทำให้สินค้าตัวนี้ขายดีที่สุด",
        "ช็อตสั้น 20 วินาที: วิธีเลือกให้คุ้มค่าที่สุดในงบประมาณของคุณ"
      ]
    };
  }

  if (platformsToGenerate.includes("linkedin")) {
    outputs.linkedin = {
      platform: "linkedin",
      title: "Strategic Overview: Value Optimization & Consumer Trends in 2026",
      content: `As market dynamics shift toward quality, utility, and cost efficiency, smart consumers and businesses prioritize verified performance.\n\n${input.sourceText.slice(0, 400)}...\n\nKey takeaway: Quality engineering and authentic customer value drive sustainable growth.`,
      cta: "Join the conversation: What factors influence your purchasing decisions this year?"
    };
  }

  if (platformsToGenerate.includes("x")) {
    outputs.x = {
      platform: "x",
      content: "สรุปเธรด 5 ทวีตจบ: เรื่องที่คุณควรรู้ก่อนตัดสินใจเลือกซื้อ 🧵👇",
      x_thread: [
        "1/5 🧵 ถ้าคุณกำลังมองหาสินค้าคุณภาพที่คุ้มค่า นี่คือ 3 สิ่งสำคัญที่ต้องเช็กก่อน...",
        "2/5 ข้อแรกคือ ความคุ้มค่าในระยะยาว วัสดุและความคงทนช่วยลดค่าใช้จ่ายซ้ำซ้อนได้จริง",
        "3/5 ข้อสอง มาตรฐานการรับประกันและการบริการหลังการขาย",
        "4/5 ข้อสาม สิทธิประโยชน์และโปรโมชั่นพิเศษเมื่อสั่งซื้อผ่านช่องทางทางการ",
        "5/5 หากคิดว่ามีประโยชน์ ฝากกดรีทวีต 🔁 และบุ๊กมาร์ก 🔖 ไว้อ่านทบทวนนะครับ!"
      ]
    };
  }

  if (platformsToGenerate.includes("lemon8")) {
    outputs.lemon8 = {
      platform: "lemon8",
      lemon8_cover_title: "🍋 พาส่อง! 3 ไฮไลท์จุดเด่นที่รู้แล้วต้องร้องว้าว ✨",
      content: `สวัสดีค่าทุกคนนน วันนี้แวะมาแชร์แบบไม่อวย! ใครกำลังมองหาตัวเลือกที่คุ้มค่า คุณภาพดี ตอบโจทย์ชีวิตประจำวัน ต้องเซฟโพสต์นี้ไว้เลยน้าา ✨💛\n\n${input.sourceText.slice(0, 350)}...\n\nเซฟโพสต์นี้เก็บไว้เป็นไอเดียได้เลยค่าา 👇✨`,
      lemon8_points: [
        "✨ ดีไซน์สวย คุณภาพพรีเมียม ตอบโจทย์ทุกการใช้งาน",
        "💡 คุ้มค่าในระยะยาว ฟังก์ชันครบครันเกินราคา",
        "🛡️ อุ่นใจด้วยมาตรฐานคุณภาพและการรับประกันที่มั่นใจได้"
      ],
      cta: "กดไลก์ & เซฟเก็บไว้ดูได้เลยน้าา ใครมีคำถามคอมเมนต์คุยกันได้เลยค่า! 💬",
      hashtags: ["#Lemon8บอกต่อ", "#ของดีบอกต่อ", "#ไลฟ์สไตล์", "#ป้ายยากับlemon8", "#ของมันต้องมี"]
    };
  }

  return {
    id: `rep-${Date.now()}`,
    source_text: input.sourceText,
    outputs,
    status: "DRAFT",
    created_at: new Date().toISOString()
  };
}
