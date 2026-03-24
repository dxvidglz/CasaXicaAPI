import { Hono } from 'hono';
import { UsersController } from '../controllers/users.controller';
import { AuthService } from '../services/auth.service';
import { CloudflareBindings } from '../bindings';
import { authMiddleware } from '../middlewares/auth.middleware';
import { User as AuthUser } from '@supabase/supabase-js';

type Variables = {
  usersController: UsersController;
  authUser: AuthUser;
};

const usersApp = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();

// ============================================
// 1. MIDDLEWARE DE INYECCIÓN DE DEPENDENCIAS
// ============================================
usersApp.use('*', async (c, next) => {
  const authService = new AuthService(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const controller = new UsersController(authService);
  c.set('usersController', controller);
  await next();
});

// ============================================
// 2. RUTAS PÚBLICAS (no requieren JWT)
// ============================================
usersApp.post('/register', (c) => c.get('usersController').register(c));
usersApp.post('/login', (c) => c.get('usersController').login(c));
usersApp.post('/refresh', (c) => c.get('usersController').refreshToken(c));
usersApp.post('/reset-password', (c) => c.get('usersController').resetPassword(c));

// ============================================
// 3. RUTAS PROTEGIDAS (requieren JWT válido)
// ============================================
usersApp.use('/me', authMiddleware);
usersApp.use('/logout', authMiddleware);
usersApp.use('/update-password', authMiddleware);

usersApp.get('/me', (c) => c.get('usersController').getMe(c));
usersApp.post('/logout', (c) => c.get('usersController').logout(c));
usersApp.post('/update-password', (c) => c.get('usersController').updatePassword(c));

export default usersApp;
