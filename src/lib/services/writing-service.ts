import { WritingAnalysis } from "@/types/writing";
import config from "@/lib/config";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class WritingService {
  private static async callLMStudio(messages: ChatMessage[], temperature: number = 0.7, maxTokens: number = 1000) {
    try {
      const response = await fetch(`${config.llm.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "local-model",
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`LM Studio API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling LM Studio:", error);
      throw new Error("Failed to communicate with LM Studio");
    }
  }

  static async analyzeText(
    content: string,
    title?: string,
    topic?: string,
    level?: string,
    focusAreas?: string[]
  ): Promise<WritingAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(content, title, topic, level, focusAreas);
      
      const response = await this.callLMStudio([
        {
          role: "system",
          content: `You are an expert English writing tutor. Analyze the text and provide detailed feedback on grammar, vocabulary, and coherence. Focus on helping the student improve their writing skills.`
        },
        {
          role: "user",
          content: prompt
        }
      ]);

      const analysis = this.parseAnalysisResponse(response);
      return analysis;
    } catch (error) {
      console.error("Error analyzing text:", error);
      throw new Error("Failed to analyze text");
    }
  }

  static async generateFeedback(
    content: string,
    previousFeedback?: string[]
  ): Promise<string> {
    try {
      const prompt = this.buildFeedbackPrompt(content, previousFeedback);
      
      const response = await this.callLMStudio([
        {
          role: "system",
          content: `You are an expert English writing tutor. Provide incremental feedback on the text, focusing on helping the student improve their writing skills. Consider any previous feedback provided.`
        },
        {
          role: "user",
          content: prompt
        }
      ]);

      return response;
    } catch (error) {
      console.error("Error generating feedback:", error);
      throw new Error("Failed to generate feedback");
    }
  }

  private static buildAnalysisPrompt(
    content: string,
    title?: string,
    topic?: string,
    level?: string,
    focusAreas?: string[]
  ): string {
    let prompt = "Please analyze the following text:\n\n";
    
    if (title) prompt += `Title: ${title}\n`;
    if (topic) prompt += `Topic: ${topic}\n`;
    if (level) prompt += `Level: ${level}\n`;
    if (focusAreas?.length) {
      prompt += `Focus Areas: ${focusAreas.join(", ")}\n`;
    }
    
    prompt += `\nText:\n${content}\n\n`;
    prompt += `Please provide a detailed analysis including:
1. Grammar assessment (score and specific errors with suggestions)
2. Vocabulary evaluation (score and improvement suggestions)
3. Coherence analysis (score and feedback on structure and flow)
4. Overall score
5. General feedback and recommendations`;

    return prompt;
  }

  private static buildFeedbackPrompt(
    content: string,
    previousFeedback?: string[]
  ): string {
    let prompt = "Please provide feedback on the following text:\n\n";
    prompt += content;
    
    if (previousFeedback?.length) {
      prompt += "\n\nPrevious feedback provided:\n";
      previousFeedback.forEach((feedback, index) => {
        prompt += `${index + 1}. ${feedback}\n`;
      });
      prompt += "\nPlease provide new, incremental feedback that builds upon the previous feedback.";
    }

    return prompt;
  }

  private static parseAnalysisResponse(response: string): WritingAnalysis {
    try {
      // Tentar fazer o parse da resposta como JSON primeiro
      const parsedResponse = JSON.parse(response);
      
      // Se o parse foi bem sucedido e tem o formato esperado, retornar diretamente
      if (
        parsedResponse.grammar &&
        parsedResponse.vocabulary &&
        parsedResponse.coherence &&
        parsedResponse.overallScore !== undefined
      ) {
        return parsedResponse;
      }
    } catch {
      // Se não conseguir fazer o parse como JSON, continuar com o parsing manual
    }

    // Parsing manual da resposta em texto
    return {
      grammar: {
        score: this.extractScore(response, "Grammar") || 0,
        errors: this.extractErrors(response).map(error => ({
          type: "grammar",
          message: error,
          suggestion: "",
          severity: "medium",
          context: {
            text: error,
            offset: 0,
            length: error.length
          }
        }))
      },
      vocabulary: {
        score: this.extractScore(response, "Vocabulary") || 0,
        suggestions: this.extractSuggestions(response).map(suggestion => ({
          original: "",
          suggestions: [suggestion],
          context: "",
          reason: suggestion
        }))
      },
      coherence: {
        score: this.extractScore(response, "Coherence") || 0,
        feedback: this.extractFeedback(response).map(feedback => ({
          aspect: "structure",
          comment: feedback,
          suggestion: ""
        }))
      },
      overallScore: this.extractScore(response, "Overall") || 0,
      generalFeedback: this.extractGeneralFeedback(response)
    };
  }

  private static extractScore(text: string, category: string): number {
    const regex = new RegExp(`${category}[^0-9]*([0-9]+)`, 'i');
    const match = text.match(regex);
    return match ? parseInt(match[1], 10) : 0;
  }

  private static extractErrors(text: string): string[] {
    const errors: string[] = [];
    const grammarSection = text.match(/Grammar[^\n]*\n(.*?)(?=\n\n|\n[A-Z]|$)/i);
    if (grammarSection) {
      errors.push(...grammarSection[1].split('\n').filter(line => line.trim()));
    }
    return errors;
  }

  private static extractSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    const vocabSection = text.match(/Vocabulary[^\n]*\n(.*?)(?=\n\n|\n[A-Z]|$)/i);
    if (vocabSection) {
      suggestions.push(...vocabSection[1].split('\n').filter(line => line.trim()));
    }
    return suggestions;
  }

  private static extractFeedback(text: string): string[] {
    const feedback: string[] = [];
    const coherenceSection = text.match(/Coherence[^\n]*\n(.*?)(?=\n\n|\n[A-Z]|$)/i);
    if (coherenceSection) {
      feedback.push(...coherenceSection[1].split('\n').filter(line => line.trim()));
    }
    return feedback;
  }

  private static extractGeneralFeedback(text: string): string[] {
    const feedback: string[] = [];
    const generalSection = text.match(/General feedback[^\n]*\n(.*?)(?=\n\n|\n[A-Z]|$)/i);
    if (generalSection) {
      feedback.push(...generalSection[1].split('\n').filter(line => line.trim()));
    }
    return feedback;
  }
} 