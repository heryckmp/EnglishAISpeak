"use client";

import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  corrections?: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
}

export function ChatMessage({ content, role, corrections }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex flex-col space-y-2 max-w-[80%] rounded-lg p-4",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <p className="text-sm">{content}</p>
        {corrections && corrections.length > 0 && (
          <div className="mt-2 pt-2 border-t border-primary/20">
            <p className="text-xs font-medium mb-1">Corrections:</p>
            {corrections.map((correction, index) => (
              <div key={index} className="text-xs space-y-1">
                <p>
                  <span className="line-through opacity-70">
                    {correction.original}
                  </span>{" "}
                  → <span className="font-medium">{correction.corrected}</span>
                </p>
                <p className="text-xs opacity-80">{correction.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 