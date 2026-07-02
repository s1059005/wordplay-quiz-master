import React, { useState, useMemo } from "react";
import { VocabWord } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Edit2, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle 
} from "lucide-react";
import { toast } from "sonner";

interface VocabManagerProps {
  words: VocabWord[];
  onUpdateWords: (updatedWords: VocabWord[]) => void;
}

const VocabManager: React.FC<VocabManagerProps> = ({ words, onUpdateWords }) => {
  // 搜尋與分頁狀態
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // 新增單字狀態
  const [newEnglish, setNewEnglish] = useState<string>("");
  const [newChinese, setNewChinese] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // 編輯單字狀態
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEnglish, setEditEnglish] = useState<string>("");
  const [editChinese, setEditChinese] = useState<string>("");

  // 刪除確認狀態
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 搜尋與篩選邏輯
  const filteredWords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return words;
    return words.filter(
      (w) =>
        w.english.toLowerCase().includes(query) ||
        w.chinese.toLowerCase().includes(query)
    );
  }, [words, searchQuery]);

  // 分頁計算
  const totalPages = Math.max(1, Math.ceil(filteredWords.length / itemsPerPage));
  
  // 當搜尋條件改變，若當前頁數大於總頁數，將其修正
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredWords, totalPages, currentPage]);

  const paginatedWords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredWords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWords, currentPage]);

  // 新增單字
  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const english = newEnglish.trim();
    const chinese = newChinese.trim();

    if (!english || !chinese) {
      toast.error("英文與中文翻譯皆不可為空");
      return;
    }

    // 檢查是否重複
    const isDuplicate = words.some(
      (w) => w.english.toLowerCase() === english.toLowerCase()
    );
    if (isDuplicate) {
      toast.warning(`單字 "${english}" 似乎已存在於詞彙表中`);
    }

    const newWord: VocabWord = {
      id: `word-${Date.now()}`,
      english,
      chinese,
    };

    onUpdateWords([...words, newWord]);
    setNewEnglish("");
    setNewChinese("");
    setShowAddForm(false);
    toast.success(`已成功新增單字 "${english}"`);
  };

  // 開始編輯
  const startEditing = (word: VocabWord) => {
    setEditingId(word.id);
    setEditEnglish(word.english);
    setEditChinese(word.chinese);
    setDeletingId(null); // 取消刪除狀態
  };

  // 儲存編輯
  const saveEditing = (id: string) => {
    const english = editEnglish.trim();
    const chinese = editChinese.trim();

    if (!english || !chinese) {
      toast.error("英文與中文翻譯皆不可為空");
      return;
    }

    const updated = words.map((w) => {
      if (w.id === id) {
        return { ...w, english, chinese };
      }
      return w;
    });

    onUpdateWords(updated);
    setEditingId(null);
    toast.success("單字修改已保存");
  };

  // 取消編輯
  const cancelEditing = () => {
    setEditingId(null);
  };

  // 刪除單字
  const deleteWord = (id: string, name: string) => {
    const updated = words.filter((w) => w.id !== id);
    onUpdateWords(updated);
    setDeletingId(null);
    toast.success(`已將 "${name}" 從詞彙表中刪除`);
  };

  return (
    <div className="w-full py-6 space-y-6">
      {/* 標題與簡介 */}
      <div className="text-center">
        <h2 className="text-2xl font-pixel text-primary drop-shadow-md mb-2">
          🛠️ 題庫微調 [VOCAB MANAGER]
        </h2>
        <p className="font-vt323 text-primary/60 text-xl">
          修正匯入有誤的題目，或擴充自訂的詞靈卷軸
        </p>
      </div>

      {/* 控制列：搜尋與新增按鈕 */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/40 w-4 h-4" />
          <input
            type="text"
            placeholder="搜尋單字或翻譯..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full retro-input pl-10 pr-4 py-2 text-sm"
          />
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`retro-button flex items-center justify-center gap-2 py-2 px-4 text-xs font-pixel ${
            showAddForm ? "bg-primary text-black border-primary" : ""
          }`}
        >
          {showAddForm ? (
            <>
              <X className="w-3.5 h-3.5" />
              收起面板 [CLOSE]
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              新增單字 [ADD]
            </>
          )}
        </button>
      </div>

      {/* 新增單字表單 */}
      {showAddForm && (
        <Card className="retro-border border-primary bg-black/40 animate-in fade-in duration-200">
          <CardHeader className="pb-2 border-b-2 border-primary/20">
            <CardTitle className="font-pixel text-xs text-primary">
              📜 召喚新詞靈 [ADD WORD]
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleAddWord} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <label className="font-pixel text-[8px] text-primary/60">ENGLISH</label>
                <input
                  type="text"
                  placeholder="e.g. apple"
                  value={newEnglish}
                  onChange={(e) => setNewEnglish(e.target.value)}
                  className="w-full retro-input text-base py-1.5"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1">
                <label className="font-pixel text-[8px] text-primary/60">CHINESE</label>
                <input
                  type="text"
                  placeholder="e.g. 蘋果"
                  value={newChinese}
                  onChange={(e) => setNewChinese(e.target.value)}
                  className="w-full retro-input text-base py-1.5"
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="retro-button py-2 text-xs font-pixel w-full">
                確認召喚 [SUMMON]
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 題庫列表表格 */}
      <Card className="retro-border">
        <CardContent className="p-0">
          {words.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <AlertTriangle className="w-12 h-12 text-primary/40 mx-auto" />
              <p className="font-pixel text-primary text-xs">
                目前尚無單字 [NO DATA]
              </p>
              <p className="font-vt323 text-primary/50 text-base">
                請先回到首頁上傳 CSV 卷軸，或點擊上方按鈕手動新增單字。
              </p>
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-vt323 text-primary/40 text-xl">
                找不到符合 "{searchQuery}" 的詞靈
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-primary/30 bg-black/40 text-primary font-pixel text-[8px]">
                    <th className="p-3 pl-4 w-1/12 text-center">序號</th>
                    <th className="p-3 w-4/12">英文單字 (ENGLISH)</th>
                    <th className="p-3 w-4/12">中文翻譯 (CHINESE)</th>
                    <th className="p-3 w-3/12 pr-4 text-center">動作 (ACTIONS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {paginatedWords.map((word, idx) => {
                    const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                    const isEditing = editingId === word.id;
                    const isDeleting = deletingId === word.id;

                    return (
                      <tr 
                        key={word.id} 
                        className={`hover:bg-primary/5 transition-colors font-vt323 text-lg ${
                          isEditing ? "bg-primary/5" : ""
                        }`}
                      >
                        {/* 序號 */}
                        <td className="p-3 pl-4 text-center font-pixel text-[8px] text-primary/40">
                          {globalIdx}
                        </td>

                        {/* 英文欄位 */}
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editEnglish}
                              onChange={(e) => setEditEnglish(e.target.value)}
                              className="retro-input text-base py-1 px-2 w-full max-w-xs focus:ring-1 focus:ring-primary border-primary"
                              autoComplete="off"
                            />
                          ) : (
                            <span className="text-green-400 tracking-wider font-semibold">
                              {word.english}
                            </span>
                          )}
                        </td>

                        {/* 中文欄位 */}
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editChinese}
                              onChange={(e) => setEditChinese(e.target.value)}
                              className="retro-input text-base py-1 px-2 w-full max-w-xs focus:ring-1 focus:ring-primary border-primary"
                              autoComplete="off"
                            />
                          ) : (
                            <span className="text-primary/90">{word.chinese}</span>
                          )}
                        </td>

                        {/* 操作按鈕 */}
                        <td className="p-3 pr-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => saveEditing(word.id)}
                                className="w-8 h-8 flex items-center justify-center border border-green-500 hover:bg-green-500/20 text-green-400 rounded transition-all"
                                title="保存修改"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="w-8 h-8 flex items-center justify-center border border-red-500 hover:bg-red-500/20 text-red-400 rounded transition-all"
                                title="取消編輯"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : isDeleting ? (
                            <div className="flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
                              <span className="font-pixel text-[6px] text-red-400 mr-1">確認刪除？</span>
                              <button
                                onClick={() => deleteWord(word.id, word.english)}
                                className="px-2 py-1 text-[8px] font-pixel bg-red-600 border border-red-500 hover:bg-red-700 text-white rounded transition-all"
                              >
                                是
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-2 py-1 text-[8px] font-pixel border border-primary/40 hover:bg-primary/20 text-primary/80 rounded transition-all"
                              >
                                否
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => startEditing(word)}
                                className="w-8 h-8 flex items-center justify-center border border-primary/20 hover:border-primary hover:bg-primary/10 text-primary/70 hover:text-primary rounded transition-all"
                                title="編輯此詞靈"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingId(word.id);
                                  setEditingId(null); // 取消其他列的編輯狀態
                                }}
                                className="w-8 h-8 flex items-center justify-center border border-red-950/40 hover:border-red-500 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 rounded transition-all"
                                title="刪除此詞靈"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分頁控制區 */}
      {filteredWords.length > itemsPerPage && (
        <div className="flex items-center justify-center gap-4 pt-2 font-vt323 text-xl">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center border border-primary/20 hover:border-primary disabled:opacity-30 disabled:pointer-events-none rounded transition-all text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-primary/70">
            PAGE {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center border border-primary/20 hover:border-primary disabled:opacity-30 disabled:pointer-events-none rounded transition-all text-primary"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VocabManager;
