import { BaseAIService } from "./base-ai-service";
import { createSystemPrompt, createConversationContext, type EnglishLevel } from "@/lib/prompts/english-training";
import type { ChatMessage, ChatConfig, ChatResponse } from "@/lib/types/chat";

export class ChatService extends BaseAIService {
  constructor() {
    super();
  }

  protected override formatPrompt(messages: ChatMessage[]): string {
    return messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  }

  async startConversation(
    topic: string,
    level: EnglishLevel = "intermediate",
    config?: ChatConfig
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: createSystemPrompt(level)
      },
      {
        role: "user",
        content: createConversationContext(topic, level)
      }
    ];

    const prompt = this.formatPrompt(messages);
    const response = await this.generateResponse(prompt, config);
    return response;
  }

  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[],
    config?: ChatConfig
  ): Promise<string> {
    const messages: ChatMessage[] = [
      ...conversationHistory,
      { role: "user", content: message }
    ];

    const prompt = this.formatPrompt(messages);
    const response = await this.generateResponse(prompt, config);
    return response;
  }
} 