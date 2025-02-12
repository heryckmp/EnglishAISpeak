"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container max-w-4xl min-h-screen py-8 space-y-8">
      {/* Header com GitHub */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">English AI Trainer</h1>
        <a
          href="https://github.com/heryckmp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="opacity-75 hover:opacity-100 transition-opacity"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="font-medium">Created by @heryckmp</span>
        </a>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Bem-vindo ao English AI Trainer!</h2>
          
          <p className="text-gray-600">
            Uma plataforma moderna para aprendizado de inglês usando Inteligência Artificial.
            Pratique conversação, pronúncia e escrita com feedback em tempo real.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Características:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Conversação em inglês com IA</li>
                <li>Prática de pronúncia com feedback</li>
                <li>Exercícios personalizados</li>
                <li>Sistema de conquistas</li>
                <li>Interface moderna e responsiva</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Tecnologias:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Next.js 13+</li>
                <li>TypeScript</li>
                <li>TailwindCSS</li>
                <li>FastAPI</li>
                <li>PostgreSQL</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/chat" className="flex-1">
              <Button className="w-full" size="lg">
                Iniciar Chat
              </Button>
            </Link>
            <Link href="/tutorial" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                Ver Tutorial
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
} 