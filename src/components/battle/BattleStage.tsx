import WordSpiritAvatar, { SpiritAnimState } from "@/components/WordSpiritAvatar";
import HeroSprite, { HeroPose } from "@/components/battle/HeroSprite";
import { SpiritHpBar, PlayerHearts } from "@/components/battle/HpBar";
import { BattlePhase } from "@/hooks/useBattleMachine";
import { BattleAnimMode, BattleElement, ELEMENT_INFO } from "@/utils/battleUtils";

export interface FlyingLetter {
  id: number;
  ch: string;
  offset: number; // -1 ~ 1 隨機水平偏移
}

interface BattleStageProps {
  phase: BattlePhase;
  animMode: BattleAnimMode;
  wordId: string;
  wordScore: number;
  spiritName: string;
  spiritHp: number;
  spiritMaxHp: number;
  element: BattleElement;
  playerHp: number;
  playerMaxHp: number;
  combo: number;
  energy: number;
  letters: FlyingLetter[];
}

const spiritAnimFor = (phase: BattlePhase): SpiritAnimState => {
  switch (phase) {
    case 'encounter': return 'appear';
    case 'hit':       return 'hurt';
    case 'miss':      return 'dodge';
    case 'counter':   return 'attack';
    case 'captured':  return 'captured';
    case 'retreat':   return 'retreat';
    case 'escaped':   return 'escaped';
    default:          return 'idle';
  }
};

const heroPoseFor = (phase: BattlePhase, energy: number, playerHp: number): HeroPose => {
  switch (phase) {
    case 'attack':
    case 'hit':
    case 'miss':      return 'attack';
    case 'counter':   return 'hurt';
    case 'captured':
    case 'retreat':   return 'victory';
    case 'escaped':   return playerHp <= 0 ? 'down' : 'idle';
    default:          return energy > 0 ? 'charge' : 'idle';
  }
};

const BattleStage: React.FC<BattleStageProps> = ({
  phase, animMode, wordId, wordScore, spiritName,
  spiritHp, spiritMaxHp, element, playerHp, playerMaxHp,
  combo, energy, letters,
}) => {
  const el = ELEMENT_INFO[element];
  const heroPose = heroPoseFor(phase, energy, playerHp);
  const isCritical = combo >= 3;
  const isSpecial = combo >= 5;
  const fx = animMode !== 'off';

  // 位移類 class：衝刺 → 回位
  const heroMoveClass =
    phase === 'attack' ? 'hero-dash' :
    (phase === 'hit' || phase === 'miss') ? 'hero-return' : '';

  const shake = fx && ((phase === 'hit' && combo >= 2) || phase === 'counter');

  return (
    <div
      className={`battle-stage relative w-full h-[260px] overflow-hidden border-2 border-primary/40 select-none ${shake ? 'stage-shake' : ''}`}
      style={{ ['--spd' as string]: animMode === 'compact' ? 0.5 : 1 }}
    >
      {/* 背景：天空 + 遠山 + 地面 */}
      <div className="absolute inset-0 battle-sky" />
      <div className="absolute inset-x-0 bottom-[44px] h-16 battle-mountains" />
      <div className="absolute inset-x-0 bottom-0 h-[48px] battle-ground" />

      {/* HUD：勇者 */}
      <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
        <span className="font-pixel text-[9px] text-sky-300">詞彙勇者</span>
        <PlayerHearts hp={playerHp} maxHp={playerMaxHp} breaking={phase === 'counter'} />
        {combo >= 2 && phase !== 'counter' && phase !== 'escaped' && (
          <div key={combo} className="combo-pop font-pixel text-[10px] text-yellow-300 drop-shadow-[2px_2px_0_#000]">
            COMBO ×{combo}
          </div>
        )}
      </div>

      {/* HUD：詞靈 */}
      <div className="absolute top-2 right-2 z-20">
        <SpiritHpBar
          hp={spiritHp}
          maxHp={spiritMaxHp}
          name={spiritName}
          elementIcon={el.icon}
          elementLabel={el.label}
        />
      </div>

      {/* 勇者 */}
      <div className={`absolute left-[8%] bottom-[30px] z-10 ${heroMoveClass}`}>
        <HeroSprite pose={heroPose} energy={phase === 'ready' ? energy : 0} size={88} />
        {/* 能量條 */}
        <div className="mt-1 h-1.5 w-[88px] bg-black/70 border border-black">
          <div
            className={`h-full transition-all duration-150 ${energy >= 1 ? 'bg-yellow-300 energy-full' : 'bg-sky-400'}`}
            style={{ width: `${(phase === 'ready' ? energy : 0) * 100}%` }}
          />
        </div>
      </div>

      {/* 詞靈 */}
      <div className="absolute right-[8%] bottom-[34px] z-10 flex items-end justify-center min-w-[128px]">
        <WordSpiritAvatar
          wordId={wordId}
          wordScore={wordScore}
          animState={spiritAnimFor(phase)}
          showLabels={false}
        />
      </div>

      {/* 打字字母飛向勇者 */}
      {letters.map(l => (
        <span
          key={l.id}
          className="letter-fly font-vt323 text-2xl text-sky-200 z-30"
          style={{ ['--ox' as string]: `${l.offset * 40}px` }}
        >
          {l.ch}
        </span>
      ))}

      {/* 特效層（以 phase 為 key，切換時重新播放動畫） */}
      <div key={phase} className="absolute inset-0 pointer-events-none z-30">
        {phase === 'encounter' && (
          <div className="battle-banner text-primary">野生的 {spiritName} 出現了！</div>
        )}

        {fx && phase === 'hit' && (
          <>
            <div className={`fx-slash ${isCritical ? 'fx-slash-critical' : ''}`} />
            {combo >= 2 && <div className="fx-sparks">{'✦✧✦✧✦'.split('').map((s, i) => <span key={i} style={{ ['--i' as string]: i }}>{s}</span>)}</div>}
            {isCritical && <div className="fx-flash" />}
            <div className={`dmg-popup dmg-on-spirit ${isCritical ? 'text-yellow-300' : 'text-white'}`}>
              {isCritical ? 'CRITICAL! -1' : '-1'}
            </div>
            {isSpecial && <div className="battle-banner special-banner">必殺・詞彙斬！</div>}
          </>
        )}

        {fx && phase === 'miss' && (
          <>
            <div className="fx-slash fx-slash-miss" />
            <div className="dmg-popup dmg-on-spirit text-gray-300">MISS</div>
          </>
        )}

        {fx && phase === 'counter' && (
          <>
            <div className={`fx-projectile proj-${element}`}>{el.icon}</div>
            {element === 'thunder' && <div className="fx-flash fx-flash-late" />}
            {element === 'ice' && <div className="fx-freeze" />}
            <div className="dmg-popup dmg-on-hero text-red-400">-1 ❤</div>
          </>
        )}

        {phase === 'captured' && (
          <>
            {fx && <div className="fx-capture-orb" />}
            {fx && <div className="fx-burst">{'★☆★☆★☆★☆'.split('').map((s, i) => <span key={i} style={{ ['--i' as string]: i }}>{s}</span>)}</div>}
            <div className="battle-banner text-green-400">CAPTURED!</div>
          </>
        )}

        {phase === 'retreat' && (
          <div className="battle-banner text-orange-300">
            擊退！詞靈負傷撤退（剩 {spiritHp} HP）
          </div>
        )}

        {phase === 'escaped' && (
          <div className="battle-banner text-red-400 banner-stay">詞靈逃走了…</div>
        )}
      </div>
    </div>
  );
};

export default BattleStage;

