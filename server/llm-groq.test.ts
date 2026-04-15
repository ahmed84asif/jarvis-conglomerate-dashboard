import { describe, expect, it } from "vitest";
import { invokeGroq, invokeTogetherAi } from "./llm-groq";

describe("LLM Providers", () => {
  it("should successfully invoke Groq Llama 3.3 70B", async () => {
    const response = await invokeGroq([
      {
        role: "system",
        content: "You are a helpful assistant. Respond briefly.",
      },
      {
        role: "user",
        content: "Say 'Jarvis is ready' and nothing else.",
      },
    ]);

    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0]?.message?.content).toBeDefined();
    expect(response.choices[0]?.message?.content).toContain("Jarvis");
  });

  it("should successfully invoke Together AI Llama 3.3 70B", async () => {
    const response = await invokeTogetherAi([
      {
        role: "system",
        content: "You are a helpful assistant. Respond briefly.",
      },
      {
        role: "user",
        content: "Say 'Jarvis is ready' and nothing else.",
      },
    ]);

    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0]?.message?.content).toBeDefined();
    expect(response.choices[0]?.message?.content).toContain("Jarvis");
  });
});
