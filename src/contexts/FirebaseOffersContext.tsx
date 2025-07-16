import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './FirebaseAuthContext';

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
}

interface OffersContextType {
  offers: Offer[];
  loading: boolean;
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt' | 'userId' | 'userEmail' | 'userDisplayName'>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
  }, []);

  const addOffer = async (offerData: Omit<Offer, 'id' | 'createdAt' | 'userId' | 'userEmail' | 'userDisplayName'>) => {
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
      };
      
      console.log('🔥 Firestore: Post data to insert:', postData);
      
      const docRef = await addDoc(collection(db, 'posts'), postData);
      
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

  const value = {
    offers,
    loading,
    addOffer,
    deleteOffer,
  };

  return (
    <OffersContext.Provider value={value}>
      {children}
    </OffersContext.Provider>
  );
};
