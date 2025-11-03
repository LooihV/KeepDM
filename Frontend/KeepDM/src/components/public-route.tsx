import { Navigate } from 'react-router-dom'
import { authService } from '@/api/services/auth.service'

interface PublicRouteProps {
  children: React.ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const token = authService.getToken()

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
