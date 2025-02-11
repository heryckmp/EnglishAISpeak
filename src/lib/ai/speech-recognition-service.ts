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

export interface SpeechRecognitionResult {
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

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export class SpeechRecognitionService extends EventEmitter {
  private baseService: BaseAIService;
  private recognition: SpeechRecognition | null = null;
  private provider: SpeechProvider;
  private language: SpeechLanguage;
  private isListening: boolean = false;

  constructor(options: SpeechRecognitionOptions = {}) {
    super();
    this.baseService = new BaseAIService();
    this.provider = options.provider || 'browser';
    this.language = options.language || 'en-US';
    this.setupRecognition(options);
  }

  private setupRecognition(options: SpeechRecognitionOptions) {
    if (this.provider === 'browser') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = options.continuous ?? true;
        this.recognition.interimResults = options.interimResults ?? true;
        this.recognition.lang = this.language;

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          const result = event.results[event.results.length - 1];
          this.emit('result', {
            text: result[0].transcript,
            isFinal: result.isFinal,
            confidence: result[0].confidence
          });
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          this.emit('error', event.error);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.emit('end');
        };
      }
    }
    // TODO: Implementar Vosk e Whisper
  }

  public start() {
    if (this.isListening || !this.recognition) return;
    this.isListening = true;
    this.recognition.start();
  }

  public stop() {
    if (!this.isListening || !this.recognition) return;
    this.isListening = false;
    this.recognition.stop();
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

  async transcribeAudio(audioBlob: Blob): Promise<SpeechRecognitionResult> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');
      
      const response = await fetch('/api/speech/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Speech recognition failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        text: result.text,
        confidence: result.segments.reduce((acc: number, segment: any) => acc + segment.confidence, 0) / result.segments.length,
        language: result.language,
        segments: result.segments
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
      
      const response = await fetch(`${process.env.LLM_API_URL}/detect-language`, {
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

// Tipos para o reconhecimento de voz nativo
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
} 