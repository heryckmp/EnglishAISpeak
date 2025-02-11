"use client";

import { useCompletion } from "ai/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function CompletionPage() {
  const {
    completion,
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
  } = useCompletion({
    api: "/api/completion",
  });

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">AI Text Completion</h1>

      <Card className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Enter your prompt:
            </label>
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading || !input}
              className="w-32"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </form>

        {completion && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Response:</label>
            <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
              {completion}
            </div>
          </div>
        )}
      </Card>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          This demo uses the Google Flan-T5 model to generate text completions.
          The responses are streamed in real-time as they are generated.
        </p>
      </div>
    </div>
  );
} 