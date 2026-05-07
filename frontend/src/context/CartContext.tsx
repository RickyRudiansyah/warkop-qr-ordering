import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { CartItem } from '@/types'

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (index: number) => void
  updateQty: (index: number, qty: number) => void
  clearCart: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(sessionStorage.getItem('cart') || '[]') } catch { return [] }
  })

  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const idx = prev.findIndex(
        i => i.menu_item_id === item.menu_item_id &&
          JSON.stringify(i.variations) === JSON.stringify(item.variations)
      )
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + item.quantity,
          subtotal: updated[idx].subtotal + item.subtotal,
        }
        return updated
      }
      return [...prev, item]
    })
  }

  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index))

  const updateQty = (index: number, qty: number) => {
    if (qty <= 0) return removeItem(index)
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, quantity: qty, subtotal: (item.menu_item_price + item.variations.reduce((s, v) => s + v.price_modifier, 0)) * qty } : item
    ))
  }

  const clearCart = () => setItems([])
  const total = items.reduce((s, i) => s + i.subtotal, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
