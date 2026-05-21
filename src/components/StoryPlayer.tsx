import React, { useState, useEffect, useRef } from "react";
import WordSpiritAvatar from "./WordSpiritAvatar";
import { Play, Pause, RotateCcw, X } from "lucide-react";

interface StoryPlayerProps {
  onClose: () => void;
  onAudioPlayStateChange: (isPlaying: boolean) => void;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({ onClose, onAudioPlayStateChange }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化音訊
  useEffect(() => {
    const audio = new Audio("/prologue.wav");
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onAudioPlayStateChange(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audioRef.current = null;
      // 確保元件卸載時背景音樂音量復原
      onAudioPlayStateChange(false);
    };
  }, [onAudioPlayStateChange]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onAudioPlayStateChange(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        onAudioPlayStateChange(true);
      }).catch((err) => {
        console.error("無法播放音訊，可能受限於瀏覽器政策：", err);
      });
    }
  };

  const restartPlay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        onAudioPlayStateChange(true);
      });
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    audioRef.current.currentTime = percentage * duration;
    setCurrentTime(percentage * duration);
  };

  // 格式化時間
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // 計算播放進度百分比
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 根據播放進度決定「詞靈妖怪」的暴走/縮小動畫狀態與文字
  let wordScore = -1; // 預設值 (NORMAL)
  let animState: "idle" | "appear" | "captured" | "escaped" = "idle";
  let statusText = "一隻調皮的詞靈小妖怪正在附近作怪！";
  let statusColor = "text-primary/80";

  if (isPlaying || currentTime > 0) {
    if (progressPercent < 20) {
      wordScore = -1; // NORMAL
      statusText = "小妖怪出現了！正在對你扮鬼臉呢！";
      statusColor = "text-primary";
    } else if (progressPercent >= 20 && progressPercent < 45) {
      wordScore = -2; // EVOLVED
      statusText = "小妖怪吸取了玩家拼錯咒語的能量，身體變大了一圈！";
      statusColor = "text-orange-400";
    } else if (progressPercent >= 45 && progressPercent < 75) {
      wordScore = -3; // BERSERK
      statusText = "糟了！小妖怪吸滿錯誤能量，眼睛變紅！進入暴走狀態！";
      statusColor = "text-red-500 font-bold animate-pulse";
    } else if (progressPercent >= 75 && progressPercent < 90) {
      wordScore = -2; // EVOLVED
      statusText = "小勇士冷靜下來唸對咒語！小妖怪被震懾，身體開始縮小！";
      statusColor = "text-yellow-400";
    } else {
      wordScore = 0; // NORMAL
      animState = "captured";
      statusText = "小妖怪被徹底封印，乖乖飛進了你的收妖寶典！";
      statusColor = "text-green-400 font-bold";
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-[420px] p-5 border-4 border-primary bg-black/90 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* 裝飾角 */}
      <div className="absolute top-1 left-1 w-2 h-2 bg-primary"></div>
      <div className="absolute top-1 right-1 w-2 h-2 bg-primary"></div>
      <div className="absolute bottom-1 left-1 w-2 h-2 bg-primary"></div>
      <div className="absolute bottom-1 right-1 w-2 h-2 bg-primary"></div>

      {/* 關閉按鈕 */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-primary/60 hover:text-primary transition-colors hover:scale-110"
        title="收回並恢復版面"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-4">
        {/* 左側：精靈視覺動態 */}
        <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center border-2 border-primary/30 bg-black/90 rounded p-1 relative">
          <div className="absolute top-1 left-1 text-[6px] font-pixel text-primary/30">SCANNING</div>
          <WordSpiritAvatar wordId="story_demon" wordScore={wordScore} animState={animState} />
        </div>

        {/* 右側：故事播放控制 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-pixel text-primary flex items-center gap-1.5">
              <span>📜</span> 詞靈降魔前導傳說
            </h3>
            <p className={`font-vt323 text-base mt-1 min-h-[40px] leading-tight break-words ${statusColor}`}>
              {statusText}
            </p>
          </div>

          {/* 控制列 */}
          <div className="mt-2 flex flex-col gap-2">
            {/* 進度條 */}
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[8px] text-primary/60 min-w-[28px]">
                {formatTime(currentTime)}
              </span>
              <div
                onClick={handleProgressBarClick}
                className="flex-1 h-3.5 bg-black/60 border-2 border-primary cursor-pointer relative"
              >
                <div
                  className="h-full bg-primary transition-all duration-100 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="font-pixel text-[8px] text-primary/60 min-w-[28px]">
                {formatTime(duration)}
              </span>
            </div>

            {/* 按鈕組 */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="retro-button px-3 py-1 flex items-center gap-1 text-[10px] font-pixel"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3" /> 暫停故事
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" /> 播放故事
                  </>
                )}
              </button>
              <button
                onClick={restartPlay}
                className="retro-button-secondary px-2.5 py-1 flex items-center gap-1 text-[10px] font-pixel border-2 border-muted-foreground hover:bg-muted/10 text-muted-foreground hover:text-white transition-colors"
                title="重新播放"
              >
                <RotateCcw className="w-3 h-3" /> 重播
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPlayer;
