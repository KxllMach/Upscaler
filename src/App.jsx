import React, { useState } from "react";
import { Upload, X } from "lucide-react";

export default function App() {
  const [images, setImages] = useState([]);

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    const newImages = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleBrowse = (e) => {
    handleFiles(e.target.files);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex gap-9">
      {/* Left side - Image Upload */}
      <div
        className="flex-1 flex flex-col border-2 border-dashed border-gray-400 rounded-xl bg-white items-center justify-center p-8 cursor-pointer hover:bg-gray-50 transition"
        style={{ flexBasis: "60%" }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <Upload className="w-12 h-12 text-gray-500 mb-4" />
        <p className="text-gray-600">Drag & Drop Images here</p>
        <p className="text-gray-400 text-sm">or click to browse</p>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          multiple
          onChange={handleBrowse}
          className="hidden"
        />
      </div>

      {/* Right side - Controls */}
      <div className="flex-1 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">AI Image Upscaler</h1>

        {/* Model Selector */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: "General", desc: "Best for photos" },
            { title: "Anime", desc: "Best for anime/art" },
            { title: "Lite", desc: "Fastest, low VRAM" },
          ].map((m, i) => (
            <div
              key={i}
              className="p-4 border rounded-xl bg-white shadow hover:shadow-md cursor-pointer"
            >
              <h2 className="font-semibold">{m.title}</h2>
              <p className="text-sm text-gray-500">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Settings Panel */}
        <div className="p-4 border rounded-xl bg-white shadow space-y-4">
          <div>
            <label className="block text-sm font-medium">Scale</label>
            <select className="mt-1 w-full border rounded-md p-2">
              <option>2x</option>
              <option>4x</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Format</label>
            <select className="mt-1 w-full border rounded-md p-2">
              <option>PNG</option>
              <option>WebP</option>
              <option>JPEG</option>
            </select>
          </div>
        </div>
      </div>

      {/* Uploaded Images List */}
      <div className="absolute bottom-8 left-8 right-8 bg-white rounded-xl p-4 shadow space-y-3 max-h-48 overflow-y-auto">
        {images.map((img, index) => (
          <div
            key={index}
            className="flex items-center justify-between border rounded-lg p-2"
          >
            <div className="flex items-center gap-3">
              <img
                src={img.url}
                alt={img.file.name}
                className="w-18 h-18 object-cover rounded-md border"
                style={{ width: "72px", height: "72px" }}
              />
              <span className="text-gray-700">{img.file.name}</span>
            </div>
            <button
              onClick={() => removeImage(index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
