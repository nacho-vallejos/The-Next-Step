import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

/**
 * Configurar DOMPurify con JSDOM para uso en servidor
 */
const window = new JSDOM('').window;
const purify = DOMPurify(window as unknown as Window);

/**
 * Configuración estricta de DOMPurify
 */
purify.setConfig({
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SAFE_FOR_TEMPLATES: true,
  WHOLE_DOCUMENT: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  FORCE_BODY: true,
});

/**
 * Sanitizar HTML - remover XSS
 */
export const sanitizeHTML = (dirty: string): string => {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
    ],
    ALLOWED_ATTR: ['href'],
  });
};

/**
 * Sanitizar para uso en atributos HTML
 */
export const sanitizeAttribute = (dirty: string): string => {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
};

/**
 * Sanitizar texto plano (remover todo HTML)
 */
export const sanitizeText = (dirty: string): string => {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
};

/**
 * Escape HTML entities manualmente (alternativa ligera)
 */
export const escapeHTML = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'\/]/g, (char) => map[char]);
};

/**
 * Sanitizar URL para prevenir javascript: y data: URIs
 */
export const sanitizeURL = (url: string): string => {
  try {
    const parsed = new URL(url);
    
    // Solo permitir http y https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '#';
    }
    
    return url;
  } catch {
    return '#';
  }
};

/**
 * Validar y sanitizar email
 */
export const sanitizeEmail = (email: string): string => {
  return email
    .trim()
    .toLowerCase()
    .replace(/[^\w@.-]/g, '');
};

/**
 * Remover caracteres peligrosos para SQL (defense in depth)
 */
export const sanitizeSQL = (input: string): string => {
  return input.replace(/['";\\]/g, '');
};

/**
 * Sanitizar nombre de archivo
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
};

/**
 * Validar y sanitizar número de teléfono
 */
export const sanitizePhone = (phone: string): string => {
  return phone.replace(/[^\d+\s()-]/g, '');
};

/**
 * Middleware para sanitizar body automáticamente
 */
export const sanitizeBody = (fields: string[]) => {
  return (req: any, res: any, next: any) => {
    for (const field of fields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeText(req.body[field]);
      }
    }
    next();
  };
};
