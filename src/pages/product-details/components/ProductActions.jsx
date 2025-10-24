import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import CreatePurchaseOrderModal from './CreatePurchaseOrderModal';
import SalesHistoryModal from './SalesHistoryModal';

const ProductActions = ({ product, onEdit, onDelete, onAddToCart, onAdjustStock, stats }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPO, setShowPO] = useState(false);
  const [showSales, setShowSales] = useState(false);

  const formatted = useMemo(() => {
    const revenue = Number(stats?.revenue || 0);
    const lastSold = stats?.lastSold ? new Date(stats.lastSold) : null;
    return {
      totalSold: Number(stats?.totalSold || 0),
      revenue: `₱${revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      lastSold: lastSold ? lastSold.toLocaleDateString() : '-',
      daysInStock: stats?.daysInStock ?? '-',
    };
  }, [stats]);

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onDelete(product?.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product);
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-body font-semibold text-sm text-foreground mb-3 flex items-center space-x-2">
          <Icon name="Zap" size={16} />
          <span>Quick Actions</span>
        </h3>
        
        <div className="space-y-2">
          <Button
            variant="default"
            onClick={handleAddToCart}
            iconName="ShoppingCart"
            iconPosition="left"
            iconSize={16}
            fullWidth
            disabled={product?.stock === 0}
          >
            {product?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
          
          <Button
            variant="outline"
            onClick={onEdit}
            iconName="Edit"
            iconPosition="left"
            iconSize={16}
            fullWidth
          >
            Edit Product
          </Button>
        </div>
      </div>
      {/* Inventory Actions */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-body font-semibold text-sm text-foreground mb-3 flex items-center space-x-2">
          <Icon name="Package" size={16} />
          <span>Inventory Management</span>
        </h3>
        
        <div className="space-y-2">
          <Button
            variant="outline"
            iconName="Plus"
            iconPosition="left"
            iconSize={16}
            fullWidth
            onClick={onAdjustStock}
          >
            Adjust Stock
          </Button>
          
          <Button
            variant="outline"
            iconName="Truck"
            iconPosition="left"
            iconSize={16}
            fullWidth
            onClick={() => setShowPO(true)}
          >
            Create Purchase Order
          </Button>
          
          <Button
            variant="outline"
            iconName="BarChart3"
            iconPosition="left"
            iconSize={16}
            fullWidth
            onClick={() => setShowSales(true)}
          >
            View Sales History
          </Button>
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="bg-card border border-destructive/20 rounded-lg p-4">
        <h3 className="font-body font-semibold text-sm text-destructive mb-3 flex items-center space-x-2">
          <Icon name="AlertTriangle" size={16} />
          <span>Danger Zone</span>
        </h3>
        
        {!showDeleteConfirm ? (
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            iconName="Trash2"
            iconPosition="left"
            iconSize={16}
            fullWidth
          >
            Delete Product
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Icon name="AlertTriangle" size={16} className="text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-body text-destructive font-semibold">
                    Confirm Deletion
                  </p>
                  <p className="text-xs font-caption text-destructive/80 mt-1">
                    This action cannot be undone. The product will be permanently removed from your inventory.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                size="sm"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                loading={isProcessing}
                size="sm"
                fullWidth
              >
                Delete Forever
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Product Stats */}
      <div className="bg-muted rounded-lg p-4">
        <h3 className="font-body font-semibold text-sm text-foreground mb-3 flex items-center space-x-2">
          <Icon name="TrendingUp" size={16} />
          <span>Product Statistics</span>
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-caption text-muted-foreground">Total Sales:</span>
            <span className="text-sm font-body text-foreground font-semibold">{formatted.totalSold} units</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-caption text-muted-foreground">Revenue Generated:</span>
            <span className="text-sm font-body text-success font-semibold">{formatted.revenue}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-caption text-muted-foreground">Last Sold:</span>
            <span className="text-sm font-body text-foreground">{formatted.lastSold}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-caption text-muted-foreground">Days in Stock:</span>
            <span className="text-sm font-body text-foreground">{formatted.daysInStock} days</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreatePurchaseOrderModal
        isOpen={showPO}
        onClose={() => setShowPO(false)}
        productId={product?.id}
        onCreated={() => setShowPO(false)}
      />
      <SalesHistoryModal
        isOpen={showSales}
        onClose={() => setShowSales(false)}
        productId={product?.id}
      />
    </div>
  );
};

export default ProductActions;