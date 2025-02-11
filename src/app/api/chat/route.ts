import { NextRequest } from "next/server";
import { ChatService } from "@/lib/ai/chat-service";
import { EnglishLevel } from "@/lib/prompts/english-training";

const chatService = new ChatService(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { message, level, previousMessages } = await req.json();

    if (!message) {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await chatService.englishChat(
      message,
      level as EnglishLevel,
      previousMessages
    );

    return Response.json({ message: response });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
} 