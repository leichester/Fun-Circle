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
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
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

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('🔥 Firebase Auth: Creating new user...');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(user, {
        displayName: fullName
      });
      
      console.log('✅ Firebase Auth: User created successfully:', user.email);
    } catch (error: any) {
      console.error('❌ Firebase Auth: Sign up error:', error);
      throw new Error(error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔥 Firebase Auth: Signing in user...');
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
      await signInWithPopup(auth, provider);
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
