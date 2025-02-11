import { PronunciationService } from "../ai/pronunciation-service";
import { WritingService } from "../ai/writing-service";
import { ChatService } from "../ai/chat-service";
import type { UserPreferences } from "./user-preferences-service";

export type ExerciseType = "pronunciation" | "writing" | "conversation" | "vocabulary" | "grammar";
export type ExerciseDifficulty = "beginner" | "intermediate" | "advanced";

export interface Exercise {
  id: string;
  type: ExerciseType;
  difficulty: ExerciseDifficulty;
  title: string;
  description: string;
  content: string;
  instructions: string;
  expectedDurationMinutes: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  score?: number;
  feedback?: string;
  metadata?: Record<string, unknown>;
}

export class ExerciseService {
  private exercises: Map<string, Exercise>;
  private attempts: Map<string, ExerciseAttempt>;
  private pronunciationService: PronunciationService;
  private writingService: WritingService;
  private chatService: ChatService;

  constructor() {
    this.exercises = new Map();
    this.attempts = new Map();
    this.pronunciationService = new PronunciationService();
    this.writingService = new WritingService();
    this.chatService = new ChatService();
  }

  async generateExercise(
    type: ExerciseType,
    userPrefs: UserPreferences
  ): Promise<Exercise> {
    const exercise: Exercise = {
      id: crypto.randomUUID(),
      type,
      difficulty: userPrefs.englishLevel,
      title: "",
      description: "",
      content: "",
      instructions: "",
      expectedDurationMinutes: 5,
      createdAt: new Date(),
    };

    switch (type) {
      case "pronunciation":
        const pronunciationContent = await this.pronunciationService.generatePracticeExercise(
          userPrefs.englishLevel,
          userPrefs.focusAreas.includes("pronunciation") ? ["stress", "intonation"] : []
        );
        exercise.title = "Pronunciation Practice";
        exercise.content = pronunciationContent;
        exercise.instructions = "Read the text aloud, focusing on clear pronunciation and natural intonation.";
        exercise.expectedDurationMinutes = 10;
        break;

      case "writing":
        exercise.title = "Writing Exercise";
        exercise.content = await this.generateWritingPrompt(userPrefs);
        exercise.instructions = "Write a response to the prompt, focusing on clarity and proper grammar.";
        exercise.expectedDurationMinutes = 15;
        break;

      case "conversation":
        const topic = await this.generateConversationTopic(userPrefs);
        exercise.title = "Conversation Practice";
        exercise.content = topic;
        exercise.instructions = "Practice speaking on this topic, using varied vocabulary and proper grammar.";
        exercise.expectedDurationMinutes = 10;
        break;

      case "vocabulary":
        exercise.title = "Vocabulary Builder";
        exercise.content = await this.generateVocabularyExercise(userPrefs);
        exercise.instructions = "Study and practice using these vocabulary words in context.";
        exercise.expectedDurationMinutes = 8;
        break;

      case "grammar":
        exercise.title = "Grammar Practice";
        exercise.content = await this.generateGrammarExercise(userPrefs);
        exercise.instructions = "Complete the grammar exercises, paying attention to proper usage.";
        exercise.expectedDurationMinutes = 12;
        break;
    }

    this.exercises.set(exercise.id, exercise);
    return exercise;
  }

  async startExercise(exerciseId: string, userId: string): Promise<ExerciseAttempt> {
    const exercise = this.exercises.get(exerciseId);
    if (!exercise) {
      throw new Error(`Exercise not found: ${exerciseId}`);
    }

    const attempt: ExerciseAttempt = {
      id: crypto.randomUUID(),
      exerciseId,
      userId,
      startTime: new Date(),
      completed: false,
    };

    this.attempts.set(attempt.id, attempt);
    return attempt;
  }

  async completeExercise(
    attemptId: string,
    data: {
      score?: number;
      feedback?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<ExerciseAttempt> {
    const attempt = this.attempts.get(attemptId);
    if (!attempt) {
      throw new Error(`Attempt not found: ${attemptId}`);
    }

    const updatedAttempt: ExerciseAttempt = {
      ...attempt,
      endTime: new Date(),
      completed: true,
      score: data.score,
      feedback: data.feedback,
      metadata: data.metadata,
    };

    this.attempts.set(attemptId, updatedAttempt);
    return updatedAttempt;
  }

  async getUserExerciseHistory(userId: string): Promise<ExerciseAttempt[]> {
    return Array.from(this.attempts.values())
      .filter(attempt => attempt.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  private async generateWritingPrompt(userPrefs: UserPreferences): Promise<string> {
    const prompt = `
      Generate an engaging writing prompt for ${userPrefs.englishLevel} level English learners.
      Focus areas: ${userPrefs.focusAreas.join(", ")}
      Learning goals: ${userPrefs.learningGoals.join(", ")}
      
      The prompt should:
      1. Be clear and specific
      2. Encourage creative thinking
      3. Allow for practice of target skills
      4. Be appropriate for the user's level
    `;

    return this.chatService.sendMessage(prompt, []);
  }

  private async generateConversationTopic(userPrefs: UserPreferences): Promise<string> {
    const prompt = `
      Generate an interesting conversation topic for ${userPrefs.englishLevel} level English learners.
      The topic should:
      1. Be engaging and relatable
      2. Allow for practice of various language skills
      3. Include suggested questions and vocabulary
      4. Be appropriate for the user's level
    `;

    return this.chatService.sendMessage(prompt, []);
  }

  private async generateVocabularyExercise(userPrefs: UserPreferences): Promise<string> {
    const prompt = `
      Generate a vocabulary exercise for ${userPrefs.englishLevel} level English learners.
      Include:
      1. Target vocabulary words with definitions
      2. Example sentences showing usage
      3. Practice exercises
      4. Common collocations and phrases
    `;

    return this.chatService.sendMessage(prompt, []);
  }

  private async generateGrammarExercise(userPrefs: UserPreferences): Promise<string> {
    const prompt = `
      Generate a grammar exercise for ${userPrefs.englishLevel} level English learners.
      Focus on:
      1. Clear explanations of grammar rules
      2. Example sentences
      3. Practice exercises with varying difficulty
      4. Common mistakes to avoid
    `;

    return this.chatService.sendMessage(prompt, []);
  }
} 