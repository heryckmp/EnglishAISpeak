import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

// GET /api/chat/conversations - Listar conversas do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await query(
      `SELECT c.*, 
              COUNT(m.id) as message_count,
              MAX(m.created_at) as last_message_at
       FROM conversations c
       LEFT JOIN messages m ON c.id = m.conversation_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY last_message_at DESC NULLS LAST`,
      [session.user.id]
    );

    return Response.json({ conversations: result.rows });
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/chat/conversations - Criar nova conversa
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, context = "general", level = "intermediate" } = await request.json();

    const result = await query(
      `INSERT INTO conversations (user_id, title, context, level)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [session.user.id, title, context, level]
    );

    return Response.json({ conversation: result.rows[0] });
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/chat/conversations/[id] - Atualizar conversa
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, context, level } = await request.json();

    // Verificar se a conversa pertence ao usuário
    const checkResult = await query(
      `SELECT id FROM conversations
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
      `UPDATE conversations
       SET title = COALESCE($1, title),
           context = COALESCE($2, context),
           level = COALESCE($3, level),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [title, context, level, params.id]
    );

    return Response.json({ conversation: result.rows[0] });
  } catch (error) {
    console.error("Failed to update conversation:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 