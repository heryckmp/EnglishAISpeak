import config from "@/lib/config";

interface LocalLLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface LocalLLMResponse {
  text: string;
  model: string;
}

interface LocalLLMOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stop?: string[];
}

export class LocalLLMClient {
  private model: "llama2" | "mistral" | "phi2";
  private apiUrl: string;

  constructor(model: "llama2" | "mistral" | "phi2") {
    this.model = model;
    switch (model) {
      case "llama2":
        this.apiUrl = process.env.LLAMA2_API_URL || "http://localhost:8000";
        break;
      case "mistral":
        this.apiUrl = process.env.MISTRAL_API_URL || "http://localhost:8001";
        break;
      case "phi2":
        this.apiUrl = process.env.PHI2_API_URL || "http://localhost:8002";
        break;
    }
  }

  static getAvailableModels() {
    return {
      llama2: process.env.ENABLE_LLAMA2 === "true",
      mistral: process.env.ENABLE_MISTRAL === "true",
      phi2: process.env.ENABLE_PHI2 === "true",
    };
  }

  async chat(
    messages: LocalLLMMessage[],
    options: LocalLLMOptions = {}
  ): Promise<LocalLLMResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          top_p: options.top_p,
          stop: options.stop,
        }),
      });

      if (!response.ok) {
        throw new Error(`Local LLM API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.choices[0].message.content,
        model: this.model,
      };
    } catch (error) {
      console.error("Local LLM chat error:", error);
      throw error;
    }
  }

  async *streamChat(
    messages: LocalLLMMessage[],
    options: LocalLLMOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          temperature: options.temperature,
          max_tokens: options.max_tokens,
          top_p: options.top_p,
          stop: options.stop,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Local LLM API error: ${response.statusText}`);
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
      console.error("Local LLM stream chat error:", error);
      throw error;
    }
  }
}

export type { LocalLLMMessage, LocalLLMResponse, LocalLLMOptions }; 