
import { Language, UserProfile, Achievement, DailyGoal } from './types';

export const LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'ca', name: 'Catalan', flag: '🇪🇸' }, 
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'la', name: 'Latin', flag: '🏛️' },
  { code: 'eo', name: 'Esperanto', flag: '💚' },
  { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'ga', name: 'Irish', flag: '🇮🇪' },
  { code: 'gd', name: 'Scottish Gaelic', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', title: 'First Step', description: 'Complete your first lesson', icon: '🦶', conditionType: 'LESSONS', conditionValue: 1 },
  { id: 'streak_3', title: 'On Fire', description: 'Reach a 3-day streak', icon: '🔥', conditionType: 'STREAK', conditionValue: 3 },
  { id: 'streak_7', title: 'Week Warrior', description: 'Reach a 7-day streak', icon: '📅', conditionType: 'STREAK', conditionValue: 7 },
  { id: 'xp_100', title: 'Novice', description: 'Earn 100 XP total', icon: '🥉', conditionType: 'XP', conditionValue: 100 },
  { id: 'xp_1000', title: 'Scholar', description: 'Earn 1000 XP total', icon: '🥇', conditionType: 'XP', conditionValue: 1000 },
  { id: 'polyglot_3', title: 'Polyglot', description: 'Start learning 3 languages', icon: '🌍', conditionType: 'LANGUAGES', conditionValue: 3 },
  { id: 'polyglot_5', title: 'World Traveler', description: 'Start learning 5 languages', icon: '✈️', conditionType: 'LANGUAGES', conditionValue: 5 },
  { id: 'score_130', title: 'Linguistic Legend', description: 'Reach a Language Score of 130', icon: '👑', conditionType: 'SCORE', conditionValue: 130 },
];

const todayStr = new Date().toISOString().split('T')[0];

export const DEFAULT_GOALS: DailyGoal[] = [
  { id: 'g1', title: 'Complete 2 Lessons', target: 2, current: 0, completed: false, type: 'LESSONS' },
  { id: 'g2', title: 'Earn 50 XP', target: 50, current: 0, completed: false, type: 'XP' },
];

export const DEFAULT_USER: UserProfile = {
  id: 'user_1',
  name: 'New Learner',
  avatar: '🦉',
  joinDate: new Date().toISOString(),
  lastActiveDate: todayStr,
  streak: 0,
  currentLanguageCode: null,
  progress: {},
  achievements: [],
  dailyGoals: DEFAULT_GOALS,
};

export const XP_PER_LESSON = 15;