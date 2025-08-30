import React, { useState, useRef } from "react";

const App = () => {
  const [images, setImages] = useState([]);
  const [selectedModel, setSelectedModel] = useState("default-model");
  const dropRef = useRef(null);

  // Handle file selection
  const handleFiles = (files) => {
    const newFiles = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newFiles]);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add("border-indigo-500", "bg-indigo-50");
  };

  const handleDragLeave = () => {
    dropRef.current.classList.remove("border-indigo-500", "bg-indigo-50");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropRef.current.classList.remove("border-indigo-500", "bg-indigo-50");
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Image Upscaler</h1>

      {/* Model Selection */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Choose Model
        </label>
        <select
          className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="default-model">Default Model</option>
          <option value="superres-x2">Super Resolution ×2</option>
          <option value="superres-x4">Super Resolution ×4</option>
        </select>
      </div>

      {/* Drag & Drop Zone */}
      <div
        ref={dropRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="w-full max-w-lg h-48 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-500 cursor-pointer transition"
        onClick={() => document.getElementById("fileInput").click()}
      >
        <p className="mb-2">Drag & Drop your images here</p>
        <p className="text-sm text-gray-400">or click to browse</p>
        <input
          id="fileInput"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Gallery Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 w-full max-w-lg">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="border rounded-lg overflow-hidden shadow-sm bg-white"
            >
              <img
                src={img.preview}
                alt="preview"
                className="w-full h-32 object-cover"
              />
              <div className="p-2 text-sm text-gray-600 truncate">
                {img.file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
