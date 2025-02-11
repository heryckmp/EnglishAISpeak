import { useState } from "react";
import { useApiKey } from "./use-api-key";

interface WritingAnalysis {
  grammarScore: number;
  vocabularyScore: number;
  coherenceScore: number;
  overallScore: number;
  corrections: {
    original: string;
    suggestion: string;
    explanation: string;
    type: "grammar" | "vocabulary" | "style";
    severity: "low" | "medium" | "high";
  }[];
  suggestions: {
    category: string;
    text: string;
  }[];
  feedback: string;
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
  const { apiKey, isKeySet } = useApiKey();

  const analyzeText = async (
    content: string,
    title?: string,
    topic?: string,
    level?: string,
    focusAreas?: string[]
  ) => {
    if (!isKeySet || !apiKey) {
      setError("Please set your OpenRouter API key first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/write/analyze", {
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
          apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze text");
      }

      setExercise(data.exercise);
      if (onAnalysisComplete && data.exercise.analysis) {
        onAnalysisComplete(data.exercise.analysis);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFeedback = async (content: string) => {
    if (!isKeySet || !apiKey) {
      setError("Please set your OpenRouter API key first");
      return;
    }

    try {
      const response = await fetch("/api/write/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          exerciseId: exercise?.id,
          apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get feedback");
      }

      return data.feedback;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  return {
    exercise,
    isAnalyzing,
    error,
    analyzeText,
    getFeedback,
  };
} 