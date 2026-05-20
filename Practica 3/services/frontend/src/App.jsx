import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CreateOrder from './pages/CreateOrder';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import Receipt from './pages/Receipt';
import CurrencyConverter from './pages/CurrencyConverter';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/orders/create" element={<CreateOrder />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/receipts/:orderId" element={<Receipt />} />
            <Route path="/converter" element={<CurrencyConverter />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

// 404 Page
const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="card text-center py-12">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Página no encontrada</h2>
        <p className="text-gray-500 mb-6">La página que buscas no existe</p>
        <a href="/" className="btn-primary inline-block">
          Volver al Inicio
        </a>
      </div>
    </div>
  );
};

export default App;
