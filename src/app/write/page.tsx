"use client";

import { WritingAssistant } from "@/components/writing/writing-assistant";
import { ModelInfo } from "@/components/ModelInfo";
import { WritingExamples } from "@/components/writing/writing-examples";

export default function WritePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8">
        <ModelInfo />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <WritingAssistant />
          <WritingExamples />
        </div>
      </div>
    </div>
  );
} 