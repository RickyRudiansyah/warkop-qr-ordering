import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui'
import { UtensilsCrossed, User, Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Mock login — replace with real API call
    setTimeout(() => {
      if (username && password) {
        const mockUser = {
          id: '1',
          name: username,
          role: username.includes('owner') ? 'owner' as const :
                username.includes('koki') ? 'koki' as const :
                'cashier' as const,
          token: 'mock_token',
        }
        login(mockUser)
        const redirect = mockUser.role === 'koki' ? '/dashboard/kitchen' :
                        mockUser.role === 'owner' ? '/dashboard/owner' :
                        '/dashboard/cashier'
        navigate(redirect)
        toast.success(`Selamat datang, ${mockUser.name}!`)
      } else {
        toast.error('Username atau password salah')
      }
      setLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface-2)] to-[var(--color-surface)]">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Login card */}
      <div className="glass rounded-3xl p-8 w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
            <UtensilsCrossed size={32} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold">
              <span className="text-[var(--color-primary)]">Warkop</span>
              <span className="text-[var(--color-accent)]"> QR</span>
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">Staff Dashboard</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? <Spinner size={20} /> : 'Masuk'}
          </Button>
        </form>

        {/* Demo hint */}
        <div className="mt-6 p-3 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            💡 Demo: username "owner", "cashier", atau "koki" dengan password apa saja
          </p>
        </div>
      </div>
    </div>
  )
}
