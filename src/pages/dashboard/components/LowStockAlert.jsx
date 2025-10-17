import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LowStockAlert = () => {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const lowStockItems = [
    {
      id: 1,
      name: "Trek Domane AL 2",
      sku: "TRK-DOM-AL2-BLK",
      currentStock: 2,
      minStock: 5,
      category: "Road Bikes",
      supplier: "Trek Bicycle Corporation",
      lastOrdered: "2023-08-15",
      priority: "high"
    },
    {
      id: 2,
      name: "Specialized Helmet - Adult",
      sku: "SPEC-HLM-ADT-RED",
      currentStock: 3,
      minStock: 10,
      category: "Safety Gear",
      supplier: "Specialized Equipment",
      lastOrdered: "2023-08-10",
      priority: "medium"
    },
    {
      id: 3,
      name: "Shimano Brake Pads",
      sku: "SHIM-BRK-PAD-105",
      currentStock: 1,
      minStock: 15,
      category: "Components",
      supplier: "Shimano Inc",
      lastOrdered: "2023-08-05",
      priority: "high"
    },
    {
      id: 4,
      name: "Continental Tire 700x25c",
      sku: "CONT-TIR-700-25",
      currentStock: 4,
      minStock: 12,
      category: "Tires",
      supplier: "Continental AG",
      lastOrdered: "2023-08-12",
      priority: "medium"
    }
  ];

  const visibleAlerts = lowStockItems?.filter(item => !dismissedAlerts?.has(item?.id));

  const handleDismiss = (itemId) => {
    setDismissedAlerts(prev => new Set([...prev, itemId]));
  };

  const handleReorder = (item) => {
    console.log('Reorder item:', item);
    // Navigate to reorder functionality
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-destructive bg-destructive/10';
      case 'medium':
        return 'text-warning bg-warning/10';
      case 'low':
        return 'text-muted-foreground bg-muted';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return 'AlertTriangle';
      case 'medium':
        return 'AlertCircle';
      case 'low':
        return 'Info';
      default:
        return 'Info';
    }
  };

  if (visibleAlerts?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="CheckCircle" size={20} className="text-success" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Stock Status</h3>
        </div>
        <div className="text-center py-8">
          <Icon name="Package" size={48} className="text-success mx-auto mb-4" />
          <p className="font-body text-foreground mb-2">All items are well stocked!</p>
          <p className="font-caption text-sm text-muted-foreground">No low stock alerts at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="AlertTriangle" size={20} className="text-warning" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Low Stock Alerts</h3>
          <span className="bg-warning/20 text-warning px-2 py-1 rounded-full font-data text-xs font-medium">
            {visibleAlerts?.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName="Settings"
          iconPosition="left"
          onClick={() => console.log('Configure alerts')}
        >
          Configure
        </Button>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {visibleAlerts?.map((item) => (
          <div
            key={item?.id}
            className="flex items-center space-x-4 p-4 bg-muted/30 border border-border/50 rounded-lg hover:bg-muted/50 transition-smooth"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPriorityColor(item?.priority)}`}>
              <Icon name={getPriorityIcon(item?.priority)} size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-body font-medium text-foreground truncate">
                  {item?.name}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="font-data text-sm text-destructive font-semibold">
                    {item?.currentStock} left
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <p className="font-caption text-xs text-muted-foreground">
                  SKU: {item?.sku}
                </p>
                <p className="font-caption text-xs text-muted-foreground">
                  Min: {item?.minStock}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-caption text-xs text-muted-foreground">
                  {item?.category} • Last ordered: {item?.lastOrdered}
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="xs"
                    iconName="ShoppingCart"
                    iconPosition="left"
                    onClick={() => handleReorder(item)}
                  >
                    Reorder
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    iconName="X"
                    onClick={() => handleDismiss(item?.id)}
                  >
                    <span className="sr-only">Dismiss alert</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="font-caption text-xs text-muted-foreground">
            Last updated: {new Date()?.toLocaleTimeString()}
          </p>
          <Button
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
            iconPosition="left"
            onClick={() => console.log('Refresh alerts')}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert;