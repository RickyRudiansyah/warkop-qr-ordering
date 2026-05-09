import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { OrderCard } from '@/components/dashboard/OrderCard'
import { useOrders } from '@/hooks/useOrders'
import { Spinner, EmptyState } from '@/components/ui'
import { ShoppingBag } from 'lucide-react'
import type { OrderStatus } from '@/types'

const COLUMNS: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'PENDING_CASH',    label: 'Pending Cash',   color: 'border-yellow-500/50' },
  { status: 'PENDING_PAYMENT', label: 'Pending Bayar',  color: 'border-blue-500/50' },
  { status: 'CONFIRMED',       label: 'Dikonfirmasi',   color: 'border-[var(--color-primary)]/50' },
  { status: 'PROCESSING',      label: 'Diproses',       color: 'border-orange-500/50' },
]

export default function CashierDashboard() {
  const { orders, loading, confirmCash, cancelOrder, updateStatus } = useOrders()

  return (
    <DashboardLayout title="Dashboard Kasir">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map(col => {
            const colOrders = orders.filter(o => o.status === col.status)
            return (
              <div key={col.status} className="flex flex-col gap-3">
                {/* Column Header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${col.color} bg-[var(--color-surface-2)]`}>
                  <span className="font-bold text-sm">{col.label}</span>
                  <span className="badge bg-[var(--color-surface-3)] text-[var(--color-text-muted)]">
                    {colOrders.length}
                  </span>
                </div>

                {/* Orders */}
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100dvh-12rem)]">
                  {colOrders.length === 0 ? (
                    <EmptyState icon={<ShoppingBag size={32} />} title="Tidak ada pesanan" />
                  ) : (
                    colOrders.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onConfirmCash={confirmCash}
                        onCancel={cancelOrder}
                        onUpdateStatus={updateStatus}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}