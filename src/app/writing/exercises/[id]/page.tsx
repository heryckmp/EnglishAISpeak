"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WritingEditor } from "@/components/writing/writing-editor";
import { WritingAnalysis } from "@/components/writing/writing-analysis";

interface Exercise {
  id: string;
  title: string;
  content: string;
  topic?: string;
  level?: string;
  focusAreas?: string[];
  analysis?: any;
  feedback?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ExerciseDetailsPage() {
  const params = useParams();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExercise() {
      try {
        const response = await fetch(`/api/writing/exercises/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch exercise");
        }
        const data = await response.json();
        setExercise(data.exercise);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchExercise();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load exercise</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error || "Exercise not found"}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Exercise Editor */}
      <Card>
        <CardHeader>
          <CardTitle>{exercise.title || "Untitled Exercise"}</CardTitle>
          <CardDescription>
            {exercise.topic && `Topic: ${exercise.topic}`}
            {exercise.level && ` • Level: ${exercise.level}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WritingEditor
            initialContent={exercise.content}
            title={exercise.title}
            topic={exercise.topic}
            level={exercise.level}
            focusAreas={exercise.focusAreas}
          />
        </CardContent>
      </Card>

      {/* Analysis */}
      {exercise.analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis</CardTitle>
            <CardDescription>
              Detailed feedback on your writing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WritingAnalysis analysis={exercise.analysis} />
          </CardContent>
        </Card>
      )}

      {/* Feedback History */}
      {exercise.feedback && exercise.feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback History</CardTitle>
            <CardDescription>
              Previous feedback on your writing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exercise.feedback.map((feedback, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-muted"
                >
                  <p className="text-sm text-muted-foreground mb-2">
                    Feedback #{index + 1}
                  </p>
                  <p className="whitespace-pre-wrap">{feedback}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 