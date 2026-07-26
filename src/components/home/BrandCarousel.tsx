import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { brandService } from '../../services/brandService';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description?: string;
  featured: boolean;
  status: string;
  isActive?: boolean;
}

export const BrandCarousel: React.FC = () => {
  const [activeBrands, setActiveBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      // ✅ Fetch brands from API
      const brands = await brandService.getAll();
      // Filter only active brands
      const active = brands.filter((b: Brand) => b.status === 'active');
      setActiveBrands(active);
    } catch (error) {
      console.error('Error loading brands:', error);
      setActiveBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // Don't show carousel if no active brands
  if (loading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading brands...</p>
        </div>
      </div>
    );
  }

  if (activeBrands.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Shop by Brand</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Discover products from your favorite brands</p>
        </div>
        
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={2}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
          className="brand-carousel pb-12"
        >
          {activeBrands.map((brand) => (
            <SwiperSlide key={brand.id}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="flex flex-col items-center">
                  <img 
                    src={brand.logo || `https://placehold.co/200x100/3b82f6/white?text=${brand.name}`} 
                    alt={brand.name}
                    className="w-full h-16 object-contain mb-3 filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/200x100/3b82f6/white?text=${brand.name}`;
                    }}
                  />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-pink-600 transition">
                    {brand.name}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};