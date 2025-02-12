import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { ChatService } from "@/lib/ai/chat-service";

// GET /api/chat/conversations/[id]/messages - Listar mensagens de uma conversa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const checkResult = await query(
      `SELECT id, level FROM conversations
       WHERE id = $1 AND user_id = $2`,
      [id, session.user.id]
    );
    if (checkResult.length === 0) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }
    const result = await query(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [id]
    );
    return Response.json({ messages: result });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/chat/conversations/[id]/messages - Enviar nova mensagem
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const checkResult = await query(
      `SELECT id, level FROM conversations
       WHERE id = $1 AND user_id = $2`,
      [id, session.user.id]
    );
    if (checkResult.length === 0) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }
    const { content, audioUrl } = await request.json();

    const userMessageResult = await query(
      `INSERT INTO messages (conversation_id, user_id, content, role, audio_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, session.user.id, content, "user", audioUrl]
    );

    const chatService = new ChatService();
    const aiResponse = await chatService.sendMessage(content, []);

    const aiMessageResult = await query(
      `INSERT INTO messages (conversation_id, content, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, aiResponse, "assistant"]
    );

    return Response.json({
      messages: [
        userMessageResult[0],
        aiMessageResult[0]
      ]
    });
  } catch (error) {
    console.error("Failed to process message:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
} 