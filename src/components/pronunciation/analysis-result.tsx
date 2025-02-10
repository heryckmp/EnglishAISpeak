"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface PronunciationError {
  type: "missing_word" | "mispronounced" | "extra_word";
  word: string;
  expected: string;
  transcribed: string;
  position: number;
}

interface PronunciationFeedback {
  strengths: string[];
  improvements: string[];
  generalComment: string;
}

interface PronunciationAnalysis {
  overallScore: number;
  accuracy: number;
  fluency: number;
  errors: PronunciationError[];
  feedback: PronunciationFeedback;
}

interface AnalysisResultProps {
  analysis: PronunciationAnalysis;
  expectedText: string;
  transcribedText: string;
}

export function AnalysisResult({
  analysis,
  expectedText,
  transcribedText,
}: AnalysisResultProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getErrorTypeColor = (type: PronunciationError["type"]) => {
    switch (type) {
      case "missing_word":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "mispronounced":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "extra_word":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Pronunciation Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Score</span>
              <span className={`text-lg font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}%
              </span>
            </div>
            <Progress value={analysis.overallScore} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Accuracy</span>
              <Progress value={analysis.accuracy} className="h-2" />
              <span className={`text-sm ${getScoreColor(analysis.accuracy)}`}>
                {analysis.accuracy}%
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Fluency</span>
              <Progress value={analysis.fluency} className="h-2" />
              <span className={`text-sm ${getScoreColor(analysis.fluency)}`}>
                {analysis.fluency}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Strengths */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Strengths
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {analysis.feedback.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Areas for Improvement
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {analysis.feedback.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </div>

          {/* General Comment */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              General Comment
            </h4>
            <p className="text-sm">{analysis.feedback.generalComment}</p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Expected vs Transcribed */}
          <div className="grid gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Expected Text</h4>
              <p className="text-sm p-3 bg-muted rounded-md">{expectedText}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Your Speech</h4>
              <p className="text-sm p-3 bg-muted rounded-md">{transcribedText}</p>
            </div>
          </div>

          {/* Errors */}
          {analysis.errors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Pronunciation Errors</h4>
              <div className="space-y-2">
                {analysis.errors.map((error, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm p-2 rounded-md bg-muted"
                  >
                    <Badge className={getErrorTypeColor(error.type)}>
                      {error.type}
                    </Badge>
                    <div>
                      <p>
                        <span className="font-medium">Word: </span>
                        {error.word}
                      </p>
                      {error.type === "mispronounced" && (
                        <p>
                          <span className="font-medium">Expected: </span>
                          {error.expected}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 