import { storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'success' | 'error';
  downloadURL?: string;
  error?: string;
}

export const uploadImageWithProgress = (
  file: File,
  path: string,
  onProgress: (progress: UploadProgress) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create storage reference
      const storageRef = ref(storage, path);
      
      // Create upload task with resumable upload
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress callback
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress({
            progress,
            status: 'uploading'
          });
        },
        (error) => {
          // Error callback
          console.error('Upload error:', error);
          const errorMessage = error.message || 'Upload failed';
          onProgress({
            progress: 0,
            status: 'error',
            error: errorMessage
          });
          reject(new Error(errorMessage));
        },
        async () => {
          // Success callback
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress({
              progress: 100,
              status: 'success',
              downloadURL
            });
            resolve(downloadURL);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get download URL';
            onProgress({
              progress: 100,
              status: 'error',
              error: errorMessage
            });
            reject(new Error(errorMessage));
          }
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start upload';
      onProgress({
        progress: 0,
        status: 'error',
        error: errorMessage
      });
      reject(new Error(errorMessage));
    }
  });
};

export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Return original if compression fails
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};
