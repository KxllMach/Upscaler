import { useState, useCallback } from "react";
import { Button } from "./ui/button";

interface FileUploadProps {
  onFilesAdded: (files: File[]) => void;
}

export function FileUpload({ onFilesAdded }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  return (
    <div className="w-full max-w-4xl">
      <div
        className={`
          relative h-96 w-full border-2 border-dashed rounded-5xl flex flex-col items-center justify-center gap-3 transition-colors
          ${isDragOver ? 'border-primary bg-primary/5' : 'border-surface-border'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Upload Icon */}
        <div className="w-14 h-14 rounded-xl bg-text-muted/10 flex items-center justify-center">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="text-text-muted"
          >
            <path 
              d="M12 15L12 3M12 3L16 7M12 3L8 7M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        {/* Text Content */}
        <div className="flex flex-col items-center gap-3">
          <p className="font-space-grotesk text-base font-medium text-text-muted">
            Drag & Drop Images Here
          </p>
          
          <p className="font-space-grotesk text-base font-medium text-text-secondary">
            or
          </p>
          
          <Button 
            className="bg-primary hover:bg-primary/90 text-white font-space-grotesk font-medium text-base px-9 py-3 rounded-lg"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            Browse
          </Button>
        </div>
        
        {/* Hidden File Input */}
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>
    </div>
  );
}
