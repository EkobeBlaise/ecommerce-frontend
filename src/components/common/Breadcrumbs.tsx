import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  path: string;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ name: 'Home', path: '/' }];
    
    let currentPath = '';
    for (const path of paths) {
      currentPath += `/${path}`;
      
      // Format the name for display
      let name = path.replace(/-/g, ' ');
      name = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      
      // Special case for product IDs (numeric IDs or long strings)
      if (path.match(/^\d+$/) || (path.length > 10 && path.startsWith('product'))) {
        name = 'Order Details';
      }
      
      breadcrumbs.push({ name, path: currentPath });
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  // Don't show breadcrumbs on home page
  if (breadcrumbs.length <= 1) return null;
  
  return (
    <nav className="bg-gray-50 dark:bg-gray-900/50 py-2 border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.path} className="flex items-center gap-1">
              {index === 0 ? (
                <Link to={crumb.path} className="text-gray-500 hover:text-pink-600 transition flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  <span className="hidden sm:inline">{crumb.name}</span>
                </Link>
              ) : index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 dark:text-gray-200 font-medium truncate max-w-[150px] sm:max-w-none">
                  {crumb.name}
                </span>
              ) : (
                <>
                  <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <Link to={crumb.path} className="text-gray-500 hover:text-pink-600 transition truncate max-w-[100px] sm:max-w-none">
                    {crumb.name}
                  </Link>
                </>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;
