import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QuizSettings as QuizSettingsType, VocabWord } from "@/types";
import { toast } from "sonner";
import { shuffleArray } from "@/utils/quizUtils";

interface QuizSettingsProps {
  words: VocabWord[];
  onStartQuiz: (settings: QuizSettingsType, selectedWords: VocabWord[]) => void;
}

const QuizSettings: React.FC<QuizSettingsProps> = ({ words, onStartQuiz }) => {
  const [questionCount, setQuestionCount] = useState<number>(10);

  const handleStartQuiz = () => {
    if (words.length === 0) {
      toast.error("請先上傳詞彙表");
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-center">測驗設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">題目數量</h3>
            <RadioGroup
              defaultValue="10"
              className="flex space-x-4"
              onValueChange={(value) => setQuestionCount(parseInt(value))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10" id="q10" />
                <Label htmlFor="q10">10 題</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="20" id="q20" />
                <Label htmlFor="q20">20 題</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="50" id="q50" />
                <Label htmlFor="q50">50 題</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="pt-4">
            <Button onClick={handleStartQuiz} className="w-full">
              開始測驗
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizSettings;
