import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { z } from "zod";

const progressSchema = z.object({
  category: z.enum([
    "practice_time",
    "accuracy_rate",
    "words_learned",
    "conversations_completed",
    "exercises_completed",
  ]),
  value: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = progressSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { category, value } = result.data;

    // Atualizar ou inserir progresso
    await query(
      `INSERT INTO progress_tracking (user_id, category, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, category)
       DO UPDATE SET value = $3, updated_at = CURRENT_TIMESTAMP`,
      [session.user.id, category, value]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to update progress:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await query(
      `SELECT category, value, updated_at
       FROM progress_tracking
       WHERE user_id = $1
       ORDER BY category`,
      [session.user.id]
    );

    return Response.json({ progress: result.rows });
  } catch (error) {
    console.error("Failed to fetch progress:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 