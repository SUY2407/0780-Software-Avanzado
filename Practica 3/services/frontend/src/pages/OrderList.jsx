import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { ordersAPI } from '../api/gateway';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  formatCurrency,
  formatDateShort,
  getStatusColor,
  translateStatus,
  translateServiceType,
  translateZone,
} from '../utils/formatters';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.listOrders();
      console.log('API Response:', response); // Debug

      // Manejar diferentes formatos de respuesta
      let ordersList = [];
      
      if (Array.isArray(response)) {
        // Si la respuesta es directamente un array
        ordersList = response;
      } else if (response.orders && Array.isArray(response.orders)) {
        // Si la respuesta tiene una propiedad 'orders' que es un array
        ordersList = response.orders;
      } else if (response.data && Array.isArray(response.data)) {
        // Si la respuesta tiene una propiedad 'data' que es un array
        ordersList = response.data;
      } else if (typeof response === 'object') {
        // Si la respuesta es un objeto con órdenes individuales
        ordersList = Object.values(response);
      }

      setOrders(ordersList);
      setFilteredOrders(ordersList);
      toast.success(`${ordersList.length} órdenes cargadas`);
    } catch (error) {
      toast.error('Error al cargar las órdenes');
      console.error('Error:', error);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) =>
        order.order_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  if (loading) {
    return <LoadingSpinner text="Cargando órdenes..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Órdenes</h1>
        <p className="text-gray-600">Gestiona y consulta tus órdenes de envío</p>
      </div>

      {/* Search and Actions */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por ID de orden..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={fetchOrders}
            className="btn-secondary flex items-center whitespace-nowrap"
          >
            <RefreshCw size={18} className="mr-2" />
            Actualizar
          </button>
          <Link to="/orders/create" className="btn-primary flex items-center whitespace-nowrap">
            <Package size={18} className="mr-2" />
            Nueva Orden
          </Link>
        </div>
      </div>

      {/* Orders List */}
      {!filteredOrders || filteredOrders.length === 0 ? (
        <div className="card text-center py-12">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay órdenes</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'No se encontraron órdenes con ese ID' : 'Crea tu primera orden de envío'}
          </p>
          {!searchTerm && (
            <Link to="/orders/create" className="btn-primary inline-flex items-center">
              <Package size={18} className="mr-2" />
              Crear Primera Orden
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <div key={order.order_id} className="card hover:shadow-xl transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-mono text-sm text-gray-500">
                      #{order.order_id?.slice(0, 8) || 'N/A'}...
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status || 'PENDING'
                      )}`}
                    >
                      {translateStatus(order.status || 'PENDING')}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Origen</p>
                      <p className="font-semibold">{translateZone(order.origin_zone || order.origin || 'N/A')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Destino</p>
                      <p className="font-semibold">{translateZone(order.destination_zone || order.destination || 'N/A')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Servicio</p>
                      <p className="font-semibold">{translateServiceType(order.service_type || 'STANDARD')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📦 {order.packages?.length || 0} paquete(s)</span>
                    <span>📅 {order.created_at ? formatDateShort(order.created_at) : 'N/A'}</span>
                    <span className="font-bold text-primary-600">
                      {order.total ? formatCurrency(order.total) : 'GTQ 0.00'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex gap-2">
                  <Link
                    to={`/orders/${order.order_id}`}
                    className="btn-primary flex items-center text-sm"
                  >
                    <Eye size={16} className="mr-1" />
                    Ver Detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredOrders && filteredOrders.length > 0 && (
        <div className="card mt-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total de órdenes:</span>
            <span className="text-2xl font-bold text-primary-600">{filteredOrders.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
