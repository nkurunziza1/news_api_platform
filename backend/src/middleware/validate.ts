import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../config/logger';

type Source = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = req[source];
      const result = schema.safeParse(data);
      if (!result.success) {
        const err = result.error as ZodError;
        const message = err.flatten().fieldErrors;
        next({ statusCode: 400, message });
        return;
      }
      req[source] = result.data;
      next();
    } catch (e) {
      logger.error('Validation error', e);
      next({ statusCode: 500, message: 'Validation failed' });
    }
  };
}

export function validateReq(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (!result.success) {
        const err = result.error as ZodError;
        const message = err.flatten().fieldErrors;
        next({ statusCode: 400, message });
        return;
      }
      req.body = result.data.body ?? req.body;
      req.query = result.data.query ?? req.query;
      req.params = result.data.params ?? req.params;
      next();
    } catch (e) {
      logger.error('Validation error', e);
      next({ statusCode: 500, message: 'Validation failed' });
    }
  };
}
