import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { z } from "zod";

const accuracySchema = z.object({
  correct: z.number().min(0),
  total: z.number().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = accuracySchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { correct, total } = result.data;
    const accuracy = correct / total;

    // Buscar taxa de acerto atual
    const currentAccuracy = await query(
      `SELECT value FROM progress_tracking
       WHERE user_id = $1 AND category = 'accuracy_rate'`,
      [session.user.id]
    );

    // Calcular nova média
    const previousAccuracy = currentAccuracy.rows[0]?.value || 0;
    const previousTotal = await query(
      `SELECT COUNT(*) as count
       FROM progress_tracking
       WHERE user_id = $1 AND category = 'accuracy_rate'`,
      [session.user.id]
    );
    const totalEntries = previousTotal.rows[0].count;

    const newAccuracy =
      (previousAccuracy * totalEntries + accuracy) / (totalEntries + 1);

    // Atualizar taxa de acerto
    await query(
      `INSERT INTO progress_tracking (user_id, category, value)
       VALUES ($1, 'accuracy_rate', $2)
       ON CONFLICT (user_id, category)
       DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
      [session.user.id, newAccuracy]
    );

    return Response.json({ success: true, accuracy: newAccuracy });
  } catch (error) {
    console.error("Failed to update accuracy rate:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 