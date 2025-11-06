import pino from 'pino';
import pinoHttp from 'pino-http';
import { Request, Response } from 'express';

/**
 * Configuración del logger con Pino
 * Incluye redacción de campos sensibles
 */

// Campos sensibles que NO deben loguearse
const REDACTED_FIELDS = [
  'password',
  'passwordConfirm',
  'newPassword',
  'currentPassword',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'set-cookie',
  'api_key',
  'apiKey',
  'secret',
  'csrf',
  '_csrf',
  'ssn',
  'creditCard',
  'cvv',
];

// Opciones de Pino
const pinoOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  
  // Redactar campos sensibles
  redact: {
    paths: REDACTED_FIELDS.flatMap(field => [
      field,
      `req.headers.${field}`,
      `req.body.${field}`,
      `req.query.${field}`,
      `res.headers.${field}`,
    ]),
    censor: '[REDACTED]',
  },

  // Formateo en desarrollo
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,

  // Timestamp
  timestamp: pino.stdTimeFunctions.isoTime,

  // Base fields
  base: {
    env: process.env.NODE_ENV,
    app: 'the-next-step',
  },

  // Serializers personalizados
  serializers: {
    req: (req: Request) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      params: req.params,
      ip: req.ip,
      ips: req.ips,
      userAgent: req.get('user-agent'),
      referer: req.get('referer'),
    }),
    res: (res: Response) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
};

// Crear logger
export const logger = pino(pinoOptions);

/**
 * Middleware HTTP logger con Pino
 */
export const httpLogger = pinoHttp({
  logger,
  
  // Customizar mensaje de log
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    if (res.statusCode >= 300) return 'info';
    return 'info';
  },

  // Customizar mensaje
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} - ${res.statusCode}`;
  },

  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
  },

  // Adicionar campos personalizados
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'duration',
  },

  // Auto-logging de errores
  autoLogging: {
    ignore: (req) => {
      // No loguear health checks
      return req.url === '/health' || req.url === '/ping';
    },
  },
});

/**
 * Logger para eventos de seguridad
 */
export const securityLogger = logger.child({ context: 'security' });

/**
 * Logger para auditoría (acciones críticas)
 */
export const auditLogger = logger.child({ context: 'audit' });

/**
 * Función helper para logs de riesgo
 */
export const logSecurityEvent = (
  level: 'info' | 'warn' | 'error',
  event: string,
  details: Record<string, any>
) => {
  securityLogger[level]({
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });

  // TODO: Enviar alertas si el nivel es crítico
  if (level === 'error') {
    // Enviar a sistema de alertas (email, Slack, PagerDuty, etc.)
  }
};

/**
 * Sistema simple de detección de intrusos (IDS)
 * Cuenta eventos sospechosos por IP
 */
const suspiciousActivity = new Map<string, { count: number; lastSeen: Date }>();

export const trackSuspiciousActivity = (ip: string, activity: string) => {
  const current = suspiciousActivity.get(ip) || { count: 0, lastSeen: new Date() };
  
  current.count++;
  current.lastSeen = new Date();
  
  suspiciousActivity.set(ip, current);

  // Si hay demasiados eventos sospechosos, alertar
  const threshold = parseInt(process.env.ALERT_THRESHOLD_401 || '10');
  
  if (current.count > threshold) {
    logSecurityEvent('error', 'POSSIBLE_ATTACK', {
      ip,
      activity,
      count: current.count,
      lastSeen: current.lastSeen,
    });
  }

  // Limpiar entries antiguos (más de 1 hora)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [key, value] of suspiciousActivity.entries()) {
    if (value.lastSeen < oneHourAgo) {
      suspiciousActivity.delete(key);
    }
  }
};
