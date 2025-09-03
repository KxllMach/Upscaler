// This file should be at src/workers/upscale.worker.js
let session;
self.importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

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
            const { stripBitmap, stripInfo, TILE_SIZE, TILE_OVERLAP } = payload;
            
            const STEP = TILE_SIZE - TILE_OVERLAP;
            const SCALE = 4;
            
            const outputCanvas = new OffscreenCanvas(stripBitmap.width * SCALE, stripBitmap.height * SCALE);
            const outputCtx = outputCanvas.getContext('2d');
            
            for (let y = 0; y < stripBitmap.height; y += STEP) {
                if (y > 0 && y + TILE_SIZE > stripBitmap.height) {
                    y = stripBitmap.height - TILE_SIZE;
                }
                
                for (let x = 0; x < stripBitmap.width; x += STEP) {
                    if (x > 0 && x + TILE_SIZE > stripBitmap.width) {
                        x = stripBitmap.width - TILE_SIZE;
                    }

                    const tileCanvas = new OffscreenCanvas(TILE_SIZE, TILE_SIZE);
                    const tileCtx = tileCanvas.getContext('2d');
                    tileCtx.drawImage(stripBitmap, x, y, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);
                    
                    const tileImageData = tileCtx.getImageData(0, 0, TILE_SIZE, TILE_SIZE);
                    const { data, width, height } = tileImageData;
                    const float32Data = new Float32Array(3 * width * height);
                    for (let i = 0; i < width * height; i++) {
                        float32Data[i] = data[i * 4] / 255.0;
                        float32Data[i + width * height] = data[i * 4 + 1] / 255.0;
                        float32Data[i + 2 * width * height] = data[i * 4 + 2] / 255.0;
                    }
                    
                    const inputTensor = new ort.Tensor('float32', float32Data, [1, 3, height, width]);
                    const feeds = { [session.inputNames[0]]: inputTensor };
                    const results = await session.run(feeds);
                    const outputTensor = results[session.outputNames[0]];

                    const upscaledTileCanvas = new OffscreenCanvas(TILE_SIZE * SCALE, TILE_SIZE * SCALE);
                    const upscaledTileCtx = upscaledTileCanvas.getContext('2d');
                    const upscaledImageData = upscaledTileCtx.createImageData(TILE_SIZE * SCALE, TILE_SIZE * SCALE);
                    const upscaledData = upscaledImageData.data;
                    const outputData = outputTensor.data;
                    const tileArea = TILE_SIZE * SCALE * TILE_SIZE * SCALE;

                    for (let ty = 0; ty < TILE_SIZE * SCALE; ty++) {
                        for (let tx = 0; tx < TILE_SIZE * SCALE; tx++) {
                            const pos = (ty * TILE_SIZE * SCALE + tx);
                            const r = Math.round(outputData[pos] * 255);
                            const g = Math.round(outputData[pos + tileArea] * 255);
                            const b = Math.round(outputData[pos + 2 * tileArea] * 255);
                            const idx = pos * 4;
                            upscaledData[idx] = r; upscaledData[idx + 1] = g; upscaledData[idx + 2] = b; upscaledData[idx + 3] = 255;
                        }
                    }
                    upscaledTileCtx.putImageData(upscaledImageData, 0, 0);
                    
                    const isFirstCol = x === 0;
                    const isFirstRow = y === 0;
                    const isLastCol = x + TILE_SIZE >= stripBitmap.width;
                    const isLastRow = y + TILE_SIZE >= stripBitmap.height;
                    
                    const sx = isFirstCol ? 0 : (TILE_OVERLAP / 2) * SCALE;
                    const sy = isFirstRow ? 0 : (TILE_OVERLAP / 2) * SCALE;
                    
                    const destX = x * SCALE + sx;
                    const destY = y * SCALE + sy;
                    
                    const copyWidth = (TILE_SIZE - (isFirstCol ? 0 : TILE_OVERLAP / 2) - (isLastCol ? 0 : TILE_OVERLAP / 2)) * SCALE;
                    const copyHeight = (TILE_SIZE - (isFirstRow ? 0 : TILE_OVERLAP / 2) - (isLastRow ? 0 : TILE_OVERLAP / 2)) * SCALE;

                    if (copyWidth > 0 && copyHeight > 0) {
                        outputCtx.drawImage(upscaledTileCanvas, sx, sy, copyWidth, copyHeight, destX, destY, copyWidth, copyHeight);
                    }
                    
                    self.postMessage({ type: 'tilingProgress', workerId: workerId });
                    if (x + TILE_SIZE >= stripBitmap.width) break;
                }
                if (y + TILE_SIZE >= stripBitmap.height) break;
            }

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
