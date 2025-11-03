import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MessageCircle, ThumbsUp, ThumbsDown, Flag,
  User, Calendar, Edit2, Trash2, Send, AlertTriangle,
  ChevronDown, ChevronUp, Filter, X, Loader2, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Backend API removed - using Firebase Firestore for reviews if needed

const GlassCard = ({ children, className = "", ...props }) => (
  <motion.div
    className={`bg-glass-gradient backdrop-blur-glass border border-white/20 rounded-xl ${className}`}
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.3 }}
    {...props}
  >
    {children}
  </motion.div>
);

const StarRating = ({ rating, onRatingChange, readonly = false, size = "w-5 h-5" }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
        <motion.button
          key={value}
          type="button"
          disabled={readonly}
          onClick={() => handleClick(value)}
          onMouseEnter={() => !readonly && setHoveredRating(value)}
          onMouseLeave={() => !readonly && setHoveredRating(0)}
          whileHover={!readonly ? { scale: 1.1 } : {}}
          whileTap={!readonly ? { scale: 0.9 } : {}}
          className={`${size} ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <Star 
            className={`w-full h-full ${
              value <= (hoveredRating || rating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-400'
            }`} 
          />
        </motion.button>
      ))}
      <span className="ml-2 font-semibold text-white">{rating}/10</span>
    </div>
  );
};

const ReviewForm = ({ movieId, onSubmit, onCancel, editingReview = null }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5,
    spoiler_alert: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingReview) {
      setFormData({
        title: editingReview.title,
        content: editingReview.content,
        rating: editingReview.rating,
        spoiler_alert: editingReview.spoiler_alert
      });
    }
  }, [editingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setIsSubmitting(true);
    
    try {
      const reviewData = {
        ...formData,
        user_id: currentUser.uid,
        user_name: currentUser.displayName || 'Anonymous',
        user_avatar: currentUser.photoURL
      };

      await onSubmit(reviewData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <h3 className="mb-6 text-xl font-bold text-white">
        {editingReview ? 'Edit Review' : 'Write a Review'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium text-white">Review Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
            placeholder="Give your review a catchy title..."
            required
            maxLength="100"
          />
          <div className="mt-1 text-xs text-right text-gray-500">
            {formData.title.length}/100 characters
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium text-white">Your Rating</label>
          <StarRating 
            rating={formData.rating}
            onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-white">Review Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={6}
            className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg resize-none bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
            placeholder="Share your thoughts about the movie..."
            required
            maxLength="2000"
          />
          <div className="mt-1 text-xs text-right text-gray-500">
            {formData.content.length}/2000 characters
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="spoiler_alert"
            checked={formData.spoiler_alert}
            onChange={(e) => setFormData(prev => ({ ...prev, spoiler_alert: e.target.checked }))}
            className="w-4 h-4 bg-transparent border-gray-300 rounded text-cinema-blue focus:ring-cinema-blue"
          />
          <label htmlFor="spoiler_alert" className="flex items-center space-x-2 text-white">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span>This review contains spoilers</span>
          </label>
        </div>

        <div className="flex space-x-4">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
            className={`flex-1 bg-cinema-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-cinema-blue/80 transition-colors flex items-center justify-center space-x-2 ${
              isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{editingReview ? 'Update Review' : 'Publish Review'}</span>
              </>
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </GlassCard>
  );
};

const ReviewCard = ({ review, onLike, onEdit, onDelete, currentUserId, onReport }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isOwnReview = currentUserId === review.user_id;
  const hasLiked = review.liked_by?.includes(currentUserId);
  const hasDisliked = review.disliked_by?.includes(currentUserId);

  const truncatedContent = review.content.length > 300 
    ? review.content.substring(0, 300) + '...'
    : review.content;

  const helpfulPercentage = review.helpful_votes > 0 && review.total_votes > 0
    ? Math.round((review.helpful_votes / review.total_votes) * 100)
    : 0;

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cinema-blue">
            {review.user_avatar ? (
              <img 
                src={review.user_avatar} 
                alt={review.user_name}
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-white">{review.user_name}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
              {review.is_verified_review && (
                <span className="px-2 py-1 text-xs text-green-400 rounded-full bg-green-500/20">
                  Verified
                </span>
              )}
              {review.is_edited && (
                <span className="px-2 py-1 text-xs text-gray-400 rounded-full bg-gray-500/20">
                  Edited
                </span>
              )}
            </div>
          </div>
        </div>
        
        {isOwnReview && (
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => onEdit(review)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="transition-colors text-cinema-blue hover:text-cinema-blue/80"
              title="Edit review"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => onDelete(review.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-red-400 transition-colors hover:text-red-300"
              title="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <StarRating rating={review.rating} readonly />
      </div>

      <h3 className="mb-3 text-lg font-bold text-white">{review.title}</h3>

      {review.spoiler_alert && (
        <div className="p-3 mb-4 border rounded-lg bg-orange-500/20 border-orange-500/30">
          <div className="flex items-center space-x-2 text-orange-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Spoiler Alert</span>
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="leading-relaxed text-gray-300">
          {showFullContent || review.content.length <= 300 ? review.content : truncatedContent}
        </p>
        {review.content.length > 300 && (
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="mt-2 text-sm font-medium transition-colors text-cinema-blue hover:text-cinema-blue/80"
          >
            {showFullContent ? 'Show Less' : 'Read More'}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="p-4 mb-4 rounded-lg bg-white/5">
          <div className="flex justify-between mb-2 text-sm text-gray-400">
            <span>Helpfulness</span>
            <span>{helpfulPercentage}% found this helpful</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full">
            <div 
              className="h-2 rounded-full bg-cinema-blue" 
              style={{ width: `${helpfulPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={() => onLike(review.id, 'like')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-1 ${
              hasLiked ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
            } transition-colors`}
            title="Like this review"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{review.likes || 0}</span>
          </motion.button>
          
          <motion.button
            onClick={() => onLike(review.id, 'dislike')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-1 ${
              hasDisliked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
            } transition-colors`}
            title="Dislike this review"
          >
            <ThumbsDown className="w-4 h-4" />
            <span>{review.dislikes || 0}</span>
          </motion.button>

          <div 
            className="flex items-center space-x-1 text-gray-400 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
            title="Helpfulness details"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{review.helpful_votes || 0} helpful</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>

        {!isOwnReview && (
          <motion.button
            onClick={() => onReport(review.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-400 transition-colors hover:text-red-400"
            title="Report this review"
          >
            <Flag className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </GlassCard>
  );
};

const RatingDistribution = ({ distribution }) => {
  const maxCount = Math.max(...Object.values(distribution));
  
  return (
    <div className="space-y-2">
      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => (
        <div key={rating} className="flex items-center">
          <span className="w-6 mr-2 text-right text-white">{rating}</span>
          <Star className="w-4 h-4 mr-2 text-yellow-400" />
          <div className="flex-1 h-3 bg-gray-700 rounded-full">
            <div 
              className="h-3 bg-yellow-400 rounded-full" 
              style={{ 
                width: `${(distribution[rating] || 0) / maxCount * 100}%` 
              }}
            ></div>
          </div>
          <span className="w-8 ml-2 text-right text-gray-400">
            {distribution[rating] || 0}
          </span>
        </div>
      ))}
    </div>
  );
};

const RatingSummary = ({ averageRating, totalRatings, distribution }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-2 text-5xl font-bold text-white">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={Math.round(averageRating * 2) / 2} readonly size="w-6 h-6" />
          <div className="mt-2 text-gray-400">
            {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="mb-4 text-lg font-semibold text-white">Rating Distribution</h3>
          <RatingDistribution distribution={distribution} />
        </div>
      </div>
    </GlassCard>
  );
};

const FilterControls = ({ 
  sortBy, 
  setSortBy, 
  ratingFilter, 
  setRatingFilter,
  hasSpoilers, 
  setHasSpoilers,
  hasVerified, 
  setHasVerified 
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: 'created_at', label: 'Most Recent' },
    { value: 'likes', label: 'Most Liked' },
    { value: 'helpful_votes', label: 'Most Helpful' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '9-10', label: '9-10 Stars' },
    { value: '7-8', label: '7-8 Stars' },
    { value: '5-6', label: '5-6 Stars' },
    { value: '3-4', label: '3-4 Stars' },
    { value: '1-2', label: '1-2 Stars' }
  ];

  const clearFilters = () => {
    setRatingFilter('all');
    setHasSpoilers(false);
    setHasVerified(false);
  };

  const hasActiveFilters = ratingFilter !== 'all' || hasSpoilers || hasVerified;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-white border rounded-lg bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-cinema-dark">
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center px-4 py-2 space-x-2 transition-colors rounded-lg bg-white/10 hover:bg-white/20"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-cinema-blue"></span>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white">Filter Reviews</h4>
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="flex items-center space-x-1 text-sm text-cinema-blue hover:text-cinema-blue/80"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear filters</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-white">Rating</label>
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="w-full px-3 py-2 text-white border rounded-lg bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
                  >
                    {ratingOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-cinema-dark">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="hasSpoilers"
                    checked={hasSpoilers}
                    onChange={(e) => setHasSpoilers(e.target.checked)}
                    className="w-4 h-4 bg-transparent border-gray-300 rounded text-cinema-blue focus:ring-cinema-blue"
                  />
                  <label htmlFor="hasSpoilers" className="text-white">
                    Hide spoilers
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="hasVerified"
                    checked={hasVerified}
                    onChange={(e) => setHasVerified(e.target.checked)}
                    className="w-4 h-4 bg-transparent border-gray-300 rounded text-cinema-blue focus:ring-cinema-blue"
                  />
                  <label htmlFor="hasVerified" className="text-white">
                    Verified reviews only
                  </label>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MovieReviews = ({ movieId, movieTitle }) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [hasSpoilers, setHasSpoilers] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [reportingReview, setReportingReview] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    loadReviews();
    loadRatingStats();
  }, [movieId, sortBy, ratingFilter, hasSpoilers, hasVerified]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Backend API removed - reviews can be stored in Firebase Firestore if needed
      const response = { data: [] }; // await axios.get(`${BACKEND_URL}/api/movies/${movieId}/reviews`, {
        params: { 
          sort_by: sortBy,
          rating_filter: ratingFilter,
          hide_spoilers: hasSpoilers,
          verified_only: hasVerified
        }
      });
      
      setReviews(response.data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadRatingStats = async () => {
    try {
      // Backend API removed
      const response = { data: { average_rating: 0, total_ratings: 0, distribution: {} } }; // await axios.get(`${BACKEND_URL}/api/movies/${movieId}/ratings`);
      setAverageRating(response.data.average_rating);
      setTotalRatings(response.data.total_ratings);
      setRatingDistribution(response.data.distribution);
    } catch (error) {
      console.error('Error loading rating stats:', error);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      let response;
      
      if (editingReview) {
        // Backend API removed - save to Firebase Firestore if needed
        response = { data: { ...reviewData, id: editingReview.id } };
      } else {
        // Backend API removed - save to Firebase Firestore if needed
        response = { data: { ...reviewData, id: Date.now().toString() } };
      }
      
      if (editingReview) {
        setReviews(prev => prev.map(r => 
          r.id === editingReview.id ? response.data : r
        ));
      } else {
        setReviews(prev => [response.data, ...prev]);
      }
      
      await loadRatingStats();
      
      setShowReviewForm(false);
      setEditingReview(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    }
  };

  const handleLikeReview = async (reviewId, action) => {
    if (!currentUser) return;
    
    try {
      // Backend API removed - save vote to Firebase Firestore if needed
      // await axios.post(`${BACKEND_URL}/api/reviews/${reviewId}/vote`, {
        user_id: currentUser.uid,
        action: action === 'like' ? 'like' : 'dislike'
      });
      loadReviews(); 
    } catch (error) {
      console.error('Error voting on review:', error);
      setError('Failed to register your vote. Please try again.');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      // Backend API removed - delete from Firebase Firestore if needed
      // await axios.delete(`${BACKEND_URL}/api/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      await loadRatingStats(); 
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review. Please try again.');
    }
  };

  const handleReportReview = async (reviewId) => {
    if (!reportReason.trim()) return;
    
    try {
      setIsReporting(true);
      // Backend API removed - save report to Firebase Firestore if needed
      // await axios.post(`${BACKEND_URL}/api/reviews/${reviewId}/report`, {
        user_id: currentUser?.uid,
        reason: reportReason
      });
      setReportingReview(null);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting review:', error);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">Reviews & Ratings</h2>
          <div className="text-gray-400">
            For <span className="font-medium text-white">{movieTitle}</span>
          </div>
        </div>
        
        {currentUser && (
          <motion.button
            onClick={() => setShowReviewForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-6 py-3 space-x-2 font-semibold text-white transition-colors rounded-lg bg-cinema-blue hover:bg-cinema-blue/80"
          >
            <Edit2 className="w-5 h-5" />
            <span>Write Review</span>
          </motion.button>
        )}
      </div>

      <RatingSummary 
        averageRating={averageRating} 
        totalRatings={totalRatings} 
        distribution={ratingDistribution} 
      />

      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ReviewForm
              movieId={movieId}
              onSubmit={handleSubmitReview}
              onCancel={() => {
                setShowReviewForm(false);
                setEditingReview(null);
              }}
              editingReview={editingReview}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reportingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md p-6 bg-cinema-dark rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Report Review</h3>
                <button 
                  onClick={() => setReportingReview(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-white">
                    Reason for reporting
                  </label>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg resize-none bg-white/10 border-white/20 focus:border-cinema-blue focus:outline-none"
                    placeholder="Please explain why you're reporting this review..."
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => handleReportReview(reportingReview)}
                    disabled={isReporting || !reportReason.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center flex-1 px-4 py-2 space-x-2 font-medium text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReporting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ShieldAlert className="w-5 h-5" />
                        <span>Submit Report</span>
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setReportingReview(null)}
                    disabled={isReporting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 font-medium text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start p-4 space-x-3 border rounded-lg bg-red-500/20 border-red-500/30"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-white">Error</h4>
            <p className="text-sm text-red-300">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      <FilterControls
        sortBy={sortBy}
        setSortBy={setSortBy}
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
        hasSpoilers={hasSpoilers}
        setHasSpoilers={setHasSpoilers}
        hasVerified={hasVerified}
        setHasVerified={setHasVerified}
      />

      <h3 className="text-lg font-semibold text-white">
        {filteredReviews.length} Review{filteredReviews.length !== 1 ? 's' : ''}
      </h3>

      {loading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-10 h-10 text-cinema-blue" />
          </motion.div>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-6">
          {filteredReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              onLike={handleLikeReview}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              onReport={setReportingReview}
              currentUserId={currentUser?.uid}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <p className="text-lg text-gray-400">No reviews match your filters</p>
          <p className="text-gray-500">Try adjusting your filters or be the first to review!</p>
          {hasSpoilers || hasVerified || ratingFilter !== 'all' ? (
            <button
              onClick={() => {
                setRatingFilter('all');
                setHasSpoilers(false);
                setHasVerified(false);
              }}
              className="mt-4 font-medium text-cinema-blue hover:text-cinema-blue/80"
            >
              Clear all filters
            </button>
          ) : null}
        </GlassCard>
      )}
    </div>
  );
};

export default MovieReviews;