import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, RefreshCw, Home } from "lucide-react";

interface QuizCompletionProps {
  onReset: () => void;
  onBackToHome: () => void;
  userName: string;
}

const QuizCompletion: React.FC<QuizCompletionProps> = ({ onReset, onBackToHome, userName }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden animate-in fade-in zoom-in duration-500">
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 h-2 w-full" />
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Trophy className="w-20 h-20 text-yellow-500 animate-bounce" />
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-400 rounded-full animate-ping" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-ping" />
          </div>
        </div>
        <CardTitle className="text-3xl font-extrabold text-blue-700">恭喜你，{userName}！</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="space-y-2">
          <p className="text-xl font-medium text-gray-700">
            你已經成功挑戰了詞彙表中所有的單字！
          </p>
          <p className="text-muted-foreground">
            這是一個了不起的成就，你的詞彙量又更上一層樓了。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <Button 
            variant="outline" 
            onClick={onReset}
            className="flex items-center justify-center gap-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
          >
            <RefreshCw className="w-4 h-4" />
            重置進度並重新挑戰
          </Button>
          <Button 
            onClick={onBackToHome}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Home className="w-4 h-4" />
            回到主畫面
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizCompletion;
