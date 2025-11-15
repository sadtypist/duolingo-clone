
import { UserProfile, LanguageProgress, DailyGoal, OfflineLesson } from '../types';
import { DEFAULT_USER, ACHIEVEMENTS, DEFAULT_GOALS } from '../constants';

const STORAGE_KEY = 'lingoquest_user_v2';
const OFFLINE_LESSONS_KEY = 'lingoquest_offline_lessons';

const getTodayStr = () => new Date().toISOString().split('T')[0];

export const getProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let profile: UserProfile = DEFAULT_USER;

    if (stored) {
      const parsed = JSON.parse(stored);
      profile = { ...DEFAULT_USER, ...parsed }; 
    }

    // Check for new day logic
    const today = getTodayStr();
    if (profile.lastActiveDate !== today) {
      // It's a new day (or skipped days)
      
      // Check Streak
      const lastDate = new Date(profile.lastActiveDate);
      const curDate = new Date(today);
      const diffTime = Math.abs(curDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays > 1) {
        profile.streak = 0; // Broken streak
      } else if (diffDays === 1) {
        // Kept streak, logic handled when they actually complete a lesson usually, 
        // but we just maintain the count here. Actual increment happens on activity.
      }
      
      // Reset Daily Goals
      profile.dailyGoals = DEFAULT_GOALS.map(g => ({ ...g, current: 0, completed: false }));
      profile.lastActiveDate = today;
      saveProfile(profile);
    }

    return profile;
  } catch (e) {
    console.error("Failed to load profile", e);
    return DEFAULT_USER;
  }
};

export const saveProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
};

// --- Offline Lesson Management ---

export const saveOfflineLesson = (lesson: OfflineLesson): void => {
  try {
    const existingStr = localStorage.getItem(OFFLINE_LESSONS_KEY);
    const existing: OfflineLesson[] = existingStr ? JSON.parse(existingStr) : [];
    // Limit to 10 offline lessons to save space
    if (existing.length >= 10) existing.shift();
    existing.push(lesson);
    localStorage.setItem(OFFLINE_LESSONS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Failed to save offline lesson", e);
  }
};

export const getOfflineLessonCount = (langCode: string): number => {
  try {
    const existingStr = localStorage.getItem(OFFLINE_LESSONS_KEY);
    if (!existingStr) return 0;
    const existing: OfflineLesson[] = JSON.parse(existingStr);
    return existing.filter(l => l.languageCode === langCode).length;
  } catch (e) {
    return 0;
  }
};

export const popOfflineLesson = (langCode: string): OfflineLesson | null => {
  try {
    const existingStr = localStorage.getItem(OFFLINE_LESSONS_KEY);
    if (!existingStr) return null;
    let existing: OfflineLesson[] = JSON.parse(existingStr);
    
    const index = existing.findIndex(l => l.languageCode === langCode);
    if (index === -1) return null;

    const lesson = existing[index];
    existing.splice(index, 1); // Remove from storage once used (consumed)
    localStorage.setItem(OFFLINE_LESSONS_KEY, JSON.stringify(existing));
    return lesson;
  } catch (e) {
    console.error("Failed to pop offline lesson", e);
    return null;
  }
};

// ------------------------------

interface LessonResult {
  langCode: string;
  xpGained: number;
  questionsTotal: number;
  questionsCorrect: number;
  weakTopicsDetected: string[]; // Topics user missed
  strongTopicsDetected: string[]; // Topics user aced
}

export const completeLesson = (result: LessonResult, isPractice: boolean = false): { profile: UserProfile; newAchievements: string[] } => {
  const profile = getProfile();
  const { langCode, xpGained, weakTopicsDetected, strongTopicsDetected } = result;

  // 1. Update Language Progress (Adaptive Learning)
  const currentProgress = profile.progress[langCode] || {
    languageCode: langCode,
    xp: 0,
    level: 1,
    lessonsCompleted: 0,
    weakAreas: []
  };

  // Merge weak areas: add new ones, remove fixed ones
  let newWeakAreas = [...(currentProgress.weakAreas || [])];
  // Add detected weak topics if not present
  weakTopicsDetected.forEach(topic => {
    if (topic && !newWeakAreas.includes(topic)) newWeakAreas.push(topic);
  });
  // Remove strong topics
  newWeakAreas = newWeakAreas.filter(topic => !strongTopicsDetected.includes(topic));

  const newXp = currentProgress.xp + xpGained;
  // Update level based on XP
  const newLevel = Math.floor(newXp / 100) + 1;
  
  // Only increment lessons completed if it is NOT a practice session
  const lessonsIncrement = isPractice ? 0 : 1;

  const updatedProgress: LanguageProgress = {
    ...currentProgress,
    xp: newXp,
    level: newLevel,
    lessonsCompleted: currentProgress.lessonsCompleted + lessonsIncrement,
    weakAreas: newWeakAreas
  };

  // 2. Update Streak (only increment if first lesson of the day)
  const isFirstAction = profile.dailyGoals.every(g => g.current === 0);
  if (isFirstAction) {
    profile.streak += 1;
  }

  // 3. Update Daily Goals
  const updatedGoals = profile.dailyGoals.map(goal => {
    let newCurrent = goal.current;
    if (goal.type === 'XP') newCurrent += xpGained;
    if (goal.type === 'LESSONS') newCurrent += 1; // Practice counts towards daily goals? Let's say yes for engagement.
    
    return {
      ...goal,
      current: newCurrent,
      completed: newCurrent >= goal.target
    };
  });

  // 4. Check Achievements
  const unlockedIds: string[] = [];
  const totalXP = Object.values(profile.progress).reduce((acc, p) => acc + p.xp, 0) + xpGained; // approx
  const totalLessons = Object.values(profile.progress).reduce((acc, p) => acc + p.lessonsCompleted, 0) + lessonsIncrement;
  const languageCount = Object.keys(profile.progress).length;
  
  // Calculate Language Score (Logic mirrored from Profile.tsx)
  const score = Math.floor((totalXP * 0.5) + (totalLessons * 10) + (languageCount * 50));

  ACHIEVEMENTS.forEach(ach => {
    if (profile.achievements.includes(ach.id)) return;

    let earned = false;
    switch (ach.conditionType) {
      case 'XP': earned = totalXP >= ach.conditionValue; break;
      case 'LESSONS': earned = totalLessons >= ach.conditionValue; break;
      case 'STREAK': earned = profile.streak >= ach.conditionValue; break;
      case 'LANGUAGES': earned = languageCount >= ach.conditionValue; break;
      case 'SCORE': earned = score >= ach.conditionValue; break;
    }

    if (earned) {
      unlockedIds.push(ach.id);
    }
  });

  // Construct Final Profile
  const updatedProfile: UserProfile = {
    ...profile,
    streak: profile.streak, // already updated above if needed
    progress: {
      ...profile.progress,
      [langCode]: updatedProgress
    },
    dailyGoals: updatedGoals,
    achievements: [...profile.achievements, ...unlockedIds]
  };

  saveProfile(updatedProfile);
  return { profile: updatedProfile, newAchievements: unlockedIds };
};
