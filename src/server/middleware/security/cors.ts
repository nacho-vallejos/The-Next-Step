import cors from 'cors';
import { Request } from 'express';

/**
 * Configuración de CORS estricta
 * Solo permite orígenes específicos en whitelist
 */

// Lista de orígenes permitidos
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// En desarrollo, permitir localhost
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
}

export const corsConfig = cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, curl, Postman)
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Verificar si el origin está en la whitelist
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} no permitido por CORS`));
    }
  },

  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  // Headers permitidos
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With',
  ],

  // Headers expuestos al cliente
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],

  // Permitir cookies y credenciales
  credentials: true,

  // Preflight cache (24 horas)
  maxAge: 86400,

  // No permitir preflight success status 204 (usar 200)
  optionsSuccessStatus: 200,

  // Validación adicional en preflight
  preflightContinue: false,
});

/**
 * Middleware adicional para validar origin en requests críticos
 */
export const validateOrigin = (req: Request, res: any, next: any) => {
  const origin = req.get('origin');
  const referer = req.get('referer');

  // Para requests POST/PUT/DELETE, validar estrictamente
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if (!origin && !referer) {
      return res.status(403).json({
        error: 'Forbidden: Missing origin header',
      });
    }

    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({
        error: 'Forbidden: Invalid origin',
      });
    }
  }

  next();
};

/**
 * Lista de User-Agents bloqueados (bots maliciosos conocidos)
 */
const blockedUserAgents = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /metasploit/i,
  /havij/i,
  /acunetix/i,
];

/**
 * Middleware para bloquear User-Agents sospechosos
 */
export const blockMaliciousUserAgents = (req: Request, res: any, next: any) => {
  const userAgent = req.get('user-agent') || '';

  for (const pattern of blockedUserAgents) {
    if (pattern.test(userAgent)) {
      return res.status(403).json({
        error: 'Forbidden',
      });
    }
  }

  next();
};
