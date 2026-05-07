import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types'

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles: UserRole[] }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) {
    const redirect = user.role === 'koki' ? '/dashboard/kitchen' : '/dashboard/cashier'
    return <Navigate to={redirect} replace />
  }
  return <>{children}</>
}
