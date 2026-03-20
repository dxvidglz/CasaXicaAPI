import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { getRedisClient } from '../cache/redis.client';
import { ProductSupabaseRepository } from '../repositories/supabase/product.supabase.repository';
import { ProductsService } from '../services/products.service';
import { ProductsController } from '../controllers/products.controller';
import { CloudflareBindings } from '../bindings';
import { Database } from '../types';

type Variables = {
  productsController: ProductsController;
};

const productsApp = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();

productsApp.use('*', async (c, next) => {
  const supabase = createClient<Database>(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const redis = getRedisClient({
    UPSTASH_REDIS_REST_URL: c.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: c.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const repo = new ProductSupabaseRepository(supabase);
  const service = new ProductsService(repo, redis);
  const controller = new ProductsController(service);

  c.set('productsController', controller);
  await next();
});

productsApp.post('/', (c) => c.get('productsController').createProduct(c));
productsApp.get('/', (c) => c.get('productsController').getProducts(c));
productsApp.get('/:id', (c) => c.get('productsController').getProductById(c));
productsApp.patch('/:id', (c) => c.get('productsController').updateProduct(c));
productsApp.delete('/:id', (c) => c.get('productsController').deleteProduct(c));

export default productsApp;
