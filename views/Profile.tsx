
import React, { useRef, useState, useEffect } from 'react';
import { UserProfile, LanguageProgress } from '../types';
import { LANGUAGES, ACHIEVEMENTS } from '../constants';
import { Button } from '../components/Button';
import { Camera, Flame, Zap, Trophy, Edit2, BarChart2, UserPlus } from 'lucide-react';
import { saveProfile } from '../services/storageService';

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onLogout }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);

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

  // Calculated stats
  const progressValues = Object.values(user.progress) as LanguageProgress[];
  const totalXP = progressValues.reduce((acc, curr) => acc + curr.xp, 0);
  const totalLessons = progressValues.reduce((acc, curr) => acc + curr.lessonsCompleted, 0);
  const activeLanguages = Object.keys(user.progress).length;
  
  // Language Score Calculation (Mock formula)
  const languageScore = Math.floor((totalXP * 0.5) + (totalLessons * 10) + (activeLanguages * 50));

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-6 pb-24 max-w-2xl mx-auto relative">
        <button 
          onClick={onLogout} 
          className="absolute top-6 right-6 text-gray-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest z-10"
        >
          Log Out
        </button>

        {/* Guest Banner */}
        {user.isGuest && (
          <div className="bg-brand-blue/10 border-2 border-brand-blue rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
             <div className="bg-brand-blue text-white p-3 rounded-full">
                <UserPlus size={24} />
             </div>
             <div className="flex-1">
                <h3 className="font-black text-gray-800 text-lg">Create your profile</h3>
                <p className="text-gray-600 text-sm font-medium">Save your progress and keep learning forever.</p>
             </div>
             <Button 
               onClick={onLogout} // Actually triggers logout to landing, where they can signup. Since we have migration, this works.
               size="sm"
               className="uppercase tracking-widest shadow-none border-2 border-brand-blue/20"
             >
               Sign Up Now
             </Button>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div 
              className="w-32 h-32 rounded-full border-4 border-gray-100 overflow-hidden cursor-pointer hover:opacity-90 transition"
              onClick={handleAvatarClick}
            >
              {user.avatar.startsWith('data:') ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl bg-blue-50">
                  {user.avatar}
                </div>
              )}
            </div>
            <button 
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 bg-brand-blue text-white p-2 rounded-full border-4 border-white shadow-sm hover:bg-brand-blue/90"
            >
              <Camera size={16} />
            </button>
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
                    className="border-2 border-brand-blue rounded-xl px-3 py-1 font-extrabold text-xl text-gray-800 w-full max-w-[300px] outline-none focus:ring-2 focus:ring-brand-blue/20"
                    autoFocus
                    placeholder="Your Name"
                 />
              ) : (
                <div 
                  onClick={() => setIsEditing(true)}
                  className="group flex items-center gap-3 cursor-pointer py-1 px-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors max-w-full"
                  title="Click to edit name"
                >
                  <h1 className="text-2xl font-extrabold text-gray-800 truncate max-w-[200px] sm:max-w-none">
                    {user.name || (user.isGuest ? 'Guest User' : 'Your Name')}
                  </h1>
                  <Edit2 size={18} className="text-gray-300 group-hover:text-brand-blue transition-colors flex-shrink-0" />
                </div>
              )}
            </div>
            
            {user.username && (
                <p className="text-gray-400 font-bold text-sm mb-1">@{user.username}</p>
            )}

            <p className="text-gray-500 font-semibold">Joined {new Date(user.joinDate).toLocaleDateString()}</p>
            
            <div className="flex gap-6 mt-6 justify-center sm:justify-start">
               <div className="flex flex-col items-center sm:items-start">
                   <div className="text-xs font-bold text-gray-400 uppercase">Streak</div>
                   <div className="flex items-center gap-1 text-brand-yellow font-black text-2xl">
                      <Flame size={24} fill="currentColor" /> {user.streak}
                   </div>
               </div>
               <div className="w-px bg-gray-200 h-10"></div>
               <div className="flex flex-col items-center sm:items-start">
                   <div className="text-xs font-bold text-gray-400 uppercase">Total XP</div>
                   <div className="flex items-center gap-1 text-brand-blue font-black text-2xl">
                      <Zap size={24} fill="currentColor" /> {totalXP}
                   </div>
               </div>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="bg-brand-blue/10 border-2 border-brand-blue/20 rounded-2xl p-6 mb-8 flex items-center justify-between">
           <div>
              <h2 className="text-brand-blue-dark font-extrabold uppercase tracking-widest text-xs mb-1">Language Score</h2>
              <div className="text-4xl font-black text-brand-blue">{languageScore}</div>
           </div>
           <BarChart2 size={48} className="text-brand-blue opacity-50" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-xl text-yellow-600">
              <Trophy size={24} />
            </div>
            <div>
              <div className="font-extrabold text-xl">{activeLanguages}</div>
              <div className="text-xs font-bold text-gray-400 uppercase">Languages</div>
            </div>
          </div>
          <div className="border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl text-brand-green">
              <CheckCircleIcon />
            </div>
            <div>
              <div className="font-extrabold text-xl">{totalLessons}</div>
              <div className="text-xs font-bold text-gray-400 uppercase">Lessons</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <h2 className="text-xl font-extrabold text-gray-700 mb-4">Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {ACHIEVEMENTS.map(ach => {
            const unlocked = user.achievements.includes(ach.id);
            return (
              <div key={ach.id} className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all ${unlocked ? 'bg-yellow-50 border-brand-yellow shadow-[0_4px_0_0_#ca8a04]' : 'bg-gray-50 border-gray-200 opacity-50 grayscale'}`}>
                 <div className="text-4xl mb-3 bg-white rounded-full p-2 shadow-sm w-16 h-16 flex items-center justify-center">{ach.icon}</div>
                 <div className="font-extrabold text-sm text-gray-800 leading-tight mb-1">{ach.title}</div>
                 <div className="text-xs text-gray-500 font-semibold leading-tight px-2">{ach.description}</div>
              </div>
            )
          })}
        </div>

        {/* Language Progress List */}
        <h2 className="text-xl font-extrabold text-gray-700 mb-4">My Languages</h2>
        <div className="space-y-3">
          {Object.values(user.progress).sort((a: LanguageProgress, b: LanguageProgress) => b.xp - a.xp).map((prog: LanguageProgress) => {
            const lang = LANGUAGES.find(l => l.code === prog.languageCode);
            if (!lang) return null;
            return (
              <div key={prog.languageCode} className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-2xl relative">
                        {lang.countryCode ? (
                          <img 
                            src={`https://flagcdn.com/w160/${lang.countryCode.toLowerCase()}.png`}
                            alt={lang.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          lang.flag
                        )}
                     </div>
                     <div>
                       <div className="font-bold text-gray-700">{lang.name}</div>
                       <div className="text-xs text-gray-400 font-bold">Lvl {prog.level} • {prog.xp} XP</div>
                     </div>
                   </div>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-brand-green h-2.5 rounded-full" 
                      style={{ width: `${Math.min((prog.xp % 100), 100)}%` }}
                    ></div>
                 </div>
                 {prog.weakAreas && prog.weakAreas.length > 0 && (
                   <div className="flex gap-2 flex-wrap">
                      {prog.weakAreas.map(area => (
                        <span key={area} className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-md font-bold uppercase">
                          Needs work: {area}
                        </span>
                      ))}
                   </div>
                 )}
              </div>
            )
          })}
          {Object.keys(user.progress).length === 0 && (
              <div className="text-center text-gray-400 py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  You haven't started learning yet!
              </div>
          )}
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