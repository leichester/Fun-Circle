// Utility functions for managing expired posts
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PostExpirationResult {
  deletedCount: number;
  expiredPosts: string[];
  errors: string[];
}

// Function to determine if a post is expired (same logic as getPostStatus)
export const isPostExpired = (post: any): boolean => {
  if (!post.dateTime) {
    return false; // Posts without dateTime are considered active
  }

  const postDateTime = new Date(post.dateTime);
  const now = new Date();
  
  // If post date is in the future, not expired
  if (postDateTime > now) {
    return false;
  }
  
  // Check if there's an end date
  if (post.endDateTime) {
    const endDateTime = new Date(post.endDateTime);
    // Post is expired if end date is in the past
    return endDateTime < now;
  } else {
    // No end date - check if it's been more than two weeks since start date
    const twoWeeksAfterStart = new Date(postDateTime);
    twoWeeksAfterStart.setDate(twoWeeksAfterStart.getDate() + 14);
    
    return now > twoWeeksAfterStart;
  }
};

// Function to find and delete all expired posts
export const deleteExpiredPosts = async (dryRun: boolean = false): Promise<PostExpirationResult> => {
  const result: PostExpirationResult = {
    deletedCount: 0,
    expiredPosts: [],
    errors: []
  };

  try {
    console.log(`🔍 ${dryRun ? 'Scanning for' : 'Deleting'} expired posts...`);
    
    // Get all posts
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    const allPosts = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    console.log(`📊 Found ${allPosts.length} total posts`);

    // Filter expired posts
    const expiredPosts = allPosts.filter(post => isPostExpired(post));
    
    console.log(`⏰ Found ${expiredPosts.length} expired posts`);

    if (dryRun) {
      result.expiredPosts = expiredPosts.map(post => `${post.title || 'Untitled'} (${post.id})`);
      console.log('🔍 Dry run - expired posts found:', result.expiredPosts);
      return result;
    }

    // Delete expired posts
    for (const post of expiredPosts) {
      try {
        await deleteDoc(doc(db, 'posts', post.id));
        result.deletedCount++;
        result.expiredPosts.push(`${post.title || 'Untitled'} (${post.id})`);
        console.log(`✅ Deleted expired post: ${post.title || 'Untitled'} (${post.id})`);
      } catch (error) {
        const errorMsg = `Failed to delete ${post.title || 'Untitled'} (${post.id}): ${error}`;
        result.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    console.log(`🎉 Successfully deleted ${result.deletedCount} expired posts`);
    
    if (result.errors.length > 0) {
      console.warn(`⚠️ Encountered ${result.errors.length} errors during deletion`);
    }

    return result;
  } catch (error) {
    const errorMsg = `Error during expired post cleanup: ${error}`;
    result.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
    return result;
  }
};

// Function to get expired post count without deleting
export const getExpiredPostCount = async (): Promise<number> => {
  try {
    const result = await deleteExpiredPosts(true); // Dry run
    return result.expiredPosts.length;
  } catch (error) {
    console.error('Error counting expired posts:', error);
    return 0;
  }
};

// Function to schedule automatic cleanup (can be called periodically)
export const scheduleExpiredPostCleanup = (intervalHours: number = 24) => {
  console.log(`⏰ Scheduling expired post cleanup every ${intervalHours} hours`);
  
  const cleanup = async () => {
    console.log('🧹 Starting scheduled expired post cleanup...');
    const result = await deleteExpiredPosts(false);
    
    if (result.deletedCount > 0) {
      console.log(`🗑️ Scheduled cleanup deleted ${result.deletedCount} expired posts`);
    } else {
      console.log('✨ No expired posts found during scheduled cleanup');
    }
  };

  // Run immediately
  cleanup();
  
  // Then run every intervalHours
  return setInterval(cleanup, intervalHours * 60 * 60 * 1000);
};
