import { Navigate } from 'react-router-dom'
import { authService } from '@/api/services/auth.service'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = authService.getToken()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
