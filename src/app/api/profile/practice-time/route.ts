import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { z } from "zod";

const practiceTimeSchema = z.object({
  minutes: z.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = practiceTimeSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { minutes } = result.data;

    // Buscar tempo total atual
    const currentTime = await query(
      `SELECT value FROM progress_tracking
       WHERE user_id = $1 AND category = 'practice_time'`,
      [session.user.id]
    );

    const totalMinutes =
      (currentTime.rows[0]?.value || 0) + minutes;

    // Atualizar tempo total
    await query(
      `INSERT INTO progress_tracking (user_id, category, value)
       VALUES ($1, 'practice_time', $2)
       ON CONFLICT (user_id, category)
       DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
      [session.user.id, totalMinutes]
    );

    return Response.json({ success: true, totalMinutes });
  } catch (error) {
    console.error("Failed to update practice time:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 