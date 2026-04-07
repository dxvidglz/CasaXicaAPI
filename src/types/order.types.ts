export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED' | 'CLOSED';
export type ItemStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface OrderItemVariant {
  id?: number;
  variantId: string;
  price: number;
}

export interface OrderItem {
  id?: number;
  productId: string;
  notes?: string;
  unitPrice: number;
  status?: ItemStatus;
  variants?: OrderItemVariant[];
}

export interface Order {
  id: string;
  dailyFolio?: number;
  tableNumber?: string;
  waiterId?: string;
  items?: OrderItem[];
  status: OrderStatus;
  total: number;
  totalItems: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderItemDto {
  productId: string;
  notes?: string;
  variantIds?: string[];
}

export interface CreateOrderDto {
  tableNumber?: string;
  waiterId: string;
  items: CreateOrderItemDto[];
}
