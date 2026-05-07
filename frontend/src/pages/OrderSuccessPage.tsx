import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function OrderSuccessPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const table = params.get('table') || '1'

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-6 p-6 text-center">
      <span className="text-7xl">✅</span>
      <h1 className="text-2xl font-extrabold">Pesanan Berhasil!</h1>
      <p className="text-[var(--color-text-muted)]">Pesananmu sedang diproses oleh dapur.</p>
      <Button onClick={() => navigate(`/order?table=${table}`)}>Pesan Lagi</Button>
    </div>
  )
}
