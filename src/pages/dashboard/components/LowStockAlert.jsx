import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import API_ENDPOINTS from '../../../config/api';

const LowStockAlert = () => {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.PRODUCTS);
      const products = await res.json();
      const mapped = await Promise.all(products.map(async (p) => {
        let qoh = 0;
        try {
          const qres = await fetch(`${API_ENDPOINTS.PRODUCT(p.product_id)}/quantity-on-hand`);
          if (qres.ok) qoh = await qres.json();
        } catch {}
        const min = p.reorder_level ?? 3;
        const isLow = qoh <= min;
        if (!isLow) return null;
        return {
          id: p.product_id,
          name: p.product_name,
          sku: String(p.product_id),
          currentStock: Number(qoh) || 0,
          minStock: Number(min) || 0,
          category: p.category_code,
          priority: qoh <= Math.max(1, Math.floor((min || 1) / 2)) ? 'high' : 'medium',
        };
      }));
      setItems(mapped.filter(Boolean));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLowStock(); }, []);

  const visibleAlerts = items?.filter(item => !dismissedAlerts?.has(item?.id));

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

  if (!loading && visibleAlerts?.length === 0) {
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
            {loading ? '...' : visibleAlerts?.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName="Settings"
          iconPosition="left"
          onClick={fetchLowStock}
        >
          Refresh
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
                  {item?.category}
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