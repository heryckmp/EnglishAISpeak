"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WRITING_PROMPTS = [
  {
    title: "Daily Routine",
    description: "Describe your typical day from morning to evening",
    type: "Personal",
  },
  {
    title: "Movie Review",
    description: "Write a review of the last movie you watched",
    type: "Entertainment",
  },
  {
    title: "Dream Vacation",
    description: "Describe your ideal vacation destination",
    type: "Travel",
  },
  {
    title: "Technology Impact",
    description: "How has technology changed your life?",
    type: "Opinion",
  },
];

export default function WritePage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/write/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setFeedback(data);
      }
    } catch (error) {
      console.error("Failed to analyze:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Writing Assistant</h1>
        <p className="text-muted-foreground">
          Improve your writing skills with real-time feedback and suggestions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Writing Prompts */}
        <Card className="md:col-span-1 p-4">
          <h2 className="font-semibold mb-4">Writing Prompts</h2>
          <div className="space-y-4">
            {WRITING_PROMPTS.map((prompt) => (
              <div
                key={prompt.title}
                className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                onClick={() => {
                  setTitle(prompt.title);
                  setContent("");
                  setFeedback(null);
                }}
              >
                <div className="font-medium">{prompt.title}</div>
                <div className="text-sm text-muted-foreground">
                  {prompt.description}
                </div>
                <div className="text-xs mt-1 text-primary">{prompt.type}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Writing Area */}
        <div className="md:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="mb-4">
              <Input
                placeholder="Title of your writing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium"
              />
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing here..."
              className="w-full h-[400px] p-4 rounded-md border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {content.length} characters | {content.split(/\s+/).filter(Boolean).length} words
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!content.trim() || isAnalyzing}
              >
                {isAnalyzing ? "Analyzing..." : "Get Feedback"}
              </Button>
            </div>
          </Card>

          {/* Feedback Area */}
          {feedback && (
            <Card className="p-4">
              <h2 className="font-semibold mb-4">Writing Analysis</h2>
              <div className="space-y-4">
                {/* Grammar Score */}
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>Grammar Score</span>
                  <span className="font-bold">Coming Soon</span>
                </div>
                
                {/* Vocabulary Usage */}
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>Vocabulary Level</span>
                  <span className="font-bold">Coming Soon</span>
                </div>

                {/* Suggestions */}
                <div>
                  <h3 className="font-medium mb-2">Suggestions</h3>
                  <div className="text-muted-foreground">
                    Analysis feature coming soon...
                  </div>
                </div>

                {/* Improvements */}
                <div>
                  <h3 className="font-medium mb-2">Recommended Improvements</h3>
                  <div className="text-muted-foreground">
                    Detailed feedback will be available soon...
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 