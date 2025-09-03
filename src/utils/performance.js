export function getOptimalTileSize() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) return 64; // Fallback
    
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const memoryInfo = navigator.deviceMemory || 4; // GB, fallback to 4GB
    
    if (isMobile) {
        return memoryInfo >= 6 ? 96 : 64;
    } else {
        if (memoryInfo >= 16 && maxTextureSize >= 8192) return 128;
        if (memoryInfo >= 8 && maxTextureSize >= 4096) return 96;
        return 64;
    }
}
