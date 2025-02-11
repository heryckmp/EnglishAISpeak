import { VoiceAccent, VoiceGender } from "../ai/speech-synthesis-service";

export interface UserPreferences {
  // Learning preferences
  englishLevel: "beginner" | "intermediate" | "advanced";
  learningGoals: string[];
  focusAreas: Array<"pronunciation" | "grammar" | "vocabulary" | "conversation">;
  dailyGoalMinutes: number;
  
  // Voice preferences
  preferredVoice: {
    gender: VoiceGender;
    accent: VoiceAccent;
    speed: number;
    pitch: number;
  };
  
  // UI preferences
  fontSize: "small" | "medium" | "large";
  showTranscriptions: boolean;
  enableSoundEffects: boolean;
  
  // Notification preferences
  enableReminders: boolean;
  reminderTime?: string; // HH:mm format
  emailNotifications: boolean;
  
  // Practice preferences
  autoPlayPronunciation: boolean;
  showPhoneticSpelling: boolean;
  grammarCheckLevel: "basic" | "intermediate" | "strict";
}

export class UserPreferencesService {
  private preferences: Map<string, UserPreferences>;
  
  private defaultPreferences: UserPreferences = {
    englishLevel: "intermediate",
    learningGoals: ["Improve general communication"],
    focusAreas: ["pronunciation", "grammar"],
    dailyGoalMinutes: 30,
    
    preferredVoice: {
      gender: "female",
      accent: "american",
      speed: 1.0,
      pitch: 1.0,
    },
    
    fontSize: "medium",
    showTranscriptions: true,
    enableSoundEffects: true,
    
    enableReminders: true,
    emailNotifications: false,
    
    autoPlayPronunciation: true,
    showPhoneticSpelling: true,
    grammarCheckLevel: "intermediate",
  };

  constructor() {
    this.preferences = new Map();
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const userPrefs = this.preferences.get(userId);
    if (!userPrefs) {
      return this.defaultPreferences;
    }
    return userPrefs;
  }

  async updatePreferences(
    userId: string,
    updates: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const currentPrefs = await this.getUserPreferences(userId);
    const updatedPrefs = {
      ...currentPrefs,
      ...updates,
    };
    
    this.preferences.set(userId, updatedPrefs);
    return updatedPrefs;
  }

  async resetPreferences(userId: string): Promise<UserPreferences> {
    this.preferences.set(userId, { ...this.defaultPreferences });
    return this.defaultPreferences;
  }

  async updateLearningLevel(
    userId: string,
    level: UserPreferences["englishLevel"]
  ): Promise<UserPreferences> {
    return this.updatePreferences(userId, { englishLevel: level });
  }

  async updateLearningGoals(
    userId: string,
    goals: string[]
  ): Promise<UserPreferences> {
    return this.updatePreferences(userId, { learningGoals: goals });
  }

  async updateFocusAreas(
    userId: string,
    areas: UserPreferences["focusAreas"]
  ): Promise<UserPreferences> {
    return this.updatePreferences(userId, { focusAreas: areas });
  }

  async updateVoicePreferences(
    userId: string,
    voicePrefs: Partial<UserPreferences["preferredVoice"]>
  ): Promise<UserPreferences> {
    const currentPrefs = await this.getUserPreferences(userId);
    return this.updatePreferences(userId, {
      preferredVoice: {
        ...currentPrefs.preferredVoice,
        ...voicePrefs,
      },
    });
  }

  async updateUIPreferences(
    userId: string,
    updates: Partial<Pick<UserPreferences, "fontSize" | "showTranscriptions" | "enableSoundEffects">>
  ): Promise<UserPreferences> {
    return this.updatePreferences(userId, updates);
  }

  async updateNotificationPreferences(
    userId: string,
    updates: Partial<Pick<UserPreferences, "enableReminders" | "reminderTime" | "emailNotifications">>
  ): Promise<UserPreferences> {
    return this.updatePreferences(userId, updates);
  }
} 