import { NgrokService } from '../services/ngrok-service';
import type { ChatConfig, ChatResponse } from '@/lib/types/chat';

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

  async generateText(prompt: string, config: ChatConfig): Promise<ChatResponse> {
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

      return await response.json();
    } catch (error) {
      console.error('Error generating text:', error);
      
      if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
        this.baseUrl = null;
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