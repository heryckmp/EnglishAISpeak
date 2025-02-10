import { useState, useCallback } from "react";

interface WritingAnalysis {
  grammar: {
    score: number;
    errors: Array<{
      type: string;
      message: string;
      suggestion: string;
      severity: "low" | "medium" | "high";
      context: {
        text: string;
        offset: number;
        length: number;
      };
    }>;
  };
  vocabulary: {
    score: number;
    suggestions: Array<{
      original: string;
      suggestions: string[];
      context: string;
      reason: string;
    }>;
  };
  coherence: {
    score: number;
    feedback: Array<{
      aspect: string;
      comment: string;
      suggestion: string;
    }>;
  };
  overallScore: number;
  generalFeedback: string[];
}

interface Exercise {
  id: string;
  content: string;
  title?: string;
  topic?: string;
  level?: string;
  focusAreas?: string[];
  analysis?: WritingAnalysis;
  feedback?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface UseWritingProps {
  onAnalysisComplete?: (analysis: WritingAnalysis) => void;
}

export function useWriting({ onAnalysisComplete }: UseWritingProps = {}) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeText = useCallback(async (
    content: string,
    title?: string,
    topic?: string,
    level?: string,
    focusAreas?: string[]
  ) => {
    if (!content.trim()) {
      setError("Please enter some text to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/writing/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          title,
          topic,
          level,
          focusAreas,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze text");
      }

      const data = await response.json();
      
      setExercise({
        id: data.id,
        content,
        title,
        topic,
        level,
        focusAreas,
        analysis: data.analysis,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      });

      if (onAnalysisComplete) {
        onAnalysisComplete(data.analysis);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalysisComplete]);

  const getFeedback = useCallback(async (content: string) => {
    if (!exercise?.id) {
      setError("No active exercise found");
      return;
    }

    try {
      const response = await fetch("/api/writing/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exerciseId: exercise.id,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get feedback");
      }

      const data = await response.json();
      
      setExercise(prev => {
        if (!prev) return null;
        return {
          ...prev,
          feedback: [...(prev.feedback || []), data.feedback],
          updatedAt: new Date(),
        };
      });

      return data.feedback;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    }
  }, [exercise?.id]);

  return {
    exercise,
    isAnalyzing,
    error,
    analyzeText,
    getFeedback,
  };
} 