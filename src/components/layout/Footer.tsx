import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, Truck, Shield, 
  Smartphone, Gift, Award, Clock, Headphones,
  ChevronRight, Zap, Apple, Sparkles, Mail, Phone, MapPin
} from 'lucide-react';
import { 
  FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube,
  FaApple, FaGooglePlay, FaCcVisa, FaCcMastercard, FaCcPaypal,
  FaCcAmex
} from 'react-icons/fa';
import { useSettings } from '../../context/SettingsContext';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { settings, formatPrice } = useSettings();

  const footerSections = [
    {
      title: "Help & Support",
      icon: <Headphones className="w-4 h-4" />,
      links: [
        { name: "Help Center", url: "/help" },
        { name: "Track Order", url: "/track-order" },
        { name: "Returns Policy", url: "/returns" },
        { name: "Shipping Info", url: "/shipping" },
        { name: "Contact Us", url: "/contact" },
        { name: "FAQ", url: "/faq" }
      ]
    },
    {
      title: "Company",
      icon: <Award className="w-4 h-4" />,
      links: [
        { name: "About Us", url: "/about" },
        { name: "Careers", url: "/careers" },
        { name: "Press", url: "/press" },
        { name: "Blog", url: "/blog" },
        { name: "Sustainability", url: "/sustainability" },
        { name: "Affiliate Program", url: "/affiliate" }
      ]
    },
    {
      title: "Payment Methods",
      icon: <CreditCard className="w-4 h-4" />,
      links: [
        { name: "Visa / Mastercard", url: "/payment" },
        { name: "PayPal", url: "/payment" },
        { name: "Apple Pay", url: "/payment" },
        { name: "Google Pay", url: "/payment" },
        { name: "Klarna", url: "/payment" },
        { name: "Afterpay", url: "/payment" }
      ]
    },
    {
      title: "Our Advantages",
      icon: <Sparkles className="w-4 h-4" />,
      links: [
        { name: `Free Shipping $${settings.shipping.freeShippingThreshold}+`, url: "/shipping" },
        { name: "30-Day Returns", url: "/returns" },
        { name: "Price Match Guarantee", url: "/price-match" },
        { name: "Gift Cards", url: "/gift-cards" },
        { name: "Loyalty Program", url: "/loyalty" },
        { name: "Student Discount", url: "/student" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Facebook", icon: <FaFacebook className="w-5 h-5" />, url: "https://facebook.com", bg: "#1877f2" },
    { name: "Instagram", icon: <FaInstagram className="w-5 h-5" />, url: "https://instagram.com", bg: "#e4405f" },
    { name: "Twitter", icon: <FaTwitter className="w-5 h-5" />, url: "https://twitter.com", bg: "#1da1f2" },
    { name: "LinkedIn", icon: <FaLinkedin className="w-5 h-5" />, url: "https://linkedin.com", bg: "#0077b5" },
    { name: "YouTube", icon: <FaYoutube className="w-5 h-5" />, url: "https://youtube.com", bg: "#ff0000" }
  ];

  const copyrightText = settings.footer?.copyrightText || `© ${currentYear} ${settings.general.storeName}. All rights reserved.`;
  const tagline = settings.footer?.tagline || 'Premium E-commerce Platform';

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {footerSections.map((section, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-blue-400">{section.icon}</div>
                <h3 className="text-lg font-semibold">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link 
                      to={link.url} 
                      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1 group"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-700 my-12 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h3>
              <p className="text-gray-400">Get exclusive offers and the latest trends straight to your inbox.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* App Download & Social Media */}
        <div className="border-t border-gray-700 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                Download Our App
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="#" className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg transition-all transform hover:scale-105">
                  <FaApple className="w-8 h-8" />
                  <div>
                    <p className="text-xs text-gray-400">Download on the</p>
                    <p className="font-semibold">App Store</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg transition-all transform hover:scale-105">
                  <FaGooglePlay className="w-8 h-8" />
                  <div>
                    <p className="text-xs text-gray-400">Get it on</p>
                    <p className="font-semibold">Google Play</p>
                  </div>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-blue-400">💫</span>
                Follow Us
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-110 hover:shadow-lg"
                    style={{ backgroundColor: social.bg }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods & Trust Badges */}
        <div className="border-t border-gray-700 mt-12 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                Secure Payments
              </h3>
              <div className="flex gap-3">
                <FaCcVisa className="w-10 h-10 text-gray-400" />
                <FaCcMastercard className="w-10 h-10 text-gray-400" />
                <FaCcPaypal className="w-10 h-10 text-gray-400" />
                <FaCcAmex className="w-10 h-10 text-gray-400" />
                <span className="text-gray-400 text-sm flex items-center">+ More</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Trust & Safety
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Free Shipping ${settings.shipping.freeShippingThreshold}+</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">24/7 Support</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Gift className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{settings.general.storeAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{settings.general.storePhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{settings.general.storeEmail}</span>
            </div>
          </div>
        </div>

        {/* Legal Links & Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm text-gray-400">
            <Link to="/legal" className="hover:text-white transition">Legal Notice</Link>
            <Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/cookies" className="hover:text-white transition">Cookie Settings</Link>
            <Link to="/accessibility" className="hover:text-white transition">Accessibility</Link>
          </div>
          
          <div className="text-center text-gray-500 text-sm">
            <p>{copyrightText}</p>
            <p className="text-xs mt-1">{tagline}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
