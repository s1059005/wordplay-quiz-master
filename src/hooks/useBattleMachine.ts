import { useCallback, useEffect, useRef, useState } from "react";

export type BattlePhase =
  | 'encounter'   // 詞靈登場
  | 'ready'       // 等待輸入（打字中即集氣）
  | 'attack'      // 勇者衝刺攻擊
  | 'hit'         // 命中
  | 'miss'        // 落空
  | 'counter'     // 詞靈反擊
  | 'captured'    // 收服
  | 'retreat'     // 詞靈負傷撤退（HP 未歸零）
  | 'escaped';    // 詞靈逃走（答錯後，等待使用者確認）

export interface TimelineStep {
  phase: BattlePhase;
  duration: number;
}

/**
 * 戰鬥狀態機：依時間軸依序切換階段，可隨時 skip 直接跳到結尾。
 */
export function useBattleMachine() {
  const [phase, setPhase] = useState<BattlePhase>('encounter');
  const timersRef = useRef<number[]>([]);
  const onDoneRef = useRef<(() => void) | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const clear = useCallback(() => {
    timersRef.current.forEach(t => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  const finish = useCallback(() => {
    clear();
    setIsRunning(false);
    const done = onDoneRef.current;
    onDoneRef.current = null;
    done?.();
  }, [clear]);

  const run = useCallback((steps: TimelineStep[], onDone?: () => void) => {
    clear();
    const active = steps.filter(s => s.duration > 0);
    onDoneRef.current = onDone ?? null;
    setIsRunning(true);

    let t = 0;
    active.forEach((step, i) => {
      if (i === 0) {
        setPhase(step.phase);
      } else {
        timersRef.current.push(window.setTimeout(() => setPhase(step.phase), t));
      }
      t += step.duration;
    });
    timersRef.current.push(window.setTimeout(finish, t));
  }, [clear, finish]);

  /** 跳過剩餘演出，立即執行結尾 callback */
  const skip = useCallback(() => {
    if (onDoneRef.current || timersRef.current.length > 0) finish();
  }, [finish]);

  useEffect(() => clear, [clear]);

  return { phase, setPhase, run, skip, isRunning };
}

