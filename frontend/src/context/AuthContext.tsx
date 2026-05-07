import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { AuthUser } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem('auth_user') || 'null') } catch { return null }
  })

  useEffect(() => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user))
    else localStorage.removeItem('auth_user')
  }, [user])

  const login = (u: AuthUser) => setUser(u)
  const logout = () => setUser(null)

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
