import type { ExerciseAttempt } from "./exercise-service";
import type { PracticeSession } from "./practice-tracking-service";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: "practice" | "exercise" | "streak" | "milestone" | "skill";
  icon: string;
  requirements: {
    type: "count" | "score" | "streak" | "time";
    target: number;
    timeframe?: "daily" | "weekly" | "monthly" | "all-time";
  };
  reward?: {
    type: "points" | "badge" | "level" | "feature";
    value: number | string;
  };
  progress?: number;
  completed?: boolean;
  completedAt?: Date;
}

export interface UserProgress {
  userId: string;
  level: number;
  experience: number;
  achievements: Achievement[];
  streakDays: number;
  lastPracticeDate?: Date;
  totalPracticeTime: number;
  skillLevels: Record<string, number>;
}

export class AchievementService {
  private achievements: Achievement[];
  private userProgress: Map<string, UserProgress>;

  constructor() {
    this.achievements = this.initializeAchievements();
    this.userProgress = new Map();
  }

  private initializeAchievements(): Achievement[] {
    return [
      {
        id: "first-practice",
        title: "First Steps",
        description: "Complete your first practice session",
        category: "practice",
        icon: "🎯",
        requirements: {
          type: "count",
          target: 1,
        },
        reward: {
          type: "points",
          value: 100,
        },
      },
      {
        id: "practice-streak-7",
        title: "Weekly Warrior",
        description: "Maintain a 7-day practice streak",
        category: "streak",
        icon: "🔥",
        requirements: {
          type: "streak",
          target: 7,
        },
        reward: {
          type: "badge",
          value: "weekly-warrior",
        },
      },
      {
        id: "perfect-pronunciation",
        title: "Perfect Pronunciation",
        description: "Get a perfect score in pronunciation practice",
        category: "skill",
        icon: "🎤",
        requirements: {
          type: "score",
          target: 100,
        },
        reward: {
          type: "points",
          value: 500,
        },
      },
      // Add more achievements as needed
    ];
  }

  async getUserProgress(userId: string): Promise<UserProgress> {
    let progress = this.userProgress.get(userId);
    if (!progress) {
      progress = {
        userId,
        level: 1,
        experience: 0,
        achievements: [],
        streakDays: 0,
        totalPracticeTime: 0,
        skillLevels: {
          pronunciation: 1,
          grammar: 1,
          vocabulary: 1,
          conversation: 1,
        },
      };
      this.userProgress.set(userId, progress);
    }
    return progress;
  }

  async checkPracticeAchievements(userId: string, session: PracticeSession): Promise<Achievement[]> {
    const progress = await this.getUserProgress(userId);
    const newAchievements: Achievement[] = [];

    // Update practice streak
    const today = new Date();
    if (progress.lastPracticeDate) {
      const daysSinceLastPractice = Math.floor(
        (today.getTime() - progress.lastPracticeDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastPractice === 1) {
        progress.streakDays++;
      } else if (daysSinceLastPractice > 1) {
        progress.streakDays = 1;
      }
    } else {
      progress.streakDays = 1;
    }
    progress.lastPracticeDate = today;

    // Update total practice time
    progress.totalPracticeTime += session.duration || 0;

    // Check achievements
    for (const achievement of this.achievements) {
      if (progress.achievements.some(a => a.id === achievement.id)) {
        continue; // Skip already completed achievements
      }

      let completed = false;
      switch (achievement.requirements.type) {
        case "streak":
          completed = progress.streakDays >= achievement.requirements.target;
          break;
        case "score":
          completed = (session.score || 0) >= achievement.requirements.target;
          break;
        case "time":
          completed = progress.totalPracticeTime >= achievement.requirements.target;
          break;
      }

      if (completed) {
        const completedAchievement = {
          ...achievement,
          completed: true,
          completedAt: new Date(),
        };
        progress.achievements.push(completedAchievement);
        newAchievements.push(completedAchievement);

        // Apply rewards
        if (achievement.reward) {
          switch (achievement.reward.type) {
            case "points":
              progress.experience += achievement.reward.value as number;
              break;
            case "level":
              progress.level = Math.max(progress.level, achievement.reward.value as number);
              break;
          }
        }
      }
    }

    // Update user progress
    this.userProgress.set(userId, progress);
    return newAchievements;
  }

  async checkExerciseAchievements(userId: string, attempt: ExerciseAttempt): Promise<Achievement[]> {
    const progress = await this.getUserProgress(userId);
    const newAchievements: Achievement[] = [];

    // Update skill levels based on exercise performance
    if (attempt.score) {
      const skillKey = attempt.metadata?.skill as keyof typeof progress.skillLevels;
      if (skillKey && progress.skillLevels[skillKey]) {
        progress.skillLevels[skillKey] = Math.min(
          10,
          progress.skillLevels[skillKey] + (attempt.score >= 90 ? 0.2 : 0.1)
        );
      }
    }

    // Check achievements
    for (const achievement of this.achievements) {
      if (progress.achievements.some(a => a.id === achievement.id)) {
        continue;
      }

      let completed = false;
      if (achievement.category === "exercise" && attempt.score) {
        switch (achievement.requirements.type) {
          case "score":
            completed = attempt.score >= achievement.requirements.target;
            break;
          case "count":
            const exerciseCount = Array.from(this.userProgress.values())
              .filter(p => p.userId === userId)
              .length;
            completed = exerciseCount >= achievement.requirements.target;
            break;
        }
      }

      if (completed) {
        const completedAchievement = {
          ...achievement,
          completed: true,
          completedAt: new Date(),
        };
        progress.achievements.push(completedAchievement);
        newAchievements.push(completedAchievement);

        if (achievement.reward?.type === "points") {
          progress.experience += achievement.reward.value as number;
        }
      }
    }

    // Update level based on experience
    progress.level = Math.floor(1 + Math.sqrt(progress.experience / 1000));

    this.userProgress.set(userId, progress);
    return newAchievements;
  }

  async getAvailableAchievements(userId: string): Promise<Achievement[]> {
    const progress = await this.getUserProgress(userId);
    const completedIds = new Set(progress.achievements.map(a => a.id));
    
    return this.achievements
      .filter(a => !completedIds.has(a.id))
      .map(a => {
        const achievementProgress = this.calculateAchievementProgress(a, progress);
        return {
          ...a,
          progress: achievementProgress,
        };
      });
  }

  private calculateAchievementProgress(achievement: Achievement, progress: UserProgress): number {
    switch (achievement.requirements.type) {
      case "streak":
        return (progress.streakDays / achievement.requirements.target) * 100;
      case "time":
        return (progress.totalPracticeTime / achievement.requirements.target) * 100;
      case "score":
        return 0; // Score-based achievements are binary
      case "count":
        const count = progress.achievements.length;
        return (count / achievement.requirements.target) * 100;
      default:
        return 0;
    }
  }
} 