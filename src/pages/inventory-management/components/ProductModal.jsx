import React, { useState, useEffect } from 'react';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import API_ENDPOINTS from '../../../config/api';
import AdjustStockModal from './AdjustStockModal';

const ProductModal = ({ 
  isOpen, 
  onClose, 
  product = null, 
  onSave,
  suppliers = [],
  categories = [],
  brands = []
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    description: '',
    price: '',
    stock: '',
    reorderLevel: '',
    supplier: '',
    image_url: '',
    isActive: true,
    trackInventory: true
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentQoh, setCurrentQoh] = useState(0);
  const [showAdjust, setShowAdjust] = useState(false);

  const categoryOptions = Array.isArray(categories) && categories.length > 0
    ? categories.map(c => ({ value: c.category_code, label: c.category_name }))
    : [];

  const brandOptions = Array.isArray(brands) && brands.length > 0
    ? brands.map(b => ({ value: String(b.brand_id), label: b.brand_name }))
    : [];

  const supplierOptions = suppliers?.map(supplier => ({
    value: supplier?.id,
    label: supplier?.name
  }));

  useEffect(() => {
    if (product) {
      setFormData({
        name: product?.name || '',
        category: product?.category_code || product?.category || '',
        brand: product?.brand_id ? String(product?.brand_id) : (product?.brand || ''),
        description: product?.description || '',
        price: product?.price?.toString() || '',
        stock: product?.stock?.toString() || '',
        reorderLevel: product?.reorderLevel?.toString() || '',
        supplier: product?.supplierId || '',
        image_url: product?.image_url || product?.image || '',
        isActive: product?.isActive !== false,
        trackInventory: product?.trackInventory !== false
      });
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        category: '',
        brand: '',
        description: '',
        price: '',
        stock: '',
        reorderLevel: '',
        supplier: '',
        image_url: '',
        isActive: true,
        trackInventory: true
      });
    }
    setErrors({});
  }, [product, isOpen]);

  // Fetch live quantity on hand for read-only display
  useEffect(() => {
    const fetchQoh = async () => {
      try {
        const pid = product?.id || product?.product_id;
        if (!pid) return;
        const res = await fetch(`${API_ENDPOINTS.PRODUCT(pid)}/quantity-on-hand`);
        if (res.ok) {
          const qoh = await res.json();
          setCurrentQoh(Number(qoh) || 0);
        }
      } catch {}
    };
    if (isOpen) fetchQoh();
  }, [isOpen, product?.id, product?.product_id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData?.category) newErrors.category = 'Category is required';
    if (!formData?.brand) newErrors.brand = 'Brand is required';
    if (!formData?.supplier) newErrors.supplier = 'Supplier is required';
    if (!formData?.price || isNaN(parseFloat(formData?.price)) || parseFloat(formData?.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!product && formData?.trackInventory) {
      if (formData?.stock === '' || isNaN(parseInt(formData?.stock)) || parseInt(formData?.stock) < 0) {
        newErrors.stock = 'Initial stock must be 0 or greater';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const productData = {
        ...formData,
        price: formData?.price ? parseFloat(formData?.price) : 0,
        reorderLevel: formData?.reorderLevel ? parseInt(formData?.reorderLevel) : 0,
        ...(product ? {} : { stock: formData?.stock ? parseInt(formData?.stock) : 0 })
      };
      if (!product) {
        productData.initialStock = formData?.stock ? parseInt(formData?.stock) : 0;
      }

      await onSave(productData, product?.id || null);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Image is managed as a URL matching backend's image_url

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1300">
      <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl mx-auto overflow-hidden text-left bg-card shadow-raised rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-heading font-semibold text-xl text-foreground">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              iconName="X"
              iconSize={20}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Product Name"
                    type="text"
                    value={formData?.name}
                    onChange={(e) => handleInputChange('name', e?.target?.value)}
                    error={errors?.name}
                    required
                    placeholder="Enter product name"
                  />
                  <div />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    options={categoryOptions}
                    value={formData?.category}
                    onChange={(value) => handleInputChange('category', value)}
                    error={errors?.category}
                    required
                    placeholder="Select category"
                  />
                  <Select
                    label="Brand"
                    options={brandOptions}
                    value={formData?.brand}
                    onChange={(value) => handleInputChange('brand', value)}
                    error={errors?.brand}
                    required
                    placeholder="Select brand"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Supplier"
                    options={supplierOptions}
                    value={formData?.supplier}
                    onChange={(value) => handleInputChange('supplier', value)}
                    required
                    error={errors?.supplier}
                    placeholder="Select supplier"
                  />
                  <div />
                </div>

                <Input
                  label="Description"
                  type="text"
                  value={formData?.description}
                  onChange={(e) => handleInputChange('description', e?.target?.value)}
                  placeholder="Product description"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    type="number"
                    value={formData?.price}
                    onChange={(e) => handleInputChange('price', e?.target?.value)}
                    error={errors?.price}
                    required
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <div />
                </div>
                {formData?.trackInventory && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={product ? 'Current Stock' : 'Initial Stock'}
                      type="number"
                      value={formData?.stock}
                      onChange={(e) => handleInputChange('stock', e?.target?.value)}
                      error={errors?.stock}
                      placeholder="0"
                      min="0"
                      disabled={!!product}
                    />
                    <Input
                      label="Reorder Level"
                      type="number"
                      value={formData?.reorderLevel}
                      onChange={(e) => handleInputChange('reorderLevel', e?.target?.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                )}
                {formData?.trackInventory && (
                  <p className="text-xs text-muted-foreground">
                    Stock is managed via movements. Use Adjust Stock in Product Details to change quantity on hand.
                  </p>
                )}
              </div>
              {/* Right Column - Additional Details & Image */}
              <div className="space-y-4">
                {/* Product Image (URL) */}
                <div>
                  <label className="block font-body font-medium text-sm text-foreground mb-2">
                    Image URL (optional)
                  </label>
                  <Input
                    label="Image URL"
                    type="text"
                    value={formData?.image_url}
                    onChange={(e) => handleInputChange('image_url', e?.target?.value)}
                    placeholder="https://..."
                  />
                  {formData?.image_url ? (
                    <div className="mt-2">
                      <Image
                        src={formData?.image_url}
                        alt="Product preview"
                        className="w-full h-60 object-contain bg-muted rounded-lg p-2"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInputChange('image_url', '')}
                        iconName="X"
                        iconSize={16}
                        className="mt-2"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : null}
                </div>

                {/* Settings */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <Checkbox
                    label="Track Inventory"
                    description="Monitor stock levels for this product"
                    checked={formData?.trackInventory}
                    onChange={(e) => handleInputChange('trackInventory', e?.target?.checked)}
                  />
                <Checkbox
                  label="Active Product"
                  description="Product is available for sale"
                  checked={formData?.isActive}
                  onChange={(e) => handleInputChange('isActive', e?.target?.checked)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              iconName="Save"
              iconPosition="left"
              iconSize={16}
            >
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
        {/* Adjust Stock Modal */}
        {showAdjust && (
          <AdjustStockModal
            isOpen={showAdjust}
            onClose={() => setShowAdjust(false)}
            productId={product?.id || product?.product_id}
            currentQoh={currentQoh}
            onAdjusted={async () => {
              try {
                const pid = product?.id || product?.product_id;
                if (!pid) return;
                const res = await fetch(`${API_ENDPOINTS.PRODUCT(pid)}/quantity-on-hand`);
                if (res.ok) {
                  const qoh = await res.json();
                  setCurrentQoh(Number(qoh) || 0);
                }
              } catch {}
            }}
          />
        )}
      </div>
  </div>
);
};

export default ProductModal;