import React, { useState, useEffect, useCallback, useRef } from 'react';

// Import components
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { UpscaleOptions } from './components/UpscaleOptions';

// Import constants and utils
import { AI_MODELS } from './constants/models';
import { getOptimalTileSize } from './utils/performance';

export default function App() {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [modelLoadingState, setModelLoadingState] = useState({ isLoading: false, progress: 0 });
    const workerPool = useRef([]);
    const progressRef = useRef(0);
    const totalTilesRef = useRef(0);
    const modelLoaded = useRef(null);
    const modelBuffer = useRef(null);
    const mainContentRef = useRef(null);

    const OPTIMAL_TILE_SIZE = useRef(getOptimalTileSize()).current;
    const TILE_OVERLAP = useRef(Math.max(8, Math.floor(OPTIMAL_TILE_SIZE / 8))).current;

    const scrollToMain = () => {
        mainContentRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const numWorkers = navigator.hardwareConcurrency || 4;
        for (let i = 0; i < numWorkers; i++) {
            // This is the modern way to load a worker from a separate file
            const worker = new Worker(new URL('./workers/upscale.worker.js', import.meta.url));
            workerPool.current.push(worker);
        }

        return () => {
            workerPool.current.forEach(w => w.terminate());
            workerPool.current = [];
        };
    }, []);

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

    const handleFilesAdded = (newFiles) => { 
        setUploadedFiles((prev) => [...prev, ...newFiles]);
        setTimeout(scrollToMain, 100);
    };
    const handleRemoveFile = (index) => { setUploadedFiles((prev) => prev.filter((_, i) => i !== index)); };

    const handleUpscale = async ({ model, format }) => {
        if (uploadedFiles.length === 0 || workerPool.current.length === 0) return;

        setIsProcessing(true);
        setProcessingStatus('Loading AI model...');
        setModelLoadingState({ isLoading: true, progress: 0 });

        if (model.id !== modelLoaded.current) {
            try {
                setProcessingStatus('Downloading model...');
                const response = await fetch(model.url);
                if (!response.ok) throw new Error(`Failed to download model: ${response.statusText}`);
                modelBuffer.current = await response.arrayBuffer();
                setProcessingStatus('Initializing workers...');

                const modelReadyPromises = workerPool.current.map((worker, i) =>
                    new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => reject(new Error('Worker initialization timeout')), 30000);
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

        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const originalBitmap = await createImageBitmap(file);

            const STEP = OPTIMAL_TILE_SIZE - TILE_OVERLAP;
            
            const paddedWidth = Math.ceil(originalBitmap.width / STEP) * STEP + TILE_OVERLAP;
            const paddedHeight = Math.ceil(originalBitmap.height / STEP) * STEP + TILE_OVERLAP;

            const paddedCanvas = new OffscreenCanvas(paddedWidth, paddedHeight);
            const paddedCtx = paddedCanvas.getContext('2d');
            paddedCtx.drawImage(originalBitmap, 0, 0);
            
            const numWorkers = workerPool.current.length;
            const baseStripHeight = Math.ceil(paddedHeight / numWorkers / STEP) * STEP;
            const STRIP_OVERLAP = TILE_OVERLAP * 2;

            totalTilesRef.current = Math.ceil(paddedWidth / STEP) * Math.ceil(paddedHeight / STEP);
            progressRef.current = 0;
            
            setProcessingStatus('Processing... 0%');

            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = originalBitmap.width * 4;
            finalCanvas.height = originalBitmap.height * 4;
            const finalCtx = finalCanvas.getContext('2d');

            const upscalePromises = workerPool.current.map((worker, workerId) =>
                new Promise(async (resolve, reject) => {
                    const stripStartY = workerId * baseStripHeight;
                    const stripEndY = Math.min((workerId + 1) * baseStripHeight, paddedHeight);
                    let stripHeight = stripEndY - stripStartY;

                    if (stripHeight <= 0) {
                        resolve(); 
                        return;
                    }
                    
                    const actualStartY = Math.max(0, stripStartY - (workerId > 0 ? STRIP_OVERLAP : 0));
                    const actualEndY = Math.min(paddedHeight, stripEndY + (workerId < numWorkers - 1 ? STRIP_OVERLAP : 0));
                    const actualStripHeight = actualEndY - actualStartY;
                    
                    if (actualStripHeight < OPTIMAL_TILE_SIZE) {
                        resolve();
                        return;
                    }

                    const stripCanvas = new OffscreenCanvas(paddedWidth, actualStripHeight);
                    const stripCtx = stripCanvas.getContext('2d');
                    stripCtx.drawImage(paddedCanvas, 0, actualStartY, paddedWidth, actualStripHeight, 0, 0, paddedWidth, actualStripHeight);
                    const stripBitmap = await stripCanvas.transferToImageBitmap();
                    
                    const stripInfo = {
                        startY: stripStartY,
                        originalWidth: paddedWidth,
                        originalHeight: stripHeight,
                        paddingLeft: 0,
                        paddingTop: stripStartY - actualStartY
                    };
                    
                    const listener = (event) => {
                        const { type, payload, workerId: msgWorkerId } = event.data;
                        if (msgWorkerId !== workerId) return;
                        
                        if (type === 'tilingProgress') {
                            progressRef.current++;
                            setProcessingStatus(`Processing... ${Math.min(99, ((progressRef.current / totalTilesRef.current) * 100)).toFixed(0)}%`);
                        } else if (type === 'upscaleComplete') {
                            const finalY = payload.stripInfo.startY * 4;
                            finalCtx.drawImage(payload.upscaledStrip, 0, finalY);
                            worker.removeEventListener('message', listener);
                            resolve();
                        } else if (type === 'error') {
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
                            stripInfo: stripInfo,
                            TILE_SIZE: OPTIMAL_TILE_SIZE,
                            TILE_OVERLAP: TILE_OVERLAP
                        },
                        workerId: workerId
                    }, [stripBitmap]);
                })
            );

            try {
                await Promise.all(upscalePromises);
                setProcessingStatus('Finalizing...');

                const outputFormat = format.toLowerCase();
                let quality = 1.0;
                if (outputFormat === 'jpeg') quality = 0.92;
                if (outputFormat === 'webp') quality = 0.90;

                const link = document.createElement('a');
                const fileExtension = outputFormat;
                const originalName = file.name.split('.').slice(0, -1).join('.');
                link.download = `${originalName}_SafeScale_${OPTIMAL_TILE_SIZE}x4.${fileExtension}`;
                link.href = finalCanvas.toDataURL(`image/${fileExtension}`, quality);
                link.click();

                setProcessingStatus('Complete!');
                
            } catch (error) {
                console.error(`Failed to process ${file.name}:`, error);
                alert(`Failed to process ${file.name}: ${error.message}`);
                break;
            }
        }

        setTimeout(() => {
            setIsProcessing(false);
            setProcessingStatus('');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#111827]">
            <Navigation onGetStartedClick={scrollToMain} />
            <div className="w-full px-4 sm:px-8 md:px-16"><div className="h-px bg-[#374151]"></div></div>
            <HeroSection />
            <main ref={mainContentRef} className="w-full px-4 sm:px-8 md:px-16 pb-16">
                <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 items-start">
                    <div className="w-full xl:w-[60%] space-y-8">
                        <FileUpload onFilesAdded={handleFilesAdded} />
                        <FileList files={uploadedFiles} onRemoveFile={handleRemoveFile} />
                        {uploadedFiles.length > 0 && (
                            <div className="bg-[#1F2937] border border-[#374151] rounded-[2.5rem] p-6">
                                <div className="flex items-center gap-4 text-[#9CA3AF]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
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
                                style={{width: `${modelLoadingState.isLoading ? 50 : (progressRef.current / (totalTilesRef.current || 1)) * 100}%`}}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
