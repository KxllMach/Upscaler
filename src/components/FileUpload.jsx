import React, { useState, useCallback, useRef } from 'react';
import { Button } from './Button';

export const FileUpload = ({ onFilesAdded }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);
    
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) onFilesAdded(files);
    }, [onFilesAdded]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleFileInput = useCallback((e) => {
        const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) onFilesAdded(files);
    }, [onFilesAdded]);

    return (
        <div 
            className={`relative h-96 w-full border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-colors ${isDragOver ? 'border-[#7B33F7] bg-purple-900/20' : 'border-[#374151]'}`} 
            onDrop={handleDrop} 
            onDragOver={handleDragOver} 
            onDragLeave={handleDragLeave}
        >
            <div className="w-14 h-14 rounded-xl bg-gray-500/10 flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#9CA3AF]"><path d="M12 15L12 3M12 3L16 7M12 3L8 7M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            <div className="flex flex-col items-center gap-3">
                <p className="font-medium text-[#9CA3AF]">Drag & Drop Images Here</p>
                <p className="font-medium text-[#9D9D9D]">or</p>
                <Button className="bg-[#7B33F7] hover:bg-purple-700 text-white font-medium text-base px-9 py-3 rounded-lg" onClick={() => fileInputRef.current?.click()}>Browse</Button>
            </div>
            <input ref={fileInputRef} id="file-input" type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />
        </div>
    );
};
