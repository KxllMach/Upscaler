export const AI_MODELS = [
  {
    id: 'model.onnx',
    name: 'SwinIR',
    description: 'A powerful Transformer-based model for high-quality, general-purpose upscaling.',
    url: 'https://huggingface.co/KxllMach/Upscaler-Models/resolve/main/model.onnx'
  },
  {
    id: 'RealESRGAN_x4plus_anime_4B32F.onnx',
    name: 'ESRGAN Anime',
    description: 'Specialized model for anime and cartoon images with enhanced detail preservation.',
    url: 'https://huggingface.co/KxllMach/Upscaler-Models/resolve/main/RealESRGAN_x4plus_anime_4B32F.onnx'
  },
  {
    id: 'real_esrgan_x4_fp16.onnx',
    name: 'Lite',
    description: 'Lightweight model for quick processing with moderate quality improvements.',
    url: 'https://huggingface.co/KxllMach/Upscaler-Models/resolve/main/real_esrgan_x4_fp16.onnx'
  },
];

export const OUTPUT_FORMATS = ['PNG', 'JPEG', 'WEBP'];
