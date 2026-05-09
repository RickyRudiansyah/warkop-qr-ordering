import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LayoutDashboard, ChefHat, UtensilsCrossed, LogOut, PlusCircle, BookOpen, QrCode } from 'lucide-react'

const navItems = [
  { path: '/dashboard/cashier', label: 'Kasir', icon: <LayoutDashboard size={20} />, roles: ['cashier', 'owner'] },
  { path: '/dashboard/kitchen', label: 'Dapur', icon: <ChefHat size={20} />, roles: ['koki', 'cashier', 'owner'] },
  { path: '/dashboard/owner', label: 'Menu', icon: <BookOpen size={20} />, roles: ['owner'] },
  { path: '/dashboard/cashier/new-order', label: 'Order Manual', icon: <PlusCircle size={20} />, roles: ['cashier', 'owner'] },
  { path: '/dashboard/qr', label: 'QR Code', icon: <QrCode size={20} />, roles: ['cashier', 'owner'] },
]

export function DashboardLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const visibleNav = navItems.filter(n => user && n.roles.includes(user.role))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-dvh flex bg-[var(--color-surface)]">
      {/* Sidebar */}
      <aside className="w-16 lg:w-56 shrink-0 bg-[var(--color-surface-2)] border-r border-[var(--color-border)] flex flex-col">
        <div className="p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shrink-0">
              <UtensilsCrossed size={16} className="text-white" />
            </div>
            <div className="hidden lg:block">
              <p className="font-bold text-sm leading-tight">Warkop QR</p>
              <p className="text-xs text-[var(--color-text-muted)] capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {visibleNav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]'
              }`}
            >
              {item.icon}
              <span className="hidden lg:block text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-[var(--color-border)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={20} />
            <span className="hidden lg:block text-sm font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[var(--color-border)] flex items-center justify-between px-6 bg-[var(--color-surface-2)] shrink-0">
          <h1 className="font-bold text-lg">{title}</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
            <span className="text-sm text-[var(--color-text-muted)]">{user?.name}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}