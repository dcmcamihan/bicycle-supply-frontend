import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ShoppingCart = ({ cartItems, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    })?.format(price);
  };

  const subtotal = cartItems?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0);
  const total = subtotal;

  return (
    <div className="bg-card border border-border rounded-lg shadow-subtle h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-lg text-foreground">Shopping Cart</h3>
          <div className="flex items-center space-x-2">
            <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
              {cartItems?.reduce((sum, item) => sum + item?.quantity, 0)} items
            </span>
            {cartItems?.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearCart}
                iconName="Trash2"
                iconSize={16}
                className="text-destructive hover:text-destructive"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {cartItems?.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="ShoppingCart" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="font-body text-muted-foreground">Your cart is empty</p>
            <p className="font-caption text-xs text-muted-foreground mt-1">
              Add products to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cartItems?.map((item) => (
              <div key={item?.id} className="bg-muted border border-border rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 overflow-hidden rounded-md bg-background flex-shrink-0">
                    <Image
                      src={item?.image}
                      alt={item?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-body font-medium text-sm text-foreground line-clamp-2">
                      {item?.name}
                    </h4>
                    <p className="font-caption text-xs text-muted-foreground">
                      SKU: {item?.sku}
                    </p>
                    <p className="font-heading font-semibold text-primary mt-1">
                      {formatPrice(item?.price)}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item?.id)}
                    iconName="X"
                    iconSize={16}
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                  />
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onUpdateQuantity(item?.id, Math.max(1, item?.quantity - 1))}
                      iconName="Minus"
                      iconSize={14}
                      className="w-8 h-8"
                    />
                    <span className="font-data font-medium text-sm w-8 text-center">
                      {item?.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onUpdateQuantity(item?.id, item?.quantity + 1)}
                      iconName="Plus"
                      iconSize={14}
                      className="w-8 h-8"
                    />
                  </div>
                  
                  <span className="font-heading font-bold text-foreground">
                    {formatPrice(item?.price * item?.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {cartItems?.length > 0 && (
        <div className="p-4 border-t border-border bg-muted">
          <div className="space-y-2">
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="text-foreground">{formatPrice(subtotal)}</span>
            </div>
            
            <div className="flex justify-between font-heading font-bold text-lg border-t border-border pt-2">
              <span className="text-foreground">Total:</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;