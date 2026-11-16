import { NextResponse } from "next/server";
import { executeAIFailoverChain } from "@/lib/ai/failover-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, format = "BOTH", platform = "Reels / TikTok / Facebook" } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ success: false, error: "กรุณาพิมพ์สิ่งที่อยากทำคอนเทนต์ก่อนครับ" }, { status: 400 });
    }

    const systemInstruction = `คุณคือ "ผู้กำกับคอนเทนต์และนักการตลาดมืออาชีพ" ที่ช่วยคนทำงานจริงในชีวิตประจำวัน
ผู้ใช้จะพิมพ์คำสั่งด้วยภาษาง่ายๆ ธรรมดา (เช่น "ช่วยคิดคอนเท้นไปเที่ยววัดให้หน่อย" หรือ "อยากถ่ายรูปรถใหม่ลงเพจ")
หน้าที่ของคุณคือ "ถอดสูตรคอนเทนต์ให้ครบจบแบบจับมือทำ" โดยใช้ภาษาไทยที่เข้าใจง่าย อ่านปุ๊บถ่ายทำและตัดต่อตามได้ทันที และเตรียม Prompt ภาษาอังกฤษคุณภาพสูงไว้ให้ก๊อปปี้ไปใช้กับ Google Flow / AI Image ได้เลย

ต้องตอบกลับเป็น JSON ที่ถูกต้องตามโครงสร้างนี้เท่านั้น (ห้ามมีข้อความอื่นนอก JSON):
{
  "title": "ชื่อโปรเจกต์คอนเทนต์สั้นๆ น่าสนใจ",
  "concept": "สรุปไอเดียหลัก 1-2 ประโยค ว่าทำไมคอนเทนต์นี้ถึงดึงดูดคนดู",
  "video_blueprint": {
    "total_duration_sec": 20,
    "scene_count": 4,
    "mood_and_music": "คำแนะนำแนวเพลงประกอบและจังหวะอารมณ์",
    "scenes": [
      {
        "scene_number": 1,
        "duration_sec": 3,
        "what_to_shoot": "สิ่งที่ต้องถ่ายในฉากนี้แบบเข้าใจง่าย",
        "camera_angle": "มุมกล้องและการขยับกล้อง (เช่น มุมกว้าง เดินตามหลังช้าๆ)",
        "continuity_note": "การเชื่อมต่อไปยังฉากถัดไปให้ลื่นไหล",
        "voiceover_text": "บทพากย์เสียงสำหรับฉากนี้ (ภาษาพูดธรรมชาติ)",
        "on_screen_text": "ข้อความสั้นๆ ที่ควรขึ้นบนหน้าจอ",
        "flow_prompt": "Detailed English prompt for Google Flow / Veo 3.1 video generation including subject, camera movement, lighting, and 4k cinematic quality"
      }
    ],
    "editing_guide": [
      "ขั้นตอนที่ 1: วิธีเรียงคลิปและจังหวะการตัด (เช่น ตัดตามจังหวะกลองทุก 3 วิ)",
      "ขั้นตอนที่ 2: การใส่ Transition และปรับโทนสี",
      "ขั้นตอนที่ 3: การวางตำแหน่งตัวหนังสือและเสียงพากย์"
    ],
    "full_voiceover_script": "บทพากย์เสียงรวมทั้งคลิปตั้งแต่ต้นจนจบ อ่านต่อเนื่องได้ทันที"
  },
  "photo_blueprint": {
    "photo_style": "โทนสี แสง และบรรยากาศภาพรวมที่แนะนำ",
    "shots": [
      {
        "shot_number": 1,
        "role": "ภาพเปิด / Hook ดึงสายตา",
        "angle_and_framing": "มุมกล้อง ระยะภาพ และการจัดวางองค์ประกอบ",
        "lighting_and_props": "ทิศทางแสงและพร็อพ/ท่าทางที่แนะนำ",
        "text_overlay": "ข้อความพาดหัวบนภาพ (สั้น กระชับ)",
        "image_prompt": "Detailed English prompt for AI image generation, photorealistic, studio/natural lighting, composition"
      }
    ]
  },
  "social_caption": "แคปชันพร้อมโพสต์ลงโซเชียล มี Hook + เนื้อหา + คำชวนคุย/CTA",
  "hashtags": ["#แฮชแท็ก1", "#แฮชแท็ก2", "#แฮชแท็ก3", "#แฮชแท็ก4", "#แฮชแท็ก5"]
}`;

    const userPrompt = `คำขอของผู้ใช้: "${prompt.trim()}"
รูปแบบที่ต้องการ: ${format === "VIDEO" ? "เน้นวิดีโอคลิปสั้น (ใส่ video_blueprint ให้ละเอียด 4-5 ฉาก)" : format === "PHOTO" ? "เน้นภาพนิ่ง/อัลบั้ม (ใส่ photo_blueprint ให้ละเอียด 3-5 ภาพ)" : "จัดเต็มทั้งวิดีโอ (4 ฉาก) และภาพนิ่ง/อัลบั้ม (4 ภาพ)"}
แพลตฟอร์มเป้าหมาย: ${platform}

ถอดสูตรออกมาให้ใช้งานได้จริงในชีวิตประจำวัน อ่านง่าย ก๊อปปี้ไปถ่ายทำและวางใน Google Flow ได้ทันที`;

    const aiRes = await executeAIFailoverChain({
      systemInstruction,
      prompt: userPrompt,
      workflow: "Easy Content Creator",
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

    // Fallback blueprint if all AI providers fail
    const fallbackBlueprint = {
      title: `คอนเทนต์: ${prompt.trim()}`,
      concept: `เล่าเรื่อง "${prompt.trim()}" แบบเป็นกันเอง เข้าถึงง่าย เน้นภาพสวยและจังหวะที่กระชับใน 15-20 วินาทีแรกเพื่อหยุดนิ้วคนดู`,
      video_blueprint: {
        total_duration_sec: 18,
        scene_count: 4,
        mood_and_music: "เพลง Lo-fi / Acoustic สบายๆ หรือ Acoustic ไทยร่วมสมัย จังหวะปานกลาง",
        scenes: [
          {
            scene_number: 1,
            duration_sec: 3,
            what_to_shoot: `ภาพเปิดบรรยากาศหลักของ "${prompt.trim()}"`,
            camera_angle: "มุมกว้าง (Wide Shot) ค่อยๆ ดันกล้องเดินไปข้างหน้าช้าๆ (Slow Push-in)",
            continuity_note: "เปิดด้วยภาพรวมก่อน เพื่อเตรียมตัดเข้าสู่รายละเอียดในฉากที่ 2",
            voiceover_text: `วันนี้พามาดูบรรยากาศ ${prompt.trim()} แบบจัดเต็มกันครับ`,
            on_screen_text: `${prompt.trim()} ✨`,
            flow_prompt: `Cinematic wide angle slow push-in shot of ${prompt.trim()}, golden hour natural sunlight, warm inviting atmosphere, smooth gimbal movement, 4k photorealistic`
          },
          {
            scene_number: 2,
            duration_sec: 5,
            what_to_shoot: "เจาะจงรายละเอียดสำคัญหรือไฮไลต์หลัก",
            camera_angle: "มุมใกล้ (Close-up) แพนกล้องจากซ้ายไปขวาช้าๆ",
            continuity_note: "ใช้ทิศทางแสงและโทนสีเดียวกับฉาก 1 แล้วตัดจังหวะลงตัวตามบีทเพลง",
            voiceover_text: "ไฮไลต์สำคัญที่ห้ามพลาดเลยคือมุมนี้ บอกเลยว่าสวยและประทับใจมาก",
            on_screen_text: "จุดไฮไลต์ที่ห้ามพลาด 👇",
            flow_prompt: `Close-up cinematic panning shot highlighting key details of ${prompt.trim()}, shallow depth of field, soft bokeh background, warm sunlight, 4k`
          },
          {
            scene_number: 3,
            duration_sec: 5,
            what_to_shoot: "มุมมองบุคคลที่ 1 (POV) หรืออารมณ์ความรู้สึกขณะใช้งาน/สัมผัสบรรยากาศ",
            camera_angle: "ระดับสายตา (Eye-level POV) ขยับกล้องนุ่มนวล",
            continuity_note: "เชื่อมจากจุดไฮไลต์มาสู่ประสบการณ์จริงของคนดู",
            voiceover_text: "บรรยากาศดีมาก เหมาะกับการมาพักผ่อนหรือทำกิจกรรมสุดๆ",
            on_screen_text: "ฟีลดีมาก 10/10",
            flow_prompt: `First-person POV walking shot experiencing ${prompt.trim()}, natural ambient lighting, authentic candid mood, smooth motion, 4k`
          },
          {
            scene_number: 4,
            duration_sec: 5,
            what_to_shoot: "ภาพปิดสรุปความประทับใจ พร้อมรอยยิ้มหรือมุมสวยที่สุด",
            camera_angle: "ถอยกล้องออกช้าๆ (Slow Dolly Out) หรือมุมสูงเล็กน้อย",
            continuity_note: "เฟดเสียงเพลงลงเล็กน้อยตอนจบคลิป",
            voiceover_text: "ใครมีแพลนกำลังหาไอเดียนี้อยู่ เซฟคลิปนี้เก็บไว้ได้เลยครับ!",
            on_screen_text: "เซฟเก็บไว้เลย! 📌",
            flow_prompt: `Slow dolly out concluding shot of ${prompt.trim()}, serene uplifting atmosphere, golden sunlight flare, 4k cinematic`
          }
        ],
        editing_guide: [
          "1. ตัดแต่ละคลิปให้กระชับตามเวลา (3-5 วินาที/ฉาก) อย่าแช่ภาพนิ่งนานเกินไป",
          "2. ใช้ Cross Dissolve สั้นๆ 0.2 วินาที หรือ Cut ชนจังหวะบีทเพลง",
          "3. วางตัวหนังสือไว้ช่วงกลางค่อนล่าง (Safe Zone) ไม่ให้ทับปุ่ม TikTok/Reels"
        ],
        full_voiceover_script: `วันนี้พามาดูบรรยากาศ ${prompt.trim()} แบบจัดเต็มกันครับ ไฮไลต์สำคัญที่ห้ามพลาดเลยคือมุมนี้ บอกเลยว่าสวยและประทับใจมาก บรรยากาศดีมาก เหมาะกับการมาพักผ่อนหรือทำกิจกรรมสุดๆ ใครมีแพลนกำลังหาไอเดียนี้อยู่ เซฟคลิปนี้เก็บไว้ได้เลยครับ!`
      },
      photo_blueprint: {
        photo_style: "โทนอุ่น สว่าง สะอาดตา ใช้แสงธรรมชาติ",
        shots: [
          {
            shot_number: 1,
            role: "ภาพปก (Cover / Hook)",
            angle_and_framing: "มุมกว้างระดับสายตา จัดวางจุดเด่นให้อยู่ตรงกลางหรือจุดตัด 9 ช่อง",
            lighting_and_props: "แสงธรรมชาติช่วงเช้าหรือบ่ายแก่ๆ เหลือพื้นที่ด้านบนไว้ใส่พาดหัว",
            text_overlay: `${prompt.trim()} ✨`,
            image_prompt: `Editorial lifestyle photography of ${prompt.trim()}, natural golden hour lighting, clean composition, 8k photorealistic`
          },
          {
            shot_number: 2,
            role: "ภาพเจาะรายละเอียด (Detail Shot)",
            angle_and_framing: "ถ่าย Close-up 45 องศา ละลายฉากหลังเล็กน้อย",
            lighting_and_props: "เน้นแสงเข้าด้านข้างให้เห็นพื้นผิวและมิติชัดเจน",
            text_overlay: "มุมดีเทลสวยๆ",
            image_prompt: `Close-up aesthetic detail photo of ${prompt.trim()}, soft natural window light, shallow depth of field, high detail`
          },
          {
            shot_number: 3,
            role: "ภาพบรรยากาศรวม (Atmosphere)",
            angle_and_framing: "มุมเสยเล็กน้อยให้เห็นความโปร่งโล่งและบรรยากาศโดยรอบ",
            lighting_and_props: "เก็บแสงและเงาให้ดูมีชีวิตชีวา",
            text_overlay: "บรรยากาศดีต่อใจ",
            image_prompt: `Wide atmospheric shot of ${prompt.trim()}, serene peaceful mood, crisp architectural and nature details, 8k`
          }
        ]
      },
      social_caption: `✨ ${prompt.trim()}\n\nรวมมุมสวยและไอเดียดีๆ ที่อยากแชร์ต่อ ใครกำลังมองหาแรงบันดาลใจ ลองเซฟโพสต์นี้เก็บไว้ใช้กันได้เลยนะครับ 📸🎬\n\nชอบมุมไหนที่สุด คอมเมนต์บอกกันหน่อยนะ 👇`,
      hashtags: ["#คอนเทนต์ครีเอเตอร์", "#ไอเดียถ่ายรูป", "#ทำคลิปสั้น", "#รีวิว", "#ไลฟ์สไตล์"]
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
