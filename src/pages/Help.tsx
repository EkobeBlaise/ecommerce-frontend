import React, { useState } from 'react';
import SEO from '../components/common/SEO';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, ChevronUp, Search, 
  ShoppingBag, Truck, CreditCard, RefreshCw,
  Shield, User, Package, MessageCircle,
  Mail, Phone, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Simply browse our products, select the items you want, and click "Add to Cart". When you\'re ready, proceed to checkout and follow the steps to complete your purchase.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and Klarna. All payments are processed securely.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-5 business days. Express shipping (1-2 business days) is available for an additional fee. International shipping times vary by location.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy. Items must be unused and in their original packaging. Please visit our Returns page for detailed instructions.'
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order in your account dashboard under "My Orders".'
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard SSL encryption and secure payment gateways. Your payment information is never stored on our servers.'
    },
    {
      question: 'Can I change or cancel my order?',
      answer: 'You can cancel or modify your order within 1 hour of placing it. Contact our support team immediately for assistance.'
    },
    {
      question: 'Do you offer gift cards?',
      answer: 'Yes, we offer digital gift cards in various amounts. They are delivered via email and can be redeemed during checkout.'
    },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const helpTopics = [
    { icon: ShoppingBag, title: 'Orders & Tracking', description: 'Order status, tracking, and modifications', link: '/track-order' },
    { icon: Truck, title: 'Shipping & Delivery', description: 'Shipping options, costs, and timelines', link: '/shipping' },
    { icon: RefreshCw, title: 'Returns & Refunds', description: 'Return policy and refund process', link: '/returns' },
    { icon: CreditCard, title: 'Payments & Billing', description: 'Payment methods and billing inquiries', link: '/payment-methods' },
    { icon: Shield, title: 'Security & Privacy', description: 'How we protect your information', link: '/privacy' },
    { icon: User, title: 'Account Management', description: 'Manage your account settings', link: '/profile' },
  ];

  return (
    <>
      <SEO
        title="Help Center - Luxe Wardrobe"
        description="Find answers to frequently asked questions and get support from ShopHub."
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Help Center</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Find answers to frequently asked questions and get the support you need.
          </p>

          {/* Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-8 border border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
          </div>

          {/* Quick Topics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {helpTopics.map((topic, index) => (
              <Link
                key={index}
                to={topic.link}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition flex items-center gap-4"
              >
                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                  <topic.icon className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{topic.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{topic.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* FAQs */}
          <h2 className="text-xl font-bold mb-4 dark:text-white">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No results found. Try a different search term.</p>
            ) : (
              filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <span className="font-medium text-gray-900 dark:text-white text-left">
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Contact Support */}
          <div className="mt-8 bg-pink-50 dark:bg-pink-950/20 rounded-xl p-6 border border-pink-200 dark:border-pink-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Still need help?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Our support team is here to assist you. Contact us through any of the following channels:
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Us
              </Link>
              <a
                href="mailto:support@luxewardrobe.com"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-white font-medium"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </a>
              <a
                href="tel:+15551234567"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-white font-medium"
              >
                <Phone className="w-4 h-4" />
                Call Support
              </a>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              📞 Support available Mon-Fri: 9:00 - 18:00 (EST)
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Help;