import axios from 'axios';
import type { Order } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://34.186.81.133:3000/v1';

// Función segura para generar UUIDs en cualquier entorno (HTTP o HTTPS)
function generateUUID() {
  // Intentamos usar la API nativa si está disponible (HTTPS/Localhost)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Si falla (por ejemplo en HTTP no seguro), usamos el fallback
    }
  }
  
  // Algoritmo manual compatible con navegadores antiguos o contextos no seguros
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const api = {
  createOrder: async (order: Order) => {
    // Usamos la función personalizada en lugar de crypto.randomUUID() directo
    const response = await axios.post(`${API_URL}/orders`, order, {
      headers: {
        'Idempotency-Key': generateUUID() 
      }
    });
    return response.data;
  },

  listOrders: async () => {
    const response = await axios.get(`${API_URL}/orders`);
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await axios.get(`${API_URL}/orders/${id}`);
    return response.data;
  },

  getReceipt: async (id: string) => {
    const response = await axios.get(`${API_URL}/orders/${id}/receipt`);
    return response.data;
  },

  cancelOrder: async (id: string) => {
    const response = await axios.post(`${API_URL}/orders/${id}/cancel`);
    return response.data;
  }
};
