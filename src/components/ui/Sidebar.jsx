import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ isCollapsed = false, onToggle }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      description: 'Business overview and metrics'
    },
    {
      label: 'Point of Sale',
      path: '/point-of-sale',
      icon: 'ShoppingCart',
      description: 'Process transactions and sales'
    },
    {
      label: 'Inventory',
      path: '/inventory-management',
      icon: 'Package',
      description: 'Manage products and stock',
      subItems: [
        {
          label: 'Product Details',
          path: '/product-details',
          icon: 'Info'
        }
      ]
    },
    {
      label: 'Reports',
      path: '/sales-reports',
      icon: 'BarChart3',
      description: 'Analytics and insights'
    }
  ];

  const isActiveRoute = (path) => {
    if (path === '/inventory-management') {
      return location?.pathname === path || location?.pathname === '/product-details';
    }
    return location?.pathname === path;
  };

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
    if (onToggle) onToggle();
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location?.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e?.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Bike" size={20} color="white" />
            </div>
            <h2 className="font-heading font-bold text-lg text-foreground">Jolens BikeShop</h2>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden lg:flex"
          iconName={isCollapsed ? "ChevronRight" : "ChevronLeft"}
          iconSize={20}
        >
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems?.map((item) => (
          <div key={item?.path}>
            <Link
              to={item?.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-body text-sm transition-smooth group ${
                isActiveRoute(item?.path)
                  ? 'bg-primary text-primary-foreground shadow-subtle'
                  : 'text-foreground hover:bg-muted hover:text-foreground'
              }`}
              title={isCollapsed ? item?.label : ''}
            >
              <Icon 
                name={item?.icon} 
                size={20} 
                className={`flex-shrink-0 ${
                  isActiveRoute(item?.path) 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground group-hover:text-foreground'
                }`}
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item?.label}</div>
                  {item?.description && (
                    <div className="text-xs opacity-75 truncate">{item?.description}</div>
                  )}
                </div>
              )}
            </Link>

            {/* Sub-items for Inventory */}
            {item?.subItems && !isCollapsed && isActiveRoute(item?.path) && (
              <div className="ml-6 mt-1 space-y-1">
                {item?.subItems?.map((subItem) => (
                  <Link
                    key={subItem?.path}
                    to={subItem?.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-body text-sm transition-smooth ${
                      location?.pathname === subItem?.path
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon name={subItem?.icon} size={16} />
                    <span>{subItem?.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border">
        {!isCollapsed && (
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Zap" size={16} className="text-accent" />
              <span className="font-body font-medium text-sm text-foreground">Quick Tip</span>
            </div>
            <p className="font-caption text-xs text-muted-foreground">
              Use Ctrl+K to quickly search for products and customers.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex lg:fixed lg:top-15 lg:bottom-0 lg:left-0 lg:z-900 lg:flex-col bg-card border-r border-border shadow-subtle transition-smooth ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-1100">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          ></div>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border shadow-raised">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile Sidebar Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleMobileToggle}
        className="lg:hidden fixed bottom-4 right-4 z-1000 bg-primary text-primary-foreground shadow-raised"
        iconName="Menu"
        iconSize={20}
      >
        <span className="sr-only">Toggle navigation menu</span>
      </Button>
    </>
  );
};

export default Sidebar;