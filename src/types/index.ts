
export interface VocabWord {
  id: string;
  chinese: string;
  english: string;
}

export interface User {
  id: string;
  name: string;
  words: VocabWord[];
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
