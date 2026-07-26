import React, { createContext, useContext, useState, useEffect } from 'react';

export interface StoreSettings {
  general: {
    storeName: string;
    storeEmail: string;
    storePhone: string;
    storeAddress: string;
    storeCurrency: string;
    currencySymbol: string;
    timezone: string;
    dateFormat: string;
  };
  shipping: {
    freeShippingThreshold: number;
    standardShippingCost: number;
    expressShippingCost: number;
    estimatedDeliveryDays: number;
  };
  payments: {
    currency: string;
    taxRate: number;
    enableCOD: boolean;
    enablePaypal: boolean;
    enableStripe: boolean;
  };
  paymentMethods: {
    visa: { enabled: boolean; label: string; icon: string; fee: number };
    mastercard: { enabled: boolean; label: string; icon: string; fee: number };
    paypal: { enabled: boolean; label: string; icon: string; fee: number };
    applePay: { enabled: boolean; label: string; icon: string; fee: number };
    googlePay: { enabled: boolean; label: string; icon: string; fee: number };
    klarna: { enabled: boolean; label: string; icon: string; fee: number };
    afterpay: { enabled: boolean; label: string; icon: string; fee: number };
    cod: { enabled: boolean; label: string; icon: string; fee: number };
    bankTransfer: { enabled: boolean; label: string; icon: string; fee: number };
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    primaryColor: string;
    showHeroSlider: boolean;
    showBrandCarousel: boolean;
    productsPerPage: number;
    fontFamily?: string;
    borderRadius?: string;
    cardStyle?: string;
    buttonStyle?: string;
  };
  notifications: {
    orderConfirmation: boolean;
    orderStatusUpdate: boolean;
    newReview: boolean;
    lowStockAlert: boolean;
    lowStockThreshold: number;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireEmailVerification: boolean;
  };
  pages: {
    about: string;
    terms: string;
    privacy: string;
    returns: string;
    shipping: string;
    legal: string;
    accessibility: string;
    cookies: string;
  };
  footer: {
    copyrightText: string;
    tagline: string;
    showSocialLinks: boolean;
    showPaymentIcons: boolean;
  };
  brands: {
    id: number;
    name: string;
    logo: string;
    isActive: boolean;
    order: number;
  }[];
}

const defaultSettings: StoreSettings = {
  general: {
    storeName: 'ShopHub',
    storeEmail: 'admin@shophub.com',
    storePhone: '+1 (555) 123-4567',
    storeAddress: '123 Commerce St, New York, NY 10001',
    storeCurrency: 'USD',
    currencySymbol: '$',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY'
  },
  shipping: {
    freeShippingThreshold: 50,
    standardShippingCost: 5.99,
    expressShippingCost: 12.99,
    estimatedDeliveryDays: 5
  },
  payments: {
    currency: 'USD',
    taxRate: 10,
    enableCOD: true,
    enablePaypal: true,
    enableStripe: false
  },
  paymentMethods: {
    visa: { enabled: true, label: 'Visa / Mastercard', icon: '💳', fee: 0 },
    mastercard: { enabled: true, label: 'Mastercard', icon: '💳', fee: 0 },
    paypal: { enabled: true, label: 'PayPal', icon: '💰', fee: 0 },
    applePay: { enabled: true, label: 'Apple Pay', icon: '📱', fee: 0 },
    googlePay: { enabled: true, label: 'Google Pay', icon: '📱', fee: 0 },
    klarna: { enabled: true, label: 'Klarna', icon: '🛒', fee: 0 },
    afterpay: { enabled: true, label: 'Afterpay', icon: '🎯', fee: 0 },
    cod: { enabled: true, label: 'Cash on Delivery', icon: '💰', fee: 0 },
    bankTransfer: { enabled: false, label: 'Bank Transfer', icon: '🏦', fee: 0 }
  },
  appearance: {
    theme: 'light',
    primaryColor: '#3b82f6',
    showHeroSlider: true,
    showBrandCarousel: true,
    productsPerPage: 12,
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
    cardStyle: 'shadow-md',
    buttonStyle: 'rounded-full'
  },
  notifications: {
    orderConfirmation: true,
    orderStatusUpdate: true,
    newReview: true,
    lowStockAlert: true,
    lowStockThreshold: 10
  },
  security: {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    requireEmailVerification: false
  },
  pages: {
    about: 'ShopHub was founded with a simple mission: to make online shopping easy, secure, and enjoyable for everyone.',
    terms: 'By using our site, you agree to our terms and conditions.',
    privacy: 'We value your privacy and protect your data.',
    returns: '30-day easy returns for all products.',
    shipping: 'Free shipping on orders over $50.',
    legal: 'ShopHub is a registered trademark.',
    accessibility: 'We are committed to making our site accessible to all users.',
    cookies: 'We use cookies to enhance your browsing experience.'
  },
  footer: {
    copyrightText: '',
    tagline: 'Premium E-commerce Platform',
    showSocialLinks: true,
    showPaymentIcons: true
  },
  brands: [
    { id: 1, name: 'Nike', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png', isActive: true, order: 1 },
    { id: 2, name: 'Adidas', logo: 'https://logos-world.net/wp-content/uploads/2020/03/Adidas-Logo.png', isActive: true, order: 2 },
    { id: 3, name: 'Apple', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png', isActive: true, order: 3 },
    { id: 4, name: 'Samsung', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Samsung-Logo.png', isActive: true, order: 4 },
    { id: 5, name: 'Sony', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png', isActive: true, order: 5 },
    { id: 6, name: 'Puma', logo: 'https://logos-world.net/wp-content/uploads/2020/07/Puma-Logo.png', isActive: true, order: 6 },
  ],
};

interface SettingsContextType {
  settings: StoreSettings;
  updateSettings: (newSettings: StoreSettings) => void;
  formatPrice: (price: number | string | undefined | null) => string;
  getCurrencySymbol: () => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const stored = localStorage.getItem('store_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const merged = { ...defaultSettings, ...parsed };
        setSettings(merged);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  };

  const updateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    localStorage.setItem('store_settings', JSON.stringify(newSettings));
  };

  const getCurrencySymbol = () => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$'
    };
    return symbols[settings.general.storeCurrency] || '$';
  };

  // ✅ Safe formatPrice – handles undefined, null, and non‑numeric values
  const formatPrice = (price: number | string | undefined | null): string => {
    // If price is a string, parse it to number
    let num = typeof price === 'string' ? parseFloat(price) : price;
    // If it's not a valid number, return "$0.00" (or symbol + 0.00)
    if (num === undefined || num === null || isNaN(num)) {
      return `${getCurrencySymbol()}0.00`;
    }
    return `${getCurrencySymbol()}${num.toFixed(2)}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, formatPrice, getCurrencySymbol }}>
      {children}
    </SettingsContext.Provider>
  );
};