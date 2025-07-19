import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc,
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

export interface Offer {
  id: string;
  title: string;
  description: string;
  dateTime?: string;
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
}

interface OffersContextType {
  offers: Offer[];
  loading: boolean;
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt' | 'userId' | 'userEmail' | 'userDisplayName'>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  toggleAttendance: (offerId: string) => Promise<void>;
  addReply: (postId: string, text: string, parentReplyId?: string) => Promise<void>;
  getReplies: (postId: string) => Promise<Reply[]>;
  replies: Reply[]; // Add replies state for real-time access
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
        });
      });
      
      console.log('🔥 Firestore: Received', postsData.length, 'posts from real-time listener');
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
      
      // Filter out undefined values to prevent Firestore errors
      const cleanedPostData = Object.fromEntries(
        Object.entries(postData).filter(([_, value]) => value !== undefined)
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
    deleteOffer,
    toggleAttendance,
    addReply,
    getReplies,
    replies, // Add replies state for real-time access
  };

  return (
    <OffersContext.Provider value={value}>
      {children}
    </OffersContext.Provider>
  );
};
