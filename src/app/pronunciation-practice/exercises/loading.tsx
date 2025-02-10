import { Loader2 } from "lucide-react";

export default function LoadingExercises() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-4 w-96 bg-muted animate-pulse rounded" />
      </div>

      <div className="flex gap-4">
        <div className="w-1/3 space-y-2">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
        </div>
        <div className="w-1/3 space-y-2">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 space-y-4 border rounded-lg bg-card animate-pulse"
          >
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-muted rounded-full" />
              <div className="h-6 w-24 bg-muted rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-3">Loading exercises...</span>
      </div>
    </div>
  );
} 