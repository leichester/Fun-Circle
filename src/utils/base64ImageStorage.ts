// Base64 image storage utilities for Firestore (free tier compatible)

export interface ImageData {
  base64: string;
  filename: string;
  size: number;
  type: string;
  compressed: boolean;
}

export const compressImageToBase64 = (
  file: File, 
  maxWidth: number = 400, 
  quality: number = 0.6
): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    // Check file size limit (100KB for base64 storage)
    if (file.size > 100 * 1024) {
      // Try to compress larger files
      console.log('📷 Compressing large image...');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions to keep within reasonable size
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = Math.floor(img.width * ratio);
      const newHeight = Math.floor(img.height * ratio);
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Draw compressed image
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Convert to base64 with compression
      const base64 = canvas.toDataURL('image/jpeg', quality);
      
      // Check final size (Firestore has 1MB document limit)
      const sizeInBytes = Math.round((base64.length * 3) / 4);
      
      if (sizeInBytes > 500 * 1024) { // 500KB limit for safety
        reject(new Error(`Image too large after compression (${Math.round(sizeInBytes/1024)}KB). Please choose a smaller image or upgrade to Firebase Blaze plan for full storage.`));
        return;
      }
      
      resolve({
        base64,
        filename: file.name,
        size: sizeInBytes,
        type: 'image/jpeg',
        compressed: true
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const validateImageForBase64 = (file: File): string | null => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'Please select a valid image file.';
  }
  
  // Check file size (recommend under 200KB for base64)
  if (file.size > 200 * 1024) {
    return 'Image is large. It will be compressed to fit free storage limits.';
  }
  
  // Supported formats
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedTypes.includes(file.type)) {
    return 'Please use JPEG, PNG, or WebP format.';
  }
  
  return null; // No error
};
