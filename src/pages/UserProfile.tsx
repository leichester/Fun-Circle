import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useOffers } from '../contexts/FirebaseOffersContext';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { offers, getReplies } = useOffers();
  
  // Redirect if not authenticated
  if (!user) {
    navigate('/');
    return null;
  }

  // Get user's posts
  const userPosts = offers.filter(offer => offer.userId === user.uid);
  
  // Get user's replies
  const allReplies = offers.flatMap(offer => getReplies(offer.id));
  const userReplies = allReplies.filter(reply => reply.userId === user.uid);

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
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">
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
                          <span>{getReplies(post.id).length} replies</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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
                        {reply.createdAt.toLocaleDateString()} at {reply.createdAt.toLocaleTimeString()}
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
