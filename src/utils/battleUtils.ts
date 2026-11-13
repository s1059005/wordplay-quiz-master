/**
 * battleUtils — 詞靈戰鬥相關計算
 */

export type BattleElement = 'fire' | 'thunder' | 'ice' | 'water' | 'dark' | 'none';

export type BattleAnimMode = 'full' | 'compact' | 'off';

export const PLAYER_MAX_HP = 5;

const ELEMENT_PREFIXES: Record<Exclude<BattleElement, 'none'>, string[]> = {
  fire:    ['炎', '烈', '赤', '朱', '涅', '緋'],
  thunder: ['雷', '疾', '迅'],
  ice:     ['冰', '雪', '霜', '寒', '凍', '極'],
  water:   ['潮', '淵', '波', '海', '深', '泉', '浪', '瀚'],
  dark:    ['暗', '影', '幽', '冥', '闇', '夜', '黑', '墨'],
};

export const ELEMENT_INFO: Record<BattleElement, { label: string; icon: string; color: string }> = {
  fire:    { label: '火', icon: '🔥', color: '#FF7A1A' },
  thunder: { label: '雷', icon: '⚡', color: '#FFE14D' },
  ice:     { label: '冰', icon: '❄️', color: '#7FE3FF' },
  water:   { label: '水', icon: '💧', color: '#3A8DFF' },
  dark:    { label: '暗', icon: '🌑', color: '#B05CFF' },
  none:    { label: '無', icon: '✨', color: '#FFFFFF' },
};

/** 依詞靈名稱的第一個字（前綴）判定屬性 */
export function getSpiritElement(spiritName: string): BattleElement {
  const prefix = spiritName.charAt(0);
  for (const [el, list] of Object.entries(ELEMENT_PREFIXES)) {
    if (list.includes(prefix)) return el as BattleElement;
  }
  return 'none';
}

/** 詞靈最大 HP = |wordScore|（-1 → 1, -3 → 3） */
export function getSpiritMaxHp(wordScore: number): number {
  return Math.max(1, Math.min(3, -wordScore));
}

/** 目前連擊數：從最後一題往前數連續答對的題數 */
export function getCurrentCombo(answers: { isCorrect: boolean }[]): number {
  let combo = 0;
  for (let i = answers.length - 1; i >= 0; i--) {
    if (!answers[i].isCorrect) break;
    combo++;
  }
  return combo;
}

/** 整場最高連擊 */
export function getMaxCombo(answers: { isCorrect: boolean }[]): number {
  let max = 0;
  let cur = 0;
  for (const a of answers) {
    cur = a.isCorrect ? cur + 1 : 0;
    max = Math.max(max, cur);
  }
  return max;
}

/** 玩家剩餘 HP（不會 Game Over，僅影響評價） */
export function getPlayerHp(answers: { isCorrect: boolean }[]): number {
  const wrong = answers.filter(a => !a.isCorrect).length;
  return Math.max(0, PLAYER_MAX_HP - wrong);
}

/** 戰鬥評價 */
export function getBattleRank(percentage: number, hpLeft: number): 'S' | 'A' | 'B' | 'C' {
  if (percentage === 100) return 'S';
  if (percentage >= 80 && hpLeft > 0) return 'A';
  if (percentage >= 60) return 'B';
  return 'C';
}

/** 各階段時長（毫秒），完整模式 */
const FULL_TIMING = {
  encounter: 800,
  attack: 350,
  hit: 550,
  captured: 900,
  retreat: 800,
  miss: 400,
  counter: 750,
};

export type BattleTimingKey = keyof typeof FULL_TIMING;

export function getBattleTiming(mode: BattleAnimMode): Record<BattleTimingKey, number> {
  if (mode === 'full') return FULL_TIMING;
  if (mode === 'compact') {
    return Object.fromEntries(
      Object.entries(FULL_TIMING).map(([k, v]) => [k, Math.round(v * 0.5)])
    ) as Record<BattleTimingKey, number>;
  }
  // off：只保留最終結果動畫（與舊版行為相同）
  return {
    encounter: 600,
    attack: 0,
    hit: 0,
    captured: 1000,
    retreat: 1000,
    miss: 0,
    counter: 0,
  };
}

