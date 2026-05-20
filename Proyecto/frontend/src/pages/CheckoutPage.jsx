import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartStore } from '../store/cartStore'
import { orderService } from '../services/api'
import toast from 'react-hot-toast'
import { CreditCardIcon, WalletIcon } from '@heroicons/react/24/outline'

const checkoutSchema = z.object({
  address: z.string().min(10, 'La dirección debe tener al menos 10 caracteres'),
  phone: z.string().min(8, 'Teléfono inválido'),
  paymentMethod: z.enum(['card', 'wallet', 'mixed']),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCVV: z.string().optional(),
  walletAmount: z.number().optional(),
})

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [walletBalance] = useState(500.00) // Simular saldo de cartera
  const navigate = useNavigate()
  const { items, getTotal, clearCart } = useCartStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'card',
    },
  })

  const paymentMethod = watch('paymentMethod')
  const total = getTotal() + 25.00 // Total + envío

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: data.address,
        phone: data.phone,
        paymentMethod: data.paymentMethod,
        total,
        paymentDetails: {
          ...(data.paymentMethod === 'card' && {
            cardLastFour: data.cardNumber?.slice(-4),
          }),
          ...(data.paymentMethod === 'wallet' && {
            walletAmount: total,
          }),
          ...(data.paymentMethod === 'mixed' && {
            cardAmount: total - data.walletAmount,
            walletAmount: data.walletAmount,
          }),
        },
      }

      const response = await orderService.create(orderData)
      
      clearCart()
      toast.success('¡Orden creada exitosamente!')
      navigate(`/orders/${response.data.id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar la orden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Shipping Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Información de Envío
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección de Envío
              </label>
              <textarea
                {...register('address')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Calle, número, zona, ciudad..."
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono de Contacto
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="1234-5678"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Método de Pago
          </h2>

          <div className="space-y-4">
            {/* Payment Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  {...register('paymentMethod')}
                  type="radio"
                  value="card"
                  className="sr-only"
                />
                <div className="flex items-center">
                  <CreditCardIcon className="h-6 w-6 text-primary-600 mr-3" />
                  <span className="font-medium">Tarjeta</span>
                </div>
                {paymentMethod === 'card' && (
                  <div className="absolute right-4 h-4 w-4 bg-primary-600 rounded-full"></div>
                )}
              </label>

              <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  {...register('paymentMethod')}
                  type="radio"
                  value="wallet"
                  className="sr-only"
                />
                <div className="flex items-center">
                  <WalletIcon className="h-6 w-6 text-primary-600 mr-3" />
                  <span className="font-medium">Cartera</span>
                </div>
                {paymentMethod === 'wallet' && (
                  <div className="absolute right-4 h-4 w-4 bg-primary-600 rounded-full"></div>
                )}
              </label>

              <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  {...register('paymentMethod')}
                  type="radio"
                  value="mixed"
                  className="sr-only"
                />
                <div className="flex items-center">
                  <span className="font-medium">Mixto</span>
                </div>
                {paymentMethod === 'mixed' && (
                  <div className="absolute right-4 h-4 w-4 bg-primary-600 rounded-full"></div>
                )}
              </label>
            </div>

            {/* Wallet Balance */}
            {(paymentMethod === 'wallet' || paymentMethod === 'mixed') && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-primary-900">
                  Saldo disponible en cartera: <span className="font-bold">Q{walletBalance.toFixed(2)}</span>
                </p>
              </div>
            )}

            {/* Card Details */}
            {(paymentMethod === 'card' || paymentMethod === 'mixed') && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Tarjeta
                  </label>
                  <input
                    {...register('cardNumber')}
                    type="text"
                    maxLength={16}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre en la Tarjeta
                  </label>
                  <input
                    {...register('cardName')}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Expiración
                    </label>
                    <input
                      {...register('cardExpiry')}
                      type="text"
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      {...register('cardCVV')}
                      type="text"
                      maxLength={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mixed Payment Amount */}
            {paymentMethod === 'mixed' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto a pagar con Cartera
                </label>
                <input
                  {...register('walletAmount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  max={Math.min(walletBalance, total)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Resumen de la Orden
          </h2>

          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-gray-600">
                <span>{item.name} x{item.quantity}</span>
                <span>Q{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Q{getTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span>Q25.00</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>Q{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-md font-medium disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Procesando...' : 'Confirmar Orden'}
          </button>
        </div>
      </form>
    </div>
  )
}
