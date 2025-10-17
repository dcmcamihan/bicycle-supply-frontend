import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const UserMenu = ({ user = null, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const defaultUser = {
    name: 'John Doe',
    role: 'Store Manager',
    email: 'john@bikeshoppro.com',
    avatar: null
  };

  const currentUser = user || defaultUser;

  const menuItems = [
    {
      label: 'Profile Settings',
      icon: 'User',
      onClick: () => {
        console.log('Profile settings clicked');
        setIsOpen(false);
      }
    },
    {
      label: 'Preferences',
      icon: 'Settings',
      onClick: () => {
        console.log('Preferences clicked');
        setIsOpen(false);
      }
    },
    {
      label: 'Help & Support',
      icon: 'HelpCircle',
      onClick: () => {
        console.log('Help & Support clicked');
        setIsOpen(false);
      }
    }
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      console.log('Logout clicked');
    }
    setIsOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef?.current && 
        !menuRef?.current?.contains(event?.target) &&
        buttonRef?.current &&
        !buttonRef?.current?.contains(event?.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event?.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef?.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event?.key === 'Enter' || event?.key === ' ') {
      event?.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="flex items-center space-x-2 px-3"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
          {currentUser?.avatar ? (
            <img 
              src={currentUser?.avatar} 
              alt={currentUser?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon name="User" size={16} color="white" />
          )}
        </div>
        <span className="hidden sm:block font-body text-sm text-foreground">
          {currentUser?.name}
        </span>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-raised z-1200 backdrop-glass"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          {/* User Info Section */}
          <div className="p-3 border-b border-border">
            <p className="font-body font-semibold text-sm text-popover-foreground truncate">
              {currentUser?.name}
            </p>
            <p className="font-caption text-xs text-muted-foreground">
              {currentUser?.role}
            </p>
            <p className="font-caption text-xs text-muted-foreground truncate">
              {currentUser?.email}
            </p>
          </div>
          
          {/* Menu Items */}
          <div className="py-2" role="none">
            {menuItems?.map((item, index) => (
              <button
                key={index}
                onClick={item?.onClick}
                className="w-full px-3 py-2 text-left font-body text-sm text-popover-foreground hover:bg-muted transition-micro flex items-center space-x-2 focus:outline-none focus:bg-muted"
                role="menuitem"
                tabIndex={0}
              >
                <Icon name={item?.icon} size={16} className="text-muted-foreground" />
                <span>{item?.label}</span>
              </button>
            ))}
          </div>
          
          {/* Logout Section */}
          <div className="border-t border-border py-2" role="none">
            <button 
              onClick={handleLogout}
              className="w-full px-3 py-2 text-left font-body text-sm text-destructive hover:bg-muted transition-micro flex items-center space-x-2 focus:outline-none focus:bg-muted"
              role="menuitem"
              tabIndex={0}
            >
              <Icon name="LogOut" size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;