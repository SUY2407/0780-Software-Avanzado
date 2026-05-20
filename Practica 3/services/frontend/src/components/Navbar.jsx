import { Link, useLocation } from 'react-router-dom';
import { Package, Home, List, Calculator, FileText } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary-700' : '';
  };

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl">
            <Package size={32} />
            <span>QuetzalShip</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors ${isActive('/')}`}
            >
              <Home size={18} />
              <span>Inicio</span>
            </Link>

            <Link
              to="/orders/create"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors ${isActive('/orders/create')}`}
            >
              <Package size={18} />
              <span>Nueva Orden</span>
            </Link>

            <Link
              to="/orders"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors ${isActive('/orders')}`}
            >
              <List size={18} />
              <span>Mis Órdenes</span>
            </Link>

            <Link
              to="/converter"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors ${isActive('/converter')}`}
            >
              <Calculator size={18} />
              <span>Conversor</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
