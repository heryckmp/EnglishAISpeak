import { EventEmitter } from 'events';
import { WhisperClient, WhisperResponse } from './whisper-client';

// Definições de tipos para Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  language?: string;
}

interface SpeechToTextEvents {
  result: (result: SpeechRecognitionResult) => void;
  error: (error: Error) => void;
  end: () => void;
  languageDetected: (language: string) => void;
}

type SupportedLanguage = 
  | 'en-US' | 'en-GB' | 'es-ES' | 'fr-FR' | 'de-DE'
  | 'it-IT' | 'pt-BR' | 'ja-JP' | 'ko-KR' | 'zh-CN';

interface SpeechToTextOptions {
  language?: SupportedLanguage | 'auto';
  useWhisper?: boolean;
  whisperApiKey?: string;
}

const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'es-ES': 'Spanish',
  'fr-FR': 'French',
  'de-DE': 'German',
  'it-IT': 'Italian',
  'pt-BR': 'Portuguese (Brazil)',
  'ja-JP': 'Japanese',
  'ko-KR': 'Korean',
  'zh-CN': 'Chinese (Simplified)',
};

class SpeechToText extends EventEmitter {
  private recognition: any = null;
  private isListening: boolean = false;
  private whisperClient: WhisperClient | null = null;
  private currentLanguage: SupportedLanguage | 'auto' = 'en-US';
  private useWhisper: boolean = false;

  constructor(options: SpeechToTextOptions = {}) {
    super();
    
    if (options.whisperApiKey) {
      this.whisperClient = new WhisperClient(options.whisperApiKey);
    }
    
    this.useWhisper = options.useWhisper || false;
    this.currentLanguage = options.language || 'en-US';
    
    if (!this.useWhisper) {
      this.initRecognition();
    }
  }

  private initRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.currentLanguage;

        this.recognition.onresult = (event: any) => {
          const result = event.results[event.results.length - 1];
          this.emit('result', {
            transcript: result[0].transcript,
            confidence: result[0].confidence,
            isFinal: result.isFinal,
            language: this.currentLanguage
          });
        };

        this.recognition.onerror = (event: any) => {
          this.emit('error', new Error(event.error));
          if (this.whisperClient) {
            this.useWhisper = true; // Fallback para Whisper em caso de erro
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.emit('end');
        };
      } else if (this.whisperClient) {
        this.useWhisper = true; // Fallback para Whisper se Speech Recognition não estiver disponível
      }
    }
  }

  setLanguage(language: SupportedLanguage) {
    if (SUPPORTED_LANGUAGES[language]) {
      this.currentLanguage = language;
      if (this.recognition) {
        this.recognition.lang = language;
      }
    }
  }

  getSupportedLanguages(): Record<SupportedLanguage, string> {
    return SUPPORTED_LANGUAGES;
  }

  async detectLanguage(audioBlob: Blob): Promise<string> {
    if (this.whisperClient) {
      const detectedLang = await this.whisperClient.detectLanguage(audioBlob);
      this.emit('languageDetected', detectedLang);
      return detectedLang;
    }
    return this.currentLanguage;
  }

  start() {
    if (this.useWhisper) {
      // No caso do Whisper, a gravação é gerenciada externamente
      this.isListening = true;
      return;
    }

    if (!this.recognition) {
      throw new Error('Speech recognition is not supported in this browser');
    }

    if (!this.isListening) {
      this.recognition.start();
      this.isListening = true;
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  async transcribeWithWhisper(audioBlob: Blob): Promise<string> {
    if (!this.whisperClient) {
      throw new Error('Whisper client is not initialized. Please provide an API key.');
    }

    try {
      // Detectar idioma se não especificado
      if (this.currentLanguage === 'auto') {
        const detectedLang = await this.detectLanguage(audioBlob);
        this.currentLanguage = detectedLang as SupportedLanguage;
      }

      const result = await this.whisperClient.transcribe(audioBlob, {
        language: this.currentLanguage,
        temperature: 0.3, // Menor temperatura para maior precisão
      });

      this.emit('result', {
        transcript: result.text,
        confidence: 0.9, // Whisper não fornece confidence, usando valor padrão alto
        isFinal: true,
        language: result.language
      });

      return result.text;
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }
}

export { SpeechToText };
export type { SpeechRecognitionResult, SpeechToTextEvents, SpeechToTextOptions, SupportedLanguage }; 