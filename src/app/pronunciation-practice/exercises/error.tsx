"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ErrorExercises({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Exercises error:", error);
  }, [error]);

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          {error.message || "An error occurred while loading the exercises."}
        </p>
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
      </div>
    </div>
  );
} 