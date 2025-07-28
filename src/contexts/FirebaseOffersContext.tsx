import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './FirebaseAuthContext';

export interface Reply {
  id: string;
  postId: string;
  text: string;
  userId: string;
  userEmail: string;
  userDisplayName?: string;
  createdAt: Date;
  parentReplyId?: string; // For nested replies
  depth?: number; // Track nesting level
}

export interface Rating {
  userId: string;
  rating: number; // 1-5 stars
  comment?: string; // Optional comment from user
  createdAt: Date;
  userDisplayName?: string; // Display name of the user who rated
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  dateTime?: string;
  endDateTime?: string;
  price?: string;
  online: boolean;
  location?: string;
  city?: string;
  state?: string;
  createdAt: Date;
  type: 'offer' | 'need';
  userId: string;
  userEmail: string;
  userDisplayName?: string;
  attendees?: string[]; // Array of user IDs who clicked attend
  attendeeCount?: number; // Count of attendees
  replies?: Reply[]; // Array of replies for this post
  replyCount?: number; // Count of replies
  ratings?: Rating[]; // Array of ratings for this post
  averageRating?: number; // Calculated average rating
  ratingCount?: number; // Total number of ratings
  pinned?: boolean; // For admin pinned posts
  pinnedAt?: Date; // When it was pinned
  pinnedBy?: string; // Admin who pinned it
  deleted?: boolean; // For admin deleted posts
  deletedAt?: Date; // When it was deleted
  deletedBy?: string; // Admin who deleted it
}

interface OffersContextType {
  offers: Offer[];
  loading: boolean;
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt' | 'userId' | 'userEmail' | 'userDisplayName'>) => Promise<void>;
  updateOffer: (id: string, offer: Omit<Offer, 'id' | 'createdAt' | 'userId' | 'userEmail' | 'userDisplayName'>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  toggleAttendance: (offerId: string) => Promise<void>;
  addReply: (postId: string, text: string, parentReplyId?: string) => Promise<void>;
  getReplies: (postId: string) => Promise<Reply[]>;
  replies: Reply[]; // Add replies state for real-time access
  addRating: (postId: string, rating: number, comment?: string) => Promise<void>;
}

const OffersContext = createContext<OffersContextType | undefined>(undefined);

export const useOffers = () => {
  const context = useContext(OffersContext);
  if (!context) {
    throw new Error('useOffers must be used within an OffersProvider');
  }
  return context;
};

interface OffersProviderProps {
  children: ReactNode;
}

export const OffersProvider: React.FC<OffersProviderProps> = ({ children }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Log when the component re-renders
  console.log('🔄 OffersProvider: Component re-rendered. User state:', user ? 'logged in' : 'not logged in', 'Offers count:', offers.length);

  // Set up the Firestore listener independently of user state
  useEffect(() => {
    console.log('🔥 Firestore: Setting up real-time listener for posts...');
    
    // Create query to get all posts ordered by creation time (newest first)
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: Offer[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        postsData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          dateTime: data.dateTime,
          endDateTime: data.endDateTime,
          price: data.price,
          online: data.online,
          location: data.location,
          city: data.city,
          state: data.state,
          createdAt: data.createdAt.toDate(), // Convert Firestore Timestamp to Date
          type: data.type,
          userId: data.userId,
          userEmail: data.userEmail,
          userDisplayName: data.userDisplayName,
          attendees: data.attendees || [],
          attendeeCount: data.attendeeCount || 0,
          pinned: data.pinned || false,
          pinnedAt: data.pinnedAt ? data.pinnedAt.toDate() : undefined,
          pinnedBy: data.pinnedBy,
          deleted: data.deleted || false,
          deletedAt: data.deletedAt ? data.deletedAt.toDate() : undefined,
          deletedBy: data.deletedBy,
          // Rating fields
          ratings: data.ratings || [],
          averageRating: data.averageRating,
          ratingCount: data.ratingCount,
        });
      });
      
      // Sort posts: pinned posts first (by pin date desc), then by creation date desc
      postsData.sort((a, b) => {
        // If one is pinned and the other isn't, pinned comes first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        
        // If both are pinned, sort by pinnedAt (most recently pinned first)
        if (a.pinned && b.pinned) {
          const pinnedAtA = a.pinnedAt?.getTime() || 0;
          const pinnedAtB = b.pinnedAt?.getTime() || 0;
          return pinnedAtB - pinnedAtA;
        }
        
        // If neither is pinned, sort by creation date (newest first)
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      console.log('🔥 Firestore: Received', postsData.length, 'posts from real-time listener');
      console.log('📌 Pinned posts:', postsData.filter(p => p.pinned).length);
      setOffers(postsData);
      setLoading(false);
    }, (error) => {
      console.error('❌ Firestore: Error in real-time listener:', error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔥 Firestore: Cleaning up real-time listener');
      unsubscribe();
    };
  }, []); // Empty dependency array - this should only run once

  // Set up replies listener
  useEffect(() => {
    console.log('🔥 Firestore: Setting up real-time listener for replies...');
    
    const q = query(collection(db, 'replies'), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const repliesData: Reply[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        repliesData.push({
          id: doc.id,
          postId: data.postId,
          text: data.text,
          userId: data.userId,
          userEmail: data.userEmail,
          userDisplayName: data.userDisplayName,
          createdAt: data.createdAt.toDate(),
          parentReplyId: data.parentReplyId || undefined,
          depth: 0, // Will be calculated in organizeReplies
        });
      });
      
      console.log('🔥 Firestore: Received', repliesData.length, 'replies from real-time listener');
      setReplies(repliesData);
    }, (error) => {
      console.error('❌ Firestore: Error in replies listener:', error);
    });

    return () => {
      console.log('🔥 Firestore: Cleaning up replies listener');
      unsubscribe();
    };
  }, []);

  const addOffer = async (offerData: Omit<Offer, 'id' | 'createdAt' | 'userId' | 'userEmail' | 'userDisplayName' | 'attendees' | 'attendeeCount'>) => {
    if (!user) {
      throw new Error('User must be logged in to create posts');
    }

    try {
      console.log('🔥 Firestore: Adding new post...', offerData);
      
      const postData = {
        ...offerData,
        userId: user.uid,
        userEmail: user.email || '',
        userDisplayName: user.displayName || '',
        createdAt: Timestamp.now(),
        attendees: [],
        attendeeCount: 0,
      };
      
      // Filter out undefined values and empty strings for optional fields to prevent Firestore errors
      const cleanedPostData = Object.fromEntries(
        Object.entries(postData).filter(([key, value]) => {
          // Always keep these required fields even if empty
          const requiredFields = ['title', 'description', 'type', 'online', 'userId', 'userEmail', 'createdAt', 'attendees', 'attendeeCount'];
          if (requiredFields.includes(key)) return value !== undefined;
          
          // Special handling for datetime fields - keep them if they have valid values
          const dateTimeFields = ['dateTime', 'endDateTime'];
          if (dateTimeFields.includes(key)) {
            return value !== undefined && value !== null && value !== '';
          }
          
          // For other optional fields, filter out undefined and empty strings
          return value !== undefined && value !== '';
        })
      );
      
      console.log('🔥 Firestore: Cleaned post data to insert:', cleanedPostData);
      
      const docRef = await addDoc(collection(db, 'posts'), cleanedPostData);
      
      console.log('✅ Firestore: Post added successfully with ID:', docRef.id);
      // Note: No need to manually update state - the real-time listener will handle it!
      
    } catch (error) {
      console.error('❌ Firestore: Error adding post:', error);
      throw error;
    }
  };

  const updateOffer = async (id: string, offerData: Omit<Offer, 'id' | 'createdAt' | 'userId' | 'userEmail' | 'userDisplayName'>) => {
    if (!user) {
      throw new Error('User must be logged in to update posts');
    }

    try {
      console.log('🔥 Firestore: Updating post with ID:', id, offerData);
      
      // Filter out undefined values and empty strings for optional fields to prevent Firestore errors
      const cleanedUpdateData = Object.fromEntries(
        Object.entries(offerData).filter(([key, value]) => {
          // Always keep these required fields even if empty
          const requiredFields = ['title', 'description', 'type', 'online'];
          if (requiredFields.includes(key)) return value !== undefined;
          
          // Special handling for datetime fields - keep them if they have valid values
          const dateTimeFields = ['dateTime', 'endDateTime'];
          if (dateTimeFields.includes(key)) {
            return value !== undefined && value !== null && value !== '';
          }
          
          // For other optional fields, filter out undefined and empty strings
          return value !== undefined && value !== '';
        })
      );
      
      console.log('🔥 Firestore: Cleaned update data:', cleanedUpdateData);
      
      await updateDoc(doc(db, 'posts', id), cleanedUpdateData);
      
      console.log('✅ Firestore: Post updated successfully');
      // Note: No need to manually update state - the real-time listener will handle it!
      
    } catch (error) {
      console.error('❌ Firestore: Error updating post:', error);
      throw error;
    }
  };

  const deleteOffer = async (id: string) => {
    try {
      console.log('🔥 Firestore: Deleting post with ID:', id);
      await deleteDoc(doc(db, 'posts', id));
      console.log('✅ Firestore: Post deleted successfully');
      // Note: No need to manually update state - the real-time listener will handle it!
    } catch (error) {
      console.error('❌ Firestore: Error deleting post:', error);
      throw error;
    }
  };

  const toggleAttendance = async (offerId: string) => {
    if (!user) {
      throw new Error('User must be logged in to attend');
    }

    try {
      console.log('🔥 Firestore: Toggling attendance for post:', offerId);
      
      const postRef = doc(db, 'posts', offerId);
      const currentOffer = offers.find(offer => offer.id === offerId);
      
      if (!currentOffer) {
        throw new Error('Offer not found');
      }

      const isAttending = currentOffer.attendees?.includes(user.uid) || false;
      
      if (isAttending) {
        // Remove user from attendees
        await updateDoc(postRef, {
          attendees: arrayRemove(user.uid),
          attendeeCount: Math.max(0, (currentOffer.attendeeCount || 0) - 1)
        });
        console.log('✅ Firestore: User removed from attendees');
      } else {
        // Add user to attendees
        await updateDoc(postRef, {
          attendees: arrayUnion(user.uid),
          attendeeCount: (currentOffer.attendeeCount || 0) + 1
        });
        console.log('✅ Firestore: User added to attendees');
      }
      
    } catch (error) {
      console.error('❌ Firestore: Error toggling attendance:', error);
      throw error;
    }
  };

  const addReply = async (postId: string, text: string, parentReplyId?: string) => {
    if (!user) {
      throw new Error('User must be authenticated to reply');
    }

    try {
      console.log('🔥 Firestore: Adding reply to post:', postId, parentReplyId ? `(nested under ${parentReplyId})` : '(top-level)');
      
      const replyData = {
        postId,
        text: text.trim(),
        userId: user.uid,
        userEmail: user.email || '',
        userDisplayName: user.displayName || user.email || 'Anonymous',
        createdAt: Timestamp.now(),
        ...(parentReplyId && { parentReplyId }), // Add parentReplyId only if provided
      };

      await addDoc(collection(db, 'replies'), replyData);
      console.log('✅ Firestore: Reply added successfully');
      
    } catch (error) {
      console.error('❌ Firestore: Error adding reply:', error);
      throw error;
    }
  };

  const addRating = async (postId: string, rating: number, comment?: string) => {
    if (!user) {
      throw new Error('User must be authenticated to rate posts');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    try {
      console.log('⭐ Firestore: Adding rating to post:', postId, 'Rating:', rating, 'Comment:', comment || 'No comment');
      
      const postRef = doc(db, 'posts', postId);
      const newRating: Rating = {
        userId: user.uid,
        rating,
        createdAt: new Date(),
        userDisplayName: user.displayName || user.email || 'Anonymous',
      };

      // Only add comment field if it has a non-empty value
      if (comment && comment.trim()) {
        newRating.comment = comment.trim();
      }

      // Get current post to check if user has already rated
      const currentPost = offers.find(offer => offer.id === postId);
      const existingRatings = currentPost?.ratings || [];
      
      // Check if user has already rated this post
      const existingRatingIndex = existingRatings.findIndex(r => r.userId === user.uid);
      
      let updatedRatings;
      if (existingRatingIndex >= 0) {
        // Update existing rating
        updatedRatings = [...existingRatings];
        updatedRatings[existingRatingIndex] = newRating;
        console.log('🔄 Firestore: Updating existing rating');
      } else {
        // Add new rating
        updatedRatings = [...existingRatings, newRating];
        console.log('➕ Firestore: Adding new rating');
      }

      // Calculate average rating
      const totalRating = updatedRatings.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = Math.round((totalRating / updatedRatings.length) * 10) / 10; // Round to 1 decimal place

      // Update post with new ratings
      await updateDoc(postRef, {
        ratings: updatedRatings,
        averageRating,
        ratingCount: updatedRatings.length,
      });

      console.log('✅ Firestore: Rating added successfully. Average:', averageRating);
      
    } catch (error) {
      console.error('❌ Firestore: Error adding rating:', error);
      throw error;
    }
  };

  const getReplies = async (postId: string): Promise<Reply[]> => {
    // Filter replies for this post
    const postReplies = replies.filter(reply => reply.postId === postId);
    
    // Sort by creation date
    postReplies.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as any).toDate();
      const dateB = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any).toDate();
      return dateA.getTime() - dateB.getTime();
    });
    
    // Organize replies into nested structure
    return organizeReplies(postReplies);
  };

  // Helper function to organize replies into a nested structure
  const organizeReplies = (replies: Reply[]): Reply[] => {
    type ReplyWithChildren = Reply & { children: ReplyWithChildren[] };
    const replyMap = new Map<string, ReplyWithChildren>();
    const topLevelReplies: ReplyWithChildren[] = [];

    // First pass: create map and add children array
    replies.forEach(reply => {
      replyMap.set(reply.id, { ...reply, children: [] });
    });

    // Second pass: organize into nested structure
    replies.forEach(reply => {
      const replyWithChildren = replyMap.get(reply.id)!;
      
      if (reply.parentReplyId && replyMap.has(reply.parentReplyId)) {
        // This is a nested reply
        const parent = replyMap.get(reply.parentReplyId)!;
        parent.children.push(replyWithChildren);
      } else {
        // This is a top-level reply
        topLevelReplies.push(replyWithChildren);
      }
    });

    // Flatten for display with depth information
    const flattenReplies = (replies: ReplyWithChildren[]): Reply[] => {
      const result: Reply[] = [];
      
      const addReplies = (replyList: ReplyWithChildren[], depth = 0) => {
        replyList.forEach(reply => {
          result.push({ ...reply, depth });
          if (reply.children.length > 0) {
            addReplies(reply.children, depth + 1);
          }
        });
      };
      
      addReplies(replies);
      return result;
    };

    return flattenReplies(topLevelReplies);
  };

  const value = {
    offers,
    loading,
    addOffer,
    updateOffer,
    deleteOffer,
    toggleAttendance,
    addReply,
    getReplies,
    replies, // Add replies state for real-time access
    addRating,
  };

  return (
    <OffersContext.Provider value={value}>
      {children}
    </OffersContext.Provider>
  );
};
