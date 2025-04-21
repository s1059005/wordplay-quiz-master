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
    <div className="w-full max-w-2xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">測驗結果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-4">
            <h3 className="text-4xl font-bold mb-2">{score.percentage}%</h3>
            <p className="text-muted-foreground">
              您答對了 {score.total} 題中的 {score.correct} 題
            </p>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>中文</TableHead>
                  <TableHead>正確答案</TableHead>
                  <TableHead>您的答案</TableHead>
                  <TableHead className="w-[50px]">結果</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizState.answers.map((answer, index) => {
                  const word = quizState.words.find(w => w.id === answer.wordId);
                  
                  if (!word) return null;
                  
                  return (
                    <TableRow key={word.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{word.chinese}</TableCell>
                      <TableCell>{word.english}</TableCell>
                      <TableCell>{answer.answer || "-"}</TableCell>
                      <TableCell>
                        {answer.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onRestart} className="w-full">
            開始新測驗
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizResult;
