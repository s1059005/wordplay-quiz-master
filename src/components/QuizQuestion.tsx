import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { QuizState } from "@/types";
import { speakWord, checkAnswer } from "@/utils/quizUtils";
import { Volume2 } from "lucide-react";
import BattleStage, { FlyingLetter } from "@/components/battle/BattleStage";
import { useBattleMachine, BattlePhase } from "@/hooks/useBattleMachine";
import { useSfx } from "@/hooks/useSfx";
import { generateWordSpirit } from "@/utils/WordSpiritGenerator";
import {
  BattleAnimMode,
  PLAYER_MAX_HP,
  getBattleTiming,
  getCurrentCombo,
  getPlayerHp,
  getSpiritElement,
  getSpiritMaxHp,
} from "@/utils/battleUtils";

interface QuizQuestionProps {
  quizState: QuizState;
  wordScores: Record<string, number>;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}

const ANIM_MODE_KEY = "wordplay-battle-anim";
const ANIM_MODE_LABEL: Record<BattleAnimMode, string> = {
  full: "完整",
  compact: "精簡",
  off: "關閉",
};

const loadAnimMode = (): BattleAnimMode => {
  const stored = localStorage.getItem(ANIM_MODE_KEY) as BattleAnimMode | null;
  if (stored === 'full' || stored === 'compact' || stored === 'off') return stored;
  // 未設定時，尊重系統「減少動態」偏好
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'off' : 'full';
};

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  quizState,
  wordScores,
  onAnswer,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isShowingResult, setIsShowingResult] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [animMode, setAnimMode] = useState<BattleAnimMode>(loadAnimMode);
  const [letters, setLetters] = useState<FlyingLetter[]>([]);
  const letterIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { phase, setPhase, run, skip, isRunning } = useBattleMachine();
  const sfx = useSfx();

  const currentWord = quizState.words[quizState.currentWordIndex];
  const progress = ((quizState.currentWordIndex) / quizState.questionCount) * 100;
  const timing = getBattleTiming(animMode);

  // ─── 戰鬥數值 ───
  const wordScore = currentWord ? (wordScores[currentWord.id] ?? -1) : -1;
  const spirit = useMemo(() => currentWord ? generateWordSpirit(currentWord.id) : null, [currentWord]);
  const element = spirit ? getSpiritElement(spirit.spiritName) : 'none';
  const spiritMaxHp = getSpiritMaxHp(wordScore);
  const damaged = isCorrect === true && (['hit', 'captured', 'retreat'] as BattlePhase[]).includes(phase);
  const spiritHp = damaged ? spiritMaxHp - 1 : spiritMaxHp;

  const prevCombo = getCurrentCombo(quizState.answers);
  const combo = isCorrect === true ? prevCombo + 1 : isCorrect === false ? 0 : prevCombo;

  const prevPlayerHp = getPlayerHp(quizState.answers);
  const playerHurt = isCorrect === false && (phase === 'counter' || phase === 'escaped');
  const playerHp = playerHurt ? Math.max(0, prevPlayerHp - 1) : prevPlayerHp;

  const energy = currentWord
    ? Math.min(1, inputValue.trim().length / Math.max(1, currentWord.english.length))
    : 0;

  // ─── 新題目：重置並播放登場 ───
  useEffect(() => {
    if (currentWord) {
      speakWord(currentWord.english);
    }

    setInputValue("");
    setIsCorrect(null);
    setIsShowingResult(false);
    setIsTransitioning(false);
    setLetters([]);

    run([{ phase: 'encounter', duration: timing.encounter }], () => setPhase('ready'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord, quizState.currentWordIndex]);

  // ─── 各階段音效 ───
  useEffect(() => {
    switch (phase) {
      case 'encounter': sfx.play('appear'); break;
      case 'attack':    sfx.play('slash'); break;
      case 'hit':       sfx.play(combo >= 3 ? 'critical' : 'hit'); break;
      case 'miss':      sfx.play('miss'); break;
      case 'counter':   sfx.play('hurt'); break;
      case 'captured':  sfx.play('capture'); break;
      case 'retreat':   sfx.play('retreat'); break;
      case 'escaped':   sfx.play('escape'); break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // 輸入框可用時自動聚焦
  useEffect(() => {
    if (!isShowingResult) {
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
  }, [isShowingResult]);

  const proceedToNext = useCallback((correct: boolean) => {
    onAnswer(inputValue.trim(), correct);
  }, [onAnswer, inputValue]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentWord) return;

    // 已判定：答錯畫面按 Enter → 下一題
    if (isShowingResult) {
      if (phase === 'escaped' && !isTransitioning) {
        setIsTransitioning(true);
        proceedToNext(false);
      } else if (isRunning) {
        // 演出中按 Enter → 跳過演出
        skip();
      }
      return;
    }

    if (isTransitioning) return;

    // 允許空白答案（視為答錯）
    const correct = checkAnswer(inputValue, currentWord.english);
    setIsCorrect(correct);
    setIsShowingResult(true);

    await speakWord(currentWord.english);

    if (correct) {
      setIsTransitioning(true);
      const finalPhase: BattlePhase = spiritMaxHp - 1 <= 0 ? 'captured' : 'retreat';
      run(
        [
          { phase: 'attack', duration: timing.attack },
          { phase: 'hit', duration: timing.hit },
          { phase: finalPhase, duration: timing[finalPhase] },
        ],
        () => proceedToNext(true)
      );
    } else {
      run(
        [
          { phase: 'attack', duration: timing.attack },
          { phase: 'miss', duration: timing.miss },
          { phase: 'counter', duration: timing.counter },
        ],
        () => setPhase('escaped')
      );
    }
  };

  // 輸入框停用時，Enter 由視窗層接手（跳過演出 / 下一題）
  const submitRef = useRef(handleSubmit);
  submitRef.current = handleSubmit;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat) return;
      if (!isShowingResult) return;
      if (e.target instanceof HTMLButtonElement) return; // 按鈕自身會觸發 onClick
      e.preventDefault();
      submitRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isShowingResult]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (next.length > inputValue.length) {
      const ch = next.slice(-1);
      sfx.play('type');
      if (animMode !== 'off' && ch.trim()) {
        const id = ++letterIdRef.current;
        setLetters(prev => [...prev.slice(-8), { id, ch, offset: Math.random() * 2 - 1 }]);
        window.setTimeout(() => setLetters(prev => prev.filter(l => l.id !== id)), 650);
      }
    }
    setInputValue(next);
  };

  const cycleAnimMode = () => {
    const order: BattleAnimMode[] = ['full', 'compact', 'off'];
    const next = order[(order.indexOf(animMode) + 1) % order.length];
    setAnimMode(next);
    localStorage.setItem(ANIM_MODE_KEY, next);
  };

  const playAudio = () => {
    if (currentWord) speakWord(currentWord.english);
  };

  if (!currentWord || !spirit) return null;

  const resultReady = isCorrect === true || phase === 'escaped';

  return (
    <div className="w-full max-w-xl mx-auto py-8">
      <div className="mb-6">
        <div className="flex justify-between mb-2 font-pixel text-[10px] text-primary">
          <span>Quest: {quizState.currentWordIndex + 1} / {quizState.questionCount}</span>
          <span>EXP: {Math.round(progress)}%</span>
        </div>
        <div className="retro-progress">
          <div className="retro-progress-inner" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <Card className="retro-border">
        <CardHeader className="pb-3 border-b-2 border-primary/30">
          <div className="flex justify-between items-center gap-2">
            <span className="font-pixel text-[10px] text-primary/80">翻譯任務: 國語 → 英語</span>
            <div className="flex items-center gap-1">
              <button
                onClick={cycleAnimMode}
                title="戰鬥動畫：完整 / 精簡 / 關閉"
                className="font-pixel text-[8px] px-2 py-1 border border-primary/50 text-primary hover:bg-primary/20"
              >
                動畫:{ANIM_MODE_LABEL[animMode]}
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={sfx.toggleMute}
                title={sfx.muted ? "開啟音效" : "關閉音效"}
                className="text-primary hover:bg-primary/20 text-base"
              >
                {sfx.muted ? "🔕" : "🔔"}
              </Button>
              <Button variant="ghost" size="icon" onClick={playAudio} title="聆聽神諭" className="text-primary hover:bg-primary/20">
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* 戰場 */}
            <BattleStage
              phase={phase}
              animMode={animMode}
              wordId={currentWord.id}
              wordScore={wordScore}
              spiritName={spirit.spiritName}
              spiritHp={spiritHp}
              spiritMaxHp={spiritMaxHp}
              element={element}
              playerHp={playerHp}
              playerMaxHp={PLAYER_MAX_HP}
              combo={combo}
              energy={energy}
              letters={letters}
            />

            <div className="text-center py-4 bg-black/40 border-2 border-primary/20 relative">
              <div className="absolute -top-3 left-4 bg-background px-2 font-pixel text-[8px] text-primary/60">TARGET</div>
              <h2 className="text-4xl font-vt323 text-primary tracking-widest">{currentWord.chinese}</h2>
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <div className="absolute -top-3 left-4 bg-background px-2 font-pixel text-[8px] text-primary/60">INPUT</div>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="輸入英文單字集氣..."
                className={`w-full retro-input text-center text-4xl py-4 ${
                  isCorrect === true
                    ? "border-green-500 text-green-400 bg-green-900/20"
                    : isCorrect === false
                    ? "border-red-500 text-red-400 bg-red-900/20"
                    : ""
                }`}
                autoComplete="off"
                disabled={isShowingResult}
              />
            </form>

            {isShowingResult && resultReady && (
              <div className="bg-black/60 p-4 border-2 border-dashed border-primary/40 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {isCorrect === false ? (
                  <div className="text-center">
                    <p className="font-pixel text-[10px] text-red-400 mb-2">判定失敗！正確咒語為：</p>
                    <p className="text-4xl font-vt323 text-green-400 cursor-blink tracking-widest">{currentWord.english}</p>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-2xl font-pixel text-green-400 animate-bounce">
                      {spiritMaxHp - 1 <= 0 ? "收服成功！" : "擊退！"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-6">
          <button
            onClick={() => handleSubmit()}
            className="w-full retro-button"
            disabled={isTransitioning && !isRunning}
          >
            {isShowingResult && isRunning
              ? "戰鬥中… [ENTER 跳過]"
              : phase === 'escaped'
              ? "下一場戰鬥 [NEXT]"
              : isTransitioning
              ? "傳送中..."
              : "發動攻擊 [ENTER]"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizQuestion;
