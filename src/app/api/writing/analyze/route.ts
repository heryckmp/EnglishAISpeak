import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, level } = body;

    const response = await fetch(`${process.env.LLM_API_URL}/writing/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, level }),
    });

    if (!response.ok) {
      throw new Error("Falha ao analisar texto");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na análise do texto:", error);
    return NextResponse.json(
      { error: "Falha ao analisar texto" },
      { status: 500 }
    );
  }
} 