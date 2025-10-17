import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActivityFeed = () => {
  const [filter, setFilter] = useState('all');

  const activities = [
    {
      id: 1,
      type: 'sale',
      title: 'New sale completed',
      description: 'Trek Mountain Bike sold to Sarah Johnson',
      amount: '₱1,299.99',
      timestamp: new Date(Date.now() - 300000),
      user: 'John Doe',
      icon: 'ShoppingCart',
      color: 'text-success bg-success/10'
    },
    {
      id: 2,
      type: 'inventory',
      title: 'Stock updated',
      description: 'Added 15 units of Specialized Helmets',
      timestamp: new Date(Date.now() - 900000),
      user: 'Mike Chen',
      icon: 'Package',
      color: 'text-primary bg-primary/10'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Low stock warning',
      description: 'Shimano Brake Pads running low (1 unit left)',
      timestamp: new Date(Date.now() - 1800000),
      user: 'System',
      icon: 'AlertTriangle',
      color: 'text-warning bg-warning/10'
    },
    {
      id: 4,
      type: 'return',
      title: 'Return processed',
      description: 'Road bike returned by Emily Davis',
      amount: '-₱899.99',
      timestamp: new Date(Date.now() - 3600000),
      user: 'Lisa Wang',
      icon: 'RotateCcw',
      color: 'text-accent bg-accent/10'
    },
    {
      id: 5,
      type: 'maintenance',
      title: 'Service completed',
      description: 'Bike tune-up for customer #1234',
      amount: '₱45.00',
      timestamp: new Date(Date.now() - 7200000),
      user: 'Tom Wilson',
      icon: 'Wrench',
      color: 'text-secondary bg-secondary/10'
    },
    {
      id: 6,
      type: 'inventory',
      title: 'New product added',
      description: 'Electric Bike Model X added to catalog',
      timestamp: new Date(Date.now() - 10800000),
      user: 'Sarah Kim',
      icon: 'Plus',
      color: 'text-primary bg-primary/10'
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Activities', icon: 'Activity' },
    { value: 'sale', label: 'Sales', icon: 'ShoppingCart' },
    { value: 'inventory', label: 'Inventory', icon: 'Package' },
    { value: 'alert', label: 'Alerts', icon: 'AlertTriangle' }
  ];

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities?.filter(activity => activity?.type === filter);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return timestamp?.toLocaleDateString();
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Activity" size={20} className="text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Recent Activity</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName="Filter"
          iconPosition="left"
          onClick={() => console.log('Open filter options')}
        >
          Filter
        </Button>
      </div>
      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted rounded-lg p-1">
        {filterOptions?.map((option) => (
          <button
            key={option?.value}
            onClick={() => setFilter(option?.value)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md font-body text-sm transition-smooth ${
              filter === option?.value
                ? 'bg-card text-foreground shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={option?.icon} size={14} />
            <span className="hidden sm:inline">{option?.label}</span>
          </button>
        ))}
      </div>
      {/* Activity List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredActivities?.map((activity) => (
          <div
            key={activity?.id}
            className="flex items-start space-x-4 p-3 hover:bg-muted/50 rounded-lg transition-smooth"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity?.color}`}>
              <Icon name={activity?.icon} size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-body font-medium text-foreground">
                  {activity?.title}
                </h4>
                {activity?.amount && (
                  <span className={`font-data text-sm font-semibold ${
                    activity?.amount?.startsWith('-') ? 'text-destructive' : 'text-success'
                  }`}>
                    {activity?.amount}
                  </span>
                )}
              </div>
              
              <p className="font-caption text-sm text-muted-foreground mb-2">
                {activity?.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="font-caption text-xs text-muted-foreground">
                  by {activity?.user}
                </span>
                <span className="font-caption text-xs text-muted-foreground">
                  {formatTime(activity?.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredActivities?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Inbox" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="font-body text-muted-foreground mb-2">No activities found</p>
          <p className="font-caption text-sm text-muted-foreground">
            Try adjusting your filter settings
          </p>
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          fullWidth
          iconName="ExternalLink"
          iconPosition="right"
          onClick={() => console.log('View full activity log')}
        >
          View Full Activity Log
        </Button>
      </div>
    </div>
  );
};

export default ActivityFeed;