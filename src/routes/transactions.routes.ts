import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { getRedisClient } from '../cache/redis.client';
import { TransactionSupabaseRepository } from '../repositories/supabase/transaction.supabase.repository';
import { TransactionsService } from '../services/transactions.service';
import { TransactionsController } from '../controllers/transactions.controller';
import { CloudflareBindings } from '../bindings';
import { Database } from '../types';

type Variables = {
  transactionsController: TransactionsController;
};

const transactionsApp = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();

transactionsApp.use('*', async (c, next) => {
  const supabase = createClient<Database>(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const redis = getRedisClient({
    UPSTASH_REDIS_REST_URL: c.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: c.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const repo = new TransactionSupabaseRepository(supabase);
  const service = new TransactionsService(repo, redis);
  const controller = new TransactionsController(service);

  c.set('transactionsController', controller);
  await next();
});

transactionsApp.post('/', (c) => c.get('transactionsController').createTransaction(c));
transactionsApp.get('/:id', (c) => c.get('transactionsController').getTransactionById(c));
transactionsApp.get('/order/:orderId', (c) => c.get('transactionsController').getTransactionsByOrder(c));

export default transactionsApp;
