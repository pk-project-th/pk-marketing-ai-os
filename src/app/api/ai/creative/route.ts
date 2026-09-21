import { NextResponse } from "next/server";
import { callGemini } from "@/lib/ai/gemini";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      contentType = "Automotive Commercial Photography",
      platform = "Instagram & Facebook Ad",
      aspectRatio = "16:9",
      visualStyle = "Cinematic Photorealistic Commercial",
      subject = "PK Sedan X, modern white hybrid sedan",
      environment = "Urban rooftop at sunset",
      mood = "Confident, Premium, Futuristic",
      lighting = "Golden hour warm sunlight",
      composition = "Three-quarter front view",
      camera = "Hasselblad H6D-100c, 50mm lens",
      negativeSpace = "30% clean space at top-right",
      sendToApproval = false
    } = body;

    const systemInstruction = `You are the Lead Creative Director and AI Visual Prompt Engineer for PK Marketing AI OS.
Your task is to generate professional, production-grade text-to-image prompts for Midjourney v6.1, Stable Diffusion XL, and Google Imagen 3, specifically for automotive and commercial marketing.
Adhere strictly to:
1. High-fidelity photography terminology (focal length, sensor, aperture, lighting direction, reflections).
2. Clean automotive geometry (no distorted headlights, wheels, or body seams).
3. Commercial layout considerations (adequate negative space for marketing typography).
Return ONLY a valid JSON object matching this schema:
{
  "prompt": "string",
  "negative_prompt": "string",
  "visual_notes": "string",
  "suggested_copy": "string"
}`;

    const promptText = `Generate an automotive visual prompt based on these parameters:
- Content Type: ${contentType}
- Platform: ${platform}
- Target Aspect Ratio: ${aspectRatio}
- Visual Style: ${visualStyle}
- Subject: ${subject}
- Environment: ${environment}
- Mood: ${mood}
- Lighting: ${lighting}
- Composition: ${composition}
- Camera & Lens: ${camera}
- Negative Space Requirement: ${negativeSpace}

Ensure the prompt ends with standard Midjourney flags such as --ar ${aspectRatio} --style raw --v 6.1`;

    let generated: {
      prompt: string;
      negative_prompt: string;
      visual_notes: string;
      suggested_copy: string;
    } | null = null;

    try {
      const aiRes = await callGemini({
        systemInstruction,
        prompt: promptText,
        workflow: "Creative Visual Prompt Generation",
        reasoningEffort: "high",
        responseSchema: true
      });

      if (aiRes.data && aiRes.data.prompt) {
        generated = aiRes.data;
      }
    } catch (apiErr) {
      console.warn("Creative prompt AI API call failed or quota exhausted, falling back to heuristic engine:", apiErr);
    }

    if (!generated) {
      // Heuristic fallback matching parameters
      const fullPrompt = `Award-winning commercial automotive photography of ${subject}, set in ${environment}. Lighting: ${lighting} with authentic specular reflections on the body panels. Atmosphere: ${mood}. Composition: ${composition}, with ${negativeSpace} engineered for advertising typography overlay. Shot on ${camera}. Hyper-detailed metallic paint texture, photorealistic reflections, 8k resolution, color graded in DaVinci Resolve --ar ${aspectRatio} --style raw --v 6.1`;
      const negativePrompt = "blurry, distorted headlights, warped grille, unrealistic reflections, cartoon, 3d render plastic sheen, extra wheels, oversaturated colors, text watermark, cropped bumper, low resolution";
      
      generated = {
        prompt: fullPrompt,
        negative_prompt: negativePrompt,
        visual_notes: `Visual configured for ${platform} (${aspectRatio}). Preserves ${negativeSpace} for headline text overlay.`,
        suggested_copy: "THE NEW STANDARD OF HYBRID ELEGANCE — PK SEDAN X"
      };
    }

    let approvalItem = null;
    if (sendToApproval) {
      approvalItem = db.createApproval({
        title: `[PROMPT] ${subject.slice(0, 45)} (${aspectRatio})`,
        entity_type: "CREATIVE_PROMPT",
        content_preview: `Prompt:\n${generated.prompt}\n\nNegative Prompt:\n${generated.negative_prompt}\n\nSuggested Copy: ${generated.suggested_copy}`,
        source: "Creative Studio Agent",
        confidence: "HIGH",
        recommended_action: "ตรวจสอบพารามิเตอร์ด้านภาพและส่งต่อให้ทีมโปรดักชัน / เครื่องมือ AI",
        warnings: [
          "ตรวจสอบว่ามุมมองตัวรถและสเปกไม่ขัดแย้งกับคู่มือผลิตภัณฑ์",
          "ตรวจสัดส่วนภาพให้ตรงกับแพลตฟอร์มปลายทางก่อนนำไปสร้างรูป"
        ]
      });

      db.logAudit(
        "QUEUE_CREATIVE_PROMPT",
        "APPROVAL",
        approvalItem.id,
        `Sent creative prompt for '${subject}' to Approval Center`,
        "Creative Studio"
      );
    }

    return NextResponse.json({
      success: true,
      data: generated,
      approval: approvalItem
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
