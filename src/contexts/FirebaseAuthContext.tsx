import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, userId?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔥 Firebase Auth: Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔥 Firebase Auth: Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userId?: string) => {
    console.log('🔥 Firebase Auth: Creating new user...');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name and optional custom userId
      const displayName = userId ? `${fullName} (@${userId})` : fullName;
      await updateProfile(user, {
        displayName: displayName
      });
      
      // Store user data in Firestore users collection for future reference
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      const userData = {
        email: user.email,
        displayName: displayName,
        fullName: fullName,
        userId: userId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('✅ Firebase Auth: New user data stored in Firestore:', userData);
      
      console.log('✅ Firebase Auth: User created successfully:', user.email);
    } catch (error: any) {
      console.error('❌ Firebase Auth: Sign up error:', error);
      throw new Error(error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔥 Firebase Auth: Signing in user...');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Check if user document exists in Firestore, create if not
      const { doc, setDoc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // If user document doesn't exist, create it (existing user who signed up before we stored user data)
      if (!userDoc.exists()) {
        const userData = {
          email: user.email,
          displayName: user.displayName || user.email,
          fullName: user.displayName || user.email,
          userId: null,
          createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date(),
          updatedAt: new Date(),
          provider: 'email'
        };
        
        await setDoc(userDocRef, userData);
        console.log('✅ Firebase Auth: Created Firestore document for existing user with data:', userData);
      } else {
        console.log('✅ Firebase Auth: User document already exists');
      }
      
      console.log('✅ Firebase Auth: User signed in successfully');
    } catch (error: any) {
      console.error('❌ Firebase Auth: Sign in error:', error);
      throw new Error(error.message);
    }
  };

  const signOutUser = async () => {
    console.log('🔥 Firebase Auth: Signing out user...');
    try {
      await signOut(auth);
      console.log('✅ Firebase Auth: User signed out successfully');
    } catch (error: any) {
      console.error('❌ Firebase Auth: Sign out error:', error);
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    console.log('🔥 Firebase Auth: Signing in with Google...');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if this is a new user and store their data in Firestore
      const { doc, setDoc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // If user document doesn't exist, create it (new user)
      if (!userDoc.exists()) {
        const userData = {
          email: user.email,
          displayName: user.displayName || user.email,
          fullName: user.displayName || user.email,
          userId: null, // Google users don't have custom userIds
          createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date(),
          updatedAt: new Date(),
          provider: 'google'
        };
        
        await setDoc(userDocRef, userData);
        console.log('✅ Firebase Auth: New Google user data stored in Firestore:', userData);
      } else {
        console.log('✅ Firebase Auth: Google user document already exists');
      }
      
      console.log('✅ Firebase Auth: Google sign in successful');
    } catch (error: any) {
      console.error('❌ Firebase Auth: Google sign in error:', error);
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut: signOutUser,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
