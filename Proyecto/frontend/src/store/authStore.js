import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'
import { useCartStore } from './cartStore'

const TOKEN_KEY = 'auth_token'

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: localStorage.getItem(TOKEN_KEY)
    ? jwtDecode(localStorage.getItem(TOKEN_KEY))
    : null,

  setAuth: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token)

      const decoded = jwtDecode(token)
      set({ token, user: decoded })
    } catch {
      set({ token: null, user: null })
    }
  },

  logout: (razon = "manual") => {
    localStorage.removeItem(TOKEN_KEY)
    set({ token: null, user: null })
    useCartStore.getState().clearCart()

    if (reason === 'expired') {
      toast.error('Tu sesión ha expirado, inicia sesión nuevamente')
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      if (get().token !== null) {
        get().logout('expired')
      }
      return false
    }

    try {
      const decoded = jwtDecode(token)
      const now = Date.now() / 1000

      if (decoded.exp < now) {
        get().logout()
        return false
      }

      return true
    } catch {
      get().logout()
      return false
    }
  },

  hasRole: (role) => {
    const { user } = get()
    return user?.role === role
  }
}))
