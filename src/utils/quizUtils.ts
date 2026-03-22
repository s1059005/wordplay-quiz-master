
import { VocabWord } from "@/types";

export const parseCSV = (csvString: string): VocabWord[] => {
  const lines = csvString.trim().split('\n');
  
  return lines.map((line, index) => {
    const [chinese, english] = line.split(',').map(item => item.trim());
    
    if (!chinese || !english) {
      console.error(`Invalid line in CSV: ${line}`);
      return null;
    }
    
    return {
      id: `word-${index}`,
      chinese,
      english
    };
  }).filter(Boolean) as VocabWord[];
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const speakWord = async (word: string): Promise<void> => {
  try {
    // Get TTS configuration from environment variables
    const baseUrl = import.meta.env.VITE_TTS_API_BASE_URL || "http://localhost:5000";
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    try {
      const response = await fetch(`${baseUrl}/api/v2/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: word,
          language_code: "en-US",
          voice_name: "en-US-Chirp3-HD-Sulafat",
          speed: 1.0,
          pitch: 0
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        await audio.play();
      } else {
        throw new Error("No audio content in TTS response");
      }
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("TTS failed, falling back to browser speech synthesis:", error);
    
    // Fallback to browser's SpeechSynthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported in this browser');
    }
  }
};

export const calculateScore = (
  answers: { wordId: string; answer: string; isCorrect: boolean }[]
): { correct: number; total: number; percentage: number } => {
  const correct = answers.filter(a => a.isCorrect).length;
  const total = answers.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  return { correct, total, percentage };
};

export const checkAnswer = (
  userAnswer: string, 
  correctAnswer: string
): boolean => {
  return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
};
