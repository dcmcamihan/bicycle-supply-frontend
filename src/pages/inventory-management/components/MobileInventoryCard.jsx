import React, { useState } from 'react';

import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const MobileInventoryCard = ({ 
  product, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDuplicate, 
  onDelete 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStockStatusColor = (stock, reorderLevel) => {
    if (stock === 0) return 'text-destructive bg-destructive/10';
    if (stock <= reorderLevel) return 'text-warning bg-warning/10';
    return 'text-success bg-success/10';
  };

  const getStockStatusText = (stock, reorderLevel) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= reorderLevel) return 'Low Stock';
    return 'In Stock';
  };

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
      year: 'numeric'
    });
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-subtle overflow-hidden transition-smooth ${
      isSelected ? 'ring-2 ring-primary ring-opacity-50' : ''
    }`}>
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect(product?.id, e?.target?.checked)}
            className="mt-1"
          />
          
          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={product?.image}
              alt={product?.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-body font-semibold text-base text-foreground truncate">
                  {product?.name}
                </h3>
                <p className="font-caption text-sm text-muted-foreground">
                  {product?.brand}
                </p>
                <p className="font-data text-sm text-muted-foreground">
                  SKU: {product?.sku}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
                iconSize={20}
                className="ml-2"
              />
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              getStockStatusColor(product?.stock, product?.reorderLevel)
            }`}>
              {getStockStatusText(product?.stock, product?.reorderLevel)}
            </span>
            
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
              {product?.category}
            </span>
          </div>
          
          <span className="font-body font-semibold text-lg text-foreground">
            {formatCurrency(product?.price)}
          </span>
        </div>
      </div>
      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-caption text-xs text-muted-foreground mb-1">Current Stock</p>
              <p className="font-body font-medium text-sm text-foreground">
                {product?.stock} units
              </p>
            </div>
            
            <div>
              <p className="font-caption text-xs text-muted-foreground mb-1">Reorder Level</p>
              <p className="font-body font-medium text-sm text-foreground">
                {product?.reorderLevel} units
              </p>
            </div>
            
            <div>
              <p className="font-caption text-xs text-muted-foreground mb-1">Supplier</p>
              <p className="font-body font-medium text-sm text-foreground">
                {product?.supplier}
              </p>
            </div>
            
            <div>
              <p className="font-caption text-xs text-muted-foreground mb-1">Last Updated</p>
              <p className="font-body font-medium text-sm text-foreground">
                {formatDate(product?.lastUpdated)}
              </p>
            </div>
          </div>

          {/* Additional Details */}
          {(product?.description || product?.specifications) && (
            <div className="mb-4">
              <p className="font-caption text-xs text-muted-foreground mb-1">Description</p>
              <p className="font-body text-sm text-foreground">
                {product?.description || 'No description available'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product)}
              iconName="Edit"
              iconPosition="left"
              iconSize={16}
              className="flex-1"
            >
              Edit
            </Button>
            
            
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(product)}
              iconName="Trash2"
              iconSize={16}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileInventoryCard;