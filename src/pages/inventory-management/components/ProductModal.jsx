import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
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
    barcode: '',
    weight: '',
    color: '',
    size: '',
    material: '',
    warranty: '',
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
        barcode: product?.barcode || '',
        weight: product?.weight?.toString() || '',
        color: product?.color || '',
        size: product?.size || '',
        material: product?.material || '',
        warranty: product?.warranty || '',
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
        barcode: '',
        weight: '',
        color: '',
        size: '',
        material: '',
        warranty: '',
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
    if (!formData?.price || isNaN(parseFloat(formData?.price)) || parseFloat(formData?.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    // Stock is optional on creation; inventory is managed via supplies/sales

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
        // stock is not persisted directly; managed via movement entries
        reorderLevel: formData?.reorderLevel ? parseInt(formData?.reorderLevel) : 0,
        weight: formData?.weight ? parseFloat(formData?.weight) : ''
      };

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
    <div className="fixed inset-0 z-1300 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-card shadow-raised rounded-lg">
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
                    placeholder="Select brand"
                  />
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
                      label="Current Stock"
                      type="number"
                      value={formData?.stock}
                      onChange={() => {}}
                      disabled
                      placeholder="0"
                      min="0"
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
                  <p className="text-xs text-muted-foreground">Stock is managed via movements. Use Adjust Stock in Product Details to change quantity on hand.</p>
                )}

                <Select
                  label="Supplier"
                  options={supplierOptions}
                  value={formData?.supplier}
                  onChange={(value) => handleInputChange('supplier', value)}
                  placeholder="Select supplier"
                />
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
                        className="w-full h-32 object-cover rounded-lg"
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

                {/* Additional Details */}
                <Input
                  label="Barcode"
                  type="text"
                  value={formData?.barcode}
                  onChange={(e) => handleInputChange('barcode', e?.target?.value)}
                  placeholder="Product barcode"
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Weight (lbs)"
                    type="number"
                    value={formData?.weight}
                    onChange={(e) => handleInputChange('weight', e?.target?.value)}
                    placeholder="0.0"
                    min="0"
                    step="0.1"
                  />

                  <Input
                    label="Size"
                    type="text"
                    value={formData?.size}
                    onChange={(e) => handleInputChange('size', e?.target?.value)}
                    placeholder="Size"
                  />
                </div>

                <Input
                  label="Color"
                  type="text"
                  value={formData?.color}
                  onChange={(e) => handleInputChange('color', e?.target?.value)}
                  placeholder="Product color"
                />

                <Input
                  label="Material"
                  type="text"
                  value={formData?.material}
                  onChange={(e) => handleInputChange('material', e?.target?.value)}
                  placeholder="Material"
                />

                <Input
                  label="Warranty"
                  type="text"
                  value={formData?.warranty}
                  onChange={(e) => handleInputChange('warranty', e?.target?.value)}
                  placeholder="Warranty period"
                />

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
    </div>
  );
};

export default ProductModal;