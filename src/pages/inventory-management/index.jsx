import React from 'react';
import { useRoutes } from 'react-router-dom';
import InventoryList from './pages/InventoryList';
import ProductDetails from '../product-details';

const InventoryManagement = () => {
  const routes = useRoutes([
    { index: true, element: <InventoryList /> },
    { path: 'product-details', element: <ProductDetails /> }
  ]);

  return routes;
};

export default InventoryManagement;
