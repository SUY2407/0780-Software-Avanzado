import axios from 'axios';

// Base URL del Gateway
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://136.110.217.197';

// Instancia de Axios con configuración
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ========== ORDERS API ==========
export const ordersAPI = {
  // Crear orden
  createOrder: async (orderData) => {
    const response = await api.post('/v1/orders', orderData);
    return response.data;
  },

  // Listar todas las órdenes
  listOrders: async () => {
    const response = await api.get('/v1/orders');
    return response.data;
  },

  // Obtener orden específica
  getOrder: async (orderId) => {
    const response = await api.get(`/v1/orders/${orderId}`);
    return response.data;
  },

  // Cancelar orden
  cancelOrder: async (orderId) => {
    const response = await api.post(`/v1/orders/${orderId}/cancel`);
    return response.data;
  },
};

// ========== RECEIPTS API ==========
export const receiptsAPI = {
  // Generar recibo
  generateReceipt: async (orderId) => {
    const response = await api.get(`/v1/receipts/${orderId}`);
    return response.data;
  },
};

// ========== FX (Currency) API ==========
export const fxAPI = {
  // Obtener tasa de cambio
  getExchangeRate: async (base, quote) => {
    const response = await api.post('/v1/fx/rate', { base, quote });
    return response.data;
  },

  // Convertir moneda
  convertCurrency: async (amount, from, to) => {
    const response = await api.post('/v1/fx/convert', { amount, from, to });
    return response.data;
  },
};

// ========== HEALTH CHECK ==========
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
