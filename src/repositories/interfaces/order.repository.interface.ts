import { Order, CreateOrderDto, OrderStatus, ItemStatus, AddOrderItemDto } from '../../types';

export interface IOrderRepository {
  createOrder(order: CreateOrderDto): Promise<void>;
  getOrderById(id: string): Promise<Order | null>;
  getOrdersByStatus(status?: OrderStatus, userRole?: string): Promise<Order[]>;
  updateOrderItemStatus(orderId: string, itemId: string, status: ItemStatus): Promise<void>;
  addItemToOrder(dto: AddOrderItemDto): Promise<void>;
}
