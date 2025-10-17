import React from 'react';
import Button from '../../../components/ui/Button';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-subtle">
      <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Categories</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange('all')}
          className="text-xs"
        >
          All Products
        </Button>
        {categories?.map((category) => (
          <Button
            key={category?.category_code}
            variant={activeCategory === category?.category_code ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category?.category_code)}
            className="text-xs"
          >
            {category?.category_name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;