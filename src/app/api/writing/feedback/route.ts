import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { WritingService } from "@/lib/services/writing-service";
import { z } from "zod";

const feedbackRequestSchema = z.object({
  exerciseId: z.string().uuid(),
  content: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validatedData = feedbackRequestSchema.parse(body);

    // Check if exercise exists and belongs to user
    const [exercise] = await query({
      query: `
        SELECT feedback
        FROM writing_exercises
        WHERE id = ? AND user_id = ?
      `,
      values: [validatedData.exerciseId, session.user.id],
    });

    if (!exercise) {
      return Response.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // Get previous feedback
    const previousFeedback = exercise.feedback ? JSON.parse(exercise.feedback) : [];

    // Generate new feedback
    const feedback = await WritingService.generateFeedback(
      validatedData.content,
      previousFeedback
    );

    // Update exercise with new feedback
    await query({
      query: `
        UPDATE writing_exercises
        SET feedback = JSON_ARRAY_APPEND(
          COALESCE(feedback, JSON_ARRAY()),
          '$',
          ?
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      values: [feedback, validatedData.exerciseId],
    });

    return Response.json({ feedback });
  } catch (error) {
    console.error("Error generating feedback:", error);
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 