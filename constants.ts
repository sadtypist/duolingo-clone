
import { Language, UserProfile, Achievement, DailyGoal, CharacterGroup } from './types';

export const LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸', countryCode: 'es' },
  { code: 'fr', name: 'French', flag: '🇫🇷', countryCode: 'fr' },
  { code: 'de', name: 'German', flag: '🇩🇪', countryCode: 'de' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', countryCode: 'it' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', countryCode: 'jp' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', countryCode: 'cn' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', countryCode: 'ru' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', countryCode: 'br' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', countryCode: 'kr' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', countryCode: 'sa' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', countryCode: 'in' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', countryCode: 'tr' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', countryCode: 'nl' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪', countryCode: 'se' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', countryCode: 'pl' },
  { code: 'el', name: 'Greek', flag: '🇬🇷', countryCode: 'gr' },
  { code: 'da', name: 'Danish', flag: '🇩🇰', countryCode: 'dk' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮', countryCode: 'fi' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴', countryCode: 'no' },
  { code: 'th', name: 'Thai', flag: '🇹🇭', countryCode: 'th' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', countryCode: 'vn' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', countryCode: 'id' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿', countryCode: 'cz' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦', countryCode: 'ua' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱', countryCode: 'il' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴', countryCode: 'ro' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺', countryCode: 'hu' },
  { code: 'ca', name: 'Catalan', flag: '🇪🇸', countryCode: 'es-ct' }, 
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬', countryCode: 'bg' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷', countryCode: 'hr' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰', countryCode: 'sk' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸', countryCode: 'rs' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾', countryCode: 'my' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭', countryCode: 'ph' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪', countryCode: 'ke' },
  { code: 'la', name: 'Latin', flag: '🏛️' },
  { code: 'eo', name: 'Esperanto', flag: '💚' },
  { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', countryCode: 'gb-wls' },
  { code: 'ga', name: 'Irish', flag: '🇮🇪', countryCode: 'ie' },
  { code: 'gd', name: 'Scottish Gaelic', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', countryCode: 'gb-sct' },
];

export const CHARACTER_DATA: Record<string, CharacterGroup[]> = {
  'ja': [
    {
      id: 'hiragana_basic_1',
      name: 'Hiragana: Vowels & K',
      characters: [
        { symbol: 'あ', romanization: 'a' }, { symbol: 'い', romanization: 'i' }, { symbol: 'う', romanization: 'u' }, { symbol: 'え', romanization: 'e' }, { symbol: 'お', romanization: 'o' },
        { symbol: 'か', romanization: 'ka' }, { symbol: 'き', romanization: 'ki' }, { symbol: 'く', romanization: 'ku' }, { symbol: 'け', romanization: 'ke' }, { symbol: 'こ', romanization: 'ko' }
      ]
    },
    {
      id: 'hiragana_basic_2',
      name: 'Hiragana: S & T',
      characters: [
        { symbol: 'さ', romanization: 'sa' }, { symbol: 'し', romanization: 'shi' }, { symbol: 'す', romanization: 'su' }, { symbol: 'せ', romanization: 'se' }, { symbol: 'そ', romanization: 'so' },
        { symbol: 'た', romanization: 'ta' }, { symbol: 'ち', romanization: 'chi' }, { symbol: 'つ', romanization: 'tsu' }, { symbol: 'て', romanization: 'te' }, { symbol: 'と', romanization: 'to' }
      ]
    },
    {
      id: 'katakana_basic',
      name: 'Katakana: Vowels & K',
      characters: [
        { symbol: 'ア', romanization: 'a' }, { symbol: 'イ', romanization: 'i' }, { symbol: 'ウ', romanization: 'u' }, { symbol: 'エ', romanization: 'e' }, { symbol: 'オ', romanization: 'o' },
        { symbol: 'カ', romanization: 'ka' }, { symbol: 'キ', romanization: 'ki' }, { symbol: 'ク', romanization: 'ku' }, { symbol: 'ケ', romanization: 'ke' }, { symbol: 'コ', romanization: 'ko' }
      ]
    }
  ],
  'ko': [
    {
      id: 'hangul_vowels',
      name: 'Hangul: Basic Vowels',
      characters: [
        { symbol: 'ㅏ', romanization: 'a' }, { symbol: 'ㅑ', romanization: 'ya' }, { symbol: 'ㅓ', romanization: 'eo' }, { symbol: 'ㅕ', romanization: 'yeo' },
        { symbol: 'ㅗ', romanization: 'o' }, { symbol: 'ㅛ', romanization: 'yo' }, { symbol: 'ㅜ', romanization: 'u' }, { symbol: 'ㅠ', romanization: 'yu' },
        { symbol: 'ㅡ', romanization: 'eu' }, { symbol: 'ㅣ', romanization: 'i' }
      ]
    },
    {
      id: 'hangul_consonants',
      name: 'Hangul: Basic Consonants',
      characters: [
        { symbol: 'ㄱ', romanization: 'g/k' }, { symbol: 'ㄴ', romanization: 'n' }, { symbol: 'ㄷ', romanization: 'd/t' }, { symbol: 'ㄹ', romanization: 'r/l' },
        { symbol: 'ㅁ', romanization: 'm' }, { symbol: 'ㅂ', romanization: 'b/p' }, { symbol: 'ㅅ', romanization: 's' }, { symbol: 'ㅇ', romanization: 'ng' },
        { symbol: 'ㅈ', romanization: 'j' }, { symbol: 'ㅎ', romanization: 'h' }
      ]
    }
  ]
};

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

export const LEAGUES = [
  { id: 'Bronze', order: 1, color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-300', icon: '🛡️', promoZone: 5, demoteZone: 0 },
  { id: 'Silver', order: 2, color: 'text-slate-400', bg: 'bg-slate-100', border: 'border-slate-300', icon: '⚔️', promoZone: 5, demoteZone: 15 },
  { id: 'Gold', order: 3, color: 'text-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-300', icon: '👑', promoZone: 5, demoteZone: 15 },
  { id: 'Diamond', order: 4, color: 'text-cyan-500', bg: 'bg-cyan-100', border: 'border-cyan-300', icon: '💎', promoZone: 3, demoteZone: 15 },
  { id: 'Obsidian', order: 5, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-300', icon: '🔮', promoZone: 0, demoteZone: 10 },
];

const todayStr = new Date().toISOString().split('T')[0];

export const DEFAULT_GOALS: DailyGoal[] = [
  { id: 'g1', title: 'Complete 2 Lessons', target: 2, current: 0, completed: false, type: 'LESSONS' },
  { id: 'g2', title: 'Earn 50 XP', target: 50, current: 0, completed: false, type: 'XP' },
];

export const MAX_ENERGY = 5;
export const ENERGY_REGEN_MINUTES = 30;
export const ENERGY_REGEN_MS = ENERGY_REGEN_MINUTES * 60 * 1000;

export const AVATARS = [
  '🧑', '👩', '👨', '👧', '👦', '🧓', '👴', '👵',
  '👱', '👱‍♀️', '👱‍♂️', '👩‍🦰', '👨‍🦰', '👩‍🦱', '👨‍🦱', '👩‍🦳', '👨‍🦳', '👩‍🦲', '👨‍🦲',
  '🧔', '🧔‍♂️', '🧔‍♀️', '🧕', '👳', '👳‍♀️', '👳‍♂️', '👲', '🤠',
  '👷', '👷‍♀️', '👷‍♂️', '👩‍⚕️', '👨‍⚕️', '🧑‍🎓', '👩‍🎓', '👨‍🎓', '👩‍🏫', '👨‍🏫',
  '👩‍⚖️', '👨‍⚖️', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🔧', '👨‍🔧', '👩‍🔬', '👨‍🔬',
  '👩‍🎨', '👨‍🎨', '👩‍✈️', '👨‍✈️', '👩‍🚀', '👨‍🚀', '👩‍🚒', '👨‍🚒', '👮', '👮‍♀️', '👮‍♂️',
  '🕵️', '🕵️‍♀️', '🕵️‍♂️', '🦸', '🦸‍♀️', '🦸‍♂️', '🦹', '🦹‍♀️', '🦹‍♂️', '🧙', '🧙‍♀️', '🧙‍♂️',
  '🧚', '🧚‍♀️', '🧚‍♂️', '🧛', '🧛‍♀️', '🧛‍♂️', '🧜', '🧜‍♀️', '🧜‍♂️', '🧝', '🧝‍♀️', '🧝‍♂️',
  '🧞', '🧞‍♀️', '🧞‍♂️', '🧟', '🧟‍♀️', '🧟‍♂️', '👾', '🤖', '👽'
];

export const DEFAULT_USER: UserProfile = {
  id: 'guest',
  name: '',
  avatar: '🧑',
  joinDate: new Date().toISOString(),
  lastActiveDate: todayStr,
  streak: 0,
  energy: 5,
  lastEnergyRefill: new Date().toISOString(),
  currentLanguageCode: null,
  currentLeague: 'Bronze',
  progress: {},
  achievements: [],
  dailyGoals: DEFAULT_GOALS,
  isGuest: true,
  hasCompletedOnboarding: false,
  preferences: {
    autoDifficulty: false,
    enableSoundEffects: true,
    enableStreakFreeze: true,
    showCharacters: true,
    dailyGoalXp: 50
  }
};

export const XP_PER_LESSON = 15;