import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { WritingService } from "@/lib/services/writing-service";
import { z } from "zod";
import { NextResponse } from "next/server";
import { ChatService } from "@/lib/ai/chat-service";
import { createWritingAnalysisPrompt } from "@/lib/prompts/writing-prompts";
import { type EnglishLevel } from "@/lib/prompts/english-training";

const analyzeRequestSchema = z.object({
  content: z.string().min(1),
  title: z.string().optional(),
  topic: z.string().optional(),
  level: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const { text, level } = await request.json();

    if (!text || !level) {
      return NextResponse.json(
        { error: "Text and level are required" },
        { status: 400 }
      );
    }

    const chatService = new ChatService(process.env.HUGGINGFACE_API_KEY);
    const prompt = createWritingAnalysisPrompt(text, level as EnglishLevel);
    const response = await chatService.englishChat(prompt, level as EnglishLevel);

    try {
      // Tentar fazer o parse da resposta como JSON
      const analysis = JSON.parse(response);
      return NextResponse.json(analysis);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      return NextResponse.json(
        { error: "Failed to parse analysis results" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error analyzing writing:", error);
    return NextResponse.json(
      { error: "Failed to analyze writing" },
      { status: 500 }
    );
  }
} 