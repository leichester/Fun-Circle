import { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useOffers } from '../contexts/FirebaseOffersContext';
import { useNavigate } from 'react-router-dom';
import { getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { deleteExpiredPosts, getExpiredPostCount } from '../utils/expiredPostCleanup';

interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: any;
  deleted?: boolean;
}

const AdminPanel = () => {
  const { 
    isAdmin, 
    isSuperAdmin, 
    hasPermission, 
    pinPost, 
    deleteAnyPost, 
    deleteUserProfile, 
    promoteUserToAdmin,
    removeAdmin,
    getAllAdmins 
  } = useAdmin();
  const { offers, loading: offersLoading } = useOffers();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'admins'>('posts');
  
  // Expired posts management state
  const [expiredPostCount, setExpiredPostCount] = useState<number>(0);
  const [isCleaningExpiredPosts, setIsCleaningExpiredPosts] = useState(false);
  const [lastCleanupResult, setLastCleanupResult] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    if (activeTab === 'users' && hasPermission('view_all_users')) {
      loadUsers();
    }
    
    if (activeTab === 'admins' && hasPermission('manage_admins')) {
      loadAdmins();
    }
  }, [isAdmin, activeTab, hasPermission]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersQuery = query(
        collection(db, 'users'), 
        where('deleted', '!=', true),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const userData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
      
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback query without where clause
      try {
        const fallbackQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        const usersSnapshot = await getDocs(fallbackQuery);
        const userData = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })).filter((user: any) => !user.deleted) as User[];
        
        setUsers(userData);
      } catch (fallbackError) {
        console.error('Error with fallback query:', fallbackError);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const adminList = await getAllAdmins();
      setAdmins(adminList);
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handlePinPost = async (postId: string, isPinned: boolean) => {
    const success = await pinPost(postId, !isPinned);
    if (success) {
      alert(`Post ${!isPinned ? 'pinned' : 'unpinned'} successfully!`);
      window.location.reload(); // Refresh to see changes
    } else {
      alert('Failed to update post pin status');
    }
  };

  const handleDeletePost = async (postId: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.'
    );
    
    if (confirmDelete) {
      const success = await deleteAnyPost(postId);
      if (success) {
        alert('Post deleted successfully!');
        window.location.reload(); // Refresh to see changes
      } else {
        alert('Failed to delete post');
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this user profile? This action cannot be undone.'
    );
    
    if (confirmDelete) {
      const success = await deleteUserProfile(userId);
      if (success) {
        alert('User profile deleted successfully!');
        loadUsers(); // Refresh users list
      } else {
        alert('Failed to delete user profile');
      }
    }
  };

  const handlePromoteUser = async (userId: string) => {
    const confirmPromote = window.confirm(
      'Are you sure you want to promote this user to admin with basic permissions?'
    );
    
    if (confirmPromote) {
      const basicPermissions = [
        { action: 'delete_posts', granted: true },
        { action: 'pin_posts', granted: true },
        { action: 'view_all_users', granted: false },
        { action: 'delete_users', granted: false },
        { action: 'manage_admins', granted: false }
      ];
      
      const success = await promoteUserToAdmin(userId, basicPermissions as any);
      if (success) {
        alert('User promoted to admin successfully!');
        loadUsers();
        loadAdmins();
      } else {
        alert('Failed to promote user');
      }
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    const confirmRemove = window.confirm(
      'Are you sure you want to remove this admin?'
    );
    
    if (confirmRemove) {
      const success = await removeAdmin(adminId);
      if (success) {
        alert('Admin removed successfully!');
        loadAdmins();
      } else {
        alert('Failed to remove admin');
      }
    }
  };

  // Expired posts management functions
  const loadExpiredPostCount = async () => {
    try {
      const count = await getExpiredPostCount();
      setExpiredPostCount(count);
    } catch (error) {
      console.error('Error loading expired post count:', error);
    }
  };

  const handleDeleteExpiredPosts = async () => {
    if (!hasPermission('delete_posts')) {
      alert('You do not have permission to delete posts');
      return;
    }

    // First show how many posts will be deleted
    const count = await getExpiredPostCount();
    if (count === 0) {
      alert('No expired posts found!');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${count} expired posts? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      setIsCleaningExpiredPosts(true);
      try {
        const result = await deleteExpiredPosts(false);
        
        if (result.deletedCount > 0) {
          setLastCleanupResult(`Successfully deleted ${result.deletedCount} expired posts`);
          alert(`Successfully deleted ${result.deletedCount} expired posts!`);
          
          // Refresh expired post count
          loadExpiredPostCount();
        } else {
          setLastCleanupResult('No expired posts found to delete');
          alert('No expired posts found to delete');
        }
        
        if (result.errors.length > 0) {
          console.error('Errors during cleanup:', result.errors);
          setLastCleanupResult(`Deleted ${result.deletedCount} posts with ${result.errors.length} errors (check console)`);
        }
        
      } catch (error) {
        console.error('Error cleaning expired posts:', error);
        setLastCleanupResult(`Error: ${error}`);
        alert(`Error cleaning expired posts: ${error}`);
      } finally {
        setIsCleaningExpiredPosts(false);
      }
    }
  };

  const handlePreviewExpiredPosts = async () => {
    try {
      const result = await deleteExpiredPosts(true); // Dry run
      
      if (result.expiredPosts.length === 0) {
        alert('No expired posts found!');
      } else {
        const postList = result.expiredPosts.join('\n- ');
        alert(`Found ${result.expiredPosts.length} expired posts:\n\n- ${postList}`);
      }
    } catch (error) {
      console.error('Error previewing expired posts:', error);
      alert(`Error previewing expired posts: ${error}`);
    }
  };

  // Load expired post count when posts tab is active
  useEffect(() => {
    if (activeTab === 'posts' && hasPermission('delete_posts')) {
      loadExpiredPostCount();
    }
  }, [activeTab, hasPermission]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have admin permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
          <p className="text-gray-600">
            {isSuperAdmin ? 'Super Admin' : 'Admin'} Dashboard - Manage posts, users, and settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Posts Management
              </button>
              {hasPermission('view_all_users') && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Users Management
                </button>
              )}
              {hasPermission('manage_admins') && (
                <button
                  onClick={() => setActiveTab('admins')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'admins'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Admin Management
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {/* Posts Management Tab */}
            {activeTab === 'posts' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Posts Management</h2>
                
                {/* Expired Posts Management Section */}
                {hasPermission('delete_posts') && (
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h3 className="text-lg font-medium text-orange-800 mb-3">🗑️ Expired Posts Management</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-orange-700">
                          {expiredPostCount > 0 
                            ? `Found ${expiredPostCount} expired posts` 
                            : 'No expired posts found'
                          }
                        </span>
                        <button
                          onClick={loadExpiredPostCount}
                          className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 transition-colors"
                        >
                          🔄 Refresh Count
                        </button>
                      </div>
                      
                      {lastCleanupResult && (
                        <div className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
                          Last cleanup: {lastCleanupResult}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handlePreviewExpiredPosts}
                          className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                        >
                          👀 Preview Expired Posts
                        </button>
                        
                        {expiredPostCount > 0 && (
                          <button
                            onClick={handleDeleteExpiredPosts}
                            disabled={isCleaningExpiredPosts}
                            className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            {isCleaningExpiredPosts ? '⏳ Deleting...' : '🗑️ Delete All Expired'}
                          </button>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600">
                        Expired posts are automatically determined by their end date or 1 month after start date if no end date is set.
                      </p>
                    </div>
                  </div>
                )}
                
                {offersLoading ? (
                  <p>Loading posts...</p>
                ) : (
                  <div className="space-y-4">
                    {offers.map((post: any) => (
                      <div key={post.id} className={`border rounded-lg p-4 ${post.pinned ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{post.title}</h3>
                              {post.pinned && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                  📌 Pinned
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{post.description}</p>
                            <p className="text-xs text-gray-500">
                              By: {post.userDisplayName || post.userEmail} | 
                              Created: {post.createdAt?.seconds ? 
                                new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 
                                'N/A'
                              }
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            {hasPermission('pin_posts') && (
                              <button
                                onClick={() => handlePinPost(post.id, post.pinned)}
                                className={`text-xs px-3 py-1 rounded ${
                                  post.pinned
                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                              >
                                {post.pinned ? 'Unpin' : 'Pin'}
                              </button>
                            )}
                            {hasPermission('delete_posts') && (
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Management Tab */}
            {activeTab === 'users' && hasPermission('view_all_users') && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Users Management</h2>
                {loadingUsers ? (
                  <p>Loading users...</p>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.uid} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{user.displayName}</h3>
                            <p className="text-gray-600 text-sm">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              Joined: {user.createdAt?.seconds ? 
                                new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 
                                'N/A'
                              }
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            {hasPermission('manage_admins') && (
                              <button
                                onClick={() => handlePromoteUser(user.uid)}
                                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                              >
                                Make Admin
                              </button>
                            )}
                            {hasPermission('delete_users') && (
                              <button
                                onClick={() => handleDeleteUser(user.uid)}
                                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                              >
                                Delete User
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Admin Management Tab */}
            {activeTab === 'admins' && hasPermission('manage_admins') && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Admin Management</h2>
                {loadingAdmins ? (
                  <p>Loading admins...</p>
                ) : (
                  <div className="space-y-4">
                    {admins.map((admin) => (
                      <div key={admin.uid} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{admin.displayName}</h3>
                              <span className={`text-xs px-2 py-1 rounded ${
                                admin.role === 'super_admin' 
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{admin.email}</p>
                            <div className="text-xs text-gray-500 mt-2">
                              <p>Permissions:</p>
                              <ul className="list-disc list-inside ml-2">
                                {admin.permissions?.filter((p: any) => p.granted).map((permission: any) => (
                                  <li key={permission.action}>{permission.action.replace('_', ' ')}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            {admin.role !== 'super_admin' && (
                              <button
                                onClick={() => handleRemoveAdmin(admin.uid)}
                                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                              >
                                Remove Admin
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
