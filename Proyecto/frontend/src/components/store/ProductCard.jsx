import { ShoppingCartIcon, TagIcon } from '@heroicons/react/24/outline'

export default function ProductCard({ product, onAddToCart }) {
  // Detectar si es externo (por la etiqueta que viene en el JSON)
  const isExternal = product.externalLabel === 'Proveedor Externo';

  // Normalizar imagen: Tu API principal usa imageUrl, la externa usa image
  const imageSrc = product.imageUrl || product.image || '/placeholder-product.png';

  // Obtener el símbolo de moneda correcto
  const getCurrencySymbol = (currency) => {
    const symbols = {
      'GTQ': 'Q',
      'USD': '$',
      'MXN': 'MX$',
      'EUR': '€'
    }
    return symbols[currency] || 'Q'
  }

  const currencySymbol = getCurrencySymbol(product.currency || 'GTQ')

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full relative group">
      
      {/* Etiqueta de Proveedor Externo (Cyan) */}
      {isExternal && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
            Proveedor Externo
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 bg-white p-4">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply"
        />
        
        {/* Badges de Stock */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            ¡Últimas unidades!
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            Agotado
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2" title={product.name}>
            {product.name}
          </h3>
          
          <div className="flex items-center text-sm text-gray-500 mb-2 mt-1">
            <TagIcon className="h-4 w-4 mr-1" />
            <span>{product.category}</span>
          </div>

          {/* Mostrar el grupo si es externo (opcional) */}
          {isExternal && (
            <p className="text-xs text-gray-400 mb-2">Grupo #{product.groupNumber}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-2xl font-bold text-primary-600">
              {currencySymbol}{Number(product.price).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">Stock: {product.stock}</p>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className={`p-2 rounded-full text-white transition-colors shadow-sm ${
               isExternal 
                 ? 'bg-cyan-600 hover:bg-cyan-700' // Botón cyan para externos
                 : 'bg-primary-600 hover:bg-primary-700'
            } disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            <ShoppingCartIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
