
import React, { useState, useEffect } from 'react';
import { UserProfile, Lesson } from './types';
import { DEFAULT_USER } from './constants';
import { getProfile, saveProfile, consumeEnergy, logoutUser } from './services/storageService';
import { Navigation } from './components/BottomNav';
import { LanguageSelection } from './views/LanguageSelection';
import { Profile } from './views/Profile';
import { Dashboard } from './views/Dashboard';
import { LessonView } from './views/LessonView';
import { Leaderboard } from './views/Leaderboard';
import { Landing } from './views/Landing';
import { CharactersView } from './views/CharactersView';
import { SettingsView } from './views/Settings';
import { Wifi } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'languages' | 'profile' | 'lesson' | 'leaderboard' | 'characters' | 'settings'
  const [isLessonActive, setIsLessonActive] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [focusCharacters, setFocusCharacters] = useState<string[]>([]);
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [showLanding, setShowLanding] = useState(!user.hasCompletedOnboarding);
  const [lessonId, setLessonId] = useState(0); // Used to force remount of LessonView
  const [preloadedLesson, setPreloadedLesson] = useState<Lesson | null>(null);

  // Effect to apply Dark Mode and Animation preferences globally
  useEffect(() => {
    if (user.preferences?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (user.preferences?.disableAnimations) {
      document.body.classList.add('disable-animations');
    } else {
      document.body.classList.remove('disable-animations');
    }
  }, [user.preferences?.darkMode, user.preferences?.disableAnimations]);

  useEffect(() => {
    const timer = setInterval(() => {
        const loadedUser = getProfile();
        // Check if session expired or changed
        // If loaded user has onboarding completed but current user doesn't (or vice versa), update
        // Also check energy
        setUser(prev => {
            if (JSON.stringify(prev.energy) !== JSON.stringify(loadedUser.energy) || 
                JSON.stringify(prev.lastEnergyRefill) !== JSON.stringify(loadedUser.lastEnergyRefill) ||
                prev.isGuest !== loadedUser.isGuest ||
                prev.hasCompletedOnboarding !== loadedUser.hasCompletedOnboarding) {
                return loadedUser;
            }
            return prev;
        });
    }, 60000);

    const loadedUser = getProfile();
    setUser(loadedUser);
    setShowLanding(!loadedUser.hasCompletedOnboarding);
    
    if (loadedUser.hasCompletedOnboarding && !loadedUser.currentLanguageCode) {
      setCurrentView('languages');
    }

    const handleOnline = () => {
       setShowSyncToast(true);
       setTimeout(() => setShowSyncToast(false), 3000);
    };
    window.addEventListener('online', handleOnline);
    return () => {
        window.removeEventListener('online', handleOnline);
        clearInterval(timer);
    }
  }, []);

  // Update landing view visibility when user state changes
  useEffect(() => {
      setShowLanding(!user.hasCompletedOnboarding);
  }, [user.hasCompletedOnboarding]);

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    saveProfile(updatedUser);
  };

  const handleLogin = (newUser: UserProfile) => {
    handleUpdateUser(newUser);
    if (!newUser.currentLanguageCode) {
      setCurrentView('languages');
    } else {
      setCurrentView('home');
    }
  };

  const handleContinueAsGuest = () => {
      const updatedUser = { ...user, isGuest: true, hasCompletedOnboarding: true };
      setUser(updatedUser);
      saveProfile(updatedUser); // Saves to Guest Storage
      setShowLanding(false); // Immediately hide landing
      
      if (!updatedUser.currentLanguageCode) {
          setCurrentView('languages'); // Direct them to pick a language
      }
  };

  const handleLogout = () => {
      logoutUser();
      setUser(DEFAULT_USER);
      setCurrentView('home');
      setShowLanding(true);
  };

  const handleSelectLanguage = (code: string) => {
    const updatedUser = { ...user, currentLanguageCode: code };
    if (!updatedUser.progress[code]) {
      updatedUser.progress[code] = {
        languageCode: code,
        xp: 0,
        level: 1,
        lessonsCompleted: 0,
        weakAreas: [],
        proficiency: 'Beginner' // Default proficiency
      };
    }
    handleUpdateUser(updatedUser);
    // Removed immediate navigation to 'home' to allow user to see selection state
  };

  const handleStartLesson = (lesson?: Lesson) => {
    const updatedProfile = consumeEnergy();
    if (updatedProfile) {
        setUser(updatedProfile);
        setIsPracticeMode(false);
        setFocusCharacters([]);
        if (lesson) {
           setPreloadedLesson(lesson);
        } else {
           setPreloadedLesson(null);
        }
        setLessonId(prev => prev + 1);
        setIsLessonActive(true);
    }
  };

  const handleStartPractice = () => {
    const updatedProfile = consumeEnergy();
    if (updatedProfile) {
        setUser(updatedProfile);
        setIsPracticeMode(true);
        setFocusCharacters([]);
        setPreloadedLesson(null);
        setLessonId(prev => prev + 1);
        setIsLessonActive(true);
    }
  };

  const handleStartCharacterLesson = (characters: string[]) => {
    const updatedProfile = consumeEnergy();
    if (updatedProfile) {
        setUser(updatedProfile);
        setIsPracticeMode(false);
        setFocusCharacters(characters);
        setPreloadedLesson(null);
        setLessonId(prev => prev + 1);
        setIsLessonActive(true);
    }
  };

  const handleFinishLesson = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setIsLessonActive(false);
    setIsPracticeMode(false);
    setFocusCharacters([]);
    setPreloadedLesson(null);
  };

  const handleReviewWeakAreas = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    saveProfile(updatedUser); // Ensure progress is saved
    
    // Start practice mode immediately
    setIsPracticeMode(true);
    setFocusCharacters([]);
    setPreloadedLesson(null);
    setLessonId(prev => prev + 1); // Force remount for new lesson generation
    setIsLessonActive(true);
  };

  // Guest Check
  if (showLanding) {
    return <Landing user={user} onLogin={handleLogin} onContinueAsGuest={handleContinueAsGuest} />;
  }

  // View Routing
  if (isLessonActive) {
    return (
      <LessonView 
        key={lessonId} // Force remount when starting new lesson
        user={user} 
        onComplete={handleFinishLesson} 
        onExit={() => setIsLessonActive(false)} 
        onReviewWeakAreas={handleReviewWeakAreas}
        isPractice={isPracticeMode}
        focusCharacters={focusCharacters}
        initialLesson={preloadedLesson}
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'languages':
        return (
          <LanguageSelection 
            user={user} 
            onSelectLanguage={handleSelectLanguage} 
            onUpdateUser={handleUpdateUser} 
            onContinue={() => setCurrentView('home')}
          />
        );
      case 'profile':
        return (
            <Profile user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />
        );
      case 'leaderboard':
        return <Leaderboard user={user} />;
      case 'characters':
        return <CharactersView user={user} onStartLesson={handleStartCharacterLesson} />;
      case 'settings':
        return <SettingsView user={user} onUpdateUser={handleUpdateUser} />;
      case 'home':
      default:
        return (
            <Dashboard 
                user={user} 
                onStartLesson={handleStartLesson} 
                onStartPractice={handleStartPractice}
                onChangeLanguage={() => setCurrentView('languages')} 
            />
        );
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row justify-center overflow-hidden transition-colors duration-300">
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-brand-green text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 transition-all duration-500 ${showSyncToast ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
          <Wifi size={18} />
          <span className="font-bold text-sm">Back online! Syncing progress...</span>
      </div>

      <Navigation 
        currentView={currentView} 
        setView={setCurrentView} 
        userPreferences={user.preferences}
        onPressLogo={() => setShowLanding(true)}
      />

      <main className="flex-1 h-full relative w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 md:shadow-xl md:my-4 md:rounded-2xl overflow-hidden border-gray-200 dark:border-gray-700 md:border transition-colors duration-300">
          {renderView()}
      </main>
    </div>
  );
};

export default App;
