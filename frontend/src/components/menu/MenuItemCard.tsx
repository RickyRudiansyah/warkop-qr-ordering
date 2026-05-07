import { useState } from 'react'
import { formatRupiah } from '@/lib/utils'
import type { MenuItem } from '@/types'
import { MenuItemSheet } from './MenuItemSheet'

export function MenuItemCard({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => !item.is_sold_out && setOpen(true)}
        className={`card text-left w-full overflow-hidden transition-all duration-200 ${item.is_sold_out ? 'opacity-50 cursor-not-allowed' : 'hover:border-[var(--color-primary)] hover:scale-[1.02] active:scale-[0.98]'}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-surface-3)]">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🍜</div>
          )}
          {item.is_sold_out && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="badge bg-red-500/90 text-white text-xs font-bold px-3 py-1">HABIS</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="font-semibold text-sm leading-tight line-clamp-2">{item.name}</p>
          {item.description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-1">{item.description}</p>
          )}
          <p className="text-[var(--color-accent)] font-bold text-sm mt-2">{formatRupiah(item.price)}</p>
        </div>
      </button>
      {open && <MenuItemSheet item={item} onClose={() => setOpen(false)} />}
    </>
  )
}
