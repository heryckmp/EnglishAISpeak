import { BaseAIService, AIServiceConfig } from "./base-ai-service";

export type VoiceGender = "male" | "female";
export type VoiceAccent = "american" | "british" | "australian";

export interface VoiceConfig {
  gender: VoiceGender;
  accent: VoiceAccent;
  speed: number; // 0.5 to 2.0
  pitch: number; // 0.5 to 2.0
}

export class SpeechSynthesisService extends BaseAIService {
  private defaultVoiceConfig: VoiceConfig = {
    gender: "female",
    accent: "american",
    speed: 1.0,
    pitch: 1.0
  };

  constructor() {
    super();
  }

  async synthesizeSpeech(text: string, config?: Partial<VoiceConfig>): Promise<string> {
    const voiceConfig = { ...this.defaultVoiceConfig, ...config };
    
    const prompt = `
      Convert the following text to natural speech using these parameters:
      Gender: ${voiceConfig.gender}
      Accent: ${voiceConfig.accent}
      Speed: ${voiceConfig.speed}
      Pitch: ${voiceConfig.pitch}
      
      Text to synthesize:
      "${text}"
      
      Please generate speech that sounds natural and expressive, with appropriate:
      1. Intonation and stress patterns
      2. Natural pauses and rhythm
      3. Emotional expression matching the content
    `;

    return this.generateResponse(prompt, {
      temperature: 0.3, // Lower temperature for more consistent voice
    });
  }

  async generateExpressionVariants(text: string, emotions: string[] = ["neutral"], config?: AIServiceConfig): Promise<string[]> {
    const prompt = `
      Generate different expressive variations of the following text:
      "${text}"
      
      For these emotions: ${emotions.join(", ")}
      
      Provide variations that modify:
      1. Intonation patterns
      2. Stress emphasis
      3. Speaking rate
      4. Voice quality
    `;

    const response = await this.generateResponse(prompt, {
      ...config,
      temperature: 0.6, // Higher temperature for more creative variations
    });

    return response.split("\n").filter(line => line.trim());
  }
} 