import { useState, useEffect } from "react";

interface FileInfo {
  file: File;
  preview: string;
  dimensions?: { width: number; height: number };
}

interface FileListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

export function FileList({ files, onRemoveFile }: FileListProps) {
  const [fileInfos, setFileInfos] = useState<FileInfo[]>([]);

  useEffect(() => {
    const processFiles = async () => {
      const infos = await Promise.all(
        files.map(async (file) => {
          const preview = URL.createObjectURL(file);
          
          // Get image dimensions
          const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
            const img = new Image();
            img.onload = () => {
              resolve({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.src = preview;
          });

          return {
            file,
            preview,
            dimensions,
          };
        })
      );
      
      setFileInfos(infos);
    };

    processFiles();

    // Cleanup object URLs on unmount
    return () => {
      fileInfos.forEach(info => URL.revokeObjectURL(info.preview));
    };
  }, [files]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)}KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl bg-surface-container border border-text-muted rounded-5xl p-9">
      <div className="space-y-4">
        {fileInfos.map((fileInfo, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-background rounded-3xl p-4"
          >
            {/* File Info */}
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <img
                src={fileInfo.preview}
                alt={fileInfo.file.name}
                className="w-16 h-16 object-cover rounded-2xl"
              />
              
              {/* File Details */}
              <div className="flex flex-col gap-2">
                <h3 className="font-space-grotesk text-base font-medium text-white">
                  {fileInfo.file.name}
                </h3>
                
                <div className="flex items-center gap-2 text-text-muted font-space-grotesk text-base">
                  {fileInfo.dimensions && (
                    <>
                      <span>{fileInfo.dimensions.width}x{fileInfo.dimensions.height}</span>
                      <div className="w-1 h-1 bg-text-muted rounded-full" />
                    </>
                  )}
                  <span>{formatFileSize(fileInfo.file.size)}</span>
                </div>
              </div>
            </div>
            
            {/* Remove Button */}
            <button
              onClick={() => onRemoveFile(index)}
              className="w-6 h-6 flex items-center justify-center hover:bg-text-muted/10 rounded transition-colors"
            >
              <svg 
                width="12" 
                height="16" 
                viewBox="0 0 12 16" 
                fill="none" 
                className="text-text-muted"
              >
                <path 
                  d="M1.7219 2.29377C1.33127 1.90315 0.696899 1.90315 0.306274 2.29377C-0.0843506 2.6844 -0.0843506 3.31877 0.306274 3.7094L4.60002 8.00002L0.309399 12.2938C-0.0812256 12.6844 -0.0812256 13.3188 0.309399 13.7094C0.700024 14.1 1.3344 14.1 1.72502 13.7094L6.01565 9.41565L10.3094 13.7063C10.7 14.0969 11.3344 14.0969 11.725 13.7063C12.1157 13.3156 12.1157 12.6813 11.725 12.2906L7.43127 8.00002L11.7219 3.70627C12.1125 3.31565 12.1125 2.68127 11.7219 2.29065C11.3313 1.90002 10.6969 1.90002 10.3063 2.29065L6.01565 6.5844L1.7219 2.29377Z" 
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
