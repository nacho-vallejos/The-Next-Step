import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response } from 'express';
import { logger } from '../../utils/logger';

/**
 * Rate limiter global para todas las rutas públicas
 * 100 requests por 15 minutos por IP
 */
export const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
    retryAfter: '15 minutos',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Whitelist de IPs confiables (opcional)
    const trustedIPs = (process.env.TRUSTED_IPS || '').split(',').filter(Boolean);
    const clientIP = req.ip || req.socket.remoteAddress || '';
    return trustedIPs.includes(clientIP);
  },
  handler: (req: Request, res: Response) => {
    logger.warn({
      msg: 'Rate limit excedido',
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
    });
    
    res.status(429).json({
      error: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
      retryAfter: '15 minutos',
    });
  },
});

/**
 * Rate limiter estricto para rutas de autenticación
 * 5 intentos por 15 minutos
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '5'),
  skipSuccessfulRequests: true, // Solo contar fallos
  message: {
    error: 'Demasiados intentos de inicio de sesión. Cuenta bloqueada temporalmente.',
    retryAfter: '15 minutos',
  },
  handler: (req: Request, res: Response) => {
    logger.error({
      msg: 'Posible ataque de fuerza bruta detectado',
      ip: req.ip,
      path: req.path,
      email: req.body.email || 'N/A',
    });
    
    // TODO: Enviar alerta de seguridad
    
    res.status(429).json({
      error: 'Demasiados intentos fallidos. Cuenta bloqueada temporalmente por seguridad.',
      retryAfter: '15 minutos',
    });
  },
});

/**
 * Rate limiter para formulario de contacto
 * 3 envíos por hora
 */
export const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: parseInt(process.env.RATE_LIMIT_CONTACT_MAX || '3'),
  message: {
    error: 'Ha alcanzado el límite de envíos. Por favor intente más tarde.',
    retryAfter: '1 hora',
  },
  handler: (req: Request, res: Response) => {
    logger.warn({
      msg: 'Rate limit en formulario de contacto',
      ip: req.ip,
      email: req.body.email || 'N/A',
    });
    
    res.status(429).json({
      error: 'Ha alcanzado el límite de envíos. Por favor intente más tarde.',
      retryAfter: '1 hora',
    });
  },
});

/**
 * Slow down - ralentizar requests progresivamente
 * Después de 50 requests, añadir delay creciente
 */
export const slowDownMiddleware = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 50,
  delayMs: 500, // Añadir 500ms de delay por cada request sobre el límite
  maxDelayMs: 20000, // Máximo 20 segundos de delay
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  onLimitReached: (req: Request) => {
    logger.warn({
      msg: 'Slow down activado',
      ip: req.ip,
      path: req.path,
    });
  },
});

/**
 * Rate limiter para endpoints de API
 * Más permisivo que auth pero más restrictivo que global
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: 'Demasiadas llamadas a la API desde esta IP.',
    retryAfter: '15 minutos',
  },
});

/**
 * Rate limiter para operaciones costosas (uploads, exports, etc.)
 */
export const heavyOperationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: {
    error: 'Ha excedido el límite de operaciones pesadas.',
    retryAfter: '1 hora',
  },
});
