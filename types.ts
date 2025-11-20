
export interface Language {
  code: string;
  name: string;
  flag: string;
  countryCode?: string; // ISO 3166-1 alpha-2 code for flag images (e.g., 'us', 'gb', 'jp')
}

export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LanguageProgress {
  languageCode: string;
  xp: number;
  level: number;
  lessonsCompleted: number;
  weakAreas: string[]; // Topics user struggles with
  lastPlayed?: string; // ISO Date string
  proficiency: ProficiencyLevel;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  conditionType: 'STREAK' | 'XP' | 'LESSONS' | 'LANGUAGES' | 'SCORE';
  conditionValue: number;
}

export interface DailyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  completed: boolean;
  type: 'XP' | 'LESSONS' | 'CORRECT_ANSWERS';
  rewardXp: number;
}

export interface UserPreferences {
  autoDifficulty: boolean;
  enableSoundEffects: boolean;
  enableStreakFreeze: boolean;
  showCharacters: boolean;
  dailyGoalXp: number;
  lessonDuration: number; // in minutes
  darkMode: boolean;
  disableAnimations: boolean;
}

export interface UserProfile {
  id: string;
  email?: string; // Auth
  password?: string; // Auth (Simulated)
  username: string; // Display ID (Required)
  name: string;
  avatar: string; // base64 or emoji
  nativeLanguageCode: string; // The user's first language (for UI and translations)
  joinDate: string;
  lastActiveDate: string; // YYYY-MM-DD
  streak: number;
  energy: number; // Current hearts (0-5)
  lastEnergyRefill: string; // ISO Timestamp of last energy calc
  currentLanguageCode: string | null;
  currentLeague: string; // e.g., 'Bronze', 'Silver'
  progress: Record<string, LanguageProgress>; // Map languageCode to progress
  achievements: string[]; // IDs of unlocked achievements
  dailyGoals: DailyGoal[];
  isGuest?: boolean; // New flag for auth flow
  hasCompletedOnboarding: boolean; // Tracks if user has passed landing screen
  preferences: UserPreferences;
}

export interface CharacterSymbol {
  symbol: string;
  romanization: string;
  example?: string;
}

export interface CharacterGroup {
  id: string;
  name: string;
  characters: CharacterSymbol[];
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRANSLATE = 'TRANSLATE',
  FILL_BLANK = 'FILL_BLANK',
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
  SENTENCE_TRANSLATE = 'SENTENCE_TRANSLATE'
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  type: QuestionType;
  questionText: string;
  options: string[]; // List of choices. For SPEAKING, this might be empty or hints.
  correctAnswer: string; // For SPEAKING, this is the text to match.
  explanation: string;
  topic?: string; // e.g., "Vocabulary", "Verbs", "Greetings"
  isReview?: boolean; // Indicates if this is a re-attempt of a failed question
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export interface OfflineLesson extends Lesson {
  savedAt: string;
  languageCode: string;
}
