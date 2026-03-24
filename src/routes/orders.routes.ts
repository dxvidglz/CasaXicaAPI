import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { getRedisClient } from '../cache/redis.client';
import { OrderSupabaseRepository } from '../repositories/supabase/order.supabase.repository';
import { OrdersService } from '../services/orders.service';
import { OrdersController } from '../controllers/orders.controller';
import { CloudflareBindings } from '../bindings';
import { Database } from '../types';

type Variables = {
  ordersController: OrdersController;
};

const ordersApp = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();

// Middleware de Inyección de Dependencias
ordersApp.use('*', async (c, next) => {
  const supabase = createClient<Database>(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const redis = getRedisClient({
    UPSTASH_REDIS_REST_URL: c.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: c.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const repo = new OrderSupabaseRepository(supabase);
  const service = new OrdersService(repo, redis);
  const controller = new OrdersController(service);

  c.set('ordersController', controller);

  await next();
});

ordersApp.post('/', (c) => c.get('ordersController').createOrder(c));
ordersApp.get('/', (c) => c.get('ordersController').getOrdersByStatus(c));
ordersApp.get('/:id', (c) => c.get('ordersController').getOrderById(c));
ordersApp.patch('/:orderId/items/:itemId/status', (c) => c.get('ordersController').updateOrderItemStatus(c));

export default ordersApp;
