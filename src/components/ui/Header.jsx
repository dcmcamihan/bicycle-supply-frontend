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
        // Get the timestamp from 24 hours ago for recent activities
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        // fetch sales, stockouts and stock adjustments to show recent activity
        const [salesRes, stockoutRes, adjustmentsRes] = await Promise.all([
          fetch(API_ENDPOINTS.SALES),
          fetch(API_ENDPOINTS.STOCKOUTS),
          fetch(API_ENDPOINTS.STOCK_ADJUSTMENTS)
        ]);

        if (!salesRes.ok || !stockoutRes.ok || !adjustmentsRes.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const sales = await salesRes.json();
        const stockouts = await stockoutRes.json();
        const adjustmentsResponse = await adjustmentsRes.json();
        // Handle the paginated response structure for adjustments
        const adjustments = adjustmentsResponse.data || [];

        const saleItems = sales
          .filter(s => s.sale_date && new Date(s.sale_date) > twentyFourHoursAgo)
          .map(s => ({
            id: `sale-${s.sale_id}`,
            type: 'sale',
            date: new Date(s.sale_date),
            icon: 'Receipt',
            title: `Sale #${s.sale_id}`,
            subtitle: s.status === 'Pending' ? 'Pending approval' : 'Sale completed',
            payload: { saleId: s.sale_id }
          }));

        const stockoutItems = stockouts
          .filter(st => st.stockout_date && new Date(st.stockout_date) > twentyFourHoursAgo)
          .map(st => ({
            id: `stockout-${st.stockout_id}`,
            type: 'stockout',
            date: new Date(st.stockout_date),
            icon: 'PackageMinus',
            title: `Stockout #${st.stockout_id}`,
            subtitle: st.remarks || `Reason: ${st.reason || 'Inventory adjustment'}`,
            payload: { stockoutId: st.stockout_id }
          }));

        const adjustItems = adjustments
          .filter(a => {
            const date = a.transaction_date ? new Date(a.transaction_date) : null;
            return date && date > twentyFourHoursAgo;
          })
          .map(a => {
            // Get the first detail if available
            const detail = a.details?.[0];
            return {
              id: `adj-${a.adjustment_id}`,
              type: 'adjustment',
              date: new Date(a.transaction_date),
              icon: 'Activity',
              title: a.remarks || `Stock Adjustment #${a.adjustment_id}`,
              subtitle: detail ? 
                `${detail.quantity > 0 ? '+' : ''}${detail.quantity} units (Product ${detail.product_id})` : 
                'Stock level adjusted',
              payload: { adjustment: a }
            };
          });

        // combine and sort by most recent
        const combined = [...saleItems, ...stockoutItems, ...adjustItems]
          .filter(i => i.date)
          .sort((a, b) => b.date - a.date);

        // keep top 10
        const top = combined.slice(0, 10).map(i => ({
          id: i.id,
          icon: i.icon,
          title: i.title,
          subtitle: i.subtitle,
          date: i.date,
          type: i.type,
          payload: i.payload,
          timeAgo: timeAgo(i.date)
        }));

        if (mounted) setNotifications(top);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    // Initial load
    load();

    // Refresh every 30 seconds instead of 60
    const t = setInterval(load, 30000);
    
    return () => { 
      mounted = false; 
      clearInterval(t); 
    };
  }, []);

  const timeAgo = (date) => {
    if (!date) return '';
    const ms = Date.now() - date.getTime();
    const sec = Math.floor(ms/1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec/60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min/60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr/24);
    return `${d}d ago`;
  };

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
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-medium text-white">{notifications.length}</span>
                </span>
              )}
              <span className="sr-only">Notifications ({notifications.length})</span>
            </Button>
            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-1100" onClick={() => setIsNotificationsOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-raised z-1200 backdrop-glass">
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <p className="font-body text-sm font-semibold">Notifications</p>
                    <span className="font-caption text-xs text-muted-foreground">{notifications.length || 'No'} recent {notifications.length === 1 ? 'activity' : 'activities'}</span>
                  </div>
                  <div className="max-h-80 overflow-auto divide-y divide-border">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          <Icon name="Bell" size={24} className="mx-auto mb-2 text-muted-foreground/50" />
                          No recent activity
                        </div>
                      ) : notifications.map(n => (
                        <button 
                          key={n.id} 
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            // navigate depending on type
                            if (n.type === 'sale') navigate('/dashboard');
                            else if (n.type === 'stockout' || n.type === 'adjustment') navigate('/inventory-management');
                            else navigate('/dashboard');
                          }} 
                          className="w-full text-left p-3 flex items-start space-x-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                            n.type === 'sale' ? 'bg-success/10 text-success' :
                            n.type === 'stockout' ? 'bg-destructive/10 text-destructive' :
                            'bg-warning/10 text-warning'
                          }`}>
                            <Icon name={n.icon} size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-body text-sm text-popover-foreground truncate">{n.title}</p>
                              <p className="font-caption text-xs text-muted-foreground">{timeAgo(n.date)}</p>
                            </div>
                            <p className="font-caption text-xs text-muted-foreground truncate">{n.subtitle}</p>
                          </div>
                        </button>
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