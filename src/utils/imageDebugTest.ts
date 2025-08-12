// Simple test utility to debug image compression
// You can call this from the browser console to test image compression

export const testImageCompression = async (file: File) => {
  console.log('Testing image compression for:', file.name);
  console.log('Original size:', Math.round(file.size / 1024), 'KB');
  
  try {
    const { compressImageToBase64 } = await import('./base64ImageStorage');
    const compressed = await compressImageToBase64(file);
    
    console.log('Compression successful!');
    console.log('Compressed size:', Math.round(compressed.size / 1024), 'KB');
    console.log('Base64 length:', compressed.base64.length);
    console.log('Base64 starts with:', compressed.base64.substring(0, 50) + '...');
    
    // Test if base64 is valid by creating an image
    const img = new Image();
    img.onload = () => {
      console.log('✅ Base64 image is valid and loadable');
      console.log('Image dimensions:', img.width, 'x', img.height);
    };
    img.onerror = () => {
      console.error('❌ Base64 image is invalid');
    };
    img.src = compressed.base64;
    
    return compressed;
  } catch (error) {
    console.error('Compression failed:', error);
    throw error;
  }
};

// Make it available globally in dev
if (import.meta.env.DEV) {
  (window as any).testImageCompression = testImageCompression;
}
