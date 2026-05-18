import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { VocabWord, QuizState } from "@/types";
import { speakWord, checkAnswer } from "@/utils/quizUtils";
import { Volume2 } from "lucide-react";
import WordSpiritAvatar from "@/components/WordSpiritAvatar";

interface QuizQuestionProps {
  quizState: QuizState;
  wordScores: Record<string, number>;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  onComplete: () => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  quizState,
  wordScores,
  onAnswer,
  onComplete,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isShowingResult, setIsShowingResult] = useState<boolean>(false);
  const [spiritAnim, setSpiritAnim] = useState<'appear' | 'idle' | 'captured' | 'escaped'>('appear');
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
    setSpiritAnim('appear');

    // 出現動畫結束後切換到 idle
    const timer = setTimeout(() => setSpiritAnim('idle'), 600);
    return () => clearTimeout(timer);
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!currentWord) return;

    // 如果正在顯示結果，且是錯誤的，再次點擊/按下 Enter 則進入下一題
    if (isShowingResult) {
      if (isCorrect === false) {
        proceedToNext(false);
      }
      return;
    }

    // 允許空白答案（視為答錯）
    
    const correct = checkAnswer(inputValue, currentWord.english);
    setIsCorrect(correct);
    
    // 先播放語音（使用強效快取，響應應為毫秒級）
    await speakWord(currentWord.english);
    
    // 觸發詞靈動畫
    setSpiritAnim(correct ? 'captured' : 'escaped');
    
    // 再顯示結果
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
    <div className="w-full max-w-xl mx-auto py-8">
      <div className="mb-6">
        <div className="flex justify-between mb-2 font-pixel text-[10px] text-primary">
          <span>Quest: {quizState.currentWordIndex + 1} / {quizState.questionCount}</span>
          <span>EXP: {Math.round(progress)}%</span>
        </div>
        <div className="retro-progress">
          <div 
            className="retro-progress-inner" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <Card className="retro-border">
        <CardHeader className="pb-3 border-b-2 border-primary/30">
          <div className="flex justify-between items-center">
            <span className="font-pixel text-[10px] text-primary/80">翻譯任務: 國語 → 英語</span>
            <Button variant="ghost" size="icon" onClick={playAudio} title="聆聽神諭" className="text-primary hover:bg-primary/20">
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* 詞靈動物 */}
            <div className="flex justify-center py-4">
              <WordSpiritAvatar
                wordId={currentWord.id}
                wordScore={wordScores[currentWord.id] ?? -1}
                animState={spiritAnim}
              />
            </div>

            <div className="text-center py-4 bg-black/40 border-2 border-primary/20 relative">
              <div className="absolute -top-3 left-4 bg-background px-2 font-pixel text-[8px] text-primary/60">TARGET</div>
              <h2 className="text-4xl font-vt323 text-primary tracking-widest">{currentWord.chinese}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="relative">
              <div className="absolute -top-3 left-4 bg-background px-2 font-pixel text-[8px] text-primary/60">INPUT</div>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="輸入英文單字..."
                className={`w-full retro-input text-center text-4xl py-4 ${
                  isCorrect === true
                    ? "border-green-500 text-green-400 bg-green-900/20"
                    : isCorrect === false
                    ? "border-red-500 text-red-400 bg-red-900/20"
                    : ""
                }`}
                autoComplete="off"
                disabled={isShowingResult}
              />
            </form>

            {isShowingResult && (
              <div className="bg-black/60 p-4 border-2 border-dashed border-primary/40 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {isCorrect === false ? (
                  <div className="text-center">
                    <p className="font-pixel text-[10px] text-red-400 mb-2">判定失敗！正確應為：</p>
                    <p className="text-4xl font-vt323 text-green-400 cursor-blink tracking-widest">{currentWord.english}</p>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-3xl font-pixel text-green-400 animate-bounce">GREAT!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 pb-6">
          <button 
            onClick={() => handleSubmit()} 
            className="w-full retro-button"
            disabled={false}
          >
            {isShowingResult && isCorrect === false ? "下一階段 [NEXT]" : "提交判定 [ENTER]"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizQuestion;
