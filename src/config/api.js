// src/config/api.js
const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Products
  PRODUCTS: `${API_BASE_URL}/products`, // GET all, POST new
  PRODUCT: (productId) => `${API_BASE_URL}/products/${productId}`,

  // Sales
  SALES: `${API_BASE_URL}/sales`,
  SALE_DETAILS: (saleId) => `${API_BASE_URL}/sale-details/sale/${saleId}`,
  SALE_PAYMENT_TYPES: (saleId) => `${API_BASE_URL}/sale-payment-types/sale/${saleId}`,

  // Customers
  CUSTOMER: (customerId) => `${API_BASE_URL}/customers/${customerId}`,

  // Employees
  EMPLOYEE: (employeeId) => `${API_BASE_URL}/employees/${employeeId}`,

  // Payment Methods
  PAYMENT_METHOD: (code) => `${API_BASE_URL}/payment-methods/${code}`,

  // Brands
  BRANDS: `${API_BASE_URL}/brands`, // GET all, POST new
  BRAND: (id) => `${API_BASE_URL}/brands/${id}`,

  // Categories
  CATEGORIES: `${API_BASE_URL}/categories`, // GET all, POST new
  CATEGORY: (categoryCode) => `${API_BASE_URL}/categories/${categoryCode}`,

  // Suppliers
  SUPPLIERS: `${API_BASE_URL}/suppliers`, // GET all, POST new
  SUPPLIER: (id) => `${API_BASE_URL}/suppliers/${id}`,

  // Supplies
  SUPPLIES: `${API_BASE_URL}/supplies`, // GET all, POST new
  SUPPLY: (id) => `${API_BASE_URL}/supplies/${id}`,

  // Supply Details
  SUPPLY_DETAILS: `${API_BASE_URL}/supply-details`, // GET all, POST new
  SUPPLY_DETAIL: (id) => `${API_BASE_URL}/supply-details/${id}`,
  SUPPLY_DETAILS_BY_SUPPLY: (supplyId) => `${API_BASE_URL}/supply-details/supply/${supplyId}`,
};

export default API_ENDPOINTS;
