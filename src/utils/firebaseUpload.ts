// Alternative Firebase Storage upload method to bypass CORS issues
import { getAuth } from 'firebase/auth';

export interface UploadResult {
  downloadURL: string;
  success: boolean;
  error?: string;
}

export async function uploadImageToFirebase(
  file: File | Blob, 
  fileName: string,
  onProgress?: (progress: string) => void
): Promise<UploadResult> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    onProgress?.('Getting upload token...');
    
    // Get Firebase auth token
    const token = await user.getIdToken();
    
    onProgress?.('Uploading file...');
    
    // Use Firebase REST API for upload (bypasses CORS)
    const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o?name=${encodeURIComponent(fileName)}&uploadType=media`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type || 'image/jpeg',
      },
      body: file
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    onProgress?.('Getting download URL...');
    
    // Get download URL
    const downloadUrlResponse = await fetch(
      `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(fileName)}?alt=media&token=${result.downloadTokens}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    if (!downloadUrlResponse.ok) {
      throw new Error('Failed to get download URL');
    }

    // Construct the download URL
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(fileName)}?alt=media&token=${result.downloadTokens}`;

    return {
      downloadURL,
      success: true
    };

  } catch (error) {
    console.error('Firebase upload error:', error);
    return {
      downloadURL: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
}
