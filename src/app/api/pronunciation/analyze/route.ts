import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob;
    const expectedText = formData.get("expectedText") as string;

    if (!audioFile) {
      return Response.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Convert Blob to File for OpenAI API
    const file = new File([audioFile], "audio.wav", { type: "audio/wav" });

    // Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "en",
    });

    // Analyze pronunciation using GPT-4
    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional English pronunciation coach. Analyze the pronunciation by comparing the expected text with the transcribed text. Provide detailed feedback on accuracy, fluency, and specific pronunciation errors. Format your response as a JSON object with the following structure:
          {
            "overallScore": number (0-100),
            "accuracy": number (0-100),
            "fluency": number (0-100),
            "errors": [
              {
                "type": "missing_word" | "mispronounced" | "extra_word",
                "word": string,
                "expected": string,
                "transcribed": string,
                "position": number
              }
            ],
            "feedback": {
              "strengths": string[],
              "improvements": string[],
              "generalComment": string
            }
          }`,
        },
        {
          role: "user",
          content: `Expected text: "${expectedText}"
Transcribed text: "${transcription.text}"

Analyze the pronunciation and provide feedback.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = analysis.choices[0].message.content;
    if (!content) {
      throw new Error("No analysis result received");
    }

    const result = JSON.parse(content);

    // Store analysis in database
    await query({
      query: `INSERT INTO pronunciation_analyses 
        (user_id, expected_text, transcribed_text, analysis)
        VALUES (?, ?, ?, ?)`,
      values: [
        session.user.id,
        expectedText,
        transcription.text,
        JSON.stringify(result),
      ],
    });

    return Response.json({
      transcript: transcription.text,
      analysis: result,
    });
  } catch (error) {
    console.error("Pronunciation analysis error:", error);
    return Response.json(
      { error: "Failed to analyze pronunciation" },
      { status: 500 }
    );
  }
} 