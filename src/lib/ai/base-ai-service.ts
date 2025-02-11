import { LocalLLMClient } from "./local-llm-client";

export interface AIServiceConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  repetitionPenalty?: number;
}

export abstract class BaseAIService {
  protected client: LocalLLMClient;
  protected defaultConfig: AIServiceConfig = {
    temperature: 0.7,
    maxTokens: 500,
    topP: 0.95,
    repetitionPenalty: 1.1,
  };

  constructor() {
    this.client = new LocalLLMClient();
  }

  protected async generateResponse(prompt: string, config?: AIServiceConfig): Promise<string> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const response = await this.client.generateText(prompt, finalConfig);
    return response.text;
  }

  protected formatPrompt(messages: Array<{ role: string; content: string }>): string {
    return messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  }
} 