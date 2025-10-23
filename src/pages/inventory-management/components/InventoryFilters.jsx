import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const InventoryFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  suppliers = []
}) => {
  const [categoryOptions, setCategoryOptions] = React.useState([
    { value: '', label: 'All Categories' }
  ]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        const options = Array.isArray(data)
          ? data.map(cat => ({ value: cat.category_code || '', label: cat.category_name || '' }))
          : [];
        setCategoryOptions([{ value: '', label: 'All Categories' }, ...options]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoryOptions([{ value: '', label: 'All Categories' }]);
      }
    };
    fetchCategories();
  }, []);

  const [brandOptions, setBrandOptions] = React.useState([
    { value: '', label: 'All Brands' }
  ]);

  React.useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/brands');
        if (!response.ok) throw new Error('Failed to fetch brands');
        const data = await response.json();
        const options = Array.isArray(data)
          ? data.map(brand => ({ value: String(brand.brand_id), label: brand.brand_name || '' }))
          : [];
        setBrandOptions([{ value: '', label: 'All Brands' }, ...options]);
      } catch (error) {
        console.error('Error fetching brands:', error);
        setBrandOptions([{ value: '', label: 'All Brands' }]);
      }
    };
    fetchBrands();
  }, []);

  const stockStatusOptions = [
    { value: '', label: 'All Stock Status' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' }
  ];

  const supplierOptions = React.useMemo(() => {
    const base = [{ value: '', label: 'All Suppliers' }];
    if (!Array.isArray(suppliers) || suppliers.length === 0) return base;
    return [
      ...base,
      ...suppliers.map(s => ({ value: String(s.id), label: s.name }))
    ];
  }, [suppliers]);

  const priceRangeOptions = [
    { value: '', label: 'All Prices' },
    { value: '0-500', label: 'Under ₱500' },
    { value: '500-1000', label: '₱500 - ₱1,000' },
    { value: '1000-2000', label: '₱1,000 - ₱2,000' },
    { value: '2000-5000', label: '₱2,000 - ₱5,000' },
    { value: '5000+', label: 'Over ₱5,000' }
  ];

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-subtle">
      {/* Search Section */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search products by name, SKU, or description..."
            value={filters?.search || ''}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onClearFilters}
              iconName="X"
              iconPosition="left"
              iconSize={18}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Select
          label="Category"
          options={categoryOptions}
          value={filters?.category || ''}
          onChange={(value) => handleFilterChange('category', value)}
          placeholder="Select category"
        />

        <Select
          label="Brand"
          options={brandOptions}
          value={filters?.brand || ''}
          onChange={(value) => handleFilterChange('brand', value)}
          placeholder="Select brand"
        />

        <Select
          label="Supplier"
          options={supplierOptions}
          value={filters?.supplier || ''}
          onChange={(value) => handleFilterChange('supplier', value)}
          placeholder="Select supplier"
        />

        <Select
          label="Stock Status"
          options={stockStatusOptions}
          value={filters?.stockStatus || ''}
          onChange={(value) => handleFilterChange('stockStatus', value)}
          placeholder="Select status"
        />

        <Select
          label="Price Range"
          options={priceRangeOptions}
          value={filters?.priceRange || ''}
          onChange={(value) => handleFilterChange('priceRange', value)}
          placeholder="Select range"
        />
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Filter" size={16} className="text-muted-foreground" />
            <span className="font-body font-medium text-sm text-foreground">Active Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters)?.map(([key, value]) => {
              if (!value) return null;
              
              let displayValue = value;
              if (key === 'category') {
                displayValue = categoryOptions?.find(opt => opt?.value === value)?.label || value;
              } else if (key === 'brand') {
                displayValue = brandOptions?.find(opt => opt?.value === value)?.label || value;
              } else if (key === 'supplier') {
                displayValue = supplierOptions?.find(opt => opt?.value === value)?.label || value;
              } else if (key === 'stockStatus') {
                displayValue = stockStatusOptions?.find(opt => opt?.value === value)?.label || value;
              } else if (key === 'priceRange') {
                displayValue = priceRangeOptions?.find(opt => opt?.value === value)?.label || value;
              }

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {displayValue}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-2 hover:text-primary/80 transition-micro"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryFilters;