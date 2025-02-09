import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, title } = await req.json();

    if (!content) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }

    // Create writing exercise
    const result = await query(
      `INSERT INTO writing_exercises (user_id, title, content, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [session.user.id, title, content, "draft"]
    );
    const exercise = result.rows[0];

    // TODO: Integrate with AI service for analysis
    const analysis = {
      grammarScore: 0,
      vocabularyLevel: "intermediate",
      suggestions: [],
      improvements: [],
    };

    // Update exercise with analysis
    await query(
      `UPDATE writing_exercises 
       SET corrections = $1, status = $2
       WHERE id = $3`,
      [JSON.stringify(analysis), "analyzed", exercise.id]
    );

    return Response.json({
      exercise,
      analysis,
    });
  } catch (error) {
    console.error("Writing Analysis API Error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 