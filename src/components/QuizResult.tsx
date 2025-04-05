
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
          <CardTitle className="text-2xl text-center">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-4">
            <h3 className="text-4xl font-bold mb-2">{score.percentage}%</h3>
            <p className="text-muted-foreground">
              You got {score.correct} out of {score.total} questions correct
            </p>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Chinese</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead>Your Answer</TableHead>
                  <TableHead className="w-[50px]">Result</TableHead>
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
            Start New Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizResult;
