"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface ExerciseStats {
  date: string;
  averageScore: number;
  exercisesCompleted: number;
}

interface WritingProgress {
  totalExercises: number;
  averageScore: number;
  topicDistribution: Record<string, number>;
  recentProgress: ExerciseStats[];
}

export default function WritingProgressPage() {
  const [progress, setProgress] = useState<WritingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const response = await fetch("/api/writing/progress");
        if (!response.ok) {
          throw new Error("Failed to fetch progress");
        }
        const data = await response.json();
        setProgress(data.progress);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProgress();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading progress...</p>
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load progress</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error || "Progress not found"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Exercises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progress.totalExercises}
            </div>
            <p className="text-xs text-muted-foreground">
              Writing exercises completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progress.averageScore.toFixed(1)}/100
            </div>
            <p className="text-xs text-muted-foreground">
              Overall writing performance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Written Topic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(progress.topicDistribution)
                .sort(([, a], [, b]) => b - a)[0][0]}
            </div>
            <p className="text-xs text-muted-foreground">
              Your favorite writing topic
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Writing Progress</CardTitle>
          <CardDescription>
            Your writing scores over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={progress.recentProgress}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value: string) => format(new Date(value), "MMM d")}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  labelFormatter={(value: string) =>
                    format(new Date(value), "MMMM d, yyyy")
                  }
                />
                <Line
                  type="monotone"
                  dataKey="averageScore"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  name="Average Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Topic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Topic Distribution</CardTitle>
          <CardDescription>
            Number of exercises by topic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(progress.topicDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([topic, count]) => (
                <div key={topic} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{topic}</span>
                    <span className="text-muted-foreground">
                      {count} exercises
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(count / progress.totalExercises) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 