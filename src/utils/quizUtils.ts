
import { VocabWord } from "@/types";

export const parseCSV = (csvString: string): VocabWord[] => {
  const lines = csvString.trim().split('\n');
  
  return lines.map((line, index) => {
    const [chinese, english] = line.split(',').map(item => item.trim());
    
    if (!chinese || !english) {
      console.error(`Invalid line in CSV: ${line}`);
      return null;
    }
    
    return {
      id: `word-${index}`,
      chinese,
      english
    };
  }).filter(Boolean) as VocabWord[];
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 取得或建立全域 AudioContext
let audioContext: AudioContext | null = null;
const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // 某些瀏覽器需要使用者互動才能解除 suspended 狀態
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

// 快取已解碼的 AudioBuffer
const audioBufferCache: Record<string, Promise<AudioBuffer>> = {};

// 內部共用的 fetch 與解碼邏輯
const fetchAndDecodeAudio = (word: string): Promise<AudioBuffer> => {
  if (!audioBufferCache[word]) {
    audioBufferCache[word] = (async () => {
      const baseUrl = import.meta.env.VITE_TTS_API_BASE_URL || "http://localhost:5000";
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      try {
        const response = await fetch(`${baseUrl}/api/v2/tts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: word,
            language_code: "en-US",
            voice_name: "en-US-Chirp3-HD-Sulafat",
            speed: 1.0,
            pitch: 0
          }),
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`TTS API error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.audioContent) {
          // 將 base64 字串轉為 Uint8Array (ArrayBuffer)
          const binaryString = window.atob(data.audioContent);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // 使用 AudioContext 解碼音訊資料
          const ctx = getAudioContext();
          const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
          return audioBuffer;
        } else {
          throw new Error("No audio content in TTS response");
        }
      } finally {
        clearTimeout(timeoutId);
      }
    })();
  }
  return audioBufferCache[word];
};

// 播放極短的無聲波形來喚醒硬體（解決藍牙耳機省電模式造成的開頭被吃掉問題）
const wakeUpAudioHardware = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  // 設定為無聲
  gainNode.gain.value = 0;
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  // 播放 0.05 秒的無聲
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.05);
};

export const preloadWord = (word: string): void => {
  // 點擊卡片時，順便播放無聲波形喚醒硬體
  wakeUpAudioHardware();
  
  // 只呼叫但不 await，讓它在背景預先下載並解碼存入 cache
  fetchAndDecodeAudio(word).catch(err => {
    console.error("Preload TTS failed:", err);
    delete audioBufferCache[word];
  });
};

export const speakWord = async (word: string): Promise<void> => {
  try {
    const buffer = await fetchAndDecodeAudio(word);
    
    const ctx = getAudioContext();
    // 必須 await resume 確保音訊硬體與瀏覽器音訊管線完全喚醒
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    // 每次播放都建立新的 source node
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    // 稍微延遲 0.1 秒播放，給藍牙耳機等硬體額外的緩衝時間開啟放大器
    source.start(ctx.currentTime + 0.1);
  } catch (error) {
    // 如果出錯，清除快取以便下次重試
    delete audioBufferCache[word];
    
    console.error("TTS failed, falling back to browser speech synthesis:", error);
    
    // Fallback to browser's SpeechSynthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported in this browser');
    }
  }
};

export const calculateScore = (
  answers: { wordId: string; answer: string; isCorrect: boolean }[]
): { correct: number; total: number; percentage: number } => {
  const correct = answers.filter(a => a.isCorrect).length;
  const total = answers.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  return { correct, total, percentage };
};

export const checkAnswer = (
  userAnswer: string, 
  correctAnswer: string
): boolean => {
  return userAnswer.trim() === correctAnswer.trim();
};
