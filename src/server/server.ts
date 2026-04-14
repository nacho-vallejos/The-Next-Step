import express, { Express } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import session from 'express-session';

// Cargar variables de entorno
dotenv.config();

// Validar variables requeridas
const requiredEnvVars = ['SESSION_SECRET', 'COOKIE_SECRET', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`ERROR: Variable de entorno ${envVar} no configurada`);
    process.exit(1);
  }
}

// Importar middlewares de seguridad
import { helmetConfig, additionalSecurityHeaders, hideServerInfo } from './middleware/security/helmet';
import { globalRateLimiter, slowDownMiddleware } from './middleware/security/rateLimit';
import { corsConfig, validateOrigin, blockMaliciousUserAgents } from './middleware/security/cors';
import { injectCsrfToken, csrfErrorHandler, validateCsrfOrigin } from './middleware/security/csrf';
import { sanitizeInputs, preventParameterPollution, detectDangerousPatterns } from './middleware/security/validation';
import { errorHandler, notFoundHandler, setupErrorHandlers } from './middleware/security/errors';

// Utilidades
import { cspNonceMiddleware } from './utils/cspNonce';
import { httpLogger, logger } from './utils/logger';

// Rutas
import publicRoutes from './routes/public';
import contactRoutes from './routes/contact';
import authRoutes from './routes/auth';

// Configurar manejadores de errores globales
setupErrorHandlers();

// Crear aplicación Express
const app: Express = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// ==========================================
// MIDDLEWARES DE SEGURIDAD (ORDEN IMPORTANTE)
// ==========================================

// 1. Trust proxy (para obtener IP real detrás de proxy/load balancer)
app.set('trust proxy', 1);

// 2. Deshabilitar x-powered-by y headers del servidor
app.disable('x-powered-by');
app.use(hideServerInfo);

// 3. Logging HTTP
app.use(httpLogger);

// 4. Nonce para CSP (ANTES de Helmet)
app.use(cspNonceMiddleware);

// 5. Helmet con CSP
app.use(helmetConfig);
app.use(additionalSecurityHeaders);

// 6. CORS
app.use(corsConfig);
app.use(validateOrigin);
app.use(blockMaliciousUserAgents);

// 7. Rate limiting y slowdown
app.use(globalRateLimiter);
app.use(slowDownMiddleware);

// 8. Parsers de body
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 9. Cookie parser (requerido para CSRF y sesiones)
app.use(cookieParser(process.env.COOKIE_SECRET));

// 10. Sesiones
app.use(
  session({
    name: process.env.SESSION_NAME || 'tns_session',
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '3600000'), // 1 hora
    },
    // TODO: Usar Redis store en producción
    // store: new RedisStore({
    //   client: redisClient,
    //   prefix: 'sess:',
    // }),
  })
);

// 11. CSRF protection e inyección de token
app.use(injectCsrfToken);
app.use(validateCsrfOrigin);

// 12. Sanitización y validación
app.use(sanitizeInputs);
app.use(preventParameterPollution);
app.use(detectDangerousPatterns);

// 13. Compresión
app.use(compression());

// ==========================================
// RUTAS
// ==========================================

// Rutas públicas
app.use('/', publicRoutes);

// Rutas de autenticación
app.use('/', authRoutes);

// Rutas de contacto
app.use('/', contactRoutes);

// ==========================================
// MANEJO DE ERRORES
// ==========================================

// 404 - Ruta no encontrada
app.use(notFoundHandler);

// Manejo de errores CSRF
app.use(csrfErrorHandler);

// Handler global de errores
app.use(errorHandler);

// ==========================================
// INICIAR SERVIDOR
// ==========================================

const server = app.listen(PORT, () => {
  logger.info({
    msg: 'Servidor iniciado',
    port: PORT,
    host: HOST,
    env: process.env.NODE_ENV,
    nodeVersion: process.version,
  });

  console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║      🚀 THE NEXT STEP - Security Ready       ║
║                                              ║
║  Servidor: http://${HOST}:${PORT}        ║
║  Entorno:  ${process.env.NODE_ENV}                   ║
║  Node:     ${process.version}                      ║
║                                              ║
║  ✅ Helmet + CSP con nonce                   ║
║  ✅ CORS estricto                            ║
║  ✅ Rate limiting                            ║
║  ✅ CSRF protection                          ║
║  ✅ Input validation & sanitization          ║
║  ✅ Secure sessions & cookies                ║
║  ✅ Logging & monitoring                     ║
║                                              ║
╚══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido. Cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

export default app;
