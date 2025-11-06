import express, { Router, Request, Response } from 'express';
import path from 'path';
import { injectNonceIntoHTML } from '../utils/cspNonce';
import { readFileSync } from 'fs';

const router: Router = express.Router();

/**
 * Servir página principal con nonce inyectado
 */
router.get('/', (req: Request, res: Response) => {
  try {
    // Leer HTML
    const htmlPath = path.join(__dirname, '../../web/index.html');
    let html = readFileSync(htmlPath, 'utf-8');

    // Obtener nonce del middleware
    const nonce = res.locals.cspNonce || '';

    // Inyectar nonce y CSRF token
    html = injectNonceIntoHTML(html, nonce);
    
    // Inyectar CSRF token si existe
    if (res.locals.csrfToken) {
      html = html.replace(
        '</head>',
        `<meta name="csrf-token" content="${res.locals.csrfToken}">\n</head>`
      );
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Error serving HTML:', error);
    res.status(500).send('Error interno del servidor');
  }
});

/**
 * Health check
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Ping endpoint
 */
router.get('/ping', (req: Request, res: Response) => {
  res.send('pong');
});

/**
 * CSP violation report endpoint
 */
router.post('/api/csp-report', express.json({ type: 'application/csp-report' }), (req: Request, res: Response) => {
  console.warn('CSP Violation:', JSON.stringify(req.body, null, 2));
  
  // TODO: Enviar a sistema de logging/alertas
  
  res.status(204).end();
});

/**
 * Servir archivos estáticos con seguridad
 */
router.use(
  '/assets',
  express.static(path.join(__dirname, '../../web/assets'), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  })
);

router.use(
  '/styles',
  express.static(path.join(__dirname, '../../web'), {
    maxAge: '1d',
    etag: true,
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    },
  })
);

router.use(
  '/scripts',
  express.static(path.join(__dirname, '../../web'), {
    maxAge: '1d',
    etag: true,
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    },
  })
);

export default router;
