interface TTSOptions {
  voice?: SpeechSynthesisVoice;
  pitch?: number;
  rate?: number;
  volume?: number;
  lang?: string;
}

class TextToSpeech {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private defaultOptions: TTSOptions = {
    pitch: 1,
    rate: 1,
    volume: 1,
    lang: 'en-US'
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      
      // Alguns navegadores carregam as vozes de forma assíncrona
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices();
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis is not supported in this browser'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Aplicar opções
      const mergedOptions = { ...this.defaultOptions, ...options };
      Object.assign(utterance, mergedOptions);

      // Selecionar voz específica se fornecida
      if (options.voice) {
        utterance.voice = options.voice;
      } else {
        // Tentar encontrar uma voz adequada para o idioma
        const voice = this.voices.find(v => v.lang === mergedOptions.lang);
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error('Speech synthesis failed'));

      this.synthesis.speak(utterance);
    });
  }

  pause() {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  resume() {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  cancel() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Método para gerar áudio em formato blob (útil para salvar)
  async generateAudio(text: string, options: TTSOptions = {}): Promise<Blob> {
    // TODO: Implementar geração de áudio usando serviço de TTS externo
    // Por enquanto, retornamos um blob vazio simulado
    return new Blob([], { type: 'audio/wav' });
  }
}

export { TextToSpeech };
export type { TTSOptions }; 