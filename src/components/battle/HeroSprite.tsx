import { useMemo } from "react";

export type HeroPose = 'idle' | 'charge' | 'attack' | 'hurt' | 'victory' | 'down';

// 16×16 像素勇者（面向右）
// . 透明  P 羽飾  H 頭盔  h 頭盔陰影  K 皮膚  E 眼睛
// A 盔甲  a 盔甲陰影  C 披風  B 靴子  S 劍刃  G 劍柄
const FRAME_IDLE = [
  '......PP........',
  '.....HHHH......S',
  '....HHHHHH....SS',
  '....HKKEKH...SS.',
  '....hKKKKh..SS..',
  '....hhhhhh.SS...',
  '...CAAAAAAGG....',
  '..CCAAaaAAKG....',
  '..CCAAaaAA......',
  '..CCAAAAAA......',
  '..CCaaaaaa......',
  '...CAA..AA......',
  '....AA..AA......',
  '....aa..aa......',
  '...BBB..BBB.....',
  '................',
];

const FRAME_ATTACK = [
  '................',
  '.......PP.......',
  '......HHHH......',
  '.....HHHHHH.....',
  '.....HKKEKH.....',
  '.....hKKKKh.....',
  '....Chhhhhh.....',
  '...CCAAAAAAKG...',
  '..CCCAAaaAAGSSSS',
  '..CC.AAaaAA.....',
  '.CC..AAAAAA.....',
  '.C...aaaaaa.....',
  '.....AA...AA....',
  '....AA.....AA...',
  '...BBB.....BBB..',
  '................',
];

const FRAME_DOWN = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '......PP........',
  '.....HHHH.......',
  '....HKK-KHCC....',
  '....hhhhhAACC...',
  '...AAAAAAAAaCC..',
  '..BBaaaaaaaaBB..',
  '..........GSSSSS',
  '................',
];

const COLORS: Record<string, string> = {
  P: '#E8384A',
  H: '#C9D2E3',
  h: '#7A8499',
  K: '#F5C99B',
  E: '#111111',
  '-': '#111111',
  A: '#3A6FD8',
  a: '#22448F',
  C: '#C8302E',
  B: '#6B3F1D',
  S: '#EAF2FF',
  G: '#E8A838',
};

interface HeroSpriteProps {
  pose: HeroPose;
  /** 0–1 集氣量 */
  energy?: number;
  size?: number;
}

const HeroSprite: React.FC<HeroSpriteProps> = ({ pose, energy = 0, size = 96 }) => {
  const frame = pose === 'attack' ? FRAME_ATTACK : pose === 'down' ? FRAME_DOWN : FRAME_IDLE;

  const rects = useMemo(() => {
    const list: JSX.Element[] = [];
    frame.forEach((row, y) => {
      row.split('').forEach((c, x) => {
        if (c === '.') return;
        list.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={COLORS[c]} />);
      });
    });
    return list;
  }, [frame]);

  const poseClass =
    pose === 'attack'  ? 'hero-attack'  :
    pose === 'hurt'    ? 'hero-hurt'    :
    pose === 'victory' ? 'hero-victory' :
    pose === 'down'    ? ''             :
                         'hero-idle';

  const charged = pose === 'charge' || (pose === 'idle' && energy > 0);

  return (
    <div className={`relative ${poseClass}`} style={{ width: size, height: size }}>
      {/* 集氣光環 */}
      {charged && (
        <div
          className="absolute inset-0 hero-charge-aura"
          style={{
            opacity: 0.25 + energy * 0.75,
            transform: `scale(${0.8 + energy * 0.6})`,
            boxShadow: energy >= 1
              ? '0 0 24px 8px rgba(255,225,77,0.8), 0 0 48px 16px rgba(255,160,0,0.4)'
              : `0 0 ${10 + energy * 14}px ${energy * 6}px rgba(120,200,255,0.7)`,
          }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        className="image-rendering-pixelated relative"
        style={{ imageRendering: 'pixelated' }}
      >
        {rects}
      </svg>
      {/* 劍刃光芒（滿氣時） */}
      {charged && energy >= 1 && <div className="hero-sword-sparkle" />}
    </div>
  );
};

export default HeroSprite;

