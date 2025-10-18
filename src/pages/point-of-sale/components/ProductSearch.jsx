import React, { useState } from 'react';

import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const ProductSearch = ({ searchTerm, onSearch }) => {
  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    onSearch(value);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-subtle">
      <form onSubmit={handleSearchSubmit} className="flex items-center space-x-3">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <Button
          type="submit"
          variant="default"
          iconName="Search"
          iconSize={20}
          className="px-4"
        >
          Search
        </Button>
      </form>
    </div>
  );
};

export default ProductSearch;