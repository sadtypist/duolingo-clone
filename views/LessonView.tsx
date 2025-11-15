
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Lesson, QuestionType } from '../types';
import { generateLesson } from '../services/geminiService';
import { completeLesson, popOfflineLesson } from '../services/storageService';
import { LANGUAGES, XP_PER_LESSON, ACHIEVEMENTS } from '../constants';
import { Button } from '../components/Button';
import { ArrowLeft, Check, X, Loader2, Trophy, Dumbbell, Volume2, Mic, MicOff, WifiOff } from 'lucide-react';

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
}

export const LessonView: React.FC<LessonViewProps> = ({ user, onComplete, onExit, isPractice = false }) => {
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // User Input States
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [spokenText, setSpokenText] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  
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

        // Check Offline Status
        if (!navigator.onLine) {
            const offlineLesson = popOfflineLesson(currentLang.code);
            if (offlineLesson) {
                setLesson(offlineLesson);
                setIsOfflineMode(true);
                setLoading(false);
                return;
            }
            // If offline and no lesson found, show error in render
            setLoading(false);
            setIsOfflineMode(true);
            return;
        }
        
        const progress = user.progress[currentLang.code];
        const userLevel = progress?.level || 1;
        const weakAreas = progress?.weakAreas || [];
        
        try {
          const newLesson = await generateLesson(currentLang.name, userLevel, weakAreas, isPractice);
          setLesson(newLesson);
        } catch (e) {
          // Fallback if API fails even if navigator says online
          const offlineLesson = popOfflineLesson(currentLang.code);
          if (offlineLesson) {
             setLesson(offlineLesson);
             setIsOfflineMode(true);
          }
        }
        setLoading(false);
    };
    loadLesson();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, [currentLang, isPractice]);

  // TTS Helper
  const speak = (text: string, langCode: string = 'en-US') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop previous
    const utterance = new SpeechSynthesisUtterance(text);
    // Simple mapping attempt, fallback to generic lang code
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

  const handleCheck = () => {
    if (!lesson) return;
    
    const currentQ = lesson.questions[currentQuestionIndex];
    const topic = currentQ.topic || 'General';
    let isCorrect = false;

    if (currentQ.type === QuestionType.SPEAKING) {
      // Fuzzy matching for speaking
      const normalizedSpoken = spokenText.toLowerCase().replace(/[.,!?]/g, '').trim();
      const normalizedTarget = currentQ.correctAnswer.toLowerCase().replace(/[.,!?]/g, '').trim();
      isCorrect = normalizedSpoken === normalizedTarget || normalizedSpoken.includes(normalizedTarget);
    } else {
      isCorrect = selectedOption === currentQ.correctAnswer;
    }

    if (isCorrect) {
      setFeedback('correct');
      setCorrectCount(prev => prev + 1);
      setCorrectQuestions(prev => [...prev, topic]);
      // Positive sound
      playSuccessSound();
    } else {
      setFeedback('incorrect');
      setIncorrectQuestions(prev => [...prev, topic]);
    }
  };
  
  const playSuccessSound = () => {
     const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
     audio.volume = 0.5;
     audio.play().catch(() => {});
  }

  const handleNext = () => {
    if (!lesson) return;
    
    setFeedback(null);
    setSelectedOption(null);
    setSpokenText('');
    setIsListening(false);
    window.speechSynthesis.cancel();

    if (currentQuestionIndex < lesson.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishLesson();
    }
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
        setTimeout(() => {
          onComplete(result.profile);
        }, 2500);
        return;
      }
    }

    onComplete(result.profile);
  };

  if (!currentLang) return <div className="p-4">No language selected</div>;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <Loader2 className={`w-12 h-12 ${isPractice ? 'text-purple-500' : 'text-brand-green'} animate-spin mb-4`} />
        <h2 className="text-xl font-bold text-gray-700">{isPractice ? 'Preparing Practice Session...' : 'Creating your lesson...'}</h2>
        <p className="text-gray-400 text-center px-4">
            Building listening, speaking, and translation exercises.
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

  // Determine button state
  const canCheck = isSpeaking ? spokenText.length > 0 : !!selectedOption;

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-white sm:border-x border-gray-200 sm:shadow-lg min-h-screen relative">
      {/* Offline Indicator */}
      {isOfflineMode && (
          <div className="absolute top-0 left-0 right-0 bg-gray-800 text-white text-xs text-center py-1 z-10">
              Offline Mode
          </div>
      )}

      {/* Header */}
      <div className="px-4 py-6 flex items-center gap-4 mt-4">
        <button onClick={onExit} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <div className="flex-1 bg-gray-200 rounded-full h-4">
          <div 
            className={`${themeBg} h-4 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {isPractice && <Dumbbell className="text-purple-500" size={24} />}
      </div>

      {/* Question Area */}
      <div className="flex-1 px-6 flex flex-col justify-center pb-24 overflow-y-auto">
        
        <div className="mb-6">
           {currentQ.type === QuestionType.FILL_BLANK && <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Fill in the blank</span>}
           {currentQ.type === QuestionType.TRANSLATE && <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Translate this sentence</span>}
           {currentQ.type === QuestionType.LISTENING && <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Listen and select</span>}
           {currentQ.type === QuestionType.SPEAKING && <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Speak this sentence</span>}
        </div>

        {/* Question Content */}
        <div className="mb-8">
           {isListeningQ ? (
             <button 
               onClick={() => speak(currentQ.questionText, currentLang.code)}
               className="w-32 h-32 rounded-2xl bg-brand-blue text-white flex items-center justify-center mx-auto shadow-[0_6px_0_0_#1899d6] active:translate-y-[6px] active:shadow-none transition-all mb-4"
             >
                <Volume2 size={48} />
             </button>
           ) : (
             <div className="flex items-center gap-4">
               {currentQ.type !== QuestionType.FILL_BLANK && (
                 <button 
                   onClick={() => speak(currentQ.questionText, currentLang.code)} 
                   className="p-3 rounded-xl bg-brand-blue text-white shadow-sm active:scale-95 transition-transform"
                 >
                   <Volume2 size={24} />
                 </button>
               )}
               <h2 className="text-2xl font-bold text-gray-700 leading-tight">
                 {currentQ.questionText.split('____').map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="inline-block w-16 border-b-4 border-gray-300 mx-1 relative top-1"></span>
                      )}
                    </React.Fragment>
                 ))}
               </h2>
             </div>
           )}
        </div>

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
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = currentQ.correctAnswer === option;
              
              // Visual states for feedback
              let statusClass = "border-gray-200 hover:bg-gray-50";
              if (feedback === 'correct' && isCorrect) statusClass = "bg-green-100 border-brand-green text-brand-green-dark";
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
                    w-full p-4 rounded-xl border-2 text-lg font-semibold text-left transition-all
                    ${statusClass}
                    ${feedback ? 'cursor-default' : 'cursor-pointer shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[4px]'}
                  `}
                >
                  {option}
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
            <div className="flex-1">
               <Button 
                 fullWidth 
                 size="lg" 
                 onClick={handleCheck} 
                 disabled={!canCheck}
                 variant={isPractice ? 'practice' : 'primary'}
               >
                 Check
               </Button>
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
    </div>
  );
};
