import { EventEmitter } from "events";

export type TTSVoice = {
  name: string;
  lang: string;
  default: boolean;
};

export type TTSOptions = {
  voice?: TTSVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
};

export class TextToSpeechService extends EventEmitter {
  private synthesis: SpeechSynthesis;
  private voices: TTSVoice[] = [];
  private currentVoice?: TTSVoice;
  private rate: number = 1;
  private pitch: number = 1;
  private volume: number = 1;

  constructor(options?: TTSOptions) {
    super();
    this.synthesis = window.speechSynthesis;
    
    // Configurar opções iniciais
    if (options) {
      this.setVoice(options.voice);
      this.setRate(options.rate);
      this.setPitch(options.pitch);
      this.setVolume(options.volume);
    }

    // Carregar vozes disponíveis
    this.loadVoices();
    this.synthesis.addEventListener("voiceschanged", () => {
      this.loadVoices();
      this.emit("voiceschanged", this.voices);
    });
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices().map(voice => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default
    }));

    // Selecionar voz padrão se nenhuma foi definida
    if (!this.currentVoice && this.voices.length > 0) {
      this.currentVoice = this.voices.find(v => v.default) || this.voices[0];
    }
  }

  public getVoices(): TTSVoice[] {
    return this.voices;
  }

  public setVoice(voice?: TTSVoice): void {
    if (voice) {
      const systemVoice = this.synthesis.getVoices().find(
        v => v.name === voice.name && v.lang === voice.lang
      );
      if (systemVoice) {
        this.currentVoice = voice;
      }
    }
  }

  public setRate(rate?: number): void {
    if (rate !== undefined) {
      this.rate = Math.max(0.1, Math.min(10, rate));
    }
  }

  public setPitch(pitch?: number): void {
    if (pitch !== undefined) {
      this.pitch = Math.max(0, Math.min(2, pitch));
    }
  }

  public setVolume(volume?: number): void {
    if (volume !== undefined) {
      this.volume = Math.max(0, Math.min(1, volume));
    }
  }

  public speak(text: string): void {
    // Cancelar qualquer fala em andamento
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurar opções
    if (this.currentVoice) {
      const systemVoice = this.synthesis.getVoices().find(
        v => v.name === this.currentVoice?.name && v.lang === this.currentVoice?.lang
      );
      if (systemVoice) {
        utterance.voice = systemVoice;
      }
    }
    
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    // Configurar eventos
    utterance.onstart = () => this.emit("start");
    utterance.onend = () => this.emit("end");
    utterance.onerror = (event) => this.emit("error", event);
    utterance.onpause = () => this.emit("pause");
    utterance.onresume = () => this.emit("resume");

    // Iniciar a fala
    this.synthesis.speak(utterance);
  }

  public pause(): void {
    this.synthesis.pause();
  }

  public resume(): void {
    this.synthesis.resume();
  }

  public stop(): void {
    this.synthesis.cancel();
  }

  public isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  public isPaused(): boolean {
    return this.synthesis.paused;
  }

  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
} 