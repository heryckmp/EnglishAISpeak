"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { WritingEditor } from "@/components/writing/writing-editor";

const topics = [
  "Daily Life",
  "Travel",
  "Technology",
  "Environment",
  "Education",
  "Culture",
  "Business",
  "Health",
  "Sports",
  "Entertainment",
];

const levels = [
  "Beginner (A1)",
  "Elementary (A2)",
  "Intermediate (B1)",
  "Upper Intermediate (B2)",
  "Advanced (C1)",
  "Mastery (C2)",
];

const focusAreas = [
  "Grammar",
  "Vocabulary",
  "Coherence",
  "Style",
  "Punctuation",
  "Sentence Structure",
];

export default function WritingPage() {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);

  const handleFocusAreaToggle = (area: string) => {
    setSelectedFocusAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Writing Exercise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exercise Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Enter a title for your writing"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map(t => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Level</label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(l => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Focus Areas</label>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map(area => (
                  <Button
                    key={area}
                    variant={selectedFocusAreas.includes(area) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFocusAreaToggle(area)}
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Writing Editor */}
          <WritingEditor
            title={title}
            topic={topic}
            level={level}
            focusAreas={selectedFocusAreas}
          />
        </CardContent>
      </Card>
    </div>
  );
} 