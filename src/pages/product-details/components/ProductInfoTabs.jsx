import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ProductInfoTabs = ({ product, isEditing, onToggleEdit, onSave }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [editedProduct, setEditedProduct] = useState(product);

  const tabs = [
    { id: 'general', label: 'General Info', icon: 'Info' },
    { id: 'inventory', label: 'Inventory', icon: 'Package' },
    { id: 'supplier', label: 'Supplier', icon: 'Truck' }
  ];

  const categoryOptions = [
    { value: 'mountain', label: 'Mountain Bikes' },
    { value: 'road', label: 'Road Bikes' },
    { value: 'hybrid', label: 'Hybrid Bikes' },
    { value: 'electric', label: 'Electric Bikes' },
    { value: 'bmx', label: 'BMX Bikes' }
  ];

  const brandOptions = [
    { value: 'trek', label: 'Trek' },
    { value: 'specialized', label: 'Specialized' },
    { value: 'giant', label: 'Giant' },
    { value: 'cannondale', label: 'Cannondale' },
    { value: 'scott', label: 'Scott' }
  ];

  const handleInputChange = (field, value) => {
    setEditedProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(editedProduct);
  };

  const renderGeneralInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Product Name"
          type="text"
          value={editedProduct.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          disabled={!isEditing}
          required
        />
        <Input
          label="SKU"
          type="text"
          value={editedProduct.sku}
          onChange={(e) => handleInputChange('sku', e.target.value)}
          disabled={!isEditing}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Category"
          options={categoryOptions}
          value={editedProduct.category}
          onChange={(value) => handleInputChange('category', value)}
          disabled={!isEditing}
          required
        />
        <Select
          label="Brand"
          options={brandOptions}
          value={editedProduct.brand}
          onChange={(value) => handleInputChange('brand', value)}
          disabled={!isEditing}
          required
        />
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Price (₱)"
          type="number"
          value={editedProduct.price}
          onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
          disabled={!isEditing}
          required
          placeholder="0.00"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={editedProduct.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            disabled={!isEditing}
            className="rounded border-border text-primary focus:ring-ring"
          />
          <span className="text-sm font-body text-foreground">Active Product</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={editedProduct.isFeatured}
            onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
            disabled={!isEditing}
            className="rounded border-border text-primary focus:ring-ring"
          />
          <span className="text-sm font-body text-foreground">Featured Product</span>
        </label>
      </div>
    </div>
  );

  

  

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Current Stock"
          type="number"
          value={editedProduct.stock}
          onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
          disabled={!isEditing}
          required
          min="0"
        />
        <Input
          label="Reorder Point"
          type="number"
          value={editedProduct.reorderPoint || 5}
          onChange={(e) => handleInputChange('reorderPoint', parseInt(e.target.value))}
          disabled={!isEditing}
          min="0"
        />
        <Input
          label="Max Stock Level"
          type="number"
          value={editedProduct.maxStock || 100}
          onChange={(e) => handleInputChange('maxStock', parseInt(e.target.value))}
          disabled={!isEditing}
          min="0"
        />
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="font-body font-semibold text-sm text-foreground mb-3 flex items-center space-x-2">
          <Icon name="TrendingUp" size={16} />
          <span>Stock Movement History</span>
        </h4>
        <div className="space-y-2">
          {[
            { date: '2025-01-20', type: 'Sale', quantity: -2, balance: editedProduct.stock },
            { date: '2025-01-18', type: 'Restock', quantity: +10, balance: editedProduct.stock + 2 },
            { date: '2025-01-15', type: 'Sale', quantity: -1, balance: editedProduct.stock - 8 }
          ].map((movement, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
              <div className="flex items-center space-x-3">
                <Icon 
                  name={movement.type === 'Sale' ? 'Minus' : 'Plus'} 
                  size={14} 
                  className={movement.type === 'Sale' ? 'text-destructive' : 'text-success'}
                />
                <div>
                  <span className="text-sm font-body text-foreground">{movement.type}</span>
                  <span className="text-xs text-muted-foreground ml-2">{movement.date}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-semibold ${
                  movement.quantity > 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                </span>
                <span className="text-xs text-muted-foreground ml-2">Bal: {movement.balance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSupplier = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Supplier Name"
          type="text"
          value={editedProduct.supplier?.name || 'BikeWorld Distributors'}
          onChange={(e) => handleInputChange('supplier', {
            ...editedProduct.supplier,
            name: e.target.value
          })}
          disabled={!isEditing}
        />
        <Input
          label="Supplier Code"
          type="text"
          value={editedProduct.supplier?.code || 'BWD-001'}
          onChange={(e) => handleInputChange('supplier', {
            ...editedProduct.supplier,
            code: e.target.value
          })}
          disabled={!isEditing}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Contact Person"
          type="text"
          value={editedProduct.supplier?.contact || 'Sarah Johnson'}
          onChange={(e) => handleInputChange('supplier', {
            ...editedProduct.supplier,
            contact: e.target.value
          })}
          disabled={!isEditing}
        />
        <Input
          label="Phone Number"
          type="tel"
          value={editedProduct.supplier?.phone || '+1 (555) 123-4567'}
          onChange={(e) => handleInputChange('supplier', {
            ...editedProduct.supplier,
            phone: e.target.value
          })}
          disabled={!isEditing}
        />
      </div>

      <Input
        label="Email Address"
        type="email"
        value={editedProduct.supplier?.email || 'orders@bikeworld.com'}
        onChange={(e) => handleInputChange('supplier', {
          ...editedProduct.supplier,
          email: e.target.value
        })}
        disabled={!isEditing}
      />

      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="font-body font-semibold text-sm text-foreground mb-3 flex items-center space-x-2">
          <Icon name="Package" size={16} />
          <span>Purchase Order History</span>
        </h4>
        <div className="space-y-2">
          {[
            { poNumber: 'PO-2025-001', date: '2025-01-15', quantity: 10, status: 'Delivered' },
            { poNumber: 'PO-2024-089', date: '2024-12-20', quantity: 15, status: 'Delivered' },
            { poNumber: 'PO-2024-067', date: '2024-11-28', quantity: 8, status: 'Delivered' }
          ].map((po, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
              <div>
                <span className="text-sm font-body text-foreground">{po.poNumber}</span>
                <span className="text-xs text-muted-foreground ml-2">{po.date}</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-foreground">Qty: {po.quantity}</span>
                <span className="text-xs text-success ml-2">{po.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralInfo();
      case 'inventory':
        return renderInventory();
      case 'supplier':
        return renderSupplier();
      default:
        return renderGeneralInfo();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-body text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {renderTabContent()}
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onToggleEdit}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            iconName="Save"
            iconPosition="left"
            iconSize={16}
          >
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductInfoTabs;