import React, { useState } from 'react';
import { Upload, X, Rocket } from 'lucide-react';

// --- Header Component ---
const Header = () => (
  <header className="flex justify-between items-center p-6 px-10 text-white">
    <h1 className="text-xl font-bold">SafeScale</h1>
    <nav className="flex items-center gap-6 text-sm text-gray-300">
      <a href="#" className="hover:text-white">Features</a>
      <a href="#" className="hover:text-white">How It Works</a>
      <a href="#" className="hover:text-white">Buy Me a Coffee</a>
    </nav>
    <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg">
      Get Started
    </button>
  </header>
);

// --- Hero Component ---
const Hero = () => (
    <div className="text-center my-16">
        <h1 className="text-5xl font-bold text-white leading-tight">
            AI-Powered Private Image Upscaling
        </h1>
        <h2 className="text-5xl font-bold text-gray-300 leading-tight">
            Natively on <span className="text-purple-400">YOUR</span> Device
        </h2>
        <p className="text-gray-400 mt-4">
            Upscale your images on your device's hardware.
            <br />
            No spying, No cloud, No Stress
        </p>
    </div>
);

// --- Upload Area Component ---
const UploadArea = ({ onFiles }) => {
    const handleDrop = (e) => {
        e.preventDefault();
        onFiles(e.dataTransfer.files);
    };

    const handleBrowse = (e) => {
        onFiles(e.target.files);
    };

    return (
        <div 
            className="border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center p-16 bg-[#1a1a2e]"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            <Upload className="w-10 h-10 text-gray-400 mb-4" />
            <p className="text-gray-300">Drag & Drop Images Here</p>
            <p className="text-gray-500 text-sm my-2">or</p>
            <label className="bg-purple-600 text-white px-5 py-2 rounded-lg cursor-pointer hover:bg-purple-700">
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
    );
};

// --- Image List Component ---
const ImageList = ({ images, onRemove }) => (
    <div className="mt-6 space-y-3">
        {images.map((img, index) => (
            <div key={index} className="flex items-center justify-between bg-[#1a1a2e] p-3 rounded-lg border border-gray-700">
                <div className="flex items-center gap-4">
                    <img src={URL.createObjectURL(img)} alt={img.name} className="w-12 h-12 object-cover rounded-md" />
                    <div>
                        <p className="text-sm font-medium text-white">{img.name}</p>
                        <p className="text-xs text-gray-400">1920x1080 • 1.7MB</p> {/* Placeholder info */}
                    </div>
                </div>
                <button onClick={() => onRemove(index)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>
        ))}
    </div>
);

// --- AI Model Selector Component ---
const ModelSelector = () => {
    const [selectedModel, setSelectedModel] = useState("ESRGAN");
    const models = [
        { id: "ESRGAN", name: "ESRGAN" },
        { id: "ESRGAN Anime", name: "ESRGAN Anime" },
        { id: "Lite", name: "Lite" }
    ];
    const description = "General purpose model for most images. Provides a good balance between detail and artifact reduction.";

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">AI Model</label>
            <div className="bg-[#12121c] p-1 rounded-lg">
                <div className="grid grid-cols-3 gap-1">
                    {models.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`w-full px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                                selectedModel === model.id
                                    ? 'bg-purple-600 text-white font-semibold'
                                    : 'text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            {model.name}
                        </button>
                    ))}
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 px-1">{description}</p>
        </div>
    );
};

// --- Options Panel Component ---
const OptionsPanel = () => {
    return (
        <div className="bg-[#1a1a2e] p-6 rounded-xl border border-gray-700 flex flex-col gap-6">
            <h3 className="text-white font-semibold">Upscale Options</h3>
            <ModelSelector />

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Output Format</label>
                <select className="w-full bg-[#12121c] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500">
                    <option>PNG</option>
                    <option>JPEG</option>
                    <option>WebP</option>
                </select>
            </div>

            <button className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700">
                <Rocket className="w-5 h-5" />
                Upscale Images
            </button>
        </div>
    );
};

// --- Main App Component ---
export default function App() {
    const [images, setImages] = useState([]);

    const handleFiles = (files) => {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
        setImages(prev => [...prev, ...imageFiles]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen bg-[#12121c] font-sans">
            <Header />
            <main className="container mx-auto px-10 pb-10">
                <Hero />
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    
                    <div className="lg:col-span-3">
                        <UploadArea onFiles={handleFiles} />
                        {images.length > 0 && <ImageList images={images} onRemove={removeImage} />}
                    </div>

                    <div className="lg:col-span-2">
                        <OptionsPanel />
                    </div>

                </div>
            </main>
        </div>
    );
}
