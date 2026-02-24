import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { uploadImage } from '../services/upload.service';

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).slice(1).toLowerCase();
  if (allowed.test(ext) || allowed.test(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error('Only image files are allowed'));
};

export const uploadSingle = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).single('image');

/** Uploads image to Cloudinary and sets req.body.image to the URL. Run after multer when creating/updating post. */
export async function resolveImage(
  req: Request & { body: Record<string, unknown>; file?: Express.Multer.File },
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.file?.buffer) {
      const { url } = await uploadImage(req.file.buffer, 'posts');
      req.body.image = url;
    }
    next();
  } catch (e) {
    logger.error('resolveImage', e);
    next(e);
  }
}

export function handleMulterError(
  err: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      next({ statusCode: 400, message: 'File size must be less than 5MB' });
      return;
    }
  }
  if (err) {
    logger.error('Upload error', err);
  }
  next(err);
}
