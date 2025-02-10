import OpenAI from "openai";
import { WritingAnalysis } from "@/types/writing";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class WritingService {
  static async analyzeText(
    content: string,
    title?: string,
    topic?: string,
    level?: string,
    focusAreas?: string[]
  ): Promise<WritingAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(content, title, topic, level, focusAreas);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert English writing tutor. Analyze the text and provide detailed feedback on grammar, vocabulary, and coherence. Focus on helping the student improve their writing skills.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const analysis = this.parseAnalysisResponse(response.choices[0].message.content || "");
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
      
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert English writing tutor. Provide incremental feedback on the text, focusing on helping the student improve their writing skills. Consider any previous feedback provided.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0].message.content || "";
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
    // Implement parsing logic based on the expected response format
    // This is a simplified example - you would need to implement proper parsing
    return {
      grammar: {
        score: 0,
        errors: []
      },
      vocabulary: {
        score: 0,
        suggestions: []
      },
      coherence: {
        score: 0,
        feedback: []
      },
      overallScore: 0,
      generalFeedback: []
    };
  }
} 