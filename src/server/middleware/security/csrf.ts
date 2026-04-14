import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

type RequestWithCsrf = Request & { csrfToken?: () => string };

/**
 * Configuración de protección CSRF con double submit cookie
 */
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    signed: true,
    key: '_csrf',
    maxAge: 3600000, // 1 hora
  },
  value: (req: Request) => {
    return (
      req.headers['x-csrf-token'] as string ||
      req.body._csrf ||
      (req.query._csrf as string)
    );
  },
});

/**
 * Middleware para inyectar token CSRF en respuestas HTML
 */
export const injectCsrfToken = (req: RequestWithCsrf, res: Response, next: NextFunction) => {
  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();

    // Para APIs JSON, incluir en header
    if (req.path.startsWith('/api/')) {
      res.setHeader('X-CSRF-Token', res.locals.csrfToken);
    }
  }
  next();
};

/**
 * Manejo de errores CSRF
 */
export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  logger.warn({
    msg: 'Token CSRF inválido',
    ip: req.ip,
    path: req.path,
    method: req.method,
    referer: req.get('referer'),
  });

  res.status(403).json({
    error: 'Token de seguridad inválido o expirado. Por favor recargue la página.',
    code: 'CSRF_VALIDATION_FAILED',
  });
};

/**
 * Middleware condicional de CSRF
 * Solo aplica a rutas que modifican datos
 */
export const conditionalCsrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  if (req.path.startsWith('/api/') && req.headers.authorization) {
    return next();
  }

  return csrfProtection(req, res, next);
};

/**
 * Validar origin en requests con CSRF
 */
export const validateCsrfOrigin = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('origin');
  const referer = req.get('referer');
  const host = req.get('host');

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          logger.warn({ msg: 'CSRF: Origin no coincide con host', origin, host, ip: req.ip });
          return res.status(403).json({ error: 'Invalid request origin' });
        }
      } catch (e) {
        return res.status(403).json({ error: 'Invalid origin' });
      }
    } else if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host !== host) {
          logger.warn({ msg: 'CSRF: Referer no coincide con host', referer, host, ip: req.ip });
          return res.status(403).json({ error: 'Invalid request referer' });
        }
      } catch (e) {
        return res.status(403).json({ error: 'Invalid referer' });
      }
    }
  }

  next();
};
