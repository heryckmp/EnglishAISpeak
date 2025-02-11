import { LocalLLMClient } from "./local-llm-client";
import type { ChatConfig, ChatResponse } from "@/lib/types/chat";

export abstract class BaseAIService {
  protected client: LocalLLMClient;
  protected defaultConfig: ChatConfig = {
    temperature: 0.7,
    maxTokens: 500,
    topP: 0.95,
    repetitionPenalty: 1.1,
  };

  constructor() {
    this.client = new LocalLLMClient();
  }

  protected async generateResponse(prompt: string, config?: ChatConfig): Promise<string> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const response = await this.client.generateText(prompt, finalConfig);
    return response.text;
  }

  protected abstract formatPrompt(messages: Array<{ role: string; content: string }>): string;
} 