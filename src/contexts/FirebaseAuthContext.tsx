import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  reload,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, userId?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  reloadUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
    console.log('🔥 Firebase Auth: Creating new user with email:', email);
    try {
      console.log('🔥 Firebase Auth: Calling createUserWithEmailAndPassword...');
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase Auth: User created:', user.uid);
      
      // Send email verification immediately after account creation
      await sendEmailVerification(user);
      console.log('📧 Firebase Auth: Verification email sent to:', user.email);
      
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
        updatedAt: new Date(),
        emailVerified: false // Track verification status
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('✅ Firebase Auth: New user data stored in Firestore:', userData);
      
      console.log('✅ Firebase Auth: User created successfully:', user.email);
    } catch (error: any) {
      console.error('❌ Firebase Auth: Sign up error FULL:', JSON.stringify(error, null, 2));
      console.error('❌ Firebase Auth: Error code:', error.code);
      console.error('❌ Firebase Auth: Error message:', error.message);
      console.error('❌ Firebase Auth: Error customData:', error.customData);
      
      // Provide more helpful error messages
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/password sign-up is not enabled. Please contact support.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please sign in instead.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      } else if (error.code === 'auth/admin-restricted-operation') {
        throw new Error('This operation requires administrator permissions. Please check Firebase Authentication settings.');
      }
      
      throw new Error(error.message || 'Failed to create account. Please try again.');
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
      console.log('🔥 Firebase Auth: GoogleAuthProvider created');
      
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log('🔥 Firebase Auth: About to call signInWithPopup...');
      
      // Try popup first, fallback to redirect if it fails
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        console.log('🔥 Firebase Auth: Popup failed, trying redirect...', popupError);
        // Import redirect methods dynamically
        const { signInWithRedirect, getRedirectResult } = await import('firebase/auth');
        
        // Check if we're returning from a redirect
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult) {
          result = redirectResult;
        } else {
          // Start redirect flow
          await signInWithRedirect(auth, provider);
          return; // Function will end here, redirect will handle the rest
        }
      }
      
      console.log('🔥 Firebase Auth: signInWithPopup successful:', result);
      
      const user = result.user;
      console.log('🔥 Firebase Auth: User object:', user);
      
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
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Full error object:', error);
      throw new Error(`Google sign-in failed: ${error.message}`);
    }
  };

  const sendEmailVerificationToUser = async () => {
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    try {
      await sendEmailVerification(user);
      console.log('📧 Firebase Auth: Verification email sent to:', user.email);
    } catch (error: any) {
      console.error('❌ Firebase Auth: Send verification email error:', error);
      throw new Error(error.message);
    }
  };

  const reloadUser = async () => {
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    try {
      await reload(user);
      console.log('🔄 Firebase Auth: User data reloaded');
      
      // Update Firestore with current verification status
      if (user.emailVerified) {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          emailVerified: true,
          updatedAt: new Date()
        });
        console.log('✅ Firebase Auth: Email verification status updated in Firestore');
      }
    } catch (error: any) {
      console.error('❌ Firebase Auth: Reload user error:', error);
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔑 Firebase Auth: Attempting to send password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Firebase Auth: Password reset email sent successfully to:', email);
      console.log('📧 Check your email inbox and spam folder for the reset link');
    } catch (error: any) {
      console.error('❌ Firebase Auth: Password reset error:', error);
      console.error('❌ Firebase Auth: Error code:', error.code);
      console.error('❌ Firebase Auth: Error message:', error.message);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      }
      
      throw new Error(error.message || 'Failed to send password reset email. Please try again.');
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut: signOutUser,
    signInWithGoogle,
    sendEmailVerification: sendEmailVerificationToUser,
    reloadUser,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
