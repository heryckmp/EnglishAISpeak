import { NextResponse } from "next/server";
import { ChatService } from "@/lib/ai/chat-service";
import { createWritingPromptSuggestion } from "@/lib/prompts/writing-prompts";
import { EnglishLevel } from "@/lib/prompts/english-training";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, level } = body;

    if (!topic || !level) {
      return NextResponse.json(
        { error: "Topic and level are required" },
        { status: 400 }
      );
    }

    const chatService = new ChatService(process.env.HUGGINGFACE_API_KEY!);
    const prompt = createWritingPromptSuggestion(topic, level as EnglishLevel);
    const response = await chatService.englishChat(prompt, level as EnglishLevel);

    return NextResponse.json({ prompt: response });
  } catch (error) {
    console.error("Error generating prompt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 