interface WhisperResponse {
  text: string;
  language?: string;
  segments?: {
    text: string;
    start: number;
    end: number;
    confidence: number;
  }[];
}

interface WhisperOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
  response_format?: "json" | "text" | "srt" | "verbose_json" | "vtt";
}

export class WhisperClient {
  private apiKey: string;
  private baseUrl: string = "https://api.openai.com/v1/audio/transcriptions";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(audioBlob: Blob, options: WhisperOptions = {}): Promise<WhisperResponse> {
    // Converter o Blob para File
    const file = new File([audioBlob], "audio.wav", { type: "audio/wav" });
    
    // Criar FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "whisper-1");
    
    // Adicionar opções
    if (options.language) {
      formData.append("language", options.language);
    }
    if (options.prompt) {
      formData.append("prompt", options.prompt);
    }
    if (options.temperature) {
      formData.append("temperature", options.temperature.toString());
    }
    formData.append("response_format", options.response_format || "verbose_json");

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.text,
        language: data.language,
        segments: data.segments,
      };
    } catch (error) {
      console.error("Whisper transcription error:", error);
      throw error;
    }
  }

  // Detectar idioma do áudio
  async detectLanguage(audioBlob: Blob): Promise<string> {
    try {
      const result = await this.transcribe(audioBlob, {
        response_format: "verbose_json",
      });
      return result.language || "en";
    } catch (error) {
      console.error("Language detection error:", error);
      return "en"; // Fallback para inglês
    }
  }
}

export type { WhisperResponse, WhisperOptions }; 