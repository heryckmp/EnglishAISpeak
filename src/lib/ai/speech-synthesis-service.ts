export type TTSProvider = 'browser' | 'coqui' | 'mozilla';
export type TTSVoice = 'american' | 'british' | 'australian';
export type TTSLevel = 'beginner' | 'intermediate' | 'advanced';

interface TTSOptions {
  provider?: TTSProvider;
  voice?: TTSVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface TTSVoiceInfo {
  name: string;
  lang: string;
  accent: TTSVoice;
}

export class SpeechSynthesisService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private provider: TTSProvider;
  private currentVoice?: SpeechSynthesisVoice;
  private options: Required<Omit<TTSOptions, 'provider' | 'voice'>>;

  constructor(options: TTSOptions = {}) {
    this.synthesis = window.speechSynthesis;
    this.provider = options.provider || 'browser';
    this.options = {
      rate: options.rate || 1,
      pitch: options.pitch || 1,
      volume: options.volume || 1
    };

    this.loadVoices();
    // Alguns navegadores carregam as vozes de forma assíncrona
    this.synthesis.onvoiceschanged = () => this.loadVoices();
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
  }

  public async speak(text: string, options: Partial<TTSOptions> = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Aplicar opções
        Object.assign(utterance, {
          ...this.options,
          ...options,
          voice: this.currentVoice
        });

        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(event);

        this.synthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  public setVoice(voice: TTSVoice) {
    // Encontrar voz correspondente ao sotaque desejado
    const voiceMap: Record<TTSVoice, string[]> = {
      american: ['en-US'],
      british: ['en-GB'],
      australian: ['en-AU']
    };

    const targetLangs = voiceMap[voice];
    this.currentVoice = this.voices.find(v => 
      targetLangs.some(lang => v.lang.startsWith(lang))
    );
  }

  public adjustForLevel(level: TTSLevel) {
    switch (level) {
      case 'beginner':
        this.options.rate = 0.8;
        this.options.pitch = 1;
        break;
      case 'intermediate':
        this.options.rate = 1;
        this.options.pitch = 1;
        break;
      case 'advanced':
        this.options.rate = 1.2;
        this.options.pitch = 1;
        break;
    }
  }

  public getAvailableVoices(): TTSVoiceInfo[] {
    return this.voices
      .filter(voice => voice.lang.startsWith('en'))
      .map(voice => ({
        name: voice.name,
        lang: voice.lang,
        accent: this.detectAccent(voice.lang)
      }));
  }

  private detectAccent(lang: string): TTSVoice {
    if (lang.startsWith('en-GB')) return 'british';
    if (lang.startsWith('en-AU')) return 'australian';
    return 'american'; // default
  }

  public pause() {
    this.synthesis.pause();
  }

  public resume() {
    this.synthesis.resume();
  }

  public stop() {
    this.synthesis.cancel();
  }

  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
} 