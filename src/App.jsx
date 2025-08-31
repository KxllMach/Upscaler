import { useState } from "react"
import { Trash2 } from "lucide-react"

export default function App() {
  const [images, setImages] = useState([])

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const filePreviews = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...filePreviews])
  }

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  return (
    <div className="flex h-screen">
      {/* LEFT SIDE - image input + thumbnails */}
      <div className="w-3/5 p-4 overflow-y-auto border-r border-gray-200">
        <h2 className="text-lg font-semibold mb-2">Upload Images</h2>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="mb-4 block w-full border rounded-lg p-2"
        />

        {/* Uploaded images list */}
        <div className="space-y-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="flex items-center gap-3 border p-2 rounded-lg shadow-sm"
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-18 h-18 object-cover rounded-md border"
                style={{ width: "72px", height: "72px" }}
              />
              <div className="flex-1">
                <p className="text-sm truncate">{img.name}</p>
              </div>
              <button
                onClick={() => removeImage(img.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE - control panel */}
      <div className="w-2/5 p-4 bg-gray-50 sticky top-0 h-screen">
        <h2 className="text-lg font-semibold mb-4">Controls</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Select Model
        </button>
        {/* Add more controls here */}
      </div>
    </div>
  )
}
