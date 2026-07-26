// src/services/emailVerificationService.ts
import api from './api';

export const emailVerificationService = {
  // Send verification email
  async sendVerification(email: string, name?: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await api.post('/auth/verify/send', { email, name });
      return {
        success: true,
        message: res.data.message || 'Verification email sent! Please check your inbox.',
      };
    } catch (error: any) {
      console.error('Error sending verification:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send verification email',
      };
    }
  },

  // Verify email with token
  async verify(token: string): Promise<{ success: boolean; message: string; email?: string }> {
    try {
      const res = await api.get(`/auth/verify/${token}`);
      return {
        success: true,
        message: res.data.message || 'Email verified successfully!',
        email: res.data.email,
      };
    } catch (error: any) {
      console.error('Error verifying email:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid or expired verification token',
      };
    }
  },

  // Resend verification email
  async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await api.post('/auth/verify/resend', { email });
      return {
        success: true,
        message: res.data.message || 'Verification email resent! Please check your inbox.',
      };
    } catch (error: any) {
      console.error('Error resending verification:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend verification email',
      };
    }
  },

  // Check if email is verified (calls API)
  async isVerified(email: string): Promise<boolean> {
    try {
      const res = await api.get(`/auth/verify/status/${email}`);
      return res.data.verified || false;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  },

  // Clean expired tokens (admin only)
  async cleanExpired(): Promise<{ success: boolean; deletedCount?: number }> {
    try {
      const res = await api.delete('/auth/verify/clean');
      return {
        success: true,
        deletedCount: res.data.deletedCount || 0,
      };
    } catch (error) {
      console.error('Error cleaning tokens:', error);
      return { success: false };
    }
  },
};

export default emailVerificationService;