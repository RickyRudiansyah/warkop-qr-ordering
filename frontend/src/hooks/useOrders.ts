import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/types'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    const res = await api.get<Order[]>('/orders/active')
    setOrders(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchOrders])

  const confirmCash = async (orderId: string) => {
    await api.patch(`/orders/${orderId}/confirm-cash`)
    fetchOrders()
  }

  const updateStatus = async (orderId: string, status: Extract<OrderStatus, 'PROCESSING' | 'SERVED'>) => {
    await api.patch(`/orders/${orderId}/status`, null, { params: { status } })
    fetchOrders()
  }

  const cancelOrder = async (orderId: string, reason = 'Dibatalkan cashier') => {
    await api.patch(`/orders/${orderId}/cancel`, null, {
      params: { reason, actor_email: 'cashier@local' },
    })
    fetchOrders()
  }

  return { orders, loading, confirmCash, updateStatus, cancelOrder, refetch: fetchOrders }
}