import { useState, useEffect } from 'react'
import { productService } from '../../services/api'
import ProductForm from '../../components/admin/ProductForm' // Importa el form
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

    const loadProducts = async () => {
    try {
      setLoading(true) // Aseguramos que loading esté true antes de empezar
      const response = await productService.getAll({})
      
      console.log("Respuesta API Productos:", response.data) // ¡OJO! Mira esto en la consola para depurar

      // Validación de seguridad:
      if (Array.isArray(response.data)) {
        setProducts(response.data)
      } else if (response.data && Array.isArray(response.data.products)) {
         // Por si la API devuelve { products: [...] }
        setProducts(response.data.products)
      } else {
        console.error("Formato inesperado:", response.data)
        setProducts([]) // Ponemos array vacío para evitar el crash
        toast.error('Formato de datos incorrecto')
      }

    } catch (error) {
      console.error(error)
      toast.error('Error al cargar productos')
      setProducts([]) // En caso de error, array vacío
    } finally {
      setLoading(false)
    }
  }


  // Abrir modal para CREAR
  const handleOpenCreate = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  // Abrir modal para EDITAR
  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  // Manejar Submit (Crear o Actualizar)
  const handleSaveProduct = async (data) => {
    setSaving(true)
    try {
      if (editingProduct) {
        // PUT: /products/:id
        await productService.update(editingProduct.id, data)
        toast.success('Producto actualizado correctamente')
      } else {
        // POST: /products
        await productService.create(data)
        toast.success('Producto creado correctamente')
      }
      setIsModalOpen(false)
      loadProducts() // Recargar tabla
    } catch (error) {
      console.error(error)
      toast.error('Error al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      await productService.delete(id)
      toast.success('Producto eliminado')
      loadProducts()
    } catch (error) {
      toast.error('Error al eliminar producto')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-sm text-gray-500">Administra el inventario de la tienda</p>
        </div>
        
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Buscador ... (Igual que antes) */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla ... */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center">Cargando...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No hay productos</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    {/* ... (Celdas de la tabla igual que antes) ... */}
                    
                    {/* Celda de Producto */}
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-md object-cover border" src={product.imageUrl || '/placeholder.png'} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">Q{Number(product.price).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{product.category}</td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleOpenEdit(product)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renderizado condicional del Modal */}
      {isModalOpen && (
        <ProductForm 
          productToEdit={editingProduct}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSaveProduct}
          isLoading={saving}
        />
      )}
    </div>
  )
}
