
import React from 'react';
import { Language, LanguageProgress } from '../types';
import { CheckCircle, Trash2 } from 'lucide-react';

interface LanguageCardProps {
  language: Language;
  progress?: LanguageProgress;
  isSelected?: boolean;
  onClick: () => void;
  onDelete?: () => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({ language, progress, isSelected, onClick, onDelete }) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`
        relative flex flex-col items-center p-4 rounded-2xl border-2 cursor-pointer transition-all group
        ${isSelected 
          ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20 shadow-[0_4px_0_0_var(--brand-primary-shadow)]' 
          : 'border-gray-200 bg-white hover:border-gray-300 shadow-[0_4px_0_0_#e5e7eb] hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 dark:shadow-none'}
        active:translate-y-[4px] active:shadow-none
      `}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 text-brand-blue">
          <CheckCircle size={20} fill="currentColor" className="text-white" />
        </div>
      )}

      {onDelete && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 left-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Remove Language"
        >
          <Trash2 size={16} />
        </button>
      )}
      
      <div className="text-5xl mb-3 shadow-sm rounded-full overflow-hidden w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 relative">
        {language.countryCode ? (
          <img 
            src={`https://flagcdn.com/w160/${language.countryCode.toLowerCase()}.png`}
            alt={language.name}
            className="w-full h-full object-cover"
          />
        ) : (
           language.flag
        )}
      </div>
      
      <h3 className="font-bold text-gray-700 dark:text-gray-200">{language.name}</h3>
      
      {progress && (
        <div className="mt-2 w-full">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1 font-bold">
            <span>Lvl {progress.level}</span>
            <span>{progress.xp} XP</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-brand-yellow h-2 rounded-full" 
              style={{ width: `${Math.min((progress.xp % 100), 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
