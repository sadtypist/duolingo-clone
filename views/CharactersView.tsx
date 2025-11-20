
import React, { useState } from 'react';
import { UserProfile, CharacterGroup } from '../types';
import { CHARACTER_DATA, LANGUAGES } from '../constants';
import { Button } from '../components/Button';
import { Volume2, BookOpen, CheckCircle, CheckSquare, Square, Play } from 'lucide-react';

interface CharactersViewProps {
  user: UserProfile;
  onStartLesson: (characters: string[]) => void;
}

export const CharactersView: React.FC<CharactersViewProps> = ({ user, onStartLesson }) => {
  const currentLangCode = user.currentLanguageCode;
  const currentLang = LANGUAGES.find(l => l.code === currentLangCode);
  const charGroups: CharacterGroup[] = (currentLangCode && CHARACTER_DATA[currentLangCode]) || [];
  
  const [selectedChars, setSelectedChars] = useState<string[]>([]);

  const playSound = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLangCode || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const toggleChar = (symbol: string) => {
    setSelectedChars(prev => 
      prev.includes(symbol) 
        ? prev.filter(c => c !== symbol)
        : [...prev, symbol]
    );
  };

  const toggleGroup = (group: CharacterGroup) => {
    const groupSymbols = group.characters.map(c => c.symbol);
    const allSelected = groupSymbols.every(s => selectedChars.includes(s));

    if (allSelected) {
      // Deselect all in group
      setSelectedChars(prev => prev.filter(s => !groupSymbols.includes(s)));
    } else {
      // Select all in group (merge unique)
      setSelectedChars(prev => [...new Set([...prev, ...groupSymbols])]);
    }
  };

  const handleStartPractice = () => {
    if (selectedChars.length > 0) {
        onStartLesson(selectedChars);
    }
  };

  if (!currentLangCode || charGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
           <BookOpen size={64} className="text-gray-300 dark:text-gray-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-700 dark:text-white mb-2">
          {currentLang ? `${currentLang.name} Alphabet` : 'Alphabet'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto">
          Character lessons are currently available for Japanese and Korean. Support for {currentLang?.name || 'other languages'} is coming soon!
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 md:rounded-2xl overflow-hidden transition-colors duration-300 relative">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-black text-gray-800 dark:text-white">{currentLang?.name} Characters</h1>
        <p className="text-gray-500 dark:text-gray-400 font-bold">Select characters to practice reading and writing.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-8">
        {charGroups.map(group => {
           const groupSymbols = group.characters.map(c => c.symbol);
           const selectedCount = groupSymbols.filter(s => selectedChars.includes(s)).length;
           const isAllSelected = selectedCount === groupSymbols.length && groupSymbols.length > 0;

           return (
            <div key={group.id}>
                <div className="flex justify-between items-end mb-4">
                  <div>
                      <h3 className="text-xl font-extrabold text-gray-700 dark:text-white">{group.name}</h3>
                      <p className="text-xs font-bold text-gray-400">{selectedCount}/{groupSymbols.length} selected</p>
                  </div>
                  <button 
                      onClick={() => toggleGroup(group)}
                      className="flex items-center gap-2 text-sm font-bold text-brand-blue hover:text-brand-blue-dark dark:hover:text-blue-300 transition-colors py-2 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                      {isAllSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                      {isAllSelected ? 'Deselect Group' : 'Select Group'}
                  </button>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {group.characters.map((char, idx) => {
                      const isSelected = selectedChars.includes(char.symbol);
                      return (
                      <div
                          key={idx}
                          onClick={() => toggleChar(char.symbol)}
                          className={`
                              cursor-pointer aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all active:scale-95 group relative overflow-hidden shadow-sm
                              ${isSelected 
                                  ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' 
                                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-blue hover:bg-gray-50 dark:hover:bg-gray-700'}
                          `}
                      >
                          {isSelected && (
                              <div className="absolute top-2 left-2 text-brand-blue dark:text-blue-400">
                                  <CheckCircle size={16} fill="currentColor" className="text-white dark:text-gray-900" />
                              </div>
                          )}
                          <div className={`text-3xl font-black mb-1 ${isSelected ? 'text-brand-blue dark:text-blue-300' : 'text-gray-700 dark:text-white'}`}>{char.symbol}</div>
                          <div className={`text-xs font-bold uppercase ${isSelected ? 'text-brand-blue-dark dark:text-blue-200' : 'text-gray-400'}`}>{char.romanization}</div>
                          
                          <button 
                              onClick={(e) => playSound(e, char.symbol)}
                              className="absolute bottom-2 right-2 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-brand-blue hover:text-white transition-colors z-10"
                              title="Listen"
                          >
                              <Volume2 size={14} />
                          </button>
                      </div>
                      )
                  })}
                </div>
            </div>
           )
        })}
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600 text-center">
           <p className="text-gray-400 dark:text-gray-500 font-bold text-sm">More characters coming soon!</p>
        </div>
      </div>

      {/* Floating Action Button for Practice */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm transition-transform duration-300 z-20 ${selectedChars.length > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
          <Button 
            fullWidth 
            size="lg" 
            onClick={handleStartPractice}
            className="shadow-lg flex items-center justify-center gap-2"
          >
            <Play fill="currentColor" size={18} />
            <span>Practice {selectedChars.length} Character{selectedChars.length !== 1 ? 's' : ''}</span>
          </Button>
      </div>
    </div>
  );
};
