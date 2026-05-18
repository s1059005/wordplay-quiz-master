import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { parseCSV } from "@/utils/quizUtils";
import { VocabWord, User } from "@/types";
import { toast } from "sonner";
import { Upload, HelpCircle } from "lucide-react";

interface FileUploaderProps {
  onWordsLoaded: (words: VocabWord[], fileName: string) => void;
  selectedUser?: User | null;
  onUpdateCompletionMessage?: (message: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onWordsLoaded, selectedUser, onUpdateCompletionMessage }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showFormatHelp, setShowFormatHelp] = useState<boolean>(false);
  const [showCompletionMessageDialog, setShowCompletionMessageDialog] = useState<boolean>(false);
  const [completionMessageInput, setCompletionMessageInput] = useState<string>("");

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const words = parseCSV(csvContent);
        
        if (words.length === 0) {
          toast.error("檔案中沒有找到有效的單字");
          return;
        }
        
        onWordsLoaded(words, file.name);
        toast.success(`已從 ${file.name} 載入 ${words.length} 個單字`);
        
        // Show completion message dialog after successful upload
        if (onUpdateCompletionMessage) {
          setCompletionMessageInput(selectedUser?.completionMessage || "");
          setShowCompletionMessageDialog(true);
        }
      } catch (error) {
        console.error("Error parsing CSV file:", error);
        toast.error("解析檔案時發生錯誤。請檢查格式後重試。");
      }
    };
    
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.length) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSaveCompletionMessage = () => {
    if (onUpdateCompletionMessage) {
      onUpdateCompletionMessage(completionMessageInput);
      toast.success("已儲存通關祝賀詞！");
    }
    setShowCompletionMessageDialog(false);
  };

  return (
    <>
      <Card className="retro-border">
        <CardHeader>
          <CardTitle className="text-xl text-center font-pixel text-primary drop-shadow-md">
            卷軸上傳 [UPLOAD SCROLL]
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedUser?.lastFileUpload && (
            <div className="mb-4 p-3 bg-black/40 border-2 border-primary/20 relative">
              <div className="absolute -top-3 left-4 bg-background px-2 font-pixel text-[8px] text-primary/60">ACTIVE SCROLL</div>
              <p className="font-vt323 text-primary text-lg">檔案：{selectedUser.lastFileUpload.fileName}</p>
              <p className="font-vt323 text-primary/60 text-sm">
                儀式時間：{new Date(selectedUser.lastFileUpload.uploadDate).toLocaleString()}
              </p>
            </div>
          )}
          <div
            className={`border-4 border-dashed p-8 text-center transition-all ${
              isDragging ? "border-primary bg-primary/10 scale-105" : "border-primary/20 bg-black/20"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-primary/40 mb-4" />
            <p className="mb-2 font-vt323 text-xl text-primary">
              投放 CSV 秘笈至此，或點擊開啟
            </p>
            <p className="font-pixel text-[8px] text-primary/40 mb-2">
              格式: 中文, 英文 (每行一組)
            </p>
            {/* 格式說明按鈕 */}
            <button
              type="button"
              onClick={() => setShowFormatHelp(true)}
              className="inline-flex items-center gap-1 font-vt323 text-sm text-primary/70 hover:text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors mb-6 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              📜 格式說明 [FORMAT HELP]
            </button>
            <br />
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept=".csv,.txt"
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <button
              onClick={() => document.getElementById("fileInput")?.click()}
              className="retro-button"
            >
              開啟卷軸 [OPEN]
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 格式說明 Dialog */}
      <Dialog open={showFormatHelp} onOpenChange={setShowFormatHelp}>
        <DialogContent className="border-2 border-primary bg-background max-w-md">
          <DialogHeader>
            <DialogTitle className="font-pixel text-primary text-lg text-center">
              📜 卷軸格式說明 [SCROLL FORMAT]
            </DialogTitle>
            <DialogDescription className="font-vt323 text-primary/60 text-center">
              請依照以下格式製作文字檔（.csv 或 .txt）
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* 格式規則 */}
            <div className="p-3 bg-black/40 border border-primary/30 rounded">
              <p className="font-pixel text-[10px] text-primary/80 mb-2">▸ 基本規則</p>
              <ul className="font-vt323 text-sm text-primary/90 space-y-1 list-disc list-inside">
                <li>每行一組單字</li>
                <li>中文與英文之間用<span className="text-yellow-400 font-bold">半形逗號 ,</span> 分隔</li>
                <li>檔案須為 <span className="text-yellow-400">.csv</span> 或 <span className="text-yellow-400">.txt</span> 格式</li>
                <li>編碼建議使用 <span className="text-yellow-400">UTF-8</span></li>
              </ul>
            </div>

            {/* 範例檔案內容 */}
            <div className="p-3 bg-black/60 border border-primary/30 rounded">
              <p className="font-pixel text-[10px] text-primary/80 mb-2">▸ 範例內容（words.csv）</p>
              <pre className="font-vt323 text-sm text-green-400 leading-relaxed whitespace-pre-wrap">
{`蘋果, apple
香蕉, banana
貓咪, cat
狗, dog
書本, book
電腦, computer
老師, teacher
學生, student`}
              </pre>
            </div>

            {/* 注意事項 */}
            <div className="p-3 bg-black/40 border border-yellow-500/30 rounded">
              <p className="font-pixel text-[10px] text-yellow-400/80 mb-2">⚠ 注意事項</p>
              <ul className="font-vt323 text-sm text-primary/70 space-y-1 list-disc list-inside">
                <li>空白行會被自動忽略</li>
                <li>缺少中文或英文的行會被跳過</li>
                <li>前後空白會自動移除</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* 通關祝賀詞設定 Dialog (隱藏式，僅在上傳後彈出) */}
      <Dialog open={showCompletionMessageDialog} onOpenChange={setShowCompletionMessageDialog}>
        <DialogContent className="border-2 border-primary bg-background max-w-md">
          <DialogHeader>
            <DialogTitle className="font-pixel text-primary text-lg text-center">
              🎉 設定通關祝賀詞
            </DialogTitle>
            <DialogDescription className="font-vt323 text-primary/60 text-center">
              請輸入當受試者完成所有題目時，您想對他們說的話。
              <br />
              (此訊息將被隱藏，直到受試者通關才會顯示)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="completionMessage" className="font-vt323 text-primary text-sm">
                祝賀詞內容 [MESSAGE]
              </label>
              <textarea
                id="completionMessage"
                value={completionMessageInput}
                onChange={(e) => setCompletionMessageInput(e.target.value)}
                placeholder="例如：恭喜你! 通過, 得到一個禮物"
                className="w-full bg-black/40 border-2 border-primary/40 rounded p-3 text-primary font-vt323 h-24 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCompletionMessageDialog(false)}
                className="retro-button bg-transparent border-primary/40 text-primary/70 hover:text-primary hover:border-primary text-sm py-2"
              >
                略過 [SKIP]
              </button>
              <button
                onClick={handleSaveCompletionMessage}
                className="retro-button text-sm py-2"
              >
                儲存並隱藏 [SAVE]
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileUploader;
