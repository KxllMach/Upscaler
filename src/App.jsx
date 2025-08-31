import React, { useState, useEffect, useCallback } from 'react';

// --- Helper Functions and Data ---

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

// --- UI Components ---

const Button = ({ children, className, ...props }) => (
  <button className={`${className} transition-colors`} {...props}>
    {children}
  </button>
);

const Navigation = () => {
  return (
    <nav className="flex w-full max-w-screen-xl mx-auto justify-between items-center px-4 sm:px-8 md:px-16 py-6">
      <div className="font-bold text-2xl text-white italic">
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
      <Button
        size="lg"
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-6 py-3 rounded-xl"
      >
        Get Started
      </Button>
    </nav>
  );
};

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

const FileUpload = ({ onFilesAdded }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) onFilesAdded(files);
  }, [onFilesAdded]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragOver(false); }, []);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files || []).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) onFilesAdded(files);
  }, [onFilesAdded]);

  return (
    <div
      className={`relative h-80 w-full border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 transition-colors ${isDragOver ? 'border-purple-600 bg-purple-600/10' : 'border-gray-600'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="w-14 h-14 rounded-xl bg-gray-500/20 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
          <path d="M12 15L12 3M12 3L16 7M12 3L8 7M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="text-base font-medium text-gray-400">Drag & Drop Images Here</p>
        <p className="text-base font-medium text-gray-500">or</p>
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-base px-9 py-3 rounded-lg"
          onClick={() => document.getElementById('file-input')?.click()}
        >
          Browse
        </Button>
      </div>
      <input id="file-input" type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />
    </div>
  );
};

const FileList = ({ files, onRemoveFile }) => {
  const [fileInfos, setFileInfos] = useState([]);

  useEffect(() => {
    const processFiles = async () => {
      const infos = await Promise.all(
        files.map(async (file) => {
          const preview = URL.createObjectURL(file);
          const dimensions = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.src = preview;
          });
          return { file, preview, dimensions };
        })
      );
      setFileInfos(infos);
    };
    if (files.length > 0) processFiles();
    else setFileInfos([]);
    return () => { fileInfos.forEach(info => URL.revokeObjectURL(info.preview)); };
  }, [files]);

  const formatFileSize = (bytes) => (bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)}KB` : `${(bytes / (1024 * 1024)).toFixed(1)}MB`);

  if (files.length === 0) return null;

  return (
    <div className="w-full bg-gray-800 border border-gray-700 rounded-3xl p-4 sm:p-6 md:p-9">
      <div className="space-y-4">
        {fileInfos.map((info, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-900 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <img src={info.preview} alt={info.file.name} className="w-16 h-16 object-cover rounded-xl" />
              <div className="flex flex-col gap-2">
                <h3 className="text-sm sm:text-base font-medium text-white">{info.file.name}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-base">
                  {info.dimensions && (
                    <>
                      <span>{info.dimensions.width}x{info.dimensions.height}</span>
                      <div className="w-1 h-1 bg-gray-500 rounded-full" />
                    </>
                  )}
                  <span>{formatFileSize(info.file.size)}</span>
                </div>
              </div>
            </div>
            <button onClick={() => onRemoveFile(index)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/50 rounded-full transition-colors">
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

const UpscaleOptions = ({ onUpscale, disabled = false }) => {
  const [selectedModel, setSelectedModel] = useState('esrgan');
  const [selectedFormat, setSelectedFormat] = useState('PNG');
  const currentModel = AI_MODELS.find(model => model.id === selectedModel);
  const handleUpscale = () => onUpscale({ model: selectedModel, format: selectedFormat });

  return (
    <div className="w-full bg-gray-800 rounded-3xl p-6 sm:p-9 border border-gray-700">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-white">Upscale Options</h2>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">AI Model</h3>
            <div className="bg-gray-900 rounded-xl p-1 flex">
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`flex-1 py-2 px-1 text-center text-sm font-medium rounded-lg transition-colors ${selectedModel === model.id ? 'bg-purple-600 text-white' : 'text-white hover:bg-white/10'}`}
                >
                  {model.name}
                </button>
              ))}
            </div>
            <div className="bg-gray-900 rounded-xl p-4 min-h-[6rem]">
              <p className="text-sm text-gray-400">{currentModel?.description}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Output Format</h3>
            <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full bg-gray-900 rounded-xl p-4 text-base font-medium text-white border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                {OUTPUT_FORMATS.map((format) => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
          </div>
          <Button
            onClick={handleUpscale}
            disabled={disabled}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-bold text-xl px-6 py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <svg width="25" height="24" viewBox="0 0 25 24" fill="none">
              <path d="M9.60698 5.448C10.205 3.698 12.623 3.645 13.332 5.289L13.392 5.449L14.199 7.809C14.3839 8.35023 14.6828 8.84551 15.0754 9.26142C15.468 9.67734 15.9453 10.0042 16.475 10.22L16.692 10.301L19.052 11.107C20.802 11.705 20.855 14.123 19.212 14.832L19.052 14.892L16.692 15.699C16.1506 15.8838 15.6551 16.1826 15.239 16.5753C14.8229 16.9679 14.4959 17.4452 14.28 17.975L14.199 18.191L13.393 20.552C12.795 22.302 10.377 22.355 9.66898 20.712L9.60698 20.552L8.80098 18.192C8.61616 17.6506 8.31735 17.1551 7.92472 16.739C7.53209 16.3229 7.05478 15.9959 6.52498 15.78L6.30898 15.699L3.94898 14.893C2.19798 14.295 2.14498 11.877 3.78898 11.169L3.94898 11.107L6.30898 10.301C6.85022 10.1161 7.34549 9.81719 7.76141 9.42457C8.17732 9.03195 8.50419 8.55469 8.71998 8.025L8.80098 7.809L9.60698 5.448ZM11.5 6.094L10.694 8.454C10.4124 9.2793 9.95425 10.0333 9.35152 10.6635C8.74879 11.2937 8.01593 11.7849 7.20398 12.103L6.95398 12.194L4.59398 13L6.95398 13.806C7.77929 14.0876 8.53329 14.5457 9.16348 15.1485C9.79367 15.7512 10.2849 16.4841 10.603 17.296L10.694 17.546L11.5 19.906L12.306 17.546C12.5876 16.7207 13.0457 15.9667 13.6484 15.3365C14.2512 14.7063 14.984 14.2151 15.796 13.897L16.046 13.807L18.406 13L16.046 12.194C15.2207 11.9124 14.4667 11.4543 13.8365 10.8515C13.2063 10.2488 12.7151 9.51595 12.397 8.704L12.307 8.454L11.5 6.094ZM19.5 2C19.6871 2 19.8704 2.05248 20.0291 2.15147C20.1879 2.25046 20.3157 2.392 20.398 2.56L20.446 2.677L20.796 3.703L21.823 4.053C22.0105 4.1167 22.1748 4.23462 22.2952 4.39182C22.4156 4.54902 22.4866 4.73842 22.4993 4.93602C22.5119 5.13362 22.4656 5.33053 22.3662 5.50179C22.2668 5.67304 22.1188 5.81094 21.941 5.898L21.823 5.946L20.797 6.296L20.447 7.323C20.3832 7.51043 20.2652 7.6747 20.1079 7.79499C19.9506 7.91529 19.7612 7.98619 19.5636 7.99872C19.366 8.01125 19.1692 7.96484 18.998 7.86538C18.8268 7.76591 18.689 7.61787 18.602 7.44L18.554 7.323L18.204 6.297L17.177 5.947C16.9895 5.8833 16.8251 5.76538 16.7048 5.60819C16.5844 5.45099 16.5133 5.26158 16.5007 5.06398C16.4881 4.86638 16.5344 4.66947 16.6338 4.49821C16.7332 4.32696 16.8811 4.18906 17.059 4.102L17.177 4.054L18.203 3.704L18.553 2.677C18.6204 2.47943 18.748 2.30791 18.9178 2.1865C19.0876 2.06509 19.2912 1.99987 19.5 2Z" fill="white" />
            </svg>
            Upscale Images
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [files, setFiles] = useState([]);

  const handleFilesAdded = (newFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleUpscale = (options) => {
    if (files.length === 0) {
      console.log("No files to upscale.");
      // In a real app, you would show a toast notification here
      return;
    }
    console.log("Upscaling images with options:", options);
    console.log("Files to process:", files);
    // ONNX model integration will be added here
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white font-sans">
      <Navigation />
      <main className="container mx-auto px-4 pb-12">
        <HeroSection />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 flex flex-col gap-8">
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
