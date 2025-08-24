import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOffers } from '../contexts/FirebaseOffersContext';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useAdmin } from '../contexts/AdminContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const PostDetail = () => {
  const { t } = useTranslation();
  const { postId } = useParams();
  const navigate = useNavigate();
  const { offers, loading, toggleAttendance, addReply, replies: allReplies } = useOffers();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{id: string, username: string} | null>(null);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  const handleImageDoubleClick = () => {
    console.log('Image double-clicked, opening fullscreen...');
    setIsImageFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    console.log('Closing fullscreen image...');
    setIsImageFullscreen(false);
  };

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isImageFullscreen) {
        console.log('ESC key pressed, closing fullscreen...');
        handleCloseFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImageFullscreen]);

  // Find the specific post
  const post = offers.find(offer => offer.id === postId);

  // Helper function to organize replies (moved from context for direct use)
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

  // Get replies for this post from the real-time context and organize them
  const replies = useMemo(() => {
    if (!postId) return [];
    
    // Filter replies for this post
    const postReplies = allReplies.filter(reply => reply.postId === postId);
    
    // Sort by creation date
    postReplies.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Organize into nested structure with depth
    return organizeReplies(postReplies);
  }, [postId, allReplies, organizeReplies]);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      alert('Please enter a reply message.');
      return;
    }
    
    if (!user) {
      alert('Please sign in to reply to posts.');
      return;
    }
    
    try {
      // Use the replyingTo state to determine if this is a nested reply
      const parentReplyId = replyingTo?.id || undefined;
      await addReply(postId!, replyText, parentReplyId);
      console.log('Reply submitted successfully');
      
      // Reset form - no need to manually reload replies since real-time listener will handle it
      setReplyText('');
      setShowReplyForm(false);
      setReplyingTo(null);
      
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Error submitting reply. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading post...</div>
      </div>
    );
  }

  // If offers are loaded but post is not found
  if (!loading && offers.length > 0 && !post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-6">The post you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If still loading offers or post not found yet, show loading
  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading post...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Post Details</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            {/* Post Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {post.type === 'need' ? (
                  <span className="text-red-600 font-bold">{t('offers.iNeedLabel')}</span>
                ) : (
                  <span className="text-blue-600 font-bold">{t('offers.iOfferLabel')}</span>
                )} {post.title}
              </h2>
              
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">
                  Posted by: 
                  <Link 
                    to={`/user/${post.userId}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline ml-1"
                  >
                    {post.userDisplayName || post.userEmail || 'Anonymous'}
                  </Link>
                </span>
              </div>
            </div>

            {/* Post Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.description}
              </p>
            </div>

            {/* Post Image */}
            {post.imageExpired ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Photo</h3>
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 font-medium mb-2">The image is expired.</p>
                  <p className="text-sm text-gray-500">
                    {post.imageExpiredReason || 'Image was removed to free up storage space.'}
                  </p>
                  {post.imageExpiredAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      Removed on {post.imageExpiredAt.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ) : (post.imageUrl || post.imageData) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Photo</h3>
                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                  <img
                    src={post.imageData?.base64 || post.imageUrl}
                    alt="Post image"
                    className="w-full h-auto max-h-96 object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105 select-none"
                    onDoubleClick={handleImageDoubleClick}
                    onClick={() => console.log('Image clicked (single)')}
                    onError={(e) => {
                      console.error('Image failed to load:', {
                        src: (e.target as HTMLImageElement).src,
                        imageData: post.imageData,
                        imageUrl: post.imageUrl
                      });
                      // Hide image if it fails to load
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', {
                        hasImageData: !!post.imageData,
                        hasImageUrl: !!post.imageUrl,
                        hasBase64: !!post.imageData?.base64
                      });
                    }}
                  />
                  {/* Hover overlay with double-click hint */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center pointer-events-none">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm text-gray-700">
                      Double-click to enlarge
                    </div>
                  </div>
                </div>
                {post.imageData && isAdmin && (
                  <p className="text-xs text-gray-500 mt-2">
                    📱 Optimized for free plan • {Math.round(post.imageData.size / 1024)}KB
                  </p>
                )}
              </div>
            )}

            {/* Fullscreen Image Modal */}
            {isImageFullscreen && (post.imageUrl || post.imageData) && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                onClick={handleCloseFullscreen}
              >
                <div className="relative max-w-full max-h-full">
                  <img
                    src={post.imageData?.base64 || post.imageUrl}
                    alt="Post image - Full size"
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {/* Close button */}
                  <button
                    onClick={handleCloseFullscreen}
                    className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {/* Instructions */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                    Click anywhere to close • ESC key
                  </div>
                </div>
              </div>
            )}

            {/* Post Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.dateTime && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <span className="font-medium">Start Date & Time:</span>
                      <br />
                      <span>{new Date(post.dateTime).toLocaleDateString()}</span>
                      <br />
                      <span>{new Date(post.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                )}

                {post.endDateTime && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <span className="font-medium">End Date & Time:</span>
                      <br />
                      <span>{new Date(post.endDateTime).toLocaleDateString()}</span>
                      <br />
                      <span>{new Date(post.endDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                )}
                
                {post.price && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <div>
                      <span className="font-medium">Price:</span>
                      <br />
                      <span className="text-lg">{post.price}</span>
                    </div>
                  </div>
                )}

                {post.online ? (
                  <div className="flex items-center text-blue-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    <div>
                      <span className="font-medium">Location:</span>
                      <br />
                      <span>Online</span>
                    </div>
                  </div>
                ) : (post.location || post.city || post.state) && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <span className="font-medium">Location:</span>
                      <br />
                      <span>{[post.location, post.city, post.state].filter(Boolean).join(', ')}</span>
                    </div>
                  </div>
                )}

                {(post.attendeeCount || 0) > 0 && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <span className="font-medium">Attendance:</span>
                      <br />
                      <span>{post.attendeeCount} attending</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-8 flex gap-3">
              {user && (
                <button
                  onClick={async () => {
                    try {
                      await toggleAttendance(post.id);
                    } catch (error) {
                      console.error('Error toggling attendance:', error);
                      alert('Error updating attendance. Please try again.');
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    post.attendees?.includes(user?.uid || '') 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {post.attendees?.includes(user?.uid || '') ? 'Attending' : 'Attend'}
                </button>
              )}
              
              <button
                onClick={() => {
                  if (!user) {
                    alert('Please sign in to reply to posts.');
                    return;
                  }
                  setReplyingTo(null); // Reset replying to for main reply
                  setReplyText(''); // Reset reply text
                  setShowReplyForm(!showReplyForm);
                }}
                className="px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                {showReplyForm && !replyingTo ? 'Cancel Reply' : 'Reply'}
              </button>
            </div>

            {/* Main Reply Form - Only show for top-level replies */}
            {showReplyForm && user && !replyingTo && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
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
                    onClick={handleReplySubmit}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Submit Reply
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyText('');
                      setReplyingTo(null);
                    }}
                    className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Replies Section */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Replies ({replies.length})
              </h3>
              
              {replies.length > 0 ? (
                <div className="space-y-3">
                  {replies.map((reply: any) => (
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
                            <Link 
                              to={`/user/${reply.userId}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {reply.userDisplayName || reply.userEmail}
                            </Link>
                          </span>
                          {reply.depth > 0 && reply.parentReplyId && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              reply
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {reply.createdAt && (() => {
                              // Handle both Firestore Timestamp and Date objects
                              const date = reply.createdAt.toDate ? reply.createdAt.toDate() : new Date(reply.createdAt);
                              return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                            })()}
                          </span>
                          {user && (
                            <button
                              onClick={() => {
                                if (replyingTo?.id === reply.id) {
                                  setReplyingTo(null);
                                  setReplyText('');
                                } else {
                                  setReplyingTo({
                                    id: reply.id,
                                    username: reply.userDisplayName || reply.userEmail
                                  });
                                  setReplyText(`@${reply.userDisplayName || reply.userEmail} `);
                                }
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {replyingTo?.id === reply.id ? 'Cancel' : 'Reply'}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{reply.text}</p>
                      
                      {/* Inline nested reply form */}
                      {user && replyingTo?.id === reply.id && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-300">
                          <h5 className="text-xs font-medium text-gray-700 mb-2">
                            Replying to {replyingTo?.username}
                          </h5>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to ${replyingTo?.username}...`}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={handleReplySubmit}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
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
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No replies yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
