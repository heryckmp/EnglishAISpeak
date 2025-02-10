import { useCallback, useEffect, useState } from "react";

export type ProgressCategory =
  | "practice_time"
  | "accuracy_rate"
  | "words_learned"
  | "conversations_completed"
  | "exercises_completed";

interface Progress {
  category: ProgressCategory;
  value: number;
  updated_at: string;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar progresso
  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch("/api/profile/progress");
      if (!response.ok) {
        throw new Error("Failed to fetch progress");
      }
      const data = await response.json();
      setProgress(data.progress);
      setError(null);
    } catch (err) {
      setError("Failed to load progress");
      console.error("Error fetching progress:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar progresso
  const updateProgress = useCallback(
    async (category: ProgressCategory, value: number) => {
      try {
        const response = await fetch("/api/profile/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category, value }),
        });

        if (!response.ok) {
          throw new Error("Failed to update progress");
        }

        // Atualizar estado local
        setProgress((prev) => {
          const updated = [...prev];
          const index = updated.findIndex((p) => p.category === category);
          if (index >= 0) {
            updated[index] = {
              ...updated[index],
              value,
              updated_at: new Date().toISOString(),
            };
          } else {
            updated.push({
              category,
              value,
              updated_at: new Date().toISOString(),
            });
          }
          return updated;
        });

        setError(null);
      } catch (err) {
        setError("Failed to update progress");
        console.error("Error updating progress:", err);
      }
    },
    []
  );

  // Incrementar progresso
  const incrementProgress = useCallback(
    async (category: ProgressCategory, increment: number = 1) => {
      const currentProgress = progress.find((p) => p.category === category);
      const currentValue = currentProgress?.value || 0;
      await updateProgress(category, currentValue + increment);
    },
    [progress, updateProgress]
  );

  // Buscar progresso inicial
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    updateProgress,
    incrementProgress,
    refreshProgress: fetchProgress,
  };
} 