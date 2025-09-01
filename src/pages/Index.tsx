import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { UpscaleOptions } from "@/components/UpscaleOptions";

export default function Index() {
  // State to hold the list of uploaded image files
  const [files, setFiles] = useState<File[]>([]);

  // Callback function to add new files from the FileUpload component
  const handleFilesAdded = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // Callback function to remove a file from the FileList component
  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  // Placeholder function for when the user clicks "Upscale"
  const handleUpscale = (options: { model: string; format: string }) => {
    if (files.length === 0) {
      console.log("No files to upscale.");
      // Here you would show a toast notification to the user
      return;
    }
    console.log("Upscaling images with options:", options);
    console.log("Files to process:", files);
    // This is where we will add the ONNX model integration later
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4">
        <HeroSection />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left Column: File Upload and List */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <FileUpload onFilesAdded={handleFilesAdded} />
            <FileList files={files} onRemoveFile={handleRemoveFile} />
          </div>

          {/* Right Column: Upscale Options */}
          <div className="lg:col-span-2">
            <UpscaleOptions onUpscale={handleUpscale} disabled={files.length === 0} />
          </div>
        </div>
      </main>
    </div>
  );
}
