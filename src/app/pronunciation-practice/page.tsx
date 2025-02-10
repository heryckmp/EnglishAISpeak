"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PronunciationPracticePage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Exercises</CardTitle>
          <CardDescription>
            Practice with our curated collection of pronunciation exercises
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Choose from various difficulty levels and topics to improve your pronunciation skills.
          </p>
          <Button asChild>
            <Link href="/pronunciation-practice/exercises" className="w-full">
              Start Practicing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Real-time Feedback</CardTitle>
          <CardDescription>
            Get instant feedback on your pronunciation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Our AI-powered system analyzes your speech and provides detailed feedback to help you improve.
          </p>
          <Button variant="secondary" disabled>
            Coming Soon <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress Tracking</CardTitle>
          <CardDescription>
            Monitor your improvement over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Track your progress, view statistics, and identify areas for improvement.
          </p>
          <Button asChild>
            <Link href="/pronunciation-practice/progress" className="w-full">
              View Progress <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 