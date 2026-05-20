import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Package, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { ordersAPI } from '../api/gateway';
import LoadingSpinner from '../components/LoadingSpinner';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      origin_zone: 'METRO',
      destination_zone: 'INTERIOR',
      service_type: 'STANDARD',
      packages: [
        {
          weight_kg: '',
          description: '',
        },
      ],
      discount: {
        type: 'PERCENTAGE',
        value: 0,
      },
      insurance_enabled: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'packages',
  });

  const insuranceEnabled = watch('insurance_enabled');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Convertir weight_kg a números
      const formattedData = {
        ...data,
        packages: data.packages.map((pkg) => ({
          ...pkg,
          weight_kg: parseFloat(pkg.weight_kg),
        })),
        discount: {
          type: data.discount.type,
          value: parseFloat(data.discount.value) || 0,
        },
      };

      const response = await ordersAPI.createOrder(formattedData);
      toast.success('¡Orden creada exitosamente!');
      navigate(`/orders/${response.order_id}`);
    } catch (error) {
      toast.error('Error al crear la orden: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nueva Orden de Envío</h1>
          <p className="text-gray-600">Complete el formulario para crear una nueva orden</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Shipping Information */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Package className="mr-2" />
              Información de Envío
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Origin Zone */}
              <div>
                <label className="label">Zona de Origen</label>
                <select
                  {...register('origin_zone', { required: 'Zona de origen requerida' })}
                  className="input-field"
                >
                  <option value="METRO">Ciudad de Guatemala</option>
                  <option value="INTERIOR">Interior</option>
                  <option value="FRONTERA">Zona Fronteriza</option>
                </select>
                {errors.origin_zone && (
                  <p className="text-red-500 text-sm mt-1">{errors.origin_zone.message}</p>
                )}
              </div>

              {/* Destination Zone */}
              <div>
                <label className="label">Zona de Destino</label>
                <select
                  {...register('destination_zone', { required: 'Zona de destino requerida' })}
                  className="input-field"
                >
                  <option value="METRO">Ciudad de Guatemala</option>
                  <option value="INTERIOR">Interior</option>
                  <option value="FRONTERA">Zona Fronteriza</option>
                </select>
                {errors.destination_zone && (
                  <p className="text-red-500 text-sm mt-1">{errors.destination_zone.message}</p>
                )}
              </div>

              {/* Service Type */}
              <div className="md:col-span-2">
                <label className="label">Tipo de Servicio</label>
                <select
                  {...register('service_type', { required: 'Tipo de servicio requerido' })}
                  className="input-field"
                >
                  <option value="STANDARD">Estándar (3-5 días)</option>
                  <option value="EXPRESS">Express (1-2 días)</option>
                  <option value="SAME_DAY">Mismo Día</option>
                </select>
                {errors.service_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.service_type.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Packages */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Package className="mr-2" />
                Paquetes ({fields.length})
              </h2>
              <button
                type="button"
                onClick={() => append({ weight_kg: '', description: '' })}
                className="btn-primary flex items-center text-sm"
              >
                <Plus size={16} className="mr-1" />
                Agregar Paquete
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Paquete {index + 1}</h3>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Peso (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`packages.${index}.weight_kg`, {
                          required: 'Peso requerido',
                          min: { value: 0.1, message: 'Peso mínimo 0.1 kg' },
                        })}
                        className="input-field"
                        placeholder="5.5"
                      />
                      {errors.packages?.[index]?.weight_kg && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.packages[index].weight_kg.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label">Descripción</label>
                      <input
                        type="text"
                        {...register(`packages.${index}.description`)}
                        className="input-field"
                        placeholder="Ej: Ropa, Libros, Electrónicos"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discount and Insurance */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Opciones Adicionales</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Discount Type */}
              <div>
                <label className="label">Tipo de Descuento</label>
                <select {...register('discount.type')} className="input-field">
                  <option value="PERCENTAGE">Porcentaje (%)</option>
                  <option value="FIXED">Monto Fijo (Q)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="label">Valor del Descuento</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('discount.value', {
                    min: { value: 0, message: 'El descuento no puede ser negativo' },
                  })}
                  className="input-field"
                  placeholder="0"
                />
                {errors.discount?.value && (
                  <p className="text-red-500 text-sm mt-1">{errors.discount.value.message}</p>
                )}
              </div>

              {/* Insurance */}
              <div className="md:col-span-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('insurance_enabled')}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="font-medium">
                    Incluir Seguro{' '}
                    <span className="text-gray-500 font-normal">
                      (Se agregará un cargo adicional)
                    </span>
                  </span>
                </label>
                {insuranceEnabled && (
                  <p className="text-sm text-quetzal-600 mt-2 ml-8">
                    ✓ Tu paquete estará protegido contra daños y pérdidas
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary px-8"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-8 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" text="" />
                  <span className="ml-2">Creando...</span>
                </>
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Crear Orden
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;
