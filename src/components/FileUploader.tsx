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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-center">上傳詞彙表</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedUser?.lastFileUpload && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm font-medium">目前檔案：{selectedUser.lastFileUpload.fileName}</p>
            <p className="text-xs text-muted-foreground">
              上傳時間：{new Date(selectedUser.lastFileUpload.uploadDate).toLocaleString()}
            </p>
          </div>
        )}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="mb-2 text-sm text-muted-foreground">
            拖放 CSV 檔案至此，或點擊選擇檔案
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            格式：中文,英文（每行一組）
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
          <Button
            onClick={() => document.getElementById("fileInput")?.click()}
            variant="outline"
          >
            選擇檔案
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
