import { ENV } from "./_core/env";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GroqResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

/**
 * Invoke Groq Llama 3.3 70B model for fast inference
 */
export async function invokeGroq(messages: Message[]): Promise<GroqResponse> {
  if (!ENV.groqApiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENV.groqApiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  return (await response.json()) as GroqResponse;
}

/**
 * Invoke Together AI as fallback LLM
 */
export async function invokeTogetherAi(messages: Message[]): Promise<GroqResponse> {
  if (!ENV.togetherAiApiKey) {
    throw new Error("TOGETHER_AI_API_KEY is not configured");
  }

  const response = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENV.togetherAiApiKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/Llama-3.3-70b-Instruct-Turbo",
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Together AI error: ${response.status} - ${error}`);
  }

  return (await response.json()) as GroqResponse;
}

/**
 * Invoke LLM with automatic fallback
 * Tries Groq first, falls back to Together AI if needed
 */
export async function invokeLLMWithFallback(messages: Message[]): Promise<GroqResponse> {
  try {
    return await invokeGroq(messages);
  } catch (error) {
    console.warn("Groq failed, attempting Together AI fallback:", error);
    try {
      return await invokeTogetherAi(messages);
    } catch (fallbackError) {
      console.error("Both LLM providers failed:", fallbackError);
      throw new Error("All LLM providers failed");
    }
  }
}
