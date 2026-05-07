import type { Category } from '@/types'

export function CategoryPills({ categories, active, onChange }: {
  categories: Category[]
  active: string | null
  onChange: (id: string | null) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
      <button
        onClick={() => onChange(null)}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
          active === null
            ? 'bg-[var(--color-primary)] text-white'
            : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
        }`}
      >
        Semua
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            active === cat.id
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
