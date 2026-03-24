import { IOrderRepository } from '../repositories/interfaces/order.repository.interface';
import { Order, CreateOrderDto, OrderStatus, ItemStatus } from '../types';
export class OrdersService {
  constructor(
    private readonly orderRepository: IOrderRepository
  ) {}

  async createOrder(orderDto: CreateOrderDto): Promise<Order> {
    const newOrder = await this.orderRepository.createOrder(orderDto);
    return newOrder;
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orderRepository.getOrderById(id);
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return this.orderRepository.getOrdersByStatus(status);
  }

  async updateOrderItemStatus(orderId: string, itemId: string, status: ItemStatus): Promise<Order> {    
    const updatedOrder = await this.orderRepository.updateOrderItemStatus(orderId, itemId, status);
    return updatedOrder;
  }
}
