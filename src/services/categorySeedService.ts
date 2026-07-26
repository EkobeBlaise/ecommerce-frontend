import { categoryManagementNewService } from './categoryManagementNewService';
import { Category, CategoryGroup, SubCategory } from '../types/categoryTypes';

// ============================================
// SEED ALL CATEGORIES - Women, Men, Kids
// ============================================

export const seedAllCategories = async () => {
  console.log('🚀 Starting category seed for Women, Men, Kids...');
  
  try {
    // Check if categories already exist
    let existingCategories = await categoryManagementNewService.getCategories();
    
    // If no categories, create them
    if (existingCategories.length === 0) {
      console.log('🌱 No categories found. Creating categories...');
      
      const categoryData = [
        { name: 'Women', slug: 'women', gender: 'women' as const, displayOrder: 1 },
        { name: 'Men', slug: 'men', gender: 'men' as const, displayOrder: 2 },
        { name: 'Kids', slug: 'kids', gender: 'kids' as const, displayOrder: 3 },
      ];
      
      for (const cat of categoryData) {
        try {
          const created = await categoryManagementNewService.addCategory(cat);
          console.log(`✅ Created category: ${created.name}`);
        } catch (err: any) {
          if (err.response?.status === 409) {
            console.log(`⚠️ Category ${cat.name} already exists`);
          } else {
            console.error(`❌ Failed to create category ${cat.name}:`, err);
          }
        }
      }
      
      // Refresh categories
      existingCategories = await categoryManagementNewService.getCategories();
    }
    
    if (existingCategories.length === 0) {
      console.error('❌ No categories available after creation attempt. Aborting seed.');
      return;
    }
    
    console.log(`📋 Found ${existingCategories.length} categories`);
    
    // Helper to get category by gender
    const getCategory = (gender: string) => existingCategories.find(c => c.gender === gender);
    
    // Check if groups and sub-categories already exist
    const womenCat = getCategory('women');
    if (womenCat) {
      const groups = await categoryManagementNewService.getCategoryGroups(womenCat.id);
      if (groups.length > 0) {
        const subs = await categoryManagementNewService.getSubCategoriesByGroup(groups[0].id);
        if (subs.length > 0) {
          console.log('✅ Sub-categories already exist, skipping seed.');
          return;
        }
      }
    }
    
    console.log('🌱 Seeding groups and sub-categories...');
    
    // Seed all sub-categories
    await seedWomenSubCategories();
    await seedMenSubCategories();
    await seedKidsSubCategories();
    
    console.log('✅ All categories seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  }
};

// ============================================
// WOMEN SUB-CATEGORIES
// ============================================

export const seedWomenSubCategories = async () => {
  try {
    console.log('🌱 Seeding Women sub-categories...');
    
    const allCategories = await categoryManagementNewService.getCategories();
    const womenCategory = allCategories.find(c => c.gender === 'women');
    
    if (!womenCategory) {
      console.log('⚠️ Women category not found');
      return;
    }
    
    const groups = await categoryManagementNewService.getCategoryGroups(womenCategory.id);
    console.log(`📂 Found ${groups.length} Women groups`);
    
    const subData: Record<string, Array<{ name: string; slug: string }>> = {
      'NEW IN': [
        { name: 'Vacation', slug: 'vacation-women' },
        { name: 'Special occasions', slug: 'special-occasions-women' },
        { name: 'GAP X Victoria Beckham', slug: 'gap-victoria-beckham-women' },
        { name: 'Affordable styles', slug: 'affordable-styles-women' },
        { name: 'Trend Spotter', slug: 'trend-spotter-women' },
        { name: 'Boards', slug: 'boards-women' }
      ],
      'Clothing': [
        { name: 'Dresses', slug: 'dresses-women' },
        { name: 'Shirts & Blouses', slug: 'shirts-blouses-women' },
        { name: 'Trench coats', slug: 'trench-coats-women' },
        { name: 'Skirts', slug: 'skirts-women' },
        { name: 'Hoodies & Sweatshirts', slug: 'hoodies-sweatshirts-women' },
        { name: 'All clothing', slug: 'all-clothing-women' },
        { name: 'T-shirts & Tops', slug: 't-shirts-tops-women' },
        { name: 'Trousers', slug: 'trousers-women' },
        { name: 'Jackets', slug: 'jackets-women' },
        { name: 'Jeans', slug: 'jeans-women' }
      ],
      'Shoes': [
        { name: 'Ballerinas', slug: 'ballerinas-women' },
        { name: 'Sneakers', slug: 'sneakers-women' },
        { name: 'Loafers', slug: 'loafers-women' },
        { name: 'Boots', slug: 'boots-women' },
        { name: 'Hiking shoes', slug: 'hiking-shoes-women' },
        { name: 'Slippers', slug: 'slippers-women' },
        { name: 'Sneaker Hot Drops', slug: 'sneaker-hot-drops-women' },
        { name: 'Flats', slug: 'flats-women' },
        { name: 'Heels', slug: 'heels-women' },
        { name: 'Mules', slug: 'mules-women' },
        { name: 'Sports Shoes', slug: 'sports-shoes-women' },
        { name: 'Designer Shoes', slug: 'designer-shoes-women' }
      ],
      'Accessories': [
        { name: 'Sunglasses', slug: 'sunglasses-women' },
        { name: 'Jewellery', slug: 'jewellery-women' },
        { name: 'Hats', slug: 'hats-women' },
        { name: 'Handbags', slug: 'handbags-women' },
        { name: 'Bag charms', slug: 'bag-charms-women' },
        { name: 'Watches', slug: 'watches-women' },
        { name: 'Backpacks', slug: 'backpacks-women' },
        { name: 'Wallets', slug: 'wallets-women' },
        { name: 'Belts', slug: 'belts-women' },
        { name: 'Electronics', slug: 'electronics-women' },
        { name: 'Designer Bags', slug: 'designer-bags-women' },
        { name: 'Scarves', slug: 'scarves-women' }
      ],
      'Designer': [
        { name: 'Sunglasses', slug: 'sunglasses-designer-women' },
        { name: 'Handbags', slug: 'handbags-designer-women' },
        { name: 'Dresses', slug: 'dresses-designer-women' },
        { name: 'T-shirts & Tops', slug: 't-shirts-tops-designer-women' },
        { name: 'Jewellery & Accessories', slug: 'jewellery-accessories-women' },
        { name: 'Shoes', slug: 'shoes-designer-women' },
        { name: 'Shop all', slug: 'shop-all-designer-women' },
        { name: 'Home & Lifestyle', slug: 'home-lifestyle-designer-women' },
        { name: 'New Season', slug: 'new-season-designer-women' },
        { name: 'New arrivals', slug: 'new-arrivals-designer-women' },
        { name: 'Blazers & Jackets', slug: 'blazers-jackets-women' }
      ],
      'Streetwear': [
        { name: 'Discover all', slug: 'discover-all-streetwear-women' },
        { name: 'Jackets', slug: 'jackets-streetwear-women' },
        { name: 'Sweatshirts & Hoodies', slug: 'sweatshirts-hoodies-women' },
        { name: 'Trousers', slug: 'trousers-streetwear-women' },
        { name: 'T-shirts & Tops', slug: 't-shirts-tops-streetwear-women' },
        { name: 'Accessories', slug: 'accessories-streetwear-women' },
        { name: 'Sneaker Hot Drops', slug: 'sneaker-hot-drops-streetwear-women' },
        { name: 'Sneaker Release Calendar', slug: 'sneaker-release-calendar-women' },
        { name: 'Streetwear corner', slug: 'streetwear-corner-women' },
        { name: 'Never out of style', slug: 'never-out-of-style-women' },
        { name: 'Only at Zalando', slug: 'only-at-zalando-women' },
        { name: 'Insiders edit', slug: 'insiders-edit-women' }
      ],
      'Sports': [
        { name: 'Discover all', slug: 'discover-all-sports-women' },
        { name: 'Tops', slug: 'tops-sports-women' },
        { name: 'Leggings', slug: 'leggings-sports-women' },
        { name: 'Shoes', slug: 'shoes-sports-women' },
        { name: 'Sports bras', slug: 'sports-bras-women' },
        { name: 'Accessories', slug: 'accessories-sports-women' },
        { name: 'Running', slug: 'running-women' },
        { name: 'Outdoor', slug: 'outdoor-women' },
        { name: 'Training', slug: 'training-women' },
        { name: 'Football', slug: 'football-women' },
        { name: 'Yoga', slug: 'yoga-women' },
        { name: 'Tennis', slug: 'tennis-women' }
      ],
      'Brands': [
        { name: 'Discover all', slug: 'discover-all-brands-women' },
        { name: 'Tops', slug: 'tops-brands-women' },
        { name: 'Leggings', slug: 'leggings-brands-women' },
        { name: 'Shoes', slug: 'shoes-brands-women' },
        { name: 'Sports bras', slug: 'sports-bras-brands-women' },
        { name: 'Accessories', slug: 'accessories-brands-women' }
      ],
      'Sale': [
        { name: 'All clothing', slug: 'all-clothing-sale-women' },
        { name: 'Coats', slug: 'coats-sale-women' },
        { name: 'Dresses', slug: 'dresses-sale-women' },
        { name: 'Jeans', slug: 'jeans-sale-women' },
        { name: 'T-shirts & tops', slug: 't-shirts-tops-sale-women' },
        { name: 'Knitwear', slug: 'knitwear-sale-women' },
        { name: 'All shoes', slug: 'all-shoes-sale-women' },
        { name: 'All accessories', slug: 'all-accessories-sale-women' },
        { name: 'Trainers', slug: 'trainers-sale-women' },
        { name: 'Boots', slug: 'boots-sale-women' },
        { name: 'Bags', slug: 'bags-sale-women' },
        { name: 'Jewellery', slug: 'jewellery-sale-women' },
        { name: 'Lounge by Zalando', slug: 'lounge-by-zalando-women' },
        { name: 'New in sale', slug: 'new-in-sale-women' },
        { name: 'Streetwear', slug: 'streetwear-sale-women' },
        { name: 'Designer', slug: 'designer-sale-women' },
        { name: 'Sports', slug: 'sports-sale-women' },
        { name: "Children's sale", slug: 'childrens-sale-women' }
      ]
    };

    let totalSubs = 0;
    for (const group of groups) {
      const subs = subData[group.name] || [];
      for (let i = 0; i < subs.length; i++) {
        const sub = subs[i];
        await categoryManagementNewService.addSubCategory({
          name: sub.name,
          slug: sub.slug,
          categoryGroupId: group.id,
          categoryId: womenCategory.id,
          isActive: true,
          displayOrder: i + 1
        });
        totalSubs++;
      }
    }

    console.log(`✅ Created ${totalSubs} Women sub-categories`);
    
  } catch (error) {
    console.error('Error seeding women sub-categories:', error);
  }
};

// ============================================
// MEN SUB-CATEGORIES
// ============================================

export const seedMenSubCategories = async () => {
  try {
    console.log('🌱 Seeding Men sub-categories...');
    
    const allCategories = await categoryManagementNewService.getCategories();
    const menCategory = allCategories.find(c => c.gender === 'men');
    
    if (!menCategory) {
      console.log('⚠️ Men category not found');
      return;
    }
    
    const groups = await categoryManagementNewService.getCategoryGroups(menCategory.id);
    console.log(`📂 Found ${groups.length} Men groups`);
    
    const subData: Record<string, Array<{ name: string; slug: string }>> = {
      'NEW IN': [
        { name: 'Vacation', slug: 'vacation-men' },
        { name: 'Special occasions', slug: 'special-occasions-men' },
        { name: 'Business Travel', slug: 'business-travel-men' },
        { name: 'Affordable styles', slug: 'affordable-styles-men' },
        { name: 'Trend Spotter', slug: 'trend-spotter-men' },
        { name: 'Boards', slug: 'boards-men' }
      ],
      'Clothing': [
        { name: 'T-Shirts', slug: 't-shirts-men' },
        { name: 'Polos', slug: 'polos-men' },
        { name: 'Linen Shirts', slug: 'linen-shirts-men' },
        { name: 'Shorts', slug: 'shorts-men' },
        { name: 'Lightweight Jackets', slug: 'lightweight-jackets-men' },
        { name: 'All clothing', slug: 'all-clothing-men' },
        { name: 'Dress Shirts', slug: 'dress-shirts-men' },
        { name: 'Chinos', slug: 'chinos-men' },
        { name: 'Blazers', slug: 'blazers-men' },
        { name: 'Jeans', slug: 'jeans-men' }
      ],
      'Shoes': [
        { name: 'Sneakers', slug: 'sneakers-men' },
        { name: 'Loafers', slug: 'loafers-men' },
        { name: 'Espadrilles', slug: 'espadrilles-men' },
        { name: 'Sandals', slug: 'sandals-men' },
        { name: 'Slip-ons', slug: 'slip-ons-men' },
        { name: 'Canvas Shoes', slug: 'canvas-shoes-men' },
        { name: 'Sneaker Hot Drops', slug: 'sneaker-hot-drops-men' },
        { name: 'Formal Shoes', slug: 'formal-shoes-men' },
        { name: 'Boots', slug: 'boots-men' },
        { name: 'Sports Shoes', slug: 'sports-shoes-men' },
        { name: 'Designer Shoes', slug: 'designer-shoes-men' },
        { name: 'Orthopedic', slug: 'orthopedic-men' }
      ],
      'Accessories': [
        { name: 'Sunglasses', slug: 'sunglasses-men' },
        { name: 'Watches', slug: 'watches-men' },
        { name: 'Hats', slug: 'hats-men' },
        { name: 'Bags', slug: 'bags-men' },
        { name: 'Backpacks', slug: 'backpacks-men' },
        { name: 'Wallets', slug: 'wallets-men' },
        { name: 'Belts', slug: 'belts-men' },
        { name: 'Ties', slug: 'ties-men' },
        { name: 'Cufflinks', slug: 'cufflinks-men' },
        { name: 'Smartwatches', slug: 'smartwatches-men' },
        { name: 'Leather Goods', slug: 'leather-goods-men' },
        { name: 'Scarves', slug: 'scarves-men' }
      ],
      'Designer': [
        { name: 'Sunglasses', slug: 'sunglasses-designer-men' },
        { name: 'Bags', slug: 'bags-designer-men' },
        { name: 'Suits', slug: 'suits-men' },
        { name: 'Dress Shirts', slug: 'dress-shirts-designer-men' },
        { name: 'Watches', slug: 'watches-designer-men' },
        { name: 'Shoes', slug: 'shoes-designer-men' },
        { name: 'Shop all', slug: 'shop-all-designer-men' },
        { name: 'Home & Lifestyle', slug: 'home-lifestyle-designer-men' },
        { name: 'New Season', slug: 'new-season-designer-men' },
        { name: 'New arrivals', slug: 'new-arrivals-designer-men' }
      ],
      'Streetwear': [
        { name: 'Discover all', slug: 'discover-all-streetwear-men' },
        { name: 'Hoodies', slug: 'hoodies-men' },
        { name: 'Sweatshirts', slug: 'sweatshirts-men' },
        { name: 'Cargo Pants', slug: 'cargo-pants-men' },
        { name: 'Oversized Tees', slug: 'oversized-tees-men' },
        { name: 'Caps', slug: 'caps-men' },
        { name: 'Sneaker Hot Drops', slug: 'sneaker-hot-drops-streetwear-men' },
        { name: 'Limited Editions', slug: 'limited-editions-men' },
        { name: 'Urban Style', slug: 'urban-style-men' },
        { name: 'Never out of style', slug: 'never-out-of-style-men' },
        { name: 'Exclusive Drops', slug: 'exclusive-drops-men' },
        { name: 'Insiders edit', slug: 'insiders-edit-men' }
      ],
      'Sports': [
        { name: 'Discover all', slug: 'discover-all-sports-men' },
        { name: 'Training', slug: 'training-men' },
        { name: 'Running', slug: 'running-men' },
        { name: 'Football', slug: 'football-men' },
        { name: 'Basketball', slug: 'basketball-men' },
        { name: 'Gym', slug: 'gym-men' },
        { name: 'Outdoor', slug: 'outdoor-men' },
        { name: 'Cycling', slug: 'cycling-men' },
        { name: 'Swimming', slug: 'swimming-men' },
        { name: 'Yoga', slug: 'yoga-men' },
        { name: 'Tennis', slug: 'tennis-men' },
        { name: 'Golf', slug: 'golf-men' }
      ],
      'Brands': [
        { name: 'Nike', slug: 'nike-brands-men' },
        { name: 'Adidas', slug: 'adidas-brands-men' },
        { name: 'Zara', slug: 'zara-men' },
        { name: 'H&M', slug: 'hm-men' },
        { name: 'Uniqlo', slug: 'uniqlo-men' },
        { name: "Levi's", slug: 'levis-men' },
        { name: 'Gucci', slug: 'gucci-brands-men' },
        { name: 'Prada', slug: 'prada-brands-men' },
        { name: 'Armani', slug: 'armani-brands-men' },
        { name: 'Versace', slug: 'versace-brands-men' },
        { name: 'Boss', slug: 'boss-men' },
        { name: 'Ralph Lauren', slug: 'ralph-lauren-men' },
        { name: 'Patagonia', slug: 'patagonia-men' },
        { name: 'The North Face', slug: 'the-north-face-men' },
        { name: 'Timberland', slug: 'timberland-brands-men' },
        { name: 'Veja', slug: 'veja-men' }
      ],
      'Sale': [
        { name: 'All clothing', slug: 'all-clothing-sale-men' },
        { name: 'Suits', slug: 'suits-sale-men' },
        { name: 'Jackets', slug: 'jackets-sale-men' },
        { name: 'Jeans', slug: 'jeans-sale-men' },
        { name: 'T-shirts', slug: 't-shirts-sale-men' },
        { name: 'Knitwear', slug: 'knitwear-sale-men' },
        { name: 'All shoes', slug: 'all-shoes-sale-men' },
        { name: 'Sneakers', slug: 'sneakers-sale-men' },
        { name: 'Boots', slug: 'boots-sale-men' },
        { name: 'Bags', slug: 'bags-sale-men' },
        { name: 'Watches', slug: 'watches-sale-men' },
        { name: 'Accessories', slug: 'accessories-sale-men' },
        { name: 'Clearance', slug: 'clearance-men' },
        { name: 'Last Chance', slug: 'last-chance-men' },
        { name: 'Outlet', slug: 'outlet-men' },
        { name: 'Member Exclusive', slug: 'member-exclusive-men' },
        { name: 'Flash Sale', slug: 'flash-sale-men' }
      ]
    };

    let totalSubs = 0;
    for (const group of groups) {
      const subs = subData[group.name] || [];
      for (let i = 0; i < subs.length; i++) {
        const sub = subs[i];
        await categoryManagementNewService.addSubCategory({
          name: sub.name,
          slug: sub.slug,
          categoryGroupId: group.id,
          categoryId: menCategory.id,
          isActive: true,
          displayOrder: i + 1
        });
        totalSubs++;
      }
    }

    console.log(`✅ Created ${totalSubs} Men sub-categories`);
    
  } catch (error) {
    console.error('Error seeding men sub-categories:', error);
  }
};

// ============================================
// KIDS SUB-CATEGORIES
// ============================================

export const seedKidsSubCategories = async () => {
  try {
    console.log('🌱 Seeding Kids sub-categories...');
    
    const allCategories = await categoryManagementNewService.getCategories();
    const kidsCategory = allCategories.find(c => c.gender === 'kids');
    
    if (!kidsCategory) {
      console.log('⚠️ Kids category not found');
      return;
    }
    
    const groups = await categoryManagementNewService.getCategoryGroups(kidsCategory.id);
    console.log(`📂 Found ${groups.length} Kids groups`);
    
    const subData: Record<string, Array<{ name: string; slug: string }>> = {
      'NEW IN': [
        { name: 'Dresses', slug: 'dresses-kids' },
        { name: 'Jackets', slug: 'jackets-kids' },
        { name: 'Trainers', slug: 'trainers-kids' },
        { name: 'Pullovers', slug: 'pullovers-kids' },
        { name: 'Nightwear', slug: 'nightwear-kids' },
        { name: 'Long sleeved tops', slug: 'long-sleeved-tops-kids' },
        { name: 'Rainwear', slug: 'rainwear-kids' },
        { name: 'Cardigans', slug: 'cardigans-kids' },
        { name: 'Boots', slug: 'boots-kids' },
        { name: 'Onepieces & Sets (Babies)', slug: 'onepieces-sets-kids' },
        { name: 'All Clothing', slug: 'all-clothing-kids' },
        { name: 'All Shoes', slug: 'all-shoes-kids' },
        { name: 'Under & Nightwear', slug: 'under-nightwear-kids' },
        { name: 'Socks', slug: 'socks-kids' },
        { name: 'Adaptive Fashion', slug: 'adaptive-fashion-kids' },
        { name: 'Kids Essentials', slug: 'essentials-kids' },
        { name: 'Home & Lifestyle', slug: 'home-lifestyle-kids' },
        { name: 'New In', slug: 'new-in-kids' },
        { name: 'Sneaker Hot Drops', slug: 'sneaker-hot-drops-kids' },
        { name: 'Gift Cards', slug: 'gift-cards-kids' },
        { name: 'Gifts for Kids', slug: 'gifts-kids' }
      ],
      'Girls': [
        { name: 'Teens (9–16)', slug: 'teens-girls' },
        { name: 'Kids (4–8)', slug: 'kids-girls' },
        { name: 'Toddlers (2–3)', slug: 'toddlers-girls' },
        { name: 'Babies (0–1)', slug: 'babies-girls' },
        { name: 'Dresses', slug: 'dresses-girls' },
        { name: 'T-shirts & Tops', slug: 't-shirts-tops-girls' },
        { name: 'Jackets', slug: 'jackets-girls' },
        { name: 'Trousers', slug: 'trousers-girls' },
        { name: 'Jeans', slug: 'jeans-girls' },
        { name: 'Sweatshirts & Knitwear', slug: 'sweatshirts-knitwear-girls' }
      ],
      'Boys': [
        { name: 'Teens (9–16)', slug: 'teens-boys' },
        { name: 'Kids (4–8)', slug: 'kids-boys' },
        { name: 'Toddlers (2–3)', slug: 'toddlers-boys' },
        { name: 'Babies (0–1)', slug: 'babies-boys' },
        { name: 'T-shirts & Tops', slug: 't-shirts-tops-boys' },
        { name: 'Jeans', slug: 'jeans-boys' },
        { name: 'Jackets & Vests', slug: 'jackets-vests-boys' },
        { name: 'Sweatshirts & Knitwear', slug: 'sweatshirts-knitwear-boys' },
        { name: 'Trousers', slug: 'trousers-boys' },
        { name: 'Shirts', slug: 'shirts-boys' }
      ],
      'Baby': [
        { name: 'All Categories', slug: 'all-categories-baby' },
        { name: 'New In', slug: 'new-in-baby' },
        { name: 'Playsuits', slug: 'playsuits-baby' },
        { name: 'Pyjamas', slug: 'pyjamas-baby' },
        { name: 'Shoes', slug: 'shoes-baby' },
        { name: 'Nappy Bags', slug: 'nappy-bags-baby' },
        { name: 'Multipacks', slug: 'multipacks-baby' },
        { name: 'Feeding & Nursing', slug: 'feeding-nursing-baby' },
        { name: 'Baby Gifts', slug: 'gifts-baby' },
        { name: 'Designer', slug: 'designer-baby' },
        { name: 'Name It', slug: 'name-it-baby' },
        { name: 'Tommy Hilfiger', slug: 'tommy-hilfiger-baby' },
        { name: 'adidas', slug: 'adidas-baby' },
        { name: 'Friboo', slug: 'friboo-baby' },
        { name: "Lil' Atelier", slug: 'lil-atelier-baby' }
      ],
      'Shoes': [
        { name: 'Boots', slug: 'boots-girls-shoes' },
        { name: 'Sneakers', slug: 'sneakers-girls-shoes' },
        { name: 'Slippers', slug: 'slippers-girls-shoes' },
        { name: 'Designer Shoes', slug: 'designer-shoes-girls' },
        { name: 'Sports Shoes', slug: 'sports-shoes-girls' },
        { name: 'Boots', slug: 'boots-boys-shoes' },
        { name: 'Sneakers', slug: 'sneakers-boys-shoes' },
        { name: 'Slippers', slug: 'slippers-boys-shoes' },
        { name: 'Designer Shoes', slug: 'designer-shoes-boys' },
        { name: 'Sports Shoes', slug: 'sports-shoes-boys' },
        { name: 'Boots', slug: 'boots-babies-shoes' },
        { name: 'Sneakers', slug: 'sneakers-babies-shoes' },
        { name: 'Slippers', slug: 'slippers-babies-shoes' },
        { name: 'First Walkers', slug: 'first-walkers-babies' }
      ],
      'Accessories': [
        { name: 'Sunglasses', slug: 'sunglasses-accessories-kids' },
        { name: 'Belts', slug: 'belts-accessories-kids' },
        { name: 'Caps', slug: 'caps-accessories-kids' },
        { name: 'Hair Accessories', slug: 'hair-accessories-kids' },
        { name: 'Watches & Jewellery', slug: 'watches-jewellery-kids' },
        { name: 'Bags & Backpacks', slug: 'bags-backpacks-kids' },
        { name: 'School Bags & Accessories', slug: 'school-bags-kids' },
        { name: 'Water Bottles & Lunch Boxes', slug: 'water-bottles-kids' },
        { name: 'Baby Feeding & Nursing', slug: 'baby-feeding-kids' },
        { name: 'Toys', slug: 'toys-kids' },
        { name: 'Babies', slug: 'babies-accessories-kids' },
        { name: 'Toddlers', slug: 'toddlers-accessories-kids' },
        { name: 'Kids', slug: 'kids-accessories-kids' },
        { name: 'Teenage Girls', slug: 'teenage-girls-accessories' },
        { name: 'Teenage Boys', slug: 'teenage-boys-accessories' }
      ],
      'Designer': [
        { name: 'Teens (9–16)', slug: 'teens-designer-kids' },
        { name: 'Kids (4–8)', slug: 'kids-designer-kids' },
        { name: 'Babies & Toddlers (0–3)', slug: 'babies-toddlers-designer' },
        { name: 'Sportswear', slug: 'sportswear-designer-kids' },
        { name: 'Sports Shoes', slug: 'sports-shoes-designer-kids' },
        { name: 'Sports Accessories', slug: 'sports-accessories-designer' },
        { name: 'Football', slug: 'football-designer-kids' },
        { name: 'Swimming', slug: 'swimming-designer-kids' },
        { name: 'Outdoor', slug: 'outdoor-designer-kids' },
        { name: 'Running', slug: 'running-designer-kids' },
        { name: 'Basketball', slug: 'basketball-designer-kids' },
        { name: 'Bags & Backpacks', slug: 'bags-backpacks-designer' },
        { name: 'Equipment', slug: 'equipment-designer-kids' },
        { name: 'Team Merchandise', slug: 'team-merch-designer-kids' }
      ],
      'Sports': [
        { name: 'Teens (9–16)', slug: 'teens-sports-kids' },
        { name: 'Kids (4–8)', slug: 'kids-sports-kids' },
        { name: 'Babies & Toddlers (0–3)', slug: 'babies-toddlers-sports' },
        { name: 'Sportswear', slug: 'sportswear-sports-kids' },
        { name: 'Sports Shoes', slug: 'sports-shoes-sports-kids' },
        { name: 'Sports Accessories', slug: 'sports-accessories-sports' },
        { name: 'Football', slug: 'football-sports-kids' },
        { name: 'Swimming', slug: 'swimming-sports-kids' },
        { name: 'Outdoor', slug: 'outdoor-sports-kids' },
        { name: 'Running', slug: 'running-sports-kids' },
        { name: 'Basketball', slug: 'basketball-sports-kids' },
        { name: 'Bags & Backpacks', slug: 'bags-backpacks-sports' },
        { name: 'Equipment', slug: 'equipment-sports-kids' },
        { name: 'Team Merchandise', slug: 'team-merch-sports-kids' }
      ],
      'Brands': [
        { name: 'Nike Sportswear', slug: 'nike-sportswear-kids' },
        { name: 'adidas Originals', slug: 'adidas-originals-kids' },
        { name: 'New Balance', slug: 'new-balance-kids' },
        { name: "Levi's", slug: 'levis-kids' },
        { name: 'Gap', slug: 'gap-kids' },
        { name: 'Nike Performance', slug: 'nike-performance-kids' },
        { name: 'Jordan', slug: 'jordan-kids' },
        { name: 'The North Face', slug: 'the-north-face-kids' },
        { name: 'Puma', slug: 'puma-kids' },
        { name: 'Under Armour', slug: 'under-armour-kids' },
        { name: 'Asics', slug: 'asics-kids' },
        { name: 'Polo Ralph Lauren', slug: 'polo-ralph-lauren-kids' },
        { name: 'BOSS Kidswear', slug: 'boss-kidswear-kids' },
        { name: 'Tommy Hilfiger', slug: 'tommy-hilfiger-kids' },
        { name: 'Stella McCartney', slug: 'stella-mccartney-kids' },
        { name: 'Emporio Armani', slug: 'emporio-armani-kids' },
        { name: 'Calvin Klein', slug: 'calvin-klein-kids' }
      ],
      'Sale': [
        { name: '40% and above', slug: '40-and-above-kids' },
        { name: 'Lounge by Zalando', slug: 'lounge-by-zalando-kids' },
        { name: 'Babies', slug: 'babies-sale-kids' },
        { name: 'Discover All', slug: 'discover-all-sale-kids' },
        { name: 'Toys on Sale', slug: 'toys-sale-kids' },
        { name: 'Toddlers (2–3 years)', slug: 'toddlers-girls-sale' },
        { name: 'Kids (4–8 years)', slug: 'kids-girls-sale' },
        { name: 'Teens (9–16 years)', slug: 'teens-girls-sale' },
        { name: 'Clothing', slug: 'clothing-girls-sale' },
        { name: 'Shoes', slug: 'shoes-girls-sale' },
        { name: 'Toddlers (2–3 years)', slug: 'toddlers-boys-sale' },
        { name: 'Kids (4–8 years)', slug: 'kids-boys-sale' },
        { name: 'Teens (9–16 years)', slug: 'teens-boys-sale' },
        { name: 'Clothing', slug: 'clothing-boys-sale' },
        { name: 'Shoes', slug: 'shoes-boys-sale' }
      ]
    };

    let totalSubs = 0;
    for (const group of groups) {
      const subs = subData[group.name] || [];
      for (let i = 0; i < subs.length; i++) {
        const sub = subs[i];
        await categoryManagementNewService.addSubCategory({
          name: sub.name,
          slug: sub.slug,
          categoryGroupId: group.id,
          categoryId: kidsCategory.id,
          isActive: true,
          displayOrder: i + 1
        });
        totalSubs++;
      }
    }

    console.log(`✅ Created ${totalSubs} Kids sub-categories`);
    
  } catch (error) {
    console.error('Error seeding kids sub-categories:', error);
  }
};

// ============================================
// LEGACY FUNCTIONS (kept for compatibility)
// ============================================

export const seedWomenCategories = async () => {
  console.log('⚠️ seedWomenCategories is deprecated, use seedWomenSubCategories instead');
  await seedWomenSubCategories();
};

export const seedMenCategories = async () => {
  console.log('⚠️ seedMenCategories is deprecated, use seedMenSubCategories instead');
  await seedMenSubCategories();
};

export const seedKidsCategories = async () => {
  console.log('⚠️ seedKidsCategories is deprecated, use seedKidsSubCategories instead');
  await seedKidsSubCategories();
};