import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { AuthUser } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem('auth_user') || 'null') } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setUser(null)
        localStorage.removeItem('auth_user')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
        localStorage.removeItem('auth_user')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw new Error('Email atau password salah')

      const { data: staffData, error: staffError } = await supabase
        .from('staff_users')
        .select('id, name, role, is_active')
        .eq('email', email)
        .single()

      if (staffError || !staffData) throw new Error('Data staff tidak ditemukan')
      if (!staffData.is_active) throw new Error('Akun tidak aktif')

      const authUser: AuthUser = {
        id: authData.user.id,
        name: staffData.name,
        role: staffData.role,
        token: authData.session?.access_token ?? '',
      }

      setUser(authUser)
      localStorage.setItem('auth_user', JSON.stringify(authUser))
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}