import React, { useState, useEffect, useCallback } from 'react';

// --- Helper Data ---
// This data is taken from your UpscaleOptions.tsx file.
const AI_MODELS = [
  {
    id: 'esrgan',
    name: 'ESRGAN',
    description: 'General purpose model for most images. Provides a good balance between detail and artifact reduction.',
  },
  {
    id: 'esrgan-anime',
    name: 'ESRGAN Anime',
    description: 'Specialized model for anime and cartoon images with enhanced detail preservation.',
  },
  {
    id: 'lite',
    name: 'Lite',
    description: 'Lightweight model for quick processing with moderate quality improvements.',
  },
];

const OUTPUT_FORMATS = ['PNG', 'JPEG', 'WEBP'];


// --- Reusable Button Component ---
// A simple button to standardize the look.
const Button = ({ children, className = '', ...props }) => (
  <button className={`transition-colors ${className}`} {...props}>
    {children}
  </button>
);


// --- Navigation Component ---
// Based on your Navigation.tsx
const Navigation = () => {
  return (
    <nav className="flex w-full max-w-screen-xl mx-auto justify-between items-center px-4 sm:px-8 md:px-16 py-6">
      <div className="font-bold text-2xl text-white italic" style={{ fontFamily: "'General Sans', sans-serif" }}>
        SafeScale
      </div>
      <div className="hidden md:flex items-center gap-9">
        <a href="#features" className="text-gray-400 text-base font-medium hover:text-white">
          Features
        </a>
        <a href="#how-it-works" className="text-gray-400 text-base font-medium hover:text-white">
          How it Works
        </a>
        <a href="#coffee" className="text-gray-400 text-base font-medium hover:text-white">
          Buy Me a Coffee
        </a>
      </div>
      <Button className="bg-[#7B33F7] hover:bg-purple-700 text-white font-bold text-lg px-6 py-3 rounded-xl">
        Get Started
      </Button>
    </nav>
  );
};


// --- Hero Section Component ---
// Based on your HeroSection.tsx
const HeroSection = () => {
  return (
    <div className="flex flex-col items-center text-center max-w-4xl mx-auto px-4 mt-12 mb-16">
      <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
        AI-Powered Private Image Upscaling
        <br />
        Natively on YOUR Device
      </h1>
      <p className="font-bold text-base text-gray-400 leading-relaxed max-w-md">
        Upscale your images on your device's hardware. No spying, No cloud, No Stress
      </p>
    </div>
  );
};


// --- File Upload Component ---
// Based on your FileUpload.tsx
const FileUpload = ({ onFilesAdded }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) onFilesAdded(files);
  }, [onFilesAdded]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }, []);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files || []).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) onFilesAdded(files);
  }, [onFilesAdded]);

  return (
    <div
      className={`relative h-96 w-full border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-colors ${isDragOver ? 'border-purple-600 bg-purple-900/20' : 'border-[#374151]'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="w-14 h-14 rounded-xl bg-gray-500/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
          <path d="M12 15L12 3M12 3L16 7M12 3L8 7M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="font-medium text-gray-400">Drag & Drop Images Here</p>
        <p className="font-medium text-gray-500">or</p>
        <Button
          className="bg-[#7B33F7] hover:bg-purple-700 text-white font-medium text-base px-9 py-3 rounded-lg"
          onClick={() => document.getElementById('file-input')?.click()}
        >
          Browse
        </Button>
      </div>
      <input id="file-input" type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />
    </div>
  );
};


// --- File List Component ---
// Based on your FileList.tsx
const FileList = ({ files, onRemoveFile }) => {
  const [fileInfos, setFileInfos] = useState([]);

  useEffect(() => {
    // A mapping to keep track of object URLs to revoke
    const objectUrls = [];

    const processFiles = async () => {
      const infos = await Promise.all(
        files.map(async (file) => {
          const preview = URL.createObjectURL(file);
          objectUrls.push(preview); // Keep track of URL to revoke
          const dimensions = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => resolve({ width: 0, height: 0 }); // Handle broken images
            img.src = preview;
          });
          return { file, preview, dimensions };
        })
      );
      setFileInfos(infos);
    };

    if (files.length > 0) {
      processFiles();
    } else {
      setFileInfos([]);
    }
    
    // Cleanup function
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  const formatFileSize = (bytes) => (bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)}KB` : `${(bytes / (1024 * 1024)).toFixed(1)}MB`);

  if (files.length === 0) return null;

  return (
    <div className="w-full bg-[#1F2937] border border-[#9CA3AF] rounded-[2.5rem] p-4 sm:p-6 md:p-9">
      <div className="space-y-4">
        {fileInfos.map((info, index) => (
          <div key={index} className="flex items-center justify-between bg-[#111827] rounded-3xl p-4">
            <div className="flex items-center gap-4">
              <img src={info.preview} alt={info.file.name} className="w-16 h-16 object-cover rounded-2xl" />
              <div className="flex flex-col gap-2">
                <h3 className="text-sm sm:text-base font-medium text-white truncate max-w-[150px] sm:max-w-xs">{info.file.name}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-base">
                  {info.dimensions?.width > 0 && (
                    <>
                      <span>{info.dimensions.width}x{info.dimensions.height}</span>
                      <div className="w-1 h-1 bg-gray-500 rounded-full" />
                    </>
                  )}
                  <span>{formatFileSize(info.file.size)}</span>
                </div>
              </div>
            </div>
            <button onClick={() => onRemoveFile(index)} className="w-8 h-8 flex-shrink-0 flex items-center justify-center hover:bg-gray-700/50 rounded-full transition-colors">
              <svg width="12" height="16" viewBox="0 0 12 16" fill="none" className="text-gray-500">
                <path d="M1.7219 2.29377C1.33127 1.90315 0.696899 1.90315 0.306274 2.29377C-0.0843506 2.6844 -0.0843506 3.31877 0.306274 3.7094L4.60002 8.00002L0.309399 12.2938C-0.0812256 12.6844 -0.0812256 13.3188 0.309399 13.7094C0.700024 14.1 1.3344 14.1 1.72502 13.7094L6.01565 9.41565L10.3094 13.7063C10.7 14.0969 11.3344 14.0969 11.725 13.7063C12.1157 13.3156 12.1157 12.6813 11.725 12.2906L7.43127 8.00002L11.7219 3.70627C12.1125 3.31565 12.1125 2.68127 11.7219 2.29065C11.3313 1.90002 10.6969 1.90002 10.3063 2.29065L6.01565 6.5844L1.7219 2.29377Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


// --- Upscale Options Component ---
// Based on your UpscaleOptions.tsx
const UpscaleOptions = ({ onUpscale, disabled = false }) => {
  const [selectedModel, setSelectedModel] = useState('esrgan');
  const [selectedFormat, setSelectedFormat] = useState('PNG');
  const currentModel = AI_MODELS.find(model => model.id === selectedModel);
  const handleUpscale = () => onUpscale({ model: selectedModel, format: selectedFormat });

  return (
    <div className="w-full max-w-lg bg-[#1F2937] rounded-[2.5rem] p-6 sm:p-9">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-white">Upscale Options</h2>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">AI Model</h3>
            <div className="bg-[#111827] rounded-xl p-1 flex">
               {AI_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`relative z-10 flex-1 py-3 px-2 text-center text-sm sm:text-base font-medium rounded-lg transition-colors ${selectedModel === model.id ? 'bg-[#7B33F7] text-white' : 'text-white hover:bg-white/5'}`}
                  >
                    {model.name}
                  </button>
                ))}
            </div>
            <div className="bg-[#111827] rounded-xl p-6 min-h-[7rem] flex items-center">
              <p className="text-base text-gray-400">{currentModel?.description}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Output Format</h3>
             <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full bg-[#111827] rounded-xl p-6 text-base font-medium text-white border border-transparent appearance-none focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                {OUTPUT_FORMATS.map((format) => (
                  <option key={format} value={format} className="bg-[#1F2937] text-white">{format}</option>
                ))}
              </select>
          </div>
          <Button
            onClick={handleUpscale}
            disabled={disabled}
            className="w-full bg-[#7B33F7] hover:bg-purple-700 disabled:bg-purple-700/50 disabled:cursor-not-allowed text-white font-bold text-xl px-6 py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <svg width="25" height="24" viewBox="0 0 25 24" fill="none">
              <path d="M9.60698 5.448C10.205 3.698 12.623 3.645 13.332 5.289L13.392 5.449L14.199 7.809C14.3839 8.35023 14.6828 8.84551 15.0754 9.26142C15.468 9.67734 15.9453 10.0042 16.475 10.22L16.692 10.301L19.052 11.107C20.802 11.705 20.855 14.123 19.212 14.832L19.052 14.892L16.692 15.699C16.1506 15.8838 15.6551 16.1826 15.239 16.5753C14.8229 16.9679 14.4959 17.4452 14.28 17.975L14.199 18.191L13.393 20.552C12.795 22.302 10.377 22.355 9.66898 20.712L9.60698 20.552L8.80098 18.192C8.61616 17.6506 8.31735 17.1551 7.92472 16.739C7.53209 16.3229 7.05478 15.9959 6.52498 15.78L6.30898 15.699L3.94898 14.893C2.19798 14.295 2.14498 11.877 3.78898 11.169L3.94898 11.107L6.30898 10.301C6.85022 10.1161 7.34549 9.81719 7.76141 9.42457C8.17732 9.03195 8.50419 8.55469 8.71998 8.025L8.80098 7.809L9.60698 5.448ZM19.5 2C19.9142 2 20.25 2.33579 20.25 2.75V2.75L20.565 3.659L21.474 3.974C21.8882 4.10103 22.052 4.59179 21.8411 4.93113L21.8411 4.93113L21.182 5.959L21.497 6.868C21.624 7.28221 21.3151 7.705 20.871 7.705H20.871L19.962 7.39L19.053 7.705C18.6388 7.83203 18.25 7.46947 18.25 7.025V7.025L18.565 6.116L17.656 5.801C17.2418 5.67397 17.078 5.18321 17.2889 4.84387L17.2889 4.84387L17.948 3.816L17.633 2.907C17.506 2.49279 17.8149 2.07 18.259 2.07H18.259L19.168 2.385L19.5 2Z" fill="white" />
            </svg>
            Upscale Images
          </Button>
        </div>
      </div>
    </div>
  );
};


// --- Main App Component ---
// This is the main orchestrator, based on your Index.tsx
export default function App() {
  // State to hold the list of uploaded image files
  const [files, setFiles] = useState([]);

  // Callback to add new files from the FileUpload component
  const handleFilesAdded = (newFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // Callback to remove a file from the FileList component
  const handleRemoveFile = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  // Placeholder function for when the user clicks "Upscale"
  const handleUpscale = (options) => {
    if (files.length === 0) {
      console.log("No files to upscale.");
      // In a real app, you would show a toast notification here
      return;
    }
    console.log("Upscaling images with options:", options);
    console.log("Files to process:", files);
    // This is where we will add the ONNX model integration in the next step
  };

  return (
    // Set the global font from your global.css file
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="w-full min-h-screen bg-[#111827]">
      <Navigation />
      <main className="container mx-auto px-4 pb-12">
        <HeroSection />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 flex flex-col items-center gap-8">
            <FileUpload onFilesAdded={handleFilesAdded} />
            <FileList files={files} onRemoveFile={handleRemoveFile} />
          </div>
          <div className="lg:col-span-2">
            <UpscaleOptions onUpscale={handleUpscale} disabled={files.length === 0} />
          </div>
        </div>
      </main>
    </div>
  );
}

