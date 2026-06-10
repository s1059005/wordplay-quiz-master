
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
  passedWordIds?: string[];     // 向後相容用（舊資料遷移）
  wordScores: Record<string, number>;  // 單字分數，≥ 0 表示通過
  completionMessage?: string; // 通關祝賀詞
  completionMessage1?: string; // 第一則通關獎勵文字
  completionMessage2?: string; // 第二則通關獎勵文字
  passCount?: number;          // 通關次數
  hasCountedThisPass?: boolean; // 本次通關是否已記錄
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
