/**
 * WordSpiritGenerator — 詞靈生成器
 *
 * 基於 wordId 的 hash 確定性地生成像素動物屬性，
 * 保證同一個單字永遠對應同一隻動物。
 */

// ─── 型別定義 ─────────────────────────────────────────

export type SpiritSpecies =
  | 'cat' | 'dog' | 'rabbit' | 'bird'
  | 'fish' | 'snake' | 'dragon' | 'fox'
  | 'bear' | 'wolf' | 'deer' | 'owl';

export type SpiritExpression = 'calm' | 'fierce' | 'playful' | 'sleepy';

export interface WordSpirit {
  species: SpiritSpecies;
  primaryColor: string;
  secondaryColor: string;
  eyeStyle: number;        // 0–2
  expression: SpiritExpression;
  spiritName: string;      // 動態命名（例如「暗影狐」）
}

// ─── 常數池 ─────────────────────────────────────────

const SPECIES_LIST: SpiritSpecies[] = [
  'cat', 'dog', 'rabbit', 'bird',
  'fish', 'snake', 'dragon', 'fox',
  'bear', 'wolf', 'deer', 'owl',
];

const EXPRESSION_LIST: SpiritExpression[] = [
  'calm', 'fierce', 'playful', 'sleepy',
];

const PRIMARY_COLORS = [
  '#E8A838', '#38B6E8', '#E84838', '#38E888',
  '#B838E8', '#E8386A', '#38E8D0', '#E87838',
  '#7888E8', '#E8D038', '#88E838', '#E838C8',
];

const SECONDARY_COLORS = [
  '#C47830', '#2890B8', '#B83828', '#28B868',
  '#9028B8', '#B82850', '#28B8A0', '#B85828',
  '#5868B8', '#B8A028', '#68B828', '#B828A0',
];

const SPECIES_PREFIX: Record<SpiritSpecies, string[]> = {
  cat:    ['影', '月', '星', '雷'],
  dog:    ['烈', '忠', '風', '雷'],
  rabbit: ['月', '雪', '花', '銀'],
  bird:   ['翔', '風', '嵐', '雲'],
  fish:   ['潮', '淵', '波', '泉'],
  snake:  ['幽', '冥', '蟒', '翠'],
  dragon: ['炎', '雷', '冰', '光'],
  fox:    ['暗', '妖', '幻', '霧'],
  bear:   ['鐵', '岩', '雷', '蒼'],
  wolf:   ['蒼', '銀', '血', '嵐'],
  deer:   ['翠', '金', '霜', '靈'],
  owl:    ['夜', '叡', '幻', '闇'],
};

const SPECIES_NAME: Record<SpiritSpecies, string> = {
  cat: '貓', dog: '犬', rabbit: '兔', bird: '鳥',
  fish: '魚', snake: '蛇', dragon: '龍', fox: '狐',
  bear: '熊', wolf: '狼', deer: '鹿', owl: '鴞',
};

// ─── Hash 函式 ──────────────────────────────────────

/** 簡易確定性 hash（djb2 變體） */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ─── 公開 API ────────────────────────────────────────

/**
 * 根據 wordId 確定性地生成對應的詞靈資料。
 */
export function generateWordSpirit(wordId: string): WordSpirit {
  const h = hashString(wordId);

  const speciesIdx   = h % SPECIES_LIST.length;
  const colorIdx     = (h >>> 4) % PRIMARY_COLORS.length;
  const eyeStyle     = (h >>> 8) % 3;
  const exprIdx      = (h >>> 12) % EXPRESSION_LIST.length;
  const prefixIdx    = (h >>> 16) % 4;

  const species = SPECIES_LIST[speciesIdx];
  const prefix  = SPECIES_PREFIX[species][prefixIdx];
  const name    = SPECIES_NAME[species];

  return {
    species,
    primaryColor: PRIMARY_COLORS[colorIdx],
    secondaryColor: SECONDARY_COLORS[colorIdx],
    eyeStyle,
    expression: EXPRESSION_LIST[exprIdx],
    spiritName: `${prefix}${name}之靈`,
  };
}

/**
 * 根據 wordScore 計算詞靈等級（-1 → Lv1, -2 → Lv2, -3 → Lv3）
 */
export function getSpiritLevel(wordScore: number): 1 | 2 | 3 {
  if (wordScore <= -3) return 3;
  if (wordScore <= -2) return 2;
  return 1;
}

/**
 * 根據等級回傳像素尺寸
 */
export function getSpiritSize(level: 1 | 2 | 3): number {
  switch (level) {
    case 1: return 64;
    case 2: return 96;
    case 3: return 128;
  }
}
