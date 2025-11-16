import React, { useState } from 'react';
import { LANGUAGES } from '../constants';
import { LanguageCard } from '../components/LanguageCard';
import { Button } from '../components/Button';
import { UserProfile } from '../types';
import { Search } from 'lucide-react';

interface LanguageSelectionProps {
  user: UserProfile;
  onSelectLanguage: (code: string) => void;
}

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ user, onSelectLanguage }) => {
  const [search, setSearch] = useState('');

  const filteredLanguages = LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto p-6 pb-24">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-gray-700 mb-2">I want to learn...</h1>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search languages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:ring-0 outline-none bg-white text-gray-700 font-bold"
          />
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredLanguages.map(lang => (
          <LanguageCard
            key={lang.code}
            language={lang}
            isSelected={user.currentLanguageCode === lang.code}
            progress={user.progress[lang.code]}
            onClick={() => onSelectLanguage(lang.code)}
          />
        ))}
      </div>
      
      {filteredLanguages.length === 0 && (
        <div className="text-center text-gray-400 mt-12">
          <p className="text-lg font-bold">No languages found.</p>
          <p>Try searching for something else.</p>
        </div>
      )}
    </div>
  );
};