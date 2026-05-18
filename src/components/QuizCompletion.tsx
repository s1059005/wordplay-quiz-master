import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, RefreshCw, Home, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface QuizCompletionProps {
  onReset: () => void;
  onBackToHome: () => void;
  userName: string;
  completionMessage?: string;
}

const QuizCompletion: React.FC<QuizCompletionProps> = ({ onReset, onBackToHome, userName, completionMessage }) => {
  useEffect(() => {
    // 觸發慶祝特效 (火花 / 碎紙花)
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f0a500', '#ff0000', '#00ff00', '#0000ff', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f0a500', '#ff0000', '#00ff00', '#0000ff', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

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
        <div className="space-y-4 py-6 bg-black/40 border-y-2 border-primary/10 relative overflow-hidden">
          {/* 加入一些背景閃光特效 */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 animate-[pulse_2s_ease-in-out_infinite]"></div>
          
          <p className="text-2xl font-vt323 text-primary relative z-10">
            「你已成功封印了卷軸中所有的詞靈！」
          </p>
          <p className="font-vt323 text-primary/60 text-lg relative z-10">
            這是一個偉大的成就，你的英語造詣已達登峰造極之境。
          </p>

          {completionMessage && (
            <div className="mt-6 pt-6 border-t border-primary/20 relative z-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                <span className="font-pixel text-[10px] text-yellow-400">MESSAGE RECEIVED</span>
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-4xl md:text-5xl font-vt323 text-yellow-400 leading-relaxed drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse">
                {completionMessage}
              </p>
            </div>
          )}
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
