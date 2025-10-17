import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProductGrid = ({ products, onAddToCart }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    })?.format(price);
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { text: 'Out of Stock', color: 'text-destructive' };
    if (stock <= 3) return { text: 'Low Stock', color: 'text-warning' };
    return { text: 'In Stock', color: 'text-success' };
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">Products</h3>
        <span className="font-body text-sm text-muted-foreground">
          {products?.length} items found
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
        {products?.map((product) => {
          const stockStatus = getStockStatus(product?.stock);
          
          return (
            <div
              key={product?.id}
              className="bg-muted border border-border rounded-lg p-3 hover:shadow-raised transition-smooth flex flex-col h-full"
            >
              <div className="aspect-square mb-3 overflow-hidden rounded-md bg-background">
                <Image
                  src={product?.image}
                  alt={product?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 flex flex-col flex-1">
                <h4 className="font-body font-medium text-xs text-foreground line-clamp-2">
                  {product?.name}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-[14px] text-primary">
                    {formatPrice(product?.price)}
                  </span>
                  <span className={`font-caption text-[7px] ${stockStatus?.color}`}>
                    {stockStatus?.text}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>SKU: {product?.id}</span>
                  <span>Stock: {product?.stock}</span>
                </div>
                <div className="flex-1" />
                <Button
                  variant="default"
                  size="sm"
                  fullWidth
                  disabled={product?.stock === 0}
                  onClick={() => onAddToCart(product)}
                  iconName="Plus"
                  iconPosition="left"
                  iconSize={16}
                  className="mt-2"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {products?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="font-body text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;