import { useState, useEffect } from 'react'
import { productService, fxService } from '../services/api'
import { useCartStore } from '../store/cartStore'
import ProductCard from '../components/store/ProductCard'
import CategoryFilter from '../components/store/CategoryFilter'
import CurrencySelector from '../components/store/CurrencySelector'
import toast from 'react-hot-toast'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function StorePage() {
  // Estado para productos locales (API principal)
  const [products, setProducts] = useState([])

  // Estado para productos de integración (API externa)
  const [extraProducts, setExtraProducts] = useState([])

  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currency, setCurrency] = useState('GTQ')
  const [exchangeRate, setExchangeRate] = useState(1) // Tasa de conversión
  const addItem = useCartStore(state => state.addItem)

  useEffect(() => {
    loadData()
  }, [selectedCategory, currency])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        currency,
      }

      // Obtener la tasa de conversión si la moneda no es GTQ
      let conversionRate = 1
      if (currency !== 'GTQ') {
        try {
          // Necesitamos dos tasas porque el endpoint usa USD como base
          // 1. USD -> GTQ (nuestra moneda base)
          // 2. USD -> Moneda destino
          const [gtqRateResponse, targetRateResponse] = await Promise.all([
            fxService.getRate('GTQ'),
            fxService.getRate(currency)
          ])

          // Ejemplo:
          // USD -> GTQ: rate = 7.8 (1 USD = 7.8 GTQ)
          // USD -> MXN: rate = 18.0 (1 USD = 18 MXN)
          // Entonces: 1 GTQ = (18.0 / 7.8) MXN = 2.31 MXN
          const gtqRate = gtqRateResponse.data.rate
          const targetRate = targetRateResponse.data.rate
          conversionRate = targetRate / gtqRate

          setExchangeRate(conversionRate)
        } catch (error) {
          console.error('Error obteniendo tasa de conversión:', error)
          toast.error('No se pudo obtener la tasa de conversión')
          conversionRate = 1
          setExchangeRate(1)
        }
      } else {
        setExchangeRate(1)
      }

      // Llamamos a ambas APIs en paralelo
      console.log('Params a getAll:', params)

      const [mainResponse, extraResponse] = await Promise.all([
        productService.getAll(params),
        productService.getExtra()
      ])
      
      console.log('Respuesta productos propios:', mainResponse.data)
      console.log('Respuesta productos extra:', extraResponse.data)

      // 1. Procesar respuesta API Principal y convertir precios
      let productsData = []
      if (Array.isArray(mainResponse.data)) {
        productsData = mainResponse.data
      } else if (mainResponse.data?.products) {
        productsData = mainResponse.data.products
      }

      // Convertir precios según la tasa de cambio
      // Ahora MULTIPLICAMOS por la tasa de conversión
      const convertedProducts = productsData.map(product => ({
        ...product,
        originalPrice: product.price,
        price: product.price * conversionRate,
        currency: currency
      }))
      setProducts(convertedProducts)

      // 2. Procesar respuesta API Integraciones (Extra) y convertir precios
      if (extraResponse.data && Array.isArray(extraResponse.data.products)) {
        const convertedExtraProducts = extraResponse.data.products.map(product => ({
          ...product,
          originalPrice: product.price,
          price: product.price * conversionRate,
          currency: currency
        }))
        setExtraProducts(convertedExtraProducts)
      } else {
        console.warn('Formato inesperado en API Extra:', extraResponse.data)
        setExtraProducts([])
      }

    } catch (error) {
      console.error('Error cargando catálogo:', error)
      toast.error('Algunos productos no pudieron cargarse')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product) => {
    addItem(product, 1)
    toast.success('Producto agregado al carrito')
  }

  // Filtramos los productos locales por búsqueda
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filtramos también los productos extra (opcional, pero buena práctica)
  const filteredExtraProducts = extraProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-12 pb-12">
      
      {/* --- SECCIÓN SUPERIOR: HEADER Y FILTROS --- */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenido a EconoMarket
          </h1>
          <p className="text-gray-600">
            Encuentra los mejores productos al mejor precio
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Buscador */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            {/* Filtros */}
            <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
            <CurrencySelector selected={currency} onChange={setCurrency} />
          </div>
        </div>

        {/* --- GRID PRINCIPAL (Productos Locales) --- */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
            Catálogo General
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No se encontraron productos en el catálogo general</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- SECCIÓN EXTRA: PRODUCTOS DE INTEGRACIÓN --- */}
      {/* Solo se muestra si hay productos extra y no estamos cargando */}
      {!loading && filteredExtraProducts.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
            <span className="text-2xl">✨</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Productos de Aliados
              </h2>
              <p className="text-sm text-gray-500">
                Ofertas exclusivas de nuestros proveedores externos
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredExtraProducts.map((product, index) => (
              <ProductCard
                // Usamos una key compuesta porque el ID podría repetirse con los locales
                key={`extra-${product.sku || index}`} 
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      )}
      
    </div>
  )
}
