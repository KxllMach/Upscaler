import React, { useState } from "react";

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(file);
      setPreviewUrl(url);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">AI Image Upscaler</h1>

      <div className="flex flex-col items-center space-y-4">
        <label className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
          Upload Image
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>

        {previewUrl && (
          <div className="grid grid-cols-2 gap-6 mt-6">
            {/* Original */}
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-2">Original</h2>
              <img src={previewUrl} alt="Original" className="max-w-xs rounded-lg shadow" />
            </div>

            {/* Placeholder for Upscaled */}
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-2">Upscaled (Preview)</h2>
              <div className="max-w-xs w-full h-64 flex items-center justify-center border-2 border-dashed rounded-lg bg-white text-gray-400">
                AI Result Here
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
