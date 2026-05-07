import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const baseClass = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
      primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white',
      accent: 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-[var(--color-surface)] font-bold',
      ghost: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]',
      danger: 'bg-[var(--color-danger)] hover:bg-red-600 text-white',
    }
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }
    return (
      <button ref={ref} className={cn(baseClass, variants[variant], sizes[size], className)} {...props}>
        {children}
      </button>
    )
  }
)
