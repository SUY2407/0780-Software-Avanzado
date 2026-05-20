import { useState, useEffect } from 'react';
import type { Order, Package } from './types';
import { api } from './services/api';
import './App.css';

const initialPackage: Package = {
  weight_kg: 1, height_cm: 10, width_cm: 10, length_cm: 10,
  fragile: false, declared_value_q: 0
};

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [receipt, setReceipt] = useState<any>(null);

  // Formulario State
  const [newOrder, setNewOrder] = useState<Order>({
    origin_zone: 'METRO',
    destination_zone: 'METRO',
    service_type: 'STANDARD',
    insurance_enabled: false,
    discount: { type: 'NONE', value: 0 },
    packages: [{ ...initialPackage }]
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.listOrders();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que si el seguro está habilitado, todos los valores declarados sean mayores a 0
    if (newOrder.insurance_enabled) {
      const hasInvalidValues = newOrder.packages.some((pkg: Package) => pkg.declared_value_q <= 0);
      if (hasInvalidValues) {
        alert('Cuando el seguro está habilitado, todos los paquetes deben tener un valor declarado mayor a 0');
        return;
      }
    }

    // Validar descuento porcentual (máximo 35%)
    if (newOrder.discount?.type === 'PERCENT' && newOrder.discount.value > 35) {
      alert('El descuento porcentual no puede ser mayor al 35%');
      return;
    }

    // Validar descuento fijo no negativo
    if (newOrder.discount?.type === 'FIXED' && newOrder.discount.value < 0) {
      alert('El descuento fijo no puede ser negativo');
      return;
    }

    setLoading(true);
    try {
      const created = await api.createOrder(newOrder);
      // alert(`Orden creada: ${created.order_id} - Total: Q${created.total}`); // Alert es molesto
      fetchOrders();
      // Reseteamos form o seleccionamos la creada
      setNewOrder({ ...newOrder, packages: [{...initialPackage}] }); // reset packages
    } catch (error) {
      alert('Error al crear orden (Revisar consola)');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageChange = (index: number, field: string, value: any) => {
    const updatedPkgs = [...newOrder.packages];
    updatedPkgs[index] = { ...updatedPkgs[index], [field]: value };
    setNewOrder({ ...newOrder, packages: updatedPkgs });
  };

  const addPackage = () => {
    setNewOrder({ ...newOrder, packages: [...newOrder.packages, { ...initialPackage }] });
  };

  const viewDetails = async (id: string) => {
    setSelectedOrder(null);
    setReceipt(null);
    const order = await api.getOrder(id);
    setSelectedOrder(order);
  };

  const viewReceipt = async (id: string) => {
    const rec = await api.getReceipt(id);
    setReceipt(rec);
  };

  const cancelOrder = async (id: string) => {
    if (!confirm('¿Seguro de cancelar esta orden?')) return;
    try {
      await api.cancelOrder(id);
      fetchOrders();
      if (selectedOrder?.order_id === id) {
        const updated = { ...selectedOrder, status: 'CANCELLED' };
        setSelectedOrder(updated);
      }
    } catch (error) {
      alert('Error al cancelar');
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>🚢 Quetzal Ship</h1>
        <div className="user-info">
          <span>Sistema de Gestión v2.0</span>
        </div>
      </header>

      <div className="main-grid">
        {/* COLUMNA IZQUIERDA: CREAR ORDEN */}
        <section className="card">
          <h2>📦 Nueva Orden</h2>
          <form onSubmit={handleCreate}>
            <div className="row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Origen</label>
                <select value={newOrder.origin_zone} onChange={e => setNewOrder({...newOrder, origin_zone: e.target.value})}>
                  <option value="METRO">Metro</option>
                  <option value="INTERIOR">Interior</option>
                  <option value="FRONTERA">Frontera</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Destino</label>
                <select value={newOrder.destination_zone} onChange={e => setNewOrder({...newOrder, destination_zone: e.target.value})}>
                  <option value="METRO">Metro</option>
                  <option value="INTERIOR">Interior</option>
                  <option value="FRONTERA">Frontera</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Tipo de Servicio</label>
              <select value={newOrder.service_type} onChange={e => setNewOrder({...newOrder, service_type: e.target.value})}>
                <option value="STANDARD">Standard (x1.0)</option>
                <option value="EXPRESS">Express (x1.35)</option>
                <option value="SAME_DAY">Same Day (x1.80)</option>
              </select>
            </div>
            
            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ margin: 0 }}>Paquetes ({newOrder.packages.length})</label>
              <button type="button" className="btn-small btn-outline" onClick={addPackage}>+ Agregar</button>
            </div>

            {newOrder.packages.map((pkg, i) => (
              <div key={i} className="package-item">
                <h4>Paquete #{i + 1}</h4>
                <div className="row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Peso (kg)</label>
                    <input type="number" placeholder="Peso (kg)" value={pkg.weight_kg} onChange={e => handlePackageChange(i, 'weight_kg', parseFloat(e.target.value))} required min="0.01" step="0.01" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Valor Declarado (Q)</label>
                    <input type="number" placeholder="Valor (Q)" value={pkg.declared_value_q} onChange={e => handlePackageChange(i, 'declared_value_q', parseFloat(e.target.value))} required min="0" />
                  </div>
                </div>
                <div className="row" style={{ marginTop: 5 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Alto (cm)</label>
                    <input type="number" placeholder="Alto" value={pkg.height_cm} onChange={e => handlePackageChange(i, 'height_cm', parseFloat(e.target.value))} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Ancho (cm)</label>
                    <input type="number" placeholder="Ancho" value={pkg.width_cm} onChange={e => handlePackageChange(i, 'width_cm', parseFloat(e.target.value))} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Largo (cm)</label>
                    <input type="number" placeholder="Largo" value={pkg.length_cm} onChange={e => handlePackageChange(i, 'length_cm', parseFloat(e.target.value))} required />
                  </div>
                </div>
                <div className="checkbox-group">
                  <input type="checkbox" id={`fragile-${i}`} checked={pkg.fragile} onChange={e => handlePackageChange(i, 'fragile', e.target.checked)} />
                  <label htmlFor={`fragile-${i}`} style={{ fontWeight: 'normal', margin: 0, fontSize: '0.9rem' }}>Es frágil (+7Q)</label>
                </div>
              </div>
            ))}

            <div className="form-group checkbox-group" style={{ background: '#e3f2fd', padding: 10, borderRadius: 6 }}>
              <input type="checkbox" id="insurance" checked={newOrder.insurance_enabled} onChange={e => setNewOrder({...newOrder, insurance_enabled: e.target.checked})} />
              <label htmlFor="insurance" style={{ margin: 0 }}>Habilitar Seguro (2.5% valor declarado)</label>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

            <div style={{ background: '#fff3e0', padding: 15, borderRadius: 6 }}>
              <label style={{ display: 'block', marginBottom: 10, fontWeight: 'bold' }}>Descuento</label>

              <div className="form-group">
                <label>Tipo de Descuento</label>
                <select
                  value={newOrder.discount?.type || 'NONE'}
                  onChange={e => setNewOrder({
                    ...newOrder,
                    discount: { type: e.target.value, value: e.target.value === 'NONE' ? 0 : newOrder.discount?.value || 0 }
                  })}
                >
                  <option value="NONE">Sin descuento</option>
                  <option value="PERCENT">Porcentual (%)</option>
                  <option value="FIXED">Monto fijo (Q)</option>
                </select>
              </div>

              {newOrder.discount?.type !== 'NONE' && (
                <div className="form-group">
                  <label>
                    {newOrder.discount?.type === 'PERCENT' ? 'Porcentaje (máx. 35%)' : 'Monto en Quetzales'}
                  </label>
                  <input
                    type="number"
                    value={newOrder.discount?.value || 0}
                    onChange={e => setNewOrder({
                      ...newOrder,
                      discount: { ...newOrder.discount!, value: parseFloat(e.target.value) || 0 }
                    })}
                    min="0"
                    max={newOrder.discount?.type === 'PERCENT' ? 35 : undefined}
                    step={newOrder.discount?.type === 'PERCENT' ? '1' : '0.01'}
                    placeholder={newOrder.discount?.type === 'PERCENT' ? 'Ej: 10' : 'Ej: 50.00'}
                  />
                  {newOrder.discount?.type === 'PERCENT' && (
                    <small style={{ color: '#666', fontSize: '0.85rem', marginTop: 5, display: 'block' }}>
                      Descuento máximo permitido: 35%
                    </small>
                  )}
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Procesando...' : 'Crear Orden'}
            </button>
          </form>
        </section>

        {/* COLUMNA DERECHA: LISTA Y DETALLES */}
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2>📋 Historial</h2>
            <button className="btn-small btn-secondary" onClick={fetchOrders}>Actualizar</button>
          </div>
          
          <ul className="order-list">
            {orders.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>No hay órdenes aún.</p>}
            {orders.map(o => (
              <li key={o.order_id} className="order-item">
                <div className="order-info">
                  <strong>ID: ...{o.order_id?.slice(-8)}</strong>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>{o.origin_zone} ➝ {o.destination_zone}</span>
                  <div style={{ marginTop: 4 }}>
                    <span className={`order-status status-${o.status}`}>{o.status}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 5 }}>Q{o.total?.toFixed(2)}</div>
                  <div>
                    <button className="btn-small btn-outline" onClick={() => viewDetails(o.order_id!)} style={{ marginRight: 5 }}>Ver</button>
                    {o.status === 'ACTIVE' && (
                      <button className="btn-small btn-danger" onClick={() => cancelOrder(o.order_id!)}>Cancelar</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {selectedOrder && (
            <div className="detail-view">
              <h3>🔍 Detalle de Orden</h3>
              <p><strong>ID Completo:</strong> {selectedOrder.order_id}</p>
              
              {selectedOrder.breakdown && (
                <table className="breakdown-table">
                  <tbody>
                    <tr><td>Subtotal Base:</td><td align="right">Q{selectedOrder.breakdown.base_subtotal}</td></tr>
                    <tr><td>Servicio ({selectedOrder.service_type}):</td><td align="right">Q{selectedOrder.breakdown.service_subtotal}</td></tr>
                    <tr><td>Recargo Frágil:</td><td align="right">+Q{selectedOrder.breakdown.fragile_surcharge}</td></tr>
                    <tr><td>Recargo Seguro:</td><td align="right">+Q{selectedOrder.breakdown.insurance_surcharge}</td></tr>
                    {selectedOrder.breakdown.discount_amount > 0 && (
                      <tr style={{ color: '#2e7d32' }}>
                        <td>
                          Descuento
                          {selectedOrder.discount?.type === 'PERCENT' && ` (${selectedOrder.discount.value}%)`}
                          {selectedOrder.discount?.type === 'FIXED' && ' (Fijo)'}:
                        </td>
                        <td align="right">-Q{selectedOrder.breakdown.discount_amount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="breakdown-total"><td>TOTAL FINAL:</td><td align="right">Q{selectedOrder.breakdown.total}</td></tr>
                  </tbody>
                </table>
              )}
              
              <button className="btn-primary" onClick={() => viewReceipt(selectedOrder.order_id!)}>🧾 Generar Recibo Oficial</button>
              
              {receipt && (
                <div className="receipt-box animate-fade-in">
                  <div className="receipt-header">QUETZAL SHIP - RECIBO OFICIAL</div>
                  <div><strong>FECHA:</strong> {receipt.generated_at}</div>
                  <div><strong>ORDEN:</strong> {receipt.order_id}</div>
                  <hr style={{ borderStyle: 'dashed', borderColor: '#bbb' }}/>
                  <div style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>
                    {receipt.content_body}
                  </div>
                  <div style={{ marginTop: 10, fontStyle: 'italic', textAlign: 'center', fontSize: '0.8rem' }}>
                    *** Gracias por su preferencia ***
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
