import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './FirebaseAuthContext';
import { doc, getDoc, setDoc, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'super_admin';
  permissions: AdminPermission[];
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
}

interface AdminPermission {
  action: 'delete_posts' | 'delete_users' | 'pin_posts' | 'manage_admins' | 'view_all_users';
  granted: boolean;
}

interface AdminContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminData: AdminUser | null;
  permissions: AdminPermission[];
  loading: boolean;
  
  // Admin actions
  deleteAnyPost: (postId: string) => Promise<boolean>;
  pinPost: (postId: string, pinned: boolean) => Promise<boolean>;
  deleteUserProfile: (userId: string) => Promise<boolean>;
  
  // Admin management
  promoteUserToAdmin: (userId: string, permissions: AdminPermission[]) => Promise<boolean>;
  removeAdmin: (userId: string) => Promise<boolean>;
  getAllAdmins: () => Promise<AdminUser[]>;
  
  // Utility functions
  hasPermission: (action: string) => boolean;
  checkIsAdmin: (userId: string) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize super admin on first run (you can customize this email)
  const SUPER_ADMIN_EMAIL = 'fun_circle@outlook.com'; // Change this to YOUR email

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setAdminData(null);
      setPermissions([]);
      setLoading(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Checking admin status for:', user.email);

      // Check if user is in admins collection
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists()) {
        const adminInfo = adminDoc.data() as AdminUser;
        setAdminData(adminInfo);
        setPermissions(adminInfo.permissions || []);
        setIsAdmin(adminInfo.isActive);
        setIsSuperAdmin(adminInfo.role === 'super_admin');
        console.log('✅ Admin status confirmed:', adminInfo);
      } else {
        // Check if this is the super admin email - auto-promote
        if (user.email === SUPER_ADMIN_EMAIL) {
          console.log('🔐 Auto-promoting super admin');
          await createSuperAdmin();
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setAdminData(null);
          setPermissions([]);
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const createSuperAdmin = async () => {
    if (!user) return;

    try {
      const superAdminData: AdminUser = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || user.email!,
        role: 'super_admin',
        permissions: [
          { action: 'delete_posts', granted: true },
          { action: 'delete_users', granted: true },
          { action: 'pin_posts', granted: true },
          { action: 'manage_admins', granted: true },
          { action: 'view_all_users', granted: true }
        ],
        createdAt: new Date(),
        createdBy: 'system',
        isActive: true
      };

      const adminDocRef = doc(db, 'admins', user.uid);
      await setDoc(adminDocRef, superAdminData);

      setAdminData(superAdminData);
      setPermissions(superAdminData.permissions);
      setIsAdmin(true);
      setIsSuperAdmin(true);

      console.log('✅ Super admin created successfully');
    } catch (error) {
      console.error('Error creating super admin:', error);
    }
  };

  const hasPermission = (action: string): boolean => {
    if (isSuperAdmin) return true; // Super admin has all permissions
    return permissions.some(p => p.action === action && p.granted);
  };

  const deleteAnyPost = async (postId: string): Promise<boolean> => {
    if (!hasPermission('delete_posts')) {
      console.error('No permission to delete posts');
      return false;
    }

    try {
      // Actually delete the document from Firestore
      const postRef = doc(db, 'posts', postId);
      await deleteDoc(postRef);
      
      console.log('✅ Admin permanently deleted post:', postId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting post:', error);
      return false;
    }
  };

  const pinPost = async (postId: string, pinned: boolean): Promise<boolean> => {
    if (!hasPermission('pin_posts')) {
      console.error('No permission to pin posts');
      return false;
    }

    try {
      const postRef = doc(db, 'posts', postId);
      await setDoc(postRef, { 
        pinned: pinned,
        pinnedAt: pinned ? new Date() : null,
        pinnedBy: pinned ? user?.uid : null
      }, { merge: true });
      
      console.log(`Post ${pinned ? 'pinned' : 'unpinned'}:`, postId);
      return true;
    } catch (error) {
      console.error('Error pinning post:', error);
      return false;
    }
  };

  const deleteUserProfile = async (userId: string): Promise<boolean> => {
    if (!hasPermission('delete_users')) {
      console.error('No permission to delete users');
      return false;
    }

    try {
      // Delete user document
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { 
        deleted: true,
        deletedAt: new Date(),
        deletedBy: user?.uid
      }, { merge: true });

      console.log('User profile deleted:', userId);
      return true;
    } catch (error) {
      console.error('Error deleting user profile:', error);
      return false;
    }
  };

  const promoteUserToAdmin = async (userId: string, newPermissions: AdminPermission[]): Promise<boolean> => {
    if (!hasPermission('manage_admins')) {
      console.error('No permission to manage admins');
      return false;
    }

    try {
      // Get user info first
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.error('User not found');
        return false;
      }

      const userData = userDoc.data();
      
      const adminData: AdminUser = {
        uid: userId,
        email: userData.email,
        displayName: userData.displayName,
        role: 'admin',
        permissions: newPermissions,
        createdAt: new Date(),
        createdBy: user?.uid || 'unknown',
        isActive: true
      };

      const adminRef = doc(db, 'admins', userId);
      await setDoc(adminRef, adminData);

      console.log('User promoted to admin:', userId);
      return true;
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      return false;
    }
  };

  const removeAdmin = async (userId: string): Promise<boolean> => {
    if (!hasPermission('manage_admins')) {
      console.error('No permission to manage admins');
      return false;
    }

    if (userId === user?.uid) {
      console.error('Cannot remove yourself as admin');
      return false;
    }

    try {
      const adminRef = doc(db, 'admins', userId);
      await setDoc(adminRef, { 
        isActive: false,
        removedAt: new Date(),
        removedBy: user?.uid
      }, { merge: true });

      console.log('Admin removed:', userId);
      return true;
    } catch (error) {
      console.error('Error removing admin:', error);
      return false;
    }
  };

  const getAllAdmins = async (): Promise<AdminUser[]> => {
    if (!hasPermission('manage_admins') && !hasPermission('view_all_users')) {
      console.error('No permission to view admins');
      return [];
    }

    try {
      const adminsQuery = query(collection(db, 'admins'), where('isActive', '==', true));
      const adminsSnapshot = await getDocs(adminsQuery);
      
      return adminsSnapshot.docs.map(doc => ({
        ...doc.data()
      })) as AdminUser[];
    } catch (error) {
      console.error('Error getting admins:', error);
      return [];
    }
  };

  const checkIsAdmin = async (userId: string): Promise<boolean> => {
    try {
      const adminDocRef = doc(db, 'admins', userId);
      const adminDoc = await getDoc(adminDocRef);
      
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        return adminData.isActive === true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if user is admin:', error);
      return false;
    }
  };

  const value: AdminContextType = {
    isAdmin,
    isSuperAdmin,
    adminData,
    permissions,
    loading,
    deleteAnyPost,
    pinPost,
    deleteUserProfile,
    promoteUserToAdmin,
    removeAdmin,
    getAllAdmins,
    hasPermission,
    checkIsAdmin
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
