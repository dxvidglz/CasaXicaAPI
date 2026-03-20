import { Context } from 'hono';

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Normaliza y maneja errores para devolver una respuesta JSON estructurada al cliente web.
 */
export const handleApiError = (c: Context, error: any) => {
  // Aquí es ideal conectar un logger dinámico como Datadog o Sentry
  console.error('[API Error]:', error);

  if (error instanceof AppError) {
    return c.json(
      { error: error.message, details: error.details },
      error.statusCode as any 
    );
  }

  return c.json(
    { error: error.message || 'Internal Server Error' },
    500
  );
};

/**
 * Traduce errores nativos de Supabase/PostgREST a nuestros AppErrors controlados.
 */
export const handleSupabaseError = (error: any, contextMessage: string): never => {
  // 23505 = Unique constraint violation
  if (error.code === '23505') {
    throw new AppError('Conflict: Element already exists in the database', 409, error);
  }
  
  // 23503 = Foreign key constraint violation
  if (error.code === '23503') {
    throw new AppError('Conflict: Relational constraint violation', 409, error);
  }

  // Fallback a 500 con el mensaje englobado
  throw new AppError(`${contextMessage}: ${error.message}`, 500, error);
};
