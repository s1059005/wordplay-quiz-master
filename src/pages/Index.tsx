
import { useState, useEffect } from "react";
import { useBgMusic } from "@/hooks/useBgMusic";
import FileUploader from "@/components/FileUploader";
import QuizSettings from "@/components/QuizSettings";
import QuizQuestion from "@/components/QuizQuestion";
import QuizResult from "@/components/QuizResult";
import QuizHistory from "@/components/QuizHistory";
import QuizCompletion from "@/components/QuizCompletion";
import UserSelector from "@/components/UserSelector";
import { VocabWord, QuizState, QuizSettings as QuizSettingsType, User, QuizResult as QuizResultType } from "@/types";
import { calculateScore } from "@/utils/quizUtils";
import { v4 as uuidv4 } from "uuid";
import { Progress } from "@/components/ui/progress";
import StoryPlayer from "@/components/StoryPlayer";
import SpiritCodex from "@/components/SpiritCodex";


// Local storage key for users
const USERS_STORAGE_KEY = "wordplay-quiz-users";

const Index = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showStoryPlayer, setShowStoryPlayer] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'home' | 'codex'>('home');
  const [dismissedCompletion, setDismissedCompletion] = useState<boolean>(false);


  // 背景音樂控制
  const { play: playBgm, stop: stopBgm, muted: bgmMuted, toggleMute: toggleBgm, setVolume: setBgmVolume } = useBgMusic("/bgm.mp3");

  const handleStoryPlayStateChange = (isStoryPlaying: boolean) => {
    if (isStoryPlaying) {
      setBgmVolume(0.05); // 故事播放時降低背景音樂音量
    } else {
      setBgmVolume(0.35); // 暫停或結束時恢復背景音樂音量
    }
  };


  // 首頁時播放音樂，測試中 / 查看結果時停止；muted 改變時也重新判斷
  useEffect(() => {
    const isHomePage = !quizState && !showHistory && activeTab === 'home';
    if (isHomePage) {
      playBgm();
    } else {
      stopBgm();
    }
  }, [quizState, showHistory, activeTab, playBgm, stopBgm, bgmMuted]);

  // Initialize users from local storage
  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);

        // Ensure each user has a quizHistory and wordScores (for backward compatibility)
        const updatedUsers = parsedUsers.map((user: User) => {
          // Migrate old passedWordIds to wordScores
          let wordScores = user.wordScores || {};
          if (!user.wordScores && user.passedWordIds && user.passedWordIds.length > 0) {
            wordScores = {};
            user.passedWordIds.forEach((id: string) => {
              wordScores[id] = 0; // 已通過的給 0 分
            });
          }
          return {
            ...user,
            quizHistory: user.quizHistory || [],
            wordScores
          };
        });

        setUsers(updatedUsers);

        // Auto-select first user if available
        if (updatedUsers.length > 0 && !selectedUserId) {
          setSelectedUserId(updatedUsers[0].id);
        }
      } catch (error) {
        console.error("Error parsing stored users:", error);
      }
    }
  }, []);

  // Save users to local storage whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }, [users]);

  const handleAddUser = (name: string) => {
    const newUser: User = {
      id: uuidv4(),
      name,
      words: [],
      quizHistory: [],
      wordScores: {}
    };

    setUsers(prev => [...prev, newUser]);
    setSelectedUserId(newUser.id);
    setQuizState(null);
    setShowHistory(false);
    setDismissedCompletion(false);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));

    if (selectedUserId === userId) {
      setSelectedUserId(null);
      setQuizState(null);
      setShowHistory(false);
      setDismissedCompletion(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setQuizState(null);
    setShowHistory(false);
    setShowStoryPlayer(false); // 切換使用者時關閉播放器
    setActiveTab('home');      // 切換使用者時回到首頁
    setDismissedCompletion(false);
  };


  const handleWordsLoaded = (loadedWords: VocabWord[], fileName: string) => {
    if (!selectedUserId) return;

    // Update the selected user's words and file information,
    // and clear wordScores so old quiz progress is removed from localStorage
    setUsers(prev => {
      const updatedUsers = prev.map(user => {
        if (user.id === selectedUserId) {
          return {
            ...user,
            words: loadedWords,
            wordScores: {}, // 清除舊題庫的學習進度
            lastFileUpload: {
              fileName,
              uploadDate: new Date().toISOString()
            }
          };
        }
        return user;
      });
      // 立即寫入 localStorage，確保舊進度資料完全清除
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      return updatedUsers;
    });

    // Reset quiz state when new words are loaded
    setQuizState(null);
    setShowHistory(false);
    setDismissedCompletion(false);
  };

  const handleUpdateCompletionMessage = (message: string) => {
    if (!selectedUserId) return;
    setUsers(prev => {
      const updatedUsers = prev.map(user => {
        if (user.id === selectedUserId) {
          return {
            ...user,
            completionMessage: message
          };
        }
        return user;
      });
      // 立即寫入 localStorage 確保資料不遺失
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  const handleStartQuiz = (settings: QuizSettingsType, selectedWords: VocabWord[]) => {
    setQuizState({
      words: selectedWords,
      currentWordIndex: 0,
      questionCount: settings.questionCount,
      answers: [],
      isComplete: false
    });
    setShowHistory(false);
  };

  const handleAnswer = (answer: string, isCorrect: boolean) => {
    if (!quizState) return;

    const currentWord = quizState.words[quizState.currentWordIndex];

    setQuizState(prev => {
      if (!prev) return null;

      // Add the answer to the list
      const updatedAnswers = [
        ...prev.answers,
        {
          wordId: currentWord.id,
          answer,
          isCorrect
        }
      ];

      const isLastQuestion = prev.currentWordIndex >= prev.questionCount - 1;

      // Move to the next word or mark complete
      const updatedState = {
        ...prev,
        currentWordIndex: isLastQuestion ? prev.currentWordIndex : prev.currentWordIndex + 1,
        answers: updatedAnswers,
        isComplete: isLastQuestion ? true : prev.isComplete
      };

      // Update word score: correct +1, incorrect -1
      if (selectedUserId) {
        setUsers(prevUsers => prevUsers.map(user => {
          if (user.id === selectedUserId) {
            const currentScore = user.wordScores[currentWord.id] ?? -1;
            // 答錯時扣分(增加需答對次數)，限制最多只扣到 -3 (即原先的 1 次加上最多增加 of 2 次)
            const newScore = isCorrect ? currentScore + 1 : Math.max(-3, currentScore - 1);
            return {
              ...user,
              wordScores: {
                ...user.wordScores,
                [currentWord.id]: newScore
              }
            };
          }
          return user;
        }));
      }

      return updatedState;
    });
  };

  const handleRestartQuiz = () => {
    // Save the quiz result before restarting
    if (quizState?.isComplete && selectedUserId) {
      const score = calculateScore(quizState.answers);

      // Create a new quiz result entry
      const quizResult: QuizResultType = {
        date: new Date().toISOString(),
        score,
        fileName: users.find(u => u.id === selectedUserId)?.lastFileUpload?.fileName
      };

      // Add the quiz result to the user's history and save to localStorage
      setUsers(prev => {
        const updatedUsers = prev.map(user => {
          if (user.id === selectedUserId) {
            const updatedUser = {
              ...user,
              quizHistory: [...(user.quizHistory || []), quizResult]
            };
            return updatedUser;
          }
          return user;
        });

        // Immediately update localStorage with the new quiz history
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

        return updatedUsers;
      });
    }

    setQuizState(null);
    setShowHistory(false);
  };

  const handleToggleHistory = () => {
    setShowHistory(prev => !prev);
    if (quizState) {
      setQuizState(null);
    }
    setShowStoryPlayer(false); // 查看歷史紀錄時關閉播放器
  };


  const handleResetProgress = () => {
    if (!selectedUserId) return;

    setUsers(prev => prev.map(user => {
      if (user.id === selectedUserId) {
        return {
          ...user,
          wordScores: {}
        };
      }
      return user;
    }));
    setDismissedCompletion(false);
  };

  // Get the selected user's words
  const selectedUser = users.find(user => user.id === selectedUserId);

  // Filter out already passed words (score >= 0 means passed)
  const availableWords = selectedUser?.words.filter(
    word => (selectedUser.wordScores[word.id] ?? -1) < 0
  ) || [];

  // Count passed words: score >= 0
  const passedCount = selectedUser?.words.filter(
    word => (selectedUser.wordScores[word.id] ?? -1) >= 0
  ).length ?? 0;

  const isAllWordsPassed = (selectedUser?.words?.length ?? 0) > 0 && availableWords.length === 0;

  const selectedUserHistory = selectedUser?.quizHistory || [];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="pt-8 pb-6 px-4 bg-black/40 border-b-4 border-primary relative">
        {/* 音樂開關 */}
        <button
          onClick={toggleBgm}
          title={bgmMuted ? "開啟音樂" : "關閉音樂"}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center border-2 border-primary bg-black/60 hover:bg-primary/20 transition-colors rounded text-lg"
          style={{ lineHeight: 1 }}
        >
          {bgmMuted ? "🔇" : "🔊"}
        </button>
        <h1
          onClick={() => { 
            setQuizState(null); 
            setShowHistory(false); 
            setActiveTab('home');
            setShowStoryPlayer(false);
          }}
          className="text-3xl font-pixel text-center text-primary drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer hover:text-primary/80 hover:scale-105 transition-all"
          title="返回首頁"
        >
          WORDPLAY QUIZ MASTER
        </h1>
        <p className="text-center text-primary/80 mt-2 font-vt323 text-xl">
          Test your English vocabulary in a retro adventure!
        </p>
        {selectedUser && (
          <div className="mt-4 max-w-md mx-auto">
            <p className="text-center font-pixel text-primary text-xs mb-2">
              {selectedUser.name} 的修行進度
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 retro-progress">
                <div
                  className="retro-progress-inner"
                  style={{ width: `${(passedCount / (selectedUser.words?.length || 1)) * 100}%` }}
                />
              </div>
              <span className="text-sm font-pixel text-primary min-w-[100px] text-right">
                {passedCount}/{selectedUser.words?.length || 0}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Tab 切換列 */}
      {selectedUser && !quizState && !showHistory && (
        <div className="flex justify-center gap-0 border-b-2 border-primary/20 bg-black/30">
          <button
            className={`retro-tab ${activeTab === 'home' ? 'retro-tab-active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            ⚔️ 首頁
          </button>
          <button
            className={`retro-tab ${activeTab === 'codex' ? 'retro-tab-active' : ''}`}
            onClick={() => setActiveTab('codex')}
          >
            📖 詞靈圖鑑
            {selectedUser.words.length > 0 && (
              <span className="ml-2 inline-block px-1.5 py-0 text-[7px] border border-current codex-badge-pulse">
                {selectedUser.words.filter(w => (selectedUser.wordScores[w.id] ?? -1) >= 0).length}/{selectedUser.words.length}
              </span>
            )}
          </button>
        </div>
      )}

      <main className="flex-1 container max-w-4xl px-4 pb-12">
        {/* 圖鑑分頁 */}
        {activeTab === 'codex' && selectedUser && !quizState && !showHistory ? (
          <SpiritCodex
            words={selectedUser.words}
            wordScores={selectedUser.wordScores}
          />
        ) : !quizState && !showHistory ? (
          <>
            {(!selectedUserId || !isAllWordsPassed || dismissedCompletion) && (
              <div className="mb-8">
                <UserSelector
                  users={users}
                  selectedUserId={selectedUserId}
                  onSelectUser={handleSelectUser}
                  onAddUser={handleAddUser}
                  onDeleteUser={handleDeleteUser}
                />
              </div>
            )}

            {selectedUserId && (
              <>
                {isAllWordsPassed && !dismissedCompletion ? (
                  <QuizCompletion
                    userName={selectedUser?.name || ""}
                    completionMessage={selectedUser?.completionMessage}
                    onReset={handleResetProgress}
                    onBackToHome={() => {
                      setDismissedCompletion(true);
                    }}
                  />
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
                      <h2 className="text-xl font-semibold">Start Quiz</h2>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowStoryPlayer(prev => !prev)}
                          className={`font-pixel text-xs flex items-center px-3 py-1 border-2 transition-all ${
                            showStoryPlayer
                              ? "bg-primary text-black border-primary scale-105"
                              : "bg-black/50 text-primary border-primary hover:bg-primary/20"
                          }`}
                        >
                          📜 詞靈降魔前導傳說
                        </button>

                        {selectedUserHistory.length > 0 && (
                          <button
                            onClick={handleToggleHistory}
                            className="text-primary hover:text-white font-pixel text-xs flex items-center bg-black/50 px-3 py-1 border-2 border-primary"
                          >
                            查看歷史紀錄 [H]
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                      <FileUploader
                        onWordsLoaded={handleWordsLoaded}
                        selectedUser={selectedUser}
                        onUpdateCompletionMessage={handleUpdateCompletionMessage}
                      />
                      <QuizSettings 
                        words={availableWords} 
                        onStartQuiz={handleStartQuiz} 
                        isAllWordsPassed={isAllWordsPassed}
                        onReset={handleResetProgress}
                      />
                    </div>


                  </>
                )}
              </>
            )}
          </>
        ) : showHistory ? (
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-pixel text-primary">冒險紀錄</h2>

              <button
                onClick={handleToggleHistory}
                className="retro-button text-xs"
              >
                返回 [EXIT]
              </button>
            </div>

            <QuizHistory history={selectedUserHistory} />
          </div>
        ) : quizState?.isComplete ? (
          <QuizResult quizState={quizState} onRestart={handleRestartQuiz} />
        ) : (
          <QuizQuestion
            quizState={quizState!}
            wordScores={selectedUser?.wordScores ?? {}}
            onAnswer={handleAnswer}
          />
        )}
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© 2025 Wordplay Quiz Master - Improve your vocabulary</p>
      </footer>

      {/* 點擊觸發的懸浮故事播放器 */}
      {showStoryPlayer && !quizState && !showHistory && selectedUserId && (
        <StoryPlayer
          onClose={() => setShowStoryPlayer(false)}
          onAudioPlayStateChange={handleStoryPlayStateChange}
        />
      )}
    </div>
  );
};

export default Index;

