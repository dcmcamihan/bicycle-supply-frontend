import React from 'react';
import { useLocation } from 'react-router-dom';
import InventoryList from './pages/InventoryList';
import ProductDetails from '../product-details';

const InventoryManagement = () => {
  const location = useLocation();
  
  // Check if we're on product-details subpage
  const isProductDetailsPage = location.pathname.includes('/product-details');

  return isProductDetailsPage ? <ProductDetails /> : <InventoryList />;
};

export default InventoryManagement;
