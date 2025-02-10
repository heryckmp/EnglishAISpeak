import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { ChatService } from "@/lib/ai/chat-service";

// GET /api/chat/conversations/[id]/messages - Listar mensagens de uma conversa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar se a conversa pertence ao usuário
    const checkResult = await query(
      `SELECT id, level FROM conversations
       WHERE id = $1 AND user_id = $2`,
      [params.id, session.user.id]
    );

    if (checkResult.rows.length === 0) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const result = await query(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [params.id]
    );

    return Response.json({ messages: result.rows });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/chat/conversations/[id]/messages - Enviar nova mensagem
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar se a conversa pertence ao usuário
    const checkResult = await query(
      `SELECT id, level FROM conversations
       WHERE id = $1 AND user_id = $2`,
      [params.id, session.user.id]
    );

    if (checkResult.rows.length === 0) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const conversation = checkResult.rows[0];
    const { content, audioUrl } = await request.json();

    // Salvar mensagem do usuário
    const userMessageResult = await query(
      `INSERT INTO messages (conversation_id, user_id, content, role, audio_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [params.id, session.user.id, content, "user", audioUrl]
    );

    // Obter resposta da IA
    const chatService = new ChatService();
    const aiResponse = await chatService.englishChat(
      content,
      conversation.level
    );

    // Salvar resposta da IA
    const aiMessageResult = await query(
      `INSERT INTO messages (conversation_id, content, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [params.id, aiResponse, "assistant"]
    );

    return Response.json({
      messages: [
        userMessageResult.rows[0],
        aiMessageResult.rows[0]
      ]
    });
  } catch (error) {
    console.error("Failed to process message:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 