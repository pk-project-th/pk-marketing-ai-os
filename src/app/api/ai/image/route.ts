import { NextResponse } from "next/server";
import { generateMarketingImage, generateCinematicVideoPrompt } from "@/lib/ai/image";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, prompt, concept, subject, topic, aspectRatio = "16:9", assetId, modelPreference } = body;

    if (action === "GENERATE_VIDEO_PROMPT") {
      const videoResult = generateCinematicVideoPrompt(concept || prompt || "Commercial Product Demo", subject || topic || "Product Showcase");
      return NextResponse.json({
        success: true,
        type: "VIDEO",
        ...videoResult
      });
    }

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ success: false, error: "Missing required 'prompt'" }, { status: 400 });
    }

    const result = await generateMarketingImage({
      prompt,
      aspectRatio,
      assetId,
      modelPreference
    });

    return NextResponse.json({
      success: true,
      type: "IMAGE",
      imageUrl: result.imageUrl,
      model: result.model,
      prompt: result.prompt
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
