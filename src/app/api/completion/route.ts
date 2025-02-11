import { LocalLLMClient } from "@/lib/ai/local-llm-client";

const client = new LocalLLMClient();

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response('Prompt is required', { status: 400 });
    }

    const response = await client.generateText(prompt, {
      maxTokens: 200,
      temperature: 0.7,
      topP: 0.95,
      repetitionPenalty: 1.1,
    });

    return new Response(JSON.stringify({ text: response.text }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response('Error processing your request', { status: 500 });
  }
} 