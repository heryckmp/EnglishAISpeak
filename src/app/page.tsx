import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Domine o Inglês com IA
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Pratique conversas, melhore sua escrita e aprimore suas habilidades em inglês com nossa plataforma alimentada por IA.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/auth/signin">
                <Button size="lg">Começar Agora</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Prática de Conversação</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Participe de conversas naturais com nossa IA para melhorar suas habilidades de fala.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Assistente de Escrita</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Receba feedback em tempo real sobre sua escrita com sugestões de gramática e estilo.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Acompanhamento de Progresso</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Monitore sua evolução com análises detalhadas e insights sobre seu aprendizado.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 