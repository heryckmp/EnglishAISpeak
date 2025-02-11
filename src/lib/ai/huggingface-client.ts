export interface TextGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  repetitionPenalty?: number;
}

export interface TextGenerationResponse {
  text: string;
}

export class LocalLLMClient {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.LLM_API_URL || "http://localhost:8000";
  }

  async generateText(
    prompt: string,
    options: TextGenerationOptions = {}
  ): Promise<TextGenerationResponse> {
    const response = await fetch(`${this.apiUrl}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        max_new_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.95,
        repetition_penalty: options.repetitionPenalty || 1.1,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `LLM API error: ${response.status} ${response.statusText}\n${
          error.error || ""
        }`
      );
    }

    const result = await response.json();
    return {
      text: result.text || "",
    };
  }
} 