import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

/**
 * Generar nonce criptográfico para CSP
 * Se debe generar un nonce único por cada request
 */
export const generateNonce = (): string => {
  return crypto.randomBytes(16).toString('base64');
};

/**
 * Middleware para generar y adjuntar nonce a cada request
 * Debe ejecutarse ANTES del middleware de Helmet
 */
export const cspNonceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const nonce = generateNonce();
  res.locals.cspNonce = nonce;
  
  // También disponible para templates
  res.locals.nonce = nonce;
  
  next();
};

/**
 * Helper para inyectar nonce en tags <script> y <style>
 */
export const addNonceToScript = (scriptContent: string, nonce: string): string => {
  return scriptContent.replace(
    /<script/g,
    `<script nonce="${nonce}"`
  );
};

export const addNonceToStyle = (styleContent: string, nonce: string): string => {
  return styleContent.replace(
    /<style/g,
    `<style nonce="${nonce}"`
  );
};

/**
 * Función para inyectar nonce en HTML completo
 */
export const injectNonceIntoHTML = (html: string, nonce: string): string => {
  let result = html;
  
  // Inyectar en scripts
  result = addNonceToScript(result, nonce);
  
  // Inyectar en styles inline
  result = addNonceToStyle(result, nonce);
  
  // Inyectar nonce en meta tag para acceso desde JS
  result = result.replace(
    '</head>',
    `<meta name="csp-nonce" content="${nonce}">\n</head>`
  );
  
  return result;
};
