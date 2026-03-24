import { IOrderRepository } from '../repositories/interfaces/order.repository.interface';
import { Order, CreateOrderDto, OrderStatus, ItemStatus } from '../types';
import { Redis } from '@upstash/redis/cloudflare';

export class OrdersService {
  private readonly DEFAULT_CACHE_TTL = 300; // 5 minutos

  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly redis: Redis
  ) {}

  async createOrder(orderDto: CreateOrderDto): Promise<Order> {
    const newOrder = await this.orderRepository.createOrder(orderDto);
    
    const cacheKey = `order:${newOrder.id}`;
    await this.redis.set(cacheKey, newOrder, { ex: this.DEFAULT_CACHE_TTL });

    await this.redis.del(`orders:status:${newOrder.status}`);

    return newOrder;
  }

  async getOrderById(id: string): Promise<Order | null> {
    const cacheKey = `order:${id}`;
    
    const cachedOrder = await this.redis.get<Order>(cacheKey);
    if (cachedOrder) {
      return cachedOrder;
    }

    const order = await this.orderRepository.getOrderById(id);
    
    if (order) {
      await this.redis.set(cacheKey, order, { ex: this.DEFAULT_CACHE_TTL });
    }

    return order;
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    const cacheKey = `orders:status:${status}`;
    
    const cachedOrders = await this.redis.get<Order[]>(cacheKey);
    // Verificamos solo la existencia en caché. Si guardamos un "[]" (0 orders en base de datos), se respeta y 
    // evitamos golpear Supabase innecesariamente (evitando "cache penetration").
    if (cachedOrders) {
      return cachedOrders;
    }

    const orders = await this.orderRepository.getOrdersByStatus(status);
    
    await this.redis.set(cacheKey, orders, { ex: 60 });

    return orders;
  }

  async updateOrderItemStatus(orderId: string, itemId: number, status: ItemStatus): Promise<Order> {    
    // 1. Actualizamos en base de datos
    const updatedOrder = await this.orderRepository.updateOrderItemStatus(orderId, itemId, status);
    
    // 2. Actualizamos la caché individual pre-calentándola para consultas futuras
    const cacheKey = `order:${orderId}`;
    await this.redis.set(cacheKey, updatedOrder, { ex: this.DEFAULT_CACHE_TTL });
    
    // 3. Ya no tenemos cambio de "OrderStatus", pero quizá el listado de este estado cambió en base a los items.
    // Invalidamos el listado del estado actual de esta orden por precaución.
    await this.redis.del(`orders:status:${updatedOrder.status}`);
    
    return updatedOrder;
  }
}
