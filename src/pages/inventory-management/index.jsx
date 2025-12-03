import React from 'react';
import { Routes as RouterRoutes, Route } from 'react-router-dom';
import InventoryList from './pages/InventoryList';
import ProductDetails from '../product-details';

const InventoryManagement = () => {
  return (
    <RouterRoutes>
      <Route index element={<InventoryList />} />
      <Route path="list" element={<InventoryList />} />
      <Route path="product-details" element={<ProductDetails />} />
    </RouterRoutes>
  );
};

export default InventoryManagement;
