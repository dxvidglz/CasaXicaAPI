import { IOrderRepository } from '../repositories/interfaces/order.repository.interface';
import { Order, CreateOrderDto, OrderStatus } from '../types';
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

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    // 1. ESENCIAL: Obtener la orden antes de actualizar para saber en qué lista de estado estaba
    const previousOrder = await this.getOrderById(id);
    
    // 2. Actualizamos en base de datos
    const updatedOrder = await this.orderRepository.updateOrderStatus(id, status);
    
    // 3. Actualizamos la caché individual pre-calentándola para consultas futuras
    const cacheKey = `order:${id}`;
    await this.redis.set(cacheKey, updatedOrder, { ex: this.DEFAULT_CACHE_TTL });
    
    // 4. INVALIDACIÓN DOBLE: Borrar el listado del estado "viejo" y el listado del estado "nuevo"
    // Si no borras el viejo, la aplicación mostrará la orden duplicada (por ejemplo, en PENDING y en PREPARING a la vez).
    if (previousOrder && previousOrder.status !== status) {
      await this.redis.del(`orders:status:${previousOrder.status}`);
    }
    await this.redis.del(`orders:status:${status}`);
    
    return updatedOrder;
  }
}
