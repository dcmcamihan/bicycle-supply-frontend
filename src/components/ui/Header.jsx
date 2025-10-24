import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';
import API_ENDPOINTS from '../../config/api';

const Header = ({ onSidebarToggle, user = null }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user: ctxUser } = useAuth();
  const activeUser = user || ctxUser;

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Load basic notifications from recent sales and stockouts
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [salesRes, stockoutRes] = await Promise.all([
          fetch(API_ENDPOINTS.SALES),
          fetch(API_ENDPOINTS.STOCKOUTS)
        ]);
        const sales = salesRes.ok ? await salesRes.json() : [];
        const stockouts = stockoutRes.ok ? await stockoutRes.json() : [];
        const saleItems = (sales||[]).slice(-5).map(s => ({
          id: `sale-${s.sale_id}`,
          icon: 'Receipt',
          title: `Sale #${s.sale_id}`,
          subtitle: new Date(s.sale_date).toLocaleString(),
        }));
        const stockoutItems = (stockouts||[]).slice(-5).map(st => ({
          id: `stockout-${st.stockout_id}`,
          icon: 'PackageMinus',
          title: `Stockout #${st.stockout_id}`,
          subtitle: new Date(st.stockout_date).toLocaleString(),
        }));
        if (mounted) setNotifications([...stockoutItems, ...saleItems].slice(-8).reverse());
      } catch {
        // ignore
      }
    };
    load();
    const t = setInterval(load, 60000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const searchTerm = e?.target?.search?.value;
    if (searchTerm && searchTerm.trim().length > 0) {
      navigate(`/inventory-management?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-15 bg-card border-b border-border z-1000 shadow-subtle">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left Section - Logo and Sidebar Toggle */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="lg:hidden"
            iconName="Menu"
            iconSize={20}
          >
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Bike" size={20} color="white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-heading font-bold text-lg text-foreground">Jolens BikeShop</h1>
            </div>
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className={`relative transition-smooth ${isSearchFocused ? 'shadow-raised' : 'shadow-subtle'}`}>
              <Icon 
                name="Search" 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              />
              <input
                type="text"
                name="search"
                placeholder="Search products, SKUs, customers..."
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </form>
        </div>

        {/* Right Section - User Menu */}
        <div className="flex items-center space-x-3">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            iconName="Search"
            iconSize={20}
          >
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              iconName="Bell"
              iconSize={20}
              onClick={() => setIsNotificationsOpen(v => !v)}
            >
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
              <span className="sr-only">Notifications</span>
            </Button>
            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-1100" onClick={() => setIsNotificationsOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-raised z-1200 backdrop-glass">
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <p className="font-body text-sm font-semibold">Notifications</p>
                    <span className="font-caption text-xs text-muted-foreground">{notifications.length}</span>
                  </div>
                  <div className="max-h-80 overflow-auto divide-y divide-border">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground">No recent activity</div>
                    ) : notifications.map(n => (
                      <div key={n.id} className="p-3 flex items-start space-x-3 hover:bg-muted/50">
                        <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                          <Icon name={n.icon} size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-body text-sm text-popover-foreground truncate">{n.title}</p>
                          <p className="font-caption text-xs text-muted-foreground truncate">{n.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={handleUserMenuToggle}
              className="flex items-center space-x-2 px-3"
            >
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <span className="hidden sm:block font-body text-sm text-foreground">
                {(activeUser?.first_name || '') + (activeUser?.last_name ? ` ${activeUser.last_name}` : '') || 'Guest'}
              </span>
              <Icon 
                name="ChevronDown" 
                size={16} 
                className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
              />
            </Button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-1100" 
                  onClick={() => setIsUserMenuOpen(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-raised z-1200 backdrop-glass">
                  <div className="p-3 border-b border-border">
                    <p className="font-body font-semibold text-sm text-popover-foreground">
                      {(activeUser?.first_name || '') + (activeUser?.last_name ? ` ${activeUser.last_name}` : '') || 'Guest'}
                    </p>
                    <p className="font-caption text-xs text-muted-foreground">
                      {activeUser?.role || 'Employee'}
                    </p>
                    
                  </div>
                  
                  <div className="py-2">
                    <Link to="/settings/profile" onClick={() => setIsUserMenuOpen(false)} className="w-full px-3 py-2 text-left font-body text-sm text-popover-foreground hover:bg-muted transition-micro flex items-center space-x-2">
                      <Icon name="User" size={16} />
                      <span>Profile Settings</span>
                    </Link>
                    <Link to="/settings/preferences" onClick={() => setIsUserMenuOpen(false)} className="w-full px-3 py-2 text-left font-body text-sm text-popover-foreground hover:bg-muted transition-micro flex items-center space-x-2">
                      <Icon name="Settings" size={16} />
                      <span>Preferences</span>
                    </Link>
                    <Link to="/help-support" onClick={() => setIsUserMenuOpen(false)} className="w-full px-3 py-2 text-left font-body text-sm text-popover-foreground hover:bg-muted transition-micro flex items-center space-x-2">
                      <Icon name="HelpCircle" size={16} />
                      <span>Help & Support</span>
                    </Link>
                  </div>
                  
                  <div className="border-t border-border py-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left font-body text-sm text-destructive hover:bg-muted transition-micro flex items-center space-x-2"
                    >
                      <Icon name="LogOut" size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;