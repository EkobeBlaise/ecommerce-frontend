import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { FloatingActionButton } from './components/common/FloatingActionButton';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import { SettingsProvider } from './context/SettingsContext';
import ThemeProvider from './components/common/ThemeProvider';
import { saveCategoriesToLocalStorage } from './services/categoryService';
import { setGlobalCategories } from './services/productService';
import { categoryManagementNewService } from './services/categoryManagementNewService';
import ErrorBoundary from './components/common/ErrorBoundary';
import Breadcrumbs from './components/common/Breadcrumbs';
import Home from './pages/Home';
import WomensFashion from './pages/WomensFashion';
import MensFashion from './pages/MensFashion';
import KidsFashion from './pages/KidsFashion';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import AddressBookPage from './pages/AddressBookPage';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Wishlist from './pages/Wishlist';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import OrderTracking from './pages/OrderTracking';
import CategoryPage from './pages/CategoryPage';
import NotFound from './pages/NotFound';
import { ProductCompare } from './components/product/ProductCompare';

// New pages
import Help from './pages/Help';
import About from './pages/About';
import Contact from './pages/Contact';
import Returns from './pages/Returns';
import Shipping from './pages/Shipping';
import Legal from './pages/Legal';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import Accessibility from './pages/Accessibility';

// Admin imports
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import AdminOrders from './pages/admin/Orders';
import OrderAnalytics from './pages/admin/OrderAnalytics';
import AdminEmails from './pages/admin/Emails';
import AdminCustomers from './pages/admin/Customers';
import AdminCoupons from './pages/admin/Coupons';
import AdminBrands from './pages/admin/Brands';
import AdminMerchandising from './pages/admin/Merchandising';
import SEOSettings from './pages/admin/SEOSettings';
import AdminSettings from './pages/admin/Settings';
import AdminCategories from './pages/admin/Categories';
import ReviewModeration from './pages/admin/ReviewModeration';
import AdminFlashSales from './pages/admin/FlashSales';
import WomensFashionAdmin from './pages/admin/womens-fashion/Dashboard';
import ProductManager from './pages/admin/ProductManager';

function App() {
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await categoryManagementNewService.getCategories();
        setGlobalCategories(categories);
        console.log('✅ Categories loaded and set globally');
        await saveCategoriesToLocalStorage();
      } catch (error) {
        console.error('❌ Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const handleOpenCompare = () => setShowCompare(true);
    window.addEventListener('openCompare', handleOpenCompare);
    return () => window.removeEventListener('openCompare', handleOpenCompare);
  }, []);

  return (
    <SettingsProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
            <Navbar />
            <Breadcrumbs />
            <ErrorBoundary>
              <main className="flex-grow">
                <Routes>
                  {/* MAIN ROUTES */}
                  <Route path="/" element={<Home />} />
                  <Route path="/women" element={<WomensFashion />} />
                  <Route path="/men" element={<MensFashion />} />
                  <Route path="/kids" element={<KidsFashion />} />

                  {/* PRODUCT ROUTES */}
                  <Route path="/products" element={<ProductListing />} />
                  <Route path="/product/:id" element={<ProductDetail />} />

                  {/* CART & CHECKOUT */}
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />

                  {/* AUTH ROUTES */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />

                  {/* SERVICE ROUTES */}
                  <Route path="/track-order" element={<OrderTracking />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/returns" element={<Returns />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/legal" element={<Legal />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/cookies" element={<Cookies />} />
                  <Route path="/accessibility" element={<Accessibility />} />

                  {/* ============================================================
                    CATEGORY ROUTES – unified, no /category/ prefix
                    Order matters: most specific first, then generic.
                  ============================================================ */}
                  {/* 3 levels: /women/clothing-women/shirts-blouses-women */}
                  <Route path="/:categorySlug/:groupSlug/:subSlug" element={<CategoryPage />} />
                  {/* 2 levels: /women/clothing-women or /kitchen-utensil/cooking-utensils */}
                  <Route path="/:categorySlug/:subcategorySlug" element={<CategoryPage />} />
                  {/* 1 level: /women or /electronics or /kitchen-utensil */}
                  <Route path="/:categorySlug" element={<CategoryPage />} />

                  {/* ============================================================
                    PROTECTED USER ROUTES
                  ============================================================ */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/addresses" element={<AddressBookPage />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/my-orders/:id" element={<OrderDetails />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                  </Route>

                  {/* ============================================================
                    ADMIN ROUTES
                  ============================================================ */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/products/new" element={<ProductForm />} />
                    <Route path="/admin/products/edit/:id" element={<ProductForm />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    <Route path="/admin/analytics" element={<OrderAnalytics />} />
                    <Route path="/admin/emails" element={<AdminEmails />} />
                    <Route path="/admin/customers" element={<AdminCustomers />} />
                    <Route path="/admin/coupons" element={<AdminCoupons />} />
                    <Route path="/admin/brands" element={<AdminBrands />} />
                    <Route path="/admin/merchandising" element={<AdminMerchandising />} />
                    <Route path="/admin/seo" element={<SEOSettings />} />
                    <Route path="/admin/categories" element={<AdminCategories />} />
                    <Route path="/admin/reviews" element={<ReviewModeration />} />
                    <Route path="/admin/flash-sales" element={<AdminFlashSales />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    <Route path="/admin/womens-fashion" element={<WomensFashionAdmin />} />
                    <Route path="/admin/product-manager" element={<ProductManager />} />
                  </Route>

                  {/* 404 – MUST BE LAST */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </ErrorBoundary>
            <Footer />
            <FloatingActionButton />
            <ProductCompare isOpen={showCompare} onClose={() => setShowCompare(false)} />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;