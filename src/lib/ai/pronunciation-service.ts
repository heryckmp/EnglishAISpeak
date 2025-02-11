import { BaseAIService, AIServiceConfig } from "./base-ai-service";

export interface PronunciationError {
  word: string;
  expected: string;
  actual: string;
  confidence: number;
  type: "phoneme" | "stress" | "intonation";
  severity: "low" | "medium" | "high";
  suggestion: string;
}

export interface PronunciationAnalysis {
  text: string;
  overallScore: number;
  errors: PronunciationError[];
  feedback: string;
}

export class PronunciationService extends BaseAIService {
  constructor() {
    super();
  }

  async analyzePronunciation(audioText: string, audioTranscript: string, config?: AIServiceConfig): Promise<PronunciationAnalysis> {
    const prompt = `
      Compare the following text with its transcription and provide detailed pronunciation feedback:
      
      Expected text: "${audioText}"
      Actual transcription: "${audioTranscript}"
      
      Provide a JSON response with the following structure:
      {
        "text": original text,
        "overallScore": number (0-100),
        "errors": array of pronunciation errors with details,
        "feedback": detailed feedback string with improvement suggestions
      }
    `;

    const response = await this.generateResponse(prompt, {
      ...config,
      temperature: 0.2, // Lower temperature for more consistent analysis
    });

    try {
      return JSON.parse(response) as PronunciationAnalysis;
    } catch {
      throw new Error("Failed to parse pronunciation analysis response");
    }
  }

  async generatePracticeExercise(level: string = "intermediate", focus: string[] = [], config?: AIServiceConfig): Promise<string> {
    const prompt = `
      Generate a pronunciation practice exercise for ${level} level English learners.
      ${focus.length > 0 ? `Focus on the following aspects: ${focus.join(", ")}` : ""}
      
      Include:
      1. A short paragraph or set of sentences
      2. Specific sounds or patterns to focus on
      3. Practice tips and instructions
    `;

    return this.generateResponse(prompt, {
      ...config,
      temperature: 0.5, // Balanced temperature for creativity and consistency
    });
  }
} 