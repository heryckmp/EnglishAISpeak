import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { WritingService } from "@/lib/ai/writing-service";
import { z } from "zod";

const analysisRequestSchema = z.object({
  content: z.string().min(1),
  title: z.string().optional(),
  topic: z.string().optional(),
  level: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = analysisRequestSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { content, title, topic, level, focusAreas } = result.data;

    // Criar exercício de escrita
    const exerciseResult = await query(
      `INSERT INTO writing_exercises (user_id, title, content, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [session.user.id, title || "Untitled", content, "analyzing"]
    );
    const exercise = exerciseResult.rows[0];

    // Analisar texto
    const writingService = new WritingService();
    const analysis = await writingService.analyzeText(content, {
      level,
      topic,
      focusAreas,
    });

    // Atualizar exercício com análise
    await query(
      `UPDATE writing_exercises 
       SET corrections = $1,
           grammar_score = $2,
           vocabulary_score = $3,
           coherence_score = $4,
           overall_score = $5,
           status = $6
       WHERE id = $7`,
      [
        JSON.stringify({
          corrections: analysis.corrections,
          suggestions: analysis.suggestions,
          feedback: analysis.feedback,
        }),
        analysis.grammarScore,
        analysis.vocabularyScore,
        analysis.coherenceScore,
        analysis.overallScore,
        "analyzed",
        exercise.id,
      ]
    );

    // Atualizar progresso do usuário
    await query(
      `INSERT INTO progress_tracking (user_id, category, value)
       VALUES ($1, 'exercises_completed', 1)
       ON CONFLICT (user_id, category)
       DO UPDATE SET value = progress_tracking.value + 1`,
      [session.user.id]
    );

    return Response.json({
      exercise: {
        ...exercise,
        analysis,
      },
    });
  } catch (error) {
    console.error("Writing Analysis API Error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 