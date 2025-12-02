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

  // Auto-expand parent when on a subpage
  useEffect(() => {
    navigationItems.forEach((item) => {
      if (item?.subItems) {
        const isSubActive = item?.subItems?.some(sub => location?.pathname === sub?.path);
        if (isSubActive) {
          setExpandedItems(prev => ({ ...prev, [item?.path]: true }));
        }
      }
    });
  }, [location?.pathname]);

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
      <div className="flex items-center justify-between px-2 py-3 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0 shadow-subtle">
              <Icon name="Bike" size={18} color="white" />
            </div>
            <h2 className="font-heading font-bold text-sm text-foreground truncate">Jolen's Bicycle</h2>
          </div>
        )}
        
        {isCollapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0 shadow-subtle mx-auto">
            <Icon name="Bike" size={18} color="white" />
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden lg:flex flex-shrink-0"
          iconName={isCollapsed ? "ChevronRight" : "ChevronLeft"}
          iconSize={18}
        >
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems?.map((item) => {
          const isExpanded = expandedItems[item?.path];
          const isActive = isActiveRoute(item?.path);
          const hasSubItems = item?.subItems && item?.subItems?.length > 0;
          
          return (
            <div key={item?.path} className="space-y-0">
              <div className="flex items-center gap-0">
                <Link
                  to={item?.path}
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-smooth group relative ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-subtle'
                      : 'text-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={isCollapsed ? item?.label : ''}
                >
                  {/* Left accent bar for main page */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r" />
                  )}
                  
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
                        <div className="text-xs opacity-70 truncate">{item?.description}</div>
                      )}
                    </div>
                  )}
                  
                  {/* Pending badge for Orders */}
                  {!isCollapsed && item?.path === '/orders/pending' && (
                    <div className="ml-auto flex-shrink-0">
                      <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-2 text-xs rounded-full bg-accent text-accent-foreground border border-border">
                        {pendingCount}
                      </span>
                    </div>
                  )}
                  
                  {/* Expand/Collapse chevron for items with subItems */}
                  {!isCollapsed && hasSubItems && (
                    <Icon 
                      name="ChevronRight" 
                      size={16}
                      className={`flex-shrink-0 ml-auto transition-transform duration-200 text-muted-foreground group-hover:text-foreground ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                </Link>
                
                {/* Toggle button for collapsed state */}
                {isCollapsed && hasSubItems && (
                  <button
                    onClick={() => setExpandedItems(prev => ({ ...prev, [item?.path]: !isExpanded }))}
                    className={`p-1 mr-1 rounded transition-smooth ${
                      isActive ? 'text-primary-foreground hover:bg-primary/80' : 'text-muted-foreground hover:bg-muted'
                    }`}
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    <Icon name={isExpanded ? "ChevronDown" : "ChevronRight"} size={14} />
                  </button>
                )}
              </div>

              {/* Sub-items */}
              {hasSubItems && isExpanded && !isCollapsed && (
                <div className="ml-2 mt-1 space-y-0.5 border-l-2 border-muted pl-3">
                  {item?.subItems?.map((subItem) => {
                    const isSubActive = location?.pathname === subItem?.path;
                    return (
                      <Link
                        key={subItem?.path}
                        to={subItem?.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg font-body text-sm transition-smooth group relative ${
                          isSubActive
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                        title={isCollapsed ? subItem?.label : ''}
                      >
                        {/* Left accent indicator for subpage */}
                        {isSubActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />
                        )}
                        
                        <Icon 
                          name={subItem?.icon} 
                          size={16}
                          className={isSubActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
                        />
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
      <div className="px-2 py-3 border-t border-border">
        {!isCollapsed && (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-3 hover:from-primary/15 hover:to-primary/10 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Zap" size={16} className="text-primary flex-shrink-0" />
              <span className="font-body font-semibold text-xs text-primary">Quick Tip</span>
            </div>
            <p className="font-caption text-xs text-muted-foreground leading-relaxed">
              Use Ctrl+K to quickly search for products and customers.
            </p>
          </div>
        )}
        {isCollapsed && (
          <button
            title="Quick Tips"
            className="w-full p-2 rounded-lg hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground"
          >
            <Icon name="Zap" size={18} className="mx-auto text-primary" />
          </button>
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