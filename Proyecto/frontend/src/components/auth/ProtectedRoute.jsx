import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Debes iniciar sesión para acceder a esta página')
    } else if (roles.length > 0 && !roles.includes(user?.role)) {
      toast.error('No tienes permisos para acceder a esta página')
    }
  }, [])

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}