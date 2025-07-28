import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useOffers } from '../contexts/FirebaseOffersContext';

const RatingPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const { offers, addRating } = useOffers();
  
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [isUpdatingRating, setIsUpdatingRating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (postId && offers.length > 0) {
      const foundPost = offers.find((offer: any) => offer.id === postId);
      if (foundPost) {
        setPost(foundPost);
        
        // Check if user has already rated this post
        if (foundPost.ratings) {
          const existingRating = foundPost.ratings.find((r: any) => r.userId === user.uid);
          if (existingRating) {
            setSelectedRating(existingRating.rating);
            setRatingComment(existingRating.comment || '');
            setIsUpdatingRating(true);
          }
        }
      } else if (offers.length > 0) {
        // Only redirect if offers are loaded and post is still not found
        console.log('Post not found, redirecting to home');
        navigate('/');
      }
      // If offers.length is 0, don't redirect yet - data might still be loading
    }
  }, [postId, offers, user, navigate]);

  const handleSubmitRating = async () => {
    if (!post || selectedRating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!user) {
      alert('Please sign in to rate posts');
      return;
    }

    setIsSubmitting(true);

    try {
      // Make sure to pass the comment along with the rating
      await addRating(post.id, selectedRating, ratingComment);
      console.log(`Rating ${selectedRating} submitted for post ${post.id}${ratingComment ? ' with comment: "' + ratingComment + '"' : ' (no comment)'}`);
      
      const feedbackMessage = ratingComment.trim() 
        ? `Thank you for ${isUpdatingRating ? 'updating your rating for' : 'rating'} "${post.title}" with ${selectedRating} stars and your feedback! Your comment will appear below.`
        : `Thank you for ${isUpdatingRating ? 'updating your rating for' : 'rating'} "${post.title}" with ${selectedRating} stars!`;
      
      setSuccessMessage(feedbackMessage);
      setShowSuccessModal(true);
      
      // Don't redirect or reload - stay on the rating page
      // The offers context should automatically update and the page will re-render
      setIsUpdatingRating(true); // Now this is an update for future changes
    } catch (error) {
      console.error('Error submitting rating:', error);
      // Show the actual error message for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error submitting rating: ${errorMessage}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to rate posts.</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h2>
          <p className="text-gray-600">Loading post information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={handleCancel}
              className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                {isUpdatingRating ? 'Update Your Rating' : 'Rate This Post'}
              </h1>
              <p className="text-gray-600 mt-1">Share your experience with this post</p>
            </div>
          </div>
        </div>

        {/* Post Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Post Details</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">
              {post.type === 'need' ? (
                <span className="text-green-600 font-bold">[I NEED]</span>
              ) : (
                <span className="text-blue-600 font-bold">[I OFFER]</span>
              )} {post.title}
            </h3>
            <p className="text-gray-600 text-sm mb-2">{post.description}</p>
            <div className="flex items-center text-xs text-gray-500">
              <span>Posted by: {post.userDisplayName || post.userId}</span>
              {post.averageRating && (
                <span className="ml-4 flex items-center gap-1">
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {post.averageRating.toFixed(1)} ({post.ratingCount} {post.ratingCount === 1 ? 'rating' : 'ratings'})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Rating</h2>
          
          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you rate this post? *
            </label>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className={`w-16 h-16 cursor-pointer transition-colors ${
                    selectedRating >= star
                      ? 'text-yellow-400 hover:text-yellow-500' 
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                  title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                  <svg 
                    className="w-full h-full" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            
            {selectedRating > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Selected: {selectedRating} star{selectedRating !== 1 ? 's' : ''}
                </p>
                <div className="flex justify-center items-center gap-1">
                  {Array.from({ length: selectedRating }, (_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comment Section */}
          <div className="mb-6">
            <label htmlFor="rating-comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback (Optional)
            </label>
            <textarea
              id="rating-comment"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Share your thoughts about this post... What did you like? How was your experience?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {ratingComment.trim() ? 'Your feedback will be saved and displayed for others to see' : 'Help others by sharing your experience'}
              </p>
              <p className="text-xs text-gray-400">{ratingComment.length}/500</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitRating}
              disabled={selectedRating === 0 || isSubmitting}
              className={`px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                selectedRating > 0 && !isSubmitting
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {isUpdatingRating ? (
                    ratingComment.trim() ? 'Update Rating & Feedback' : 'Update Rating'
                  ) : (
                    ratingComment.trim() ? 'Submit Rating & Feedback' : 'Submit Rating'
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Average Rating Section */}
        {post.ratings && post.ratings.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Average Rating</h2>
            
            {/* Average Rating Display */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-800">
                  {post.averageRating ? post.averageRating.toFixed(1) : '0.0'}
                </span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-6 h-6 ${
                        post.averageRating && post.averageRating >= star 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600">
                Based on {post.ratings.length} {post.ratings.length === 1 ? 'rating' : 'ratings'}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((starCount) => {
                const ratingsWithThisCount = post.ratings.filter((rating: any) => rating.rating === starCount).length;
                const percentage = post.ratings.length > 0 ? (ratingsWithThisCount / post.ratings.length) * 100 : 0;
                
                return (
                  <div key={starCount} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium text-gray-700">{starCount}</span>
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="text-sm text-gray-600 w-12 text-right">
                      {ratingsWithThisCount}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {post.ratings.filter((r: any) => r.rating >= 4).length}
                  </p>
                  <p className="text-sm text-gray-600">Positive ratings (4-5 ⭐)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {post.ratings.filter((r: any) => r.rating <= 2).length}
                  </p>
                  <p className="text-sm text-gray-600">Negative ratings (1-2 ⭐)</p>
                </div>
              </div>
            </div>

            {/* User Comments Section */}
            {post.ratings.some((rating: any) => rating.comment && rating.comment.trim() !== '') && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">User Feedback</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {post.ratings
                    .filter((rating: any) => rating.comment && rating.comment.trim() !== '')
                    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                    .map((rating: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: rating.rating }, (_, i) => (
                                <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              {Array.from({ length: 5 - rating.rating }, (_, i) => (
                                <svg key={i} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 text-sm leading-relaxed mb-2">{rating.comment}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>
                                {rating.userDisplayName || rating.userId}
                                {rating.userId === user?.uid && (
                                  <span className="ml-1 text-blue-600 font-medium">(You)</span>
                                )}
                              </span>
                              {rating.createdAt && (
                                <span>
                                  {new Date(rating.createdAt.seconds ? rating.createdAt.seconds * 1000 : rating.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              {/* Success Icon */}
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
                {isUpdatingRating ? 'Rating Updated!' : 'Rating Submitted!'}
              </h3>
              
              {/* Message */}
              <p className="text-gray-600 text-center text-sm leading-relaxed mb-6">
                {successMessage}
              </p>
              
              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Great!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingPage;
