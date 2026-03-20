import { Redis } from '@upstash/redis/cloudflare';
import { CloudflareBindings } from '../bindings';

/**
 * Factory para inicializar el cliente de Upstash Redis.
 * @param env - Objeto que contiene las variables de entorno necesarias para configurar el cliente de Redis.
 */
export const getRedisClient = (env: Pick<CloudflareBindings, 'UPSTASH_REDIS_REST_URL' | 'UPSTASH_REDIS_REST_TOKEN'>): Redis => {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('Variables de entorno de Upstash Redis no encontradas');
  }

  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
};
