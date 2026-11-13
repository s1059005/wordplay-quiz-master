interface SpiritHpBarProps {
  hp: number;
  maxHp: number;
  name: string;
  elementIcon: string;
  elementLabel: string;
}

/** 詞靈 HP 條（分格） */
export const SpiritHpBar: React.FC<SpiritHpBarProps> = ({ hp, maxHp, name, elementIcon, elementLabel }) => (
  <div className="flex flex-col items-end gap-1">
    <div className="font-pixel text-[9px] text-primary/90 flex items-center gap-1">
      <span title={`${elementLabel}屬性`}>{elementIcon}</span>
      <span>{name}</span>
    </div>
    <div className="flex items-center gap-1">
      <span className="font-pixel text-[8px] text-red-400">HP</span>
      <div className="flex gap-0.5 border-2 border-black bg-black/70 p-0.5">
        {Array.from({ length: maxHp }).map((_, i) => (
          <div
            key={i}
            className={`w-6 h-2.5 transition-all duration-300 ${
              i < hp ? 'bg-gradient-to-b from-red-400 to-red-700' : 'bg-gray-800 hp-cell-lost'
            }`}
          />
        ))}
      </div>
    </div>
  </div>
);

interface PlayerHeartsProps {
  hp: number;
  maxHp: number;
  /** 正在扣血的那一格（播放破碎動畫） */
  breaking?: boolean;
}

/** 玩家心形 HP */
export const PlayerHearts: React.FC<PlayerHeartsProps> = ({ hp, maxHp, breaking }) => (
  <div className="flex gap-0.5 text-sm leading-none" title={`HP ${hp}/${maxHp}`}>
    {Array.from({ length: maxHp }).map((_, i) => {
      const alive = i < hp;
      const isBreaking = breaking && i === hp;
      return (
        <span
          key={i}
          className={isBreaking ? 'heart-break' : ''}
          style={{ filter: alive || isBreaking ? 'none' : 'grayscale(1) opacity(0.35)' }}
        >
          ❤️
        </span>
      );
    })}
  </div>
);

