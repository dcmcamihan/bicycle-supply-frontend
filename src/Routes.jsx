import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import InventoryManagement from './pages/inventory-management';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ProductDetails from './pages/product-details';
import Dashboard from './pages/dashboard';
import SalesReports from './pages/sales-reports';
import PointOfSale from './pages/point-of-sale';
import ProfileSettings from './pages/settings/ProfileSettings';
import Preferences from './pages/settings/Preferences';
import HelpSupport from './pages/support/HelpSupport';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const PrivateRoute = ({ element }) => {
  const { user } = useAuth();
  return user ? element : <LoginPage />;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <AuthProvider>
        <RouterRoutes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Private */}
          <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/inventory-management" element={<PrivateRoute element={<InventoryManagement />} />} />
          <Route path="/product-details" element={<PrivateRoute element={<ProductDetails />} />} />
          <Route path="/sales-reports" element={<PrivateRoute element={<SalesReports />} />} />
          <Route path="/point-of-sale" element={<PrivateRoute element={<PointOfSale />} />} />
          <Route path="/settings/profile" element={<PrivateRoute element={<ProfileSettings />} />} />
          <Route path="/settings/preferences" element={<PrivateRoute element={<Preferences />} />} />
          <Route path="/help-support" element={<PrivateRoute element={<HelpSupport />} />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
