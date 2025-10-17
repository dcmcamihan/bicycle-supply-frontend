import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import InventoryManagement from './pages/inventory-management';
import LoginPage from './pages/login';
import ProductDetails from './pages/product-details';
import Dashboard from './pages/dashboard';
import SalesReports from './pages/sales-reports';
import PointOfSale from './pages/point-of-sale';
import ProfileSettings from './pages/settings/ProfileSettings';
import Preferences from './pages/settings/Preferences';
import HelpSupport from './pages/support/HelpSupport';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory-management" element={<InventoryManagement />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/product-details" element={<ProductDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales-reports" element={<SalesReports />} />
        <Route path="/point-of-sale" element={<PointOfSale />} />
        <Route path="/settings/profile" element={<ProfileSettings />} />
        <Route path="/settings/preferences" element={<Preferences />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
