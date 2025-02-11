import { NextResponse } from "next/server";
import { ChatService } from "@/lib/ai/chat-service";
import { createWritingPromptSuggestion } from "@/lib/prompts/writing-prompts";
import { type EnglishLevel } from "@/lib/prompts/english-training";

export async function POST(request: Request) {
  try {
    const { topic, level } = await request.json();

    if (!topic || !level) {
      return NextResponse.json(
        { error: "Topic and level are required" },
        { status: 400 }
      );
    }

    const chatService = new ChatService(process.env.HUGGINGFACE_API_KEY);
    const prompt = createWritingPromptSuggestion(topic, level as EnglishLevel);
    const response = await chatService.englishChat(prompt, level as EnglishLevel);

    return NextResponse.json({ prompt: response });
  } catch (error) {
    console.error("Error generating writing prompt:", error);
    return NextResponse.json(
      { error: "Failed to generate writing prompt" },
      { status: 500 }
    );
  }
} 