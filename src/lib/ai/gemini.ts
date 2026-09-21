import { executeAIFailoverChain, AIResponseResult, isQuotaExhaustedError } from "./failover-engine";

export { isQuotaExhaustedError };

export interface GeminiCallOptions {
  systemInstruction?: string;
  prompt: string;
  workflow: string;
  reasoningEffort?: "high" | "low";
  responseSchema?: any;
  apiKey?: string;
  model?: string;
}

export async function callGemini(options: GeminiCallOptions): Promise<{
  text: string;
  data?: any;
  usage?: any;
  modelUsed?: string;
  providerUsed?: string;
  isFailover?: boolean;
  failoverReason?: string;
}> {
  const result: AIResponseResult = await executeAIFailoverChain({
    systemInstruction: options.systemInstruction,
    prompt: options.prompt,
    workflow: options.workflow,
    reasoningEffort: options.reasoningEffort,
    responseSchema: !!options.responseSchema,
    preferredEngine: "gemini",
    preferredModel: options.model,
    apiKey: options.apiKey
  });

  return {
    text: result.text,
    data: result.data,
    usage: result.usage,
    modelUsed: result.modelUsed,
    providerUsed: result.providerUsed,
    isFailover: result.isFailover,
    failoverReason: result.failoverReason
  };
}

