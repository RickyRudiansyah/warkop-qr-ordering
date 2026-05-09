import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Spinner, Badge } from '@/components/ui'
import { formatRupiah } from '@/lib/utils'
import { Plus, Minus, Trash2, Search, ShoppingBag, ChevronRight } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import type { MenuItem, Table, CartItem, PaymentMethod } from '@/types'

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: '💵 Cash',
  QRIS: '📱 QRIS',
  TRANSFER_BCA: '🏦 Transfer',
}

export default function ManualOrderPage() {
  const navigate = useNavigate()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [tableId, setTableId] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('CASH')
  const [notes, setNotes] = useState('')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([api.get<MenuItem[]>('/menu'), api.get<Table[]>('/tables')])
      .then(([m, t]) => { setMenuItems(m.data); setTables(t.data) })
      .finally(() => setLoading(false))
  }, [])

  const categories: { id: string; name: string }[] = [
    { id: 'all', name: 'Semua' },
    ...Array.from(
      new Map(
        menuItems.flatMap(i => {
          const cat = i.categories
          if (!cat) return []
          return [[cat.id, { id: cat.id, name: cat.name }]] as [string, { id: string; name: string }][]
        })
      ).values()
    )
  ]

  const filtered = menuItems.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'all' || i.category_id === activeCategory
    return matchSearch && matchCat
  })

  const addToCart = (item: MenuItem) => {
    if (item.is_sold_out) return
    setCart(prev => {
      const idx = prev.findIndex(c => c.menu_item_id === item.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + 1,
          subtotal: updated[idx].subtotal + item.price,
        }
        return updated
      }
      return [...prev, {
        menu_item_id: item.id,
        menu_item_name: item.name,
        menu_item_price: item.price,
        quantity: 1,
        variations: [],
        subtotal: item.price,
      }]
    })
    toast.success(`${item.name} ditambahkan`, { duration: 1000 })
  }

  const updateQty = (idx: number, qty: number) => {
    if (qty <= 0) return setCart(prev => prev.filter((_, i) => i !== idx))
    setCart(prev => prev.map((item, i) =>
      i === idx ? { ...item, quantity: qty, subtotal: item.menu_item_price * qty } : item
    ))
  }

  const cartQty = (menuItemId: string) => cart.find(c => c.menu_item_id === menuItemId)?.quantity ?? 0
  const total = cart.reduce((s, i) => s + i.subtotal, 0)
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)

  // ── Fix: label meja yang clean
  const tableLabel = (t: Table) =>
    t.label && t.label !== `Meja ${t.table_number}`
      ? `Meja ${t.table_number} — ${t.label}`
      : `Meja ${t.table_number}`

  const handleSubmit = async () => {
    if (!tableId) return toast.error('Pilih nomor meja dulu')
    if (cart.length === 0) return toast.error('Tambahkan item ke pesanan')
    setSubmitting(true)
    try {
      await api.post('/orders', {
        table_id: tableId,
        payment_method: payment,
        total_amount: total,
        notes: notes || undefined,
        items: cart,
      })
      toast.success('Pesanan berhasil dibuat! 🎉')
      navigate('/dashboard/cashier')
    } catch {
      toast.error('Gagal membuat pesanan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Input Order Manual">
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] gap-6 h-full">

        {/* ── LEFT: Menu Picker ── */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari menu..."
              className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu grid */}
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size={32} /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto flex-1 pb-24 lg:pb-0">
              {filtered.map(item => {
                const qty = cartQty(item.id)
                return (
                  // ── Fix: style position relative sebagai fallback
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    disabled={item.is_sold_out}
                    style={{ position: 'relative' }}
                    className={`card p-3 text-left transition-all group ${
                      item.is_sold_out
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-[var(--color-primary)] hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {/* Sold out overlay */}
                    {item.is_sold_out && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 z-10">
                        <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">Habis</span>
                      </div>
                    )}
                    {/* Badge qty */}
                    {qty > 0 && (
                      <div className="absolute top-2 right-2 z-20 w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-[10px] font-extrabold">
                        {qty}
                      </div>
                    )}
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-[var(--color-surface-3)] mb-2">
                      {item.image_url
                        ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-3xl">🍜</div>
                      }
                    </div>
                    <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                    <p className="text-[var(--color-accent)] font-bold text-xs mt-0.5">{formatRupiah(item.price)}</p>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Order Panel ── */}
        <div className={`
          fixed lg:relative bottom-0 left-0 right-0 lg:flex flex-col gap-4 z-40
          ${showCart ? 'flex' : 'hidden lg:flex'}
          bg-[var(--color-surface-1)] lg:bg-transparent
          rounded-t-3xl lg:rounded-none
          p-4 lg:p-0
          max-h-[85dvh] lg:max-h-full
          overflow-y-auto lg:overflow-visible
          shadow-[0_-8px_32px_rgba(0,0,0,0.3)] lg:shadow-none
        `}>
          {/* Table & Payment */}
          <div className="card p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-[var(--color-text-muted)] uppercase tracking-wider">
                Nomor Meja
              </label>
              <select
                value={tableId}
                onChange={e => setTableId(e.target.value)}
                className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Pilih meja...</option>
                {/* ── Fix: pakai tableLabel() biar tidak duplikat */}
                {tables.map(t => (
                  <option key={t.id} value={t.id}>
                    {tableLabel(t)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-[var(--color-text-muted)] uppercase tracking-wider">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setPayment(m)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                      payment === m
                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                        : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
                    }`}
                  >
                    {PAYMENT_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="card p-4 flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">🛒 Pesanan</h3>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-[var(--color-text-muted)]">
                <ShoppingBag size={36} className="mb-2 opacity-30" />
                <p className="text-sm">Belum ada item dipilih</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 lg:max-h-64 overflow-y-auto">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.menu_item_name}</p>
                      <p className="text-xs text-[var(--color-accent)] font-bold">{formatRupiah(item.subtotal)}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-[var(--color-surface-3)] rounded-full px-1 py-0.5 shrink-0">
                      <button
                        onClick={() => updateQty(idx, item.quantity - 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-2)]"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-extrabold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(idx, item.quantity + 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-2)]"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))}
                      className="text-[var(--color-danger)] hover:text-red-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Catatan pesanan (opsional)..."
            className="bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm resize-none h-16 focus:outline-none focus:border-[var(--color-primary)]"
          />

          {/* Total & Submit */}
          <div className="card p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Total</p>
                <p className="font-extrabold text-2xl text-[var(--color-accent)]">{formatRupiah(total)}</p>
              </div>
              <Badge variant="accent">{totalItems} item</Badge>
            </div>
            <Button onClick={handleSubmit} disabled={submitting} className="w-full" size="lg">
              {submitting ? <Spinner size={20} /> : <>Buat Pesanan <ChevronRight size={18} /></>}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Mobile: floating cart button ── */}
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
        <button
          onClick={() => setShowCart(v => !v)}
          className="relative w-14 h-14 rounded-full bg-[var(--color-primary)] shadow-lg flex items-center justify-center text-white"
        >
          <ShoppingBag size={24} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-[10px] font-extrabold flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {showCart && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setShowCart(false)}
        />
      )}
    </DashboardLayout>
  )
}