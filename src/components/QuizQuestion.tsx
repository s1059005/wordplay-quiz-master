
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { VocabWord, QuizState } from "@/types";
import { speakWord, checkAnswer } from "@/utils/quizUtils";
import { Volume2 } from "lucide-react";

interface QuizQuestionProps {
  quizState: QuizState;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  onComplete: () => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  quizState,
  onAnswer,
  onComplete,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const currentWord = quizState.words[quizState.currentWordIndex];
  const progress = ((quizState.currentWordIndex) / quizState.questionCount) * 100;
  
  useEffect(() => {
    // Focus input when component mounts or new word is shown
    inputRef.current?.focus();
    
    // Speak the word automatically when a new word is shown
    if (currentWord) {
      speakWord(currentWord.english);
    }
    
    // Reset state for new word
    setInputValue("");
    setIsCorrect(null);
  }, [currentWord, quizState.currentWordIndex]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentWord || inputValue.trim() === "") return;
    
    const correct = checkAnswer(inputValue, currentWord.english);
    setIsCorrect(correct);
    
    onAnswer(inputValue.trim(), correct);
    
    // Move to next word or complete quiz after answering
    if (quizState.currentWordIndex >= quizState.questionCount - 1) {
      onComplete();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };
  
  const playAudio = () => {
    if (currentWord) {
      speakWord(currentWord.english);
    }
  };
  
  if (!currentWord) return null;
  
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-4">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-1 text-sm text-muted-foreground">
          <span>Question {quizState.currentWordIndex + 1}</span>
          <span>of {quizState.questionCount}</span>
        </div>
      </div>
      
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Translate to English</span>
            <Button variant="ghost" size="icon" onClick={playAudio} title="Play pronunciation">
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-3xl font-bold">{currentWord.chinese}</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type the English word"
                className={`text-2xl md:text-3xl text-center p-4 h-auto ${
                  isCorrect === true
                    ? "border-green-500 focus-visible:ring-green-500"
                    : isCorrect === false
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                autoComplete="off"
              />
            </form>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={inputValue.trim() === ""}
          >
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizQuestion;
