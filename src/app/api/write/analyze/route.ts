import { NextResponse } from "next/server";
import { ChatService } from "@/lib/ai/chat-service";
import { createWritingAnalysisPrompt } from "@/lib/prompts/writing-prompts";
import { EnglishLevel } from "@/lib/prompts/english-training";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, level } = body;

    if (!text || !level) {
      return NextResponse.json(
        { error: "Text and level are required" },
        { status: 400 }
      );
    }

    const chatService = new ChatService(process.env.HUGGINGFACE_API_KEY!);
    const prompt = createWritingAnalysisPrompt(text, level as EnglishLevel);
    const response = await chatService.englishChat(prompt, level as EnglishLevel);

    try {
      const analysis = JSON.parse(response);
      return NextResponse.json(analysis);
    } catch (error) {
      console.error("Failed to parse analysis results:", error);
      return NextResponse.json(
        { error: "Failed to parse analysis results" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error analyzing text:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 