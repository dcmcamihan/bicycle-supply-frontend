// src/config/api.js
const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Products
  PRODUCTS: `${API_BASE_URL}/products`, // GET all, POST new
  PRODUCT: (productId) => `${API_BASE_URL}/products/${productId}`,

  // Sales
  SALES: `${API_BASE_URL}/sales`,
  SALE_DETAILS: (saleId) => `${API_BASE_URL}/sale-details/sale/${saleId}`,
  SALE_DETAILS_BASE: `${API_BASE_URL}/sale-details`, // POST new sale detail

  // Sale Payment Types
  SALE_PAYMENT_TYPES: `${API_BASE_URL}/sale-payment-types`, // GET all, POST new
  SALE_PAYMENT_TYPE: (code) => `${API_BASE_URL}/sale-payment-types/${code}`,
  SALE_PAYMENT_TYPES_BY_SALE: (saleId) => `${API_BASE_URL}/sale-payment-types/sale/${saleId}`,

  // Customers
  CUSTOMERS: `${API_BASE_URL}/customers`,
  CUSTOMER: (customerId) => `${API_BASE_URL}/customers/${customerId}`,

  // Employees
  EMPLOYEES: `${API_BASE_URL}/employees`,
  EMPLOYEE: (employeeId) => `${API_BASE_URL}/employees/${employeeId}`,

  // Payment Methods
  PAYMENT_METHODS: `${API_BASE_URL}/payment-methods`, // GET all
  PAYMENT_METHOD: (code) => `${API_BASE_URL}/payment-methods/${code}`,

  // Brands
  BRANDS: `${API_BASE_URL}/brands`, // GET all, POST new
  BRAND: (id) => `${API_BASE_URL}/brands/${id}`,

  // Categories
  CATEGORIES: `${API_BASE_URL}/categories`, // GET all, POST new
  CATEGORY: (categoryCode) => `${API_BASE_URL}/categories/${categoryCode}`,

  // Contact Types
  CONTACT_TYPES: `${API_BASE_URL}/contact-types`,
  CONTACT_TYPE: (code) => `${API_BASE_URL}/contact-types/${code}`,

  // Suppliers
  SUPPLIERS: `${API_BASE_URL}/suppliers`, // GET all, POST new
  SUPPLIER: (id) => `${API_BASE_URL}/suppliers/${id}`,

  // Supplier Contacts
  SUPPLIER_CONTACTS: `${API_BASE_URL}/supplier-contacts`, // GET all, POST new

  // Supplier Addresses
  SUPPLIER_ADDRESSES: `${API_BASE_URL}/supplier-addresses`, // GET all, POST new

  // Supplies
  SUPPLIES: `${API_BASE_URL}/supplies`, // GET all, POST new
  SUPPLY: (id) => `${API_BASE_URL}/supplies/${id}`,

  // Supply Details
  SUPPLY_DETAILS: `${API_BASE_URL}/supply-details`, // GET all, POST new
  SUPPLY_DETAIL: (id) => `${API_BASE_URL}/supply-details/${id}`,
  SUPPLY_DETAILS_BY_SUPPLY: (supplyId) => `${API_BASE_URL}/supply-details/supply/${supplyId}`,

  // Stockouts (negative adjustments)
  STOCKOUTS: `${API_BASE_URL}/stockouts`, // GET all, POST new
  STOCKOUT: (id) => `${API_BASE_URL}/stockouts/${id}`,
  STOCKOUT_DETAILS: `${API_BASE_URL}/stockout-details`, // GET all, POST new
  STOCKOUT_DETAILS_BY_STOCKOUT: (stockoutId) => `${API_BASE_URL}/stockout-details/stockout/${stockoutId}`,
}; 

export default API_ENDPOINTS;
