import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { z } from 'zod';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { logger } from '../../utils/logger';

/**
 * Middleware para sanitizar inputs y prevenir NoSQL injection
 */
export const sanitizeInputs = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn({
      msg: 'Input sanitizado - posible intento de NoSQL injection',
      ip: req.ip,
      path: req.path,
      key,
    });
  },
});

/**
 * Prevenir HTTP Parameter Pollution
 */
export const preventParameterPollution = hpp({
  whitelist: ['sort', 'filter', 'page', 'limit'], // Parámetros que SÍ pueden duplicarse
});

/**
 * Schema de validación para formulario de contacto
 */
export const contactFormSchema = Joi.object({
  nombre: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras',
    }),

  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .max(255)
    .required()
    .messages({
      'string.empty': 'El email es requerido',
      'string.email': 'El email no es válido',
      'string.max': 'El email es demasiado largo',
    }),

  empresa: Joi.string()
    .trim()
    .max(200)
    .allow('')
    .optional()
    .messages({
      'string.max': 'El nombre de empresa es demasiado largo',
    }),

  mensaje: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'El mensaje es requerido',
      'string.min': 'El mensaje debe tener al menos 10 caracteres',
      'string.max': 'El mensaje no puede exceder 2000 caracteres',
    }),
});

/**
 * Schema Zod alternativo para contacto
 */
export const contactFormSchemaZod = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),

  email: z
    .string()
    .trim()
    .email('El email no es válido')
    .max(255, 'El email es demasiado largo'),

  empresa: z
    .string()
    .trim()
    .max(200, 'El nombre de empresa es demasiado largo')
    .optional(),

  mensaje: z
    .string()
    .trim()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(2000, 'El mensaje no puede exceder 2000 caracteres'),
});

/**
 * Middleware genérico de validación con Joi
 */
export const validateWithJoi = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      logger.warn({
        msg: 'Validación fallida',
        ip: req.ip,
        path: req.path,
        errors,
      });

      return res.status(400).json({
        error: 'Error de validación',
        details: errors,
      });
    }

    // Reemplazar body con valor validado y sanitizado
    req.body = value;
    next();
  };
};

/**
 * Middleware genérico de validación con Zod
 */
export const validateWithZod = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn({
          msg: 'Validación Zod fallida',
          ip: req.ip,
          path: req.path,
          errors,
        });

        return res.status(400).json({
          error: 'Error de validación',
          details: errors,
        });
      }

      next(error);
    }
  };
};

/**
 * Validar tamaño de payload
 */
export const validatePayloadSize = (maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');

    if (contentLength > maxSize) {
      logger.warn({
        msg: 'Payload demasiado grande',
        ip: req.ip,
        path: req.path,
        size: contentLength,
        maxSize,
      });

      return res.status(413).json({
        error: 'Payload demasiado grande',
        maxSize: `${maxSize / 1024 / 1024}MB`,
      });
    }

    next();
  };
};

/**
 * Validar Content-Type
 */
export const validateContentType = (...allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('content-type')?.split(';')[0].trim();

    if (!contentType || !allowedTypes.includes(contentType)) {
      logger.warn({
        msg: 'Content-Type no permitido',
        ip: req.ip,
        path: req.path,
        contentType,
        allowed: allowedTypes,
      });

      return res.status(415).json({
        error: 'Content-Type no soportado',
        allowed: allowedTypes,
      });
    }

    next();
  };
};

/**
 * Detectar patrones de inyección SQL/XSS/Command Injection
 */
const dangerousPatterns = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL
  /<script[^>]*>.*?<\/script>/gi, // XSS
  /javascript:/gi, // XSS
  /on\w+\s*=/gi, // XSS event handlers
  /(\||;|&|\$|\(|\)|`|<|>)/g, // Command injection
];

export const detectDangerousPatterns = (req: Request, res: Response, next: NextFunction) => {
  const checkValue = (value: any, path: string = ''): boolean => {
    if (typeof value === 'string') {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          logger.error({
            msg: 'Patrón peligroso detectado',
            ip: req.ip,
            path: req.path,
            field: path,
            pattern: pattern.toString(),
          });
          return true;
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (checkValue(value[key], `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };

  // Verificar body, query y params
  if (
    checkValue(req.body, 'body') ||
    checkValue(req.query, 'query') ||
    checkValue(req.params, 'params')
  ) {
    return res.status(400).json({
      error: 'Input contiene caracteres no permitidos',
    });
  }

  next();
};
