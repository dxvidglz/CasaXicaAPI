import { Order, CreateOrderDto, OrderStatus } from '../../types';

export interface IOrderRepository {
  createOrder(order: CreateOrderDto): Promise<Order>;
  getOrderById(id: string): Promise<Order | null>;
  getOrdersByStatus(status: OrderStatus): Promise<Order[]>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order>;
}
