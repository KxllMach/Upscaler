// src/App.jsx
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function App() {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const [selectedModel, setSelectedModel] = useState("general");

  const handleDrop = (e) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...newFiles]);
  };

  const handleBrowse = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
  };

  const models = [
    { id: "general", title: "General", desc: "Best for photos" },
    { id: "anime", title: "Anime", desc: "Best for anime/art" },
    { id: "lite", title: "Lite", desc: "Fastest, lower VRAM" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div className="text-xl font-bold">[ Logo ]</div>
        <h1 className="text-2xl font-semibold">AI Image Upscaler</h1>
      </div>

      {/* Upload Section */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-400 rounded-xl p-10 text-center bg-white shadow-sm"
      >
        <p className="mb-3 text-gray-500">Drag & Drop images here</p>
        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Browse
          <input type="file" multiple hidden onChange={handleBrowse} />
        </label>
      </div>

      {/* Model Selector */}
      <h2 className="text-lg font-semibold mt-8 mb-4">Select Model</h2>
      <div className="grid grid-cols-3 gap-4">
        {models.map((m) => (
          <div
            key={m.id}
            className={`cursor-pointer border rounded-xl p-4 shadow-sm transition ${
              selectedModel === m.id ? "border-blue-600 bg-blue-50" : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedModel(m.id)}
          >
            <h3 className="font-medium">{m.title}</h3>
            <p className="text-sm text-gray-500">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Settings */}
      <h2 className="text-lg font-semibold mt-8 mb-4">Settings</h2>
      <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <label className="block mb-1 font-medium">Scale</label>
          <select className="w-full border rounded-md p-2">
            <option>2x</option>
            <option>4x</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Format</label>
          <select className="w-full border rounded-md p-2">
            <option>PNG</option>
            <option>WebP</option>
            <option>JPEG</option>
          </select>
        </div>
        {/* Advanced */}
        <div className="col-span-2 mt-4">
          <details className="border rounded-md p-3">
            <summary className="cursor-pointer font-medium">Advanced</summary>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Tile Size</label>
                <input
                  type="number"
                  className="w-full border rounded-md p-2"
                  defaultValue={256}
                />
              </div>
              <div>
                <label className="block mb-1">Overlap</label>
                <input
                  type="number"
                  className="w-full border rounded-md p-2"
                  defaultValue={16}
                />
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Progress Section */}
      <h2 className="text-lg font-semibold mt-8 mb-4">Progress</h2>
      <div className="bg-white rounded-xl shadow-sm p-4">
        {files.length === 0 && <p className="text-gray-400">No files uploaded yet</p>}
        {files.map((file, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{file.name}</span>
              <span>{progress[file.name] || 0}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-blue-600 rounded"
                style={{ width: `${progress[file.name] || 0}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
