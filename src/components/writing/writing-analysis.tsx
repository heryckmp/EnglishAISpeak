"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface WritingAnalysisProps {
  analysis: WritingAnalysis;
}

export function WritingAnalysis({ analysis }: WritingAnalysisProps) {
  // Função para obter cor baseada na pontuação
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // Função para obter cor baseada na severidade
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      default:
        return "text-green-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Pontuações */}
      <Card>
        <CardHeader>
          <CardTitle>Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}%
              </div>
              <div className="text-sm text-muted-foreground">Overall</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(analysis.grammarScore)}`}>
                {analysis.grammarScore}%
              </div>
              <div className="text-sm text-muted-foreground">Grammar</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(analysis.vocabularyScore)}`}>
                {analysis.vocabularyScore}%
              </div>
              <div className="text-sm text-muted-foreground">Vocabulary</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(analysis.coherenceScore)}`}>
                {analysis.coherenceScore}%
              </div>
              <div className="text-sm text-muted-foreground">Coherence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Correções */}
      <Card>
        <CardHeader>
          <CardTitle>Corrections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.corrections.map((correction, index) => (
              <div
                key={index}
                className="p-4 bg-muted rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${getSeverityColor(correction.severity)}`}>
                    {correction.type.charAt(0).toUpperCase() + correction.type.slice(1)}
                  </span>
                  <span className={`text-xs ${getSeverityColor(correction.severity)}`}>
                    {correction.severity.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="line-through text-muted-foreground">
                    {correction.original}
                  </div>
                  <div className="font-medium">
                    {correction.suggestion}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {correction.explanation}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sugestões */}
      <Card>
        <CardHeader>
          <CardTitle>Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 bg-muted rounded-lg space-y-2"
              >
                <div className="font-medium">
                  {suggestion.category}
                </div>
                <div className="text-sm text-muted-foreground">
                  {suggestion.text}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Geral */}
      <Card>
        <CardHeader>
          <CardTitle>General Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground whitespace-pre-line">
            {analysis.feedback}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 