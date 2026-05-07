import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'info'

const badgeColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)]',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  danger: 'bg-red-500/20 text-red-400',
  accent: 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]',
  info: 'bg-blue-500/20 text-blue-400',
}

export function Badge({ variant = 'default', className, children }: {
  variant?: BadgeVariant; className?: string; children: React.ReactNode
}) {
  return (
    <span className={cn('badge', badgeColors[variant], className)}>
      {children}
    </span>
  )
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function EmptyState({ icon, title, description }: {
  icon: React.ReactNode; title: string; description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="text-[var(--color-text-muted)] opacity-40">{icon}</div>
      <p className="font-semibold text-[var(--color-text-muted)]">{title}</p>
      {description && <p className="text-sm text-[var(--color-text-muted)] opacity-70">{description}</p>}
    </div>
  )
}
