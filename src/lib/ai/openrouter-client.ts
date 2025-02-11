interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  model: string;
}

interface OpenRouterOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export class OpenRouterClient {
  private apiKey: string | (() => string);
  private baseUrl: string = "https://openrouter.ai/api/v1";
  private defaultModel: string;

  constructor(apiKey: string | (() => string), defaultModel: string = "anthropic/claude-3-opus") {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  private getApiKey(): string {
    return typeof this.apiKey === "function" ? this.apiKey() : this.apiKey;
  }

  async chat(
    messages: OpenRouterMessage[],
    options: OpenRouterOptions = {}
  ): Promise<OpenRouterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getApiKey()}`,
        },
        body: JSON.stringify({
          messages,
          model: options.model || this.defaultModel,
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          top_p: options.top_p,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("OpenRouter chat error:", error);
      throw error;
    }
  }

  // Lista de modelos disponíveis
  static readonly AVAILABLE_MODELS = {
    "claude-3-opus": "anthropic/claude-3-opus",
    "claude-3-sonnet": "anthropic/claude-3-sonnet",
    "claude-2": "anthropic/claude-2",
    "gpt-4": "openai/gpt-4",
    "gpt-4-turbo": "openai/gpt-4-turbo",
    "gpt-3.5-turbo": "openai/gpt-3.5-turbo",
    "palm-2": "google/palm-2",
    "gemini-pro": "google/gemini-pro",
    "mixtral": "mistralai/mixtral-8x7b",
    "llama2": "meta/llama2-70b-chat",
  } as const;

  // Método para trocar o modelo padrão
  setDefaultModel(model: keyof typeof OpenRouterClient.AVAILABLE_MODELS) {
    this.defaultModel = OpenRouterClient.AVAILABLE_MODELS[model];
  }

  // Método para streaming de respostas
  async *streamChat(
    messages: OpenRouterMessage[],
    options: OpenRouterOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getApiKey()}`,
        },
        body: JSON.stringify({
          messages,
          model: options.model || this.defaultModel,
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          top_p: options.top_p,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk
          .split("\n")
          .filter((line) => line.trim().startsWith("data: "));

        for (const line of lines) {
          const data = JSON.parse(line.slice(6));
          if (data.choices?.[0]?.delta?.content) {
            yield data.choices[0].delta.content;
          }
        }
      }
    } catch (error) {
      console.error("OpenRouter stream chat error:", error);
      throw error;
    }
  }
}

export type { OpenRouterMessage, OpenRouterResponse, OpenRouterOptions }; 