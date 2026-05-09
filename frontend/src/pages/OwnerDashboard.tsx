import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useMenu } from '@/hooks/useMenu'
import { Badge, Spinner, EmptyState } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatRupiah } from '@/lib/utils'
import {
  Plus, Pencil, ToggleLeft, ToggleRight,
  BookOpen, BarChart3, TrendingUp, ShoppingBag, Ban
} from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import type { MenuItem, Order } from '@/types'

// ─── Menu Item Row ────────────────────────────────────────────────
function MenuItemRow({ item, onToggleSoldOut, onEdit }: {
  item: MenuItem
  onToggleSoldOut: (id: string, val: boolean) => void
  onEdit: (item: MenuItem) => void
}) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--color-surface-3)] shrink-0">
        {item.image_url
          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">🍜</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold truncate">{item.name}</p>
          {item.is_sold_out && <Badge variant="danger">Habis</Badge>}
          {!item.is_available && <Badge variant="default">Nonaktif</Badge>}
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">{item.categories?.name}</p>
        <p className="text-[var(--color-accent)] font-bold text-sm">{formatRupiah(item.price)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onToggleSoldOut(item.id, !item.is_sold_out)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            item.is_sold_out
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          }`}
        >
          {item.is_sold_out ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
          {item.is_sold_out ? 'Habis' : 'Tersedia'}
        </button>
        <button
          onClick={() => onEdit(item)}
          className="w-8 h-8 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
        >
          <Pencil size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Menu Item Modal ──────────────────────────────────────────────
function MenuItemModal({ item, categories, onClose, onSave }: {
  item: Partial<MenuItem> | null
  categories: { id: string; name: string }[]
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price?.toString() || '',
    category_id: item?.category_id || '',
    image_url: item?.image_url || '',
    is_available: item?.is_available ?? true,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category_id) {
      toast.error('Nama, harga, dan kategori wajib diisi')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, price: parseInt(form.price) }
      if (item?.id) {
        await api.put(`/menu/${item.id}`, payload)
        toast.success('Menu diperbarui!')
      } else {
        await api.post('/menu', payload)
        toast.success('Menu ditambahkan!')
      }
      onSave()
      onClose()
    } catch {
      toast.error('Gagal menyimpan menu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-3xl p-6 w-full max-w-lg space-y-4 max-h-[90dvh] overflow-y-auto">
        <h2 className="font-bold text-xl">{item?.id ? 'Edit Menu' : 'Tambah Menu'}</h2>

        {[
          { label: 'Nama Menu *', key: 'name', type: 'text', placeholder: 'Contoh: Indomie Goreng' },
          { label: 'Harga (Rp) *', key: 'price', type: 'number', placeholder: '15000' },
          { label: 'URL Foto', key: 'image_url', type: 'text', placeholder: 'https://...' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-semibold mb-1">{label}</label>
            <input
              type={type}
              value={form[key as keyof typeof form] as string}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-semibold mb-1">Deskripsi</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Deskripsi singkat menu..."
            className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm resize-none h-20 focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Kategori *</label>
          <select
            value={form.category_id}
            onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">Pilih kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Tersedia</span>
          <button
            onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}
            className={`w-12 h-6 rounded-full transition-all relative ${form.is_available ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-3)]'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.is_available ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">Batal</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? <Spinner size={16} /> : 'Simpan'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Rekap Tab ────────────────────────────────────────────────────
function RekapTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'today' | 'week' | 'all'>('today')

  useEffect(() => {
    api.get<Order[]>('/orders/history')
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Gagal ambil data rekap'))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const filtered = orders.filter(o => {
    const d = new Date(o.created_at)
    if (filter === 'today') {
      return d.toDateString() === now.toDateString()
    } else if (filter === 'week') {
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
      return diff <= 7
    }
    return true
  }).filter(o => o.status !== 'CANCELLED')

  const totalRevenue = filtered.reduce((s, o) => s + o.total_amount, 0)
  const totalOrders = filtered.length
  const cancelled = orders.filter(o => {
    const d = new Date(o.created_at)
    if (filter === 'today') return d.toDateString() === now.toDateString() && o.status === 'CANCELLED'
    if (filter === 'week') return ((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)) <= 7 && o.status === 'CANCELLED'
    return o.status === 'CANCELLED'
  }).length

  // Top menu items
  const itemCount: Record<string, { name: string; qty: number; revenue: number }> = {}
  filtered.forEach(o => {
    o.order_items?.forEach(item => {
      if (!itemCount[item.menu_item_name]) {
        itemCount[item.menu_item_name] = { name: item.menu_item_name, qty: 0, revenue: 0 }
      }
      itemCount[item.menu_item_name].qty += item.quantity
      itemCount[item.menu_item_name].revenue += item.subtotal
    })
  })
  const topItems = Object.values(itemCount).sort((a, b) => b.qty - a.qty).slice(0, 5)

  if (loading) return <div className="flex justify-center py-16"><Spinner size={32} /></div>

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-2">
        {([['today', 'Hari Ini'], ['week', '7 Hari'], ['all', 'Semua']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === val
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Pendapatan', value: formatRupiah(totalRevenue), icon: <TrendingUp size={20} />, color: 'text-green-400' },
          { label: 'Total Order', value: totalOrders, icon: <ShoppingBag size={20} />, color: 'text-[var(--color-primary)]' },
          { label: 'Rata-rata Order', value: totalOrders > 0 ? formatRupiah(Math.round(totalRevenue / totalOrders)) : 'Rp 0', icon: <BarChart3 size={20} />, color: 'text-[var(--color-accent)]' },
          { label: 'Dibatalkan', value: cancelled, icon: <Ban size={20} />, color: 'text-red-400' },
        ].map(stat => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <div className={`${stat.color} shrink-0`}>{stat.icon}</div>
            <div>
              <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Menu */}
      <div>
        <h3 className="font-bold text-sm mb-3 text-[var(--color-text-muted)] uppercase tracking-wider">
          🏆 Menu Terlaris
        </h3>
        {topItems.length === 0 ? (
          <EmptyState icon={<BarChart3 size={36} />} title="Belum ada data" description="Order yang selesai akan muncul di sini" />
        ) : (
          <div className="space-y-2">
            {topItems.map((item, i) => (
              <div key={item.name} className="card p-4 flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 ${
                  i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  i === 1 ? 'bg-gray-400/20 text-gray-400' :
                  i === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-[var(--color-surface-3)] text-[var(--color-text-muted)]'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{item.qty} porsi terjual</p>
                </div>
                <p className="font-bold text-[var(--color-accent)]">{formatRupiah(item.revenue)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div>
        <h3 className="font-bold text-sm mb-3 text-[var(--color-text-muted)] uppercase tracking-wider">
          🧾 Order Terbaru
        </h3>
        <div className="space-y-2">
          {filtered.slice(0, 10).map(order => (
            <div key={order.id} className="card p-3 flex items-center gap-3 text-sm">
              <div className="flex-1">
                <span className="font-semibold">Meja {order.tables?.table_number ?? '-'}</span>
                <span className="text-[var(--color-text-muted)] ml-2">
                  {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <Badge variant={order.status === 'SERVED' ? 'success' : 'accent'}>
                {order.status}
              </Badge>
              <span className="font-bold text-[var(--color-accent)]">{formatRupiah(order.total_amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Owner Dashboard ──────────────────────────────────────────────
export default function OwnerDashboard() {
  const { items, categories, loading, refetch } = useMenu()
  const [tab, setTab] = useState<'menu' | 'rekap'>('menu')
  const [editItem, setEditItem] = useState<Partial<MenuItem> | null | undefined>(undefined)
  const [search, setSearch] = useState('')

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  const handleToggleSoldOut = async (id: string, val: boolean) => {
    try {
      await api.patch(`/menu/${id}/sold-out`, null, { params: { sold_out: val } })
      toast.success(val ? 'Item ditandai habis' : 'Item tersedia kembali')
      refetch()
    } catch {
      toast.error('Gagal mengubah status')
    }
  }

  return (
    <DashboardLayout title="Owner Dashboard">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([['menu', '📋 Manajemen Menu'], ['rekap', '📊 Rekap Penjualan']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === val
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'menu' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex gap-3 items-center">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari menu..."
              className="flex-1 bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
            <Button onClick={() => setEditItem({})} size="sm">
              <Plus size={16} /> Tambah Menu
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Menu', value: items.length, color: 'text-[var(--color-primary)]' },
              { label: 'Tersedia', value: items.filter(i => !i.is_sold_out && i.is_available).length, color: 'text-green-400' },
              { label: 'Habis', value: items.filter(i => i.is_sold_out).length, color: 'text-red-400' },
            ].map(stat => (
              <div key={stat.label} className="card p-4 text-center">
                <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Menu List */}
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size={32} /></div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<BookOpen size={40} />} title="Tidak ada menu" description="Tambah menu pertama kamu" />
          ) : (
            <div className="space-y-2">
              {filtered.map(item => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  onToggleSoldOut={handleToggleSoldOut}
                  onEdit={setEditItem}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'rekap' && <RekapTab />}

      {editItem !== undefined && (
        <MenuItemModal
          item={editItem}
          categories={categories}
          onClose={() => setEditItem(undefined)}
          onSave={refetch}
        />
      )}
    </DashboardLayout>
  )
}