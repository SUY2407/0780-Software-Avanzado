import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  ShoppingBagIcon, 
  ChevronRightIcon, 
  CreditCardIcon, 
  CheckCircleIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

import { orderService } from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Si no está logueado, para fuera
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    const fetchOrders = async () => {
      try {
        const response = await orderService.getUserOrders()
        // Ordenamos por fecha descendente (la más nueva primero)
        console.log("hola")
        const sortedOrders = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        setOrders(sortedOrders)
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast.error('No se pudo cargar el historial de órdenes')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, isAuthenticated, navigate])

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
      case 'PAID':
      case 'COMPLETADA':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
      case 'PAID':
        return <CheckCircleIcon className="h-4 w-4 mr-1" />
      case 'PENDING':
        return <ClockIcon className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }

  // --- RENDER: Loading ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // --- RENDER: Sin Órdenes ---
  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">No tienes órdenes aún</h2>
        <p className="mt-4 text-lg text-gray-500">¿Qué esperas para estrenar algo nuevo?</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:text-lg transition-colors"
        >
          Ir a la Tienda
        </Link>
      </div>
    )
  }

  // --- RENDER: Lista de Órdenes ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Órdenes</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Header de la Orden */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Orden #</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{order.id.slice(0, 8)}...</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Fecha</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.createdAt 
                      ? format(new Date(order.createdAt), "d 'de' MMMM, yyyy", { locale: es }) 
                      : 'Fecha desconocida'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</p>
                  <p className="text-sm font-bold text-gray-900">Q{order.total?.toFixed(2)}</p>
                </div>
              </div>

              <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status || 'Desconocido'}
              </div>
            </div>

            {/* Lista de Items */}
            <div className="px-6 py-4">
              <ul className="divide-y divide-gray-100">
                {order.items?.map((item, index) => (
                  <li key={index} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                        <ShoppingBagIcon className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {item.productName || 'Producto sin nombre'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cant: {item.quantity} x Q{item.unitPrice?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      Q{(item.quantity * item.unitPrice)?.toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer con Acciones */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end items-center gap-4">
              {/* Solo mostramos botón de pagar si está PENDING */}
              {(order.status === 'PENDING' || order.status === 'PENDIENTE') && (
                <button
                  onClick={() => navigate(`/payment/${order.id}`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Pagar Ahora
                </button>
              )}
              
              {/* Detalles siempre visible */}
               {/* 
                  Aquí podrías poner un botón de "Ver Detalles" si hicieras una página individual,
                  pero por ahora con la lista expandida basta.
               */}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
