
import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { DEFAULT_USER } from './constants';
import { getProfile, saveProfile, consumeEnergy, logoutUser } from './services/storageService';
import { Navigation } from './components/BottomNav.tsx';
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
      const updatedUser = { ...user, hasCompletedOnboarding: true };
      setUser(updatedUser);
      saveProfile(updatedUser); // Saves to Guest Storage
      setCurrentView('languages'); // Direct them to pick a language
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
        weakAreas: []
      };
    }
    handleUpdateUser(updatedUser);
    setCurrentView('home');
  };

  const handleStartLesson = () => {
    const updatedProfile = consumeEnergy();
    if (updatedProfile) {
        setUser(updatedProfile);
        setIsPracticeMode(false);
        setFocusCharacters([]);
        setIsLessonActive(true);
    }
  };

  const handleStartPractice = () => {
    const updatedProfile = consumeEnergy();
    if (updatedProfile) {
        setUser(updatedProfile);
        setIsPracticeMode(true);
        setFocusCharacters([]);
        setIsLessonActive(true);
    }
  };

  const handleStartCharacterLesson = (characters: string[]) => {
    const updatedProfile = consumeEnergy();
    if (updatedProfile) {
        setUser(updatedProfile);
        setIsPracticeMode(false);
        setFocusCharacters(characters);
        setIsLessonActive(true);
    }
  };

  const handleFinishLesson = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setIsLessonActive(false);
    setIsPracticeMode(false);
    setFocusCharacters([]);
  };

  // Guest Check
  if (showLanding) {
    return <Landing user={user} onLogin={handleLogin} onContinueAsGuest={handleContinueAsGuest} />;
  }

  // View Routing
  if (isLessonActive) {
    return (
      <LessonView 
        user={user} 
        onComplete={handleFinishLesson} 
        onExit={() => setIsLessonActive(false)} 
        isPractice={isPracticeMode}
        focusCharacters={focusCharacters}
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'languages':
        return <LanguageSelection user={user} onSelectLanguage={handleSelectLanguage} />;
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
    <div className="h-full bg-gray-50 flex flex-col md:flex-row justify-center overflow-hidden">
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-brand-green text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 transition-all duration-500 ${showSyncToast ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
          <Wifi size={18} />
          <span className="font-bold text-sm">Back online! Syncing progress...</span>
      </div>

      <Navigation currentView={currentView} setView={setCurrentView} userPreferences={user.preferences} />

      <main className="flex-1 h-full relative w-full max-w-4xl mx-auto bg-white md:shadow-xl md:my-4 md:rounded-2xl overflow-hidden border-gray-200 md:border">
          {renderView()}
      </main>
    </div>
  );
};

export default App;