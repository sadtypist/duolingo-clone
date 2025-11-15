
import React, { useState } from 'react';
import { UserProfile, LanguageProgress } from '../types';
import { LANGUAGES } from '../constants';
import { Button } from '../components/Button';
import { Star, Lock, Target, Trophy, Zap, Dumbbell, Download, Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { generateLesson } from '../services/geminiService';
import { saveOfflineLesson, getOfflineLessonCount } from '../services/storageService';

interface DashboardProps {
  user: UserProfile;
  onStartLesson: () => void;
  onStartPractice: () => void;
  onChangeLanguage: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onStartLesson, onStartPractice, onChangeLanguage }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const currentLang = LANGUAGES.find(l => l.code === user.currentLanguageCode);
  const progress = user.currentLanguageCode ? user.progress[user.currentLanguageCode] : null;
  const offlineCount = user.currentLanguageCode ? getOfflineLessonCount(user.currentLanguageCode) : 0;

  if (!currentLang) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <h2 className="text-2xl font-extrabold text-gray-700 mb-4">Pick a language to start!</h2>
            <Button onClick={onChangeLanguage}>Choose Language</Button>
        </div>
    )
  }

  const handleDownload = async () => {
      if (!navigator.onLine) {
          alert("You must be online to download lessons.");
          return;
      }
      setIsDownloading(true);
      const level = progress?.level || 1;
      try {
          // Download 2 lessons
          for (let i = 0; i < 2; i++) {
              const lesson = await generateLesson(currentLang.name, level, [], false);
              if (lesson) {
                  saveOfflineLesson({ ...lesson, savedAt: new Date().toISOString(), languageCode: currentLang.code });
              }
          }
          // Force re-render or update notification? React state will update on next cycle if we were using it for count, but here we read from storage directly. 
          // In a real app, we'd have a context or state for this.
      } catch (e) {
          console.error(e);
      } finally {
          setIsDownloading(false);
      }
  }

  // Mock Leaderboard Data
  const leaderboard = [
    { name: 'Maria S.', xp: 1250, avatar: '👩‍🦱' },
    { 
      name: user.name, 
      xp: (Object.values(user.progress) as LanguageProgress[]).reduce((acc, p) => acc + p.xp, 0), 
      avatar: user.avatar, 
      isUser: true 
    },
    { name: 'John D.', xp: 890, avatar: '👨' },
  ].sort((a, b) => b.xp - a.xp);

  const pathLength = 10;
  const currentLevel = progress?.lessonsCompleted || 0;
  const hasWeakAreas = progress?.weakAreas && progress.weakAreas.length > 0;

  return (
    <div className="h-full overflow-y-auto pb-24 bg-white rounded-none md:rounded-2xl">
       {/* Top Bar */}
       <header className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 border-b border-gray-200 p-4 flex justify-between items-center w-full md:rounded-t-2xl">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-75" onClick={onChangeLanguage}>
             <span className="text-2xl">{currentLang.flag}</span>
             <span className="font-extrabold text-gray-500 uppercase text-sm tracking-wide">{currentLang.name}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center text-brand-yellow font-bold" title="Daily Streak">
                <div className="w-3 h-3 rounded-full bg-brand-red mr-2 animate-pulse"></div>
                {user.streak}
             </div>
             <div className="flex items-center text-brand-blue font-bold" title="Total XP">
                <Zap size={16} className="mr-1" fill="currentColor" />
                {Object.values(user.progress).reduce((acc: number, p: LanguageProgress) => acc + p.xp, 0)}
             </div>
          </div>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl mx-auto p-6">
          
          {/* Main Learning Path */}
          <div className="lg:col-span-2 flex flex-col items-center space-y-6 py-4 order-2 lg:order-1">
             
             {/* Offline Widget */}
             <div className="w-full max-w-md flex justify-end mb-2">
                 <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-brand-blue transition-colors"
                 >
                     {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                     {isDownloading ? 'Downloading...' : `Offline Lessons Available: ${offlineCount}`}
                 </button>
             </div>

             {hasWeakAreas && (
                 <div className="bg-purple-50 border-2 border-purple-100 p-5 rounded-2xl w-full max-w-md mb-8 flex flex-col sm:flex-row items-center justify-between shadow-sm gap-4 relative overflow-hidden">
                    {/* Decorative Background Element */}
                    <div className="absolute -top-6 -left-6 w-24 h-24 bg-purple-100 rounded-full opacity-50 z-0"></div>
                    
                    <div className="relative z-10 w-full">
                       <div className="flex items-center gap-2 mb-2">
                          <div className="bg-purple-100 p-1.5 rounded-lg">
                             <Dumbbell className="text-purple-600" size={18} />
                          </div>
                          <h3 className="text-purple-900 font-extrabold uppercase tracking-wide text-sm">Weak Areas Detected</h3>
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {progress?.weakAreas.slice(0, 3).map(area => (
                             <span key={area} className="bg-white text-purple-700 px-2 py-1 rounded-lg text-xs font-bold border border-purple-200 shadow-sm flex items-center gap-1.5">
                                <AlertCircle size={12} className="text-brand-red" />
                                {area}
                             </span>
                          ))}
                          {(progress?.weakAreas.length || 0) > 3 && (
                             <span className="text-xs font-bold text-purple-400 flex items-center px-1">+{((progress?.weakAreas.length || 0) - 3)} more</span>
                          )}
                       </div>
                    </div>
                    
                    <div className="relative z-10 flex-shrink-0 w-full sm:w-auto">
                        <Button variant="practice" size="sm" onClick={onStartPractice} fullWidth className="sm:w-auto shadow-md border-2 border-purple-600/10">
                           Practice Now
                        </Button>
                    </div>
                 </div>
             )}

             {Array.from({ length: pathLength }).map((_, index) => {
               const isCompleted = index < currentLevel;
               const isCurrent = index === currentLevel;
               const isLocked = index > currentLevel;
               const xOffset = Math.sin(index) * 40; 

               return (
                 <div 
                   key={index}
                   className="relative flex justify-center transition-transform hover:scale-105"
                   style={{ transform: `translateX(${xOffset}px)` }}
                 >
                   <button
                     disabled={isLocked}
                     onClick={() => isCurrent ? onStartLesson() : null}
                     className={`
                       w-20 h-20 rounded-full flex items-center justify-center border-b-4 text-white text-3xl shadow-lg transition-all
                       ${isCompleted ? 'bg-brand-yellow border-yellow-600' : ''}
                       ${isCurrent ? 'bg-brand-green border-brand-green-dark animate-bounce-short cursor-pointer ring-4 ring-green-100' : ''}
                       ${isLocked ? 'bg-gray-200 border-gray-300 cursor-default' : ''}
                     `}
                   >
                      {isCompleted ? <Star fill="white" size={32} /> : 
                       isLocked ? <Lock size={24} className="text-gray-400" /> : 
                       <Star fill="white" size={32} />}
                   </button>
                   
                   {isCurrent && (
                     <div className="absolute -top-12 bg-white text-gray-700 font-bold py-2 px-4 rounded-xl border-2 border-gray-200 shadow-sm animate-bounce whitespace-nowrap z-20">
                       START!
                       <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-gray-200 rotate-45"></div>
                     </div>
                   )}
                 </div>
               );
            })}
          </div>

          {/* Sidebar Widgets */}
          <div className="lg:col-span-1 space-y-6 order-1 lg:order-2">
             {/* Daily Goals */}
             <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-gray-700 text-lg">Daily Goals</h3>
                   <Target className="text-brand-blue" />
                </div>
                <div className="space-y-4">
                   {user.dailyGoals.map(goal => (
                      <div key={goal.id}>
                         <div className="flex justify-between text-sm font-bold text-gray-600 mb-1">
                            <span>{goal.title}</span>
                            <span>{goal.current}/{goal.target}</span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                               className={`h-3 rounded-full transition-all ${goal.completed ? 'bg-brand-yellow' : 'bg-brand-blue'}`}
                               style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                            ></div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Leaderboard Teaser */}
             <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-gray-700 text-lg">Leaderboard</h3>
                   <Trophy className="text-brand-yellow" />
                </div>
                <div className="space-y-3">
                   {leaderboard.map((p, i) => (
                      <div key={i} className={`flex items-center p-2 rounded-xl ${p.isUser ? 'bg-blue-50 border border-blue-200' : ''}`}>
                         <div className="font-bold text-gray-400 w-6">{i + 1}</div>
                         <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                           {p.avatar.startsWith('data:') ? <img src={p.avatar} className="w-full h-full rounded-full" /> : p.avatar}
                         </div>
                         <div className="flex-1 font-bold text-gray-700 text-sm">{p.name}</div>
                         <div className="font-bold text-gray-500 text-xs">{p.xp} XP</div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
