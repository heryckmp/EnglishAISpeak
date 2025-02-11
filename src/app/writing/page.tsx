"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { ENGLISH_LEVELS, type EnglishLevel } from '@/lib/prompts/english-training';

interface WritingAnalysis {
  grammarScore: number;
  vocabularyScore: number;
  coherenceScore: number;
  overallScore: number;
  corrections: {
    original: string;
    suggestion: string;
    explanation: string;
  }[];
  suggestions: {
    category: string;
    text: string;
  }[];
  feedback: string;
}

export default function WritingPage() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<EnglishLevel>('intermediate');
  const [prompt, setPrompt] = useState('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null);

  const generatePrompt = async () => {
    if (!topic) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/writing/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, level }),
      });

      if (!response.ok) throw new Error('Failed to generate prompt');

      const data = await response.json();
      setPrompt(data.prompt);
      setText('');
      setAnalysis(null);
    } catch (error) {
      console.error('Error generating prompt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeText = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/writing/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, level }),
      });

      if (!response.ok) throw new Error('Failed to analyze text');

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-bold mb-4">English Writing Practice</h1>
      
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="topic">Writing Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., 'My Dream Vacation', 'Technology in Daily Life')"
              disabled={isLoading}
            />
          </div>
          
          <div className="w-48">
            <Label htmlFor="level">English Level</Label>
            <Select value={level} onValueChange={(value: EnglishLevel) => setLevel(value)}>
              <SelectTrigger id="level">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ENGLISH_LEVELS).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value} ({key})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={generatePrompt}
            disabled={!topic || isLoading}
            className="self-end"
          >
            Generate Prompt
          </Button>
        </div>
      </div>

      {prompt && (
        <Card className="mb-4 p-4">
          <h2 className="font-semibold mb-2">Writing Prompt:</h2>
          <p className="text-muted-foreground">{prompt}</p>
        </Card>
      )}

      <div className="mb-4">
        <Label htmlFor="text">Your Writing</Label>
        <Textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your text here..."
          className="min-h-[200px]"
          disabled={isLoading}
        />
        <Button
          onClick={analyzeText}
          disabled={!text.trim() || isLoading}
          className="mt-2"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : 'Analyze Writing'}
        </Button>
      </div>

      {analysis && (
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{analysis.grammarScore}</div>
              <div className="text-sm text-muted-foreground">Grammar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analysis.vocabularyScore}</div>
              <div className="text-sm text-muted-foreground">Vocabulary</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analysis.coherenceScore}</div>
              <div className="text-sm text-muted-foreground">Coherence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analysis.overallScore}</div>
              <div className="text-sm text-muted-foreground">Overall</div>
            </div>
          </div>

          {analysis.corrections.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Corrections:</h3>
              <ul className="space-y-2">
                {analysis.corrections.map((correction, index) => (
                  <li key={index} className="bg-muted p-2 rounded">
                    <div className="text-red-500 line-through">{correction.original}</div>
                    <div className="text-green-500">{correction.suggestion}</div>
                    <div className="text-sm text-muted-foreground">{correction.explanation}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Suggestions for Improvement:</h3>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="bg-muted p-2 rounded">
                    <span className="font-medium">{suggestion.category}:</span>{" "}
                    {suggestion.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Feedback:</h3>
            <p className="text-muted-foreground">{analysis.feedback}</p>
          </div>
        </Card>
      )}
    </div>
  );
} 