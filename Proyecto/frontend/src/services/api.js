import axios from 'axios'
import { useAuthStore } from '../store/authStore'


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLogin = error.config?.url?.includes('/auth/login')

      if (!isLogin) {
        useAuthStore.getState().logout('expired')
        window.location.replace('/login?reason=expired')
      }
    }

    return Promise.reject(error)
  }
)


export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
}


export const productService = {
  getAll: (params) => api.get('/catalog/v1/products', { params }),
  getById: (id) => api.get(`/catalog/v1/products/${id}`),
  create: (data) => api.post('/catalog/v1/products', data),
  update: (id, data) => api.put(`/catalog/v1/products/${id}`, data),
  delete: (id) => api.delete(`/catalog/v1/products/${id}`),
  getExtra: () => api.get('/integrations/integrations/v1/products'),
}


export const cartService = {
  getCart: (userId) =>
    api.post('/cart/v1/obtener', {
      id_usuario: userId,
      estado: 'Active',
      check_out: false,
    }),

  saveCart: (cartData) =>
    api.post('/cart/v1/guardar', cartData),

  updateDate: (userId) =>
    api.put('/cart/v1/fecha', {
      id_usuario: userId,
      estado: 'Active',
      check_out: false,
      updated_at: new Date().toISOString(),
    }),

  updateStatus: (cartId, status = 'Inactive', checkout = true) => api.put('/cart/carros/estado', {
    id_carro: cartId,
    check_out: checkout,
    estado: status
  })
}


export const orderService = {
  create: (orderData) => api.post('/orders', orderData),
  getUserOrders: () => api.get(`/orders/user/me`),
  getById: (id) => api.get(`/orders/${id}`),
}


export const paymentService = {
  getWallet: (usuarioId) =>
    api.post('/payment/api/obtener-balance', { usuarioId }),

  createWallet: (usuarioId) =>
    api.post('/payment/api/crear-wallet', {
      moneda: 'GTQ',
      usuarioId,
    }),

  addBalance: (walletId, monto, usuarioId) =>
    api.post('/payment/api/agregar-balance', {
      walletId,
      monto,
      usuarioId,
    }),

  getMethods: (usuarioId) =>
    api.post('/payment/api/metodos-pago', { usuarioId }),

  processPayment: (data) =>
    api.post('/payment/api/procesar-pago', data),
}


export const fxService = {
  getRate: (toCurrency) =>
    api.get('/fx/v1/rate', {
      params: { to: toCurrency },
    }),
}

export default api
