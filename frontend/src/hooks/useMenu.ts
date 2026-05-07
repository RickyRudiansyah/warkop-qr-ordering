import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { MenuItem, Category } from '@/types'

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMenu = useCallback(async () => {
    const [menuRes, catRes] = await Promise.all([
      api.get<MenuItem[]>('/menu'),
      api.get<Category[]>('/menu/categories'),
    ])
    setItems(menuRes.data)
    setCategories(catRes.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMenu()

    // Realtime: sold-out changes
    const channel = supabase
      .channel('menu_items')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'menu_items' }, (payload) => {
        setItems(prev => prev.map(item =>
          item.id === payload.new.id ? { ...item, ...payload.new } : item
        ))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchMenu])

  return { items, categories, loading, refetch: fetchMenu }
}
