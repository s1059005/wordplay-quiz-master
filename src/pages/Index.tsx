
import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import QuizSettings from "@/components/QuizSettings";
import QuizQuestion from "@/components/QuizQuestion";
import QuizResult from "@/components/QuizResult";
import { VocabWord, QuizState, QuizSettings as QuizSettingsType } from "@/types";
import { checkAnswer } from "@/utils/quizUtils";

const Index = () => {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  
  const handleWordsLoaded = (loadedWords: VocabWord[]) => {
    setWords(loadedWords);
    // Reset quiz state when new words are loaded
    setQuizState(null);
  };
  
  const handleStartQuiz = (settings: QuizSettingsType, selectedWords: VocabWord[]) => {
    setQuizState({
      words: selectedWords,
      currentWordIndex: 0,
      questionCount: settings.questionCount,
      answers: [],
      isComplete: false
    });
  };
  
  const handleAnswer = (answer: string, isCorrect: boolean) => {
    if (!quizState) return;
    
    const currentWord = quizState.words[quizState.currentWordIndex];
    
    setQuizState(prev => {
      if (!prev) return null;
      
      // Add the answer to the list
      const updatedAnswers = [
        ...prev.answers,
        {
          wordId: currentWord.id,
          answer,
          isCorrect
        }
      ];
      
      // Move to the next word
      return {
        ...prev,
        currentWordIndex: prev.currentWordIndex + 1,
        answers: updatedAnswers
      };
    });
  };
  
  const handleCompleteQuiz = () => {
    setQuizState(prev => prev ? { ...prev, isComplete: true } : null);
  };
  
  const handleRestartQuiz = () => {
    setQuizState(null);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <header className="pt-8 pb-6 px-4">
        <h1 className="text-3xl font-bold text-center text-blue-700">
          Wordplay Quiz Master
        </h1>
        <p className="text-center text-muted-foreground mt-2">
          Test your English vocabulary with customized word lists
        </p>
      </header>
      
      <main className="flex-1 container max-w-4xl px-4 pb-12">
        {!quizState ? (
          <div className="grid gap-8 md:grid-cols-2">
            <FileUploader onWordsLoaded={handleWordsLoaded} />
            <QuizSettings words={words} onStartQuiz={handleStartQuiz} />
          </div>
        ) : quizState.isComplete ? (
          <QuizResult quizState={quizState} onRestart={handleRestartQuiz} />
        ) : (
          <QuizQuestion
            quizState={quizState}
            onAnswer={handleAnswer}
            onComplete={handleCompleteQuiz}
          />
        )}
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© 2025 Wordplay Quiz Master - Improve your vocabulary</p>
      </footer>
    </div>
  );
};

export default Index;
