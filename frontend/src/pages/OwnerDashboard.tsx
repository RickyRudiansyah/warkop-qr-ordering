import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useMenu } from '@/hooks/useMenu'
import { Badge, Spinner, EmptyState } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatRupiah } from '@/lib/utils'
import { Plus, Pencil, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import type { MenuItem } from '@/types'

function MenuItemRow({ item, onToggleSoldOut, onEdit }: {
  item: MenuItem
  onToggleSoldOut: (id: string, val: boolean) => void
  onEdit: (item: MenuItem) => void
}) {
  return (
    <div className="card p-4 flex items-center gap-4">
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--color-surface-3)] shrink-0">
        {item.image_url
          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">🍜</div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold truncate">{item.name}</p>
          {item.is_sold_out && <Badge variant="danger">Habis</Badge>}
          {!item.is_available && <Badge variant="default">Nonaktif</Badge>}
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">{item.categories?.name}</p>
        <p className="text-[var(--color-accent)] font-bold text-sm">{formatRupiah(item.price)}</p>
      </div>

      {/* Actions */}
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
          { label: 'Nama Menu', key: 'name', type: 'text', placeholder: 'Contoh: Indomie Goreng' },
          { label: 'Harga (Rp)', key: 'price', type: 'number', placeholder: '15000' },
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
          <label className="block text-sm font-semibold mb-1">Kategori</label>
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

export default function OwnerDashboard() {
  const { items, categories, loading, refetch } = useMenu()
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
    <DashboardLayout title="Manajemen Menu">
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

        {/* Menu list */}
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
