import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import API_ENDPOINTS from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isCollapsed = false, onToggle, mobileOpen = false, onMobileToggle }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(mobileOpen);
  const [expandedItems, setExpandedItems] = useState({});
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const { userRole, user } = useAuth();

  // Sync with parent-controlled mobileOpen prop
  useEffect(() => {
    setIsMobileOpen(mobileOpen);
  }, [mobileOpen]);

  // Debug logging
  useEffect(() => {
    console.log('Current user:', user);
    console.log('User role:', userRole);
  }, [user, userRole]);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      description: 'Business overview and metrics'
    },
    // Manager-only menu item
    ...(userRole === 'Manager' ? [{
      label: 'Management',
      path: '/management',
      icon: 'Settings',
      description: 'Manage store operations',
      subItems: [
        {
          label: 'Categories',
          path: '/management/categories',
          icon: 'Tag'
        },
        {
          label: 'Brands',
          path: '/management/brands',
          icon: 'Bookmark'
        },
        {
          label: 'Suppliers',
          path: '/management/suppliers',
          icon: 'Truck'
        },
        {
          label: 'Employees',
          path: '/management/employees',
          icon: 'Users'
        },
        {
          label: 'Attendance',
          path: '/management/attendance',
          icon: 'Calendar'
        }
      ]
    }] : []),
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
      label: 'Orders',
      path: '/orders/pending',
      icon: 'ClipboardList',
      description: 'Manage pending orders'
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
    if (path === '/management') {
      return location?.pathname.startsWith('/management');
    }
    return location?.pathname === path;
  };

  const handleMobileToggle = () => {
    const newState = !isMobileOpen;
    setIsMobileOpen(newState);
    if (onMobileToggle) onMobileToggle(newState);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location?.pathname]);

  // Fetch pending orders count periodically
  useEffect(() => {
    let timer;
    const load = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.SALES}?status=Pending`);
        if (res.ok) {
          const data = await res.json();
          const count = Array.isArray(data) ? data.length : (typeof data?.total === 'number' ? data.total : (Array.isArray(data?.data) ? data.data.length : 0));
          setPendingCount(count || 0);
        }
      } catch {}
      timer = setTimeout(load, 30000);
    };
    load();
    return () => { if (timer) clearTimeout(timer); };
  }, []);

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
            <h2 className="font-heading font-bold text-lg text-foreground">Jolen's Bicycle Supply</h2>
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
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems?.map((item) => {
          const isExpanded = expandedItems[item?.path];
          const isActive = isActiveRoute(item?.path);
          const hasSubItems = item?.subItems && item?.subItems?.length > 0;
          
          return (
            <div key={item?.path}>
              {hasSubItems ? (
                // For items with subItems, use a button that handles expansion
                <button
                  onClick={() => setExpandedItems(prev => ({ ...prev, [item?.path]: !isExpanded }))}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-body text-sm transition-smooth group ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-subtle'
                      : 'text-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={isCollapsed ? item?.label : ''}
                >
                  <Icon 
                    name={item?.icon} 
                    size={20} 
                    className={`flex-shrink-0 ${
                      isActive 
                        ? 'text-primary-foreground' 
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium">{item?.label}</div>
                        {item?.description && (
                          <div className="text-xs opacity-75 truncate">{item?.description}</div>
                        )}
                      </div>
                      {/* Pending badge for Orders */}
                      {item?.path === '/orders/pending' && (
                        <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-2 text-xs rounded-full bg-accent text-accent-foreground border border-border flex-shrink-0">
                          {pendingCount}
                        </span>
                      )}
                      {/* Chevron indicator - makes it clear it's expandable */}
                      <Icon 
                        name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                        size={16}
                        className={`flex-shrink-0 transition-transform ${
                          isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      />
                    </>
                  )}
                </button>
              ) : (
                // For items without subItems, use a link
                <Link
                  to={item?.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-body text-sm transition-smooth group ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-subtle'
                      : 'text-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={isCollapsed ? item?.label : ''}
                >
                  <Icon 
                    name={item?.icon} 
                    size={20} 
                    className={`flex-shrink-0 ${
                      isActive 
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
                  {/* Pending badge for Orders */}
                  {!isCollapsed && item?.path === '/orders/pending' && (
                    <div className="ml-auto">
                      <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-2 text-xs rounded-full bg-accent text-accent-foreground border border-border">
                        {pendingCount}
                      </span>
                    </div>
                  )}
                </Link>
              )}

              {/* Sub-items - visible when expanded and not collapsed */}
              {!isCollapsed && hasSubItems && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item?.subItems?.map((subItem) => {
                    const isSubActive = location?.pathname === subItem?.path;
                    return (
                      <Link
                        key={subItem?.path}
                        to={subItem?.path}
                        onClick={(e) => {
                          // Prevent event bubbling to prevent parent collapse
                          e.stopPropagation();
                        }}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-body text-sm transition-smooth group relative ${
                          isSubActive
                            ? 'text-primary font-medium bg-primary/10'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        title={isCollapsed ? subItem?.label : ''}
                      >
                        {/* Left accent line for active subpage */}
                        {isSubActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r" />
                        )}
                        <Icon name={subItem?.icon} size={16} className={isSubActive ? 'text-primary' : ''} />
                        <span>{subItem?.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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
      <aside className={`hidden lg:flex lg:fixed lg:top-15 lg:bottom-0 lg:left-0 lg:z-40 lg:flex-col bg-card border-r border-border shadow-subtle transition-all duration-300 ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay and Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          ></div>
          
          {/* Sidebar Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border shadow-lg overflow-y-auto">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;