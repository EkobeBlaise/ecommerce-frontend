// 🆕 NEW SERVICE - No breaking changes to existing code

export const urlService = {
  // Generate a URL-friendly slug from a string
  generateSlug: (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  },

  // Generate product path based on gender, category, subcategory, and slug
  generateProductPath: (
    gender: string,
    categorySlug: string,
    subcategorySlug: string | null,
    productSlug: string
  ): string => {
    const base = `/${gender}`;
    if (subcategorySlug) {
      return `${base}/${categorySlug}/${subcategorySlug}/${productSlug}`;
    }
    return `${base}/${categorySlug}/${productSlug}`;
  },

  // Generate full URL for a product
  generateProductUrl: (product: any): string => {
    const slug = product.slug || urlService.generateSlug(product.name);
    const categorySlug = product.category_slug || urlService.generateSlug(product.category);
    const subcategorySlug = product.subcategory_slug 
      ? urlService.generateSlug(product.subcategory) 
      : null;
    
    return urlService.generateProductPath(
      product.gender || 'unisex',
      categorySlug,
      subcategorySlug,
      slug
    );
  },

  // Auto-generate tags from product data
  generateTags: (product: any): string[] => {
    const tags: string[] = [];
    
    // Add gender
    if (product.gender) tags.push(product.gender);
    
    // Add category and subcategory
    if (product.category) tags.push(urlService.generateSlug(product.category));
    if (product.subcategory) tags.push(urlService.generateSlug(product.subcategory));
    
    // Add brand
    if (product.brand) tags.push(urlService.generateSlug(product.brand));
    
    // Add product name keywords
    if (product.name) {
      const words = product.name.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 2) tags.push(word);
      });
    }
    
    // Add status flags
    if (product.isNew) tags.push('new');
    if (product.isSale) tags.push('sale');
    if (product.isTrending) tags.push('trending');
    
    // Remove duplicates and limit
    return [...new Set(tags)].slice(0, 10);
  },

  // Build category tree for navigation
  buildCategoryTree: (categories: any[], subcategories: any[]): any[] => {
    const tree: any[] = [];
    const categoryMap: { [key: string]: any } = {};
    
    // Build category map
    categories.forEach((cat: any) => {
      categoryMap[cat.id] = {
        ...cat,
        children: [],
      };
    });
    
    // Add subcategories to categories
    subcategories.forEach((sub: any) => {
      if (categoryMap[sub.category_id]) {
        categoryMap[sub.category_id].children.push({
          ...sub,
          children: [],
        });
      }
    });
    
    // Build tree (only top-level categories)
    categories.forEach((cat: any) => {
      if (!cat.parentId) {
        tree.push(categoryMap[cat.id]);
      } else if (categoryMap[cat.parentId]) {
        categoryMap[cat.parentId].children.push(categoryMap[cat.id]);
      }
    });
    
    return tree;
  },

  // Find category by slug
  findCategoryBySlug: (categories: any[], slug: string): any | null => {
    return categories.find((cat: any) => cat.slug === slug) || null;
  },

  // Find subcategory by slug
  findSubcategoryBySlug: (subcategories: any[], slug: string): any | null => {
    return subcategories.find((sub: any) => sub.slug === slug) || null;
  },
};

export default urlService;
