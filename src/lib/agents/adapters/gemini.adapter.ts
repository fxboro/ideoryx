// ─────────────────────────────────────────────────────────────
// Gemini Model Adapter — Mission Control AI / Ideoryx
// Integrates Google Gemini API with JSON structured output mode.
// ─────────────────────────────────────────────────────────────

import type { ModelAdapter, ModelRequest, ModelResponse } from "../types";

export class GeminiModelAdapter implements ModelAdapter {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    this.model = model || process.env.GEMINI_MODEL || "gemini-2.0-flash";
  }

  async generate(params: ModelRequest): Promise<ModelResponse> {
    if (!this.apiKey) {
      throw new Error("Missing GEMINI_API_KEY in environment variables.");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const payload = {
      system_instruction: {
        parts: [{ text: params.systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: params.userPrompt }],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: params.temperature ?? 0.7,
        maxOutputTokens: params.maxTokens ?? 4096,
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();

    const candidate = data.candidates?.[0];
    let rawText = candidate?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Gemini returned an empty response or was blocked by safety filters.");
    }

    // Strip optional markdown code fences if model enclosed JSON in ```json ... ```
    rawText = rawText.trim();
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      throw new Error(`Failed to parse Gemini output as JSON: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
    }

    const usageMetadata = data.usageMetadata;
    const usage = {
      promptTokens: usageMetadata?.promptTokenCount ?? 0,
      completionTokens: usageMetadata?.candidatesTokenCount ?? 0,
      totalTokens: usageMetadata?.totalTokenCount ?? 0,
    };

    return {
      raw: rawText,
      parsed,
      usage,
    };
  }
}
