export interface WritingAnalysis {
  grammar: {
    score: number;
    errors: Array<{
      type: string;
      message: string;
      suggestion: string;
      severity: "low" | "medium" | "high";
      context: {
        text: string;
        offset: number;
        length: number;
      };
    }>;
  };
  vocabulary: {
    score: number;
    suggestions: Array<{
      original: string;
      suggestions: string[];
      context: string;
      reason: string;
    }>;
  };
  coherence: {
    score: number;
    feedback: Array<{
      aspect: string;
      comment: string;
      suggestion: string;
    }>;
  };
  overallScore: number;
  generalFeedback: string[];
}

export interface Exercise {
  id: string;
  content: string;
  title?: string;
  topic?: string;
  level?: string;
  focusAreas?: string[];
  analysis?: WritingAnalysis;
  feedback?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UseWritingProps {
  onAnalysisComplete?: (analysis: WritingAnalysis) => void;
} 