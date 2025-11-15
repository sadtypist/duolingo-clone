
import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { DEFAULT_USER } from './constants';
import { getProfile, saveProfile } from './services/storageService';
import { Navigation } from './components/BottomNav'; // Using the updated component
import { LanguageSelection } from './views/LanguageSelection';
import { Profile } from './views/Profile';
import { Dashboard } from './views/Dashboard';
import { LessonView } from './views/LessonView';
import { Wifi } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'languages' | 'profile' | 'lesson'
  const [isLessonActive, setIsLessonActive] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);

  useEffect(() => {
    const loadedUser = getProfile();
    setUser(loadedUser);
    
    if (!loadedUser.currentLanguageCode) {
      setCurrentView('languages');
    }

    // Network Listeners
    const handleOnline = () => {
       setShowSyncToast(true);
       setTimeout(() => setShowSyncToast(false), 3000);
       // Here we would trigger actual server sync if we had a backend
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    saveProfile(updatedUser);
  };

  const handleSelectLanguage = (code: string) => {
    const updatedUser = { ...user, currentLanguageCode: code };
    
    // Initialize progress if new
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
    setIsPracticeMode(false);
    setIsLessonActive(true);
  };

  const handleStartPractice = () => {
    setIsPracticeMode(true);
    setIsLessonActive(true);
  };

  const handleFinishLesson = (updatedUser: UserProfile) => {
    setUser(updatedUser); // State update will reflect new XP/Progress
    setIsLessonActive(false);
    setIsPracticeMode(false);
  };

  // View Routing Logic
  if (isLessonActive) {
    return (
      <LessonView 
        user={user} 
        onComplete={handleFinishLesson} 
        onExit={() => setIsLessonActive(false)} 
        isPractice={isPracticeMode}
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'languages':
        return <LanguageSelection user={user} onSelectLanguage={handleSelectLanguage} />;
      case 'profile':
        return <Profile user={user} onUpdateUser={handleUpdateUser} />;
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
      {/* Sync Notification Toast */}
      <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-brand-green text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 transition-all duration-500 ${showSyncToast ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
          <Wifi size={18} />
          <span className="font-bold text-sm">Back online! Syncing progress...</span>
      </div>

      {/* Navigation Sidebar/Bottom Bar */}
      <Navigation currentView={currentView} setView={setCurrentView} />

      {/* Main Content Area */}
      <main className="flex-1 h-full relative w-full max-w-4xl mx-auto bg-white md:shadow-xl md:my-4 md:rounded-2xl overflow-hidden border-gray-200 md:border">
          {renderView()}
      </main>
    </div>
  );
};

export default App;
