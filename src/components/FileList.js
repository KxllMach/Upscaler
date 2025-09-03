import React, { useState, useEffect } from 'react';

export const FileList = ({ files, onRemoveFile }) => {
    const [fileInfos, setFileInfos] = useState([]);

    useEffect(() => {
        const objectUrls = [];
        const processFiles = async () => {
            const infos = await Promise.all(files.map(async (file) => {
                const preview = URL.createObjectURL(file);
                objectUrls.push(preview);
                const dimensions = await new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
                    img.onerror = () => resolve({ width: 0, height: 0 });
                    img.src = preview;
                });
                return { file, preview, dimensions };
            }));
            setFileInfos(infos);
        };

        if (files.length > 0) {
            processFiles();
        } else {
            setFileInfos([]);
        }

        return () => {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [files]);

    const formatFileSize = (bytes) => (bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)}KB` : `${(bytes / (1024 * 1024)).toFixed(1)}MB`);

    if (files.length === 0) return null;

    return (
        <div className="w-full bg-[#1F2937] border border-[#374151] rounded-[2.5rem] p-4 sm:p-6 md:p-9">
            <div className="space-y-4">
                {fileInfos.map((info, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#111827] rounded-3xl p-4">
                        <div className="flex items-center gap-4">
                            <img src={info.preview} alt={info.file.name} className="w-16 h-16 object-cover rounded-2xl" />
                            <div className="flex flex-col gap-2">
                                <h3 className="text-sm sm:text-base font-medium text-white truncate max-w-[150px] sm:max-w-xs">{info.file.name}</h3>
                                <div className="flex items-center gap-2 text-[#9CA3AF] text-xs sm:text-base">
                                    {info.dimensions?.width > 0 && (
                                        <>
                                            <span>{info.dimensions.width}x{info.dimensions.height}</span>
                                            <div className="w-1 h-1 bg-[#9CA3AF] rounded-full" />
                                        </>
                                    )}
                                    <span>{formatFileSize(info.file.size)}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => onRemoveFile(index)} className="w-8 h-8 flex-shrink-0 flex items-center justify-center hover:bg-gray-700/50 rounded-full">
                            <svg width="12" height="16" viewBox="0 0 12 16" fill="none" className="text-[#9CA3AF]"><path d="M1.7219 2.29377C1.33127 1.90315 0.696899 1.90315 0.306274 2.29377C-0.0843506 2.6844 -0.0843506 3.31877 0.306274 3.7094L4.60002 8.00002L0.309399 12.2938C-0.0812256 12.6844 -0.0812256 13.3188 0.309399 13.7094C0.700024 14.1 1.3344 14.1 1.72502 13.7094L6.01565 9.41565L10.3094 13.7063C10.7 14.0969 11.3344 14.0969 11.725 13.7063C12.1157 13.3156 12.1157 12.6813 11.725 12.2906L7.43127 8.00002L11.7219 3.70627C12.1125 3.31565 12.1125 2.68127 11.7219 2.29065C11.3313 1.90002 10.6969 1.90002 10.3063 2.29065L6.01565 6.5844L1.7219 2.29377Z" fill="currentColor" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
