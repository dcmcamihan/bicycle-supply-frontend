import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = ({ onSidebarToggle, user = null }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const location = useLocation();

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    // Logout logic would be implemented here
    console.log('Logout clicked');
    setIsUserMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const searchTerm = e?.target?.search?.value;
    console.log('Search:', searchTerm);
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
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            iconName="Bell"
            iconSize={20}
          >
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
            <span className="sr-only">Notifications</span>
          </Button>

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
                {user?.name || 'John Doe'}
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
                      {user?.name || 'John Doe'}
                    </p>
                    <p className="font-caption text-xs text-muted-foreground">
                      {user?.role || 'Store Manager'}
                    </p>
                    <p className="font-caption text-xs text-muted-foreground">
                      {user?.email || 'john@bikeshoppro.com'}
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