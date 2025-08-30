import React, { useState } from "react";

export default function UpscalerUI() {
  const [files, setFiles] = useState([]);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">AI Image Upscaler</h1>
      </header>

      <div className="flex max-w-7xl mx-auto gap-[36px]">
        {/* Left Panel - Image Input */}
        <div
          className="flex-1 basis-[60%] border-2 border-dashed border-gray-400 bg-white rounded-xl flex flex-col justify-center items-center p-6 text-center cursor-pointer hover:border-blue-500"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <p className="text-gray-500 mb-4">Drag & Drop Images Here</p>
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
            Browse
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>

          {/* Show uploaded files */}
          {files.length > 0 && (
            <div className="mt-6 w-full text-left">
              <h2 className="font-semibold mb-2">Uploaded Files</h2>
              <ul className="space-y-2">
                {files.map((file, idx) => (
                  <li
                    key={idx}
                    className="bg-gray-50 px-3 py-2 rounded-md shadow-sm border"
                  >
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Panel - Controls */}
        <div className="flex-1 basis-[40%] bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Settings</h2>

          {/* Model Selector */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-4 border rounded-xl text-center cursor-pointer hover:bg-blue-50">
              <h3 className="font-semibold">General</h3>
              <p className="text-xs text-gray-500">Best for photos</p>
            </div>
            <div className="p-4 border rounded-xl text-center cursor-pointer hover:bg-blue-50">
              <h3 className="font-semibold">Anime</h3>
              <p className="text-xs text-gray-500">Best for anime/art</p>
            </div>
            <div className="p-4 border rounded-xl text-center cursor-pointer hover:bg-blue-50">
              <h3 className="font-semibold">Lite</h3>
              <p className="text-xs text-gray-500">Fastest, low VRAM</p>
            </div>
          </div>

          {/* Scale Options */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Scale</label>
            <select className="w-full border rounded-lg px-3 py-2">
              <option>2x</option>
              <option>4x</option>
            </select>
          </div>

          {/* Format Options */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Format</label>
            <select className="w-full border rounded-lg px-3 py-2">
              <option>PNG</option>
              <option>JPEG</option>
              <option>WebP</option>
            </select>
          </div>

          {/* Advanced Settings */}
          <details className="mb-6">
            <summary className="cursor-pointer font-medium">Advanced</summary>
            <div className="mt-2 space-y-3">
              <div>
                <label className="block mb-1 text-sm">Tile Size</label>
                <input
                  type="number"
                  defaultValue={256}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Overlap</label>
                <input
                  type="number"
                  defaultValue={16}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </details>

          {/* Progress Section */}
          <div>
            <h2 className="font-semibold text-lg mb-2">Progress</h2>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div className="bg-blue-500 h-3 rounded-full w-[45%]"></div>
            </div>
            <p className="text-sm text-gray-500">Batch progress: 45%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
