import { Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { 
  ShoppingCartIcon, 
  UserCircleIcon, 
  Bars3Icon, 
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'

import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuthStore()
  const cartItems = useCartStore((state) => state.items)
  
  // Calculamos la cantidad total de items (no solo líneas, sino cantidad total)
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* LOGO */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-primary-600 text-white p-1.5 rounded-lg">
                <ShoppingBagIcon className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                EconoMarket
              </span>
            </Link>
          </div>

          {/* MENÚ DERECHO (Carrito + Usuario) */}
          <div className="flex items-center gap-4">
            
            {/* CARRITO (Visible siempre) */}
            <Link to="/cart" className="relative group p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <ShoppingCartIcon className="h-7 w-7" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full min-w-[1.25rem]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* MENÚ DE USUARIO */}
            {isAuthenticated() ? (
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex items-center gap-2 max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 p-1 hover:bg-gray-50 transition-colors">
                    <span className="sr-only">Abrir menú de usuario</span>
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <span className="hidden md:block text-sm font-medium text-gray-700 pr-2">
                      Hola, {user?.first_name}
                    </span>
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    
                    {/* ENLACE NUEVO: MIS ÓRDENES */}
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/orders"
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm text-gray-700'
                          )}
                        >
                          Mis Órdenes
                        </Link>
                      )}
                    </Menu.Item>

                    {/* Link Admin (Solo si es admin) */}
                    {user?.role === 'admin' && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/admin"
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm text-blue-600 font-semibold'
                            )}
                          >
                            Panel Admin
                          </Link>
                        )}
                      </Menu.Item>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>

                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block w-full text-left px-4 py-2 text-sm text-red-600 flex items-center gap-2'
                          )}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          Cerrar Sesión
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-all"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
