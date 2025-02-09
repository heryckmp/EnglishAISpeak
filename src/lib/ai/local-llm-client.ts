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
    
    // Verificar se o modelo está habilitado
    const modelConfig = config.llm.localModels[model];
    if (!modelConfig.enabled) {
      throw new Error(`Model ${model} is not enabled in configuration`);
    }
    
    this.apiUrl = modelConfig.apiUrl;
  }

  // Lista de modelos disponíveis
  static getAvailableModels() {
    const models: Record<string, boolean> = {};
    
    // Verificar cada modelo local
    Object.entries(config.llm.localModels).forEach(([model, config]) => {
      models[model] = config.enabled;
    });
    
    return models;
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
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 1000,
          top_p: options.top_p || 0.95,
          stop: options.stop,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Local LLM API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.choices[0].message.content,
        model: this.model,
      };
    } catch (error) {
      console.error(`Error calling local ${this.model} API:`, error);
      throw error;
    }
  }

  // Método para streaming de respostas
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
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 1000,
          top_p: options.top_p || 0.95,
          stop: options.stop,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Local LLM API error: ${error.message || response.statusText}`);
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
    } catch (error) {
      console.error(`Error streaming from local ${this.model} API:`, error);
      throw error;
    }
  }
}

export type { LocalLLMMessage, LocalLLMResponse, LocalLLMOptions }; 