import { NgrokService } from '../services/ngrok-service';

export interface LLMConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  repetitionPenalty?: number;
}

export interface LLMResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class LocalLLMClient {
  private ngrokService: NgrokService;
  private baseUrl: string | null = null;

  constructor() {
    this.ngrokService = NgrokService.getInstance();
  }

  private async ensureConnection(): Promise<string> {
    if (!this.baseUrl) {
      this.baseUrl = await this.ngrokService.connect();
    }
    return this.baseUrl;
  }

  async generateText(prompt: string, config: LLMConfig): Promise<LLMResponse> {
    try {
      const baseUrl = await this.ensureConnection();

      const response = await fetch(`${baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          ...config,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        text: data.text,
        usage: data.usage,
      };
    } catch (error) {
      console.error('Error generating text:', error);
      
      // Se houver erro de conexão, tenta reconectar
      if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
        this.baseUrl = null; // Força uma nova conexão na próxima tentativa
        throw new Error('Failed to connect to local LLM service. Please ensure the service is running.');
      }
      
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.ngrokService.disconnect();
    this.baseUrl = null;
  }
} 