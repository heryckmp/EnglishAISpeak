export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  repetitionPenalty?: number;
}

export interface ChatResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
} 