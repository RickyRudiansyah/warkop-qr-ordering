import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useOrders } from '@/hooks/useOrders'
import { Badge, Spinner, EmptyState } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { ChefHat, Clock, CheckCircle2 } from 'lucide-react'
import { elapsedMinutes, formatTime } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { Order } from '@/types'

function KitchenTicket({ order, onProcess, onServe }: {
  order: Order
  onProcess: (id: string) => void
  onServe: (id: string) => void
}) {
  const [elapsed, setElapsed] = useState(elapsedMinutes(order.created_at))

  useEffect(() => {
    const t = setInterval(() => setElapsed(elapsedMinutes(order.created_at)), 30000)
    return () => clearInterval(t)
  }, [order.created_at])

  const isLate = elapsed > 15
  const isVeryLate = elapsed > 25

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`card p-5 flex flex-col gap-4 border-2 ${
        isVeryLate ? 'border-red-500/70 bg-red-500/5' :
        isLate ? 'border-yellow-500/50 bg-yellow-500/5' :
        order.status === 'PROCESSING' ? 'border-[var(--color-primary)]/50' :
        'border-[var(--color-border)]'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-extrabold text-[var(--color-accent)]">
            Meja {order.tables?.table_number ?? order.table_id}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">{formatTime(order.created_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={order.status === 'PROCESSING' ? 'accent' : 'success'}>
            {order.status === 'PROCESSING' ? 'Diproses' : 'Dikonfirmasi'}
          </Badge>
          <div className={`flex items-center gap-1 text-sm font-bold ${
            isVeryLate ? 'text-red-400' : isLate ? 'text-yellow-400' : 'text-[var(--color-text-muted)]'
          }`}>
            <Clock size={14} />
            <span>{elapsed} mnt</span>
            {isVeryLate && <span className="animate-pulse">⚠️</span>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 flex-1">
        {(order.order_items || []).map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center font-bold text-sm shrink-0">
              {item.quantity}
            </span>
            <div>
              <p className="font-semibold">{item.menu_item_name}</p>
              {item.variations?.length > 0 && (
                <p className="text-xs text-[var(--color-text-muted)]">{item.variations.map(v => v.name).join(', ')}</p>
              )}
              {item.notes && <p className="text-xs text-yellow-400 italic">📝 {item.notes}</p>}
            </div>
          </div>
        ))}
        {order.notes && (
          <div className="mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-400">📝 {order.notes}</p>
          </div>
        )}
      </div>

      {/* Action */}
      <div>
        {order.status === 'CONFIRMED' && (
          <Button onClick={() => onProcess(order.id)} className="w-full" variant="primary">
            <ChefHat size={16} /> Mulai Proses
          </Button>
        )}
        {order.status === 'PROCESSING' && (
          <Button onClick={() => onServe(order.id)} className="w-full" variant="accent">
            <CheckCircle2 size={16} /> Sudah Diantar
          </Button>
        )}
      </div>
    </motion.div>
  )
}

export default function KitchenDisplay() {
  const { orders, loading, updateStatus } = useOrders()

  const kitchenOrders = orders.filter(o => o.status === 'CONFIRMED' || o.status === 'PROCESSING')
  const processing = kitchenOrders.filter(o => o.status === 'PROCESSING')
  const confirmed = kitchenOrders.filter(o => o.status === 'CONFIRMED')

  return (
    <DashboardLayout title="Kitchen Display">
      {loading ? (
        <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>
      ) : kitchenOrders.length === 0 ? (
        <EmptyState
          icon={<ChefHat size={48} />}
          title="Tidak ada pesanan aktif"
          description="Pesanan yang dikonfirmasi akan muncul di sini"
        />
      ) : (
        <div className="space-y-6">
          {processing.length > 0 && (
            <div>
              <h2 className="font-bold text-sm text-[var(--color-primary)] mb-3 uppercase tracking-wider">
                Sedang Diproses ({processing.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                  {processing.map(order => (
                    <KitchenTicket
                      key={order.id}
                      order={order}
                      onProcess={id => updateStatus(id, 'PROCESSING')}
                      onServe={id => updateStatus(id, 'SERVED')}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
          {confirmed.length > 0 && (
            <div>
              <h2 className="font-bold text-sm text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">
                Antrian ({confirmed.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                  {confirmed.map(order => (
                    <KitchenTicket
                      key={order.id}
                      order={order}
                      onProcess={id => updateStatus(id, 'PROCESSING')}
                      onServe={id => updateStatus(id, 'SERVED')}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
