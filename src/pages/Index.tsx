
import { useState, useEffect } from "react";
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

// Local storage key for users
const USERS_STORAGE_KEY = "wordplay-quiz-users";

const Index = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  // Initialize users from local storage
  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        
        // Ensure each user has a quizHistory and passedWordIds array (for backward compatibility)
        const updatedUsers = parsedUsers.map((user: User) => ({
          ...user,
          quizHistory: user.quizHistory || [],
          passedWordIds: user.passedWordIds || []
        }));
        
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
      passedWordIds: []
    };
    
    setUsers(prev => [...prev, newUser]);
    setSelectedUserId(newUser.id);
    setQuizState(null);
    setShowHistory(false);
  };
  
  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      setQuizState(null);
      setShowHistory(false);
    }
  };
  
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setQuizState(null);
    setShowHistory(false);
  };
  
  const handleWordsLoaded = (loadedWords: VocabWord[], fileName: string) => {
    if (!selectedUserId) return;
    
    // Update the selected user's words and file information
    setUsers(prev => prev.map(user => {
      if (user.id === selectedUserId) {
        return { 
          ...user, 
          words: loadedWords,
          lastFileUpload: {
            fileName,
            uploadDate: new Date().toISOString()
          }
        };
      }
      return user;
    }));
    
    // Reset quiz state when new words are loaded
    setQuizState(null);
    setShowHistory(false);
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
      
      // Move to the next word
      const updatedState = {
        ...prev,
        currentWordIndex: prev.currentWordIndex + 1,
        answers: updatedAnswers
      };

      // If the answer is correct, add it to the user's passed words
      if (isCorrect && selectedUserId) {
        setUsers(prevUsers => prevUsers.map(user => {
          if (user.id === selectedUserId) {
            const alreadyPassed = user.passedWordIds.includes(currentWord.id);
            if (!alreadyPassed) {
              return {
                ...user,
                passedWordIds: [...user.passedWordIds, currentWord.id]
              };
            }
          }
          return user;
        }));
      }

      return updatedState;
    });
  };
  
  const handleCompleteQuiz = () => {
    setQuizState(prev => prev ? { ...prev, isComplete: true } : null);
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
  };

  const handleResetProgress = () => {
    if (!selectedUserId) return;
    
    setUsers(prev => prev.map(user => {
      if (user.id === selectedUserId) {
        return {
          ...user,
          passedWordIds: []
        };
      }
      return user;
    }));
  };
  
  // Get the selected user's words
  const selectedUser = users.find(user => user.id === selectedUserId);
  
  // Filter out already passed words
  const availableWords = selectedUser?.words.filter(
    word => !selectedUser.passedWordIds.includes(word.id)
  ) || [];
  
  const isAllWordsPassed = (selectedUser?.words?.length ?? 0) > 0 && availableWords.length === 0;
  
  const selectedUserHistory = selectedUser?.quizHistory || [];
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <header className="pt-8 pb-6 px-4">
        <h1 className="text-3xl font-bold text-center text-blue-700">
          Wordplay Quiz Master
        </h1>
        <p className="text-center text-muted-foreground mt-2">
          Test your English vocabulary with customized word lists
        </p>
        {selectedUser && (
          <div className="mt-4 max-w-md mx-auto">
            <p className="text-center font-medium text-blue-600 mb-1">
              {selectedUser.name} 的學習進度
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Progress value={((selectedUser.passedWordIds?.length || 0) / (selectedUser.words?.length || 1)) * 100} className="h-2 bg-blue-100" />
              </div>
              <span className="text-sm font-bold text-blue-700 min-w-[70px] text-right">
                {selectedUser.passedWordIds?.length || 0} / {selectedUser.words?.length || 0}
              </span>
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-1 container max-w-4xl px-4 pb-12">
        {!quizState && !showHistory ? (
          <>
            <div className="mb-8">
              <UserSelector 
                users={users}
                selectedUserId={selectedUserId}
                onSelectUser={handleSelectUser}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
              />
            </div>
            
            {selectedUserId && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Start Quiz</h2>
                  
                  {selectedUserHistory.length > 0 && (
                    <button
                      onClick={handleToggleHistory}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      View Quiz History
                    </button>
                  )}
                </div>
                
                {isAllWordsPassed ? (
                  <QuizCompletion 
                    userName={selectedUser?.name || ""} 
                    onReset={handleResetProgress}
                    onBackToHome={() => {
                      setQuizState(null);
                      setShowHistory(false);
                    }}
                  />
                ) : (
                  <div className="grid gap-8 md:grid-cols-2">
                    <FileUploader 
                      onWordsLoaded={handleWordsLoaded} 
                      selectedUser={selectedUser}
                    />
                    <QuizSettings words={availableWords} onStartQuiz={handleStartQuiz} />
                  </div>
                )}
              </>
            )}
          </>
        ) : showHistory ? (
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Quiz History</h2>
              
              <button
                onClick={handleToggleHistory}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Back to Quiz
              </button>
            </div>
            
            <QuizHistory history={selectedUserHistory} />
          </div>
        ) : quizState?.isComplete ? (
          <QuizResult quizState={quizState} onRestart={handleRestartQuiz} />
        ) : (
          <QuizQuestion
            quizState={quizState!}
            onAnswer={handleAnswer}
            onComplete={handleCompleteQuiz}
          />
        )}
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© 2025 Wordplay Quiz Master - Improve your vocabulary</p>
      </footer>
    </div>
  );
};

export default Index;
