import { Context, Next } from 'hono';
import { createClient, User as AuthUser } from '@supabase/supabase-js';
import { AppError, handleApiError } from '../utils/error.handler';
import { CloudflareBindings } from '../bindings';

type AuthVariables = {
  authUser: AuthUser;
};

/**
 * Middleware de Autenticación Hono enfocado en Supabase Auth
 * 
 * Este middleware intercepta todas las llamadas configuradas buscando
 * la cabecera 'Authorization: Bearer <token>'
 */
export const authMiddleware = async (c: Context<{ Bindings: CloudflareBindings; Variables: AuthVariables }>, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Se requiere un token de autenticación (Bearer token) válido', 401);
    }
    const token = authHeader.split(' ')[1];

    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

    // Nota: Si el rendimiento es crítico, se recomienda usar una
    // librería nativa decodificando el JWT usando el Supabase JWT Secret 
    // sin necesidad de hacer una petición de red.
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError('Token de sesión inválido, expirado o revocado', 401);
    }

    c.set('authUser', user);
    
    await next();
  } catch (error: any) {
    return handleApiError(c, error);
  }
};
