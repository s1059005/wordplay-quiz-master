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
    <Card className="retro-border max-w-2xl mx-auto animate-in fade-in zoom-in duration-700">
      <div className="h-4 bg-primary border-b-2 border-primary/40 animate-pulse" />
      <CardHeader className="text-center pb-2 pt-8">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Trophy className="w-24 h-24 text-primary animate-bounce drop-shadow-[0_0_15px_rgba(240,165,0,0.6)]" />
            <div className="absolute -top-4 -left-4 font-pixel text-primary animate-ping text-[8px]">LEVEL UP!</div>
            <div className="absolute -bottom-4 -right-4 font-pixel text-primary animate-ping text-[8px]">LEGENDARY</div>
          </div>
        </div>
        <CardTitle className="text-3xl font-pixel text-primary drop-shadow-lg">
          傳說誕生，{userName}！
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-8 px-8 pb-10">
        <div className="space-y-4 py-6 bg-black/40 border-y-2 border-primary/10">
          <p className="text-2xl font-vt323 text-primary">
            「你已成功封印了卷軸中所有的詞靈！」
          </p>
          <p className="font-vt323 text-primary/60 text-lg">
            這是一個偉大的成就，你的英語造詣已達登峰造極之境。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={onReset}
            className="retro-button flex items-center justify-center gap-2 group"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            輪迴轉世 [RESET]
          </button>
          <button 
            onClick={onBackToHome}
            className="retro-button flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            歸返神殿 [HOME]
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizCompletion;
