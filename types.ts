
export interface Language {
  code: string;
  name: string;
  flag: string;
  countryCode?: string; // ISO 3166-1 alpha-2 code for flag images (e.g., 'us', 'gb', 'jp')
}

export interface LanguageProgress {
  languageCode: string;
  xp: number;
  level: number;
  lessonsCompleted: number;
  weakAreas: string[]; // Topics user struggles with
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
  type: 'XP' | 'LESSONS';
}

export interface UserProfile {
  id: string;
  email?: string; // Auth
  password?: string; // Auth (Simulated)
  username?: string; // Display ID
  name: string;
  avatar: string; // base64 or emoji
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
  SPEAKING = 'SPEAKING'
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
