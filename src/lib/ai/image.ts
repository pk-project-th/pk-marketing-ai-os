import { db } from "@/lib/db";

export interface ImageGenerationOptions {
  prompt: string;
  aspectRatio?: "16:9" | "1:1" | "9:16" | "4:3" | "3:4";
  negativePrompt?: string;
  assetId?: string;
  modelPreference?: "imagen" | "nano-banana" | "flux" | "flux-realism" | "turbo" | "auto";
}

export interface ImageGenerationResult {
  imageUrl: string;
  model: string;
  prompt: string;
  aspectRatio: string;
}

export interface VideoPromptResult {
  videoPrompt: string;
  cameraDirection: string;
  lightingAndMood: string;
  targetEngines: string[];
  sampleSceneTimeline: { time: string; visual: string; audio: string }[];
}

export function optimizeMarketingPrompt(rawPrompt: string): string {
  const cleanPrompt = rawPrompt.trim().replace(/^["']|["']$/g, "");
  const enhancements = [
    "commercial advertising photography",
    "professional studio lighting",
    "crystal clear details and textures",
    "shot on Hasselblad 100MP camera with 85mm prime lens",
    "photorealistic",
    "ultra high resolution 8k",
    "clean modern aesthetic composition",
    "perfect depth of field"
  ];
  return `${cleanPrompt}, ${enhancements.join(", ")}`;
}

export async function generateMarketingImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const settings = db.getSettings();
  const apiKey = process.env.GEMINI_API_KEY || settings.gemini_api_key;
  const aspectRatio = options.aspectRatio || "16:9";
  const enhancedPrompt = optimizeMarketingPrompt(options.prompt);

  let width = 1280;
  let height = 720;
  if (aspectRatio === "1:1") {
    width = 1024;
    height = 1024;
  } else if (aspectRatio === "9:16") {
    width = 720;
    height = 1280;
  } else if (aspectRatio === "4:3") {
    width = 1024;
    height = 768;
  } else if (aspectRatio === "3:4") {
    width = 768;
    height = 1024;
  }

  // Attempt 1: Google Nano Banana / Imagen 3 (via Google AI Studio Key)
  if (apiKey && (options.modelPreference === "nano-banana" || options.modelPreference === "imagen")) {
    try {
      // Attempt generateContent with Google image generation model
      const targetGoogleImgModel = options.modelPreference === "nano-banana" ? "gemini-2.5-flash-image" : "imagen-3.0-generate-002";
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetGoogleImgModel}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `High quality commercial product photo: ${enhancedPrompt}` }] }]
        })
      });

      if (response.ok) {
        const json = await response.json();
        const parts = json.candidates?.[0]?.content?.parts || [];
        const inlineImg = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));
        if (inlineImg?.inlineData?.data) {
          const dataUrl = `data:${inlineImg.inlineData.mimeType};base64,${inlineImg.inlineData.data}`;
          if (options.assetId) {
            db.updateAsset(options.assetId, { image_url: dataUrl } as any);
            db.updateIdea(options.assetId, { media_url: dataUrl, media_type: "IMAGE" });
          }
          return {
            imageUrl: dataUrl,
            model: options.modelPreference === "nano-banana" ? "Google Nano Banana Pro" : "Google Imagen 3",
            prompt: enhancedPrompt,
            aspectRatio
          };
        }
      } else {
        console.warn(`Google image API returned ${response.status}. Falling back to Flux 1.1 Pro High-Res Engine.`);
      }
    } catch (err) {
      console.warn("Google image generation failed, falling back to Flux 1.1 Pro:", err);
    }
  }

  // Attempt 2: Pollinations AI Visual Engine (Flux Pro / Flux Realism / Turbo)
  const pollModel = options.modelPreference === "flux-realism" 
    ? "flux-realism" 
    : options.modelPreference === "turbo" 
    ? "turbo" 
    : "flux";
  
  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(enhancedPrompt);
  const fluxUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${pollModel}&seed=${seed}&nologo=true`;

  if (options.assetId) {
    db.updateAsset(options.assetId, { image_url: fluxUrl } as any);
    db.updateIdea(options.assetId, { media_url: fluxUrl, media_type: "IMAGE" });
  }

  const modelLabel = options.modelPreference === "nano-banana"
    ? "Google Nano Banana Pro (สลับเป็น Flux 1.1 Pro สำรอง)"
    : options.modelPreference === "imagen"
    ? "Google Imagen 3 (สลับเป็น Flux 1.1 Pro สำรอง)"
    : options.modelPreference === "flux-realism"
    ? "Flux Realism High-Definition Engine"
    : "Flux 1.1 Pro Studio Visual Engine";

  db.logAudit("GENERATE_IMAGE", "CONTENT_ASSET", options.assetId || "temp", `Generated visual asset via ${modelLabel} (${aspectRatio})`);

  return {
    imageUrl: fluxUrl,
    model: modelLabel,
    prompt: enhancedPrompt,
    aspectRatio
  };
}

export function generateCinematicVideoPrompt(concept: string, subject: string = "Product Showcase"): VideoPromptResult {
  const prompt = `Cinematic 4K commercial advertisement footage featuring ${subject}. ${concept}. Dynamic stabilized camera movement, orbital tracking shot with shallow depth of field (f/1.8). Professional cinematic studio lighting with soft highlights and warm ambient bounce. 60fps slow motion, 2.39:1 anamorphic ratio, rich color grading, crisp textures and photorealistic details.`;

  return {
    videoPrompt: prompt,
    cameraDirection: `Dynamic orbital tracking shot moving smoothly around ${subject} at 60fps Slow Motion with shallow depth of field`,
    lightingAndMood: "Warm cinematic studio lighting with soft specular highlights and elegant ambient mood",
    targetEngines: ["Google Veo", "OpenAI Sora", "Runway Gen-3 Alpha", "Luma Dream Machine", "Kling AI"],
    sampleSceneTimeline: [
      { 
        time: "0:00 - 0:03", 
        visual: `Intriguing macro close-up of ${subject} highlighting craftsmanship and premium materials`, 
        audio: "Soft atmospheric ambient crescendo with crisp acoustic intro" 
      },
      { 
        time: "0:03 - 0:08", 
        visual: `Dynamic smooth camera pan showcasing ${subject} in full action and real-world environment`, 
        audio: "Energetic upbeat rhythm kicks in, voiceover introduces core hook" 
      },
      { 
        time: "0:08 - 0:15", 
        visual: `Hero wide shot with elegant on-screen promotional typography badge and call to action`, 
        audio: "Confident musical cadence concluding with compelling offer and CTA" 
      }
    ]
  };
}
