import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';
import mime from 'mime-types';
import { logger } from '../../utils/logger';
import { BadRequestError } from './errors';

/**
 * Configuración segura de Multer para subida de archivos
 */

// Tipos MIME permitidos (whitelist)
const ALLOWED_MIME_TYPES = (process.env.UPLOAD_ALLOWED_TYPES || '')
  .split(',')
  .filter(Boolean);

if (ALLOWED_MIME_TYPES.length === 0) {
  ALLOWED_MIME_TYPES.push('image/jpeg', 'image/png', 'application/pdf');
}

// Tamaño máximo de archivo (5MB por defecto)
const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE || '5242880');

// Directorio de uploads (FUERA del webroot)
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

/**
 * Storage configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Crear subdirectorios por fecha para organización
    const date = new Date();
    const subdir = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    const fullPath = path.join(UPLOAD_DIR, subdir);

    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre aleatorio para prevenir path traversal
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = mime.extension(file.mimetype) || 'bin';
    cb(null, `${randomName}.${ext}`);
  },
});

/**
 * File filter - validación de tipo
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Verificar MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    logger.warn({
      msg: 'Tipo de archivo no permitido',
      mimetype: file.mimetype,
      filename: file.originalname,
      ip: req.ip,
    });

    return cb(
      new BadRequestError(
        `Tipo de archivo no permitido. Permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`
      )
    );
  }

  // Verificar extensión (doble check)
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ALLOWED_MIME_TYPES.map(m => `.${mime.extension(m)}`);

  if (!allowedExtensions.includes(ext)) {
    logger.warn({
      msg: 'Extensión de archivo no permitida',
      extension: ext,
      filename: file.originalname,
      ip: req.ip,
    });

    return cb(new BadRequestError(`Extensión no permitida: ${ext}`));
  }

  cb(null, true);
};

/**
 * Configuración de multer
 */
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Máximo 5 archivos por request
    fields: 10, // Máximo 10 campos de formulario
  },
  fileFilter,
});

/**
 * Middleware para validar contenido real del archivo (magic numbers)
 */
export const validateFileMagicNumbers = (req: Request, res: any, next: any) => {
  if (!req.file && !req.files) {
    return next();
  }

  const files = req.file ? [req.file] : (req.files as Express.Multer.File[]);

  // TODO: Implementar verificación de magic numbers
  // Verificar que el contenido real coincida con la extensión
  // Por ejemplo, verificar que un .jpg comience con FFD8FF

  for (const file of files) {
    logger.info({
      msg: 'Archivo subido',
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      ip: req.ip,
    });
  }

  next();
};

/**
 * Middleware para escanear virus con ClamAV (placeholder)
 */
export const scanFileForViruses = async (req: Request, res: any, next: any) => {
  if (!req.file && !req.files) {
    return next();
  }

  const clamavEnabled = process.env.CLAMAV_ENABLED === 'true';

  if (!clamavEnabled) {
    logger.warn('ClamAV deshabilitado - archivo no escaneado para virus');
    return next();
  }

  // TODO: Implementar integración con ClamAV
  // Ejemplo con clamscan npm package:
  // const ClamScan = require('clamscan');
  // const clamscan = await new ClamScan().init({...});
  // const {isInfected, file, viruses} = await clamscan.isInfected(req.file.path);

  logger.info('Escaneo de virus completado (placeholder)');
  next();
};

/**
 * Cleanup de archivos temporales en caso de error
 */
export const cleanupTempFiles = (req: Request, res: any, next: any) => {
  res.on('finish', () => {
    // Si el response fue exitoso, mantener archivos
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return;
    }

    // Si falló, eliminar archivos subidos
    const files = req.file ? [req.file] : (req.files as Express.Multer.File[] | undefined);

    if (files && Array.isArray(files)) {
      const fs = require('fs');
      files.forEach(file => {
        fs.unlink(file.path, (err: any) => {
          if (err) {
            logger.error({
              msg: 'Error al eliminar archivo temporal',
              error: err.message,
              file: file.path,
            });
          }
        });
      });
    }
  });

  next();
};
