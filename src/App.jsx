import React, { useState } from "react";
import { Upload, X } from "lucide-react";

export default function ImageEnhancer() {
  const [images, setImages] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [scale, setScale] = useState("2x");

  const handleFiles = (files) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    setImages((prev) => [...prev, ...imageFiles]);
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
    <div className="flex min-h-screen bg-gray-50 p-6 gap-9">
      {/* LEFT SIDE: Upload + Image List */}
      <div className="flex flex-col w-[60%]">
        {/* Upload Section */}
        <div
          className="flex-0 h-[60vh] border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-white"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="w-10 h-10 text-gray-500 mb-2" />
          <p className="text-gray-600">Drag & Drop images here</p>
          <p className="text-gray-500 text-sm">or</p>
          <label className="mt-2 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600">
            Browse
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleBrowse}
              className="hidden"
            />
          </label>
        </div>

        {/* Uploaded Images List */}
        <div className="mt-4 space-y-3 overflow-y-auto max-h-[30vh] pr-2">
          {images.map((img, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white p-2 rounded shadow-sm border"
            >
              <div className="flex items-center gap-3">
                <img
                  src={URL.createObjectURL(img)}
                  alt={img.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <span className="text-sm text-gray-700">{img.name}</span>
              </div>
              <button
                onClick={() => removeImage(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: Controls */}
      <div className="w-[40%] flex flex-col gap-6 sticky top-6">
        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Choose Model</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="">Select a model</option>
            <option value="model1">Model 1</option>
            <option value="model2">Model 2</option>
            <option value="model3">Model 3</option>
          </select>
        </div>

        {/* Scale Options */}
        <div>
          <label className="block text-sm font-medium mb-1">Upscale</label>
          <div className="flex gap-3">
            {["2x", "3x", "4x"].map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`px-4 py-2 rounded border ${
                  scale === s
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 shadow">
          Enhance Images
        </button>
      </div>
    </div>
  );
}
