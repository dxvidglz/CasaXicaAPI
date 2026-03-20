import { Context } from 'hono';
import { handleApiError, AppError } from '../utils/error.handler';

export class UsersController {
  // TODO: inyectar UsersService cuando se necesiten guardar perfiles.
  constructor() {}

  async getMe(c: Context) {
    try {
      // Obtenemos el usuario autenticado decodificado en el AuthMiddleware
      const user = c.get('authUser');
      
      if (!user) {
         throw new AppError('Petición huérfana. El usuario no superó el authMiddleware', 401);
      }
      
      return c.json({ data: {
          id: user.id,
          email: user.email,
          auth_role: user.role,
          last_sign_in_at: user.last_sign_in_at,
      }}, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  // TODO: Agregar login, registro y cierres de sesión proxy aquí.
}
