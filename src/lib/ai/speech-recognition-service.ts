import { EventEmitter } from 'events';
import { BaseAIService, AIServiceConfig } from "./base-ai-service";

export type SpeechProvider = 'browser' | 'vosk' | 'whisper';
export type SpeechLanguage = 'en-US' | 'en-GB' | 'en-AU';

interface SpeechRecognitionOptions {
  provider?: SpeechProvider;
  language?: SpeechLanguage;
  continuous?: boolean;
  interimResults?: boolean;
}

interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  language?: string;
  segments?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export class SpeechRecognitionService extends BaseAIService {
  private recognition: any;
  private provider: SpeechProvider;
  private language: SpeechLanguage;
  private isListening: boolean = false;

  constructor(options: SpeechRecognitionOptions = {}) {
    super();
    this.provider = options.provider || 'browser';
    this.language = options.language || 'en-US';
    this.setupRecognition(options);
  }

  private setupRecognition(options: SpeechRecognitionOptions) {
    if (this.provider === 'browser') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = options.continuous ?? true;
      this.recognition.interimResults = options.interimResults ?? true;
      this.recognition.lang = this.language;

      this.recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        this.emit('result', {
          text: result[0].transcript,
          isFinal: result.isFinal,
          confidence: result[0].confidence
        });
      };

      this.recognition.onerror = (event: any) => {
        this.emit('error', event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.emit('end');
      };
    }
    // TODO: Implementar Vosk e Whisper
  }

  public start() {
    if (this.isListening) return;
    this.isListening = true;
    this.recognition?.start();
  }

  public stop() {
    if (!this.isListening) return;
    this.isListening = false;
    this.recognition?.stop();
  }

  public setLanguage(language: SpeechLanguage) {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  public isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  async transcribeAudio(audioBlob: Blob, config?: AIServiceConfig): Promise<SpeechRecognitionResult> {
    try {
      // Converter o Blob para FormData
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');
      
      const baseUrl = await this.ensureConnection();
      const response = await fetch(`${baseUrl}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Speech recognition failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        text: result.text,
        confidence: result.confidence || 1.0,
        language: result.language,
        segments: result.segments,
      };
    } catch (error) {
      console.error('Speech recognition error:', error);
      throw error;
    }
  }

  async detectLanguage(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');
      formData.append('task', 'detect-language');
      
      const baseUrl = await this.ensureConnection();
      const response = await fetch(`${baseUrl}/detect-language`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Language detection failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.language;
    } catch (error) {
      console.error('Language detection error:', error);
      throw error;
    }
  }
}

// Adicionar ao window para TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
} 