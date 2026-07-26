import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag, Users, Headphones } from 'lucide-react';
import { getAllProducts } from '../../services/productService';
import { useSettings } from '../../context/SettingsContext';

interface HeroSlide {
  id: string | number;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image: string;
  badge?: string;
}

export const HeroSection: React.FC = () => {
  const { settings } = useSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([
    {
      id: 1,
      title: 'Summer Sale 2024',
      subtitle: 'Discover amazing deals on your favorite products. Up to 70% off on selected items.',
      cta: 'Shop Now',
      link: '/products',
      image: 'https://images.unsplash.com/photo-1483985988355-963728e8ab6b?w=800&h=500&fit=crop',
      badge: '🔥 Hot Deals'
    },
    {
      id: 2,
      title: 'New Collection',
      subtitle: 'Explore the latest trends in fashion and lifestyle. Fresh styles just arrived.',
      cta: 'Explore Now',
      link: '/products?sort=newest',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=500&fit=crop',
      badge: '✨ New Arrivals'
    },
    {
      id: 3,
      title: 'Exclusive Deals',
      subtitle: 'Members get exclusive access to premium products at unbeatable prices.',
      cta: 'Join Now',
      link: '/register',
      image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800&h=500&fit=crop',
      badge: '💎 Premium'
    },
  ]);
  const [loading, setLoading] = useState(true);

  // Load products from API for dynamic slides
  useEffect(() => {
    const loadSlides = async () => {
      try {
        const products = await getAllProducts();
        const productsArray = Array.isArray(products) ? products : [];
        
        if (productsArray.length > 0) {
          // Use first 3 products to create dynamic slides
          const productSlides: HeroSlide[] = productsArray
            .filter(p => p.image) // Only products with images
            .slice(0, 3)
            .map((product, index) => ({
              id: product.id,
              title: product.name || `Product ${index + 1}`,
              subtitle: product.description || 'Discover amazing products at great prices.',
              cta: 'Shop Now',
              link: `/product/${product.id}`,
              image: product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1483985988355-963728e8ab6b?w=800&h=500&fit=crop',
              badge: product.isNew ? '✨ New' : product.isSale ? '🔥 Sale' : '⭐ Featured'
            }));
          
          if (productSlides.length > 0) {
            setSlides(productSlides);
          }
        }
      } catch (error) {
        console.error('Error loading slides:', error);
        // Keep default slides
      } finally {
        setLoading(false);
      }
    };
    
    loadSlides();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const stats = [
    { value: '500+', label: 'Products', icon: ShoppingBag },
    { value: '50k+', label: 'Happy Customers', icon: Users },
    { value: '24/7', label: 'Support', icon: Headphones },
  ];

  if (loading) {
    return (
      <section className="relative bg-gradient-to-r from-pink-600 to-purple-600 text-white overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="mt-4 text-white/80">Loading offers...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-gradient-to-r from-pink-600 to-purple-600 text-white overflow-hidden min-h-[400px] md:min-h-[500px]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 relative py-12 md:py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          >
            {/* Content */}
            <div>
              {slides[currentSlide]?.badge && (
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {slides[currentSlide].badge}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight">
                {slides[currentSlide]?.title}
              </h1>
              <p className="text-base md:text-lg lg:text-xl mb-6 opacity-90 max-w-lg">
                {slides[currentSlide]?.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={slides[currentSlide]?.link || '/products'}
                  className="inline-flex items-center justify-center bg-white text-pink-600 px-6 md:px-8 py-3 rounded-full font-semibold hover:shadow-xl transition group"
                >
                  {slides[currentSlide]?.cta || 'Shop Now'}
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition" />
                </Link>
                <Link
                  to="/products?is_featured=true"
                  className="inline-flex items-center justify-center border-2 border-white text-white px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-pink-600 transition"
                >
                  View Featured
                </Link>
              </div>
              
              <div className="flex gap-6 md:gap-8 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/20">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index}>
                      <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs md:text-sm opacity-80 flex items-center gap-1">
                        <Icon className="w-3 h-3 md:w-4 md:h-4" />
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Image */}
            <div className="hidden lg:block">
              <img
                src={slides[currentSlide]?.image || 'https://images.unsplash.com/photo-1483985988355-963728e8ab6b?w=600&h=500&fit=crop'}
                alt={slides[currentSlide]?.title || 'Shopping'}
                className="rounded-lg shadow-2xl w-full h-[300px] md:h-[400px] object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1483985988355-963728e8ab6b?w=600&h=500&fit=crop';
                }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-1.5 md:p-2 rounded-full transition z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-1.5 md:p-2 rounded-full transition z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>
          </>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 md:h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-6 md:w-8 bg-white' 
                    : 'w-1.5 md:w-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;