

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Lesson, QuestionType, DailyGoal } from '../types';
import { generateLesson, validateTranslation } from '../services/geminiService';
import { completeLesson, popOfflineLesson } from '../services/storageService';
import { LANGUAGES, XP_PER_LESSON, ACHIEVEMENTS } from '../constants';
import { Button } from '../components/Button';
import { ArrowLeft, Check, X, Loader2, Trophy, Dumbbell, Volume2, Mic, MicOff, WifiOff, Keyboard, BookA, AlertTriangle, Feather, Target, Flame, ArrowRight, Lightbulb, Zap, Download, CheckCircle, AlertCircle } from 'lucide-react';

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
  onReviewWeakAreas?: (updatedUser: UserProfile) => void;
  isPractice?: boolean;
  focusCharacters?: string[];
  initialLesson?: Lesson | null;
}

export const LessonView: React.FC<LessonViewProps> = ({ user, onComplete, onExit, onReviewWeakAreas, isPractice = false, focusCharacters = [], initialLesson = null }) => {
  // Determine initial difficulty if auto-set
  const getInitialDifficulty = () => {
    // If initialLesson is provided, difficulty is already baked in, but we might need a value for state consistency
    if (initialLesson) return 'Medium';
    
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
  const [lesson, setLesson] = useState<Lesson | null>(initialLesson);
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
  
  // Summary State
  const [lessonResult, setLessonResult] = useState<{
    xpGained: number;
    correctCount: number;
    totalQuestions: number;
    newAchievements: string[];
    updatedProfile: UserProfile;
    weakAreas: string[];
    strongAreas: string[];
    goalsCompleted: DailyGoal[];
  } | null>(null);

  const currentLang = LANGUAGES.find(l => l.code === user.currentLanguageCode);
  const nativeLangName = LANGUAGES.find(l => l.code === (user.nativeLanguageCode || 'en'))?.name || 'English';
  
  const progress = user.currentLanguageCode ? user.progress[user.currentLanguageCode] : undefined;
  const hasWeakAreas = (progress?.weakAreas?.length || 0) > 0;

  const recognitionRef = useRef<any>(null);
  
  // Helper to get current question safely
  const currentQ = lesson?.questions[currentQuestionIndex];

  useEffect(() => {
    const loadLesson = async () => {
        if (!currentLang) return;
        
        if (initialLesson) {
            setLesson(initialLesson);
            setLoading(false);
            return;
        }

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
        // Prioritize recent weak areas for practice
        const weakAreas = progress?.weakAreas || [];
        
        try {
          // Determine question count from preferences. 
          const lessonDuration = user.preferences?.lessonDuration || 5;
          const questionCount = Math.max(3, lessonDuration);

          const newLesson = await generateLesson(
            currentLang.name, 
            nativeLangName, // Pass native language name
            userLevel, 
            weakAreas, 
            isPractice, 
            focusCharacters,
            difficulty,
            questionCount
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
    
    if (difficulty || initialLesson) {
       loadLesson();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, [currentLang, isPractice, focusCharacters, difficulty, nativeLangName, user.preferences, initialLesson]);

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
      
      if (currentQ) {
         if (currentQ.type === QuestionType.SPEAKING) {
            setSpokenText(transcript);
         } else if (currentQ.type === QuestionType.TRANSLATE || currentQ.type === QuestionType.SENTENCE_TRANSLATE) {
            setTypedAnswer(prev => {
                const cleanTranscript = transcript.trim();
                const cleanPrev = prev.trim();
                // Append if there is existing text, otherwise just set
                return cleanPrev ? `${cleanPrev} ${cleanTranscript}` : cleanTranscript;
            });
         }
      }
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
    if (!currentQ) return;
    setIsChecking(true);
    
    const topic = currentQ.topic || 'General';
    let isCorrect = false;

    if (currentQ.type === QuestionType.SPEAKING) {
      // Fuzzy matching for speaking
      const normalizedSpoken = spokenText.toLowerCase().replace(/[.,!?]/g, '').trim();
      const normalizedTarget = currentQ.correctAnswer.toLowerCase().replace(/[.,!?]/g, '').trim();
      isCorrect = normalizedSpoken === normalizedTarget || normalizedSpoken.includes(normalizedTarget);
    } else if (currentQ.type === QuestionType.TRANSLATE || currentQ.type === QuestionType.SENTENCE_TRANSLATE) {
      // AI Validation for translation
      // First check strict equality to save API call
      const normalizedTyped = typedAnswer.toLowerCase().trim().replace(/[.,!?]/g, '');
      const normalizedTarget = currentQ.correctAnswer.toLowerCase().trim().replace(/[.,!?]/g, '');
      
      if (normalizedTyped === normalizedTarget) {
        isCorrect = true;
      } else if (!isOfflineMode && navigator.onLine) {
        // Use AI to validate if online
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
    const q = lesson?.questions[currentQuestionIndex];
    if (q) {
        setIncorrectQuestions(prev => [...prev, q.topic || 'General']);
    }
    handleNext();
  };

  const finishLesson = () => {
    if (!user.currentLanguageCode || !lesson) return;
    
    const baseXp = XP_PER_LESSON + (correctCount * 5);
    
    const result = completeLesson({
      langCode: user.currentLanguageCode,
      xpGained: baseXp,
      questionsTotal: lesson.questions.length,
      questionsCorrect: correctCount,
      weakTopicsDetected: incorrectQuestions,
      strongTopicsDetected: correctQuestions
    }, isPractice);

    // Deduplicate and segregate topics
    const uniqueWeak = [...new Set(incorrectQuestions)];
    const uniqueStrong = [...new Set(correctQuestions)].filter(t => !uniqueWeak.includes(t));

    setLessonResult({
        xpGained: result.xpGainedTotal,
        correctCount: correctCount,
        totalQuestions: lesson.questions.length,
        newAchievements: result.newAchievements,
        updatedProfile: result.profile,
        weakAreas: uniqueWeak,
        strongAreas: uniqueStrong,
        goalsCompleted: result.goalsCompleted
    });

    if (user.preferences?.enableSoundEffects) {
        playSuccessSound();
    }
  };

  if (!currentLang) return <div className="p-4 dark:text-white">No language selected</div>;

  // DIFFICULTY SELECTION SCREEN
  if (!difficulty && !initialLesson) {
      return (
        <div className="flex flex-col h-full max-w-lg mx-auto bg-white dark:bg-gray-800 sm:border-x border-gray-200 dark:border-gray-700 sm:shadow-lg p-6">
             <div className="flex items-center mb-8">
                <button onClick={onExit} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X size={24} />
                </button>
                <h1 className="flex-1 text-center font-extrabold text-xl text-gray-700 dark:text-white mr-8">New Lesson</h1>
             </div>

             <div className="flex-1 flex flex-col justify-center space-y-4 pb-16">
                <h2 className="text-center text-2xl font-black text-gray-800 dark:text-white mb-6">Choose difficulty</h2>
                
                {/* Explicit Emerald/Green colors for "Easy" to maintain semantic meaning regardless of theme */}
                <button onClick={() => setDifficulty('Easy')} className="group relative p-6 rounded-3xl border-b-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-500 active:border-b-0 active:translate-y-1 transition-all">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-500 group-hover:text-white uppercase tracking-wide">Easy</span>
                      <Feather className="text-emerald-500 group-hover:text-white" size={32} strokeWidth={2.5} />
                   </div>
                   <p className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-emerald-100 text-left">Relaxed pace with simple concepts.</p>
                </button>

                <button onClick={() => setDifficulty('Medium')} className="group relative p-6 rounded-3xl border-b-4 border-brand-blue bg-blue-50 dark:bg-blue-900/20 hover:bg-brand-blue active:border-b-0 active:translate-y-1 transition-all">
                   <div className="flex items-center justify-between mb-2">
                       <span className="text-xl font-black text-brand-blue-dark dark:text-blue-300 group-hover:text-white uppercase tracking-wide">Medium</span>
                       <Target className="text-brand-blue group-hover:text-white" size={32} strokeWidth={2.5} />
                   </div>
                   <p className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-blue-100 text-left">Standard challenge for your level.</p>
                </button>

                <button onClick={() => setDifficulty('Hard')} className="group relative p-6 rounded-3xl border-b-4 border-brand-red bg-red-50 dark:bg-red-900/20 hover:bg-brand-red active:border-b-0 active:translate-y-1 transition-all">
                   <div className="flex items-center justify-between mb-2">
                       <span className="text-xl font-black text-brand-red dark:text-red-400 group-hover:text-white uppercase tracking-wide">Hard</span>
                       <Flame className="text-brand-red group-hover:text-white" size={32} strokeWidth={2.5} />
                   </div>
                   <p className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-red-100 text-left">Complex topics and faster speed.</p>
                </button>
             </div>
        </div>
      );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800">
        <Loader2 className={`w-12 h-12 ${isPractice ? 'text-purple-500' : 'text-brand-green'} animate-spin mb-4`} />
        <h2 className="text-xl font-bold text-gray-700 dark:text-white">
          {focusCharacters.length > 0 ? 'Preparing Character Drill...' : (isPractice && hasWeakAreas) ? 'Targeting Your Weak Areas...' : isPractice ? 'Preparing Practice Session...' : 'Creating your lesson...'}
        </h2>
        <p className="text-gray-400 dark:text-gray-500 text-center px-4">
            {focusCharacters.length > 0 ? 'Focusing on specific symbols.' : (isPractice && hasWeakAreas) ? 'Customizing questions to help you improve.' : `Building ${(difficulty || 'standard').toLowerCase()} listening, speaking, and translation exercises.`}
        </p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-white dark:bg-gray-800">
        {isOfflineMode ? (
            <>
                <WifiOff className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-700 dark:text-white mb-2">You are offline</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">No downloaded lessons found for {currentLang.name}.</p>
            </>
        ) : (
            <h2 className="text-xl font-bold text-red-500 mb-4">Unable to load lesson.</h2>
        )}
        <Button onClick={onExit}>Return Home</Button>
      </div>
    );
  }

  // SUMMARY SCREEN
  if (lessonResult) {
    const accuracy = Math.round((lessonResult.correctCount / lessonResult.totalQuestions) * 100);

    return (
      <div className="flex flex-col h-full max-w-lg mx-auto bg-white dark:bg-gray-800 sm:border-x border-gray-200 dark:border-gray-700 sm:shadow-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex-1 flex flex-col items-center text-center overflow-y-auto pb-4">
            
            <div className="relative mb-6 mt-8">
                <div className="absolute inset-0 bg-yellow-100 dark:bg-yellow-900/40 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                <Trophy size={120} className="text-brand-yellow relative z-10" strokeWidth={1.5} />
            </div>

            <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-2">Lesson Complete!</h1>
            <div className="flex items-center gap-2 text-brand-yellow font-bold mb-8 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-1 rounded-full">
                <Zap size={20} fill="currentColor" />
                <span>+{lessonResult.xpGained} XP Earned</span>
            </div>
            
            {/* Daily Goals Completed Notification */}
            {lessonResult.goalsCompleted.length > 0 && (
              <div className="w-full mb-8 animate-bounce-short">
                {lessonResult.goalsCompleted.map(goal => (
                  <div key={goal.id} className="flex items-center justify-center gap-2 p-2 mb-2 rounded-xl bg-emerald-500 text-white font-bold shadow-md">
                    <CheckCircle size={20} />
                    <span>Daily Goal: {goal.title} (+{goal.rewardXp} XP)</span>
                  </div>
                ))}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl p-4 text-center">
                    <div className="text-sm font-bold text-gray-400 uppercase mb-1">Accuracy</div>
                    <div className="text-3xl font-black text-gray-700 dark:text-white">{accuracy}%</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl p-4 text-center">
                    <div className="text-sm font-bold text-gray-400 uppercase mb-1">Correct</div>
                    <div className="text-3xl font-black text-brand-green">{lessonResult.correctCount}</div>
                </div>
            </div>

            {/* Performance Analysis */}
            {(lessonResult.strongAreas.length > 0 || lessonResult.weakAreas.length > 0) && (
              <div className="w-full mb-6 text-left">
                 <h3 className="text-center text-gray-400 font-bold uppercase text-xs tracking-widest mb-4">Performance Analysis</h3>
                 <div className="space-y-4">
                    {lessonResult.strongAreas.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900 rounded-xl p-4">
                         <div className="flex items-center gap-2 mb-2 text-brand-success font-extrabold uppercase text-sm">
                            <CheckCircle size={16} /> Strengths
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {lessonResult.strongAreas.map(t => (
                               <span key={t} className="px-2 py-1 bg-white dark:bg-green-800 text-green-700 dark:text-green-200 text-xs font-bold rounded-md shadow-sm">
                                  {t}
                               </span>
                            ))}
                         </div>
                      </div>
                    )}
                    
                    {lessonResult.weakAreas.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-xl p-4">
                         <div className="flex items-center gap-2 mb-2 text-brand-red font-extrabold uppercase text-sm">
                            <AlertCircle size={16} /> Focus Areas
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {lessonResult.weakAreas.map(t => (
                               <span key={t} className="px-2 py-1 bg-white dark:bg-red-800 text-red-700 dark:text-red-200 text-xs font-bold rounded-md shadow-sm">
                                  {t}
                               </span>
                            ))}
                         </div>
                      </div>
                    )}
                 </div>
              </div>
            )}

            {lessonResult.newAchievements.length > 0 && (
                <div className="w-full mb-6">
                    <h3 className="text-center text-gray-400 font-bold uppercase text-xs tracking-widest mb-3">Unlocked Achievements</h3>
                    <div className="space-y-3">
                        {lessonResult.newAchievements.map(id => {
                            const ach = ACHIEVEMENTS.find(a => a.id === id);
                            if (!ach) return null;
                            return (
                                <div key={id} className="flex items-center gap-4 bg-brand-yellow/10 dark:bg-brand-yellow/5 border-2 border-brand-yellow p-4 rounded-2xl">
                                    <div className="text-3xl">{ach.icon}</div>
                                    <div className="text-left">
                                        <div className="font-black text-gray-800 dark:text-gray-100 text-sm">{ach.title}</div>
                                        <div className="text-xs font-bold text-gray-600 dark:text-gray-400">{ach.description}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
         </div>

         <div className="w-full pt-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
             <div className="flex flex-col gap-3">
                {onReviewWeakAreas && lessonResult.weakAreas.length > 0 && (
                  <Button 
                    fullWidth 
                    size="lg" 
                    variant="practice"
                    onClick={() => onReviewWeakAreas(lessonResult.updatedProfile)}
                    className="shadow-[0_4px_0_0_#7e22ce]"
                  >
                    Review Weak Areas
                  </Button>
                )}
                <Button 
                  fullWidth 
                  size="lg" 
                  onClick={() => onComplete(lessonResult.updatedProfile)}
                  variant="primary"
                >
                  Continue
                </Button>
             </div>
         </div>
      </div>
    );
  }

  // Ensure we have a currentQ before rendering question content
  if (!currentQ) return null;

  const progressPercent = ((currentQuestionIndex) / lesson.questions.length) * 100;
  const themeBg = isPractice ? 'bg-purple-500' : 'bg-brand-green';
  const isSpeaking = currentQ.type === QuestionType.SPEAKING;
  const isListeningQ = currentQ.type === QuestionType.LISTENING;
  const isTranslate = currentQ.type === QuestionType.TRANSLATE || currentQ.type === QuestionType.SENTENCE_TRANSLATE;

  // Determine button state
  let canCheck = false;
  if (isSpeaking) canCheck = spokenText.length > 0;
  else if (isTranslate) canCheck = typedAnswer.trim().length > 0;
  else canCheck = !!selectedOption;

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-white dark:bg-gray-800 sm:border-x border-gray-200 dark:border-gray-700 sm:shadow-lg relative transition-colors duration-300">
      {/* Offline Indicator - Enhanced visibility */}
      {isOfflineMode && (
        <div className="bg-amber-500 dark:bg-amber-600 text-white py-3 px-4 animate-in slide-in-from-top z-30 shadow-md">
          <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs mb-1">
                 <WifiOff size={16} />
                 <span>Offline Mode - Features Limited</span>
              </div>
              <span className="text-xs font-bold text-amber-100 text-center sm:text-left">
                 Smart checking and speech features are unavailable.
              </span>
            </div>
            <button 
                onClick={onExit}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 font-bold text-xs transition-colors border border-white/20 whitespace-nowrap"
            >
                <Download size={14} />
                Download Lessons
            </button>
          </div>
        </div>
      )}

      {/* Header - Flex item (no sticky), z-index for safety */}
      <div className="flex-none z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-4 py-4 flex items-center gap-4 border-b border-gray-50 dark:border-gray-700 shadow-sm">
        <button onClick={() => setShowQuitModal(true)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <X size={24} />
        </button>
        
        <div className="flex-1 flex items-center gap-3" role="progressbar" aria-valuenow={Math.round(progressPercent)} aria-valuemin={0} aria-valuemax={100}>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
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

      {/* Question Area - Scrollable with Center/Scroll logic */}
      <div className="flex-1 overflow-y-auto w-full relative">
        <div className="min-h-full flex flex-col justify-center p-6 pb-12">
            
            <div className="mb-6">
              {currentQ.type === QuestionType.FILL_BLANK && <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Fill in the blank</span>}
              {(currentQ.type === QuestionType.TRANSLATE || currentQ.type === QuestionType.SENTENCE_TRANSLATE) && <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Translate this sentence</span>}
              {currentQ.type === QuestionType.LISTENING && <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Listen and select</span>}
              {currentQ.type === QuestionType.SPEAKING && <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Speak this sentence</span>}
              {currentQ.type === QuestionType.MULTIPLE_CHOICE && <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Select the correct answer</span>}
            </div>

            {/* Question Content */}
            <div className="mb-8 break-words">
              {isListeningQ ? (
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => speak(currentQ.questionText, currentLang.code)}
                    className="w-32 h-32 rounded-2xl bg-brand-blue text-white flex items-center justify-center shadow-[0_6px_0_0_var(--brand-secondary-shadow)] active:translate-y-[6px] active:shadow-none transition-all mb-6"
                  >
                      <Volume2 size={48} />
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                    {/* Universal Speaker Icon for all non-listening types */}
                  <button 
                    onClick={() => speak(currentQ.questionText, currentLang.code)} 
                    className="mt-1 p-3 rounded-xl bg-brand-blue text-white shadow-[0_2px_0_0_var(--brand-secondary-shadow)] active:shadow-none active:translate-y-[2px] transition-all flex-shrink-0"
                    title="Read aloud"
                  >
                    <Volume2 size={20} />
                  </button>
                  
                  <h2 className="text-2xl font-bold text-gray-700 dark:text-white leading-tight pt-1">
                    {currentQ.questionText.includes('____') ? (
                      currentQ.questionText.split('____').map((part, i, arr) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="inline-block min-w-[3rem] border-b-4 border-gray-300 dark:border-gray-600 mx-1 relative top-1"></span>
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
            {(currentQ.type === QuestionType.TRANSLATE || currentQ.type === QuestionType.SENTENCE_TRANSLATE || currentQ.type === QuestionType.FILL_BLANK) && (
                <div className="mb-6">
                    {!showHint ? (
                        <button 
                            onClick={() => setShowHint(true)}
                            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-blue transition-colors group"
                        >
                            <div className="p-1 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                <Lightbulb size={18} />
                            </div>
                            <span>Need a hint?</span>
                        </button>
                    ) : (
                        <div className="inline-flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-brand-blue/20 px-4 py-3 rounded-xl text-brand-blue animate-in fade-in slide-in-from-top-2">
                            <Lightbulb size={18} className="flex-shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                                {currentQ.topic && (
                                  <span className="text-[10px] font-black opacity-60 uppercase tracking-wider mb-1">
                                    Topic: {currentQ.topic}
                                  </span>
                                )}
                                <span className="text-sm font-bold leading-tight">
                                    {currentQ.type === QuestionType.TRANSLATE || currentQ.type === QuestionType.SENTENCE_TRANSLATE
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
                <div className={`p-4 w-full min-h-[80px] rounded-2xl border-2 ${spokenText ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'} flex items-center justify-center text-lg font-semibold text-center dark:text-white`}>
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
              <div className="w-full relative">
                <textarea 
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  disabled={!!feedback || isChecking}
                  placeholder="Type or speak your translation..."
                  className={`
                    w-full p-4 pb-12 rounded-xl border-2 min-h-[120px] text-lg font-medium resize-none outline-none transition-all dark:text-white
                    ${feedback === 'correct' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 scale-105 ring-4 ring-emerald-200 dark:ring-emerald-900 shadow-lg' : 
                      feedback === 'incorrect' ? 'border-brand-red bg-red-50 dark:bg-red-900/20 text-brand-red' : 
                      'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-brand-blue focus:bg-white dark:focus:bg-gray-800 text-gray-700'}
                  `}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  {!feedback && (
                    <>
                      <button
                          onClick={toggleListening}
                          className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-md' : 'bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-300 hover:bg-brand-blue hover:text-white'}`}
                          title="Use Voice Input"
                      >
                          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                      </button>
                      <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1"></div>
                      <Keyboard size={20} className="text-gray-300" />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = currentQ.correctAnswer === option;
                  
                  // Visual states for feedback
                  let statusClass = "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white";
                  
                  // Use semantic green (emerald) for success, explicit red for error, theme blue for selection
                  if (feedback === 'correct' && isCorrect) statusClass = "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-4 ring-emerald-200 dark:ring-emerald-900 scale-105 shadow-lg z-10 transition-transform duration-500 ease-out";
                  if (feedback === 'incorrect' && isSelected) statusClass = "bg-red-100 dark:bg-red-900/40 border-brand-red text-brand-red";
                  if (!feedback && isSelected) statusClass = "bg-blue-50 dark:bg-blue-900/40 border-brand-blue text-brand-blue";

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
                      {feedback === 'correct' && isCorrect && <Check size={24} className="animate-bounce-short text-emerald-500" />}
                      {feedback === 'incorrect' && isSelected && <X size={24} />}
                    </button>
                  )
                })}
              </div>
            )}
        </div>
      </div>

      {/* Footer Action */}
      <div className={`flex-none border-t-2 p-4 pb-safe transition-colors duration-300 ${
        feedback === 'correct' ? 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 
        feedback === 'incorrect' ? 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
        <div className="max-w-lg mx-auto flex justify-between items-center gap-4">
          
          {feedback === 'correct' && (
             <div className="flex flex-col gap-2 text-brand-success flex-1 min-w-0">
               <div className="flex items-center gap-2 font-extrabold text-xl animate-bounce-short">
                 <div className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm"><Check size={24} /></div>
                 <span>Excellent!</span>
               </div>
               {currentQ.explanation && (
                 <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 leading-snug break-words">
                   {currentQ.explanation}
                 </div>
               )}
             </div>
          )}
          {feedback === 'incorrect' && (
             <div className="flex flex-col gap-2 text-brand-red flex-1 min-w-0">
               <div className="flex items-center gap-2 font-extrabold text-xl">
                 <div className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm"><X size={24} /></div>
                 <span>Incorrect</span>
               </div>
               <div className="text-sm font-bold leading-snug">
                  <span className="opacity-80 uppercase text-xs tracking-wide block mb-0.5">Correct Answer:</span>
                  {currentQ.correctAnswer}
               </div>
               {currentQ.explanation && (
                 <div className="text-xs font-medium text-red-700 dark:text-red-300 leading-snug bg-white/50 dark:bg-black/10 p-2 rounded-lg">
                   {currentQ.explanation}
                 </div>
               )}
             </div>
          )}
          
          {!feedback && (
            <div className="flex-1 flex gap-3 items-center">
               <div className="flex-none">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowSkipModal(true)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-extrabold uppercase tracking-widest"
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
             <div className="flex-shrink-0">
               <Button 
                 size="lg" 
                 variant={feedback === 'correct' ? 'success' : 'danger'}
                 onClick={handleNext}
                 className={feedback === 'correct' ? '' : 'bg-brand-red shadow-[0_4px_0_0_#b91c1c]'}
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
           <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center transform scale-100 transition-all border-2 border-gray-100 dark:border-gray-700">
               <div className="mb-6 flex justify-center">
                 <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-full border-2 border-gray-100 dark:border-gray-600 shadow-sm">
                    <ArrowRight size={40} className="text-gray-400 dark:text-gray-300" strokeWidth={2.5} />
                 </div>
               </div>
               <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white mb-3">Skip this question?</h2>
               <p className="text-gray-500 dark:text-gray-400 font-bold mb-8 text-sm leading-relaxed">
                 You won't receive XP for this answer, but you can keep learning.
               </p>
               
               <div className="flex flex-col gap-3">
                 <Button variant="secondary" size="lg" fullWidth onClick={handleSkipConfirmation} className="uppercase tracking-widest">
                   Yes, Skip
                 </Button>
                 <Button variant="outline" size="lg" fullWidth onClick={() => setShowSkipModal(false)} className="uppercase tracking-widest border-2 border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 shadow-none dark:text-gray-300">
                   Cancel
                 </Button>
               </div>
           </div>
        </div>
      )}

      {/* Quit Confirmation Modal */}
      {showQuitModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center transform scale-100 transition-all border-2 border-gray-100 dark:border-gray-700">
               <div className="mb-6 flex justify-center">
                 <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full border-2 border-red-100 dark:border-red-800 shadow-sm">
                    <AlertTriangle size={40} className="text-brand-red" strokeWidth={2.5} />
                 </div>
               </div>
               <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white mb-3">Quit this lesson?</h2>
               <p className="text-gray-500 dark:text-gray-400 font-bold mb-8 text-sm leading-relaxed">
                 You'll lose your progress for this session if you leave now.
               </p>
               
               <div className="flex flex-col gap-3">
                 <Button variant="secondary" size="lg" fullWidth onClick={() => setShowQuitModal(false)} className="uppercase tracking-widest">
                   Keep Learning
                 </Button>
                 <Button variant="outline" size="lg" fullWidth onClick={onExit} className="uppercase tracking-widest text-brand-red border-2 border-gray-200 hover:bg-red-50 hover:border-red-200 dark:border-gray-600 dark:hover:bg-red-900/20 shadow-none">
                   End Session
                 </Button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};