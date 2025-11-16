
import React from 'react';
import { Home, User, Globe, Trophy, BookA } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Learn' },
    { id: 'characters', icon: BookA, label: 'Characters' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'languages', icon: Globe, label: 'Languages' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="
      fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe z-50 
      md:relative md:w-64 md:h-full md:border-r md:border-t-0 md:flex md:flex-col md:p-4
    ">
      {/* Mobile Layout */}
      <div className="flex justify-around items-center h-20 max-w-md mx-auto md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
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
          
          <div className="flex-1 space-y-2">
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
