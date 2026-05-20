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
  | 'bear' | 'wolf' | 'deer' | 'owl'
  | 'lion' | 'tiger' | 'leopard' | 'elephant' | 'monkey'
  | 'panda' | 'sheep' | 'cow' | 'horse' | 'pig'
  | 'frog' | 'turtle' | 'penguin' | 'mouse' | 'squirrel'
  | 'bat' | 'spider' | 'bee' | 'butterfly' | 'crab'
  | 'octopus' | 'shark' | 'whale' | 'dolphin' | 'eagle'
  | 'phoenix' | 'unicorn' | 'pegasus' | 'koala' | 'kangaroo'
  | 'duck' | 'chicken' | 'goat' | 'scorpion' | 'caterpillar'
  | 'lobster' | 'squid' | 'dinosaur';

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
  'lion', 'tiger', 'leopard', 'elephant', 'monkey',
  'panda', 'sheep', 'cow', 'horse', 'pig',
  'frog', 'turtle', 'penguin', 'mouse', 'squirrel',
  'bat', 'spider', 'bee', 'butterfly', 'crab',
  'octopus', 'shark', 'whale', 'dolphin', 'eagle',
  'phoenix', 'unicorn', 'pegasus', 'koala', 'kangaroo',
  'duck', 'chicken', 'goat', 'scorpion', 'caterpillar',
  'lobster', 'squid', 'dinosaur',
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
  cat:         ['影', '月', '星', '雷'],
  dog:         ['烈', '忠', '風', '雷'],
  rabbit:      ['月', '雪', '花', '銀'],
  bird:        ['翔', '風', '嵐', '雲'],
  fish:        ['潮', '淵', '波', '泉'],
  snake:       ['幽', '冥', '蟒', '翠'],
  dragon:      ['炎', '雷', '冰', '光'],
  fox:         ['暗', '妖', '幻', '霧'],
  bear:        ['鐵', '岩', '雷', '蒼'],
  wolf:        ['蒼', '銀', '血', '嵐'],
  deer:        ['翠', '金', '霜', '靈'],
  owl:         ['夜', '叡', '幻', '闇'],
  lion:        ['霸', '狂', '金', '烈'],
  tiger:       ['猛', '雷', '風', '煞'],
  leopard:     ['影', '疾', '迅', '黑'],
  elephant:    ['巨', '磐', '泰', '尊'],
  monkey:      ['靈', '幻', '空', '捷'],
  panda:       ['竹', '萌', '憨', '玄'],
  sheep:       ['綿', '雪', '祥', '柔'],
  cow:         ['蠻', '撼', '重', '地'],
  horse:       ['騅', '烈', '赤', '奔'],
  pig:         ['饕', '胖', '豪', '福'],
  frog:        ['碧', '毒', '跳', '沼'],
  turtle:      ['玄', '岩', '壽', '冥'],
  penguin:     ['極', '冰', '凍', '寒'],
  mouse:       ['靈', '影', '竊', '金'],
  squirrel:    ['栗', '跳', '風', '森'],
  bat:         ['夜', '吸', '幽', '翼'],
  spider:      ['毒', '絲', '幽', '網'],
  bee:         ['黃', '刺', '勤', '毒'],
  butterfly:   ['幻', '彩', '花', '羽'],
  crab:        ['巨', '橫', '鉗', '甲'],
  octopus:     ['深', '墨', '纏', '淵'],
  shark:       ['狂', '噬', '深', '血'],
  whale:       ['巨', '鳴', '海', '瀚'],
  dolphin:     ['靈', '躍', '歌', '浪'],
  eagle:       ['蒼', '傲', '疾', '天'],
  phoenix:     ['涅', '炎', '凰', '朱'],
  unicorn:     ['聖', '幻', '純', '光'],
  pegasus:     ['羽', '翔', '空', '疾'],
  koala:       ['懶', '悠', '森', '眠'],
  kangaroo:    ['彈', '拳', '躍', '勁'],
  duck:        ['波', '游', '羽', '彩'],
  chicken:     ['晨', '羽', '斗', '鳴'],
  goat:        ['峭', '角', '風', '岩'],
  scorpion:    ['毒', '針', '沙', '影'],
  caterpillar: ['幻', '綠', '爬', '食'],
  lobster:     ['螯', '緋', '海', '甲'],
  squid:       ['噴', '影', '游', '槍'],
  dinosaur:    ['霸', '暴', '古', '岩'],
};

const SPECIES_NAME: Record<SpiritSpecies, string> = {
  cat: '貓', dog: '犬', rabbit: '兔', bird: '鳥',
  fish: '魚', snake: '蛇', dragon: '龍', fox: '狐',
  bear: '熊', wolf: '狼', deer: '鹿', owl: '鴞',
  lion: '獅', tiger: '虎', leopard: '豹', elephant: '象',
  monkey: '猴', panda: '熊貓', sheep: '羊', cow: '牛',
  horse: '馬', pig: '豬', frog: '蛙', turtle: '龜',
  penguin: '企鵝', mouse: '鼠', squirrel: '松鼠', bat: '蝠',
  spider: '蛛', bee: '蜂', butterfly: '蝶', crab: '蟹',
  octopus: '章魚', shark: '鯊', whale: '鯨', dolphin: '海豚',
  eagle: '鷹', phoenix: '鳳凰', unicorn: '獨角獸', pegasus: '天馬',
  koala: '無尾熊', kangaroo: '袋鼠', duck: '鴨', chicken: '雞',
  goat: '山羊', scorpion: '蠍', caterpillar: '毛蟲', lobster: '龍蝦',
  squid: '烏賊', dinosaur: '恐龍',
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
