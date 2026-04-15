import { describe, expect, it } from "vitest";
import { invokeLLM } from "./llm";

describe("LLM Integration", () => {
  it("should successfully invoke Groq LLM with a simple prompt", async () => {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond briefly.",
        },
        {
          role: "user",
          content: "Say 'Jarvis is ready' and nothing else.",
        },
      ],
    });

    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0]?.message?.content).toBeDefined();
    expect(response.choices[0]?.message?.content).toContain("Jarvis");
  });

  it("should handle structured JSON responses", async () => {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a JSON generator. Output valid JSON only.",
        },
        {
          role: "user",
          content: 'Generate a simple JSON object with {"status": "ready"}',
        },
      ],
    });

    expect(response).toBeDefined();
    expect(response.choices[0]?.message?.content).toBeDefined();
    const content = response.choices[0]?.message?.content || "";
    expect(content.toLowerCase()).toContain("ready");
  });
});
