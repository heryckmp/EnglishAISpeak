import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { SpeechToText } from "@/lib/ai/speech-to-text";
import { TextToSpeech } from "@/lib/ai/text-to-speech";

// Função auxiliar para salvar arquivo de áudio
async function saveAudio(audioBlob: Blob, userId: string): Promise<string> {
  // TODO: Implementar salvamento do arquivo em um serviço de storage
  // Por enquanto, retornamos uma URL temporária
  return `temp-audio-${Date.now()}.wav`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Processar o FormData
    const formData = await req.formData();
    const audioFile = formData.get("audio");
    const level = formData.get("level") || "intermediate";

    if (!audioFile || !(audioFile instanceof Blob)) {
      return Response.json({ error: "Audio file is required" }, { status: 400 });
    }

    // Salvar o arquivo de áudio do usuário
    const audioUrl = await saveAudio(audioFile, session.user.id);

    // Transcrever o áudio
    const stt = new SpeechToText();
    let transcription: string;
    try {
      transcription = await stt.transcribeWithWhisper(audioFile);
    } catch (error) {
      console.error("Speech-to-text error:", error);
      transcription = "Failed to transcribe audio";
    }

    // Criar ou obter conversa
    const conversationResult = await query(
      `INSERT INTO conversations (user_id, title, context, level)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [session.user.id, "Voice Conversation", "voice", level]
    );
    const conversation = conversationResult.rows[0];

    // Armazenar mensagem do usuário
    const userMessageResult = await query(
      `INSERT INTO messages (conversation_id, user_id, content, role, audio_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [conversation.id, session.user.id, transcription, "user", audioUrl]
    );
    const userMessage = userMessageResult.rows[0];

    // TODO: Integrar com serviço de IA para resposta
    const aiResponse = "This is a placeholder AI response. AI integration pending.";

    // Gerar áudio da resposta
    const tts = new TextToSpeech();
    let aiAudioUrl: string;
    try {
      const aiAudioBlob = await tts.generateAudio(aiResponse, {
        lang: "en-US",
        rate: 0.9, // Ligeiramente mais lento para melhor compreensão
      });
      aiAudioUrl = await saveAudio(aiAudioBlob, session.user.id);
    } catch (error) {
      console.error("Text-to-speech error:", error);
      aiAudioUrl = await saveAudio(new Blob([], { type: "audio/wav" }), session.user.id);
    }

    // Armazenar resposta da IA
    const aiMessageResult = await query(
      `INSERT INTO messages (conversation_id, content, role, audio_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [conversation.id, aiResponse, "assistant", aiAudioUrl]
    );
    const aiMessage = aiMessageResult.rows[0];

    return Response.json({
      conversation,
      messages: [
        {
          ...userMessage,
          audioUrl: audioUrl,
        },
        {
          ...aiMessage,
          audioUrl: aiAudioUrl,
        },
      ],
    });
  } catch (error) {
    console.error("Voice Chat API Error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 