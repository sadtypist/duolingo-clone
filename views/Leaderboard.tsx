
import React, { useState } from 'react';
import { UserProfile, LanguageProgress } from '../types';
import { LEAGUES } from '../constants';
import { ChevronUp, ChevronDown, Info, Shield } from 'lucide-react';

interface LeaderboardProps {
  user: UserProfile;
}

// Mock Data Generator for Leaderboard
const generateMockLeaderboard = (userLeague: string, userXp: number, userName: string, userAvatar: string) => {
  const count = 20;
  const data = [];
  const names = ["Alex", "Sam", "Jordan", "Taylor", "Casey", "Riley", "Morgan", "Jamie", "Quinn", "Avery", "Dakota", "Reese", "Sky", "Parker", "Sage"];
  const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐵"];

  // Add random users
  for (let i = 0; i < count - 1; i++) {
    data.push({
      id: `mock_${i}`,
      name: names[i % names.length] + " " + String.fromCharCode(65 + i),
      xp: Math.floor(Math.random() * 1000) + 50, // Random XP
      avatar: emojis[i % emojis.length],
      isUser: false,
    });
  }

  // Add Current User
  data.push({
    id: 'user_me',
    name: userName,
    xp: userXp, // Use roughly total XP for this week context
    avatar: userAvatar,
    isUser: true
  });

  // Sort
  return data.sort((a, b) => b.xp - a.xp);
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ user }) => {
  // Calculate roughly 'Weekly XP' for display context. In reality, this would be a field on the backend.
  // For now, we use total XP of current language or sum of all. Let's use sum of all.
  const totalXP = (Object.values(user.progress) as LanguageProgress[]).reduce((acc, p) => acc + p.xp, 0);
  
  const [rankings] = useState(() => generateMockLeaderboard(user.currentLeague, totalXP, user.name, user.avatar));
  const [showLeagueInfo, setShowLeagueInfo] = useState(false);

  const currentLeagueData = LEAGUES.find(l => l.id === user.currentLeague) || LEAGUES[0];

  return (
    <div className="h-full flex flex-col bg-white md:rounded-2xl overflow-hidden">
      {/* Header */}
      <div className={`${currentLeagueData.bg} p-6 text-center border-b ${currentLeagueData.border}`}>
         <div className="text-5xl mb-2">{currentLeagueData.icon}</div>
         <h1 className={`text-2xl font-black uppercase tracking-widest ${currentLeagueData.color}`}>
           {currentLeagueData.id} League
         </h1>
         <p className="text-gray-600 font-bold text-sm opacity-75">Weekly Tournament</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-2">
           {rankings.map((player, index) => {
             const rank = index + 1;
             let statusColor = "border-gray-200";
             let promotionText = null;

             // Promotion / Demotion Logic
             if (currentLeagueData.promoZone > 0 && rank <= currentLeagueData.promoZone) {
                statusColor = "border-brand-green bg-green-50";
                promotionText = <span className="text-[10px] font-black text-brand-green uppercase flex items-center"><ChevronUp size={12}/> Promotion</span>;
             } else if (currentLeagueData.demoteZone > 0 && rank > (rankings.length - currentLeagueData.demoteZone)) {
                statusColor = "border-brand-red bg-red-50";
                promotionText = <span className="text-[10px] font-black text-brand-red uppercase flex items-center"><ChevronDown size={12}/> Demotion</span>;
             }

             // Highlight User
             if (player.isUser) {
               statusColor = "border-brand-blue bg-blue-50 border-2 shadow-md transform scale-[1.02]";
             }

             return (
               <div key={player.id} className={`flex items-center p-3 rounded-xl border ${statusColor} transition-all`}>
                  <div className={`w-8 font-black text-lg text-center mr-2 ${player.isUser ? 'text-brand-blue' : 'text-gray-400'}`}>
                    {rank}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 border border-gray-200 shadow-sm text-xl">
                    {player.avatar.startsWith('data:') ? <img src={player.avatar} className="w-full h-full rounded-full object-cover" /> : player.avatar}
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold ${player.isUser ? 'text-gray-800' : 'text-gray-600'}`}>{player.name}</div>
                    {promotionText}
                  </div>
                  <div className="font-black text-gray-700 text-sm">{player.xp} XP</div>
               </div>
             );
           })}
        </div>
      </div>

      {/* Footer / All Leagues Button */}
      <div className="p-4 border-t border-gray-100 bg-white pb-24 md:pb-4">
         <button 
           onClick={() => setShowLeagueInfo(true)}
           className="w-full py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2"
         >
           <Info size={20} /> View All Leagues & Rules
         </button>
      </div>

      {/* League Info Modal */}
      {showLeagueInfo && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[80%] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h2 className="text-xl font-black text-gray-800">League Tiers</h2>
               <button onClick={() => setShowLeagueInfo(false)} className="p-2 hover:bg-gray-100 rounded-full">
                 <Shield size={24} className="text-gray-400" />
               </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-6">
               {LEAGUES.map((league) => {
                 const isCurrent = league.id === user.currentLeague;
                 return (
                   <div key={league.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${isCurrent ? 'border-brand-blue bg-blue-50' : 'border-gray-100'}`}>
                      <div className="text-4xl">{league.icon}</div>
                      <div className="flex-1">
                        <h3 className={`font-black uppercase tracking-wide ${league.color}`}>{league.id}</h3>
                        <div className="text-xs font-bold text-gray-500 mt-1 space-y-1">
                          {league.promoZone > 0 ? (
                             <div className="text-green-600 flex items-center gap-1">
                               <ChevronUp size={12} /> Top {league.promoZone} promote
                             </div>
                          ) : (
                             <div className="text-gray-400">Highest Tier</div>
                          )}
                          {league.demoteZone > 0 ? (
                             <div className="text-red-500 flex items-center gap-1">
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
            <div className="p-4 border-t border-gray-100">
               <button onClick={() => setShowLeagueInfo(false)} className="w-full py-3 bg-brand-green text-white font-bold rounded-xl shadow-[0_4px_0_0_#46a302] active:shadow-none active:translate-y-[4px]">
                 Got it
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
