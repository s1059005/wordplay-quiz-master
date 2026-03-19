import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseCSV } from "@/utils/quizUtils";
import { VocabWord, User } from "@/types";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onWordsLoaded: (words: VocabWord[], fileName: string) => void;
  selectedUser?: User | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onWordsLoaded, selectedUser }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);

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

  return (
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
          <p className="font-pixel text-[8px] text-primary/40 mb-6">
            格式: 中文, 英文 (每行一組)
          </p>
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
  );
};

export default FileUploader;
