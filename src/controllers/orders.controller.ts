import { Context } from 'hono';
import { CreateOrderDto, OrderStatus, ItemStatus, CreateOrderItemDto } from '../types';
import { OrdersService } from '../services/orders.service';
import { handleApiError, AppError } from '../utils/error.handler';

export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  async createOrder(c: Context) {
    try {
      const body = await c.req.json<CreateOrderDto>();
      await this.ordersService.createOrder(body);
      
      return c.json({ success: true }, 201);
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
      const status = c.req.query('status') as OrderStatus | undefined;
      
      let userRole = 'WAITER'; // Rol seguro por defecto

      const authHeader = c.req.header('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        
        // Creamos un cliente anónimo puro para validar al user
        const { createClient } = require('@supabase/supabase-js');
        const anonSupabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

        // Supabase valida el jwt automáticamente
        const { data: authData } = await anonSupabase.auth.getUser(token);
        
        if (authData?.user) {
           // Buscamos su rol en tu tabla externa 'users'
           const { data: userData } = await anonSupabase
              .from('users')
              .select('role')
              .eq('id', authData.user.id)
              .single();
              
           if (userData) userRole = userData.role;
        }
      }

      const result = await this.ordersService.getOrdersByStatus(status, userRole);
      return c.json({ data: result }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async updateOrderItemStatus(c: Context) {
    try {
      const orderId = c.req.param('orderId');
      const itemId = c.req.param('itemId');
      if (!orderId || !itemId) throw new AppError('Order ID and Item ID are required', 400);
      
      const body = await c.req.json<{ status: ItemStatus }>();
      
      if (!body?.status) {
        throw new AppError('New status is required', 400);
      }

      await this.ordersService.updateOrderItemStatus(orderId, itemId, body.status);
      return c.json({ success: true }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async addItemToOrder(c: Context) {
    try {
      const orderId = c.req.param('orderId');
      if (!orderId) throw new AppError('Order ID is required', 400);

      const body = await c.req.json<CreateOrderItemDto>();

      if (!body?.productId) {
        throw new AppError('productId is required', 400);
      }

      await this.ordersService.addItemToOrder({ orderId, item: body });
      return c.json({ success: true }, 201);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }
}
