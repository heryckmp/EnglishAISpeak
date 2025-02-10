import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's exercises
    const exercises = await query({
      query: `
        SELECT
          id,
          title,
          content,
          topic,
          level,
          analysis,
          created_at,
          updated_at
        FROM writing_exercises
        WHERE user_id = ?
        ORDER BY updated_at DESC
      `,
      values: [session.user.id],
    });

    // Format exercises for response
    const formattedExercises = exercises.map((exercise: any) => ({
      id: exercise.id,
      title: exercise.title,
      content: exercise.content,
      topic: exercise.topic,
      level: exercise.level,
      analysis: exercise.analysis ? JSON.parse(exercise.analysis) : null,
      createdAt: exercise.created_at,
      updatedAt: exercise.updated_at,
    }));

    return Response.json({ exercises: formattedExercises });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 