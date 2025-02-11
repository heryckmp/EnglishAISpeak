"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface WritingAnalysis {
  grammarScore: number;
  vocabularyScore: number;
  coherenceScore: number;
  overallScore: number;
  corrections: Array<{
    original: string;
    suggestion: string;
    explanation: string;
    type: "grammar" | "vocabulary" | "style";
    severity: "low" | "medium" | "high";
  }>;
  suggestions: Array<{
    category: string;
    text: string;
  }>;
  feedback: string;
}

export function WritingAssistant() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null);
  const [improvedText, setImprovedText] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const analyzeText = async () => {
    if (!text.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/writing/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, level: "intermediate" }),
      });

      if (!response.ok) throw new Error("Falha ao analisar texto");

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Erro ao analisar texto:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const improveText = async () => {
    if (!text.trim() || isImproving) return;

    setIsImproving(true);
    try {
      const response = await fetch("/api/writing/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, level: "intermediate" }),
      });

      if (!response.ok) throw new Error("Falha ao melhorar texto");

      const data = await response.json();
      setImprovedText(data.improved_text);
    } catch (error) {
      console.error("Erro ao melhorar texto:", error);
    } finally {
      setIsImproving(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const translateType = (type: string) => {
    switch (type) {
      case "grammar": return "gramática";
      case "vocabulary": return "vocabulário";
      case "style": return "estilo";
      default: return type;
    }
  };

  const translateSeverity = (severity: string) => {
    switch (severity) {
      case "high": return "alta";
      case "medium": return "média";
      case "low": return "baixa";
      default: return severity;
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">Assistente de Escrita em Inglês</h2>
        
        <div className="space-y-4">
          <Textarea
            placeholder="Digite seu texto em inglês aqui..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px]"
          />

          <div className="flex gap-4">
            <Button
              onClick={analyzeText}
              disabled={!text.trim() || isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                "Analisar Texto"
              )}
            </Button>

            <Button
              onClick={improveText}
              disabled={!text.trim() || isImproving}
              variant="outline"
              className="flex-1"
            >
              {isImproving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Melhorando...
                </>
              ) : (
                "Melhorar Texto"
              )}
            </Button>
          </div>
        </div>

        {analysis && (
          <div className="space-y-6 mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <div className="text-sm text-gray-600">Gramática</div>
                <div className={`text-xl font-bold ${getScoreColor(analysis.grammarScore)}`}>
                  {analysis.grammarScore}%
                </div>
              </div>
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <div className="text-sm text-gray-600">Vocabulário</div>
                <div className={`text-xl font-bold ${getScoreColor(analysis.vocabularyScore)}`}>
                  {analysis.vocabularyScore}%
                </div>
              </div>
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <div className="text-sm text-gray-600">Coerência</div>
                <div className={`text-xl font-bold ${getScoreColor(analysis.coherenceScore)}`}>
                  {analysis.coherenceScore}%
                </div>
              </div>
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <div className="text-sm text-gray-600">Geral</div>
                <div className={`text-xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}%
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Correções</h3>
              {analysis.corrections.map((correction, index) => (
                <div key={index} className="p-4 bg-gray-100 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Original:</span>
                    <span className={`text-sm ${getSeverityColor(correction.severity)}`}>
                      {translateType(correction.type)} - {translateSeverity(correction.severity)}
                    </span>
                  </div>
                  <p className="text-red-500 line-through">{correction.original}</p>
                  <p className="text-green-500">{correction.suggestion}</p>
                  <p className="text-sm text-gray-600">{correction.explanation}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sugestões de Melhoria</h3>
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-gray-100 rounded-lg">
                  <div className="font-medium text-sm text-gray-600">{suggestion.category}</div>
                  <p>{suggestion.text}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Feedback Geral</h3>
              <p className="text-gray-600">{analysis.feedback}</p>
            </div>
          </div>
        )}

        {improvedText && (
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold">Texto Melhorado</h3>
            <div className="p-4 bg-gray-100 rounded-lg whitespace-pre-wrap">
              {improvedText}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
} 