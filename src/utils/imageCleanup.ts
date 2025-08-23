// Automatic image cleanup for expired posts
// This utility helps free up storage space by removing images from expired posts

export interface CleanupStats {
  totalPostsChecked: number;
  expiredPostsFound: number;
  imagesRemoved: number;
  storageFreedKB: number;
  lastCleanup: Date;
}

export const isPostExpired = (post: any): boolean => {
  if (!post.endDateTime) {
    // If no end date, consider posts older than 30 days as expired
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return post.createdAt < thirtyDaysAgo;
  }
  
  // Check if endDateTime has passed
  const endDate = new Date(post.endDateTime);
  return new Date() > endDate;
};

export const cleanupExpiredImages = async (
  posts: any[], 
  updatePostFunction: (id: string, data: any) => Promise<void>
): Promise<CleanupStats> => {
  console.log('🧹 Starting automatic image cleanup for expired posts...');
  
  const stats: CleanupStats = {
    totalPostsChecked: posts.length,
    expiredPostsFound: 0,
    imagesRemoved: 0,
    storageFreedKB: 0,
    lastCleanup: new Date()
  };
  
  for (const post of posts) {
    if (isPostExpired(post) && (post.imageData || post.imageUrl)) {
      stats.expiredPostsFound++;
      
      // Calculate storage that will be freed
      if (post.imageData?.size) {
        stats.storageFreedKB += Math.round(post.imageData.size / 1024);
      } else if (post.imageUrl) {
        // Estimate 500KB for legacy Firebase Storage images
        stats.storageFreedKB += 500;
      }
      
      try {
        // Remove image data and replace with expiration notice
        await updatePostFunction(post.id, {
          imageData: null,
          imageUrl: null,
          imageExpired: true,
          imageExpiredAt: new Date(),
          imageExpiredReason: 'Post expired - image removed to free storage space'
        });
        
        stats.imagesRemoved++;
        console.log(`🗑️ Removed image from expired post: ${post.title} (${post.id})`);
        
      } catch (error) {
        console.error(`❌ Failed to cleanup image for post ${post.id}:`, error);
      }
    }
  }
  
  if (stats.imagesRemoved > 0) {
    console.log(`✅ Cleanup complete! Removed ${stats.imagesRemoved} images, freed ~${stats.storageFreedKB}KB storage`);
  } else {
    console.log('✅ No expired images found to cleanup');
  }
  
  return stats;
};

export const scheduleAutomaticCleanup = (
  getPostsFunction: () => any[],
  updatePostFunction: (id: string, data: any) => Promise<void>,
  intervalHours: number = 24
) => {
  const intervalMs = intervalHours * 60 * 60 * 1000; // Convert hours to milliseconds
  
  const runCleanup = async () => {
    try {
      const posts = getPostsFunction();
      const stats = await cleanupExpiredImages(posts, updatePostFunction);
      
      // Store cleanup stats in localStorage for monitoring
      localStorage.setItem('imageCleanupStats', JSON.stringify(stats));
      
      return stats;
    } catch (error) {
      console.error('❌ Automatic cleanup failed:', error);
    }
  };
  
  // Run initial cleanup
  runCleanup();
  
  // Schedule recurring cleanup
  const intervalId = setInterval(runCleanup, intervalMs);
  
  console.log(`🔄 Scheduled automatic image cleanup every ${intervalHours} hours`);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    console.log('🛑 Stopped automatic image cleanup');
  };
};

export const getCleanupStats = (): CleanupStats | null => {
  const stored = localStorage.getItem('imageCleanupStats');
  if (stored) {
    const stats = JSON.parse(stored);
    stats.lastCleanup = new Date(stats.lastCleanup);
    return stats;
  }
  return null;
};

export const manualCleanup = async (
  getPostsFunction: () => any[],
  updatePostFunction: (id: string, data: any) => Promise<void>
): Promise<CleanupStats> => {
  console.log('🧹 Running manual image cleanup...');
  const posts = getPostsFunction();
  return cleanupExpiredImages(posts, updatePostFunction);
};
