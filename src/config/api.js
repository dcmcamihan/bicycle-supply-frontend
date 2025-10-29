// src/config/api.js
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Products
  PRODUCTS: `${API_BASE_URL}/products`, // GET all, POST new
  PRODUCT: (productId) => `${API_BASE_URL}/products/${productId}`,
  PRODUCT_ARCHIVE: (productId) => `${API_BASE_URL}/products/${productId}/archive`,
  PRODUCT_ACTIVATE: (productId) => `${API_BASE_URL}/products/${productId}/activate`,

  // Product Images
  PRODUCT_IMAGES: `${API_BASE_URL}/product-images`, // GET all, POST new
  PRODUCT_IMAGE: (imageId) => `${API_BASE_URL}/product-images/${imageId}`,
  PRODUCT_IMAGES_BY_PRODUCT: (productId) => `${API_BASE_URL}/product-images/product/${productId}`,

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
  EMPLOYEE_LOGIN: `${API_BASE_URL}/employees/login`,
  EMPLOYEE_REHASH_PASSWORDS: `${API_BASE_URL}/employees/rehash-passwords`,

  // Auth (password resets)
  AUTH_REQUEST_RESET: `${API_BASE_URL}/auth/request-reset`,
  AUTH_RESET: `${API_BASE_URL}/auth/reset`,

  // Roles
  EMPLOYEE_ROLES_BY_EMPLOYEE: (employeeId) => `${API_BASE_URL}/employee-roles/employee/${employeeId}`,
  ROLE_TYPE: (code) => `${API_BASE_URL}/role-types/${code}`,
  // Role types (list)
  EMPLOYEE_ROLES: `${API_BASE_URL}/role-types`,

  // Employee Contacts
  EMPLOYEE_CONTACTS: `${API_BASE_URL}/employee-contacts`,
  EMPLOYEE_CONTACTS_BY_EMPLOYEE: (employeeId) => `${API_BASE_URL}/employee-contacts/employee/${employeeId}`,

  // Employee Attendance and details
  EMPLOYEE_ATTENDANCES: `${API_BASE_URL}/employee-attendances`,
  // backward-compatible singular alias used in some pages
  EMPLOYEE_ATTENDANCE: `${API_BASE_URL}/employee-attendances`,
  ATTENDANCE_DETAILS: `${API_BASE_URL}/attendance-details`,

  // Employee Role History
  EMPLOYEE_ROLE_HISTORIES: `${API_BASE_URL}/employee-role-histories`,
  EMPLOYEE_ROLE_HISTORIES_BY_EMPLOYEE: (employeeId) => `${API_BASE_URL}/employee-role-histories/employee/${employeeId}`,

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
  SUPPLIER_CONTACTS_BY_SUPPLIER: (supplierId) => `${API_BASE_URL}/supplier-contacts/supplier/${supplierId}`,

  // Supplier Addresses
  SUPPLIER_ADDRESSES: `${API_BASE_URL}/supplier-addresses`, // GET all, POST new
  SUPPLIER_ADDRESSES_BY_SUPPLIER: (supplierId) => `${API_BASE_URL}/supplier-addresses/supplier/${supplierId}`,

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

  // Stock Adjustments (manual/return/replacement)
  STOCK_ADJUSTMENTS: `${API_BASE_URL}/stock-adjustments`,
  // Stock Adjustment Details
  STOCK_ADJUSTMENT_DETAILS: `${API_BASE_URL}/stock-adjustment-details`,

  // Returns
  RETURN_AND_REPLACEMENTS: `${API_BASE_URL}/return-and-replacements`,

  // Statuses
  STATUSES: `${API_BASE_URL}/statuses`,
  STATUSES_BY_REFERENCE: (ref) => `${API_BASE_URL}/statuses/reference/${ref}`,

};

export default API_ENDPOINTS;
