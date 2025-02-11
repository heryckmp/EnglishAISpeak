import { BaseAIService, AIServiceConfig } from "./base-ai-service";

export interface WritingAnalysis {
  grammarScore: number;
  vocabularyScore: number;
  coherenceScore: number;
  overallScore: number;
  corrections: WritingCorrection[];
  suggestions: WritingSuggestion[];
  feedback: string;
}

export interface WritingCorrection {
  original: string;
  suggestion: string;
  explanation: string;
  type: "grammar" | "vocabulary" | "style";
  severity: "low" | "medium" | "high";
}

export interface WritingSuggestion {
  category: string;
  text: string;
}

export class WritingService extends BaseAIService {
  constructor() {
    super();
  }

  async analyzeText(text: string, config?: AIServiceConfig): Promise<WritingAnalysis> {
    const prompt = `
      Analyze the following English text and provide detailed feedback:
      
      Text: "${text}"
      
      Provide a JSON response with the following structure:
      {
        "grammarScore": number (0-100),
        "vocabularyScore": number (0-100),
        "coherenceScore": number (0-100),
        "overallScore": number (0-100),
        "corrections": array of corrections with original text, suggestions, and explanations,
        "suggestions": array of improvement suggestions by category,
        "feedback": general feedback string
      }
    `;

    const response = await this.generateResponse(prompt, {
      ...config,
      temperature: 0.3, // Lower temperature for more consistent analysis
    });

    try {
      return JSON.parse(response) as WritingAnalysis;
    } catch {
      throw new Error("Failed to parse writing analysis response");
    }
  }

  async improveText(text: string, config?: AIServiceConfig): Promise<string> {
    const prompt = `
      Improve the following English text while maintaining its original meaning:
      
      "${text}"
      
      Provide an improved version that enhances:
      1. Grammar and structure
      2. Vocabulary usage
      3. Style and flow
      4. Professional tone
    `;

    return this.generateResponse(prompt, {
      ...config,
      temperature: 0.4, // Balanced temperature for creativity and accuracy
    });
  }
} 