// src/pages/SubcategoryPage.tsx - (Optional - redirect to CategoryPage)
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SubcategoryPage: React.FC = () => {
  const { gender, categoryGroup, subCategory } = useParams<{
    gender?: string;
    categoryGroup?: string;
    subCategory?: string;
  }>();

  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to CategoryPage with the correct slug
    const slug = subCategory || categoryGroup || gender;
    if (slug) {
      navigate(`/category/${slug}`, { replace: true });
    } else {
      navigate('/products', { replace: true });
    }
  }, [gender, categoryGroup, subCategory, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
    </div>
  );
};

export default SubcategoryPage;