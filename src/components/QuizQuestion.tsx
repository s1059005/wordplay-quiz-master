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
  const [isShowingResult, setIsShowingResult] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const currentWord = quizState.words[quizState.currentWordIndex];
  const progress = ((quizState.currentWordIndex) / quizState.questionCount) * 100;
  
  useEffect(() => {
    // Speak the word automatically when a new word is shown
    if (currentWord) {
      speakWord(currentWord.english);
    }
    
    // Reset state for new word
    setInputValue("");
    setIsCorrect(null);
    setIsShowingResult(false);
  }, [currentWord, quizState.currentWordIndex]);

  // Focus input whenever it's not showing result (re-enabled)
  useEffect(() => {
    if (!isShowingResult) {
      // Small timeout to ensure the DOM has updated and input is no longer disabled
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isShowingResult]);
  
  const proceedToNext = (correct: boolean) => {
    onAnswer(inputValue.trim(), correct);
    
    // Move to next word or complete quiz after answering
    if (quizState.currentWordIndex >= quizState.questionCount - 1) {
      onComplete();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!currentWord) return;

    // 如果正在顯示結果，且是錯誤的，再次點擊/按下 Enter 則進入下一題
    if (isShowingResult) {
      if (isCorrect === false) {
        proceedToNext(false);
      }
      return;
    }

    if (inputValue.trim() === "") return;
    
    const correct = checkAnswer(inputValue, currentWord.english);
    setIsCorrect(correct);
    setIsShowingResult(true);
    
    if (correct) {
      // 答對則 1 秒後自動跳轉
      setTimeout(() => {
        proceedToNext(true);
      }, 1000);
    }
    // 答錯則保持原樣，等待使用者確認
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
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
          <span>第 {quizState.currentWordIndex + 1} 題</span>
          <span>共 {quizState.questionCount} 題</span>
        </div>
      </div>
      
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">請翻譯成英文</span>
            <Button variant="ghost" size="icon" onClick={playAudio} title="播放發音">
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
                placeholder="請輸入英文單字"
                className={`text-2xl md:text-3xl text-center p-4 h-auto ${
                  isCorrect === true
                    ? "border-green-500 focus-visible:ring-green-500 bg-green-50"
                    : isCorrect === false
                    ? "border-red-500 focus-visible:ring-red-500 bg-red-50"
                    : ""
                }`}
                autoComplete="off"
                disabled={isShowingResult}
              />
            </form>

            {isShowingResult && isCorrect === false && (
              <div className="text-center animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-muted-foreground mb-1">正確答案：</p>
                <p className="text-2xl font-bold text-green-600">{currentWord.english}</p>
              </div>
            )}
            
            {isShowingResult && isCorrect === true && (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <p className="text-xl font-bold text-green-600">答對了！</p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={() => handleSubmit()} 
            className={`w-full ${isShowingResult && isCorrect === false ? "bg-blue-600 hover:bg-blue-700" : ""}`}
            disabled={!isShowingResult && inputValue.trim() === ""}
          >
            {isShowingResult && isCorrect === false ? "下一題" : "提交答案"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizQuestion;
