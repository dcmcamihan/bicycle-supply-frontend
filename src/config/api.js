// src/config/api.js
const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  SALES: `${API_BASE_URL}/sales`,
  SALE_DETAILS: (saleId) => `${API_BASE_URL}/sale-details/sale/${saleId}`,
  PRODUCT: (productId) => `${API_BASE_URL}/products/${productId}`,
  CUSTOMER: (customerId) => `${API_BASE_URL}/customers/${customerId}`,
  SALE_PAYMENT_TYPES: (saleId) => `${API_BASE_URL}/sale-payment-types/sale/${saleId}`,
  PAYMENT_METHOD: (code) => `${API_BASE_URL}/payment-methods/${code}`,
  EMPLOYEE: (employeeId) => `${API_BASE_URL}/employees/${employeeId}`,
};

export default API_ENDPOINTS;
