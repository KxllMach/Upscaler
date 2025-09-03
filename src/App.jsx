import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Helper Data & Components ---
const AI_MODELS = [
  {
    id: 'model.onnx',
    name: 'SwinIR',
    description: 'A powerful Transformer-based model for high-quality, general-purpose upscaling.',
    url: 'https://huggingface.co/KxllMach/Upscaler-Models/resolve/main/model.onnx'
  },
  {
    id: 'RealESRGAN_x4plus_anime_4B32F.onnx',
    name: 'ESRGAN Anime',
    description: 'Specialized model for anime and cartoon images with enhanced detail preservation.',
    url: 'https://huggingface.co/KxllMach/Upscaler-Models/resolve/main/RealESRGAN_x4plus_anime_4B32F.onnx'
  },
  {
    id: 'real_esrgan_x4_fp16.onnx',
    name: 'Lite',
    description: 'Lightweight model for quick processing with moderate quality improvements.',
    url: 'https://huggingface.co/KxllMach/Upscaler-Models/resolve/main/real_esrgan_x4_fp16.onnx'
  },
];
const OUTPUT_FORMATS = ['PNG', 'JPEG', 'WEBP'];

const Button = ({ children, className = '', ...props }) => (
  <button className={`transition-colors ${className}`} {...props}>
    {children}
  </button>
);

// --- Performance Detection & Optimization ---
function getOptimalTileSize() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) return 64; // Fallback
    
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const memoryInfo = navigator.deviceMemory || 4; // GB, fallback to 4GB
    
    // Estimate optimal tile size
    if (isMobile) {
        return memoryInfo >= 6 ? 96 : 64;
    } else {
        if (memoryInfo >= 8 && maxTextureSize >= 4096) return 128;
        if (memoryInfo >= 4 && maxTextureSize >= 2048) return 96;
        return 64;
    }
}

// --- UI Component Definitions ---
const Navigation = () => (
    <nav className="flex w-full max-w-screen-xl mx-auto justify-between items-center px-4 sm:px-8 md:px-16 py-6">
        <div className="font-bold text-2xl text-white italic" style={{ fontFamily: "'General Sans', sans-serif" }}>
            SafeScale
        </div>
        <div className="hidden md:flex items-center gap-9">
            <a href="#features" className="text-[#9D9D9D] font-medium hover:text-white">Features</a>
            <a href="#how-it-works" className="text-[#9D9D9D] font-medium hover:text-white">How it Works</a>
            <a href="#coffee" className="text-[#9D9D9D] font-medium hover:text-white">Buy Me a Coffee</a>
        </div>
        <Button className="bg-[#7B33F7] hover:bg-purple-700 text-white font-bold text-lg px-6 py-3 rounded-xl">
            Get Started
        </Button>
    </nav>
);

const HeroSection = () => (
    <div className="flex flex-col items-center text-center max-w-4xl mx-auto px-4 mt-12 mb-16">
        <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
            AI-Powered Private Image Upscaling<br />Natively on YOUR Device
        </h1>
        <p className="font-bold text-base text-[#9D9D9D] leading-relaxed max-w-md">
            Upscale your images on your device's hardware. No spying, No cloud, No Stress
        </p>
    </div>
);

const FileUpload = ({ onFilesAdded }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const handleDrop = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')); if (files.length > 0) onFilesAdded(files); }, [onFilesAdded]);
    const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }, []);
    const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }, []);
    const handleFileInput = useCallback((e) => { const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/')); if (files.length > 0) onFilesAdded(files); }, [onFilesAdded]);

    return (
        <div className={`relative h-96 w-full border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-colors ${isDragOver ? 'border-[#7B33F7] bg-purple-900/20' : 'border-[#374151]'}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
            <div className="w-14 h-14 rounded-xl bg-gray-500/10 flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#9CA3AF]"><path d="M12 15L12 3M12 3L16 7M12 3L8 7M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            <div className="flex flex-col items-center gap-3">
                <p className="font-medium text-[#9CA3AF]">Drag & Drop Images Here</p>
                <p className="font-medium text-[#9D9D9D]">or</p>
                <Button className="bg-[#7B33F7] hover:bg-purple-700 text-white font-medium text-base px-9 py-3 rounded-lg" onClick={() => document.getElementById('file-input')?.click()}>Browse</Button>
            </div>
            <input id="file-input" type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />
        </div>
    );
};

const FileList = ({ files, onRemoveFile }) => {
    const [fileInfos, setFileInfos] = useState([]);
    useEffect(() => { const objectUrls = []; const processFiles = async () => { const infos = await Promise.all(files.map(async (file) => { const preview = URL.createObjectURL(file); objectUrls.push(preview); const dimensions = await new Promise((resolve) => { const img = new Image(); img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight }); img.onerror = () => resolve({ width: 0, height: 0 }); img.src = preview; }); return { file, preview, dimensions }; })); setFileInfos(infos); }; if (files.length > 0) processFiles(); else setFileInfos([]); return () => { objectUrls.forEach(url => URL.revokeObjectURL(url)); }; }, [files]);
    const formatFileSize = (bytes) => (bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)}KB` : `${(bytes / (1024 * 1024)).toFixed(1)}MB`);
    if (files.length === 0) return null;

    return (
        <div className="w-full bg-[#1F2937] border border-[#374151] rounded-[2.5rem] p-4 sm:p-6 md:p-9">
            <div className="space-y-4">
                {fileInfos.map((info, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#111827] rounded-3xl p-4">
                        <div className="flex items-center gap-4"><img src={info.preview} alt={info.file.name} className="w-16 h-16 object-cover rounded-2xl" /><div className="flex flex-col gap-2"><h3 className="text-sm sm:text-base font-medium text-white truncate max-w-[150px] sm:max-w-xs">{info.file.name}</h3><div className="flex items-center gap-2 text-[#9CA3AF] text-xs sm:text-base">{info.dimensions?.width > 0 && (<><span>{info.dimensions.width}x{info.dimensions.height}</span><div className="w-1 h-1 bg-[#9CA3AF] rounded-full" /></>)}<span>{formatFileSize(info.file.size)}</span></div></div></div>
                        <button onClick={() => onRemoveFile(index)} className="w-8 h-8 flex-shrink-0 flex items-center justify-center hover:bg-gray-700/50 rounded-full"><svg width="12" height="16" viewBox="0 0 12 16" fill="none" className="text-[#9CA3AF]"><path d="M1.7219 2.29377C1.33127 1.90315 0.696899 1.90315 0.306274 2.29377C-0.0843506 2.6844 -0.0843506 3.31877 0.306274 3.7094L4.60002 8.00002L0.309399 12.2938C-0.0812256 12.6844 -0.0812256 13.3188 0.309399 13.7094C0.700024 14.1 1.3344 14.1 1.72502 13.7094L6.01565 9.41565L10.3094 13.7063C10.7 14.0969 11.3344 14.0969 11.725 13.7063C12.1157 13.3156 12.1157 12.6813 11.725 12.2906L7.43127 8.00002L11.7219 3.70627C12.1125 3.31565 12.1125 2.68127 11.7219 2.29065C11.3313 1.90002 10.6969 1.90002 10.3063 2.29065L6.01565 6.5844L1.7219 2.29377Z" fill="currentColor" /></svg></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UpscaleOptions = ({ onUpscale, disabled = false, modelLoadingState }) => {
    const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
    const [selectedFormat, setSelectedFormat] = useState('PNG');
    const currentModelDetails = AI_MODELS.find(model => model.id === selectedModel);
    const handleUpscaleClick = () => onUpscale({ model: AI_MODELS.find(m => m.id === selectedModel), format: selectedFormat });

    return (
        <div className="w-full max-w-lg bg-[#1F2937] rounded-[2.5rem] p-6 sm:p-9">
            <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white">Upscale Options</h2>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">AI Model</h3>
                        <div className="bg-[#111827] rounded-xl p-1 flex">
                            {AI_MODELS.map((model) => (
                                <button key={model.id} onClick={() => setSelectedModel(model.id)} className={`relative z-10 flex-1 py-3 px-2 text-center text-sm sm:text-base font-medium rounded-lg transition-colors ${selectedModel === model.id ? 'bg-[#7B33F7] text-white' : 'text-white hover:bg-white/5'}`}>{model.name}</button>
                            ))}
                        </div>
                        <div className="bg-[#111827] rounded-xl p-6 min-h-[7rem] flex items-center justify-center">
                            {modelLoadingState.isLoading ? (
                                <div className="text-center">
                                    <div className="w-8 h-8 border-2 border-[#7B33F7] border-t-transparent rounded-full mx-auto mb-2 animate-spin"></div>
                                    <p className="text-[#9D9D9D] text-sm">
                                        Loading model...
                                    </p>
                                </div>
                            ) : (
                                <p className="text-base text-[#9D9D9D]">{currentModelDetails?.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Output Format</h3>
                        <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)} className="w-full bg-[#111827] rounded-xl p-6 text-base font-medium text-white border border-transparent appearance-none focus:ring-2 focus:ring-[#7B33F7] focus:outline-none">
                            {OUTPUT_FORMATS.map(format => <option key={format} value={format} className="bg-[#1F2937]">{format}</option>)}
                        </select>
                    </div>
                    <Button onClick={handleUpscaleClick} disabled={disabled} className="w-full bg-[#7B33F7] hover:bg-purple-700 disabled:bg-purple-700/50 disabled:cursor-not-allowed text-white font-bold text-xl px-6 py-4 rounded-xl flex items-center justify-center gap-2">
                        <svg width="25" height="24" viewBox="0 0 25 24" fill="none"><path d="M9.60698 5.448C10.205 3.698 12.623 3.645 13.332 5.289L13.392 5.449L14.199 7.809C14.3839 8.35023 14.6828 8.84551 15.0754 9.26142C15.468 9.67734 15.9453 10.0042 16.475 10.22L16.692 10.301L19.052 11.107C20.802 11.705 20.855 14.123 19.212 14.832L19.052 14.892L16.692 15.699C16.1506 15.8838 15.6551 16.1826 15.239 16.5753C14.8229 16.9679 14.4959 17.4452 14.28 17.975L14.199 18.191L13.393 20.552C12.795 22.302 10.377 22.355 9.66898 20.712L9.60698 20.552L8.80098 18.192C8.61616 17.6506 8.31735 17.1551 7.92472 16.739C7.53209 16.3229 7.05478 15.9959 6.52498 15.78L6.30898 15.699L3.94898 14.893C2.19798 14.295 2.14498 11.877 3.78898 11.169L3.94898 11.107L6.30898 10.301C6.85022 10.1161 7.34549 9.81719 7.76141 9.42457C8.17732 9.03195 8.50419 8.55469 8.71998 8.025L8.80098 7.809L9.60698 5.448ZM19.5 2C19.9142 2 20.25 2.33579 20.25 2.75V2.75L20.565 3.659L21.474 3.974C21.8882 4.10103 22.052 4.59179 21.8411 4.93113L21.8411 4.93113L21.182 5.959L21.497 6.868C21.624 7.28221 21.3151 7.705 20.871 7.705H20.871L19.962 7.39L19.053 7.705C18.6388 7.83203 18.25 7.46947 18.25 7.025V7.025L18.565 6.116L17.656 5.801C17.2418 5.67397 17.078 5.18321 17.2889 4.84387L17.2889 4.84387L17.948 3.816L17.633 2.907C17.506 2.49279 17.8149 2.07 18.259 2.07H18.259L19.168 2.385L19.5 2Z" fill="white" /></svg>
                        Upscale Images
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component with All Optimizations ---
export default function App() {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [modelLoadingState, setModelLoadingState] = useState({ isLoading: false, progress: 0 });
    const workerPool = useRef([]);
    const progressRef = useRef(0);
    const modelLoaded = useRef(null);
    const modelBuffer = useRef(null);

    // Get optimal performance settings
    const OPTIMAL_TILE_SIZE = useRef(getOptimalTileSize()).current;
    const TILE_OVERLAP = useRef(Math.max(4, Math.floor(OPTIMAL_TILE_SIZE / 16))).current;

    // Effect to set up optimized web worker pool
    useEffect(() => {
        const numWorkers = navigator.hardwareConcurrency || 4;
        const workerCode = `
            let session;
            let tileCache = new Map();
            const MAX_CACHE_SIZE = 50;
            
            self.importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');
            ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

            // Fast tensor operations
            class FastTensorOps {
                static convertRGBAToFloat32(imageData, width, height) {
                    const { data } = imageData;
                    const float32Data = new Float32Array(3 * width * height);
                    const pixelCount = width * height;
                    
                    // Vectorized conversion
                    for (let i = 0; i < pixelCount; i++) {
                        const idx = i * 4;
                        float32Data[i] = data[idx] / 255.0;
                        float32Data[i + pixelCount] = data[idx + 1] / 255.0;
                        float32Data[i + 2 * pixelCount] = data[idx + 2] / 255.0;
                    }
                    
                    return float32Data;
                }
                
                static convertFloat32ToRGBA(outputData, width, height) {
                    const pixelCount = width * height;
                    const imageData = new ImageData(width, height);
                    const data = imageData.data;
                    
                    for (let i = 0; i < pixelCount; i++) {
                        const idx = i * 4;
                        data[idx] = Math.min(255, Math.max(0, outputData[i] * 255));
                        data[idx + 1] = Math.min(255, Math.max(0, outputData[i + pixelCount] * 255));
                        data[idx + 2] = Math.min(255, Math.max(0, outputData[i + 2 * pixelCount] * 255));
                        data[idx + 3] = 255;
                    }
                    
                    return imageData;
                }
            }

            // Generate simple hash for caching
            function simpleHash(data) {
                let hash = 0;
                const step = Math.max(1, Math.floor(data.length / 1000));
                for (let i = 0; i < data.length; i += step) {
                    hash = ((hash << 5) - hash + data[i]) & 0xffffffff;
                }
                return hash.toString(36);
            }

            self.onmessage = async (event) => {
                const { type, payload, workerId } = event.data;

                if (type === 'loadModel') {
                    try {
                        const { modelBuffer } = payload;
                        if (!session) { 
                            session = await ort.InferenceSession.create(modelBuffer, { 
                                executionProviders: ['webgl', 'wasm'],
                                graphOptimizationLevel: 'all'
                            });
                        }
                        self.postMessage({ type: 'modelLoaded', workerId });
                    } catch (error) {
                        self.postMessage({ type: 'error', payload: { name: error.name, message: error.message }, workerId });
                    }
                }

                if (type === 'upscaleStrip') {
                    try {
                        if (!session) throw new Error('Session not ready.');
                        const { stripBitmap, stripInfo } = payload;
                        
                        const TILE_SIZE = ${OPTIMAL_TILE_SIZE};
                        const TILE_OVERLAP = ${TILE_OVERLAP};
                        const STEP = TILE_SIZE - TILE_OVERLAP;
                        const SCALE = 4;
                        
                        // Create output canvas for the upscaled strip
                        const outputCanvas = new OffscreenCanvas(stripBitmap.width * SCALE, stripBitmap.height * SCALE);
                        const outputCtx = outputCanvas.getContext('2d');
                        
                        // Process tiles within the strip with optimized stitching
                        for (let y = 0; y < stripBitmap.height; y += STEP) {
                            if (y + TILE_SIZE > stripBitmap.height && y > 0) {
                                y = stripBitmap.height - TILE_SIZE;
                            }
                            
                            for (let x = 0; x < stripBitmap.width; x += STEP) {
                                if (x + TILE_SIZE > stripBitmap.width && x > 0) {
                                    x = stripBitmap.width - TILE_SIZE;
                                }

                                // Extract tile
                                const tileCanvas = new OffscreenCanvas(TILE_SIZE, TILE_SIZE);
                                const tileCtx = tileCanvas.getContext('2d');
                                tileCtx.drawImage(stripBitmap, x, y, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);
                                
                                // Get tile data and check cache
                                const tileImageData = tileCtx.getImageData(0, 0, TILE_SIZE, TILE_SIZE);
                                const tileHash = simpleHash(tileImageData.data);
                                
                                let upscaledImageData;
                                if (tileCache.has(tileHash)) {
                                    upscaledImageData = tileCache.get(tileHash);
                                } else {
                                    // Run inference
                                    const float32Data = FastTensorOps.convertRGBAToFloat32(tileImageData, TILE_SIZE, TILE_SIZE);
                                    const inputTensor = new ort.Tensor('float32', float32Data, [1, 3, TILE_SIZE, TILE_SIZE]);
                                    const feeds = { [session.inputNames[0]]: inputTensor };
                                    const results = await session.run(feeds);
                                    const outputTensor = results[session.outputNames[0]];
                                    
                                    upscaledImageData = FastTensorOps.convertFloat32ToRGBA(outputTensor.data, TILE_SIZE * SCALE, TILE_SIZE * SCALE);
                                    
                                    // Cache result
                                    if (tileCache.size >= MAX_CACHE_SIZE) {
                                        const firstKey = tileCache.keys().next().value;
                                        tileCache.delete(firstKey);
                                    }
                                    tileCache.set(tileHash, upscaledImageData);
                                }

                                // Create upscaled tile canvas
                                const upscaledTileCanvas = new OffscreenCanvas(TILE_SIZE * SCALE, TILE_SIZE * SCALE);
                                const upscaledTileCtx = upscaledTileCanvas.getContext('2d');
                                upscaledTileCtx.putImageData(upscaledImageData, 0, 0);
                                
                                // Optimized stitching logic to eliminate seams
                                const isFirstCol = x === 0;
                                const isFirstRow = y === 0;
                                const isLastCol = x + STEP >= stripBitmap.width;
                                const isLastRow = y + STEP >= stripBitmap.height;

                                let srcX, srcY, destX, destY, copyWidth, copyHeight;

                                if (isFirstCol && isFirstRow) {
                                    srcX = 0; srcY = 0;
                                    destX = x * SCALE; destY = y * SCALE;
                                    copyWidth = (TILE_SIZE - TILE_OVERLAP / 2) * SCALE;
                                    copyHeight = (TILE_SIZE - TILE_OVERLAP / 2) * SCALE;
                                } else if (isFirstCol && isLastRow) {
                                    srcX = 0; srcY = (TILE_OVERLAP / 2) * SCALE;
                                    destX = x * SCALE; destY = (y + TILE_OVERLAP / 2) * SCALE;
                                    copyWidth = (TILE_SIZE - TILE_OVERLAP / 2) * SCALE;
                                    copyHeight = (TILE_SIZE - TILE_OVERLAP / 2) * SCALE;
                                } else if (isLastCol && isFirstRow) {
                                    srcX = (TILE_OVERLAP / 2) * SCALE; srcY = 0;
                                    destX = (x + TILE_OVERLAP / 2) * SCALE; destY = y * SCALE;
                                    copyWidth = (TILE_SIZE - TILE_OVERLAP / 2) * SCALE;
                                    copyHeight = (TILE_SIZE - TILE_OVERLAP / 2) * SCALE;
                                } else if (isLastCol && isLastRow) {
                                    srcX = (TILE_OVERLAP / 2) * SCALE; srcY = (TILE_OVERLAP / 2) * SCALE;
                                    destX = (x + TILE_OVERLAP / 2) * SCALE; destY = (y + TILE_OVERLAP / 2) * SCALE;
                                    copyWidth = (TILE_SIZE - TILE_OVERLAP / 2) * SCALE;
                                    copyHeight = (TILE_SIZE - TILE_OVERLAP / 2) * SCALE;
                                } else if (isFirstCol) {
                                    srcX = 0; srcY = (TILE_OVERLAP / 2) * SCALE;
                                    destX = x * SCALE; destY = (y + TILE_OVERLAP / 2) * SCALE;
                                    copyWidth = (TILE_SIZE - TILE_OVERLAP / 2) * SCALE;
                                    copyHeight = STEP * SCALE;
                                } else if (isLastCol) {
                                    srcX = (TILE_OVERLAP / 2) * SCALE; srcY = (TILE_OVERLAP / 2) * SCALE;
                                    destX = (x + TILE_OVERLAP / 2) * SCALE; destY = (y + TILE_OVERLAP / 2) * SCALE;
                                    copyWidth = (TILE_SIZE - TILE_OVERLAP / 2) * SCALE;
                                    copyHeight = STEP * SCALE;
                                } else if (isFirstRow) {
                                    srcX = (TILE_OVERLAP / 2) * SCALE; srcY = 0;
                                    destX = (x + TILE_OVERLAP / 2) * SCALE; destY = y * SCALE;
                                    copyWidth = STEP * SCALE;
                                    copyHeight = (TILE_SIZE - TILE_OVERLAP / 2) * SCALE;
                                } else if (isLastRow) {
                                    srcX = (TILE_OVERLAP / 2) * SCALE; srcY = (TILE_OVERLAP / 2) * SCALE;
                                    destX = (x + TILE_OVERLAP / 2) * SCALE; destY = (y + TILE_OVERLAP / 2) * SCALE;
                                    copyWidth = STEP * SCALE;
                                    copyHeight = (TILE_SIZE - TILE_OVERLAP / 2) * SCALE;
                                } else {
                                    srcX = (TILE_OVERLAP / 2) * SCALE; srcY = (TILE_OVERLAP / 2) * SCALE;
                                    destX = (x + TILE_OVERLAP / 2) * SCALE; destY = (y + TILE_OVERLAP / 2) * SCALE;
                                    copyWidth = STEP * SCALE;
                                    copyHeight = STEP * SCALE;
                                }

                                // Apply optimized stitching
                                outputCtx.drawImage(upscaledTileCanvas, srcX, srcY, copyWidth, copyHeight, destX, destY, copyWidth, copyHeight);

                                self.postMessage({ type: 'tilingProgress', workerId: workerId });
                                
                                if (x + TILE_SIZE >= stripBitmap.width) break;
                            }
                            if (y + TILE_SIZE >= stripBitmap.height) break;
                        }

                        // Create final cropped strip
                        const finalWidth = stripInfo.originalWidth * SCALE;
                        const finalHeight = stripInfo.originalHeight * SCALE;
                        const croppedCanvas = new OffscreenCanvas(finalWidth, finalHeight);
                        const croppedCtx = croppedCanvas.getContext('2d');
                        
                        const cropX = stripInfo.paddingLeft * SCALE;
                        const cropY = stripInfo.paddingTop * SCALE;
                        
                        croppedCtx.drawImage(outputCanvas, cropX, cropY, finalWidth, finalHeight, 0, 0, finalWidth, finalHeight);
                        
                        const finalStripBitmap = croppedCanvas.transferToImageBitmap();
                        self.postMessage({ 
                            type: 'upscaleComplete', 
                            payload: { 
                                upscaledStrip: finalStripBitmap, 
                                stripInfo: stripInfo
                            }, 
                            workerId 
                        }, [finalStripBitmap]);
                        
                    } catch (error) {
                         self.postMessage({ type: 'error', payload: { name: error.name, message: error.message, stack: error.stack }, workerId });
                    }
                }
            };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        
        for (let i = 0; i < numWorkers; i++) {
            workerPool.current.push(new Worker(workerUrl));
        }

        return () => {
            workerPool.current.forEach(w => w.terminate());
            URL.revokeObjectURL(workerUrl);
        };
    }, [OPTIMAL_TILE_SIZE, TILE_OVERLAP]);

    useEffect(() => {
        const fontLink = document.createElement('link');
        fontLink.href = "https://fonts.googleapis.com/css2?family=General+Sans:ital,wght@0,400;0,700&family=Space+Grotesk:wght@400;500;700&display=swap";
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
        const styleTag = document.createElement('style');
        styleTag.innerHTML = `body { font-family: 'Space Grotesk', sans-serif; }`;
        document.head.appendChild(styleTag);
        return () => {
            if (document.head.contains(fontLink)) document.head.removeChild(fontLink);
            if (document.head.contains(styleTag)) document.head.removeChild(styleTag);
        };
    }, []);

    const handleFilesAdded = (newFiles) => { setUploadedFiles((prev) => [...prev, ...newFiles]); };
    const handleRemoveFile = (index) => { setUploadedFiles((prev) => prev.filter((_, i) => i !== index)); };

    const handleUpscale = async ({ model, format }) => {
        if (uploadedFiles.length === 0 || workerPool.current.length === 0) return;

        setIsProcessing(true);
        setProcessingStatus('Loading AI model...');
        setModelLoadingState({ isLoading: true, progress: 0 });

        // Load model if needed with improved error handling
        if (model.id !== modelLoaded.current) {
            try {
                setProcessingStatus('Downloading model...');
                const response = await fetch(model.url);
                if (!response.ok) throw new Error(`Failed to download model: ${response.statusText}`);
                modelBuffer.current = await response.arrayBuffer();
                setProcessingStatus('Initializing workers...');

                const modelReadyPromises = workerPool.current.map((worker, i) =>
                    new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error('Worker initialization timeout'));
                        }, 30000);

                        const listener = (event) => {
                            const { type, workerId, payload } = event.data;
                            if (workerId !== i) return;
                            if (type === 'modelLoaded') {
                                clearTimeout(timeout);
                                worker.removeEventListener('message', listener);
                                resolve();
                            } else if (type === 'error') {
                                clearTimeout(timeout);
                                worker.removeEventListener('message', listener);
                                reject(new Error(payload.message));
                            }
                        };
                        worker.addEventListener('message', listener);
                        worker.postMessage({ type: 'loadModel', payload: { modelBuffer: modelBuffer.current }, workerId: i });
                    })
                );
                await Promise.all(modelReadyPromises);
                modelLoaded.current = model.id;
            } catch (error) {
                console.error('Model loading failed:', error);
                alert(`Failed to load model: ${error.message}`);
                setIsProcessing(false);
                setModelLoadingState({ isLoading: false, progress: 0 });
                return;
            }
        }
        
        setModelLoadingState({ isLoading: false, progress: 100 });

        // Process each file with memory-efficient strip processing
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const originalBitmap = await createImageBitmap(file);

            const STEP = OPTIMAL_TILE_SIZE - TILE_OVERLAP;
            
            // Calculate improved padding for seamless tiling
            const paddedWidth = Math.ceil(originalBitmap.width / STEP) * STEP + TILE_OVERLAP;
            const paddedHeight = Math.ceil(originalBitmap.height / STEP) * STEP + TILE_OVERLAP;

            // Create padded canvas with reflection padding for better edge handling
            const paddedCanvas = new OffscreenCanvas(paddedWidth, paddedHeight);
            const paddedCtx = paddedCanvas.getContext('2d');
            
            // Draw original image
            paddedCtx.drawImage(originalBitmap, 0, 0);
            
            // Add reflection padding for better tile boundaries
            if (paddedWidth > originalBitmap.width) {
                paddedCtx.drawImage(originalBitmap, 
                    originalBitmap.width - (paddedWidth - originalBitmap.width), 0, 
                    paddedWidth - originalBitmap.width, originalBitmap.height,
                    originalBitmap.width, 0, paddedWidth - originalBitmap.width, originalBitmap.height);
            }
            if (paddedHeight > originalBitmap.height) {
                paddedCtx.drawImage(originalBitmap, 
                    0, originalBitmap.height - (paddedHeight - originalBitmap.height), 
                    originalBitmap.width, paddedHeight - originalBitmap.height,
                    0, originalBitmap.height, originalBitmap.width, paddedHeight - originalBitmap.height);
            }

            // Calculate optimized strips for better performance
            const numWorkers = workerPool.current.length;
            const OPTIMAL_STRIP_HEIGHT = Math.max(128, Math.ceil(paddedHeight / numWorkers / STEP) * STEP);
            const STRIP_OVERLAP = 32; // Larger overlap for seamless strip blending

            const totalTiles = Math.ceil(paddedWidth / STEP) * Math.ceil(paddedHeight / STEP);
            progressRef.current = 0;
            
            setProcessingStatus('Processing... 0%');

            // Create final output canvas
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = originalBitmap.width * 4;
            finalCanvas.height = originalBitmap.height * 4;
            const finalCtx = finalCanvas.getContext('2d');

            const upscalePromises = workerPool.current.map((worker, workerId) =>
                new Promise(async (resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Processing timeout'));
                    }, 300000); // 5 minute timeout

                    // Calculate strip boundaries with improved overlap handling
                    const stripStartY = workerId * OPTIMAL_STRIP_HEIGHT;
                    const stripEndY = Math.min((workerId + 1) * OPTIMAL_STRIP_HEIGHT, paddedHeight);
                    const stripHeight = stripEndY - stripStartY;

                    if (stripHeight <= 0) {
                        clearTimeout(timeout);
                        resolve(); 
                        return;
                    }
                    
                    // Add overlap for seamless stitching between strips
                    const actualStartY = Math.max(0, stripStartY - (workerId > 0 ? STRIP_OVERLAP : 0));
                    const actualEndY = Math.min(paddedHeight, stripEndY + (workerId < numWorkers - 1 ? STRIP_OVERLAP : 0));
                    const actualStripHeight = actualEndY - actualStartY;
                    
                    // Extract strip with WebGL acceleration if available
                    const stripCanvas = new OffscreenCanvas(paddedWidth, actualStripHeight);
                    const stripCtx = stripCanvas.getContext('2d');
                    stripCtx.drawImage(paddedCanvas, 0, actualStartY, paddedWidth, actualStripHeight, 0, 0, paddedWidth, actualStripHeight);
                    const stripBitmap = await stripCanvas.transferToImageBitmap();
                    
                    // Prepare strip information with enhanced blending data
                    const stripInfo = {
                        startY: stripStartY,
                        originalWidth: paddedWidth,
                        originalHeight: stripHeight,
                        paddingLeft: 0,
                        paddingTop: stripStartY - actualStartY,
                        workerId: workerId,
                        hasTopBlend: workerId > 0,
                        hasBottomBlend: workerId < numWorkers - 1,
                        blendSize: STRIP_OVERLAP
                    };
                    
                    const listener = (event) => {
                        const { type, payload, workerId: msgWorkerId } = event.data;
                        if (msgWorkerId !== workerId) return;
                        
                        if (type === 'tilingProgress') {
                            progressRef.current++;
                            setProcessingStatus(`Processing... ${Math.min(99, ((progressRef.current / totalTiles) * 100)).toFixed(0)}%`);
                        } else if (type === 'upscaleComplete') {
                            clearTimeout(timeout);
                            
                            // Enhanced strip blending for seamless results
                            const finalY = payload.stripInfo.startY * 4;
                            
                            if (payload.stripInfo.hasTopBlend && workerId > 0) {
                                // Apply feathering blend with previous strip
                                const blendHeight = payload.stripInfo.blendSize * 4;
                                const tempCanvas = document.createElement('canvas');
                                tempCanvas.width = payload.upscaledStrip.width;
                                tempCanvas.height = blendHeight;
                                const tempCtx = tempCanvas.getContext('2d');
                                
                                // Draw the overlapping region
                                tempCtx.drawImage(payload.upscaledStrip, 0, 0, tempCanvas.width, blendHeight, 0, 0, tempCanvas.width, blendHeight);
                                
                                // Apply gradient blend
                                tempCtx.globalCompositeOperation = 'destination-in';
                                const gradient = tempCtx.createLinearGradient(0, 0, 0, blendHeight);
                                gradient.addColorStop(0, 'rgba(255,255,255,0)');
                                gradient.addColorStop(1, 'rgba(255,255,255,1)');
                                tempCtx.fillStyle = gradient;
                                tempCtx.fillRect(0, 0, tempCanvas.width, blendHeight);
                                
                                // Composite with existing content
                                finalCtx.globalCompositeOperation = 'source-over';
                                finalCtx.drawImage(tempCanvas, 0, finalY);
                                
                                // Draw non-overlapping part
                                finalCtx.drawImage(payload.upscaledStrip, 0, blendHeight, payload.upscaledStrip.width, payload.upscaledStrip.height - blendHeight, 0, finalY + blendHeight, payload.upscaledStrip.width, payload.upscaledStrip.height - blendHeight);
                            } else {
                                // First strip or no blending needed
                                finalCtx.drawImage(payload.upscaledStrip, 0, finalY);
                            }
                            
                            worker.removeEventListener('message', listener);
                            resolve();
                        } else if (type === 'error') {
                            clearTimeout(timeout);
                            worker.removeEventListener('message', listener);
                            console.error('Error from worker:', payload);
                            reject(new Error(payload.message));
                        }
                    };
                    
                    worker.addEventListener('message', listener);
                    worker.postMessage({
                        type: 'upscaleStrip',
                        payload: { 
                            stripBitmap: stripBitmap, 
                            stripInfo: stripInfo
                        },
                        workerId: workerId
                    }, [stripBitmap]);
                })
            );

            try {
                await Promise.all(upscalePromises);
                setProcessingStatus('Finalizing...');

                // Enhanced output with better compression
                const outputFormat = format.toLowerCase();
                let quality = 0.95;
                if (outputFormat === 'jpeg') quality = 0.92;
                if (outputFormat === 'webp') quality = 0.90;

                // Download the result with optimized naming
                const link = document.createElement('a');
                const fileExtension = outputFormat;
                const originalName = file.name.split('.').slice(0, -1).join('.');
                link.download = `${originalName}_upscaled_${OPTIMAL_TILE_SIZE}x4.${fileExtension}`;
                link.href = finalCanvas.toDataURL(`image/${fileExtension}`, quality);
                link.click();

                setProcessingStatus('Complete!');
                
            } catch (error) {
                console.error(`Failed to process ${file.name}:`, error);
                alert(`Failed to process ${file.name}: ${error.message}`);
                break;
            }
        }

        // Clean up and reset
        setTimeout(() => {
            setIsProcessing(false);
            setProcessingStatus('');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#111827]">
            <Navigation />
            <div className="w-full px-4 sm:px-8 md:px-16"><div className="h-px bg-[#374151]"></div></div>
            <HeroSection />
            <main className="w-full px-4 sm:px-8 md:px-16 pb-16">
                <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 items-start">
                    <div className="w-full xl:w-[60%] space-y-8">
                        <FileUpload onFilesAdded={handleFilesAdded} />
                        <FileList files={uploadedFiles} onRemoveFile={handleRemoveFile} />
                        {uploadedFiles.length > 0 && (
                            <div className="bg-[#1F2937] border border-[#374151] rounded-[2.5rem] p-6">
                                <div className="flex items-center gap-4 text-[#9CA3AF]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                    </svg>
                                    <div className="text-sm">
                                        <p className="font-medium text-white">Performance Mode: {OPTIMAL_TILE_SIZE}px tiles</p>
                                        <p>Optimized for your device • {navigator.hardwareConcurrency || 4} worker threads • {TILE_OVERLAP}px overlap</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="w-full xl:w-[40%] xl:max-w-[540px]">
                        <UpscaleOptions onUpscale={handleUpscale} disabled={uploadedFiles.length === 0 || isProcessing} modelLoadingState={modelLoadingState} />
                    </div>
                </div>
            </main>
            {isProcessing && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1F2937] rounded-3xl p-8 text-center shadow-lg max-w-md mx-4">
                        <div className="animate-spin w-8 h-8 border-2 border-[#7B33F7] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-white text-lg mb-2">{modelLoadingState.isLoading ? 'Loading Model...' : 'Processing Images...'}</p>
                        <p className="text-[#9D9D9D] text-sm">{processingStatus}</p>
                        <div className="mt-4 bg-[#111827] rounded-full h-2 overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-[#7B33F7] to-purple-600 transition-all duration-500"
                                style={{width: `${modelLoadingState.isLoading ? 50 : Math.min(99, (progressRef.current / (Math.ceil(uploadedFiles.length) * 10)) * 100)}%`}}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
