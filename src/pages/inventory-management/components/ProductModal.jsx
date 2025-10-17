import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ProductModal = ({ 
  isOpen, 
  onClose, 
  product = null, 
  onSave,
  suppliers = [] 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    brand: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    reorderLevel: '',
    supplier: '',
    barcode: '',
    weight: '',
    dimensions: '',
    color: '',
    size: '',
    material: '',
    warranty: '',
    image: '',
    isActive: true,
    trackInventory: true
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const categoryOptions = [
    { value: 'mountain', label: 'Mountain Bikes' },
    { value: 'road', label: 'Road Bikes' },
    { value: 'hybrid', label: 'Hybrid Bikes' },
    { value: 'electric', label: 'Electric Bikes' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'parts', label: 'Parts & Components' }
  ];

  const brandOptions = [
    { value: 'trek', label: 'Trek' },
    { value: 'specialized', label: 'Specialized' },
    { value: 'giant', label: 'Giant' },
    { value: 'cannondale', label: 'Cannondale' },
    { value: 'scott', label: 'Scott' },
    { value: 'bianchi', label: 'Bianchi' }
  ];

  const supplierOptions = suppliers?.map(supplier => ({
    value: supplier?.id,
    label: supplier?.name
  }));

  useEffect(() => {
    if (product) {
      setFormData({
        name: product?.name || '',
        sku: product?.sku || '',
        category: product?.category || '',
        brand: product?.brand || '',
        description: product?.description || '',
        price: product?.price?.toString() || '',
        cost: product?.cost?.toString() || '',
        stock: product?.stock?.toString() || '',
        reorderLevel: product?.reorderLevel?.toString() || '',
        supplier: product?.supplierId || '',
        barcode: product?.barcode || '',
        weight: product?.weight?.toString() || '',
        dimensions: product?.dimensions || '',
        color: product?.color || '',
        size: product?.size || '',
        material: product?.material || '',
        warranty: product?.warranty || '',
        image: product?.image || '',
        isActive: product?.isActive !== false,
        trackInventory: product?.trackInventory !== false
      });
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        sku: '',
        category: '',
        brand: '',
        description: '',
        price: '',
        cost: '',
        stock: '',
        reorderLevel: '',
        supplier: '',
        barcode: '',
        weight: '',
        dimensions: '',
        color: '',
        size: '',
        material: '',
        warranty: '',
        image: '',
        isActive: true,
        trackInventory: true
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData?.sku?.trim()) newErrors.sku = 'SKU is required';
    if (!formData?.category) newErrors.category = 'Category is required';
    if (!formData?.price || parseFloat(formData?.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (formData?.trackInventory && (!formData?.stock || parseInt(formData?.stock) < 0)) {
      newErrors.stock = 'Valid stock quantity is required';
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
        price: parseFloat(formData?.price),
        cost: formData?.cost ? parseFloat(formData?.cost) : 0,
        stock: formData?.trackInventory ? parseInt(formData?.stock) : 0,
        reorderLevel: formData?.reorderLevel ? parseInt(formData?.reorderLevel) : 0,
        weight: formData?.weight ? parseFloat(formData?.weight) : 0
      };

      await onSave(productData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      // In a real app, you would upload to a server
      const imageUrl = URL.createObjectURL(file);
      handleInputChange('image', imageUrl);
    }
  };

  const generateSKU = () => {
    const timestamp = Date.now()?.toString()?.slice(-6);
    const randomStr = Math.random()?.toString(36)?.substring(2, 5)?.toUpperCase();
    const sku = `${formData?.category?.toUpperCase()?.slice(0, 3)}${timestamp}${randomStr}`;
    handleInputChange('sku', sku);
  };

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

                  <div className="flex space-x-2">
                    <Input
                      label="SKU"
                      type="text"
                      value={formData?.sku}
                      onChange={(e) => handleInputChange('sku', e?.target?.value)}
                      error={errors?.sku}
                      required
                      placeholder="Product SKU"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateSKU}
                      iconName="RefreshCw"
                      iconSize={16}
                      className="mt-6"
                    >
                      Generate
                    </Button>
                  </div>
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

                  <Input
                    label="Cost"
                    type="number"
                    value={formData?.cost}
                    onChange={(e) => handleInputChange('cost', e?.target?.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                {formData?.trackInventory && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Current Stock"
                      type="number"
                      value={formData?.stock}
                      onChange={(e) => handleInputChange('stock', e?.target?.value)}
                      error={errors?.stock}
                      required
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
                {/* Product Image */}
                <div>
                  <label className="block font-body font-medium text-sm text-foreground mb-2">
                    Product Image
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    {formData?.image ? (
                      <div className="relative">
                        <Image
                          src={formData?.image}
                          alt="Product preview"
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInputChange('image', '')}
                          iconName="X"
                          iconSize={16}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-2" />
                        <p className="font-body text-sm text-muted-foreground mb-2">
                          Upload product image
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
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
        </div>
      </div>
    </div>
  );
};

export default ProductModal;