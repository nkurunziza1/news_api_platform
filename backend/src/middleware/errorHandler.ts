import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

interface AppError {
  statusCode?: number;
  message?: string | Record<string, unknown>;
}

export function errorHandler(
  err: AppError & Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  let message = err.message ?? 'Internal server error';
  if (err.name === 'ValidationError') {
    message = (err as unknown as mongoose.Error.ValidationError).message;
  }
  if (statusCode >= 500) {
    logger.error('Server error', err);
  }
  res.status(statusCode).json({
    success: false,
    message: typeof message === 'object' ? message : { error: message },
  });
}
