
import React from 'react';
import { UserProfile } from '../types';
import { Settings as SettingsIcon, BrainCircuit, Volume2, BookOpen, Flame, Target, Moon, ZapOff } from 'lucide-react';

interface SettingsProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
}

export const SettingsView: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  // Helper to toggle boolean preferences
  const togglePreference = (key: keyof typeof user.preferences) => {
    const newPrefs = {
      ...user.preferences,
      [key]: !user.preferences[key as keyof typeof user.preferences]
    };
    onUpdateUser({ ...user, preferences: newPrefs });
  };

  // Helper to set numeric preferences
  const setNumericPreference = (key: keyof typeof user.preferences, value: number) => {
     const newPrefs = {
      ...user.preferences,
      [key]: value
    };
    onUpdateUser({ ...user, preferences: newPrefs });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 md:rounded-2xl overflow-hidden transition-colors duration-300">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <SettingsIcon className="text-gray-400" size={32} />
          <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold">Manage your app preferences</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* Appearance Section */}
        <section>
           <h2 className="text-lg font-extrabold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wide">Appearance</h2>
           
           <div className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-4 flex items-center justify-between shadow-sm mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Moon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">Dark Mode</h3>
                <p className="text-gray-500 dark:text-gray-300 text-sm font-medium max-w-xs">
                  Switch between light and dark themes.
                </p>
              </div>
            </div>
            <button 
              onClick={() => togglePreference('darkMode')}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue ${user.preferences?.darkMode ? 'bg-brand-green' : 'bg-gray-300 dark:bg-gray-500'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${user.preferences?.darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-pink-100 dark:bg-pink-900/50 p-3 rounded-xl text-pink-600 dark:text-pink-400">
                <ZapOff size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">Disable Animations</h3>
                <p className="text-gray-500 dark:text-gray-300 text-sm font-medium max-w-xs">
                  Turn off animations for a static experience.
                </p>
              </div>
            </div>
            <button 
              onClick={() => togglePreference('disableAnimations')}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue ${user.preferences?.disableAnimations ? 'bg-brand-green' : 'bg-gray-300 dark:bg-gray-500'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${user.preferences?.disableAnimations ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

        </section>
        
        {/* General Section */}
        <section>
          <h2 className="text-lg font-extrabold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wide">General</h2>
          
          <div className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl text-brand-blue dark:text-blue-400">
                <Volume2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">Sound Effects</h3>
                <p className="text-gray-500 dark:text-gray-300 text-sm font-medium max-w-xs">
                  Play sounds for correct answers and achievements.
                </p>
              </div>
            </div>
            <button 
              onClick={() => togglePreference('enableSoundEffects')}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue ${user.preferences?.enableSoundEffects ? 'bg-brand-green' : 'bg-gray-300 dark:bg-gray-500'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${user.preferences?.enableSoundEffects ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </section>

        {/* Learning Preferences Section */}
        <section>
          <h2 className="text-lg font-extrabold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wide">Learning</h2>
          
          <div className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-4 flex items-center justify-between shadow-sm mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-xl text-purple-600 dark:text-purple-400">
                <BrainCircuit size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">Auto Difficulty</h3>
                <p className="text-gray-500 dark:text-gray-300 text-sm font-medium max-w-xs">
                  Automatically adjust difficulty based on your level.
                </p>
                {user.preferences?.autoDifficulty && (
                  <div className="mt-1 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 inline-block px-2 py-0.5 rounded">
                    Adaptive Mode On
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => togglePreference('autoDifficulty')}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue ${user.preferences?.autoDifficulty ? 'bg-brand-green' : 'bg-gray-300 dark:bg-gray-500'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${user.preferences?.autoDifficulty ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-xl text-yellow-600 dark:text-yellow-400">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">Show Characters Tab</h3>
                <p className="text-gray-500 dark:text-gray-300 text-sm font-medium max-w-xs">
                   Display the alphabet/character learning section in the navigation.
                </p>
              </div>
            </div>
            <button 
              onClick={() => togglePreference('showCharacters')}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue ${user.preferences?.showCharacters ? 'bg-brand-green' : 'bg-gray-300 dark:bg-gray-500'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${user.preferences?.showCharacters ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </section>

        {/* Goals & Streaks */}
        <section>
           <h2 className="text-lg font-extrabold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wide">Goals & Streaks</h2>

           <div className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-4 flex items-center justify-between shadow-sm mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-xl text-brand-red dark:text-red-400">
                <Flame size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">Streak Freeze</h3>
                <p className="text-gray-500 dark:text-gray-300 text-sm font-medium max-w-xs">
                  Allow the use of streak freezes to protect your streak when you miss a day.
                </p>
              </div>
            </div>
            <button 
              onClick={() => togglePreference('enableStreakFreeze')}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue ${user.preferences?.enableStreakFreeze ? 'bg-brand-green' : 'bg-gray-300 dark:bg-gray-500'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${user.preferences?.enableStreakFreeze ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
               <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-xl text-brand-green dark:text-green-400">
                  <Target size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">Daily Goal</h3>
                  <p className="text-gray-500 dark:text-gray-300 text-sm font-medium">Set your daily XP target.</p>
               </div>
            </div>
            
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {[10, 30, 50].map(val => (
                   <button 
                      key={val}
                      onClick={() => setNumericPreference('dailyGoalXp', val)}
                      className={`flex-1 py-2 rounded-lg font-bold transition-all ${user.preferences?.dailyGoalXp === val ? 'bg-white dark:bg-gray-600 text-brand-blue dark:text-blue-300 shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                   >
                      {val} XP
                   </button>
                ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};