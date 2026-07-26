import api from './api';

export interface EmailData {
  to: string;
  subject: string;
  template: 'order_confirmation' | 'shipping_update' | 'password_reset' | 'welcome' | 'abandoned_cart';
  data: any;
}

export const emailService = {
  // Send email via backend
  send: async (emailData: EmailData): Promise<boolean> => {
    try {
      const res = await api.post('/emails/send', emailData);
      return res.data.success;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  },

  // Get sent emails (admin panel) - ✅ Fixed: uses '/emails' not '/emails/sent'
  getSentEmails: async (limit: number = 50, offset: number = 0): Promise<any[]> => {
    try {
      const res = await api.get('/emails', { params: { limit, offset } });
      return res.data.data;
    } catch (error) {
      console.error('Failed to fetch sent emails:', error);
      return [];
    }
  },

  // Preview email template
  preview: async (template: string, data: any): Promise<{ subject: string; html: string } | null> => {
    try {
      const res = await api.post('/emails/preview', { template, data });
      return res.data.data;
    } catch (error) {
      console.error('Failed to preview email:', error);
      return null;
    }
  },

  // Resend email
  resend: async (emailId: string): Promise<boolean> => {
    try {
      const res = await api.post(`/emails/${emailId}/resend`);
      return res.data.success;
    } catch (error) {
      console.error('Failed to resend email:', error);
      return false;
    }
  },

  // Get email templates (static)
  getTemplates: () => {
    return {
      order_confirmation: {
        subject: 'Order Confirmation - #{orderId}',
        html: (data: any) => `<!-- HTML here -->`,
      },
      shipping_update: {
        subject: 'Shipping Update - Order #{orderId}',
        html: (data: any) => `<!-- HTML here -->`,
      },
      password_reset: {
        subject: 'Password Reset Request',
        html: (data: any) => `<!-- HTML here -->`,
      },
      welcome: {
        subject: 'Welcome to ShopHub!',
        html: (data: any) => `<!-- HTML here -->`,
      },
      abandoned_cart: {
        subject: "Don't Forget Your Items!",
        html: (data: any) => `<!-- HTML here -->`,
      },
    };
  },

  // Send order confirmation
  sendOrderConfirmation: async (orderId: string, email: string, orderData: any) => {
    const templates = emailService.getTemplates();
    const template = templates.order_confirmation;
    return emailService.send({
      to: email,
      subject: template.subject.replace('#{orderId}', orderId),
      template: 'order_confirmation',
      data: { orderId, ...orderData },
    });
  },

  // Send shipping update
  sendShippingUpdate: async (orderId: string, email: string, data: any) => {
    const templates = emailService.getTemplates();
    const template = templates.shipping_update;
    return emailService.send({
      to: email,
      subject: template.subject.replace('#{orderId}', orderId),
      template: 'shipping_update',
      data: { orderId, ...data },
    });
  },

  // Send password reset
  sendPasswordReset: async (email: string, name: string, resetLink: string) => {
    const templates = emailService.getTemplates();
    const template = templates.password_reset;
    return emailService.send({
      to: email,
      subject: template.subject,
      template: 'password_reset',
      data: { name, resetLink },
    });
  },

  // Send welcome email
  sendWelcome: async (email: string, name: string) => {
    const templates = emailService.getTemplates();
    const template = templates.welcome;
    return emailService.send({
      to: email,
      subject: template.subject,
      template: 'welcome',
      data: { name },
    });
  },

  // Send abandoned cart reminder
  sendAbandonedCart: async (email: string, items: any[]) => {
    const templates = emailService.getTemplates();
    const template = templates.abandoned_cart;
    return emailService.send({
      to: email,
      subject: template.subject,
      template: 'abandoned_cart',
      data: { items },
    });
  },
};

export default emailService;