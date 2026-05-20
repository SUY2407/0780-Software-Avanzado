import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import AdminProducts from './admin/AdminProducts' 

// Componente simple para la bienvenida
const DashboardHome = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">Bienvenido al Panel de Control</h2>
    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
      <h3 className="text-lg font-semibold text-blue-700">Gestión de Inventario</h3>
      <p className="text-gray-600 mt-2">
        Desde aquí puedes administrar todos los productos de la tienda. 
        Usa el menú lateral para acceder al catálogo.
      </p>
    </div>
  </div>
)

export default function AdminDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore(state => state.logout)

  // AQUÍ ESTÁ EL CAMBIO: Solo dejamos Inicio y Productos
  const menuItems = [
    { path: '/admin', icon: HomeIcon, label: 'Inicio', exact: true },
    { path: '/admin/products', icon: ShoppingBagIcon, label: 'Productos' },
  ]

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Administración
          </h2>
        </div>
        
        <nav className="flex-1 space-y-1 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive(item.path, item.exact)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
          >
            <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
            Cerrar Sesión Admin
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="products" element={<AdminProducts />} />
          {/* Eliminadas las rutas de customers y providers */}
        </Routes>
      </main>
    </div>
  )
}
