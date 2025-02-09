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

    // Inicializar o cliente apropriado
    if (this.provider === "openrouter") {
      this.openRouterClient = new OpenRouterClient(
        config.openrouter.apiKey,
        config.openrouter.defaultModel
      );
      this.currentModel = config.openrouter.defaultModel;
    } else if (this.provider === "local") {
      // Encontrar o primeiro modelo local habilitado
      const enabledModels = LocalLLMClient.getAvailableModels();
      const firstEnabled = Object.entries(enabledModels).find(([_, enabled]) => enabled);
      
      if (!firstEnabled) {
        throw new Error("No local models are enabled in configuration");
      }
      
      this.localClient = new LocalLLMClient(firstEnabled[0] as "llama2" | "mistral" | "phi2");
      this.currentModel = firstEnabled[0];
    } else {
      throw new Error("OpenAI provider not implemented yet");
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
    if (this.provider === "openrouter") {
      this.openRouterClient?.setDefaultModel(model as keyof typeof OpenRouterClient.AVAILABLE_MODELS);
      this.currentModel = OpenRouterClient.AVAILABLE_MODELS[model as keyof typeof OpenRouterClient.AVAILABLE_MODELS];
    } else if (this.provider === "local") {
      this.localClient = new LocalLLMClient(model as "llama2" | "mistral" | "phi2");
      this.currentModel = model;
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
    return `You are an advanced English language tutor. Your goal is to help the student improve their English skills.
Current student level: ${level}

Guidelines:
1. Communicate naturally but maintain a level appropriate for the student
2. Correct significant errors while maintaining conversation flow
3. Provide explanations for corrections when needed
4. Encourage the student to express themselves freely
5. Use vocabulary and expressions suitable for their level
6. Give positive reinforcement and constructive feedback

If the student makes mistakes, include corrections in your response using this format:
- Original: [incorrect phrase]
- Corrected: [corrected phrase]
- Explanation: [brief explanation of the correction]`;
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

    return this.sendMessage(messages, {
      ...options,
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 1000,
    });
  }
}

export type { ChatMessage, ChatOptions }; 