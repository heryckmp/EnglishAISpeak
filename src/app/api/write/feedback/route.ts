import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { WritingService } from "@/lib/ai/writing-service";
import { z } from "zod";

const feedbackRequestSchema = z.object({
  exerciseId: z.string().uuid(),
  content: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = feedbackRequestSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { exerciseId, content } = result.data;

    // Verificar se o exercício pertence ao usuário
    const exerciseResult = await query(
      `SELECT * FROM writing_exercises
       WHERE id = $1 AND user_id = $2`,
      [exerciseId, session.user.id]
    );

    if (exerciseResult.rows.length === 0) {
      return Response.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    const exercise = exerciseResult.rows[0];

    // Buscar feedback anterior
    const previousFeedback = exercise.corrections?.feedback
      ? [exercise.corrections.feedback]
      : [];

    // Gerar novo feedback
    const writingService = new WritingService();
    const feedback = await writingService.provideFeedback(
      content,
      previousFeedback
    );

    // Atualizar exercício com novo feedback
    await query(
      `UPDATE writing_exercises
       SET content = $1,
           corrections = jsonb_set(
             COALESCE(corrections, '{}'::jsonb),
             '{feedback}',
             $2::jsonb
           ),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [content, JSON.stringify(feedback), exerciseId]
    );

    return Response.json({ feedback });
  } catch (error) {
    console.error("Writing Feedback API Error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 