import React from "react";
import {
  Card,
  CardContent,
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
import { QuizResult } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface QuizHistoryProps {
  history: QuizResult[];
}

const QuizHistory: React.FC<QuizHistoryProps> = ({ history }) => {
  // Sort history with most recent quizzes first
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Format the date for better readability
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        fullDate: date.toLocaleDateString() + ' ' + date.toLocaleTimeString(),
        relative: formatDistanceToNow(date, { addSuffix: true })
      };
    } catch (error) {
      return { fullDate: dateString, relative: "未知時間" };
    }
  };

  if (history.length === 0) {
    return (
      <Card className="retro-border">
        <CardHeader>
          <CardTitle className="text-xl text-center font-pixel text-primary drop-shadow-md">
            尚未有冒險紀錄 [NO DATA]
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            尚無測驗歷史。完成一次測驗後即可在此查看結果。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="retro-border">
      <CardHeader>
        <CardTitle className="text-xl text-center font-pixel text-primary drop-shadow-md">
          過往冒險紀錄 [LOGS]
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-primary/20 bg-black/20 overflow-hidden">
          <Table>
            <TableHeader className="bg-primary/10 font-pixel text-[8px]">
              <TableRow className="hover:bg-transparent border-primary/20">
                <TableHead className="w-[140px] text-primary">時間軸</TableHead>
                <TableHead className="text-primary">卷軸名稱</TableHead>
                <TableHead className="w-[100px] text-right text-primary">同步率</TableHead>
                <TableHead className="w-[120px] text-right text-primary">擊破/總數</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHistory.map((result, index) => {
                const { fullDate, relative } = formatDate(result.date);
                
                return (
                  <TableRow key={index} className="border-primary/10 font-vt323 text-lg hover:bg-primary/5">
                    <TableCell className="align-top py-4">
                      <div className="text-primary/80 leading-tight">{relative}</div>
                      <div className="text-xs text-primary/40 mt-1">{fullDate}</div>
                    </TableCell>
                    <TableCell className="text-primary">{result.fileName || "無名卷軸"}</TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {result.score.percentage}%
                    </TableCell>
                    <TableCell className="text-right text-primary/60">
                      {result.score.correct}/{result.score.total}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizHistory;
