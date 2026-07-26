import React, { useState } from 'react';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';

interface SampleProduct {
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  subcategory: string;
  gender: 'women' | 'men' | 'kids' | 'unisex';
  brand: string;
  stock: number;
  description: string;
  isNew?: boolean;
  isSale?: boolean;
  isTrending?: boolean;
  isBestseller?: boolean;
}

const sampleProductsByGender: Record<string, SampleProduct[]> = {
  women: [
    {
      name: 'Floral Summer Dress',
      price: 49.99,
      oldPrice: 79.99,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
      category: 'Clothing',
      subcategory: 'Dresses',
      gender: 'women',
      brand: 'Zara',
      stock: 45,
      description: 'Beautiful floral summer dress perfect for warm days.',
      isNew: true,
      isTrending: true,
    },
    {
      name: 'Classic White Blouse',
      price: 34.99,
      oldPrice: 49.99,
      image: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400',
      category: 'Clothing',
      subcategory: 'Shirts & Blouses',
      gender: 'women',
      brand: 'H&M',
      stock: 60,
      description: 'Versatile white blouse that pairs well with anything.',
      isBestseller: true,
    },
    {
      name: 'Leather Handbag',
      price: 89.99,
      oldPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1584917865445-de89df76afd3?w=400',
      category: 'Accessories',
      subcategory: 'Handbags',
      gender: 'women',
      brand: 'Gucci',
      stock: 20,
      description: 'Premium leather handbag with gold hardware.',
      isSale: true,
    },
    {
      name: 'Running Sneakers',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      category: 'Shoes',
      subcategory: 'Sneakers',
      gender: 'women',
      brand: 'Nike',
      stock: 35,
      description: 'Lightweight running sneakers for everyday comfort.',
      isTrending: true,
    },
    {
      name: 'Gold Hoop Earrings',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
      category: 'Accessories',
      subcategory: 'Jewellery',
      gender: 'women',
      brand: 'Pandora',
      stock: 80,
      description: 'Classic gold hoop earrings for any occasion.',
      isNew: true,
    },
  ],
  men: [
    {
      name: 'Slim Fit Jeans',
      price: 59.99,
      oldPrice: 89.99,
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400',
      category: 'Clothing',
      subcategory: 'Jeans',
      gender: 'men',
      brand: "Levi's",
      stock: 50,
      description: 'Classic slim fit jeans with stretch comfort.',
      isBestseller: true,
    },
    {
      name: 'Polo Shirt',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400',
      category: 'Clothing',
      subcategory: 'Polos',
      gender: 'men',
      brand: 'Ralph Lauren',
      stock: 70,
      description: 'Classic polo shirt for casual and semi-formal wear.',
      isNew: true,
    },
    {
      name: 'Leather Sneakers',
      price: 89.99,
      oldPrice: 119.99,
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400',
      category: 'Shoes',
      subcategory: 'Sneakers',
      gender: 'men',
      brand: 'Adidas',
      stock: 30,
      description: 'Premium leather sneakers with cushioned sole.',
      isSale: true,
      isTrending: true,
    },
    {
      name: 'Wireless Headphones',
      price: 149.99,
      oldPrice: 199.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      category: 'Electronics',
      subcategory: 'Audio',
      gender: 'men',
      brand: 'Sony',
      stock: 25,
      description: 'Premium wireless headphones with noise cancellation.',
      isBestseller: true,
    },
    {
      name: 'Leather Belt',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      category: 'Accessories',
      subcategory: 'Belts',
      gender: 'men',
      brand: 'Boss',
      stock: 100,
      description: 'Genuine leather belt with sleek buckle design.',
    },
  ],
  kids: [
    {
      name: 'Cartoon Backpack',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      category: 'Accessories',
      subcategory: 'Backpacks',
      gender: 'kids',
      brand: 'Disney',
      stock: 40,
      description: 'Colorful cartoon backpack perfect for school.',
      isNew: true,
    },
    {
      name: 'Kids Running Shoes',
      price: 39.99,
      oldPrice: 59.99,
      image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400',
      category: 'Shoes',
      subcategory: 'Sneakers',
      gender: 'kids',
      brand: 'Nike',
      stock: 35,
      description: 'Comfortable running shoes for active kids.',
      isSale: true,
    },
    {
      name: 'Colorful T-Shirt Set',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
      category: 'Clothing',
      subcategory: 'T-shirts & Tops',
      gender: 'kids',
      brand: 'Gap',
      stock: 55,
      description: 'Pack of 3 colorful t-shirts for kids.',
      isBestseller: true,
    },
    {
      name: 'Kids Sunglasses',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
      category: 'Accessories',
      subcategory: 'Sunglasses',
      gender: 'kids',
      brand: 'Ray-Ban',
      stock: 60,
      description: 'Fun and protective sunglasses for kids.',
    },
    {
      name: 'Building Blocks Set',
      price: 34.99,
      oldPrice: 49.99,
      image: 'https://images.unsplash.com/photo-1587654780291-39c9404d9e7d?w=400',
      category: 'Electronics',
      subcategory: 'Toys',
      gender: 'kids',
      brand: 'Lego',
      stock: 30,
      description: 'Creative building blocks set for endless fun.',
      isNew: true,
      isTrending: true,
    },
  ],
  electronics: [
    {
      name: 'Smart Watch Ultra',
      price: 199.99,
      oldPrice: 299.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      category: 'Electronics',
      subcategory: 'Wearables',
      gender: 'unisex',
      brand: 'Apple',
      stock: 20,
      description: 'Premium smart watch with fitness tracking.',
      isBestseller: true,
      isTrending: true,
    },
    {
      name: 'Wireless Earbuds Pro',
      price: 129.99,
      oldPrice: 179.99,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
      category: 'Electronics',
      subcategory: 'Audio',
      gender: 'unisex',
      brand: 'Samsung',
      stock: 40,
      description: 'Noise-cancelling wireless earbuds with long battery life.',
      isSale: true,
    },
    {
      name: 'Bluetooth Speaker',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
      category: 'Electronics',
      subcategory: 'Audio',
      gender: 'unisex',
      brand: 'JBL',
      stock: 25,
      description: 'Portable waterproof Bluetooth speaker.',
      isNew: true,
    },
  ],
};

export const QuickAddSamples: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = async () => {
    const allProducts = [
      ...sampleProductsByGender.women,
      ...sampleProductsByGender.men,
      ...sampleProductsByGender.kids,
      ...sampleProductsByGender.electronics,
    ];

    if (!window.confirm(`Add ${allProducts.length} sample products across all categories?`)) {
      return;
    }

    setIsAdding(true);
    let addedCount = 0;
    let errorCount = 0;

    toast.loading(`Adding ${allProducts.length} sample products...`, { id: 'sample-add' });

    for (const product of allProducts) {
      try {
        const productData = {
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          image: product.image,
          images: [product.image],
          description: product.description,
          gender: product.gender,
          category: product.category,
          subcategory: product.subcategory,
          brand: product.brand,
          stock_quantity: product.stock,
          sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          status: 'active',
          tags: [product.category, product.subcategory, product.brand],
          isNew: product.isNew || false,
          isSale: product.isSale || false,
          isTrending: product.isTrending || false,
          isBestseller: product.isBestseller || false,
          variants: [],
        };

        await productService.add(productData);
        addedCount++;
      } catch (error: any) {
        console.error('Error adding product:', error);
        errorCount++;
      }
    }

    toast.dismiss('sample-add');
    setIsAdding(false);

    if (errorCount === 0) {
      toast.success(`✅ Successfully added ${addedCount} sample products!`);
    } else {
      toast.error(`Added ${addedCount} products, ${errorCount} failed. Check console for details.`);
    }

    // ✅ Force reload the page to show the products
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <button
      onClick={handleQuickAdd}
      disabled={isAdding}
      className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-teal-600 transition shadow-md font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isAdding ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Quick Add Sample Products
        </>
      )}
    </button>
  );
};

export default QuickAddSamples;