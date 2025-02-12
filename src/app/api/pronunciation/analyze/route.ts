import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import config from "@/lib/config";

async function transcribeAudio(audioFile: Blob): Promise<string> {
  // TODO: Implementar uma solução de transcrição local
  // Por enquanto, retornamos uma mensagem informativa
  console.warn("Audio transcription is not implemented yet", { audioSize: audioFile.size });
  return "Audio transcription not available - using LM Studio for text analysis only";
}

async function analyzePronunciation(expectedText: string, transcribedText: string) {
  try {
    const response = await fetch(`${config.llm.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "local-model",
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
            }`
          },
          {
            role: "user",
            content: `Expected text: "${expectedText}"
Transcribed text: "${transcribedText}"

Analyze the pronunciation and provide feedback.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`LM Studio API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    if (!content) {
      throw new Error("No analysis result received");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing pronunciation:", error);
    throw new Error("Failed to analyze pronunciation");
  }
}

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

    // Transcribe audio (temporariamente retornando mensagem padrão)
    const transcription = await transcribeAudio(audioFile);

    // Analyze pronunciation using LM Studio
    const result = await analyzePronunciation(expectedText, transcription);

    // Store analysis in database
    await query(
      `INSERT INTO pronunciation_analyses 
        (user_id, expected_text, transcribed_text, analysis)
        VALUES ($1, $2, $3, $4)`,
      [
        session.user.id,
        expectedText,
        transcription,
        JSON.stringify(result),
      ]
    );

    return Response.json({
      transcript: transcription,
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