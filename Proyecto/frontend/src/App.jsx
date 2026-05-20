import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import StorePage from './pages/StorePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/AdminDashboard'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import PaymentPage from './pages/PaymentPage'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<StorePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="cart" element={<CartPage />} />
          {/* Rutas de Compras (Clientes y Proveedores pueden comprar) */}
          <Route path="orders" element={
            <ProtectedRoute roles={['cliente', 'proveedor']}>
              <OrdersPage />
            </ProtectedRoute>
          } />
          
          <Route path="payment/:orderId" element={
            <ProtectedRoute roles={['cliente', 'proveedor']}>
              <PaymentPage />
            </ProtectedRoute>
          } />

          

          {/* Ruta de Gestión (SOLO PROVEEDOR) */}
          <Route path="admin/*" element={
            <ProtectedRoute roles={['proveedor']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
