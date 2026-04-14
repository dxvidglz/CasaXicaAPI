import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../utils/error.handler';
import { AuthLoginDto, AuthRegisterDto } from '../types';

/**
 * Servicio de Autenticación — encapsula las operaciones de Supabase Auth.
 *
 * Recibe las credenciales de entorno por constructor para crear un cliente
 * Supabase nuevo por cada request (patrón ya usado en la capa de rutas).
 */
export class AuthService {
  private readonly supabase: SupabaseClient;
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // ───────────────────────── Registro ─────────────────────────

  async register(dto: AuthRegisterDto) {
    const { data, error } = await this.supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: { name: dto.name },
        emailRedirectTo: 'http://localhost:5173',
      },
    });

    if (error) {
      throw new AppError(error.message, 400, error);
    }

    return {
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
            created_at: data.user.created_at,
          }
        : null,
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_in: data.session.expires_in,
          }
        : null,
    };
  }

  // ───────────────────────── Login ─────────────────────────

  async login(dto: AuthLoginDto) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      const translatedMessage = error?.code === 'invalid_credentials' ? 'Correo o contraseña incorrecta' : error.message || error?.code === 'email_not_confirmed' ? 'Correo no confirmado. Revisa tu bandeja de entrada.' : error.message;
      throw new AppError(translatedMessage, 401, error);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        last_sign_in_at: data.user.last_sign_in_at,
        user_metadata: data.user.user_metadata,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
      },
    };
  }

  // ───────────────────────── Logout ─────────────────────────

  async logout(accessToken: string) {
    const { error } = await this.supabase.auth.admin.signOut(accessToken, 'global');

    if (error) {
      throw new AppError(error.message, 500, error);
    }
  }

  // ───────────────────────── Refresh Token ─────────────────────────

  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new AppError(error.message, 401, error);
    }

    if (!data.session) {
      throw new AppError('No se pudo renovar la sesión', 401);
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    };
  }

  // ───────────────────────── Reset Password (envía email) ─────────────────────────

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'exp://192.168.1.67:8081/--/update-password',
    });

    if (error) {
      throw new AppError(error.message, 400, error);
    }
  }

  // ───────────────────────── Update Password ─────────────────────────

  async updatePassword(userId: string, newPassword: string) {
    const { error } = await this.supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      throw new AppError(error.message, 400, error);
    }
  }

  // ───────────────────────── Update Forgot Password ─────────────────────────

  async resetPasswordByToken(access_token: string, newPassword: string) {
   const { data: { user }, error: authError } = await this.supabase.auth.getUser(access_token);
   if (authError || !user) throw new AppError("Token inválido o expirado");

   await this.updatePassword(user.id, newPassword);
  }

  // ───────────────────────── Update Metadata ─────────────────────────

  async updateUserMetadata(userId: string, metadata: { name: string }) {
    const { data, error } = await this.supabase.auth.admin.updateUserById(userId, {
      user_metadata: metadata,
    });

    if (error) {
      throw new AppError(error.message, 400, error);
    }

    return data.user;
  }

}
