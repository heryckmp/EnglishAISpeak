import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { WritingService } from "@/lib/ai/writing-service";
import { z } from "zod";

const promptRequestSchema = z.object({
  topic: z.string().optional(),
  level: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = promptRequestSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { topic, level } = result.data;

    const writingService = new WritingService();
    const prompt = await writingService.generateWritingPrompt(topic, level);

    return Response.json({ prompt });
  } catch (error) {
    console.error("Writing Prompt API Error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 