import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'New Sale',
      description: 'Start a new customer transaction',
      icon: 'ShoppingCart',
      color: 'bg-primary text-primary-foreground',
      onClick: () => navigate('/point-of-sale')
    },
    {
      title: 'Add Product',
      description: 'Add new inventory item',
      icon: 'Plus',
      color: 'bg-success text-success-foreground',
      onClick: () => navigate('/inventory-management')
    },
    {
      title: 'Process Return',
      description: 'Handle customer returns',
      icon: 'RotateCcw',
      color: 'bg-warning text-warning-foreground',
      onClick: () => navigate('/returns/process')
    },
    {
      title: 'View Reports',
      description: 'Access sales analytics',
      icon: 'BarChart3',
      color: 'bg-accent text-accent-foreground',
      onClick: () => navigate('/sales-reports')
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="Zap" size={20} className="text-accent" />
        <h3 className="font-heading text-lg font-semibold text-foreground">Quick Actions</h3>
      </div>
      <div className="space-y-3">
        {actions?.map((action, index) => (
          <button
            key={index}
            onClick={action?.onClick}
            className="w-full p-4 bg-muted hover:bg-muted/80 rounded-lg transition-smooth text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action?.color} group-hover:scale-105 transition-transform`}>
                <Icon name={action?.icon} size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-body font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action?.title}
                </h4>
                <p className="font-caption text-sm text-muted-foreground">
                  {action?.description}
                </p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <Button
          variant="outline"
          fullWidth
          iconName="Settings"
          iconPosition="left"
          onClick={() => console.log('More actions clicked')}
        >
          More Actions
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;