
import React, { useState } from 'react';
import { LANGUAGES } from '../constants';
import { LanguageCard } from '../components/LanguageCard';
import { UserProfile } from '../types';
import { Search, ChevronDown, ArrowRight, BookOpen, Globe, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/Button';

interface LanguageSelectionProps {
  user: UserProfile;
  onSelectLanguage: (code: string) => void;
  onUpdateUser?: (user: UserProfile) => void;
  onContinue?: () => void;
}

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ user, onSelectLanguage, onUpdateUser, onContinue }) => {
  const [search, setSearch] = useState('');
  const [isSelectingNative, setIsSelectingNative] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const nativeLanguageCode = user.nativeLanguageCode || 'en-US';
  
  // Find the full object for the native language to display flag/name
  const nativeLangObj = LANGUAGES.find(l => l.code === nativeLanguageCode) || LANGUAGES[0];
  const currentTargetLang = LANGUAGES.find(l => l.code === user.currentLanguageCode);

  // Helper to get translated name
  const getDisplayName = (code: string) => {
      try {
          const name = new Intl.DisplayNames([nativeLanguageCode], { type: 'language' }).of(code);
          // Capitalize first letter
          return name ? name.charAt(0).toUpperCase() + name.slice(1) : code;
      } catch (e) {
          return LANGUAGES.find(l => l.code === code)?.name || code;
      }
  };

  const handleNativeSelect = (code: string) => {
      const updatedUser = { ...user, nativeLanguageCode: code };
      if (onUpdateUser) {
          onUpdateUser(updatedUser);
      }
      setIsSelectingNative(false);
      // Clear search after selection for cleaner experience
      setSearch('');
  };

  const handleRemoveLanguage = (code: string, name: string) => {
      if (!onUpdateUser) return;
      
      if (window.confirm(`Are you sure you want to remove ${name}? All progress (XP, Levels) for this language will be lost.`)) {
          const newProgress = { ...user.progress };
          delete newProgress[code];
          
          let newCurrentCode = user.currentLanguageCode;
          // If we removed the active language, switch to another one or null
          if (user.currentLanguageCode === code) {
              const remainingCodes = Object.keys(newProgress);
              newCurrentCode = remainingCodes.length > 0 ? remainingCodes[0] : null;
          }

          onUpdateUser({
              ...user,
              progress: newProgress,
              currentLanguageCode: newCurrentCode
          });
      }
  };

  // Filter Logic
  const isSearching = search.trim().length > 0;
  const lowerSearch = search.toLowerCase();

  const learnableLanguages = LANGUAGES.filter(l => l.code !== nativeLanguageCode);

  const matchesSearch = (l: typeof LANGUAGES[0]) => {
      if (!isSearching) return true;
      const displayName = getDisplayName(l.code);
      return (displayName && displayName.toLowerCase().includes(lowerSearch)) || (l.name && l.name.toLowerCase().includes(lowerSearch));
  };

  const activeCourseCodes = Object.keys(user.progress);
  
  // Active courses (matching search if active)
  // Sort active courses by lastPlayed (most recent first)
  const myCourses = learnableLanguages
      .filter(l => activeCourseCodes.includes(l.code) && matchesSearch(l))
      .sort((a, b) => {
         const progA = user.progress[a.code];
         const progB = user.progress[b.code];
         const dateA = progA?.lastPlayed ? new Date(progA.lastPlayed).getTime() : 0;
         const dateB = progB?.lastPlayed ? new Date(progB.lastPlayed).getTime() : 0;
         return dateB - dateA;
      });
  
  // Other courses (matching search if active)
  const discoverCourses = learnableLanguages.filter(l => !activeCourseCodes.includes(l.code) && matchesSearch(l));

  // Discover Truncation Logic
  const DISCOVER_LIMIT = 11;
  const shouldTruncate = !isSearching && !showAll && discoverCourses.length > 12;
  
  const displayedDiscoverCourses = shouldTruncate 
      ? discoverCourses.slice(0, DISCOVER_LIMIT) 
      : discoverCourses;


  // Filter for the Native Language Selector (show all)
  const nativeSelectionList = LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isSelectingNative) {
      return (
          <div className="h-full overflow-y-auto p-6 pb-24 bg-white dark:bg-gray-800">
              <header className="mb-8 text-center relative">
                 <button 
                   onClick={() => { setIsSelectingNative(false); setSearch(''); }}
                   className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-blue font-bold text-sm"
                 >
                    Back
                 </button>
                 <h1 className="text-2xl font-extrabold text-gray-700 dark:text-white">I speak...</h1>
                 <p className="text-gray-500 dark:text-gray-400">Select your native language</p>
              </header>

              <div className="max-w-md mx-auto relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-brand-blue outline-none bg-white dark:bg-gray-800 text-gray-700 dark:text-white font-bold"
                    autoFocus
                  />
              </div>

              <div className="grid grid-cols-1 gap-2">
                  {nativeSelectionList.map(lang => (
                      <button
                         key={lang.code}
                         onClick={() => handleNativeSelect(lang.code)}
                         className={`flex items-center p-4 rounded-xl border-2 transition-all text-left gap-4 ${lang.code === nativeLanguageCode ? 'border-brand-green bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      >
                         <span className="text-3xl">{lang.flag}</span>
                         <span className="font-bold text-gray-700 dark:text-white text-lg flex-1">{lang.name}</span>
                         {lang.code === nativeLanguageCode && <div className="w-3 h-3 bg-brand-green rounded-full"></div>}
                      </button>
                  ))}
                  {nativeSelectionList.length === 0 && (
                      <p className="text-center text-gray-400 mt-4">No languages found.</p>
                  )}
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 relative">
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <header className="mb-8 text-center">
          
          {/* Native Language Selector Toggle */}
          <button 
              onClick={() => { setSearch(''); setIsSelectingNative(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm mb-6 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
              <span>I speak:</span>
              <span className="text-xl">{nativeLangObj.flag}</span>
              <span>{nativeLangObj.name}</span>
              <ChevronDown size={16} />
          </button>

          <h1 className="text-2xl font-extrabold text-gray-700 dark:text-white mb-2">I want to learn...</h1>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Search languages...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-brand-blue focus:ring-0 outline-none bg-white dark:bg-gray-800 text-gray-700 dark:text-white font-bold"
            />
          </div>
        </header>

        {/* My Courses Section */}
        {myCourses.length > 0 && (
           <div className="mb-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 mb-4 text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-widest text-xs">
                  <BookOpen size={16} />
                  <span>My Courses</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {myCourses.map(lang => {
                    const displayLang = { ...lang, name: getDisplayName(lang.code) };
                    return (
                      <LanguageCard
                        key={lang.code}
                        language={displayLang}
                        isSelected={user.currentLanguageCode === lang.code}
                        progress={user.progress[lang.code]}
                        onClick={() => onSelectLanguage(lang.code)}
                        onDelete={() => handleRemoveLanguage(lang.code, displayLang.name)}
                      />
                    );
                })}
              </div>
           </div>
        )}

        {/* Discover Section */}
        {discoverCourses.length > 0 && (
           <div className="animate-in fade-in slide-in-from-bottom-4 delay-100">
              {activeCourseCodes.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-widest text-xs border-t border-gray-100 dark:border-gray-700 pt-6">
                      <Globe size={16} />
                      <span>Discover</span>
                  </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {displayedDiscoverCourses.map(lang => {
                    const displayLang = { ...lang, name: getDisplayName(lang.code) };
                    return (
                      <LanguageCard
                        key={lang.code}
                        language={displayLang}
                        isSelected={user.currentLanguageCode === lang.code}
                        onClick={() => onSelectLanguage(lang.code)}
                      />
                    );
                })}

                {shouldTruncate && (
                    <button
                        onClick={() => setShowAll(true)}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-brand-blue dark:hover:border-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-gray-500 dark:text-gray-400 hover:text-brand-blue group h-full min-h-[180px] animate-in fade-in"
                    >
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600 flex items-center justify-center mb-3 transition-colors shadow-sm">
                            <MoreHorizontal size={32} />
                        </div>
                        <span className="font-bold text-sm">View All ({discoverCourses.length - DISCOVER_LIMIT}+)</span>
                    </button>
                )}
              </div>
           </div>
        )}
        
        {myCourses.length === 0 && discoverCourses.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-lg font-bold">No languages found.</p>
            <p>Try searching for something else.</p>
          </div>
        )}
      </div>

      {/* Sticky Footer for Continuation */}
      {currentTargetLang && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mb-20 md:mb-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-4">
           <div className="max-w-md mx-auto">
              <Button 
                fullWidth 
                size="lg" 
                onClick={onContinue}
                className="shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                 <span>Start {currentTargetLang.name}</span>
                 <ArrowRight size={20} />
              </Button>
           </div>
        </div>
      )}
    </div>
  );
};
