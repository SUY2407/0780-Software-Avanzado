import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrashIcon, PlusIcon, MinusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// Imports de estado y servicios
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { orderService, cartService } from '../services/api' // <--- AGREGAMOS cartService

export default function CartPage() {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)

  // Hooks de los stores (Zustand)
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    getTotal, 
    clearCart, // Esto solo limpia localmente
    fetchUserCart 
  } = useCartStore()
  
  const { user, isAuthenticated } = useAuthStore()

  // Sincronizar carrito al cargar
  useEffect(() => {
    if (isAuthenticated() && items.length === 0) {
      fetchUserCart()
    }
  }, [isAuthenticated, fetchUserCart])

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return
    updateQuantity(id, newQuantity)
  }

  const handleCreateOrder = async () => {
    if (!isAuthenticated()) {
      toast.error('Debes iniciar sesión para finalizar la compra')
      navigate('/login')
      return
    }

    if (items.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    setIsProcessing(true)
    const toastId = toast.loading('Generando orden...')

    try {
      // 1. Crear la Orden (POST /orders)
      const orderPayload = {
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      }

      console.log('Enviando orden:', orderPayload) 

      const response = await orderService.create(orderPayload)
      
      // 2. IMPORTANTE: Limpiar el carrito en el BACKEND
      // Enviamos una lista de productos vacía para que la BD se actualice
      try {
        await cartService.saveCart({
            id_usuario: user.user_id,
            estado: 'Active',
            check_out: false, // O true si quieres cerrarlo lógicamente
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            productos: [] // <--- ARRAY VACÍO: Esto borra los items del backend
        })
      } catch (cleanError) {
        console.warn('La orden se creó pero hubo error limpiando el carrito remoto:', cleanError)
        // No detenemos el flujo, porque la orden (lo importante) ya se creó
      }

      // 3. Limpiar el carrito LOCAL (Frontend)
      clearCart() 
      
      toast.success('¡Orden creada exitosamente!', { id: toastId })
      
      // 4. Redirigir al pago
      const newOrderId = response.data?.id || response.data?.orderId || response.data?.data?.id
      
      if (newOrderId) {
        navigate(`/payment/${newOrderId}`)
      } else {
        navigate('/orders')
      }

    } catch (error) {
      console.error('Error al crear orden:', error)
      
      let errorMsg = 'Error al procesar la orden'
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
           errorMsg = error.response.data.message[0]
        } else {
           errorMsg = error.response.data.message
        }
      }
      
      toast.error(errorMsg, { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  // --- RENDER: Carrito Vacío ---
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="bg-gray-100 p-6 rounded-full">
          <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Tu carrito está vacío</h2>
        <p className="text-gray-500">¡Agrega algunos productos increíbles!</p>
        <Link
          to="/"
          className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-colors"
        >
          Volver a la tienda
        </Link>
      </div>
    )
  }

  // --- RENDER: Carrito con Productos ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lista de Items */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <img
                src={item.imageUrl || item.image || '/placeholder-product.png'}
                alt={item.name}
                className="w-24 h-24 object-contain rounded-md bg-gray-50"
              />

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500">{item.category}</p>
                <p className="text-primary-600 font-bold mt-1">
                  Q{item.price.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-white rounded-md transition-colors text-gray-600"
                  disabled={item.quantity <= 1}
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="font-medium w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-white rounded-md transition-colors text-gray-600"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Resumen de la Orden */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen del Pedido
            </h2>
            
            <div className="space-y-3 text-sm text-gray-600 border-b border-gray-200 pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Q{getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío estimado</span>
                <span>Q25.00</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>Q{(getTotal() + 25).toFixed(2)}</span>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow-sm 
                ${isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg transform transition-all active:scale-95'
                }`}
            >
              {isProcessing ? 'Procesando...' : 'Generar Orden'}
            </button>

            <p className="mt-4 text-xs text-center text-gray-400">
              Al generar la orden serás redirigido al pago
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
