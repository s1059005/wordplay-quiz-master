
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

export const speakWord = (word: string): void => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  } else {
    console.error('Speech synthesis not supported in this browser');
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
