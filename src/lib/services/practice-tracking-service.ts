import { PronunciationAnalysis } from "../ai/pronunciation-service";
import { WritingAnalysis } from "../ai/writing-service";

export interface PracticeMetadata {
  errors?: Array<{
    word: string;
    expected: string;
    actual: string;
    type: string;
  }>;
  text?: string;
  grammarScore?: number;
  vocabularyScore?: number;
  coherenceScore?: number;
  corrections?: Array<{
    original: string;
    suggestion: string;
    explanation: string;
  }>;
  suggestions?: Array<{
    category: string;
    text: string;
  }>;
}

export interface PracticeSession {
  id: string;
  userId: string;
  type: "pronunciation" | "writing" | "conversation";
  startTime: Date;
  endTime?: Date;
  duration?: number;
  score?: number;
  feedback?: string;
  metadata?: PracticeMetadata;
}

export interface PracticeStats {
  totalSessions: number;
  totalDuration: number;
  averageScore: number;
  sessionsByType: Record<string, number>;
  progressBySkill: Record<string, number>;
  recentSessions: PracticeSession[];
}

export class PracticeTrackingService {
  private sessions: Map<string, PracticeSession>;

  constructor() {
    this.sessions = new Map();
  }

  startSession(userId: string, type: PracticeSession["type"]): PracticeSession {
    const session: PracticeSession = {
      id: crypto.randomUUID(),
      userId,
      type,
      startTime: new Date(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  endSession(sessionId: string, data?: {
    score?: number;
    feedback?: string;
    metadata?: PracticeMetadata;
  }): PracticeSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const endTime = new Date();
    const duration = endTime.getTime() - session.startTime.getTime();

    const updatedSession: PracticeSession = {
      ...session,
      endTime,
      duration,
      score: data?.score,
      feedback: data?.feedback,
      metadata: data?.metadata,
    };

    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async recordPronunciationPractice(
    userId: string,
    analysis: PronunciationAnalysis
  ): Promise<PracticeSession> {
    const session = this.startSession(userId, "pronunciation");
    
    return this.endSession(session.id, {
      score: analysis.overallScore,
      feedback: analysis.feedback,
      metadata: {
        errors: analysis.errors,
        text: analysis.text,
      },
    });
  }

  async recordWritingPractice(
    userId: string,
    analysis: WritingAnalysis
  ): Promise<PracticeSession> {
    const session = this.startSession(userId, "writing");
    
    return this.endSession(session.id, {
      score: analysis.overallScore,
      feedback: analysis.feedback,
      metadata: {
        grammarScore: analysis.grammarScore,
        vocabularyScore: analysis.vocabularyScore,
        coherenceScore: analysis.coherenceScore,
        corrections: analysis.corrections,
        suggestions: analysis.suggestions,
      },
    });
  }

  async getStats(userId: string): Promise<PracticeStats> {
    const userSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.endTime);

    const totalSessions = userSessions.length;
    const totalDuration = userSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    
    const scoredSessions = userSessions.filter(session => session.score !== undefined);
    const averageScore = scoredSessions.length > 0
      ? scoredSessions.reduce((sum, session) => sum + (session.score || 0), 0) / scoredSessions.length
      : 0;

    const sessionsByType = userSessions.reduce((acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const progressBySkill = this.calculateProgressBySkill(userSessions);

    return {
      totalSessions,
      totalDuration,
      averageScore,
      sessionsByType,
      progressBySkill,
      recentSessions: userSessions.slice(-5),
    };
  }

  private calculateProgressBySkill(sessions: PracticeSession[]): Record<string, number> {
    const progress: Record<string, number> = {
      pronunciation: 0,
      grammar: 0,
      vocabulary: 0,
      fluency: 0,
    };

    if (sessions.length === 0) return progress;

    // Calculate progress based on recent session scores and improvements
    const recentSessions = sessions.slice(-10);
    
    recentSessions.forEach(session => {
      if (session.type === "pronunciation" && session.score) {
        progress.pronunciation = Math.max(progress.pronunciation, session.score);
        progress.fluency += session.score * 0.3;
      } else if (session.type === "writing" && session.metadata) {
        const meta = session.metadata;
        if (meta.grammarScore) {
          progress.grammar = Math.max(progress.grammar, meta.grammarScore);
        }
        if (meta.vocabularyScore) {
          progress.vocabulary = Math.max(progress.vocabulary, meta.vocabularyScore);
        }
      }
    });

    // Normalize scores to 0-100 range
    Object.keys(progress).forEach(key => {
      progress[key] = Math.min(100, Math.round(progress[key]));
    });

    return progress;
  }
} 