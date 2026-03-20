import { Context } from 'hono';
import { CreateOrderDto, OrderStatus } from '../types';
import { OrdersService } from '../services/orders.service';
import { handleApiError, AppError } from '../utils/error.handler';

export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  async createOrder(c: Context) {
    try {
      const body = await c.req.json<CreateOrderDto>();
      const result = await this.ordersService.createOrder(body);
      
      return c.json({ data: result }, 201);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async getOrderById(c: Context) {
    try {
      const id = c.req.param('id');
      if (!id) throw new AppError('Order ID is required', 400);

      const result = await this.ordersService.getOrderById(id);
      
      if (!result) {
        throw new AppError('Order not found', 404);
      }
      
      return c.json({ data: result }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async getOrdersByStatus(c: Context) {
    try {
      const status = c.req.query('status') as OrderStatus;
      
      if (!status) {
         throw new AppError('Status query parameter is required', 400);
      }

      const result = await this.ordersService.getOrdersByStatus(status);
      return c.json({ data: result }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async updateOrderStatus(c: Context) {
    try {
      const id = c.req.param('id');
      if (!id) throw new AppError('Order ID is required', 400);
      
      const body = await c.req.json<{ status: OrderStatus }>();
      
      if (!body?.status) {
        throw new AppError('New status is required', 400);
      }

      const result = await this.ordersService.updateOrderStatus(id, body.status);
      return c.json({ data: result }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }
}
