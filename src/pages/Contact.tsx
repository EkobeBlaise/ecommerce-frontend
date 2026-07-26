import React, { useState, useEffect } from 'react';
import SEO from '../components/common/SEO';
import { useSettings } from '../context/SettingsContext';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const Contact: React.FC = () => {
  const { settings } = useSettings();
  const { user, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  // Pre-fill with user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || '',
        email: user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // ✅ Fixed: use '/contact' (api base URL already includes '/api')
      const response = await api.post('/contact', formData);
      if (response.data.success) {
        toast.success('Message sent! We\'ll get back to you soon.');
        setFormData(prev => ({ ...prev, subject: '', message: '' }));
        // Keep name and email if logged in, otherwise clear them
        if (!isAuthenticated) {
          setFormData(prev => ({ ...prev, name: '', email: '' }));
        }
      } else {
        toast.error(response.data.message || 'Failed to send message.');
      }
    } catch (error: any) {
      console.error('Contact error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { 
      icon: Mail, 
      label: 'Email', 
      value: settings?.general?.storeEmail || 'support@luxewardrobe.com',
      link: `mailto:${settings?.general?.storeEmail || 'support@luxewardrobe.com'}`
    },
    { 
      icon: Phone, 
      label: 'Phone', 
      value: settings?.general?.storePhone || '+1 (555) 123-4567',
      link: `tel:${settings?.general?.storePhone || '+15551234567'}`
    },
    { 
      icon: MapPin, 
      label: 'Address', 
      value: settings?.general?.storeAddress || '123 Commerce St, New York, NY 10001',
      link: null
    },
    { 
      icon: Clock, 
      label: 'Hours', 
      value: 'Mon-Fri: 9:00 - 18:00, Sat: 10:00 - 16:00',
      link: null
    },
  ];

  return (
    <>
      <SEO
        title="Contact Us - LuxeWardrobe"
        description="Get in touch with LuxeWardrobe. We're here to help with your questions and concerns."
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Contact Us</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Have a question or need help? We'd love to hear from you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="md:col-span-1 space-y-4">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <info.icon className="w-6 h-6 text-pink-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{info.label}</h3>
                  {info.link ? (
                    <a href={info.link} className="text-gray-600 dark:text-gray-400 hover:text-pink-600 transition">
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">{info.value}</p>
                  )}
                </div>
              ))}
            </div>
            
            {/* Contact Form */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Your Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-pink-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email Address *</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-pink-500 outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-pink-500 outline-none"
                  >
                    <option value="">Select a subject</option>
                    <option value="order">Order Inquiry</option>
                    <option value="returns">Returns & Refunds</option>
                    <option value="support">General Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Message *</label>
                  <textarea 
                    rows={5} 
                    required 
                    value={formData.message} 
                    onChange={(e) => setFormData({...formData, message: e.target.value})} 
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> 
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;