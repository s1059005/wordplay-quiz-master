
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
      toast.error("Please upload a vocabulary list first");
      return;
    }

    if (words.length < questionCount) {
      toast.error(`You only have ${words.length} words. Please select fewer questions.`);
      return;
    }

    // Shuffle and select words based on question count
    const shuffledWords = shuffleArray(words).slice(0, questionCount);
    
    onStartQuiz({ questionCount }, shuffledWords);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-center">Quiz Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Number of Questions</h3>
            <RadioGroup
              defaultValue="10"
              className="flex space-x-4"
              onValueChange={(value) => setQuestionCount(parseInt(value))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10" id="q10" />
                <Label htmlFor="q10">10 Questions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="20" id="q20" />
                <Label htmlFor="q20">20 Questions</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="pt-4">
            <Button onClick={handleStartQuiz} className="w-full">
              Start Quiz
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizSettings;
