
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Lesson, QuestionType } from '../types';
import { generateLesson, validateTranslation } from '../services/geminiService';
import { completeLesson, popOfflineLesson } from '../services/storageService';
import { LANGUAGES, XP_PER_LESSON, ACHIEVEMENTS } from '../constants';
import { Button } from '../components/Button';
import { ArrowLeft, Check, X, Loader2, Trophy, Dumbbell, Volume2, Mic, MicOff, WifiOff, Keyboard, BookA, AlertTriangle, Feather, Target, Flame, ArrowRight, Lightbulb } from 'lucide-react';

// Polyfill for SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface LessonViewProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
  onExit: () => void;
  isPractice?: boolean;
  focusCharacters?: string[];
}

export const LessonView: React.FC<LessonViewProps> = ({ user, onComplete, onExit, isPractice = false, focusCharacters = [] }) => {
  // Determine initial difficulty if auto-set
  const getInitialDifficulty = () => {
    // For character lessons, bypass difficulty selection and default to Easy/Standard
    if (focusCharacters.length > 0) return 'Easy';

    if (user.preferences?.autoDifficulty && user.currentLanguageCode) {
      const level = user.progress[user.currentLanguageCode]?.level || 1;
      if (level < 25) return 'Easy';
      if (level < 50) return 'Medium';
      return 'Hard';
    }
    return null;
  };

  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | null>(getInitialDifficulty());
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // User Input States
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [spokenText, setSpokenText] = useState<string>('');
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  
  // Adaptive Tracking
  const [correctQuestions, setCorrectQuestions] = useState<string[]>([]); 
  const [incorrectQuestions, setIncorrectQuestions] = useState<string[]>([]); 
  const [correctCount, setCorrectCount] = useState(0);
  
  const [showAchievement, setShowAchievement] = useState<string | null>(null);

  const currentLang = LANGUAGES.find(l => l.code === user.currentLanguageCode);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const loadLesson = async () => {
        if (!currentLang) return;
        if (!difficulty) return; // Wait for difficulty selection

        // Check Offline Status (skip for character lessons as they are dynamic/short usually, or fallback)
        if (!navigator.onLine && focusCharacters.length === 0) {
            const offlineLesson = popOfflineLesson(currentLang.code);
            if (offlineLesson) {
                setLesson(offlineLesson);
                setIsOfflineMode(true);
                setLoading(false);
                return;
            }
            setLoading(false);
            setIsOfflineMode(true);
            return;
        }
        
        const progress = user.progress[currentLang.code];
        const userLevel = progress?.level || 1;
        const weakAreas = progress?.weakAreas || [];
        
        try {
          const newLesson = await generateLesson(
            currentLang.name, 
            userLevel, 
            weakAreas, 
            isPractice, 
            focusCharacters,
            difficulty
          );
          setLesson(newLesson);
        } catch (e) {
          // Fallback if API fails even if navigator says online
          const offlineLesson = popOfflineLesson(currentLang.code);
          if (offlineLesson && focusCharacters.length === 0) {
             setLesson(offlineLesson);
             setIsOfflineMode(true);
          }
        }
        setLoading(false);
    };
    
    if (difficulty) {
       loadLesson();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, [currentLang, isPractice, focusCharacters, difficulty]);

  // TTS Helper
  const speak = (text: string, langCode: string = 'en-US') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop previous
    
    // Sanitize text for better speech (e.g. underscores)
    // Replaces "____" with "blank"
    const cleanText = text.replace(/_+/g, ' blank ');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode; 
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition Helper
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = currentLang?.code || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSpokenText(transcript);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const playSuccessSound = () => {
     if (!user.preferences?.enableSoundEffects) return;

     // Pleasant magic chime sound
     const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg");
     audio.volume = 0.4;
     audio.play().catch(() => {});
  }

  const playErrorSound = () => {
     if (!user.preferences?.enableSoundEffects) return;

     // Error sound
     const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
     audio.volume = 0.3;
     audio.play().catch(() => {});
  }

  const handleCheck = async () => {
    if (!lesson) return;
    setIsChecking(true);
    
    const currentQ = lesson.questions[currentQuestionIndex];
    const topic = currentQ.topic || 'General';
    let isCorrect = false;

    if (currentQ.type === QuestionType.SPEAKING) {
      // Fuzzy matching for speaking
      const normalizedSpoken = spokenText.toLowerCase().replace(/[.,!?]/g, '').trim();
      const normalizedTarget = currentQ.correctAnswer.toLowerCase().replace(/[.,!?]/g, '').trim();
      isCorrect = normalizedSpoken === normalizedTarget || normalizedSpoken.includes(normalizedTarget);
    } else if (currentQ.type === QuestionType.TRANSLATE) {
      // AI Validation for translation
      // First check strict equality to save API call
      const normalizedTyped = typedAnswer.toLowerCase().trim().replace(/[.,!?]/g, '');
      const normalizedTarget = currentQ.correctAnswer.toLowerCase().trim().replace(/[.,!?]/g, '');
      
      if (normalizedTyped === normalizedTarget) {
        isCorrect = true;
      } else if (!isOfflineMode) {
        // Use AI to validate
        isCorrect = await validateTranslation(currentQ.questionText, typedAnswer, currentQ.correctAnswer);
      } else {
        // Strict fallback if offline
        isCorrect = false; 
      }
    } else {
      isCorrect = selectedOption === currentQ.correctAnswer;
    }

    if (isCorrect) {
      setFeedback('correct');
      setCorrectCount(prev => prev + 1);
      setCorrectQuestions(prev => [...prev, topic]);
      playSuccessSound();
    } else {
      setFeedback('incorrect');
      setIncorrectQuestions(prev => [...prev, topic]);
      playErrorSound();
    }
    setIsChecking(false);
  };

  const handleNext = () => {
    if (!lesson) return;
    
    setFeedback(null);
    setSelectedOption(null);
    setSpokenText('');
    setTypedAnswer('');
    setIsListening(false);
    setIsChecking(false);
    setShowHint(false);
    window.speechSynthesis.cancel();

    if (currentQuestionIndex < lesson.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishLesson();
    }
  };

  const handleSkipConfirmation = () => {
    setShowSkipModal(false);
    // Treat as weak area for adaptive purposes but no feedback penalty
    const currentQ = lesson?.questions[currentQuestionIndex];
    if (currentQ) {
        setIncorrectQuestions(prev => [...prev, currentQ.topic || 'General']);
    }
    handleNext();
  };

  const finishLesson = () => {
    if (!user.currentLanguageCode || !lesson) return;
    
    const xp = XP_PER_LESSON + (correctCount * 5);
    
    const result = completeLesson({
      langCode: user.currentLanguageCode,
      xpGained: xp,
      questionsTotal: lesson.questions.length,
      questionsCorrect: correctCount,
      weakTopicsDetected: incorrectQuestions,
      strongTopicsDetected: correctQuestions
    }, isPractice);

    if (result.newAchievements.length > 0) {
      const ach = ACHIEVEMENTS.find(a => a.id === result.newAchievements[0]);
      if (ach) {
        setShowAchievement(ach.title);
        if (user.preferences?.enableSoundEffects) {
            playSuccessSound();
        }
        setTimeout(() => {
          onComplete(result.profile);
        }, 2500);
        return;
      }
    }

    onComplete(result.profile);
  };

  if (!currentLang) return <div className="p-4">No language selected</div>;

  // DIFFICULTY SELECTION SCREEN
  if (!difficulty) {
      return (
        <div className="flex flex-col h-full max-w-lg mx-auto bg-white sm:border-x border-gray-200 sm:shadow-lg min-h-screen p-6">
             <div className="flex items-center mb-8">
                <button onClick={onExit} className="text-gray-400 hover:text-gray-600 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100">
                  <X size={24} />
                </button>
                <h1 className="flex-1 text-center font-extrabold text-xl text-gray-700 mr-8">New Lesson</h1>
             </div>

             <div className="flex-1 flex flex-col justify-center space-y-4 pb-16">
                <h2 className="text-center text-2xl font-black text-gray-800 mb-6">Choose difficulty</h2>
                
                <button onClick={() => setDifficulty('Easy')} className="group relative p-6 rounded-3xl border-b-4 border-brand-green bg-green-50 hover:bg-brand-green active:border-b-0 active:translate-y-1 transition-all">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-black text-brand-green-dark group-hover:text-white uppercase tracking-wide">Easy</span>
                      <Feather className="text-brand-green group-hover:text-white" size={32} strokeWidth={2.5} />
                   </div>
                   <p className="text-sm font-bold text-gray-500 group-hover:text-green-100 text-left">Relaxed pace with simple concepts.</p>
                </button>

                <button onClick={() => setDifficulty('Medium')} className="group relative p-6 rounded-3xl border-b-4 border-brand-blue bg-blue-50 hover:bg-brand-blue active:border-b-0 active:translate-y-1 transition-all">
                   <div className="flex items-center justify-between mb-2">
                       <span className="text-xl font-black text-brand-blue-dark group-hover:text-white uppercase tracking-wide">Medium</span>
                       <Target className="text-brand-blue group-hover:text-white" size={32} strokeWidth={2.5} />
                   </div>
                   <p className="text-sm font-bold text-gray-500 group-hover:text-blue-100 text-left">Standard challenge for your level.</p>
                </button>

                <button onClick={() => setDifficulty('Hard')} className="group relative p-6 rounded-3xl border-b-4 border-brand-red bg-red-50 hover:bg-brand-red active:border-b-0 active:translate-y-1 transition-all">
                   <div className="flex items-center justify-between mb-2">
                       <span className="text-xl font-black text-brand-red group-hover:text-white uppercase tracking-wide">Hard</span>
                       <Flame className="text-brand-red group-hover:text-white" size={32} strokeWidth={2.5} />
                   </div>
                   <p className="text-sm font-bold text-gray-500 group-hover:text-red-100 text-left">Complex topics and faster speed.</p>
                </button>
             </div>
        </div>
      );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <Loader2 className={`w-12 h-12 ${isPractice ? 'text-purple-500' : 'text-brand-green'} animate-spin mb-4`} />
        <h2 className="text-xl font-bold text-gray-700">
          {focusCharacters.length > 0 ? 'Preparing Character Drill...' : isPractice ? 'Preparing Practice Session...' : 'Creating your lesson...'}
        </h2>
        <p className="text-gray-400 text-center px-4">
            {focusCharacters.length > 0 ? 'Focusing on specific symbols.' : `Building ${difficulty.toLowerCase()} listening, speaking, and translation exercises.`}
        </p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        {isOfflineMode ? (
            <>
                <WifiOff className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">You are offline</h2>
                <p className="text-gray-500 mb-6">No downloaded lessons found for {currentLang.name}.</p>
            </>
        ) : (
            <h2 className="text-xl font-bold text-red-500 mb-4">Unable to load lesson.</h2>
        )}
        <Button onClick={onExit}>Return Home</Button>
      </div>
    );
  }

  if (showAchievement) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-brand-yellow text-white p-8 text-center animate-bounce-short">
        <Trophy size={80} className="mb-4" />
        <h1 className="text-4xl font-black mb-2">Achievement Unlocked!</h1>
        <p className="text-2xl font-bold">{showAchievement}</p>
      </div>
    );
  }

  const currentQ = lesson.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex) / lesson.questions.length) * 100;
  const themeBg = isPractice ? 'bg-purple-500' : 'bg-brand-green';
  const isSpeaking = currentQ.type === QuestionType.SPEAKING;
  const isListeningQ = currentQ.type === QuestionType.LISTENING;
  const isTranslate = currentQ.type === QuestionType.TRANSLATE;

  // Determine button state
  let canCheck = false;
  if (isSpeaking) canCheck = spokenText.length > 0;
  else if (isTranslate) canCheck = typedAnswer.trim().length > 0;
  else canCheck = !!selectedOption;

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-white sm:border-x border-gray-200 sm:shadow-lg min-h-screen relative">
      {/* Offline Indicator - Now flows naturally so header can be sticky properly */}
      {isOfflineMode && (
          <div className="bg-gray-800 text-white text-xs text-center py-1">
              Offline Mode
          </div>
      )}

      {/* Header - Sticky and visually enhanced */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm px-4 py-4 flex items-center gap-4 border-b border-gray-50 shadow-sm">
        <button onClick={() => setShowQuitModal(true)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>
        
        <div className="flex-1 flex items-center gap-3" role="progressbar" aria-valuenow={Math.round(progressPercent)} aria-valuemin={0} aria-valuemax={100}>
            <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`${themeBg} h-4 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
            <span className="text-xs font-black text-gray-400 tabular-nums min-w-[3ch]">
                {Math.round(progressPercent)}%
            </span>
        </div>

        {isPractice && <Dumbbell className="text-purple-500" size={24} />}
        {focusCharacters.length > 0 && <BookA className="text-brand-blue" size={24} />}
      </div>

      {/* Question Area */}
      <div className="flex-1 px-6 flex flex-col justify-center pb-24 overflow-y-auto pt-6">
        
        <div className="mb-6">
           {currentQ.type === QuestionType.FILL_BLANK && <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Fill in the blank</span>}
           {currentQ.type === QuestionType.TRANSLATE && <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Translate this sentence</span>}
           {currentQ.type === QuestionType.LISTENING && <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Listen and select</span>}
           {currentQ.type === QuestionType.SPEAKING && <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Speak this sentence</span>}
           {currentQ.type === QuestionType.MULTIPLE_CHOICE && <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Select the correct answer</span>}
        </div>

        {/* Question Content */}
        <div className="mb-8">
           {isListeningQ ? (
             <div className="flex flex-col items-center">
               <button 
                 onClick={() => speak(currentQ.questionText, currentLang.code)}
                 className="w-32 h-32 rounded-2xl bg-brand-blue text-white flex items-center justify-center shadow-[0_6px_0_0_#1899d6] active:translate-y-[6px] active:shadow-none transition-all mb-6"
               >
                  <Volume2 size={48} />
               </button>
             </div>
           ) : (
             <div className="flex items-start gap-4">
                {/* Universal Speaker Icon for all non-listening types */}
               <button 
                 onClick={() => speak(currentQ.questionText, currentLang.code)} 
                 className="mt-1 p-3 rounded-xl bg-brand-blue text-white shadow-[0_2px_0_0_#1899d6] active:shadow-none active:translate-y-[2px] transition-all flex-shrink-0"
                 title="Read aloud"
               >
                 <Volume2 size={20} />
               </button>
               
               <h2 className="text-2xl font-bold text-gray-700 leading-tight pt-1">
                 {currentQ.questionText.includes('____') ? (
                   currentQ.questionText.split('____').map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="inline-block min-w-[3rem] border-b-4 border-gray-300 mx-1 relative top-1"></span>
                      )}
                    </React.Fragment>
                   ))
                 ) : (
                   currentQ.questionText
                 )}
               </h2>
             </div>
           )}
        </div>

        {/* Hint Section */}
        {(currentQ.type === QuestionType.TRANSLATE || currentQ.type === QuestionType.FILL_BLANK) && (
            <div className="mb-6">
                {!showHint ? (
                    <button 
                        onClick={() => setShowHint(true)}
                        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-blue transition-colors group"
                    >
                        <div className="p-1 rounded-full group-hover:bg-blue-50 transition-colors">
                            <Lightbulb size={18} />
                        </div>
                        <span>Need a hint?</span>
                    </button>
                ) : (
                    <div className="inline-flex items-start gap-3 bg-blue-50 border border-brand-blue/20 px-4 py-3 rounded-xl text-brand-blue animate-in fade-in slide-in-from-top-2">
                        <Lightbulb size={18} className="flex-shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                             {currentQ.topic && (
                               <span className="text-[10px] font-black opacity-60 uppercase tracking-wider mb-1">
                                 Topic: {currentQ.topic}
                               </span>
                             )}
                             <span className="text-sm font-bold leading-tight">
                                {currentQ.type === QuestionType.TRANSLATE 
                                    ? `Try using "${currentQ.correctAnswer.split(' ')[0]}"` 
                                    : `Starts with "${currentQ.correctAnswer.charAt(0)}"`}
                             </span>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Input Area */}
        {isSpeaking ? (
          <div className="flex flex-col items-center gap-6">
             <div className={`p-4 w-full min-h-[80px] rounded-2xl border-2 ${spokenText ? 'border-brand-blue bg-blue-50' : 'border-gray-200 bg-gray-50'} flex items-center justify-center text-lg font-semibold text-center`}>
               {spokenText || "Tap mic to speak..."}
             </div>
             
             {!feedback && (
               <button
                 onClick={toggleListening}
                 className={`
                   w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all
                   ${isListening ? 'bg-red-500 animate-pulse' : 'bg-brand-blue hover:bg-brand-blue-dark'}
                 `}
               >
                 {isListening ? <MicOff size={32} /> : <Mic size={32} />}
               </button>
             )}
          </div>
        ) : isTranslate ? (
          <div className="w-full">
            <textarea 
               value={typedAnswer}
               onChange={(e) => setTypedAnswer(e.target.value)}
               disabled={!!feedback || isChecking}
               placeholder="Type your translation here..."
               className={`
                 w-full p-4 rounded-xl border-2 min-h-[120px] text-lg font-medium resize-none outline-none transition-all
                 ${feedback === 'correct' ? 'border-brand-green bg-green-50 text-brand-green-dark scale-105 ring-4 ring-green-200 shadow-lg' : 
                   feedback === 'incorrect' ? 'border-brand-red bg-red-50 text-brand-red' : 
                   'border-gray-200 bg-gray-50 focus:border-brand-blue focus:bg-white text-gray-700'}
               `}
            />
            {!feedback && (
              <div className="mt-2 text-right">
                <Keyboard size={20} className="inline-block text-gray-300" />
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = currentQ.correctAnswer === option;
              
              // Visual states for feedback
              let statusClass = "border-gray-200 hover:bg-gray-50";
              if (feedback === 'correct' && isCorrect) statusClass = "bg-green-100 border-brand-green text-brand-green-dark ring-4 ring-green-200 scale-105 shadow-lg z-10 transition-transform duration-500 ease-out";
              if (feedback === 'incorrect' && isSelected) statusClass = "bg-red-100 border-brand-red text-brand-red";
              if (!feedback && isSelected) statusClass = "bg-blue-50 border-brand-blue text-brand-blue";

              return (
                <button
                  key={idx}
                  disabled={!!feedback}
                  onClick={() => {
                    setSelectedOption(option);
                    speak(option, currentLang.code); // SPEAK SELECTION
                  }}
                  className={`
                    w-full p-4 rounded-xl border-2 text-lg font-semibold text-left transition-all flex justify-between items-center
                    ${statusClass}
                    ${feedback ? 'cursor-default' : 'cursor-pointer shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[4px]'}
                  `}
                >
                  <span>{option}</span>
                  {feedback === 'correct' && isCorrect && <Check size={24} className="animate-bounce-short" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className={`border-t-2 p-4 pb-safe transition-colors duration-300 ${
        feedback === 'correct' ? 'bg-green-100 border-green-200' : 
        feedback === 'incorrect' ? 'bg-red-100 border-red-200' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-lg mx-auto flex justify-between items-center">
          
          {feedback === 'correct' && (
             <div className="flex items-center gap-3 text-brand-green font-bold text-xl animate-bounce-short">
               <div className="bg-white p-2 rounded-full"><Check size={24} /></div>
               <span>Excellent!</span>
             </div>
          )}
          {feedback === 'incorrect' && (
             <div className="flex flex-col text-brand-red">
               <div className="font-bold text-xl mb-1">Incorrect</div>
               <div className="text-sm">Correct: {currentQ.correctAnswer}</div>
             </div>
          )}
          
          {!feedback && (
            <div className="flex-1 flex gap-3 items-center">
               <div className="flex-none">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowSkipModal(true)}
                    className="text-gray-400 hover:text-gray-600 font-extrabold uppercase tracking-widest"
                  >
                    Skip
                  </Button>
               </div>
               <div className="flex-1">
                  <Button 
                    fullWidth 
                    size="lg" 
                    onClick={handleCheck} 
                    disabled={!canCheck || isChecking}
                    variant={isPractice ? 'practice' : 'primary'}
                  >
                    {isChecking ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} /> Checking...
                      </div>
                    ) : 'Check'}
                  </Button>
               </div>
            </div>
          )}

          {feedback && (
             <div className="ml-auto">
               <Button 
                 size="lg" 
                 variant={feedback === 'correct' ? 'primary' : 'danger'}
                 onClick={handleNext}
                 className={feedback === 'correct' ? 'bg-brand-green shadow-[0_4px_0_0_#46a302]' : 'bg-brand-red shadow-[0_4px_0_0_#d63030]'}
               >
                 Continue
               </Button>
             </div>
          )}

        </div>
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center transform scale-100 transition-all border-2 border-gray-100">
               <div className="mb-6 flex justify-center">
                 <div className="bg-gray-50 p-4 rounded-full border-2 border-gray-100 shadow-sm">
                    <ArrowRight size={40} className="text-gray-400" strokeWidth={2.5} />
                 </div>
               </div>
               <h2 className="text-2xl font-extrabold text-gray-800 mb-3">Skip this question?</h2>
               <p className="text-gray-500 font-bold mb-8 text-sm leading-relaxed">
                 You won't receive XP for this answer, but you can keep learning.
               </p>
               
               <div className="flex flex-col gap-3">
                 <Button variant="secondary" size="lg" fullWidth onClick={handleSkipConfirmation} className="uppercase tracking-widest">
                   Yes, Skip
                 </Button>
                 <Button variant="outline" size="lg" fullWidth onClick={() => setShowSkipModal(false)} className="uppercase tracking-widest border-2 border-gray-200 hover:bg-gray-50 shadow-none">
                   Cancel
                 </Button>
               </div>
           </div>
        </div>
      )}

      {/* Quit Confirmation Modal */}
      {showQuitModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center transform scale-100 transition-all border-2 border-gray-100">
               <div className="mb-6 flex justify-center">
                 <div className="bg-red-50 p-4 rounded-full border-2 border-red-100 shadow-sm">
                    <AlertTriangle size={40} className="text-brand-red" strokeWidth={2.5} />
                 </div>
               </div>
               <h2 className="text-2xl font-extrabold text-gray-800 mb-3">Quit this lesson?</h2>
               <p className="text-gray-500 font-bold mb-8 text-sm leading-relaxed">
                 You'll lose your progress for this session if you leave now.
               </p>
               
               <div className="flex flex-col gap-3">
                 <Button variant="secondary" size="lg" fullWidth onClick={() => setShowQuitModal(false)} className="uppercase tracking-widest">
                   Keep Learning
                 </Button>
                 <Button variant="outline" size="lg" fullWidth onClick={onExit} className="uppercase tracking-widest text-brand-red border-2 border-gray-200 hover:bg-red-50 hover:border-red-200 shadow-none">
                   End Session
                 </Button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};
