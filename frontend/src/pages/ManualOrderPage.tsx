import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui'
import { formatRupiah } from '@/lib/utils'
import { Plus, Minus, Trash2, Search } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import type { MenuItem, Table, CartItem, PaymentMethod } from '@/types'

export default function ManualOrderPage() {
  const navigate = useNavigate()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [tableId, setTableId] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('CASH')
  const [notes, setNotes] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([api.get<MenuItem[]>('/menu'), api.get<Table[]>('/tables')])
      .then(([m, t]) => { setMenuItems(m.data); setTables(t.data) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = menuItems.filter(i =>
    !i.is_sold_out && i.name.toLowerCase().includes(search.toLowerCase())
  )

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.menu_item_id === item.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1, subtotal: updated[idx].subtotal + item.price }
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
  }

  const updateQty = (idx: number, qty: number) => {
    if (qty <= 0) return setCart(prev => prev.filter((_, i) => i !== idx))
    setCart(prev => prev.map((item, i) =>
      i === idx ? { ...item, quantity: qty, subtotal: item.menu_item_price * qty } : item
    ))
  }

  const total = cart.reduce((s, i) => s + i.subtotal, 0)

  const handleSubmit = async () => {
    if (!tableId) return toast.error('Pilih nomor meja')
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
      toast.success('Pesanan berhasil dibuat!')
      navigate('/dashboard/cashier')
    } catch {
      toast.error('Gagal membuat pesanan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Input Order Manual">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Left: Menu picker */}
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari menu..."
              className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Spinner size={32} /></div>
          ) : (
            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[60vh]">
              {filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="card p-3 text-left hover:border-[var(--color-primary)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-[var(--color-surface-3)] mb-2">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">🍜</div>
                    }
                  </div>
                  <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                  <p className="text-[var(--color-accent)] font-bold text-xs">{formatRupiah(item.price)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Order summary */}
        <div className="flex flex-col gap-4">
          {/* Table & Payment */}
          <div className="card p-4 space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Nomor Meja</label>
              <select
                value={tableId}
                onChange={e => setTableId(e.target.value)}
                className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Pilih meja...</option>
                {tables.map(t => <option key={t.id} value={t.id}>Meja {t.table_number} — {t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Pembayaran</label>
              <div className="flex gap-2">
                {(['CASH', 'QRIS', 'TRANSFER_BCA'] as PaymentMethod[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setPayment(m)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                      payment === m ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {m === 'TRANSFER_BCA' ? 'Transfer' : m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart items */}
          <div className="card p-4 flex-1 overflow-y-auto space-y-2 max-h-64">
            {cart.length === 0 ? (
              <p className="text-center text-[var(--color-text-muted)] text-sm py-8">Belum ada item</p>
            ) : cart.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.menu_item_name}</p>
                  <p className="text-xs text-[var(--color-accent)]">{formatRupiah(item.subtotal)}</p>
                </div>
                <div className="flex items-center gap-1 bg-[var(--color-surface-3)] rounded-full px-1 py-0.5">
                  <button onClick={() => updateQty(idx, item.quantity - 1)} className="w-6 h-6 rounded-full flex items-center justify-center">
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(idx, item.quantity + 1)} className="w-6 h-6 rounded-full flex items-center justify-center">
                    <Plus size={12} />
                  </button>
                </div>
                <button onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))} className="text-[var(--color-danger)]">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Notes */}
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Catatan pesanan (opsional)..."
            className="bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm resize-none h-16 focus:outline-none focus:border-[var(--color-primary)]"
          />

          {/* Submit */}
          <div className="card p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Total</span>
              <span className="font-extrabold text-xl text-[var(--color-accent)]">{formatRupiah(total)}</span>
            </div>
            <Button onClick={handleSubmit} disabled={submitting} className="w-full" size="lg">
              {submitting ? <Spinner size={20} /> : 'Buat Pesanan'}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
