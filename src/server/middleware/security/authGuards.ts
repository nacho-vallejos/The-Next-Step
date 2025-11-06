import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from './errors';
import { logger } from '../../utils/logger';

/**
 * Interfaz para payload del JWT
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Extender Request para incluir user
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware para verificar JWT
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const token = authHeader.substring(7);

    // Verificar token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no configurado');
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;

    // Adjuntar user al request
    req.user = decoded;

    logger.debug({
      msg: 'Usuario autenticado',
      userId: decoded.userId,
      path: req.path,
    });

    next();
  } catch (error: any) {
    logger.warn({
      msg: 'Autenticación fallida',
      error: error.message,
      ip: req.ip,
      path: req.path,
    });

    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expirado'));
    }

    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Token inválido'));
    }

    next(new UnauthorizedError('Error de autenticación'));
  }
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero lo valida si existe
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  return requireAuth(req, res, next);
};

/**
 * Middleware para requerir roles específicos
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('No autenticado'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn({
        msg: 'Acceso denegado - rol insuficiente',
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
      });

      return next(
        new ForbiddenError('No tiene permisos para acceder a este recurso')
      );
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario accede a sus propios recursos
 */
export const requireSelfOrAdmin = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('No autenticado'));
    }

    const requestedUserId = req.params[userIdParam];

    if (req.user.role === 'admin' || req.user.userId === requestedUserId) {
      return next();
    }

    logger.warn({
      msg: 'Intento de acceso a recursos de otro usuario',
      userId: req.user.userId,
      requestedUserId,
      path: req.path,
    });

    next(new ForbiddenError('Solo puede acceder a sus propios recursos'));
  };
};

/**
 * Generar JWT
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no configurado');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';

  return jwt.sign(payload, secret, {
    expiresIn,
    issuer: 'thenextstep.com.ar',
    audience: 'thenextstep.com.ar',
  });
};

/**
 * Generar refresh token
 */
export const generateRefreshToken = (
  payload: Omit<JWTPayload, 'iat' | 'exp'>
): string => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET no configurado');
  }

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, {
    expiresIn,
    issuer: 'thenextstep.com.ar',
    audience: 'thenextstep.com.ar',
  });
};

/**
 * Verificar refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET no configurado');
  }

  return jwt.verify(token, secret) as JWTPayload;
};

/**
 * Middleware para sesiones con cookies HttpOnly
 */
export const requireSession = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !(req.session as any).userId) {
    return next(new UnauthorizedError('Sesión no válida'));
  }

  // Renovar sesión en cada request para prevenir session fixation
  req.session.touch();

  next();
};
