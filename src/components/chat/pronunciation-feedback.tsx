"use client";

import React from "react";
import { Card } from "@/components/ui/card";

interface PronunciationFeedbackProps {
  text: string;
  feedback: PronunciationFeedback[];
}

interface PronunciationFeedback {
  word: string;
  start: number;
  end: number;
  confidence: number;
  suggestion?: string;
  explanation?: string;
}

export function PronunciationFeedback({ text, feedback }: PronunciationFeedbackProps) {
  // Função para colorir palavras com base na confiança
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-500";
    if (confidence >= 0.6) return "text-yellow-500";
    return "text-red-500";
  };

  // Função para renderizar o texto com destaque
  const renderHighlightedText = () => {
    let lastIndex = 0;
    const elements: JSX.Element[] = [];

    feedback.forEach((item, index) => {
      // Adicionar texto antes da palavra destacada
      if (item.start > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, item.start)}
          </span>
        );
      }

      // Adicionar palavra destacada
      elements.push(
        <span
          key={`word-${index}`}
          className={`relative group ${getConfidenceColor(item.confidence)}`}
        >
          {text.slice(item.start, item.end)}
          
          {/* Tooltip com feedback */}
          {(item.suggestion || item.explanation) && (
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-popover text-popover-foreground text-sm p-2 rounded shadow-lg whitespace-nowrap">
              {item.suggestion && (
                <div className="font-medium">
                  Suggestion: {item.suggestion}
                </div>
              )}
              {item.explanation && (
                <div className="text-xs text-muted-foreground">
                  {item.explanation}
                </div>
              )}
            </span>
          )}
        </span>
      );

      lastIndex = item.end;
    });

    // Adicionar texto restante
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-final">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-medium">Pronunciation Feedback</h3>

      {/* Texto com destaque */}
      <div className="text-lg leading-relaxed">
        {renderHighlightedText()}
      </div>

      {/* Lista de sugestões */}
      <div className="space-y-2">
        {feedback.filter(item => item.confidence < 0.8).map((item, index) => (
          <div key={index} className="text-sm space-y-1">
            <div className={`font-medium ${getConfidenceColor(item.confidence)}`}>
              "{text.slice(item.start, item.end)}"
              {item.suggestion && ` → "${item.suggestion}"`}
            </div>
            {item.explanation && (
              <div className="text-muted-foreground">
                {item.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Score geral */}
      <div className="flex items-center justify-between text-sm">
        <span>Overall Score:</span>
        <span className={getConfidenceColor(
          feedback.reduce((acc, item) => acc + item.confidence, 0) / feedback.length
        )}>
          {Math.round(
            (feedback.reduce((acc, item) => acc + item.confidence, 0) / feedback.length) * 100
          )}%
        </span>
      </div>
    </Card>
  );
} 