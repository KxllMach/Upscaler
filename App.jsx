import React, { useState } from "react";

export default function UpscalerUI() {
  const [images, setImages] = useState([]);

  const handleFiles = (files) => {
    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleUploadClick = (e) => {
    e.target.value = null; // reset for re-uploads
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center p-8 text-white">
      <h1 className="text-3xl font-semibold mb-6">AI Image Upscaler</h1>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-600 rounded-2xl p-10 w-full max-w-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          id="fileInput"
          onChange={(e) => handleFiles(e.target.files)}
          onClick={handleUploadClick}
        />
        <label
          htmlFor="fileInput"
          className="flex flex-col items-center gap-3 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 8l-3-3m3 3l3-3"
            />
          </svg>
          <p className="text-gray-400">
            Drag & drop images here or{" "}
            <span className="text-indigo-400">browse</span>
          </p>
        </label>
      </div>

      {/* Gallery Preview */}
      {images.length > 0 && (
        <div className="mt-8 w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative rounded-xl overflow-hidden border border-gray-700 group"
            >
              <img
                src={img.preview}
                alt={`upload-${i}`}
                className="w-full h-40 object-cover"
              />
              {/* Progress Bar Placeholder */}
              <div className="absolute bottom-0 left-0 w-full bg-gray-800 h-2">
                <div
                  className="bg-indigo-500 h-2 transition-all"
                  style={{ width: `${img.progress}%` }}
                ></div>
              </div>
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                {img.file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
