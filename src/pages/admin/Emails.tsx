import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, Eye, Trash2, RefreshCw,
  CheckCircle, XCircle, Clock, Users,
  ShoppingBag, CreditCard, Truck, Package,
  X, Copy, Check
} from 'lucide-react';
import { emailService } from '../../services/emailService';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

const AdminEmails: React.FC = () => {
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('order_confirmation');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [previewEmail, setPreviewEmail] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // ✅ Fixed: Use correct endpoint '/emails' not '/emails/sent'
      const emails = await emailService.getSentEmails();
      setSentEmails(emails);
      
      // ✅ Fixed: Properly await and handle orders as array
      const allOrders = await orderService.getAll();
      setOrders(Array.isArray(allOrders) ? allOrders.slice(0, 5) : []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setSending(true);
    try {
      let success = false;
      let emailData = null;
      
      const previewData = generatePreviewData(selectedTemplate);
      
      switch (selectedTemplate) {
        case 'order_confirmation':
          if (orders.length === 0) {
            toast.error('No orders found to send confirmation for');
            return;
          }
          const order = orders[0];
          emailData = {
            orderId: order.id,
            date: order.createdAt,
            total: order.total,
            paymentMethod: order.paymentMethod,
            items: order.items,
          };
          success = await emailService.sendOrderConfirmation(
            order.id,
            testEmail,
            emailData
          );
          break;
        case 'shipping_update':
          if (orders.length === 0) {
            toast.error('No orders found');
            return;
          }
          const shipOrder = orders[0];
          emailData = {
            orderId: shipOrder.id,
            status: 'shipped',
            trackingNumber: 'TRK' + Date.now().toString().slice(-8),
            estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          };
          success = await emailService.sendShippingUpdate(
            shipOrder.id,
            testEmail,
            emailData
          );
          break;
        case 'password_reset':
          emailData = {
            name: 'Test User',
            resetLink: `${window.location.origin}/reset-password?token=test123`,
          };
          success = await emailService.sendPasswordReset(testEmail, 'Test User', emailData.resetLink);
          break;
        case 'welcome':
          success = await emailService.sendWelcome(testEmail, 'Test User');
          break;
        case 'abandoned_cart':
          const sampleItems = [
            { name: 'Sample Product 1', price: 29.99, quantity: 2, image: 'https://via.placeholder.com/50' },
            { name: 'Sample Product 2', price: 49.99, quantity: 1, image: 'https://via.placeholder.com/50' },
          ];
          success = await emailService.sendAbandonedCart(testEmail, sampleItems);
          break;
        default:
          toast.error('Unknown template');
          return;
      }

      if (success) {
        toast.success(`Test email sent to ${testEmail}`);
        await loadData();
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const generatePreviewData = (template: string) => {
    const order = orders[0] || {
      id: 'ORD-123456',
      createdAt: new Date(),
      total: 99.99,
      paymentMethod: 'card',
      items: [
        { name: 'Sample Product', price: 49.99, quantity: 2 },
        { name: 'Another Product', price: 29.99, quantity: 1 },
      ],
    };
    
    const baseData = {
      orderId: order.id,
      date: order.createdAt,
      total: order.total,
      paymentMethod: order.paymentMethod,
      items: order.items || [{ name: 'Sample Product', price: 49.99, quantity: 2 }],
      name: 'John Doe',
      resetLink: `${window.location.origin}/reset-password?token=preview123`,
      status: 'shipped',
      trackingNumber: 'TRK-PREVIEW-123',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };
    
    return baseData;
  };

  const handlePreview = async (email: any) => {
    try {
      const previewData = generatePreviewData(email.template);
      const result = await emailService.preview(email.template, previewData);
      if (result) {
        setPreviewEmail({
          ...email,
          html: result.html,
          subject: result.subject,
          previewData: previewData,
        });
        setShowPreviewModal(true);
      } else {
        toast.error('Failed to preview email');
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to preview email');
    }
  };

  const getTemplateName = (template: string) => {
    const names: Record<string, string> = {
      order_confirmation: 'Order Confirmation',
      shipping_update: 'Shipping Update',
      password_reset: 'Password Reset',
      welcome: 'Welcome Email',
      abandoned_cart: 'Abandoned Cart',
    };
    return names[template] || template;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      sent: { color: 'text-green-600 bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
      failed: { color: 'text-red-600 bg-red-100 dark:bg-red-900/30', icon: XCircle },
      pending: { color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', icon: Clock },
    };
    const { color, icon: Icon } = config[status] || config.pending;
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const templates = [
    { id: 'order_confirmation', label: 'Order Confirmation', icon: ShoppingBag, description: 'Send after order placement' },
    { id: 'shipping_update', label: 'Shipping Update', icon: Truck, description: 'Update customers on shipping' },
    { id: 'password_reset', label: 'Password Reset', icon: CreditCard, description: 'Reset user passwords' },
    { id: 'welcome', label: 'Welcome Email', icon: Users, description: 'New user welcome' },
    { id: 'abandoned_cart', label: 'Abandoned Cart', icon: Package, description: 'Recover abandoned carts' },
  ];

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage and send customer emails ({sentEmails.length} sent)
            </p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Send Test Email */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-pink-500" />
            Send Test Email
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {templates.find(t => t.id === selectedTemplate)?.description}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            
            <div className="flex items-end gap-2">
              <button
                onClick={handleSendTestEmail}
                disabled={sending}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Test Email
                  </>
                )}
              </button>
              <button
                onClick={async () => {
                  const previewData = generatePreviewData(selectedTemplate);
                  const result = await emailService.preview(selectedTemplate, previewData);
                  if (result) {
                    setPreviewEmail({
                      template: selectedTemplate,
                      html: result.html,
                      subject: result.subject,
                      previewData: previewData,
                    });
                    setShowPreviewModal(true);
                  }
                }}
                className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-white"
                title="Preview template"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Template Previews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border ${
                  selectedTemplate === template.id 
                    ? 'border-pink-500 ring-2 ring-pink-500/20' 
                    : 'border-gray-200 dark:border-gray-800'
                } cursor-pointer hover:shadow-md transition`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-2 rounded-lg ${
                    selectedTemplate === template.id 
                      ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mt-2">{template.label}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{template.description}</p>
                  {selectedTemplate === template.id && (
                    <span className="mt-2 text-xs text-pink-600 dark:text-pink-400">Selected</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sent Emails History */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-500" />
              Sent Email History
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Recently sent emails</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Template</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recipient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sent At</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sentEmails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <Mail className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-medium">No emails sent yet</p>
                      <p className="text-sm">Send a test email to get started</p>
                    </td>
                  </tr>
                ) : (
                  sentEmails.slice().reverse().map((email, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {getTemplateName(email.template)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{email.to}</span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(email.status || 'sent')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(email.sentAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handlePreview(email)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await emailService.resend(email.id);
                                toast.success('Email resent successfully!');
                                await loadData();
                              } catch (error) {
                                toast.error('Failed to resend email');
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-green-600 transition rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Resend"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      {showPreviewModal && previewEmail && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Email Preview</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getTemplateName(previewEmail.template)} - {previewEmail.subject}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(previewEmail.html)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Copy HTML"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewEmail(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
              <div className="max-w-2xl mx-auto">
                <div 
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6"
                  dangerouslySetInnerHTML={{ __html: previewEmail.html }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewEmail(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setTestEmail(previewEmail.to || '');
                  handleSendTestEmail();
                }}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send This Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmails;