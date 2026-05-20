import { useState, useEffect } from 'react'
import { 
  UserGroupIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon,
  TruckIcon 
} from '@heroicons/react/24/outline'

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProviders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    // Aquí cargarías las estadísticas desde el backend
    setStats({
      totalClients: 150,
      totalProviders: 25,
      totalProducts: 342,
      totalRevenue: 45680.50,
    })
  }, [])

  const statCards = [
    {
      title: 'Total Clientes',
      value: stats.totalClients,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Proveedores',
      value: stats.totalProviders,
      icon: TruckIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Productos',
      value: stats.totalProducts,
      icon: ShoppingBagIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'Ingresos Totales',
      value: `Q${stats.totalRevenue.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido al panel de administración de EconoMarket
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Nueva orden #{1000 + i}</p>
                <p className="text-sm text-gray-500">Cliente: Juan Pérez</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">Q150.00</p>
                <p className="text-sm text-gray-500">Hace 2 horas</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
