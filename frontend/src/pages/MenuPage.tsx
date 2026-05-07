import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { MapPin, Search } from 'lucide-react'
import { useMenu } from '@/hooks/useMenu'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { CategoryPills } from '@/components/menu/CategoryPills'
import { CartFAB } from '@/components/cart/CartFAB'
import { Skeleton, EmptyState } from '@/components/ui'
import { useCart } from '@/context/CartContext'

export default function MenuPage() {
  const [params] = useSearchParams()
  const tableNumber = params.get('table') || '1'
  const navigate = useNavigate()
  const { items, categories, loading } = useMenu()
  const { count, total } = useCart()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = items
    if (activeCategory) list = list.filter(i => i.category_id === activeCategory)
    if (search) list = list.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [items, activeCategory, search])

  return (
    <div className="min-h-dvh bg-[var(--color-surface)] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 glass px-4 pt-safe-top">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              <span className="text-[var(--color-primary)]">Warkop</span>
              <span className="text-[var(--color-accent)]"> QR</span>
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">Menu & Pemesanan</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-3 py-1.5 rounded-full">
            <MapPin size={13} strokeWidth={2.5} />
            <span className="text-xs font-bold">Meja {tableNumber}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari menu..."
            className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-full pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {/* Categories */}
        <div className="pb-3">
          <CategoryPills categories={categories} active={activeCategory} onChange={setActiveCategory} />
        </div>
      </div>

      {/* Menu Grid */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <Skeleton className="aspect-[4/3] rounded-none" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<span className="text-5xl">🍽️</span>}
            title="Menu tidak ditemukan"
            description="Coba kata kunci lain atau pilih kategori berbeda"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(item => <MenuItemCard key={item.id} item={item} />)}
          </div>
        )}
      </div>

      {/* Cart FAB */}
      <CartFAB onClick={() => navigate(`/checkout?table=${tableNumber}`)} />

      {/* Cart summary bar */}
      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 glass border-t border-[var(--color-border)]">
          <button
            onClick={() => navigate(`/checkout?table=${tableNumber}`)}
            className="btn-accent w-full text-base"
          >
            <span>Lihat Keranjang ({count} item)</span>
            <span className="ml-auto font-bold">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total)}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
