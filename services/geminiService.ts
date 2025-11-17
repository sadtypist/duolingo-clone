

import { GoogleGenAI, Type } from "@google/genai";
import { Lesson } from '../types';

// IMPORTANT: In a real app, this should be proxied through a backend.
const API_KEY = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const generateLesson = async (
  languageName: string, 
  nativeLanguageName: string,
  userLevel: number, 
  weakAreas: string[] = [], 
  isPractice: boolean = false,
  focusCharacters: string[] = [],
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium',
  questionCount: number = 5
): Promise<Lesson | null> => {
  if (!ai) {
    console.error("Gemini API Key not found");
    return null;
  }

  let adaptiveContext = "";
  
  if (focusCharacters.length > 0) {
    adaptiveContext = `This is a CHARACTER focused lesson. The user is learning these specific symbols/letters: ${focusCharacters.join(', ')}. 
    Create questions that test ONLY these characters.
    Examples of valid questions: 
    - "Which character is [sound]?" (Options are characters)
    - "What sound does [character] make?" (Options are romanization)
    - "Select the matching character for [sound]"

    IMPORTANT: 
    - Do NOT ask to translate sentences.
    - Do NOT use FILL_BLANK with sentences.
    - Focus on recognition and sound association using MULTIPLE_CHOICE and LISTENING types.
    `;
  } else if (isPractice) {
     const topics = weakAreas.slice(-15).join(', '); // Focus on most recent struggles
     if (topics.length > 0) {
        adaptiveContext = `This is a TARGETED PRACTICE session. The user has explicitly struggled with: ${topics}. 
        
        CRITICAL INSTRUCTION: 
        - Generate questions that focus HEAVILY on these specific weak areas.
        - If the weak areas are vocabulary, use them in sentences.
        - If they are grammar points, construct questions that test those specific rules.
        - Prioritize reinforcing these concepts over introducing new ones.`;
     } else {
        adaptiveContext = `This is a general PRACTICE session. The user is doing well. 
        Generate a comprehensive review of fundamental concepts appropriate for Level ${userLevel} to reinforce retention.`;
     }
  } else {
     adaptiveContext = weakAreas.length > 0 
      ? `The user has some weak areas: ${weakAreas.slice(-5).join(', ')}. Include a few questions to review these, but primarily focus on new content for Level ${userLevel}.`
      : `The user is doing well. Introduce a mix of vocabulary and grammar appropriate for level ${userLevel}.`;
  }

  let difficultyInstruction = "";
  if (focusCharacters.length > 0) {
      difficultyInstruction = "Difficulty: BEGINNER. Focus strictly on identifying these characters and their sounds. No complex grammar.";
  } else {
      switch(difficulty) {
          case 'Easy': difficultyInstruction = "Difficulty: EASY. Use simple vocabulary, clear context, shorter sentences, and avoid complex grammar exceptions."; break;
          case 'Medium': difficultyInstruction = "Difficulty: MEDIUM. Standard complexity for this proficiency level. Mix common and slightly challenging concepts."; break;
          case 'Hard': difficultyInstruction = "Difficulty: HARD. Challenge the user with complex sentence structures, advanced vocabulary, faster implied speech context, and trickier distractors."; break;
      }
  }

  const prompt = `Create a ${difficulty} ${isPractice ? 'practice review' : 'dynamic lesson'} for learning ${languageName} from ${nativeLanguageName} (Level ${userLevel}/10).
  ${adaptiveContext}
  ${difficultyInstruction}
  
  Generate exactly ${questionCount} questions with a mix of these types:
  1. MULTIPLE_CHOICE: Standard grammar/vocab question.
  2. FILL_BLANK: A sentence with a missing word indicated by '____'. Options are words to fill it.
  3. TRANSLATE: A short phrase or basic sentence in ${nativeLanguageName} (or target language) to translate.
  4. SENTENCE_TRANSLATE: A full, slightly more complex sentence in the target language to translate to ${nativeLanguageName} (or vice versa).
  5. LISTENING: 'questionText' is the phrase the user will hear (in ${languageName}). 'options' are transcriptions or translations.
  6. SPEAKING: 'questionText' is the phrase the user must read aloud (in ${languageName}). 'correctAnswer' is the text they must say. Options can be ignored or empty.

  IMPORTANT: 
  - Ensure 'questionText' is clear. 
  - For LISTENING, the questionText is what will be spoken by TTS.
  - For SPEAKING, the questionText is what the user sees and must speak.
  - Include a 'topic' field for each.
  The output must be valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  type: { 
                    type: Type.STRING, 
                    enum: ['MULTIPLE_CHOICE', 'FILL_BLANK', 'TRANSLATE', 'SENTENCE_TRANSLATE', 'LISTENING', 'SPEAKING'] 
                  },
                  questionText: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  topic: { type: Type.STRING }
                },
                required: ['id', 'type', 'questionText', 'options', 'correctAnswer', 'explanation', 'topic']
              }
            }
          },
          required: ['id', 'title', 'description', 'questions']
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as Lesson;

  } catch (error) {
    console.error("Error generating lesson:", error);
    // Fallback mock data
    return {
      id: 'mock-1',
      title: `Basic ${languageName}`,
      description: 'A generated fallback lesson due to API connectivity.',
      questions: [
        {
          id: 1,
          type: 'MULTIPLE_CHOICE' as any,
          questionText: `What is "Hello" in ${languageName}?`,
          options: ['Hello', 'Hola', 'Bonjour', 'Ciao'], 
          correctAnswer: 'Hello',
          explanation: 'This is a fallback lesson.',
          topic: 'Greetings'
        }
      ]
    };
  }
};

export const validateTranslation = async (originalText: string, userTranslation: string, correctAnswer: string): Promise<boolean> => {
  if (!ai) return false;
  
  // If exact match, don't waste tokens
  if (userTranslation.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
    return true;
  }

  const prompt = `
    You are a language teacher. 
    Question: Translate "${originalText}" to the target language.
    Expected Answer: "${correctAnswer}"
    Student Answer: "${userTranslation}"
    
    Is the Student Answer a valid, correct translation? It might be a synonym or slightly different phrasing but still correct.
    Respond with JSON: { "isCorrect": boolean }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN }
          },
          required: ['isCorrect']
        }
      }
    });

    const text = response.text;
    if (!text) return false;
    const result = JSON.parse(text);
    return result.isCorrect;
  } catch (e) {
    console.error("Validation error", e);
    return false;
  }
};

export const generateMascotImage = async (prompt: string): Promise<string | null> => {
  if (!ai) return null;
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });
    
    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64ImageBytes) {
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};