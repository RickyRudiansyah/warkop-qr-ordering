import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'

export function CartFAB({ onClick }: { onClick: () => void }) {
  const { count } = useCart()

  if (count === 0) return null

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        onClick={onClick}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-[var(--color-accent)] text-[var(--color-surface)] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      >
        <ShoppingCart size={24} strokeWidth={2.5} />
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-danger)] text-white text-xs font-bold flex items-center justify-center">
          {count}
        </span>
      </motion.button>
    </AnimatePresence>
  )
}
