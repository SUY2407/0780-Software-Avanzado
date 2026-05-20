import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function ProductForm({ productToEdit, onClose, onSubmit, isLoading }) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  // Si nos pasan un producto para editar, llenamos el formulario
  useEffect(() => {
    if (productToEdit) {
      reset({
        sku: productToEdit.sku,
        name: productToEdit.name,
        description: productToEdit.description,
        price: productToEdit.price,
        stock: productToEdit.stock,
        category: productToEdit.category,
        imageUrl: productToEdit.imageUrl,
        providerId: productToEdit.providerId // Asegúrate de mandar este ID
      })
    } else {
        // Limpiar si es nuevo
        reset({
            sku: '', name: '', description: '', price: 0, stock: 0, category: 'Tecnología', imageUrl: '', providerId: 1
        })
    }
  }, [productToEdit, reset])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header del Modal */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">
            {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700">SKU</label>
              <input
                {...register('sku', { required: 'El SKU es obligatorio' })}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                placeholder="EJ: SKU-001"
              />
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                {...register('name', { required: 'Nombre obligatorio' })}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              {...register('description', { required: 'Descripción obligatoria' })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio (Q)</label>
              <input
                {...register('price', { required: true, min: 0, valueAsNumber: true })}
                type="number"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                {...register('stock', { required: true, min: 0, valueAsNumber: true })}
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
              />
            </div>

            {/* Provider ID (temporalmente input manual, idealmente un select) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Proveedor</label>
              <input
                {...register('providerId', { required: true, valueAsNumber: true })}
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoría */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                    {...register('category')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 bg-white"
                >
                    <option value="Tecnología">Tecnología</option>
                    <option value="Hogar">Hogar</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Fotografía">Fotografía</option>
                    <option value="Audio">Audio</option>
                    <option value="Consolas">Consolas</option>
                    <option value="Software">Software</option>
                    <option value="Redes">Redes</option>
                    <option value="Almacenamiento">Almacenamiento</option>
                    <option value="Oficina">Oficina</option>
                </select>
            </div>

            {/* URL Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700">URL Imagen</label>
              <input
                {...register('imageUrl')}
                type="url"
                placeholder="https://..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : productToEdit ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
