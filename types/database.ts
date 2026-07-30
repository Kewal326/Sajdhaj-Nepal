export type Database = {
  public: {
    Tables: {
      categories: { Row: Category }
      products: { Row: Product }
      product_images: { Row: ProductImage }
      orders: { Row: Order; Insert: OrderInsert }
      order_items: { Row: OrderItem; Insert: OrderItemInsert }
    }
  }
}

export type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
  image_url: string | null
  sort_order: number
  created_at: string
}

export type ProductImage = {
  id: string
  product_id: string
  url: string
  is_primary: boolean
  sort_order: number
}

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  original_price: number | null
  category_id: string | null
  stock: number
  badge: string | null
  is_active: boolean
  is_featured: boolean
  created_at: string
  product_images?: ProductImage[]
}

export type Order = {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  province: string | null
  district: string
  city: string
  address: string
  total_amount: number
  payment_method: string
  payment_status: string
  order_status: string
  notes: string | null
  created_at: string
}

export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'payment_status' | 'order_status'>

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  price: number
  quantity: number
}

export type OrderItemInsert = Omit<OrderItem, 'id'>

export type CartItem = {
  product: Product
  quantity: number
}
