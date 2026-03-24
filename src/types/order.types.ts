export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
export type ItemStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface OrderDetailVariant {
  id?: number;
  variantId: string;
  price: number;
}

export interface OrderDetail {
  id?: number;
  productId: string;
  quantity: number;
  notes?: string;
  unitPrice: number;
  itemStatus?: ItemStatus;
  variants?: OrderDetailVariant[];
}

export interface Order {
  id: string;
  dailyFolio?: number;
  tableNumber?: string;
  waiterId?: string;
  items?: OrderDetail[];
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderDetailDto {
  productId: string;
  quantity: number;
  notes?: string;
  variantIds?: string[];
}

export interface CreateOrderDto {
  tableNumber?: string;
  waiterId: string;
  items: CreateOrderDetailDto[];
}
