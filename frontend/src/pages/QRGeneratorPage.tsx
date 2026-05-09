import { useState, useRef } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useOrders } from '@/hooks/useOrders'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Printer } from 'lucide-react'
import api from '@/lib/api'
import { useEffect } from 'react'
import type { Table } from '@/types'

function QRCard({ table, baseUrl }: { table: Table; baseUrl: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const url = `${baseUrl}/order?table=${table.table_number}`

  const handleDownload = () => {
    const svg = ref.current?.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 500
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 400, 500)
      ctx.drawImage(img, 50, 50, 300, 300)
      ctx.fillStyle = '#1a1a2e'
      ctx.font = 'bold 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(table.label, 200, 410)
      ctx.font = '16px sans-serif'
      ctx.fillStyle = '#666'
      ctx.fillText('Scan untuk memesan', 200, 445)
      const link = document.createElement('a')
      link.download = `QR-${table.label}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const svg = ref.current?.querySelector('svg')
    if (!svg) return
    printWindow.document.write(`
      <html>
        <head>
          <title>QR - ${table.label}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; 
                   justify-content: center; min-height: 100vh; font-family: sans-serif; }
            h1 { font-size: 2rem; font-weight: 900; margin: 16px 0 4px; }
            p { color: #666; margin: 0; }
            svg { width: 280px; height: 280px; }
          </style>
        </head>
        <body>
          ${svg.outerHTML}
          <h1>${table.label}</h1>
          <p>Scan untuk memesan</p>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="card p-6 flex flex-col items-center gap-4 text-center">
      {/* QR Code */}
      <div ref={ref} className="bg-white p-4 rounded-2xl">
        <QRCodeSVG
          value={url}
          size={200}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: '/favicon.ico',
            height: 32,
            width: 32,
            excavate: true,
          }}
        />
      </div>

      {/* Info */}
      <div>
        <p className="font-extrabold text-xl">{table.label}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 break-all">{url}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 w-full">
        <Button size="sm" variant="ghost" onClick={handleDownload} className="flex-1">
          <Download size={14} /> Download
        </Button>
        <Button size="sm" variant="ghost" onClick={handlePrint} className="flex-1">
          <Printer size={14} /> Print
        </Button>
      </div>
    </div>
  )
}

export default function QRGeneratorPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [baseUrl, setBaseUrl] = useState(window.location.origin)

  useEffect(() => {
    api.get<Table[]>('/tables')
      .then(res => setTables(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout title="QR Code Generator">
      <div className="space-y-6">
        {/* Base URL Config */}
        <div className="card p-4">
          <p className="text-sm font-semibold mb-2">Base URL (ubah saat deploy)</p>
          <input
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            className="w-full bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            placeholder="https://warkop-qr.vercel.app"
          />
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            💡 QR akan generate URL: <span className="text-[var(--color-accent)]">{baseUrl}/order?table=1</span>
          </p>
        </div>

        {/* QR Grid */}
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={32} /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tables.map(table => (
              <QRCard key={table.id} table={table} baseUrl={baseUrl} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}