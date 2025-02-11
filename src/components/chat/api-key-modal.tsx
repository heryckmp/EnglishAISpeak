"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <Card className="w-full max-w-lg p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">API Key Required</h2>
          <p className="text-muted-foreground">
            Please enter your Hugging Face API key to continue.
            You can get one from{" "}
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Hugging Face Settings
            </a>
            .
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="hf_..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={!key.trim()}>
            Save API Key
          </Button>
        </form>
      </Card>
    </div>
  );
} 