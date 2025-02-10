import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get exercise
    const [exercise] = await query({
      query: `
        SELECT
          id,
          title,
          content,
          topic,
          level,
          focus_areas,
          analysis,
          feedback,
          created_at,
          updated_at
        FROM writing_exercises
        WHERE id = ? AND user_id = ?
      `,
      values: [params.id, session.user.id],
    });

    if (!exercise) {
      return Response.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // Format exercise for response
    const formattedExercise = {
      id: exercise.id,
      title: exercise.title,
      content: exercise.content,
      topic: exercise.topic,
      level: exercise.level,
      focusAreas: exercise.focus_areas ? JSON.parse(exercise.focus_areas) : [],
      analysis: exercise.analysis ? JSON.parse(exercise.analysis) : null,
      feedback: exercise.feedback ? JSON.parse(exercise.feedback) : [],
      createdAt: exercise.created_at,
      updatedAt: exercise.updated_at,
    };

    return Response.json({ exercise: formattedExercise });
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 