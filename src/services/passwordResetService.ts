import api from './api';

export const passwordResetService = {
  // Request password reset
  async requestReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await api.post('/password-reset/request', { email });
      return {
        success: true,
        message: res.data.message || 'Reset link sent',
      };
    } catch (error: any) {
      console.error('Error requesting reset:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email',
      };
    }
  },

  // Validate reset token
  async validateToken(token: string): Promise<{ valid: boolean; email?: string; message?: string }> {
    try {
      const res = await api.get(`/password-reset/validate/${token}`);
      if (res.data.success) {
        return { valid: true, email: res.data.data.email };
      }
      return { valid: false, message: res.data.message || 'Invalid token' };
    } catch (error: any) {
      console.error('Error validating token:', error);
      return {
        valid: false,
        message: error.response?.data?.message || 'Invalid or expired token',
      };
    }
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await api.post('/password-reset/reset', { token, newPassword });
      return {
        success: true,
        message: res.data.message || 'Password reset successfully',
      };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password',
      };
    }
  },

  // Clean expired tokens (admin only)
  async cleanExpiredTokens(): Promise<{ success: boolean; deletedCount?: number }> {
    try {
      const res = await api.delete('/password-reset/clean');
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

export default passwordResetService;