// ─────────────────────────────────────────────────────────────
// Model Adapter Factory — Mission Control AI / Ideoryx
// ─────────────────────────────────────────────────────────────

import type { ModelAdapter, ModelRequest, ModelResponse } from "./types";
import { GeminiModelAdapter } from "./adapters/gemini.adapter";

/**
 * Placeholder adapter that echoes back a JSON skeleton.
 * Used in tests or when no vendor API key is configured.
 */
export class PlaceholderModelAdapter implements ModelAdapter {
  async generate(params: ModelRequest): Promise<ModelResponse> {
    console.log("[PlaceholderModelAdapter] System prompt length:", params.systemPrompt.length);
    console.log("[PlaceholderModelAdapter] User prompt length:", params.userPrompt.length);

    return {
      raw: JSON.stringify({
        _placeholder: true,
        _message: "This is a placeholder response. Set GEMINI_API_KEY to get actual AI outputs.",
        _systemPromptPreview: params.systemPrompt.slice(0, 100),
      }),
      parsed: {
        _placeholder: true,
        _message: "This is a placeholder response. Set GEMINI_API_KEY to get actual AI outputs.",
      },
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }
}

/**
 * Factory function for creating a model adapter.
 * Selects between Gemini, OpenAI, or placeholder based on environment.
 */
export function createModelAdapter(): ModelAdapter {
  const provider = process.env.LLM_PROVIDER || "gemini";

  if (process.env.GEMINI_API_KEY || provider === "gemini") {
    if (process.env.GEMINI_API_KEY) {
      return new GeminiModelAdapter();
    }
  }

  return new PlaceholderModelAdapter();
}
