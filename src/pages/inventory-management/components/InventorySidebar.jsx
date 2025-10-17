import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InventorySidebar = ({ 
  summaryData, 
  lowStockItems, 
  recentMovements,
  onReorderClick,
  onViewMovements 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      time: 'short'
    });
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'sale':
        return { icon: 'TrendingDown', color: 'text-destructive' };
      case 'restock':
        return { icon: 'TrendingUp', color: 'text-success' };
      case 'adjustment':
        return { icon: 'Edit', color: 'text-warning' };
      case 'return':
        return { icon: 'RotateCcw', color: 'text-secondary' };
      default:
        return { icon: 'Package', color: 'text-muted-foreground' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Inventory Summary */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="BarChart3" size={20} className="text-primary" />
          <h3 className="font-heading font-semibold text-lg text-foreground">
            Inventory Summary
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-body text-sm text-muted-foreground">Total Products</span>
            <span className="font-body font-semibold text-lg text-foreground">
              {summaryData?.totalProducts?.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-body text-sm text-muted-foreground">Total Value</span>
            <span className="font-body font-semibold text-lg text-foreground">
              {formatCurrency(summaryData?.totalValue)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-body text-sm text-muted-foreground">Low Stock Items</span>
            <span className="font-body font-semibold text-lg text-warning">
              {summaryData?.lowStockCount}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-body text-sm text-muted-foreground">Out of Stock</span>
            <span className="font-body font-semibold text-lg text-destructive">
              {summaryData?.outOfStockCount}
            </span>
          </div>
        </div>
      </div>
      {/* Low Stock Alerts */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={20} className="text-warning" />
            <h3 className="font-heading font-semibold text-lg text-foreground">
              Low Stock Alerts
            </h3>
          </div>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            {lowStockItems?.length} items
          </span>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {lowStockItems?.map((item) => (
            <div key={item?.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="font-body font-medium text-sm text-foreground truncate">
                  {item?.name}
                </p>
                <p className="font-caption text-xs text-muted-foreground">
                  Stock: {item?.stock} / Reorder: {item?.reorderLevel}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReorderClick(item)}
                iconName="Plus"
                iconSize={14}
              >
                Reorder
              </Button>
            </div>
          ))}
        </div>
        
        {lowStockItems?.length === 0 && (
          <div className="text-center py-6">
            <Icon name="CheckCircle" size={32} className="text-success mx-auto mb-2" />
            <p className="font-body text-sm text-muted-foreground">
              All items are well stocked
            </p>
          </div>
        )}
      </div>
      {/* Recent Stock Movements */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="Activity" size={20} className="text-secondary" />
            <h3 className="font-heading font-semibold text-lg text-foreground">
              Recent Movements
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewMovements}
            iconName="ExternalLink"
            iconSize={14}
          >
            View All
          </Button>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {recentMovements?.map((movement) => {
            const { icon, color } = getMovementIcon(movement?.type);
            return (
              <div key={movement?.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${color}`}>
                  <Icon name={icon} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-sm text-foreground truncate">
                    {movement?.productName}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="font-caption text-xs text-muted-foreground">
                      {movement?.type?.charAt(0)?.toUpperCase() + movement?.type?.slice(1)}
                    </span>
                    <span className="font-caption text-xs text-muted-foreground">
                      •
                    </span>
                    <span className={`font-caption text-xs font-medium ${
                      movement?.quantity > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {movement?.quantity > 0 ? '+' : ''}{movement?.quantity}
                    </span>
                  </div>
                </div>
                <span className="font-caption text-xs text-muted-foreground">
                  {formatDate(movement?.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
        
        {recentMovements?.length === 0 && (
          <div className="text-center py-6">
            <Icon name="Package" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="font-body text-sm text-muted-foreground">
              No recent movements
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventorySidebar;