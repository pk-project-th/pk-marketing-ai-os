import { executeAIFailoverChain, AIResponseResult } from "./failover-engine";

export interface GroqCallOptions {
  systemInstruction?: string;
  prompt: string;
  workflow: string;
  responseSchema?: boolean;
  model?: string;
}

export async function callGroq(options: GroqCallOptions): Promise<{
  text: string;
  data?: any;
  providerUsed?: string;
  modelUsed?: string;
  isFailover?: boolean;
  failoverReason?: string;
}> {
  const defaultSystem = options.systemInstruction || 
    "You are Groq Cloud AI (Qwen / GPT-OSS), a high-speed world-class creative marketing strategist, persuasive copywriter, and expert AI prompt engineer. You craft compelling, high-converting Thai marketing copy and photorealistic visual prompts. Return strictly valid JSON.";

  const result: AIResponseResult = await executeAIFailoverChain({
    systemInstruction: defaultSystem,
    prompt: options.prompt,
    workflow: options.workflow,
    responseSchema: options.responseSchema,
    preferredEngine: "groq",
    preferredModel: options.model
  });

  return {
    text: result.text,
    data: result.data,
    providerUsed: result.providerUsed,
    modelUsed: result.modelUsed,
    isFailover: result.isFailover,
    failoverReason: result.failoverReason
  };
}
