export type FeedbackType = "bug" | "feature" | "improvement" | "content" | "other";
export type FeedbackStatus = "new" | "in-review" | "planned" | "in-progress" | "completed" | "declined";
export type FeedbackPriority = "low" | "medium" | "high" | "critical";

export interface Feedback {
  id: string;
  userId: string;
  type: FeedbackType;
  title: string;
  description: string;
  category?: string;
  priority?: FeedbackPriority;
  status: FeedbackStatus;
  votes: number;
  comments: FeedbackComment[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface FeedbackComment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  isStaff?: boolean;
}

export interface FeedbackStats {
  totalFeedback: number;
  openFeedback: number;
  resolvedFeedback: number;
  averageResolutionTime: number;
  feedbackByType: Record<FeedbackType, number>;
  feedbackByStatus: Record<FeedbackStatus, number>;
  topVotedFeedback: Feedback[];
}

export class FeedbackService {
  private feedback: Map<string, Feedback>;
  private userVotes: Map<string, Set<string>>; // userId -> Set of feedbackIds

  constructor() {
    this.feedback = new Map();
    this.userVotes = new Map();
  }

  async submitFeedback(
    userId: string,
    data: {
      type: FeedbackType;
      title: string;
      description: string;
      category?: string;
      priority?: FeedbackPriority;
      attachments?: string[];
    }
  ): Promise<Feedback> {
    const feedback: Feedback = {
      id: crypto.randomUUID(),
      userId,
      type: data.type,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: "new",
      votes: 0,
      comments: [],
      attachments: data.attachments,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.feedback.set(feedback.id, feedback);
    return feedback;
  }

  async getFeedback(feedbackId: string): Promise<Feedback | undefined> {
    return this.feedback.get(feedbackId);
  }

  async updateFeedbackStatus(
    feedbackId: string,
    status: FeedbackStatus,
    comment?: string
  ): Promise<Feedback> {
    const feedback = await this.getFeedback(feedbackId);
    if (!feedback) {
      throw new Error(`Feedback not found: ${feedbackId}`);
    }

    const updatedFeedback: Feedback = {
      ...feedback,
      status,
      updatedAt: new Date(),
      resolvedAt: ["completed", "declined"].includes(status) ? new Date() : undefined,
    };

    if (comment) {
      updatedFeedback.comments.push({
        id: crypto.randomUUID(),
        userId: "system",
        content: comment,
        createdAt: new Date(),
        isStaff: true,
      });
    }

    this.feedback.set(feedbackId, updatedFeedback);
    return updatedFeedback;
  }

  async addComment(
    feedbackId: string,
    userId: string,
    content: string,
    isStaff?: boolean
  ): Promise<FeedbackComment> {
    const feedback = await this.getFeedback(feedbackId);
    if (!feedback) {
      throw new Error(`Feedback not found: ${feedbackId}`);
    }

    const comment: FeedbackComment = {
      id: crypto.randomUUID(),
      userId,
      content,
      createdAt: new Date(),
      isStaff,
    };

    feedback.comments.push(comment);
    feedback.updatedAt = new Date();
    
    this.feedback.set(feedbackId, feedback);
    return comment;
  }

  async voteFeedback(feedbackId: string, userId: string): Promise<Feedback> {
    const feedback = await this.getFeedback(feedbackId);
    if (!feedback) {
      throw new Error(`Feedback not found: ${feedbackId}`);
    }

    // Check if user has already voted
    let userVotedFeedback = this.userVotes.get(userId);
    if (!userVotedFeedback) {
      userVotedFeedback = new Set();
      this.userVotes.set(userId, userVotedFeedback);
    }

    if (userVotedFeedback.has(feedbackId)) {
      throw new Error("User has already voted for this feedback");
    }

    feedback.votes += 1;
    feedback.updatedAt = new Date();
    userVotedFeedback.add(feedbackId);

    this.feedback.set(feedbackId, feedback);
    return feedback;
  }

  async getUserFeedback(userId: string): Promise<Feedback[]> {
    return Array.from(this.feedback.values())
      .filter(f => f.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getFeedbackStats(): Promise<FeedbackStats> {
    const allFeedback = Array.from(this.feedback.values());

    const resolvedFeedback = allFeedback.filter(f => f.resolvedAt);
    const totalResolutionTime = resolvedFeedback.reduce((sum, f) => {
      return sum + (f.resolvedAt!.getTime() - f.createdAt.getTime());
    }, 0);

    const stats: FeedbackStats = {
      totalFeedback: allFeedback.length,
      openFeedback: allFeedback.filter(f => !["completed", "declined"].includes(f.status)).length,
      resolvedFeedback: resolvedFeedback.length,
      averageResolutionTime: resolvedFeedback.length > 0
        ? totalResolutionTime / resolvedFeedback.length
        : 0,
      feedbackByType: {} as Record<FeedbackType, number>,
      feedbackByStatus: {} as Record<FeedbackStatus, number>,
      topVotedFeedback: allFeedback
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 5),
    };

    // Count feedback by type
    allFeedback.forEach(f => {
      stats.feedbackByType[f.type] = (stats.feedbackByType[f.type] || 0) + 1;
      stats.feedbackByStatus[f.status] = (stats.feedbackByStatus[f.status] || 0) + 1;
    });

    return stats;
  }

  async searchFeedback(query: string): Promise<Feedback[]> {
    const searchTerms = query.toLowerCase().split(" ");
    
    return Array.from(this.feedback.values())
      .filter(f => {
        const searchText = `${f.title} ${f.description} ${f.category || ""}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
      })
      .sort((a, b) => b.votes - a.votes);
  }

  async getSimilarFeedback(feedbackId: string): Promise<Feedback[]> {
    const feedback = await this.getFeedback(feedbackId);
    if (!feedback) {
      throw new Error(`Feedback not found: ${feedbackId}`);
    }

    const searchTerms = `${feedback.title} ${feedback.category || ""}`.toLowerCase().split(" ");
    
    return Array.from(this.feedback.values())
      .filter(f => f.id !== feedbackId) // Exclude the current feedback
      .map(f => ({
        feedback: f,
        relevance: this.calculateRelevance(f, searchTerms),
      }))
      .filter(item => item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5)
      .map(item => item.feedback);
  }

  private calculateRelevance(feedback: Feedback, searchTerms: string[]): number {
    const text = `${feedback.title} ${feedback.category || ""}`.toLowerCase();
    let relevance = 0;

    searchTerms.forEach(term => {
      if (text.includes(term)) {
        relevance += 1;
      }
    });

    // Boost relevance for items with same type and high votes
    if (feedback.votes > 10) relevance += 0.5;
    if (feedback.votes > 50) relevance += 0.5;

    return relevance;
  }
} 