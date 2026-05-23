import React, { useMemo } from 'react';
import { VocabWord } from '@/types';
import {
  generateWordSpirit,
  WordSpirit,
  SpiritSpecies,
} from '@/utils/WordSpiritGenerator';

// ─── 像素圖案（與 WordSpiritAvatar 共用同一份資料） ───
// 這裡只取物種名稱來呈現迷你版 SVG
// 為避免重複，我們直接 import patterns 的渲染方式

type PixelChar = '.' | 'P' | 'S' | 'E' | 'W';

// 迷你版：直接引用 WordSpiritAvatar 的 PATTERNS
// 但為了保持元件獨立性，這裡從 WordSpiritGenerator 取得 species
// 再用簡化的方式渲染

interface SpiritCodexCardProps {
  word: VocabWord;
  isCaptured: boolean;
  onClick?: () => void;
}

const SpiritCodexCard: React.FC<SpiritCodexCardProps> = ({
  word,
  isCaptured,
  onClick,
}) => {
  const spirit = useMemo(() => generateWordSpirit(word.id), [word.id]);

  // 生成 species emoji 映射（像素風的 emoji 替代方案）
  const speciesEmoji: Record<string, string> = {
    cat: '🐱', dog: '🐶', rabbit: '🐰', bird: '🐦',
    fish: '🐟', snake: '🐍', dragon: '🐲', fox: '🦊',
    bear: '🐻', wolf: '🐺', deer: '🦌', owl: '🦉',
    lion: '🦁', tiger: '🐯', leopard: '🐆', elephant: '🐘',
    monkey: '🐵', panda: '🐼', sheep: '🐑', cow: '🐄',
    horse: '🐴', pig: '🐷', frog: '🐸', turtle: '🐢',
    penguin: '🐧', mouse: '🐭', squirrel: '🐿️', bat: '🦇',
    spider: '🕷️', bee: '🐝', butterfly: '🦋', crab: '🦀',
    octopus: '🐙', shark: '🦈', whale: '🐳', dolphin: '🐬',
    eagle: '🦅', phoenix: '🔥', unicorn: '🦄', pegasus: '🪽',
    koala: '🐨', kangaroo: '🦘', duck: '🦆', chicken: '🐔',
    goat: '🐐', scorpion: '🦂', caterpillar: '🐛', lobster: '🦞',
    squid: '🦑', dinosaur: '🦕',
  };

  return (
    <div
      className={`codex-card ${isCaptured ? 'codex-card-unlocked' : 'codex-card-locked'}`}
      onClick={isCaptured ? onClick : undefined}
      title={isCaptured ? `${spirit.spiritName} — 點擊查看詳情` : '尚未收伏'}
    >
      {/* 序號標籤 */}
      <div className="absolute top-1 right-1 font-pixel text-[10px] text-primary/30">
        #{word.id.replace('word-', '')}
      </div>

      {/* 詞靈圖標 */}
      <div className="codex-spirit flex justify-center py-2">
        <div
          className="flex items-center justify-center rounded"
          style={{
            width: 48,
            height: 48,
            backgroundColor: isCaptured ? `${spirit.primaryColor}20` : 'rgba(255,255,255,0.03)',
            border: `2px solid ${isCaptured ? spirit.primaryColor + '40' : 'rgba(255,255,255,0.06)'}`,
          }}
        >
          <span className="text-2xl" role="img" aria-label={spirit.species}>
            {isCaptured
              ? (speciesEmoji[spirit.species] || '❓')
              : '❓'}
          </span>
        </div>
      </div>

      {/* 詞靈名稱 */}
      <div className="text-center mt-2">
        <p className={`font-pixel text-[16px] leading-relaxed ${
          isCaptured ? 'text-primary' : 'text-primary/20'
        }`}>
          {isCaptured ? spirit.spiritName : '？？？'}
        </p>
      </div>

      {/* 單字資訊 */}
      <div className="text-center mt-2">
        {isCaptured ? (
          <>
            <p className="font-vt323 text-xl text-green-400 leading-tight">
              {word.english}
            </p>
            <p className="font-vt323 text-lg text-primary/50 leading-tight">
              {word.chinese}
            </p>
          </>
        ) : (
          <>
            <p className="font-vt323 text-xl text-primary/15 leading-tight">
              ???
            </p>
            <p className="font-vt323 text-lg text-primary/10 leading-tight">
              ???
            </p>
          </>
        )}
      </div>

      {/* 收伏狀態指示器 */}
      <div className="mt-2 flex justify-center">
        {isCaptured ? (
          <span className="font-pixel text-[10px] text-green-500 bg-green-900/30 px-2 py-0.5 border border-green-500/30">
            ✓ 已收伏
          </span>
        ) : (
          <span className="font-pixel text-[10px] text-primary/20 bg-black/30 px-2 py-0.5 border border-primary/10">
            ✗ 未收伏
          </span>
        )}
      </div>
    </div>
  );
};

export default SpiritCodexCard;
