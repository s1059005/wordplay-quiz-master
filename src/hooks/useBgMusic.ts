import { useEffect, useRef, useCallback, useState } from "react";

const BGM_MUTED_KEY = "wordplay-bgm-muted";

/**
 * 背景音樂 Hook
 * - 管理一個全域 Audio 實例，循環播放背景音樂
 * - 提供 play / stop / toggleMute 方法
 * - muted 狀態持久化至 localStorage
 * - 元件卸載時自動清理
 */
export function useBgMusic(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState<boolean>(() => {
    return localStorage.getItem(BGM_MUTED_KEY) === "true";
  });

  // 初始化 Audio 實例（只建立一次）
  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [src]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || muted) return;

    // 瀏覽器 autoplay 政策：需要使用者互動後才能播放
    audio.play().catch(() => {
      const resumeOnInteraction = () => {
        if (!audioRef.current) return;
        audioRef.current.play().catch(() => {});
        document.removeEventListener("click", resumeOnInteraction);
        document.removeEventListener("keydown", resumeOnInteraction);
      };
      document.addEventListener("click", resumeOnInteraction, { once: true });
      document.addEventListener("keydown", resumeOnInteraction, { once: true });
    });
  }, [muted]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(BGM_MUTED_KEY, String(next));

      const audio = audioRef.current;
      if (audio) {
        if (next) {
          // 靜音：立即暫停
          audio.pause();
        }
        // 取消靜音時不在這裡播放，由外部 useEffect 決定是否該播放
      }

      return next;
    });
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
    }
  }, []);

  return { play, stop, muted, toggleMute, setVolume };
}

