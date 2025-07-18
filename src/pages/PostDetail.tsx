import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOffers } from '../contexts/FirebaseOffersContext';
import { useAuth } from '../contexts/FirebaseAuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { offers, loading, toggleAttendance, addReply, getReplies } = useOffers();
  const { user } = useAuth();
  
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);

  // Find the specific post
  const post = offers.find(offer => offer.id === postId);

  // Load replies for this post
  useEffect(() => {
    const loadReplies = async () => {
      if (postId) {
        try {
          const postReplies = await getReplies(postId);
          setReplies(postReplies);
        } catch (error) {
          console.error('Error loading replies:', error);
        }
      }
    };

    loadReplies();
  }, [postId, getReplies]);

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
      await addReply(postId!, replyText);
      console.log('Reply submitted successfully');
      
      // Reset form and reload replies
      setReplyText('');
      setShowReplyForm(false);
      
      // Reload replies
      const updatedReplies = await getReplies(postId!);
      setReplies(updatedReplies);
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Error submitting reply. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!post) {
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
                  <span className="text-red-600 font-bold">[I NEED]</span>
                ) : (
                  <span className="text-blue-600 font-bold">[I OFFER]</span>
                )} {post.title}
              </h2>
              
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">
                  Posted by: {post.userDisplayName || post.userEmail || 'Anonymous'}
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
                      <span className="font-medium">Date & Time:</span>
                      <br />
                      <span>{new Date(post.dateTime).toLocaleDateString()}</span>
                      <br />
                      <span>{new Date(post.dateTime).toLocaleTimeString()}</span>
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
                  setShowReplyForm(!showReplyForm);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply
              </button>
            </div>

            {/* Reply Form */}
            {showReplyForm && user && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">Add a Reply</h4>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleReplySubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Reply
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyText('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Replies Section */}
            {replies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Replies ({replies.length})
                </h3>
                <div className="space-y-4">
                  {replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium text-gray-800">
                          {reply.userDisplayName || reply.userEmail}
                        </span>
                        <span className="text-sm text-gray-500">
                          {reply.createdAt && new Date(reply.createdAt.toDate()).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
