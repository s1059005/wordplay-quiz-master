import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QuizSettings as QuizSettingsType, VocabWord } from "@/types";
import { toast } from "sonner";
import { shuffleArray } from "@/utils/quizUtils";
import { RefreshCw } from "lucide-react";

interface QuizSettingsProps {
  words: VocabWord[];
  onStartQuiz: (settings: QuizSettingsType, selectedWords: VocabWord[]) => void;
  isAllWordsPassed?: boolean;
  onReset?: () => void;
}

const QuizSettings: React.FC<QuizSettingsProps> = ({ words, onStartQuiz, isAllWordsPassed, onReset }) => {
  const [questionCount, setQuestionCount] = useState<number>(10);

  const handleStartQuiz = () => {
    if (words.length === 0) {
      if (isAllWordsPassed) {
        toast.error("所有單字已通關，請重置進度或上傳新詞彙表");
      } else {
        toast.error("請先上傳詞彙表");
      }
      return;
    }

    // Determine the actual number of questions (limited by available words)
    const actualQuestionCount = Math.min(words.length, questionCount);
    
    // Shuffle and select words based on actual question count
    const shuffledWords = shuffleArray(words).slice(0, actualQuestionCount);
    
    // Important: pass the actual count if it's less than the requested count
    onStartQuiz({ questionCount: actualQuestionCount }, shuffledWords);
    
    if (words.length < questionCount) {
      toast.info(`剩餘單字不足，將以實有的 ${words.length} 個單字進行測驗。`);
    }
  };

  return (
    <Card className="retro-border">
      <CardHeader>
        <CardTitle className="text-xl text-center font-pixel text-primary drop-shadow-md">
          冒險準備 [SETTINGS]
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {isAllWordsPassed ? (
            <div className="text-center py-6 border-2 border-dashed border-primary/20 bg-black/20 p-4 space-y-4">
              <p className="font-pixel text-xs text-primary mb-2">🎉 修行圓滿 🎉</p>
              <p className="text-sm text-primary/80 leading-relaxed font-vt323">
                此卷軸中的所有詞靈已被封印！
                您可以重新上傳新詞彙表，或重置進度以重新挑戰。
              </p>
              {onReset && (
                <button
                  onClick={onReset}
                  className="retro-button py-2 text-xs flex items-center justify-center gap-2 mx-auto px-4 group"
                >
                  <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                  重置進度 [RESET]
                </button>
              )}
            </div>
          ) : (
            <div>
              <h3 className="font-pixel text-xs text-primary/80 mb-4">挑戰題數 (QUESTS)</h3>
              <RadioGroup
                defaultValue="10"
                className="grid grid-cols-3 gap-4"
                onValueChange={(value) => setQuestionCount(parseInt(value))}
              >
                <div className="flex items-center space-x-2 bg-black/40 p-2 border-2 border-primary/20 hover:border-primary transition-colors">
                  <RadioGroupItem value="10" id="q10" className="border-primary text-primary" />
                  <Label htmlFor="q10" className="font-vt323 text-xl cursor-pointer">10 題</Label>
                </div>
                <div className="flex items-center space-x-2 bg-black/40 p-2 border-2 border-primary/20 hover:border-primary transition-colors">
                  <RadioGroupItem value="20" id="q20" className="border-primary text-primary" />
                  <Label htmlFor="q20" className="font-vt323 text-xl cursor-pointer">20 題</Label>
                </div>
                <div className="flex items-center space-x-2 bg-black/40 p-2 border-2 border-primary/20 hover:border-primary transition-colors">
                  <RadioGroupItem value="50" id="q50" className="border-primary text-primary" />
                  <Label htmlFor="q50" className="font-vt323 text-xl cursor-pointer">50 題</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="pt-4">
            <button 
              onClick={handleStartQuiz} 
              className={`w-full retro-button py-4 ${isAllWordsPassed ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isAllWordsPassed}
            >
              開始冒險 [START]
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizSettings;
