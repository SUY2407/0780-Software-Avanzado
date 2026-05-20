import { Link } from 'react-router-dom';
import { Package, Zap, Shield, TrendingUp } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Zap className="w-12 h-12 text-primary-600" />,
      title: 'Envíos Rápidos',
      description: 'Entrega express en 24-48 horas a todo el país',
    },
    {
      icon: <Shield className="w-12 h-12 text-primary-600" />,
      title: 'Seguro Incluido',
      description: 'Protección completa para tus paquetes',
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-primary-600" />,
      title: 'Tracking en Tiempo Real',
      description: 'Rastrea tu paquete en todo momento',
    },
    {
      icon: <Package className="w-12 h-12 text-primary-600" />,
      title: 'Múltiples Paquetes',
      description: 'Envía varios paquetes en una sola orden',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Envíos Seguros por <span className="text-quetzal-300">Guatemala</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              La forma más rápida y confiable de enviar tus paquetes a cualquier parte del país
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/orders/create"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors text-center"
              >
                Crear Orden Ahora
              </Link>
              <Link
                to="/orders"
                className="bg-primary-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-800 transition-colors text-center border-2 border-white"
              >
                Ver Mis Órdenes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          ¿Por qué elegir QuetzalShip?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center hover:scale-105 transition-transform">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold text-primary-600 mb-2">10K+</p>
              <p className="text-gray-600 text-lg">Paquetes Entregados</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-primary-600 mb-2">98%</p>
              <p className="text-gray-600 text-lg">Satisfacción del Cliente</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-primary-600 mb-2">24/7</p>
              <p className="text-gray-600 text-lg">Soporte Disponible</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-quetzal-600 to-quetzal-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para enviar tu paquete?
          </h2>
          <p className="text-xl mb-8 text-quetzal-100">
            Crea tu orden en menos de 2 minutos
          </p>
          <Link
            to="/orders/create"
            className="inline-block bg-white text-quetzal-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Empezar Ahora
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
