
import { UserProfile, LanguageProgress, DailyGoal, OfflineLesson } from '../types';
import { DEFAULT_USER, ACHIEVEMENTS, DEFAULT_GOALS, MAX_ENERGY, ENERGY_REGEN_MS } from '../constants';

// Keys
const USERS_KEY = 'lingoquest_users_db'; // Map of email -> UserProfile
const SESSION_KEY = 'lingoquest_current_session'; // Current user email
const OFFLINE_LESSONS_KEY = 'lingoquest_offline_lessons';

const getTodayStr = () => new Date().toISOString().split('T')[0];

// Helper to get all users
const getUsersMap = (): Record<string, UserProfile> => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
};

// Helper to save all users
const saveUsersMap = (map: Record<string, UserProfile>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(map));
};

export const getProfile = (): UserProfile => {
  try {
    const sessionEmail = localStorage.getItem(SESSION_KEY);
    if (!sessionEmail) return DEFAULT_USER;

    const users = getUsersMap();
    const user = users[sessionEmail];

    if (!user) {
      // Session invalid
      localStorage.removeItem(SESSION_KEY);
      return DEFAULT_USER;
    }

    let profile = { ...DEFAULT_USER, ...user, isGuest: false }; 

    // --- Energy Regeneration Logic ---
    if (profile.energy < MAX_ENERGY) {
      const now = Date.now();
      const lastRefill = new Date(profile.lastEnergyRefill).getTime();
      const diff = now - lastRefill;

      if (diff >= ENERGY_REGEN_MS) {
        const energyToRestore = Math.floor(diff / ENERGY_REGEN_MS);
        const newEnergy = Math.min(MAX_ENERGY, profile.energy + energyToRestore);
        
        if (newEnergy > profile.energy) {
             const remainder = diff % ENERGY_REGEN_MS;
             const newRefillTime = new Date(now - remainder).toISOString();
             
             profile.energy = newEnergy;
             profile.lastEnergyRefill = newRefillTime;
             saveProfile(profile); // Save immediately
        }
      }
    }
    // ---------------------------------

    // Check for new day logic
    const today = getTodayStr();
    if (profile.lastActiveDate !== today) {
      const lastDate = new Date(profile.lastActiveDate);
      const curDate = new Date(today);
      const diffTime = Math.abs(curDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays > 1) {
        profile.streak = 0; // Broken streak
      } 
      
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
    if (profile.isGuest || !profile.email) return; // Don't save guest to DB

    const users = getUsersMap();
    users[profile.email] = profile;
    saveUsersMap(users);
  } catch (e) {
    console.error("Failed to save profile", e);
  }
};

// --- AUTH METHODS ---

export const registerUser = (email: string, password: string, name: string, username: string, avatar: string): { success: boolean, message?: string, user?: UserProfile } => {
    const users = getUsersMap();
    if (users[email]) {
        return { success: false, message: 'Email already exists' };
    }

    const newUser: UserProfile = {
        ...DEFAULT_USER,
        id: `user_${Date.now()}`,
        email,
        password, // In a real app, hash this!
        name,
        username,
        avatar,
        isGuest: false,
        joinDate: new Date().toISOString(),
    };

    users[email] = newUser;
    saveUsersMap(users);
    localStorage.setItem(SESSION_KEY, email);
    
    return { success: true, user: newUser };
};

export const loginUser = (email: string, password: string): { success: boolean, message?: string, user?: UserProfile } => {
    const users = getUsersMap();
    const user = users[email];

    if (!user || user.password !== password) {
        return { success: false, message: 'Invalid email or password' };
    }

    localStorage.setItem(SESSION_KEY, email);
    return { success: true, user };
};

export const logoutUser = () => {
    localStorage.removeItem(SESSION_KEY);
};

// -------------------

export const consumeEnergy = (): UserProfile | null => {
    const profile = getProfile();
    if (profile.energy > 0) {
        profile.energy -= 1;
        // If we were full, start the timer
        if (profile.energy === MAX_ENERGY - 1) {
            profile.lastEnergyRefill = new Date().toISOString();
        }
        saveProfile(profile);
        return profile;
    }
    return null;
};

// --- Offline Lesson Management ---

export const saveOfflineLesson = (lesson: OfflineLesson): void => {
  try {
    const existingStr = localStorage.getItem(OFFLINE_LESSONS_KEY);
    const existing: OfflineLesson[] = existingStr ? JSON.parse(existingStr) : [];
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
    existing.splice(index, 1);
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
  weakTopicsDetected: string[];
  strongTopicsDetected: string[];
}

export const completeLesson = (result: LessonResult, isPractice: boolean = false): { profile: UserProfile; newAchievements: string[] } => {
  const profile = getProfile();
  const { langCode, xpGained, weakTopicsDetected, strongTopicsDetected } = result;

  const currentProgress = profile.progress[langCode] || {
    languageCode: langCode,
    xp: 0,
    level: 1,
    lessonsCompleted: 0,
    weakAreas: []
  };

  let newWeakAreas = [...(currentProgress.weakAreas || [])];
  weakTopicsDetected.forEach(topic => {
    if (topic && !newWeakAreas.includes(topic)) newWeakAreas.push(topic);
  });
  newWeakAreas = newWeakAreas.filter(topic => !strongTopicsDetected.includes(topic));

  const newXp = currentProgress.xp + xpGained;
  const newLevel = Math.floor(newXp / 100) + 1;
  const lessonsIncrement = isPractice ? 0 : 1;

  const updatedProgress: LanguageProgress = {
    ...currentProgress,
    xp: newXp,
    level: newLevel,
    lessonsCompleted: currentProgress.lessonsCompleted + lessonsIncrement,
    weakAreas: newWeakAreas
  };

  const isFirstAction = profile.dailyGoals.every(g => g.current === 0);
  if (isFirstAction) {
    profile.streak += 1;
  }

  const updatedGoals = profile.dailyGoals.map(goal => {
    let newCurrent = goal.current;
    if (goal.type === 'XP') newCurrent += xpGained;
    if (goal.type === 'LESSONS') newCurrent += 1;
    
    return {
      ...goal,
      current: newCurrent,
      completed: newCurrent >= goal.target
    };
  });

  const unlockedIds: string[] = [];
  const totalXP = Object.values(profile.progress).reduce((acc, p) => acc + p.xp, 0) + xpGained; 
  const totalLessons = Object.values(profile.progress).reduce((acc, p) => acc + p.lessonsCompleted, 0) + lessonsIncrement;
  const languageCount = Object.keys(profile.progress).length;
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

  const updatedProfile: UserProfile = {
    ...profile,
    streak: profile.streak,
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
