import { NextRequest } from 'next/server';
import { ChatService } from '@/lib/ai/chat-service';
import { EnglishLevel } from '@/lib/prompts/english-training';

const chatService = new ChatService(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { topic, level } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await chatService.startConversation(
      topic,
      level as EnglishLevel
    );

    return new Response(JSON.stringify({ message: response }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to start conversation' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 