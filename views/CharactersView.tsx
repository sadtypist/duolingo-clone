
import React, { useState } from 'react';
import { UserProfile, CharacterGroup } from '../types';
import { CHARACTER_DATA, LANGUAGES } from '../constants';
import { Button } from '../components/Button';
import { Volume2, ArrowRight, BookOpen } from 'lucide-react';

interface CharactersViewProps {
  user: UserProfile;
  onStartLesson: (characters: string[]) => void;
}

export const CharactersView: React.FC<CharactersViewProps> = ({ user, onStartLesson }) => {
  const currentLangCode = user.currentLanguageCode;
  const currentLang = LANGUAGES.find(l => l.code === currentLangCode);
  const charGroups: CharacterGroup[] = (currentLangCode && CHARACTER_DATA[currentLangCode]) || [];

  const playSound = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLangCode || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (!currentLangCode || charGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
           <BookOpen size={64} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-700 mb-2">
          {currentLang ? `${currentLang.name} Alphabet` : 'Alphabet'}
        </h2>
        <p className="text-gray-500 font-medium max-w-xs mx-auto">
          Character lessons are currently available for Japanese and Korean. Support for {currentLang?.name || 'other languages'} is coming soon!
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white md:rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-white">
        <h1 className="text-2xl font-black text-gray-800">{currentLang?.name} Characters</h1>
        <p className="text-gray-500 font-bold">Master the alphabet to read and write.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-8">
        {charGroups.map(group => (
          <div key={group.id}>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-xl font-extrabold text-gray-700">{group.name}</h3>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => onStartLesson(group.characters.map(c => c.symbol))}
              >
                Practice <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {group.characters.map((char, idx) => (
                <button
                  key={idx}
                  onClick={() => playSound(char.symbol)}
                  className="aspect-square rounded-2xl border-2 border-gray-200 hover:border-brand-blue hover:bg-blue-50 flex flex-col items-center justify-center transition-all active:scale-95 group relative overflow-hidden bg-white shadow-sm"
                >
                  <div className="text-3xl font-black text-gray-700 mb-1 group-hover:text-brand-blue">{char.symbol}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase group-hover:text-brand-blue-dark">{char.romanization}</div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Volume2 size={14} className="text-brand-blue" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
        
        <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
           <p className="text-gray-400 font-bold text-sm">More characters coming soon!</p>
        </div>
      </div>
    </div>
  );
};
