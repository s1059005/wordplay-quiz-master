import React, { useState, useMemo } from 'react';
import { VocabWord } from '@/types';
import { generateWordSpirit } from '@/utils/WordSpiritGenerator';
import { speakWord, preloadWord } from '@/utils/quizUtils';
import SpiritCodexCard from '@/components/SpiritCodexCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Volume2 } from 'lucide-react';

// ─── 篩選類型 ─────────────────────────────────────────
type FilterType = 'all' | 'captured' | 'uncaptured';

// ─── Props ────────────────────────────────────────────
interface SpiritCodexProps {
  words: VocabWord[];
  wordScores: Record<string, number>;
}

// ─── 物種 Emoji 映射 ─────────────────────────────────
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

// ─── 元件 ─────────────────────────────────────────────
const SpiritCodex: React.FC<SpiritCodexProps> = ({ words, wordScores }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);

  // 計算收伏統計
  const stats = useMemo(() => {
    const total = words.length;
    const captured = words.filter(w => (wordScores[w.id] ?? -1) >= 0).length;
    return { total, captured, uncaptured: total - captured };
  }, [words, wordScores]);

  // 篩選詞靈
  const filteredWords = useMemo(() => {
    switch (filter) {
      case 'captured':
        return words.filter(w => (wordScores[w.id] ?? -1) >= 0);
      case 'uncaptured':
        return words.filter(w => (wordScores[w.id] ?? -1) < 0);
      default:
        return words;
    }
  }, [words, wordScores, filter]);

  const isCaptured = (word: VocabWord) => (wordScores[word.id] ?? -1) >= 0;

  const selectedSpirit = useMemo(
    () => selectedWord ? generateWordSpirit(selectedWord.id) : null,
    [selectedWord]
  );

  const handlePlayAudio = () => {
    if (selectedWord) {
      speakWord(selectedWord.english);
    }
  };

  // 空狀態
  if (words.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">📖</div>
        <p className="font-pixel text-primary text-sm mb-2">
          圖鑑尚無資料 [EMPTY CODEX]
        </p>
        <p className="font-vt323 text-primary/50 text-lg">
          請先上傳單字卷軸以召喚詞靈
        </p>
      </div>
    );
  }

  const progressPercent = stats.total > 0 ? (stats.captured / stats.total) * 100 : 0;
  const isAllCaptured = stats.captured === stats.total && stats.total > 0;

  return (
    <div className="w-full py-6">
      {/* 標題與統計 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-pixel text-primary drop-shadow-md mb-2">
          📖 詞靈圖鑑 [SPIRIT CODEX]
        </h2>
        <p className="font-vt323 text-primary/60 text-xl">
          {isAllCaptured
            ? '🎉 恭喜！所有詞靈皆已收伏！'
            : '探索並收伏所有的詞靈吧！'}
        </p>
      </div>

      {/* 進度條 */}
      <div className="max-w-md mx-auto mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 retro-progress">
            <div
              className="retro-progress-inner"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className={`text-sm font-pixel min-w-[100px] text-right ${
            isAllCaptured ? 'text-green-400' : 'text-primary'
          }`}>
            {stats.captured}/{stats.total}
          </span>
        </div>
        <p className="text-center font-vt323 text-primary/40 text-base mt-1">
          收伏率 {Math.round(progressPercent)}%
        </p>
      </div>

      {/* 篩選器 */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          className={`codex-filter-btn ${filter === 'all' ? 'codex-filter-btn-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部 ({stats.total})
        </button>
        <button
          className={`codex-filter-btn ${filter === 'captured' ? 'codex-filter-btn-active' : ''}`}
          onClick={() => setFilter('captured')}
        >
          已收伏 ({stats.captured})
        </button>
        <button
          className={`codex-filter-btn ${filter === 'uncaptured' ? 'codex-filter-btn-active' : ''}`}
          onClick={() => setFilter('uncaptured')}
        >
          未收伏 ({stats.uncaptured})
        </button>
      </div>

      {/* 詞靈卡片 grid */}
      {filteredWords.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-vt323 text-primary/40 text-xl">
            {filter === 'captured' ? '尚未收伏任何詞靈' : '所有詞靈皆已收伏！'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredWords.map(word => (
            <SpiritCodexCard
              key={word.id}
              word={word}
              isCaptured={isCaptured(word)}
              onClick={() => {
                setSelectedWord(word);
                preloadWord(word.english);
              }}
            />
          ))}
        </div>
      )}

      {/* 詳情 Dialog */}
      <Dialog open={!!selectedWord} onOpenChange={(open) => !open && setSelectedWord(null)}>
        <DialogContent className="border-2 border-primary bg-background max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-pixel text-primary text-center text-sm">
              詞靈詳情 [SPIRIT INFO]
            </DialogTitle>
            <DialogDescription className="sr-only">
              詞靈的詳細資訊
            </DialogDescription>
          </DialogHeader>

          {selectedWord && selectedSpirit && (
            <div className="space-y-4 mt-2">
              {/* 詞靈大圖 */}
              <div className="flex justify-center">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 96,
                    height: 96,
                    backgroundColor: `${selectedSpirit.primaryColor}15`,
                    border: `3px solid ${selectedSpirit.primaryColor}60`,
                    boxShadow: `0 0 20px ${selectedSpirit.primaryColor}20`,
                  }}
                >
                  <span className="text-5xl" role="img" aria-label={selectedSpirit.species}>
                    {speciesEmoji[selectedSpirit.species] || '❓'}
                  </span>
                </div>
              </div>

              {/* 詞靈名稱 */}
              <div className="text-center">
                <p className="font-pixel text-primary text-sm tracking-widest">
                  {selectedSpirit.spiritName}
                </p>
                <p className="font-vt323 text-primary/40 text-sm mt-1">
                  {selectedSpirit.species.toUpperCase()} 系
                </p>
              </div>

              {/* 屬性資訊 */}
              <div className="bg-black/40 border border-primary/20 p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-pixel text-[7px] text-primary/60">主色</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 border border-primary/30"
                      style={{ backgroundColor: selectedSpirit.primaryColor }}
                    />
                    <span className="font-vt323 text-primary/80 text-sm">
                      {selectedSpirit.primaryColor}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-pixel text-[7px] text-primary/60">性格</span>
                  <span className="font-vt323 text-primary/80 text-sm uppercase">
                    {selectedSpirit.expression}
                  </span>
                </div>
              </div>

              {/* 對應單字 */}
              <div className="bg-black/60 border border-primary/30 p-4 text-center">
                <p className="font-pixel text-[7px] text-primary/50 mb-2">封印之詞</p>
                <p className="font-vt323 text-3xl text-green-400 tracking-widest">
                  {selectedWord.english}
                </p>
                <p className="font-vt323 text-lg text-primary/60 mt-1">
                  {selectedWord.chinese}
                </p>
              </div>

              {/* 語音播放按鈕 */}
              <button
                onClick={handlePlayAudio}
                className="w-full retro-button flex items-center justify-center gap-2 py-3"
              >
                <Volume2 className="w-4 h-4" />
                播放 [PLAY]
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpiritCodex;
