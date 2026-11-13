import { useCallback, useRef, useState } from "react";

const SFX_MUTED_KEY = "wordplay-sfx-muted";

export type SfxName =
  | 'type' | 'appear' | 'slash' | 'hit' | 'critical'
  | 'miss' | 'hurt' | 'capture' | 'retreat' | 'escape';

/**
 * 8-bit 音效 Hook：使用 Web Audio API 即時合成，不需要音檔。
 */
export function useSfx() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState<boolean>(() => localStorage.getItem(SFX_MUTED_KEY) === "true");
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const getCtx = () => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      ctxRef.current = new Ctx();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume().catch(() => {});
    return ctxRef.current;
  };

  /** 單音：頻率可滑動 */
  const tone = (
    ctx: AudioContext,
    { type = 'square', from, to = from, start = 0, dur, vol = 0.08 }:
    { type?: OscillatorType; from: number; to?: number; start?: number; dur: number; vol?: number }
  ) => {
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  };

  /** 白噪音（斬擊、爆炸） */
  const noise = (ctx: AudioContext, { start = 0, dur, vol = 0.08, freq = 2000 }: { start?: number; dur: number; vol?: number; freq?: number }) => {
    const t0 = ctx.currentTime + start;
    const len = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, t0);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(t0);
    src.stop(t0 + dur);
  };

  const play = useCallback((name: SfxName) => {
    if (mutedRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    switch (name) {
      case 'type':
        tone(ctx, { from: 880 + Math.random() * 220, dur: 0.04, vol: 0.03 });
        break;
      case 'appear':
        tone(ctx, { from: 220, to: 660, dur: 0.25, vol: 0.05, type: 'triangle' });
        break;
      case 'slash':
        noise(ctx, { dur: 0.18, vol: 0.12, freq: 3000 });
        tone(ctx, { from: 1200, to: 300, dur: 0.15, vol: 0.04, type: 'sawtooth' });
        break;
      case 'hit':
        tone(ctx, { from: 400, to: 80, dur: 0.2, vol: 0.1 });
        noise(ctx, { dur: 0.12, vol: 0.1, freq: 800 });
        break;
      case 'critical':
        tone(ctx, { from: 600, to: 60, dur: 0.3, vol: 0.12 });
        noise(ctx, { dur: 0.25, vol: 0.14, freq: 600 });
        tone(ctx, { from: 1320, dur: 0.08, start: 0.05, vol: 0.05 });
        break;
      case 'miss':
        noise(ctx, { dur: 0.25, vol: 0.05, freq: 5000 });
        break;
      case 'hurt':
        tone(ctx, { from: 300, to: 60, dur: 0.35, vol: 0.1, type: 'sawtooth' });
        noise(ctx, { dur: 0.2, vol: 0.08, freq: 400 });
        break;
      case 'capture':
        [523, 659, 784, 1047].forEach((f, i) =>
          tone(ctx, { from: f, dur: 0.12, start: i * 0.08, vol: 0.06 })
        );
        break;
      case 'retreat':
        tone(ctx, { from: 660, to: 440, dur: 0.15, vol: 0.05 });
        tone(ctx, { from: 520, to: 330, dur: 0.15, start: 0.12, vol: 0.05 });
        break;
      case 'escape':
        tone(ctx, { from: 440, to: 1200, dur: 0.3, vol: 0.05, type: 'triangle' });
        break;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      localStorage.setItem(SFX_MUTED_KEY, String(next));
      return next;
    });
  }, []);

  return { play, muted, toggleMute };
}

