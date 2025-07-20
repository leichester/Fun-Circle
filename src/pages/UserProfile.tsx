import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useOffers } from '../contexts/FirebaseOffersContext';

// ReplyComponent for displaying nested replies
const ReplyComponent = ({ reply, depth = 0 }: { reply: any, depth?: number }) => {
  const maxDepth = 3;
  const actualDepth = Math.min(depth, maxDepth);
  
  return (
    <div className={`${actualDepth > 0 ? 'ml-4 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {(reply.userDisplayName || reply.userEmail || 'A')?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700">{reply.userDisplayName || reply.userEmail || 'Anonymous'}</span>
          <span className="text-xs text-gray-500">
            {reply.createdAt.toLocaleDateString()} at {reply.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{reply.text}</p>
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
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { offers, replies } = useOffers();
  
  // State for managing collapsed replies per post
  const [collapsedReplies, setCollapsedReplies] = useState<Set<string>>(new Set());
  
  // Redirect if not authenticated
  if (!user) {
    navigate('/');
    return null;
  }

  // Get user's posts
  const userPosts = offers.filter(offer => offer.userId === user.uid);
  
  // Get user's replies
  const userReplies = replies.filter(reply => reply.userId === user.uid);

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
    setCollapsedReplies(prev => {
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

  const handleGoBack = () => {
    navigate('/');
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
              <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
              <p className="text-gray-600 mt-2">Manage your account and view your activity</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Profile Container */}
        <div className="max-w-4xl mx-auto">
          {/* User Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">
                  {user.displayName || user.email}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Member since: {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {/* User's Posts */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Your Posts</h3>
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
                                  <span className="text-green-600 font-bold">[I NEED]</span>
                                ) : (
                                  <span className="text-blue-600 font-bold">[I OFFER]</span>
                                )} {post.title}
                              </h4>
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Created: {post.createdAt.toLocaleDateString()}</span>
                                <span>{post.attendeeCount || 0} attendees</span>
                                <span>{postReplies.length} replies</span>
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
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-semibold text-gray-700">Replies ({postReplies.length})</h5>
                              <button
                                onClick={() => toggleRepliesCollapse(post.id)}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                {collapsedReplies.has(post.id) ? (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    Show
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                    Hide
                                  </>
                                )}
                              </button>
                            </div>
                            {!collapsedReplies.has(post.id) && (
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
                <p className="text-gray-500 mb-4">You haven't created any posts yet</p>
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
                      <p className="text-sm text-gray-600">
                        You replied to: <span className="font-medium">{post?.title || 'Unknown post'}</span>
                      </p>
                      <p className="text-gray-500 text-xs italic">"{reply.text}"</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {reply.createdAt.toLocaleDateString()} at {reply.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
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
