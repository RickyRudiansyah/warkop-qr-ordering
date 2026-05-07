import { useState, useEffect } from 'react'
import { X, Minus, Plus } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/Button'
import type { MenuItem, MenuVariation } from '@/types'
import { toast } from 'sonner'

export function MenuItemSheet({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [selectedVariations, setSelectedVariations] = useState<MenuVariation[]>([])
  const [notes, setNotes] = useState('')

  // Group variations by type
  const variationGroups = (item.menu_variations || []).reduce<Record<string, MenuVariation[]>>((acc, v) => {
    if (!acc[v.type]) acc[v.type] = []
    acc[v.type].push(v)
    return acc
  }, {})

  const extraCost = selectedVariations.reduce((s, v) => s + v.price_modifier, 0)
  const unitPrice = item.price + extraCost
  const subtotal = unitPrice * qty

  const toggleVariation = (v: MenuVariation, isRadio: boolean) => {
    if (isRadio) {
      setSelectedVariations(prev => [...prev.filter(sv => sv.type !== v.type), v])
    } else {
      setSelectedVariations(prev =>
        prev.find(sv => sv.id === v.id) ? prev.filter(sv => sv.id !== v.id) : [...prev, v]
      )
    }
  }

  const handleAdd = () => {
    addItem({
      menu_item_id: item.id,
      menu_item_name: item.name,
      menu_item_price: item.price,
      quantity: qty,
      variations: selectedVariations.map(v => ({ type: v.type, name: v.name, price_modifier: v.price_modifier })),
      subtotal,
      notes: notes || undefined,
    })
    toast.success(`${item.name} ditambahkan ke keranjang!`)
    onClose()
  }

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--color-surface-2)] rounded-t-3xl max-h-[90dvh] flex flex-col overflow-hidden">
        {/* Image */}
        <div className="relative h-52 bg-[var(--color-surface-3)] shrink-0">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🍜</div>
          )}
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          <div>
            <h2 className="text-xl font-bold">{item.name}</h2>
            {item.description && <p className="text-[var(--color-text-muted)] text-sm mt-1">{item.description}</p>}
            <p className="text-[var(--color-accent)] font-bold text-lg mt-2">{formatRupiah(item.price)}</p>
          </div>

          {/* Variations */}
          {Object.entries(variationGroups).map(([type, variations]) => {
            const isRadio = type === 'size' || type === 'spice'
            const typeLabel: Record<string, string> = { size: 'Ukuran', spice: 'Level Pedas', topping: 'Topping' }
            return (
              <div key={type}>
                <p className="font-semibold text-sm mb-2">{typeLabel[type] || type}</p>
                <div className="flex flex-wrap gap-2">
                  {variations.map(v => {
                    const selected = selectedVariations.find(sv => sv.id === v.id)
                    return (
                      <button
                        key={v.id}
                        onClick={() => toggleVariation(v, isRadio)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                          selected
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                            : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'
                        }`}
                      >
                        {v.name}{v.price_modifier > 0 ? ` +${formatRupiah(v.price_modifier)}` : ''}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Notes */}
          <div>
            <p className="font-semibold text-sm mb-2">Catatan (opsional)</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: tanpa bawang, extra pedas..."
              className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-3 bg-[var(--color-surface-3)] rounded-full px-2 py-1">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-2)]">
                <Minus size={16} />
              </button>
              <span className="font-bold w-6 text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-2)]">
                <Plus size={16} />
              </button>
            </div>
            <span className="font-bold text-lg text-[var(--color-accent)]">{formatRupiah(subtotal)}</span>
          </div>
          <Button onClick={handleAdd} className="w-full" size="lg">
            Tambah ke Keranjang
          </Button>
        </div>
      </div>
    </div>
  )
}
