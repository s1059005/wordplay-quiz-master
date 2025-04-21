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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl text-center">測驗歷史</CardTitle>
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-center">測驗歷史</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">日期</TableHead>
                <TableHead>詞彙表</TableHead>
                <TableHead className="w-[100px] text-right">分數</TableHead>
                <TableHead className="w-[120px] text-right">答對/總題數</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHistory.map((result, index) => {
                const { fullDate, relative } = formatDate(result.date);
                
                return (
                  <TableRow key={index}>
                    <TableCell className="align-top">
                      <div className="text-sm">{relative}</div>
                      <div className="text-xs text-muted-foreground">{fullDate}</div>
                    </TableCell>
                    <TableCell>{result.fileName || "自訂詞彙"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {result.score.percentage}%
                    </TableCell>
                    <TableCell className="text-right">
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
