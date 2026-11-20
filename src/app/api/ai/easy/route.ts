import { NextResponse } from "next/server";
import { executeAIFailoverChain } from "@/lib/ai/failover-engine";
import { researchTopicOnline, WebResearchResult } from "@/lib/ai/web-research";

const GOAL_INSTRUCTIONS: Record<string, string> = {
  COMMERCIAL:
    "เน้นแนวโฆษณาเชิญชวน/ป้ายยา (Commercial & Invitation): ต้องทำให้คนดูรู้ทันทีใน 2 วินาทีแรกว่าคือที่ไหน/ขายอะไร ทำไมต้องมา/ต้องซื้อ มีภาพไฮไลต์ดึงดูดใจสุดๆ และจบด้วยคำเชิญชวน + พิกัด/ข้อมูลจริง + CTA ชัดเจน",
  LIFESTYLE:
    "เน้นแนวไลฟ์สไตล์/Aesthetic Vlog: โทนภาพสวยละมุน ชวนฝัน พาเดินชมมุมถ่ายรูปสวยๆ และบรรยากาศที่คนไทยอยากแต่งตัวตามไปเช็กอิน",
  HOWTO:
    "เน้นแนว How-To / คู่มือฉบับจับมือทำ: บอกขั้นตอนชัดเจนว่าไปยังไง มีจุดไหนห้ามพลาด แต่งตัวยังไง เวลาเปิด-ปิด/ค่าเข้าเท่าไหร่ ให้คนดูเซฟเก็บไว้ใช้จริง",
  MERIT_REVIEW:
    "เน้นแนวทำบุญ/รีวิวอินไซต์ลึก: เล่าจุดไหว้พระ/กิจกรรมสำคัญ สิ่งที่คนมักไม่รู้ หรือรีวิวจุดเด่นแบบจริงใจ ให้คนดูอยากตามรอย",
  VIRAL_POV:
    "เน้นแนว POV / ไวรัลหยุดนิ้ว: เปิดด้วยมุมมองคนดูหรือประโยคสะกิดใจ/มีมร่วมสมัยในไทย เล่ากระชับ สนุก แชร์ต่อให้เพื่อนทันที"
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action = "GENERATE",
      prompt,
      format = "VIDEO",
      aiMode = "AI_FLOW", // "AI_FLOW" | "REAL_SHOOT"
      aspectRatio = "9:16",
      contentGoal = "COMMERCIAL",
      includeTrends = true,
      platform = "TikTok / Reels / YouTube Shorts",
      selectedAngle,
      researchBrief,
      sceneCount = "AUTO"
    } = body;

    const currentDateThai = new Date().toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    // =========================================================================
    // MODE 1: Trend & Viral Meme Radar
    // =========================================================================
    if (action === "TREND_RADAR") {
      const trendSystem = `คุณคือ "นักจับกระแสไวรัลและมีมโซเชียลไทย" สำหรับ Solo Creator ที่ใช้ AI (Google Flow) ผลิตคลิปคนเดียว
วันนี้คือวันที่ ${currentDateThai}
จงคิด 4 ไอเดียคอนเทนต์ที่ "กำลังเป็นกระแส / เล่นกับมีม / จริตคนไทยหยุดดูทันที" ที่สามารถนำไปเจนภาพ/วิดีโอใน Google Flow ได้สวยและปังที่สุด

ตอบเป็น JSON เท่านั้น:
{
  "trends": [
    {
      "tag": "🔥 กระแส/มีม",
      "title": "ชื่อไอเดียสั้นๆ น่าคลิก",
      "prompt_idea": "คำสั่งสั้นๆ ภาษาคนที่จะเอาไปใส่ช่องสร้างคอนเทนต์ได้เลย",
      "why_viral": "ทำไมคนถึงหยุดดูและแชร์ต่อ (Hook & อารมณ์ร่วม)"
    }
  ]
}`;

      const trendRes = await executeAIFailoverChain({
        systemInstruction: trendSystem,
        prompt: `แนะนำ 4 เทรนด์คอนเทนต์ไวรัล + มีมฮิตที่เหมาะกับคนทำงานคนเดียวใช้ Google Flow เจนคลิปสั้น (อัปเดต ณ ${currentDateThai})`,
        workflow: "Trend & Viral Meme Radar",
        responseSchema: true,
        reasoningEffort: "high"
      });

      if (trendRes.data?.trends && Array.isArray(trendRes.data.trends)) {
        return NextResponse.json({ success: true, trends: trendRes.data.trends });
      }

      return NextResponse.json({
        success: true,
        trends: [
          {
            tag: "📍 พาเที่ยวเชิญชวน",
            title: "พาเที่ยววัดร่องขุ่น เชียงราย ฉบับเชิญชวนให้ต้องไปสักครั้ง",
            prompt_idea: "ช่วยคิดคอนเทนต์สำหรับไปวัดร่องขุ่น จ.เชียงราย",
            why_viral: "แลนด์มาร์กระดับโลกของไทย มีภาพจำชัดเจน (สะพานวัฏสงสาร, โบสถ์ขาว) คนไทยชอบเซฟเก็บไว้ตามรอย"
          },
          {
            tag: "🔥 ป้ายยา/ขายของ",
            title: "Commercial เปิดร้านคาเฟ่/สินค้า แบบ 3 วิแรกต้องหยุดดู",
            prompt_idea: "ทำคลิปโฆษณาเชิญชวนมาคาเฟ่มินิมอลแสงเช้า พร้อมเมนูซิกเนเจอร์และพิกัด",
            why_viral: "เปิดตัวสินค้าชัด + แสงสวย + ใส่ป๊อปอัพราคา/พิกัด ช่วยปิดการขายและกระตุ้นให้คนตามมาจริง"
          },
          {
            tag: "📌 How-To คนไทยชอบเซฟ",
            title: "เช็กลิสต์ก่อนไปเที่ยว/ทำบุญ (รู้ไว้ก่อนไปจะได้ไม่พลาด)",
            prompt_idea: "ทำคลิป How-To แนะนำการเตรียมตัวและมุมถ่ายรูปสวยๆ สำหรับทริปเชียงราย 1 วัน",
            why_viral: "คอนเทนต์ให้ข้อมูลจริงที่เอาไปใช้ได้ทันที มียอด Save และ Share สูงที่สุดบน TikTok/Reels ไทย"
          },
          {
            tag: "🚀 Before vs After",
            title: "เปลี่ยนลุค/เปลี่ยนห้อง/เปลี่ยนบรรยากาศใน 3 วิ",
            prompt_idea: "คลิปเปลี่ยนห้องรกให้กลายเป็นห้องหรูสไตล์ Luxury ภายใน 3 วินาที",
            why_viral: "คนชอบดูความเปลี่ยนแปลงแบบทันใจ หยุดดูเพื่อรอดูผลลัพธ์ตอนจบ"
          }
        ]
      });
    }

    // =========================================================================
    // MODE 2: BRAINSTORM (Live Web Research + 5 Pro Thai Social Content Angles)
    // =========================================================================
    if (action === "BRAINSTORM") {
      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        return NextResponse.json({ success: false, error: "กรุณาพิมพ์ชื่อสถานที่ สินค้า หรือหัวข้อที่อยากทำคอนเทนต์ก่อนครับ" }, { status: 400 });
      }

      const research: WebResearchResult = await researchTopicOnline(prompt.trim());

      const brainstormSystem = `คุณคือ "Creative Director & นักกลยุทธ์คอนเทนต์โซเชียลไทยระดับมืออาชีพ" (TikTok / Instagram Reels / YouTube Shorts)
วันนี้คือวันที่ ${currentDateThai}

หน้าที่ของคุณ:
1. วิเคราะห์ข้อมูลจริงที่ค้นหามาได้เกี่ยวกับหัวข้อ/สถานที่/สินค้าของผู้ใช้ (ห้ามมั่วข้อมูลเด็ดขาด ถ้ามีข้อมูลจริงให้ใช้ข้อมูลจริงเป็นแกนหลัก)
2. สรุป "คู่มือข้อมูลจริงก่อนลงมือทำ" (อยู่ที่ไหน, มีอะไรบ้าง, ไฮไลต์เด็ด, ข้อมูลเวลาเปิด-ปิด/ค่าเข้า/เคล็ดลับ, และแนะนำมุมถ่าย/ภาพที่ควรมีจริง)
3. เสนอ **5 แนวทางคอนเทนต์ที่แตกต่างกันอย่างชัดเจน** และใช้งานได้จริงบนโซเชียลไทย ให้ผู้ใช้เลือกกดสร้างสคริปต์ได้ทันที ได้แก่:
   - แนวที่ 1 (goal: "COMMERCIAL"): 🎯 เชิญชวน / ป้ายยา (Commercial & Invitation) — ขายจุดเด่นชัดๆ กระตุ้นให้อยากมา/อยากซื้อ พร้อมพิกัดและ CTA
   - แนวที่ 2 (goal: "LIFESTYLE"): ✨ ไลฟ์สไตล์ / Aesthetic Vlog — พาเที่ยวสวยๆ โทนละมุน มุมถ่ายรูปปังๆ
   - แนวที่ 3 (goal: "HOWTO"): 📌 How-To / คู่มือฉบับจับมือทำ — เดินทางยังไง มีอะไรบ้าง แต่งตัวยังไง จุดไหนห้ามพลาด
   - แนวที่ 4 (goal: "MERIT_REVIEW"): 🙏 ทำบุญ / สายมู / อินไซต์พิเศษ (หรือ 💡 เกร็ดความรู้/เบื้องหลัง หากไม่ใช่สถานที่ทำบุญ)
   - แนวที่ 5 (goal: "VIRAL_POV"): 🔥 รีวิวตรงไปตรงมา / POV ไวรัล — จริตคนไทย หยุดนิ้ว แชร์ง่าย คอมเมนต์เยอะ

ตอบเป็น JSON ที่ถูกต้องตามโครงสร้างนี้เท่านั้น:
{
  "research_brief": {
    "subject": "ชื่อสถานที่ / สินค้า / หัวข้อที่วิเคราะห์",
    "location_or_context": "อยู่ที่ไหน / จังหวัดอะไร / บริบทสำคัญ (ระบุให้ชัด)",
    "highlights": [
      "ไฮไลต์จริงที่ 1 (อธิบายสั้นๆ ว่าคืออะไร)",
      "ไฮไลต์จริงที่ 2",
      "ไฮไลต์จริงที่ 3",
      "ไฮไลต์จริงที่ 4"
    ],
    "practical_info": "เวลาเปิด-ปิด / ค่าเข้า / การเดินทาง / ข้อควรรู้หรือข้อห้ามสำคัญ (ถ้ามี)",
    "what_to_shoot": [
      "มุมถ่าย/ช็อตที่ต้องมี 1 (ระบุภาพจริงที่สื่อเอกลักษณ์ได้ทันที)",
      "มุมถ่าย/ช็อตที่ต้องมี 2",
      "มุมถ่าย/ช็อตที่ต้องมี 3"
    ]
  },
  "angles": [
    {
      "id": "angle-1",
      "goal": "COMMERCIAL",
      "category_badge": "🎯 เชิญชวน / ป้ายยา",
      "title": "ชื่อคอนเทนต์แนวนี้แบบมืออาชีพ น่าคลิก",
      "hook_preview": "ประโยคเปิด 3 วินาทีแรก + ตัวหนังสือป๊อปอัพตัวอย่าง",
      "description": "อธิบายสั้นๆ ว่าจะเล่าเรื่องยังไงให้คนดูอยากมา/อยากซื้อจริง",
      "why_it_works": "ทำไมแนวนี้ถึงปังบนโซเชียลไทย",
      "suggested_prompt": "คำสั่งพร้อมใช้สำหรับส่งไปสร้างสคริปต์+Prompt ฉากของแนวนี้โดยเฉพาะ"
    }
  ]
}`;

      const brainstormUserPrompt = `คำขอของผู้ใช้: "${prompt.trim()}"
สัดส่วนวิดีโอที่ต้องการ: ${aspectRatio}
แพลตฟอร์มเป้าหมาย: ${platform}

=== ข้อมูลจริงที่ระบบค้นหามาจากเว็บ (${research.foundFacts ? `พบ ${research.sources.length} แหล่ง` : "ไม่พบจากค้นหาอัตโนมัติ ให้ใช้ความรู้จริงที่แม่นยำ"}) ===
${research.summaryText || "(ใช้ความรู้ที่ถูกต้องและเป็นจริงเกี่ยวกับสถานที่/หัวข้อนี้ ระบุรายละเอียดที่ชัดเจน)"}

กรุณาสรุปข้อมูลจริง (อยู่ที่ไหน มีอะไรบ้าง ควรถ่ายอะไร) และเสนอ 5 แนวทางคอนเทนต์มืออาชีพที่แตกต่างกันชัดเจนเพื่อให้ผู้ใช้เลือกกดนำไปสร้างคลิปจริงได้เลย`;

      const aiRes = await executeAIFailoverChain({
        systemInstruction: brainstormSystem,
        prompt: brainstormUserPrompt,
        workflow: "Easy AI Content Strategist & Research",
        responseSchema: true,
        reasoningEffort: "high"
      });

      if (aiRes.data && typeof aiRes.data === "object" && Array.isArray(aiRes.data.angles)) {
        const rb = aiRes.data.research_brief || {};
        return NextResponse.json({
          success: true,
          research_brief: {
            subject: String(rb.subject || research.query || prompt.trim()),
            location_or_context: String(rb.location_or_context || ""),
            highlights: Array.isArray(rb.highlights) ? rb.highlights.map(String) : [],
            practical_info: String(rb.practical_info || ""),
            what_to_shoot: Array.isArray(rb.what_to_shoot) ? rb.what_to_shoot.map(String) : [],
            sources: research.sources
          },
          angles: aiRes.data.angles.map((a: any, idx: number) => ({
            id: String(a?.id || `angle-${idx + 1}`),
            goal: String(a?.goal || "COMMERCIAL"),
            category_badge: String(a?.category_badge || `แนวทางที่ ${idx + 1}`),
            title: String(a?.title || `ไอเดียคอนเทนต์ที่ ${idx + 1}`),
            hook_preview: String(a?.hook_preview || ""),
            description: String(a?.description || ""),
            why_it_works: String(a?.why_it_works || ""),
            suggested_prompt: String(a?.suggested_prompt || `${prompt.trim()} แนว ${a?.title || ""}`)
          })),
          meta: {
            modelUsed: aiRes.modelUsed,
            providerUsed: aiRes.providerUsed,
            isFailover: aiRes.isFailover
          }
        });
      }

      return NextResponse.json({
        success: true,
        research_brief: {
          subject: research.query || prompt.trim(),
          location_or_context: research.sources[0]?.snippet || `ข้อมูลภาพรวมสำหรับ "${prompt.trim()}"`,
          highlights: research.sources.slice(0, 3).map((s) => `${s.title}: ${s.snippet.slice(0, 110)}`),
          practical_info: "แนะนำตรวจสอบเวลาเปิด-ปิดและช่วงแสงเช้า/เย็นก่อนถ่ายจริงเพื่อให้ภาพสวยที่สุด",
          what_to_shoot: [
            "ช็อตเปิดภาพกว้างให้เห็นเอกลักษณ์ของสถานที่/สินค้าชัดเจนทันทีใน 3 วินาทีแรก",
            "ช็อตโคลสอัปไฮไลต์สำคัญที่คนเห็นแล้วจำได้ทันที",
            "ช็อตบรรยากาศและมุมเชิญชวนปิดท้ายพร้อมป๊อปอัพพิกัด/ข้อมูล"
          ],
          sources: research.sources
        },
        angles: [
          {
            id: "angle-1",
            goal: "COMMERCIAL",
            category_badge: "🎯 เชิญชวน / ป้ายยา",
            title: `ชวนมาเช็กอิน ${research.query || prompt.trim()} สักครั้งในชีวิต!`,
            hook_preview: `"ถ้ามาแถวนี้แล้วไม่แวะที่นี่ถือว่าพลาดมาก! 📍"`,
            description: "เน้นขายจุดเด่นและบรรยากาศอลังการ ปิดท้ายด้วยพิกัด เวลาเปิด-ปิด และคำเชิญชวนชัดเจน",
            why_it_works: "สื่อสารตรงประเด็น รู้ทันทีว่าคือที่ไหนและทำไมต้องมา",
            suggested_prompt: `ทำคลิปแนวเชิญชวน/โฆษณาป้ายยาให้คนอยากมา ${prompt.trim()} เปิดให้เห็นเอกลักษณ์ชัดๆ พร้อมป๊อปอัพพิกัดและคำชวนมา`
          },
          {
            id: "angle-2",
            goal: "LIFESTYLE",
            category_badge: "✨ ไลฟ์สไตล์ / Vlog",
            title: `พาเดินเที่ยว ${research.query || prompt.trim()} โทนสวยละมุน มุมถ่ายรูปปัง`,
            hook_preview: `"แจกพิกัดมุมถ่ายรูปสวยเหมือนอยู่ต่างประเทศ ✨"`,
            description: "เล่าเรื่องผ่านมุมมองคนเดินเที่ยวจริง โทนแสงธรรมชาติ ชูมุมถ่ายรูปยอดฮิต",
            why_it_works: "เข้ากับจริต Reels/TikTok สายเที่ยว คนกดเซฟไปถ่ายตามเยอะ",
            suggested_prompt: `ทำคลิปไลฟ์สไตล์พาเที่ยว ${prompt.trim()} เน้นมุมถ่ายรูปสวยๆ บรรยากาศชวนฝัน`
          },
          {
            id: "angle-3",
            goal: "HOWTO",
            category_badge: "📌 How-To / คู่มือ",
            title: `คู่มือไป ${research.query || prompt.trim()} มีอะไรบ้าง? ต้องรู้อะไรก่อนไป`,
            hook_preview: `"เซฟเก็บไว้เลย! 3 เรื่องต้องรู้ก่อนไป ${research.query || prompt.trim()} 📌"`,
            description: "สรุปจุดไฮไลต์ การเดินทาง การแต่งกาย และเวลาที่ควรมากระชับจบใน 20 วิ",
            why_it_works: "คอนเทนต์มีประโยชน์จริง ยอด Save และ Share สูงมาก",
            suggested_prompt: `ทำคลิป How-To แนะนำข้อมูลจริงก่อนไป ${prompt.trim()} บอกว่ามีอะไรบ้าง ควรถ่ายตรงไหน และข้อควรรู้`
          },
          {
            id: "angle-4",
            goal: "MERIT_REVIEW",
            category_badge: "🙏 ทำบุญ / อินไซต์",
            title: `จุดไฮไลต์ & สิ่งห้ามพลาดเมื่อมา ${research.query || prompt.trim()}`,
            hook_preview: `"มาที่นี่ต้องแวะจุดนี้! หลายคนเดินผ่านไม่รู้ความหมาย"`,
            description: "เจาะลึกความหมาย กิจกรรมทำบุญ หรือจุดเด่นเฉพาะตัวที่ทำให้คนดูอินและอยากไปสัมผัส",
            why_it_works: "สร้างคุณค่าทางอารมณ์และความน่าสนใจมากกว่าคลิปโชว์ภาพเฉยๆ",
            suggested_prompt: `ทำคลิปรีวิวเจาะลึกกิจกรรมและจุดไฮไลต์สำคัญของ ${prompt.trim()} แบบอินไซต์ที่คนไทยชอบดู`
          },
          {
            id: "angle-5",
            goal: "VIRAL_POV",
            category_badge: "🔥 POV / รีวิวไวรัล",
            title: `POV: มา ${research.query || prompt.trim()} ครั้งแรก ของจริงสวยกว่าในรูปไหม?`,
            hook_preview: `"ของจริงจะตรงปกไหม? พาดูแบบไม่กั๊กใน 20 วิ!"`,
            description: "เปิดด้วยคำถามท้าทายความอยากรู้ พาชมช็อตเด็ดทีละจุดแล้วสรุปความประทับใจ",
            why_it_works: "กระตุ้นคอมเมนต์และการแท็กเพื่อนชวนไปเที่ยวได้สูงมาก",
            suggested_prompt: `ทำคลิป POV รีวิวตรงไปตรงมา ${prompt.trim()} ของจริงเป็นยังไง พาดูจุดเด็ดทีละช็อตแบบหยุดนิ้ว`
          }
        ],
        meta: {
          modelUsed: "Built-in Research Fallback",
          providerUsed: "local-engine",
          isFailover: true
        }
      });
    }

    // =========================================================================
    // MODE 3: GENERATE (Pro Commercial Storyboard + Fact-Grounded Prompts + Thai Pop-up Text)
    // =========================================================================
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ success: false, error: "กรุณาพิมพ์สิ่งที่อยากทำคอนเทนต์ก่อนครับ" }, { status: 400 });
    }

    const isAiFlow = aiMode === "AI_FLOW";
    const goalGuide = GOAL_INSTRUCTIONS[contentGoal] || GOAL_INSTRUCTIONS.COMMERCIAL;
    const fixedCount = Number(sceneCount);
    const hasFixed = Number.isFinite(fixedCount) && fixedCount >= 3 && fixedCount <= 12;
    const sceneRule = hasFixed
      ? `จำนวนฉาก: ${fixedCount} ฉากพอดี (ฉากละ 3-6 วินาที)`
      : "จำนวนฉาก: ให้คุณตัดสินใจเองตามความเหมาะสมของเรื่อง ระหว่าง 5-10 ฉาก (ฉากละ 3-6 วินาที) ยิ่งมีหลายมุมกล้องหลายมุมมองยิ่งดี แต่ห้ามฉากซ้ำซาก";

    // Ground in real facts automatically if not already provided from BRAINSTORM step
    let researchContextText = "";
    let researchSources: Array<{ title: string; url: string; snippet: string }> = [];
    if (researchBrief && typeof researchBrief === "object") {
      researchContextText = [
        `หัวข้อ/สถานที่จริง: ${researchBrief.subject || ""}`,
        `พิกัด/บริบท: ${researchBrief.location_or_context || ""}`,
        Array.isArray(researchBrief.highlights) && researchBrief.highlights.length > 0
          ? `ไฮไลต์สำคัญที่มีจริง:\n- ${researchBrief.highlights.join("\n- ")}`
          : "",
        researchBrief.practical_info ? `ข้อมูลปฏิบัติจริง: ${researchBrief.practical_info}` : "",
        Array.isArray(researchBrief.what_to_shoot) && researchBrief.what_to_shoot.length > 0
          ? `มุมภาพที่ต้องมี:\n- ${researchBrief.what_to_shoot.join("\n- ")}`
          : ""
      ]
        .filter(Boolean)
        .join("\n");
      researchSources = Array.isArray(researchBrief.sources) ? researchBrief.sources : [];
    } else {
      const liveResearch = await researchTopicOnline(prompt.trim());
      researchContextText = liveResearch.summaryText;
      researchSources = liveResearch.sources;
    }

    const systemInstruction = `คุณคือ "ผู้กำกับโฆษณาและคอนเทนต์โซเชียลไทยระดับมืออาชีพ (Commercial Director + Thai Social Strategist)"
วันนี้คือวันที่ ${currentDateThai}

เป้าหมายสูงสุด: สร้างสคริปต์และ Prompt วิดีโอที่ **"ใช้งานจริงได้ทันที ดูออกชัดเจนว่าคือสถานที่ไหน/ขายอะไร เชิญชวนให้คนดูอยากมา/อยากซื้อจริง และสอดคล้องกับโซเชียลไทย (TikTok/Reels/Shorts)"**

แนวทางคอนเทนต์ที่ผู้ใช้เลือก:
${goalGuide}

กฎเหล็กคุณภาพระดับ Commercial (ห้ามละเมิดเด็ดขาด!):
1. **ห้ามสร้างภาพคลุมเครือที่ดูไม่ออกว่าคือที่ไหน/อะไร:** ฉากที่ 1 ต้องเปิดตัวแลนด์มาร์กจริง สถาปัตยกรรมจริง หรือสินค้าจริงที่เห็นปุ๊บจำได้ปั๊บ (อ้างอิงจากข้อมูลจริงที่ให้ไป)
2. **${sceneRule}** ต้องมีเรื่องราวครบ Commercial Arc และแต่ละฉากต้องใช้ มุมกล้อง/ขนาดภาพ/มุมมองที่ต่างกัน (เช่น ภาพกว้าง Drone, โคลสอัปรายละเอียด, มุมต่ำ, POV เดินเข้า, อินเสิร์ต/B-roll รายละเอียดเล็กๆ, คนจริงในฉาก, ภาพสะท้อน, Time-lapse แสง) เพื่อให้ตัดต่อแล้วดูมีมิติ ไม่เบื่อ ฉากเพิ่มเติมให้แทรกระหว่างโครงนี้:
   - ฉาก 1: **Stop-Scroll Hook + เปิดตัวสถานที่/สินค้าชัดเจน** (เห็นทันทีว่าคือที่ไหน/อะไร + ประโยคหยุดนิ้ว)
   - ฉากกลาง (หนึ่งหรือหลายฉาก): **ไฮไลต์ซิกเนเจอร์ / จุดขายหลัก (Signature Feature)** (โชว์ของดี/จุดเด่นจริงแบบใกล้ชิด น่าทึ่ง)
   - ฉากกลางต่อมา (หนึ่งหรือหลายฉาก): **บรรยากาศประสบการณ์จริง / How-To / ความน่าเชื่อถือ** (ให้เห็นคนเที่ยว/คนใช้จริง อารมณ์ร่วม หรือเคล็ดลับที่เอาไปใช้ได้จริง)
   - ฉากสุดท้าย: **เชิญชวน & ปิดการขายชัดๆ (Invitation + CTA)** (ภาพกว้างประทับใจชวนมาเยือน + บอกพิกัด/เวลา/คำเชิญชวนชัดเจน)
3. **ตัวหนังสือป๊อปอัพ & คำบรรยายภาษาไทยทุกฉาก (สำคัญมากสำหรับโซเชียลไทย!):**
   - ทุกฉากต้องมี \`popup_badge\` (ป้ายป๊อปอัพสั้นๆ เช่น "📍 วัดร่องขุ่น จ.เชียงราย", "⏰ เปิด 08:00-17:00 น.", "✨ จุดห้ามพลาด")
   - ทุกฉากต้องมี \`on_screen_text\` (ตัวหนังสือพาดหัวเด้งกลาง/ล่างจอสั้นกระชับ 3-7 คำ อ่านจบใน 1 วิ)
   - ทุกฉากต้องมี \`subtitle_line\` (คำบรรยายสั้นๆ ประกอบจังหวะเสียงพากย์)
4. **กฎเขียน \`flow_prompt\` (ภาษาอังกฤษล้วน ระดับหนังโฆษณา Commercial 4K):**
   - ต้องระบุชื่อและลักษณะภาพจริงของสถานที่/สถาปัตยกรรม/สินค้าให้แม่นยำ (เช่น หากเป็นวัดร่องขุ่น ต้องบรรยาย "Wat Rong Khun (White Temple) in Chiang Rai, Thailand — intricate gleaming white Thai Buddhist ubosot temple adorned with sparkling mirrored glass mosaics, iconic Bridge of the Cycle of Rebirth with sculpted outstretched hands, reflecting pond..." ห้ามเขียนกว้างๆ แค่ "a Thai temple"!)
   - ระบุ: Shot type + Camera movement (smooth slow push-in / gimbal orbit / drone reveal) + Commercial lighting (crisp golden morning sunlight, natural sky, vivid photorealistic colors) + Subject action + Composition with clean upper/lower negative space for social text overlay + สัดส่วน ${aspectRatio} + "photorealistic 4K commercial cinematography, natural authentic movement, no garbled text, no watermark"
   - **แยกตัวหนังสือไทยออกจาก AI Video Prompt** (เพื่อไม่ให้ AI เจนตัวหนังสือไทยเพี้ยน) แล้วส่งตัวหนังสือไทยไปใน \`popup_badge\`, \`on_screen_text\`, และ \`text_overlay_pack\` ให้ผู้ใช้แปะใน CapCut หรือเปิด Overlay ใน Flow Tool ได้คมกริบ 100%

ตอบกลับเป็น JSON ที่ถูกต้องตามโครงสร้างนี้เท่านั้น:
{
  "title": "ชื่อคอนเทนต์สั้นๆ น่าคลิก ระบุชื่อสถานที่/สินค้าชัด",
  "content_goal_label": "เช่น 🎯 เชิญชวน / ป้ายยา (Commercial)",
  "location_and_facts_summary": "สรุปข้อมูลจริงสั้นๆ 1-2 บรรทัด (อยู่ที่ไหน / เวลา / จุดเด่น) ที่ใช้ในคลิปนี้",
  "hook_3sec": "ประโยคหรือภาพเปิด 3 วินาทีแรกที่บังคับให้คนดูหยุดเลื่อนนิ้วทันที",
  "viral_meme_angle": "จุดดึงดูดและเหตุผลที่คลิปนี้จะเชิญชวนคนไทยให้ดูจบ แชร์ หรือตามมาจริง",
  "concept": "สรุปแก่นเรื่องและเส้นเรื่อง Commercial 1-2 ประโยค",
  "flow_setup_guide": {
    "tool_mode": "Text to Video / Frames to Video",
    "aspect_ratio": "${aspectRatio}",
    "recommended_model": "Veo 3.1 - Fast หรือ Omni 1.2 Flash",
    "quick_steps": [
      "1. กดปุ่ม 'Copy ส่งเข้า Flow Tool' ด้านบน แล้วไปกด 'วางสูตรจาก OS' ใน PK Commercial Studio Pro",
      "2. เจนวิดีโอทีละฉาก (ระบบตั้งสัดส่วน ${aspectRatio} ให้อัตโนมัติ)",
      "3. กดโหลดวิดีโอ + ก๊อปชุด 'ตัวหนังสือป๊อปอัพในคลิป' ไปวางใน CapCut หรือเปิดฝังตัวหนังสือใน Flow Tool"
    ]
  },
  "video_blueprint": {
    "total_duration_sec": 30,
    "scene_count": 8,
    "mood_and_music": "แนวเพลงประกอบและซาวด์เอฟเฟกต์ (SFX) ที่เข้ากับโซเชียลไทย",
    "scenes": [
      {
        "scene_number": 1,
        "scene_role": "Hook + เปิดตัวสถานที่/สินค้า",
        "duration_sec": 5,
        "flow_mode": "Text to Video",
        "what_to_shoot": "คำอธิบายสิ่งที่เกิดขึ้นในฉากนี้ (ภาษาไทยเข้าใจง่าย อ้างอิงจุดจริง)",
        "camera_angle": "มุมกล้องและการเคลื่อนกล้องระดับโฆษณา",
        "continuity_note": "วิธีเชื่อมภาพให้ต่อเนื่องกับฉากถัดไป",
        "voiceover_text": "บทพากย์ภาษาไทยที่เป็นธรรมชาติ น่าฟัง ชวนติดตาม พอดี 5 วินาที",
        "popup_badge": "📍 ป้ายป๊อปอัพมุมบน (สั้น 2-4 คำ)",
        "on_screen_text": "ข้อความใหญ่เด้งกลาง/ล่างจอสไตล์ TikTok ไทย",
        "subtitle_line": "คำบรรยายสั้นประกอบจังหวะ",
        "flow_prompt": "Detailed commercial English prompt for Google Flow with authentic real-world visual landmarks..."
      }
    ],
    "editing_guide": [
      "ขั้นตอนตัดต่อ 1 (ใส่ตัวหนังสือป๊อปอัพ + จังหวะเปลี่ยนฉาก)...",
      "ขั้นตอนตัดต่อ 2...",
      "ขั้นตอนตัดต่อ 3..."
    ],
    "full_voiceover_script": "บทพากย์รวมทั้งคลิปแบบไหลลื่น ชวนมา/ปิดการขายชัดเจน"
  },
  "photo_blueprint": {
    "photo_style": "สไตล์ภาพและแสงระดับโฆษณา",
    "shots": [
      {
        "shot_number": 1,
        "role": "ภาพปก / Hook Cover",
        "angle_and_framing": "มุมกล้องและการจัดวาง",
        "lighting_and_props": "แสงและรายละเอียดในภาพจริง",
        "text_overlay": "ข้อความพาดหัวบนรูปปก",
        "image_prompt": "Detailed photorealistic commercial English prompt for Google Flow Image / Imagen..."
      }
    ]
  },
  "social_caption": "แคปชันพร้อมโพสต์ มี Hook + ข้อมูลจริง (พิกัด/เวลา/จุดเด่น) + คำเชิญชวนให้มา/แท็กเพื่อน",
  "hashtags": ["#แฮชแท็ก1", "#แฮชแท็ก2", "#แฮชแท็ก3", "#แฮชแท็ก4", "#แฮชแท็ก5"]
}`;

    const userPrompt = `คำขอหลัก: "${prompt.trim()}"
${selectedAngle ? `แนวทางที่ผู้ใช้เลือกเจาะจง: ${selectedAngle.category_badge || ""} — ${selectedAngle.title || ""} (${selectedAngle.description || ""})` : ""}
เป้าหมายคอนเทนต์: ${contentGoal}
โหมดการผลิต: ${isAiFlow ? "เจนวิดีโอด้วย AI ใน Google Flow 100% + ใส่ตัวหนังสือป๊อปอัพ/เสียงพากย์ไทย" : "ถ่ายทำเองหน้างาน + ตัดต่อลงโซเชียลไทย"}
รูปแบบ: ${format === "VIDEO" ? `วิดีโอสั้น Commercial (${sceneRule})` : format === "PHOTO" ? "ภาพนิ่ง/อัลบั้ม (3-4 ภาพ)" : `จัดเต็มทั้งวิดีโอ (${sceneRule}) และภาพนิ่ง (3 ภาพ)`}
สัดส่วนภาพ: ${aspectRatio}
การใส่กระแส/จริตโซเชียลไทย: ${includeTrends ? "เน้นจริต TikTok/Reels ไทย หยุดนิ้วใน 3 วิแรก ใส่ป๊อปอัพข้อความเด้งชวนอ่าน และเชิญชวนชัดเจน" : "เน้นข้อมูลและภาพระดับโฆษณาตรงไปตรงมา"}
แพลตฟอร์ม: ${platform}

=== ข้อมูลจริงที่ค้นหามาก่อนเขียนสคริปต์ ===
${researchContextText || "(ใช้ข้อมูลจริงที่แม่นยำเกี่ยวกับสถานที่/สินค้านี้ ระบุเอกลักษณ์ให้ชัดเจนห้ามคลุมเครือ)"}`;

    const aiRes = await executeAIFailoverChain({
      systemInstruction,
      prompt: userPrompt,
      workflow: "Easy AI Pro Commercial Content Creator",
      responseSchema: true,
      reasoningEffort: "high"
    });

    if (aiRes.data && typeof aiRes.data === "object") {
      const raw = aiRes.data;
      const rawScenes = Array.isArray(raw.video_blueprint?.scenes) ? raw.video_blueprint.scenes : [];
      const normalizedScenes = rawScenes.map((s: any, idx: number) => ({
        scene_number: Number(s?.scene_number) || idx + 1,
        scene_role: String(
          s?.scene_role ||
            (idx === 0
              ? "Hook + เปิดตัวสถานที่/สินค้า"
              : idx === 1
                ? "ไฮไลต์ซิกเนเจอร์"
                : idx === 2
                  ? "ประสบการณ์ & เคล็ดลับ"
                  : "เชิญชวน & ปิดท้าย CTA")
        ),
        duration_sec: Number(s?.duration_sec) || 4,
        flow_mode: String(s?.flow_mode || (idx === 0 ? "Text to Video" : "Frames to Video / Text to Video")),
        what_to_shoot: String(s?.what_to_shoot || "ภาพประกอบเนื้อหาหลัก"),
        camera_angle: String(s?.camera_angle || "Smooth commercial push-in"),
        continuity_note: String(s?.continuity_note || "คุมโทนแสงและสีต่อเนื่องจากฉากก่อนหน้า"),
        voiceover_text: String(s?.voiceover_text || ""),
        popup_badge: String(s?.popup_badge || (idx === 0 ? `📍 ${raw.title || prompt.trim()}` : `✨ ไฮไลต์ที่ ${idx + 1}`)),
        on_screen_text: String(s?.on_screen_text || ""),
        subtitle_line: String(s?.subtitle_line || s?.voiceover_text || ""),
        flow_prompt: String(
          s?.flow_prompt ||
            `Commercial 4K cinematic shot of ${prompt.trim()}, authentic real-world details, warm golden hour lighting, ${aspectRatio} vertical framing with clean space for text overlay, photorealistic, no garbled text, no watermark`
        )
      }));

      const rawShots = Array.isArray(raw.photo_blueprint?.shots) ? raw.photo_blueprint.shots : [];
      const normalizedShots = rawShots.map((sh: any, idx: number) => ({
        shot_number: Number(sh?.shot_number) || idx + 1,
        role: String(sh?.role || `ภาพที่ ${idx + 1}`),
        angle_and_framing: String(sh?.angle_and_framing || "มุมระดับสายตา จัดองค์ประกอบสมดุล"),
        lighting_and_props: String(sh?.lighting_and_props || "แสงธรรมชาติ โทนสะอาดตา"),
        text_overlay: String(sh?.text_overlay || ""),
        image_prompt: String(sh?.image_prompt || `Photorealistic commercial editorial photo of ${prompt.trim()}, ${aspectRatio}, 8k, no text`)
      }));

      // Build timestamped text overlay pack for CapCut / TikTok / Reels
      let cursorSec = 0;
      const textOverlayPack = normalizedScenes.map((s: any) => {
        const start = cursorSec;
        const end = cursorSec + (s.duration_sec || 5);
        cursorSec = end;
        return {
          scene_number: s.scene_number,
          time_range: `0:${String(start).padStart(2, "0")} - 0:${String(end).padStart(2, "0")}`,
          popup_badge: s.popup_badge,
          on_screen_text: s.on_screen_text,
          subtitle_line: s.subtitle_line
        };
      });

      const normalizedBlueprint = {
        title: String(raw.title || `คอนเทนต์: ${prompt.trim()}`),
        content_goal_label: String(raw.content_goal_label || contentGoal),
        location_and_facts_summary: String(raw.location_and_facts_summary || ""),
        research_sources: researchSources,
        hook_3sec: String(raw.hook_3sec || ""),
        viral_meme_angle: String(raw.viral_meme_angle || ""),
        concept: String(raw.concept || ""),
        text_overlay_pack: textOverlayPack,
        flow_setup_guide: {
          tool_mode: String(raw.flow_setup_guide?.tool_mode || "Text to Video (ฉาก 1) → Frames to Video (ฉากถัดไป)"),
          aspect_ratio: String(raw.flow_setup_guide?.aspect_ratio || aspectRatio),
          recommended_model: String(raw.flow_setup_guide?.recommended_model || "Veo 3.1 - Fast / Omni 1.2 Flash"),
          quick_steps:
            Array.isArray(raw.flow_setup_guide?.quick_steps) && raw.flow_setup_guide.quick_steps.length > 0
              ? raw.flow_setup_guide.quick_steps.map(String)
              : [
                  "1. กดปุ่ม 'Copy ส่งเข้า Flow Tool' ด้านบน แล้วไปกด 'วางสูตรจาก OS' ใน PK Commercial Studio Pro",
                  `2. ตั้งค่าสัดส่วน ${aspectRatio} และกดเจนวิดีโอทีละฉาก`,
                  "3. กดโหลดวิดีโอที่รวมแล้ว (หรือแยกช็อต .ZIP) + นำชุดตัวหนังสือป๊อปอัพไปใส่ใน CapCut / TikTok"
                ]
        },
        video_blueprint:
          normalizedScenes.length > 0
            ? {
                total_duration_sec:
                  Number(raw.video_blueprint?.total_duration_sec) ||
                  normalizedScenes.reduce((acc: number, s: any) => acc + s.duration_sec, 0),
                scene_count: normalizedScenes.length,
                mood_and_music: String(raw.video_blueprint?.mood_and_music || "เพลงจังหวะทันสมัย เข้ากับอารมณ์คลิป"),
                scenes: normalizedScenes,
                editing_guide: Array.isArray(raw.video_blueprint?.editing_guide)
                  ? raw.video_blueprint.editing_guide.map(String)
                  : [],
                full_voiceover_script: String(
                  raw.video_blueprint?.full_voiceover_script ||
                    normalizedScenes.map((s: any) => s.voiceover_text).filter(Boolean).join(" ")
                )
              }
            : undefined,
        photo_blueprint:
          normalizedShots.length > 0
            ? {
                photo_style: String(raw.photo_blueprint?.photo_style || "Commercial Editorial Look"),
                shots: normalizedShots
              }
            : undefined,
        social_caption: String(raw.social_caption || ""),
        hashtags: Array.isArray(raw.hashtags) ? raw.hashtags.map(String) : []
      };

      return NextResponse.json({
        success: true,
        blueprint: normalizedBlueprint,
        meta: {
          modelUsed: aiRes.modelUsed,
          providerUsed: aiRes.providerUsed,
          isFailover: aiRes.isFailover
        }
      });
    }

    // Fallback tailored for Commercial Solo Creator
    const fallbackBlueprint = {
      title: `พาเช็กอิน & รีวิว: ${prompt.trim()}`,
      content_goal_label: "🎯 เชิญชวน / ป้ายยา (Commercial)",
      location_and_facts_summary: researchSources[0]?.snippet || `คอนเทนต์เชิญชวนสำหรับ "${prompt.trim()}"`,
      research_sources: researchSources,
      hook_3sec: `เปิดด้วยภาพแลนด์มาร์ก/จุดเด่นที่เห็นปุ๊บรู้ทันทีว่าคือ "${prompt.trim()}" พร้อมคำเชิญชวนหยุดนิ้วใน 3 วิแรก`,
      viral_meme_angle: "เปิดตัวสถานที่ชัด + โชว์ไฮไลต์ที่ต้องมาเห็นด้วยตา + ปิดด้วยพิกัดและป๊อปอัพชวนแท็กเพื่อน",
      concept: `คลิปสั้น Commercial ${aspectRatio} 4 ฉากต่อเนื่อง ชวนคนดูมาสัมผัส "${prompt.trim()}" แบบเห็นภาพชัดและอยากตามรอยจริง`,
      text_overlay_pack: [
        { scene_number: 1, time_range: "0:00 - 0:05", popup_badge: `📍 ${prompt.trim()}`, on_screen_text: "ต้องมาสักครั้งในชีวิต! ✨", subtitle_line: "เปิดตัวพิกัดเด็ดที่ใครเห็นก็ต้องหยุดดู" },
        { scene_number: 2, time_range: "0:05 - 0:11", popup_badge: "🔥 ไฮไลต์ห้ามพลาด", on_screen_text: "มุมนี้ของจริงสวยมาก!", subtitle_line: "จุดเด่นที่ทำให้ที่นี่ไม่เหมือนที่ไหน" },
        { scene_number: 3, time_range: "0:11 - 0:17", popup_badge: "📸 มุมถ่ายรูปปัง", on_screen_text: "มาช่วงเช้าแสงดีสุดๆ", subtitle_line: "บรรยากาศจริงและเคล็ดลับก่อนมา" },
        { scene_number: 4, time_range: "0:17 - 0:22", popup_badge: "📌 เซฟพิกัดไว้เลย", on_screen_text: "แท็กเพื่อนชวนไปกัน! 👇", subtitle_line: "ชวนมาเช็กอินด้วยกันวันนี้" }
      ],
      flow_setup_guide: {
        tool_mode: "Text to Video (ฉาก 1) → Frames to Video (ฉาก 2-4)",
        aspect_ratio: aspectRatio,
        recommended_model: "Veo 3.1 - Fast / Omni 1.2 Flash",
        quick_steps: [
          "1. กด Copy ส่งเข้า Flow Tool ด้านบน แล้วไปวางใน PK Commercial Studio Pro",
          `2. ตรวจสอบสัดส่วน ${aspectRatio} แล้วกดเจนทีละฉาก`,
          "3. ดาวน์โหลดวิดีโอ + ใส่ตัวหนังสือป๊อปอัพจากชุดข้อความด้านล่างใน CapCut หรือ TikTok"
        ]
      },
      video_blueprint: {
        total_duration_sec: 22,
        scene_count: 4,
        mood_and_music: "เพลงแนว Uplifting Acoustic / Modern Thai Travel Beat ที่มีจังหวะดึงความสนใจในวิที่ 3",
        scenes: [
          {
            scene_number: 1,
            scene_role: "Hook + เปิดตัวสถานที่/สินค้า",
            duration_sec: 5,
            flow_mode: "Text to Video",
            what_to_shoot: `ภาพกว้างเปิดตัว "${prompt.trim()}" ให้เห็นเอกลักษณ์ชัดเจนทันที`,
            camera_angle: "Wide cinematic slow push-in",
            continuity_note: "เปิดให้เห็นจุดเด่นหลักชัดๆ เพื่อนำเข้าสู่ฉาก 2",
            voiceover_text: `ใครกำลังหาที่ไปเช็กอินสุดอลังการ ต้องห้ามพลาด ${prompt.trim()} เลยครับ!`,
            popup_badge: `📍 ${prompt.trim()}`,
            on_screen_text: "ต้องมาสักครั้งในชีวิต! ✨",
            subtitle_line: "เปิดตัวพิกัดเด็ดที่ใครเห็นก็ต้องหยุดดู",
            flow_prompt: `Commercial 4K wide establishing push-in shot of ${prompt.trim()}, unmistakable iconic architecture and authentic real-world details, bright golden morning sunlight, crisp blue sky, ${aspectRatio} vertical framing with clean space at top and bottom for captions, photorealistic, no garbled text, no watermark`
          },
          {
            scene_number: 2,
            scene_role: "ไฮไลต์ซิกเนเจอร์",
            duration_sec: 6,
            flow_mode: "Frames to Video / Text to Video",
            what_to_shoot: "โคลสอัปจุดไฮไลต์ที่สวยและเป็นเอกลักษณ์ที่สุด",
            camera_angle: "Smooth gimbal orbit close-up",
            continuity_note: "คุมแสงเช้าและโทนสีต่อเนื่องจากฉาก 1",
            voiceover_text: "ดูรายละเอียดตรงนี้สิครับ ของจริงคือสวยตะลึงและถ่ายรูปขึ้นกล้องทุกมุม",
            popup_badge: "🔥 ไฮไลต์ห้ามพลาด",
            on_screen_text: "มุมนี้ของจริงสวยมาก!",
            subtitle_line: "จุดเด่นที่ทำให้ที่นี่ไม่เหมือนที่ไหน",
            flow_prompt: `Commercial smooth gimbal orbit close-up showcasing the signature highlights and fine craftsmanship of ${prompt.trim()}, sparkling natural sunlight, shallow depth of field, vibrant true-to-life colors, ${aspectRatio} vertical video, 4K photorealistic, no garbled text, no watermark`
          },
          {
            scene_number: 3,
            scene_role: "ประสบการณ์ & เคล็ดลับ",
            duration_sec: 6,
            flow_mode: "Text to Video",
            what_to_shoot: "บรรยากาศนักท่องเที่ยวเดินชมและถ่ายรูปอย่างมีความสุข",
            camera_angle: "Eye-level inviting tracking shot",
            continuity_note: "ให้ฟีลเหมือนผู้ชมกำลังเดินเที่ยวอยู่ตรงนั้นด้วยตัวเอง",
            voiceover_text: "แนะนำให้มาช่วงเช้าครับ แสงนุ่ม คนยังไม่แน่น เดินชิลได้รูปสวยกลับไปเพียบแน่นอน",
            popup_badge: "📸 มุมถ่ายรูปปัง",
            on_screen_text: "มาช่วงเช้าแสงดีสุดๆ",
            subtitle_line: "บรรยากาศจริงและเคล็ดลับก่อนมา",
            flow_prompt: `Inviting eye-level tracking shot of cheerful visitors strolling and admiring ${prompt.trim()} in soft warm morning light, lively welcoming atmosphere, authentic candid motion, ${aspectRatio} vertical framing, commercial 4K cinematography, no garbled text, no watermark`
          },
          {
            scene_number: 4,
            scene_role: "เชิญชวน & ปิดท้าย CTA",
            duration_sec: 5,
            flow_mode: "Text to Video",
            what_to_shoot: "ภาพกว้างสุดประทับใจปิดท้ายเพื่อเชิญชวนให้มาเยือน",
            camera_angle: "Grand slow pull-back reveal",
            continuity_note: "จบด้วยภาพที่สวยและอบอุ่นที่สุดเพื่อปิดการเชิญชวน",
            voiceover_text: "เซฟคลิปนี้ไว้แล้วแท็กเพื่อนที่อยากชวนไปด้วยกันได้เลยครับ!",
            popup_badge: "📌 เซฟพิกัดไว้เลย",
            on_screen_text: "แท็กเพื่อนชวนไปกัน! 👇",
            subtitle_line: "ชวนมาเช็กอินด้วยกันวันนี้",
            flow_prompt: `Grand slow pull-back reveal shot of ${prompt.trim()} bathed in warm inviting sunlight, breathtaking commercial travel ad finale, clean sky space for call-to-action caption, ${aspectRatio} vertical framing, 4K photorealistic, no garbled text, no watermark`
          }
        ],
        editing_guide: [
          "1. นำคลิปทั้ง 4 ฉากมาต่อกันใน CapCut (หรือรวมไฟล์จาก PK Commercial Studio Pro)",
          "2. วางชุดตัวหนังสือป๊อปอัพไทยตามช่วงเวลา 0:00-0:22 พร้อมใส่เอฟเฟกต์ Pop เบาๆ",
          "3. ใส่เสียงพากย์ ElevenLabs + เพลงประกอบเบาๆ ระดับ -18dB"
        ],
        full_voiceover_script: `ใครกำลังหาที่ไปเช็กอินสุดอลังการ ต้องห้ามพลาด ${prompt.trim()} เลยครับ! ดูรายละเอียดตรงนี้สิครับ ของจริงคือสวยตะลึงและถ่ายรูปขึ้นกล้องทุกมุม แนะนำให้มาช่วงเช้าครับ แสงนุ่ม คนยังไม่แน่น เดินชิลได้รูปสวยกลับไปเพียบแน่นอน เซฟคลิปนี้ไว้แล้วแท็กเพื่อนที่อยากชวนไปด้วยกันได้เลยครับ!`
      },
      photo_blueprint: {
        photo_style: "Commercial Travel & Editorial Look",
        shots: [
          {
            shot_number: 1,
            role: "ภาพปกหยุดนิ้ว (Hook Cover)",
            angle_and_framing: "มุมกว้างเห็นเอกลักษณ์ชัด มีพื้นที่ด้านบนสำหรับพาดหัว",
            lighting_and_props: "แสงเช้าอบอุ่น ท้องฟ้าใส สีสดเป็นธรรมชาติ",
            text_overlay: `📍 ${prompt.trim()} ต้องมาสักครั้ง!`,
            image_prompt: `Commercial travel editorial cover photo of ${prompt.trim()}, iconic landmarks clearly visible, crisp golden morning sunlight, ${aspectRatio} framing, 8k photorealistic, no text`
          }
        ]
      },
      social_caption: `📍 ชวนมาเช็กอิน ${prompt.trim()}!\n\nใครกำลังวางแผนเที่ยวหรือหาที่ถ่ายรูปสวยๆ เซฟคลิปนี้เก็บไว้ได้เลย ✨\nอยากไปกับใคร แท็กชวนในคอมเมนต์ด้านล่างได้เลยครับ 👇`,
      hashtags: ["#เที่ยวไทย", "#รีวิวที่เที่ยว", "#ปักหมุดที่เที่ยว", "#TikTokพาเที่ยว", "#ReelsThailand"]
    };

    return NextResponse.json({
      success: true,
      blueprint: fallbackBlueprint,
      meta: {
        modelUsed: "Built-in Local Fallback",
        providerUsed: "local-engine",
        isFailover: true
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
