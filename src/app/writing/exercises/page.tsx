"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

interface Exercise {
  id: string;
  title: string;
  content: string;
  topic?: string;
  level?: string;
  analysis?: {
    overallScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExercises() {
      try {
        const response = await fetch("/api/writing/exercises");
        if (!response.ok) {
          throw new Error("Failed to fetch exercises");
        }
        const data = await response.json();
        setExercises(data.exercises);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchExercises();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading exercises...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load exercises</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (exercises.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Exercises Found</CardTitle>
          <CardDescription>
            You haven't created any writing exercises yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Start practicing your writing skills by creating a new exercise.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/writing">
            <Button>Create Exercise</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Exercises</h3>
        <Link href="/writing">
          <Button>New Exercise</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell className="font-medium">
                    {exercise.title || "Untitled"}
                  </TableCell>
                  <TableCell>{exercise.topic || "-"}</TableCell>
                  <TableCell>{exercise.level || "-"}</TableCell>
                  <TableCell>
                    {exercise.analysis?.overallScore
                      ? `${exercise.analysis.overallScore}/100`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(exercise.updatedAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <Link href={`/writing/exercises/${exercise.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 