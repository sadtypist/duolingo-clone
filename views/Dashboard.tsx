
import React, { useState, useEffect } from 'react';
import { UserProfile, LanguageProgress } from '../types';
import { LANGUAGES, MAX_ENERGY, ENERGY_REGEN_MS } from '../constants';
import { Button } from '../components/Button';
import { Star, Lock, Target, Trophy, Zap, Dumbbell, Download, Loader2, AlertCircle, Heart, Clock } from 'lucide-react';
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
  const [timeUntilRefill, setTimeUntilRefill] = useState<string>('');
  const [showEnergyModal, setShowEnergyModal] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === user.currentLanguageCode);
  const progress = user.currentLanguageCode ? user.progress[user.currentLanguageCode] : null;
  const offlineCount = user.currentLanguageCode ? getOfflineLessonCount(user.currentLanguageCode) : 0;
  const totalXP = (Object.values(user.progress) as LanguageProgress[]).reduce((acc, p) => acc + p.xp, 0);

  // Energy Timer Logic
  useEffect(() => {
    const updateTimer = () => {
        if (user.energy >= MAX_ENERGY) {
            setTimeUntilRefill('FULL');
            return;
        }

        const lastRefill = new Date(user.lastEnergyRefill).getTime();
        const nextRefill = lastRefill + ENERGY_REGEN_MS;
        const now = Date.now();
        const diff = nextRefill - now;

        if (diff <= 0) {
            setTimeUntilRefill('00:00'); // Should trigger a reload ideally via parent or storage check
        } else {
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeUntilRefill(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user.energy, user.lastEnergyRefill]);

  const handleLessonAttempt = () => {
      if (user.energy > 0) {
          onStartLesson();
      } else {
          setShowEnergyModal(true);
      }
  };

  if (!currentLang) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center dark:text-white">
            <h2 className="text-2xl font-extrabold text-gray-700 dark:text-gray-200 mb-4">Pick a language to start!</h2>
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
      xp: totalXP, 
      avatar: user.avatar, 
      isUser: true 
    },
    { name: 'John D.', xp: 890, avatar: '👨' },
  ].sort((a, b) => b.xp - a.xp);

  const pathLength = 10;
  const currentLevel = progress?.lessonsCompleted || 0;
  const hasWeakAreas = progress?.weakAreas && progress.weakAreas.length > 0;

  return (
    <div className="h-full overflow-y-auto pb-24 bg-white dark:bg-gray-800 rounded-none md:rounded-2xl relative transition-colors duration-300">
       {/* Energy Modal */}
       {showEnergyModal && (
           <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl transform scale-100 border-2 border-gray-100 dark:border-gray-700">
                   <Heart className="text-brand-red mx-auto mb-4" size={64} fill="currentColor" />
                   <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white mb-2">Out of Energy</h2>
                   <p className="text-gray-500 dark:text-gray-400 font-semibold mb-6">Wait for your energy to recharge before starting a new lesson.</p>
                   <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 mb-6 flex items-center justify-center gap-2 font-mono text-lg font-bold text-gray-600 dark:text-gray-300">
                       <Clock size={20} /> {timeUntilRefill}
                   </div>
                   <Button fullWidth onClick={() => setShowEnergyModal(false)}>Okay</Button>
               </div>
           </div>
       )}

       {/* Top Bar */}
       <header className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm z-20 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center w-full md:rounded-t-2xl">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-75" onClick={onChangeLanguage}>
             <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
                {currentLang.countryCode ? (
                  <img 
                    src={`https://flagcdn.com/w80/${currentLang.countryCode.toLowerCase()}.png`}
                    alt={currentLang.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg">{currentLang.flag}</span>
                )}
             </div>
             <span className="font-extrabold text-gray-500 dark:text-gray-400 uppercase text-sm tracking-wide">{currentLang.name}</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
             {/* Energy Display */}
             <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" title="Energy">
                <Heart size={20} fill="currentColor" className="text-brand-red" />
                <div className="flex flex-col leading-none">
                    <span className="text-brand-red font-extrabold text-sm">{user.energy}/{MAX_ENERGY}</span>
                    {user.energy < MAX_ENERGY && (
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 w-10">{timeUntilRefill}</span>
                    )}
                </div>
             </div>

             {/* Streak Display */}
             <div className="hidden sm:flex items-center text-brand-yellow font-bold" title="Daily Streak">
                <div className="w-3 h-3 rounded-full bg-brand-red mr-2 animate-pulse"></div>
                {user.streak}
             </div>

             {/* XP Display */}
             <div className="flex items-center text-brand-blue font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800" title="Total XP">
                <Zap size={18} className="mr-1" fill="currentColor" />
                {totalXP}
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
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-brand-blue transition-colors"
                 >
                     {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                     {isDownloading ? 'Downloading...' : `Offline Lessons Available: ${offlineCount}`}
                 </button>
             </div>

             {hasWeakAreas && (
                 <div className="bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-100 dark:border-purple-800 p-5 rounded-2xl w-full max-w-md mb-8 flex flex-col sm:flex-row items-center justify-between shadow-sm gap-4 relative overflow-hidden">
                    <div className="absolute -top-6 -left-6 w-24 h-24 bg-purple-100 dark:bg-purple-800 rounded-full opacity-50 z-0"></div>
                    <div className="relative z-10 w-full">
                       <div className="flex items-center gap-2 mb-2">
                          <div className="bg-purple-100 dark:bg-purple-800 p-1.5 rounded-lg">
                             <Dumbbell className="text-purple-600 dark:text-purple-300" size={18} />
                          </div>
                          <h3 className="text-purple-900 dark:text-purple-100 font-extrabold uppercase tracking-wide text-sm">Weak Areas Detected</h3>
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {progress?.weakAreas.slice(0, 3).map(area => (
                             <span key={area} className="bg-white dark:bg-purple-800 text-purple-700 dark:text-purple-100 px-2 py-1 rounded-lg text-xs font-bold border border-purple-200 dark:border-purple-700 shadow-sm flex items-center gap-1.5">
                                <AlertCircle size={12} className="text-brand-red" />
                                {area}
                             </span>
                          ))}
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
                     onClick={() => isCurrent ? handleLessonAttempt() : null}
                     className={`
                       w-20 h-20 rounded-full flex items-center justify-center border-b-4 text-white text-3xl shadow-lg transition-all
                       ${isCompleted ? 'bg-brand-yellow border-yellow-600' : ''}
                       ${isCurrent ? 'bg-brand-green border-brand-green-dark animate-bounce-short cursor-pointer ring-4 ring-green-100 dark:ring-green-900' : ''}
                       ${isLocked ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-default' : ''}
                     `}
                   >
                      {isCompleted ? <Star fill="white" size={32} /> : 
                       isLocked ? <Lock size={24} className="text-gray-400 dark:text-gray-500" /> : 
                       <Star fill="white" size={32} />}
                   </button>
                   
                   {isCurrent && (
                     <div className="absolute -top-12 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm animate-bounce whitespace-nowrap z-20">
                       START!
                       <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-700 border-b-2 border-r-2 border-gray-200 dark:border-gray-600 rotate-45"></div>
                     </div>
                   )}
                 </div>
               );
            })}
          </div>

          {/* Sidebar Widgets */}
          <div className="lg:col-span-1 space-y-6 order-1 lg:order-2">
             {/* Daily Goals */}
             <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-gray-700 dark:text-gray-200 text-lg">Daily Goals</h3>
                   <Target className="text-brand-blue" />
                </div>
                <div className="space-y-4">
                   {user.dailyGoals.map(goal => (
                      <div key={goal.id}>
                         <div className="flex justify-between text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                            <span>{goal.title}</span>
                            <span>{goal.current}/{goal.target}</span>
                         </div>
                         <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
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
             <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-gray-700 dark:text-gray-200 text-lg">Leaderboard</h3>
                   <Trophy className="text-brand-yellow" />
                </div>
                <div className="space-y-3">
                   {leaderboard.map((p, i) => (
                      <div key={i} className={`flex items-center p-2 rounded-xl ${p.isUser ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''}`}>
                         <div className="font-bold text-gray-400 w-6">{i + 1}</div>
                         <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                           {p.avatar.startsWith('data:') ? <img src={p.avatar} className="w-full h-full rounded-full" /> : p.avatar}
                         </div>
                         <div className="flex-1 font-bold text-gray-700 dark:text-gray-200 text-sm">{p.name}</div>
                         <div className="font-bold text-gray-500 dark:text-gray-400 text-xs">{p.xp} XP</div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};