import { useNavigate, Link, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useOffers } from '../contexts/FirebaseOffersContext';
import { useAdmin } from '../contexts/AdminContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { compressImage, validateImageFile, createImagePreview, revokeImagePreview, DEFAULT_PROFILE_PIC_OPTIONS } from '../utils/imageUtils';

// ReplyComponent for displaying nested replies
const ReplyComponent = ({ reply, depth = 0 }: { reply: any, depth?: number }) => {
  const maxDepth = 3;
  const actualDepth = Math.min(depth, maxDepth);
  
  return (
    <div className={`${actualDepth > 0 ? 'ml-4 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-2 flex-1">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {(reply.userDisplayName || reply.userEmail || 'A')?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 flex-shrink-0">
              <Link 
                to={`/user/${reply.userId}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {reply.userDisplayName || reply.userEmail || 'Anonymous'}
              </Link>:
            </span>
            <p className="text-sm text-gray-600 flex-1">{reply.text}</p>
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {reply.createdAt.toLocaleDateString()} at {reply.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
      
      {/* Render nested replies */}
      {reply.children && reply.children.length > 0 && (
        <div className="mt-3 space-y-3">
          {reply.children.map((childReply: any) => (
            <ReplyComponent key={childReply.id} reply={childReply} depth={actualDepth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const UserProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams(); // Get userId from URL parameters
  const { user, signOut } = useAuth();
  const { offers, replies, loading, deleteOffer } = useOffers(); // Add loading from offers context
  const { isAdmin, isSuperAdmin } = useAdmin();
  
  // State for managing which posts have replies shown
  const [showingReplies, setShowingReplies] = useState<Set<string>>(new Set());
  
  // Bio state
  const [bio, setBio] = useState('');
  const [isLoadingBio, setIsLoadingBio] = useState(true);
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileInput, setProfileInput] = useState({
    displayName: '',
    bio: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // State for other user's profile data
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Profile picture state
  const [profilePictureURL, setProfilePictureURL] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Determine if we're viewing our own profile or someone else's
  const isOwnProfile = !userId || (user && userId === user.uid);
  const displayUser = isOwnProfile ? user : profileUser;
  
  // Load other user's profile data if needed
  useEffect(() => {
    if (userId && userId !== user?.uid) {
      setLoadingProfile(true);
      const loadOtherUserProfile = async () => {
        try {
          console.log('Loading profile for userId:', userId);
          
          // First try to get user data from Firestore users collection
          const userDocRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          let userData: any = { uid: userId };
          
          if (userDoc.exists()) {
            userData = { uid: userId, ...userDoc.data() };
            console.log('User data from users collection:', userData);
          }
          
          // If we don't have displayName or email from users collection,
          // try to get it from their posts
          if (!userData.displayName && !userData.email && offers.length > 0) {
            console.log('Looking for user info in posts...');
            const userPost = offers.find(offer => offer.userId === userId);
            console.log('Found user post:', userPost);
            if (userPost) {
              userData.displayName = userPost.userDisplayName;
              userData.email = userPost.userEmail;
              // Also try to get creation date from the post's createdAt if no user document exists
              if (!userData.createdAt && userPost.createdAt) {
                userData.createdAt = userPost.createdAt;
              }
              console.log('Updated userData from post:', userData);
            }
          }
          
          // Fallback: if still no display name, use email or set to Unknown
          if (!userData.displayName && userData.email) {
            userData.displayName = userData.email;
          } else if (!userData.displayName && !userData.email) {
            userData.displayName = 'Unknown User';
            userData.email = 'No email available';
          }
          
          console.log('Final userData:', userData);
          setProfileUser(userData);
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Try to get user info from their posts as fallback
          if (offers.length > 0) {
            const userPost = offers.find(offer => offer.userId === userId);
            console.log('Fallback: Found user post:', userPost);
            if (userPost) {
              const fallbackUserData = {
                uid: userId,
                displayName: userPost.userDisplayName || userPost.userEmail,
                email: userPost.userEmail,
                createdAt: userPost.createdAt // Try to use post creation as approximation
              };
              
              // Try to create the missing user document with the post data
              try {
                const userDocRef = doc(db, 'users', userId);
                await setDoc(userDocRef, {
                  email: userPost.userEmail,
                  displayName: userPost.userDisplayName || userPost.userEmail,
                  createdAt: userPost.createdAt || new Date(),
                  updatedAt: new Date(),
                  source: 'backfilled_from_post'
                });
                console.log('✅ Created missing user document from post data');
              } catch (setDocError) {
                console.error('Failed to create user document:', setDocError);
              }
              
              setProfileUser(fallbackUserData);
            } else {
              setProfileUser({ 
                uid: userId, 
                displayName: 'Unknown User',
                email: 'No email available' 
              });
            }
          } else {
            setProfileUser({ 
              uid: userId, 
              displayName: 'Unknown User',
              email: 'No email available' 
            });
          }
        } finally {
          setLoadingProfile(false);
        }
      };
      
      // Only load if we have offers data or if offers are done loading
      if (!loading) {
        loadOtherUserProfile();
      }
    } else {
      setLoadingProfile(false);
    }
  }, [userId, user, offers, loading]); // Add loading to dependencies
  
  // Redirect if not authenticated and trying to view own profile
  if (!user && isOwnProfile) {
    navigate('/');
    return null;
  }

  // Get user's posts - either current user or the profile user
  const targetUserId = isOwnProfile ? user?.uid : userId;
  const userPosts = offers.filter(offer => offer.userId === targetUserId);
  
  // Get user's replies - either current user or the profile user  
  const userReplies = replies.filter(reply => reply.userId === targetUserId);

  // Function to determine post status
  const getPostStatus = (post: any) => {
    if (!post.dateTime) {
      return { text: 'Active', color: 'bg-green-100 text-green-800' };
    }

    const postDateTime = new Date(post.dateTime);
    const now = new Date();
    
    // 1. If the start date and time is filled with a future date and time, make it "Soon".
    if (postDateTime > now) {
      return { text: 'Soon', color: 'bg-yellow-100 text-yellow-800' };
    }
    
    // Start date is current or past, check end date scenarios
    if (post.endDateTime) {
      const endDateTime = new Date(post.endDateTime);
      
      // 4. If the start date and time is filled with a past date and time, and the end date and time is in the past, make it "Expired"
      if (endDateTime < now) {
        return { text: 'Expired', color: 'bg-gray-100 text-gray-600' };
      }
      
      // 3. If the start date and time is filled with a current or past date and time, and end date and time is in the future, make it "Active".
      return { text: 'Active', color: 'bg-green-100 text-green-800' };
    } else {
      // No end date specified - check if it's been more than one month since start date
      const oneMonthAfterStart = new Date(postDateTime);
      oneMonthAfterStart.setMonth(oneMonthAfterStart.getMonth() + 1);
      
      if (now > oneMonthAfterStart) {
        return { text: 'Expired', color: 'bg-gray-100 text-gray-600' };
      }
      
      // 2. If the start date and time is filled with a current or past date and time, but no end date and time, make it "Active".
      return { text: 'Active', color: 'bg-green-100 text-green-800' };
    }
  };

  // Toggle replies collapse/expand for a specific post
  const toggleRepliesCollapse = (postId: string) => {
    setShowingReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Bio management functions
  const loadUserBio = async () => {
    const bioUserId = isOwnProfile ? user?.uid : userId;
    if (!bioUserId) return;
    
    try {
      const userDocRef = doc(db, 'users', bioUserId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setBio(userData.bio || '');
        setProfilePictureURL(userData.profilePictureURL || null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoadingBio(false);
    }
  };

  // Utility function to fix missing user data for current user (debugging)
  const fixCurrentUserData = async () => {
    if (!user) return;
    console.log('🔧 Starting comprehensive user data fix...');
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let updateData: any = {};
      let hasUpdates = false;
      
      if (userDoc.exists()) {
        const existingData = userDoc.data();
        console.log('Existing user data:', existingData);
        
        // Fix missing displayName
        if (!existingData.displayName && user.displayName) {
          updateData.displayName = user.displayName;
          hasUpdates = true;
          console.log('Adding missing displayName:', user.displayName);
        }
        
        // Fix missing email
        if (!existingData.email && user.email) {
          updateData.email = user.email;
          hasUpdates = true;
          console.log('Adding missing email:', user.email);
        }
        
        // Fix missing createdAt
        if (!existingData.createdAt) {
          // Try Firebase Auth metadata first
          if (user.metadata?.creationTime) {
            updateData.createdAt = new Date(user.metadata.creationTime);
            hasUpdates = true;
            console.log('Adding createdAt from Firebase Auth:', user.metadata.creationTime);
          } else {
            // Fallback: try to find earliest post by this user
            const userPosts = offers.filter(offer => offer.userId === user.uid);
            if (userPosts.length > 0) {
              const sortedPosts = userPosts.sort((a, b) => {
                const dateA = (a.createdAt as any)?.seconds ? new Date((a.createdAt as any).seconds * 1000) : new Date(a.createdAt as any);
                const dateB = (b.createdAt as any)?.seconds ? new Date((b.createdAt as any).seconds * 1000) : new Date(b.createdAt as any);
                return dateA.getTime() - dateB.getTime();
              });
              
              const earliestPost = sortedPosts[0];
              if (earliestPost?.createdAt) {
                const postDate = (earliestPost.createdAt as any)?.seconds 
                  ? new Date((earliestPost.createdAt as any).seconds * 1000)
                  : new Date(earliestPost.createdAt as any);
                updateData.createdAt = postDate;
                hasUpdates = true;
                console.log('Adding createdAt from earliest post:', postDate);
              }
            }
            
            // Last resort: use current date
            if (!updateData.createdAt) {
              updateData.createdAt = new Date();
              hasUpdates = true;
              console.log('Adding createdAt as current date (last resort)');
            }
          }
        }
        
        if (hasUpdates) {
          updateData.updatedAt = new Date();
          updateData.fixedAt = new Date();
          
          await setDoc(userDocRef, updateData, { merge: true });
          console.log('✅ User data updated successfully:', updateData);
          alert('User data fixed successfully! Refresh the page to see updates.');
        } else {
          console.log('ℹ️ No updates needed, user data looks complete');
          alert('User data already looks complete!');
        }
      } else {
        console.log('Creating new user document...');
        // Create new user document with all available data
        const newUserData = {
          email: user.email,
          displayName: user.displayName || user.email,
          createdAt: user.metadata?.creationTime ? new Date(user.metadata.creationTime) : new Date(),
          updatedAt: new Date(),
          source: 'comprehensive_fix'
        };
        
        await setDoc(userDocRef, newUserData);
        console.log('✅ New user document created:', newUserData);
        alert('User document created successfully! Refresh the page to see updates.');
      }
      
    } catch (error) {
      console.error('❌ Error fixing user data:', error);
      alert('Failed to fix user data. Check console for details.');
    }
  };

  // Batch fix function for all users (admin debugging tool)
  const fixAllUsersData = async () => {
    if (!user) return;
    
    const confirmFix = window.confirm(
      'This will attempt to fix data for all users who have posted. This may take a while and should only be done by admins. Continue?'
    );
    
    if (!confirmFix) return;
    
    console.log('🔧 Starting batch user data fix...');
    
    try {
      // Get all unique user IDs from posts
      const uniqueUserIds = [...new Set(offers.map(offer => offer.userId))];
      console.log('Found unique user IDs:', uniqueUserIds.length);
      
      let fixedCount = 0;
      let errorCount = 0;
      
      for (const userId of uniqueUserIds) {
        try {
          console.log(`Processing user ${fixedCount + 1}/${uniqueUserIds.length}:`, userId);
          
          const userDocRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          
          // Find user's posts to extract information
          const userPosts = offers.filter(offer => offer.userId === userId);
          if (userPosts.length === 0) continue;
          
          // Get the most recent post for latest info
          const latestPost = userPosts.sort((a, b) => {
            const dateA = (a.createdAt as any)?.seconds ? new Date((a.createdAt as any).seconds * 1000) : new Date(a.createdAt as any);
            const dateB = (b.createdAt as any)?.seconds ? new Date((b.createdAt as any).seconds * 1000) : new Date(b.createdAt as any);
            return dateB.getTime() - dateA.getTime();
          })[0];
          
          // Get the earliest post for creation date approximation
          const earliestPost = userPosts.sort((a, b) => {
            const dateA = (a.createdAt as any)?.seconds ? new Date((a.createdAt as any).seconds * 1000) : new Date(a.createdAt as any);
            const dateB = (b.createdAt as any)?.seconds ? new Date((b.createdAt as any).seconds * 1000) : new Date(b.createdAt as any);
            return dateA.getTime() - dateB.getTime();
          })[0];
          
          const createdAtApprox = (earliestPost.createdAt as any)?.seconds 
            ? new Date((earliestPost.createdAt as any).seconds * 1000)
            : new Date(earliestPost.createdAt as any);
          
          let updateData: any = {};
          let hasUpdates = false;
          
          if (userDoc.exists()) {
            const existingData = userDoc.data();
            
            // Fix missing createdAt
            if (!existingData.createdAt) {
              updateData.createdAt = createdAtApprox;
              hasUpdates = true;
            }
            
            // Fix missing displayName
            if (!existingData.displayName && latestPost.userDisplayName) {
              updateData.displayName = latestPost.userDisplayName;
              hasUpdates = true;
            }
            
            // Fix missing email
            if (!existingData.email && latestPost.userEmail) {
              updateData.email = latestPost.userEmail;
              hasUpdates = true;
            }
            
            if (hasUpdates) {
              updateData.updatedAt = new Date();
              updateData.batchFixedAt = new Date();
              await setDoc(userDocRef, updateData, { merge: true });
              fixedCount++;
            }
          } else {
            // Create new user document
            const newUserData = {
              email: latestPost.userEmail || 'Unknown',
              displayName: latestPost.userDisplayName || latestPost.userEmail || 'Unknown User',
              createdAt: createdAtApprox,
              updatedAt: new Date(),
              batchFixedAt: new Date(),
              source: 'batch_backfilled_from_posts'
            };
            
            await setDoc(userDocRef, newUserData);
            fixedCount++;
          }
          
          // Small delay to avoid overwhelming Firestore
          if (fixedCount % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
        } catch (userError) {
          console.error('Error fixing user:', userId, userError);
          errorCount++;
        }
      }
      
      console.log(`✅ Batch fix completed. Fixed: ${fixedCount}, Errors: ${errorCount}`);
      alert(`Batch fix completed!\nFixed: ${fixedCount} users\nErrors: ${errorCount}\n\nRefresh the page to see updates.`);
      
    } catch (error) {
      console.error('❌ Error in batch fix:', error);
      alert('Batch fix failed. Check console for details.');
    }
  };

  // Profile editing functions
  const handleEditProfile = () => {
    setProfileInput({
      displayName: displayUser?.displayName || '',
      bio: bio
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user || !isOwnProfile) return;
    
    // Validate display name
    if (!profileInput.displayName.trim()) {
      alert('Display name cannot be empty');
      return;
    }
    
    // Limit bio to 100 characters
    const trimmedBio = profileInput.bio.trim().slice(0, 100);
    const trimmedDisplayName = profileInput.displayName.trim();
    
    setIsSavingProfile(true);
    try {
      // Update user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { 
        displayName: trimmedDisplayName,
        bio: trimmedBio,
        updatedAt: new Date()
      }, { merge: true });
      
      // Update Firebase Auth profile
      const { updateProfile } = await import('firebase/auth');
      await updateProfile(user, {
        displayName: trimmedDisplayName
      });
      
      // Update local state
      setBio(trimmedBio);
      setIsEditingProfile(false);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setProfileInput({
      displayName: displayUser?.displayName || '',
      bio: bio
    });
    setIsEditingProfile(false);
  };

  // Password change functions
  const handleChangePassword = () => {
    setPasswordInput({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setIsChangingPassword(true);
  };

  const handleUpdatePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordInput;
    
    // Validation
    if (!currentPassword.trim()) {
      alert("Please enter your current password");
      return;
    }
    
    if (!newPassword.trim()) {
      alert("Please enter a new password");
      return;
    }
    
    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    
    if (currentPassword === newPassword) {
      alert("New password must be different from current password");
      return;
    }
    
    setIsUpdatingPassword(true);
    try {
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import("firebase/auth");
      
      if (!user || !user.email) {
        throw new Error("User not found");
      }
      
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      // Reset form and close modal
      setPasswordInput({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsChangingPassword(false);
      
      alert("Password updated successfully!");
    } catch (error: any) {
      console.error("Error updating password:", error);
      
      if (error.code === "auth/wrong-password") {
        alert("Current password is incorrect. Please try again.");
      } else if (error.code === "auth/weak-password") {
        alert("New password is too weak. Please choose a stronger password.");
      } else if (error.code === "auth/requires-recent-login") {
        alert("For security reasons, please log out and log back in before changing your password.");
      } else {
        alert("Failed to update password. Please try again.");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordInput({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setIsChangingPassword(false);
  };

  // Profile picture functions
  const handleProfilePictureClick = () => {
    if (!isOwnProfile) return;
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    console.log(`Starting upload for file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    try {
      setIsUploadingPicture(true);
      setUploadProgress('Preparing image...');

      // Create preview immediately for better UX
      const previewURL = createImagePreview(file);
      setPicturePreview(previewURL);

      // Add timeout for compression to prevent hanging
      setUploadProgress('Compressing image...');
      const compressionPromise = compressImage(file, DEFAULT_PROFILE_PIC_OPTIONS);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Image compression timeout')), 10000); // 10 second timeout
      });

      console.log('Compressing image...');
      const compressedBlob = await Promise.race([compressionPromise, timeoutPromise]);
      console.log(`Compression complete: ${(compressedBlob.size / 1024).toFixed(1)}KB`);
      
      // Skip Firebase upload in development due to CORS issues, use data URL directly
      setUploadProgress('Preparing for storage...');
      console.log('Storing image for development...');
      
      let downloadURL: string;
      
      // Use data URL for development to bypass CORS issues
      setUploadProgress('Processing image...');
      downloadURL = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(compressedBlob);
      });
      console.log('Image processed as data URL:', downloadURL.substring(0, 50) + '...');

      // Update user document
      console.log('Updating user document...');
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        profilePictureURL: downloadURL,
        updatedAt: new Date()
      }, { merge: true });

      // Update local state
      setProfilePictureURL(downloadURL);
      
      // Clean up preview
      revokeImagePreview(previewURL);
      setPicturePreview(null);

      console.log('Profile picture upload completed successfully!');
      alert('Profile picture uploaded successfully!');
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      
      let errorMessage = 'Failed to upload profile picture. ';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage += 'The upload took too long. Please try with a smaller image.';
        } else if (error.message.includes('storage/unauthorized')) {
          errorMessage += 'You do not have permission to upload images.';
        } else if (error.message.includes('storage/quota-exceeded')) {
          errorMessage += 'Storage quota exceeded. Please contact support.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please try again with a smaller image.';
      }
      
      alert(errorMessage);
      
      // Clean up preview on error
      if (picturePreview) {
        revokeImagePreview(picturePreview);
        setPicturePreview(null);
      }
    } finally {
      setIsUploadingPicture(false);
      setUploadProgress('');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!user || !profilePictureURL || !isOwnProfile) return;

    const confirmDelete = window.confirm('Are you sure you want to remove your profile picture?');
    if (!confirmDelete) return;

    try {
      setIsUploadingPicture(true);

      // Skip Firebase Storage deletion in development (using data URLs)
      // In production, you would uncomment this:
      // const storageRef = ref(storage, `profile-pictures/${user.uid}.jpg`);
      // await deleteObject(storageRef);

      console.log('Removing profile picture from database...');

      // Update user document to remove profile picture
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        profilePictureURL: null,
        updatedAt: new Date()
      }, { merge: true });

      // Update local state
      setProfilePictureURL(null);

      console.log('Profile picture removed successfully');
      alert('Profile picture removed successfully!');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      alert('Failed to remove profile picture. Please try again.');
    } finally {
      setIsUploadingPicture(false);
    }
  };

  // Load bio on component mount or when userId changes
  useEffect(() => {
    loadUserBio();
  }, [user, userId, isOwnProfile]);

  const handleGoBack = () => {
    navigate('/');
  };

  const handleDeletePost = async (postId: string, postTitle: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        console.log('🗑️ User deleting their own post:', postId);
        await deleteOffer(postId);
        console.log('✅ Post deleted successfully');
        // Posts will automatically refresh due to real-time listener
      } catch (error) {
        console.error('❌ Error deleting post:', error);
        alert('Error deleting post. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {isOwnProfile ? 'User Profile' : `${displayUser?.displayName || displayUser?.email || 'User'}'s Profile`}
              </h1>
              <p className="text-gray-600 mt-2">
                {isOwnProfile ? 'Manage your account and view your activity' : 'View user activity and information'}
              </p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Profile Container */}
        <div className="max-w-4xl mx-auto">
          {/* Show loading state for other user's profile */}
          {!isOwnProfile && loadingProfile ? (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading user profile...</p>
              </div>
            </div>
          ) : (
            <>
              {/* User Info Card */}
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <div className="flex items-center gap-6 mb-6 relative">{/* Added relative positioning */}
                  {/* Profile Picture Section */}
                  <div className="relative">
                    <div 
                      className={`w-20 h-20 rounded-full overflow-hidden ${
                        isOwnProfile ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                      } ${isUploadingPicture ? 'animate-pulse' : ''}`}
                      onClick={handleProfilePictureClick}
                      title={isOwnProfile ? 'Click to change profile picture' : ''}
                    >
                      {picturePreview ? (
                        <img 
                          src={picturePreview} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : profilePictureURL ? (
                        <img 
                          src={profilePictureURL} 
                          alt={`${displayUser?.displayName || 'User'}'s profile`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Upload overlay for own profile */}
                      {isOwnProfile && !isUploadingPicture && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Loading spinner */}
                      {isUploadingPicture && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Remove picture button for own profile */}
                    {isOwnProfile && profilePictureURL && !isUploadingPicture && (
                      <button
                        onClick={handleRemoveProfilePicture}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs"
                        title="Remove profile picture"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  {/* Hidden file input */}
                  {isOwnProfile && (
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {displayUser?.displayName || displayUser?.email || 'Anonymous User'}
                    </h2>
                    <p className="text-gray-600">{displayUser?.email || 'No email available'}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Member since: {
                        (() => {
                          console.log('Debug - displayUser for member since:', displayUser);
                          
                          // Handle Firestore Timestamp objects (has .seconds property)
                          if (displayUser?.createdAt?.seconds) {
                            console.log('Using Firestore timestamp:', displayUser.createdAt);
                            return new Date(displayUser.createdAt.seconds * 1000).toLocaleDateString();
                          }
                          // Handle regular Date objects or date strings
                          else if (displayUser?.createdAt) {
                            console.log('Using regular date:', displayUser.createdAt);
                            return new Date(displayUser.createdAt).toLocaleDateString();
                          }
                          // Handle Firebase Auth metadata (for current user)
                          else if (displayUser?.metadata?.creationTime) {
                            console.log('Using Firebase Auth metadata:', displayUser.metadata.creationTime);
                            return new Date(displayUser.metadata.creationTime).toLocaleDateString();
                          }
                          // Try to extract from user ID or other sources
                          else if (isOwnProfile && user?.metadata?.creationTime) {
                            console.log('Using current user Firebase Auth metadata:', user.metadata.creationTime);
                            return new Date(user.metadata.creationTime).toLocaleDateString();
                          }
                          // Try to find the earliest post by this user as approximation
                          else {
                            console.log('No creation date found, trying to find earliest post...');
                            const userPosts = offers.filter(offer => offer.userId === (displayUser?.uid || userId));
                            console.log('User posts found:', userPosts.length);
                            
                            if (userPosts.length > 0) {
                              // Sort posts by creation date and get the earliest
                              const sortedPosts = userPosts.sort((a, b) => {
                                const dateA = (a.createdAt as any)?.seconds ? new Date((a.createdAt as any).seconds * 1000) : new Date(a.createdAt as any);
                                const dateB = (b.createdAt as any)?.seconds ? new Date((b.createdAt as any).seconds * 1000) : new Date(b.createdAt as any);
                                return dateA.getTime() - dateB.getTime();
                              });
                              
                              const earliestPost = sortedPosts[0];
                              if (earliestPost?.createdAt) {
                                const postDate = (earliestPost.createdAt as any)?.seconds 
                                  ? new Date((earliestPost.createdAt as any).seconds * 1000)
                                  : new Date(earliestPost.createdAt as any);
                                console.log('Using earliest post date as approximation:', postDate);
                                return `~${postDate.toLocaleDateString()}`;
                              }
                            }
                            
                            console.log('No creation date found anywhere, showing N/A');
                            return 'N/A';
                          }
                        })()
                      }
                    </p>
                    
                    {/* Bio Section */}
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">Bio:</span>
                      </div>
                      
                      {isLoadingBio ? (
                        <div className="text-sm text-gray-500 italic">Loading bio...</div>
                      ) : (
                        <p className="text-sm text-gray-600 italic">
                          {bio || (isOwnProfile ? "No bio added yet. Use 'Edit Profile' to add one!" : "No bio available.")}
                        </p>
                      )}
                    </div>
                  </div>
                  {isOwnProfile && (
                    <>
                      <button
                        onClick={handleEditProfile}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors mr-2"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={handleChangePassword}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors mr-2"
                      >
                        Change Password
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors mr-2"
                      >
                        Sign Out
                      </button>
                      <button
                        onClick={fixCurrentUserData}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                      >
                        Fix User Data (Debug)
                      </button>
                      {(isAdmin || isSuperAdmin) && (
                        <button
                          onClick={fixAllUsersData}
                          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-xs"
                        >
                          Fix All Users (Admin)
                        </button>
                      )}
                    </>
                    )}
                  </div>
                  
                  {/* Upload progress indicator */}
                  {uploadProgress && (
                    <div className="absolute -bottom-8 left-0 right-0 text-center">
                      <p className="text-sm text-blue-600 font-medium">{uploadProgress}</p>
                    </div>
                  )}
                </div>              {/* Profile Editing Modal */}
              {isEditingProfile && isOwnProfile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
                    <h3 className="text-xl font-bold mb-6">Edit Profile</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={profileInput.displayName}
                          onChange={(e) => setProfileInput({
                            ...profileInput,
                            displayName: e.target.value
                          })}
                          maxLength={50}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your display name"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {profileInput.displayName.length}/50 characters
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={profileInput.bio}
                          onChange={(e) => setProfileInput({
                            ...profileInput,
                            bio: e.target.value
                          })}
                          maxLength={100}
                          placeholder="Tell us about yourself (max 100 characters)"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {profileInput.bio.length}/100 characters
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={handleCancelProfile}
                        disabled={isSavingProfile}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSavingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Change Password Modal */}
              {isChangingPassword && isOwnProfile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
                    <h3 className="text-xl font-bold mb-6">Change Password</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordInput.currentPassword}
                          onChange={(e) => setPasswordInput({
                            ...passwordInput,
                            currentPassword: e.target.value
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your current password"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordInput.newPassword}
                          onChange={(e) => setPasswordInput({
                            ...passwordInput,
                            newPassword: e.target.value
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your new password (min. 6 characters)"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordInput.confirmPassword}
                          onChange={(e) => setPasswordInput({
                            ...passwordInput,
                            confirmPassword: e.target.value
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm your new password"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={handleCancelPasswordChange}
                        disabled={isUpdatingPassword}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdatePassword}
                        disabled={isUpdatingPassword}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {isUpdatingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{userPosts.length}</div>
                    <div className="text-sm text-gray-600">Posts Created</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{userReplies.length}</div>
                    <div className="text-sm text-gray-600">Replies Made</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {userPosts.reduce((total, post) => total + (post.attendeeCount || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Attendees</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* User's Posts */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {isOwnProfile ? 'Your Posts' : `${displayUser?.displayName || 'User'}'s Posts`}
            </h3>
            {userPosts.length > 0 ? (
              <div className="space-y-6">
                {userPosts.map((post) => {
                  const postReplies = replies.filter(reply => reply.postId === post.id);
                  const organizeReplies = (replies: any[]) => {
                    const replyMap = new Map();
                    const topLevel: any[] = [];

                    // Sort by creation time first
                    const sortedReplies = [...replies].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

                    // Initialize map
                    sortedReplies.forEach(reply => {
                      replyMap.set(reply.id, { ...reply, children: [] });
                    });

                    // Organize into tree structure
                    sortedReplies.forEach(reply => {
                      if (reply.parentReplyId && replyMap.has(reply.parentReplyId)) {
                        replyMap.get(reply.parentReplyId).children.push(replyMap.get(reply.id));
                      } else {
                        topLevel.push(replyMap.get(reply.id));
                      }
                    });

                    return topLevel;
                  };

                  const organizedReplies = organizeReplies(postReplies);
                  const postStatus = getPostStatus(post);

                  return (
                    <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50">
                        <Link to={`/post/${post.id}`} className="block hover:bg-gray-100 transition-colors rounded p-2 -m-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 mb-1 hover:text-blue-600 transition-colors">
                                {post.type === 'need' ? (
                                  <span className="text-green-600 font-bold">{t('offers.iNeedLabel')}</span>
                                ) : (
                                  <span className="text-blue-600 font-bold">{t('offers.iOfferLabel')}</span>
                                )} {post.title}
                              </h4>
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.description}</p>
                              
                              {/* Post Image */}
                              {(post.imageUrl || post.imageData) && (
                                <div className="mb-2">
                                  <img
                                    src={post.imageData?.base64 || post.imageUrl}
                                    alt="Post image"
                                    className="w-full h-32 object-cover rounded border border-gray-200"
                                    onError={(e) => {
                                      // Hide image if it fails to load
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                  {post.imageData && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      📱 {Math.round(post.imageData.size / 1024)}KB
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>Created: {post.createdAt.toLocaleDateString()}</span>
                                  <span>{post.attendeeCount || 0} attendees</span>
                                  <span>{postReplies.length} replies</span>
                                </div>
                                
                                {/* Edit and Delete buttons for own posts */}
                                {isOwnProfile && (
                                  <div className="flex gap-2">
                                    <Link
                                      to={`/${post.type === 'need' ? 'i-need' : 'i-offer'}?edit=${post.id}`}
                                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-1"
                                      title="Edit your post"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      Edit
                                    </Link>
                                    <button
                                      onClick={() => handleDeletePost(post.id, post.title)}
                                      className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors flex items-center gap-1"
                                      title="Delete your post"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <span className={`inline-block text-xs px-2 py-1 rounded-full ${postStatus.color}`}>
                                {postStatus.text}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>

                      {/* Replies section */}
                      {organizedReplies.length > 0 && (
                        <div className="border-t border-gray-200 bg-white">
                          <div className="p-4">
                            <div className="flex justify-end mb-3">
                              <button
                                onClick={() => toggleRepliesCollapse(post.id)}
                                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                                  showingReplies.has(post.id) 
                                    ? 'bg-blue-200 text-blue-700 hover:bg-blue-300' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                {showingReplies.has(post.id) ? 'Close' : `Reply (${postReplies.length})`}
                              </button>
                            </div>
                            {showingReplies.has(post.id) && (
                              <div className="space-y-3">
                                {organizedReplies.map((reply) => (
                                  <ReplyComponent key={reply.id} reply={reply} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">
                  {isOwnProfile ? "You haven't created any posts yet" : "This user hasn't created any posts yet"}
                </p>
                {isOwnProfile && (
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => navigate('/i-offer')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create an Offer
                    </button>
                    <button
                      onClick={() => navigate('/i-need')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Post a Need
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
            {userReplies.length > 0 ? (
              <div className="space-y-3">
                {userReplies.slice(0, 5).map((reply) => {
                  const post = offers.find(offer => offer.id === reply.postId);
                  return (
                    <div key={reply.id} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-start gap-2 flex-1">
                          <span className="text-sm text-gray-600 flex-shrink-0">
                            {isOwnProfile ? 'You' : (displayUser?.displayName || 'User')} replied to <span className="font-medium">{post?.title || 'Unknown post'}</span>:
                          </span>
                          <p className="text-gray-500 text-xs italic flex-1">"{reply.text}"</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {reply.createdAt.toLocaleDateString()} at {reply.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
