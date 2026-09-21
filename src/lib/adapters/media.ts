import { db } from "@/lib/db";

export interface ImageGenerationParams {
  prompt: string;
  negative_prompt?: string;
  aspect_ratio: string;
  style?: string;
}

export interface ImageGeneratorResult {
  success: boolean;
  provider: string;
  status: "CONNECTED" | "NOT_CONNECTED" | "ERROR";
  image_url?: string;
  message: string;
}

export const mediaAdapter = {
  async generateImage(params: ImageGenerationParams): Promise<ImageGeneratorResult> {
    const settings = db.getSettings();
    if (settings.image_gen_provider === "NONE") {
      return {
        success: false,
        provider: "None",
        status: "NOT_CONNECTED",
        message: "Image Generator API is not connected. Prompt generated for Midjourney / Stable Diffusion / Imagen. Copy prompt to use in your external generator."
      };
    }

    return {
      success: false,
      provider: settings.image_gen_provider,
      status: "NOT_CONNECTED",
      message: `Provider ${settings.image_gen_provider} credentials not verified. Please configure API keys in Settings.`
    };
  }
};
