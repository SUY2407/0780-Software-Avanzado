import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cartService, productService } from '../services/api'
import { useAuthStore } from './authStore'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Sincronizar con Backend (Llamar al hacer Login)
      fetchUserCart: async () => {
        const user = useAuthStore.getState().user
        // Solo intentamos sincronizar si hay usuario y ID válido
        if (!user?.user_id) return

        try {
          const response = await cartService.getCart(user.user_id)
          const serverCart = response.data

          // Solo procesamos si el servidor devuelve productos válidos
          if (serverCart?.productos?.length > 0) {

            // Hidratación segura (evita fallos si un producto ya no existe)
            const hydratedItems = await Promise.all(serverCart.productos.map(async (serverItem) => {
              try {
                const productResponse = await productService.getById(serverItem.id_producto)
                // Mezclamos la info fresca del producto con la cantidad del carrito
                return {
                  ...productResponse.data,
                  quantity: serverItem.cantidad
                }
              } catch (err) {
                // Si el producto fue borrado de la DB pero sigue en el carrito, devolvemos un placeholder
                // para que la UI no explote, pero marcándolo como 'No disponible'
                return {
                  id: serverItem.id_producto,
                  name: 'Producto no disponible',
                  price: serverItem.precio || 0,
                  quantity: serverItem.cantidad,
                  unavailable: true
                }
              }
            }))

            // Filtramos nulos por seguridad y actualizamos el estado
            set({ items: hydratedItems.filter(Boolean) })

            // INTENTO DE ACTUALIZAR FECHA (Protegido)
            try {
              // Verifica si esta ruta es correcta en tu backend. Si no existe, comenta esta línea.
              // await cartService.updateDate(user.id) 
            } catch (dateError) {
              console.warn("No se pudo actualizar la fecha del carrito (Ruta no existe o error server)", dateError)
            }
          }
        } catch (error) {
          // Si es 404 significa que no tiene carrito, no es un error grave.
          if (error.response?.status !== 404) {
            console.error('Error syncing cart:', error)
          }
        }
      },

      addItem: async (product, quantity = 1) => {
        const { items } = get()
        const user = useAuthStore.getState().user

        // Actualizar Local
        const existingItem = items.find(item => item.id === product.id)
        let newItems

        if (existingItem) {
          newItems = items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        } else {
          newItems = [...items, { ...product, quantity }]
        }

        set({ items: newItems })

        // Sincronizar Backend
        if (user) {
          await saveToBackend(user.user_id, newItems)
        }
      },

      removeItem: async (productId) => {
        const { items } = get()
        const user = useAuthStore.getState().user

        const newItems = items.filter(item => item.id !== productId)
        set({ items: newItems })

        if (user) {
          await saveToBackend(user.user_id, newItems)
        }
      },

      updateQuantity: async (productId, quantity) => {
        const { items } = get()
        const user = useAuthStore.getState().user

        const newItems = items.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
        set({ items: newItems })

        if (user) {
          await saveToBackend(user.user_id, newItems)
        }
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage',
    }
  )
)

// Helper para guardar en backend
async function saveToBackend(userId, items) {
  try {
    // Generamos timestamps ISO
    const now = new Date().toISOString()

    // Schema CarroCreate (según OpenAPI):
    // id_usuario, estado, created_at, check_out, updated_at, productos
    const payload = {
      id_usuario: userId,
      estado: "Active",
      check_out: false,
      created_at: now,
      updated_at: now,
      // Nota: Eliminamos 'total' porque CarroCreate no lo pide
      productos: items.map(item => ({
        id_producto: item.id,
        cantidad: item.quantity,
        precio: item.price
      }))
    }
    console.log(payload)
    await cartService.saveCart(payload)
  } catch (error) {
    console.error('Error saving cart to backend:', error)
  }
}
