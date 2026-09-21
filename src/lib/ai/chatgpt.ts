import { executeAIFailoverChain, AIResponseResult } from "./failover-engine";

export interface ChatGPTCallOptions {
  systemInstruction?: string;
  prompt: string;
  workflow: string;
  responseSchema?: boolean;
}

export async function callChatGPT(options: ChatGPTCallOptions): Promise<{
  text: string;
  data?: any;
  providerUsed?: string;
  modelUsed?: string;
  isFailover?: boolean;
  failoverReason?: string;
}> {
  const defaultSystem = options.systemInstruction || 
    "You are ChatGPT (GPT-4o), a world-class automotive and lifestyle marketing strategist, persuasive copywriter, and expert AI prompt engineer. You craft compelling, high-converting Thai marketing copy and detailed photorealistic 8k English prompts for Imagen 3 and Midjourney. Return strictly valid JSON.";

  const result: AIResponseResult = await executeAIFailoverChain({
    systemInstruction: defaultSystem,
    prompt: options.prompt,
    workflow: options.workflow,
    responseSchema: options.responseSchema,
    preferredEngine: "chatgpt"
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

