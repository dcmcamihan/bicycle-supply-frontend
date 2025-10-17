import React from 'react';
import Icon from '../../../components/AppIcon';

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-raised">
          <Icon name="Bike" size={32} color="white" />
        </div>
      </div>

      {/* Company Name */}
      <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
        Jolens BikeShop
      </h1>

      {/* Subtitle */}
      <p className="font-body text-muted-foreground text-lg mb-2">
        Retail Management System
      </p>

      {/* Welcome Message */}
      <p className="font-caption text-sm text-muted-foreground max-w-sm mx-auto">
        Sign in to your account to access inventory management, point of sale, and business analytics
      </p>
    </div>
  );
};

export default LoginHeader;