import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

/**
 * Clase personalizada para errores de la aplicación
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errores HTTP comunes
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso prohibido') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflicto') {
    super(message, 409, 'CONFLICT');
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Demasiadas solicitudes') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Error interno del servidor') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

/**
 * Handler para rutas no encontradas (404)
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Ruta ${req.originalUrl} no encontrada`);
  next(error);
};

/**
 * Handler global de errores
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Error interno del servidor';
  let code = 'INTERNAL_SERVER_ERROR';

  // Si es un AppError, usar sus propiedades
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || code;
  }

  // Errores específicos de librerías
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
    code = 'TOKEN_EXPIRED';
  }

  // Log del error
  logger.error({
    msg: 'Error en request',
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      code,
    },
    request: {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
    statusCode,
  });

  // Respuesta al cliente
  const errorResponse: any = {
    error: message,
    code,
  };

  // Solo incluir stack trace en desarrollo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Wrapper async para evitar try-catch en cada ruta
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handler para errores no capturados
 */
export const setupErrorHandlers = () => {
  // Uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.fatal({
      msg: 'UNCAUGHT EXCEPTION! Cerrando aplicación...',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });

    process.exit(1);
  });

  // Unhandled promise rejections
  process.on('unhandledRejection', (reason: any) => {
    logger.fatal({
      msg: 'UNHANDLED REJECTION! Cerrando aplicación...',
      reason,
    });

    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM recibido. Cerrando servidor gracefully...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT recibido. Cerrando servidor gracefully...');
    process.exit(0);
  });
};
