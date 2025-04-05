
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseCSV } from "@/utils/quizUtils";
import { VocabWord } from "@/types";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onWordsLoaded: (words: VocabWord[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onWordsLoaded }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const words = parseCSV(csvContent);
        
        if (words.length === 0) {
          toast.error("No valid words found in the file");
          return;
        }
        
        onWordsLoaded(words);
        toast.success(`Loaded ${words.length} vocabulary words`);
      } catch (error) {
        console.error("Error parsing CSV file:", error);
        toast.error("Error parsing file. Please check format and try again.");
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
        <CardTitle className="text-xl text-center">Upload Vocabulary List</CardTitle>
      </CardHeader>
      <CardContent>
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
            Drag and drop a CSV file, or click to select
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Format: Chinese,English (one pair per line)
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
            Select File
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
