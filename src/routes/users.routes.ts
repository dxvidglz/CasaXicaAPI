import { Hono } from 'hono';
import { UsersController } from '../controllers/users.controller';
import { CloudflareBindings } from '../bindings';
import { authMiddleware } from '../middlewares/auth.middleware';
import { User as AuthUser } from '@supabase/supabase-js';

type Variables = {
  usersController: UsersController;
  authUser: AuthUser; // Importante para la capa de seguridad de tipado de Hono
};

const usersApp = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();

usersApp.use('*', async (c, next) => {
  const controller = new UsersController(); // TODO: Inyectar repositorios/servicios al conectarlo real 
  c.set('usersController', controller);
  await next();
});

// ============================================
// 2. RUTAS PÚBLICAS 
// ============================================
// Ejemplo: usersApp.post('/login', (c) => c.get('usersController').login(c));
// Ejemplo: usersApp.post('/register', (c) => c.get('usersController').register(c));


// ============================================
// 3. RUTAS PROTEGIDAS / PRIVADAS
// ============================================
// El 'authMiddleware' bloqueará a cualquiera que no tenga Token en sus cabeceras.
usersApp.use('/me', authMiddleware);

usersApp.get('/me', (c) => c.get('usersController').getMe(c));

export default usersApp;
