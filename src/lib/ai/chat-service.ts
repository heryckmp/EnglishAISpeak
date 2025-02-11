import { BaseAIService, AIServiceConfig } from "./base-ai-service";
import { createSystemPrompt, createConversationContext, type EnglishLevel } from "@/lib/prompts/english-training";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

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
    config?: AIServiceConfig
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
    return this.generateResponse(prompt, config);
  }

  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[],
    config?: AIServiceConfig
  ): Promise<string> {
    const messages: ChatMessage[] = [
      ...conversationHistory,
      { role: "user" as const, content: message }
    ];

    const prompt = this.formatPrompt(messages);
    return this.generateResponse(prompt, config);
  }
} 