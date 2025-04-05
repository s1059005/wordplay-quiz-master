
export interface VocabWord {
  id: string;
  chinese: string;
  english: string;
}

export interface QuizResult {
  date: string; // ISO string
  score: {
    correct: number;
    total: number;
    percentage: number;
  };
  fileName?: string; // Name of the vocabulary file used
}

export interface User {
  id: string;
  name: string;
  words: VocabWord[];
  lastFileUpload?: {
    fileName: string;
    uploadDate: string;
  };
  quizHistory: QuizResult[];
}

export interface QuizState {
  words: VocabWord[];
  currentWordIndex: number;
  questionCount: number;
  answers: { wordId: string; answer: string; isCorrect: boolean }[];
  isComplete: boolean;
}

export interface QuizSettings {
  questionCount: number;
}
