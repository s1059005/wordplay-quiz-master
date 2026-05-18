import React, { useMemo } from 'react';
import {
  WordSpirit,
  SpiritSpecies,
  generateWordSpirit,
  getSpiritLevel,
  getSpiritSize,
} from '@/utils/WordSpiritGenerator';

// ─── 像素圖案定義 ───────────────────────────────────
// 每個圖案是 16×16 的字元矩陣
// P = primary, S = secondary, E = eye, W = white highlight, . = transparent

type PixelChar = '.' | 'P' | 'S' | 'E' | 'W';
type PixelGrid = PixelChar[][];

const PATTERNS: Record<SpiritSpecies, string[]> = {
  cat: [
    '....P...........',
    '...PP....PP.....',
    '..PPP....PPP....',
    '..PPPP..PPPP....',
    '..PPPPPPPPPP....',
    '..PEWPPPPWEP....',
    '..PPPPSSPPP.....',
    '..PPPSSSPPP.....',
    '...PPPPPPPP.....',
    '...PPPPPPPP.....',
    '...SSPPPPSS.....',
    '..SSPPPPPPSS....',
    '..SSPPPPPPSS....',
    '..SS..PP..SS....',
    '..SS..PP..SS....',
    '..SS......SS....',
  ],
  dog: [
    '....PPPP........',
    '..SSPPPPSS......',
    '..SSPPPPSS......',
    '...PPPPPPPP.....',
    '..PPPPPPPPPP....',
    '..PEWPPPPWEP....',
    '..PPPPPPPPPP....',
    '..PPPSSSPPP.....',
    '...PPSSPPP......',
    '...PPPPPPPP.....',
    '...SPPPPPPS.....',
    '..SSPPPPPPSS....',
    '..SSPPPPPPSS....',
    '...SS.PP.SS.....',
    '...SS.PP.SS.....',
    '...SS....SS.....',
  ],
  rabbit: [
    '....PP....PP....',
    '...PPP...PPP....',
    '...PPP...PPP....',
    '...PPP...PPP....',
    '...PPPPPPPP.....',
    '..PPPPPPPPPP....',
    '..PEWPPPPWEP....',
    '..PPPPPPPPPP....',
    '..PPPSSSPPP.....',
    '...PPPPPPPP.....',
    '...PPPPPPPP.....',
    '...SSPPPPSS.....',
    '..SSPPPPPPSS....',
    '..SS..PP..SS....',
    '..SS..PP..SS....',
    '..SSS....SSS....',
  ],
  bird: [
    '......PPP.......',
    '.....PPPPP......',
    '....PPPPPPP.....',
    '...PPPPPPPP.....',
    '...PEWPPPPP.....',
    '..PPPPPPPPSS....',
    '..PPPPPPPPPP....',
    '.PPPPPPPPPPP....',
    'PPPPPPPPPPPP....',
    '.PPPPPPPPPP.....',
    '..PPPPPPPP......',
    '...PPPPPP.......',
    '....PPPP........',
    '...SS..SS.......',
    '...SS..SS.......',
    '..SSS..SSS......',
  ],
  fish: [
    '................',
    '......PPP.......',
    '....PPPPPPP.....',
    '...PPPPPPPPPS...',
    '..PPPPPPPPPPSSS.',
    '..PEWPPPPPPP.SS.',
    '.PPPPPPPPPPPSS..',
    '.PPPPSPPPPPPSSS.',
    '.PPPPSSPPPPPSS..',
    '..PPPPPPPPPP....',
    '..PPPPPPPPPP....',
    '...PPPPPPPPS....',
    '....PPPPPPPSSS..',
    '.....PPPPP.SSS..',
    '......PPP.......',
    '................',
  ],
  snake: [
    '................',
    '......PPPP......',
    '.....PPPPPP.....',
    '....PPPPPPPP....',
    '...PEWPPWEP.....',
    '...PPPSSSPPP....',
    '...PPPPPPPPP....',
    '....PPPPPPP.....',
    '...PPPPPPP......',
    '..PPPPPPP.......',
    '.PPPPPPP........',
    '..PPPPPPP.......',
    '...PPPPPPP......',
    '....PPPPPPPP....',
    '.....PPPPPPP....',
    '......SSSSSS....',
  ],
  dragon: [
    '..WW........WW..',
    '..PPP......PPP..',
    '..PPPP....PPPP..',
    '...PPPPPPPPPP...',
    '..PPPPPPPPPPPP..',
    '..PEWPPPPPPWEP..',
    '..PPPPPPPPPPPP..',
    '..PPPPSSSSPPPP..',
    '...PPPPPPPPPP...',
    '..SSPPPPPPPPSS..',
    '..SSPPPPPPPPSS..',
    '.SSS.PPPPPP.SSS.',
    '.SS..PPPPPP..SS.',
    '.SS..SS..SS..SS.',
    '.SS..SS..SS..SS.',
    '.SS..SS..SS..SS.',
  ],
  fox: [
    '..PP........PP..',
    '..PPP......PPP..',
    '..SPPP....PPPS..',
    '..SSPPPPPPPPSS..',
    '...PPPPPPPPPP...',
    '..PPPPPPPPPPPP..',
    '..PEWPPPPPPWEP..',
    '..PPPPPPPPPPPP..',
    '..PPWPSSSPWPP...',
    '...WWPPPPPWW....',
    '...PPPPPPPPPP...',
    '..SSPPPPPPPPSS..',
    '..SS.PPPPPP.SS..',
    '..SS..PP.PP.SS..',
    '......PP.PP.....',
    '......SS.SS.....',
  ],
  bear: [
    '..PP........PP..',
    '.PPPP......PPPP.',
    '.PPPP......PPPP.',
    '..PPPPPPPPPPPP..',
    '..PPPPPPPPPPPP..',
    '..PEWPPPPPPWEP..',
    '..PPPPPPPPPPPP..',
    '..PPPSSSSSPPPP..',
    '...PPPPPPPPPP...',
    '..SSPPPPPPPPSS..',
    '..SSPPPPPPPPSS..',
    '..SSPPPPPPPPSS..',
    '..SS.PPPPPP.SS..',
    '..SS..PPPP..SS..',
    '..SS..PPPP..SS..',
    '.SSS..SSSS..SSS.',
  ],
  wolf: [
    '..PP........PP..',
    '..PPP......PPP..',
    '..PPPP....PPPP..',
    '...PPPPPPPPPP...',
    '..PPPPPPPPPPPP..',
    '..PEWPPPPPPWEP..',
    '..PPPPPPPPPPPP..',
    '..PPPPSSSPPPPP..',
    '..PPPSSSSSPPPP..',
    '...PPPPPPPPPP...',
    '...SSPPPPPPSS...',
    '..SSPPPPPPPPSS..',
    '..SS.PPPPPP.SS..',
    '..SS..PP.PP.SS..',
    '......PP.PP.....',
    '.....SSS.SSS....',
  ],
  deer: [
    '.WW..........WW.',
    '.WPW........WPW.',
    '.WWPW......WPWW.',
    '...PPP....PPP...',
    '...PPPPPPPPPP...',
    '..PPPPPPPPPPPP..',
    '..PEWPPPPPPWEP..',
    '..PPPPPPPPPPPP..',
    '..PPPPSSPPPPP...',
    '...PPPPPPPPPP...',
    '...SSPPPPPPSS...',
    '..SSPPPPPPPPSS..',
    '..SS.PPPPPP.SS..',
    '..SS..PP.PP.SS..',
    '......PP.PP.....',
    '.....SSS.SSS....',
  ],
  owl: [
    '....PPPPPPPP....',
    '...PPPPPPPPPP...',
    '..PPPPPPPPPPPP..',
    '.PWWPPPPPPPWWP..',
    '.PWEEPPPPPWEEP..',
    '.PWWPPPPPPPWWP..',
    '..PPPPPSPPPP....',
    '..PPPPSSPPPPP...',
    '...PPPPPPPPPP...',
    '...SSPPPPPPSS...',
    '..SSSPPPPPPSSS..',
    '..SS.PPPPPP.SS..',
    '..SS.PPPPPP.SS..',
    '.....PP..PP.....',
    '.....PP..PP.....',
    '....SSS..SSS....',
  ],
};

function parsePattern(species: SpiritSpecies): PixelGrid {
  return PATTERNS[species].map(
    row => row.split('') as PixelChar[]
  );
}

// ─── Props ────────────────────────────────────────────

export interface WordSpiritAvatarProps {
  wordId: string;
  wordScore: number;       // 用於決定等級 / 大小
  animState?: 'appear' | 'idle' | 'captured' | 'escaped';
}

// ─── 元件 ─────────────────────────────────────────────

const WordSpiritAvatar: React.FC<WordSpiritAvatarProps> = ({
  wordId,
  wordScore,
  animState = 'idle',
}) => {
  const spirit = useMemo(() => generateWordSpirit(wordId), [wordId]);
  const level  = useMemo(() => getSpiritLevel(wordScore), [wordScore]);
  const size   = useMemo(() => getSpiritSize(level), [level]);
  const grid   = useMemo(() => parsePattern(spirit.species), [spirit.species]);

  const GRID_SIZE = 16;
  const cellSize  = size / GRID_SIZE;

  const colorMap: Record<PixelChar, string> = {
    '.': 'transparent',
    'P': spirit.primaryColor,
    'S': spirit.secondaryColor,
    'E': level >= 3 ? '#FF2222' : '#111111',  // Lv3 → 紅眼
    'W': '#FFFFFF',
  };

  // 動畫 class
  const animClass =
    animState === 'appear'   ? 'spirit-appear'   :
    animState === 'captured' ? 'spirit-captured'  :
    animState === 'escaped'  ? 'spirit-escaped'   :
                               'spirit-idle';

  // 等級光暈
  const glowClass =
    level >= 3 ? 'spirit-glow-intense' :
    level >= 2 ? 'spirit-glow-mild'    :
                 '';

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 等級標示 */}
      <div className={`font-pixel text-[8px] tracking-wider ${
        level >= 3 ? 'text-red-400 animate-pulse' :
        level >= 2 ? 'text-orange-400' :
                     'text-primary/60'
      }`}>
        {level >= 3 ? '★★★ BERSERK' : level >= 2 ? '★★ EVOLVED' : '★ NORMAL'}
      </div>

      {/* 像素動物 SVG */}
      <div className={`${animClass} ${glowClass} relative`}>
        {level >= 2 && (
          <div className="absolute inset-0 spirit-aura" style={{
            boxShadow: level >= 3
              ? '0 0 20px rgba(255,34,34,0.6), 0 0 40px rgba(255,34,34,0.3)'
              : '0 0 12px rgba(232,168,56,0.4), 0 0 24px rgba(232,168,56,0.2)',
          }} />
        )}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
          className="image-rendering-pixelated"
          style={{ imageRendering: 'pixelated' }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => {
              if (cell === '.') return null;
              return (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width={1}
                  height={1}
                  fill={colorMap[cell]}
                />
              );
            })
          )}
        </svg>
      </div>

      {/* 詞靈名稱 */}
      <div className={`font-pixel text-[8px] tracking-widest ${
        level >= 3 ? 'text-red-400' :
        level >= 2 ? 'text-orange-300' :
                     'text-primary/80'
      }`}>
        {spirit.spiritName}
        {level >= 2 && <span className="ml-1 text-[6px] opacity-70">Lv.{level}</span>}
      </div>
    </div>
  );
};

export default WordSpiritAvatar;
