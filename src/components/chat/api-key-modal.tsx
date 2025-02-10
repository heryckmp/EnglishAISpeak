"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApiKey } from "@/hooks/use-api-key";

export function ApiKeyModal() {
  const [key, setKey] = useState("");
  const { setKey: saveKey } = useApiKey();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      saveKey(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>API Key Necessária</CardTitle>
          <CardDescription>
            Para usar o chat, você precisa fornecer uma chave API do OpenRouter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Obtenha sua chave em:{" "}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  openrouter.ai/keys
                </a>
              </p>
              <Input
                type="password"
                placeholder="Cole sua API key aqui"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={!key.trim()}>
              Salvar e Continuar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 