import { Order, CreateOrderDto, OrderStatus, ItemStatus } from '../../types';

export interface IOrderRepository {
  createOrder(order: CreateOrderDto): Promise<Order>;
  getOrderById(id: string): Promise<Order | null>;
  getOrdersByStatus(status: OrderStatus): Promise<Order[]>;
  updateOrderItemStatus(orderId: string, itemId: number, status: ItemStatus): Promise<Order>;
}
