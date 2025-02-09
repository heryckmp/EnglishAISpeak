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
  private apiKey: string;
  private baseUrl: string = "https://openrouter.ai/api/v1";
  private defaultModel: string = "anthropic/claude-3-opus";

  constructor(apiKey: string, defaultModel?: string) {
    this.apiKey = apiKey;
    if (defaultModel) {
      this.defaultModel = defaultModel;
    }
  }

  async chat(
    messages: OpenRouterMessage[],
    options: OpenRouterOptions = {}
  ): Promise<OpenRouterResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        "HTTP-Referer": `${process.env.NEXTAUTH_URL}`,
        "X-Title": "English AI Trainer"
      },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
        top_p: options.top_p || 0.95,
        stream: options.stream || false
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  // Lista de modelos disponíveis
  static readonly AVAILABLE_MODELS = {
    "claude-3-opus": "anthropic/claude-3-opus",
    "claude-3-sonnet": "anthropic/claude-3-sonnet",
    "claude-2": "anthropic/claude-2",
    "gpt-4": "openai/gpt-4",
    "gpt-4-turbo": "openai/gpt-4-turbo-preview",
    "gpt-3.5-turbo": "openai/gpt-3.5-turbo",
    "palm-2": "google/palm-2",
    "gemini-pro": "google/gemini-pro",
    "mixtral": "mistralai/mixtral-8x7b",
    "llama2": "meta-llama/llama-2-70b-chat"
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
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        "HTTP-Referer": `${process.env.NEXTAUTH_URL}`,
        "X-Title": "English AI Trainer"
      },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
        top_p: options.top_p || 0.95,
        stream: true
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.message || response.statusText}`);
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
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data);
            if (parsed.choices?.[0]?.delta?.content) {
              yield parsed.choices[0].delta.content;
            }
          } catch (e) {
            console.error("Failed to parse streaming response:", e);
          }
        }
      }
    }
  }
}

export type { OpenRouterMessage, OpenRouterResponse, OpenRouterOptions }; 