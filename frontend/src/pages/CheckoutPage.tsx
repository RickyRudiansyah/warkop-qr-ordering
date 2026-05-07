import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Banknote, QrCode, Building2, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui'
import { formatRupiah } from '@/lib/utils'
import api from '@/lib/api'
import { toast } from 'sonner'
import type { PaymentMethod } from '@/types'

const STEPS = ['Pesanan', 'Pembayaran', 'Konfirmasi']

export default function CheckoutPage() {
  const [params] = useSearchParams()
  const tableNumber = params.get('table') || '1'
  const navigate = useNavigate()
  const { items, updateQty, removeItem, total, clearCart } = useCart()
  const [step, setStep] = useState(0)
  const [payment, setPayment] = useState<PaymentMethod | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!payment) return
    setLoading(true)
    try {
      const res = await api.post('/orders', {
        table_id: tableNumber,
        payment_method: payment,
        total_amount: total,
        notes: notes || undefined,
        items: items.map(i => ({
          menu_item_id: i.menu_item_id,
          menu_item_name: i.menu_item_name,
          menu_item_price: i.menu_item_price,
          quantity: i.quantity,
          variations: i.variations,
          subtotal: i.subtotal,
          notes: i.notes,
        })),
      })
      setOrderId(res.data.order_id)
      clearCart()
      setStep(2)
    } catch {
      toast.error('Gagal membuat pesanan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && step < 2) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6">
        <span className="text-6xl">🛒</span>
        <p className="font-bold text-lg">Keranjang kosong</p>
        <Button onClick={() => navigate(`/order?table=${tableNumber}`)}>Kembali ke Menu</Button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[var(--color-surface)] flex flex-col">
      {/* Header */}
      <div className="glass sticky top-0 z-10 px-4 py-4 flex items-center gap-3">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate(`/order?table=${tableNumber}`)}
          className="w-9 h-9 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-lg">Checkout</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center px-6 py-4 gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
              i < step ? 'bg-[var(--color-primary)] text-white' :
              i === step ? 'bg-[var(--color-accent)] text-[var(--color-surface)]' :
              'bg-[var(--color-surface-3)] text-[var(--color-text-muted)]'
            }`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-medium ${i === step ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-base mb-4">Review Pesanan — Meja {tableNumber}</h2>
            {items.map((item, idx) => (
              <div key={idx} className="card p-4 flex gap-3 items-start">
                <div className="flex-1">
                  <p className="font-semibold">{item.menu_item_name}</p>
                  {item.variations.length > 0 && (
                    <p className="text-xs text-[var(--color-text-muted)]">{item.variations.map(v => v.name).join(', ')}</p>
                  )}
                  <p className="text-[var(--color-accent)] font-bold mt-1">{formatRupiah(item.subtotal)}</p>
                </div>
                <div className="flex items-center gap-1 bg-[var(--color-surface-3)] rounded-full px-1 py-0.5">
                  <button onClick={() => updateQty(idx, item.quantity - 1)} className="w-7 h-7 rounded-full flex items-center justify-center">
                    <Minus size={13} />
                  </button>
                  <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(idx, item.quantity + 1)} className="w-7 h-7 rounded-full flex items-center justify-center">
                    <Plus size={13} />
                  </button>
                </div>
                <button onClick={() => removeItem(idx)} className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-danger)]">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div>
              <p className="text-sm font-semibold mb-2">Catatan Pesanan</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Catatan untuk dapur (opsional)..."
                className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <h2 className="font-bold text-base mb-4">Pilih Metode Pembayaran</h2>
            {([
              { method: 'QRIS' as PaymentMethod, icon: <QrCode size={24} />, label: 'QRIS', desc: 'Bayar dengan scan QR code' },
              { method: 'TRANSFER_BCA' as PaymentMethod, icon: <Building2 size={24} />, label: 'Transfer BCA', desc: 'Transfer ke rekening BCA' },
              { method: 'CASH' as PaymentMethod, icon: <Banknote size={24} />, label: 'Cash', desc: 'Bayar tunai ke kasir' },
            ]).map(({ method, icon, label, desc }) => (
              <button
                key={method}
                onClick={() => setPayment(method)}
                className={`w-full card p-4 flex items-center gap-4 text-left transition-all ${
                  payment === method ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'hover:border-[var(--color-surface-3)]'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  payment === method ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)]'
                }`}>
                  {icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{label}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  payment === method ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-[var(--color-border)]'
                }`}>
                  {payment === method && <Check size={12} className="text-white" />}
                </div>
              </button>
            ))}

            {payment === 'QRIS' && (
              <div className="card p-4 text-center space-y-2">
                <p className="text-sm text-[var(--color-text-muted)]">QR Code akan muncul setelah konfirmasi</p>
                <div className="w-32 h-32 mx-auto bg-[var(--color-surface-3)] rounded-xl flex items-center justify-center">
                  <QrCode size={64} className="text-[var(--color-text-muted)]" />
                </div>
              </div>
            )}
            {payment === 'TRANSFER_BCA' && (
              <div className="card p-4 space-y-2">
                <p className="text-sm text-[var(--color-text-muted)]">Transfer ke rekening:</p>
                <p className="font-bold text-lg">BCA — 1234567890</p>
                <p className="text-sm text-[var(--color-text-muted)]">a.n. Warkop QR</p>
              </div>
            )}
            {payment === 'CASH' && (
              <div className="card p-4 bg-yellow-500/10 border-yellow-500/30">
                <p className="text-sm text-yellow-400">💡 Setelah konfirmasi, silakan ke kasir untuk membayar tunai.</p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-6 text-center">
            <div className="w-24 h-24 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
              <Check size={48} className="text-[var(--color-primary)]" strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Pesanan Masuk! 🎉</h2>
              <p className="text-[var(--color-text-muted)] mt-2">
                {payment === 'CASH'
                  ? 'Silakan ke kasir untuk membayar tunai.'
                  : 'Pesanan kamu sedang diproses.'}
              </p>
              {orderId && (
                <div className="mt-4 card px-6 py-3 inline-block">
                  <p className="text-xs text-[var(--color-text-muted)]">Nomor Pesanan</p>
                  <p className="font-mono font-bold text-[var(--color-accent)]">#{orderId.slice(-8).toUpperCase()}</p>
                </div>
              )}
            </div>
            <Button onClick={() => navigate(`/order?table=${tableNumber}`)} variant="ghost">
              Pesan Lagi
            </Button>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {step < 2 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-[var(--color-border)]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[var(--color-text-muted)] text-sm">Total</span>
            <span className="font-extrabold text-xl text-[var(--color-accent)]">{formatRupiah(total)}</span>
          </div>
          {step === 0 && (
            <Button onClick={() => setStep(1)} className="w-full" size="lg">
              Pilih Pembayaran
            </Button>
          )}
          {step === 1 && (
            <Button onClick={handleSubmit} disabled={!payment || loading} className="w-full" size="lg">
              {loading ? <Spinner size={20} /> : 'Konfirmasi Pesanan'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
