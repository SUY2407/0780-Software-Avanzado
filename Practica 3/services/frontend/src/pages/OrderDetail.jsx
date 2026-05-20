import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  XCircle,
  ArrowLeft,
  Truck,
  RefreshCw,
  ArrowRightLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import { ordersAPI, fxAPI } from '../api/gateway';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  translateStatus,
  translateServiceType,
  translateZone,
  formatWeight,
} from '../utils/formatters';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  
  // Estados para conversión de moneda
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [convertedTotal, setConvertedTotal] = useState(null);
  const [converting, setConverting] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState('GTQ'); // Moneda actual mostrada

  const currencies = [
    { code: 'GTQ', name: 'Quetzal Guatemalteco', flag: '🇬🇹' },
    { code: 'USD', name: 'Dólar Estadounidense', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'Libra Esterlina', flag: '🇬🇧' },
    { code: 'MXN', name: 'Peso Mexicano', flag: '🇲🇽' },
  ];

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await ordersAPI.getOrder(orderId);
      setOrder(data);
      setCurrentCurrency('GTQ'); // Reset a moneda original
      setConvertedTotal(null);
    } catch (error) {
      toast.error('Error al cargar la orden');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!window.confirm('¿Estás seguro de cancelar esta orden?')) {
      return;
    }

    setCancelling(true);
    try {
      await ordersAPI.cancelOrder(orderId);
      toast.success('Orden cancelada exitosamente');
      fetchOrder();
    } catch (error) {
      toast.error('Error al cancelar la orden');
      console.error(error);
    } finally {
      setCancelling(false);
    }
  };

  const handleConvertCurrency = async () => {
    if (!order || selectedCurrency === currentCurrency) {
      toast.info('Ya estás viendo la orden en esa moneda');
      return;
    }

    setConverting(true);
    try {
      const response = await fxAPI.convertCurrency(
        parseFloat(order.total),
        currentCurrency,
        selectedCurrency
      );

      console.log('Conversion response:', response);

      // Normalizar respuesta (snake_case y camelCase)
      const convertedAmount = response.converted_amount || response.convertedAmount;
      const rate = response.rate;

      if (convertedAmount !== undefined && rate !== undefined) {
        setConvertedTotal({
          amount: convertedAmount,
          rate: rate,
          from: currentCurrency,
          to: selectedCurrency,
        });
        setCurrentCurrency(selectedCurrency);
        setShowCurrencyModal(false);
        toast.success(`Convertido a ${selectedCurrency} exitosamente`);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al convertir moneda');
    } finally {
      setConverting(false);
    }
  };

  const handleResetCurrency = () => {
    setCurrentCurrency('GTQ');
    setConvertedTotal(null);
    toast.info('Mostrando precio original en GTQ');
  };

  const getDisplayAmount = (amount) => {
    if (!amount) return 0;
    if (convertedTotal && currentCurrency !== 'GTQ') {
      // Calcular proporcionalmente
      const ratio = convertedTotal.amount / order.total;
      return amount * ratio;
    }
    return amount;
  };

  const formatDisplayCurrency = (amount) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currentCurrency,
      minimumFractionDigits: 2,
    }).format(getDisplayAmount(amount));
  };

  if (loading) {
    return <LoadingSpinner text="Cargando detalles de la orden..." />;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Orden no encontrada</h3>
          <Link to="/orders" className="btn-primary inline-flex items-center mt-4">
            <ArrowLeft size={18} className="mr-2" />
            Volver a Órdenes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center text-primary-600 hover:text-primary-700 mb-6 font-semibold"
      >
        <ArrowLeft size={20} className="mr-2" />
        Volver a Órdenes
      </button>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Orden #{order.order_id.slice(0, 8)}...</h1>
            <p className="text-gray-600 font-mono text-sm">{order.order_id}</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                order.status
              )} inline-block`}
            >
              {translateStatus(order.status)}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <Calendar className="text-primary-600 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Fecha de Creación</p>
              <p className="font-semibold">{formatDate(order.created_at)}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <DollarSign className="text-primary-600 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Total</p>
              <div className="flex items-center gap-3">
                <p className="font-bold text-2xl text-primary-600">
                  {formatDisplayCurrency(order.total)}
                </p>
                {convertedTotal && (
                  <button
                    onClick={handleResetCurrency}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    title="Ver precio original"
                  >
                    <RefreshCw size={14} />
                    GTQ
                  </button>
                )}
              </div>
              {convertedTotal && (
                <p className="text-xs text-gray-500 mt-1">
                  Tasa: 1 {convertedTotal.from} = {convertedTotal.rate.toFixed(4)} {convertedTotal.to}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Shipping Info */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Truck className="mr-2 text-primary-600" />
            Información de Envío
          </h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 pb-4 border-b">
              <MapPin className="text-quetzal-600 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Origen</p>
                <p className="font-semibold">{translateZone(order.origin_zone)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 pb-4 border-b">
              <MapPin className="text-red-600 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Destino</p>
                <p className="font-semibold">{translateZone(order.destination_zone)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Package className="text-primary-600 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Tipo de Servicio</p>
                <p className="font-semibold">{translateServiceType(order.service_type)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <DollarSign className="mr-2 text-primary-600" />
            Desglose de Precio
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Precio Base</span>
              <span className="font-semibold">
                {formatDisplayCurrency(order.breakdown?.base_subtotal || 0)}
              </span>
            </div>

            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Recargo por Servicio</span>
              <span className="font-semibold">
                {formatDisplayCurrency(
                  order.breakdown?.service_subtotal - order.breakdown?.base_subtotal || 0
                )}
              </span>
            </div>

            {order.breakdown?.fragile_surcharge > 0 && (
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Recargo Frágil</span>
                <span className="font-semibold">
                  {formatDisplayCurrency(order.breakdown.fragile_surcharge)}
                </span>
              </div>
            )}

            {order.breakdown?.insurance_surcharge > 0 && (
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Seguro</span>
                <span className="font-semibold">
                  {formatDisplayCurrency(order.breakdown.insurance_surcharge)}
                </span>
              </div>
            )}

            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">
                {formatDisplayCurrency(order.breakdown?.subtotal_with_surcharges || 0)}
              </span>
            </div>

            {order.breakdown?.discount_amount > 0 && (
              <div className="flex justify-between pb-3 border-b text-quetzal-600">
                <span>Descuento</span>
                <span className="font-semibold">
                  -{formatDisplayCurrency(order.breakdown.discount_amount)}
                </span>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatDisplayCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="card mt-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Package className="mr-2 text-primary-600" />
          Paquetes ({order.packages?.length || 0})
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {order.packages?.map((pkg, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Paquete {index + 1}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Peso:</span>
                  <span className="font-semibold">{formatWeight(pkg.weight_kg)}</span>
                </div>
                {pkg.description && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Descripción:</span>
                    <span className="font-semibold">{pkg.description}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={() => setShowCurrencyModal(true)}
          className="bg-quetzal-600 hover:bg-quetzal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <ArrowRightLeft size={18} className="mr-2" />
          Cambio de Moneda
        </button>

        <Link
          to={`/receipts/${order.order_id}`}
          className="btn-primary flex items-center justify-center"
        >
          <FileText size={18} className="mr-2" />
          Ver Recibo
        </Link>

        {order.status !== 'CANCELLED' && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {cancelling ? (
              <>
                <LoadingSpinner size="sm" text="" />
                <span className="ml-2">Cancelando...</span>
              </>
            ) : (
              <>
                <XCircle size={18} className="mr-2" />
                Cancelar Orden
              </>
            )}
          </button>
        )}
      </div>

      {/* Currency Conversion Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Convertir Moneda</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Moneda actual: {currentCurrency}</p>
              <p className="text-2xl font-bold text-primary-600 mb-4">
                {formatDisplayCurrency(order.total)}
              </p>
            </div>

            <div className="mb-6">
              <label className="label">Convertir a:</label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="input-field"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCurrencyModal(false)}
                className="btn-secondary flex-1"
                disabled={converting}
              >
                Cancelar
              </button>
              <button
                onClick={handleConvertCurrency}
                disabled={converting || selectedCurrency === currentCurrency}
                className="btn-primary flex-1 flex items-center justify-center"
              >
                {converting ? (
                  <>
                    <LoadingSpinner size="sm" text="" />
                    <span className="ml-2">Convirtiendo...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightLeft size={18} className="mr-2" />
                    Convertir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
