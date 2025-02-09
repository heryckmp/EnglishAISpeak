import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { ChatService } from "@/lib/ai/chat-service";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, level, model } = await request.json();
    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const chatService = new ChatService();
    if (model) {
      chatService.setModel(model);
    }

    const response = await chatService.englishChat(message, level || "intermediate");

    // Criar mensagens para retornar
    const messages = [
      {
        id: uuidv4(),
        content: message,
        role: "user" as const,
      },
      {
        id: uuidv4(),
        content: response,
        role: "assistant" as const,
      },
    ];

    return Response.json({ messages });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
} 