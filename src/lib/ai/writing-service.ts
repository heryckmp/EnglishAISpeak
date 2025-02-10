import { ChatService } from "./chat-service";

interface WritingAnalysis {
  grammarScore: number;
  vocabularyScore: number;
  coherenceScore: number;
  overallScore: number;
  corrections: {
    original: string;
    suggestion: string;
    explanation: string;
    type: "grammar" | "vocabulary" | "style";
    severity: "low" | "medium" | "high";
  }[];
  suggestions: {
    category: string;
    text: string;
  }[];
  feedback: string;
}

interface WritingOptions {
  level?: string;
  topic?: string;
  focusAreas?: string[];
}

export class WritingService {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  private generateAnalysisPrompt(text: string, options: WritingOptions = {}): string {
    return `As an English writing instructor, analyze the following text and provide detailed feedback. Focus on grammar, vocabulary, coherence, and style.

Text to analyze:
"""
${text}
"""

Level: ${options.level || "intermediate"}
${options.topic ? `Topic: ${options.topic}` : ""}
${options.focusAreas ? `Focus areas: ${options.focusAreas.join(", ")}` : ""}

Provide a structured analysis in the following JSON format:
{
  "grammarScore": number (0-100),
  "vocabularyScore": number (0-100),
  "coherenceScore": number (0-100),
  "overallScore": number (0-100),
  "corrections": [
    {
      "original": "text with error",
      "suggestion": "corrected text",
      "explanation": "why this should be corrected",
      "type": "grammar|vocabulary|style",
      "severity": "low|medium|high"
    }
  ],
  "suggestions": [
    {
      "category": "category name",
      "text": "suggestion text"
    }
  ],
  "feedback": "general feedback text"
}`;
  }

  async analyzeText(text: string, options: WritingOptions = {}): Promise<WritingAnalysis> {
    try {
      const prompt = this.generateAnalysisPrompt(text, options);
      const response = await this.chatService.sendMessage([
        { role: "system", content: "You are an expert English writing instructor." },
        { role: "user", content: prompt }
      ]);

      // Extrair e validar JSON da resposta
      const analysisMatch = response.match(/\{[\s\S]*\}/);
      if (!analysisMatch) {
        throw new Error("Invalid analysis response format");
      }

      const analysis = JSON.parse(analysisMatch[0]);

      // Validar estrutura da análise
      if (!this.validateAnalysis(analysis)) {
        throw new Error("Invalid analysis structure");
      }

      return analysis;
    } catch (error) {
      console.error("Writing analysis error:", error);
      throw error;
    }
  }

  private validateAnalysis(analysis: any): analysis is WritingAnalysis {
    return (
      typeof analysis.grammarScore === "number" &&
      typeof analysis.vocabularyScore === "number" &&
      typeof analysis.coherenceScore === "number" &&
      typeof analysis.overallScore === "number" &&
      Array.isArray(analysis.corrections) &&
      Array.isArray(analysis.suggestions) &&
      typeof analysis.feedback === "string"
    );
  }

  async generateWritingPrompt(topic?: string, level: string = "intermediate"): Promise<string> {
    const prompt = `Generate an engaging writing prompt suitable for ${level} level English learners${
      topic ? ` about ${topic}` : ""
    }. The prompt should encourage creative thinking and use of varied vocabulary.`;

    const response = await this.chatService.sendMessage([
      { role: "system", content: "You are an expert English writing instructor." },
      { role: "user", content: prompt }
    ]);

    return response;
  }

  async provideFeedback(text: string, previousFeedback: string[] = []): Promise<string> {
    const prompt = `Review this text and provide constructive feedback, considering previous feedback:

Text:
"""
${text}
"""

${previousFeedback.length > 0 ? `Previous feedback:
${previousFeedback.join("\n")}` : ""}

Provide specific suggestions for improvement while maintaining an encouraging tone.`;

    const response = await this.chatService.sendMessage([
      { role: "system", content: "You are an expert English writing instructor." },
      { role: "user", content: prompt }
    ]);

    return response;
  }
} 