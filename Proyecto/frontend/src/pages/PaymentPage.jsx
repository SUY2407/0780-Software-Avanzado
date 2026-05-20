import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  CreditCardIcon, 
  LockClosedIcon, 
  WalletIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { paymentService, orderService } from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function PaymentPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)
  
  const [order, setOrder] = useState(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [walletId, setWalletId] = useState(null) // Guardamos el ID de la wallet
  
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadData()
  }, [orderId, user, navigate])

  const loadData = async () => {
    try {
      // 1. Cargar Orden
      const orderRes = await orderService.getById(orderId)
      setOrder(orderRes.data)

      // 2. Cargar Wallet (Con auto-creación si falla)
      try {
        const walletRes = await paymentService.getWallet(user.user_id)
        setWalletBalance(walletRes.data.Balance)
        // Algunos backends devuelven el ID de la wallet aquí, si no, no importa tanto para pagar
        setWalletId(walletRes.data.WalletId) 
      } catch (walletError) {
        console.warn('Usuario sin wallet o error 500, intentando crear wallet...', walletError)
        
        // AUTO-CREACIÓN DE WALLET
        try {
          const createRes = await paymentService.createWallet(user.user_id)
          if (createRes.data.Exito) {
             toast.success('Wallet creada exitosamente')
             setWalletBalance(0)
             setWalletId(createRes.data.WalletId)
             
             // Opcional: Regalar saldo de bienvenida
             // await paymentService.addBalance(createRes.data.WalletId, 1000, user.id)
             // setWalletBalance(1000)
          }
        } catch (createError) {
          console.error('Error crítico creando wallet:', createError)
          toast.error('Error conectando con el servicio de Wallet')
        }
      }

    } catch (error) {
      console.error('Error cargando datos de pago:', error)
      toast.error('Error cargando la orden')
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCardData(prev => ({ ...prev, [name]: value }))
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setProcessing(true)
    const toastId = toast.loading('Procesando pago...')

    try {
      // 1. Registrar el método de pago (Tarjeta)
      // Usamos los últimos 4 dígitos como "número" para el registro
      const last4 = cardData.cardNumber.slice(-4)
      const methodRes = await paymentService.addMethod('credito', last4, user.user_id)
      
      // Asumimos que el backend devuelve el ID del método creado o lo buscamos
      // Si el backend no devuelve el ID en create-method, tendríamos que listar los métodos
      // Para este ejemplo, voy a listar los métodos y agarrar el último creado
      const methodsRes = await paymentService.getMethods(user.user_id)
      const methodId = methodsRes.data.MetodosPago?.[0]?.metodoPagoId || "temp-id"

      // 2. Calcular montos (Lógica mixta: Wallet primero, luego tarjeta)
      let montoWallet = 0
      let montoTarjeta = 0
      const total = order.total

      if (walletBalance >= total) {
        montoWallet = total
        montoTarjeta = 0
      } else {
        montoWallet = walletBalance
        montoTarjeta = total - walletBalance
      }

      // 3. Ejecutar Pago
      const paymentPayload = {
        ordenId: order.id,
        total: total,
        montoWallet: montoWallet,
        montoTarjeta: montoTarjeta,
        metodoPago: methodId,
        usuarioId: user.user_id
      }

      console.log('Enviando pago:', paymentPayload)

      const payRes = await paymentService.processPayment(paymentPayload)

      if (payRes.data.Exito) {
        toast.success('¡Pago realizado con éxito!', { id: toastId })
        // Actualizar estado de la orden localmente o recargar
        navigate('/orders')
      } else {
        throw new Error(payRes.data.Mensaje || 'Error en el pago')
      }

    } catch (error) {
      console.error(error)
      toast.error('Error al procesar el pago', { id: toastId })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Cargando pasarela...</div>
  if (!order) return <div className="p-8 text-center text-red-500">Orden no encontrada</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <LockClosedIcon className="h-8 w-8 text-primary-600" />
        Pago Seguro
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Formulario */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Wallet */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white shadow-lg flex justify-between items-center">
            <div>
              <p className="text-primary-100 text-sm font-medium mb-1">Saldo EconoWallet</p>
              <p className="text-3xl font-bold">Q{Number(walletBalance).toFixed(2)}</p>
            </div>
            <WalletIcon className="h-12 w-12 text-primary-200 opacity-80" />
          </div>

          {/* Tarjeta */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCardIcon className="h-6 w-6 text-gray-500" />
              Tarjeta de Crédito / Débito
            </h2>
            
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
                <input
                  type="text"
                  name="cardNumber"
                  maxLength="16"
                  placeholder="0000 0000 0000 0000"
                  value={cardData.cardNumber}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en la Tarjeta</label>
                <input
                  type="text"
                  name="cardName"
                  placeholder="JUAN PEREZ"
                  value={cardData.cardName}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiración</label>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    maxLength="5"
                    value={cardData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="password"
                    name="cvv"
                    maxLength="4"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className={`w-full mt-6 py-3 rounded-md font-bold text-white shadow-md transition-all
                  ${processing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                  }`}
              >
                {processing ? 'Procesando...' : `Pagar Q${Number(order.total).toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>

        {/* Columna Derecha: Resumen */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-24 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de Compra</h3>
            <div className="space-y-3 mb-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Orden ID</span>
                <span className="font-mono text-xs">#{order.id.slice(0,8)}...</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Items</span>
                <span>{order.items ? order.items.length : 0}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>Q{Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500 text-center space-y-2">
              <div className="flex items-center justify-center gap-1 text-green-600">
                <CheckBadgeIcon className="h-4 w-4" />
                <span>Transacción Encriptada</span>
              </div>
              <p>Si tu saldo Wallet no cubre el total, la diferencia se cobrará a tu tarjeta.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
