import { OpenRouterClient, type OpenRouterMessage } from "./openrouter-client";
import { LocalLLMClient, type LocalLLMMessage } from "./local-llm-client";
import config from "@/lib/config";

interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
  onStream?: (content: string) => void;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

type LLMProvider = "openrouter" | "local" | "openai";

export class ChatService {
  private openRouterClient?: OpenRouterClient;
  private localClient?: LocalLLMClient;
  private provider: LLMProvider;
  private currentModel: string;

  constructor() {
    this.provider = config.llm.provider;
    this.currentModel = "claude-3-opus";

    if (this.provider === "openrouter") {
      this.openRouterClient = new OpenRouterClient(
        config.openrouter.apiKey,
        config.openrouter.defaultModel
      );
    } else if (this.provider === "local") {
      if (config.llm.localModels.llama2.enabled) {
        this.localClient = new LocalLLMClient("llama2");
      } else if (config.llm.localModels.mistral.enabled) {
        this.localClient = new LocalLLMClient("mistral");
      } else if (config.llm.localModels.phi2.enabled) {
        this.localClient = new LocalLLMClient("phi2");
      }
    }
  }

  // Obter lista de modelos disponíveis
  getAvailableModels() {
    if (this.provider === "openrouter") {
      return OpenRouterClient.AVAILABLE_MODELS;
    } else if (this.provider === "local") {
      return LocalLLMClient.getAvailableModels();
    }
    return {};
  }

  // Trocar o modelo atual
  setModel(model: string) {
    this.currentModel = model;
    if (this.provider === "openrouter" && this.openRouterClient) {
      this.openRouterClient.setDefaultModel(model);
    }
  }

  // Enviar mensagem e receber resposta
  async sendMessage(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<string> {
    try {
      if (this.provider === "openrouter" && this.openRouterClient) {
        if (options.streaming && options.onStream) {
          let fullResponse = "";
          for await (const chunk of this.openRouterClient.streamChat(
            messages as OpenRouterMessage[],
            {
              model: options.model || this.currentModel,
              temperature: options.temperature,
              max_tokens: options.maxTokens,
              stream: true,
            }
          )) {
            fullResponse += chunk;
            options.onStream(chunk);
          }
          return fullResponse;
        } else {
          const response = await this.openRouterClient.chat(
            messages as OpenRouterMessage[],
            {
              model: options.model || this.currentModel,
              temperature: options.temperature,
              max_tokens: options.maxTokens,
            }
          );
          return response.choices[0].message.content;
        }
      } else if (this.provider === "local" && this.localClient) {
        if (options.streaming && options.onStream) {
          let fullResponse = "";
          for await (const chunk of this.localClient.streamChat(
            messages as LocalLLMMessage[],
            {
              temperature: options.temperature,
              max_tokens: options.maxTokens,
            }
          )) {
            fullResponse += chunk;
            options.onStream(chunk);
          }
          return fullResponse;
        } else {
          const response = await this.localClient.chat(
            messages as LocalLLMMessage[],
            {
              temperature: options.temperature,
              max_tokens: options.maxTokens,
            }
          );
          return response.text;
        }
      }
      throw new Error("No valid LLM provider configured");
    } catch (error) {
      console.error("Chat service error:", error);
      throw error;
    }
  }

  // Gerar prompt do sistema para o contexto de ensino de inglês
  generateSystemPrompt(level: string = "intermediate"): string {
    const prompts = {
      beginner: `You are a patient and supportive English tutor helping a beginner student. Use simple vocabulary and basic grammar structures. Provide gentle corrections and lots of encouragement.`,
      intermediate: `You are an English tutor helping an intermediate student improve their language skills. Use natural conversation while providing corrections for grammar and vocabulary when needed.`,
      advanced: `You are an English tutor working with an advanced student. Use sophisticated vocabulary and complex grammar structures. Focus on nuanced corrections and idiomatic expressions.`,
    };
    return prompts[level as keyof typeof prompts] || prompts.intermediate;
  }

  // Método específico para chat de ensino de inglês
  async englishChat(
    userMessage: string,
    level: string = "intermediate",
    previousMessages: ChatMessage[] = [],
    options: ChatOptions = {}
  ): Promise<string> {
    const messages: ChatMessage[] = [
      { role: "system", content: this.generateSystemPrompt(level) },
      ...previousMessages,
      { role: "user", content: userMessage },
    ];

    return this.sendMessage(messages, options);
  }
}

export type { ChatMessage, ChatOptions }; 