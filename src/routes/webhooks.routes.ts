import { Hono } from 'hono';
import { getRedisClient } from '../cache/redis.client';
import { CloudflareBindings } from '../bindings';

const webhooksApp = new Hono<{ Bindings: CloudflareBindings }>();

// Middleware to secure the webhook endpoint
webhooksApp.use('*', async (c, next) => {
  const secret = c.req.query('secret') || c.req.header('x-webhook-secret');
  
  if (!secret || secret !== c.env.WEBHOOK_SECRET) {
    return c.json({ error: 'Unauthorized. Invalid webhook secret.' }, 401);
  }
  
  await next();
});

webhooksApp.post('/supabase', async (c) => {
  try {
    const payload = await c.req.json();
    const table = payload.table;
    const type = payload.type;
    
    // In DELETE, record is inside old_record. In INSERT/UPDATE, it's inside record.
    const record = type === 'DELETE' ? payload.old_record : payload.record;

    if (!table || !record) {
      return c.json({ error: 'Invalid payload structure' }, 400);
    }

    const redis = getRedisClient({
      UPSTASH_REDIS_REST_URL: c.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: c.env.UPSTASH_REDIS_REST_TOKEN,
    });

    if (table === 'categories') {
      await redis.del(`categories:all`);
      if (record.id) {
        await redis.del(`category:${record.id}`);
      }
    } else if (table === 'products') {
      const categoryId = record.category_id || record.categoryId;
      
      await redis.del(`products:category:all`);
      
      if (categoryId) {
         await redis.del(`products:category:${categoryId}`);
      }
      if (record.id) {
         await redis.del(`product:${record.id}`);
      }
      
      // En un UPDATE, si movimos el producto de categoría, invalidar la categoría vieja
      if (type === 'UPDATE' && payload.old_record) {
         const oldCategoryId = payload.old_record.category_id || payload.old_record.categoryId;
         if (oldCategoryId && oldCategoryId !== categoryId) {
             await redis.del(`products:category:${oldCategoryId}`);
         }
      }
    }

    return c.json({ success: true, message: `Cache invalidated for table ${table}` }, 200);
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default webhooksApp;
