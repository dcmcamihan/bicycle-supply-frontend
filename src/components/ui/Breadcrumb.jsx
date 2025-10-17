import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = ({ customItems = null }) => {
  const location = useLocation();
  
  const routeMap = {
    '/dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
    '/point-of-sale': { label: 'Point of Sale', icon: 'ShoppingCart' },
    '/inventory-management': { label: 'Inventory Management', icon: 'Package' },
    '/product-details': { label: 'Product Details', icon: 'Info', parent: '/inventory-management' },
    '/sales-reports': { label: 'Sales Reports', icon: 'BarChart3' },
    '/login': { label: 'Login', icon: 'LogIn' }
  };

  const generateBreadcrumbs = () => {
    if (customItems) {
      return customItems;
    }

    const currentRoute = routeMap?.[location?.pathname];
    if (!currentRoute) return [];

    const breadcrumbs = [];
    
    // Add parent if exists
    if (currentRoute?.parent) {
      const parentRoute = routeMap?.[currentRoute?.parent];
      if (parentRoute) {
        breadcrumbs?.push({
          label: parentRoute?.label,
          path: currentRoute?.parent,
          icon: parentRoute?.icon
        });
      }
    }
    
    // Add current route
    breadcrumbs?.push({
      label: currentRoute?.label,
      path: location?.pathname,
      icon: currentRoute?.icon,
      current: true
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs?.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm font-body mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs?.map((item, index) => (
          <li key={item?.path} className="flex items-center">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={16} 
                className="text-muted-foreground mx-2" 
              />
            )}
            
            {item?.current ? (
              <span className="flex items-center space-x-2 text-foreground font-medium">
                <Icon name={item?.icon} size={16} className="text-muted-foreground" />
                <span>{item?.label}</span>
              </span>
            ) : (
              <Link
                to={item?.path}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-micro"
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;