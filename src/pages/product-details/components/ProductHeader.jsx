import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProductHeader = ({ product, isEditing, onToggleEdit, onDuplicate, onDelete }) => {
  const getStockStatusColor = (stock) => {
    if (stock === 0) return 'text-destructive bg-destructive/10';
    if (stock <= 5) return 'text-warning bg-warning/10';
    return 'text-success bg-success/10';
  };

  const getStockStatusText = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
        {/* Product Title and Basic Info */}
        <div className="flex-1">
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                {product?.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Hash" size={16} className="text-muted-foreground" />
                  <span className="text-sm font-body text-muted-foreground">SKU:</span>
                  <span className="text-sm font-data text-foreground">{product?.id}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Icon name="Tag" size={16} className="text-muted-foreground" />
                  <span className="text-sm font-body text-muted-foreground">Category:</span>
                  <span className="text-sm font-body text-foreground capitalize">{product?.category_name || product?.category}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Icon name="Building" size={16} className="text-muted-foreground" />
                  <span className="text-sm font-body text-muted-foreground">Brand:</span>
                  <span className="text-sm font-body text-foreground capitalize">{product?.brand_name || product?.brand}</span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(product?.stock)}`}>
                  <Icon name="Package" size={12} className="mr-1" />
                  {getStockStatusText(product?.stock)} ({product?.stock} units)
                </span>
                
                {product?.isActive && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-success bg-success/10">
                    <Icon name="CheckCircle" size={12} className="mr-1" />
                    Active
                  </span>
                )}
                
                {product?.isFeatured && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-accent bg-accent/10">
                    <Icon name="Star" size={12} className="mr-1" />
                    Featured
                  </span>
                )}
              </div>

              {/* Price Information */}
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-2xl font-heading font-bold text-primary">
                    ₱{product?.price?.toFixed(2)}
                  </span>
                  {product?.discountPercentage > 0 && (
                    <span className="text-sm text-muted-foreground line-through ml-2">
                      ₱{(product?.price / (1 - product?.discountPercentage / 100))?.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {product?.discountPercentage > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-destructive bg-destructive/10">
                    {product?.discountPercentage}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2 xl:space-y-0 xl:space-x-2">
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={onToggleEdit}
            iconName={isEditing ? "Save" : "Edit"}
            iconPosition="left"
            iconSize={16}
            className="w-full sm:w-auto"
          >
            {isEditing ? 'Save' : 'Edit'}
          </Button>
          
          
          
          <Button
            variant="destructive"
            onClick={onDelete}
            iconName="Trash2"
            iconPosition="left"
            iconSize={16}
            className="w-full sm:w-auto"
          >
            Delete
          </Button>
        </div>
      </div>
      
    </div>
  );
};

export default ProductHeader;