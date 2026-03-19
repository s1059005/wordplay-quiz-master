import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuizState } from "@/types";
import { calculateScore } from "@/utils/quizUtils";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizResultProps {
  quizState: QuizState;
  onRestart: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({ quizState, onRestart }) => {
  const score = calculateScore(quizState.answers);
  
  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <Card className="retro-border">
        <CardHeader className="border-b-2 border-primary/30">
          <CardTitle className="text-2xl text-center font-pixel text-primary drop-shadow-md">
            冒險結算 [QUEST CLEAR]
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8 bg-black/40 border-y-2 border-primary/10">
            <p className="font-pixel text-[10px] text-primary/60 mb-2">達成率 (SYNC RATE)</p>
            <h3 className="text-6xl font-vt323 text-primary tracking-tighter drop-shadow-[0_0_10px_rgba(240,165,0,0.5)]">
              {score.percentage}%
            </h3>
            <p className="font-vt323 text-primary/80 text-xl mt-2">
              成功討伐 {score.correct} 隻詞靈 (共 {score.total} 隻)
            </p>
          </div>
          
          <div className="border-2 border-primary/20 bg-black/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-primary/10 font-pixel text-[8px]">
                <TableRow className="hover:bg-transparent border-primary/20">
                  <TableHead className="w-[60px] text-primary">序號</TableHead>
                  <TableHead className="text-primary">靈咒(中)</TableHead>
                  <TableHead className="text-primary">正解(英)</TableHead>
                  <TableHead className="text-primary">詠唱(您)</TableHead>
                  <TableHead className="w-[60px] text-primary">判定</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizState.answers.map((answer, index) => {
                  const word = quizState.words.find(w => w.id === answer.wordId);
                  
                  if (!word) return null;
                  
                  return (
                    <TableRow key={word.id} className="border-primary/10 font-vt323 text-lg hover:bg-primary/5">
                      <TableCell className="text-primary/60">{index + 1}</TableCell>
                      <TableCell className="text-primary">{word.chinese}</TableCell>
                      <TableCell className="text-green-400">{word.english}</TableCell>
                      <TableCell className={answer.isCorrect ? "text-primary/80" : "text-red-400"}>
                        {answer.answer || "---"}
                      </TableCell>
                      <TableCell>
                        {answer.isCorrect ? (
                          <span className="text-green-500 font-pixel text-[10px]">OK</span>
                        ) : (
                          <span className="text-red-500 font-pixel text-[10px]">NG</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="pt-4 pb-6">
          <button onClick={onRestart} className="w-full retro-button py-4">
            重新啟程 [CONTINUE]
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizResult;
