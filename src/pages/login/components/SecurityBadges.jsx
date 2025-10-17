import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      label: 'SSL Secured',
      description: '256-bit encryption'
    },
    {
      icon: 'Lock',
      label: 'PCI Compliant',
      description: 'Payment security'
    },
    {
      icon: 'Eye',
      label: 'Privacy Protected',
      description: 'GDPR compliant'
    }
  ];

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex flex-wrap justify-center items-center gap-6">
        {securityFeatures?.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2 text-muted-foreground">
            <Icon name={feature?.icon} size={16} className="text-success" />
            <div className="text-center sm:text-left">
              <p className="font-caption text-xs font-medium">{feature?.label}</p>
              <p className="font-caption text-xs opacity-75">{feature?.description}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Copyright */}
      <div className="text-center mt-4">
        <p className="font-caption text-xs text-muted-foreground">
          © {new Date()?.getFullYear()} Jolens BikeShop. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SecurityBadges;