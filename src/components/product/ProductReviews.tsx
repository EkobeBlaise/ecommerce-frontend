// src/components/product/ProductReviews.tsx

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { reviewService, type Review, type ReviewStats } from '../../services/reviewService';
import { Star, StarHalf, User, Calendar, ThumbsUp, Flag } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadReviews();
  }, [productId]);

  // ✅ Calculate stats from reviews
  const calculateStatsFromReviews = (reviewsArray: Review[]): ReviewStats => {
    const total = reviewsArray.length;
    if (total === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    reviewsArray.forEach((review) => {
      const ratingValue = Math.min(Math.max(Math.round(review.rating), 1), 5);
      distribution[ratingValue as keyof typeof distribution]++;
      sum += review.rating;
    });

    return {
      average: parseFloat((sum / total).toFixed(1)),
      total,
      distribution
    };
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const reviewsData = await reviewService.getProductReviews(productId);
      const reviewsArray = Array.isArray(reviewsData) ? reviewsData : [];
      setReviews(reviewsArray);
      console.log(`✅ Loaded ${reviewsArray.length} reviews`);

      // ✅ Calculate stats directly from reviews
      const calculatedStats = calculateStatsFromReviews(reviewsArray);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to leave a review');
      return;
    }

    if (!title.trim() || !comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.addReview({
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });
      
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setTitle('');
      setComment('');
      setRating(5);
      await loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value: number) => {
    const stars = [];
    const fullStars = Math.floor(value);
    const hasHalfStar = value % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300 dark:text-gray-600" />);
      }
    }
    return stars;
  };

  const renderRatingInput = (hoverRating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setRating(num)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 transition ${
                num <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white">Customer Reviews</h2>
        {isAuthenticated && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
      </div>

      {/* Stats Summary */}
      {stats && stats.total > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.average.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-0.5">
                {renderStars(stats.average)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((num) => {
                const count = stats.distribution?.[num as keyof typeof stats.distribution] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={num} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-6">{num}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="font-semibold mb-3 dark:text-white">Write a Review for {productName}</h3>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rating
            </label>
            {renderRatingInput(rating)}
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your detailed experience..."
              rows={4}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* ✅ Reviews List - Fixed: Review cards rendered properly */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {review.user?.firstName || review.user?.lastName || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  {review.status === 'pending' && (
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{review.title}</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{review.comment}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <button className="flex items-center gap-1 hover:text-pink-600 transition">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful
                </button>
                <button className="flex items-center gap-1 hover:text-pink-600 transition">
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-2">📝</p>
          <p>No reviews yet for this product.</p>
          <p className="text-sm mt-1">Be the first to leave a review!</p>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;