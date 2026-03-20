import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { getRedisClient } from '../cache/redis.client';
import { CategorySupabaseRepository } from '../repositories/supabase/category.supabase.repository';
import { CategoriesService } from '../services/categories.service';
import { CategoriesController } from '../controllers/categories.controller';
import { CloudflareBindings } from '../bindings';
import { Database } from '../types';

type Variables = {
  categoriesController: CategoriesController;
};

const categoriesApp = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();

// Middleware the Inyección de Dependencias Per-Request
categoriesApp.use('*', async (c, next) => {
  const supabase = createClient<Database>(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const redis = getRedisClient({
    UPSTASH_REDIS_REST_URL: c.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: c.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const repo = new CategorySupabaseRepository(supabase);
  const service = new CategoriesService(repo, redis);
  const controller = new CategoriesController(service);

  c.set('categoriesController', controller);
  await next();
});

categoriesApp.post('/', (c) => c.get('categoriesController').createCategory(c));
categoriesApp.get('/', (c) => c.get('categoriesController').getCategories(c));
categoriesApp.get('/:id', (c) => c.get('categoriesController').getCategoryById(c));
categoriesApp.patch('/:id', (c) => c.get('categoriesController').updateCategory(c));
categoriesApp.delete('/:id', (c) => c.get('categoriesController').deleteCategory(c));

export default categoriesApp;
