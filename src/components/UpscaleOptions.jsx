import React, { useState } from 'react';
import { Button } from './Button';
import { AI_MODELS, OUTPUT_FORMATS } from '../constants/models';

export const UpscaleOptions = ({ onUpscale, disabled = false, modelLoadingState }) => {
    const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
    const [selectedFormat, setSelectedFormat] = useState('PNG');
    
    const currentModelDetails = AI_MODELS.find(model => model.id === selectedModel);
    
    const handleUpscaleClick = () => {
        onUpscale({ model: AI_MODELS.find(m => m.id === selectedModel), format: selectedFormat });
    };

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
                                    <p className="text-[#9D9D9D] text-sm">Loading model...</p>
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
