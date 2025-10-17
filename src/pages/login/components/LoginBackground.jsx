import React from 'react';
import Image from '../../../components/AppImage';

const LoginBackground = () => {
  return (
    <div className="hidden lg:flex lg:flex-1 lg:relative lg:overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Modern bicycle shop interior with various bikes displayed"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/80"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
        <div className="max-w-md">
          <h2 className="font-heading font-bold text-4xl mb-6 leading-tight">
            Streamline Your Bicycle Shop Operations
          </h2>
          
          <p className="font-body text-lg mb-8 text-white/90 leading-relaxed">
            Manage inventory, process sales, and grow your business with our comprehensive retail management platform designed specifically for bicycle shops.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              <span className="font-body text-white/90">Real-time inventory tracking</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              <span className="font-body text-white/90">Integrated point-of-sale system</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              <span className="font-body text-white/90">Comprehensive sales analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginBackground;