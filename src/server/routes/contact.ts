import express, { Router, Request, Response } from 'express';
import { contactRateLimiter } from '../middleware/security/rateLimit';
import { csrfProtection } from '../middleware/security/csrf';
import { validateWithJoi, contactFormSchema } from '../middleware/security/validation';
import { asyncHandler } from '../middleware/security/errors';
import { logger, auditLogger } from '../utils/logger';
import { sanitizeText, sanitizeEmail } from '../utils/sanitizer';

const router: Router = express.Router();

/**
 * POST /api/contact
 * Registrar consulta y derivar a WhatsApp
 */
router.post(
  '/api/contact',
  contactRateLimiter,
  csrfProtection,
  validateWithJoi(contactFormSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { nombre, email, empresa, mensaje } = req.body;

    const sanitizedData = {
      nombre: sanitizeText(nombre),
      email: sanitizeEmail(email),
      empresa: sanitizeText(empresa),
      mensaje: sanitizeText(mensaje),
    };

    auditLogger.info({
      action: 'CONTACT_FORM_SUBMITTED',
      data: {
        nombre: sanitizedData.nombre,
        email: sanitizedData.email,
        empresa: sanitizedData.empresa,
        messageLength: sanitizedData.mensaje.length,
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info({ msg: 'Consulta recibida - derivada a WhatsApp', email: sanitizedData.email });

    res.status(200).json({
      success: true,
      message: 'Mensaje recibido correctamente. Nos contactaremos pronto.',
    });
  })
);

/**
 * GET /api/contact/test
 * Endpoint de prueba (solo desarrollo)
 */
if (process.env.NODE_ENV === 'development') {
  router.get('/api/contact/test', (req: Request, res: Response) => {
    res.json({
      message: 'Contact API funcionando',
      csrfToken: res.locals.csrfToken,
    });
  });
}

export default router;
