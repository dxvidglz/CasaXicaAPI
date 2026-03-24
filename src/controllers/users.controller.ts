import { Context } from 'hono';
import { AuthService } from '../services/auth.service';
import { handleApiError, AppError } from '../utils/error.handler';
import {
  AuthLoginDto,
  AuthRegisterDto,
  AuthRefreshTokenDto,
  AuthResetPasswordDto,
  AuthUpdatePasswordDto,
} from '../types';

export class UsersController {
  constructor(private readonly authService: AuthService) {}

  // ─────────────── POST /auth/register ───────────────

  async register(c: Context) {
    try {
      const body = await c.req.json<AuthRegisterDto>();

      if (!body.email || !body.password) {
        throw new AppError('El email y password son obligatorios', 400);
      }

      const result = await this.authService.register(body);
      return c.json({ data: result }, 201);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  // ─────────────── POST /auth/login ───────────────

  async login(c: Context) {
    try {
      const body = await c.req.json<AuthLoginDto>();

      if (!body.email || !body.password) {
        throw new AppError('El email y password son obligatorios', 400);
      }

      const result = await this.authService.login(body);
      return c.json({ data: result }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  // ─────────────── POST /auth/logout  (protegida) ───────────────

  async logout(c: Context) {
    try {
      const authHeader = c.req.header('Authorization');
      const token = authHeader?.split(' ')[1];

      if (!token) {
        throw new AppError('Token no encontrado en las cabeceras', 401);
      }

      await this.authService.logout(token);
      return c.json({ data: { message: 'Sesión cerrada correctamente' } }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  // ─────────────── POST /auth/refresh ───────────────

  async refreshToken(c: Context) {
    try {
      const body = await c.req.json<AuthRefreshTokenDto>();

      if (!body.refresh_token) {
        throw new AppError('El refresh_token es obligatorio', 400);
      }

      const result = await this.authService.refreshToken(body.refresh_token);
      return c.json({ data: result }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  // ─────────────── POST /auth/reset-password ───────────────

  async resetPassword(c: Context) {
    try {
      const body = await c.req.json<AuthResetPasswordDto>();

      if (!body.email) {
        throw new AppError('El email es obligatorio', 400);
      }

      await this.authService.resetPassword(body.email);
      return c.json(
        { data: { message: 'Si el correo existe, recibirás un enlace de recuperación' } },
        200,
      );
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  // ─────────────── POST /auth/update-password  (protegida) ───────────────

  async updatePassword(c: Context) {
    try {
      const body = await c.req.json<AuthUpdatePasswordDto>();

      if (!body.password) {
        throw new AppError('La nueva contraseña es obligatoria', 400);
      }

      const user = c.get('authUser');

      if (!user) {
        throw new AppError('Usuario no encontrado o no autenticado', 401);
      }

      await this.authService.updatePassword(user.id, body.password);
      return c.json({ data: { message: 'Contraseña actualizada correctamente' } }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  // ─────────────── GET /auth/me  (protegida) ───────────────

  async getMe(c: Context) {
    try {
      const user = c.get('authUser');

      if (!user) {
        throw new AppError('Petición huérfana. El usuario no superó el authMiddleware', 401);
      }

      return c.json(
        {
          data: {
            id: user.id,
            email: user.email,
            auth_role: user.role,
            last_sign_in_at: user.last_sign_in_at,
          },
        },
        200,
      );
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }
}
