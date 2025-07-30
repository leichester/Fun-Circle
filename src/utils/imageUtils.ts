// Image compression and processing utilities
export interface ImageCompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  maxSizeKB: number;
  format: 'jpeg' | 'webp' | 'png';
}

export const DEFAULT_PROFILE_PIC_OPTIONS: ImageCompressionOptions = {
  maxWidth: 250,
  maxHeight: 250,
  quality: 0.6,
  maxSizeKB: 150, // 150KB target
  format: 'jpeg'
};

/**
 * Compresses an image file efficiently with progressive quality reduction
 */
export const compressImage = (
  file: File,
  options: ImageCompressionOptions = DEFAULT_PROFILE_PIC_OPTIONS
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const aspectRatio = width / height;

        // More aggressive resizing for faster processing
        if (width > height) {
          if (width > options.maxWidth) {
            width = options.maxWidth;
            height = width / aspectRatio;
          }
        } else {
          if (height > options.maxHeight) {
            height = options.maxHeight;
            width = height * aspectRatio;
          }
        }

        // Ensure dimensions are integers and reasonable
        width = Math.floor(width);
        height = Math.floor(height);
        
        // Cap minimum size to avoid tiny images
        if (width < 50 || height < 50) {
          const scale = Math.max(50 / width, 50 / height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Use better image rendering
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }

        // Try compression with progressive quality reduction
        const tryCompress = (quality: number, attempt: number = 1) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              const sizeKB = blob.size / 1024;
              console.log(`Compression attempt ${attempt}: ${sizeKB.toFixed(1)}KB at ${Math.round(quality * 100)}% quality`);

              // Accept if size is good or we've tried enough
              if (sizeKB <= options.maxSizeKB || quality <= 0.3 || attempt >= 4) {
                console.log(`Final compressed size: ${sizeKB.toFixed(1)}KB`);
                resolve(blob);
              } else {
                // Try with lower quality
                tryCompress(Math.max(0.3, quality - 0.15), attempt + 1);
              }
            },
            `image/${options.format}`,
            quality
          );
        };

        // Start compression
        tryCompress(options.quality);

      } catch (error) {
        reject(new Error(`Image processing failed: ${error}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL to load the image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validates if a file is a valid image
 */
export const validateImageFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeMB = 5; // Reduced from 10MB for faster processing

  if (!allowedTypes.includes(file.type)) {
    return 'Please select a valid image file (JPEG, PNG, or WebP)';
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File size must be less than ${maxSizeMB}MB for faster upload`;
  }

  // Warn about very large files
  if (file.size > 2 * 1024 * 1024) {
    console.warn(`Large file detected: ${(file.size / 1024 / 1024).toFixed(2)}MB. This may take longer to process.`);
  }

  return null;
};

/**
 * Creates a preview URL for an image file
 */
export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revokes an image preview URL to free memory
 */
export const revokeImagePreview = (url: string): void => {
  URL.revokeObjectURL(url);
};
