
import React, { useState } from 'react';
import { UserProfile, LanguageProgress } from '../types';
import { LEAGUES } from '../constants';
import { ChevronUp, ChevronDown, Info, Shield, Trophy, BookOpen, ArrowDownAZ, Check } from 'lucide-react';

interface LeaderboardProps {
  user: UserProfile;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  lessons: number;
  avatar: string;
  isUser: boolean;
}

// Mock Data Generator for Leaderboard
const generateMockLeaderboard = (userLeague: string, userXp: number, userLessons: number, userName: string, userAvatar: string): LeaderboardEntry[] => {
  const count = 20;
  const data: LeaderboardEntry[] = [];
  const names = ["Alex", "Sam", "Jordan", "Taylor", "Casey", "Riley", "Morgan", "Jamie", "Quinn", "Avery", "Dakota", "Reese", "Sky", "Parker", "Sage"];
  const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐵"];

  // Add random users
  for (let i = 0; i < count - 1; i++) {
    data.push({
      id: `mock_${i}`,
      name: names[i % names.length] + " " + String.fromCharCode(65 + i),
      xp: Math.floor(Math.random() * 1000) + 50, // Random XP
      lessons: Math.floor(Math.random() * 50) + 5, // Random Lessons
      avatar: emojis[i % emojis.length],
      isUser: false,
    });
  }

  // Add Current User
  data.push({
    id: 'user_me',
    name: userName,
    xp: userXp, 
    lessons: userLessons,
    avatar: userAvatar,
    isUser: true
  });

  // Default Sort by XP
  return data.sort((a, b) => b.xp - a.xp);
};

type SortOption = 'xp' | 'lessons' | 'name';

export const Leaderboard: React.FC<LeaderboardProps> = ({ user }) => {
  // Calculate metrics
  const totalXP = (Object.values(user.progress) as LanguageProgress[]).reduce((acc, p) => acc + p.xp, 0);
  const totalLessons = (Object.values(user.progress) as LanguageProgress[]).reduce((acc, p) => acc + p.lessonsCompleted, 0);
  
  // Initialize mock data once
  const [rankings] = useState<LeaderboardEntry[]>(() => generateMockLeaderboard(user.currentLeague, totalXP, totalLessons, user.name, user.avatar));
  const [showLeagueInfo, setShowLeagueInfo] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('xp');

  const currentLeagueData = LEAGUES.find(l => l.id === user.currentLeague) || LEAGUES[0];

  // Derive sorted list
  const sortedRankings = [...rankings].sort((a, b) => {
    if (sortBy === 'xp') return b.xp - a.xp;
    if (sortBy === 'lessons') return b.lessons - a.lessons;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 md:rounded-2xl overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className={`${currentLeagueData.bg} p-6 text-center border-b ${currentLeagueData.border}`}>
         <div className="text-5xl mb-2 drop-shadow-sm">{currentLeagueData.icon}</div>
         <h1 className={`text-2xl font-black uppercase tracking-widest ${currentLeagueData.color}`}>
           {currentLeagueData.id} League
         </h1>
         <p className="text-gray-600 dark:text-gray-300 font-bold text-sm opacity-75">Weekly Tournament</p>
      </div>

      {/* Sort Controls */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between sticky top-0 z-10">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:block">Sort By</span>
          <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setSortBy('xp')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${sortBy === 'xp' ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                 <Trophy size={14} /> Rank
              </button>
              <button 
                onClick={() => setSortBy('lessons')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${sortBy === 'lessons' ? 'bg-brand-green text-white border-brand-green shadow-md' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                 <BookOpen size={14} /> Progress
              </button>
              <button 
                onClick={() => setSortBy('name')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${sortBy === 'name' ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-800 border-gray-800 dark:border-white shadow-md' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                 <ArrowDownAZ size={14} /> Name
              </button>
          </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 bg-white dark:bg-gray-800">
        <div className="max-w-lg mx-auto space-y-2">
           {sortedRankings.map((player, index) => {
             const rank = index + 1;
             let statusColor = "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800";
             let promotionText = null;

             // Only show Promotion/Demotion logic when sorting by XP (Rank) as that's what leagues care about
             if (sortBy === 'xp') {
                 if (currentLeagueData.promoZone > 0 && rank <= currentLeagueData.promoZone) {
                    statusColor = "border-brand-green bg-green-50 dark:bg-green-900/10 dark:border-brand-green/50";
                    promotionText = <span className="text-[10px] font-black text-brand-green uppercase flex items-center"><ChevronUp size={12}/> Promotion</span>;
                 } else if (currentLeagueData.demoteZone > 0 && rank > (sortedRankings.length - currentLeagueData.demoteZone)) {
                    statusColor = "border-brand-red bg-red-50 dark:bg-red-900/10 dark:border-brand-red/50";
                    promotionText = <span className="text-[10px] font-black text-brand-red uppercase flex items-center"><ChevronDown size={12}/> Demotion</span>;
                 }
             }

             // Highlight User
             if (player.isUser) {
               statusColor = "border-brand-blue bg-blue-50 dark:bg-blue-900/20 dark:border-brand-blue border-2 shadow-md transform scale-[1.02] z-10";
             }

             return (
               <div key={player.id} className={`flex items-center p-3 rounded-xl border ${statusColor} transition-all`}>
                  <div className={`w-8 font-black text-lg text-center mr-2 ${player.isUser ? 'text-brand-blue' : 'text-gray-400 dark:text-gray-500'}`}>
                    {rank}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 border border-gray-200 dark:border-gray-600 shadow-sm text-xl overflow-hidden">
                    {player.avatar.startsWith('data:') ? <img src={player.avatar} className="w-full h-full object-cover" alt="avatar" /> : player.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold truncate ${player.isUser ? 'text-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{player.name}</div>
                    {promotionText}
                  </div>
                  <div className="text-right ml-2">
                    {sortBy === 'lessons' ? (
                         <div className="flex flex-col items-end">
                            <span className="font-black text-brand-green text-sm">{player.lessons}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Lessons</span>
                         </div>
                    ) : (
                        <div className="flex flex-col items-end">
                            <span className={`font-black text-sm ${player.isUser ? 'text-brand-blue' : 'text-gray-700 dark:text-gray-200'}`}>{player.xp}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">XP</span>
                        </div>
                    )}
                  </div>
               </div>
             );
           })}
        </div>
      </div>

      {/* Footer / All Leagues Button */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 pb-24 md:pb-4">
         <button 
           onClick={() => setShowLeagueInfo(true)}
           className="w-full py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors"
         >
           <Info size={20} /> View All Leagues & Rules
         </button>
      </div>

      {/* League Info Modal */}
      {showLeagueInfo && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md max-h-[80%] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 rounded-t-3xl">
               <h2 className="text-xl font-black text-gray-800 dark:text-white">League Tiers</h2>
               <button onClick={() => setShowLeagueInfo(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                 <Shield size={24} className="text-gray-400" />
               </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-6 bg-white dark:bg-gray-900">
               {LEAGUES.map((league) => {
                 const isCurrent = league.id === user.currentLeague;
                 return (
                   <div key={league.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${isCurrent ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-800'}`}>
                      <div className="text-4xl">{league.icon}</div>
                      <div className="flex-1">
                        <h3 className={`font-black uppercase tracking-wide ${league.color}`}>{league.id}</h3>
                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                          {league.promoZone > 0 ? (
                             <div className="text-brand-green flex items-center gap-1">
                               <ChevronUp size={12} /> Top {league.promoZone} promote
                             </div>
                          ) : (
                             <div className="text-gray-400">Highest Tier</div>
                          )}
                          {league.demoteZone > 0 ? (
                             <div className="text-brand-red flex items-center gap-1">
                               <ChevronDown size={12} /> Bottom {league.demoteZone} demote
                             </div>
                          ) : (
                             <div className="text-gray-400">No Demotion</div>
                          )}
                        </div>
                      </div>
                      {isCurrent && <div className="text-xs font-black bg-brand-blue text-white px-2 py-1 rounded-md">YOU</div>}
                   </div>
                 )
               })}
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-3xl">
               <button onClick={() => setShowLeagueInfo(false)} className="w-full py-3 bg-brand-green text-white font-bold rounded-xl shadow-[0_4px_0_0_var(--brand-primary-shadow)] active:shadow-none active:translate-y-[4px] transition-all">
                 Got it
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
