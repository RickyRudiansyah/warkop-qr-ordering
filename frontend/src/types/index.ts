export interface Category {
  id: string
  name: string
  sort_order: number
}

export interface MenuVariation {
  id: string
  menu_item_id: string
  variation_type: string // 'size' | 'spicy_level' | 'topping'
  label: string
  extra_price: number
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  category_id: string
  categories?: { id: string; name: string }
  is_available: boolean
  is_sold_out: boolean
  sort_order: number
  menu_variations?: MenuVariation[]
}

export interface CartVariation {
  label: string
  extra_price: number
  variation_type?: string
}

export interface CartItem {
  menu_item_id: string
  menu_item_name: string
  menu_item_price: number
  quantity: number
  variations: CartVariation[]
  subtotal: number
  notes?: string
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER_BCA'
export type OrderStatus =
  | 'PENDING_CASH'
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SERVED'
  | 'CANCELLED'

export interface OrderItem {
  id: string
  order_id: string
  menu_item_name: string
  menu_item_price: number
  quantity: number
  variations: CartVariation[]
  subtotal: number
  notes?: string
}

export interface Order {
  id: string
  table_id: string
  status: OrderStatus
  payment_method: PaymentMethod
  total_amount: number
  notes?: string
  created_at: string
  confirmed_at?: string
  tables?: { table_number: number; label: string }
  order_items?: OrderItem[]
}

export interface Table {
  id: string
  table_number: number
  label: string
  is_active: boolean
}

export type UserRole = 'cashier' | 'koki' | 'owner'

export interface AuthUser {
  id: string
  name: string
  role: UserRole
  token: string
}