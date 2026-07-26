// src/services/reviewService.ts

import api from './api';

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  userName?: string;
  userEmail?: string;
  verifiedPurchase?: boolean;
  helpful?: number;
  images?: string[];
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export const reviewService = {
  // ✅ Get reviews for a product
  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const res = await api.get(`/reviews/product/${productId}`);
      const data = res.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  },

  // ✅ Get all reviews (admin)
  async getAllReviews(params?: { status?: string; limit?: number; offset?: number }): Promise<Review[]> {
    try {
      const res = await api.get('/reviews', { params });
      const data = res.data?.data;
      
      // ✅ Format data to match frontend Review type
      if (Array.isArray(data)) {
        return data.map((r: any) => ({
          id: r.id,
          userId: r.userId,
          productId: r.productId,
          rating: r.rating,
          title: r.title || '',
          comment: r.comment || '',
          status: r.status || 'pending',
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          userName: r.user?.firstName ? `${r.user.firstName} ${r.user.lastName || ''}`.trim() : 'Anonymous',
          userEmail: r.user?.email || '',
          verifiedPurchase: false,
          helpful: 0,
          images: [],
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      return [];
    }
  },

  // ✅ Get reviews by user
  async getReviewsByUser(userId: string): Promise<Review[]> {
    try {
      const res = await api.get(`/reviews/user/${userId}`);
      const data = res.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }
  },

  // ✅ Get a single review
  async getReviewById(id: string): Promise<Review | null> {
    try {
      const res = await api.get(`/reviews/${id}`);
      return res.data?.data || null;
    } catch (error) {
      console.error('Error fetching review:', error);
      return null;
    }
  },

  // ✅ Add a review
  async addReview(data: {
    productId: string;
    rating: number;
    title: string;
    comment: string;
  }): Promise<Review> {
    try {
      const res = await api.post('/reviews', data);
      return res.data.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  // ✅ Update a review
  async updateReview(id: string, data: Partial<Review>): Promise<Review> {
    try {
      const res = await api.put(`/reviews/${id}`, data);
      return res.data.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // ✅ Delete a review
  async deleteReview(id: string): Promise<boolean> {
    try {
      await api.delete(`/reviews/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  },

  // ✅ Moderate a review (admin)
  async moderateReview(id: string, status: 'approved' | 'rejected'): Promise<Review> {
    try {
      const res = await api.put(`/reviews/${id}/moderate`, { status });
      return res.data.data;
    } catch (error) {
      console.error('Error moderating review:', error);
      throw error;
    }
  },

  // ✅ Get review statistics (admin) - FIXED: This is the function that was missing
  async getAdminStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    averageRating: number;
    distribution?: Record<number, number>;
  }> {
    try {
      const res = await api.get('/reviews/stats');
      return res.data?.data || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        averageRating: 0,
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // ✅ Return default stats on error
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        averageRating: 0,
      };
    }
  },

  // ✅ Calculate stats from reviews (frontend helper)
  calculateStatsFromReviews(reviews: Review[]): ReviewStats {
    const total = reviews.length;
    if (total === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    reviews.forEach((review: Review) => {
      const rating = Math.min(Math.max(Math.round(review.rating), 1), 5);
      distribution[rating] = (distribution[rating] || 0) + 1;
      sum += review.rating;
    });

    return {
      average: parseFloat((sum / total).toFixed(1)),
      total,
      distribution: distribution as ReviewStats['distribution']
    };
  }
};

export default reviewService;