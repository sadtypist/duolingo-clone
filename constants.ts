

import { Language, UserProfile, Achievement, DailyGoal, CharacterGroup } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', countryCode: 'us' },
  { code: 'en-AU', name: 'English (AU)', flag: '🇦🇺', countryCode: 'au' },
  { code: 'en-CA', name: 'English (CA)', flag: '🇨🇦', countryCode: 'ca' },
  { code: 'en-IN', name: 'English (IN)', flag: '🇮🇳', countryCode: 'in' },
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
  ],
  'zh': [
    {
      id: 'zh_numbers',
      name: 'Numbers (1-10)',
      characters: [
        { symbol: '一', romanization: 'yī' }, { symbol: '二', romanization: 'èr' }, { symbol: '三', romanization: 'sān' }, { symbol: '四', romanization: 'sì' }, { symbol: '五', romanization: 'wǔ' },
        { symbol: '六', romanization: 'liù' }, { symbol: '七', romanization: 'qī' }, { symbol: '八', romanization: 'bā' }, { symbol: '九', romanization: 'jiǔ' }, { symbol: '十', romanization: 'shí' }
      ]
    },
    {
      id: 'zh_nature',
      name: 'Nature Characters',
      characters: [
        { symbol: '日', romanization: 'rì (sun)' }, { symbol: '月', romanization: 'yuè (moon)' }, { symbol: '山', romanization: 'shān (mtn)' }, { symbol: '水', romanization: 'shuǐ (water)' },
        { symbol: '火', romanization: 'huǒ (fire)' }, { symbol: '木', romanization: 'mù (wood)' }, { symbol: '人', romanization: 'rén (person)' }, { symbol: '天', romanization: 'tiān (sky)' }
      ]
    }
  ],
  'ru': [
    {
      id: 'ru_basic',
      name: 'Cyrillic: Basic Letters',
      characters: [
        { symbol: 'А', romanization: 'a' }, { symbol: 'Б', romanization: 'b' }, { symbol: 'В', romanization: 'v' }, { symbol: 'Г', romanization: 'g' }, { symbol: 'Д', romanization: 'd' },
        { symbol: 'Е', romanization: 'ye' }, { symbol: 'Ё', romanization: 'yo' }, { symbol: 'Ж', romanization: 'zh' }, { symbol: 'З', romanization: 'z' }, { symbol: 'И', romanization: 'i' }
      ]
    },
    {
      id: 'ru_basic_2',
      name: 'Cyrillic: Part 2',
      characters: [
        { symbol: 'Й', romanization: 'y' }, { symbol: 'К', romanization: 'k' }, { symbol: 'Л', romanization: 'l' }, { symbol: 'М', romanization: 'm' }, { symbol: 'Н', romanization: 'n' },
        { symbol: 'О', romanization: 'o' }, { symbol: 'П', romanization: 'p' }, { symbol: 'Р', romanization: 'r' }, { symbol: 'С', romanization: 's' }, { symbol: 'Т', romanization: 't' }
      ]
    }
  ],
  'uk': [
    {
      id: 'uk_basic',
      name: 'Ukrainian Alphabet',
      characters: [
        { symbol: 'А', romanization: 'a' }, { symbol: 'Б', romanization: 'b' }, { symbol: 'В', romanization: 'v' }, { symbol: 'Г', romanization: 'h' }, { symbol: 'Ґ', romanization: 'g' },
        { symbol: 'Д', romanization: 'd' }, { symbol: 'Е', romanization: 'e' }, { symbol: 'Є', romanization: 'ye' }, { symbol: 'Ж', romanization: 'zh' }, { symbol: 'З', romanization: 'z' }
      ]
    }
  ],
  'el': [
    {
      id: 'el_alpha',
      name: 'Greek Alphabet',
      characters: [
        { symbol: 'Α', romanization: 'Alpha' }, { symbol: 'Β', romanization: 'Beta' }, { symbol: 'Γ', romanization: 'Gamma' }, { symbol: 'Δ', romanization: 'Delta' }, { symbol: 'Ε', romanization: 'Epsilon' },
        { symbol: 'Ζ', romanization: 'Zeta' }, { symbol: 'Η', romanization: 'Eta' }, { symbol: 'Θ', romanization: 'Theta' }, { symbol: 'Ι', romanization: 'Iota' }, { symbol: 'Κ', romanization: 'Kappa' }
      ]
    }
  ],
  'he': [
    {
      id: 'he_alpha',
      name: 'Hebrew Alef-Bet',
      characters: [
        { symbol: 'א', romanization: 'Alef' }, { symbol: 'ב', romanization: 'Bet' }, { symbol: 'ג', romanization: 'Gimel' }, { symbol: 'ד', romanization: 'Dalet' }, { symbol: 'ה', romanization: 'He' },
        { symbol: 'ו', romanization: 'Vav' }, { symbol: 'ז', romanization: 'Zayin' }, { symbol: 'ח', romanization: 'Het' }, { symbol: 'ט', romanization: 'Tet' }, { symbol: 'י', romanization: 'Yod' }
      ]
    }
  ],
  'ar': [
    {
      id: 'ar_alpha',
      name: 'Arabic Letters 1',
      characters: [
        { symbol: 'ا', romanization: 'alif' }, { symbol: 'ب', romanization: 'ba' }, { symbol: 'ت', romanization: 'ta' }, { symbol: 'ث', romanization: 'tha' }, { symbol: 'ج', romanization: 'jim' },
        { symbol: 'ح', romanization: 'ha' }, { symbol: 'خ', romanization: 'kha' }, { symbol: 'د', romanization: 'dal' }, { symbol: 'ذ', romanization: 'dhal' }, { symbol: 'ر', romanization: 'ra' }
      ]
    },
    {
      id: 'ar_alpha_2',
      name: 'Arabic Letters 2',
      characters: [
        { symbol: 'ز', romanization: 'zay' }, { symbol: 'س', romanization: 'sin' }, { symbol: 'ش', romanization: 'shin' }, { symbol: 'ص', romanization: 'sad' }, { symbol: 'ض', romanization: 'dad' },
        { symbol: 'ط', romanization: 'ta' }, { symbol: 'ظ', romanization: 'za' }, { symbol: 'ع', romanization: 'ayn' }, { symbol: 'غ', romanization: 'ghayn' }, { symbol: 'ف', romanization: 'fa' }
      ]
    }
  ],
  'hi': [
    {
      id: 'hi_vowels',
      name: 'Hindi Vowels',
      characters: [
        { symbol: 'अ', romanization: 'a' }, { symbol: 'आ', romanization: 'aa' }, { symbol: 'इ', romanization: 'i' }, { symbol: 'ई', romanization: 'ee' }, { symbol: 'उ', romanization: 'u' },
        { symbol: 'ऊ', romanization: 'oo' }, { symbol: 'ऋ', romanization: 'ri' }, { symbol: 'ए', romanization: 'e' }, { symbol: 'ऐ', romanization: 'ai' }, { symbol: 'ओ', romanization: 'o' }
      ]
    },
    {
      id: 'hi_consonants',
      name: 'Hindi Consonants 1',
      characters: [
        { symbol: 'क', romanization: 'ka' }, { symbol: 'ख', romanization: 'kha' }, { symbol: 'ग', romanization: 'ga' }, { symbol: 'घ', romanization: 'gha' }, { symbol: 'ङ', romanization: 'nga' },
        { symbol: 'च', romanization: 'cha' }, { symbol: 'छ', romanization: 'chha' }, { symbol: 'ज', romanization: 'ja' }, { symbol: 'झ', romanization: 'jha' }, { symbol: 'ञ', romanization: 'nya' }
      ]
    }
  ],
  'th': [
     {
      id: 'th_mid',
      name: 'Thai Mid Consonants',
      characters: [
        { symbol: 'ก', romanization: 'gor kai' }, { symbol: 'จ', romanization: 'jor jaan' }, { symbol: 'ด', romanization: 'dor dek' }, { symbol: 'ต', romanization: 'dtor dtao' },
        { symbol: 'ฎ', romanization: 'dor cha-da' }, { symbol: 'ฏ', romanization: 'dtor bpa-dtak' }, { symbol: 'บ', romanization: 'bor bai-mai' }, { symbol: 'ป', romanization: 'bpor bplaa' },
        { symbol: 'อ', romanization: 'or aang' }
      ]
     },
     {
      id: 'th_high',
      name: 'Thai High Consonants',
      characters: [
        { symbol: 'ข', romanization: 'khor khai' }, { symbol: 'ฉ', romanization: 'chor ching' }, { symbol: 'ฐ', romanization: 'thor than' }, { symbol: 'ถ', romanization: 'thor thung' },
        { symbol: 'ผ', romanization: 'phor phueng' }, { symbol: 'ฝ', romanization: 'for fa' }, { symbol: 'ศ', romanization: 'sor sala' }, { symbol: 'ษ', romanization: 'sor ruesi' }, { symbol: 'ส', romanization: 'sor suea' }, { symbol: 'ห', romanization: 'hor hip' }
      ]
     },
     {
      id: 'th_low',
      name: 'Thai Low Consonants',
      characters: [
        { symbol: 'ค', romanization: 'khor khwai' }, { symbol: 'ฅ', romanization: 'khor khon' }, { symbol: 'ฆ', romanization: 'khor ra-khang' }, { symbol: 'ง', romanization: 'ngor ngu' },
        { symbol: 'ช', romanization: 'chor chang' }, { symbol: 'ซ', romanization: 'sor so' }, { symbol: 'ฌ', romanization: 'chor choe' }, { symbol: 'ญ', romanization: 'yor ying' },
        { symbol: 'ฑ', romanization: 'thor mon-tho' }, { symbol: 'ฒ', romanization: 'thor phu-thao' }
      ]
     },
     {
      id: 'th_vowels',
      name: 'Thai Vowels (Short)',
      characters: [
        { symbol: 'ะ', romanization: 'a' }, { symbol: 'ิ', romanization: 'i' }, { symbol: 'ึ', romanization: 'ue' }, { symbol: 'ุ', romanization: 'u' },
        { symbol: 'เะ', romanization: 'e' }, { symbol: 'แะ', romanization: 'ae' }, { symbol: 'โะ', romanization: 'o' }, { symbol: 'เาะ', romanization: 'or' },
        { symbol: 'เิะ', romanization: 'oe' }
      ]
     }
  ],
  'bg': [
    {
      id: 'bg_basic_1',
      name: 'Bulgarian Alphabet 1',
      characters: [
        { symbol: 'А', romanization: 'a' }, { symbol: 'Б', romanization: 'b' }, { symbol: 'В', romanization: 'v' }, { symbol: 'Г', romanization: 'g' }, { symbol: 'Д', romanization: 'd' },
        { symbol: 'Е', romanization: 'e' }, { symbol: 'Ж', romanization: 'zh' }, { symbol: 'З', romanization: 'z' }, { symbol: 'И', romanization: 'i' }, { symbol: 'Й', romanization: 'y' }
      ]
    },
    {
      id: 'bg_basic_2',
      name: 'Bulgarian Alphabet 2',
      characters: [
        { symbol: 'К', romanization: 'k' }, { symbol: 'Л', romanization: 'l' }, { symbol: 'М', romanization: 'm' }, { symbol: 'Н', romanization: 'n' }, { symbol: 'О', romanization: 'o' },
        { symbol: 'П', romanization: 'p' }, { symbol: 'Р', romanization: 'r' }, { symbol: 'С', romanization: 's' }, { symbol: 'Т', romanization: 't' }, { symbol: 'У', romanization: 'u' }
      ]
    },
    {
      id: 'bg_unique',
      name: 'Bulgarian Unique Letters',
      characters: [
        { symbol: 'Ф', romanization: 'f' }, { symbol: 'Х', romanization: 'h' }, { symbol: 'Ц', romanization: 'ts' }, { symbol: 'Ч', romanization: 'ch' }, { symbol: 'Ш', romanization: 'sh' },
        { symbol: 'Щ', romanization: 'sht' }, { symbol: 'Ъ', romanization: 'a (hard)' }, { symbol: 'Ь', romanization: 'y (soft)' }, { symbol: 'Ю', romanization: 'yu' }, { symbol: 'Я', romanization: 'ya' }
      ]
    }
  ],
  'sr': [
    {
      id: 'sr_cyrillic',
      name: 'Serbian Cyrillic',
      characters: [
        { symbol: 'А', romanization: 'a' }, { symbol: 'Б', romanization: 'b' }, { symbol: 'В', romanization: 'v' }, { symbol: 'Г', romanization: 'g' }, { symbol: 'Д', romanization: 'd' },
        { symbol: 'Ђ', romanization: 'đ' }, { symbol: 'Е', romanization: 'e' }, { symbol: 'Ж', romanization: 'zh' }, { symbol: 'З', romanization: 'z' }, { symbol: 'И', romanization: 'i' }
      ]
    },
     {
      id: 'sr_cyrillic_unique',
      name: 'Serbian Unique Letters',
      characters: [
         { symbol: 'Ј', romanization: 'j' }, { symbol: 'Љ', romanization: 'lj' }, { symbol: 'Њ', romanization: 'nj' }, { symbol: 'Ћ', romanization: 'ć' }, { symbol: 'Џ', romanization: 'dž' }
      ]
    }
  ]
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', title: 'First Step', description: 'Complete your first lesson', icon: '🦶', conditionType: 'LESSONS', conditionValue: 1 },
  { id: 'streak_3', title: 'On Fire', description: 'Reach a 3-day streak', icon: '🔥', conditionType: 'STREAK', conditionValue: 3 },
  { id: 'streak_7', title: 'Week Warrior', description: 'Reach a 7-day streak', icon: '📅', conditionType: 'STREAK', conditionValue: 7 },
  { id: 'streak_14', title: 'Committed', description: 'Reach a 14-day streak', icon: '🗓️', conditionType: 'STREAK', conditionValue: 14 },
  { id: 'streak_30', title: 'Monthly Master', description: 'Reach a 30-day streak', icon: '🏆', conditionType: 'STREAK', conditionValue: 30 },
  { id: 'xp_100', title: 'Novice', description: 'Earn 100 XP total', icon: '🥉', conditionType: 'XP', conditionValue: 100 },
  { id: 'xp_1000', title: 'Scholar', description: 'Earn 1000 XP total', icon: '🥇', conditionType: 'XP', conditionValue: 1000 },
  { id: 'xp_5000', title: 'Expert', description: 'Earn 5000 XP total', icon: '🎓', conditionType: 'XP', conditionValue: 5000 },
  { id: 'lessons_50', title: 'Dedicated', description: 'Complete 50 lessons', icon: '📚', conditionType: 'LESSONS', conditionValue: 50 },
  { id: 'lessons_100', title: 'Centurion', description: 'Complete 100 lessons', icon: '💯', conditionType: 'LESSONS', conditionValue: 100 },
  { id: 'polyglot_3', title: 'Polyglot', description: 'Start learning 3 languages', icon: '🌍', conditionType: 'LANGUAGES', conditionValue: 3 },
  { id: 'polyglot_5', title: 'World Traveler', description: 'Start learning 5 languages', icon: '✈️', conditionType: 'LANGUAGES', conditionValue: 5 },
  { id: 'score_130', title: 'Linguistic Legend', description: 'Reach a Language Score of 130', icon: '👑', conditionType: 'SCORE', conditionValue: 130 },
  { id: 'score_500', title: 'Grandmaster', description: 'Reach a Language Score of 500', icon: '💎', conditionType: 'SCORE', conditionValue: 500 },
];

export const LEAGUES = [
  { id: 'Bronze', order: 1, color: 'text-amber-700 dark:text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-300 dark:border-amber-700', icon: '🛡️', promoZone: 5, demoteZone: 0 },
  { id: 'Silver', order: 2, color: 'text-slate-400 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-300 dark:border-slate-600', icon: '⚔️', promoZone: 5, demoteZone: 15 },
  { id: 'Gold', order: 3, color: 'text-yellow-500 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/40', border: 'border-yellow-300 dark:border-yellow-600', icon: '👑', promoZone: 5, demoteZone: 15 },
  { id: 'Diamond', order: 4, color: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/40', border: 'border-cyan-300 dark:border-cyan-600', icon: '💎', promoZone: 3, demoteZone: 15 },
  { id: 'Obsidian', order: 5, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/40', border: 'border-purple-300 dark:border-purple-600', icon: '🔮', promoZone: 0, demoteZone: 10 },
];

const todayStr = new Date().toISOString().split('T')[0];

export const DEFAULT_GOALS: DailyGoal[] = [
  { id: 'g1', title: 'Complete 2 Lessons', target: 2, current: 0, completed: false, type: 'LESSONS', rewardXp: 20 },
  { id: 'g2', title: 'Earn 50 XP', target: 50, current: 0, completed: false, type: 'XP', rewardXp: 30 },
  { id: 'g3', title: '15 Correct Answers', target: 15, current: 0, completed: false, type: 'CORRECT_ANSWERS', rewardXp: 25 },
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
  nativeLanguageCode: 'en-US', // Default to US English
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
    autoDifficulty: true,
    enableSoundEffects: true,
    enableStreakFreeze: true,
    showCharacters: true,
    dailyGoalXp: 50,
    lessonDuration: 5,
    darkMode: false,
    disableAnimations: false
  }
};

export const XP_PER_LESSON = 15;