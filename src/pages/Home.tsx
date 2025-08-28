import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Navigation from '../components/Navigation';
import { useOffers } from '../contexts/FirebaseOffersContext';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useAdmin } from '../contexts/AdminContext';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { offers, loading, toggleAttendance, addReply, replies: allReplies, deleteOffer } = useOffers();
  const { user, signOut } = useAuth();
  const { isAdmin, hasPermission, pinPost, deleteAnyPost } = useAdmin();
  
  // State for reply functionality
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [nestedReplyingTo, setNestedReplyingTo] = useState<{postId: string, replyId: string, username: string} | null>(null);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{id: string, title: string} | null>(null);

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // State for filters
  const [filterType, setFilterType] = useState<'all' | 'offer' | 'need'>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'soon' | 'ongoing' | 'completed'>('all');
  const [filterRating, setFilterRating] = useState<'all' | '4+' | '3+' | '2+' | '1+'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'rating'>('newest');

  // State for mobile CTA
  const [showMobileCTA, setShowMobileCTA] = useState(false);

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

  // Helper function to organize replies (same as PostDetail)
  const organizeReplies = useCallback((replies: any[]): any[] => {
    type ReplyWithChildren = any & { children: ReplyWithChildren[] };
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
    const flattenReplies = (replies: ReplyWithChildren[]): any[] => {
      const result: any[] = [];
      
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
  }, []);

  // Get organized replies for a specific post
  const getPostReplies = useCallback((postId: string) => {
    const postReplies = allReplies.filter(reply => reply.postId === postId);
    
    // Sort by creation date
    postReplies.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
    
    return organizeReplies(postReplies);
  }, [allReplies, organizeReplies]);

  // Filter offers based on search query and filters
  const filteredOffers = offers.filter(offer => {
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const title = offer.title?.toLowerCase() || '';
      const description = offer.description?.toLowerCase() || '';
      const username = offer.userDisplayName?.toLowerCase() || offer.userEmail?.toLowerCase() || '';
      
      if (!title.includes(query) && !description.includes(query) && !username.includes(query)) {
        return false;
      }
    }
    
    // Type filter
    if (filterType !== 'all') {
      if (filterType === 'offer' && offer.type !== 'offer') return false;
      if (filterType === 'need' && offer.type !== 'need') return false;
    }
    
    // Date filter
    if (filterDate !== 'all' && offer.createdAt) {
      const postDate = offer.createdAt.toDate ? offer.createdAt.toDate() : new Date(offer.createdAt);
      const now = new Date();
      const timeDiff = now.getTime() - postDate.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      
      if (filterDate === 'today' && daysDiff > 1) return false;
      if (filterDate === 'week' && daysDiff > 7) return false;
      if (filterDate === 'month' && daysDiff > 30) return false;
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      const postStatus = getPostStatus(offer);
      const statusText = postStatus.text.toLowerCase();
      
      if (filterStatus === 'active' && statusText !== 'active') return false;
      if (filterStatus === 'expired' && statusText !== 'expired') return false;
      if (filterStatus === 'soon' && statusText !== 'soon') return false;
      if (filterStatus === 'ongoing' && statusText !== 'ongoing') return false;
      if (filterStatus === 'completed' && statusText !== 'completed') return false;
    }
    
    // Rating filter
    if (filterRating !== 'all' && offer.averageRating !== undefined) {
      const rating = offer.averageRating;
      if (filterRating === '4+' && rating < 4) return false;
      if (filterRating === '3+' && rating < 3) return false;
      if (filterRating === '2+' && rating < 2) return false;
      if (filterRating === '1+' && rating < 1) return false;
    } else if (filterRating !== 'all' && offer.averageRating === undefined) {
      // If rating filter is applied but post has no rating, exclude it
      return false;
    }
    
    // Location filter
    if (filterLocation.trim()) {
      const locationQuery = filterLocation.toLowerCase();
      const location = offer.location?.toLowerCase() || '';
      const city = offer.city?.toLowerCase() || '';
      const state = offer.state?.toLowerCase() || '';
      
      if (!location.includes(locationQuery) && !city.includes(locationQuery) && !state.includes(locationQuery)) {
        return false;
      }
    }
    
    return true;
  });

  // Sort filtered offers
  const sortedOffers = [...filteredOffers].sort((a, b) => {
    if (sortBy === 'newest') {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    } else if (sortBy === 'oldest') {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateA.getTime() - dateB.getTime();
    } else if (sortBy === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    } else if (sortBy === 'rating') {
      const ratingA = a.averageRating || 0;
      const ratingB = b.averageRating || 0;
      return ratingB - ratingA; // Highest rating first
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedOffers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOffers = sortedOffers.slice(startIndex, endIndex);

  // Reset to page 1 when search query or filters change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Debug logging (minimal)
  console.log('🏠 Home: Rendering with', offers.length, 'offers, loading:', loading, 'user:', user ? 'logged in' : 'not logged in');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleReplyClick = (offerId: string) => {
    setReplyingTo(replyingTo === offerId ? null : offerId);
    setReplyText('');
    setNestedReplyingTo(null); // Reset nested reply state
  };

  const handleReplySubmit = async (offerId: string) => {
    if (!replyText.trim()) {
      alert('Please enter a reply message.');
      return;
    }
    
    try {
      // Check if this is a nested reply
      const parentReplyId = nestedReplyingTo?.replyId || undefined;
      await addReply(offerId, replyText, parentReplyId);
      console.log('Reply submitted successfully');
      
      // Reset form
      setReplyingTo(null);
      setReplyText('');
      setNestedReplyingTo(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Error submitting reply. Please try again.');
    }
  };

  const handleReplyCancel = () => {
    setReplyingTo(null);
    setReplyText('');
    setNestedReplyingTo(null);
  };

  // Admin handler functions
  const handlePinPost = async (postId: string, isPinned: boolean) => {
    if (!hasPermission('pin_posts')) {
      alert('You do not have permission to pin posts');
      return;
    }

    try {
      const success = await pinPost(postId, !isPinned);
      if (success) {
        // Posts will automatically refresh due to real-time listener
      } else {
        alert('Failed to update post pin status');
      }
    } catch (error) {
      console.error('Error pinning post:', error);
      alert('Error updating post pin status');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!hasPermission('delete_posts')) {
      alert('You do not have permission to delete posts');
      return;
    }

    const confirmDelete = window.confirm(
      'Are you sure you want to PERMANENTLY delete this post? This action cannot be undone.'
    );
    
    if (confirmDelete) {
      try {
        console.log('🗑️ Admin attempting to delete post:', postId);
        const success = await deleteAnyPost(postId);
        if (success) {
          console.log('✅ Post deleted successfully');
          // Posts will automatically refresh due to real-time listener
        } else {
          console.error('❌ Delete operation returned false');
          alert('Failed to delete post. Check console for details.');
        }
      } catch (error) {
        console.error('❌ Error in delete handler:', error);
        alert('Error deleting post: ' + error);
      }
    }
  };

  const handleDeleteOwnPost = async (postId: string) => {
    // Find the post to get its title
    const post = offers.find(offer => offer.id === postId);
    const postTitle = post?.title || 'this post';
    
    // Set the post to delete and show modal
    setPostToDelete({ id: postId, title: postTitle });
    setShowDeleteModal(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      console.log('🗑️ User deleting their own post:', postToDelete.id);
      await deleteOffer(postToDelete.id);
      console.log('✅ Post deleted successfully');
      // Posts will automatically refresh due to real-time listener
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('❌ Error deleting post:', error);
      alert('Error deleting post. Please try again.');
    }
  };

  const cancelDeletePost = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  // Rating handler functions
  const handleRatePost = (postId: string, _postTitle: string, postUserId: string) => {
    // Prevent users from rating their own posts
    if (user && postUserId === user.uid) {
      alert('You cannot rate your own post');
      return;
    }

    if (!user) {
      alert('Please sign in to rate posts');
      return;
    }

    // Navigate to the rating page
    navigate(`/rate/${postId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* User Auth & Language Switcher - Top Right */}
      <div className="absolute top-6 right-8 flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Welcome, 
              <button
                onClick={() => navigate('/user-profile')}
                className="text-blue-600 hover:text-blue-800 ml-1 transition-colors font-medium bg-transparent border-none outline-none focus:outline-none p-0 cursor-pointer"
              >
                {user.displayName || user.email}
              </button>
            </span>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600 transition-colors"
                title="Admin Panel"
              >
                👑 Admin
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            to="/user-registration"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Sign In / Sign Up
          </Link>
        )}
        <LanguageSwitcher />
      </div>

      {/* Main Content - Top Aligned */}
      <div className="pt-16 md:pt-20 flex flex-col items-center px-4 md:px-8">
        {/* Fun Circle Title - Centered and Big */}
        <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-4 text-center">
          {t('title')}
        </h1>
        
        {/* Tagline - Cursive Style */}
        <p className="text-2xl md:text-3xl text-gray-600 mb-16 text-center italic font-light">
          "Connect, share, and discover opportunities in your community"
        </p>
        
        {/* Search Bar */}
        <div className="w-full max-w-2xl mb-8">
          <div className="relative">
            <div className="flex items-center">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      handleSearchChange('');
                    }
                  }}
                  placeholder="Search by title, description, or username..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    title="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Search Results Count and Pagination Info */}
            {searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 z-10 shadow-sm">
                {sortedOffers.length === 0 
                  ? 'No posts found matching your search'
                  : `Found ${sortedOffers.length} post${sortedOffers.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                }
                {sortedOffers.length > itemsPerPage && (
                  <span className="ml-2 text-blue-600">
                    (Showing page {currentPage} of {totalPages})
                  </span>
                )}
                <span className="ml-2 text-blue-500 text-xs">(Press Escape to clear)</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation Menu - Full Width, Evenly Distributed */}
        <div className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-6 px-8 rounded-2xl shadow-lg mb-12 relative">
          <div className="max-w-4xl mx-auto">
            <Navigation />
          </div>
        </div>
        
        {/* Submitted Offers Section */}
        <div className="w-full max-w-6xl mt-16">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6 mb-8">
            <div className="flex flex-col gap-4">
              {/* Filter Section Label */}
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                <span>Filters:</span>
              </div>

              {/* Filters Container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 w-full">
                {/* Type Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value as 'all' | 'offer' | 'need');
                      handleFilterChange();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="all">All Posts</option>
                    <option value="offer">I OFFER</option>
                    <option value="need">I NEED</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value as 'all' | 'active' | 'expired' | 'soon' | 'ongoing' | 'completed');
                      handleFilterChange();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="soon">Soon</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">Rating</label>
                  <select
                    value={filterRating}
                    onChange={(e) => {
                      setFilterRating(e.target.value as 'all' | '4+' | '3+' | '2+' | '1+');
                      handleFilterChange();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="all">Any Rating</option>
                    <option value="4+">⭐ 4+ Stars</option>
                    <option value="3+">⭐ 3+ Stars</option>
                    <option value="2+">⭐ 2+ Stars</option>
                    <option value="1+">⭐ 1+ Stars</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">Date Posted</label>
                  <select
                    value={filterDate}
                    onChange={(e) => {
                      setFilterDate(e.target.value as 'all' | 'today' | 'week' | 'month');
                      handleFilterChange();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <input
                    type="text"
                    value={filterLocation}
                    onChange={(e) => {
                      setFilterLocation(e.target.value);
                      handleFilterChange();
                    }}
                    placeholder="Filter by city, state..."
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  />
                </div>
              </div>

              {/* Sort and Clear Section */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-end pt-4 border-t border-gray-200">
                {/* Sort By */}
                <div className="flex flex-col gap-1 flex-1 sm:flex-initial">
                  <label className="text-sm font-medium text-gray-600">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as 'newest' | 'oldest' | 'title' | 'rating');
                      handleFilterChange();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm w-full sm:min-w-[140px]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title A-Z</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={() => {
                    setFilterType('all');
                    setFilterDate('all');
                    setFilterLocation('');
                    setFilterStatus('all');
                    setFilterRating('all');
                    setSortBy('newest');
                    handleFilterChange();
                  }}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear All
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {paginatedOffers.length} of {sortedOffers.length} posts
                {searchQuery && (
                  <span className="ml-1">
                    matching "{searchQuery}"
                  </span>
                )}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          ) : paginatedOffers.length > 0 ? (
            <div className="space-y-4 md:space-y-6">
              {paginatedOffers.map((offer) => {
                const postStatus = getPostStatus(offer);
                return (
                <div
                  key={offer.id}
                  className={`relative rounded-xl p-4 md:p-8 shadow-md hover:shadow-lg transition-all duration-300 ${
                    offer.type === 'need' 
                      ? 'bg-gradient-to-br from-green-50 to-green-25 border border-green-200' 
                      : 'bg-gradient-to-br from-blue-50 to-blue-25 border border-blue-200'
                  } ${
                    offer.pinned ? 'ring-2 ring-yellow-400 bg-gradient-to-r from-yellow-50 to-white' : ''
                  }`}
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  {/* Rating Button - Top Right Corner */}
                  <button
                    onClick={() => handleRatePost(offer.id, offer.title, offer.userId)}
                    className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center gap-1 text-gray-600 hover:text-yellow-600 transition-colors bg-transparent border-none outline-none p-0 m-0"
                    title={offer.averageRating ? `Current rating: ${offer.averageRating.toFixed(1)} stars` : "Rate this post"}
                  >
                    {offer.averageRating && (
                      <span className="text-xs font-semibold">{offer.averageRating.toFixed(1)}</span>
                    )}
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {offer.ratingCount && offer.ratingCount > 0 && (
                      <span className="text-xs font-medium hidden sm:inline">
                        {offer.ratingCount} {offer.ratingCount === 1 ? 'rating' : 'ratings'}
                      </span>
                    )}
                  </button>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        {/* Type Badge - Prominent pill-shaped badge */}
                        <span className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold flex-shrink-0 w-fit ${
                          offer.type === 'need' 
                            ? 'bg-green-500 text-white shadow-green-200 shadow-md' 
                            : 'bg-blue-500 text-white shadow-blue-200 shadow-md'
                        }`}>
                          {offer.type === 'need' ? t('offers.iNeedLabel') : t('offers.iOfferLabel')}
                        </span>
                        
                        {/* Title - Stacked on mobile, same line on tablet+ */}
                        <Link to={`/post/${offer.id}`} className="flex-1">
                          <h3 className="text-lg md:text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer leading-tight">
                            {offer.title}
                          </h3>
                        </Link>
                        
                        {offer.pinned && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 md:px-3 md:py-1 rounded-full flex items-center gap-1 font-medium border border-yellow-300 flex-shrink-0 w-fit">
                            📌 Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {offer.description}
                      </p>
                      
                      {/* Image indicator - show if post has image */}
                      {offer.imageExpired ? (
                        <div className="mb-3">
                          <div className="bg-gray-50 border border-gray-300 rounded-lg p-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-600">📷 Image expired</span>
                          </div>
                        </div>
                      ) : (offer.imageUrl || offer.imageData) && (
                        <div className="mb-3">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-blue-700">📷 Has photo</span>
                            {offer.imageData && (
                              <span className="text-xs text-blue-600">
                                ({Math.round(offer.imageData.size / 1024)}KB)
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">
                          Posted by: 
                          <Link 
                            to={`/user/${offer.userId}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline ml-1"
                          >
                            {offer.userDisplayName || offer.userEmail || 'Anonymous'}
                          </Link>
                        </span>
                        
                        {/* User's Own Post Edit/Delete Buttons - Right after "Posted by" */}
                        {user && offer.userId === user.uid && (
                          <div className="ml-3 flex gap-1">
                            <Link
                              to={`/${offer.type === 'need' ? 'i-need' : 'i-offer'}?edit=${offer.id}`}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-1"
                              title="Edit your post"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteOwnPost(offer.id)}
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
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {offer.dateTime && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(offer.dateTime).toLocaleDateString()} {new Date(offer.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        )}
                        {offer.price && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            {offer.price}
                          </span>
                        )}
                        {offer.online ? (
                          <span className="flex items-center text-blue-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                            Online
                          </span>
                        ) : (offer.location || offer.city || offer.state) && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {[offer.location, offer.city, offer.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {/* Show attendance count to everyone */}
                        {(offer.attendeeCount || 0) > 0 && (
                          <span className="text-xs text-gray-600">
                            {offer.attendeeCount} attending
                          </span>
                        )}
                        {/* Only show attend button to registered users */}
                        {user && (
                          <button
                            onClick={async () => {
                              try {
                                await toggleAttendance(offer.id);
                              } catch (error) {
                                console.error('Error toggling attendance:', error);
                                alert('Error updating attendance. Please try again.');
                              }
                            }}
                            className={`ml-2 px-2 py-1 text-xs rounded-md transition-colors ${
                              offer.attendees?.includes(user?.uid || '') 
                                ? 'bg-blue-200 text-blue-700 hover:bg-blue-300' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {offer.attendees?.includes(user?.uid || '') ? 'Attending' : 'Attend'}
                          </button>
                        )}
                        {/* Show reply button to everyone */}
                        <button
                          onClick={() => {
                            if (!user) {
                              alert('Please sign in to reply to posts.');
                              return;
                            }
                            handleReplyClick(offer.id);
                          }}
                          className={`ml-2 px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                            replyingTo === offer.id 
                              ? 'bg-blue-200 text-blue-700 hover:bg-blue-300' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          {replyingTo === offer.id ? 'Close' : `Reply${(() => {
                            const replyCount = getPostReplies(offer.id).length;
                            return replyCount > 0 ? ` (${replyCount})` : '';
                          })()}`}
                        </button>

                        {/* Admin Controls - Only visible to admins */}
                        {isAdmin && (
                          <div className="ml-2 flex gap-1">
                            {hasPermission('pin_posts') && (
                              <button
                                onClick={() => handlePinPost(offer.id, offer.pinned || false)}
                                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                  offer.pinned
                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                title={offer.pinned ? 'Unpin post' : 'Pin post'}
                              >
                                {offer.pinned ? '📌 Unpin' : '📌 Pin'}
                              </button>
                            )}
                            {hasPermission('delete_posts') && (
                              <button
                                onClick={() => handleDeletePost(offer.id)}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
                                title="Delete post"
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Reply Form and Replies Display - Show only for the post being replied to */}
                      {replyingTo === offer.id && user && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                          {/* Show existing replies with nested structure */}
                          {(() => {
                            const postReplies = getPostReplies(offer.id);
                            return postReplies.length > 0 && (
                              <div className="mb-4">
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {postReplies.map((reply: any) => (
                                    <div 
                                      key={reply.id} 
                                      className={`bg-white p-3 rounded border text-sm ${
                                        reply.depth > 0 ? 'border-l-4 border-l-blue-300' : ''
                                      }`}
                                      style={reply.depth > 0 ? { marginLeft: `${Math.min(reply.depth * 20, 60)}px` } : {}}
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-start gap-2 flex-1">
                                          <span className="font-medium text-gray-700 flex-shrink-0">
                                            <Link 
                                              to={`/user/${reply.userId}`}
                                              className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                              {reply.userDisplayName || reply.userEmail}
                                            </Link>
                                            {reply.depth > 0 && reply.parentReplyId && (
                                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded ml-2">
                                                reply
                                              </span>
                                            )}:
                                          </span>
                                          <p className="text-gray-600 flex-1">{reply.text}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                          <span className="text-xs text-gray-500">
                                            {(() => {
                                              const date = reply.createdAt.toDate ? reply.createdAt.toDate() : new Date(reply.createdAt);
                                              return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                            })()}
                                          </span>
                                          {user && (
                                            <button
                                              onClick={() => {
                                                if (nestedReplyingTo?.replyId === reply.id) {
                                                  setNestedReplyingTo(null);
                                                  setReplyText('');
                                                } else {
                                                  setNestedReplyingTo({
                                                    postId: offer.id,
                                                    replyId: reply.id,
                                                    username: reply.userDisplayName || reply.userEmail
                                                  });
                                                  setReplyText(`@${reply.userDisplayName || reply.userEmail} `);
                                                }
                                              }}
                                              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                              {nestedReplyingTo?.replyId === reply.id ? 'Cancel' : 'Reply'}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Inline nested reply form */}
                                      {user && nestedReplyingTo?.replyId === reply.id && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-300">
                                          <h5 className="text-xs font-medium text-gray-700 mb-2">
                                            Replying to {nestedReplyingTo?.username}
                                          </h5>
                                          <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder={`Reply to ${nestedReplyingTo?.username}...`}
                                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
                                            rows={2}
                                            autoFocus
                                          />
                                          <div className="flex gap-2 mt-2">
                                            <button
                                              onClick={() => handleReplySubmit(offer.id)}
                                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                            >
                                              Submit
                                            </button>
                                            <button
                                              onClick={() => {
                                                setNestedReplyingTo(null);
                                                setReplyText('');
                                              }}
                                              className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                          
                          {/* Main reply form - Only show if not replying to a specific reply */}
                          {!nestedReplyingTo && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-800 mb-2">Add a reply:</h4>
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write your reply here..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={3}
                              />
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleReplySubmit(offer.id)}
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  Submit Reply
                                </button>
                                <button
                                  onClick={handleReplyCancel}
                                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-6 md:mt-0 md:ml-6 flex flex-col items-end gap-2">
                      {/* Status Badge - Enhanced pill shape with better contrast */}
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-md ${
                        postStatus.text === 'Active' ? 'bg-green-500 text-white' :
                        postStatus.text === 'Soon' ? 'bg-yellow-500 text-white' :
                        postStatus.text === 'Ongoing' ? 'bg-blue-500 text-white' :
                        postStatus.text === 'Completed' ? 'bg-gray-500 text-white' :
                        'bg-gray-400 text-white'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          postStatus.text === 'Active' ? 'bg-green-300' :
                          postStatus.text === 'Soon' ? 'bg-yellow-300' :
                          postStatus.text === 'Ongoing' ? 'bg-blue-300' :
                          postStatus.text === 'Completed' ? 'bg-gray-300' :
                          'bg-gray-300'
                        }`}></div>
                        {postStatus.text}
                      </span>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              
              {/* Show different messages based on whether it's a search result or no posts */}
              {searchQuery.trim() ? (
                <div>
                  <h3 className="text-xl font-medium text-gray-500 mb-2">No matching posts found</h3>
                  <p className="text-gray-400 mb-6">
                    No posts match your search for "{searchQuery}". Try different keywords or{' '}
                    <button
                      onClick={() => handleSearchChange('')}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      clear your search
                    </button>
                    .
                  </p>
                </div>
              ) : offers.length === 0 ? (
                <div>
                  <h3 className="text-xl font-medium text-gray-500 mb-2">No posts yet</h3>
                  <p className="text-gray-400 mb-6">Be the first to share what you're offering or what you need!</p>
                  {/* Show action buttons for registered users, sign up prompt for non-registered */}
                  {user ? (
                    <div className="flex gap-4 justify-center">
                      <Link
                        to="/i-offer"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create an Offer
                      </Link>
                      <Link
                        to="/i-need"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Post a Need
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-500 mb-4">Sign up to create posts and join the community!</p>
                      <Link
                        to="/user-registration"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Sign Up / Sign In
                      </Link>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Pagination Component */}
        {sortedOffers.length > itemsPerPage && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && postToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Delete Post</h3>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  Are you sure you want to delete your post?
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    "{postToDelete.title}"
                  </p>
                </div>
                <p className="text-sm text-red-600 mt-3 font-medium">
                  ⚠️ This will permanently delete the post and all its replies.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDeletePost}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePost}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="bg-black border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('footer.about.title')}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {t('footer.about.description')}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('footer.quickLinks.title')}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">
                    {t('footer.quickLinks.aboutUs')}
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">
                    {t('footer.quickLinks.contactUs')}
                  </a>
                </li>
                <li>
                  <a href="/community-guidelines" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">
                    {t('footer.quickLinks.communityGuidelines')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('footer.legal.title')}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/terms-of-service" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">
                    {t('footer.legal.termsOfService')}
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">
                    {t('footer.legal.privacyPolicy')}
                  </a>
                </li>
                <li>
                  <a href="/cookie-policy" className="text-gray-300 hover:text-blue-400 text-sm transition-colors">
                    {t('footer.legal.cookiePolicy')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('footer.contact.title')}</h3>
              <div className="space-y-2">
                <p className="text-gray-300 text-sm">
                  {t('footer.contact.description')}
                </p>
                <a 
                  href="mailto:fun_circle@outlook.com" 
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors block"
                >
                  fun_circle@outlook.com
                </a>
                <div className="flex space-x-4 mt-4">
                  {/* Social Media Icons (placeholder) */}
                  <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors">
                    <span className="sr-only">Facebook</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-start items-center">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} {t('title')}. {t('footer.copyright')}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA Button */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <div className="relative">
          {/* Main + Post Button */}
          <button
            onClick={() => setShowMobileCTA(!showMobileCTA)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          >
            <svg 
              className={`w-6 h-6 transition-transform duration-300 ${showMobileCTA ? 'rotate-45' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Expandable Menu */}
          <div className={`absolute bottom-16 right-0 transition-all duration-300 ${
            showMobileCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}>
            <div className="flex flex-col gap-3">
              {/* I OFFER Button */}
              <Link
                to="/i-offer"
                onClick={() => setShowMobileCTA(false)}
                className="bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 min-w-fit whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">I OFFER</span>
              </Link>

              {/* I NEED Button */}
              <Link
                to="/i-need"
                onClick={() => setShowMobileCTA(false)}
                className="bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 min-w-fit whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">I NEED</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
