import React, { useState, useEffect } from 'react';
import { useOffers } from '../contexts/FirebaseOffersContext';
import { manualCleanup, getCleanupStats, CleanupStats } from '../utils/imageCleanup';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ImageCleanupPanel: React.FC = () => {
  const { offers } = useOffers();
  const [isRunning, setIsRunning] = useState(false);
  const [lastStats, setLastStats] = useState<CleanupStats | null>(null);
  const [currentStats, setCurrentStats] = useState<CleanupStats | null>(null);

  useEffect(() => {
    // Load last cleanup stats on component mount
    const stats = getCleanupStats();
    setLastStats(stats);
  }, []);

  const runManualCleanup = async () => {
    setIsRunning(true);
    try {
      const updatePostFunction = async (postId: string, updateData: any) => {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          ...updateData,
          imageExpiredAt: Timestamp.fromDate(updateData.imageExpiredAt)
        });
      };

      const getPostsFunction = () => offers;
      const stats = await manualCleanup(getPostsFunction, updatePostFunction);
      setCurrentStats(stats);
      setLastStats(stats);
    } catch (error) {
      console.error('Manual cleanup failed:', error);
      alert('Cleanup failed. Check console for details.');
    } finally {
      setIsRunning(false);
    }
  };

  const getExpiredPostsCount = () => {
    return offers.filter(post => {
      if (!post.endDateTime) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return post.createdAt < thirtyDaysAgo && (post.imageData || post.imageUrl);
      }
      const endDate = new Date(post.endDateTime);
      return new Date() > endDate && (post.imageData || post.imageUrl);
    }).length;
  };

  const getTotalImageSize = () => {
    return offers.reduce((total, post) => {
      if (post.imageData?.size) return total + post.imageData.size;
      if (post.imageUrl) return total + (500 * 1024); // Estimate 500KB for legacy images
      return total;
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🧹 Image Storage Cleanup
      </h3>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{offers.length}</p>
          <p className="text-sm text-blue-700">Total Posts</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{getExpiredPostsCount()}</p>
          <p className="text-sm text-orange-700">Expired w/ Images</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {Math.round(getTotalImageSize() / (1024 * 1024))}MB
          </p>
          <p className="text-sm text-green-700">Total Image Storage</p>
        </div>
      </div>

      {/* Manual Cleanup Button */}
      <div className="mb-6">
        <button
          onClick={runManualCleanup}
          disabled={isRunning}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Running Cleanup...
            </>
          ) : (
            <>
              🧹 Run Manual Cleanup
            </>
          )}
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Removes images from expired posts to free up storage space
        </p>
      </div>

      {/* Cleanup Results */}
      {currentStats && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-green-800 mb-2">✅ Cleanup Complete!</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>📊 Posts checked: {currentStats.totalPostsChecked}</p>
            <p>🗑️ Images removed: {currentStats.imagesRemoved}</p>
            <p>💾 Storage freed: ~{currentStats.storageFreedKB}KB</p>
            <p>⏰ Completed: {currentStats.lastCleanup.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Last Cleanup Stats */}
      {lastStats && !currentStats && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-2">📊 Last Cleanup</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>🗑️ Images removed: {lastStats.imagesRemoved}</p>
            <p>💾 Storage freed: ~{lastStats.storageFreedKB}KB</p>
            <p>⏰ Date: {lastStats.lastCleanup.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-blue-800 mb-2">ℹ️ How It Works</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Posts with endDateTime past current time are considered expired</li>
          <li>• Posts without endDateTime expire after 30 days</li>
          <li>• Only image data is removed, post content remains intact</li>
          <li>• Automatic cleanup runs every 24 hours</li>
          <li>• Expired images show "The image is expired" message</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageCleanupPanel;
