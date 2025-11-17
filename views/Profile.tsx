

import React, { useRef, useState, useEffect } from 'react';
import { UserProfile, LanguageProgress } from '../types';
import { LANGUAGES, ACHIEVEMENTS } from '../constants';
import { Button } from '../components/Button';
import { Camera, Flame, Zap, Trophy, Edit2, BarChart2, UserPlus, Calendar, AlertCircle, LogOut, Sparkles, X, Wand2, Loader2 } from 'lucide-react';
import { saveProfile } from '../services/storageService';
import { generateMascotImage } from '../services/geminiService';

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onLogout }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  
  // AI Generation States
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('A friendly, stylized cartoon fox mascot for a language learning app. The fox should have a clever and encouraging expression. The design must be clean and vector-like, similar to modern manga character art. The fox\'s primary accent colors should be bright blue and light purple. It is wearing a small, simple blue satchel with a glowing purple compass emblem on it.');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync tempName if user prop changes externally
  useEffect(() => {
    setTempName(user.name);
  }, [user.name]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = { ...user, avatar: reader.result as string };
        onUpdateUser(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    if (tempName.trim() === '') {
        setTempName(user.name);
        setIsEditing(false);
        return;
    }
    if (tempName !== user.name) {
        const updated = { ...user, name: tempName };
        onUpdateUser(updated);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleSaveName();
      } else if (e.key === 'Escape') {
          setTempName(user.name);
          setIsEditing(false);
      }
  };

  const handleGenerateImage = async () => {
      if (!aiPrompt.trim()) return;
      setIsGenerating(true);
      setGeneratedImage(null);
      const image = await generateMascotImage(aiPrompt);
      if (image) {
          setGeneratedImage(image);
      }
      setIsGenerating(false);
  };

  const handleUseGeneratedImage = () => {
      if (generatedImage) {
          onUpdateUser({ ...user, avatar: generatedImage });
          setShowAiModal(false);
      }
  };

  // Calculated stats
  const progressValues = Object.values(user.progress) as LanguageProgress[];
  const totalXP = progressValues.reduce((acc, curr) => acc + curr.xp, 0);
  const totalLessons = progressValues.reduce((acc, curr) => acc + curr.lessonsCompleted, 0);
  const activeLanguages = Object.keys(user.progress).length;
  
  // Language Score Calculation (Mock formula)
  const languageScore = Math.floor((totalXP * 0.5) + (totalLessons * 10) + (activeLanguages * 50));

  // Format Date Helper
  const formatDate = (dateStr?: string) => {
      if (!dateStr) return 'Never';
      return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-800 transition-colors duration-300">
      
      {/* AI Generation Modal */}
      {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl border-2 border-brand-blue/20 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <h3 className="font-black text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                          <Sparkles className="text-brand-blue" size={20} /> Design Mascot
                      </h3>
                      <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-6 flex flex-col gap-4">
                      <div className="relative aspect-square w-full bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                          {isGenerating ? (
                              <div className="flex flex-col items-center text-brand-blue animate-pulse">
                                  <Loader2 size={48} className="animate-spin mb-2" />
                                  <span className="font-bold text-xs uppercase tracking-widest">Creating Magic...</span>
                              </div>
                          ) : generatedImage ? (
                              <img src={generatedImage} alt="Generated Mascot" className="w-full h-full object-cover" />
                          ) : (
                              <div className="text-center text-gray-400 p-6">
                                  <Wand2 size={48} className="mx-auto mb-2 opacity-50" />
                                  <p className="text-sm font-bold">Describe your mascot below and tap Generate</p>
                              </div>
                          )}
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Prompt</label>
                          <textarea 
                              className="w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium focus:border-brand-blue outline-none resize-none h-28 dark:text-white"
                              value={aiPrompt}
                              onChange={(e) => setAiPrompt(e.target.value)}
                              placeholder="E.g., A cool robot learning spanish..."
                          />
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                          <Button 
                              fullWidth 
                              variant="secondary" 
                              onClick={handleGenerateImage}
                              disabled={isGenerating}
                          >
                              {isGenerating ? 'Generating...' : 'Generate'}
                          </Button>
                          {generatedImage && (
                              <Button 
                                  fullWidth 
                                  variant="success" 
                                  onClick={handleUseGeneratedImage}
                              >
                                  Use Avatar
                              </Button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="p-6 pb-24 max-w-2xl mx-auto relative">
        
        {/* Guest Banner */}
        {user.isGuest && (
          <div className="bg-brand-blue/10 border-2 border-brand-blue rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left dark:bg-brand-blue/20">
             <div className="bg-brand-blue text-white p-3 rounded-full">
                <UserPlus size={24} />
             </div>
             <div className="flex-1">
                <h3 className="font-black text-gray-800 dark:text-white text-lg">Create your profile</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Save your progress and keep learning forever.</p>
             </div>
             <Button 
               onClick={onLogout} 
               size="sm"
               className="uppercase tracking-widest shadow-none border-2 border-brand-blue/20"
             >
               Sign Up Now
             </Button>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="relative group">
            <div 
              className="w-32 h-32 rounded-full border-4 border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:opacity-90 transition"
              onClick={handleAvatarClick}
            >
              {user.avatar.startsWith('data:') ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl bg-emerald-50 dark:bg-gray-700">
                  {user.avatar}
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="absolute bottom-0 right-0 flex flex-col gap-2">
               <button 
                 onClick={() => setShowAiModal(true)}
                 className="bg-purple-500 text-white p-2 rounded-full border-4 border-white dark:border-gray-800 shadow-sm hover:bg-purple-600 z-10"
                 title="Generate with AI"
               >
                 <Sparkles size={14} />
               </button>
               <button 
                 onClick={handleAvatarClick}
                 className="bg-brand-blue text-white p-2 rounded-full border-4 border-white dark:border-gray-800 shadow-sm hover:bg-brand-blue/90"
                 title="Upload Image"
               >
                 <Camera size={14} />
               </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>

          <div className="flex-1 text-center sm:text-left w-full">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 h-10">
              {isEditing ? (
                 <input 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={handleKeyDown}
                    className="border-2 border-brand-blue rounded-xl px-3 py-1 font-extrabold text-xl text-gray-800 w-full max-w-[300px] outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white dark:bg-gray-700 dark:text-white"
                    autoFocus
                    placeholder="Your Name"
                 />
              ) : (
                <div 
                  onClick={() => setIsEditing(true)}
                  className="group flex items-center gap-3 cursor-pointer py-1 px-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors max-w-full"
                  title="Click to edit name"
                >
                  <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white truncate max-w-[200px] sm:max-w-none">
                    {user.name || (user.isGuest ? 'Guest User' : 'Your Name')}
                  </h1>
                  <Edit2 size={18} className="text-gray-300 group-hover:text-brand-blue transition-colors flex-shrink-0" />
                </div>
              )}
            </div>
            
            {user.username && (
                <p className="text-gray-400 font-bold text-sm mb-1">@{user.username}</p>
            )}

            <p className="text-gray-500 dark:text-gray-400 font-semibold">Joined {new Date(user.joinDate).toLocaleDateString()}</p>
            
            <div className="flex gap-6 mt-6 justify-center sm:justify-start">
               <div className="flex flex-col items-center sm:items-start">
                   <div className="text-xs font-bold text-gray-400 uppercase">Streak</div>
                   <div className="flex items-center gap-1 text-brand-yellow font-black text-2xl">
                      <Flame size={24} fill="currentColor" /> {user.streak}
                   </div>
               </div>
               <div className="w-px bg-gray-200 dark:bg-gray-700 h-10"></div>
               <div className="flex flex-col items-center sm:items-start">
                   <div className="text-xs font-bold text-gray-400 uppercase">Total XP</div>
                   <div className="flex items-center gap-1 text-brand-blue font-black text-2xl">
                      <Zap size={24} fill="currentColor" /> {totalXP}
                   </div>
               </div>
            </div>
          </div>
        </div>

        {/* Streak Section */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-6 flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-gray-400 font-extrabold text-xs uppercase tracking-widest mb-2">Daily Streak</h2>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${user.streak > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                        <Flame size={32} fill={user.streak > 0 ? "currentColor" : "none"} className={user.streak > 0 ? "animate-pulse" : ""} />
                    </div>
                    <div>
                         <div className="text-4xl font-black text-gray-800 dark:text-white leading-none">{user.streak}</div>
                         <div className="text-xs font-bold text-gray-400">days in a row</div>
                    </div>
                </div>
            </div>
            <div className="relative z-10 text-right max-w-[180px] hidden sm:block">
                 <p className="text-sm font-bold text-gray-600 dark:text-gray-300 leading-snug">
                    {user.streak > 0 
                        ? "You're on fire! Don't stop now!" 
                        : "Complete a lesson to start your streak!"}
                 </p>
            </div>
             <Flame size={160} className={`absolute -bottom-10 -right-10 z-0 transform rotate-12 opacity-10 ${user.streak > 0 ? 'text-orange-500' : 'text-gray-400 dark:text-gray-600'}`} />
        </div>

        {/* Global Stats */}
        <div className="bg-brand-blue/10 dark:bg-brand-blue/20 border-2 border-brand-blue/20 rounded-2xl p-6 mb-8 flex items-center justify-between">
           <div>
              <h2 className="text-brand-blue-dark dark:text-emerald-300 font-extrabold uppercase tracking-widest text-xs mb-1">Language Score</h2>
              <div className="text-4xl font-black text-brand-blue dark:text-emerald-400">{languageScore}</div>
           </div>
           <BarChart2 size={48} className="text-brand-blue opacity-50" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-4 bg-white dark:bg-gray-800">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl text-yellow-600 dark:text-yellow-400">
              <Trophy size={24} />
            </div>
            <div>
              <div className="font-extrabold text-xl text-gray-800 dark:text-white">{activeLanguages}</div>
              <div className="text-xs font-bold text-gray-400 uppercase">Languages</div>
            </div>
          </div>
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-4 bg-white dark:bg-gray-800">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl text-brand-green">
              <CheckCircleIcon />
            </div>
            <div>
              <div className="font-extrabold text-xl text-gray-800 dark:text-white">{totalLessons}</div>
              <div className="text-xs font-bold text-gray-400 uppercase">Lessons</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <h2 className="text-xl font-extrabold text-gray-700 dark:text-gray-200 mb-4">Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {ACHIEVEMENTS.map(ach => {
            const unlocked = user.achievements.includes(ach.id);
            return (
              <div key={ach.id} className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all ${unlocked ? 'bg-yellow-50 dark:bg-yellow-900/20 border-brand-yellow shadow-[0_4px_0_0_#ca8a04]' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-50 grayscale'}`}>
                 <div className="text-4xl mb-3 bg-white dark:bg-gray-800 rounded-full p-2 shadow-sm w-16 h-16 flex items-center justify-center">{ach.icon}</div>
                 <div className="font-extrabold text-sm text-gray-800 dark:text-gray-100 leading-tight mb-1">{ach.title}</div>
                 <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-tight px-2">{ach.description}</div>
              </div>
            )
          })}
        </div>

        {/* Language Progress List */}
        <h2 className="text-xl font-extrabold text-gray-700 dark:text-gray-200 mb-4">My Languages</h2>
        <div className="space-y-3">
          {(Object.values(user.progress) as LanguageProgress[]).sort((a, b) => {
              // Sort by lastPlayed if available, else XP
              if (a.lastPlayed && b.lastPlayed) return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
              return b.xp - a.xp;
          }).map((prog) => {
            const lang = LANGUAGES.find(l => l.code === prog.languageCode);
            if (!lang) return null;
            
            const xpForCurrentLevel = prog.xp % 100;
            const hasWeakness = prog.weakAreas && prog.weakAreas.length > 0;

            return (
              <div key={prog.languageCode} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 relative overflow-hidden transition-all hover:border-gray-300 dark:hover:border-gray-600">
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                        {lang.countryCode ? (
                          <img 
                            src={`https://flagcdn.com/w80/${lang.countryCode.toLowerCase()}.png`}
                            alt={lang.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          lang.flag
                        )}
                     </div>
                     <div>
                       <div className="font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                          {lang.name}
                          {hasWeakness && (
                              <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1 rounded-full" title="Weak areas detected">
                                  <AlertCircle size={12} strokeWidth={3} />
                              </div>
                          )}
                       </div>
                       <div className="text-xs text-gray-400 font-bold flex items-center gap-1">
                          <Calendar size={10} />
                          {prog.lastPlayed ? `Last played ${formatDate(prog.lastPlayed)}` : 'Not played yet'}
                       </div>
                     </div>
                   </div>
                   
                   <div className="text-right">
                      <div className="text-xs font-black text-gray-400 uppercase tracking-wider">Level</div>
                      <div className="text-xl font-black text-brand-blue leading-none">{prog.level}</div>
                   </div>
                 </div>
                 
                 {/* Progress Bar Row */}
                 <div className="mb-1">
                     <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wide">
                        <span>Progress to Lvl {prog.level + 1}</span>
                        <span>{xpForCurrentLevel} / 100 XP</span>
                     </div>
                     <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-brand-green h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(xpForCurrentLevel / 100) * 100}%` }}
                        ></div>
                     </div>
                 </div>

                 {/* Weak Areas Footer (Subtle) */}
                 {hasWeakness && (
                   <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider">Review Needed:</span>
                      <div className="flex gap-1 flex-wrap">
                         {prog.weakAreas.map((area, i) => (
                             <span key={i} className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded font-semibold">
                                {area}
                             </span>
                         ))}
                      </div>
                   </div>
                 )}
              </div>
            )
          })}
          {Object.keys(user.progress).length === 0 && (
              <div className="text-center text-gray-400 py-8 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                  You haven't started learning yet!
              </div>
          )}
        </div>

        {/* Account Management Section */}
        <div className="mt-12 border-t-2 border-gray-100 dark:border-gray-700 pt-8">
            <h2 className="text-xl font-extrabold text-gray-700 dark:text-gray-200 mb-4">Account</h2>
            <Button 
                onClick={onLogout} 
                variant="outline"
                fullWidth
                size="lg"
                className="text-brand-red dark:text-red-400 border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 shadow-sm active:shadow-none h-14"
            >
                <span className="flex items-center gap-3 uppercase tracking-widest font-black">
                    <LogOut size={20} strokeWidth={3} />
                    Log Out
                </span>
            </Button>
        </div>

      </div>
    </div>
  );
};

function CheckCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    )
}