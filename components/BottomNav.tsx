
import React from 'react';
import { Home, User, Globe, Trophy, BookA, Settings } from 'lucide-react';
import { UserProfile } from '../types'; // Added import for UserProfile type checking (implicitly used via props though prop not typed here yet, fixing logic below)
import { getProfile } from '../services/storageService'; // We need to read current profile prefs if not passed. But better to use getProfile as a safe fallback if props aren't easy to drill immediately, though strict React data flow suggests props. 
// However, Navigation is used in App.tsx which has user state. Let's check App.tsx... 
// App.tsx passes `currentView` and `setView`. It does NOT pass `user`. 
// To do this properly, I will assume we fetch the profile from storage or better, I will update App.tsx to pass user to Navigation if I could. 
// BUT, per instructions I can only update files I provide.
// I will modify Navigation to accept `userPreferences` or just `user`. 
// Let's check the props in App.tsx... Navigation is called as `<Navigation currentView={currentView} setView={setCurrentView} />`
// I need to update App.tsx to pass user, OR read from localStorage here.
// Reading from localStorage is safer to avoid changing App.tsx signature widely if I don't have to, but updating App.tsx is cleaner. 
// I will update App.tsx as well to pass `user`.

// Updating interfaces:
interface NavigationProps {
  currentView: string;
  setView: (view: string) => void;
  userPreferences?: { showCharacters: boolean }; // Optional to avoid breaking if undefined during initial render
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, userPreferences }) => {
  const showCharacters = userPreferences?.showCharacters ?? true;

  const navItems = [
    { id: 'home', icon: Home, label: 'Learn' },
    { id: 'characters', icon: BookA, label: 'Characters', hidden: !showCharacters },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'languages', icon: Globe, label: 'Languages' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ].filter(item => !item.hidden);

  return (
    <nav className="
      fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe z-50 
      md:relative md:w-64 md:h-full md:border-r md:border-t-0 md:flex md:flex-col md:p-4
    ">
      {/* Mobile Layout */}
      <div className="flex justify-around items-center h-20 max-w-md mx-auto md:hidden overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center min-w-[60px] h-full space-y-1 ${
                isActive ? 'text-brand-blue' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold uppercase">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Sidebar Layout */}
      <div className="hidden md:flex flex-col h-full">
          <div className="mb-8 pl-4">
             <h1 className="text-3xl font-extrabold text-brand-green tracking-tighter">LingoQuest</h1>
          </div>
          
          <div className="flex-1 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`
                    flex items-center w-full p-4 rounded-xl transition-all text-left gap-4 border-2
                    ${isActive 
                      ? 'bg-blue-50 border-brand-blue text-brand-blue' 
                      : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100'}
                  `}
                >
                  <Icon size={24} strokeWidth={isActive ? 3 : 2} />
                  <span className="text-sm font-extrabold uppercase tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </div>
      </div>
    </nav>
  );
};
