"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">
            Treinador de Inglês
          </Link>
          {session && (
            <nav className="hidden md:flex space-x-4">
              <Link href="/chat" className="hover:text-primary">
                Conversar
              </Link>
              <Link href="/write" className="hover:text-primary">
                Escrever
              </Link>
              <Link href="/profile" className="hover:text-primary">
                Perfil
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {status === "loading" ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          ) : session ? (
            <div className="flex items-center space-x-4">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || "Usuário"}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <Button variant="outline" onClick={() => signOut()}>
                Sair
              </Button>
            </div>
          ) : (
            <Link href="/auth/signin">
              <Button>Entrar</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 