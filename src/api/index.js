// API client configuration and utilities
import axios from 'axios';

// Create centralized API client
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Debug logging for development
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:');
  console.log('- Base URL:', import.meta.env.VITE_API_URL || '/api');
  console.log('- Using Vite Proxy:', !import.meta.env.VITE_API_URL);
  
  // Log API requests in development
  api.interceptors.request.use((config) => {
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  });
  
  // Log API responses in development
  api.interceptors.response.use(
    (response) => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.log(`❌ API Error: ${error.response?.status || 'Network'} ${error.config?.url}`, error.message);
      return Promise.reject(error);
    }
  );
}

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints constants
export const ENDPOINTS = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  // USER: '/user',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id) => `/products/${id}`,
  PRODUCTS_WITH_LIMIT: (limit) => `/products?limit=${limit}`,
  PRODUCT_RECOMMENDATIONS: (id, limit) => `/products/${id}?limit=${limit}`,
  PRODUCT_SEARCH: '/products/search',
  
  // Cart
  CART: '/cart',
  
  // Sales/Orders
  SALES: '/sales',
};

// Response normalizers
export const normalizeProductsResponse = (response) => {
  if (response.data?.products) {
    return { products: response.data.products };
  }
  if (Array.isArray(response.data)) {
    return { products: response.data };
  }
  return { products: [] };
};

export const normalizeProductResponse = (response) => {
  if (response.data?.product) {
    return { product: response.data.product };
  }
  if (response.data && typeof response.data === 'object') {
    return { product: response.data };
  }
  return { product: null };
};

export default api;
