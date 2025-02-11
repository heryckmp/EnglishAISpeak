"use client";

import { Card } from "@/components/ui/card";

export default function TutorialPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">Tutorial de Instalação</h1>

      <Card className="p-6 space-y-6">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Modelos de IA Suportados</h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              O projeto suporta diferentes modelos de linguagem (LLMs) através do LM Studio:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mistral</li>
              <li>Llama 2</li>
              <li>Phi-2</li>
              <li>Qualquer outro modelo compatível com o LM Studio</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Como configurar o LM Studio:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Baixe e instale o LM Studio de <a href="https://lmstudio.ai/" className="text-blue-600 hover:underline">https://lmstudio.ai/</a></li>
              <li>Baixe o modelo de sua preferência através da interface do LM Studio</li>
              <li>Inicie o servidor local na porta 1234 (padrão)</li>
              <li>Configure o arquivo .env com as informações do seu modelo</li>
            </ol>
            <div className="bg-gray-100 p-4 rounded-lg mt-4">
              <p className="font-medium">Configurações Recomendadas:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Context Length: 4096</li>
                <li>Temperature: 0.7</li>
                <li>Top P: 0.95</li>
                <li>Max Tokens: 2048</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Pré-requisitos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Node.js 18+ instalado</li>
            <li>Python 3.8+ instalado</li>
            <li>PostgreSQL instalado</li>
            <li>LM Studio instalado</li>
            <li>Conta Ngrok (gratuita)</li>
          </ul>
        </section>
      </Card>
    </div>
  );
}