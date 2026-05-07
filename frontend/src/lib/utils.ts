export const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export const elapsedMinutes = (iso: string) =>
  Math.floor((Date.now() - new Date(iso).getTime()) / 60000)

export const cn = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(' ')
