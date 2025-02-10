"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWriting } from "@/hooks/use-writing";
import { WritingAnalysis } from "./writing-analysis";

interface WritingEditorProps {
  initialContent?: string;
  title?: string;
  topic?: string;
  level?: string;
  focusAreas?: string[];
  onAnalysisComplete?: (analysis: any) => void;
}

export function WritingEditor({
  initialContent = "",
  title,
  topic,
  level,
  focusAreas,
  onAnalysisComplete,
}: WritingEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    exercise,
    isAnalyzing,
    error,
    analyzeText,
    getFeedback,
  } = useWriting({
    onAnalysisComplete,
  });

  // Efeito para análise automática após parar de digitar
  useEffect(() => {
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(async () => {
        setIsTyping(false);
        if (content.trim().length > 50) {
          try {
            await analyzeText(content, title, topic, level, focusAreas);
          } catch (error) {
            console.error("Auto-analysis error:", error);
          }
        }
      }, 2000); // Aguardar 2 segundos após parar de digitar
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [content, isTyping, analyzeText, title, topic, level, focusAreas]);

  // Handler para mudanças no texto
  const handleContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setContent(event.target.value);
    setIsTyping(true);
  };

  // Handler para análise manual
  const handleAnalyze = async () => {
    if (content.trim()) {
      try {
        await analyzeText(content, title, topic, level, focusAreas);
      } catch (error) {
        console.error("Manual analysis error:", error);
      }
    }
  };

  // Handler para feedback incremental
  const handleGetFeedback = async () => {
    if (content.trim()) {
      try {
        const feedback = await getFeedback(content);
        console.log("Feedback:", feedback);
      } catch (error) {
        console.error("Feedback error:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor */}
      <Card className="p-4">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing here..."
          className="w-full h-64 p-4 bg-background text-foreground resize-none focus:outline-none"
          disabled={isAnalyzing}
        />
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {content.length} characters
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={handleGetFeedback}
              disabled={isAnalyzing || !exercise}
            >
              Get Feedback
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !content.trim()}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-2 text-sm text-red-500">
            {error}
          </div>
        )}
      </Card>

      {/* Análise */}
      {exercise?.analysis && (
        <WritingAnalysis analysis={exercise.analysis} />
      )}
    </div>
  );
} 