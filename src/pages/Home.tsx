import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Navigation from '../components/Navigation';
import { useOffers } from '../contexts/FirebaseOffersContext';
import { useAuth } from '../contexts/FirebaseAuthContext';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { offers, loading, toggleAttendance, addReply, replies: allReplies } = useOffers();
  const { user, signOut } = useAuth();
  
  // State for reply functionality
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [nestedReplyingTo, setNestedReplyingTo] = useState<{postId: string, replyId: string, username: string} | null>(null);

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

  // Debug logging
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
      <div className="pt-20 flex flex-col items-center px-8">
        {/* Fun Circle Title - Centered and Big */}
        <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-16 text-center">
          {t('title')}
        </h1>
        
        {/* Navigation Menu - Full Width, Evenly Distributed */}
        <div className="w-full max-w-4xl mb-12 flex justify-center">
          <Navigation />
        </div>
        
        {/* Welcome Content - Centered */}
        <div className="text-center mt-8">
          <p className="text-xl text-gray-600 max-w-2xl">
            {t('content.description')}
          </p>
        </div>

        {/* Submitted Offers Section */}
        <div className="w-full max-w-6xl mt-16">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          ) : offers.length > 0 ? (
            <div className="space-y-4">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <Link to={`/post/${offer.id}`}>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
                          {offer.type === 'need' ? (
                            <span className="text-green-600 font-bold">[I NEED]</span>
                          ) : (
                            <span className="text-blue-600 font-bold">[I OFFER]</span>
                          )} {offer.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {offer.description}
                      </p>
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">
                          Posted by: {offer.userDisplayName || offer.userEmail || 'Anonymous'}
                        </span>
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
                      </div>
                      
                      {/* Reply Form and Replies Display - Show only for the post being replied to */}
                      {replyingTo === offer.id && user && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                          {/* Show existing replies with nested structure */}
                          {(() => {
                            const postReplies = getPostReplies(offer.id);
                            return postReplies.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-800 mb-3">
                                  Replies ({postReplies.length}):
                                </h4>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {postReplies.map((reply: any) => (
                                    <div 
                                      key={reply.id} 
                                      className={`bg-white p-3 rounded border text-sm ${
                                        reply.depth > 0 ? 'border-l-4 border-l-blue-300' : ''
                                      }`}
                                      style={reply.depth > 0 ? { marginLeft: `${Math.min(reply.depth * 20, 60)}px` } : {}}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-700">
                                            {reply.userDisplayName || reply.userEmail}
                                          </span>
                                          {reply.depth > 0 && reply.parentReplyId && (
                                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                              reply
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
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
                                      <p className="text-gray-600 mb-2">{reply.text}</p>
                                      
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
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
