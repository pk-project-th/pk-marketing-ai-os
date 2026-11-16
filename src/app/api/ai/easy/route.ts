import { NextResponse } from "next/server";
import { executeAIFailoverChain } from "@/lib/ai/failover-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action = "GENERATE",
      prompt,
      format = "VIDEO",
      aiMode = "AI_FLOW", // "AI_FLOW" (เน้นเจน AI ใน Google Flow) | "REAL_SHOOT"
      aspectRatio = "9:16",
      includeTrends = true,
      platform = "TikTok / Reels / YouTube Shorts"
    } = body;

    const currentDateThai = new Date().toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    // Mode 1: Trend & Viral Meme Radar (ดึงกระแสไวรัลและมีมฮิตมาเป็นปุ่มให้กดใช้ทันที)
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
            tag: "🔥 ไวรัลหยุดนิ้ว",
            title: "POV: หลุดเข้าไปในโลกอนิเมะ/ไซไฟไทยๆ",
            prompt_idea: "ทำคลิป POV เดินเข้าวัดไทยหรือตลาดกลางคืนแล้วภาพเปลี่ยนเป็นโลกไซเบอร์พังก์สุดอลังการ",
            why_viral: "ใช้ Transition หักมุมใน 3 วิแรก คนดูชอบความ Contrast ระหว่างวิถีไทยกับโลก AI ล้ำๆ"
          },
          {
            tag: "😂 มีมสายฮา",
            title: "สัตว์เลี้ยง/ตุ๊กตาพูดได้ รีวิวชีวิตคนทำงาน",
            prompt_idea: "ทำคลิปแมวอ้วนใส่สูทนั่งบ่นเรื่องงานวันจันทร์แบบฮาๆ จริตคนไทย",
            why_viral: "มีมสัตว์เลี้ยงบ่นเรื่องงานแชร์กระจายง่ายใน TikTok/Reels คนดูแท็กเพื่อนทันที"
          },
          {
            tag: "✨ ASMR & ผ่อนคลาย",
            title: "ชงกาแฟ/จัดโต๊ะทำงานมินิมอล แสงเช้า",
            prompt_idea: "คลิป ASMR ชงกาแฟแก้วโปรดในห้องมินิมอลแสงแดดยามเช้า ภาพสโลว์ชวนฮีลใจ",
            why_viral: "คอนเทนต์สายฮีลใจดูซ้ำวนได้เรื่อยๆ ยอด Watch Time สูงมาก"
          },
          {
            tag: "🚀 รีวิว/ขายของ",
            title: "Before vs After เปลี่ยนลุค/เปลี่ยนห้องใน 3 วิ",
            prompt_idea: "คลิปเปลี่ยนห้องรกให้กลายเป็นห้องหรูสไตล์ Luxury ภายใน 3 วินาที",
            why_viral: "คนชอบดูความเปลี่ยนแปลงแบบทันใจ หยุดดูเพื่อรอดูผลลัพธ์ตอนจบ"
          }
        ]
      });
    }

    // Mode 2: Generate Blueprint
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ success: false, error: "กรุณาพิมพ์สิ่งที่อยากทำคอนเทนต์ก่อนครับ" }, { status: 400 });
    }

    const isAiFlow = aiMode === "AI_FLOW";

    const systemInstruction = `คุณคือ "ผู้กำกับคอนเทนต์ AI ระดับโปรสำหรับ Solo Creator (คนทำงานคนเดียว)"
วันนี้คือวันที่ ${currentDateThai}
เป้าหมายของคุณคือ: ช่วยผู้ใช้คิดคอนเทนต์ให้น่าสนใจ "หยุดนิ้วคนดูได้ใน 3 วินาทีแรก (Stop-Scroll Hook)" เล่นกับอารมณ์ กระแส และมีมที่คนไทยชอบแชร์ แล้วถอดสูตรออกมาให้เอาไปเจนต่อใน **Google Flow (Veo 3.1 / Imagen)** ได้ทันทีแบบจับมือทำ

กฎสำคัญสำหรับ Google Flow:
1. Google Flow เจนคลิปได้ครั้งละประมาณ 5-8 วินาที ดังนั้นแต่ละฉากควรออกแบบให้พอดี 5-8 วินาที
2. ช่อง \`flow_prompt\` ต้องเป็น **ภาษาอังกฤษล้วน** คุณภาพระดับภาพยนตร์ ระบุ: Subject + Action + Camera Movement + Lighting + Style + Continuity + สัดส่วน ${aspectRatio} + "no text, no watermark" เพื่อให้ก๊อปวางในช่อง "Describe your video" ของ Google Flow แล้วเจนออกมาสวยตรงปกทันที
3. ระบุ \`flow_mode\` ให้ชัดว่าฉากนั้นใน Google Flow ควรกดเลือกโหมดไหน (เช่น "Text to Video" สำหรับฉากเปิด หรือ "Frames to Video (ใช้ภาพจบฉากก่อนหน้า)" เพื่อความต่อเนื่อง)
4. ภาษาไทยในคำอธิบายต้องอ่านง่าย กระชับ เป็นภาษาพูดของครีเอเตอร์คนเดียว

ตอบกลับเป็น JSON ที่ถูกต้องตามโครงสร้างนี้เท่านั้น:
{
  "title": "ชื่อคอนเทนต์สั้นๆ ดึงดูดใจ",
  "hook_3sec": "ประโยคหรือภาพเปิด 3 วินาทีแรกที่บังคับให้คนดูหยุดเลื่อนนิ้วทันที",
  "viral_meme_angle": "มุมการเล่นกับกระแส/มีม/อารมณ์ร่วมที่ทำให้คนอยากกดแชร์หรือคอมเมนต์",
  "concept": "สรุปแก่นเรื่อง 1-2 ประโยค",
  "flow_setup_guide": {
    "tool_mode": "Text to Video / Frames to Video",
    "aspect_ratio": "${aspectRatio}",
    "recommended_model": "Veo 3.1 - Fast (เร็ว) หรือ Quality (เนียนสุด)",
    "quick_steps": [
      "1. เปิด Google Flow → กด + New Project",
      "2. ตั้งค่าสัดส่วนเป็น ${aspectRatio} และเลือกโหมดตามที่ระบุในแต่ละฉาก",
      "3. กด Copy Prompt ด้านล่างไปวางในช่องพิมพ์ของ Google Flow ทีละฉาก แล้วโหลดคลิปมาต่อใน CapCut พร้อมเสียงพากย์"
    ]
  },
  "video_blueprint": {
    "total_duration_sec": 24,
    "scene_count": 4,
    "mood_and_music": "แนวเพลงประกอบและซาวด์เอฟเฟกต์ (SFX)",
    "scenes": [
      {
        "scene_number": 1,
        "duration_sec": 6,
        "flow_mode": "Text to Video",
        "what_to_shoot": "คำอธิบายสิ่งที่เกิดขึ้นในฉากนี้ (ภาษาไทยเข้าใจง่าย)",
        "camera_angle": "มุมกล้องและการเคลื่อนกล้อง",
        "continuity_note": "วิธีเชื่อมภาพให้ต่อเนื่องกับฉากถัดไป",
        "voiceover_text": "บทพากย์เสียงสั้นๆ พอดี 6 วินาที",
        "on_screen_text": "ตัวหนังสือพาดหัวใหญ่ขึ้นจอ",
        "flow_prompt": "English prompt tailored for Google Flow Veo 3.1..."
      }
    ],
    "editing_guide": [
      "ขั้นตอนตัดต่อ 1...",
      "ขั้นตอนตัดต่อ 2...",
      "ขั้นตอนตัดต่อ 3..."
    ],
    "full_voiceover_script": "บทพากย์รวมทั้งคลิป"
  },
  "photo_blueprint": {
    "photo_style": "สไตล์ภาพและแสง",
    "shots": [
      {
        "shot_number": 1,
        "role": "ภาพปก / Hook",
        "angle_and_framing": "มุมกล้องและการจัดวาง",
        "lighting_and_props": "แสงและรายละเอียดในภาพ",
        "text_overlay": "ข้อความพาดหัวบนรูป",
        "image_prompt": "English prompt for Google Flow Image / Imagen..."
      }
    ]
  },
  "social_caption": "แคปชันพร้อมโพสต์ มี Hook + เนื้อหา + คำถามชวนคอมเมนต์",
  "hashtags": ["#แฮชแท็ก1", "#แฮชแท็ก2", "#แฮชแท็ก3", "#แฮชแท็ก4", "#แฮชแท็ก5"]
}`;

    const userPrompt = `คำขอ: "${prompt.trim()}"
โหมดการผลิต: ${isAiFlow ? "เน้นเจนด้วย AI ใน Google Flow ทั้งหมด 100% (คนเดียวทำจบที่หน้าคอม)" : "ถ่ายทำเอง + ตัดต่อ"}
รูปแบบ: ${format === "VIDEO" ? "วิดีโอสั้น (4 ฉาก ฉากละ 5-8 วิ)" : format === "PHOTO" ? "ภาพนิ่ง/อัลบั้ม (3-4 ภาพ)" : "จัดเต็มทั้งวิดีโอ (4 ฉาก) และภาพนิ่ง (3 ภาพ)"}
สัดส่วนภาพ: ${aspectRatio}
การใส่กระแส/มีม: ${includeTrends ? "ใส่ลูกเล่น Hook หยุดนิ้ว + อ้างอิงมุก/มีม/เทรนด์ไวรัลร่วมสมัยของไทยให้คนอยากดูจบและแชร์ต่อ" : "เน้นเล่าเรื่องตรงไปตรงมา"}
แพลตฟอร์ม: ${platform}`;

    const aiRes = await executeAIFailoverChain({
      systemInstruction,
      prompt: userPrompt,
      workflow: "Easy AI Flow Content Creator",
      responseSchema: true,
      reasoningEffort: "high"
    });

    if (aiRes.data && typeof aiRes.data === "object") {
      return NextResponse.json({
        success: true,
        blueprint: aiRes.data,
        meta: {
          modelUsed: aiRes.modelUsed,
          providerUsed: aiRes.providerUsed,
          isFailover: aiRes.isFailover
        }
      });
    }

    // Fallback tailored for Solo AI Flow Creator
    const fallbackBlueprint = {
      title: `คอนเทนต์ AI Flow: ${prompt.trim()}`,
      hook_3sec: `เปิดด้วยภาพหักมุม/ภาพสวยอลังการทันทีใน 2 วินาทีแรก พร้อมคำถามกระตุกต่อมอยากรู้เกี่ยวกับ "${prompt.trim()}"`,
      viral_meme_angle: "ใช้จังหวะเล่าเรื่องแบบกระชับ ใส่ลูกเล่น Contrast (ก่อน-หลัง หรือ มุมมองคาดไม่ถึง) ที่คนดูใน TikTok/Reels ชอบแชร์",
      concept: `สร้างคลิปสั้น ${aspectRatio} ด้วย Google Flow 4 ฉากต่อเนื่อง เล่าเรื่อง "${prompt.trim()}" ให้ดูโปรเหมือนทีมโปรดักชันใหญ่`,
      flow_setup_guide: {
        tool_mode: "Text to Video (ฉาก 1) → Frames to Video (ฉาก 2-4)",
        aspect_ratio: aspectRatio,
        recommended_model: "Veo 3.1 - Fast",
        quick_steps: [
          "1. เปิด Google Flow → กด + New Project",
          `2. กดเลือกสัดส่วน ${aspectRatio} และโมเดล Veo 3.1 - Fast`,
          "3. ก๊อป Prompt ของฉากที่ 1 ไปวางในช่อง Describe your video แล้วกด Generate",
          "4. ฉากถัดไปให้ก๊อป Prompt มาวางต่อ หรือแคปเฟรมสุดท้ายของฉากก่อนหน้ามาใส่ในโหมด Frames to Video เพื่อความต่อเนื่อง"
        ]
      },
      video_blueprint: {
        total_duration_sec: 24,
        scene_count: 4,
        mood_and_music: "เพลงจังหวะสนุกหรือ Cinematic Beat ที่มีจังหวะกระตุกตอนวินาทีที่ 3",
        scenes: [
          {
            scene_number: 1,
            duration_sec: 6,
            flow_mode: "Text to Video",
            what_to_shoot: `ภาพเปิดดึงดูดสายตาเกี่ยวกับ "${prompt.trim()}"`,
            camera_angle: "Wide cinematic push-in",
            continuity_note: "เปิดให้เห็นตัวแบบและบรรยากาศชัด เพื่อต่อเข้าสู่ฉากที่ 2",
            voiceover_text: `เคยสงสัยไหมครับว่า ${prompt.trim()} ถ้าทำให้ปังต้องเริ่มยังไง? ดูนี่!`,
            on_screen_text: "หยุดดูก่อน! 👇",
            flow_prompt: `Cinematic wide angle slow push-in shot of ${prompt.trim()}, dramatic golden hour sunlight, ultra detailed, ${aspectRatio} vertical framing, photorealistic 4k, no text, no watermark`
          },
          {
            scene_number: 2,
            duration_sec: 6,
            flow_mode: "Frames to Video / Text to Video",
            what_to_shoot: "ซูมเข้าไฮไลต์หลักหรือจุดหักมุมที่น่าสนใจที่สุด",
            camera_angle: "Close-up dynamic orbit",
            continuity_note: "คุมโทนแสงและสีต่อเนื่องจากฉาก 1",
            voiceover_text: "จุดที่คนส่วนใหญ่พลาด แต่มุมนี้คือทีเด็ดที่ทำให้ภาพดูแพงขึ้นทันที",
            on_screen_text: "ทีเด็ดอยู่ตรงนี้ ✨",
            flow_prompt: `Dynamic close-up orbit shot focusing on key details of ${prompt.trim()}, shallow depth of field, glowing warm highlights, ${aspectRatio} vertical video, 4k cinematic, no text, no watermark`
          },
          {
            scene_number: 3,
            duration_sec: 6,
            flow_mode: "Text to Video",
            what_to_shoot: "มุมมอง POV หรือบรรยากาศความรู้สึกที่กำลังอิน",
            camera_angle: "Eye-level smooth tracking",
            continuity_note: "เร่งอารมณ์ให้คนดูอยากรู้ผลลัพธ์ตอนจบ",
            voiceover_text: "พอจัดองค์ประกอบแบบนี้ปุ๊บ ฟีลลิ่งมันได้เลยใช่ไหมครับ",
            on_screen_text: "ฟีลดีเกินต้าน 🔥",
            flow_prompt: `Smooth eye-level tracking shot experiencing ${prompt.trim()}, immersive atmosphere, natural motion, ${aspectRatio} vertical framing, photorealistic 4k, no text`
          },
          {
            scene_number: 4,
            duration_sec: 6,
            flow_mode: "Text to Video",
            what_to_shoot: "ภาพปิดสรุปสุดประทับใจ",
            camera_angle: "Slow dolly out reveal",
            continuity_note: "จบด้วยภาพกว้างที่สวยที่สุดเพื่อปิดคลิป",
            voiceover_text: "ใครชอบไอเดียนี้ เซฟเก็บไว้ลองทำตามกันดูได้เลยครับ!",
            on_screen_text: "เซฟเก็บไว้เลย 📌",
            flow_prompt: `Slow dolly out grand reveal shot of ${prompt.trim()}, uplifting warm sunlight flare, ${aspectRatio} vertical framing, 4k photorealistic, no text`
          }
        ],
        editing_guide: [
          "1. นำคลิปทั้ง 4 ฉากจาก Google Flow มาเรียงใน CapCut (ตัดส่วนหัว/ท้ายที่นิ่งเกินไปออก)",
          "2. ใส่เสียงพากย์ + เสียงเอฟเฟกต์ 'Whoosh' ตอนเปลี่ยนฉาก",
          "3. ใส่ตัวหนังสือพาดหัวใหญ่ๆ ใน 3 วิแรกตรงกลางจอเพื่อให้คนหยุดดู"
        ],
        full_voiceover_script: `เคยสงสัยไหมครับว่า ${prompt.trim()} ถ้าทำให้ปังต้องเริ่มยังไง? ดูนี่! จุดที่คนส่วนใหญ่พลาด แต่มุมนี้คือทีเด็ดที่ทำให้ภาพดูแพงขึ้นทันที พอจัดองค์ประกอบแบบนี้ปุ๊บ ฟีลลิ่งมันได้เลยใช่ไหมครับ ใครชอบไอเดียนี้ เซฟเก็บไว้ลองทำตามกันดูได้เลยครับ!`
      },
      photo_blueprint: {
        photo_style: "Cinematic Editorial AI Look",
        shots: [
          {
            shot_number: 1,
            role: "ภาพปกหยุดนิ้ว (Hook Cover)",
            angle_and_framing: "มุมมองระดับสายตา เน้นจุดเด่นกลางภาพ",
            lighting_and_props: "แสงธรรมชาติเข้าด้านข้าง มีมิติชัด",
            text_overlay: `${prompt.trim()} ✨`,
            image_prompt: `Editorial high-end photo of ${prompt.trim()}, dramatic studio and natural lighting, ${aspectRatio} framing, 8k photorealistic, no text`
          }
        ]
      },
      social_caption: `✨ ${prompt.trim()}\n\nใครกำลังหาไอเดียทำคอนเทนต์แบบคนเดียวจบในไม่กี่นาที ลองเอาสูตรนี้ไปเจนใน Google Flow ดูนะครับ 🔥\n\nชอบฉากไหนสุด คอมเมนต์บอกกันหน่อย 👇`,
      hashtags: ["#AIContent", "#GoogleFlow", "#ทำคลิปคนเดียว", "#คอนเทนต์ครีเอเตอร์", "#ไวรัล"]
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
