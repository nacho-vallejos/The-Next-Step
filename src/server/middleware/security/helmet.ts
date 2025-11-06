import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

/**
 * Configuración de Helmet con CSP estricta y nonce dinámico
 * Protege contra XSS, clickjacking, MIME sniffing, etc.
 */
export const helmetConfig = (req: Request, res: Response, next: NextFunction) => {
  // El nonce debe ser generado por el middleware cspNonce antes de este
  const nonce = res.locals.cspNonce || '';

  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          `'nonce-${nonce}'`,
          "'strict-dynamic'",
          // En producción, remover 'unsafe-inline' completamente
          process.env.NODE_ENV === 'development' ? "'unsafe-inline'" : '',
        ].filter(Boolean),
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        styleSrcAttr: ["'unsafe-inline'"], // Para estilos inline en elementos
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        connectSrc: ["'self'"],
        frameSrc: ["'self'", 'https://www.google.com'], // Google Maps
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        workerSrc: ["'self'", 'blob:'],
        manifestSrc: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        reportUri: process.env.CSP_REPORT_URI || '/api/csp-report',
      },
      reportOnly: process.env.CSP_REPORT_ONLY === 'true',
    },
    
    // HSTS - Forzar HTTPS por 1 año
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    
    // Prevenir MIME sniffing
    noSniff: true,
    
    // Protección XSS del navegador (legacy pero útil)
    xssFilter: true,
    
    // Prevenir clickjacking
    frameguard: {
      action: 'deny',
    },
    
    // No revelar tecnologías del servidor
    hidePoweredBy: true,
    
    // Política de referrer
    referrerPolicy: {
      policy: 'no-referrer',
    },
    
    // DNS Prefetch Control
    dnsPrefetchControl: {
      allow: false,
    },
    
    // Permissions Policy (antes Feature-Policy)
    permittedCrossDomainPolicies: {
      permittedPolicies: 'none',
    },
    
  })(req, res, next);
};

/**
 * Headers adicionales de seguridad personalizados
 */
export const additionalSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Permissions Policy - deshabilitar features peligrosos
  res.setHeader(
    'Permissions-Policy',
    [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'encrypted-media=()',
      'picture-in-picture=()',
    ].join(', ')
  );

  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options (redundante con CSP pero como fallback)
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevenir almacenamiento en caché de páginas sensibles
  if (req.path.includes('/auth') || req.path.includes('/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }

  // Cross-Origin headers
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  next();
};

/**
 * Ocultar información del servidor
 */
export const hideServerInfo = (req: Request, res: Response, next: NextFunction) => {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
};
