import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/Button'
import { formatRupiah } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export function CartDrawer({ tableNumber, onClose }: { tableNumber: string; onClose: () => void }) {
  const { items, removeItem, updateQty, total, count } = useCart()
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative bg-[var(--color-surface-2)] rounded-t-3xl max-h-[85dvh] flex flex-col"
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[var(--color-surface-3)]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
            <h2 className="font-bold text-lg">Keranjang ({count})</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center">
              <X size={16} />
            </button>
          </div>

          {/* Items */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
            {items.map((item, idx) => (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-3 items-start"
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.menu_item_name}</p>
                  {item.variations.length > 0 && (
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {item.variations.map(v => v.name).join(', ')}
                    </p>
                  )}
                  {item.notes && <p className="text-xs text-[var(--color-text-muted)] italic">"{item.notes}"</p>}
                  <p className="text-[var(--color-accent)] font-bold text-sm mt-1">{formatRupiah(item.subtotal)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[var(--color-surface-3)] rounded-full px-1 py-0.5">
                    <button onClick={() => updateQty(idx, item.quantity - 1)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-2)]">
                      <Minus size={13} />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(idx, item.quantity + 1)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-2)]">
                      <Plus size={13} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(idx)} className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-danger)] hover:bg-red-500/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-[var(--color-border)] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-muted)]">Total</span>
              <span className="font-extrabold text-xl text-[var(--color-accent)]">{formatRupiah(total)}</span>
            </div>
            <Button
              onClick={() => { onClose(); navigate(`/checkout?table=${tableNumber}`) }}
              className="w-full" size="lg"
            >
              Lanjut ke Pembayaran
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
