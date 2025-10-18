// src/config/api.js
const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  SALES: `${API_BASE_URL}/sales`,
  SALE_DETAILS: (saleId) => `${API_BASE_URL}/sale-details/sale/${saleId}`,
  PRODUCT: (productId) => `${API_BASE_URL}/products/${productId}`,
  PRODUCTS: `${API_BASE_URL}/products`, // GET all, POST new
  CUSTOMER: (customerId) => `${API_BASE_URL}/customers/${customerId}`,
  SALE_PAYMENT_TYPES: (saleId) => `${API_BASE_URL}/sale-payment-types/sale/${saleId}`,
  PAYMENT_METHOD: (code) => `${API_BASE_URL}/payment-methods/${code}`,
  EMPLOYEE: (employeeId) => `${API_BASE_URL}/employees/${employeeId}`,
  // Supply Details Endpoints
  SUPPLY_DETAILS: `${API_BASE_URL}/supply-details`, // GET all, POST new
  SUPPLY_DETAIL: (id) => `${API_BASE_URL}/supply-details/${id}`,
  SUPPLY_DETAILS_BY_SUPPLY: (supplyId) => `${API_BASE_URL}/supply-details/supply/${supplyId}`,
  // Suppliers Endpoints
  SUPPLIERS: `${API_BASE_URL}/suppliers`, // GET all, POST new
  SUPPLIER: (id) => `${API_BASE_URL}/suppliers/${id}`,
  // Supplies Endpoints
  SUPPLIES: `${API_BASE_URL}/supplies`, // GET all, POST new
  SUPPLY: (id) => `${API_BASE_URL}/supplies/${id}`,
  // Brands Endpoints
  BRANDS: `${API_BASE_URL}/brands`, // GET all, POST new
  BRAND: (id) => `${API_BASE_URL}/brands/${id}`,
  // Categories Endpoints
  CATEGORIES: `${API_BASE_URL}/categories`, // GET all, POST new
  CATEGORY: (categoryCode) => `${API_BASE_URL}/categories/${categoryCode}`,
};

export default API_ENDPOINTS;
