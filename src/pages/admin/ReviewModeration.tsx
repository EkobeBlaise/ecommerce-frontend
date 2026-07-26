// src/pages/admin/ReviewModeration.tsx

import React, { useState, useEffect } from 'react';
import { 
  Star, StarHalf, Search, Filter, X,
  ChevronDown, ChevronUp, RefreshCw,
  CheckCircle, XCircle, Clock, AlertCircle,
  Trash2, Eye, MessageSquare, Image as ImageIcon,
  ThumbsUp, User, Calendar, Package
} from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { Review } from '../../types/review';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

const ReviewModeration: React.FC = () => {
  const { formatPrice } = useSettings();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Review['status']>('all');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    avgRating: 0,
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      // ✅ Get all reviews
      const allReviews = await reviewService.getAllReviews();
      const reviewsArray = Array.isArray(allReviews) ? allReviews : [];
      setReviews(reviewsArray);
      setFilteredReviews(reviewsArray);
      
      // ✅ Try to get stats, fallback to calculated if not available
      try {
        const statsData = await reviewService.getAdminStats();
        setStats({
          total: statsData.total || reviewsArray.length,
          pending: statsData.pending || reviewsArray.filter(r => r.status === 'pending').length,
          approved: statsData.approved || reviewsArray.filter(r => r.status === 'approved').length,
          rejected: statsData.rejected || reviewsArray.filter(r => r.status === 'rejected').length,
          avgRating: statsData.averageRating || 0,
        });
      } catch (statsError) {
        console.warn('⚠️ Could not fetch stats, calculating from reviews:', statsError);
        // ✅ Calculate stats from reviews
        const pending = reviewsArray.filter(r => r.status === 'pending').length;
        const approved = reviewsArray.filter(r => r.status === 'approved').length;
        const rejected = reviewsArray.filter(r => r.status === 'rejected').length;
        const total = reviewsArray.length;
        
        // Calculate average rating
        let avgRating = 0;
        const approvedReviews = reviewsArray.filter(r => r.status === 'approved');
        if (approvedReviews.length > 0) {
          const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
          avgRating = sum / approvedReviews.length;
        }
        
        setStats({
          total,
          pending,
          approved,
          rejected,
          avgRating,
        });
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
      setReviews([]);
      setFilteredReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...reviews];
    if (filterStatus !== 'all') {
      result = result.filter(r => r.status === filterStatus);
    }
    if (filterRating !== 'all') {
      result = result.filter(r => r.rating === filterRating);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => 
        (r.title || '').toLowerCase().includes(term) ||
        (r.comment || '').toLowerCase().includes(term) ||
        (r.userName || '').toLowerCase().includes(term)
      );
    }
    setFilteredReviews(result);
  }, [reviews, searchTerm, filterStatus, filterRating]);

  const handleApprove = async (id: string) => {
    try {
      await reviewService.moderateReview(id, 'approved');
      toast.success('Review approved!');
      await loadReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reviewService.moderateReview(id, 'rejected');
      toast.success('Review rejected');
      await loadReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Failed to reject review');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewService.deleteReview(id);
      toast.success('Review deleted successfully');
      await loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating: number) => {
    const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= safeRating) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 <= safeRating) {
        stars.push(<StarHalf key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300 dark:text-gray-600" />);
      }
    }
    return stars;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      pending: { color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', icon: Clock },
      approved: { color: 'text-green-600 bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
      rejected: { color: 'text-red-600 bg-red-100 dark:bg-red-900/30', icon: XCircle },
    };
    const { color, icon: Icon } = config[status] || config.pending;
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review Moderation</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage customer reviews ({filteredReviews.length} reviews)
            </p>
          </div>
          <button
            onClick={loadReviews}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Rejected</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-pink-600">{stats.avgRating.toFixed(1)} ⭐</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews by title, comment, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="all">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ 5</option>
              <option value="4">⭐⭐⭐⭐ 4</option>
              <option value="3">⭐⭐⭐ 3</option>
              <option value="2">⭐⭐ 2</option>
              <option value="1">⭐ 1</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterRating('all');
              }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product/Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-medium">No reviews found</p>
                      <p className="text-sm mt-1">Reviews will appear here once customers submit them</p>
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{review.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Product ID: {review.productId}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-white">{review.userName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{review.userEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(review.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              setShowDetailsModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {review.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(review.id)}
                                className="p-1.5 text-gray-400 hover:text-green-600 transition rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(review.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer with count */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredReviews.length} of {reviews.length} reviews
            </p>
          </div>
        </div>

        {/* Review Details Modal */}
        {showDetailsModal && selectedReview && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Details</h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedReview(null);
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-700 dark:text-white" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(selectedReview.rating)}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedReview.rating}.0
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                      {selectedReview.title}
                    </h3>
                  </div>
                  {getStatusBadge(selectedReview.status)}
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <User className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedReview.userName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedReview.userEmail}</p>
                  </div>
                  <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {formatDate(selectedReview.createdAt)}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Comment</h4>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    {selectedReview.comment}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {selectedReview.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(selectedReview.id);
                          setShowDetailsModal(false);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedReview.id);
                          setShowDetailsModal(false);
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleDelete(selectedReview.id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModeration;