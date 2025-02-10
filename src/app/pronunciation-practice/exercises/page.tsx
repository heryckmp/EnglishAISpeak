"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { TextPlayer } from "@/components/pronunciation/text-player";
import { VoiceRecorder } from "@/components/pronunciation/voice-recorder";
import { AnalysisResult } from "@/components/pronunciation/analysis-result";

interface Exercise {
  id: string;
  title: string;
  text: string;
  level: "beginner" | "intermediate" | "advanced";
  topic: string;
  focusAreas: string[];
}

const SAMPLE_EXERCISES: Exercise[] = [
  {
    id: "1",
    title: "Basic Greetings",
    text: "Hello! How are you today? It's nice to meet you.",
    level: "beginner",
    topic: "greetings",
    focusAreas: ["intonation", "basic sounds"],
  },
  {
    id: "2",
    title: "Weather Description",
    text: "The weather is quite pleasant today. The sun is shining and there's a gentle breeze.",
    level: "intermediate",
    topic: "weather",
    focusAreas: ["word stress", "vowel sounds"],
  },
  {
    id: "3",
    title: "Professional Conversation",
    text: "I'd like to schedule a meeting to discuss the project requirements and timeline.",
    level: "advanced",
    topic: "business",
    focusAreas: ["rhythm", "consonant clusters"],
  },
];

export default function ExercisesPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [transcribedText, setTranscribedText] = useState<string>("");

  const filteredExercises = SAMPLE_EXERCISES.filter((exercise) => {
    if (selectedLevel !== "all" && exercise.level !== selectedLevel) return false;
    if (selectedTopic !== "all" && exercise.topic !== selectedTopic) return false;
    return true;
  });

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setAnalysisResult(null);
    setTranscribedText("");
  };

  const handleRecordingComplete = async (
    audioBlob: Blob,
    transcript: string,
    analysis: any
  ) => {
    setTranscribedText(transcript);
    setAnalysisResult(analysis);
    setIsProcessing(false);
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pronunciation Exercises</h1>
        <p className="text-muted-foreground">
          Practice your pronunciation with these exercises. Listen to the correct pronunciation,
          record yourself, and get instant feedback.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="w-1/3">
          <label className="text-sm font-medium">Level</label>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-1/3">
          <label className="text-sm font-medium">Topic</label>
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger>
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              <SelectItem value="greetings">Greetings</SelectItem>
              <SelectItem value="weather">Weather</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredExercises.map((exercise) => (
          <Card
            key={exercise.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedExercise?.id === exercise.id ? "border-primary" : ""
            }`}
            onClick={() => handleExerciseSelect(exercise)}
          >
            <CardHeader>
              <CardTitle>{exercise.title}</CardTitle>
              <CardDescription>Level: {exercise.level}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{exercise.text}</p>
              <div className="flex gap-2">
                {exercise.focusAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedExercise && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedExercise.title}</CardTitle>
            <CardDescription>
              Listen to the correct pronunciation and practice speaking the text.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-medium">Text to Practice</h4>
              <p className="text-lg">{selectedExercise.text}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Listen</h4>
              <TextPlayer text={selectedExercise.text} />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Record Your Voice</h4>
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                expectedText={selectedExercise.text}
                isProcessing={isProcessing}
              />
            </div>

            {analysisResult && (
              <AnalysisResult
                analysis={analysisResult}
                expectedText={selectedExercise.text}
                transcribedText={transcribedText}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 