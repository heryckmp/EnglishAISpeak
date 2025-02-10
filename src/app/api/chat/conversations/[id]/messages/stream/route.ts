import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { ChatService } from "@/lib/ai/chat-service";

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

    // Criar encoder para streaming
    const encoder = new TextEncoder();

    // Criar stream de resposta
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Iniciar chat service
    const chatService = new ChatService();

    // Criar mensagem da IA no banco
    const aiMessageResult = await query(
      `INSERT INTO messages (conversation_id, content, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [params.id, "", "assistant"]
    );

    const aiMessageId = aiMessageResult.rows[0].id;
    let fullResponse = "";

    // Função para atualizar a mensagem da IA no banco
    const updateAiMessage = async () => {
      await query(
        `UPDATE messages SET content = $1 WHERE id = $2`,
        [fullResponse, aiMessageId]
      );
    };

    // Iniciar streaming
    const streamResponse = chatService.englishChat(
      content,
      conversation.level,
      [],
      {
        streaming: true,
        onStream: async (chunk) => {
          fullResponse += chunk;
          await writer.write(encoder.encode(chunk));
        },
      }
    );

    streamResponse.then(async () => {
      await updateAiMessage();
      await writer.close();
    }).catch(async (error) => {
      console.error("Streaming error:", error);
      await writer.abort(error);
    });

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Failed to process streaming message:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 