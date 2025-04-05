
import { useState, useEffect } from "react";
import FileUploader from "@/components/FileUploader";
import QuizSettings from "@/components/QuizSettings";
import QuizQuestion from "@/components/QuizQuestion";
import QuizResult from "@/components/QuizResult";
import UserSelector from "@/components/UserSelector";
import { VocabWord, QuizState, QuizSettings as QuizSettingsType, User } from "@/types";
import { checkAnswer } from "@/utils/quizUtils";
import { v4 as uuidv4 } from "uuid";

// Local storage key for users
const USERS_STORAGE_KEY = "wordplay-quiz-users";

const Index = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  
  // Initialize users from local storage
  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        setUsers(parsedUsers);
        
        // Auto-select first user if available
        if (parsedUsers.length > 0 && !selectedUserId) {
          setSelectedUserId(parsedUsers[0].id);
        }
      } catch (error) {
        console.error("Error parsing stored users:", error);
      }
    }
  }, []);
  
  // Save users to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);
  
  const handleAddUser = (name: string) => {
    const newUser: User = {
      id: uuidv4(),
      name,
      words: []
    };
    
    setUsers(prev => [...prev, newUser]);
    setSelectedUserId(newUser.id);
    setQuizState(null);
  };
  
  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      setQuizState(null);
    }
  };
  
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setQuizState(null);
  };
  
  const handleWordsLoaded = (loadedWords: VocabWord[]) => {
    if (!selectedUserId) return;
    
    // Update the selected user's words
    setUsers(prev => prev.map(user => {
      if (user.id === selectedUserId) {
        return { ...user, words: loadedWords };
      }
      return user;
    }));
    
    // Reset quiz state when new words are loaded
    setQuizState(null);
  };
  
  const handleStartQuiz = (settings: QuizSettingsType, selectedWords: VocabWord[]) => {
    setQuizState({
      words: selectedWords,
      currentWordIndex: 0,
      questionCount: settings.questionCount,
      answers: [],
      isComplete: false
    });
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
      return {
        ...prev,
        currentWordIndex: prev.currentWordIndex + 1,
        answers: updatedAnswers
      };
    });
  };
  
  const handleCompleteQuiz = () => {
    setQuizState(prev => prev ? { ...prev, isComplete: true } : null);
  };
  
  const handleRestartQuiz = () => {
    setQuizState(null);
  };
  
  // Get the selected user's words
  const selectedUserWords = selectedUserId 
    ? users.find(user => user.id === selectedUserId)?.words || [] 
    : [];
  
  const selectedUser = users.find(user => user.id === selectedUserId);
  
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
          <p className="text-center font-medium text-blue-600 mt-2">
            Current User: {selectedUser.name}
          </p>
        )}
      </header>
      
      <main className="flex-1 container max-w-4xl px-4 pb-12">
        {!quizState ? (
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
              <div className="grid gap-8 md:grid-cols-2">
                <FileUploader onWordsLoaded={handleWordsLoaded} />
                <QuizSettings words={selectedUserWords} onStartQuiz={handleStartQuiz} />
              </div>
            )}
          </>
        ) : quizState.isComplete ? (
          <QuizResult quizState={quizState} onRestart={handleRestartQuiz} />
        ) : (
          <QuizQuestion
            quizState={quizState}
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
