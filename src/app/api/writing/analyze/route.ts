import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { WritingService } from "@/lib/services/writing-service";
import { z } from "zod";

const analyzeRequestSchema = z.object({
  content: z.string().min(1),
  title: z.string().optional(),
  topic: z.string().optional(),
  level: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
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
    const validatedData = analyzeRequestSchema.parse(body);

    // Get or create exercise
    const [exercise] = await query({
      query: `
        INSERT INTO writing_exercises (
          user_id,
          content,
          title,
          topic,
          level,
          focus_areas
        )
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id, created_at, updated_at
      `,
      values: [
        session.user.id,
        validatedData.content,
        validatedData.title || null,
        validatedData.topic || null,
        validatedData.level || null,
        validatedData.focusAreas ? JSON.stringify(validatedData.focusAreas) : null,
      ],
    });

    // Analyze text
    const analysis = await WritingService.analyzeText(
      validatedData.content,
      validatedData.title,
      validatedData.topic,
      validatedData.level,
      validatedData.focusAreas
    );

    // Save analysis
    await query({
      query: `
        UPDATE writing_exercises
        SET analysis = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      values: [JSON.stringify(analysis), exercise.id],
    });

    return Response.json({
      id: exercise.id,
      analysis,
      createdAt: exercise.created_at,
      updatedAt: exercise.updated_at,
    });
  } catch (error) {
    console.error("Error analyzing text:", error);
    
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