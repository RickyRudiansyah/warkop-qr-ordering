import { useState } from 'react'
import { Check, X, Clock, ChefHat, Utensils } from 'lucide-react'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatRupiah, formatTime, elapsedMinutes } from '@/lib/utils'
import type { Order } from '@/types'

const statusConfig = {
  PENDING_CASH:    { label: 'Pending Cash',   variant: 'warning' as const },
  PENDING_PAYMENT: { label: 'Pending Bayar',  variant: 'info' as const },
  CONFIRMED:       { label: 'Dikonfirmasi',   variant: 'success' as const },
  PROCESSING:      { label: 'Diproses',       variant: 'accent' as const },
  SERVED:          { label: 'Selesai',        variant: 'default' as const },
  CANCELLED:       { label: 'Dibatalkan',     variant: 'danger' as const },
}

const paymentLabel = { CASH: 'Cash', QRIS: 'QRIS', TRANSFER_BCA: 'Transfer BCA' }

export function OrderCard({ order, onConfirmCash, onCancel, onUpdateStatus }: {
  order: Order
  onConfirmCash: (id: string) => void
  onCancel: (id: string, reason: string) => void
  onUpdateStatus?: (id: string, status: 'PROCESSING' | 'SERVED') => void
}) {
  const [showCancel, setShowCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const elapsed = elapsedMinutes(order.created_at)
  const cfg = statusConfig[order.status] || statusConfig.CONFIRMED

  const handleCancel = () => {
    onCancel(order.id, cancelReason || 'Dibatalkan cashier')
    setShowCancel(false)
    setCancelReason('')
  }

  return (
    <div className="card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-[var(--color-accent)]">
              Meja {order.tables?.table_number ?? order.table_id}
            </span>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mt-0.5">
            <Clock size={11} />
            <span>{formatTime(order.created_at)}</span>
            <span className={`ml-1 font-semibold ${
              elapsed > 20 ? 'text-red-400' : elapsed > 10 ? 'text-yellow-400' : 'text-[var(--color-text-muted)]'
            }`}>
              ({elapsed} mnt)
            </span>
          </div>
        </div>
        <Badge variant="default">{paymentLabel[order.payment_method]}</Badge>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {(order.order_items || []).map((item, i) => (
          <div key={i} className="text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">{item.quantity}× {item.menu_item_name}</span>
              <span>{formatRupiah(item.subtotal)}</span>
            </div>
            {item.variations && item.variations.length > 0 && (
              <p className="text-xs text-[var(--color-text-muted)] ml-4">
                {item.variations.map(v => v.label).join(', ')}
              </p>
            )}
            {item.notes && (
              <p className="text-xs text-yellow-400 ml-4">📝 {item.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Order Notes */}
      {order.notes && (
        <div className="text-xs bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 text-yellow-400">
          📝 {order.notes}
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)]">
        <span className="text-sm text-[var(--color-text-muted)]">Total</span>
        <span className="font-bold text-[var(--color-accent)]">{formatRupiah(order.total_amount)}</span>
      </div>

      {/* Actions */}
      {!showCancel ? (
        <div className="flex gap-2 flex-wrap">
          {order.status === 'PENDING_CASH' && (
            <Button size="sm" onClick={() => onConfirmCash(order.id)} className="flex-1">
              <Check size={14} /> Konfirmasi Bayar
            </Button>
          )}
          {order.status === 'CONFIRMED' && onUpdateStatus && (
            <Button size="sm" onClick={() => onUpdateStatus(order.id, 'PROCESSING')} className="flex-1">
              <ChefHat size={14} /> Mulai Proses
            </Button>
          )}
          {order.status === 'PROCESSING' && onUpdateStatus && (
            <Button size="sm" onClick={() => onUpdateStatus(order.id, 'SERVED')} className="flex-1">
              <Utensils size={14} /> Tandai Selesai
            </Button>
          )}
          {order.status !== 'SERVED' && (
            <Button size="sm" variant="ghost" onClick={() => setShowCancel(true)}>
              <X size={14} /> Cancel
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            placeholder="Alasan cancel (opsional)..."
            className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="danger" onClick={handleCancel} className="flex-1">
              Ya, Cancel
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCancel(false)}>
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}