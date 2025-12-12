import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Navigation from '../components/Navigation';
import FormattedText from '../components/FormattedText';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useOffers } from '../contexts/FirebaseOffersContext';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useAdmin } from '../contexts/AdminContext';
import logoSvg from '../logo.svg';

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
  const [filterEventType, setFilterEventType] = useState('all');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'soon' | 'ongoing' | 'completed'>('all');
  const [filterRating, setFilterRating] = useState<'all' | '4+' | '3+' | '2+' | '1+'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'rating'>('newest');

  // State for mobile CTA
  const [showMobileCTA, setShowMobileCTA] = useState(false);

  // Function to determine post status
  const getPostStatus = (post: any) => {
    // Pinned posts are always Active
    if (post.isPinned) {
      return { text: 'Active', color: 'bg-green-100 text-green-800' };
    }

    // All posts must have a start date
    if (!post.dateTime) {
      return { text: 'Invalid', color: 'bg-red-100 text-red-800' };
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
    
    // Event Type filter
    if (filterEventType !== 'all') {
      if (offer.eventType !== filterEventType) return false;
    }
    
    // Date filter
    if (filterDate !== 'all' && offer.createdAt) {
      const postDate = (offer.createdAt as any).toDate ? (offer.createdAt as any).toDate() : new Date(offer.createdAt);
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
      const dateA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate() : new Date(a.createdAt || 0);
      const dateB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate() : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    } else if (sortBy === 'oldest') {
      const dateA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate() : new Date(a.createdAt || 0);
      const dateB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate() : new Date(b.createdAt || 0);
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

  // Structured data for HomePage
  const homePageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Fun Circle",
    "url": "https://fun-circle.com",
    "description": "Local community platform connecting neighbors through services and fun events",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://fun-circle.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://www.facebook.com/funcircle",
      "https://www.twitter.com/funcircle",
      "https://www.linkedin.com/company/funcircle"
    ],
    "publisher": {
      "@type": "Organization",
      "@id": "https://fun-circle.com/#organization",
      "name": "Fun Circle",
      "url": "https://fun-circle.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://fun-circle.com/logo.svg"
      }
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Community Services & Events",
      "description": "Available services and fun events in the Fun Circle community",
      "numberOfItems": filteredOffers.length,
      "itemListElement": filteredOffers.slice(0, 10).map((offer, index) => ({
        "@type": "Service",
        "position": index + 1,
        "name": offer.title,
        "description": offer.description,
        "provider": {
          "@type": "Person",
          "name": offer.userDisplayName || offer.userEmail
        },
        "url": `https://fun-circle.com/post/${offer.id}`,
        "serviceType": offer.type === 'offer' ? 'ServiceOffering' : 'ServiceRequest'
      }))
    }
  };

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://fun-circle.com/#organization",
    "name": "Fun Circle",
    "url": "https://fun-circle.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://fun-circle.com/logo.svg",
      "width": 200,
      "height": 200
    },
    "description": "Fun Circle is a local community platform that connects neighbors for skill exchange and services. Find trusted local service providers or offer your own skills to help your community.",
    "sameAs": [
      "https://www.facebook.com/funcircle",
      "https://www.twitter.com/funcircle",
      "https://www.linkedin.com/company/funcircle"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://fun-circle.com/contact"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Fun Circle - Local Community Services & Fun Events Platform"
        description="Connect with your local community on Fun Circle. Find trusted services like tutoring and handyman work, discover fun events like parties and social gatherings. Offer your skills and build meaningful connections with neighbors."
        keywords="local services, community events, fun events, skill exchange, tutoring, handyman, tech support, cleaning services, gardening, community activities, event planning, social gatherings, neighborhood services, local business directory"
        url="https://fun-circle.com/"
        type="website"
        structuredData={[homePageStructuredData, organizationStructuredData]}
      />
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
        {/* Logo and Fun Circle Title - Horizontal Layout */}
        <div className="flex items-center justify-center mb-4">
          <img 
            src={logoSvg} 
            alt="Fun Circle Logo" 
            className="w-16 h-16 md:w-24 md:h-24 mr-4 md:mr-6"
          />
          <h1 className="text-6xl md:text-8xl font-bold text-gray-800">
            {t('title')}
          </h1>
        </div>
        
        {/* Tagline - Cursive Style */}
        <p className="text-2xl md:text-3xl text-gray-600 mb-16 text-center italic font-light">
          "Connect, share, and discover opportunities in your community"
        </p>
        
        {/* Navigation Menu - Full Width, Evenly Distributed */}
        <div className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-6 px-8 rounded-2xl shadow-lg mb-6 relative">
          <div className="max-w-4xl mx-auto">
            <Navigation />
          </div>
        </div>
        
        {/* Submitted Offers Section */}
        <div className="w-full max-w-6xl mt-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6 mb-8">
            {/* Airbnb/Eventbrite Style Filter Bar */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              {/* Search Bar - Full Width */}
              <div className="mb-5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                    placeholder="Search events by title, description, or organizer..."
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-full focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 bg-white text-base transition-all placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                      title="Clear search"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Search Results Count */}
                {searchQuery.trim() && (
                  <div className="mt-3 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-700">
                    {sortedOffers.length === 0 
                      ? '🔍 No events found matching your search'
                      : `✨ Found ${sortedOffers.length} event${sortedOffers.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                    }
                    {sortedOffers.length > itemsPerPage && (
                      <span className="ml-2 text-rose-600 font-medium">
                        (Page {currentPage} of {totalPages})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Horizontal Filter Bar */}
              <div className="flex flex-wrap items-center gap-3 pb-5 border-b border-gray-200">
                {/* Category Filter */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Category</label>
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value as 'all' | 'offer' | 'need');
                      handleFilterChange();
                    }}
                    className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 transition-all cursor-pointer min-w-[140px]"
                  >
                    <option value="all">All Events</option>
                    <option value="offer">🎯 Host Event</option>
                    <option value="need">🔍 Request Event</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-6">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Event Type Filter */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Event Type</label>
                  <select
                    value={filterEventType}
                    onChange={(e) => {
                      setFilterEventType(e.target.value);
                      handleFilterChange();
                    }}
                    className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 transition-all cursor-pointer min-w-[180px]"
                  >
                    <option value="all">All Types</option>
                    <option value="sports">⚽ Sports</option>
                    <option value="social">🎉 Social</option>
                    <option value="music">🎵 Music</option>
                    <option value="food">🍽️ Food</option>
                    <option value="education">📚 Education</option>
                    <option value="arts">🎨 Arts</option>
                    <option value="outdoor">🏕️ Outdoor</option>
                    <option value="games">🎮 Gaming</option>
                    <option value="wellness">🧘 Wellness</option>
                    <option value="community">🤝 Community</option>
                    <option value="kids">👶 Kids</option>
                    <option value="professional">💼 Professional</option>
                    <option value="other">🔧 Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-6">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Location Filter */}
                <div className="relative flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={filterLocation}
                      onChange={(e) => {
                        setFilterLocation(e.target.value);
                        handleFilterChange();
                      }}
                      placeholder="City or state..."
                      className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 transition-all placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Date Posted Filter */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Date Posted</label>
                  <select
                    value={filterDate}
                    onChange={(e) => {
                      setFilterDate(e.target.value as 'all' | 'today' | 'week' | 'month');
                      handleFilterChange();
                    }}
                    className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 transition-all cursor-pointer min-w-[130px]"
                  >
                    <option value="all">Any Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-6">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value as 'all' | 'active' | 'expired' | 'soon' | 'ongoing' | 'completed');
                      handleFilterChange();
                    }}
                    className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 transition-all cursor-pointer min-w-[120px]"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="soon">Soon</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-6">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Rating</label>
                  <select
                    value={filterRating}
                    onChange={(e) => {
                      setFilterRating(e.target.value as 'all' | '4+' | '3+' | '2+' | '1+');
                      handleFilterChange();
                    }}
                    className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 transition-all cursor-pointer min-w-[110px]"
                  >
                    <option value="all">Any</option>
                    <option value="4+">⭐ 4+</option>
                    <option value="3+">⭐ 3+</option>
                    <option value="2+">⭐ 2+</option>
                    <option value="1+">⭐ 1+</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-6">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bottom Bar: Sort & Apply */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-5">
                {/* Sort By */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as 'newest' | 'oldest' | 'title' | 'rating');
                      handleFilterChange();
                    }}
                    className="appearance-none pl-4 pr-10 py-2 border-2 border-gray-200 rounded-full focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 transition-all cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Alphabetical</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {/* Clear Filters */}
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setFilterEventType('all');
                      setFilterDate('all');
                      setFilterLocation('');
                      setFilterStatus('all');
                      setFilterRating('all');
                      setSortBy('newest');
                      setSearchQuery('');
                      handleFilterChange();
                    }}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 border-2 border-gray-200 hover:border-gray-300 rounded-full transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear All
                  </button>

                  {/* Apply Filters Button */}
                  <button
                    onClick={() => handleFilterChange()}
                    className="px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Results Summary Bar */}
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl px-6 py-4 mb-6 border border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-medium text-gray-700">
                  Showing <span className="font-bold text-gray-900">{paginatedOffers.length}</span> of <span className="font-bold text-gray-900">{sortedOffers.length}</span> events
                  {searchQuery && (
                    <span className="ml-2 text-rose-600">
                      matching "<span className="font-semibold">{searchQuery}</span>"
                    </span>
                  )}
                </p>
                {sortedOffers.length > itemsPerPage && (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Page {currentPage} of {totalPages}
                  </span>
                )}
              </div>
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
                          <h3 className="text-xl md:text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer leading-tight">
                            {offer.title}
                          </h3>
                        </Link>
                        
                        {offer.pinned && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 md:px-3 md:py-1 rounded-full flex items-center gap-1 font-medium border border-yellow-300 flex-shrink-0 w-fit">
                            📌 Pinned
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 mb-3 line-clamp-2">
                        <FormattedText text={offer.description} />
                      </div>
                      
                      {/* Image display - show actual image or expired indicator */}
                      {offer.imageExpired ? (
                        <div className="mb-3">
                          <div className="bg-gray-50 border border-gray-300 rounded-lg p-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-600">📷 Image expired</span>
                          </div>
                        </div>
                      ) : (offer.images && offer.images.length > 0) ? (
                        <div className="mb-3">
                          <div className="flex gap-2 flex-wrap">
                            {offer.images.slice(0, 3).map((image, index) => (
                              <div key={index} className="relative flex-shrink-0" style={{ width: (offer.images && offer.images.length === 1) ? '100%' : 'auto' }}>
                                <img
                                  src={image.base64}
                                  alt={`${offer.title} - Image ${index + 1}`}
                                  className="max-h-32 object-contain object-left rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                                  style={{ width: (offer.images && offer.images.length === 1) ? '100%' : 'auto' }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // Create modal overlay with gallery navigation
                                    let currentIndex = index;
                                    const modal = document.createElement('div');
                                    modal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4';
                                    
                                    const updateImage = () => {
                                      const img = modal.querySelector('img');
                                      if (img && offer.images) {
                                        img.src = offer.images[currentIndex].base64;
                                      }
                                      const counter = modal.querySelector('.image-counter');
                                      if (counter && offer.images) {
                                        counter.textContent = `${currentIndex + 1} / ${offer.images.length}`;
                                      }
                                      // Update button visibility
                                      const prevBtn = modal.querySelector('.prev-btn') as HTMLElement;
                                      const nextBtn = modal.querySelector('.next-btn') as HTMLElement;
                                      if (prevBtn) prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
                                      if (nextBtn && offer.images) nextBtn.style.display = currentIndex === offer.images.length - 1 ? 'none' : 'flex';
                                    };
                                    
                                    modal.innerHTML = `
                                      <button class="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center close-btn">×</button>
                                      ${offer.images && offer.images.length > 1 ? `
                                        <button class="prev-btn absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl font-bold hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-10 h-10 items-center justify-center" style="display: ${currentIndex === 0 ? 'none' : 'flex'}">‹</button>
                                        <button class="next-btn absolute right-4 top-1/2 -translate-y-1/2 text-white text-2xl font-bold hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-10 h-10 items-center justify-center" style="display: ${currentIndex === offer.images.length - 1 ? 'none' : 'flex'}">›</button>
                                        <div class="image-counter absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">${currentIndex + 1} / ${offer.images.length}</div>
                                      ` : ''}
                                      <img src="${offer.images ? offer.images[currentIndex].base64 : ''}" class="max-w-full max-h-full object-contain rounded-lg" onclick="event.stopPropagation()"/>
                                    `;
                                    
                                    modal.onclick = () => modal.remove();
                                    modal.querySelector('.close-btn')?.addEventListener('click', () => modal.remove());
                                    modal.querySelector('.prev-btn')?.addEventListener('click', (e) => {
                                      e.stopPropagation();
                                      if (currentIndex > 0) {
                                        currentIndex--;
                                        updateImage();
                                      }
                                    });
                                    modal.querySelector('.next-btn')?.addEventListener('click', (e) => {
                                      e.stopPropagation();
                                      if (offer.images && currentIndex < offer.images.length - 1) {
                                        currentIndex++;
                                        updateImage();
                                      }
                                    });
                                    
                                    document.body.appendChild(modal);
                                  }}
                                />
                                {index === 2 && offer.images && offer.images.length > 3 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                    +{offer.images.length - 3}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {offer.images.length > 1 && (
                            <p className="text-xs text-gray-500 mt-1">{offer.images.length} photos</p>
                          )}
                        </div>
                      ) : (offer.imageUrl || offer.imageData) && (
                        <div className="mb-3">
                          <img
                            src={offer.imageData ? offer.imageData.base64 : offer.imageUrl}
                            alt={offer.title}
                            className="max-w-full max-h-32 object-contain object-left rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                            onError={(e) => {
                              // Hide broken images gracefully
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Create modal overlay for full-size image
                              const modal = document.createElement('div');
                              modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                              modal.onclick = () => modal.remove();
                              
                              const img = document.createElement('img');
                              img.src = offer.imageData ? offer.imageData.base64 : offer.imageUrl || '';
                              img.className = 'max-w-full max-h-full object-contain rounded-lg';
                              img.onclick = (e) => e.stopPropagation();
                              
                              const closeBtn = document.createElement('button');
                              closeBtn.innerHTML = '×';
                              closeBtn.className = 'absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center';
                              closeBtn.onclick = () => modal.remove();
                              
                              modal.appendChild(img);
                              modal.appendChild(closeBtn);
                              document.body.appendChild(modal);
                            }}
                          />
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
              {/* HOST EVENT Button */}
              <Link
                to="/i-offer"
                onClick={() => setShowMobileCTA(false)}
                className="bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 min-w-fit whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">HOST EVENT</span>
              </Link>

              {/* REQUEST EVENT Button */}
              <Link
                to="/i-need"
                onClick={() => setShowMobileCTA(false)}
                className="bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 min-w-fit whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">REQUEST EVENT</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
